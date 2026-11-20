import {AnimalId,AnimalState,cap,log,recalc,isMutant,recordMutation} from './sim';
import type {V10} from './game-v10';

export type CameraId='CAM-01'|'CAM-02'|'CAM-03'|'CAM-04';
export type SecurityStatus='alert'|'breach'|'escaped';
export type SecurityIncident={animalId:AnimalId;status:SecurityStatus;camera:CameraId;severity:number;steps:number;description:string;detected:boolean;tracked?:boolean;manualInspected?:boolean;lastTrace?:string};
export type SecurityState={incident:SecurityIncident|null; lastIncidentDay:number;lastScanDay:number; resolved:number; escapedIds:AnimalId[]; history:{day:number;title:string;detail:string}[]};
export const initialSecurity=():SecurityState=>({incident:null,lastIncidentDay:0,lastScanDay:0,resolved:0,escapedIds:[],history:[]});
export const cameras:{id:CameraId;title:string;description:string}[]=[
 {id:'CAM-01',title:'외곽·출입구',description:'탈출 이동 경로와 외부 통로'},
 {id:'CAM-02',title:'격리실 A',description:'1~2번 개체의 행동'},
 {id:'CAM-03',title:'격리실 B',description:'3번 이후 개체의 행동'},
 {id:'CAM-04',title:'연구동',description:'기억 동기화 및 설비 접근'}];
