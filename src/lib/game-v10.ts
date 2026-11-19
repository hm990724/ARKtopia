import {emptyCrew,ensureCrew,recruitCrew,crewNight,crewDissectionShock,applyCrewOpinion,applyCrewLossPenalties,queueCrewTerminations,type CrewState} from './crew';
import {performHuntAction,type HuntMode} from './hidden-hunt';
import {emptyArchive,ensureArchive,noteSpeciesTrait,noteFieldAction,noteCapturedHunt,noteRescue,noteResonance,recordSpecimen,evaluateArchiveReveal,type ArchiveState} from './specimen-archive';
import {AnimalId,Origin,Start,State,createGame,copy,cap,log,recalc,makeAnimal,specs,dailyWork,repair,extract,finish,isMutant,recordMutation,nightlyAnimalCondition} from './sim';
import {applyFamiliarRoutine} from './care-interactions';
import {initialSecurity,nightlySecurity,type SecurityState} from './security';
import {createField,createCapture,adjacentField,advanceCapture,setDevice,removeDevice,markCapturePrediction,armCaptureSeal,normalizeCapture,type FieldState,type CaptureState,type DeviceKind,type Pace} from './tactical-field';

export type Gear='flashlight'|'filter'|'scanner'|'medkit'|'cage';
export type RegionId='garden'|'conservatory'|'rail'|'archive'|'vault'|'tunnels';
export type IncidentId='echo'|'breach'|'blackout'|'spores'|'signal'|'visitor'|'predator'|'coolant'|'rations'|'intrusion';
export type Incident={id:IncidentId;title:string;desc:string;cause:string;options:[string,string,string];};
export type FieldResource='scrap'|'knowledge'|'clues';
export type FieldCaptureRecord={id:AnimalId;result:'secured'|'treated'|'released'|'failed'};
export type FieldSettlement={region:RegionId;reason:string;steps:number;clues:number;loot:number;rewards:Record<FieldResource|'parts'|'food'|'credits',number>;captures:FieldCaptureRecord[]};
export type Run={region:RegionId;gear:Gear[];stage:number;integrity:number;exposure:number;loot:number;discovery:AnimalId|null;event:string;log:string[];medkitUsed?:boolean;cageUsed?:boolean;earned?:Record<FieldResource,number>;captures?:FieldCaptureRecord[];firstTutorial?:boolean};
const freshFieldEarnings=():Record<FieldResource,number>=>({scrap:0,knowledge:0,clues:0});
function earnDuringRun(run:Run|null|undefined,key:FieldResource,amount:number){if(!run||amount<=0)return;run.earned??=freshFieldEarnings();run.earned[key]+=amount;}
function recordCapture(run:Run|undefined|null,id:AnimalId,result:FieldCaptureRecord['result']){if(!run)return;run.captures??=[];run.captures.push({id,result});}
export type HeadquartersState={firstReport:boolean;pendingAnimal:AnimalId|null;transferred:AnimalId[];retained:AnimalId[];copies:AnimalId[];revealStage:number;pendingScene:'trace'|'evidence'|'origin'|null;};
export const emptyHeadquarters=():HeadquartersState=>({firstReport:false,pendingAnimal:null,transferred:[],retained:[],copies:[],revealStage:0,pendingScene:null});
export type FacilityId='cctv'|'synthesis'|'infirmary'|'containment';
export const emptyFacilities=():Record<FacilityId,boolean>=>({cctv:false,synthesis:false,infirmary:false,containment:false});
export const facilityRecipes:Record<FacilityId,{name:string;scrap:number;parts:number;power:number;description:string;benefit:string}>={
 cctv:{name:'CCTV 감시망',scrap:6,parts:1,power:6,description:'폐카메라와 배선을 수리하여 격리동·외곽 감시 복구',benefit:'탈출 경로 추적 및 위험 사건 대응 가능'},
 synthesis:{name:'생체 합성실',scrap:9,parts:2,power:10,description:'폐배양실을 복구하고 생체 공여자 회로 연결',benefit:'서로 다른 일반 동물 2종 확보 시 합성 실험 가능'},
 infirmary:{name:'진료·검사실',scrap:7,parts:2,power:8,description:'폐진료대·환기·수질 측정 설비 정비',benefit:'밤마다 질병 수치 완화 · 치료 회복량 보조'},
 containment:{name:'격리 보강 설비',scrap:7,parts:2,power:8,description:'감금문과 생체 안정 패널 복구',benefit:'야간 시설 손상 감소 · 변이체 탈출 위험 감소'}
};
export type V10=State & {tutorialStep:number;scrap:number;facilities:Record<FacilityId,boolean>;mutantSerum:number;infection:number;electricCells:number;flashlight:number;filters:number;threat:number;facility:number;clues:number;daysRested:number;encounters:number;dayEvents:number;pendingIncident:IncidentId|null;lastOutcome:string;run:Run|null;lastFieldSummary?:FieldSettlement|null;field?:FieldState|null;capture?:CaptureState|null;tacticalCaptured?:boolean;pendingCage?:boolean;suppliesCollected:number;eventHistory:string[];security:SecurityState;headquarters:HeadquartersState;archive:ArchiveState;crew?:CrewState;onboardingSeen?:string[];synthesisTutorialSeen?:boolean;tutorialArchiveReviewPending?:boolean;};
export const regions:{id:RegionId;name:string;desc:string;art:string;danger:number;reward:number;ap:number;power:number;unlocked:number;animals:AnimalId[]}[]=[
{id:'garden',name:'중앙 외곽',desc:'폐쇄된 매표소와 정원. 작은 개체의 흔적.',art:'gate',danger:16,reward:1,ap:1,power:9,unlocked:1,animals:['rabbit','fox']},
{id:'conservatory',name:'온실 폐쇄동',desc:'축축한 식물과 감염 포자가 자라는 구역.',art:'sanctuary',danger:31,reward:2,ap:2,power:15,unlocked:2,animals:['deer','otter','crow']},
{id:'rail',name:'폐역 승강장',desc:'열차 아래에서 생체 신호가 잡힌다.',art:'wasteland',danger:46,reward:3,ap:2,power:19,unlocked:3,animals:['fox','wolf','lynx']},
{id:'archive',name:'관측소 기록실',desc:'위성 장비와 알아볼 수 없는 기록.',art:'laboratory',danger:55,reward:3,ap:2,power:23,unlocked:5,animals:['owl','moth','deer']},
{id:'vault',name:'B-3 밀폐 연구동',desc:'격리 실패 기록과 봉인된 생물 캡슐.',art:'laboratory',danger:72,reward:5,ap:3,power:30,unlocked:9,animals:['axolotl','mutant']},
{id:'tunnels',name:'제0구역 통로',desc:'EVE의 기록에서 존재하지 않는 장소.',art:'wasteland',danger:86,reward:6,ap:3,power:37,unlocked:14,animals:['mutant']}
];
export const gearData:{id:Gear;name:string;desc:string}[]=[{id:'flashlight',name:'수동 손전등',desc:'정전 수동 탐사 · 조사 시야 반경 2칸 · 수동 출동 전지 25%'},{id:'filter',name:'바이오필터',desc:'출동 시 필터 1개 · 사고 위험 계산 -12 · 탐사 감염 증가 -5'},{id:'scanner',name:'EVE 스캐너',desc:'출동 전력 추가 8 · 조사 시야 반경 3칸 · 포자 노출 피해 -3'},{id:'medkit',name:'응급 키트',desc:'출동 시 의약품 1개 예약 · 탐사 중 원하는 시점에 HP +20 · 미사용 귀환 시 반환'}];
export const incidentDefs:Record<IncidentId,Incident>={
echo:{id:'echo',title:'격리실에서 들린 노래',desc:'평소 울음소리만 내던 개체가 익숙한 박자로 울고 있다. EVE는 우연이라고 말한다.',cause:'개체와의 유대 또는 관찰 기록이 누적됨',options:['소리를 녹음하고 행동을 관찰한다','개체를 진정시키고 휴식시킨다','오늘은 아무것도 하지 않는다']},
breach:{id:'breach',title:'격리문 이상 진동',desc:'동물원 바깥에서 무언가 출입문을 두드린다. 안쪽의 동물들도 몸을 숨긴다.',cause:'외부 위협도 상승·격리 개체 증가',options:['전력 22를 사용해 격리문 봉쇄','동물부터 피신시킨다 (체력 12)','함정을 감시하고 기록한다']},
blackout:{id:'blackout',title:'전력망 이상',desc:'격리동의 불빛이 하나씩 꺼진다. 배터리 전압이 급격히 떨어졌다.',cause:'전력 부족·장비 가동 누적',options:['부품 2개로 긴급 수리한다','비필수 장비를 끄고 전력을 아낀다','EVE에게 과부하 분석을 요청한다']},
spores:{id:'spores',title:'붉은 포자 확산',desc:'외부에서 묻어 온 포자가 환기구에 침투했다. 방 안의 개체들이 기침을 시작한다.',cause:'높은 감염도·오염 지역 탐사',options:['필터를 소모해 환기구 정화','격리동을 봉쇄해 확산을 늦춘다','자원을 아끼고 경과를 관찰한다']},
signal:{id:'signal',title:'누군가의 비상 신호',desc:'정적 사이로 사람 목소리 같은 신호가 들린다. EVE의 음성 출력이 잠시 끊긴다.',cause:'기록 복원 또는 고위험 구역 발견',options:['기록을 저장해 주파수를 분석한다','위험을 감수하고 위치를 추적한다','응답하지 않고 신호를 차단한다']},
visitor:{id:'visitor',title:'정체불명의 방문자',desc:'외곽 카메라에 사람 키와 비슷한 그림자가 찍혔다. 그런데 얼굴을 식별할 수 없다.',cause:'장기간 시설 운영·외부 위협 누적',options:['장비로 그림자를 추적한다','격리문을 잠그고 상황을 기다린다','EVE의 영상 기록을 대조한다']},
predator:{id:'predator',title:'격리동의 발톱 자국',desc:'외벽을 긁는 소리. 울타리 밖의 포식자가 보호 개체들의 울음에 반응하고 있습니다.',cause:'외부 위협도·야간 소음 증가',options:['전력 14로 외곽 경보망 가동','직접 밖에서 소리를 유인한다','울타리를 그대로 두고 밤을 지새운다']},
coolant:{id:'coolant',title:'냉각수 붉은 누출',desc:'병리 장비의 냉각액이 지하 환기구로 흘러갑니다. EVE의 음성이 흔들립니다.',cause:'시설 노후화·코어 과열',options:['부품 2개로 긴급 배관 교체','직접 밸브를 잠그고 제독한다','손상된 냉각 회로를 방치한다']},
rations:{id:'rations',title:'보급고의 곰팡이',desc:'수상한 냄새가 사료 배급 라인에서 퍼집니다. 이미 몇몇 개체가 먹이를 거부합니다.',cause:'보급품 노후화·높은 시설 오염',options:['식량 2개를 폐기하고 배급 라인 세척','수작업으로 오염된 사료를 가려낸다','부족한 물자를 아끼기 위해 그대로 급여']},
intrusion:{id:'intrusion',title:'관리자 음성을 흉내 내는 신호',desc:'CCTV 스피커에서 담당자의 목소리와 같은 명령이 들립니다. 출처는 시설 내부가 아닙니다.',cause:'지식·기밀 기록 누적 또는 EVE 불안정',options:['전력 10을 사용해 전파 차단','신호를 녹음하고 발신자를 역추적','인증 절차 없이 연결을 허용']}
};
export function beginGame(origin:Origin,start:Start):V10{const s=createGame(origin,start) as V10;Object.assign(s,{infection:3,scrap:0,facilities:emptyFacilities(),mutantSerum:0,electricCells:2,flashlight:86,filters:2,threat:17,facility:86,clues:0,daysRested:0,encounters:0,dayEvents:0,pendingIncident:null,lastOutcome:'신호 연결 완료. 중앙 관리 구역이 열렸다.',run:null,lastFieldSummary:null,field:null,capture:null,tacticalCaptured:false,pendingCage:false,suppliesCollected:0,eventHistory:[],security:initialSecurity(),headquarters:emptyHeadquarters(),archive:emptyArchive(),crew:emptyCrew(),tutorialStep:1,onboardingSeen:[],synthesisTutorialSeen:false,tutorialArchiveReviewPending:false});s.credits=925;s.power=start==='generator'?85:65;s.shield=100;if(start==='medical')s.filters++;if(start==='generator'||start==='depot')s.electricCells++;return s}
export function loadGame(raw:unknown):V10|null{if(!raw||typeof raw!=='object')return null;const s=raw as V10;if(!Array.isArray(s.animals)||!Number.isFinite(s.day))return null; s.animals=s.animals.filter(a=>!['dino','specter'].includes(String(a.id))); if(s.tutorialStep===4){const first=s.animals.find(a=>a.id==='rabbit'&&a.alive&&a.records===0);if(first)first.bond=Math.max(first.bond,26);}  if(['dino','specter','chimera'].includes(String(s.pending)))s.pending=null; if(s.run&&['dino','specter','chimera'].includes(String(s.run.discovery)))s.run.discovery=null; // Old saves with completed tutorials retain existing CCTV / synthesis access.
 const wasComplete=(s.tutorialStep??7)>=7 && s.scrap===undefined;
 const facilities={...emptyFacilities(),...(wasComplete?{cctv:true,synthesis:true}:{}),...s.facilities};
 s.animals.forEach(a=>{a.hunger??=22;a.sickness??=0;});
 const restored=Object.assign(s,{onboardingSeen:s.onboardingSeen??[],synthesisTutorialSeen:s.synthesisTutorialSeen??false,tutorialArchiveReviewPending:s.tutorialArchiveReviewPending??false,tutorialStep:wasComplete?9:(s.tutorialStep??9),scrap:s.scrap??((s.tutorialStep??9)>=4&&(s.tutorialStep??9)<=6?16:0),facilities,mutantSerum:s.mutantSerum??0,headquarters:{...emptyHeadquarters(),...s.headquarters},crew:{...emptyCrew(),...s.crew},infection:s.infection??Math.round((s.radiation||0)/2),electricCells:s.electricCells??2,flashlight:s.flashlight??85,filters:s.filters??2,threat:s.threat??17,facility:s.facility??85,clues:s.clues??0,daysRested:s.daysRested??0,encounters:s.encounters??0,dayEvents:s.dayEvents??0,pendingIncident:s.pendingIncident??null,lastOutcome:s.lastOutcome??'',run:s.run?{...s.run,earned:s.run.earned??freshFieldEarnings(),captures:s.run.captures??[],firstTutorial:s.run.firstTutorial??((s.tutorialStep??9)<=3)}:null,lastFieldSummary:s.lastFieldSummary??null,field:s.run?(s.field??createField(s.day,s.run.region)):null,capture:s.capture?normalizeCapture(s.capture):null,tacticalCaptured:s.tacticalCaptured??false,pendingCage:s.pendingCage??false,suppliesCollected:s.suppliesCollected??0,eventHistory:s.eventHistory??[],security:s.security??initialSecurity()});ensureArchive(restored);ensureCrew(restored);queueCrewTerminations(restored);if(restored.capture?.hunt)restored.capture.hunt.revealed.forEach((known,index)=>{if(known)noteSpeciesTrait(restored,restored.capture!.hunt!.species,index)});return restored}
