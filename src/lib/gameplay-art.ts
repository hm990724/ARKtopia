/** Minimal gameplay asset set. Existing sprites, UI and game state remain independent of optional art. */
import type {RegionId} from './game-v10';
import type {CameraId,ContainmentWing} from './security';
const base='/assets/gameplay/';
export const gameplayArt={
 start:(id:string)=>base+'start/'+id+'.png',
 region:(id:RegionId)=>base+'regions/'+id+'.png',
 camera:(id:CameraId)=>base+'cctv/'+(id==='CAM-01'?'cam-01':id==='CAM-04'?'cam-04':'containment')+'.png',
 containment:(_wing:ContainmentWing)=>base+'containment/chamber.png',
 captureStage:base+'capture/staging.png',
 recoveryStage:base+'recovery/staging.png',
 result:(key:'success'|'failure')=>base+'results/'+key+'.png',
 combat:(id:RegionId)=>base+'regions/'+id+'.png',
 spore:base+'effects/spore.png',
};
export function resultArtKey(_title:string,success:boolean):'success'|'failure'{return success?'success':'failure';}
