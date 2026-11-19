import type {AnimalId,AnimalState} from './sim';
import {protocols} from './protocols';

/** Successful hands-on observation reveals ONE verified hint for each resonance step.
 * Ordinary observation records still satisfy the existing research prerequisite.
 * No separate save migration is needed: careMastery.observe is already persisted.
 */
export type ObservationNote={stage:number;name:string;message:string;unlocked:boolean};
export function verifiedObservationCount(a:Pick<AnimalState,'careMastery'>):number{
 return Math.min(3,Math.max(0,a.careMastery?.observe??0));
}
export function resonanceObservationNotes(a:Pick<AnimalState,'id'|'careMastery'>):ObservationNote[]{
 const protocol=protocols[a.id as AnimalId];
 const unlocked=verifiedObservationCount(a);
 return protocol.steps.map((step,index)=>({
  stage:index+1,
  name:['행동 환경','본능 반응','기억 기록'][index],
  message:unlocked>index?`검증된 대응: ${step.choices[step.correct]}`:'올바른 행동 관찰을 추가로 진행하면 이 단계의 대응 단서를 복원할 수 있습니다.',
  unlocked:unlocked>index
 }));
}
