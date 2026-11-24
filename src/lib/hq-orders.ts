/** ECHO WARD · HEADQUARTERS DIRECTIVES
 * Five-day cycle: three player choices, real specimen submission, escalating
 * interference for refusal or expired deadlines. All state is save-safe.
 */
import type {V10} from './game-v10';
import {cap,copy,log,specs,type AnimalId} from './sim';
import {applyCrewOpinion} from './crew';

export type HqOrderStatus='offered'|'accepted'|'completed'|'substituted'|'refused'|'failed';
export type HqOrderChoice='accept'|'substitute'|'refuse';
export type HqDirective={id:string;issueDay:number;dueDay:number;status:HqOrderStatus;requirement:number;title:string;brief:string;outcome?:string;species?:AnimalId};
export type HqOrderState={lastIssuedDay:number;interference:number;active:HqDirective|null;history:HqDirective[];fulfilled:number;refused:number;seenSpecies?:AnimalId[];queue?:AnimalId[]};
export const emptyHqOrders=():HqOrderState=>({lastIssuedDay:0,interference:0,active:null,history:[],fulfilled:0,refused:0,seenSpecies:[],queue:[]});
export function ensureHqOrders(s:V10):HqOrderState{
 if(!s.hqOrders){s.hqOrders=emptyHqOrders();return s.hqOrders;}
 const old=s.hqOrders;const seen=old.seenSpecies??[...new Set([...s.animals.map(a=>a.id),...(s.headquarters?.transferred??[]),...Object.values(s.archive?.entries??{}).map(a=>a.species)])];s.hqOrders={...emptyHqOrders(),...old,seenSpecies:seen,queue:old.queue??[],history:old.history??[],active:old.active??null};
 return s.hqOrders;
}
function archiveOrder(s:V10,order:HqDirective){const h=ensureHqOrders(s);h.history=[{...order},...h.history].slice(0,24);h.active=null;}
/** Called after a night completes and day++ happened. */
export function tickHqOrders(s:V10):void{
 let h=ensureHqOrders(s);
 if(h.active?.status==='accepted'&&s.day>h.active.dueDay){
  h.active.status='failed';h.active.outcome='납품 기한 초과. 본부 지원 차단 및 외곽 교란 신호 활성화.';
  h.interference=cap(h.interference+24);
  s.threat=cap(s.threat+17);s.facility=cap(s.facility-7);
  log(s,'본부 지령 위반 · 회수 신호',`기한이 끝났습니다. 외부 위협 +17, 시설 안정성 -7, 본부 간섭도 +24. ${h.active.title}`,'bad');
  archiveOrder(s,h.active);
  h=ensureHqOrders(s);
 }
 issueNextHqOrder(s);
}
/** Species registration survives release, death, transfer, duplicate rescue and reload. */
export function registerHqSpecies(s:V10,id:AnimalId){const h=ensureHqOrders(s);if(h.seenSpecies!.includes(id))return;h.seenSpecies!.push(id);if(s.tutorialStep>=9){h.queue!.push(id);log(s,'본부 수신 대기','새 개체 등록이 본부에 통보되었습니다. 귀환 후 지령을 확인하십시오.','mystery');}issueNextHqOrder(s);}
export function issueNextHqOrder(s:V10){const h=ensureHqOrders(s);if(s.phase!=='day'||s.run||s.pending||h.active||!h.queue?.length)return;const species=h.queue.shift()!,name=specs.find(x=>x.id===species)?.name??species;h.active={id:'HQ-SPECIES-'+species,issueDay:s.day,dueDay:s.day+4,status:'offered',requirement:1,species,title:name+' · 신경 조직 회수 지령',brief:'최초 등록된 '+name+'의 조직 표본을 제출하십시오. 다른 종의 표본이나 살아 있는 개체의 인계는 납품으로 인정되지 않습니다.'};h.lastIssuedDay=s.day;log(s,'본부 우선 지령 도착',h.active.title,'mystery');}
export function respondHqOrder(s:V10,choice:HqOrderChoice):V10{
 if(s.hqOrders?.active?.status!=='offered')return s;
 const n=copy(s) as V10;const h=ensureHqOrders(n);const task=h.active!;
 if(choice==='accept'){
  task.status='accepted';task.outcome=`납품 동의. DAY ${task.dueDay}까지 해부실에서 표본 1개를 본부로 송신해야 합니다.`;
  log(n,'본부 지령 수락',task.outcome,'info');
 }else if(choice==='substitute'){
  if(n.knowledge<12||n.clues<2||n.power<6)return s;
  n.knowledge-=12;n.clues-=2;n.power=cap(n.power-6);n.credits+=65;
  h.interference=cap(h.interference+7);n.trust=cap(n.trust+2);task.status='substituted';
  task.outcome='대체 기록 승인. 지식 -12, 단서 -2, 전력 -6%p, CR +65, 본부 간섭도 +7. 생체 표본을 희생시키지 않았습니다.';
  log(n,'본부 대체 표본 승인',task.outcome,'mystery');archiveOrder(n,task);
 }else{
  h.interference=cap(h.interference+18);n.threat=cap(n.threat+11);n.trust=cap(n.trust+3);
  task.status='refused';task.outcome='본부 지령 거부. 간섭도 +18, 외부 위협도 +11. 본부 감시망의 작동이 증가했습니다.';
  h.refused++;log(n,'본부 명령 거부',task.outcome,'bad');archiveOrder(n,task);
 }
 n.lastOutcome=task.outcome!;issueNextHqOrder(n);return n;
}
/** Called on a successful tissue shipment, not on living-animal transfer. */
export function settleHqShipment(s:V10,oldDispatches:number,species?:AnimalId):void{
 const h=ensureHqOrders(s),task=h.active;
 if(!task||task.status!=='accepted'||s.archive.dispatches<=oldDispatches||(task.species&&task.species!==species))return;
 task.status='completed';task.outcome='신경 조직 표본 납품 완료. 표본 송신의 기본 보상 외에 보존 CR +300, 시설 부품 +2, 본부 간섭도 -10.';
 s.credits+=300;s.parts+=2;h.interference=cap(h.interference-10);h.fulfilled++;
 // A forced dissection's ethical consequences are handled by the archive flow.
 // Staff react only to the separate HQ tissue decision, never to a living transfer.
 applyCrewOpinion(s,'disposal','dispose');
 log(s,'본부 조직 회수 지령 완료',task.outcome,'mystery');s.lastOutcome=task.outcome;
 archiveOrder(s,task);issueNextHqOrder(s);
}
