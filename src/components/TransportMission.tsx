'use client';
import {useRef,useState} from 'react';
type Tile='floor'|'spore'|'rubble'|'wall'|'dock';
type Mode='steady'|'brace'|'rush';
type Modules={stabilizer:number;filter:number;shield:number};
type Transit={position:number;stability:number;contamination:number;power:number;steps:number;visited:number[];log:string;emergency:boolean};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const START=20,DOCK=4,MAX_STEPS=14;
const labels:Record<Tile,string>={floor:'안전',spore:'포자',rubble:'잔해',wall:'차단',dock:'도킹'};
const modes:Record<Mode,{name:string;hint:string;cost:number}>={steady:{name:'저속 운송',hint:'전력 2 · 안전 지형',cost:2},brace:{name:'충격 완충',hint:'전력 3 · 잔해 피해 감소',cost:3},rush:{name:'신속 통과',hint:'전력 1 · 포자 노출 감소',cost:1}};
export function transportBoard(seed:number):Tile[]{return Array.from({length:25},(_,i)=>{if(i===DOCK)return 'dock';if(i===START)return 'floor';if([6,8,16,18].includes(i))return 'wall';const r=((Math.imul(seed+17,1103515245)^Math.imul(i+11,2654435761))>>>0)%100;return r<30?'spore':r<56?'rubble':'floor';});}
export function transportAdjacent(a:number,b:number){return b>=0&&b<25&&Math.abs(a%5-b%5)+Math.abs(Math.floor(a/5)-Math.floor(b/5))===1;}
export function transportStep(s:Transit,to:number,mode:Mode,board:Tile[],m:Modules):Transit{
 if(s.position===DOCK||s.steps>=MAX_STEPS||!transportAdjacent(s.position,to)||board[to]==='wall')return s;
 const tile=board[to],cost=modes[mode].cost,underpowered=s.power<cost;
 const motion=mode==='rush'?10:mode==='brace'?1:3;
 const shock=tile==='rubble'?Math.max(0,18-m.shield*3-(mode==='brace'?12:0)):0;
 const spores=tile==='spore'?Math.max(1,21-m.filter*4+(mode==='steady'?2:mode==='rush'?-4:0)):0;
 const stress=Math.max(0,motion-m.stabilizer)+shock+(underpowered?9:0);
 const steps=s.steps+1,emergency=steps>=MAX_STEPS&&to!==DOCK;
 return {position:to,stability:clamp(s.stability-stress),contamination:clamp(s.contamination+spores),power:Math.max(0,s.power-cost),steps,visited:[...s.visited,to],emergency,log:(tile==='dock'?'도킹 구역 도착':labels[tile]+' 구역 통과')+' · 안정 -'+stress+' / 오염 +'+spores+(underpowered?' · 비상 수동 운반':'')};
}
export function transportQuality(s:Transit){const value=(s.stability*.62+(100-s.contamination)*.30+Math.min(100,s.power*5)*.08)/100;return Math.max(0,Math.min(s.emergency?.25:1,value));}
export default function TransportMission({seed,animal,room,initialContamination,onCancel,onFinish,chance}:{seed:number;animal:string;room:string;initialContamination:number;onCancel:()=>void;onFinish:(quality:number)=>void;chance:(quality:number)=>number}){
 const [board]=useState(()=>transportBoard(seed));
 const [phase,setPhase]=useState<'route'|'report'>('route');
 const [mode,setMode]=useState<Mode>('steady');
 const [transit,setTransit]=useState<Transit>(()=>({position:START,stability:100,contamination:Math.min(20,Math.floor(initialContamination/5)),power:20,steps:0,visited:[START],log:'출발 준비 완료 · D 도킹 지점까지 운송하세요.',emergency:false}));
 const [serviceUsed,setServiceUsed]=useState(false);
 const live=useRef(transit),finished=useRef(false),service=useRef(false);
 const allocation:Modules={stabilizer:2,filter:2,shield:2};
 function move(to:number){if(phase!=='route')return;const next=transportStep(live.current,to,mode,board,allocation);if(next===live.current)return;live.current=next;setTransit(next);if(to===DOCK||next.emergency)setPhase('report');}
 function stabilize(){const prev=live.current;if(service.current||prev.power<4||phase!=='route'||prev.position===DOCK||prev.emergency)return;service.current=true;setServiceUsed(true);const next={...prev,power:prev.power-4,stability:clamp(prev.stability+20),contamination:clamp(prev.contamination-20),log:'비상 캡슐 정비 · 전력 -4 / 안정 최대 +20 / 오염 최대 -20'};live.current=next;setTransit(next);}
 const q=transportQuality(transit);
 return <section className="ark-transport" aria-label="격리 이송 작전">
 <header className="ark-transport-head"><div><small>ARK / CONTAINMENT TRANSIT</small><h3>{animal} · {room} 이송</h3></div>{phase==='route'&&transit.steps===0&&!serviceUsed&&<button type="button" onClick={onCancel}>취소</button>}</header>
 <div className="ark-transport-vitals"><div><small>개체 안정도</small><b>{transit.stability}%</b><meter min={0} max={100} value={transit.stability}/></div><div><small>오염도</small><b>{transit.contamination}%</b><meter min={0} max={100} value={transit.contamination}/></div><div><small>캡슐 전력</small><b>{transit.power}/20</b><meter min={0} max={20} value={transit.power}/></div><div><small>이동 제한</small><b>{transit.steps}/{MAX_STEPS}</b></div></div>
 {phase==='route'?<>
 <p><b>목표:</b> 캡슐 ▣을 도킹 지점 D까지 옮기세요. 인접 칸에 예상 피해가 표시됩니다. 안전 칸을 우선 선택하고, 위험 지형에는 운송 모드를 바꾸세요.</p>
 <div className="ark-transport-modes">{(Object.keys(modes) as Mode[]).map(k=><button key={k} type="button" aria-pressed={mode===k} onClick={()=>setMode(k)}><b>{modes[k].name}</b><small>{modes[k].hint}</small></button>)}</div>
 <div className="ark-transport-grid ark-transport-tactical" role="group" aria-label="이송 경로">{board.map((tile,i)=>{const here=i===transit.position,available=transportAdjacent(transit.position,i)&&tile!=='wall';const preview=available?transportStep(transit,i,mode,board,allocation):null;return <button key={i} type="button" disabled={!available} data-tile={tile} data-here={here} data-visited={transit.visited.includes(i)} aria-label={String.fromCharCode(65+i%5)+(Math.floor(i/5)+1)+' '+(here?'현재 위치':labels[tile])+(preview?' 안정 '+(preview.stability-transit.stability)+' 오염 +'+(preview.contamination-transit.contamination):'')} onClick={()=>move(i)}><b>{here?'▣':tile==='dock'?'D':tile==='wall'?'■':tile==='spore'?'✳':tile==='rubble'?'△':transit.visited.includes(i)?'✓':'·'}</b><small>{here?'캡슐':labels[tile]}</small>{preview&&<small className="ark-transit-preview">안정 {preview.stability-transit.stability}<br/>오염 +{preview.contamination-transit.contamination}</small>}</button>})}</div>
 <button type="button" disabled={serviceUsed||transit.power<4||transit.steps===0||transit.stability===100&&transit.contamination===0} onClick={stabilize}>{serviceUsed?'비상 정비 사용 완료':'비상 정비 (1회) · 전력 4 / 안정 +20 / 오염 -20'}</button>
 <div className="ark-transport-log" role="status">{transit.log}</div><small>현재 품질 기준 구조 성공률 {chance(q)}% · 전력 고갈 시 수동 운반으로 안정도 추가 감소</small>
 </>:<><h4>{transit.emergency?'비상 수동 이송 전환':'격리실 도킹 완료'}</h4><p>{transit.emergency?'이동 제한에 도달하여 비상 회수합니다. 이송 품질이 크게 감소합니다.':'캡슐이 지정 격리실에 도착했습니다.'}</p><div className="ark-transport-score"><div>이송 품질 <b>{Math.round(q*100)}%</b></div><div>최종 구조 성공률 <b>{chance(q)}%</b></div></div><button type="button" className="ark-transport-confirm" onClick={()=>{if(finished.current)return;finished.current=true;onFinish(q);}}>격리 이송 결과 확정</button></>}
 </section>
}
