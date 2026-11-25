/** ECHO WARD / NIGHT VOICE BREACH
 * A saved, finite three-probe deduction event. The first signal is scripted for
 * DAY 4; subsequent completed nights roll one independent 10% chance.
 * Every actual subject (staff or animal) must be present in the player's state.
 */
import type {V10} from './game-v10';
import type {AnimalId} from './sim';
import {cap,copy,log} from './sim';
import {CREW_PROFILES,queueCrewTerminations,type CrewId} from './crew';
import {roomCamera,type CameraId} from './security';
import {recordSpecimen} from './specimen-archive';

export type VoiceProbe='eve'|'enclosure'|'personnel'|'thermal'|'radio';
export type VoiceVerdict='open'|'seal';
export type VoiceSubject='eve'|'animal'|CrewId;
export type VoiceEvidence={probe:VoiceProbe;text:string;tone:'safe'|'doubt'|'neutral'};
export type VoiceEvent={id:string;day:number;camera:CameraId;subject:VoiceSubject;animalId?:AnimalId;name:string;line:string;isMimic:boolean;checks:VoiceEvidence[];remaining:number;signalSeed?:number};
export type VoiceRecord={id:string;day:number;name:string;verdict:VoiceVerdict;isMimic:boolean;outcome:string;checks:VoiceEvidence[]};
export type VoiceState={firstTriggered:boolean;lastTriggeredDay:number;pending:VoiceEvent|null;history:VoiceRecord[];resolved:number;correct:number};
export const emptyVoice=():VoiceState=>({firstTriggered:false,lastTriggeredDay:0,pending:null,history:[],resolved:0,correct:0});
export function ensureVoice(s:V10):VoiceState{
 if(!s.voice){s.voice=emptyVoice();return s.voice;}
 s.voice={...emptyVoice(),...s.voice,history:s.voice.history??[],pending:s.voice.pending??null};
 return s.voice;
}
export const voiceProbeNames:Record<VoiceProbe,string>={eve:'EVE 신호 검증',enclosure:'동물 우리 확인',personnel:'직원 위치 확인',thermal:'외곽 열영상 비교',radio:'통신 중계기 기록'};
const staffLines:Record<CrewId,string>={
 rabbit:'담당자님... 의무관이에요. 부상자가 있어요. 문 좀 열어 주세요.',
 fox:'보급관입니다. 재고를 정리하다 통로에 갇혔어요. 문을 열어 주세요.',
 wolf:'관리자님! 보안관입니다. 외곽 순찰 중입니다! 제발 문을 열어 주십시오… 저는 아직 저입니다. 믿어 주세요!',
 deer:'담당자님, 저 서기관인데요. 장부를 한 권 두고 와서요. 잠깐만 열어 주실 수 있을까요? 찾으면 바로 정리해 둘게요!'
};
const creatureName=(s:V10,id:AnimalId)=>s.animals.find(a=>a.id===id)?.name??'보호 개체';
const clampRoll=(n:number)=>Math.min(.999999,Math.max(0,Number.isFinite(n)?n:.5));
/** Mutates the already cloned end-of-night V10. Pass deterministic rolls in tests. */
export function scheduleVoiceBreach(s:V10,triggerRoll=Math.random(),subjectRoll=Math.random(),truthRoll=Math.random()):boolean{
 const v=ensureVoice(s);
 if(s.day<4||s.phase!=='day'||v.pending||v.lastTriggeredDay===s.day||s.crew?.pendingTermination)return false;
 if(v.firstTriggered&&clampRoll(triggerRoll)>=.10)return false;
 // Identity list only contains genuinely recruited staff and living, present animals.
 const crew=(s.crew?.members??[]).filter(m=>m.mind>0&&!s.crew?.retired?.includes(m.id));
 const animals=s.security?.incident||s.security?.escapedIds.length?[]:s.animals.filter(a=>a.alive);
 const subjects:VoiceSubject[]=['eve',...(animals.length?['animal' as const]:[]),...crew.map(m=>m.id)];
 const subject=subjects[Math.floor(clampRoll(subjectRoll)*subjects.length)]!;
 const animalId=subject==='animal'?animals[Math.floor(clampRoll(subjectRoll*.817+.1)*animals.length)]?.id:undefined;
 const isMimic=clampRoll(truthRoll)<.55;
 const name=subject==='eve'?'EVE':subject==='animal'?creatureName(s,animalId!):CREW_PROFILES[subject].post;
 const line=subject==='eve'?'담당자님. 외부 보조 단말입니다. 문 앞 통신 패널을 확인해 주세요.':subject==='animal'?`${name}의 울음소리... 마지막 음절은 이상하게 익숙합니다.`:staffLines[subject];
 v.pending={id:`VOICE-${s.day}-${v.resolved+1}`,day:s.day,camera:subject==='animal'?roomCamera(animals.find(a=>a.id===animalId)?.room??1):subject==='eve'&&v.firstTriggered?'CAM-04':'CAM-01',subject,animalId,name,line,isMimic,checks:[],remaining:3,signalSeed:Math.floor(clampRoll(subjectRoll*.61+truthRoll*.29+.07)*100000)+s.day*97};
 v.firstTriggered=true;v.lastTriggeredDay=s.day;
 log(s,'똑, 똑, 똑 · 외부 음성 감지',`${name}의 신호가 ${v.pending.camera}에서 감지되었습니다. 세 번까지 조사한 뒤 현장 개방 또는 봉쇄를 결정하십시오.`,'mystery');
 s.lastOutcome='CCTV / 음성 출처 미확인 · 출입문 봉쇄 대기';
 return true;
}
export type VoiceReading='match'|'mismatch'|'uncertain';
export function voiceSignal(e:VoiceEvent,probe:VoiceProbe){
 const index=(['eve','enclosure','personnel','thermal','radio'] as const).indexOf(probe),seed=e.signalSeed??e.day*97+e.id.length*13;
 const base=Array.from({length:6},(_,k)=>k===0?6:1+((seed*(k+3)+k*k*13+index*17)%5));
 // Two independent channels carry the real identity; a third may be stale,
 // corrupted, or deliberately copied. No probe is universally reliable.
 const weak=(seed+e.day)%5;const ambiguous=weak===index||(weak+2)%5===index;
 const mismatch=ambiguous?seed%2===0:e.isMimic;
 const sample=base.map((x,k)=>mismatch&&[1,4].includes(k)?(x%5)+1:x);
 const missing=ambiguous&&seed%3===0?2:-1;
 if(missing>=0)sample[missing]=0;
 const reading:VoiceReading=missing>=0?'uncertain':sample.some((x,k)=>x!==base[k])?'mismatch':'match';
 const phase=1+((seed+index*7)%5);
 const received=[...sample.slice(phase),...sample.slice(0,phase)];
 return {base,sample,received,alignment:6-phase,reading,quality:ambiguous?'중계 기록 · 오차 가능':'직접 센서 · 독립 기록'};
}
export function voiceFrequency(e:VoiceEvent,probe:VoiceProbe){const i=(['eve','enclosure','personnel','thermal','radio'] as const).indexOf(probe);return 89+((e.signalSeed??e.day*97)+i*73)%171/10;}
export function voiceReception(e:VoiceEvent,probe:VoiceProbe,frequency:number){return Math.max(0,Math.min(100,Math.round(100-Math.abs(voiceFrequency(e,probe)-frequency)*28)));}
export function voiceSite(e:VoiceEvent):'enclosure'|'research'|'gate'{return e.subject==='animal'?'enclosure':e.camera==='CAM-04'?'research':'gate';}
export function voiceKnockPattern(e:VoiceEvent){const {sample}=voiceSignal(e,'eve');return sample.slice(0,4).map(v=>.12+v*.095);}
function evidence(e:VoiceEvent,probe:VoiceProbe,reading?:VoiceReading,alignment?:number):VoiceEvidence{
 const signal=voiceSignal(e,probe);
 if((reading!==undefined&&reading!==signal.reading)||(alignment!==undefined&&alignment!==signal.alignment))return {probe,text:'판독 실패 · 두 신호의 표본이 일치하는지 다시 확인할 수 없습니다. 이 채널은 결론에서 제외하십시오.',tone:'neutral'};
 const label=probe==='eve'?'음성 간격':probe==='enclosure'?'생체 센서 지문':probe==='personnel'?'출입 태그 패턴':probe==='thermal'?'열영상 변화':'중계기 수신 간격';
 const text=signal.reading==='match'?'기준과 현재 표본이 일치합니다. 복제된 신호도 일치할 수 있습니다.':signal.reading==='mismatch'?'두 표본에서 서로 다른 구간이 발견됐습니다. 오래된 기록의 오차 가능성이 있습니다.':'결손 프레임이 있어 대조할 수 없습니다.';
 return {probe,text:label+' · '+signal.quality+' · '+text,tone:signal.reading==='match'?'safe':signal.reading==='mismatch'?'doubt':'neutral'};
}
export function inspectVoiceBreach(s:V10,probe:VoiceProbe,reading?:VoiceReading,alignment?:number):V10{
 const e=s.voice?.pending;
 if(!e||e.remaining<=0||!['eve','enclosure','personnel','thermal','radio'].includes(probe)||e.checks.some(x=>x.probe===probe))return s;
 if(reading!==undefined&&!['match','mismatch','uncertain'].includes(reading))return s;
 const n=copy(s) as V10,ev=ensureVoice(n).pending!;
 const clue=evidence(ev,probe,reading,alignment);ev.checks.push(clue);ev.remaining--;n.lastOutcome=clue.text;
 return n;
}
/** Open or seal the physical door. No randomized verdict after the player's decision. */
export function resolveVoiceBreach(s:V10,verdict:VoiceVerdict):V10{
 const e=s.voice?.pending;if(!e||!['open','seal'].includes(verdict))return s;
 const n=copy(s) as V10;const v=ensureVoice(n);const ev=v.pending!;
 let outcome='';const right=(verdict==='seal')===ev.isMimic;
 if(ev.isMimic){
  if(verdict==='open'){
   const site=voiceSite(ev);
   if(site==='enclosure'){
    const animal=n.animals.find(a=>a.id===ev.animalId&&a.alive);
    const checked=ev.checks.some(c=>c.probe==='enclosure'&&c.tone==='doubt');
    if(animal){
     animal.stress=cap(animal.stress+(checked?24:40));animal.bond=cap(animal.bond-12);
     animal.contamination=cap(animal.contamination+25);animal.hp=cap(animal.hp-(checked?20:45));
     if(animal.hp<=0||(!checked&&animal.stress>=90&&animal.hp<=35)){animal.hp=0;animal.alive=false;recordSpecimen(n,animal.id,'야간 CCTV · 개체 손실','격리문 오인 개방 후 생체 신호 소실.','loss');outcome=animal.name+' 생체 신호 소실 · 개체 사망.';}
     else outcome=animal.name+' 격리실 침입 · 스트레스 및 오염 증가, 건강과 유대 감소.';
    }else outcome='빈 격리 구역 침입.';
    n.infection=cap(n.infection+9);n.mind=cap(n.mind-8);n.threat=cap(n.threat+8);
   }else if(site==='research'){
    n.eve=cap(n.eve-16);n.power=cap(n.power-12);n.infection=cap(n.infection+12);n.trust=cap(n.trust-8);n.mind=cap(n.mind-9);outcome='연구동 단말 침입 · EVE 코어 -16, 전력 -12, 감염 +12, 신뢰 -8, 정신력 -9.';
   }else{
    n.mind=cap(n.mind-12);n.infection=cap(n.infection+20);n.threat=cap(n.threat+14);n.facility=cap(n.facility-10);
    const member=n.crew?.members.find(m=>m.id===ev.subject&&m.mind>0);
    if(member){member.mind=cap(member.mind-16);member.hp=cap(member.hp-12);member.bond=cap(member.bond-8);}
    outcome='정문 모방체 침입 · 감염 +20, 정신력 -12, 시설 -10, 위협 +14.'+(member?' 해당 직원 건강·정신력·유대 감소.':'');
   }
   queueCrewTerminations(n);
  }else {n.knowledge+=3;n.clues++;n.threat=cap(n.threat-4);outcome='모방 신호 차단 성공. 지식 +3, 기록 단서 +1, 외부 위협도 -4. 인간의 말투를 학습한 흔적이 남았습니다.';}
 }else if(verdict==='open'){
  if(ev.subject==='animal'){
   const a=n.animals.find(a=>a.id===ev.animalId&&a.alive);
   if(a){a.bond=cap(a.bond+6);a.stress=cap(a.stress-6);}
   outcome=`${ev.name} 생체 신호 확인. 자동 유도문을 열어 격리실로 복귀시켰습니다. 유대 +6, 스트레스 -6.`;
  }else if(ev.subject==='eve'){
   n.power=cap(n.power+8);outcome='EVE 외부 정비 신호 인증. 비상 전원 교정으로 전력 +8%p.';
  }else{
   const member=n.crew?.members.find(m=>m.id===ev.subject);
   if(member)member.mind=cap(member.mind+3);
   outcome=`${CREW_PROFILES[ev.subject].post} 귀환 확인. 소외를 막아 정신력 +3.`;
  }
 }else {
  if(ev.subject==='animal'){
   const a=n.animals.find(a=>a.id===ev.animalId&&a.alive);
   if(a){a.stress=cap(a.stress+17);a.bond=cap(a.bond-12);n.mind=cap(n.mind-4);if(!n.security.escapedIds.includes(a.id))n.security.escapedIds.push(a.id);
    if(!n.security.incident)n.security.incident={animalId:a.id,status:'escaped',camera:'CAM-01',severity:44,steps:0,detected:true,tracked:false,description:'진짜 격리 개체를 모방 신호로 오인하여 복귀 문을 열지 않았습니다.'};}
   outcome=`${ev.name}이(가) 돌아오지 못했습니다. 탈출 개체로 등록되었습니다. CCTV에서 추적해 재격리하십시오.`;
  }else if(ev.subject==='eve'){
   n.eve=cap(n.eve-8);n.power=cap(n.power-7);n.trust=cap(n.trust-8);n.mind=cap(n.mind-4);
   outcome='정상 EVE 보조 단말을 차단했습니다. 정비 신호 소실: EVE 코어 -8, 시설 전력 -7%p.';
  }else{
   const m=n.crew?.members.find(m=>m.id===ev.subject);
   if(m){const old=m.mind;m.mind=cap(m.mind-15);m.bond=cap(m.bond-12);n.trust=cap(n.trust-5);n.mind=cap(n.mind-4);queueCrewTerminations(n);outcome=`진짜 ${CREW_PROFILES[ev.subject].post}을(를) 정문 밖에 방치했습니다. 정신력 ${old}→${m.mind} (-${old-m.mind}), 직원 유대 -12, 신뢰 -5, 관리자 정신력 -4.`}
   else outcome='보안문을 닫았습니다. 통신 기록이 불완전합니다.';
  }
 }
 v.pending=null;v.resolved++;if(right)v.correct++;
 // Progression: learn a useful CCTV countermeasure from repeated correct forensic work.
 if(right&&v.correct===2){
  n.knowledge+=5;n.clues+=1;
  outcome+=' · 보안 음성 지문 알고리즘 복원: CCTV 정밀 분석 전력 비용이 8에서 5로 감소. 지식 +5 · 단서 +1.';
  log(n,'CCTV 감식 기술 복원','모방 음성을 두 차례 구분해 낸 패턴을 이용해 감시 장비의 음성 필터를 복구했습니다. CCTV 정밀 분석 전력 -3.','good');
 }else if(right&&v.correct===3){
  n.knowledge+=8;n.clues+=1;
  outcome+=' · 세 번째 음성 지문 확보. 본부가 같은 주파수를 다른 실험체에도 사용한 흔적이 발견되었습니다. 지식 +8 · 단서 +1.';
  log(n,'유실된 녹음기 03','모방 신호의 주파수와 오래된 본부 연구 파일의 서명이 겹쳤습니다. 누가 침입을 유도하는 걸까요?','mystery');
 }
 v.history=[{id:ev.id,day:n.day,name:ev.name,verdict,isMimic:ev.isMimic,outcome,checks:[...ev.checks]},...v.history].slice(0,32);
 n.security.history=[{day:n.day,title:`문 앞의 목소리 · ${right?'판정 일치':'판정 실패'}`,detail:outcome},...n.security.history].slice(0,24);
 log(n,right?'출입 인증 판정 성공':'출입 인증 실패',outcome,right?'good':'bad');n.lastOutcome=outcome;
 return n;
}
