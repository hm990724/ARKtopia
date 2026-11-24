import type {V10} from './game-v10';
import type {CrewId} from './crew';
export type PortraitMood='neutral'|'anxious'|'critical'|'resolve';
export type CharacterId='protagonist'|'eve'|CrewId;
export function characterMood(state:V10|undefined,id:CharacterId,text='',explicit?:PortraitMood):PortraitMood{
 // EVE learns emotional expression only after authenticated story evidence.
 if(id==='eve'&&(!state||(!state.flags.humanTruth&&(state.originZero?.photos??0)<4)))return 'neutral';
 const value=id==='protagonist'?state?.mind:id==='eve'?state?.eve:state?.crew?.members.find(m=>m.id===id)?.mind;
 if(value!==undefined&&value<=0)return 'critical';
 // Crew stability is the visual floor. A calm dialogue must not restore a critical face.
 if(id!=='protagonist'&&id!=='eve'&&value!==undefined){
  if(value<35)return 'critical';
  if(value<62&&explicit!=='critical')return 'anxious';
 }
 if(explicit)return explicit;
 if(value!==undefined&&value<35)return 'critical';
 if(/제 손이|네 발로|무너질|끝나가|살려|죽고|이상해요/.test(text))return 'critical';
 if(value!==undefined&&value<62)return 'anxious';
 if(/이해한 마음|내일은 제가|네가 이어|스스로|지키겠|함께 보자|제가 결정/.test(text))return 'resolve';
 if(/두려|불안|걱정|기억|모르겠|죄송|경고|위험/.test(text))return 'anxious';
 if(id==='eve'&&(state?.originZero?.photos??0)>=12)return 'resolve';
 if(id==='protagonist'&&(state?.day??0)>=15)return 'anxious';
 return 'neutral';
}
export function characterPortrait(id:CharacterId,mood:PortraitMood):string{
 if(id==='protagonist')return `/assets/characters/protagonist_${mood}.png`;
 if(id==='eve')return mood==='neutral'?'/assets/characters/eve_hologram.webp':`/assets/characters/eve_${mood}.png`;
 return staffStatusPortrait(id,mood==='critical'?'critical':mood==='anxious'?'unstable':'safe');
}

/** The three WebP portraits remain the stable sanity-driven roster/status art. */
export type StaffCondition='safe'|'unstable'|'critical';
export function staffCondition(mind:number|undefined):StaffCondition{
 return mind===undefined||mind>=62?'safe':mind>=35?'unstable':'critical';
}
export function staffStatusPortrait(id:CrewId,condition:StaffCondition):string{
 const suffix=condition==='safe'?'':`_${condition}`;
 return `/assets/staff/${id}/portrait${suffix}.webp`;
}
/** Dialogue uses the existing distinct PNG expression takes, never substitutes for sanity art. */
export function staffDialoguePortrait(id:CrewId,mood:PortraitMood,condition:StaffCondition):string{
 if(condition==='critical')return staffStatusPortrait(id,'critical');
 if(condition==='unstable'&&mood!=='critical')return staffStatusPortrait(id,'unstable');
 if(mood==='critical')return `/assets/staff/${id}/portrait_critical.png`;
 if(mood==='anxious')return `/assets/staff/${id}/portrait_unstable.png`;
 return staffStatusPortrait(id,condition);
}

/** New standalone dialogue expressions are separate from the three sanity portraits.
 * These filenames are preferred only when actual new artwork exists in public/.
 * Legacy PNG/WebP takes remain available until image-generation QA is complete.
 */
export type StaffDialogueTone='neutral'|'soft'|'shocked';
export function staffDialogueTone(mood:PortraitMood,line=''):StaffDialogueTone{
 if(mood==='critical'||/살려|죽|충격|무너|안 돼|이게 뭐|무슨 일이/.test(line))return 'shocked';
 if(mood==='resolve'||/고마|괜찮|함께|곁에|안심|미안|지켜|잘됐/.test(line))return 'soft';
 if(mood==='anxious'||/[?!？！]/.test(line))return 'shocked';
 return 'neutral';
}
export function staffDialogueArtworkCandidates(id:CrewId,mood:PortraitMood,condition:StaffCondition,line=''):readonly string[]{
 const legacy=staffDialoguePortrait(id,mood,condition);
 const status=staffStatusPortrait(id,condition);
 if(condition==='critical')return [status];
 if(condition==='unstable')return legacy===status?[status]:[legacy,status];
 const tone=staffDialogueTone(mood,line);
 return [`/assets/staff/${id}/portrait_talk_${tone}.png`,legacy,status].filter((v,i,a)=>a.indexOf(v)===i);
}

export type WalkDirection='down'|'left'|'right'|'up';
export function directionForMove(from:number,to:number,width:number):WalkDirection{
 if(to===from-width)return 'up';if(to===from+width)return 'down';return to<from?'left':'right';
}
// The generated side-view row faces right; a horizontal flip gives a true left-facing cycle.
export const WALK_ROW:Record<WalkDirection,number>={down:0,left:2,right:2,up:3};
