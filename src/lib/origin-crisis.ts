import type {V10} from './game-v10';
import {cap,copy,log} from './sim';
import {originCrisisAvailable,resolveOriginCrisis} from './origin-zero';
export type CrisisAction='powered'|'manual';
export const crisisStages=(route:'hq'|'shelter')=>route==='hq'?[{title:'통신 신호 확인',description:'본부의 원격 연구 지령과 실제 생체 경보를 대조한다.',cost:3},{title:'실험 중단 요청',description:'과도한 공명 제어권을 확보한다.',cost:5},{title:'증거 기록 복제',description:'삭제될 수 있는 원본 데이터를 별도로 보존한다.',cost:4}]:[{title:'외곽 CCTV 확인',description:'회수팀이 접근한 방향과 격리문 경보를 확인한다.',cost:3},{title:'격리 차폐 보강',description:'원격 잠금 장치로 개체 보호 시간을 확보한다.',cost:5},{title:'비상 기록 보존',description:'개체의 관찰 기록을 독립 단말에 저장한다.',cost:4}];
export function advanceOriginEmergency(s:V10,action:CrisisAction):V10{
 if(!originCrisisAvailable(s)||!s.originZero?.route||s.originZero.photos<7||!['powered','manual'].includes(action))return s;
 const old=s.originZero.crisisSession??{step:0,actions:[],quality:0},stage=crisisStages(s.originZero.route)[old.step];if(!stage||action==='powered'&&s.power<stage.cost)return s;
 const n=copy(s) as V10;const session={step:old.step+1,actions:[...old.actions,action],quality:old.quality+(action==='powered'?2:1)};n.originZero!.crisisSession=session;
 if(action==='powered')n.power=cap(n.power-stage.cost);else {n.mind=cap(n.mind-2);n.threat=cap(n.threat+3);}
 n.lastOutcome=stage.title+' 완료 · '+(action==='powered'?'전력 '+stage.cost+' 사용':'수동 대응 · 정신 -2 / 위협 +3');log(n,'최종 위기 대응',n.lastOutcome,'mystery');return n;
}
export function finishOriginEmergency(s:V10,choice:'protect'|'knowledge'):V10{
 if(!originCrisisAvailable(s)||s.originZero?.crisisSession?.step!==3||!['protect','knowledge'].includes(choice))return s;
 const n=resolveOriginCrisis(s,choice);if(n===s)return s;
 const quality=s.originZero.crisisSession.quality;n.knowledge+=quality;n.lastOutcome+=' · 비상 기록 품질 '+quality+'/6, 지식 +'+quality;return n;
}
