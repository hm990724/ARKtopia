'use client';
import type {AnimalState} from '@/lib/sim';
import type {V10} from '@/lib/game-v10';
import {HABITAT_PROFILES,habitatState,habitatBlock,type HabitatAction} from '@/lib/habitat-care';
export default function HabitatCare({state,animal,onAction}:{state:V10;animal:AnimalState;onAction:(action:HabitatAction)=>void}){
 const h=habitatState(animal),p=HABITAT_PROFILES[animal.id];
 const needs=h.cleanliness<35?'오염 위험 · 청소가 필요합니다.':h.activity<30?'활동 부족 · 환경 자극이 필요합니다.':h.cleanliness<60?'청결도가 떨어지고 있습니다.':h.activity<55?'탐색 활동을 제공하면 안정에 도움이 됩니다.':'생활 환경 양호 · 현재 추가 관리가 급하지 않습니다.';
 const actions:{kind:HabitatAction;title:string;cost:string;effect:string}[]=[{kind:'clean',title:p.clean,cost:'AP 1 · 전력 2',effect:'청결 +45 · 오염 -8 · 질병 -4'},{kind:'play',title:p.play,cost:'AP 1',effect:'활동 +40 · 스트레스 -10 · 유대 +6'},{kind:'install',title:p.install,cost:'고철 3 · 부품 1 / 영구 설치',effect:'전력 15 이상인 밤에 청결·활동 감소 완화'}];
 return <section className="ark-habitat" aria-label="격리실 생활 관리"><header><div><small>HABITAT / DAILY CARE</small><h3>생활 환경 관리</h3></div><span data-alert={h.cleanliness<35||h.activity<30}>{h.cleanliness<35||h.activity<30?'관리 필요':h.installed?'환경 설비 설치됨':'기본 격리실'}</span></header>
 <div className="ark-habitat-vitals">{[{label:p.water?'수질 청결':'격리실 청결',value:h.cleanliness},{label:'탐색 활동 충족',value:h.activity}].map(item=><div key={item.label}><span>{item.label}</span><b>{item.value}%</b><meter min={0} max={100} value={item.value} low={35} high={65} optimum={100}/></div>)}</div>
 <p className="ark-habitat-needs" role="status">{needs}</p><p>{p.cue}</p>
 <div className="ark-habitat-actions">{actions.map(item=>{const block=habitatBlock(state,animal,item.kind);return <button key={item.kind} type="button" disabled={!!block} onClick={()=>onAction(item.kind)}><b>{item.title}</b><small>{item.cost}</small><span>{block??item.effect}</span></button>})}</div>
 <details><summary>야간 변화와 관리 효과</summary><p>매일 밤 청결과 활동이 감소합니다. 청결 35 미만이면 오염·질병이 증가하고, 활동 30 미만이면 스트레스가 증가합니다. 청결 65 이상 및 활동 55 이상을 유지하면 스트레스 -3, 건강 50 이상이면 유대 +1을 얻습니다. 설비는 전력이 충분한 밤에 소모를 완화하며, 그날 활동을 제공하고 상태가 양호하면 공명 +1도 얻습니다.</p></details>
 </section>
}
