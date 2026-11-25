'use client';
import {useRef,useState} from 'react';
type Signal={gain:number;frequency:number;phase:number};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function signalTarget(seed:number,stage:number):Signal{
 const n=Math.abs(seed+stage*37);return {gain:35+(n%5)*12,frequency:2+(Math.floor(n/5)%4),phase:(Math.floor(n/20)%8)*45};
}
export function signalQuality(target:Signal,value:Signal,stage:number){
 const gain=Math.abs(target.gain-value.gain)/65;
 const freq=Math.abs(target.frequency-value.frequency)/3;
 const phase=Math.min(Math.abs(target.phase-value.phase),360-Math.abs(target.phase-value.phase))/180;
 return clamp(1-(stage===0?gain:(freq*.55+phase*.45)));
}
const symbols=['A','B','C','D'];
const patterns=[[0,1,0,-1,0],[0,1,1,0,-1],[0,-1,0,1,0],[0,.5,-1,.5,0]];
export function memoryPattern(seed:number){const order=[0,1,2,3];for(let i=3;i>0;i--){const j=(Math.abs(seed)+i*17)%(i+1);[order[i],order[j]]=[order[j],order[i]];}return order;}
export function memoryQuality(target:number[],actual:number[]){return target.filter((v,i)=>actual[i]===v).length/target.length;}
function wave(v:Signal){return Array.from({length:121},(_,i)=>{const x=10+i*2.5,y=55-Math.sin(i/120*Math.PI*2*v.frequency+v.phase*Math.PI/180)*v.gain*.45;return x.toFixed(1)+','+y.toFixed(1)}).join(' ');}
function Segment({id}:{id:number}){return <svg viewBox="0 0 64 36" aria-hidden="true"><path d="M0 18H64" stroke="#4c5f65" strokeDasharray="2 3"/><polyline points={patterns[id].map((v,i)=>(4+i*14)+','+(18-v*12)).join(' ')} stroke="#a8e0c9" strokeWidth="2" fill="none" strokeLinejoin="round"/></svg>}
export default function NeuralSyncPuzzle({seed,stage,onCancel,onFinish}:{seed:number;stage:number;onCancel:()=>void;onFinish:(quality:number)=>void}){
 const target=signalTarget(seed,stage);
 const [value,setValue]=useState<Signal>(()=>stage===0?{...target,gain:target.gain>=60?20:95}:{...target,frequency:target.frequency===5?2:target.frequency+1,phase:(target.phase+135)%360});
 const [order,setOrder]=useState(()=>{const p=memoryPattern(seed+79);return [p[2],p[0],p[3],p[1]];});
 const expected=memoryPattern(seed+79);
 const [picked,setPicked]=useState<number|null>(null);
 const done=useRef(false),dragFrom=useRef<number|null>(null);
 const quality=stage===2?memoryQuality(expected,order):signalQuality(target,value,stage);
 function swap(a:number,b:number){if(a===b||a<0||a>3||b<0||b>3)return;setOrder(old=>{const next=[...old];[next[a],next[b]]=[next[b],next[a]];return next;});setPicked(null);}
 const title=['환경 신호 조율','신경 파형 동기화','기억 파편 재배열'][stage]??'신경 동기화';
 return <section className="ark-neural-puzzle" aria-label={title}>
 <header><div><small>NEURAL INTERFACE / 0{stage+1}</small><h4>{title}</h4></div><strong data-ready={quality>=.65}>일치율 {Math.round(quality*100)}%</strong></header>
 {stage!==2?<><p>{stage===0?'강도 슬라이더를 끌어서 두 파형의 높이를 맞추세요.':'주파수와 위상을 움직여 두 파형의 간격과 위치를 맞추세요.'}</p>
 <div className="ark-neural-wave"><svg viewBox="0 0 320 110" role="img" aria-label="기준 신호와 입력 신호 비교">{[15,35,55,75,95].map(y=><line key={y} x1="10" x2="310" y1={y} y2={y} stroke="#34474c" strokeWidth=".7"/>)}{[10,60,110,160,210,260,310].map(x=><line key={x} x1={x} x2={x} y1="5" y2="105" stroke="#34474c" strokeWidth=".7"/>)}<polyline points={wave(target)} stroke="#b8a2d9" strokeWidth="2.2" strokeDasharray="5 3" fill="none"/><polyline points={wave(value)} stroke="#91e1c0" strokeWidth="2" fill="none"/></svg><div><span>┄ 기준 신호</span><span>━ 현재 입력</span></div></div>
 <div className="ark-neural-sliders">{(stage===0?[['gain','신호 강도',10,100,1]]:[['frequency','주파수',2,5,1],['phase','위상',0,315,15]] as const).map(([key,label,min,max,step])=><label key={key}><span>{label}<b>{value[key as keyof Signal]}{key==='phase'?'°':key==='frequency'?' Hz':'%'}</b></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value[key as keyof Signal]} onChange={e=>setValue(old=>({...old,[key]:Number(e.target.value)}))}/></label>)}</div></>:<>
 <p>아래 신호 파편을 끌어서 위쪽 원본 기록과 같은 순서로 배열하세요. 터치 화면에서는 두 파편을 차례로 선택해 교환할 수 있습니다.</p>
 <small>원본 신호</small><div className="ark-neural-fragments reference">{expected.map((id,i)=><div key={i}><Segment id={id}/><span>{symbols[id]}</span></div>)}</div>
 <small>복원 중인 신호</small><div className="ark-neural-fragments">{order.map((id,i)=><button type="button" key={id} draggable aria-label={'신호 '+symbols[id]+' 위치 '+(i+1)} aria-pressed={picked===i} data-match={id===expected[i]} onDragStart={e=>{dragFrom.current=i;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(i));}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragFrom.current!==null)swap(dragFrom.current,i);dragFrom.current=null;}} onDragEnd={()=>{dragFrom.current=null;setPicked(null)}} onClick={()=>picked===null?setPicked(i):swap(picked,i)}><Segment id={id}/><span>{symbols[id]} · {id===expected[i]?'일치':'미정렬'}</span></button>)}</div></>}
 <meter min={0} max={100} value={quality*100} aria-label="신호 일치율"/><p className="ark-neural-note">{quality>=.85?'신호 안정 · 기록에 적합합니다.':quality>=.65?'허용 범위 · 추가 조율하면 정확도가 올라갑니다.':'불안정 · 조율을 계속하거나 불일치 상태로 기록할 수 있습니다.'}</p>
 <footer><button type="button" onClick={onCancel}>선택 취소</button><button type="button" onClick={()=>{if(done.current)return;done.current=true;onFinish(quality);}}>공명 기록 확정 · {Math.round(quality*100)}%</button></footer>
 </section>
}
