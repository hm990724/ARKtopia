'use client';
import {useEffect,useRef,useState} from 'react';
export type EmergencyKind='handsearch'|'crank'|'decontam';
export default function EmergencyTask({kind,day,serial,onClose,onFinish}:{kind:EmergencyKind;day:number;serial:number;onClose:()=>void;onFinish:(quality:number)=>void}){
 const [round,setRound]=useState(0),[hits,setHits]=useState(0),[cursor,setCursor]=useState(0),[feedback,setFeedback]=useState('');
 const done=useRef(false);
 useEffect(()=>{if(kind!=='crank'||round>=3)return;let frame=0;const start=performance.now();const tick=()=>{setCursor((performance.now()-start)%1400/14);frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[kind,round]);
 const safe=(day+serial*2)%3;
 const titles={handsearch:'수동 보급 수색',crank:'수동 발전기 조작',decontam:'제독 계통 순차 가동'};
 function finish(q:number){if(done.current)return;done.current=true;onFinish(q)}
 const steps=['흡입 밸브','정화 필터','배출 밸브'];const order=Array.from({length:3},(_,i)=>(i+day)%3);
 const hit=(ok:boolean)=>{setHits(v=>v+(ok?1:0));setRound(v=>v+1);setFeedback(ok?'정상 작동':'작동 오류 · 효율 감소')};
 return <section className="v10-modal ark-emergency-modal"><header><span className="micro-label">ARK / MANUAL OPERATIONS</span><button type="button" onClick={onClose}>취소</button></header><h2>{titles[kind]}</h2>
 {kind==='handsearch'?<><p>낡은 표식을 조사해 보급품이 남은 보관함을 선택하십시오. 선택 즉시 작업이 정산됩니다.</p><div className="ark-emergency-lockers">{[0,1,2].map(i=><button type="button" key={i} onClick={()=>finish(i===safe?1:i===(safe+1)%3?.5:0)}><b>보관함 {i+1}</b><small>{i===safe?'봉인 정상 · 내부 적재 신호':i===(safe+1)%3?'절반 열린 서랍 · 약한 신호':'파손된 문 · 오염 흔적'}</small></button>)}</div><small>AP 1 · 전지 16 · 선택에 따라 물자와 감염 변화</small></>:kind==='crank'?<><p>움직이는 표시가 녹색 구간에 들어왔을 때 발전 레버를 누르세요. 총 세 번의 압축 행정입니다.</p><div className="ark-emergency-track"><i/><b style={{left:Math.min(99,cursor)+'%'}}/></div><strong>압축 {round}/3 · 정상 {hits}/3</strong>{round<3?<button type="button" onClick={()=>hit(cursor>=40&&cursor<=65)}>발전 레버 누르기</button>:<button type="button" onClick={()=>finish(hits/3)}>발전 결과 확정</button>}<small>AP 1 · 정신 14 · 전력 +5~17</small></>:<><p>정화 단말의 현재 활성화 순서를 따라 밸브를 작동하십시오. 오접속 시 정화 효율이 떨어집니다.</p><div className="ark-emergency-sequence">{order.map((x,i)=><span key={i} data-active={i===round}>{i+1}. {steps[x]}</span>)}</div><strong>진행 {round}/3 · 정상 {hits}/3</strong>{round<3?<div className="ark-emergency-lockers">{steps.map((x,i)=><button type="button" key={i} onClick={()=>hit(order[round]===i)}>{x}</button>)}</div>:<button type="button" onClick={()=>finish(hits/3)}>제독 결과 확정</button>}<small>AP 1 · 필터 1 · 감염 -6~26</small></>}
 <p role="status">{feedback}</p></section>
}
