import type {V10} from './game-v10';
import {copy,log} from './sim';

export const CARE_ANALYSIS_COST=10;
/** EVE analysis consumes core integrity, independently of daily action points. Preserve one core point to avoid a fatal shutdown. */
export function spendCareAnalysis(s:V10):V10{
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident||s.eve<=CARE_ANALYSIS_COST)return s;
 const n=copy(s) as V10;n.eve-=CARE_ANALYSIS_COST;
 n.lastOutcome=`EVE 코어 ${CARE_ANALYSIS_COST}를 소모해 개체 반응 판독을 수행했습니다. 대응이 화면에 표시됩니다.`;
 log(n,'EVE 행동 대응 판독',n.lastOutcome,'mystery');return n;
}