export function summary(s:V10,title:string,msg:string,kind:'info'|'good'|'bad'|'mystery'='info'){s.lastOutcome=msg;log(s,title,msg,kind);return s}
export function doBase(s:V10,type:'rest'|'recharge'|'handsearch'|'eve'|'feed'|'repair'|'crank'|'decontam'):V10{const n=copy(s) as V10;if(n.phase!=='day'||n.ap<1)return s;
if(type==='rest'){n.ap--;n.hp=cap(n.hp+15+(n.crew?.healingDay===n.day?6:0));n.stamina=cap(n.stamina+32);n.mind=cap(n.mind+10);n.daysRested++;n.threat=cap(n.threat+3);return summary(n,'짧은 휴식','휴식하며 체력과 정신을 회복했다. 그 사이 바깥의 움직임은 계속된다.','good')}
if(type==='decontam'){if(n.filters<1)return s;n.ap--;n.filters--;n.infection=cap(n.infection-26);n.hp=cap(n.hp+4);n.threat=cap(n.threat-3);return summary(n,'제독실 가동','바이오필터를 사용해 감염성 포자와 오염 흔적을 제거했다.','good')}
if(type==='crank'){if(n.hp<=14)return s;n.ap--;n.hp=cap(n.hp-14);n.stamina=cap(n.stamina-6);n.mind=cap(n.mind-3);n.power=cap(n.power+17);n.flashlight=cap(n.flashlight+9);return summary(n,'수동 발전기 가동','부품이 없어 발전기를 직접 돌렸다. 생명력 14와 체력 6을 소모하고 시설 전력 17을 회복했다.','good')}
if(type==='recharge'){if(n.parts<1)return s;n.ap--;n.parts--;n.power=cap(n.power+(n.origin==='engineer'?37:28));n.flashlight=cap(n.flashlight+12);return summary(n,'비상 발전기 가동','부품을 소모해 발전기를 재가동했다. 격리실과 EVE 전력 공급이 회복된다.','good')}
if(type==='handsearch'){if(n.flashlight<16)return s;n.ap--;n.flashlight-=16;n.stamina=cap(n.stamina-9);n.food+=Math.random()<.55?1:0;n.parts+=Math.random()<.55?1:0;n.credits+=25;n.infection=cap(n.infection+Math.round(Math.random()*7));n.threat=cap(n.threat+4);return summary(n,'수동 물자 수색','전력이 없어 수동 손전등으로 폐허를 뒤졌다. 적은 물자를 회수했지만 감염 위험이 늘었다.','info')}
if(type==='eve'){if(n.power<8||n.eve<10)return s;n.ap--;n.power-=8;n.eve=cap(n.eve-3);n.knowledge+=6;n.clues++;return summary(n,'EVE 분석','EVE가 기존 기록의 모순을 한 줄 해독했다. 새로운 질문을 열 수 있다.','mystery')}
if(type==='feed'){if(n.food<1||!n.animals.some(a=>a.alive))return s;n.ap--;const alive=n.animals.filter(a=>a.alive);const count=Math.min(n.food,alive.length);n.food-=count;alive.slice(0,count).forEach(a=>{a.hp=cap(a.hp+9);a.stress=cap(a.stress-10);a.bond=cap(a.bond+5)});applyCrewOpinion(n,'treatment','treat');return summary(n,'전체 급식',`${count}마리에게 먹이를 주었다. 격리실 안의 소리가 조금 잦아들었다.`,'good')}
if(n.parts<1)return s;n.ap--;n.parts--;n.facility=cap(n.facility+23);n.eve=cap(n.eve+6);return summary(n,'시설 점검','환기와 격리 장비를 정비했다. 다음 사고의 피해 위험이 감소한다.','good')}
export function purchase(s:V10,kind:'food'|'med'|'parts'|'filter'|'battery'|'room'|'cage'|'serum'):V10{const n=copy(s) as V10;const price={food:90,med:145,parts:115,filter:170,battery:120,room:480,cage:260,serum:360}[kind];if(n.credits<price)return s;n.credits-=price;if(kind==='food')n.food+=3;if(kind==='med')n.medicine+=2;if(kind==='parts')n.parts+=3;if(kind==='filter')n.filters+=2;if(kind==='battery'){n.electricCells+=2;n.flashlight=cap(n.flashlight+35)}if(kind==='room')n.rooms++;if(kind==='cage')n.parts+=2;if(kind==='serum')n.mutantSerum++;return summary(n,'보급 도착',`${price} CR로 ${kind} 보급품을 확보했다.`,'good')}
/** v32: high-risk containment options, available only while a mutant is held in the facility. */
export type MutantDecision='serum'|'forceExtract'|'euthanize';
export function handleMutant(s:V10,id:AnimalId,choice:MutantDecision):V10{
 const a=s.animals.find(x=>x.id===id&&x.alive);
 if(!a||!isMutant(a)||s.phase!=='day'||s.run||s.pending||s.pendingIncident||s.security.escapedIds.includes(id))return s;
 const n=copy(s) as V10;const target=n.animals.find(x=>x.id===id&&x.alive)!;
 recordMutation(n,target);
 if(choice==='serum'){
  if(n.mutantSerum<1||n.ap<1)return s;
  n.ap--;n.mutantSerum--;target.suppressedUntilDay=n.day+2;
  target.stress=cap(target.stress-36);target.contamination=cap(target.contamination-20);target.bond=cap(target.bond+6);
  if(n.security.incident?.animalId===id&&n.security.incident.status!=='escaped'){
   n.security.incident=null;n.security.resolved++;
  }
  n.lastOutcome=`${target.name}: 신경 충돌 억제 주사를 투여했습니다. DAY ${target.suppressedUntilDay}까지 탈출 위험이 크게 감소합니다. 변이 자체는 되돌릴 수 없습니다.`;
  log(n,'변이체 억제 주사',n.lastOutcome,'good');
 }else if(choice==='forceExtract'){
  if(n.ap<2||n.power<10)return s;
  n.ap-=2;n.power=cap(n.power-10);n.hp=cap(n.hp-6);n.eve=cap(n.eve-4);
  n.knowledge+=25+Math.floor(target.memory/10);n.clues+=2;n.extractions++;n.trust=cap(n.trust-14);n.mind=cap(n.mind-12);
  target.alive=false;target.hp=0;
  n.lastOutcome=`${target.name}의 신경 기록을 강제로 추출했습니다. 개체는 생존하지 못했습니다. 지식과 단서를 얻었지만 관리자에게도 되돌릴 수 없는 흔적이 남았습니다.`;
  log(n,'강제 신경 추출 · 개체 상실',n.lastOutcome,'bad');
 }else{
  if(n.ap<1)return s;
  n.ap--;target.alive=false;target.hp=0;n.trust=cap(n.trust-8);n.mind=cap(n.mind-9);
  n.lastOutcome=`${target.name}의 고통을 끝내기 위해 안락사를 결정했습니다. 실험 기록은 확보하지 못했습니다.`;
  log(n,'변이체 안락사 · 개체 상실',n.lastOutcome,'bad');
 }
 if(choice!=='serum'&&n.security.incident?.animalId===id){n.security.incident=null;n.security.escapedIds=n.security.escapedIds.filter(x=>x!==id);}
 applyCrewOpinion(n,'disposal',choice==='serum'?'protect':'dispose');
 recalc(n);return n;
}
export function startRun(s:V10,region:RegionId,gear:Gear[]):V10{const n=copy(s) as V10;const r=regions.find(r=>r.id===region)!;const scanner=gear.includes('scanner');const available=n.power>=r.power+(scanner?8:0);const manual=gear.includes('flashlight')&&n.flashlight>=25&&!scanner;if(n.phase!=='day'||n.run||n.ap<r.ap||n.day<r.unlocked||(!available&&!manual)||(!available&&scanner))return s;if(gear.includes('filter')&&n.filters<1)return s;if(gear.includes('medkit')&&n.medicine<1)return s;if(gear.includes('cage')&&n.parts<1)return s;
n.ap-=r.ap;if(available)n.power-=r.power+(scanner?8:0);else n.flashlight=cap(n.flashlight-25);if(gear.includes('filter'))n.filters--;if(gear.includes('medkit'))n.medicine--;if(gear.includes('cage'))n.parts--;
const initialRisk=r.danger+(available?0:16)-(gear.includes('filter')?13:0)-(scanner?9:0);n.run={region,gear,stage:0,integrity:100,exposure:0,loot:0,discovery:null,event:'',medkitUsed:false,earned:freshFieldEarnings(),captures:[],firstTutorial:s.tutorialStep===1,log:[available?'EVE 탐사 통신 연결 완료':'전력 부족. 수동 손전등으로 진입']};n.lastFieldSummary=null;n.field=createField(n.day,region);n.capture=null;n.tacticalCaptured=false;n.eventRisk=cap(n.eventRisk+3);n.threat=cap(n.threat+4);n.lastOutcome=`${r.name}에 진입했다. 초기 위험 추정 ${Math.max(5,initialRisk)}%.`;return n}
// Reserved expedition supplies are refunded if not consumed. A cage is consumed only on capture attempt.
function returnUnusedRunSupplies(s:V10,run:Run,hasEncounter:boolean){
 if(run.gear.includes('medkit')&&!run.medkitUsed)s.medicine++;
 if(run.gear.includes('cage')){if(hasEncounter)s.pendingCage=true;else if(!run.cageUsed)s.parts++;}
}
export function useFieldMedkit(s:V10):V10{
 if(!s.run||!s.run.gear.includes('medkit')||s.run.medkitUsed||s.hp>=100||s.phase!=='day')return s;
 const n=copy(s) as V10;
 n.run!.medkitUsed=true;n.hp=cap(n.hp+20+(n.crew?.healingDay===n.day?8:0));
 return summary(n,'응급 키트 사용','탐사 중 응급 키트를 사용했습니다. 생명력이 최대 20 회복되었습니다.','good');
}
export function captureChance(s:V10):number{
 return Math.max(10,Math.min(95,60+(s.origin==='medic'?11:0)+(s.medicine>0?6:0)-(s.infection>45?11:0)+(s.pendingCage?15:0)));
}
export type FieldScene={title:string;description:string;hint:string;preferred:'careful'|'rush'|'gear';punished:'careful'|'rush'|'gear'};
export const fieldScenes:Record<RegionId,FieldScene[]>={
 garden:[{title:'무너진 매표소',description:'유리창 안에 물자 가방이 걸려 있습니다. 발소리에 반응하는 소리가 들립니다.',hint:'진입 전에 주변을 관찰하면 감염체의 이동 경로를 확인할 수 있습니다.',preferred:'careful',punished:'rush'},{title:'불안정한 철제 사다리',description:'상층 창고에 약품이 보이지만 사다리가 금방이라도 무너질 듯합니다.',hint:'장비를 고정하거나 신속하게 회수할지 선택해야 합니다.',preferred:'gear',punished:'rush'},{title:'어둠 속 보급 상자',description:'시간이 흐를수록 알 수 없는 그림자가 가까워집니다.',hint:'오래 머무르는 것이 더 위험할 수 있습니다.',preferred:'rush',punished:'careful'}],
 conservatory:[{title:'균사로 뒤덮인 온실',description:'공기 중 포자가 짙습니다. 생체 반응이 유리 너머에서 움직입니다.',hint:'장비를 활용하면 바이오필터의 효율을 높일 수 있습니다.',preferred:'gear',punished:'rush'},{title:'잠든 동물의 흔적',description:'나뭇잎 아래 발자국이 남아 있습니다. 소리를 내면 사라질 수 있습니다.',hint:'천천히 접근하세요.',preferred:'careful',punished:'rush'},{title:'붕괴 중인 관수 장치',description:'물이 새고 있어 자료가 곧 유실됩니다.',hint:'빠르게 확보해야 합니다.',preferred:'rush',punished:'careful'}],
 rail:[{title:'터널의 고장 난 경보',description:'열차 아래 진동이 점점 커집니다.',hint:'기다리는 것보다 신속한 진입이 유리합니다.',preferred:'rush',punished:'careful'},{title:'감염성 먼지층',description:'환기되지 않는 먼지가 계단을 덮고 있습니다.',hint:'스캐너나 필터 장비 사용을 고려하세요.',preferred:'gear',punished:'rush'},{title:'플랫폼의 작은 발자국',description:'발자국이 두 개의 출구로 이어집니다.',hint:'주변을 관찰해야 안전한 출구를 구별할 수 있습니다.',preferred:'careful',punished:'rush'}],
 archive:[{title:'오래된 암호 잠금장치',description:'관측 기록 저장 장치에 전력이 남아 있습니다.',hint:'기계를 분석하는 것이 최선입니다.',preferred:'gear',punished:'rush'},{title:'흩어진 문서 상자',description:'바람이 불면 기록이 모두 흩어질 것 같습니다.',hint:'빠른 확보가 유리합니다.',preferred:'rush',punished:'careful'},{title:'불빛에 반응하는 감시기',description:'보안 센서가 느리게 회전합니다.',hint:'천천히 사각지대를 확인하세요.',preferred:'careful',punished:'rush'}],
 vault:[{title:'봉인 캡슐 냉각 누출',description:'냉각액과 오염 물질이 동시에 새고 있습니다.',hint:'장비를 사용하면 직접 접촉하지 않을 수 있습니다.',preferred:'gear',punished:'rush'},{title:'경보 직전의 수송실',description:'붉은 경고등이 점멸합니다. 문이 닫히기 전에 확보해야 합니다.',hint:'강행이 유리한 특수 상황입니다.',preferred:'rush',punished:'careful'},{title:'움직이지 않는 실험체',description:'작은 생물이 눈만 뜬 채 당신을 응시합니다.',hint:'조용히 접근해 반응을 관찰하세요.',preferred:'careful',punished:'rush'}],
 tunnels:[{title:'파손된 바이오 차폐문',description:'닫히지 않는 문 사이로 감염성 안개가 흘러옵니다.',hint:'차폐 장비를 사용해야 합니다.',preferred:'gear',punished:'rush'},{title:'제000번 표지판',description:'복도의 비상등이 하나씩 꺼집니다. 뒤에서 발소리가 따라옵니다.',hint:'멈추지 말고 빠르게 통과하세요.',preferred:'rush',punished:'careful'},{title:'낯선 사람의 손자국',description:'유리에 손자국이 남아 있습니다. 크기가 당신의 손과 같습니다.',hint:'기록을 남기며 신중하게 조사하세요.',preferred:'careful',punished:'rush'}]
};
export function currentFieldScene(run:Run):FieldScene{return fieldScenes[run.region][run.stage%3]}
export function canUseRunGear(s:V10):boolean{
 return !!s.run&&(s.run.gear.includes('scanner')||s.run.gear.includes('filter')||(s.run.gear.includes('flashlight')&&s.flashlight>=9)||s.power>=6);
}
export type RunChoice='careful'|'rush'|'gear'|'retreat';
export function runStep(s:V10,choice:RunChoice,rand=Math.random(),signalAccuracy=50):V10{if(!s.run)return s;if(choice==='gear'&&!canUseRunGear(s))return s;const n=copy(s) as V10;const run=n.run!;const region=regions.find(r=>r.id===run.region)!;
if(choice==='retreat'){returnUnusedRunSupplies(n,run,false);n.run=null;n.lastOutcome='물자를 포기하고 철수했다. 확보한 소량의 물자는 보존됐다.';n.credits+=run.loot*18;log(n,'긴급 철수',n.lastOutcome,'info');return n}
const scene=currentFieldScene(run);
const tactic=choice===scene.preferred?-20:choice===scene.punished?19:0;
const signalModifier=Math.round((50-Math.max(0,Math.min(100,signalAccuracy)))*.40);
const risk=signalModifier+region.danger+tactic+(run.stage*11)+(run.exposure*.28)+(n.infection*.25)+(100-n.facility)*.13-(run.gear.includes('filter')?12:0)-(run.gear.includes('scanner')?8:0)+(choice==='rush'?18:choice==='gear'?-20:-8);
const check=rand*100;const success=check>risk;const gain=success?(choice==='rush'?3:choice==='gear'?2:2)*region.reward:Math.max(0,region.reward-1);
run.loot+=gain+(success&&signalAccuracy>=85?region.reward:0);run.stage++;run.exposure+=choice==='rush'?20:choice==='gear'?7:12;run.integrity=cap(run.integrity-(success?6:22)-(choice==='rush'?8:0));n.stamina=cap(n.stamina-(choice==='rush'?13:7));n.infection=cap(n.infection+(success?2:9)+Math.round(region.danger/18)-(run.gear.includes('filter')?5:0));n.threat=cap(n.threat+(success?2:6));
if(choice==='gear'){if(run.gear.includes('flashlight')&&n.flashlight>=9)n.flashlight-=9;else if(n.power>=6)n.power-=6;else if(!run.gear.includes('scanner')&&!run.gear.includes('filter')){run.integrity=cap(run.integrity-8);run.event='작동 가능한 장비가 없어 방호 상태가 감소했다.'}}
if(!success){n.hp=cap(n.hp-5-Math.round(region.danger/20));n.mind=cap(n.mind-5);n.facility=cap(n.facility-2)}
run.log.push(`신호 보정 ${signalAccuracy}점 · ${signalModifier>0?'위험 증가':signalModifier<0?'위험 감소':'보정 없음'}`);
run.log.push(`${success?'작전 성공':'위험 발생'} · ${scene.title} · ${choice===scene.preferred?'상황에 적합한 대응':choice===scene.punished?'잘못된 접근으로 위험 증가':'기본 대응'}`);run.event=run.log[run.log.length-1];
if(run.stage>=3||run.integrity<=15||n.hp<=0){n.parts+=Math.max(0,Math.floor(run.loot/3));n.food+=Math.max(0,Math.floor(run.loot/4));n.credits+=run.loot*24;n.suppliesCollected+=run.loot;n.encounters++;let creature:AnimalId|null=null;const candidates=region.animals.filter(id=>!n.headquarters?.transferred.includes(id)&&!n.animals.some(a=>a.id===id&&a.alive)&&specs.find(x=>x.id===id)!.unlock<=n.day);if((success||(n.encounters===1&&region.id==='garden'))&&candidates.length&&(n.encounters===1||rand>.3))creature=candidates[(n.day+run.stage)%candidates.length];returnUnusedRunSupplies(n,run,!!creature);n.run=null;n.field=null;n.capture=null;if(creature){n.pending=creature;summary(n,'미확인 개체 발견',`${specs.find(a=>a.id===creature)?.name}이(가) 발견됐다. 구조 여부를 판단해야 한다.`,'mystery')}else summary(n,'탐사 종료',`물자 가치 ${run.loot}을 회수했다. 시설로 돌아왔으나 위협도와 감염도가 달라졌다.`,success?'good':'bad');if(n.infection>=60)n.eventRisk=cap(n.eventRisk+14)}else n.lastOutcome=run.event;
recalc(n);return n}
export function rescueChoice(s:V10,choice:'secure'|'treat'|'release',rand=Math.random()):V10 {if(!s.pending)return s;const n=copy(s) as V10;const id=n.pending!;const sp=specs.find(a=>a.id===id)!;n.pending=null;n.tacticalCaptured=false;if(s.pendingCage&&choice!=='secure')n.parts++;n.pendingCage=false;if(choice==='release'){recordCapture(n.run,id,'released');n.trust=cap(n.trust+3);applyCrewOpinion(n,'treatment','withhold');return summary(n,'방생 선택',`${sp.name}를 현장에 남겨두었다. 그 선택이 훗날 어떤 결과를 낳을지 알 수 없다.`,'info')}if(choice==='treat'){if(n.medicine<1)return s;n.medicine--;n.trust=cap(n.trust+6);n.clues++;earnDuringRun(n.run!,'clues',1);recordCapture(n.run,id,'treated');applyCrewOpinion(n,'treatment','treat');return summary(n,'현장 치료',`${sp.name}를 치료했다. 멀어지는 발자국 곁에 이상한 행동 기록이 남았다.`,'good')}
if(n.animals.filter(a=>a.alive).length>=n.rooms){recordCapture(n.run,id,'failed');if(s.pendingCage)n.parts++;return summary(n,'격리실 부족',`${sp.name}를 안전하게 옮길 공간이 없어 현장에 남겨두었다.`,'bad')}const chance=s.tacticalCaptured?100:captureChance(s);n.tacticalCaptured=false;if(rand*100<chance){const rooms=new Set(n.animals.filter(a=>a.alive).map(a=>a.room));let room=1;while(rooms.has(room))room++;const rescued=makeAnimal(id,room);if(id==='rabbit'&&s.lifeSaved===0&&s.tutorialStep<=4)rescued.bond=Math.max(rescued.bond,26);n.animals.push(rescued);noteRescue(n,id);recordCapture(n.run,id,'secured');if(id==='rabbit'&&n.lifeSaved===0&&s.tutorialStep<=4){n.scrap+=16;earnDuringRun(n.run!,'scrap',16);log(n,'시설 복구용 고철 확보','첫 구조 현장에서 고철 16개를 회수했습니다. 감시망과 합성실을 복구할 수 있습니다.','good');}n.lifeSaved++;n.trust=cap(n.trust+4);n.eventRisk=cap(n.eventRisk+4);return summary(n,'구조 완료',`${sp.name} 구조 성공 (시도 확률 ${chance}%). 격리실 ${room}번에 배정됐다.`,'good')}recordCapture(n.run,id,'failed');n.hp=cap(n.hp-7);n.threat=cap(n.threat+8);return summary(n,'구조 실패',`${sp.name}가 수색망을 벗어났다 (시도 확률 ${chance}%). 공격을 피하는 과정에서 부상을 입었다.`,'bad')}
export function incidentWeight(s:V10){return cap(7+s.threat*.24+s.infection*.19+(100-s.facility)*.20+(100-s.power)*.16+s.animals.filter(a=>a.alive).length*3+Math.min(15,s.encounters));}
// Event occurrence and event-type selection use INDEPENDENT random draws.
// Repeated incidents are suppressed, but high-risk states can still cause them.
export function determineIncident(s:V10,rand=Math.random(),typeRand=Math.random()):IncidentId|null{
 if(s.day<2||rand*100>=incidentWeight(s))return null;
 const alive=s.animals.filter(a=>a.alive);
 const scores:[IncidentId,number][]=[
  ['breach',10+s.threat*.23+alive.length*2],
  ['blackout',Math.min(25,8+(100-s.power)*.17)],
  ['spores',9+s.infection*.23],
  ['echo',8+alive.length*4+alive.reduce((v,a)=>v+a.memory,0)/55],
  ['signal',9+s.clues*2.6+s.knowledge/30],
  ['visitor',s.day>4?9+s.day*.42:3],
  ['predator',8+s.threat*.25],
  ['coolant',9+(100-s.facility)*.18],
  ['rations',8+alive.length*2.4],
  ['intrusion',s.day>6?10+s.clues*1.4:4]
 ];
 const last=s.lastEvent??'';
 const weighted=scores.map(([id,weight])=>[id,Math.max(.5,weight*(incidentDefs[id].title===last?.18:1))] as [IncidentId,number]);
 const sum=weighted.reduce((a,[,weight])=>a+weight,0);
 let pick=Math.max(0,Math.min(.999999,typeRand))*sum;
 for(const [id,weight] of weighted){pick-=weight;if(pick<0)return id;}
 return weighted[weighted.length-1][0];
}
export function resolveIncident(s:V10,option:number):V10{
 const id=s.pendingIncident;
 if(!id||!Number.isInteger(option)||option<0||option>2)return s;
 if((id==='breach'&&option===0&&s.power<22)||(id==='blackout'&&option===0&&s.parts<2)||(id==='spores'&&option===0&&s.filters<1)||(id==='predator'&&option===0&&s.power<14)||(id==='coolant'&&option===0&&s.parts<2)||(id==='rations'&&option===0&&s.food<2)||(id==='intrusion'&&option===0&&s.power<10))return s;
 const n=copy(s) as V10;n.pendingIncident=null;const def=incidentDefs[id];
 if(id==='breach'){
  if(option===0){n.power-=22;n.threat=cap(n.threat-25);n.facility=cap(n.facility+4)}
  else if(option===1){n.hp=cap(n.hp-16);n.stamina=cap(n.stamina-13);n.animals.forEach(a=>a.stress=cap(a.stress+7));n.threat=cap(n.threat-14)}
  else {n.hp=cap(n.hp-22);n.facility=cap(n.facility-20);n.threat=cap(n.threat+17);n.animals.forEach(a=>{a.stress=cap(a.stress+17);a.hp=cap(a.hp-7)})}
 }else if(id==='blackout'){
  if(option===0){n.parts-=2;n.power=cap(n.power+16);n.facility=cap(n.facility+18)}
  else if(option===1){n.power=cap(n.power+9);n.eve=cap(n.eve-9);n.facility=cap(n.facility-7)}
  else {n.hp=cap(n.hp-13);n.power=cap(n.power-12);n.eve=cap(n.eve-19);n.facility=cap(n.facility-17);n.knowledge+=7}
 }else if(id==='spores'){
  if(option===0){n.filters--;n.infection=cap(n.infection-19)}
  else if(option===1){n.power=cap(n.power-12);n.infection=cap(n.infection-9);n.facility=cap(n.facility-9)}
  else {n.hp=cap(n.hp-14);n.infection=cap(n.infection+22);n.animals.forEach(a=>{a.contamination=cap(a.contamination+19);a.sickness=cap((a.sickness??0)+9)})}
 }else if(id==='echo'){
  if(option===0){n.knowledge+=12;n.clues++;n.animals.forEach(a=>a.stress=cap(a.stress+6))}
  else if(option===1){n.trust=cap(n.trust+7);n.animals.forEach(a=>a.stress=cap(a.stress-14));n.power=cap(n.power-5)}
  else {n.mind=cap(n.mind-9);n.animals.forEach(a=>{a.stress=cap(a.stress+15);a.memory=cap(a.memory+3)})}
 }else if(id==='signal'||id==='visitor'){
  if(option===0){n.knowledge+=12;n.clues++;n.eve=cap(n.eve-8)}
  else if(option===1){n.hp=cap(n.hp-19);n.infection=cap(n.infection+12);n.knowledge+=20;n.clues+=2;n.threat=cap(n.threat+11)}
  else {n.threat=cap(n.threat+16);n.facility=cap(n.facility-10);n.trust=cap(n.trust-5)}
 }else if(id==='predator'){
  if(option===0){n.power-=14;n.threat=cap(n.threat-16)}
  else if(option===1){n.hp=cap(n.hp-18);n.stamina=cap(n.stamina-16);n.threat=cap(n.threat-9)}
  else {n.hp=cap(n.hp-24);n.facility=cap(n.facility-17);n.threat=cap(n.threat+18);n.animals.forEach(a=>a.stress=cap(a.stress+17))}
 }else if(id==='coolant'){
  if(option===0){n.parts-=2;n.facility=cap(n.facility+12);n.eve=cap(n.eve+5)}
  else if(option===1){n.hp=cap(n.hp-15);n.infection=cap(n.infection+10);n.facility=cap(n.facility-5)}
  else {n.eve=cap(n.eve-25);n.power=cap(n.power-15);n.facility=cap(n.facility-21);n.infection=cap(n.infection+10)}
 }else if(id==='rations'){
  if(option===0){n.food-=2;n.facility=cap(n.facility+3)}
  else if(option===1){n.stamina=cap(n.stamina-18);n.infection=cap(n.infection+9);n.food= Math.max(0,n.food-1)}
  else {n.animals.forEach(a=>{a.sickness=cap((a.sickness??0)+22);a.stress=cap(a.stress+12);a.hp=cap(a.hp-11)});n.threat=cap(n.threat+8)}
 }else if(id==='intrusion'){
  if(option===0){n.power-=10;n.eve=cap(n.eve-4);n.threat=cap(n.threat-10)}
  else if(option===1){n.clues+=2;n.knowledge+=10;n.eve=cap(n.eve-12);n.threat=cap(n.threat+7)}
  else {n.eve=cap(n.eve-24);n.facility=cap(n.facility-17);n.threat=cap(n.threat+20);n.mind=cap(n.mind-8)}
 }
 n.eventHistory=[...n.eventHistory,`${n.day}일차 ${def.title} · ${def.options[option]}`].slice(-30);
 n.lastEvent=def.title;
 return summary(n,def.title,`${def.options[option]} — ${option===2?'대응 실패. 시설과 생체 신호에 큰 피해가 발생했습니다.':'대응 결과가 기록되었습니다. 실제 증감 수치를 확인하십시오.'}`,option===2?'bad':option===0?'good':'mystery');
}
// Safe, read-only preview for event choice cards; uses the same actual outcome rules.
export function previewIncident(s:V10,option:number):{available:boolean;effects:{name:string;delta:number}[]}{
 const n=resolveIncident(s,option);
 if(n===s)return {available:false,effects:[]};
 const fields:[keyof V10,string][]=[['hp','생명'],['stamina','체력'],['mind','정신'],['eve','EVE 코어'],['power','전력'],['facility','시설'],['infection','감염'],['threat','위협'],['parts','부품'],['filters','필터'],['food','식량'],['knowledge','지식'],['clues','단서'],['trust','신뢰']];
 const effects=fields.map(([key,name])=>({name,delta:Number(n[key])-Number(s[key])})).filter(x=>Number.isFinite(x.delta)&&x.delta!==0);
 const oldAnimals=s.animals.filter(a=>a.alive),newAnimals=n.animals.filter(a=>a.alive);
 if(oldAnimals.length){const oldStress=oldAnimals.reduce((v,a)=>v+a.stress,0),newStress=newAnimals.reduce((v,a)=>v+a.stress,0);if(newStress!==oldStress)effects.push({name:'개체 스트레스 합계',delta:newStress-oldStress});const oldHP=oldAnimals.reduce((v,a)=>v+a.hp,0),newHP=newAnimals.reduce((v,a)=>v+a.hp,0);if(newHP!==oldHP)effects.push({name:'개체 생명 합계',delta:newHP-oldHP});}
 return {available:true,effects};
}
export type NightChoice='shield'|'rest'|'analyze'|'standby';
export function finishDay(s:V10,nightChoice:NightChoice):V10{const n=copy(s) as V10;if(n.phase!=='day'||n.pending||n.run||n.pendingIncident||n.crew?.pendingNightVote)return s;const charge={shield:22,rest:5,analyze:16,standby:0}[nightChoice];const used:NightChoice=n.power<charge?'standby':nightChoice;const cost={shield:22,rest:5,analyze:16,standby:0}[used];n.power=cap(n.power-cost-6);n.facility=cap(n.facility-(n.power<20?10:3)-(used==='standby'?6:0));if(n.facilities?.containment)n.facility=cap(n.facility+3);n.threat=cap(n.threat+(used==='shield'?(n.origin==='warden'?-18:-13):used==='rest'?4:used==='analyze'?7:19));n.eventRisk=cap(n.eventRisk+(used==='standby'?17:0));n.infection=cap(n.infection+(n.facility<50?7:2)+(used==='standby'?4:0));if(used==='rest'){n.hp=cap(n.hp+12);n.stamina=cap(n.stamina+38);n.mind=cap(n.mind+7)}if(used==='analyze'){n.knowledge+=11;n.clues++;n.eve=cap(n.eve-5)}if(used==='shield')n.facility=cap(n.facility+3);
n.animals.filter(a=>a.alive).forEach(a=>{const fed=n.food>0;if(fed){n.food--;a.stress=cap(a.stress+3);applyFamiliarRoutine(a)}else{a.stress=cap(a.stress+10)}if(n.infection>45)a.contamination=cap(a.contamination+5);if(a.contamination>65)a.hp=cap(a.hp-7);nightlyAnimalCondition(a,fed,n.facility,n.infection);if(n.facilities?.infirmary){a.sickness=cap((a.sickness??0)-8);a.contamination=cap(a.contamination-3);}if(a.hp<=0){a.alive=false;log(n,'격리 개체 사망',`${a.name}의 신호가 끊겼다.`,'bad')}});
nightlySecurity(n);
 crewNight(n);if(n.crew?.guardDay===n.day)n.threat=cap(n.threat-7);
 for(const a of n.animals){const old=s.animals.find(x=>x.id===a.id);if(old?.alive&&!a.alive)recordSpecimen(n,a.id,'격리 개체 사망','야간 바이탈 신호가 끊겼습니다. 개체의 사후 기록이 보존됩니다.','loss');}
 const escapedNow=n.security.escapedIds.filter(id=>!s.security.escapedIds.includes(id));for(const id of escapedNow)recordSpecimen(n,id,'격리 이탈','시설 내 생체 신호 이탈. 마지막 CCTV 기록을 확인하십시오.','security');
if(n.infection>75){n.hp=cap(n.hp-10);n.eve=cap(n.eve-3)}n.stamina=cap(n.stamina+14);applyCrewLossPenalties(n);n.day++;n.ap=n.start==='station'&&(!n.startBenefits||n.day<=2)?5:4;n.dayEvents=0;n.run=null;
if(n.day>=13&&n.knowledge>=70&&n.clues>=3&&!n.flags.humanTruth){n.flags.humanTruth=true;log(n,'ARK 열람 권한','기록을 검증한 결과 동물들에게 인간의 의식과 지식이 분산 보존됐음이 확인됐다.','mystery')}
if(n.day>=20&&n.flags.humanTruth&&n.knowledge>=145&&n.clues>=7&&!n.flags.mirror){n.flags.mirror=true;log(n,'제000번 개체','거울실의 바이탈 기록은 관리자의 신체가 인간이 아님을 가리킨다.','mystery')}
// The facility reports to an unseen authority. Clues unfold only when the player has progressed.
 const h=n.headquarters??(n.headquarters=emptyHeadquarters());
 if(!h.pendingScene&&h.firstReport&&h.revealStage===0&&n.day>=12&&n.clues>=3){h.revealStage=1;h.pendingScene='trace';log(n,'수신처 없는 송신','기억 공명 보고서의 수신처가 중앙 시설 외부에 있다는 흔적을 발견했다.','mystery')}
 else if(!h.pendingScene&&h.firstReport&&h.revealStage===1&&n.day>=20&&n.flags.humanTruth&&n.clues>=6){h.revealStage=2;h.pendingScene='evidence';log(n,'생체 반출 명세','이송 개체의 기억 보존이 외부 생체 실험과 연결되어 있다는 기록을 확보했다.','mystery')}
 else if(!h.pendingScene&&h.firstReport&&h.revealStage===2&&n.day>=26&&n.flags.mirror){h.revealStage=3;h.pendingScene='origin';log(n,'제000번 제조 기록','관리자의 바이탈 수치가 복제 개체 생산 기록과 일치한다.','mystery')}
 if(n.archive?.bonuses.power)n.power=cap(n.power+30);
 evaluateArchiveReveal(n);
 if((n.day>=26&&n.flags.mirror)||n.day>=38){n.phase='finale';if(h.revealStage<3){h.revealStage=3;h.pendingScene='origin';log(n,'최종 기밀 해독','보존소 본부의 지침과 개체 000의 제조 기록을 연결했다.','mystery')}}else {n.pendingIncident=determineIncident(n);n.phase='day'}
summary(n,'하루의 종료',`전력 ${n.power}%, 감염도 ${n.infection}%, 위협 ${n.threat}%. ${used==='shield'?'방어막을 점검했다.':used==='rest'?'충분한 휴식을 취했다.':used==='analyze'?'EVE가 기록을 재분석했다.':'경비를 가동하지 못했다. 외부 위협과 격리 위험이 상승했다.'}`,'info');recalc(n);return n}
export function registerFullResonance(before:V10,after:V10,id:AnimalId):V10 {
 const prev=before.animals.find(a=>a.id===id);const a=after.animals.find(a=>a.id===id);
 if(!a||a.memory<100||(prev?.memory??0)>=100)return after;
 const n=structuredClone(after) as V10;const h=n.headquarters??(n.headquarters=emptyHeadquarters());
 h.pendingAnimal=id;
 if(!h.firstReport){h.firstReport=true;log(n,'100% · 미확인 수신처','EVE는 완성된 공명 기록을 본부로 송신하려고 한다. 본부의 위치와 목적은 공개되지 않았다.','mystery')}
 else log(n,'100% · 이송 요청',`${a.name}의 공명 완료를 확인했습니다. 외부 수신처에서 개체 인계를 요구합니다.`,'mystery');
 noteResonance(n,id);
 n.lastOutcome=`${a.name}: 행동 공명 100%. 외부 이송 요청이 도착했습니다.`;
 return n;
}
export type HeadquartersChoice='transfer'|'copy'|'refuse';
export function resolveHeadquarters(s:V10,choice:HeadquartersChoice):V10 {
 const h=s.headquarters;if(!h?.pendingAnimal)return s;
 const n=copy(s) as V10;const q=n.headquarters;const id=q.pendingAnimal!;const a=n.animals.find(a=>a.id===id);q.pendingAnimal=null;
 if(choice==='transfer'){
  if(a){a.alive=false;(a as typeof a & {transferred?:boolean}).transferred=true;}
  if(!q.transferred.includes(id))q.transferred.push(id);
  recruitCrew(n,id);
  ensureArchive(n).pendingGifts++;recordSpecimen(n,id,'본부 인계','생체 개체가 외부 수신처로 이동했습니다. 도착 후 처리 내용은 현재 열람 불가.','decision');
  n.knowledge+=12;n.credits+=220;n.trust=cap(n.trust-8);evaluateArchiveReveal(n);
  return summary(n,'개체 이송 완료',`${a?.name||id}의 생체 기록과 개체를 외부 본부로 보냈다. 이송 후 CCTV 열람 권한이 차단됐다. 보존 CR +220, 지식 +12.`,'mystery');
 }
 if(choice==='copy'){
  if(!q.copies.includes(id))q.copies.push(id);
  n.power=cap(n.power-12);n.clues+=2;n.eve=cap(n.eve-5);recordSpecimen(n,id,'기록 복사·인계 보류','원본 개체는 격리실에 남겼습니다. 암호화 전송 내용을 추후 다시 검토할 수 있습니다.','decision');evaluateArchiveReveal(n);
  return summary(n,'송신 복제 기록',`${a?.name||id}은(는) 시설에 남겼다. 송신 요청을 보류하고 암호화된 이송 명세를 복사했다. 단서 +2, 전력 -12.`,'mystery');
 }
 if(!q.retained.includes(id))q.retained.push(id);
 n.trust=cap(n.trust+6);n.threat=cap(n.threat+8);recordSpecimen(n,id,'본부 인계 거부','개체의 생존을 우선해 송신 명령을 거부했습니다.','decision');evaluateArchiveReveal(n);
 return summary(n,'인계 거부',`${a?.name||id}의 이송 요청을 거부했다. 본부가 같은 명령을 반복하고 있다. 유대와 외부 위협이 함께 변했다.`,'mystery');
}
export {dailyWork,extract,finish};

