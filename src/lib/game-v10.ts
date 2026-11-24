import {newFieldCombat,upgradeLevel,type UpgradeId} from './field-combat';
import {emptyOriginZero,ensureOriginZero,importOldOriginScans,originReadyForFinale,tickOriginDay,type OriginZeroState} from './origin-zero';
import {emptyNarrative,ensureNarrative,type NarrativeState} from './narrative';
import {neuralProfile} from './neural-state';
import {emptyCrew,ensureCrew,recruitCrew,queueCrewArrival,isCrewId,crewNight,crewDissectionShock,applyCrewOpinion,applyCrewLossPenalties,queueCrewTerminations,type CrewState,type CrewId} from './crew';
import {performHuntAction,type HuntMode} from './hidden-hunt';
import {emptyArchive,ensureArchive,noteSpeciesTrait,noteFieldAction,noteCapturedHunt,noteRescue,noteResonance,recordSpecimen,evaluateArchiveReveal,type ArchiveState} from './specimen-archive';
import {AnimalId,AnimalState,Origin,Start,State,createGame,copy,cap,log,recalc,makeAnimal,specs,dailyWork,repair,extract,finish,isMutant,recordMutation,nightlyAnimalCondition} from './sim';
import {applyFamiliarRoutine} from './care-interactions';
import {initialSecurity,nightlySecurity,type SecurityState} from './security';
import {resolveNightWatch} from './night-watch';
import {emptyVoice,ensureVoice,scheduleVoiceBreach,type VoiceState} from './voice-breach';
import {emptyHqOrders,ensureHqOrders,tickHqOrders,type HqOrderState} from './hq-orders';
import {revealField,createField,createCapture,adjacentField,fieldHasCover,advanceCapture,setDevice,removeDevice,markCapturePrediction,armCaptureSeal,normalizeCapture,type FieldState,type FieldChoice,type CaptureState,type DeviceKind,type Pace} from './tactical-field';
import {EXTENDED_INCIDENT_IDS,extendedIncidentDefs,extendedIncidentWeight,resolveExtendedIncident,type ExtendedIncidentId} from './incident-content';
import {allocateFacilityPower,normalizeFacilityPowerOrder,previewFacilityPower,type FacilityPowerState} from './facility-power';

export type Gear='flashlight'|'filter'|'scanner'|'medkit'|'cage';
export type RegionId='garden'|'conservatory'|'rail'|'archive'|'vault'|'tunnels';
export type CoreIncidentId='echo'|'breach'|'blackout'|'spores'|'signal'|'visitor'|'predator'|'coolant'|'rations'|'intrusion'|'garden'|'keepsake'|'quiet';
export type IncidentId=CoreIncidentId|ExtendedIncidentId;
export type Incident={id:IncidentId;title:string;desc:string;cause:string;options:[string,string,string];};
export type FieldResource='scrap'|'knowledge'|'clues';
export type FieldCaptureRecord={id:AnimalId;result:'secured'|'treated'|'released'|'failed'};
export type FieldSettlement={region:RegionId;reason:string;steps:number;clues:number;loot:number;rewards:Record<FieldResource|'parts'|'food'|'credits',number>;captures:FieldCaptureRecord[]};
export type Run={evePulseUsed?:boolean;supportUsed?:boolean;netLevel?:number;suitLevel?:number;scannerLevel?:number;region:RegionId;gear:Gear[];stage:number;integrity:number;exposure:number;loot:number;discovery:AnimalId|null;event:string;log:string[];medkitUsed?:boolean;cageUsed?:boolean;earned?:Record<FieldResource,number>;captures?:FieldCaptureRecord[];firstTutorial?:boolean;companion?:string|null;companions?:string[]};
const freshFieldEarnings=():Record<FieldResource,number>=>({scrap:0,knowledge:0,clues:0});
function earnDuringRun(run:Run|null|undefined,key:FieldResource,amount:number){if(!run||amount<=0)return;run.earned??=freshFieldEarnings();run.earned[key]+=amount;}
function recordCapture(run:Run|undefined|null,id:AnimalId,result:FieldCaptureRecord['result']){if(!run)return;run.captures??=[];run.captures.push({id,result});}
export type HeadquartersState={firstReport:boolean;pendingAnimal:AnimalId|null;transferred:AnimalId[];retained:AnimalId[];copies:AnimalId[];revealStage:number;pendingScene:'trace'|'evidence'|'origin'|null;};
export const emptyHeadquarters=():HeadquartersState=>({firstReport:false,pendingAnimal:null,transferred:[],retained:[],copies:[],revealStage:0,pendingScene:null});
export type FacilityId='cctv'|'synthesis'|'infirmary'|'containment';
export const emptyFacilities=():Record<FacilityId,boolean>=>({cctv:false,synthesis:false,infirmary:false,containment:false});
export const facilityRecipes:Record<FacilityId,{name:string;scrap:number;parts:number;power:number;description:string;benefit:string}>={
 cctv:{name:'CCTV 감시망',scrap:6,parts:1,power:6,description:'폐카메라와 배선을 수리하여 격리동·외곽 감시 복구',benefit:'탈출 경로 추적 및 위험 사건 대응 가능'},
 synthesis:{name:'병리·검시실',scrap:9,parts:2,power:10,description:'구형 배양 장치를 병리 검체 분석실로 개조',benefit:'생체 검체 검사 및 사후 검시 · 성공/실패 사건 해금'},
 infirmary:{name:'진료·검사실',scrap:7,parts:2,power:8,description:'폐진료대·환기·수질 측정 설비 정비',benefit:'밤마다 질병 수치 완화 · 치료 회복량 보조'},
 containment:{name:'격리 보강 설비',scrap:7,parts:2,power:8,description:'감금문과 생체 안정 패널 복구',benefit:'야간 시설 손상 감소 · 변이체 탈출 위험 감소'}
};
export type PathologyMethod='noninvasive'|'clinical'|'postmortem';
export type PathologyRecord={id:AnimalId;day:number;method:PathologyMethod;success:boolean;result:string};
export type PathologyEvent={id:AnimalId;method:PathologyMethod;success:boolean;day:number;detail:string};
export type NightCircuit={day:number;order:number[];faults:number;completed:boolean};
export type V10=State & {fuel:number;baseLevels?:Partial<Record<UpgradeId,number>>;facilityPowerPriority?:FacilityId[];facilityPowerState?:FacilityPowerState;lastExpeditionDay?:number;nightCircuit?:NightCircuit;pathologyRecords?:PathologyRecord[];pathologyPending?:PathologyEvent|null;tutorialStep:number;scrap:number;facilities:Record<FacilityId,boolean>;mutantSerum:number;infection:number;electricCells:number;flashlight:number;filters:number;threat:number;facility:number;clues:number;daysRested:number;encounters:number;dayEvents:number;pendingIncident:IncidentId|null;lastOutcome:string;run:Run|null;lastFieldSummary?:FieldSettlement|null;field?:FieldState|null;capture?:CaptureState|null;tacticalCaptured?:boolean;pendingCage?:boolean;suppliesCollected:number;eventHistory:string[];security:SecurityState;headquarters:HeadquartersState;archive:ArchiveState;crew?:CrewState;voice?:VoiceState;hqOrders?:HqOrderState;onboardingSeen?:string[];synthesisTutorialSeen?:boolean;tutorialArchiveReviewPending?:boolean;nextFieldFatigued?:boolean;narrative?:NarrativeState;originZero?:OriginZeroState;};
export const regions:{id:RegionId;name:string;desc:string;art:string;danger:number;reward:number;ap:number;power:number;unlocked:number;animals:AnimalId[]}[]=[
{id:'garden',name:'중앙 외곽',desc:'폐쇄된 매표소와 정원. 작은 개체의 흔적.',art:'gate',danger:16,reward:1,ap:1,power:9,unlocked:1,animals:['rabbit','fox']},
{id:'conservatory',name:'온실 폐쇄동',desc:'축축한 식물과 감염 포자가 자라는 구역.',art:'sanctuary',danger:31,reward:2,ap:1,power:15,unlocked:2,animals:['deer','otter','crow']},
{id:'rail',name:'폐역 승강장',desc:'열차 아래에서 생체 신호가 잡힌다.',art:'wasteland',danger:46,reward:3,ap:1,power:19,unlocked:3,animals:['fox','wolf','lynx']},
{id:'archive',name:'관측소 기록실',desc:'위성 장비와 알아볼 수 없는 기록.',art:'laboratory',danger:55,reward:3,ap:1,power:23,unlocked:5,animals:['owl','moth','deer']},
{id:'vault',name:'B-3 밀폐 연구동',desc:'격리 실패 기록과 봉인된 생물 캡슐.',art:'laboratory',danger:72,reward:5,ap:1,power:30,unlocked:9,animals:['axolotl','mutant']},
{id:'tunnels',name:'제0구역 통로',desc:'EVE의 기록에서 존재하지 않는 장소.',art:'wasteland',danger:86,reward:6,ap:1,power:37,unlocked:14,animals:['specter','mutant','chimera']}
];
export const gearData:{id:Gear;name:string;desc:string}[]=[{id:'flashlight',name:'수동 손전등',desc:'정전 수동 탐사 · 조사 시야 반경 2칸 · 수동 출동 전지 25%'},{id:'filter',name:'바이오필터',desc:'출동 시 필터 1개 · 사고 위험 계산 -12 · 탐사 감염 증가 -5'},{id:'scanner',name:'EVE 스캐너',desc:'출동 전력 추가 8 · 조사 시야 반경 3칸 · 포자 노출 피해 -3'},{id:'medkit',name:'응급 키트',desc:'출동 시 의약품 1개 예약 · 탐사 중 원하는 시점에 정신력 +20 · 미사용 귀환 시 반환'}];
const coreIncidentDefs:Record<CoreIncidentId,Incident>={
garden:{id:'garden',title:'금 간 바닥의 새싹',desc:'온실 배수구에서 작은 싹이 올라왔습니다. EVE는 잡초로 분류했지만, 오늘은 잠시 판단을 유보합니다.',cause:'시설이 버틴 밤 뒤에 찾아온 작은 회복',options:['전력 6을 들여 재배등을 켠다 · 식량 +3','씨앗과 토양을 조사한다 · 지식 +10','작은 화단으로 남긴다 · 정신력 +7']},
keepsake:{id:'keepsake',title:'우리 앞에 놓인 작은 선물',desc:'보호 중인 동물이 깨끗한 금속 조각을 문 앞에 놓았습니다. EVE는 우연한 행동이라고 말하다가 기록 버튼을 누릅니다.',cause:'살아 있는 보호 개체와 쌓아온 일상',options:['식량 1로 응답한다 · 유대 +8, 스트레스 -8','부품으로 회수한다 · 부품 +2, 유대 -3','손대지 않고 지켜본다 · 단서 +1, 정신력 +4']},
quiet:{id:'quiet',title:'오늘은 아무도 울지 않았다',desc:'교대 시간, 직원이 빈 의자를 하나 더 놓습니다. 누구의 자리인지 묻자 본인도 모르겠다고 합니다. 조용한 시간도 필요합니다.',cause:'파견 직원의 신경 기억과 공동생활',options:['함께 식사한다 · 식량 1, 직원 정신력 +8','기억을 기록한다 · 지식 +12, 직원 정신력 -4','함께 쉬어 간다 · 관리자 정신력 +6, 직원 정신력 +3']},
echo:{id:'echo',title:'격리실에서 들린 노래',desc:'평소 울음소리만 내던 개체가 익숙한 박자로 울고 있다. EVE는 우연이라고 말한다.',cause:'개체와의 유대 또는 관찰 기록이 누적됨',options:['소리를 녹음하고 행동을 관찰한다','개체를 진정시키고 휴식시킨다','오늘은 아무것도 하지 않는다']},
breach:{id:'breach',title:'격리문 이상 진동',desc:'동물원 바깥에서 무언가 출입문을 두드린다. 안쪽의 동물들도 몸을 숨긴다.',cause:'외부 위협도 상승·격리 개체 증가',options:['전력 22를 사용해 격리문 봉쇄','동물부터 피신시킨다 (정신력 위험)','함정을 감시하고 기록한다']},
blackout:{id:'blackout',title:'전력망 이상',desc:'격리동의 불빛이 하나씩 꺼진다. 배터리 전압이 급격히 떨어졌다.',cause:'전력 부족·장비 가동 누적',options:['부품 2개로 긴급 수리한다','비필수 장비를 끄고 전력을 아낀다','EVE에게 과부하 분석을 요청한다']},
spores:{id:'spores',title:'붉은 포자 확산',desc:'외부에서 묻어 온 포자가 환기구에 침투했다. 방 안의 개체들이 기침을 시작한다.',cause:'높은 감염도·오염 지역 탐사',options:['필터를 소모해 환기구 정화','격리동을 봉쇄해 확산을 늦춘다','자원을 아끼고 경과를 관찰한다']},
signal:{id:'signal',title:'누군가의 비상 신호',desc:'정적 사이로 사람 목소리 같은 신호가 들린다. EVE의 음성 출력이 잠시 끊긴다.',cause:'기록 복원 또는 고위험 구역 발견',options:['기록을 저장해 주파수를 분석한다','위험을 감수하고 위치를 추적한다','응답하지 않고 신호를 차단한다']},
visitor:{id:'visitor',title:'정체불명의 방문자',desc:'당직 직원이 보고했습니다. 외곽 카메라에 명부에 없는 사람의 그림자가 찍혔습니다. 직원의 신원을 확인해야 합니다.',cause:'실제로 배치된 직원 1명 이상 · 외부 위협 누적',options:['장비로 그림자를 추적한다','격리문을 잠그고 상황을 기다린다','EVE의 영상 기록을 대조한다']},
predator:{id:'predator',title:'격리동의 발톱 자국',desc:'외벽을 긁는 소리. 울타리 밖의 포식자가 보호 개체들의 울음에 반응하고 있습니다.',cause:'외부 위협도·야간 소음 증가',options:['전력 14로 외곽 경보망 가동','직접 밖에서 소리를 유인한다','울타리를 그대로 두고 밤을 지새운다']},
coolant:{id:'coolant',title:'냉각수 붉은 누출',desc:'병리 장비의 냉각액이 지하 환기구로 흘러갑니다. EVE의 음성이 흔들립니다.',cause:'시설 노후화·코어 과열',options:['부품 2개로 긴급 배관 교체','직접 밸브를 잠그고 제독한다','손상된 냉각 회로를 방치한다']},
rations:{id:'rations',title:'보급고의 곰팡이',desc:'수상한 냄새가 사료 배급 라인에서 퍼집니다. 이미 몇몇 개체가 먹이를 거부합니다.',cause:'보급품 노후화·높은 시설 오염',options:['식량 2개를 폐기하고 배급 라인 세척','수작업으로 오염된 사료를 가려낸다','부족한 물자를 아끼기 위해 그대로 급여']},
intrusion:{id:'intrusion',title:'관리자 음성을 흉내 내는 신호',desc:'CCTV 스피커에서 담당자의 목소리와 같은 명령이 들립니다. 출처는 시설 내부가 아닙니다.',cause:'지식·기밀 기록 누적 또는 EVE 불안정',options:['전력 10을 사용해 전파 차단','신호를 녹음하고 발신자를 역추적','인증 절차 없이 연결을 허용']}
};
export const incidentDefs:Record<IncidentId,Incident>={...coreIncidentDefs,...extendedIncidentDefs};
/** DAY-based recruitment is intentionally removed. A healthy, 100%-resonant
 * rabbit/fox/wolf/deer must first be physically transferred to HQ.
 * Even with multiple pending transfers, only ONE returned human arrives per day.
 */
