/** Canonical artwork paths for gameplay. Missing images are optional; game state never depends on art. */
import type {AnimalId} from './sim';
import type {RegionId} from './game-v10';
import type {CameraId,ContainmentWing} from './security';
const base='/assets/gameplay/';
export const gameplayArt={
 start:(id:string)=>base+'start/'+id+'.png',
 region:(id:RegionId)=>base+'regions/'+id+'.png',
 camera:(id:CameraId)=>base+'cctv/'+(id==='CAM-01'?'cam-01':id==='CAM-04'?'cam-04':'containment')+'.png',
 containment:(_wing:ContainmentWing)=>base+'containment/chamber.png',
 captureStage:(id:RegionId)=>base+'regions/'+id+'.png',
 capture:(id:AnimalId)=>base+'capture/'+id+'.png',
 recoveryStage:base+'recovery/staging.png',
 recovery:(id:AnimalId)=>base+'recovery/'+id+'.png',
 result:(key:string)=>base+'results/'+key+'.png',
 combat:(id:RegionId)=>base+'combat/'+id+'.png',
 emergency:(key:string)=>base+'operations/'+key+'.png',
 ground:(id:RegionId,mode:'explore'|'hunt')=>base+'terrain/'+id+'-'+mode+'.png',
 spore:base+'effects/spore.png',
};
export function resultArtKey(title:string,success:boolean){
 if(title.includes('구조 완료'))return 'transport-success';
 if(title.includes('구조 실패'))return 'transport-failure';
 if(title.includes('현장 치료'))return 'field-treatment';
 if(title.includes('방생'))return 'release';
 if(title.includes('포획 실패')||title.includes('추적 실패'))return 'capture-failure';
 if(title.includes('위협 격퇴'))return 'combat-victory';
 if(title.includes('철수')||title.includes('긴급 이탈'))return 'combat-retreat';
 return success?'operation-success':'operation-failure';
}
