/** ECHO WARD v37 — evidence-based specimen archive and the concealed HQ trade.
 * All state is JSON-serializable. No image assets or new fonts are required.
 * Species IDs still identify active animals in the legacy simulation. A distinct
 * specimenId identifies each successive rescued individual in the archive.
 */
import {routineOriginScan,originEndEpilogue,originReadyForFinale} from './origin-zero';
import {cap,copy,log,finish as baseFinish,type AnimalId,type AnimalState} from './sim';
import {HUNT_TRAITS,type HuntState} from './hidden-hunt';
import type {V10} from './game-v10';

export type ArchiveStatus='contained'|'escaped'|'deceased'|'transferred'|'dissected';
export type ArchiveRecord={day:number;title:string;detail:string;kind:'observation'|'care'|'research'|'security'|'decision'|'loss'};
export type ProtocolStepRecord={stage:number;prompt:string;chosen:string;expected:string;matched:boolean};
export type ProtocolAttempt={day:number;quality:number;mode:'gentle'|'force';result:string;steps:ProtocolStepRecord[]};
export type SpecimenDossier={key:string;species:AnimalId;name:string;firstDay:number;lastDay:number;status:ArchiveStatus;captureMethod:string;observedTraits:number[];records:ArchiveRecord[];maxStress:number;maxMemory:number;protocolAttempts?:ProtocolAttempt[]};
export type ArchiveGift='tracking'|'power'|'serum';
export type ArchiveState={version:37;serials:Partial<Record<AnimalId,number>>;entries:Record<string,SpecimenDossier>;knownTraits:Partial<Record<AnimalId,number[]>>;fieldJournal:Partial<Record<AnimalId,string[]>>;revealed:boolean;revealPending:boolean;revealSeen:boolean;pendingGifts:number;giftHistory:ArchiveGift[];bonuses:{tracking:boolean;power:boolean};samples:number;sampleSpecies?:Partial<Record<AnimalId,number>>;lastShipmentSpecies?:AnimalId;processedKeys:string[];dispatches:number;rewardPolicyVersion?:number;};
const prefixes:Record<AnimalId,string>={rabbit:'RB',fox:'FX',deer:'DR',owl:'OW',wolf:'WF',crow:'CR',otter:'OT',lynx:'LX',axolotl:'AX',moth:'MT',mutant:'MX',chimera:'CH',specter:'SP'};
export const emptyArchive=():ArchiveState=>({version:37,serials:{},entries:{},knownTraits:{},fieldJournal:{},revealed:false,revealPending:false,revealSeen:false,pendingGifts:0,giftHistory:[],bonuses:{tracking:false,power:false},samples:0,processedKeys:[],dispatches:0,rewardPolicyVersion:2});
export function archiveOf(s:V10):ArchiveState{return s.archive??emptyArchive();}
function updateStatus(s:V10,a:AnimalState):ArchiveStatus{
 const transferred=!!(a as AnimalState&{transferred?:boolean}).transferred||(!a.alive&&!!a.specimenId&&s.archive?.entries[a.specimenId]?.status==='transferred');
 return transferred?'transferred':s.security?.escapedIds.includes(a.id)?'escaped':a.alive?'contained':'deceased';
}
/** Migration is intentionally conservative: old saves never gain fabricated capture facts. */
export function ensureArchive(s:V10):ArchiveState{
 const state:ArchiveState={...emptyArchive(),...(s.archive||{}),bonuses:{...emptyArchive().bonuses,...s.archive?.bonuses}};
 state.entries??={};state.knownTraits??={};state.fieldJournal??={};state.serials??={};state.processedKeys??=[];state.giftHistory??=[];
 // Old saves may contain premium vouchers granted by living transfers. Keep redeemed benefits
 // but void unredeemed vouchers that were not earned from actual tissue shipments.
 if(!s.archive?.rewardPolicyVersion){
  const eligible=Math.max(0,(state.dispatches||0)-state.giftHistory.length);
  state.pendingGifts=Math.max(0,Math.min(state.pendingGifts||0,eligible));
  state.rewardPolicyVersion=2;
 }
 s.archive=state;
 for(const animal of s.animals){
  // Only an untracked legacy loss may inherit the old species-level HQ flag.
  // A later specimen of that species must keep its own status.
  if(!animal.alive&&(!animal.specimenId||!state.entries[animal.specimenId])&&s.headquarters?.transferred.includes(animal.id)&&!Object.values(state.entries).some(e=>e.species===animal.id&&e.status==='transferred')){
   (animal as AnimalState&{transferred?:boolean}).transferred=true;
  }
  if(!animal.specimenId){
   const candidate=(state.serials[animal.id]??0)+1;
   state.serials[animal.id]=candidate;
   animal.specimenId=`${prefixes[animal.id]}-${String(candidate).padStart(3,'0')}`;
  }else{
   const index=Number(animal.specimenId.match(/-(\d+)$/)?.[1]||1);
   state.serials[animal.id]=Math.max(state.serials[animal.id]??0,index);
  }
  const key=animal.specimenId;
  const existing=state.entries[key];
  if(!existing)state.entries[key]={key,species:animal.id,name:animal.name,firstDay:s.day,lastDay:s.day,status:updateStatus(s,animal),captureMethod:'구형 저장 기록 — 현장 세부 기록 없음',observedTraits:[],records:[],maxStress:animal.stress,maxMemory:animal.memory};
  else{
   existing.maxStress=Math.max(existing.maxStress,animal.stress);
   existing.maxMemory=Math.max(existing.maxMemory,animal.memory);
   if(existing.status!=='dissected')existing.status=updateStatus(s,animal);
   existing.lastDay=s.day;
  }
 }
 return state;
}
export function noteSpeciesTrait(s:V10,species:AnimalId,index:number):void{
 if(!Number.isInteger(index)||index<0||index>2)return;
 const archive=ensureArchive(s);const found=archive.knownTraits[species]??[];
 archive.knownTraits[species]=[...new Set([...found,index])].sort();
}
export function noteFieldAction(s:V10,species:AnimalId,description:string):void{
 const archive=ensureArchive(s);const journal=archive.fieldJournal[species]??[];
 archive.fieldJournal[species]=[...journal,`DAY ${s.day}: ${description}`].slice(-18);
}
export function recordSpecimen(s:V10,id:AnimalId,title:string,detail:string,kind:ArchiveRecord['kind']='decision'):void{
 const archive=ensureArchive(s);
 const animal=s.animals.find(a=>a.id===id);
 if(!animal?.specimenId)return;
 const dossier=archive.entries[animal.specimenId];if(!dossier)return;
 dossier.records=[{day:s.day,title,detail,kind},...dossier.records].slice(0,40);
 dossier.lastDay=s.day;dossier.maxStress=Math.max(dossier.maxStress,animal.stress);dossier.maxMemory=Math.max(dossier.maxMemory,animal.memory);
 dossier.status=updateStatus(s,animal);
}
export function noteCapturedHunt(s:V10,hunt:HuntState):void{
 const archive=ensureArchive(s);
 hunt.revealed.forEach((known,index)=>{if(known)noteSpeciesTrait(s,hunt.species,index);});
 const distinct=[`수풀 수색 ${Object.keys(hunt.searchedAt).length}칸`, `포획에 사용한 행동 ${hunt.maxActions-hunt.actions}회`, `반복 유인 ${Object.values(hunt.habits).reduce((a,b)=>a+(b||0),0)}회`];
 noteFieldAction(s,hunt.species,`흔적 역추적 성공 · ${distinct.join(' · ')}`);
 archive.fieldJournal[hunt.species]=archive.fieldJournal[hunt.species]?.slice(-18);
}
export function noteRescue(s:V10,id:AnimalId):void{
 const archive=ensureArchive(s);const a=s.animals.find(a=>a.id===id&&a.alive);if(!a)return;
 const entry=archive.entries[a.specimenId!];entry.captureMethod=archive.fieldJournal[id]?.at(-1)||'시설 외곽에서 안전 구조';
 entry.observedTraits=[...(archive.knownTraits[id]??[])];
 recordSpecimen(s,id,'보호 격리실 입소',`격리실 ${a.room}호 배정. 포획 경로와 발견한 특성이 이 기록에 보존됩니다.`,'observation');
 routineOriginScan(s,id);
}
export function noteCare(s:V10,id:AnimalId,kind:string,answer:string,successful:boolean,detail:string):void{
 recordSpecimen(s,id,`${kind} · ${successful?'적절한 반응':'반응 불일치'}`,`선택: ${answer}. ${detail}`,'care');
}
/** Append exact protocol questions, chosen options, expected behavior and judgement. */
export function recordProtocolAttempt(s:V10,id:AnimalId,attempt:ProtocolAttempt):void{
 const archive=ensureArchive(s);const animal=s.animals.find(a=>a.id===id);
 if(!animal?.specimenId)return;
 const dossier=archive.entries[animal.specimenId];if(!dossier)return;
 dossier.protocolAttempts=[attempt,...(dossier.protocolAttempts??[])].slice(0,12);
 const summary=attempt.steps.map(step=>`#${step.stage} ${step.matched?'일치':'불일치'}: ${step.chosen}`).join(' / ');
 recordSpecimen(s,id,'행동 강령 시도 · 단계별 판독',`${summary}. 최종 판정 ${attempt.quality}점 (${attempt.mode==='gentle'?'비침습적':'강제'}).`,'research');
}
export function noteResonance(s:V10,id:AnimalId):void{
 const a=s.animals.find(a=>a.id===id);
 recordSpecimen(s,id,'신경 공명 동기화',`공명 ${a?.memory??0}/100. 행동 강령 연구 결과가 외부 보존 체계에 전송될 수 있습니다.`,'research');
}
/** A second dispatch or independent evidence opens the same irreversible truth. */
export function evaluateArchiveReveal(s:V10):void{
 const archive=ensureArchive(s);if(archive.revealed||archive.revealPending||!s.originZero?.firstPositiveDay)return;
 const dispatched=(s.headquarters?.transferred.length??0)+archive.dispatches;
 const throughDispatch=dispatched>=2&&s.day>=7;
 const throughEvidence=s.day>=12&&s.knowledge>=45&&s.clues>=8;
 if(s.flags.humanTruth && s.headquarters?.revealStage>=2 && (throughDispatch||throughEvidence)){
  archive.revealPending=true;
  log(s,'폐쇄된 병리실의 원래 명칭',throughDispatch?'외부 이송 내역 두 건에서 신경 조직 회수 코드가 발견됐다.':'이송을 거부한 채 복원한 기록에서 병리 실험 지시서가 발견됐다.','mystery');
 }
}
export function acknowledgeArchiveTruth(s:V10):V10{
 if(!s.archive?.revealPending)return s;
 const n=copy(s) as V10;const a=ensureArchive(n);
 a.revealPending=false;a.revealed=true;a.revealSeen=true;
 n.clues+=2;n.knowledge+=8;
 log(n,'생체 분석실 → 해부실','보존 개체는 동물의 몸에 옮겨진 인간 신경 조직이었다. 본부는 공명 100% 개체에서 활성화된 뇌 조직을 회수해 왔다. 지식 +8, 단서 +2.','mystery');
 n.lastOutcome='분석실의 원래 용도 해금. 해부·조직 보존·본부 송신을 선택할 수 있습니다.';
 return n;
}
export type DissectionAction='postmortem'|'forced'|'transmit';
export function applyDissection(s:V10,action:DissectionAction,specimenKey?:string):V10{
 const task=s.hqOrders?.active;const authorized=task?.status==='accepted'&&s.facilities.synthesis;if((!s.archive?.revealed&&!authorized)||s.run||s.phase!=='day')return s;
 const n=copy(s) as V10;const archive=ensureArchive(n);
 if(action==='transmit'){
  if(archive.samples<1||n.power<4)return s;
  const target=task?.status==='accepted'?task.species:undefined;const stock=archive.sampleSpecies??={};if(target&&(stock[target]??0)<1)return s;const selected=target??(Object.keys(stock) as AnimalId[]).find(id=>(stock[id]??0)>0);if(selected)stock[selected]=(stock[selected]??0)-1;archive.lastShipmentSpecies=selected;
  archive.samples--;archive.dispatches++;archive.pendingGifts++;
  n.power=cap(n.power-4);n.credits+=180;n.trust=cap(n.trust-5);
  log(n,'본부 표본 송신','보존 신경 조직 1개를 외부로 전송했다. CR +180과 고급 지원품 선택권 1건 지급. 살아 있는 개체 인계로는 지급되지 않는다.','bad');
  n.lastOutcome='본부 송신 완료 · CR +180 · 고급 지원 물품 선택 가능';
  return n;
 }
 const entry=archive.entries[specimenKey||''];if(!entry||archive.processedKeys.includes(entry.key)||n.ap<(action==='forced'?2:1)||n.power<(action==='forced'?10:5))return s;
 const specimen=n.animals.find(a=>a.specimenId===entry.key);
 if(!specimen||n.security.escapedIds.includes(specimen.id)||(!s.archive.revealed&&task?.species&&entry.species!==task.species))return s;
 if(action==='forced'&&!specimen.alive)return s;
 if(action==='postmortem'&&specimen.alive)return s;
 if(entry.status==='transferred'||entry.status==='dissected')return s;
 n.ap-=action==='forced'?2:1;n.power=cap(n.power-(action==='forced'?10:5));
 if(action==='forced'){
  specimen.alive=false;n.mind=cap(n.mind-12);n.trust=cap(n.trust-18);n.threat=cap(n.threat+8);
  archive.samples+=2;n.knowledge+=25;
  log(n,'강제 신경 회수',`${entry.key} 생체 조직 회수. 개체가 영구 소실되었다. 표본 +2, 지식 +25, 정신 -12, 신뢰 -18.`,'bad');
 }else{
  archive.samples++;n.knowledge+=10;
  log(n,'사후 병리 분석',`${entry.key} 사인 확인 및 신경 조직 표본화. 표본 +1, 지식 +10.`,'mystery');
 }
 archive.sampleSpecies??={};archive.sampleSpecies[entry.species]=(archive.sampleSpecies[entry.species]??0)+(action==='forced'?2:1);
 archive.processedKeys.push(entry.key);entry.status='dissected';
 entry.records.unshift({day:n.day,title:action==='forced'?'강제 조직 회수':'사후 병리 분석',detail:action==='forced'?'담당자가 살아 있는 개체의 생체 표본화를 승인했다.':'사후 검체 채취 및 장기 보존 절차가 종료됐다.',kind:'loss'});
 n.lastOutcome=action==='forced'?'개체가 영구 소실되었습니다. 신경 조직 표본 2개를 확보했습니다.':'사후 검체 1개를 확보했습니다.';
 return n;
}
export function chooseArchiveGift(s:V10,gift:ArchiveGift):V10{
 if(!s.archive||s.archive.pendingGifts<1)return s;
 if((gift==='tracking'&&s.archive.bonuses.tracking)||(gift==='power'&&s.archive.bonuses.power))return s;
 const n=copy(s) as V10;const a=ensureArchive(n);
 a.pendingGifts--;a.giftHistory.push(gift);
 if(gift==='tracking')a.bonuses.tracking=true;
 if(gift==='power')a.bonuses.power=true;
 if(gift==='serum')n.mutantSerum+=3;
 const detail=gift==='tracking'?'본부 특수 운송 케이지 개량 · 포획 행동 기회 영구 +3':gift==='power'?'매일 새벽 전력 자동 +30':'변이 억제 혈청 +3개';
 log(n,'본부 지원품 지급',`${detail}. 본부에 신경 조직 표본을 송신한 대가로 도착한 물품입니다.`,'mystery');
 n.lastOutcome=`본부 지원품 수령: ${detail}`;
 return n;
}
export function knownSpeciesTraits(s:V10,id:AnimalId):{known:boolean;label:string}[]{
 const known=archiveOf(s).knownTraits[id]??[];
 return HUNT_TRAITS[id].hints.map((label,index)=>({known:known.includes(index),label}));
}