export function scheduleStaffByDay(s:V10):CrewId[]{
 const crew=ensureCrew(s);
 if(crew.lastArrivalDay>=s.day)return [];
 crew.arrivalQueue=crew.arrivalQueue.filter(order=>!crew.members.some(m=>m.id===order.id)&&!crew.retired.includes(order.id));
 const index=crew.arrivalQueue.findIndex(order=>order.transferDay<s.day&&s.headquarters?.transferred.includes(order.id));
 if(index<0)return [];
 const [order]=crew.arrivalQueue.splice(index,1);
 if(!recruitCrew(s,order.id,order.sourceSpecimenId))return [];
 crew.lastArrivalDay=s.day;
 return [order.id];
}
export const HQ_STAFF_HEALTH={hp:70,stress:65,contamination:30,sickness:25} as const;
/** Explicit reasons are shared between gameplay validation and the HQ interface. */
export function staffTransferIssues(s:V10,a:AnimalState):string[]{
 const issues:string[]=[];
 if(!a.alive)issues.push('생존 개체가 아님');
 if(a.memory<100)issues.push(`공명 ${a.memory}/100`);
 if(a.hp<HQ_STAFF_HEALTH.hp)issues.push(`건강 ${a.hp}/${HQ_STAFF_HEALTH.hp} 미달`);
 if(a.stress>HQ_STAFF_HEALTH.stress)issues.push(`스트레스 ${a.stress}/${HQ_STAFF_HEALTH.stress} 초과`);
 if(a.contamination>HQ_STAFF_HEALTH.contamination)issues.push(`오염 ${a.contamination}/${HQ_STAFF_HEALTH.contamination} 초과`);
 if((a.sickness??0)>HQ_STAFF_HEALTH.sickness)issues.push(`질병 ${a.sickness}/${HQ_STAFF_HEALTH.sickness} 초과`);
 if(isMutant(a))issues.push('변이 개체 · 인력 복원 불가');
 if(s.security?.escapedIds?.includes(a.id))issues.push('개체 탈출 · 격리 필요');
 return issues;
}
export function requestHeadquartersTransfer(s:V10,id:AnimalId):V10{
 const a=s.animals.find(a=>a.id===id&&a.alive);
 if(!a||a.memory<100||s.headquarters.pendingAnimal||s.headquarters.transferred.includes(id)||s.phase!=='day'||s.run||s.pendingIncident)return s;
 const n=copy(s) as V10;
 n.headquarters.pendingAnimal=id;
 return summary(n,'본부 생체 이송 재요청',`${a.name} 공명 기록을 불러왔습니다. 인계 전에 바이탈과 건강 조건을 확인하십시오.`,'mystery');
}
export function beginGame(origin:Origin,start:Start):V10{const s=createGame(origin,start) as V10;Object.assign(s,{fuel:start==='generator'?5:3,infection:3,scrap:0,facilities:emptyFacilities(),facilityPowerPriority:normalizeFacilityPowerOrder(undefined),mutantSerum:0,electricCells:2,flashlight:86,filters:2,threat:17,facility:86,clues:0,daysRested:0,encounters:0,dayEvents:0,pendingIncident:null,lastOutcome:'신호 연결 완료. 중앙 관리 구역이 열렸다.',run:null,lastFieldSummary:null,field:null,capture:null,tacticalCaptured:false,pendingCage:false,suppliesCollected:0,eventHistory:[],security:initialSecurity(),headquarters:emptyHeadquarters(),archive:emptyArchive(),crew:emptyCrew(),voice:emptyVoice(),hqOrders:emptyHqOrders(),pathologyRecords:[],pathologyPending:null,tutorialStep:1,onboardingSeen:[],synthesisTutorialSeen:false,tutorialArchiveReviewPending:false,nextFieldFatigued:false,narrative:emptyNarrative(),originZero:emptyOriginZero()});s.credits=925;s.power=start==='generator'?85:65;s.shield=100;if(start==='medical')s.filters++;if(start==='generator'||start==='depot')s.electricCells++;return s}
export function loadGame(raw:unknown):V10|null{if(!raw||typeof raw!=='object')return null;const s=raw as V10;s.fuel=Math.max(0,s.fuel??3);if(!Array.isArray(s.animals)||!Number.isFinite(s.day))return null; s.animals=s.animals.filter(a=>!['dino'].includes(String(a.id))); if(s.tutorialStep>=4&&s.tutorialStep<=6&&(s.tutorialStep<=5||s.headquarters?.pendingAnimal==='rabbit'||s.tutorialArchiveReviewPending)&&!s.headquarters?.transferred?.includes('rabbit')){
  // Migration for v51 saves: recover the first lesson even if old mutation thresholds fired.
  const first=s.animals.find(a=>a.id==='rabbit'&&a.alive);
  if(first){first.tutorialProtected=true;first.mutated=false;first.awakened=false;first.stress=Math.min(first.stress,18);first.contamination=Math.min(first.contamination,4);first.hp=Math.max(first.hp,90);first.sickness=Math.min(first.sickness??0,10);first.bond=Math.max(first.bond,34);if(s.security?.escapedIds)s.security.escapedIds=s.security.escapedIds.filter(x=>x!=='rabbit');}
 }  if(['dino'].includes(String(s.pending)))s.pending=null; if(s.run&&['dino'].includes(String(s.run.discovery)))s.run.discovery=null; // Existing saves retain facility keys; the old synthesis facility is now pathology.
 const wasComplete=(s.tutorialStep??7)>=7 && s.scrap===undefined;
 const facilities={...emptyFacilities(),...(wasComplete?{cctv:true,synthesis:true}:{}),...s.facilities};
 s.animals.forEach(a=>{a.hunger??=22;a.sickness??=0;});
 const restored=Object.assign(s,{facilityPowerPriority:normalizeFacilityPowerOrder(s.facilityPowerPriority),facilityPowerState:s.facilityPowerState,lastExpeditionDay:s.lastExpeditionDay??(s.run?s.day:undefined),pathologyRecords:s.pathologyRecords??[],pathologyPending:s.pathologyPending??null,onboardingSeen:s.onboardingSeen??[],synthesisTutorialSeen:s.synthesisTutorialSeen??false,tutorialArchiveReviewPending:s.tutorialArchiveReviewPending??false,nextFieldFatigued:s.nextFieldFatigued??false,narrative:{...emptyNarrative(),...s.narrative},tutorialStep:wasComplete?9:(s.tutorialStep??9),scrap:s.scrap??((s.tutorialStep??9)>=4&&(s.tutorialStep??9)<=6?16:0),facilities,mutantSerum:s.mutantSerum??0,headquarters:{...emptyHeadquarters(),...s.headquarters},crew:{...emptyCrew(),...s.crew},infection:s.infection??Math.round((s.radiation||0)/2),electricCells:s.electricCells??2,flashlight:s.flashlight??85,filters:s.filters??2,threat:s.threat??17,facility:s.facility??85,clues:s.clues??0,daysRested:s.daysRested??0,encounters:s.encounters??0,dayEvents:s.dayEvents??0,pendingIncident:s.pendingIncident??null,lastOutcome:s.lastOutcome??'',run:s.run?{...s.run,companions:s.run.companions??(s.run.companion?[s.run.companion]:[]),earned:s.run.earned??freshFieldEarnings(),captures:s.run.captures??[],firstTutorial:s.run.firstTutorial??((s.tutorialStep??9)<=3)}:null,lastFieldSummary:s.lastFieldSummary??null,field:s.run?(s.field??createField(s.day,s.run.region)):null,capture:s.capture?normalizeCapture(s.capture):null,tacticalCaptured:s.tacticalCaptured??false,pendingCage:s.pendingCage??false,suppliesCollected:s.suppliesCollected??0,eventHistory:s.eventHistory??[],security:s.security??initialSecurity()});// Old saves retain living staff already recruited, but calendar staff never spawn again.
 // V67: after the first rabbit leaves, no observation/research tutorial may keep pointing at an empty cage.
 if(restored.headquarters.transferred.includes('rabbit')){
  restored.tutorialArchiveReviewPending=false;
  if(restored.headquarters.pendingAnimal==='rabbit')restored.headquarters.pendingAnimal=null;
  if(restored.tutorialStep<6)restored.tutorialStep=6;
  if(restored.tutorialStep===6&&restored.facilities.cctv)restored.tutorialStep=7;
  if(restored.tutorialStep===7&&restored.facilities.cctv&&restored.facilities.synthesis)restored.tutorialStep=8;
  for(const a of restored.animals)if(a.id==='rabbit')a.tutorialProtected=false;
 }
 // Transfer records missing their return capsule are queued for the following night.
 const crewState=ensureCrew(restored);
 if(restored.run){const participants=restored.run.companions??(restored.run.companion?[restored.run.companion]:[]);crewState.sortieWorked=[...new Set([...(crewState.sortieWorked??[]),...participants])];}
 if(restored.tutorialArchiveReviewPending&&restored.headquarters.pendingAnimal==='rabbit'){
  const rabbit=restored.animals.find(a=>a.id==='rabbit'&&a.alive);
  if(rabbit){rabbit.hp=Math.max(90,rabbit.hp);rabbit.stress=Math.min(18,rabbit.stress);rabbit.contamination=Math.min(10,rabbit.contamination);rabbit.sickness=Math.min(10,rabbit.sickness??0);rabbit.tutorialProtected=true;rabbit.mutated=false;rabbit.awakened=false;restored.security.escapedIds=restored.security.escapedIds.filter(id=>id!=='rabbit');}
 }
 for(const id of restored.headquarters.transferred){
  if(!(['rabbit','fox','wolf','deer'] as string[]).includes(id))continue;
  if(crewState.members.some(m=>m.id===id)||crewState.retired.includes(id as CrewId)||crewState.arrivalQueue.some(a=>a.id===id))continue;
  crewState.arrivalQueue.push({id:id as CrewId,transferDay:restored.day,sourceSpecimenId:restored.animals.find(a=>a.id===id)?.specimenId});
 }
 if(restored.pendingIncident==='visitor'&&!crewState.members.some(m=>m.mind>0))restored.pendingIncident=null;
 if((restored.pendingIncident==='echo'||restored.pendingIncident==='rations')&&!restored.animals.some(a=>a.alive))restored.pendingIncident=null;
 restored.mind=cap(restored.mind??restored.hp??80);restored.hp=100; if(!restored.run)restored.stamina=restored.nextFieldFatigued?50:100;ensureArchive(restored);ensureOriginZero(restored);importOldOriginScans(restored);ensureNarrative(restored);ensureCrew(restored);ensureVoice(restored);ensureHqOrders(restored);queueCrewTerminations(restored);
 // Older interrupted v51 lessons may contain 100% memory without the HQ offer.
 const stranded=restored.animals.find(a=>a.id==='rabbit'&&a.alive&&a.memory>=100);
 if(stranded&&restored.tutorialStep===6&&!restored.headquarters.transferred.includes('rabbit')&&!restored.headquarters.pendingAnimal){
  restored.headquarters.pendingAnimal='rabbit';restored.headquarters.firstReport=true;restored.tutorialArchiveReviewPending=true;
 }if(restored.capture?.hunt)restored.capture.hunt.revealed.forEach((known,index)=>{if(known)noteSpeciesTrait(restored,restored.capture!.hunt!.species,index)});return restored}
