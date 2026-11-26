import type {RegionId,V10} from './game-v10';
import {cap,log} from './sim';
import {canWolfLastStand,sacrificeWolf,queueCrewTerminations} from './crew';
import {advanceFieldThreat,farthestThreatCell,depositMutantSpores,fieldLineOfSight,fieldBeamContains,fieldWidth,adjacentField,mutantTier,mutantTierIndex,type Pace} from './tactical-field';
import {mutantArchetype} from './mutant-roster';
/** All current field encounters use the dedicated 20-variant MUTANT roster. */
export type FieldEnemy='mutant';
export type CombatAction='strike'|'guard'|'cover'|'heal'|'pulse'|'support'|'retreat'|'intro-continue'|'wolf-last-stand'|'cancel-last-stand';
export type FieldCombat={enemy:FieldEnemy;mutantVariant?:number;hp:number;maxHp:number;round:number;intent:'lunge'|'charge'|'spray'|'sweep'|'burst'|'feint';stagger:boolean;log:string[];source?:'hazard'|'mobile';lastAction?:CombatAction;introPending?:boolean;lastStand?:boolean;seed?:number;tier?:number;obscured?:boolean;strikeChain?:number;moltTriggered?:boolean;}
export const combatIntent:Record<FieldCombat['intent'],string>={lunge:'앞다리가 땅을 긁는다. 몸이 낮아진다.',charge:'흉부의 조직이 벌어지고 맥박이 드러난다.',spray:'등의 막이 부풀고 가느다란 입자가 흩어진다.',sweep:'옆구리에서 긴 조직이 바닥을 훑는다.',burst:'몸 전체가 불규칙하게 팽창한다. 바닥에 검은 액체가 고인다.',feint:'갑자기 움직임이 멈춘다. 머리가 한쪽으로 기울어진다.'};
export function mutantClue(b:FieldCombat){if(b.obscured)return (b.seed??0)%2?'몸이 불규칙하게 떨린다. 여러 조직이 동시에 움직인다.':'고개를 낮춘 채 멈춰 있다. 다음 움직임은 판별되지 않는다.';return combatIntent[b.intent];}
export function fieldEnemyClue(b:FieldCombat){
 return `${mutantArchetype(b.mutantVariant).fieldTell} ${mutantClue(b)}`;
}
export function mutantIntentFor(seed:number,tier:number,last?:CombatAction,previous?:FieldCombat['intent']):FieldCombat['intent']{
 const pool:FieldCombat['intent'][]=tier===0?['lunge','charge','spray']:tier===1?['lunge','charge','spray','sweep']:tier===2?['lunge','charge','spray','sweep','feint']:['lunge','charge','spray','sweep','burst','feint'];
 const roll=(seed>>>9)%100;
 if(tier>=3&&roll<15+(tier-3)*12){if(last==='guard')return 'burst';if(last==='cover')return 'sweep';if(last==='strike')return 'feint';if(last==='retreat')return 'lunge';}
 let intent=pool[seed%pool.length];if(tier>=2&&intent===previous)intent=pool[(seed%pool.length+1)%pool.length];return intent;
}
export function combatRoundLimit(b:FieldCombat){return 9+Math.max(0,b.tier??0);}
export function escapeChance(s:V10){const pressure=s.field?.pressure??0,b=s.field?.combat,ability=mutantArchetype(b?.mutantVariant).ability;const trait=ability==='route-lock'?-12:ability==='false-signal'?-15:ability==='slip'?10:0;return Math.max(10,Math.min(90,Math.round(90-pressure*.72+((b?.stagger)?10:0)+(s.stamina<25?-10:0)+trait)));}
export const mutantAttack:Record<FieldCombat['intent'],{damage:number;infection:number;spores:number}>={lunge:{damage:28,infection:2,spores:0},charge:{damage:0,infection:0,spores:0},spray:{damage:12,infection:18,spores:3},sweep:{damage:23,infection:4,spores:0},burst:{damage:18,infection:24,spores:4},feint:{damage:16,infection:0,spores:0}};
export function newFieldCombat(seed:number):FieldCombat{const variant=Math.abs(Math.trunc(seed))%20+1,mutant=mutantArchetype(variant),hp=Math.round(24*mutant.hpScale);return {enemy:'mutant',mutantVariant:variant,hp,maxHp:hp,round:1,tier:0,seed:Math.abs(Math.trunc(seed)),intent:mutantIntentFor(seed,0),stagger:false,obscured:mutant.ability==='obscure',log:[`EVE: ${mutant.name} 변이 반응입니다. ${mutant.fieldTell}`]};}
/** The special Mutant is one persistent individual, distinct from M-00. */
export function mutantSecured(s:V10):boolean{return s.animals.some(a=>a.id==='mutant')||!!s.headquarters?.transferred.includes('mutant')||s.pending==='mutant'||Object.values(s.archive?.entries??{}).some(entry=>entry.species==='mutant');}
const roamingEnemyName:Record<FieldEnemy,string>={mutant:'배회형 MUTANT'};
const firstEncounterKey='firstEncounterDay' as const;
const REGION_MUTANT_BANDS:Record<RegionId,[number,number]>={garden:[1,4],conservatory:[2,7],rail:[4,11],archive:[7,15],vault:[11,19],tunnels:[15,20]};
function regionMutantVariant(region:RegionId,seed:number){const [first,last]=REGION_MUTANT_BANDS[region],count=last-first+1;return first+Math.abs(Math.trunc(seed))%count;}
function enemyIntro(variant?:number){
 const mutant=mutantArchetype(variant);return `EVE: ${mutant.name} · 배회형 MUTANT입니다. ${mutant.fieldTell} 다음 행동을 읽고 퇴로를 확보하십시오.`;
}
function mobileEnemyProfile(tier:number,seed:number,region:import('./game-v10').RegionId,variant?:number){
 const profile=mutantTier(region),archetype=mutantArchetype(variant);
 return {hp:Math.round(profile.hp*archetype.hpScale),intent:mutantIntentFor(seed,tier),obscured:archetype.ability==='obscure'||archetype.ability==='unpredictable'&&(seed>>>15)%3===0||(seed>>>16)%100<profile.ambiguity};
}
/** A real-time encounter can interrupt tracking, preserving it for after combat. */
export function beginRoamingCombat(s:V10):boolean{
 const f=s.field;if(!s.run||!f?.threat||f.combat||f.choice||s.pending||s.run.firstTutorial)return false;
 const legacyKind=f.threat.kind,enemy:FieldEnemy='mutant';
 if(legacyKind&&legacyKind!=='mutant')f.threat.mutantVariant??=legacyKind==='echo'?16:5;
 f.threat.kind=enemy;if(mutantSecured(s))return false;
 if(s.capture){f.interruptedCapture=structuredClone(s.capture);s.capture=null;}
 const key=firstEncounterKey,first=!s.roamingStory?.[key];
 s.roamingStory??={};if(first)s.roamingStory[key]=s.day;
 const seed=Math.floor(Math.random()*2147483647),tier=mutantTierIndex(s.run.region);
 f.threat.mutantVariant??=1+Math.abs((seed>>>3)%20);
 const profile=mobileEnemyProfile(tier,seed,s.run.region,f.threat.mutantVariant);
 f.combat={enemy,mutantVariant:f.threat.mutantVariant,hp:profile.hp,maxHp:profile.hp,round:1,seed,tier,obscured:profile.obscured,intent:profile.intent,stagger:false,source:'mobile',introPending:first,log:[enemyIntro(f.threat.mutantVariant)]};
 f.threat.mode='closing';f.threat.stage='chase';if(enemy==='mutant')depositMutantSpores(f,f.threat.position);
 if(first)log(s,`최초 배회 위협 조우 · ${roamingEnemyName[enemy]}`,`외곽에서 ${roamingEnemyName[enemy]}를 확인했습니다. 이동 경로가 기록되었습니다.`,'bad');
 return true;
}
function patrolTarget(f:NonNullable<V10['field']>,at:number):number|null{
 const width=fieldWidth(f),choices=[at-width,at+1,at+width,at-1]
  .filter(i=>adjacentField(at,i,width,f.tiles.length)&&f.tiles[i]!=='wall'&&i!==f.position&&i!==f.exitIndex);
 return choices.length?choices[Math.floor((f.autonomousTicks??0)/2)%choices.length]:null;
}
/** Movement raises pursuit immediately; the expedition clock also advances a slower roaming AI. */
export function tickRoamingThreat(s:V10,pace?:Pace):boolean{
 const f=s.field,run=s.run;if(!run||!f||f.combat||f.choice||s.pending||run.firstTutorial||run.integrity<=0||s.mind<=0||s.eve<=0)return false;
 if(f.threat&&(f.threat.kind??'mutant')==='mutant'&&mutantSecured(s)){f.threat=null;return false;}
 const profile=mutantTier(run.region),index=mutantTierIndex(run.region),autonomous=pace===undefined;
 if(!f.threat){
  const firstSpawn=(f.mutantSpawns??0)===0;
  const lingerReady=autonomous&&firstSpawn&&(f.autonomousTicks??0)>=Math.max(4,9-index);
  const routeReady=f.steps>=Math.max(profile.minSteps,f.mutantNextStep??0)&&(f.pressure??0)>=profile.threshold;
  if((!routeReady&&!lingerReady)||(f.sporeSpread?.turn??0)<(f.mutantNextTurn??0))return false;
  const at=farthestThreatCell(f);if(at===null)return false;
  f.mutantSpawns=(f.mutantSpawns??0)+1;
  const variant=regionMutantVariant(run.region,s.day*37+f.steps*17+(f.mutantSpawns??0)*13),archetype=mutantArchetype(variant);
  f.threat={kind:'mutant',mutantVariant:variant,position:at,origin:at,alert:f.pressure??0,mode:autonomous?'search':'closing',stage:autonomous?'patrol':'chase',ticks:0};
  depositMutantSpores(f,at);
  const cue=autonomous?'외곽 순찰 신호 감지 · 아직 이동 경로를 파악할 수 없습니다.':`${archetype.name} · MUTANT-${String(variant).padStart(2,'0')} 출현 · 청음으로 반응을 읽으세요.`;f.lastEvent=s.lastOutcome=cue;return false;
 }
 if(!autonomous){const lightOn=run.region!=='rail'&&!f.lightOff&&(f.lightSteps??0)>0;if(advanceFieldThreat(f,f.noise,upgradeLevel(s,'relay'),lightOn,pace)&&beginRoamingCombat(s))return true;return false;}

 const threat=f.threat,tick=f.autonomousTicks??0,interval=index>=4?1:2,relay=upgradeLevel(s,'relay');
 threat.ticks??=0;
 if(tick%interval!==0)return false;
 const width=fieldWidth(f),dx=threat.position%width-f.position%width,dy=Math.floor(threat.position/width)-Math.floor(f.position/width),distance=Math.abs(dx)+Math.abs(dy);
 const lightOn=run.region!=='rail'&&!f.lightOff&&(f.lightSteps??0)>0;
 const archetype=mutantArchetype(threat.mutantVariant),ability=archetype.ability;
 const lightRange=ability==='light-drain'?4:3,noiseThreshold=ability==='sound-hunt'?15:24,visionRange=ability==='obscure'?2:1;
 const inBeam=lightOn&&fieldBeamContains(f,threat.position,lightRange);
 const audible=f.noise>=noiseThreshold&&distance<=Math.max(1,Math.floor(f.noise/18)-Math.floor(relay/2));
 const visible=!f.concealed&&fieldLineOfSight(f,threat.position,visionRange);
 const sensed=ability==='sound-hunt'?audible||inBeam||visible:inBeam||audible||visible;
 let target:number,stage:'patrol'|'investigate'|'chase'|'search';
 if(f.concealed&&f.noise<35){
  target=threat.lastSeen??threat.origin??threat.position;stage='search';
  const lastDistance=Math.abs(target%width-threat.position%width)+Math.abs(Math.floor(target/width)-Math.floor(threat.position/width));
  if(lastDistance<=1&&threat.ticks>=4){const away=patrolTarget(f,threat.position);if(away===null)return false;target=away;stage='patrol';}
  else if(lastDistance<=1&&tick%(interval*3)!==0){threat.stage='search';threat.mode='search';threat.warningTicks=0;threat.ticks++;return false;}
  }else if(sensed||distance<=Math.max(1,(ability==='apex'?3:2)-Math.floor(relay/4))){
  target=f.position;stage=distance<=2?'chase':'investigate';threat.lastSeen=f.position;
 }else{
  const next=patrolTarget(f,threat.position);if(next===null)return false;
  target=next;stage='patrol';
 }
 const reached=advanceFieldThreat(f,f.noise,upgradeLevel(s,'relay'),lightOn,undefined,target,stage);
 if(target===f.position&&!f.concealed&&reached&&beginRoamingCombat(s))return true;
 return false;
}
function relocateThreat(f:NonNullable<V10['field']>){if(!f.threat)return;const at=farthestThreatCell(f);if(at===null){f.threat=null;return;}f.threat={kind:f.threat.kind??'mutant',mutantVariant:f.threat.mutantVariant,position:at,origin:at,alert:f.pressure??0,mode:'closing',stage:'chase',ticks:0,cooldown:mutantTier(f.region).escapeGrace};}
function resumeCapture(s:V10){
 const f=s.field;if(!f?.interruptedCapture)return;
 if(!s.pending&&s.mind>0&&s.run&&s.run.integrity>0){s.capture=f.interruptedCapture;}
 f.interruptedCapture=null;
}
export function combatBlock(s:V10,action:CombatAction):string|null{
 if(!s.run||!s.field?.combat||s.capture||s.phase!=='day')return '진행 중인 현장 전투가 없습니다.';
 const b=s.field.combat;
 if(b.introPending)return action==='intro-continue'?null:'최초 조우 기록을 먼저 확인하세요.';
 if(b.lastStand)return action==='retreat'||action==='cancel-last-stand'?null:'경비관의 마지막 엄호를 확인한 뒤 철수하세요.';
 if(action==='intro-continue'||action==='cancel-last-stand')return '현재 선택할 수 없는 행동입니다.';
 if(action==='wolf-last-stand'&&!canWolfLastStand(s))return '배회형 MUTANT와 교전 2라운드 이후, 방호 35 이하, 생존 경비관 동행 시에만 선택 가능';
 const pulseCost=3+(mutantArchetype(b.mutantVariant).ability==='eve-jam'?2:0);
 if(action==='pulse'&&(s.run.evePulseUsed||s.power<pulseCost))return s.run.evePulseUsed?'EVE 지원은 출동당 한 번입니다.':`전력 ${pulseCost} 필요 · EVE 신호 교란 중`;
 if(action==='heal'&&(!s.run.gear.includes('medkit')||s.run.medkitUsed||s.run.integrity>=100))return !s.run.gear.includes('medkit')?'응급 처치 키트를 가져오지 않았습니다.':s.run.medkitUsed?'출동 응급 키트를 이미 사용했습니다.':'방호가 충분합니다.';
 const crewIds=s.run?.companions??[s.run?.companion];const m=s.crew?.members.find(m=>crewIds.includes(m.id)&&m.mind>5);
 if(action==='support'&&(!m||s.run.supportUsed))return !m?'동행 직원이 없거나 정신력이 부족합니다.':'동행 지원은 출동당 한 번입니다.';
 return null;
}
/** Each action settles once. No timers or random rerolls; reloading preserves intent. */
export function resolveCombat(s:V10,action:CombatAction):V10{
 if(combatBlock(s,action))return s;
 if(s.field!.combat!.lastStand&&action==='retreat'){
  const loss=sacrificeWolf(s),n=loss===s?structuredClone(s):loss,f=n.field!;
  f.combat=null;f.threat=null;f.mutantNextStep=f.steps+mutantTier(f.region).respawn;f.mutantNextTurn=(f.sporeSpread?.turn??0)+mutantTier(f.region).respawnTurns;f.interruptedCapture=null;f.pressure=Math.max(0,(f.pressure??0)-18);
  if(loss!==s){n.roamingStory??={};n.roamingStory.lastStandDay=n.day;}
  else n.lastOutcome='엄호 조건 변경 · 추가 인력 손실 없이 우회했습니다.';
  f.lastEvent=n.lastOutcome;return n;
 }
 const n=structuredClone(s),f=n.field!,b=f.combat!,run=n.run!;
 if(action==='intro-continue'){b.introPending=false;return n;}
 if(action==='cancel-last-stand'){b.lastStand=false;b.log=['엄호 제안을 거절했습니다. 경비관과 함께 다른 대응을 선택하세요.'];return n;}
 if(action==='wolf-last-stand'){b.lastStand=true;b.log=['보안관: 관리자님, 먼저 가십시오! 이번에는 제가 반드시 문을 지키겠습니다.','EVE: 엄호를 수락하면 경비관은 돌아오지 않습니다.'];return n;}
 if(action==='retreat'){
  const chance=escapeChance(s);b.seed=(Math.imul(b.seed??(n.day*97+f.position),1664525)+1013904223)>>>0;
  if(b.seed%100<chance){const mobile=b.source==='mobile'&&f.threat;f.combat=null;f.pressure=Math.min(100,(f.pressure??0)+7);n.stamina=Math.max(1,n.stamina-2);if(mobile)relocateThreat(f);resumeCapture(n);f.lastEvent=n.lastOutcome='도주 성공 · ST -2 · 추적 수치 +7 · 전리품 없음.';return n;}
 }
 const ability=mutantArchetype(b.mutantVariant).ability,archetype=mutantArchetype(b.mutantVariant),wasStaggered=b.stagger;
 b.strikeChain=action==='strike'?(b.strikeChain??0)+1:0;b.lastAction=action;let hit=0,shield=0,message=action==='retreat'?'도주 실패 · 퇴로 차단.':'';
 if(action==='strike'){const base=b.stagger?24:b.intent==='charge'?20:10;hit=base+4*upgradeLevel(n,'baton');message=`제압봉 적중 · 내구 -${hit}${b.intent!=='charge'&&!b.stagger?' · 반격 위험':''}`;}
 if(action==='guard'){shield=19;b.stagger=(b.intent==='lunge'||b.intent==='sweep')||b.stagger;message='방호 자세를 취했습니다.';}
 if(action==='cover'){shield=23;if(b.intent==='spray'||b.intent==='burst')b.stagger=true;message='장애물 뒤로 몸을 숨겼습니다.';}
 if(action==='heal'){run.integrity=cap(run.integrity+24);run.medkitUsed=true;shield=8;message='응급 키트로 방호 장비를 봉합했습니다. 방호 +24';}
 if(action==='pulse'){const pulseCost=3+(ability==='eve-jam'?2:0);hit=ability==='eve-jam'?6:10;shield=20;run.evePulseUsed=true;n.power-=pulseCost;message=`EVE 전자 펄스 · 전력 -${pulseCost} · 공격 차단${ability==='eve-jam'?' · MUTANT가 신호를 교란':''}`;}
 if(action==='support'){
  const ids=run.companions??[run.companion];const team=n.crew!.members.filter(m=>ids.includes(m.id)&&m.mind>5);team.forEach(m=>m.mind=cap(m.mind-(m.bond>=100?0:m.bond>=70?1:3)));run.supportUsed=true;shield=8;hit=8;
  if(team.some(m=>m.id==='wolf')){hit=14;message='보안관이 전면을 막고 핵을 제압합니다.';}
  if(team.some(m=>m.id==='rabbit')){n.mind=cap(n.mind+8);message+=' 의무관이 안정제를 투여합니다. 정신 +8';}
  if(team.some(m=>m.id==='fox')){n.scrap+=3;run.earned??={scrap:0,knowledge:0,clues:0};run.earned.scrap+=3;message+=' 보급관이 자재를 회수합니다. 고철 +3';}
  if(team.some(m=>m.id==='deer')){n.infection=cap(n.infection-6);message+=' 기록관이 안전한 틈을 찾습니다. 감염 -6';}
 }
 if(action==='strike')b.stagger=false;
 if(ability==='armor'&&hit>0&&!wasStaggered&&action!=='pulse'){const absorbed=Math.max(1,Math.ceil(hit*.35));hit=Math.max(1,hit-absorbed);message+=` · 외피가 피해 ${absorbed}를 흡수`;}
 b.hp=Math.max(0,b.hp-hit);n.stamina=Math.max(1,n.stamina-2);
 if(ability==='molt'&&!b.moltTriggered&&b.hp>0&&b.hp<=b.maxHp*.5){b.moltTriggered=true;const before=b.hp,recovered=Math.max(6,Math.round(b.maxHp*.14));b.hp=Math.min(b.maxHp,b.hp+recovered);b.intent='burst';message+=` · 허물이 찢어지며 재생 · 내구 +${b.hp-before}`;}
 if(ability==='regenerate'&&b.hp>0&&!wasStaggered){const recovered=Math.min(5,b.maxHp-b.hp);if(recovered>0){b.hp+=recovered;message+=` · 조직 재생 · 내구 +${recovered}`;}}
 if(b.hp<=0){const loot=4+(run.region==='garden'?0:2);n.scrap+=loot;run.earned??={scrap:0,knowledge:0,clues:0};run.earned.scrap+=loot;run.loot+=2;f.loot+=2;if(b.source==='mobile'){f.threat=null;f.mutantNextStep=f.steps+mutantTier(run.region).respawn;f.mutantNextTurn=(f.sporeSpread?.turn??0)+mutantTier(run.region).respawnTurns;f.mutantSpawns=Math.max(1,f.mutantSpawns??0);}f.combat=null;resumeCapture(n);f.pressure=Math.max(0,(f.pressure??0)-30);message+=` · MUTANT 격퇴 · 다른 신호가 다시 접근할 수 있습니다. 고철 +${loot}, 회수 점수 +2, 추적망 -30. 지정 출구로 회수하세요.`;}
 else{
  const profile=mutantAttack[b.intent];
  const soundBonus=ability==='sound-hunt'&&(f.noise??0)>=35?1.2:1,impactBonus=ability==='impact'&&['lunge','sweep','burst'].includes(b.intent)?1.2:1,apexBonus=ability==='apex'&&b.round%3===0?1.35:1;
  const scale=mutantTier(run.region).damageScale*archetype.damageScale*soundBonus*impactBonus*apexBonus;
  const attack=Math.round(profile.damage*scale)+(action==='retreat'?6:0);
  const effectiveShield=action==='pulse'?shield+10:action==='guard'&&(b.intent==='spray'||b.intent==='burst')?Math.floor(shield*.45):action==='cover'&&(b.intent==='lunge'||b.intent==='sweep')?Math.floor(shield*.55):shield;
  const damage=Math.max(0,attack-effectiveShield-3*Math.max(0,Math.min(5,run.suitLevel??0))-((run.companions??[run.companion]).includes('wolf')?2:0));
  run.integrity=cap(run.integrity-damage);if(damage>0)n.mind=cap(n.mind-Math.ceil(damage/4)-(ability==='mind'?3:0));
  const protection=(run.gear.includes('filter')?6+2*upgradeLevel(n,'filterseal'):0)+(action==='cover'?12:action==='pulse'?18:action==='guard'?3:0);
  const infectionScale=ability==='infect'||ability==='spawn'?1.45:1;
  const infection=Math.max(0,Math.round(profile.infection*scale*infectionScale)-protection);n.infection=cap(n.infection+infection);
  const extraSpores=ability==='spore'||ability==='spawn'?2:0;
  const spores=profile.spores||extraSpores?depositMutantSpores(f,f.threat?.position??f.position,Math.max(1,Math.round(profile.spores*scale)+extraSpores)):0;
  if(spores)message+=' · MUTANT 포자 '+spores+'칸 배출';
  if(ability==='mind'&&b.intent==='feint'){n.mind=cap(n.mind-5);message+=' · 감각 꽃잎이 기억을 뒤흔듭니다. 정신 -5';}
  if(ability==='false-signal'&&b.intent==='feint'){n.mind=cap(n.mind-6);message+=' · 가짜 발소리에 방향 감각을 잃습니다. 정신 -6';}
  if(ability==='resonance'&&['charge','burst','feint'].includes(b.intent)){n.power=Math.max(0,n.power-2);message+=' · 공명파가 EVE 전력을 흡수합니다. 전력 -2';}
  if(ability==='light-drain'&&(f.lightSteps??0)>0){f.lightSteps=Math.max(0,(f.lightSteps??0)-1);if(f.lightSteps===0)f.lightOff=true;message+=' · 주변 조명이 한 단계 약해집니다.';}
  b.round++;b.seed=(Math.imul(b.seed??(n.day*97+f.position),1664525)+1013904223)>>>0;b.tier=mutantTierIndex(run.region);
  b.intent=ability==='charge'&&b.round%3===0?'charge':mutantIntentFor(b.seed,b.tier,action,b.intent);
  b.obscured=ability==='obscure'||ability==='unpredictable'&&(b.seed>>>15)%3===0||(b.seed>>>16)%100<mutantTier(run.region).ambiguity;
  const deltas=[['방호',run.integrity-(s.run?.integrity??run.integrity)],['정신',n.mind-s.mind],['ST',n.stamina-s.stamina],['전력',n.power-s.power],['감염',n.infection-s.infection],['적 내구',b.hp-(s.field?.combat?.hp??b.hp)]] as const;const actual=deltas.filter(([,v])=>v!==0).map(([k,v])=>k+' '+(v>0?'+':'')+v).join(' · ');b.log=[message+' · 실제 변화: '+(actual||'없음'),...b.log].slice(0,4);
  if(b.round>combatRoundLimit(b)||run.integrity<=0||n.mind<=0){f.combat=null;f.interruptedCapture=null;if(f.threat)relocateThreat(f);run.integrity=Math.max(1,run.integrity);n.mind=cap(n.mind-5);message+=' · 안전 거리로 긴급 이탈. 정신 -5, 전리품 없음.';}
 }
 queueCrewTerminations(n);f.lastEvent=n.lastOutcome=message;log(n,'현장 오염 대응',message,'info');return n;
}
export type UpgradeId='relay'|'battery'|'clinic'|'net'|'suit'|'scanner'|'sortie'|'baton'|'filterseal';
export const baseUpgrades:Record<UpgradeId,{name:string;effect:string;scrap:number;parts:number;power:number}>={
 relay:{name:'현장 추적망',effect:'1–5단계: 이동 압박 감소 · Lv1 출구 표시 · Lv2 동물 방위 · Lv4 적 경계 완화 · Lv5 적 감지 거리 감소',scrap:8,parts:1,power:4},
 battery:{name:'전력 축전기',effect:'단계마다 야간 전력 +5',scrap:10,parts:2,power:4},
 clinic:{name:'안정화 병동',effect:'단계마다 야간 개체 스트레스 -2 · 직원 정신 +1',scrap:9,parts:1,power:5},
 net:{name:'포획망 장력기',effect:'단계마다 추적 포획 행동 +1 · 그물 저항 중 추가 관찰 여유',scrap:8,parts:2,power:3},
 suit:{name:'방호복 보강판',effect:'단계마다 전투 피격 피해 -3 · 최대 5단계',scrap:9,parts:2,power:4},
 sortie:{name:'탐사 운영 확장',effect:'하루 최대 탐사 2회 · 출동마다 AP와 장비 비용 소모',scrap:14,parts:3,power:8},
 baton:{name:'제압봉 출력 강화',effect:'단계마다 제압봉 피해 +4 · 최대 5단계',scrap:8,parts:1,power:4},
 filterseal:{name:'바이오필터 밀폐 보강',effect:'필터 장착 시 전투 감염 피해 단계마다 -2 · 최대 5단계',scrap:7,parts:1,power:3},
 scanner:{name:'EVE 스캐너 렌즈',effect:'EVE 스캐너 장착 시 2단계마다 조사 시야 +1칸',scrap:10,parts:2,power:5}
};
export function upgradeMaxLevel(id:UpgradeId){return id==='sortie'?1:['relay','baton','suit','filterseal'].includes(id)?5:3;}
export function upgradeLevel(s:V10,id:UpgradeId){return Math.max(0,Math.min(upgradeMaxLevel(id),s.baseLevels?.[id]??0));}
export function upgradeCost(s:V10,id:UpgradeId){const r=baseUpgrades[id],level=upgradeLevel(s,id);return {scrap:r.scrap+level*6,parts:r.parts+level,power:r.power};}
export function upgradeBlock(s:V10,id:UpgradeId):string|null{
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident)return '진행 중인 작업을 먼저 마치세요.';
 if(!s.facilities.cctv)return 'CCTV 감시망 복구 후 강화 가능';
 if(upgradeLevel(s,id)>=upgradeMaxLevel(id))return '최대 단계';
 const c=upgradeCost(s,id);if(s.scrap<c.scrap||s.parts<c.parts||s.power<c.power)return '강화 자원 부족';return null;
}
export function upgradeBase(s:V10,id:UpgradeId):V10{if(upgradeBlock(s,id))return s;const n=structuredClone(s),c=upgradeCost(s,id);n.scrap-=c.scrap;n.parts-=c.parts;n.power-=c.power;n.baseLevels??={};n.baseLevels[id]=upgradeLevel(s,id)+1;n.lastOutcome=`${baseUpgrades[id].name} ${n.baseLevels[id]}단계 강화 완료`;log(n,'기지 강화',n.lastOutcome,'good');return n;}


/** Visual-only summary of a resolved turn. Does not roll or mutate combat state. */
export function combatTurnFeedback(before:V10,after:V10){
 const previous=before.field?.combat,remaining=after.field?.combat;
 const defeated=!remaining&&/MUTANT 격퇴|오염 제거/.test(after.lastOutcome);
 const hp=remaining?.hp??(defeated?0:previous?.hp??0);
 const integrity=after.run?.integrity??before.run?.integrity??0;
 return {hp,integrity,enemyDamage:Math.max(0,(previous?.hp??0)-hp),damage:Math.max(0,(before.run?.integrity??0)-integrity),recovery:Math.max(0,integrity-(before.run?.integrity??0)),mindLoss:Math.max(0,before.mind-after.mind),infection:Math.max(0,after.infection-before.infection),defeated,escaped:!remaining&&after.lastOutcome.includes('도주 성공'),fatal:after.mind<=0||after.eve<=0};
}
