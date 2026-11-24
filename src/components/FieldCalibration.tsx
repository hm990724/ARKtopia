'use client';
import {useEffect,useRef,useState} from 'react';
/** Three bounded timing checks. The caller applies quality exactly once on completion. */
export default function FieldCalibration({title,description,onFinish,onCancel}:{title:string;description:string;onFinish:(quality:number)=>void;onCancel:()=>void}){
 const [position,setPosition]=useState(0),[scores,setScores]=useState<boolean[]>([]);
 const started=useRef(0),value=useRef(0),done=useRef(false),results=useRef<boolean[]>([]);
 const count=scores.length,center=[.34,.68,.48][Math.min(2,count)],complete=count>=3;
 useEffect(()=>{if(complete)return;started.current=performance.now();let raf=0;const tick=(now:number)=>{const p=(now-started.current)/(1450-count*90);value.current=1-Math.abs((p%2)-1);setPosition(value.current);raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[count,complete]);
 function sample(){if(done.current||results.current.length>=3)return;const hits=[...results.current,Math.abs(value.current-center)<=.16];results.current=hits;setScores(hits);if(hits.length===3)done.current=true;}
 return <section className="ark-calibration" aria-label={title}><header><b>{title}</b><small>{count}/3 기록</small></header><p>{description}</p><div className="ark-calibration-track" aria-label="이동하는 안정 신호"><i style={{left:(center-.16)*100+'%',width:'32%'}}/><span style={{left:position*100+'%'}}/></div><div className="ark-calibration-marks">{[0,1,2].map(i=><span key={i} data-hit={scores[i]===undefined?'pending':scores[i]?'yes':'no'}>{scores[i]===undefined?'대기':scores[i]?'일치':'이탈'}</span>)}</div><div className="ark-calibration-actions"><button type="button" onClick={onCancel}>취소</button>{complete?<button type="button" onClick={()=>{if(done.current){done.current=false;onFinish(results.current.filter(Boolean).length/3)}}}>기록 확정 · 실행</button>:<button type="button" onClick={sample}>안정 신호 기록</button>}</div></section>
}
