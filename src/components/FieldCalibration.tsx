'use client';
import {useRef,useState} from 'react';
import {calibrationRound,shiftWave,signalQuality} from '@/lib/manual-games';
import ui from './Minigame.module.css';
const path=(data:number[])=>data.map((v,i)=>(i?'L':'M')+(8+i*20)+' '+(63-v*8)).join(' ');
function Wave({reference,live}:{reference:number[];live:number[]}){
 return <svg className={ui.wave} style={{height:100}} viewBox="0 0 136 88" role="img" aria-label={'기준 '+reference.join(', ')+' 현재 '+live.join(', ')}><path className={ui.baseline} d="M0 15H136 M0 39H136 M0 63H136"/><path d={path(reference)} style={{stroke:'#a8b8c5',strokeDasharray:'4 4'}}/><path d={path(live)} style={{stroke:'#76e1d5',strokeWidth:2.6}}/></svg>;
}
/** Reconstruct displaced signals, then submit a single normalized result. */
export default function FieldCalibration({title,description,seed:session=0,onFinish,onCancel}:{title:string;description:string;seed?:number;onFinish:(quality:number)=>void;onCancel:()=>void}){
 const [scores,setScores]=useState<number[]>([]),[phase,setPhase]=useState(0),[bias,setBias]=useState(0);
 const results=useRef<number[]>([]),finished=useRef(false);
 const seed=Array.from(title+description).reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,17+session);
 const round=scores.length,complete=round>=3,{ref,raw}=calibrationRound(seed,Math.min(round,2)),live=shiftWave(raw,phase,bias),quality=signalQuality(ref,live);
 function record(){if(finished.current||results.current.length!==round||round>=3)return;const next=[...results.current,quality];results.current=next;setScores(next);setPhase(0);setBias(0);}
 return <section className={'ark-calibration '+ui.console} aria-label={title}>
 <header className={ui.head}><div><span className={ui.kicker}>ARK / SIGNAL RECONSTRUCTION</span><h3>{title}</h3></div><b>{round}/3</b></header>
 <p>{description}</p>
 {!complete&&<><p>신호의 위상(좌우 이동)과 보정값(높이)을 조절하여 점선 기준과 실선 신호를 복원하세요. 일치도가 실제 작업 품질에 반영됩니다.</p><div className={ui.muted}>점선 · 기준 신호 / 실선 · 현재 신호</div><Wave reference={ref} live={live}/>
 <div className={ui.valve}><b>위상 이동</b><div>현재 {phase}/6</div><div className={ui.actions}><button className={ui.control} aria-label="위상 왼쪽" onClick={()=>setPhase(v=>(v+6)%7)}>←</button><button className={ui.control} aria-label="위상 오른쪽" onClick={()=>setPhase(v=>(v+1)%7)}>→</button></div></div>
 <div className={ui.valve}><b>신호 높이</b><div>현재 {bias>0?'+':''}{bias}</div><div className={ui.actions}><button className={ui.control} aria-label="신호 높이 감소" disabled={bias<=-2} onClick={()=>setBias(v=>Math.max(-2,v-1))}>−</button><button className={ui.control} aria-label="신호 높이 증가" disabled={bias>=2} onClick={()=>setBias(v=>Math.min(2,v+1))}>+</button></div></div>
 <div className={ui.gauge} aria-label={'신호 일치도 '+Math.round(quality*100)+'%'}><i style={{width:quality*100+'%'}}/></div></>}
 <div className={ui.readouts}>{[0,1,2].map(i=><div className={ui.readout} key={i}><small>샘플 {i+1}</small><b>{scores[i]===undefined?'—':Math.round(scores[i]*100)+'%'}</b></div>)}</div>
 <div className={ui.status} role="status">{complete?'분석 완료 · 품질 '+Math.round(scores.reduce((a,b)=>a+b,0)/3*100)+'%':'현재 일치도 '+Math.round(quality*100)+'% · '+(quality===1?'복원 완료':'위상과 높이를 조절하세요.')}</div>
 <div className={ui.actions}><button type="button" className={ui.control} onClick={onCancel}>취소</button>{complete?<button type="button" className={ui.control} onClick={()=>{if(finished.current)return;finished.current=true;onFinish(results.current.reduce((a,b)=>a+b,0)/3)}}>기록 확정 · 실행</button>:<button type="button" className={ui.control} onClick={record}>현재 신호 기록</button>}</div></section>;
}
