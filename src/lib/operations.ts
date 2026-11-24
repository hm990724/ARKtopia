/** Saved abstract game instruments; no real-world treatment procedures. */
import type {V10} from './game-v10';
import {doBase} from './game-v10';
import {treatCrew,type CrewId} from './crew';
import {restoreOriginPhoto} from './origin-zero';
import {copy,cap,log} from './sim';
export type OperationMode='photo'|'repair'|'medical';
export type OperationBoard={key:string;order:number[];faults:number;verified:boolean};
export type OperationStore=Partial<Record<OperationMode,OperationBoard>>;
export type OperationMastery=Partial<Record<OperationMode,number>>;
export const operationNames:Record<OperationMode,string>={photo:'손상된 기록 조각 복원',repair:'격리문 잠금장치 복원',medical:'직원 신경 안정화 단말'};
function keyFor(s:V10,mode:OperationMode,id?:CrewId){return mode==='photo'?'photo-'+(s.originZero?.photos??0):mode==='medical'?'med-'+s.day+'-'+id:'repair-'+s.day+'-'+s.facility+'-'+s.ap+'-'+s.parts;}
function hash(key:string){return Array.from(key).reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,23);}
export function operationTarget(s:V10,mode:OperationMode,id?:CrewId):number[]{
 const seed=hash(keyFor(s,mode,id));const a=[0,1,2,3];for(let k=3;k>0;k--){const j=(seed>>>((3-k)*4))%(k+1);[a[k],a[j]]=[a[j],a[k]];}return a;
}
export function operationBoard(s:V10,mode:OperationMode,id?:CrewId):OperationBoard{
 const key=keyFor(s,mode,id),prior=s.operations?.[mode];
 if(prior?.key===key&&Array.isArray(prior.order)&&prior.order.length===4&&new Set(prior.order).size===4&&prior.order.every(x=>Number.isInteger(x)&&x>=0&&x<4))return prior;
 const a=operationTarget(s,mode,id);return {key,order:[a[2],a[0],a[3],a[1]],faults:0,verified:false};
}
export function operationAllowed(s:V10,mode:OperationMode,id?:CrewId){
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident||s.voice?.pending||s.crew?.pendingTermination||s.originZero?.contactField?.active)return false;
 if(mode==='photo')return !!s.originZero?.route&&s.originZero.photos<12&&s.ap>=1&&s.power>=4;
 if(mode==='repair')return s.ap>=1&&s.parts>=1;
 const m=s.crew?.members.find(c=>c.id===id);return !!m&&m.mind>0&&m.lastCareDay!==s.day&&s.ap>=2&&s.medicine>=1;
}
function store(s:V10,mode:OperationMode,b:OperationBoard){const n=copy(s) as V10;n.operations={...n.operations,[mode]:b};return n;}
export function swapOperation(s:V10,mode:OperationMode,a:number,b:number,id?:CrewId):V10{
 if(!operationAllowed(s,mode,id)||![a,b].every(x=>Number.isInteger(x)&&x>=0&&x<4)||a===b)return s;
 const prior=operationBoard(s,mode,id);if(prior.verified)return s;const order=[...prior.order];[order[a],order[b]]=[order[b],order[a]];return store(s,mode,{...prior,order});
}
export function verifyOperation(s:V10,mode:OperationMode,id?:CrewId):V10{
 if(!operationAllowed(s,mode,id))return s;const prior=operationBoard(s,mode,id);if(prior.verified)return s;
 const target=operationTarget(s,mode,id),ok=target.every((v,i)=>prior.order[i]===v);
 const n=store(s,mode,{...prior,verified:ok,faults:prior.faults+(ok?0:1)});
 if(ok)n.lastOutcome='정렬 검증 완료. 실제 작업을 확정할 수 있습니다.';
 else{if(mode==='medical'){const member=n.crew?.members.find(c=>c.id===id);if(member)member.mind=Math.max(1,member.mind-1);}else{n.power=cap(n.power-2);}n.lastOutcome=mode==='medical'?'단말 불일치. 정신 안정도 -1. 의약품은 아직 소모되지 않았습니다.':'검증 오류. 전력 -2. 원본 조각은 보존됩니다.';log(n,'작업 검증 실패',n.lastOutcome,'bad');}return n;
}
export function operationAssisted(s:V10,mode:OperationMode,id?:CrewId){return mode!=='photo'&&(s.operationMastery?.[mode]??0)>=3&&operationAllowed(s,mode,id);}
export function assistOperation(s:V10,mode:OperationMode,id?:CrewId):V10{
 if(!operationAssisted(s,mode,id))return s;const prior=operationBoard(s,mode,id);return store(s,mode,{...prior,order:operationTarget(s,mode,id),verified:true});
}
export function finishOperation(s:V10,mode:OperationMode,id?:CrewId,answer?:number):V10{
 if(!operationAllowed(s,mode,id)||!operationBoard(s,mode,id).verified)return s;
 if(mode==='photo'&&(answer===undefined||!Number.isInteger(answer)))return s;
 const n=mode==='photo'?restoreOriginPhoto(s,answer!):mode==='repair'?doBase(s,'repair'):id?treatCrew(s,id,'medical'):s;
 if(n===s)return s;
 if(mode==='photo'&&n.originZero?.photos===s.originZero?.photos)return n;
 if(n.operations)delete n.operations[mode];n.operationMastery={...n.operationMastery,[mode]:(n.operationMastery?.[mode]??0)+1};return n;
}
