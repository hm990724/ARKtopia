import type {V10} from '@/lib/game-v10';
import {emptyCageAvailable} from '@/lib/crew-memory';
export default function CrewMemoryCCTV({state,onWatch}:{state:V10;onWatch:()=>void}){
 if(!emptyCageAvailable(state))return null;
 return <aside className="v71-cctv-memory" aria-label="의무관의 야간 녹화 기록"><img src="/assets/staff/rabbit/portrait.webp" alt="빈 우리 앞에 멈춰 선 의무관의 인물 기록"/><div><small>보존 영상 · 의무관 합류 이후의 밤</small><h3>빈 우리 앞의 사람</h3><p>이미 이송된 토끼의 우리 앞에서 움직임이 감지됐다.</p><button onClick={onWatch}>{state.onboardingSeen?.includes('rabbit-empty-cage')?'녹화 기록 다시 보기':'녹화 기록 확인'}</button></div></aside>;
}
