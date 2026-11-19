import type {V10} from './game-v10';
import {copy,log} from './sim';

export const CARE_ANALYSIS_COST=6;
/** A knowledge spend is atomic and independent of daily action points. */
export function spendCareAnalysis(s:V10):V10{
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident||s.knowledge<CARE_ANALYSIS_COST)return s;
 const n=copy(s) as V10;n.knowledge-=CARE_ANALYSIS_COST;
 n.lastOutcome=`축적한 지식 ${CARE_ANALYSIS_COST}점을 사용해 개체 반응 판독을 수행했습니다. 대응이 화면에 표시됩니다.`;
 log(n,'EVE 행동 대응 판독',n.lastOutcome,'mystery');return n;
}
