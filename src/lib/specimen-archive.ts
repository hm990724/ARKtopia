/** ECHO WARD v37 — evidence-based specimen archive and the concealed HQ trade.
 * All state is JSON-serializable. No image assets or new fonts are required.
 * Species IDs still identify active animals in the legacy simulation. A distinct
 * specimenId identifies each successive rescued individual in the archive.
 */
import {cap,copy,log,finish as baseFinish,type AnimalId,type AnimalState} from './sim';
import {HUNT_TRAITS,type HuntState} from './hidden-hunt';
import type {V10} from './game-v10';

export type ArchiveStatus='contained'|'escaped'|'deceased'|'transferred'|'dissected';
export type ArchiveRecord={day:number;title:string;detail:string;kind:'observation'|'care'|'research'|'security'|'decision'|'loss'};
export type SpecimenDossier={key:string;species:AnimalId;name:string;firstDay:number;lastDay:number;status:ArchiveStatus;captureMethod:string;observedTraits:number[];records:ArchiveRecord[];maxStress:number;maxMemory:number};
export type ArchiveGift='tracking'|'power'|'serum';
export type ArchiveState={version:37;serials:Partial<Record<AnimalId,number>>;entries:Record<string,SpecimenDossier>;knownTraits:Partial<Record<AnimalId,number[]>>;fieldJournal:Partial<Record<AnimalId,string[]>>;revealed:boolean;revealPending:boolean;revealSeen:boolean;pendingGifts:number;giftHistory:ArchiveGift[];bonuses:{tracking:boolean;power:boolean};samples:number;processedKeys:string[];dispatches:number;};
const prefixes:Record<AnimalId,string>={rabbit:'RB',fox:'FX',deer:'DR',owl:'OW',wolf:'WF',crow:'CR',otter:'OT',lynx:'LX',axolotl:'AX',moth:'MT',mutant:'MX',chimera:'CH'};
export const emptyArchive=():ArchiveState=>({version:37,serials:{},entries:{},knownTraits:{},fieldJournal:{},revealed:false,revealPending:false,revealSeen:false,pendingGifts:0,giftHistory:[],bonuses:{tracking:false,power:false},samples:0,processedKeys:[],dispatches:0});
export function archiveOf(s:V10):ArchiveState{return s.archive??emptyArchive();}
function updateStatus(s:V10,a:AnimalState):ArchiveStatus{
 const transferred=s.headquarters?.transferred.includes(a.id)||!!(a as AnimalState&{transferred?:boolean}).transferred;
 return transferred?'transferred':s.security?.escapedIds.includes(a.id)?'escaped':a.alive?'contained':'deceased';
}
/** Migration is intentionally conservative: old saves never gain fabricated capture facts. */
export function ensureArchive(s:V10):ArchiveState{
 const state:ArchiveState={...emptyArchive(),...(s.archive||{}),bonuses:{...emptyArchive().bonuses,...s.archive?.bonuses}};
 state.entries??={};state.knownTraits??={};state.fieldJournal??={};state.serials??={};state.processedKeys??=[];state.giftHistory??=[];
 s.archive=state;
 for(const animal of s.animals){
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
}
export function noteCare(s:V10,id:AnimalId,kind:string,answer:string,successful:boolean,detail:string):void{
 recordSpecimen(s,id,`${kind} · ${successful?'적절한 반응':'반응 불일치'}`,`선택: ${answer}. ${detail}`,'care');
}
export function noteResonance(s:V10,id:AnimalId):void{
 const a=s.animals.find(a=>a.id===id);
 recordSpecimen(s,id,'신경 공명 동기화',`공명 ${a?.memory??0}/100. 행동 강령 연구 결과가 외부 보존 체계에 전송될 수 있습니다.`,'research');
}
/** A second dispatch or independent evidence opens the same irreversible truth. */
export function evaluateArchiveReveal(s:V10):void{
 const archive=ensureArchive(s);if(archive.revealed||archive.revealPending)return;
 const dispatched=(s.headquarters?.transferred.length??0)+archive.dispatches;
 const throughDispatch=dispatched>=2&&s.day>=7;
 const throughEvidence=s.day>=12&&s.knowledge>=45&&s.clues>=8;
 if(throughDispatch||throughEvidence){
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
 if(!s.archive?.revealed||s.run||s.phase!=='day')return s;
 const n=copy(s) as V10;const archive=ensureArchive(n);
 if(action==='transmit'){
  if(archive.samples<1||n.power<4)return s;
  archive.samples--;archive.dispatches++;archive.pendingGifts++;
  n.power=cap(n.power-4);n.credits+=180;n.trust=cap(n.trust-5);
  log(n,'본부 표본 송신','보존 신경 조직 1개를 외부로 전송했다. CR +180. 송신 이후 본부에서 고급 지원 물품 선택을 요청했다.','bad');
  n.lastOutcome='본부 송신 완료 · CR +180 · 고급 지원 물품 선택 가능';
  return n;
 }
 const entry=archive.entries[specimenKey||''];if(!entry||archive.processedKeys.includes(entry.key)||n.ap<(action==='forced'?2:1)||n.power<(action==='forced'?10:5))return s;
 const specimen=n.animals.find(a=>a.specimenId===entry.key);
 if(!specimen||n.security.escapedIds.includes(specimen.id))return s;
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
 log(n,'본부 지원품 지급',`${detail}. 외부 생체 회수에 협력한 대가로 도착한 물품입니다.`,'mystery');
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
 const a=ensureArchive(n);const handed=n.headquarters?.transferred.length??0;
 const forced=Object.values(a.entries).filter(e=>e.records.some(r=>r.title==='강제 조직 회수')).length;
 if(goal==='rebuild'&&handed+a.dispatches>=3&&forced>0){
  n.ending='본부의 계승자 — 재생을 위한 자료는 충분했습니다. 그러나 담당자가 선택한 방법은 과거 연구진의 실험을 되풀이했습니다. 인간의 지식이 돌아오는 동안 생명들은 또다시 이름을 잃었습니다.';
 }else if(goal==='freedom'&&handed===0&&forced===0){
  n.ending='기록 밖의 봄 — 본부에 어떤 개체도 넘기지 않았습니다. 완성된 인간의 부활은 미뤄졌지만, 인간의 기억을 품은 생명들은 자신의 미래를 선택했습니다.';
 }else if(goal==='preserve'&&a.revealed&&handed>0){
  n.ending+=' 본부에 보낸 개체의 처리 기록은 EVE와 담당자가 계속 보존합니다. 그 이름들이 다시 지워지지 않도록.';
 }
 log(n,'보존 기록 최종 결산',`이송 ${handed}개체, 본부 표본 송신 ${a.dispatches}건, 강제 회수 ${forced}건, 생존 ${n.animals.filter(x=>x.alive).length}개체. 본부에 협력하지 않아도 마지막 선택은 가능합니다.`,'mystery');
 return n;
}