export function summary(s:V10,title:string,msg:string,kind:'info'|'good'|'bad'|'mystery'='info'){s.lastOutcome=msg;log(s,title,msg,kind);return s}
export function doBase(s:V10,type:'rest'|'recharge'|'handsearch'|'eve'|'feed'|'repair'|'crank'|'decontam'|'batteryCharge'):V10{const n=copy(s) as V10;if(n.phase!=='day'||n.ap<1)return s;
if(type==='rest'){n.ap--;n.mind=cap(n.mind+25+(n.crew?.healingDay===n.day?6:0));n.daysRested++;n.threat=cap(n.threat+3);return summary(n,'짧은 휴식','잠시 휴식하며 정신력을 회복했다. 그 사이 바깥의 움직임은 계속된다.','good')}
if(type==='decontam'){if(n.filters<1)return s;n.ap--;n.filters--;n.infection=cap(n.infection-26);n.mind=cap(n.mind+4);n.threat=cap(n.threat-3);return summary(n,'제독실 가동','바이오필터를 사용해 감염성 포자와 오염 흔적을 제거했다.','good')}
if(type==='crank'){if(n.mind<=14)return s;n.ap--;n.mind=cap(n.mind-14);n.power=cap(n.power+17);n.flashlight=cap(n.flashlight+9);return summary(n,'수동 발전기 가동','부품 없이 발전기를 직접 돌렸다. 정신력 14를 소모해 시설 전력 17을 회복했다.','good')}
if(type==='batteryCharge'){if(n.electricCells<1||n.power<12||n.flashlight>=100)return s;n.ap--;n.electricCells--;n.power=cap(n.power-12);n.flashlight=cap(n.flashlight+38);return summary(n,'휴대 전지 충전','예비 전지 1개와 시설 전력 12%를 사용해 손전등을 38% 충전했다. 충전은 하루 행동력 1을 소모한다.','good')}
if(type==='recharge'){if(n.parts<1)return s;n.ap--;n.parts--;n.power=cap(n.power+(n.origin==='engineer'?37:28));n.flashlight=cap(n.flashlight+12);return summary(n,'비상 발전기 가동','부품을 소모해 발전기를 재가동했다. 격리실과 EVE 전력 공급이 회복된다.','good')}
if(type==='handsearch'){if(n.flashlight<16)return s;n.ap--;n.flashlight-=16;const foodFound=Math.random()<.55,partsFound=Math.random()<.55,cellFound=Math.random()<.22;if(foodFound)n.food++;if(partsFound)n.parts++;if(cellFound)n.electricCells++;n.credits+=25;n.infection=cap(n.infection+Math.round(Math.random()*7));n.threat=cap(n.threat+4);return summary(n,'수동 물자 수색',`손전등 -16 · ${foodFound?'식량 +1 · ':''}${partsFound?'부품 +1 · ':''}${cellFound?'예비 전지 +1 · ':''}보존 CR +25. 감염도와 외부 위협이 올랐다.`,'info')}
if(type==='eve'){if(n.power<8||n.eve<10)return s;n.ap--;n.power-=8;n.eve=cap(n.eve-3);n.knowledge+=6;n.clues++;return summary(n,'EVE 분석','EVE가 기존 기록의 모순을 한 줄 해독했다. 새로운 질문을 열 수 있다.','mystery')}
if(type==='feed'){if(n.food<1||!n.animals.some(a=>a.alive))return s;n.ap--;const alive=n.animals.filter(a=>a.alive);const count=Math.min(n.food,alive.length);n.food-=count;alive.slice(0,count).forEach(a=>{a.hp=cap(a.hp+9);a.stress=cap(a.stress-10);a.bond=cap(a.bond+5)});applyCrewOpinion(n,'treatment','treat');return summary(n,'전체 급식',`${count}마리에게 먹이를 주었다. 격리실 안의 소리가 조금 잦아들었다.`,'good')}
if(n.parts<1)return s;n.ap--;n.parts--;n.facility=cap(n.facility+23);n.eve=cap(n.eve+6);return summary(n,'시설 점검','환기와 격리 장비를 정비했다. 다음 사고의 피해 위험이 감소한다.','good')}
export function purchase(s:V10,kind:'food'|'med'|'parts'|'filter'|'battery'|'fuel'|'room'|'cage'|'serum'):V10{const n=copy(s) as V10;const price={food:90,med:145,parts:115,filter:170,battery:120,fuel:110,room:480,cage:260,serum:360}[kind];if(n.credits<price)return s;n.credits-=price;if(kind==='food')n.food+=3;if(kind==='med')n.medicine+=2;if(kind==='parts')n.parts+=3;if(kind==='filter')n.filters+=2;if(kind==='battery'){n.electricCells+=2;n.flashlight=cap(n.flashlight+35)}if(kind==='fuel')n.fuel+=4;if(kind==='room')n.rooms++;if(kind==='cage')n.parts+=2;if(kind==='serum')n.mutantSerum++;return summary(n,'보급 도착',`${price} CR로 ${kind} 보급품을 확보했다.`,'good')}
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
  n.ap-=2;n.power=cap(n.power-10);n.mind=cap(n.mind-6);n.eve=cap(n.eve-4);
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
export function gearUnavailable(s:V10,gear:Gear,region:RegionId):string|null{
 const r=regions.find(r=>r.id===region);if(!r)return '알 수 없는 탐사 구역입니다.';
 if(gear==='flashlight'&&s.flashlight<25)return '손전등 배터리 25% 이상이 필요합니다. 보급에서 충전하세요.';
 if(gear==='filter'&&s.filters<1)return '바이오필터가 부족합니다. 보급에서 구입하세요.';
 if(gear==='medkit'&&s.medicine<1)return '의약품이 부족합니다. 보급에서 구입하세요.';
 if(gear==='cage'&&s.parts<1)return '운송 케이지용 부품이 부족합니다.';
 if(gear==='scanner'&&s.power<r.power+8)return '스캐너 전력이 부족합니다. 전력을 보충하거나 손전등을 선택하세요.';
 return null;
}
export function expeditionUsedToday(s:V10){return s.lastExpeditionDay===s.day;}
export function expeditionBlockReason(s:V10,region:RegionId,gear:Gear[],companions:CrewId[]=[]):string|null{
 const r=regions.find(r=>r.id===region);
 if(!r)return '알 수 없는 탐사 구역입니다.';
 if(s.phase!=='day')return '현재는 출동할 수 없는 시간입니다.';
 if(s.run)return '진행 중인 탐사를 먼저 마치세요.';
 if(expeditionUsedToday(s))return '오늘 탐사는 완료했습니다. 돌봄·연구·기지 정비 후 다음 날 다시 출동할 수 있습니다.';
 if(s.pending||s.pendingIncident)return '진행 중인 구조 또는 사건을 먼저 처리하세요.';
 if(s.ap<1)return '출동에 AP 1이 필요합니다. 하루를 종료하면 회복됩니다.';
 if(s.day<r.unlocked)return r.unlocked+'일차부터 열리는 구역입니다.';
 if(companions.length>2)return '탐사에는 최대 2명까지 동행할 수 있습니다.';
 if(new Set(companions).size!==companions.length)return '같은 직원을 중복 편성할 수 없습니다.';
 if(companions.some(id=>!s.crew?.members.some(m=>m.id===id&&m.mind>0)))return '미합류·퇴장·정신 붕괴 직원은 출동할 수 없습니다.';
 if(companions.some(id=>s.crew?.supportWorked?.includes(id)))return '선택한 직원은 오늘 기지 지원 업무를 수행했습니다. 다른 직원을 선택하거나 혼자 출동하세요.';
 if(!gear.includes('flashlight')&&!gear.includes('scanner'))return '어두운 현장에 들어가려면 손전등 또는 EVE 스캐너가 필요합니다.';
 for(const g of gear){const reason=gearUnavailable(s,g,region);if(reason)return reason;}
 if(gear.includes('scanner')&&s.power<r.power+8)return 'EVE 스캐너는 시설 전력이 부족합니다. 손전등으로 바꾸거나 발전기를 복구하세요.';
 return null;
}
export function startRun(s:V10,region:RegionId,gear:Gear[],companion:CrewId|null|CrewId[]=null):V10{const requested=Array.isArray(companion)?companion:[companion].filter(Boolean) as CrewId[];if(expeditionBlockReason(s,region,gear,requested))return s;const n=copy(s) as V10;const r=regions.find(r=>r.id===region)!;const scanner=gear.includes('scanner');const scannerPower=r.power+8;if(n.phase!=='day'||n.run||n.ap<1||n.day<r.unlocked||(!gear.includes('flashlight')&&!scanner)||(scanner&&n.power<scannerPower))return s;if(gear.includes('flashlight')&&n.flashlight<25)return s;if(gear.includes('filter')&&n.filters<1)return s;if(gear.includes('medkit')&&n.medicine<1)return s;if(gear.includes('cage')&&n.parts<1)return s;
n.lastExpeditionDay=n.day;n.ap-=1;if(scanner)n.power-=scannerPower;if(gear.includes('flashlight'))n.flashlight=cap(n.flashlight-10);if(gear.includes('filter'))n.filters--;if(gear.includes('medkit'))n.medicine--;if(gear.includes('cage'))n.parts--;
const initialRisk=r.danger-(gear.includes('filter')?13:0)-(scanner?9:0);const companions=requested.filter((id,index)=>requested.indexOf(id)===index&&s.crew?.members.some(m=>m.id===id&&m.mind>0)).slice(0,2);if(companions.length){const crew=ensureCrew(n);crew.sortieWorked=[...new Set([...(crew.sortieWorked??[]),...companions])];}n.run={region,gear,stage:0,netLevel:upgradeLevel(n,'net'),suitLevel:upgradeLevel(n,'suit'),scannerLevel:upgradeLevel(n,'scanner'),integrity:100,exposure:0,loot:0,discovery:null,event:'',medkitUsed:false,earned:freshFieldEarnings(),captures:[],firstTutorial:s.tutorialStep===1,companion:companions[0]??null,companions,log:[scanner?'시설 전력망 EVE 스캐너 연결':'휴대 손전등 출동 · 시설 전력 보존']};n.stamina=n.nextFieldFatigued?50:100;n.nextFieldFatigued=false;n.lastFieldSummary=null;n.field=createField(n.day,region,n.encounters);n.capture=null;n.tacticalCaptured=false;n.eventRisk=cap(n.eventRisk+3);n.threat=cap(n.threat+4);n.lastOutcome=`${r.name}에 진입했다. 탐사 ST ${n.stamina}/100 · 초기 위험 ${Math.max(5,initialRisk)}%.`;return n}
// Reserved expedition supplies are refunded if not consumed. A cage is consumed only on capture attempt.
function returnUnusedRunSupplies(s:V10,run:Run,hasEncounter:boolean){
 if(run.gear.includes('medkit')&&!run.medkitUsed)s.medicine++;
 if(run.gear.includes('cage')){if(hasEncounter)s.pendingCage=true;else if(!run.cageUsed)s.parts++;}
}
export function useFieldMedkit(s:V10):V10{
 if(!s.run||!s.run.gear.includes('medkit')||s.run.medkitUsed||s.mind>=100||s.phase!=='day')return s;
 const n=copy(s) as V10;
 n.run!.medkitUsed=true;n.mind=cap(n.mind+20+(n.crew?.healingDay===n.day?8:0));
 return summary(n,'응급 키트 사용','탐사 중 신경 회복제를 사용했습니다. 관리자 정신력 최대 20 회복.','good');
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
if(!success){n.mind=cap(n.mind-5-Math.round(region.danger/20));n.mind=cap(n.mind-5);n.facility=cap(n.facility-2)}
run.log.push(`신호 보정 ${signalAccuracy}점 · ${signalModifier>0?'위험 증가':signalModifier<0?'위험 감소':'보정 없음'}`);
run.log.push(`${success?'작전 성공':'위험 발생'} · ${scene.title} · ${choice===scene.preferred?'상황에 적합한 대응':choice===scene.punished?'잘못된 접근으로 위험 증가':'기본 대응'}`);run.event=run.log[run.log.length-1];
if(run.stage>=3||run.integrity<=15||n.mind<=0){n.parts+=Math.max(0,Math.floor(run.loot/3));n.food+=Math.max(0,Math.floor(run.loot/4));n.credits+=run.loot*24;n.suppliesCollected+=run.loot;n.encounters++;let creature:AnimalId|null=null;const candidates=region.animals.filter(id=>!n.headquarters?.transferred.includes(id)&&!n.animals.some(a=>a.id===id&&a.alive)&&specs.find(x=>x.id===id)!.unlock<=n.day);if((success||(n.encounters===1&&region.id==='garden'))&&candidates.length&&(n.encounters===1||rand>.3))creature=candidates[(n.day+run.stage)%candidates.length];returnUnusedRunSupplies(n,run,!!creature);n.run=null;n.field=null;n.capture=null;if(creature){n.pending=creature;summary(n,'미확인 개체 발견',`${specs.find(a=>a.id===creature)?.name}이(가) 발견됐다. 구조 여부를 판단해야 한다.`,'mystery')}else summary(n,'탐사 종료',`물자 가치 ${run.loot}을 회수했다. 시설로 돌아왔으나 위협도와 감염도가 달라졌다.`,success?'good':'bad');if(n.infection>=60)n.eventRisk=cap(n.eventRisk+14)}else n.lastOutcome=run.event;
recalc(n);return n}
export function rescueChoice(s:V10,choice:'secure'|'treat'|'release',rand=Math.random()):V10 {if(!s.pending)return s;const n=copy(s) as V10;const id=n.pending!;const sp=specs.find(a=>a.id===id)!;n.pending=null;n.tacticalCaptured=false;if(s.pendingCage&&choice!=='secure')n.parts++;n.pendingCage=false;if(choice==='release'){recordCapture(n.run,id,'released');n.trust=cap(n.trust+3);applyCrewOpinion(n,'treatment','withhold');return summary(n,'방생 선택',`${sp.name}를 현장에 남겨두었다. 그 선택이 훗날 어떤 결과를 낳을지 알 수 없다.`,'info')}if(choice==='treat'){if(n.medicine<1)return s;n.medicine--;n.trust=cap(n.trust+6);n.clues++;earnDuringRun(n.run!,'clues',1);recordCapture(n.run,id,'treated');applyCrewOpinion(n,'treatment','treat');return summary(n,'현장 치료',`${sp.name}를 치료했다. 멀어지는 발자국 곁에 이상한 행동 기록이 남았다.`,'good')}
if(n.animals.filter(a=>a.alive).length>=n.rooms){recordCapture(n.run,id,'failed');if(s.pendingCage)n.parts++;return summary(n,'격리실 부족',`${sp.name}를 안전하게 옮길 공간이 없어 현장에 남겨두었다.`,'bad')}const chance=s.tacticalCaptured?100:captureChance(s);n.tacticalCaptured=false;if(rand*100<chance){const rooms=new Set(n.animals.filter(a=>a.alive).map(a=>a.room));let room=1;while(rooms.has(room))room++;const rescued=makeAnimal(id,room);if(id==='rabbit'&&s.lifeSaved===0&&s.tutorialStep<=4){
  // Fixed first-lesson baseline: do not generate unstable tutorial stats.
  rescued.tutorialProtected=true;rescued.hp=90;rescued.stress=18;rescued.contamination=0;rescued.bond=34;rescued.memory=0;
 }n.animals.push(rescued);noteRescue(n,id);recordCapture(n.run,id,'secured');if(id==='rabbit'&&n.lifeSaved===0&&s.tutorialStep<=4){n.scrap+=16;earnDuringRun(n.run!,'scrap',16);log(n,'시설 복구용 고철 확보','첫 구조 현장에서 고철 16개를 회수했습니다. 감시망과 병리·검시실을 복구할 수 있습니다.','good');}n.lifeSaved++;n.trust=cap(n.trust+4);n.eventRisk=cap(n.eventRisk+4);return summary(n,'구조 완료',`${sp.name} 구조 성공 (시도 확률 ${chance}%). 격리실 ${room}번에 배정됐다.`,'good')}recordCapture(n.run,id,'failed');n.mind=cap(n.mind-7);n.threat=cap(n.threat+8);return summary(n,'구조 실패',`${sp.name}가 수색망을 벗어났다 (시도 확률 ${chance}%). 신경적 충격으로 정신력이 떨어졌다.`,'bad')}
