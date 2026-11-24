import type {V10} from './game-v10';
import {cap,copy,log} from './sim';
export type ContactField={position:number;visited:number[];clues:number[];noise:number;stamina:number;done:boolean;active:boolean};
export const contactTiles=['wall','wall','track','empty','contact','wall','cover','empty','wall','wall','track','empty','track','cover','wall','empty','wall','wall','empty','wall','entry','empty','empty','empty','wall'] as const;
export const contactPath=[15,10,11,12,7,2,3,4] as const;
function allowed(s:V10){return s.phase==='day'&&s.originZero?.cat==='traced'&&s.originZero.trackProgress===3&&!s.run&&!s.pending&&!s.pendingIncident&&!s.voice?.pending&&!s.headquarters?.pendingAnimal&&!s.crew?.pendingTermination;}
export function startOriginContact(s:V10):V10{
 if(!allowed(s)||s.ap<1||s.originZero?.contactField?.active||s.originZero?.contactField?.done)return s;
 const n=copy(s) as V10;n.ap--;n.originZero!.contactField={position:20,visited:[20],clues:[],noise:0,stamina:100,done:false,active:true};
 n.lastOutcome='외곽 접근 시작. 작은 발자국 세 곳을 확인하고 마지막 이동구까지 직접 이동하십시오.';return n;
}
export function moveOriginContact(s:V10,index:number,pace:'quiet'|'normal'|'fast'='quiet'):V10{
 const field=s.originZero?.contactField;
 if(!allowed(s)||!field?.active||field.done||!Number.isInteger(index)||index<0||index>=25||contactTiles[index]==='wall'||Math.abs(index%5-field.position%5)+Math.abs(Math.floor(index/5)-Math.floor(field.position/5))!==1)return s;
 if(contactTiles[index]==='contact'&&field.clues.length<3)return s;
 const n=copy(s) as V10,d=n.originZero!.contactField!;d.position=index;d.visited=[...new Set([...d.visited,index])];d.noise=cap(d.noise+(pace==='fast'?30:pace==='normal'?9:-5));d.stamina=cap(d.stamina-(pace==='quiet'?6:pace==='normal'?4:3));
 if(contactTiles[index]==='track'&&!d.clues.includes(index)){d.clues.push(index);n.lastOutcome=['긁힌 철판 아래 작은 발자국이 있다. 그림자의 크기와 맞지 않는다.','벽의 실루엣은 광원에 따라 길어졌다. 실제 이동 흔적은 낮게 이어진다.','마지막 발자국. 작은 몸이 철창 아래를 통과했다.'][d.clues.length-1];}
 else n.lastOutcome=contactTiles[index]==='cover'?'엄폐물 뒤로 물러났다. 소리를 낮추고 이동할 수 있다.':'철판 너머에서 발소리가 들린다. 발자국을 잇고 정체를 확인하자.';
 if(d.noise>=80||d.stamina===0){d.active=false;n.mind=cap(n.mind-3);n.threat=cap(n.threat+5);n.lastOutcome='소음 또는 탈진으로 접근을 중단했다. 정신 -3, 위협 +5. 다음 출동에서 다시 시도할 수 있다.';return n;}
 if(index===4){d.done=true;d.active=false;n.lastOutcome='철창 너머의 정체불명 신호에 도달했다. 아직 모습은 확인되지 않았다.';log(n,'외곽 신호 접촉',n.lastOutcome,'mystery');}
 return n;
}
export function retreatOriginContact(s:V10):V10{if(!s.originZero?.contactField?.active)return s;const n=copy(s) as V10;n.originZero!.contactField!.active=false;n.lastOutcome='외곽 접근을 중단했다. 영상 좌표는 보존된다.';return n;}
