'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
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
type Obstacle={id:number;kind:'gate'|'spore';x:number;gap:number;aperture:number;passed:boolean;hit:boolean};
type Point={x:number;y:number};
const COURSE_SPEED=24;
const MINIMUM:Obstacle[]=[
 {id:0,kind:'gate',x:112,gap:.52,aperture:28,passed:false,hit:false},
 {id:1,kind:'spore',x:190,gap:.32,aperture:28,passed:false,hit:false},
 {id:2,kind:'gate',x:268,gap:.31,aperture:28,passed:false,hit:false},
 {id:3,kind:'gate',x:346,gap:.69,aperture:28,passed:false,hit:false},
 {id:4,kind:'spore',x:424,gap:.51,aperture:28,passed:false,hit:false},
];
export function transitBand(tile:Tile,t:number,seed:number){const base=tile==='rubble'?66:tile==='spore'?42:53;const half=tile==='rubble'?12:tile==='spore'?15:19;const center=base+Math.sin(t*3.2+seed%7)*((tile==='rubble'||tile==='spore')?9:5);return {low:center-half,high:center+half};}
export function driveFrame(d:{elapsed:number;stability:number;contamination:number},dt:number,hit?:'wall'|'spore'){
 return {...d,elapsed:d.elapsed+dt,stability:clamp(d.stability-(hit==='wall'?15:hit==='spore'?6:0)),contamination:clamp(d.contamination+(hit==='spore'?12:0))};
}
export default function TransportMission({seed,animal,room,initialContamination,onCancel,onFinish,chance,guided=false}:{seed:number;animal:string;room:string;initialContamination:number;onCancel:()=>void;onFinish:(quality:number)=>void;chance:(quality:number)=>number;guided?:boolean}){
 const hazards=useRef<Obstacle[]>(MINIMUM.map((h,i)=>({...h,gap:guided?(.35+((i*17+seed%23)%30)/100):Math.max(.25,Math.min(.75,h.gap+(((seed+i*19)%9)-4)/100)),aperture:guided&&h.kind==='gate'?42:28})));
 const arena=useRef<HTMLDivElement>(null),player=useRef<Point>({x:16,y:50}),hitIds=useRef(new Set<number>()),lastHit=useRef(0),finished=useRef(false);
 const [phase,setPhase]=useState<'route'|'report'>('route'),[pos,setPos]=useState<Point>({x:16,y:50}),[elapsed,setElapsed]=useState(0),[stability,setStability]=useState(100),[contamination,setContamination]=useState(Math.min(20,Math.floor(initialContamination/5))),[impact,setImpact]=useState(''),[passed,setPassed]=useState(0),[serviceUsed,setServiceUsed]=useState(false),[log,setLog]=useState('마우스를 움직여 캡슐을 조종하세요. 위아래 벽의 틈을 통과하고 포자 구름을 피하면 됩니다.');
 const state=useRef({elapsed:0,stability:100,contamination:Math.min(20,Math.floor(initialContamination/5))});
 function steer(clientX:number,clientY:number){const rect=arena.current?.getBoundingClientRect();if(!rect)return;const point={x:Math.max(7,Math.min(91,(clientX-rect.left)/rect.width*100)),y:Math.max(10,Math.min(90,(clientY-rect.top)/rect.height*100))};player.current=point;setPos(point)}
 useEffect(()=>{let last=performance.now();const timer=window.setInterval(()=>{if(phase!=='route')return;const now=performance.now(),dt=Math.min(.08,(now-last)/1000);last=now;const before=state.current,next={...before,elapsed:before.elapsed+dt};state.current=next;setElapsed(next.elapsed);let crossed=0;
  hazards.current=hazards.current.map(h=>{const x=h.x-next.elapsed*COURSE_SPEED;if(!h.passed&&x<player.current.x){h.passed=true;crossed++;}if(Math.abs(x-player.current.x)<4.2&&!hitIds.current.has(h.id)){const collision=h.kind==='gate'?player.current.y<h.gap*100-h.aperture/2||player.current.y>h.gap*100+h.aperture/2:Math.hypot((x-player.current.x)*.55,player.current.y-h.gap*100)<10;if(collision&&now-lastHit.current>500){hitIds.current.add(h.id);lastHit.current=now;const updated=driveFrame(next,0,h.kind==='gate'?'wall':'spore');state.current=updated;setStability(updated.stability);setContamination(updated.contamination);const message=h.kind==='gate'?'벽 충돌 · 안정도 -15':'포자 접촉 · 안정도 -6 · 오염 +12';setImpact(message);setLog(message);window.setTimeout(()=>setImpact(''),1250);}}
   return h;});if(crossed){setPassed(n=>n+crossed);setLog('장애물 통과 · 다음 틈을 확인하세요.');}
  if(next.elapsed>=18.2||next.stability<=0){setPhase('report');setLog(next.stability<=0?'캡슐 안정 한계 도달 · 비상 이송으로 전환합니다.':'도킹 신호 도착 · 이송 경로를 통과했습니다.');}
 },33);
 const keyDown=(e:KeyboardEvent)=>{const dirs:{[key:string]:[number,number]}={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};const v=dirs[e.key];if(!v)return;e.preventDefault();const p={x:Math.max(7,Math.min(91,player.current.x+v[0]*3)),y:Math.max(10,Math.min(90,player.current.y+v[1]*5))};player.current=p;setPos(p)};
 window.addEventListener('keydown',keyDown);return()=>{clearInterval(timer);window.removeEventListener('keydown',keyDown)};
 },[phase]);
 const transit:Transit={position:0,stability,contamination,power:20,steps:passed,visited:[],log,emergency:stability<=0},q=transportQuality(transit);
 const stabilize=()=>{if(serviceUsed||phase!=='route'||state.current.elapsed<1.5)return;setServiceUsed(true);const prev=state.current,next={...prev,stability:clamp(prev.stability+15),contamination:clamp(prev.contamination-15)};state.current=next;setStability(next.stability);setContamination(next.contamination);setLog('비상 완충 작동 · 안정도 회복 · 오염 일부 차단');};
 return <section className="ark-transport ark-transport-dodge" data-instability={stability<=55?'high':stability<=75?'warning':'stable'} aria-label="격리 이송 작전">
  <header className="ark-transport-head"><div><small>ARK / CONTAINMENT TRANSIT</small><h3>{animal} · {room} 이송</h3></div>{phase==='route'&&elapsed<1&&<button type="button" onClick={onCancel}>취소</button>}</header>
  <div className="ark-transport-vitals">{[['개체 안정도',stability,100],['오염도',contamination,100],['통과 장애물',passed,hazards.current.length],['도킹 진행',Math.min(100,Math.round(elapsed/18.2*100)),100]].map(([label,value,max])=><div key={String(label)} data-vital={String(label)}><small>{label}</small><b>{label==='통과 장애물'?`${value}/${max}`:`${value}${label==='도킹 진행'?'%':'/100'}`}</b><meter min={0} max={Number(max)} value={Number(value)}/></div>)}</div>
  {phase==='route'?<><p><b>조종:</b> 마우스를 움직여 캡슐을 좌우·상하로 피하세요. 방향키/WASD도 사용할 수 있습니다. 벽에 부딪히면 안정도가 크게 떨어지고, 포자에 닿으면 오염이 오릅니다.</p>
   {guided&&<aside className="ark-transit-tutorial" role="status"><b>EVE · 첫 격리 이송 실습</b><span>화면 안에서 마우스를 움직여 캡슐을 옮기세요. 위아래 벽 사이의 열린 틈을 지나고 보라색 포자 구름은 피하면 됩니다. 충돌하면 피해가 바로 표시됩니다.</span></aside>}
   <div className="ark-transit-arena-wrap"><div className="ark-transit-arena" ref={arena} onPointerMove={e=>steer(e.clientX,e.clientY)} onPointerDown={e=>steer(e.clientX,e.clientY)} role="application" aria-label="마우스로 캡슐을 조종해 격리 이송 장애물을 피하세요">
    <div className="ark-transit-lane-markings"/><div className="ark-transit-depth"/>
    {hazards.current.map(h=>{const x=h.x-elapsed*COURSE_SPEED;if(x < -12 || x>115)return null;return h.kind==='gate'?<div key={h.id} className="ark-transit-gate" style={{left:`${x}%`,'--gap-top':`${Math.max(8,h.gap*100-h.aperture/2)}%`,'--gap-bottom':`${Math.min(92,h.gap*100+h.aperture/2)}%`} as CSSProperties} aria-label="위아래 벽 장애물"><i/><b/><span>통과 틈</span></div>:<div key={h.id} className="ark-transit-spore" style={{left:`${x}%`,top:`${h.gap*100}%`}} aria-label="포자 구름">✺</div>})}
    <div className="ark-transit-player" style={{left:`${pos.x}%`,top:`${pos.y}%`}}><CapsulePod/></div><div className="ark-transit-dock-line"><span>격리실 도킹 베이</span></div>
    {impact&&<div className="ark-transit-impact" role="alert">{impact}</div>}
   </div><div className="ark-transit-arena-foot"><span>← → ↑ ↓ / WASD</span><span>통과 {passed} · 남은 경로 {Math.max(0,18.2-elapsed).toFixed(0)}초</span></div></div>
   <div className="ark-transport-log" role="status">{log}</div><button type="button" disabled={serviceUsed||elapsed<1.5||stability>=100&&contamination===0} onClick={stabilize}>{serviceUsed?'완충 장치 사용 완료':'비상 완충 · 1회'}</button><small>벽 충돌은 캡슐 안정도를 크게 떨어뜨립니다. 낮은 안정도는 최종 구조 판정에 반영됩니다.</small>
  </>:<><h4>{stability<=0?'비상 수동 이송 전환':'격리실 도킹 완료'}</h4><div className="ark-transport-score"><div>이송 품질 <b>{Math.round(q*100)}%</b></div><div>최종 구조 성공률 <b>{chance(q)}%</b></div></div><div className="ark-transport-log" role="status">{log}</div><button type="button" className="ark-transport-confirm" onClick={()=>{if(finished.current)return;finished.current=true;onFinish(q);}}>격리 이송 결과 확정</button></>}
 </section>
}
