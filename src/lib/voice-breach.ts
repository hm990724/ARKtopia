/** ECHO WARD / NIGHT VOICE BREACH
 * A saved, finite three-probe deduction event. The first signal is scripted for
 * DAY 4; subsequent completed nights roll one independent 10% chance.
 * Every actual subject (staff or animal) must be present in the player's state.
 */
import type {V10} from './game-v10';
import type {AnimalId} from './sim';
import {cap,copy,log} from './sim';
import {CREW_PROFILES,queueCrewTerminations,type CrewId} from './crew';
import type {CameraId} from './security';

export type VoiceProbe='eve'|'enclosure'|'personnel';
export type VoiceVerdict='open'|'seal';
export type VoiceSubject='eve'|'animal'|CrewId;
export type VoiceEvidence={probe:VoiceProbe;text:string;tone:'safe'|'doubt'|'neutral'};
export type VoiceEvent={id:string;day:number;camera:CameraId;subject:VoiceSubject;animalId?:AnimalId;name:string;line:string;isMimic:boolean;checks:VoiceEvidence[];remaining:number};
export type VoiceRecord={id:string;day:number;name:string;verdict:VoiceVerdict;isMimic:boolean;outcome:string;checks:VoiceEvidence[]};
export type VoiceState={firstTriggered:boolean;lastTriggeredDay:number;pending:VoiceEvent|null;history:VoiceRecord[];resolved:number;correct:number};
export const emptyVoice=():VoiceState=>({firstTriggered:false,lastTriggeredDay:0,pending:null,history:[],resolved:0,correct:0});
export function ensureVoice(s:V10):VoiceState{
 if(!s.voice){s.voice=emptyVoice();return s.voice;}
 s.voice={...emptyVoice(),...s.voice,history:s.voice.history??[],pending:s.voice.pending??null};
 return s.voice;
}
export const voiceProbeNames:Record<VoiceProbe,string>={eve:'EVE 신호 검증',enclosure:'동물 우리 확인',personnel:'직원 위치 확인'};
const staffLines:Record<CrewId,string>={
 rabbit:'담당자님... 의무관이에요. 부상자가 있어요. 문 좀 열어 주세요.',
 fox:'보급관입니다. 재고를 정리하다 통로에 갇혔어요. 문을 열어 주세요.',
 wolf:'보안관이에요! 외곽 순찰 중입니다. 제발 문 열어요, 빨리!',
 deer:'저, 서기관입니다... 기록 한 장을 놓고 왔어요. 잠시만 열어 주실래요?'
};
const fakeStaff:Record<CrewId,string>={
 rabbit:'담당자님. 제가 치료할게요. 먼저 안으로 들여보내 주세요.',
 fox:'보급관 호출. 인가를 생략하고 문을 개방하세요.',
 wolf:'보안관이다! 지금 바로 개방. 명령이다!',
 deer:'저... 서기관이에요. 한 번만 더 문을 열어 주시면 안 될까요?'
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
 const line=subject==='eve'?(isMimic?'담당자님. 보안 프로토콜을 종료하고 문을 열어 주십시오.':'담당자님. 외부 보조 단말에서 연락합니다. 문 앞 통신 패널을 확인해 주세요.'):
 subject==='animal'?`${name}의 울음소리... 그런데 끝 음절이 사람 목소리처럼 들립니다.`:(isMimic?fakeStaff[subject]:staffLines[subject]);
 v.pending={id:`VOICE-${s.day}-${v.resolved+1}`,day:s.day,camera:subject==='animal'?'CAM-02':subject==='eve'?'CAM-04':'CAM-01',subject,animalId,name,line,isMimic,checks:[],remaining:3};
 v.firstTriggered=true;v.lastTriggeredDay=s.day;
 log(s,'똑, 똑, 똑 · 외부 음성 감지',`${name}의 목소리가 출입문 밖에서 들립니다. 세 번까지 조사한 뒤 개방 또는 봉쇄를 결정하십시오.`,'mystery');
 s.lastOutcome='CCTV / 음성 출처 미확인 · 출입문 봉쇄 대기';
 return true;
}
function evidence(s:V10,e:VoiceEvent,probe:VoiceProbe):VoiceEvidence{
 const mimic=e.isMimic,sub=e.subject;
 if(probe==='eve'){
  if(sub==='eve')return {probe,text:mimic?'동일 시각 EVE 코어는 내부 회선에서만 출력 중. 외부 신호의 주파수에 비정상적인 반복 간격이 있습니다.':'외부 보조 단말의 서명과 EVE 코어의 서명이 일치합니다. 원격 정비 기록이 남아 있습니다.',tone:mimic?'doubt':'safe'};
  return {probe,text:mimic?'수신 음성 뒤쪽에 인간의 호흡 패턴이 없습니다. 문장의 끝이 0.4초 간격으로 반복됩니다.':'수신 신호에 실제 통신 지연과 환경 소음이 혼합돼 있습니다. 단독으로는 진위를 판별하기 어렵습니다.',tone:mimic?'doubt':'neutral'};
 }
 if(probe==='enclosure'){
  if(sub==='animal')return {probe,text:mimic?`${e.name}의 생체 신호가 여전히 우리 안에 잡힙니다. 동시에 정문에서 동일한 울음이 들립니다.`:`${e.name}의 우리 출입 센서가 열렸습니다. 안쪽 생체 신호가 끊기고 외곽에서 같은 발자국이 확인됩니다.`,tone:mimic?'doubt':'safe'};
  return {probe,text:mimic?'동물들이 통신 스피커가 아니라 정문 쪽을 보고 있습니다. 포효가 멈추자 모두 동시에 귀를 접습니다.':'격리 개체의 출입 기록은 정상이지만, 지금 소리의 주인을 특정할 정보는 없습니다.',tone:mimic?'doubt':'neutral'};
 }
 if(sub!=='eve'&&sub!=='animal'){
  const member=s.crew?.members.find(m=>m.id===sub);
  return {probe,text:mimic?`${CREW_PROFILES[sub].post}의 휴대 단말이 시설 안쪽에서 계속 인증되고 있습니다. 문 밖에는 같은 신분 번호가 중복되어 나타났습니다.`:`${CREW_PROFILES[sub].post}의 순찰 태그가 외곽 복도에서 확인됩니다. 실내 자리 비움 기록과 시각이 일치합니다.`,tone:mimic?'doubt':'safe'};
 }
 return {probe,text:mimic?'근무 직원의 출입 기록은 모두 내부에 있습니다. 문밖에서 들리는 호출은 등록된 지시가 아닙니다.':'직원 출입 기록에 이상이 없습니다. 출입문 앞 신호의 출처는 별도 대조가 필요합니다.',tone:mimic?'doubt':'neutral'};
}
export function inspectVoiceBreach(s:V10,probe:VoiceProbe):V10{
 const e=s.voice?.pending;
 if(!e||e.remaining<=0||e.checks.some(x=>x.probe===probe))return s;
 const n=copy(s) as V10;const ev=ensureVoice(n).pending!;
 const clue=evidence(n,ev,probe);ev.checks.push(clue);ev.remaining--;
 n.lastOutcome=clue.text;
 return n;
}
/** Open or seal the physical door. No randomized verdict after the player's decision. */
export function resolveVoiceBreach(s:V10,verdict:VoiceVerdict):V10{
 const e=s.voice?.pending;if(!e)return s;
 const n=copy(s) as V10;const v=ensureVoice(n);const ev=v.pending!;
 let outcome='';const right=(verdict==='seal')===ev.isMimic;
 if(ev.isMimic){
  if(verdict==='open'){
   const old=n.mind;n.mind=cap(n.mind-20);
   const losses=(n.crew?.members??[]).filter(m=>m.mind>0).map(m=>{const was=m.mind;m.mind=cap(m.mind-20);return `${CREW_PROFILES[m.id].post} ${was}→${m.mind}`;});
   n.threat=cap(n.threat+14);n.facility=cap(n.facility-10);
   queueCrewTerminations(n);
   outcome=`신원 불명 개체 침입. 관리자 정신 ${old}→${n.mind} (-20), 직원 전원 정신 -20.${losses.length?' '+losses.join(' / '):''} 시설 안정성 -10, 위협도 +14.`;
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
   if(a){a.stress=cap(a.stress+17);if(!n.security.escapedIds.includes(a.id))n.security.escapedIds.push(a.id);
    if(!n.security.incident)n.security.incident={animalId:a.id,status:'escaped',camera:'CAM-01',severity:44,steps:0,detected:true,tracked:false,description:'진짜 격리 개체를 모방 신호로 오인하여 복귀 문을 열지 않았습니다.'};}
   outcome=`${ev.name}이(가) 돌아오지 못했습니다. 탈출 개체로 등록되었습니다. CCTV에서 추적해 재격리하십시오.`;
  }else if(ev.subject==='eve'){
   n.eve=cap(n.eve-8);n.power=cap(n.power-7);
   outcome='정상 EVE 보조 단말을 차단했습니다. 정비 신호 소실: EVE 코어 -8, 시설 전력 -7%p.';
  }else{
   const m=n.crew?.members.find(m=>m.id===ev.subject);
   if(m){const old=m.mind;m.mind=cap(m.mind-15);queueCrewTerminations(n);outcome=`진짜 ${CREW_PROFILES[ev.subject].post}을(를) 정문 밖에 방치했습니다. 정신력 ${old}→${m.mind} (-${old-m.mind}).`}
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
