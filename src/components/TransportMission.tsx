'use client';
import {useRef,useState} from 'react';
type Tile='floor'|'spore'|'rubble'|'wall'|'dock';
type Mode='steady'|'brace'|'rush';
type Modules={stabilizer:number;filter:number;shield:number};
type Transit={position:number;stability:number;contamination:number;power:number;steps:number;visited:number[];log:string;emergency:boolean};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const START=20,DOCK=4,MAX_STEPS=14;
const modules=[['stabilizer','진동 제어','거친 이동과 개체 동요를 줄입니다.'],['filter','오염 차단','포자 구역 통과 시 오염을 줄입니다.'],['shield','차폐 프레임','붕괴 지형의 충격을 줄입니다.']] as const;
const labels:Record<Tile,string>={floor:'안전',spore:'포자',rubble:'잔해',wall:'차단',dock:'도킹'};
const modes:Record<Mode,{name:string;hint:string;cost:number}>={steady:{name:'저속 운송',hint:'전력 2 · 안정도 유지',cost:2},brace:{name:'충격 완충',hint:'전력 3 · 잔해 충격 완화',cost:3},rush:{name:'신속 통과',hint:'전력 1 · 안정도 감소',cost:1}};
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
export function transportQuality(s:Transit){const value=(s.stability*.62+(100-s.contamination)*.30+Math.min(100,s.power*12)*.08)/100;return Math.max(0,Math.min(s.emergency?.25:1,value));}
export default function TransportMission({seed,animal,room,initialContamination,onCancel,onFinish,chance}:{seed:number;animal:string;room:string;initialContamination:number;onCancel:()=>void;onFinish:(quality:number)=>void;chance:(quality:number)=>number}){
 const [board]=useState(()=>transportBoard(seed));
 const [allocation,setAllocation]=useState<Modules>({stabilizer:2,filter:2,shield:2});
 const [phase,setPhase]=useState<'prep'|'route'|'report'>('prep');
 const [mode,setMode]=useState<Mode>('steady');
 const [transit,setTransit]=useState<Transit>({position:START,stability:100,contamination:0,power:16,steps:0,visited:[START],log:'운송 대기',emergency:false});
 const live=useRef<Transit|null>(null),finished=useRef(false);
 const remaining=9-allocation.stabilizer-allocation.filter-allocation.shield;
 const adjust=(key:keyof Modules,delta:number)=>setAllocation(old=>{const value=old[key]+delta;if(value<1||value>5||old.stabilizer+old.filter+old.shield+delta>9)return old;return {...old,[key]:value};});
 function start(){if(live.current)return;const next={...transit,power:13+remaining,contamination:Math.min(20,Math.floor(initialContamination/5)),log:'캡슐 봉인 완료 · 목적지까지 운송하십시오.'};live.current=next;setTransit(next);setPhase('route');}
 function move(to:number){const previous=live.current;if(!previous||phase!=='route')return;const next=transportStep(previous,to,mode,board,allocation);if(next===previous)return;live.current=next;setTransit(next);if(to===DOCK||next.emergency)setPhase('report');}
 const q=transportQuality(transit);
 return <section className="ark-transport" aria-label="격리 이송 작전"><header className="ark-transport-head"><div><small>ARK / CONTAINMENT TRANSIT</small><h3>{animal} · {room} 이송</h3></div>{phase==='prep'&&<button type="button" onClick={onCancel}>취소</button>}</header><div className="ark-transport-phases">{['01 장치 배분','02 직접 운송','03 도킹 정산'].map((label,i)=><span key={label} data-active={i===['prep','route','report'].indexOf(phase)}>{label}</span>)}</div>
 {phase==='prep'?<><p>캡슐 전력 9칸을 세 장치에 나누세요. 미배정 전력은 운송 배터리로 전환됩니다. 모든 장치는 최소 1칸이 필요합니다.</p><strong className="ark-transport-budget">미배정 전력 {remaining}/9</strong>{modules.map(([key,title,desc])=><div className="ark-transport-module" key={key}><div><b>{title}</b><small>{desc}</small></div><button type="button" disabled={allocation[key]<=1} onClick={()=>adjust(key,-1)} aria-label={title+' 전력 감소'}>−</button><meter min={0} max={5} value={allocation[key]}/><b>{allocation[key]}</b><button type="button" disabled={remaining<=0||allocation[key]>=5} onClick={()=>adjust(key,1)} aria-label={title+' 전력 증가'}>+</button></div>)}<div className="ark-transport-preview" aria-label="운송 경로 사전 판독">{board.map((t,i)=><span key={i} data-tile={t}>{i===START?'S':t==='dock'?'D':t==='wall'?'■':t==='spore'?'✳':t==='rubble'?'△':'·'}</span>)}</div><small>경로 사전 판독 · S 출발 / D 도킹 / ✳ 포자 / △ 잔해 / ■ 차단</small><button type="button" className="ark-transport-confirm" onClick={start}>캡슐 봉인 · 운송 시작</button></>:<>
 <div className="ark-transport-vitals"><div><small>개체 안정도</small><b>{transit.stability}%</b><meter min={0} max={100} value={transit.stability}/></div><div><small>오염도</small><b>{transit.contamination}%</b><meter min={0} max={100} value={transit.contamination}/></div><div><small>운송 전력</small><b>{transit.power}</b><meter min={0} max={16} value={transit.power}/></div><div><small>이동 횟수</small><b>{transit.steps}/{MAX_STEPS}</b></div></div>
 {phase==='route'?<><p>인접 칸을 눌러 도킹 구역까지 운송하세요. 전력이 떨어져도 수동 운반은 가능하지만 안정도가 낮아집니다.</p><div className="ark-transport-modes">{(Object.keys(modes) as Mode[]).map(k=><button key={k} type="button" aria-pressed={mode===k} onClick={()=>setMode(k)}><b>{modes[k].name}</b><small>{modes[k].hint}</small></button>)}</div><div className="ark-transport-grid" role="group" aria-label="이송 경로">{board.map((tile,i)=>{const here=i===transit.position,available=transportAdjacent(transit.position,i)&&tile!=='wall';return <button key={i} type="button" disabled={!available} data-tile={tile} data-here={here} data-visited={transit.visited.includes(i)} aria-label={String.fromCharCode(65+i%5)+(Math.floor(i/5)+1)+' '+(here?'현재 위치':labels[tile])} onClick={()=>move(i)}><b>{here?'▣':tile==='dock'?'D':tile==='wall'?'■':tile==='spore'?'✳':tile==='rubble'?'△':transit.visited.includes(i)?'✓':'·'}</b><small>{here?'캡슐':labels[tile]}</small></button>})}</div><div className="ark-transport-log" role="status">{transit.log}</div></>:<><h4>{transit.emergency?'비상 수동 이송 전환':'격리실 도킹 완료'}</h4><p>{transit.emergency?'경로 확보 실패로 비상 회수 절차를 적용합니다. 이송 품질이 크게 감소합니다.':'차폐 캡슐의 마지막 생체 신호를 확인했습니다.'}</p><div className="ark-transport-score"><div>이송 품질 <b>{Math.round(q*100)}%</b></div><div>최종 구조 성공률 <b>{chance(q)}%</b></div></div><button type="button" className="ark-transport-confirm" onClick={()=>{if(finished.current)return;finished.current=true;onFinish(q);}}>격리 이송 결과 확정</button></>}
 </>}
 </section>
}