// Non-destructive sample synthesis: donors remain alive, but the attempt strains them.
export function synthesize(s:V10,first:AnimalId,second:AnimalId,rand=Math.random()):V10 {
 const a=s.animals.find(x=>x.id===first&&x.alive),b=s.animals.find(x=>x.id===second&&x.alive);
 if(!s.facilities?.synthesis||!a||!b||first===second||['mutant','chimera'].includes(first)||['mutant','chimera'].includes(second)||s.animals.some(x=>x.id==='chimera'&&x.alive)||s.phase!=='day'||s.ap<2||s.power<18||s.parts<2||s.knowledge<25||s.animals.filter(x=>x.alive).length>=s.rooms)return s;
 const n=copy(s) as V10;const donorA=n.animals.find(x=>x.id===first)!,donorB=n.animals.find(x=>x.id===second)!;
 n.ap-=2;n.power-=18;n.parts-=2;n.knowledge-=25;
 const chance=Math.min(.84,Math.max(.22,.36+(a.bond+b.bond)/450-(a.stress+b.stress)/500+n.facility/450));
 const success=rand<chance;
 donorA.stress=cap(donorA.stress+(success?8:16));donorB.stress=cap(donorB.stress+(success?8:16));
 if(success){const species:AnimalId='chimera';
 if(n.animals.some(x=>x.id===species&&x.alive)){n.knowledge+=10;n.clues++;return summary(n,'합성 패턴 중복','기존 개체와 같은 복합 신호가 확인됐습니다. 중복 개체 대신 지식 단서를 기록했습니다.','mystery')}
 const rooms=new Set(n.animals.filter(x=>x.alive).map(x=>x.room));let room=1;while(rooms.has(room))room++;
 n.animals.push(makeAnimal(species,room));n.lifeSaved++;n.eventRisk=cap(n.eventRisk+9);
 return summary(n,'세포·기억 합성 성공',`${donorA.name}와 ${donorB.name}의 보존 샘플에서 ${specs.find(x=>x.id===species)?.name}가 태어났습니다. 두 공여 개체의 스트레스도 증가했습니다.`,'good');
 }
 n.facility=cap(n.facility-8);n.infection=cap(n.infection+6);n.eve=cap(n.eve-5);
 return summary(n,'세포·기억 합성 실패',`합성 배양이 불안정해 중단됐습니다. ${donorA.name}와 ${donorB.name}의 스트레스가 높아지고 시설 오염이 증가했습니다.`,'bad');
}


