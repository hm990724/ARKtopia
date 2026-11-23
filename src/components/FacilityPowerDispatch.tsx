'use client';
import type {FacilityId,V10} from '@/lib/game-v10';
import {FACILITY_POWER_DRAW,FACILITY_POWER_LABEL,isFacilityPowered,normalizeFacilityPowerOrder,previewFacilityPower} from '@/lib/facility-power';

export function FacilityPowerDispatch({state,onMove}:{state:V10;onMove:(id:FacilityId,delta:-1|1)=>void}){
 const order=normalizeFacilityPowerOrder(state.facilityPowerPriority),last=state.facilityPowerState;
 return <section className="v81-power-dispatch" aria-label="야간 시설 전력 우선순위">
  <div className="v81-power-dispatch-head"><div><span>POWER GRID // NIGHT LOAD SHEDDING</span><h3>야간 시설 전력 우선순위</h3><p>야간 기본 운영 후 남은 전력을 위에서부터 배분합니다. 부족하면 아래 설비가 먼저 꺼집니다.</p></div><b>설비당 2–3% · 최대 {Object.values(state.facilities).filter(Boolean).length?Object.entries(state.facilities).reduce((sum,[id,built])=>sum+(built?FACILITY_POWER_DRAW[id as FacilityId]:0),0):0}%</b></div>
  <ol>{order.map((id,index)=>{const built=!!state.facilities[id],online=last?.day===state.day-1?isFacilityPowered(state,id):built;return <li key={id} className={!built?'not-built':online?'online':'shed'}><span className="v81-priority-rank">{String(index+1).padStart(2,'0')}</span><div><b>{FACILITY_POWER_LABEL[id]}</b><small>{built?`야간 부하 ${FACILITY_POWER_DRAW[id]}% · ${online?'직전 야간 가동':'직전 야간 차단'}`:'미설치 · 우선순위만 예약'}</small></div><span className="v81-power-lamp" aria-label={built?(online?'가동':'차단'):'미설치'}>{built?(online?'ONLINE':'SHED'):'OFF'}</span><div className="v81-priority-buttons"><button type="button" disabled={index===0} aria-label={`${FACILITY_POWER_LABEL[id]} 우선순위 올리기`} title="우선순위 올리기" onClick={()=>onMove(id,-1)}>↑</button><button type="button" disabled={index===order.length-1} aria-label={`${FACILITY_POWER_LABEL[id]} 우선순위 내리기`} title="우선순위 내리기" onClick={()=>onMove(id,1)}>↓</button></div></li>})}</ol>
  {last&&<p className="v81-last-dispatch" role="status">직전 야간 배전 · 전력 {last.spent}% 사용{last.shed.length?` · 차단: ${last.shed.map(id=>FACILITY_POWER_LABEL[id]).join(', ')}`:' · 설치 설비 정상 가동'}</p>}
 </section>;
}

export function NightDispatchForecast({state,power}:{state:V10;power:number}){
 const dispatch=previewFacilityPower(state,power);
 return <div className="v81-night-forecast" aria-label="야간 배전 예상"><span>시설 배전 예상 · 잔여 전력 {power}%</span><b>{dispatch.powered.length?`가동 ${dispatch.powered.map(id=>FACILITY_POWER_LABEL[id]).join(' · ')}`:'가동 설비 없음'}</b>{dispatch.shed.length>0&&<strong>전력 부족으로 차단 · {dispatch.shed.map(id=>FACILITY_POWER_LABEL[id]).join(' · ')}</strong>}</div>;
}
