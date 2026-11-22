import type {V10} from './game-v10';
import type {CrewId} from './crew';
export type PortraitMood='neutral'|'anxious'|'critical'|'resolve';
export type CharacterId='protagonist'|'eve'|CrewId;
export function characterMood(state:V10|undefined,id:CharacterId,text='',explicit?:PortraitMood):PortraitMood{
 const value=id==='protagonist'?state?.mind:id==='eve'?state?.eve:state?.crew?.members.find(m=>m.id===id)?.mind;
 if(value!==undefined&&value<35)return 'critical';
 if(explicit)return explicit;
 if(/제 손이|네 발로|무너질|끝나가|살려|죽고|이상해요/.test(text))return 'critical';
 if(value!==undefined&&value<62)return 'anxious';
 if(/이해한 마음|내일은 제가|네가 이어|스스로|지키겠|함께 보자|제가 결정/.test(text))return 'resolve';
 if(/두려|불안|걱정|기억|모르겠|죄송|경고|위험/.test(text))return 'anxious';
 if(id==='eve'&&(state?.originZero?.photos??0)>=12)return 'resolve';
 if(id==='protagonist'&&(state?.day??0)>=15)return 'anxious';
 return 'neutral';
}
export function characterPortrait(id:CharacterId,mood:PortraitMood):string{
 if(id==='protagonist')return `/assets/characters/protagonist_${mood}_v73_768.png`;
 if(id==='eve')return mood==='neutral'?'/assets/characters/eve_hologram.webp':`/assets/characters/eve_${mood}_v72.png`;
 if(mood==='neutral'||mood==='resolve')return `/assets/staff/${id}/portrait${id==='fox'?'_v72.png':'.webp'}`;
 return `/assets/staff/${id}/portrait_${mood==='anxious'?'unstable':'critical'}_v72.png`;
}
export type WalkDirection='down'|'left'|'right'|'up';
export function directionForMove(from:number,to:number,width:number):WalkDirection{
 if(to===from-width)return 'up';if(to===from+width)return 'down';return to<from?'left':'right';
}
// The generated side-view row faces right; a horizontal flip gives a true left-facing cycle.
export const WALK_ROW:Record<WalkDirection,number>={down:0,left:2,right:2,up:3};