/** V31 grid exploration: no artificial 3-click completion. Every tile is an actual decision. */
export function moveField(s:V10,destination:number,pace:Pace='normal'):V10{
 if(!s.run||!s.field||s.capture||s.phase!=='day'||s.pending||s.stamina<2||!adjacentField(s.field.position,destination))return s;
 const tile=s.field.tiles[destination];if(tile==='wall')return s;
 const n=copy(s) as V10;const field=n.field!;const run=n.run!;
 const firstVisit=!field.visited.includes(destination);
 field.position=destination;field.steps++;
 field.pressure=Math.min(100,(field.pressure??0)+7+Math.round(regions.find(r=>r.id===run.region)!.danger/22)+(tile==='hazard'?12:0)+(pace==='fast'?8:0));
 if(firstVisit)field.visited.push(destination);
 const noisy=pace==='fast';
 field.noise=Math.max(0,field.noise+(noisy?18:pace==='normal'?7:-4));
 n.stamina=cap(n.stamina-(noisy?6:pace==='normal'?4:2));
 const exposed=pace==='fast'?9:pace==='normal'?5:2;
 run.exposure+=exposed;
 let observation='손전등으로 주변을 확인했습니다. 아직 새로운 흔적은 없습니다.';
 if(firstVisit){
  if(tile==='track'){
   field.clues++;n.knowledge+=2;earnDuringRun(run,'knowledge',2);field.noise=Math.max(0,field.noise-4);
   observation='발자국 간격을 기록했습니다. 동물의 이동 경로가 조금 더 분명해집니다. 지식 +2.';
  }else if(tile==='cache'){
   const gain=regions.find(r=>r.id===run.region)!.reward*2;
   field.loot+=gain;run.loot+=gain;n.scrap+=Math.max(1,Math.ceil(gain/2));earnDuringRun(run,'scrap',Math.max(1,Math.ceil(gain/2)));
   observation=`손상된 물자 상자를 확보했습니다. 회수 점수 +${gain} · 고철 +${Math.max(1,Math.ceil(gain/2))}.`;
  }else if(tile==='hazard'){
   const damage=Math.max(2,Math.round(regions.find(r=>r.id===run.region)!.danger/12)+(noisy?4:0)-(run.gear.includes('scanner')?3:0));
   run.integrity=cap(run.integrity-damage);
   n.infection=cap(n.infection+Math.max(0,damage-(run.gear.includes('filter')?5:0)-(n.crew?.decontamDay===n.day?6:0)));
   n.hp=cap(n.hp-Math.max(0,Math.floor(damage/3)));
   observation=`감염성 포자에 노출됐습니다. 방호 -${damage}, 감염 위험 증가.`;
  }else if(tile==='signal'){
   n.knowledge+=4;n.clues++;field.clues++;earnDuringRun(run,'knowledge',4);earnDuringRun(run,'clues',1);
   observation='폐쇄된 연구 신호를 복원했습니다. 지식 +4, 기록 단서 +1.';
  }else if(tile==='animal' && !field.encountered){
   field.encountered=true;
   const firstRabbit=n.lifeSaved===0&&!n.animals.some(a=>a.id==='rabbit'&&a.alive)&&run.region==='garden';
   const region=regions.find(r=>r.id===run.region)!;
   const candidates=region.animals.filter(id=>!n.headquarters?.transferred.includes(id)&&!n.animals.some(a=>a.id===id&&a.alive)&&specs.find(a=>a.id===id)!.unlock<=n.day);
   const species:AnimalId|undefined=firstRabbit?'rabbit':(candidates.length?candidates[(n.day+field.steps+field.clues)%candidates.length]:undefined);
   if(species)n.capture=createCapture(species,firstRabbit,(n.day*1709+field.steps*739+species.length*101)>>>0);
   if(n.capture?.hunt){const starterCharge=n.start==='observatory'&&(!n.startBenefits||(n.startBenefits.huntCharges??0)>0);if(starterCharge&&n.startBenefits)n.startBenefits.huntCharges--;const huntBonus=(starterCharge?2:0)+(n.archive?.bonuses.tracking?3:0);n.capture.hunt.maxActions+=huntBonus;n.capture.hunt.actions+=huntBonus;}
   if(species){
    if(run.gear.includes('cage')){run.cageUsed=true;n.capture!.trust=cap(n.capture!.trust+15);n.capture!.fear=cap(n.capture!.fear-12);n.capture!.maxTurns+=2;}
    n.capture!.fear=cap(n.capture!.fear+Math.floor(field.noise/6));
    n.capture!.trust=cap(n.capture!.trust+Math.min(20,field.clues*5)-Math.floor(field.noise/10));
    observation=`${specs.find(a=>a.id===species)?.name}의 생체 신호를 발견했습니다. 현재 포획 계획 단계로 전환합니다.`;
   }else observation='흔적만 남아 있습니다. 이 구역의 개체는 이미 구조되었거나 이송되었습니다. 추가 연구는 기록실에서 확인하십시오.';
  }
  if(tile!=='exit')field.tiles[destination]='empty';
 }
 if(field.noise>=65 && !field.encountered){n.threat=cap(n.threat+4);observation+=' 소음이 높아 주변 경계 신호가 증가했습니다.';}
 field.lastEvent=observation;
 n.lastOutcome=observation;
 if(tile==='exit')return leaveField(n,'정상 귀환');
 if((field.pressure??0)>=100&&!n.capture){n.hp=cap(n.hp-9);n.threat=cap(n.threat+9);return leaveField(n,'추적망 접근 · 강제 귀환 (HP -9)');}
 if(run.integrity<=0){n.hp=cap(n.hp-8);return leaveField(n,'방호 파괴 · 긴급 철수');}
 if(n.hp<=0||n.eve<=0){recalc(n);return n;}
 return n;
}
/** Any capture can be abandoned: prevents exhausted planning points from locking the player forever. */
export function abandonTacticalCapture(s:V10):V10{
 if(!s.capture||!s.field||!s.run)return s;
 const n=copy(s) as V10;
 n.capture=null;n.threat=cap(n.threat+5);n.field!.encountered=true;
 n.lastOutcome='안전 확보 실패: 개체 포획을 중단했습니다. 현장 지도로 복귀했으며 추가 물자 수색이나 철수가 가능합니다.';
 log(n,'전술 포획 중단',n.lastOutcome,'info');
 return n;
}
export function leaveField(s:V10,kind='조기 철수'):V10{
 if(!s.run||!s.field||s.capture)return s;
 const n=copy(s) as V10,run=n.run!,field=n.field!;
 const score=run.loot;
 const bonuses={parts:Math.floor(score/3),food:Math.floor(score/4),credits:score*22};
 n.parts+=bonuses.parts;n.food+=bonuses.food;n.credits+=bonuses.credits;
 n.lastFieldSummary={region:run.region,reason:kind,steps:field.steps,clues:field.clues,loot:score,rewards:{...freshFieldEarnings(),...run.earned,...bonuses},captures:[...(run.captures??[])]};
 n.suppliesCollected+=score;n.encounters++;
 returnUnusedRunSupplies(n,run,false);
 n.run=null;n.field=null;n.capture=null;
 n.lastOutcome=`${kind}: ${field.steps}칸 이동 · 흔적 ${field.clues}개 · 물자 ${score}점. 부품 +${Math.floor(score/3)}, 식량 +${Math.floor(score/4)}, CR +${score*22}.`;
 log(n,'격자 탐사 정산',n.lastOutcome,'info');return n;
}
/** v33 hidden-pursuit command; the UI never receives the living creature's actual cell. */
export function performVeiledHunt(s:V10,command:{type:HuntMode;cell?:number;clue?:number}):V10{
 if(!s.capture||!s.field||!s.run||!s.capture.hunt||s.phase!=='day')return s;
 const outcome=performHuntAction(s.capture.hunt,command);
 if(!outcome.changed)return s;
 const n=copy(s) as V10;n.capture!.hunt=outcome.state;n.lastOutcome=outcome.state.lastEvent;
 if(command.type==='reveal'&&command.clue!==undefined&&outcome.state.revealed[command.clue])noteSpeciesTrait(n,outcome.state.species,command.clue);
 if(['search','reveal','bait','sound','light','barrier','wait'].includes(command.type)){const cell=command.cell===undefined?'':` / 조사 칸 ${String.fromCharCode(65+(command.cell%8))}${Math.floor(command.cell/8)+1}`;noteFieldAction(n,outcome.state.species,outcome.state.lastEvent+cell);}
 if(outcome.won)noteCapturedHunt(n,outcome.state);
 if(outcome.won){
  const run=n.run!;
  // Catch only ends the hidden-hunt encounter, NOT the ongoing field expedition.
  // Loot conversion, supply refunds and expedition accounting happen once at leaveField().
  n.capture=null;
  n.tacticalCaptured=true;n.pending=outcome.state.species;
  if(run.gear.includes('cage')&&run.cageUsed)n.pendingCage=true;
  n.lastOutcome=`${specs.find(x=>x.id===outcome.state.species)?.name} 은신 추적 성공. 보호 이송 준비가 완료됐습니다.`;
  log(n,'발자국 역추적 · 포획 성공',n.lastOutcome,'good');
 }else if(outcome.lost){
  n.hp=cap(n.hp-outcome.penalty.hp);
  if(outcome.penalty.parts>0){
   if(n.parts>=outcome.penalty.parts)n.parts-=outcome.penalty.parts;
   else if(n.food>0)n.food--;
   else n.credits=Math.max(0,n.credits-40);
  }
  n.food=Math.max(0,n.food-outcome.penalty.food);
  n.infection=cap(n.infection+outcome.penalty.infection);
  n.threat=cap(n.threat+outcome.penalty.threat);
  n.field!.encountered=true;
  n.capture=null;
  n.lastOutcome=outcome.state.resultText+` 피해: 생명 -${outcome.penalty.hp}, 부품 -${outcome.penalty.parts}, 식량 -${outcome.penalty.food}, 감염 +${outcome.penalty.infection}.`;
  log(n,'은신 추적 실패',n.lastOutcome,'bad');
 }
 return n;
}
export function placeTacticalDevice(s:V10,position:number,kind:DeviceKind):V10{
 if(!s.capture)return s;
 const next=setDevice(s.capture,position,kind);if(next===s.capture)return s;
 const n=copy(s) as V10;n.capture=next;return n;
}
export function removeTacticalDevice(s:V10,position:number):V10{
 if(!s.capture)return s;
 const next=removeDevice(s.capture,position);if(next===s.capture)return s;
 const n=copy(s) as V10;n.capture=next;return n;
}
export function predictTacticalMove(s:V10,position:number):V10{
 if(!s.capture)return s;
 const next=markCapturePrediction(normalizeCapture(s.capture),position);
 if(next===s.capture)return s;
 const n=copy(s) as V10;n.capture=next;n.lastOutcome=next.lastEvent;return n;
}
export function authorizeTacticalSeal(s:V10):V10{
 if(!s.capture)return s;
 const next=armCaptureSeal(normalizeCapture(s.capture));
 const n=copy(s) as V10;n.capture=next;n.lastOutcome=next.lastEvent;return n;
}
export function executeTacticalTurn(s:V10):V10{
 if(!s.capture||!s.run||!s.field)return s;
 const n=copy(s) as V10;
 const c=advanceCapture(n.capture!);
 if(c===n.capture)return s;
 n.capture=c;n.lastOutcome=c.lastEvent;
 if(c.outcome==='caught'){
  const run=n.run!;
  // The tactical puzzle is the catch itself. Never roll a redundant 60% chance after success.
  // Tactical capture also keeps the field open; do not pay out field loot twice.
  n.capture=null;
  n.tacticalCaptured=true;n.pending=c.species;
  if(run.gear.includes('cage')&&run.cageUsed)n.pendingCage=true;
  n.lastOutcome=`${specs.find(a=>a.id===c.species)?.name} 포획 계획 성공. 현장 포획 성공률 100% 확정. 격리실로 이송하십시오.`;
  log(n,'현장 포획 성공',n.lastOutcome,'good');
 }else if(c.outcome==='escaped'){
  n.capture=null;n.threat=cap(n.threat+5);n.infection=cap(n.infection+2);
  n.lastOutcome='개체가 경계를 넘어 도망쳤습니다. 흔적과 회수 물자를 유지한 채 철수할 수 있습니다.';
  log(n,'현장 포획 실패',n.lastOutcome,'bad');
 }
 return n;
}

/** Durable facility construction. One resource payment, no AP charge: a tutorial unlock, not a chores tax. */
export function buildFacility(s:V10,id:FacilityId):V10{
 const r=facilityRecipes[id];if(!r||s.phase!=='day'||s.run||s.pending||s.pendingIncident||s.facilities?.[id]||s.scrap<r.scrap||s.parts<r.parts||s.power<r.power)return s;
 // The synthesis facility stays locked until two DISTINCT rescued species exist in history.
 if(id==='synthesis'&&new Set([...s.animals.map(a=>a.id),...(s.headquarters?.transferred??[])]).size<2)return s;
 const n=copy(s) as V10;n.scrap-=r.scrap;n.parts-=r.parts;n.power=cap(n.power-r.power);n.facilities={...emptyFacilities(),...n.facilities,[id]:true};
 if(id==='cctv'&&n.tutorialStep===6)n.tutorialStep=7;
 if(id==='synthesis'&&n.tutorialStep===7)n.tutorialStep=8;
 n.lastOutcome=`${r.name} 복구 완료. 고철 -${r.scrap}, 부품 -${r.parts}, 전력 -${r.power}. ${r.benefit}`;
 log(n,'시설 복구 · '+r.name,n.lastOutcome,'good');return n;
}