/** Endings remember both cooperation and refusal; no autopsy path is mandatory. */
export function finishWithArchive(s:V10,goal:'rebuild'|'freedom'|'preserve'):V10{
 if(s.phase!=='finale')return s;
 const n=baseFinish(s,goal) as V10;
 if(originReadyForFinale(s)){
  const epilogue=originEndEpilogue(s,goal);
  const coerced=Object.values(n.archive?.entries??{}).filter(entry=>entry.records.some(record=>record.title==='강제 조직 회수')).length;
  const protectedAnimals=n.animals.filter(animal=>animal.alive&&!n.security.escapedIds.includes(animal.id)).length;
  const staffLost=n.crew?.retired?.length??0;
  const cost=`최종 기록: 보호 개체 ${protectedAnimals}, 생체 이송 ${n.headquarters.transferred.length}, 강제 회수 ${coerced}, 소실 직원 ${staffLost}.`;
  const regret=coerced>0?' 과거의 연구 방식으로 상실된 생명은 되돌릴 수 없었다.':goal==='rebuild'?' 살아 있는 개체를 강제로 해치지 않는 방법은 끝내 완전히 증명되지 않았다.':'';
  const stance=n.narrative?.finalStance==='inherit'?'원 연구자의 신념을 계승한 책임은 남았다.':n.narrative?.finalStance==='reject'?'과거의 잘못을 되풀이하지 않겠다는 선택이 남았다.':'같은 기억을 가졌다는 이유만으로 같은 존재가 될 필요는 없었다.';
  n.ending=`${epilogue.title} — ${epilogue.text}${regret} 관리자는 오랜 시간 동물의 몸에 적응한 뇌와 쇠퇴한 복제 신체의 한계를 넘지 못하고 사망했다. ${stance} ${cost}`;
  log(n,'ORIGIN ZERO · 마지막 지시',n.ending,'mystery');
  return n;
 }
 const a=ensureArchive(n);const handed=n.headquarters?.transferred.length??0;
 const forced=Object.values(a.entries).filter(e=>e.records.some(r=>r.title==='강제 조직 회수')).length;
 if(goal==='rebuild'&&handed+a.dispatches>=3&&forced>0){
  n.ending='본부의 계승자 — 재생을 위한 자료는 충분했습니다. 그러나 담당자가 선택한 방법은 과거 연구진의 실험을 되풀이했습니다. 인간의 지식이 돌아오는 동안 생명들은 또다시 이름을 잃었습니다.';
 }else if(goal==='freedom'&&handed===0&&forced===0){
  n.ending='기록 밖의 봄 — 본부에 어떤 개체도 넘기지 않았습니다. 완성된 인간의 부활은 미뤄졌지만, 인간의 기억을 품은 생명들은 자신의 미래를 선택했습니다.';
 }else if(goal==='rebuild'&&handed===0&&forced===0&&n.knowledge>=120){
  n.ending='상처 없는 복원 — 누구의 살아 있는 신경 조직도 강제로 회수하지 않았습니다. 남겨진 기록만으로 새로운 의식을 설계할 수 있을지는 아직 알 수 없습니다. 하지만 그 과정에서 또 다른 희생자는 없었습니다.';
 }else if(goal==='freedom'&&forced>=2){
  n.ending='뒤늦은 철문 — 오늘 열린 문으로 모든 동물이 나갈 수는 없었습니다. 과거의 강제 실험으로 사라진 생명은 돌아오지 않습니다. 관리자는 그 이름까지 출입 명단에 적었습니다.';
 }else if(goal==='preserve'&&(n.crew?.retired?.length??0)>=2){
  n.ending='비어 있는 교대실 — 보존소는 살아남았습니다. 그러나 직원들이 앉아 있던 네 자리는 하나씩 비었습니다. EVE가 기록한 마지막 근무표에는 이제 관리자의 이름만 남았습니다.';
 }else if(goal==='preserve'&&a.revealed&&handed>0){
  n.ending+=' 본부에 보낸 개체의 처리 기록은 EVE와 담당자가 계속 보존합니다. 그 이름들이 다시 지워지지 않도록.';
 }
 const stance=n.narrative?.finalStance;
 if(stance==='inherit'&&goal==='rebuild')n.ending+=' 과거 과학자의 명령을 계승한 관리자는 그 신념이 또 다른 희생을 만드는 순간 책임을 피할 수 없다.';
 if(stance==='reject'&&goal!=='rebuild')n.ending+=' 뇌에 새겨진 신념을 거부한 관리자는 기억보다 살아 있는 사람들의 선택이 중요하다고 기록했다.';
 if(stance==='question')n.ending+=' 자신이 원본 과학자와 동일한 존재인지 확신할 수는 없다. 그러나 현재의 선택만은 스스로 내렸다.';
 const legacy=n.narrative?.choices?.daughter_archive;
 const protection=n.narrative?.choices?.preservation_order;
 if(legacy===0&&goal==='rebuild')n.ending+=' 관리자는 과거 연구자의 명령을 계승했다. 그 선택은 이미 끝난 희생을 다시 되풀이할 위험을 남겼다.';
 if(legacy===1&&goal!=='rebuild')n.ending+=' EVE는 설계된 딸을 흉내 내는 일을 멈추고 자신의 판단으로 문을 열었다.';
 if(protection===0&&goal==='freedom')n.ending+=' 관리자가 숨겨 둔 피험자 명부에 이름이 복구됐다. 이들의 동의가 없는 실험은 더 이상 진행되지 않는다.';
 // One compact epilogue makes the cumulative moral cost visible regardless of goal.
 if(forced>0||handed>0||a.dispatches>0){
  n.ending+=` 최종 명세: 생체 이송 ${handed}건, 신경 조직 송신 ${a.dispatches}건, 강제 회수 ${forced}건.`;
 }
 log(n,'보존 기록 최종 결산',`이송 ${handed}개체, 본부 표본 송신 ${a.dispatches}건, 강제 회수 ${forced}건, 생존 ${n.animals.filter(x=>x.alive).length}개체. 본부에 협력하지 않아도 마지막 선택은 가능합니다.`,'mystery');
 return n;
}