export function incidentWeight(s:V10){return cap(7+s.threat*.24+s.infection*.19+(100-s.facility)*.20+(100-s.power)*.16+s.animals.filter(a=>a.alive).length*3+Math.min(15,s.encounters));}
// Event occurrence and event-type selection use INDEPENDENT random draws.
// Repeated incidents are suppressed, but high-risk states can still cause them.
export function determineIncident(s:V10,rand=Math.random(),typeRand=Math.random()):IncidentId|null{
 // A daily incident after onboarding is the source of the daily management dilemma.
 if(s.day<2||(s.day<4&&rand*100>=incidentWeight(s)))return null;
 const alive=s.animals.filter(a=>a.alive);
 // Fictional neurobiology: remembered habits attract HQ attention while
 // unstable synchronization raises acoustic incidents.
 const neuralSignal=alive.reduce((sum,a)=>sum+neuralProfile(a).activation,0)/100;
 const hqAttention=alive.reduce((sum,a)=>sum+neuralProfile(a).hqAttention,0)/100;
 const scores:[IncidentId,number][]=[
  ['breach',10+s.threat*.23+alive.length*2],
  ['blackout',Math.min(25,8+(100-s.power)*.17)],
  ['spores',9+s.infection*.23],
  ['echo',alive.length?8+alive.length*4+neuralSignal*3:0],
  ['signal',9+s.clues*2.6+s.knowledge/30],
  ['visitor',s.crew?.members.some(m=>m.mind>0)?(s.day>4?9+s.day*.42:3):0],
  ['predator',8+s.threat*.25],
  ['coolant',9+(100-s.facility)*.18],
  ['rations',alive.length?8+alive.length*2.4:0],
  ['intrusion',s.day>6?10+s.clues*1.4+hqAttention*1.5:4],
  ['garden',s.facility>=35?24:8],
  ['keepsake',alive.length?22+alive.reduce((sum,a)=>sum+a.bond,0)/10:0],
  ['quiet',s.crew?.members.some(m=>m.mind>0)?28:0]
 ];
 for(const id of EXTENDED_INCIDENT_IDS)scores.push([id,extendedIncidentWeight(s,id)]);
 const last=s.lastEvent??'';
 const weighted=scores.filter(([id,weight])=>weight>0&&incidentDefs[id].title!==last);
 const sum=weighted.reduce((a,[,weight])=>a+weight,0);
 let pick=Math.max(0,Math.min(.999999,typeRand))*sum;
 for(const [id,weight] of weighted){pick-=weight;if(pick<0)return id;}
 return weighted[weighted.length-1][0];
}
export function resolveIncident(s:V10,option:number):V10{
 const id=s.pendingIncident;
 if(!id||!Number.isInteger(option)||option<0||option>2)return s;
 if(!(id in coreIncidentDefs))return resolveExtendedIncident(s,id as ExtendedIncidentId,option);
 if((id==='keepsake'&&!s.animals.some(a=>a.alive))||(id==='quiet'&&!s.crew?.members.some(m=>m.mind>0)))return s;
 if(option===0&&((id==='garden'&&s.power<6)||((id==='keepsake'||id==='quiet')&&s.food<1)))return s;
 if(!id||!Number.isInteger(option)||option<0||option>2||(id==='visitor'&&!s.crew?.members.some(m=>m.mind>0))||((id==='echo'||id==='rations')&&!s.animals.some(a=>a.alive)))return s;
 if((id==='breach'&&option===0&&s.power<22)||(id==='blackout'&&option===0&&s.parts<2)||(id==='spores'&&option===0&&s.filters<1)||(id==='predator'&&option===0&&s.power<14)||(id==='coolant'&&option===0&&s.parts<2)||(id==='rations'&&option===0&&s.food<2)||(id==='intrusion'&&option===0&&s.power<10))return s;
 const n=copy(s) as V10;n.pendingIncident=null;const def=incidentDefs[id];
 if(id==='garden'){
  if(option===0){n.power-=6;n.food+=3;}else if(option===1){n.knowledge+=10;}else{n.mind=cap(n.mind+7);}
 }else if(id==='keepsake'){
  if(option===0){n.food--;n.animals.filter(a=>a.alive).forEach(a=>{a.bond=cap(a.bond+8);a.stress=cap(a.stress-8)});}
  else if(option===1){n.parts+=2;n.animals.filter(a=>a.alive).forEach(a=>a.bond=cap(a.bond-3));}
  else{n.clues++;n.mind=cap(n.mind+4);}
 }else if(id==='quiet'){
  if(option===0)n.food--;else if(option===1)n.knowledge+=12;else n.mind=cap(n.mind+6);
  n.crew?.members.filter(m=>m.mind>0).forEach(m=>m.mind=cap(m.mind+(option===0?8:option===1?-4:3)));
 }else if(id==='breach'){
  if(option===0){n.power-=22;n.threat=cap(n.threat-25);n.facility=cap(n.facility+4)}
  else if(option===1){n.mind=cap(n.mind-19);n.animals.forEach(a=>a.stress=cap(a.stress+7));n.threat=cap(n.threat-14)}
  else {n.mind=cap(n.mind-22);n.facility=cap(n.facility-20);n.threat=cap(n.threat+17);n.animals.forEach(a=>{a.stress=cap(a.stress+17);a.hp=cap(a.hp-7)})}
 }else if(id==='blackout'){
  if(option===0){n.parts-=2;n.power=cap(n.power+16);n.facility=cap(n.facility+18)}
  else if(option===1){n.power=cap(n.power+9);n.eve=cap(n.eve-9);n.facility=cap(n.facility-7)}
  else {n.mind=cap(n.mind-13);n.power=cap(n.power-12);n.eve=cap(n.eve-19);n.facility=cap(n.facility-17);n.knowledge+=7}
 }else if(id==='spores'){
  if(option===0){n.filters--;n.infection=cap(n.infection-19)}
  else if(option===1){n.power=cap(n.power-12);n.infection=cap(n.infection-9);n.facility=cap(n.facility-9)}
  else {n.mind=cap(n.mind-14);n.infection=cap(n.infection+22);n.animals.forEach(a=>{a.contamination=cap(a.contamination+19);a.sickness=cap((a.sickness??0)+9)})}
 }else if(id==='echo'){
  if(option===0){n.knowledge+=12;n.clues++;n.animals.forEach(a=>a.stress=cap(a.stress+6))}
  else if(option===1){n.trust=cap(n.trust+7);n.animals.forEach(a=>a.stress=cap(a.stress-14));n.power=cap(n.power-5)}
  else {n.mind=cap(n.mind-9);n.animals.forEach(a=>{a.stress=cap(a.stress+15);a.memory=cap(a.memory+3)})}
 }else if(id==='signal'||id==='visitor'){
  // A personnel-specific visitor never acts on absent or terminated staff.
  if(id==='visitor'){const witness=n.crew?.members.find(m=>m.mind>0);if(witness){witness.mind=cap(witness.mind-(option===1?6:3));log(n,'방문자 목격 · 인력 확인',`${witness.id} 직원이 직접 외곽 신호를 목격했습니다. 정신력 -${option===1?6:3}.`,'mystery')}}
  if(option===0){n.knowledge+=12;n.clues++;n.eve=cap(n.eve-8)}
  else if(option===1){n.mind=cap(n.mind-19);n.infection=cap(n.infection+12);n.knowledge+=20;n.clues+=2;n.threat=cap(n.threat+11)}
  else {n.threat=cap(n.threat+16);n.facility=cap(n.facility-10);n.trust=cap(n.trust-5)}
 }else if(id==='predator'){
  if(option===0){n.power-=14;n.threat=cap(n.threat-16)}
  else if(option===1){n.mind=cap(n.mind-21);n.threat=cap(n.threat-9)}
  else {n.mind=cap(n.mind-24);n.facility=cap(n.facility-17);n.threat=cap(n.threat+18);n.animals.forEach(a=>a.stress=cap(a.stress+17))}
 }else if(id==='coolant'){
  if(option===0){n.parts-=2;n.facility=cap(n.facility+12);n.eve=cap(n.eve+5)}
  else if(option===1){n.mind=cap(n.mind-15);n.infection=cap(n.infection+10);n.facility=cap(n.facility-5)}
  else {n.eve=cap(n.eve-25);n.power=cap(n.power-15);n.facility=cap(n.facility-21);n.infection=cap(n.infection+10)}
 }else if(id==='rations'){
  if(option===0){n.food-=2;n.facility=cap(n.facility+3)}
  else if(option===1){n.mind=cap(n.mind-5);n.infection=cap(n.infection+9);n.food= Math.max(0,n.food-1)}
  else {n.animals.forEach(a=>{a.sickness=cap((a.sickness??0)+22);a.stress=cap(a.stress+12);a.hp=cap(a.hp-11)});n.threat=cap(n.threat+8)}
 }else if(id==='intrusion'){
  if(option===0){n.power-=10;n.eve=cap(n.eve-4);n.threat=cap(n.threat-10)}
  else if(option===1){n.clues+=2;n.knowledge+=10;n.eve=cap(n.eve-12);n.threat=cap(n.threat+7)}
  else {n.eve=cap(n.eve-24);n.facility=cap(n.facility-17);n.threat=cap(n.threat+20);n.mind=cap(n.mind-8)}
 }
 n.eventHistory=[...n.eventHistory,`${n.day}일차 ${def.title} · ${def.options[option]}`].slice(-30);
 n.lastEvent=def.title;
 if(['garden','keepsake','quiet'].includes(id))return summary(n,def.title,`${def.options[option]} — 오늘의 작은 선택을 기록했습니다.`,'good');
 return summary(n,def.title,`${def.options[option]} — ${option===2?'대응 실패. 시설과 생체 신호에 큰 피해가 발생했습니다.':'대응 결과가 기록되었습니다. 실제 증감 수치를 확인하십시오.'}`,option===2?'bad':option===0?'good':'mystery');
}
// Safe, read-only preview for event choice cards; uses the same actual outcome rules.
export function previewIncident(s:V10,option:number):{available:boolean;effects:{name:string;delta:number}[]}{
 const n=resolveIncident(s,option);
 if(n===s)return {available:false,effects:[]};
 const fields:[keyof V10,string][]=[['mind','정신력'],['eve','EVE 코어'],['power','전력'],['facility','시설'],['infection','감염'],['threat','위협'],['parts','부품'],['scrap','고철'],['electricCells','전지'],['filters','필터'],['medicine','의약품'],['food','식량'],['credits','크레딧'],['knowledge','지식'],['clues','단서'],['trust','신뢰']];
 const effects=fields.map(([key,name])=>({name,delta:Number(n[key])-Number(s[key])})).filter(x=>Number.isFinite(x.delta)&&x.delta!==0);
 const oldAnimals=s.animals.filter(a=>a.alive),newAnimals=n.animals.filter(a=>a.alive);
 const bondDelta=newAnimals.reduce((sum,a)=>sum+a.bond,0)-oldAnimals.reduce((sum,a)=>sum+a.bond,0);
 if(bondDelta)effects.push({name:'개체 유대 합계',delta:bondDelta});
 const crewMind=(n.crew?.members??[]).reduce((sum,m)=>sum+m.mind,0)-(s.crew?.members??[]).reduce((sum,m)=>sum+m.mind,0);
 if(crewMind)effects.push({name:'직원 정신력 합계',delta:crewMind});
 if(oldAnimals.length){const oldStress=oldAnimals.reduce((v,a)=>v+a.stress,0),newStress=newAnimals.reduce((v,a)=>v+a.stress,0);if(newStress!==oldStress)effects.push({name:'개체 스트레스 합계',delta:newStress-oldStress});const oldHealth=oldAnimals.reduce((v,a)=>v+a.hp,0),newHealth=newAnimals.reduce((v,a)=>v+a.hp,0);if(newHealth!==oldHealth)effects.push({name:'개체 건강 합계',delta:newHealth-oldHealth});}
 return {available:true,effects};
}
export type NightChoice='shield'|'rest'|'standby';
export type DayEndBlocker={code:string;message:string;tab:'hub'|'expedition'|'hq'|'cctv'|'synthesis'|'records';actionLabel:string};
/** One source of truth for UI and simulation. AP and power are deliberately NOT blockers. */
export function getDayEndBlocker(s:V10):DayEndBlocker|null{
 if(s.phase!=='day')return {code:'phase',message:'현재는 낮 운영 단계가 아닙니다. 진행 중인 결말 또는 전환 화면을 먼저 마치세요.',tab:'hub',actionLabel:'중앙 화면 보기'};
 if(s.pending)return {code:'rescue',message:'포획한 개체의 구조·격리 결정을 먼저 완료해야 합니다.',tab:'expedition',actionLabel:'구조 결정으로 이동'};
 if(s.run)return {code:'expedition',message:'현재 탐사 중입니다. 탐사를 마치거나 철수하세요.',tab:'expedition',actionLabel:'탐사로 이동'};
 if(s.pendingIncident)return {code:'incident',message:`미처리된 사건 「${incidentDefs[s.pendingIncident]?.title??s.pendingIncident}」이 있습니다. 사건 대응을 선택하세요.`,tab:'hub',actionLabel:'사건 대응 확인'};
 if(s.crew?.pendingTermination)return {code:'termination',message:'직원 신호 소실에 대한 결정을 먼저 처리해야 합니다.',tab:'hub',actionLabel:'직원 사건 확인'};
 if(s.crew?.pendingNightVote)return {code:'night-vote',message:'직원 야간 근무 결정이 대기 중입니다. 직원 의견을 먼저 선택하세요.',tab:'hub',actionLabel:'직원 투표 확인'};
 if(s.voice?.pending)return {code:'voice',message:'정문 미확인 음성이 남아 있습니다. CCTV에서 조사하고 판정하세요.',tab:'cctv',actionLabel:'CCTV 음성 조사'};
 if(s.hqOrders?.active?.status==='offered')return {code:'hq-order',message:'미처리된 본부 명령이 있습니다. 본부 화면에서 응답하세요.',tab:'hq',actionLabel:'본부 명령으로 이동'};
 if(s.pathologyPending)return {code:'pathology',message:'병리 검사 후속 처리가 남았습니다. 결과를 보존하거나 본부에 제출하세요.',tab:'synthesis',actionLabel:'검사 결과 처리'};
 if(s.headquarters?.pendingScene)return {code:'hq-scene',message:'본부 기밀 기록을 확인하고 대화를 마쳐야 합니다.',tab:'hq',actionLabel:'본부 기록 확인'};
 if(s.archive?.revealPending)return {code:'archive-reveal',message:'해독한 기밀 사진의 기록을 먼저 확인하세요.',tab:'records',actionLabel:'기밀 기록 확인'};
 return null;
}
/** Resolves tutorial backup electricity and optional fuse repair BEFORE selecting night defense. */
export function nightCircuitVoltage(day:number,terminal:number){return ((terminal*3+day-1)%4)+1}
export function nightCircuitSequence(day:number){return [0,1,2,3].sort((a,b)=>nightCircuitVoltage(day,a)-nightCircuitVoltage(day,b))}
export function getNightCircuitState(s:V10):NightCircuit{return s.nightCircuit?.day===s.day?s.nightCircuit:{day:s.day,order:[],faults:0,completed:false}}
/** A wrong connection has a facility cost; progress is saved in the game state. */
export function attemptNightCircuit(s:V10,terminal:number):V10{
 const circuit=getNightCircuitState(s);
 if(s.phase!=='day'||!Number.isInteger(terminal)||terminal<0||terminal>3||circuit.completed||circuit.faults>=3)return s;
 const order=[...circuit.order,terminal],sequence=nightCircuitSequence(s.day);
 const n=copy(s) as V10;
 if(sequence.slice(0,order.length).every((value,index)=>value===order[index])){
  n.nightCircuit={...circuit,order,completed:order.length===4};
  return n;
 }
 n.nightCircuit={...circuit,order:[],faults:circuit.faults+1,completed:false};
 n.power=Math.max(0,n.power-4);n.facility=Math.max(0,n.facility-3);n.threat=cap(n.threat+3);
 return summary(n,'야간 보조회로 오접속','전압 순서가 맞지 않습니다. 보호 회로가 재설정되며 전력 -4%, 시설 안정 -3%, 외부 위협 +3이 발생했습니다. 세 번 틀리면 오늘의 회로 정비가 잠깁니다.','bad');
}
export function previewNight(s:V10,nightChoice:NightChoice,options:{maintained?:boolean;guided?:boolean}={}){
 const startPower=options.guided?Math.max(28,s.power):s.power;
 const powered=cap(startPower+(options.maintained?4:0));
 const applied:NightChoice=powered<({shield:22,rest:5,standby:0}[nightChoice])?'standby':nightChoice;
 const cost={shield:22,rest:5,standby:0}[applied];
 const fuelAvailable=(s.fuel??3)>0,filterAvailable=(s.filters??0)>0;
 const powerAfter=cap(powered-cost-6+(fuelAvailable?4:-4)+upgradeLevel(s,'battery')*5);return {powerBefore:powered,applied,powerAfter,fuelBefore:s.fuel??3,fuelCost:fuelAvailable?1:0,fuelShortfall:fuelAvailable?0:1,filtersBefore:s.filters??0,filterCost:filterAvailable?1:0,filterShortfall:filterAvailable?0:1,repairFacilityBonus:options.maintained?6:0,facilityDispatch:previewFacilityPower(s,powerAfter)};
}
/** Atomic day transition: on failure the original state, day and AP are untouched. */
export function resolveNightTransition(s:V10,nightChoice:NightChoice,options:{maintained?:boolean;guided?:boolean}={}){
 const blocker=getDayEndBlocker(s);
 const preview=previewNight(s,nightChoice,options);
 if(blocker)return {state:s,success:false,blocker,applied:preview.applied};
 const supported=options.guided&&s.power<28?{...s,power:28}:s;
 const prepared=options.maintained?{...supported,power:cap(supported.power+4),facility:cap(supported.facility+6)}:supported;
 const next=finishDay(prepared,nightChoice);
 if(next.day!==s.day+1){return {state:s,success:false,blocker:{code:'day-failed',message:'야간 결산이 완료되지 않았습니다. 진행 중인 사건을 확인하세요.',tab:'hub' as const,actionLabel:'중앙 확인'},applied:preview.applied};}
 if(options.guided)next.onboardingSeen=[...(next.onboardingSeen??[]),'first-night-defense'];
 return {state:next,success:true,blocker:null,applied:preview.applied};
}
export function finishDay(s:V10,nightChoice:NightChoice):V10{const n=copy(s) as V10;if(getDayEndBlocker(s))return s;const charge={shield:22,rest:5,standby:0}[nightChoice];const used:NightChoice=n.power<charge?'standby':nightChoice;const cost={shield:22,rest:5,standby:0}[used];const fuelAvailable=(n.fuel??3)>0,filterAvailable=(n.filters??0)>0;if(fuelAvailable)n.fuel--;if(filterAvailable)n.filters--;n.power=cap(n.power-cost-6+(fuelAvailable?4:-4));n.facility=cap(n.facility-(n.power<20?10:3)-(used==='standby'?6:0)-(fuelAvailable?0:4));if(n.facilities?.containment&&n.facilityPowerState?.powered.includes("containment"))n.facility=cap(n.facility+3);n.threat=cap(n.threat+(used==='shield'?(n.origin==='warden'?-18:-13):used==='rest'?4:19)+(fuelAvailable?0:4));n.eventRisk=cap(n.eventRisk+(used==='standby'?17:0)+(fuelAvailable?0:4)+(!filterAvailable?4:0));n.infection=cap(n.infection+(n.facility<50?7:2)+(used==='standby'?4:0)+(!fuelAvailable?2:0)+(!filterAvailable?7:0));if(used==='rest')n.mind=cap(n.mind+19);if(used==='shield')n.facility=cap(n.facility+3);
resolveNightWatch(n);
n.power=cap(n.power+upgradeLevel(n,'battery')*5);allocateFacilityPower(n);
 n.crew?.members.filter(m=>m.mind>0).forEach(m=>{m.mind=cap(m.mind+upgradeLevel(n,'clinic'))});
 n.animals.filter(a=>a.alive).forEach(a=>{a.stress=cap(a.stress-upgradeLevel(n,'clinic')*2);const fed=n.food>0;if(fed){n.food--;a.stress=cap(a.stress+3);applyFamiliarRoutine(a)}else{a.stress=cap(a.stress+10)}if(n.infection>45)a.contamination=cap(a.contamination+5);if(a.contamination>65)a.hp=cap(a.hp-7);nightlyAnimalCondition(a,fed,n.facility,n.infection);if(n.facilities?.infirmary&&n.facilityPowerState?.powered.includes("infirmary")){a.sickness=cap((a.sickness??0)-8);a.contamination=cap(a.contamination-3);}if(a.hp<=0){a.alive=false;log(n,'격리 개체 사망',`${a.name}의 신호가 끊겼다.`,'bad')}});
nightlySecurity(n);if(n.facilityPowerState?.powered.includes("synthesis"))n.knowledge+=2;
 if(n.crew){n.crew.supportWorked=[];n.crew.sortieWorked=[];}crewNight(n);if(n.crew?.guardDay===n.day)n.threat=cap(n.threat-7);
 for(const a of n.animals){const old=s.animals.find(x=>x.id===a.id);if(old?.alive&&!a.alive)recordSpecimen(n,a.id,'격리 개체 사망','야간 바이탈 신호가 끊겼습니다. 개체의 사후 기록이 보존됩니다.','loss');}
 const escapedNow=n.security.escapedIds.filter(id=>!s.security.escapedIds.includes(id));for(const id of escapedNow)recordSpecimen(n,id,'격리 이탈','시설 내 생체 신호 이탈. 마지막 CCTV 기록을 확인하십시오.','security');
if(n.infection>75){n.mind=cap(n.mind-10);n.eve=cap(n.eve-3)}applyCrewLossPenalties(n);n.day++;scheduleStaffByDay(n);n.ap=n.start==='station'&&(!n.startBenefits||n.day<=2)?5:4;n.dayEvents=0;n.run=null;
tickHqOrders(n);
 ensureOriginZero(n);tickOriginDay(n);
if(n.day>=13&&n.knowledge>=70&&n.clues>=3&&!n.flags.humanTruth){n.flags.humanTruth=true;log(n,'ARK 열람 권한','기록을 검증한 결과 생체 신경 조직에 인간의 기억이 보존됐음이 확인됐다.','mystery')}
if(n.day>=20&&(n.originZero?.photos??0)>=11&&n.flags.humanTruth&&n.knowledge>=145&&n.clues>=7&&!n.flags.mirror){n.flags.mirror=true;log(n,'제000번 개체','거울실의 생체 기록은 관리자의 신체가 최초의 연구자와 다른 복제체임을 가리킨다.','mystery')}
// The facility reports to an unseen authority. Clues unfold only when the player has progressed.
 const h=n.headquarters??(n.headquarters=emptyHeadquarters());
 if(!h.pendingScene&&h.firstReport&&h.revealStage===0&&n.day>=12&&n.clues>=3){h.revealStage=1;h.pendingScene='trace';log(n,'수신처 없는 송신','기억 공명 보고서의 수신처가 중앙 시설 외부에 있다는 흔적을 발견했다.','mystery')}
 else if(!h.pendingScene&&h.firstReport&&h.revealStage===1&&n.day>=20&&n.flags.humanTruth&&n.clues>=6){h.revealStage=2;h.pendingScene='evidence';log(n,'생체 반출 명세','이송 개체의 기억 보존이 외부 생체 실험과 연결되어 있다는 기록을 확보했다.','mystery')}
 else if(!h.pendingScene&&h.firstReport&&h.revealStage===2&&n.day>=26&&n.flags.mirror&&(n.originZero?.photos??0)>=11){h.revealStage=3;h.pendingScene='origin';log(n,'제000번 제조 기록','관리자의 신경 기록이 최초 연구자의 장기 보존 뇌 이식 명세와 연결된다.','mystery')}
 if(n.archive?.bonuses.power)n.power=cap(n.power+30);
 evaluateArchiveReveal(n);
 if(n.day>=30&&originReadyForFinale(n)){n.phase='finale';if(h.revealStage<3){h.revealStage=3;h.pendingScene='origin';log(n,'최종 기밀 해독','본부의 인류 복원 명령과 최초 과학자의 신념이 같은 문장에서 시작했음을 확인했다.','mystery')}}else {n.pendingIncident=determineIncident(n);n.phase='day';if((n.hqOrders?.interference??0)>=55&&n.day%5===1&&!n.pendingIncident){n.pendingIncident='intrusion';log(n,'본부 간섭 · 침입자 음성', '본부 지원 차단 이후 외곽에서 관리자 인증 신호를 도용한 생체 교란이 포착됐습니다.', 'bad');}scheduleVoiceBreach(n);}
summary(n,'하루의 종료',`전력 ${n.power}%, 감염도 ${n.infection}%, 위협 ${n.threat}%. ${used==='shield'?'방어막을 점검했다.':used==='rest'?'충분한 휴식을 취했다.':'경비를 가동하지 못했다. 외부 위협과 격리 위험이 상승했다.'}`,'info');recalc(n);return n}
export function registerFullResonance(before:V10,after:V10,id:AnimalId):V10 {
 const prev=before.animals.find(a=>a.id===id);const a=after.animals.find(a=>a.id===id);
 if(!a||a.memory<100||((prev?.memory??0)>=100&&!(id==='rabbit'&&before.tutorialStep===5&&!before.headquarters.firstReport)))return after;
 const n=structuredClone(after) as V10;const h=n.headquarters??(n.headquarters=emptyHeadquarters());
 h.pendingAnimal=id;
 if(!h.firstReport){h.firstReport=true;log(n,'100% · 미확인 수신처','EVE는 완성된 공명 기록을 본부로 송신하려고 한다. 본부의 위치와 목적은 공개되지 않았다.','mystery')}
 else log(n,'100% · 이송 요청',`${a.name}의 공명 완료를 확인했습니다. 외부 수신처에서 개체 인계를 요구합니다.`,'mystery');
 noteResonance(n,id);
 n.lastOutcome=`${a.name}: 행동 공명 100%. 외부 이송 요청이 도착했습니다.`;
 return n;
}
export type HeadquartersChoice='transfer'|'copy'|'refuse'|'defer';
export function resolveHeadquarters(s:V10,choice:HeadquartersChoice):V10 {
 const h=s.headquarters;if(!h?.pendingAnimal)return s;
  // First tutorial rabbit must be transmitted, otherwise the onboarding could deadlock.
  if(h.pendingAnimal==='rabbit'&&!h.transferred.includes('rabbit')&&s.tutorialArchiveReviewPending&&choice!=='transfer')return s;
 const n=copy(s) as V10;const q=n.headquarters;const id=q.pendingAnimal!;const a=n.animals.find(a=>a.id===id);
 if(choice==='transfer'&&(!a||!a.alive||a.memory<100||(isCrewId(id)&&staffTransferIssues(n,a).length)))return s;
 q.pendingAnimal=null;
 if(choice==='defer')return summary(n,'이송 보류','생체 이송 요청을 보류했습니다. 공명 100%를 유지하며 격리실에서 치료 후 다시 본부에 요청할 수 있습니다.','info');
 if(choice==='transfer'){
  if(a){a.alive=false;a.tutorialProtected=false;(a as typeof a & {transferred?:boolean}).transferred=true;}
  if(id==='rabbit'){
   n.tutorialArchiveReviewPending=false;
   n.tutorialStep=Math.max(n.tutorialStep,6);
   if(n.facilities.cctv)n.tutorialStep=Math.max(7,n.tutorialStep);
   if(n.facilities.cctv&&n.facilities.synthesis)n.tutorialStep=Math.max(8,n.tutorialStep);
  }
  if(!q.transferred.includes(id))q.transferred.push(id);
   // Each of the four linked species schedules exactly one human return.
   // No person appears today: arrival is delayed until the next DAY, one person per day.
   const queued=queueCrewArrival(n,id);
   // Living transfers are NOT tissue shipments; advanced rewards remain separate.
  // Premium HQ selections must be earned through the later, irreversible specimen transmission.
  recordSpecimen(n,id,'본부 생체 인계','생체 개체를 본부로 이송했습니다. 원본의 이후 행방은 열람 불가.','decision');
  n.scrap+=3;n.food+=2;n.trust=cap(n.trust-5);evaluateArchiveReveal(n);
  return summary(n,'본부 생체 인계 완료',`${a?.name||id}을(를) 본부로 이송했습니다. 기본 배급: 고철 +3 · 식량 +2. ${queued?'대응 인력은 다음 날부터 1명씩 도착합니다.':'이 종은 신규 직원으로 전환되지 않습니다.'} 고급 지원품은 조직 표본 송신 시에만 발행됩니다.`, 'mystery');
 }
 if(choice==='copy'){
  if(!q.copies.includes(id))q.copies.push(id);
  n.power=cap(n.power-8);n.clues+=2;n.eve=cap(n.eve-5);recordSpecimen(n,id,'신경 데이터 전송 · 개체 보존','원본 개체는 격리실에 남기고 분석 데이터만 암호화하여 송신했습니다.','decision');evaluateArchiveReveal(n);
  return summary(n,'신경 데이터만 전송',`${a?.name||id}은(는) 시설에 남아 있습니다. 공명 데이터만 전송했습니다. 단서 +2, 전력 -8.`,'mystery');
 }
 if(!q.retained.includes(id))q.retained.push(id);
 n.trust=cap(n.trust+6);n.threat=cap(n.threat+8);recordSpecimen(n,id,'본부 인계 거부','개체의 생존을 우선해 송신 명령을 거부했습니다.','decision');evaluateArchiveReveal(n);
 return summary(n,'인계 거부',`${a?.name||id}의 이송 요청을 거부했다. 본부가 같은 명령을 반복하고 있다. 유대와 외부 위협이 함께 변했다.`,'mystery');
}
export {dailyWork,extract,finish};

