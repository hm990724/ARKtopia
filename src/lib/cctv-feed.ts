import type {V10} from './game-v10';
import type {AnimalState} from './sim';
import {cctvHotspotIndex,type CameraId} from './security';
/** Rendering positions are deterministic observations, not a second simulation. */
export function cameraSubjects(s:V10,camera:CameraId):AnimalState[]{
 const inc=s.security.incident;
 return s.animals.filter(a=>a.alive&&(!s.security.escapedIds.includes(a.id)?camera==='CAM-02'?a.room<=2:camera==='CAM-03'?a.room>2:camera==='CAM-04'&&inc?.animalId===a.id&&inc.camera===camera:false));
}
export function cameraPosition(s:V10,camera:CameraId,a:AnimalState,index:number,frame:number,reference=false){
 const col=index%3,row=Math.floor(index/3)%2,phase=(frame+a.room*3+s.day)%12;
 const inc=s.security.incident;
 if(!reference&&inc?.camera===camera&&inc.animalId===a.id&&inc.status!=='escaped'){
 const q=cctvHotspotIndex(s);return {x:Math.max(10,Math.min(90,(q%2?72:28)+Math.sin(phase*Math.PI/6)*7)),y:(q>=2?72:36)+Math.cos(phase*Math.PI/6)*4};
 }
 return {x:20+col*30+(reference?0:Math.sin(phase*Math.PI/6)*8),y:37+row*32+(reference?0:Math.cos(phase*Math.PI/6)*5)};
}
