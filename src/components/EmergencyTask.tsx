'use client';
import {useRef,useState} from 'react';
import {adjustFlow,crankStep,flowScore,flowTargets,generatorDemand,generatorQuality,initialGenerator,searchBoard,searchQuality,searchSignal,SEARCH_SCANS,SEARCH_PICKS,FLOW_CAPACITY,type CrankAction} from '@/lib/manual-games';
import ui from './Minigame.module.css';
export type EmergencyKind='handsearch'|'crank'|'decontam';
type Finish=(quality:number)=>void;
const titles={handsearch:'암전 구역 · 보급 수색',crank:'비상 발전기 · 부하 제어',decontam:'제독 계통 · 압력 분배'};
function Meter({name,value,max,hot=false}:{name:string;value:number;max:number;hot?:boolean}){return <div className={ui.readout}><small>{name}</small><b>{value}/{max}</b><div className={ui.gauge}><i className={hot?ui.hot:undefined} style={{width:Math.min(100,value/max*100)+'%'}}/></div></div>}
function Search({seed,finish}:{seed:number;finish:Finish}){
 const board=searchBoard(seed);
 const [state,setState]=useState<{scans:number[];picks:number[];mode:'scan'|'recover'}>({scans:[],picks:[],mode:'scan'});
 const done=state.picks.length>=SEARCH_PICKS;
 const quality=searchQuality(board,state.picks);
 function interact(i:number){setState(s=>{
  if(s.picks.length>=SEARCH_PICKS||s.picks.includes(i))return s;
  if(s.mode==='scan'){if(s.scans.length>=SEARCH_SCANS||s.scans.includes(i))return s;return {...s,scans:[...s.scans,i]};}
  return {...s,picks:[...s.picks,i]};
 });}
 return <>
 <p>5×4 보관 구역에서 물자 두 곳을 회수하세요. 스캐너는 선택 칸과 상하좌우의 물자·오염 신호 수를 표시합니다. 서로 겹치는 범위를 비교해 위치를 좁히세요.</p>
 <div className={ui.readouts}><Meter name="탐지 잔여" value={SEARCH_SCANS-state.scans.length} max={SEARCH_SCANS}/><Meter name="회수 완료" value={state.picks.length} max={SEARCH_PICKS}/></div>
 <div className={ui.actions}><button className={ui.control+' '+(state.mode==='scan'?ui.selected:'')} aria-pressed={state.mode==='scan'} disabled={done} onClick={()=>setState(s=>({...s,mode:'scan'}))}>01 · 신호 탐지</button><button className={ui.control+' '+(state.mode==='recover'?ui.selected:'')} aria-pressed={state.mode==='recover'} disabled={done} onClick={()=>setState(s=>({...s,mode:'recover'}))}>02 · 물자 회수</button></div>
 <div className={ui.grid}>{board.map((cell,i)=>{const scanned=state.scans.includes(i),picked=state.picks.includes(i),signal=scanned?searchSignal(board,i):null;return <button type="button" key={i} className={[ui.control,ui.cell,picked?(cell==='supply'?ui.good:cell==='hazard'?ui.bad:ui.selected):scanned?ui.selected:''].join(' ')} disabled={done||picked||(state.mode==='scan'&&(scanned||state.scans.length>=SEARCH_SCANS))} aria-label={'구역 '+(i+1)+(picked?' '+(cell==='supply'?'물자':cell==='hazard'?'오염':'빈칸'):signal?' 물자 '+signal.supply+' 오염 '+signal.hazard:' 미확인')} onClick={()=>interact(i)}><b>{String(i+1).padStart(2,'0')}</b>{picked?<span>{cell==='supply'?'물자 확보':cell==='hazard'?'오염 노출':'빈 보관함'}</span>:signal?<><span>물자 {signal.supply}</span><span>오염 {signal.hazard}</span></>:<span>· · ·</span>}</button>})}</div>
 <div className={ui.status} role="status">{done?'회수 완료 · 품질 '+Math.round(quality*100)+'%':state.mode==='scan'?'스캔 모드 · 조사한 칸의 주변 신호가 표시됩니다.':'회수 모드 · 선택한 칸의 내용이 공개됩니다. 오염은 회수 품질을 감소시킵니다.'}</div>
 <button className={ui.control} disabled={!done} onClick={()=>finish(quality)}>회수 결과 확정</button><small className={ui.muted}>AP 1 · 전지 16 · 회수 품질에 따라 기존 물자/감염 정산</small></>;
}
function Crank({seed,finish}:{seed:number;finish:Finish}){
 const demand=generatorDemand(seed),[s,setS]=useState(initialGenerator);
 const done=s.step>=demand.length,total=demand.reduce((a,b)=>a+b,0);
 const actions:{id:CrankAction;label:string;detail:string}[]=[{id:'drive',label:'고출력 구동',detail:'압력 +3 / 열 +3'},{id:'steady',label:'저속 구동',detail:'압력 +2 / 열 +1'},{id:'vent',label:'냉각 밸브',detail:'압력 -1 / 열 -4'}];
 return <>
 <p>8회의 부하를 버티면서 발전량을 최대화하세요. 다음 부하를 미리 보고 압력을 확보하거나 냉각하세요. 열이 8에 도달하면 차단기가 작동해 해당 회차 출력이 사라집니다.</p>
 <div className={ui.readouts}><Meter name="압력" value={s.pressure} max={6}/><Meter name="발열" value={s.heat} max={8} hot={s.heat>=5}/><Meter name="전력 생산" value={s.output} max={total}/></div>
 <div className={ui.readouts}>{demand.map((d,i)=><div className={ui.readout} key={i} style={{opacity:i<s.step ? 0.45 : 1,borderColor:i===s.step?'#8de3df':undefined}}><small>{i<s.step?'처리':i===s.step?'현재 부하':'예정'} {i+1}</small><b>{d}</b></div>)}</div>
 <div className={ui.actions}>{actions.map(a=><button key={a.id} className={ui.control} disabled={done} onClick={()=>setS(old=>crankStep(old,a.id,demand))}><b>{a.label}</b><div>{a.detail}</div></button>)}</div>
 <div className={ui.status} role="status">부하 {s.step}/{demand.length} · 차단 {s.trips}회 · {done?'발전 품질 '+Math.round(generatorQuality(s,demand)*100)+'%':'다음 부하 '+demand[s.step]}</div>
 <button className={ui.control} disabled={!done} onClick={()=>finish(generatorQuality(s,demand))}>발전 결과 확정</button><small className={ui.muted}>AP 1 · 정신 14 · 전력 +5~17</small></>;
}
function Decontam({seed,finish}:{seed:number;finish:Finish}){
 const targets=flowTargets(seed);
 const [s,setS]=useState<{round:number;allocation:number[];scores:number[]}>({round:0,allocation:[2,2,2],scores:[]});
 const done=s.round>=targets.length,target=targets[Math.min(s.round,targets.length-1)],used=s.allocation.reduce((a,b)=>a+b,0);
 const quality=s.scores.reduce((a,b)=>a+b,0)/targets.length;
 const names=['격리실','복도','흡입 계통'];
 return <>
 <p>공급 가능한 압력은 총 8인데 각 구역의 정화 요구량은 합계 9입니다. 부족한 구역을 최소화하고 과압을 피하세요. 단계마다 요구량이 달라집니다.</p>
 <div className={ui.readouts}><Meter name="사용 압력" value={used} max={FLOW_CAPACITY}/><Meter name="정화 단계" value={s.round} max={targets.length}/></div>
 {names.map((name,i)=><div className={ui.valve} key={name}><div><b>{name}</b><div className={ui.muted}>필요 {target[i]} / 배정 {s.allocation[i]}</div></div><div className={ui.gauge}><i className={s.allocation[i]>target[i]?ui.hot:undefined} style={{width:s.allocation[i]/5*100+'%'}}/></div><div className={ui.actions}><button className={ui.control} aria-label={name+' 압력 감소'} disabled={done||s.allocation[i]===0} onClick={()=>setS(old=>({...old,allocation:adjustFlow(old.allocation,i,-1)}))}>−</button><button className={ui.control} aria-label={name+' 압력 증가'} disabled={done||used>=FLOW_CAPACITY||s.allocation[i]>=5} onClick={()=>setS(old=>({...old,allocation:adjustFlow(old.allocation,i,1)}))}>+</button></div></div>)}
 <div className={ui.status} role="status">{done?'최종 정화 품질 '+Math.round(quality*100)+'%':'예상 정화 효율 '+Math.round(flowScore(s.allocation,target)*100)+'% · 남은 압력 '+(FLOW_CAPACITY-used)}</div>
 {done?<button className={ui.control} onClick={()=>finish(quality)}>제독 결과 확정</button>:<button className={ui.control} onClick={()=>setS(old=>old.round>=targets.length?old:{round:old.round+1,allocation:old.allocation,scores:[...old.scores,flowScore(old.allocation,targets[old.round])]})}>현재 배분으로 정화 실행</button>}
 <small className={ui.muted}>AP 1 · 필터 1 · 감염 -6~26</small></>;
}
export default function EmergencyTask({kind,day,serial,onClose,onFinish}:{kind:EmergencyKind;day:number;serial:number;onClose:()=>void;onFinish:Finish}){
 const finished=useRef(false),seed=day*7919+serial*173;
 function finish(q:number){if(finished.current)return;finished.current=true;onFinish(q);}
 return <section className="v10-modal ark-emergency-modal"><div className={ui.console}><header className={ui.head}><div><span className={ui.kicker}>ARK / MANUAL OPERATIONS</span><h2>{titles[kind]}</h2></div><button className={ui.control} onClick={onClose}>취소</button></header>{kind==='handsearch'?<Search seed={seed} finish={finish}/>:kind==='crank'?<Crank seed={seed} finish={finish}/>:<Decontam seed={seed} finish={finish}/>}</div></section>;
}
