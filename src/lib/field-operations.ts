import type {V10} from './game-v10';
import type {CrewId} from './crew';
import {copy,cap,log} from './sim';

export type NightRepair={day:number;status:'active'|'success'|'failed';remaining:number;paused:boolean;wires:number[];loads:number[];crew:CrewId|null;mistakes:number};
export type Operations={version:68;cameraDay:number;reports:Record<string,boolean>;attempts:Record<string,number>;correct:number;falseAlarms:number;missed:number;night:NightRepair|null;lastFeedback:string};
export const emptyOperations=():Operations=>({version:68,cameraDay:0,reports:{},attempts:{},correct:0,falseAlarms:0,missed:0,night:null,lastFeedback:''});
export function operations(s:V10):Operations{
 const o=s.operations??(s.operations=emptyOperations());
 if(o.cameraDay!==s.day){o.cameraDay=s.day;o.reports={};o.attempts={};}
 return o;
}
export const cameraNames=['격리동','보급 창고','외곽 통로'];
export const sceneObjects=['격리문','급식대','보안등'] as const;
export function cameraChange(s:V10,camera:number):number|null{
 if(camera===0)return (s.day-1)%3;
 if(camera===1)return null;
 return s.threat>=50?(s.day+1)%3:null;
}
export function reportCamera(s:V10,camera:number,object:number|null):V10{
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident||!Number.isInteger(camera)||camera<0||camera>2||(object!==null&&(!Number.isInteger(object)||object<0||object>2)))return s;
 const old=s.operations?.cameraDay===s.day?s.operations:null;
 if(old?.reports[String(camera)]!==undefined)return s;
 const n=copy(s) as V10,o=operations(n),key=String(camera),expected=cameraChange(s,camera);
 const correct=expected===object;o.attempts[key]=(o.attempts[key]??0)+1;
 if(correct){o.reports[key]=true;o.correct++;n.knowledge+=2;n.threat=cap(n.threat-3);n.clues+=expected===null?0:1;
  o.lastFeedback=expected===null?'기준 영상과 일치합니다. 정상 보고를 기록했습니다.':`${sceneObjects[expected]}의 변화 확인. 경보를 조정하고 추적 단서를 보존했습니다.`;
 }else{
  o.falseAlarms++;n.power=cap(n.power-2);n.threat=cap(n.threat+2);
  if(o.attempts[key]>=3)o.reports[key]=false;
  o.lastFeedback=`기준 영상과 다시 비교하세요. ${object===null?'변화가 남아 있습니다.':'선택한 물체는 이상 지점과 일치하지 않습니다.'} 전력 -2 · ${o.attempts[key]>=3?'오늘의 재검사 종료':'재검사 가능'}`;
 }
 n.lastOutcome=o.lastFeedback;log(n,correct?'CCTV 판독 완료':'CCTV 오탐',o.lastFeedback,correct?'good':'bad');return n;
}
export function settleCameraDay(s:V10):void{
 const o=operations(s);
 const missed=cameraNames.filter((_,i)=>cameraChange(s,i)!==null&&o.reports[String(i)]!==true).length;
 if(missed){o.missed+=missed;s.threat=cap(s.threat+missed*3);log(s,'미확인 CCTV 변화',`확인하지 못한 변화 ${missed}건. 외곽 위협 +${missed*3}. 내일 다시 감시할 수 있습니다.`,'bad');}
}
export function startNightRepair(s:V10,crew:CrewId|null):V10{
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident||s.operations?.night?.day===s.day)return s;
 if(crew&&!s.crew?.members.some(m=>m.id===crew&&m.mind>=25))return s;
 const n=copy(s) as V10,o=operations(n);
 o.night={day:s.day,status:'active',remaining:75+(crew==='wolf'?20:0),paused:false,wires:[-1,-1,-1],loads:[0,0,0],crew,mistakes:0};
 o.lastFeedback='전원이 끊겼습니다. 퓨즈 표식을 맞추고 격리문 2 · 관측 1 · 환기 1로 전력을 배치하세요.';
 return n;
}
export type RepairCommand={type:'wire';socket:number;fuse:number}|{type:'load';circuit:number}|{type:'pause'}|{type:'tick'}|{type:'submit'}|{type:'abandon'};
export const FUSE_TARGET=[2,0,1];
export function operateNightRepair(s:V10,command:RepairCommand):V10{
 const old=s.operations?.night;
 if(!old||old.day!==s.day||old.status!=='active'||s.phase!=='day')return s;
 if(command.type==='wire'&&(!Number.isInteger(command.socket)||command.socket<0||command.socket>2||!Number.isInteger(command.fuse)||command.fuse<0||command.fuse>2))return s;
 if(command.type==='load'&&(!Number.isInteger(command.circuit)||command.circuit<0||command.circuit>2))return s;
 if(old.paused&&command.type!=='pause'&&command.type!=='abandon')return s;
 const n=copy(s) as V10,o=operations(n),r=o.night!;
 if(command.type==='pause')r.paused=!r.paused;
 if(command.type==='wire'){r.wires=r.wires.map((v,i)=>i===command.socket?command.fuse:v===command.fuse?-1:v);}
 if(command.type==='load')r.loads[command.circuit]=(r.loads[command.circuit]+1)%3;
 if(command.type==='tick')r.remaining=Math.max(0,r.remaining-1);
 if(command.type==='submit'){
  const wired=r.wires.every((v,i)=>v===FUSE_TARGET[i]),powered=r.loads.every((v,i)=>v===[2,1,1][i]);
  if(wired&&powered){r.status='success';n.power=cap(n.power+12);n.facility=cap(n.facility+10);n.threat=cap(n.threat-5);o.lastFeedback='전원 복구 성공 · 전력 +12 · 시설 +10 · 외곽 위협 -5.';}
  else{r.mistakes++;r.remaining=Math.max(0,r.remaining-(r.crew==='deer'?4:8));o.lastFeedback=!wired?'퓨즈 표식이 맞지 않습니다. 소켓과 같은 표식으로 연결하세요.':'전력 배치가 맞지 않습니다. 격리문 2 · 관측 1 · 환기 1을 확인하세요.';}
 }
 if((r.remaining===0||command.type==='abandon')&&r.status==='active'){
  r.status='failed';n.facility=cap(n.facility-(r.crew==='fox'?6:12));n.threat=cap(n.threat+8);
  if(r.crew!=='rabbit')for(const a of n.animals.filter(a=>a.alive))a.stress=cap(a.stress+6);
  o.lastFeedback='복구 시간 초과 · 시설 손상과 경보가 남았습니다. 하루를 마치거나 낮 정비로 복구할 수 있습니다.';
 }
 if(r.status!=='active'){
  const member=n.crew?.members.find(m=>m.id===r.crew);if(member)member.mind=cap(member.mind-4);
  log(n,'야간 직접 복구',o.lastFeedback,r.status==='success'?'good':'bad');
 }
 n.lastOutcome=o.lastFeedback;return n;
}
