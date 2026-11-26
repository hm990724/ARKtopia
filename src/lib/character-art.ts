import type {V10} from './game-v10';
import type {CrewId} from './crew';
export type PortraitMood='neutral'|'anxious'|'critical'|'resolve';
export type CharacterId='protagonist'|'eve'|CrewId;
export type StaffCondition='safe'|'unstable'|'critical';
type RabbitExpression='neutral'|'smile'|'angry'|'unstable'|'critical'|'crying';
const RABBIT_PORTRAITS:Record<RabbitExpression,string>={
 neutral:'/assets/staff/rabbit/neutral.png',
 smile:'/assets/staff/rabbit/smile.png',
 crying:'/assets/staff/rabbit/crying.png',
 angry:'/assets/staff/rabbit/angry.png',
 unstable:'/assets/staff/rabbit/unstable.png',
 critical:'/assets/staff/rabbit/critical.png'
};
type DeerExpression='neutral'|'smile'|'angry'|'unstable'|'critical'|'crying';
const DEER_PORTRAITS:Record<DeerExpression,string>={
 neutral:'/assets/staff/deer/netural.png',
 smile:'/assets/staff/deer/smile.png',
 crying:'/assets/staff/deer/crying.png',
 angry:'/assets/staff/deer/angry.png',
 unstable:'/assets/staff/deer/unstable.png',
 critical:'/assets/staff/deer/critical.png'
};
export function characterMood(state:V10|undefined,id:CharacterId,text='',explicit?:PortraitMood):PortraitMood{
 // EVE learns emotional expression only after authenticated story evidence.
 if(id==='eve'&&(!state||(!state.flags.humanTruth&&!state.originZero?.firstPositiveDay&&(state.originZero?.photos??0)<4)))return 'neutral';
 const value=id==='protagonist'?state?.mind:id==='eve'?state?.eve:state?.crew?.members.find(m=>m.id===id)?.mind;
 if(value!==undefined&&value<=0)return 'critical';
 if(id==='protagonist'&&(state?.originZero?.photos??0)>=11){const body=state?.originZero?.bodyStability??72;if(body<=20)return 'critical';if(body<=45&&explicit!=='critical')return 'anxious';}
 // Crew stability is the visual floor. A calm dialogue must not restore a critical face.
 if(id!=='protagonist'&&id!=='eve'&&value!==undefined){
  if(value<35)return 'critical';
  if(value<62&&explicit!=='critical')return 'anxious';
 }
 if(explicit)return explicit;
 if(id==='wolf'&&/변하고 싶지|무서워|두려워|잠식|내가 아닌/.test(text))return 'critical';
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
 if(id==='protagonist')return `/assets/characters/protagonist_${mood}.webp`;
 if(id==='eve')return mood==='neutral'?'/assets/characters/eve_hologram.webp':`/assets/characters/eve_${mood}.webp`;
 return staffStatusPortrait(id,mood==='critical'?'critical':mood==='anxious'?'unstable':'safe');
}
/** Tiny, transparent full-body combat sprites; expressive portraits stay in dialogue and staff cards. */
export function combatStaffSprite(id:CrewId):string{
 return `/assets/staff/combat/${id}.png`;
}

