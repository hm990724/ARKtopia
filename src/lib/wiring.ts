import type {V10} from './game-v10';
import {cap,copy,log} from './sim';
export type WiringMode='recharge'|'night';
export type WiringState={day:number;mode:WiringMode;serial:number;layout?:number;rotations:number[];faults:number;completed:boolean};
const SIZE=4,N=1,E=2,S=4,W=8;
const routes=[[[0,1],[1,2],[2,3],[1,5],[5,6],[6,10],[10,9],[9,8],[8,12],[10,11],[11,15]],[[0,4],[4,8],[8,12],[4,5],[5,6],[6,7],[7,3],[6,10],[10,14],[14,15]],[[0,1],[1,2],[2,3],[1,5],[5,9],[9,13],[13,12],[9,10],[10,11],[11,15]]] as const;
const rotate=(mask:number,steps:number)=>{let m=mask;for(let i=0;i<steps%4;i++)m=((m<<1)&15)|(m>>3);return m};
export function wiringMasks(layout=0){const masks=Array(16).fill(0) as number[];for(const [a,b] of routes[layout]??routes[0]){const d=b-a,bit=d===1?E:d===-1?W:d===SIZE?S:N;masks[a]|=bit;masks[b]|=rotate(bit,2);}return masks;}
export function wiringBoard(s:V10,mode:WiringMode):WiringState{
 const prior=s.wiring?.[mode];if(prior?.day===s.day&&(!prior.completed||mode==='night'))return prior;
 const serial=prior?.day===s.day?prior.serial+1:0,seed=s.day*31+serial*19+(mode==='night'?7:0);
 const rotations=Array.from({length:16},(_,i)=>{let x=Math.imul(seed+1+i*97,0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return (x^(x>>>16))&3;});rotations[0]=1+(seed%3);
 return {day:s.day,mode,serial,layout:(s.day+serial+(mode==='night'?1:0))%routes.length,rotations,faults:0,completed:false};
}
export function wiringStatus(board:WiringState){
 const masks=wiringMasks(board.layout).map((m,i)=>rotate(m,board.rotations[i]??0)),visited=new Set<number>([0]),queue=[0];let leaks=0;
 for(let k=0;k<queue.length;k++){const at=queue[k];for(const [bit,offset,valid] of [[N,-4,at>=4],[E,1,at%4<3],[S,4,at<12],[W,-1,at%4>0]] as const){if(!(masks[at]&bit))continue;const next=at+offset;if(!valid||!(masks[next]&rotate(bit,2))){leaks++;continue;}if(!visited.has(next)){visited.add(next);queue.push(next);}}}
 const sinks=[3,12,15].filter(x=>visited.has(x));return {masks,energized:[...visited],leaks,sinks,valid:sinks.length===3&&leaks===0};
}
function permitted(s:V10,mode:WiringMode){return s.phase==='day'&&!s.run&&!s.pending&&!s.pendingIncident&&!s.voice?.pending&&(mode==='night'||s.ap>=1&&s.parts>=1);}
export function rotateWiring(s:V10,mode:WiringMode,index:number):V10{
 const board=wiringBoard(s,mode);if(!permitted(s,mode)||board.completed||board.faults>=3||!Number.isInteger(index)||index<0||index>=16||!wiringMasks(board.layout)[index])return s;
 const n=copy(s) as V10;const next={...board,rotations:[...board.rotations]};next.rotations[index]=(next.rotations[index]+1)%4;n.wiring={...n.wiring,[mode]:next};return n;
}
export function testWiring(s:V10,mode:WiringMode):V10{
 const b=wiringBoard(s,mode);if(!permitted(s,mode)||b.completed||b.faults>=3)return s;
 const n=copy(s) as V10,next={...b,rotations:[...b.rotations]};n.wiring={...n.wiring,[mode]:next};
 if(!wiringStatus(b).valid){next.faults++;n.power=cap(n.power-4);n.facility=cap(n.facility-3);n.threat=cap(n.threat+3);n.lastOutcome='보호 차단기 작동 · 연결 오류. 전력 -4, 시설 -3, 위협 +3.';log(n,'배선 오접속',n.lastOutcome,'bad');return n;}
 next.completed=true;
 if(mode==='night'){n.nightCircuit={day:n.day,order:[0,1,2,3],faults:next.faults,completed:true};n.lastOutcome='세 계통 연결 완료. 야간 운영 시 전력 +4, 시설 안정 +6.';}
 else{n.ap--;n.parts--;n.power=cap(n.power+(n.origin==='engineer'?37:28));n.flashlight=cap(n.flashlight+12);n.lastOutcome='발전기 계통 복구 · AP -1, 부품 -1. 시설 전력 회복 및 손전등 +12.';}
 log(n,'배전반 회로 복구',n.lastOutcome,'good');return n;
}