// V67: Pathology is evidence gathering, not animal creation. No chimera can be produced here.
export function runPathology(s:V10,id:AnimalId,method:PathologyMethod,rand=Math.random()):V10{
 const a=s.animals.find(x=>x.id===id);const old=s.pathologyRecords??[];
 if(!s.facilities?.synthesis||!a||s.pathologyPending||s.phase!=='day'||s.run||s.pending||s.ap<(method==='clinical'?2:1)||s.power<(method==='clinical'?10:5))return s;
 if(method==='postmortem'?a.alive||old.some(r=>r.id===id&&r.method==='postmortem'):!a.alive||s.security.escapedIds.includes(id))return s;
 if(method!=='postmortem'&&old.some(r=>r.id===id&&r.day===s.day))return s;
 if(method==='clinical'&&s.medicine<1)return s;
 const n=copy(s) as V10;const animal=n.animals.find(x=>x.id===id)!;
 n.ap-=method==='clinical'?2:1;n.power-=method==='clinical'?10:5;
 if(method==='clinical')n.medicine--;
 const stable=cap((animal.hp-animal.stress+100)/2);
 const chance=Math.max(.18,Math.min(.91,(method==='postmortem'?.72:method==='clinical'?.56:.67)+(stable-50)/350+(n.facility-60)/460));
 const success=rand<chance;
 const subject=animal.name;
 const titles:Record<PathologyMethod,string>={noninvasive:'체액·털 검체',clinical:'정밀 신경 검사',postmortem:'사후 검시'};
 const details:Record<PathologyMethod,[string,string]>={
  noninvasive:[`${subject}의 검체에서 반복되는 신경 반응 패턴을 확보했습니다.`,`오염된 검체에서 유의미한 신호를 분리하지 못했습니다. ${subject}의 불안을 진정시켜야 합니다.`],
  clinical:[`${subject}의 신경계에서 분류되지 않은 기억 반응의 흔적이 나타났습니다.`,`장비 신호가 불안정해졌습니다. ${subject}에게 부담이 가해져 검사가 중단되었습니다.`],
  postmortem:[`${subject}의 사후 검체에서 장기간 보존된 조직 변화를 확인했습니다.`,`사후 조직이 심하게 손상되어 자료를 복원하지 못했습니다. 일부 기록만 보존되었습니다.`]
 };
 const detail=details[method][success?0:1];
 if(method!=='postmortem'){
  animal.stress=cap(animal.stress+(method==='clinical'?(success?8:18):(success?2:7)));
  if(method==='clinical'&&!success)animal.hp=cap(animal.hp-6);
 }
 if(success){n.knowledge+=method==='clinical'?11:method==='postmortem'?13:6;n.clues+=method==='postmortem'||method==='clinical'?1:0;n.trust=cap(n.trust+(method==='noninvasive'?2:0));}
 else{n.facility=cap(n.facility-3);n.infection=cap(n.infection+2);n.knowledge+=1;}
 const result=`${titles[method]} ${success?'분석 성공':'분석 실패'} — ${detail}`;
 n.pathologyRecords=[{id,day:n.day,method,success,result},...old].slice(0,70);
 n.pathologyPending={id,method,success,day:n.day,detail};
 recordSpecimen(n,id,`${titles[method]} · ${success?'성공':'실패'}`,detail,success?'research':'observation');
 return summary(n,success?'병리 검사 · 자료 확보':'병리 검사 · 신호 불일치',result,success?'mystery':'bad');
}
/** Player decisions following every examination create persistent management consequences. */
export function resolvePathologyEvent(s:V10,decision:'archive'|'headquarters'):V10{
 const ev=s.pathologyPending;if(!ev)return s;
 const n=copy(s) as V10;n.pathologyPending=null;
 if(decision==='archive'){
  n.trust=cap(n.trust+3);n.knowledge+=ev.success?3:1;
  n.lastOutcome=ev.success?'검사 자료를 내부에 보존했습니다. 이브의 신뢰가 높아졌습니다.':'불완전한 자료를 보관하고 재검토를 예약했습니다.';
 }else{
  n.credits+=ev.success?85:30;n.trust=cap(n.trust-4);n.threat=cap(n.threat+(ev.success?4:2));
  n.lastOutcome=ev.success?'본부에 검사 결과를 제출했습니다. 보급 크레딧을 얻었지만 감시가 늘었습니다.':'검사 실패 보고서를 본부에 제출했습니다. 소액 보급만 지급됐습니다.';
 }
 recordSpecimen(n,ev.id,'병리 결과 처리',n.lastOutcome,'decision');
 log(n,'검사 후속 결정',n.lastOutcome,decision==='archive'?'good':'mystery');
 return n;
}

