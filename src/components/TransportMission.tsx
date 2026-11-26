'use client';
import {useEffect,useRef,useState} from 'react';
type Tile='floor'|'spore'|'rubble'|'wall'|'dock';
type Mode='steady'|'brace'|'rush';
type Modules={stabilizer:number;filter:number;shield:number};
type Transit={position:number;stability:number;contamination:number;power:number;steps:number;visited:number[];log:string;emergency:boolean};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const START=20,DOCK=4,MAX_STEPS=14;
const labels:Record<Tile,string>={floor:'안전',spore:'포자',rubble:'잔해',wall:'차단',dock:'도킹'};
const modes:Record<Mode,{name:string;hint:string;cost:number}>={steady:{name:'저속 운송',hint:'전력 2 · 안전 지형',cost:2},brace:{name:'충격 완충',hint:'전력 3 · 잔해 피해 감소',cost:3},rush:{name:'신속 통과',hint:'전력 1 · 포자 노출 감소',cost:1}};
function CapsulePod({small=false}:{small?:boolean}){return <svg className={'ark-capsule-pod'+(small?' is-small':'')} viewBox="0 0 48 64" aria-hidden="true"><path d="M24 2 38 13v35L24 62 10 48V13z" fill="#293944" stroke="#bdebd8" strokeWidth="2"/><path d="M15 17h18v22H15z" fill="#14232d" stroke="#87cbb5" strokeWidth="2"/><path d="M18 21h12v13H18z" fill="#70c7d1" opacity=".8"/><path d="M20 25h8v6h-8z" fill="#d8f9e8" opacity=".8"/><path d="M13 43h22M18 49h12" stroke="#efbf8c" strokeWidth="3" strokeLinecap="round"/><circle cx="24" cy="12" r="2" fill="#f4d38b"/></svg>}
export function transportBoard(seed:number):Tile[]{return Array.from({length:25},(_,i)=>{if(i===DOCK)return 'dock';if(i===START)return 'floor';if([6,8,16,18].includes(i))return 'wall';const r=((Math.imul(seed+17,1103515245)^Math.imul(i+11,2654435761))>>>0)%100;return r<30?'spore':r<56?'rubble':'floor';});}
export function transportAdjacent(a:number,b:number){return b>=0&&b<25&&Math.abs(a%5-b%5)+Math.abs(Math.floor(a/5)-Math.floor(b/5))===1;}
export function transportStep(s:Transit,to:number,mode:Mode,board:Tile[],m:Modules,controlQuality=0):Transit{
 if(s.position===DOCK||s.steps>=MAX_STEPS||!transportAdjacent(s.position,to)||board[to]==='wall')return s;
 const tile=board[to],cost=modes[mode].cost,underpowered=s.power<cost;
 const motion=mode==='rush'?10:mode==='brace'?1:3;
 const shock=tile==='rubble'?Math.max(0,18-m.shield*3-(mode==='brace'?12:0)):0;
 const spores=tile==='spore'?Math.max(1,21-m.filter*4+(mode==='steady'?2:mode==='rush'?-4:0)):0;
 const quality=clamp(controlQuality*100)/100;const stress=2+Math.round((Math.max(0,motion-m.stabilizer)+shock+7)*(1-quality*.75))+(underpowered?9:0);
 const steps=s.steps+1,emergency=steps>=MAX_STEPS&&to!==DOCK;
 return {position:to,stability:clamp(s.stability-stress),contamination:clamp(s.contamination+Math.round(spores*(1-quality*.65))),power:Math.max(0,s.power-cost),steps,visited:[...s.visited,to],emergency,log:(tile==='dock'?'도킹 구역 도착':labels[tile]+' 구역 통과')+' · 안정 -'+stress+' / 오염 +'+Math.round(spores*(1-quality*.65))+(underpowered?' · 비상 수동 운반':'')};
}
export function transportQuality(s:Transit){const value=(s.stability*.62+(100-s.contamination)*.30+Math.min(100,s.power*5)*.08)/100;return Math.max(0,Math.min(s.emergency?.25:1,value));}
type Drive={to:number;elapsed:number;height:number;velocity:number;good:number;total:number};
const DURATION=2.6;
export function transitBand(tile:Tile,t:number,seed:number){const base=tile==='rubble'?66:tile==='spore'?42:53;const half=tile==='rubble'?12:tile==='spore'?15:19;const center=base+Math.sin(t*3.2+seed%7)*((tile==='rubble'||tile==='spore')?9:5);return {low:center-half,high:center+half};}
export function driveFrame(d:Drive,held:boolean,dt:number,tile:Tile,seed:number):Drive{
 const elapsed=Math.min(DURATION,d.elapsed+dt),velocity=Math.max(-43,Math.min(43,d.velocity+(held?135:-115)*dt));
 const height=clamp(d.height+velocity*dt),band=transitBand(tile,elapsed,seed),time=elapsed-d.elapsed;
 return {...d,elapsed,velocity,height,good:d.good+(height>=band.low&&height<=band.high?time:0),total:d.total+time};
}
export default function TransportMission({seed,animal,room,initialContamination,onCancel,onFinish,chance}:{seed:number;animal:string;room:string;initialContamination:number;onCancel:()=>void;onFinish:(quality:number)=>void;chance:(quality:number)=>number}){
 const [board]=useState(()=>transportBoard(seed));
 const [phase,setPhase]=useState<'route'|'report'>('route');
 const [transit,setTransit]=useState<Transit>(()=>({position:START,stability:100,contamination:Math.min(20,Math.floor(initialContamination/5)),power:20,steps:0,visited:[START],log:'인접 칸 선택 후 스페이스바로 캡슐을 조종하세요.',emergency:false}));
 const [drive,setDrive]=useState<Drive|null>(null),[serviceUsed,setServiceUsed]=useState(false);
 const live=useRef(transit),finished=useRef(false),service=useRef(false),active=useRef<Drive|null>(null),held=useRef(false);
 const driveTo=drive?.to;
 function begin(to:number){if(active.current||phase!=='route'||!transportAdjacent(live.current.position,to)||board[to]==='wall')return;const d={to,elapsed:0,height:50,velocity:0,good:0,total:0};held.current=false;active.current=d;setDrive(d);}
 useEffect(()=>{
 if(driveTo===undefined)return;
 let raf=0,last=performance.now();
 const down=(e:KeyboardEvent)=>{if(e.code==='Space'){e.preventDefault();held.current=true;}};
 const up=(e:KeyboardEvent)=>{if(e.code==='Space'){e.preventDefault();held.current=false;}};
 const release=()=>{held.current=false;};
 const tick=(now:number)=>{const current=active.current;if(!current)return;const dt=Math.min(.05,(now-last)/1000);last=now;const next=driveFrame(current,held.current,dt,board[driveTo],seed+live.current.steps);active.current=next;setDrive(next);
 if(next.elapsed>=DURATION){const quality=next.good/Math.max(.01,next.total),tile=board[driveTo];const result=transportStep(live.current,driveTo,tile==='rubble'?'brace':tile==='spore'?'rush':'steady',board,{stabilizer:2,filter:2,shield:2},quality);result.log+=' · 운행 제어 '+Math.round(quality*100)+'%';live.current=result;setTransit(result);active.current=null;held.current=false;setDrive(null);if(driveTo===DOCK||result.emergency)setPhase('report');return;}
 raf=requestAnimationFrame(tick);};
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);raf=requestAnimationFrame(tick);
 return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',release);held.current=false;};
 },[driveTo,board,seed]);
 function stabilize(){const prev=live.current;if(active.current||service.current||prev.power<4||phase!=='route'||prev.position===DOCK||prev.emergency)return;service.current=true;setServiceUsed(true);const next={...prev,power:prev.power-4,stability:clamp(prev.stability+15),contamination:clamp(prev.contamination-15),log:'비상 정비 · 전력 -4 / 안정 최대 +15 / 오염 최대 -15'};live.current=next;setTransit(next);}
 const q=transportQuality(transit),band=drive?transitBand(board[drive.to],drive.elapsed,seed+transit.steps):null;
 return <section className="ark-transport" data-instability={transit.stability<=55?'high':transit.stability<=75?'warning':'stable'} aria-label="격리 이송 작전">
 <header className="ark-transport-head"><div><small>ARK / CONTAINMENT TRANSIT</small><h3>{animal} · {room} 이송</h3></div>{phase==='route'&&!drive&&transit.steps===0&&!serviceUsed&&<button type="button" onClick={onCancel}>취소</button>}</header>
 <div className="ark-transport-vitals">{[['개체 안정도',transit.stability,100],['오염도',transit.contamination,100],['캡슐 전력',transit.power,20],['이동 제한',transit.steps,MAX_STEPS]].map(([label,value,max])=><div key={String(label)} data-vital={String(label)}><small>{label}</small><b>{value}/{max}</b><meter min={0} max={Number(max)} value={Number(value)}/></div>)}</div>
 {phase==='route'?<>
 <p><b>목표:</b> 도킹 D까지 운송하세요. 이동할 칸을 선택한 뒤 스페이스바를 누르면 캡슐 상승, 떼면 하강합니다. 움직이는 안정 구간 안에 오래 유지할수록 충격과 오염이 줄어듭니다.</p>
 <div className="ark-transport-drive-layout"><section className="ark-transit-board" aria-label="캡슐 이동 지도"><header><span>격리 이송 경로</span><small>ROUTE A–E / 01–05</small></header><div className="ark-transport-grid ark-transport-tactical" role="group" aria-label="이송 경로">{board.map((tile,i)=>{const here=i===transit.position,available=!drive&&transportAdjacent(transit.position,i)&&tile!=='wall';return <button key={i} type="button" disabled={!available} data-tile={tile} data-here={here} data-target={drive?.to===i} data-visited={transit.visited.includes(i)} onClick={()=>begin(i)} aria-label={String.fromCharCode(65+i%5)+(Math.floor(i/5)+1)+' '+(here?'현재 위치':labels[tile])}><b>{here?<CapsulePod small/>:tile==='dock'?<span className="ark-dock-glyph">D</span>:tile==='wall'?<span className="ark-wall-glyph">▰</span>:tile==='spore'?<span className="ark-spore-glyph">✳</span>:tile==='rubble'?<span className="ark-rubble-glyph">⬡</span>:transit.visited.includes(i)?<span className="ark-visited-glyph">✓</span>:<span className="ark-floor-glyph">·</span>}</b><small>{here?'이송 캡슐':labels[tile]}</small></button>})}</div><footer><span><i className="ark-route-dot safe"/>안전 구간</span><span><i className="ark-route-dot hazard"/>포자</span><span><i className="ark-route-dot blocked"/>잔해·차단</span><span><i className="ark-route-dot dock"/>도킹</span></footer></section>
 <div className="ark-drive-console"><b>{drive?labels[board[drive.to]]+' 구역 운행 중':'운행 대기 · 인접 칸 선택'}</b><div className="ark-drive-track"><div className="ark-drive-band" style={{bottom:(band?.low??35)+'%',height:((band?.high??65)-(band?.low??35))+'%'}}/><div className="ark-drive-capsule" style={{bottom:(drive?.height??50)+'%'}}><CapsulePod/></div><small>안정 구간</small></div><meter min={0} max={DURATION} value={drive?.elapsed??0}/><small>{drive?'제어 일치 '+Math.round(drive.good/Math.max(.01,drive.total)*100)+'%':'안전 지형은 넓은 구간, 잔해는 좁은 구간'}</small><button type="button" disabled={!drive} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);held.current=true}} onPointerUp={()=>{held.current=false}} onPointerCancel={()=>{held.current=false}} onLostPointerCapture={()=>{held.current=false}}>꾹 누르기 · 상승 (SPACE)</button></div></div>
 <button type="button" disabled={!!drive||serviceUsed||transit.power<4||transit.steps===0||transit.stability===100&&transit.contamination===0} onClick={stabilize}>{serviceUsed?'비상 정비 사용 완료':'비상 정비 (1회) · 전력 4 / 안정 +15 / 오염 -15'}</button><div className="ark-transport-log" role="status">{transit.log}</div><small>현재 구조 성공률 {chance(q)}% · 완벽한 제어도 최소 이동 충격이 발생합니다.</small>
 </>:<><h4>{transit.emergency?'비상 수동 이송 전환':'격리실 도킹 완료'}</h4><div className="ark-transport-score"><div>이송 품질 <b>{Math.round(q*100)}%</b></div><div>최종 구조 성공률 <b>{chance(q)}%</b></div></div><button type="button" className="ark-transport-confirm" onClick={()=>{if(finished.current)return;finished.current=true;onFinish(q);}}>격리 이송 결과 확정</button></>}
 </section>
}
