import type {V10} from './game-v10';
import {cap,copy,log} from './sim';
import {CREW_PROFILES,queueCrewTerminations} from './crew';
import type {CameraId} from './security';
export type HorrorId='loop'|'blindspot'|'deleted'|'blackout'|'forgery'|'staff-memory'|'operator-memory';
export type HorrorCase={id:HorrorId;day:number;expires:number;camera:CameraId;title:string;scene:string;question:string;records:[string,string,string];choices:[string,string,string];answer:number;read:number[];subject?:string};
export type HorrorState={pending:HorrorCase|null;history:{id:HorrorId;day:number;result:string;correct:boolean}[];lastDay:number};
export const horrorIds:readonly HorrorId[]=['loop','blindspot','deleted','blackout','forgery','staff-memory','operator-memory'];
const make=(s:V10,id:HorrorId):HorrorCase|null=>{
 const day=s.day,base={id,day,expires:day+2,camera:'CAM-04' as CameraId,read:[] as number[]};
 const crew=s.crew?.members.filter(m=>m.mind>0&&!s.crew?.retired.includes(m.id))??[];
 const active=s.security.incident;
 const c=(day+Math.floor(s.threat/10))%3;
 const reorder=(records:[string,string,string],choices:[string,string,string],answer:number)=>{
  const shift=(c+1)%3;const r=[...records.slice(shift),...records.slice(0,shift)] as typeof records;
  const q=[...choices.slice(shift),...choices.slice(0,shift)] as typeof choices;
  return {records:r,choices:q,answer:(answer-shift+3)%3};
 };
 switch(id){
 case 'loop':
  if(!s.facilities.cctv)return null;
  return {...base,camera:'CAM-02',title:'같은 11초',scene:'EVE: 시계는 흘러가는데 영상 속 물방울은 같은 곳에서 세 번 떨어졌습니다. 제 출력이 정상인지 확신할 수 없습니다.',question:'관제 서버는 11초마다 현재 시각을 요청했다. 어느 채널이 과거 영상을 반복하는가?',...reorder(['CAM-01 · 요청 03:17:11 / 03:17:22 / 03:17:33 · 영상 03:17:11 / 03:17:22 / 03:17:33','CAM-02 · 요청 03:17:11 / 03:17:22 / 03:17:33 · 영상 03:17:00 / 03:17:00 / 03:17:00','CAM-03 · 요청 03:17:11 / 03:17:22 / 03:17:33 · 영상 03:17:10 / 03:17:21 / 03:17:32'],['CAM-01 생방송 차단','CAM-02 반복 송출 분리','CAM-03 지연 영상 차단'],1)};
 case 'blindspot':
  if(!s.facilities.cctv||s.threat<25)return null;
  return {...base,camera:'CAM-01',title:'보이지 않는 복도',scene:'관리자: 렌즈가 벽을 향하고 있어. 방금까지 저쪽에서 소리가 났는데. 이브, 다음 카메라 어디야?',question:'신호는 연구동에서 시작해 인접 통로 하나만 이동했다. 봉쇄된 통로를 통과할 수 없다. 다음 확인 위치는?',...reorder(['CAM-01 외곽 통로 · 연구동과 인접 · 잠금 정상(폐쇄)','CAM-02 격리 A · 연구동과 인접 · 통로 열림 · 마지막 충격 센서 +1','CAM-03 격리 B · 연구동과 연결되지 않음 · 센서 변화 없음'],['외곽 출입구 감시','격리 A 교차 감시','격리 B 순찰'],1)};
 case 'deleted':
  if(!s.facilities.cctv||s.clues<2)return null;
  return {...base,title:'삭제 권한: EVE',scene:'EVE: 제가 지웠다는 서명이 있습니다. 그런데… 그 명령을 실행한 기억이 없습니다. 기록의 사본을 대조해 주세요.',question:'원본 체크섬 8F-21. 정상 백업은 같은 체크섬을 유지한다. 어느 기록을 격리해야 하는가?',...reorder(['저장소 A · EVE 서명 · 8F-21 · 02:18','저장소 B · EVE 서명 · 8F-21 · 02:19','저장소 C · EVE 서명 · 8F-12 · 02:19 · 내용 일부 소실'],['A 원본 격리','B 백업 격리','C 변경본 격리'],2)};
 case 'blackout':{
  if(s.power>45)return null;
  const channel=active?.camera??'CAM-01';
  return {...base,camera:channel,title:'비상 전원 6',scene:'EVE: 조명이 꺼집니다. 모든 영상을 동시에 살릴 수 없습니다. 지금 필요한 회선만 선택하십시오.',question:'비상 버스 용량 6. 경보 위치 '+channel+'의 카메라(3)와 격리문(3)을 모두 유지해야 한다.',...reorder(['경보 카메라(3) + 격리문(3) = 6','다른 카메라(3) + 정화 기록기(2) = 5','경보 카메라(3) + 격리문(3) + 연구동(2) = 8'],[channel+' + 격리문','다른 영상 + 기록기','세 회선 모두 연결'],0)};
 }
 case 'forgery':
  if(!s.headquarters.firstReport)return null;
  return {...base,title:'본부의 두 번째 명령',scene:'본부: 기존 지령을 폐기하십시오. 문을 열고 통신 인증을 중단하십시오. EVE: 방금… 동일한 지령 번호로 서로 다른 패킷이 왔습니다.',question:'정상 지령은 원본 번호 '+(s.hqOrders?.active?.id??'ARK-HQ')+'와 인증값 R7을 동시에 사용한다. 어느 패킷을 차단해야 하는가?',...reorder(['원본 번호 / R7 / 보고 요청','이전 번호 / R7 / 이전 보고 확인','원본 번호 / K2 / 출입 인증 해제'],['원본 보고 차단','보존 기록 삭제','변조 패킷 차단'],2)};
 case 'staff-memory':{
  if(!crew.length)return null;
  const m=crew[day%crew.length],name=CREW_PROFILES[m.id].post,arrived=m.arrivedDay;
  return {...base,title:'그날 당신은 없었다',subject:m.id,scene:name+': 저 복도요. 어제 처음 왔는데… 왜 문 손잡이가 어디 있는지 알고 있죠? EVE: 진술에 기록되지 않은 시간이 있습니다.',question:'현재 시설 근무 개시는 DAY '+arrived+'. 그 이전의 개인 증언은 별도 원본으로 보존해야 한다. 어느 기록을 보호할 것인가?',...reorder(['DAY '+arrived+' · 배치 확인 · 본인 진술','DAY '+Math.max(0,arrived-2)+' · 배치 전 복도 기억 · 본인 진술','DAY '+(arrived+1)+' · 현재 근무 인수 기록'],['배치 확인만 보존','배치 이전 기억을 별도 보존','현재 근무표만 보존'],1)};
 }
 case 'operator-memory':
  if((s.originZero?.photos??0)<4&&s.clues<5)return null;
  return {...base,title:'내가 기억하지 못하는 방',scene:'관리자: 이 번호… 처음 보는 건데 손이 먼저 움직여. EVE: 관리자님의 초기 기록은 DAY 1부터 존재합니다. 그 이전은 아직 확인할 수 없습니다.',question:'초기 기록보다 앞선 자료는 신원 확정 없이 보존해야 한다. 어느 기억이 현재 운영 기록으로 설명되지 않는가?',...reorder(['DAY 1 · 최초 통신 · 현재 관리 기록','DAY '+day+' · 시설 점검 · 현재 관리 기록','DATE UNKNOWN · 초기 통신 이전 · 동일한 문 번호'],['최초 통신 기록','시설 점검 기록','날짜 미상 기억 분리'],2)};
 }
};
function state(s:V10):HorrorState{return s.horror??(s.horror={pending:null,history:[],lastDay:0});}
function record(s:V10,e:HorrorCase,correct:boolean,result:string){
 const h=state(s);h.pending=null;h.history=[{id:e.id,day:s.day,result,correct},...h.history].slice(0,24);
 s.security.history=[{day:s.day,title:e.title,detail:result},...s.security.history].slice(0,24);
 s.lastOutcome=result;log(s,e.title,result,correct?'mystery':'bad');
}
function consequence(s:V10,e:HorrorCase,correct:boolean){
 if(correct){
  s.clues++;s.knowledge+=3;
  switch(e.id){
   case 'loop':s.threat=cap(s.threat-5);break;
   case 'blindspot':s.threat=cap(s.threat-7);if(s.security.incident)s.security.incident.severity=cap(s.security.incident.severity-10);break;
   case 'deleted':s.trust=cap(s.trust+3);break;
   case 'blackout':s.facility=cap(s.facility+3);break;
   case 'forgery':if(s.hqOrders)s.hqOrders.interference=Math.max(0,s.hqOrders.interference-5);s.threat=cap(s.threat-3);break;
   case 'staff-memory':{const m=s.crew?.members.find(m=>m.id===e.subject&&m.mind>0);if(m)m.mind=cap(m.mind+4);s.trust=cap(s.trust+2);break;}
   case 'operator-memory':s.mind=cap(s.mind+2);break;
  }
  record(s,e,true,'증거를 교차 확인했습니다. 단서 +1, 지식 +3. '+({loop:'반복 영상을 분리했습니다. 위협 -5.',blindspot:'열린 경로를 감시합니다. 위협 -7, 진행 중인 격리 위험 -10.',deleted:'삭제본을 분리해 이브의 기록을 보호했습니다. 신뢰 +3.',blackout:'필수 회로를 유지했습니다. 시설 +3.',forgery:'위조 패킷을 차단했습니다. 본부 간섭 -5, 위협 -3.', 'staff-memory':'기억을 강제로 확정하지 않았습니다. 해당 직원 정신 +4, 신뢰 +2.','operator-memory':'날짜 미상 기록을 분리했습니다. 정신 +2.'}[e.id]));
 }else{
  s.threat=cap(s.threat+4);
  switch(e.id){
   case 'loop':s.facility=cap(s.facility-3);break;
   case 'blindspot':if(s.security.incident)s.security.incident.severity=cap(s.security.incident.severity+8);break;
   case 'deleted':s.eve=cap(s.eve-4);break;
   case 'blackout':s.power=cap(s.power-5);s.facility=cap(s.facility-3);break;
   case 'forgery':if(s.hqOrders)s.hqOrders.interference=cap(s.hqOrders.interference+5);break;
   case 'staff-memory':{const m=s.crew?.members.find(m=>m.id===e.subject&&m.mind>0);if(m)m.mind=cap(m.mind-5);queueCrewTerminations(s);break;}
   case 'operator-memory':s.mind=cap(s.mind-4);break;
  }
  record(s,e,false,'신호 대응 실패 또는 기한 초과. 위협 +4. '+({loop:'반복 영상이 실제 움직임을 가렸습니다. 시설 -3.',blindspot:'사각지대가 유지됩니다. 격리 위험 +8.',deleted:'기록이 다시 손상됐습니다. EVE -4.',blackout:'보호기가 차단됐습니다. 전력 -5, 시설 -3.',forgery:'검증이 지연됐습니다. 본부 간섭 +5.','staff-memory':'해당 직원의 기억이 불안정해졌습니다. 정신 -5.','operator-memory':'기억의 공백이 깊어졌습니다. 정신 -4.'}[e.id]));
 }
}
/** Called once during daily settlement, no wall-clock damage. */
export function tickHorror(s:V10){
 if(s.phase!=='day'||s.tutorialStep<9)return;
 const h=state(s);
 if(h.pending&&s.day>=h.pending.expires)consequence(s,h.pending,false);
 if(h.pending||s.day<5||s.day-h.lastDay<3||s.voice?.pending)return;
 const available=horrorIds.map(id=>make(s,id)).filter((x):x is HorrorCase=>!!x);
 const fresh=available.filter(x=>!h.history.some(r=>r.id===x.id));
 const candidates=fresh.length?fresh:available.filter(x=>!h.history.slice(0,2).some(r=>r.id===x.id));
 if(!candidates.length)return;
 const e=candidates[(s.day+Math.floor(s.threat/10))%candidates.length];h.pending=e;h.lastDay=s.day;
 log(s,'관제 이상 기록',e.title+' · CCTV 조사 가능. 다음 두 운영일 내 확인하십시오.','mystery');
}
export function readHorrorRecord(s:V10,index:number):V10{
 const e=s.horror?.pending;if(!e||s.phase!=='day'||s.run||s.pendingIncident||s.voice?.pending||!Number.isInteger(index)||index<0||index>2||e.read.includes(index))return s;
 if(e.read.length>=2&&s.power<1&&s.mind<=1)return s;
 const n=copy(s) as V10,ev=state(n).pending!;
 if(ev.read.length>=2){if(n.power>=1)n.power--;else n.mind=cap(n.mind-1);}
 ev.read.push(index);n.lastOutcome='원본 대조 기록 '+(index+1)+' 확보.';return n;
}
export function resolveHorror(s:V10,choice:number):V10{
 const e=s.horror?.pending;if(!e||s.phase!=='day'||s.run||s.pendingIncident||s.voice?.pending||e.read.length<2||!Number.isInteger(choice)||choice<0||choice>2)return s;
 const n=copy(s) as V10;consequence(n,state(n).pending!,choice===e.answer);return n;
}