/** Resolve the mental-state portrait from the active art roster. */
export function staffCondition(mind:number|undefined):StaffCondition{
 return mind===undefined||mind>=62?'safe':mind>=35?'unstable':'critical';
}
export function staffStatusPortrait(id:CrewId,condition:StaffCondition):string{
 if(id==='rabbit')return RABBIT_PORTRAITS[condition==='safe'?'neutral':condition];
 if(id==='deer')return DEER_PORTRAITS[condition==='safe'?'neutral':condition];
 if(id==='fox')return `/assets/staff/fox/${condition==='safe'?'neutral':condition}.png`;
 if(id==='wolf')return `/assets/staff/wolf/${condition==='safe'?'neutral':condition}.png`;
 const suffix=condition==='safe'?'':`_${condition}`;
 return `/assets/staff/${id}/portrait${suffix}.webp`;
}
/** Dialogue uses the existing distinct PNG expression takes, never substitutes for sanity art. */
export function staffDialoguePortrait(id:CrewId,mood:PortraitMood,condition:StaffCondition):string{
 if(id==='rabbit')return RABBIT_PORTRAITS[condition==='critical'||mood==='critical'?'critical':condition==='unstable'||mood==='anxious'?'unstable':'neutral'];
 if(id==='deer')return DEER_PORTRAITS[deerDialogueExpression(mood,condition,'')];
 if(id==='fox'){
  const expression=condition==='critical'||mood==='critical'?'critical':condition==='unstable'||mood==='anxious'?'unstable':mood==='resolve'?'smile':'neutral';
  return `/assets/staff/fox/${expression}.png`;
 }
 if(id==='wolf')return `/assets/staff/wolf/${wolfDialogueExpression(mood,condition,'')}.png`;
 if(condition==='critical')return staffStatusPortrait(id,'critical');
 if(condition==='unstable'&&mood!=='critical')return staffStatusPortrait(id,'unstable');
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
type FoxExpression='neutral'|'smile'|'angry'|'unstable'|'critical'|'crying';
type WolfExpression='neutral'|'smile'|'angry'|'unstable'|'critical'|'crying';
function rabbitDialogueExpression(mood:PortraitMood,condition:StaffCondition,line:string):RabbitExpression{
 if(condition==='critical')return 'critical';
 if(condition==='unstable')return 'unstable';
 if(/거짓말|왜 그래|책임|싫어요|분명히|화가|화났|그만하세요|원가표|계산하지|살려야/.test(line))return 'angry';
 if(mood==='critical')return 'critical';
 if(mood==='anxious')return 'unstable';
 if(/작별|안녕히|고생하셨|떠나|그리워|보고 싶|마지막|잃었|돌아오지|눈물/.test(line))return 'crying';
 if(mood==='resolve'||/고마|괜찮|함께|곁에|안심|미안|지켜|잘됐|간호해드릴게요/.test(line))return 'smile';
 if(/두려|불안|걱정|기억|모르겠|죄송|경고|위험|손이 떨/.test(line))return 'unstable';
 return 'neutral';
}
function foxDialogueExpression(mood:PortraitMood,condition:StaffCondition,line:string):FoxExpression{
 if(/작별|안녕히|고생하셨|떠나|그리워|보고 싶|마지막|잃었|돌아오지/.test(line))return 'crying';
 if(/다 제 거|제 물건|빼앗|가져가려|저리 가|제 재고|제 몫/.test(line))return 'critical';
 if(condition==='critical'||mood==='critical')return 'critical';
 if(/억울|누락|제 이름이 지워|제가 확인|장부에는/.test(line))return 'crying';
 if(/거짓말|왜 그래|책임|싫어요|분명히|화가/.test(line))return 'angry';
 if(condition==='unstable'||mood==='anxious')return 'unstable';
 if(mood==='resolve'||staffDialogueTone(mood,line)==='soft')return 'smile';
 return 'neutral';
}
function wolfDialogueExpression(mood:PortraitMood,condition:StaffCondition,line:string):WolfExpression{
 if(/변하고 싶지|무서워|두렵|내가 아닌|제 정체성|혼자 두지 말/.test(line))return 'crying';
 if(/작별|안녕히|고생하셨|떠나|그리워|보고 싶|마지막|잃었|돌아오지|눈물/.test(line))return 'crying';
 if(condition==='critical'||mood==='critical')return 'critical';
 if(condition==='unstable'||mood==='anxious')return 'unstable';
 if(/거짓말|왜 그래|책임|싫어요|분명히|화가|화났|그만하세요/.test(line))return 'angry';
 if(mood==='resolve'||staffDialogueTone(mood,line)==='soft')return 'smile';
 if(/두려|불안|걱정|기억|모르겠|죄송|경고|위험|손이 떨/.test(line))return 'unstable';
 return 'neutral';
}
function deerDialogueExpression(mood:PortraitMood,condition:StaffCondition,line:string):DeerExpression{
 if(condition==='critical'||mood==='critical')return 'critical';
 if(condition==='unstable')return 'unstable';
 if(/작별|안녕히|고생하셨|떠나|그리워|보고 싶|마지막|잃|돌아오지|눈물|슬프|헤어지|놓아주|이름을 지우지|이름이 사라지|지키지 못/.test(line))return 'crying';
 if(/거짓말|왜 그래|책임져|싫어요|분명히|화가|화났|그만하세요|그만해|틀렸|명령에 따르지|분노/.test(line))return 'angry';
 if(mood==='anxious'||/두려|불안|걱정|기억|모르겠|죄송|경고|위험|떨려|흔들/.test(line))return 'unstable';
 if(mood==='resolve'||/고마|괜찮|함께|곁에|안심|지켜|잘됐|희망|믿|해낼|좋아요|도와|약속/.test(line))return 'smile';
 return 'neutral';
}
export function staffDialogueArtworkCandidates(id:CrewId,mood:PortraitMood,condition:StaffCondition,line=''):readonly string[]{
 const legacy=staffDialoguePortrait(id,mood,condition);
 const status=staffStatusPortrait(id,condition);
 if(id==='rabbit')return [RABBIT_PORTRAITS[rabbitDialogueExpression(mood,condition,line)],status];
 if(id==='deer')return [DEER_PORTRAITS[deerDialogueExpression(mood,condition,line)],legacy,status].filter((v,i,a)=>a.indexOf(v)===i);
 if(id==='fox'){
  const expression=foxDialogueExpression(mood,condition,line);
  return [`/assets/staff/fox/${expression}.png`,legacy,status].filter((v,i,a)=>a.indexOf(v)===i);
 }
 if(id==='wolf'){
  const expression=wolfDialogueExpression(mood,condition,line);
  return [`/assets/staff/wolf/${expression}.png`,legacy,status].filter((v,i,a)=>a.indexOf(v)===i);
 }
 if(condition==='critical')return [status];
 if(condition==='unstable')return legacy===status?[status]:[legacy,status];
 return [legacy,status].filter((v,i,a)=>a.indexOf(v)===i);
}

export type WalkDirection='down'|'left'|'right'|'up';
export function directionForMove(from:number,to:number,width:number):WalkDirection{
 if(to===from-width)return 'up';if(to===from+width)return 'down';return to<from?'left':'right';
}
// The generated side-view row faces right; a horizontal flip gives a true left-facing cycle.
export const WALK_ROW:Record<WalkDirection,number>={down:0,left:2,right:2,up:3};
