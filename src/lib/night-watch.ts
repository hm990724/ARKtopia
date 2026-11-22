import type {V10} from './game-v10';
import {cap,log} from './sim';
export type WatchResponse='observe'|'intervene';
export type WatchReport={day:number;title:string;detail:string;helped:boolean};
export function nightSignal(s:V10){
 if(s.day<4||s.tutorialStep<9)return null;
 const inc=s.security?.incident;
 if(inc&&inc.status!=='escaped')return {kind:'containment',title:'02:13 · 격리문 안쪽의 발소리',cue:inc.manualInspected?'직접 판독한 이상 동선을 따라 순찰하면 오늘 밤 악화를 막을 수 있습니다.':'문을 건드리는 소리가 이어집니다. CCTV에서 바뀐 구역을 먼저 판독하면 안전한 접근 동선을 얻습니다.',cost:'관리자 정신력 -5',benefit:inc.manualInspected?'오늘 밤 격리 단계 악화 방지 · 위험 -18':'위험 -8 · 사전 판독 없이는 단계 악화를 막지 못함'};
 if(s.day%3===1)return {kind:'relay',title:'01:40 · 배전실에서 타는 냄새',cue:'조명이 꺼질 때마다 배전반 온도가 오릅니다. 새벽 전에 손볼지 결정하십시오.',cost:'부품 -2',benefit:'시설 +6 · 방치 시 시설 -4'};
 if(s.day%3===2&&s.animals.some(a=>a.alive))return {kind:'restless',title:'03:05 · 잠들지 못하는 우리',cue:'한 개체의 발소리에 다른 우리도 깨어납니다. 익숙한 급식 루틴으로 진정시킬 수 있습니다.',cost:'식량 -2',benefit:'보호 개체 스트레스 -8 · 방치 시 +3'};
 return {kind:'perimeter',title:'04:12 · 울타리 밖을 지나가는 그림자',cue:'그림자는 정문을 두 번 지나고 멈췄습니다. 경로를 확인하고 조명을 돌리면 멀어집니다.',cost:'관리자 정신력 -5',benefit:'외부 위협 -8 · 관측만 하면 +3'};
}
export function canAnswerNight(s:V10){const e=nightSignal(s);return !!e&&(e.kind==='relay'?s.parts>=2:e.kind==='restless'?s.food>=2:s.mind>5);}
export function chooseNightResponse(s:V10,response:WatchResponse):V10{
 if(s.phase!=='day'||s.run||!s.security||!nightSignal(s)||!['observe','intervene'].includes(response))return s;
 if(response==='intervene'&&!canAnswerNight(s))return s;
 return {...s,security:{...s.security,watchPlan:{day:s.day,response}}};
}
/** Mutates only the cloned day settlement; opening/closing the UI never spends resources. */
export function resolveNightWatch(s:V10){
 const e=nightSignal(s);if(!e||s.security.lastWatch?.day===s.day)return;
 const help=s.security.watchPlan?.day===s.day&&s.security.watchPlan.response==='intervene'&&canAnswerNight(s);
 let result='';
 if(e.kind==='relay'){if(help){s.parts-=2;s.facility=cap(s.facility+6);result='부품 2를 써서 과열 릴레이를 교체했습니다. 시설 +6.'}else{s.facility=cap(s.facility-4);result='과열된 릴레이가 새벽에 멈췄습니다. 시설 -4.'}}
 else if(e.kind==='restless'){for(const a of s.animals.filter(a=>a.alive))a.stress=cap(a.stress+(help?-8:3));if(help)s.food-=2;result=help?'급식 소리를 듣고 우리들이 조용해졌습니다. 식량 -2, 스트레스 -8.':'발소리가 밤새 이어졌습니다. 보호 개체 스트레스 +3.'}
 else if(e.kind==='containment'){const inc=s.security.incident!;if(help){s.mind=cap(s.mind-5);inc.severity=cap(inc.severity-(inc.manualInspected?18:8));if(inc.manualInspected)inc.containedNight=s.day;result=inc.manualInspected?'판독한 흔적을 따라 순찰했습니다. 정신력 -5, 위험 -18. 오늘 밤 격리 단계 악화를 막았습니다.':'소리를 따라 접근했습니다. 정신력 -5, 위험 -8. 판독 자료가 없어 탈출 경로는 막지 못했습니다.';}else result='순찰하지 않았습니다. 격리 위험은 기존 야간 규칙에 따라 진행됩니다.';}
 else{if(help)s.mind=cap(s.mind-5);s.threat=cap(s.threat+(help?-8:3));result=help?'조명을 돌리자 그림자가 숲으로 물러났습니다. 정신력 -5, 위협 -8.':'그림자가 사각지대로 사라졌습니다. 위협 +3.';}
 s.security.lastWatch={day:s.day,title:e.title,detail:result,helped:help};delete s.security.watchPlan;
 s.security.history=[{day:s.day,title:e.title,detail:result},...s.security.history].slice(0,24);log(s,e.title,result,help?'good':'mystery');
}

