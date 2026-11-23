import type {V10} from '@/lib/game-v10';
import {nightSignal,canAnswerNight,type WatchResponse} from '@/lib/night-watch';
export function NightWatchPlan({state,onChoose}:{state:V10;onChoose:(choice:WatchResponse)=>void}){
 const e=nightSignal(state);if(!e)return null;
 const choice=state.security.watchPlan?.day===state.day?state.security.watchPlan.response:'observe';
 return <section className="v73-night-watch" aria-label="밤사이 징후 대응"><small>NIGHT WATCH / 오늘 관측한 징후</small><h3>{e.title}</h3><p>{e.cue}</p><div><button type="button" aria-pressed={choice==='intervene'} disabled={!canAnswerNight(state)} onClick={()=>onChoose('intervene')}><b>직접 대응 예약</b><span>{e.cost}</span><small>{e.benefit}</small></button><button type="button" aria-pressed={choice==='observe'} onClick={()=>onChoose('observe')}><b>관측만 유지</b><span>추가 자원 소모 없음</span><small>징후를 남기고 기존 야간 계획 진행</small></button></div><p>야간 운영 확정 시 한 번 적용됩니다. 선택 후에도 변경할 수 있습니다.</p></section>;
}
export function NightWatchReport({state}:{state:V10}){
 const r=state.security?.lastWatch;
 const lowPower=state.power<22;
 if(!lowPower&&!r)return null;
 return <section className={'v73-watch-report'+(lowPower?' v76-power-crisis':'')} role={lowPower?'alert':'status'} aria-label={lowPower?'야간 전력 부족 경고':'지난밤 관측 결과'}>{lowPower&&<><small>GRID FAILURE // TONIGHT</small><strong>전력 부족 · 방어가 끊길 수 있습니다</strong><p>야간 방어에는 전력 22%가 필요합니다. 보급실 발전기를 확인하고, 복구가 불가능하면 경비를 중지한 채 무방비로 지나갑니다.</p></>}{r&&<><small>DAY {r.day} / 야간 기록</small><strong>{r.title}</strong><p>{r.detail}</p></>}</section>;
}