/** V31 grid exploration: no artificial 3-click completion. Every tile is an actual decision. */
export function moveField(s:V10,destination:number,pace:Pace='normal'):V10{
 if(s.run&&s.field&&!s.capture&&s.stamina<2)return leaveField(s,'탈진 · 긴급 귀환');
 if(!s.run||!s.field||s.capture||s.phase!=='day'||s.pending||!adjacentField(s.field.position,destination,s.field.width??7,s.field.tiles.length)||s.field.choice||s.field.combat)return s;
 const tile=s.field.tiles[destination];if(tile==='wall')return s;
 const n=copy(s) as V10;const field=n.field!;const run=n.run!;
 const firstVisit=!field.visited.includes(destination);
 field.position=destination;field.concealed=false;field.steps++;
 if(run.gear.includes('flashlight'))n.flashlight=Math.max(0,n.flashlight-(upgradeLevel(n,'battery')>0?1:2));
 field.pressure=Math.min(100,(field.pressure??0)+Math.max(1,Math.round(100/((field.width??7)+(field.height??5)+3))-upgradeLevel(n,'relay'))+Math.floor(regions.find(r=>r.id===run.region)!.danger/40)+(tile==='hazard'?12:0)+(pace==='fast'?8:0));
 if(firstVisit)field.visited.push(destination);
 const noisy=pace==='fast';
 field.noise=Math.max(0,Math.min(100,field.noise+(noisy?18:pace==='normal'?7:-4)+(run.gear.includes('flashlight')?(noisy?7:3):0)));
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
   field.loot+=gain;run.loot+=gain;const salvaged=Math.max(1,Math.ceil(gain/2))+((run.companions??[run.companion]).includes('fox')?1:0);n.scrap+=salvaged;earnDuringRun(run,'scrap',salvaged);
   observation=`손상된 물자 상자를 확보했습니다. 회수 점수 +${gain} · 고철 +${Math.max(1,Math.ceil(gain/2))}.`;
  }else if(tile==='hazard'&&!run.firstTutorial){
   field.combat=newFieldCombat(n.day+destination);observation='움직이는 오염 덩어리가 통로를 막았습니다. 다음 공격을 보고 대응하거나 우회하세요.';
  }else if(tile==='hazard'){
   const damage=Math.max(1,Math.round(regions.find(r=>r.id===run.region)!.danger/12)+(noisy?4:0)-(run.gear.includes('scanner')?3:0)-((run.companions??[run.companion]).includes('wolf')?3:0));
   run.integrity=cap(run.integrity-damage);
   n.infection=cap(n.infection+Math.max(0,damage-(run.gear.includes('filter')?5:0)-(n.crew?.decontamDay===n.day?6:0)-((run.companions??[run.companion]).includes('deer')?4:0)));
   n.mind=cap(n.mind-Math.max(0,Math.floor(damage/3)));
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
   if(n.capture?.hunt){const starterCharge=n.start==='observatory'&&(!n.startBenefits||(n.startBenefits.huntCharges??0)>0);if(starterCharge&&n.startBenefits)n.startBenefits.huntCharges--;const huntBonus=(starterCharge?2:0)+(n.archive?.bonuses.tracking?3:0);n.capture.hunt.maxActions+=huntBonus+(n.run?.netLevel??0);n.capture.hunt.actions+=huntBonus+(n.run?.netLevel??0);}
   if(species){
    if(run.gear.includes('cage')){run.cageUsed=true;n.capture!.trust=cap(n.capture!.trust+15);n.capture!.fear=cap(n.capture!.fear-12);n.capture!.maxTurns+=2;}
    n.capture!.fear=cap(n.capture!.fear+Math.floor(field.noise/6));
    n.capture!.trust=cap(n.capture!.trust+Math.min(20,field.clues*5)-Math.floor(field.noise/10));
    observation=`${specs.find(a=>a.id===species)?.name}의 생체 신호를 발견했습니다. 현재 포획 계획 단계로 전환합니다.`;
   }else observation='흔적만 남아 있습니다. 이 구역의 개체는 이미 구조되었거나 이송되었습니다. 추가 연구는 기록실에서 확인하십시오.';
  }
  if(tile!=='exit')field.tiles[destination]='empty';
 }
 // Walking is an active exploration economy: minor salvage and exposure occur without extra clicks.
 // The first guided rabbit mission is safe from random chip damage; later biomes scale by risk.
 if(firstVisit && tile==='empty' && !run.firstTutorial){
  const regionalRisk=regions.find(r=>r.id===run.region)!.danger;
  const roll=((n.day*47+destination*71+field.steps*13+(field.sortie??0)*19)%101);
  if(roll<22){const amount=1+Math.floor(regionalRisk/45);n.scrap+=amount;earnDuringRun(run,'scrap',amount);observation=`길가의 버려진 자재를 자동 회수했습니다. 고철 +${amount}.`;}
  else if(roll>95-Math.floor(regionalRisk/30)){
   const damage=1+Math.floor(regionalRisk/27);n.mind=cap(n.mind-damage);n.infection=cap(n.infection+Math.max(0,damage-(run.gear.includes('filter')?2:0)));
   observation=`발밑 포자 구름이 터졌습니다. 정신력 -${damage}.`;
  }
 }
 // Optional high-stakes side discoveries. Pending choices are saveable and block further movement.
 if(firstVisit&&!run.firstTutorial && !field.combat && !field.encountered && !field.choice && ['cache','signal','hazard'].includes(tile)){
  const chance=(n.day*17+destination*29+field.steps*11+(field.sortie??0)*43)%100;
  if(chance<42){const danger=regions.find(r=>r.id===run.region)!.danger;
   const kind=tile as FieldChoice['kind'];
   field.choice={id:`${n.day}-${field.sortie??0}-${destination}`,kind,title:kind==='cache'?'봉인된 보급 컨테이너':kind==='signal'?'훼손된 기억 보관소':'포자에 잠긴 연구 상자',description:kind==='cache'?'상자를 열면 추가 물자를 얻을 수 있지만 방호 장치가 작동할 수 있습니다.':kind==='signal'?'낡은 신경 기록입니다. 강행 복원은 더 많은 단서를 남기지만 생체 신호를 교란합니다.':'잔해 아래 물자와 신호가 있습니다. 가까이 접근할수록 감염 위험이 커집니다.',danger:Math.min(85,14+Math.floor(danger*.66)),reward:1+regions.find(r=>r.id===run.region)!.reward};
   observation+=' 조사 가능한 미확인 물체가 감지됐습니다. 행동을 선택하세요.';
  }
 }
 if(field.noise>=65 && !field.encountered){n.threat=cap(n.threat+4);observation+=' 소음이 높아 주변 경계 신호가 증가했습니다.';}
 // Independent roaming contaminant: its position and alert state persist in the field save.
 // Quiet movement delays it; normal/fast movement draws it toward the player.
 if(field.threat&&!field.combat&&!n.capture&&!run.firstTutorial){
  const stalker=field.threat,width=field.width??7,from=stalker.position,target=field.position;
  const dist=(a:number,b:number)=>Math.abs(a%width-b%width)+Math.abs(Math.floor(a/width)-Math.floor(b/width));
  stalker.alert=Math.max(0,Math.min(100,stalker.alert+(pace==='quiet'?-8:pace==='fast'?22:13)+(field.noise>=40?6:0)));
  if(stalker.alert>=18){
   const options=[from-width,from+width,from-1,from+1].filter(i=>i>=0&&i<field.tiles.length&&field.tiles[i]!=='wall'&&dist(from,i)===1);
   options.sort((a,b)=>dist(a,target)-dist(b,target));
   if(options.length&&dist(options[0],target)<dist(from,target))stalker.position=options[0];
   stalker.mode='closing';
  }
  const near=dist(stalker.position,target);
  if(near<=1&&stalker.alert>=26){
   field.combat=newFieldCombat(n.day+destination+field.steps);field.combat.source='mobile';
   stalker.mode='closing';observation+=' 어둠 속 오염체가 접근해 퇴로를 막았습니다. 중앙 전투 대응으로 전환합니다.';
  }else if(near<=2&&stalker.mode==='closing')observation+=' 손전등 가장자리에 움직이는 오염체가 스쳤습니다. 조용히 이동하면 추적을 늦출 수 있습니다.';
 }
 revealField(field,run.gear.includes('scanner')?3+Math.floor((run.scannerLevel??0)/2):run.gear.includes('flashlight')&&n.flashlight>0?2:1);
 field.lastEvent=observation;
 n.lastOutcome=observation;
 if(tile==='exit')return leaveField(n,'정상 귀환');
 if(n.stamina<=0 && !n.capture&&!field.combat){n.mind=cap(n.mind-5);return leaveField(n,'탈진 · 긴급 귀환');}
 if(destination===(field.origin??14)&&field.steps>1&&!n.capture)return leaveField(n,'진입 지점 회군');
 if((field.pressure??0)>=75&&!n.capture&&!field.combat){const danger=Math.max(1,Math.floor(regions.find(r=>r.id===run.region)!.danger/35));n.mind=cap(n.mind-danger);n.threat=cap(n.threat+Math.ceil(danger/2));observation+=` 추적망 ${field.pressure}% · 적이 퇴로를 좁힙니다. 정신력 -${danger}; 직접 은폐하거나 교전·철수를 선택하세요.`;field.lastEvent=n.lastOutcome=observation;}
 if(run.integrity<=0){n.mind=cap(n.mind-8);return leaveField(n,'방호 파괴 · 긴급 철수');}
 if(n.mind<=0||n.eve<=0){return leaveField(n,'신경 신호 위험 · 긴급 귀환');}
 return n;
}
/** Hide beside a solid obstacle; the roaming AI keeps ticking and searches the last seen position. */
export function concealInField(s:V10):V10{
 const field=s.field;if(!s.run||!field||s.capture||field.combat||field.choice||s.phase!=='day')return s;
 const n=copy(s) as V10,active=n.field!;
 if(active.concealed){active.concealed=false;active.noise=Math.min(100,active.noise+2);active.lastEvent=n.lastOutcome='장애물 뒤에서 나왔습니다. 이동하거나 밝히면 다시 발각될 수 있습니다.';return n;}
 if(!fieldHasCover(active)||n.stamina<1)return s;
 active.concealed=true;active.noise=0;n.stamina=Math.max(0,n.stamina-1);active.lastEvent=n.lastOutcome='장애물 뒤에 몸을 낮췄습니다. 추적체는 마지막으로 본 위치를 수색합니다. ST -1.';return n;
}
/** Three clearly priced side-event decisions: walk away, careful scan or hazardous salvage. */
export function resolveFieldChoice(s:V10,action:'leave'|'survey'|'risk',rand=Math.random()):V10{
 if(!s.run||!s.field?.choice||s.capture)return s;
 const n=copy(s) as V10,choice=n.field!.choice!,run=n.run!,field=n.field!;
 field.choice=null;
 if(action==='leave'){
  n.lastOutcome=`${choice.title}: 위험을 무시하고 이동을 계속합니다.`;
 }else if(action==='survey'){
  n.stamina=cap(n.stamina-3);
  n.knowledge+=2;earnDuringRun(run,'knowledge',2);
  if(choice.kind==='cache'){n.scrap+=1;earnDuringRun(run,'scrap',1);}
  n.lastOutcome=`${choice.title}: 신중한 기록 확보. ST -3 · 지식 +2${choice.kind==='cache'?' · 고철 +1':''}.`;
 }else{
  const win=rand*100>=choice.danger;
  n.stamina=cap(n.stamina-6);
  if(win){
   const salvage=choice.reward*2;
   n.scrap+=salvage;earnDuringRun(run,'scrap',salvage);
   n.knowledge+=3;earnDuringRun(run,'knowledge',3);
   run.loot+=choice.reward;field.loot+=choice.reward;
   n.lastOutcome=`위험 감수 성공. 고철 +${salvage}, 지식 +3, 회수 점수 +${choice.reward}, ST -6.`;
  }else{
   const damage=Math.max(3,Math.ceil(choice.danger/7));
   n.mind=cap(n.mind-damage);n.infection=cap(n.infection+Math.ceil(damage/2));
   n.lastOutcome=`위험 감수 실패. 정신력 -${damage}, 감염 +${Math.ceil(damage/2)}, ST -6. 다음 행동을 선택하세요.`;
  }
 }
 field.lastEvent=n.lastOutcome;
 log(n,'현장 선택 · '+choice.title,n.lastOutcome,action==='risk'?'mystery':'info');
 if(n.stamina<=0){n.mind=cap(n.mind-5);return leaveField(n,'탈진 · 긴급 귀환');}
 if(n.mind<=0)return leaveField(n,'신경 신호 위험 · 긴급 귀환');
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
 const away=run.companions??(run.companion?[run.companion]:[]);if(away.length&&field.steps>0){for(const id of away){const member=n.crew?.members.find(m=>m.id===id);if(member)member.mind=cap(member.mind-1);}queueCrewTerminations(n);}
 if(away.includes('rabbit')&&field.steps>0)n.mind=cap(n.mind+Math.min(8,Math.floor(field.steps/3)+2));
 const exhausted=kind.includes('탈진')||n.stamina<=0; n.nextFieldFatigued=exhausted;
 const isFull=kind==='정상 귀환'||!!run.firstTutorial;
 const fraction=isFull?1:.30;
 const score=Math.floor(run.loot*fraction);
 // Loot credited during a mission is provisional until a valid extraction route is reached.
 const deposited=run.earned??freshFieldEarnings();
 const kept={scrap:Math.floor(deposited.scrap*fraction),knowledge:Math.floor(deposited.knowledge*fraction),clues:Math.floor(deposited.clues*fraction)};
 n.scrap=Math.max(0,n.scrap-(deposited.scrap-kept.scrap));
 n.knowledge=Math.max(0,n.knowledge-(deposited.knowledge-kept.knowledge));
 n.clues=Math.max(0,n.clues-(deposited.clues-kept.clues));
 const bonuses={parts:Math.floor(score/3),food:Math.floor(score/4),credits:score*22};
 n.parts+=bonuses.parts;n.food+=bonuses.food;n.credits+=bonuses.credits;
 n.lastFieldSummary={region:run.region,reason:kind,steps:field.steps,clues:field.clues,loot:score,rewards:{...kept,...bonuses},captures:[...(run.captures??[])]};
 n.suppliesCollected+=score;n.encounters++;
 returnUnusedRunSupplies(n,run,false);
 n.run=null;n.stamina=exhausted?50:100;n.field=null;n.capture=null;
 n.lastOutcome=`${kind}: ${field.steps}칸 이동 · 물자 ${score}점 (${isFull?'정식 귀환 100%':'귀환 지점 미사용 30%'} 확보). 고철 +${kept.scrap} · 지식 +${kept.knowledge} · 단서 +${kept.clues}, 부품 +${bonuses.parts}, 식량 +${bonuses.food}, CR +${bonuses.credits}.`;
 log(n,'격자 탐사 정산',n.lastOutcome,'info');return n;
}
/** v33 hidden-pursuit command; the UI never receives the living creature's actual cell. */
export function performVeiledHunt(s:V10,command:{type:HuntMode;cell?:number;clue?:number;setting?:import('./hidden-hunt').HuntSetting}):V10{
 if(!s.capture||!s.field||!s.run||!s.capture.hunt||s.phase!=='day')return s;
 const outcome=performHuntAction(s.capture.hunt,command);
 if(!outcome.changed)return s;
 const n=copy(s) as V10;n.capture!.hunt=outcome.state;n.lastOutcome=outcome.state.lastEvent;
 if(command.type==='reveal'&&command.clue!==undefined&&outcome.state.revealed[command.clue])noteSpeciesTrait(n,outcome.state.species,command.clue);
 outcome.state.revealed.forEach((known,i)=>{if(known&&!s.capture!.hunt!.revealed[i])noteSpeciesTrait(n,outcome.state.species,i)});
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
  n.mind=cap(n.mind-outcome.penalty.hp);
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
  n.lastOutcome=outcome.state.resultText+` 피해: 정신력 -${outcome.penalty.hp}, 부품 -${outcome.penalty.parts}, 식량 -${outcome.penalty.food}, 감염 +${outcome.penalty.infection}.`;
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
 const n=copy(s) as V10;n.scrap-=r.scrap;n.parts-=r.parts;n.power=cap(n.power-r.power);n.facilities={...emptyFacilities(),...n.facilities,[id]:true};
 if(id==='cctv'&&n.tutorialStep===6)n.tutorialStep=7;
 if(n.tutorialStep===7&&n.facilities.cctv&&n.facilities.synthesis)n.tutorialStep=8;
 n.lastOutcome=`${r.name} 복구 완료. 고철 -${r.scrap}, 부품 -${r.parts}, 전력 -${r.power}. ${r.benefit}`;
 log(n,'시설 복구 · '+r.name,n.lastOutcome,'good');return n;
}