export const securityPatterns:Record<AnimalId,{behavior:string;escape:string;voice:string}>= {
 rabbit:{behavior:'진료대 위에 앞발을 얹고 정해진 순서로 기구를 옮기고 있습니다.',escape:'의료실의 잠금장치를 건드린 흔적이 있습니다.',voice:'화… 환자분…? 움직이지 마세요…'},
 fox:{behavior:'자재 창고를 순서대로 점검하고 빈 물품 칸에서 멈춥니다.',escape:'보급 창고의 반출 장부와 물품 수량이 서로 맞지 않습니다.',voice:'부품은 몇 개 남았지… 먼저 재고부터 세야 해.'},
 deer:{behavior:'옛 보존 명찰을 피해 같은 통로를 반복해 걷습니다.',escape:'연구 자료실 문에 뿔 자국이 남았습니다.',voice:'아직… 보호 명단이 끝나지 않았어.'},
 owl:{behavior:'발톱으로 감시 카메라의 회전 주기와 같은 패턴을 그립니다.',escape:'정확히 카메라가 돌아간 틈에 이동했습니다.',voice:'주기… 여덟, 열셋… 다시 계산해야…'},
 wolf:{behavior:'다른 개체의 방 앞에서 경계 자세를 취하고 있습니다.',escape:'외곽 울타리 앞에 방어 흔적이 있습니다.',voice:'뒤로 물러나! 내가 막을게!'},
 crow:{behavior:'방송 마이크를 향해 사람의 목소리를 흉내 냅니다.',escape:'관제 방송에서 낯선 호출음이 나왔습니다.',voice:'잠깐, 마지막 소절이…'},
 otter:{behavior:'급수 밸브를 반복해서 분해하고 있습니다.',escape:'배관실의 수동 레버가 열려 있습니다.',voice:'아, 이거 밸브가 반대로…'},
 lynx:{behavior:'빈 관찰석만 바라보며 누군가를 기다립니다.',escape:'재판 기록 보관함에 발자국이 남았습니다.',voice:'판결은… 아직 끝나지 않았습니다.'},
 axolotl:{behavior:'자기 몸의 상처를 검사하듯 유리벽을 더듬습니다.',escape:'연구 수조의 배수 밸브가 열렸습니다.',voice:'재생 속도가… 이럴 리 없는데…'},
 moth:{behavior:'점멸하는 통신 LED만 따라 움직입니다.',escape:'통신 케이블에 비늘 가루가 묻어 있습니다.',voice:'여보세요… 엄마, 들려…?'},
 mutant:{behavior:'서로 다른 여러 목소리에 반응하며 격리벽을 긁습니다.',escape:'출입구 세 곳의 센서가 동시에 작동했습니다.',voice:'우… 우리는… 하나가 아니야…'},
 chimera:{behavior:'서로 반대 방향으로 움직이려는 행동을 반복합니다.',escape:'경비 루트에 서로 다른 발자국이 겹칩니다.',voice:'멈춰… 아니, 계속해…'}
};
const clone=(s:V10):V10=>structuredClone(s);
const cam=(animal:AnimalState):CameraId=>animal.room<=2?'CAM-02':'CAM-03';
function trace(s:V10,title:string,detail:string,kind:'info'|'good'|'bad'|'mystery'='info'){
 s.security.history=[{day:s.day,title,detail},...s.security.history].slice(0,24);log(s,title,detail,kind);s.lastOutcome=detail;
}
export function escapeRisk(s:V10,a:AnimalState):number{
 const mutant=isMutant(a);
 const suppression=(a.suppressedUntilDay??0)>=s.day;
 return cap(Math.round((mutant?32:3)+a.stress*.43+a.contamination*.17-a.bond*.20+(100-s.facility)*.24+(100-s.power)*.13+(a.awakened?7:0)-(s.facilities?.containment?12:0)-(suppression?70:0)));
}
export function nightlySecurity(s:V10,roll=Math.random()):V10{
 if(!s.security)s.security=initialSecurity();const sec=s.security;
 for(const a of s.animals.filter(x=>x.alive))recordMutation(s,a);
 if(sec.incident){const inc=sec.incident;
  const animal=s.animals.find(a=>a.id===inc.animalId&&a.alive);
  if(!animal){sec.incident=null;sec.escapedIds=sec.escapedIds.filter(x=>x!==inc.animalId);return s;}
  if((animal.suppressedUntilDay??0)>=s.day&&inc.status!=='escaped'){
   sec.incident=null;sec.resolved++;
   trace(s,'변이체 안정화','주사 효과로 격리 개체의 이상 행동이 일시적으로 잦아들었습니다.','good');return s;
  }
  inc.steps++;inc.severity=cap(inc.severity+(isMutant(animal)?19:10));
  if(inc.status==='alert'&&inc.steps>=(isMutant(animal)?1:2))inc.status='breach';
  else if(inc.status==='breach'&&inc.steps>=(isMutant(animal)?2:3)){inc.status='escaped';inc.detected=false;inc.tracked=false;inc.camera='CAM-01';inc.lastTrace=securityPatterns[inc.animalId].escape;sec.escapedIds=[...new Set([...sec.escapedIds,inc.animalId])];trace(s,'격리 이탈','CCTV에서 개체가 사라졌습니다. 이동 경로를 추적해 재격리해야 합니다.','bad')}return s}
 if(sec.escapedIds.length)return s;
 const alive=s.animals.filter(a=>a.alive);if(!alive.length||s.day<3||sec.lastIncidentDay===s.day)return s;
 const candidates=alive.map(a=>({a,risk:escapeRisk(s,a)})).filter(x=>x.risk>=25).sort((a,b)=>b.risk-a.risk);
 if(!candidates.length)return s;
 const chosen=candidates[0];const mutating=isMutant(chosen.a);
 const p=mutating?Math.min(.78,Math.max(.1,(chosen.risk-16)/115)):Math.min(.48,Math.max(.025,(chosen.risk-19)/190));
 if(roll>=p)return s;
 const a=chosen.a;sec.incident={animalId:a.id,status:'alert',camera:cam(a),severity:chosen.risk,steps:0,description:securityPatterns[a.id].behavior,detected:s.power>=18&&s.eve>=20};sec.lastIncidentDay=s.day;
 trace(s,'CCTV 이상 행동',`${a.name}: ${securityPatterns[a.id].behavior}`,'mystery');return s;
}
export type SecurityAction='scan'|'inspect'|'talk'|'lock'|'enter'|'track'|'manualTrack'|'recover'|'release'|'serum';
// Deterministic candidate among four image regions; no exact coordinates are stored in saves.
export function cctvHotspotIndex(s:V10):number {
 const i=s.security?.incident; if(!i)return -1;
 return (s.day*3+i.animalId.length*5+i.steps)%4;
}
export function securityAction(s:V10,action:SecurityAction,selectedCamera?:CameraId,hotspot?:number):V10{
 if(s.phase!=='day'||s.run||s.pendingIncident||s.pending||!s.security)return s;
 const n=clone(s),sec=n.security;const inc=sec.incident;
 if(action==='inspect'){
  if(!inc||inc.manualInspected||hotspot===undefined||hotspot<0||hotspot>3||!selectedCamera)return s;
  if(n.power<3)return s;
  n.power=cap(n.power-3);
  if(inc.camera===selectedCamera&&hotspot===cctvHotspotIndex(s)){
   inc.detected=true;inc.manualInspected=true;inc.severity=cap(inc.severity-17);
   if(inc.status==='escaped')inc.tracked=true;
   trace(n,'CCTV 수동 판독 성공',`${inc.camera} 화면에서 이전 영상과 달라진 지점을 직접 찾아냈습니다. ${securityPatterns[inc.animalId].behavior}`,'good');
  }else{
   n.threat=cap(n.threat+2);
   trace(n,'CCTV 수동 판독 오탐','선택한 화면에 변화를 확인하지 못했습니다. 전력 3을 소모했고, 다음 감시 신호를 확인해야 합니다.','info');
  }
  return n;
 }
 if(action==='scan'){
  const scanCost=(n.voice?.correct??0)>=2?5:8;
  if(n.power<scanCost||n.ap<1||sec.lastScanDay===n.day)return s;
  n.ap--;n.power=cap(n.power-scanCost);sec.lastScanDay=n.day;
  if(inc){inc.detected=true;inc.severity=cap(inc.severity-7);trace(n,'CCTV 정밀 스캔',`${n.animals.find(a=>a.id===inc.animalId)?.name}의 이동 패턴을 분석했습니다. ${securityPatterns[inc.animalId].behavior}`,'mystery')}
  else{n.threat=cap(n.threat-3);trace(n,'CCTV 정밀 스캔','이상 신호가 감지되지 않았습니다. 외곽 위험 예측이 갱신됐습니다.','good')}
  return n;
 }
 if(!inc)return s;
 const a=n.animals.find(x=>x.id===inc.animalId&&x.alive);if(!a){sec.incident=null;return n}
 if(action==='talk'){
  if(n.ap<1||n.power<6||n.eve<10)return s;n.ap--;n.power=cap(n.power-6);n.eve=cap(n.eve-2);
  const success=a.bond>=30||a.awakened||a.stress<62;
  a.stress=cap(a.stress-(success?23:5));a.bond=cap(a.bond+4);inc.severity=cap(inc.severity-(success?31:8));
  trace(n,success?'음성 교감 성공':'음성 교감 불안정',success?`${a.name}가 목소리에 반응했습니다. ${securityPatterns[a.id].voice}`:`${a.name}가 응답하지 않습니다. 신호를 반복하면 더 불안정해질 수 있습니다.`,success?'good':'bad');
 }else if(action==='lock'){
  if(n.power<18)return s;n.power=cap(n.power-18);n.facility=cap(n.facility+3);a.stress=cap(a.stress+11);inc.severity=cap(inc.severity-32);
  trace(n,'격리문 봉쇄',`${a.name}의 이동을 막았습니다. 하지만 개체의 스트레스가 증가했습니다.`,'info');
 }else if(action==='enter'){
  if(n.ap<1)return s;n.ap--;n.mind=cap(n.mind-(inc.severity>62?15:7));a.bond=cap(a.bond+7);inc.severity=cap(inc.severity-(a.bond>=35?42:19));a.stress=cap(a.stress-10);
  trace(n,'관리자 직접 접근',`${a.name}에게 직접 다가갔습니다. 정신적 위험을 감수하고 개체를 안정시키려 했습니다.`,inc.severity>55?'bad':'good');
 }else if(action==='track'){
  if(inc.status!=='escaped'||n.ap<1||n.power<9)return s;n.ap--;n.power=cap(n.power-9);inc.detected=true;inc.tracked=true;inc.severity=cap(inc.severity-23);inc.camera=inc.camera==='CAM-01'?'CAM-04':'CAM-01';inc.lastTrace=securityPatterns[a.id].escape;
  trace(n,'탈출 개체 추적',`${a.name}가 ${inc.camera} 화면에 나타났습니다. ${securityPatterns[a.id].escape}`,'mystery');
 }else if(action==='manualTrack'){
  if(inc.status!=='escaped'||n.ap<1||n.mind<4)return s;
  n.ap--;n.mind=cap(n.mind-3);inc.detected=true;inc.tracked=true;inc.camera='CAM-01';inc.severity=cap(inc.severity-9);inc.lastTrace=securityPatterns[a.id].escape;
  trace(n,'정전 수동 추적',`${a.name}: CCTV 신호 없이 외곽 흔적을 따라갔습니다. ${inc.lastTrace}`,'mystery');
 }else if(action==='serum'){
  if(!isMutant(a)||n.mutantSerum<1||n.ap<1||inc.status!=='escaped'||!inc.tracked)return s;
  n.ap--;n.mutantSerum--;n.mind=cap(n.mind-3);
  a.suppressedUntilDay=n.day+2;a.stress=cap(a.stress-32);a.contamination=cap(a.contamination-15);
  if(inc.severity>75)n.mind=cap(n.mind-5);
  sec.escapedIds=sec.escapedIds.filter(x=>x!==a.id);sec.incident=null;sec.resolved++;
  trace(n,'CCTV 변이체 진정·재격리',`${a.name}: 추적된 동선에서 억제 주사를 투여하고 격리실로 복귀시켰습니다. 변이 상태는 유지됩니다.`,'good');
  recalc(n);return n;
 }else if(action==='recover'){
  if(inc.status!=='escaped'||!inc.tracked||n.ap<1||n.medicine<1)return s;
  n.ap--;n.medicine--;n.mind=cap(n.mind-3);
  const success=inc.severity<=65||a.bond>=60;
  if(success){sec.escapedIds=sec.escapedIds.filter(id=>id!==a.id);a.stress=cap(a.stress+10);a.bond=cap(a.bond+3);sec.resolved++;sec.incident=null;trace(n,'재격리 완료',`${a.name}가 의료 케이지를 통해 무사히 돌아왔습니다. 격리실 ${a.room}번으로 복귀했습니다.`,'good')}
  else{a.stress=cap(a.stress+8);n.mind=cap(n.mind-7);inc.severity=cap(inc.severity+9);trace(n,'재격리 실패',`${a.name}가 접근을 거부했습니다. 다른 카메라에서 이동 경로를 확인해야 합니다.`,'bad')}
  recalc(n);return n;
 }else if(action==='release'){
  if(inc.status!=='escaped')return s;sec.escapedIds=sec.escapedIds.filter(id=>id!==a.id);a.alive=false;sec.incident=null;sec.resolved++;n.trust=cap(n.trust+2);
  trace(n,'방생 선택',`${a.name}를 다시 가두지 않았습니다. CCTV의 신호는 시설 밖으로 사라졌습니다.`,'mystery');return n;
 }
 if(inc.status!=='escaped'&&inc.severity<=17){sec.incident=null;sec.resolved++;trace(n,'격리 안정화',`${a.name}의 위험 신호가 안정됐습니다. 사고 기록을 보관했습니다.`,'good')}
 recalc(n);return n;
}
