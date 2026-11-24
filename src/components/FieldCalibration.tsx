'use client';
import {useRef,useState} from 'react';
import {calibrationRound,signalQuality,type Signal} from '@/lib/manual-games';
import ui from './Minigame.module.css';
function Wave({data}:{data:number[]}){return <svg className={ui.wave} viewBox="0 0 132 58" role="img" aria-label={'신호 '+data.join(', ')}><path className={ui.baseline} d="M0 29H132 M0 10H132 M0 48H132"/><path d={data.map((v,i)=>(i?'L':'M')+(6+i*20)+' '+(50-v*7)).join(' ')}/></svg>;}
/** Analyze competing samples instead of clicking a moving timing bar. */
export default function FieldCalibration({title,description,onFinish,onCancel}:{title:string;description:string;onFinish:(quality:number)=>void;onCancel:()=>void}){
 const [scores,setScores]=useState<number[]>([]),[selected,setSelected]=useState<number|null>(null);
 const results=useRef<number[]>([]),finished=useRef(false);
 const seed=Array.from(title+description).reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,17);
 const round=scores.length,complete=round>=3,{ref,signals}=calibrationRound(seed,Math.min(round,2));
 function record(signal:Signal){if(finished.current||results.current.length!==round||round>=3)return;const next=[...results.current,signalQuality(ref,signal)];results.current=next;setScores(next);setSelected(null);}
 return <section className={'ark-calibration '+ui.console} aria-label={title}>
 <header className={ui.head}><div><span className={ui.kicker}>ARK / SIGNAL ANALYSIS</span><h3>{title}</h3></div><b>{round}/3</b></header>
 <p>기준 파형과 가장 유사하면서 잡음이 적은 신호를 골라 기록하세요. 조급하게 누르는 대신 신호의 패턴과 잡음 수치를 비교하면 품질이 높아집니다.</p>
 {!complete&&<><div><span className={ui.kicker}>기준 파형</span><Wave data={ref}/></div><div className={ui.waveGrid}>{signals.map((signal,i)=><button type="button" key={i} className={ui.control+' '+(selected===i?ui.selected:'')} aria-pressed={selected===i} onClick={()=>setSelected(i)}><b>채널 {i+1} · 잡음 {signal.noise}</b><Wave data={signal.wave}/></button>)}</div></>}
 <div className={ui.readouts}>{[0,1,2].map(i=><div className={ui.readout} key={i}><small>샘플 {i+1}</small><b>{scores[i]===undefined?'—':Math.round(scores[i]*100)+'%'}</b></div>)}</div>
 <div className={ui.status} role="status">{complete?'분석 완료 · 품질 '+Math.round(scores.reduce((a,b)=>a+b,0)/3*100)+'%':selected===null?'분석할 채널을 선택하십시오.':'채널 '+(selected+1)+' 선택됨 · 기록 시 다음 샘플로 이동'}</div>
 <div className={ui.actions}><button type="button" className={ui.control} onClick={onCancel}>취소</button>{complete?<button type="button" className={ui.control} onClick={()=>{if(finished.current)return;finished.current=true;onFinish(results.current.reduce((a,b)=>a+b,0)/3)}}>기록 확정 · 실행</button>:<button type="button" className={ui.control} disabled={selected===null} onClick={()=>{if(selected!==null)record(signals[selected])}}>선택 신호 기록</button>}</div></section>;
}
