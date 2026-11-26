/** Minimal gameplay asset set. Existing sprites, UI and game state remain independent of optional art. */
import type {RegionId} from './game-v10';
import type {CameraId,ContainmentWing} from './security';
const base='/assets/gameplay/';
export type GameplayResultKey='success'|'failure'|'combatEncounter'|'combatVictory'|'combatDefeat'|'combatRetreat'|'captureSuccess'|'captureFailure'|'recoverySuccess';
const cinematicResults:Record<Exclude<GameplayResultKey,'success'|'failure'>,string>={
 combatEncounter:'COMBAT_01_encounter.webp',combatVictory:'COMBAT_02_victory.webp',combatDefeat:'COMBAT_03_defeat.png',combatRetreat:'COMBAT_04_retreat.png',
 captureSuccess:'CAPTURE_01_success.png',captureFailure:'CAPTURE_02_failure.png',recoverySuccess:'RECOVERY_01_success.png'
};
export const gameplayArt={
 start:(id:string)=>base+'start/'+id+'.png',
 region:(id:RegionId)=>base+'regions/'+id+'.png',
 camera:(id:CameraId)=>base+'cctv/'+(id==='CAM-01'?'cam-01':id==='CAM-04'?'cam-04':'containment')+'.png',
 containment:(_wing:ContainmentWing)=>base+'containment/chamber.png',
 captureStage:base+'capture/staging.png',
 recoveryStage:base+'recovery/staging.png',
 result:(key:GameplayResultKey)=>key==='success'||key==='failure'?base+'results/'+key+'.png':base+'cinematics/'+cinematicResults[key],
 combat:(id:RegionId)=>base+'regions/'+id+'.png',
 spore:base+'effects/spore.png',
};
export function resultArtKey(title:string,success:boolean,animal?:string):GameplayResultKey{
 if(title.includes('도주 성공'))return 'combatRetreat';
 if(title.includes('긴급 이탈'))return 'combatDefeat';
 if(title.includes('위협 격퇴'))return 'combatVictory';
 if(title.includes('구조 완료'))return 'recoverySuccess';
 if(animal==='rabbit'&&(title.includes('포획')||title.includes('추적 실패')))return success?'captureSuccess':'captureFailure';
 return success?'success':'failure';
}
