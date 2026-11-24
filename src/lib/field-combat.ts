import type {V10} from './game-v10';
import {cap,log} from './sim';
import {canWolfLastStand,sacrificeWolf,queueCrewTerminations} from './crew';
import {advanceFieldThreat,type Pace} from './tactical-field';
export type FieldEnemy='slime'|'echo'|'mutant';
export type CombatAction='strike'|'guard'|'cover'|'heal'|'pulse'|'support'|'retreat'|'intro-continue'|'wolf-last-stand'|'cancel-last-stand';
export type FieldCombat={enemy:FieldEnemy;hp:number;maxHp:number;round:number;intent:'lunge'|'charge'|'spray';stagger:boolean;log:string[];source?:'hazard'|'mobile';lastAction?:CombatAction;introPending?:boolean;lastStand?:boolean;seed?:number;strikeChain?:number;}
export function mutantClue(b:FieldCombat){return b.intent==='lunge'?'앞다리가 땅을 긁는다. 몸의 무게가 앞으로 쏠린다.':b.intent==='charge'?'흉부의 조직이 갈라지고 안쪽 빛이 드러난다.':'등의 막이 부풀며 주변 공기가 일렁인다.';}
export function combatRoundLimit(b:FieldCombat){return b.enemy==='mutant'?9:6;}
export const combatIntent={lunge:'돌진 준비 · 방어하면 반격 기회가 생깁니다.',charge:'핵 노출 · 지금 제압하면 큰 피해를 줍니다.',spray:'포자 분사 · EVE 펄스로 차단하거나 방어하십시오.'};
export function newFieldCombat(seed:number):FieldCombat{return {enemy:seed%2?'echo':'slime',hp:24,maxHp:24,round:1,intent:seed%2?'spray':'lunge',stagger:false,log:['EVE: 동물의 생체 신호가 아닙니다. 오염 덩어리의 다음 움직임을 확인하세요.']};}
/** The special Mutant is one persistent individual, distinct from M-00. */
export function mutantSecured(s:V10):boolean{return s.animals.some(a=>a.id==='mutant')||!!s.headquarters?.transferred.includes('mutant')||s.pending==='mutant'||Object.values(s.archive?.entries??{}).some(entry=>entry.species==='mutant');}
/** Movement and realtime pursuit enter exactly the same encounter. */
export function beginRoamingCombat(s:V10):boolean{
 const f=s.field;if(!s.run||!f?.threat||f.combat||f.choice||s.pending||s.run.firstTutorial||mutantSecured(s))return false;
 if(s.capture){f.interruptedCapture=s.capture;s.capture=null;}
 const first=!s.roamingStory?.firstEncounterDay;
 s.roamingStory??={};if(first)s.roamingStory.firstEncounterDay=s.day;
 f.combat={enemy:'mutant',hp:48,maxHp:48,round:1,seed:Math.floor(Math.random()*2147483647),intent:'lunge',stagger:false,source:'mobile',introPending:first,log:['EVE: 배회형 MUTANT입니다. 등록되지 않은 특수 변이체입니다. 방어하거나 안전하게 우회하세요.']};
 f.threat.mode='closing';f.threat.stage='chase';
 if(first)log(s,'최초 배회 위협 조우','외곽에서 특수 변이체 MUTANT를 확인했습니다. 동일 개체의 추적 경로가 기록되었습니다.','bad');
 return true;
}
/** One simulation entry point for walking and realtime ticks. */
export function tickRoamingThreat(s:V10,pace?:Pace):boolean{
 const f=s.field,run=s.run;if(!run||!f?.threat||f.combat||f.choice||s.pending||run.firstTutorial||mutantSecured(s)||run.integrity<=0||s.mind<=0||s.eve<=0)return false;
 const light=run.gear.includes('flashlight')&&!f.lightOff&&s.flashlight>0;
 if(advanceFieldThreat(f,f.noise,upgradeLevel(s,'relay'),light,pace)&&beginRoamingCombat(s))return true;
 return false;
}
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
 if(action==='pulse'&&(s.run.evePulseUsed||s.power<3))return s.run.evePulseUsed?'EVE 지원은 출동당 한 번입니다.':'전력 3 필요';
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
  f.combat=null;f.threat=null;f.interruptedCapture=null;f.pressure=Math.max(0,(f.pressure??0)-18);
  if(loss!==s){n.roamingStory??={};n.roamingStory.lastStandDay=n.day;}
  else n.lastOutcome='엄호 조건 변경 · 추가 인력 손실 없이 우회했습니다.';
  f.lastEvent=n.lastOutcome;return n;
 }
 const n=structuredClone(s),f=n.field!,b=f.combat!,run=n.run!;
 if(action==='intro-continue'){b.introPending=false;return n;}
 if(action==='cancel-last-stand'){b.lastStand=false;b.log=['엄호 제안을 거절했습니다. 경비관과 함께 다른 대응을 선택하세요.'];return n;}
 if(action==='wolf-last-stand'){b.lastStand=true;b.log=['경비관: 관리자님, 먼저 가세요. 이번에는 제가 문을 지킬게요.','EVE: 엄호를 수락하면 경비관은 돌아오지 않습니다.'];return n;}
 if(action==='retreat'){const mobile=b.source==='mobile'&&f.threat;f.combat=null;f.pressure=Math.min(94,(f.pressure??0)+7);n.stamina=Math.max(1,n.stamina-2);if(mobile){const w=f.width??7,from=mobile.position,to=f.position,dist=(a:number)=>Math.abs(a%w-to%w)+Math.abs(Math.floor(a/w)-Math.floor(to/w));const options=[from-w,from+w,from-1,from+1].filter(i=>i>=0&&i<f.tiles.length&&f.tiles[i]!=='wall'&&Math.abs(i%w-from%w)+Math.abs(Math.floor(i/w)-Math.floor(from/w))===1);options.sort((a,c)=>dist(c)-dist(a));if(options[0]!==undefined)mobile.position=options[0];mobile.alert=Math.max(0,mobile.alert-22);mobile.mode='search';mobile.stage='retreat';mobile.warningTicks=0;mobile.cooldown=3;}resumeCapture(n);f.lastEvent=n.lastOutcome='후퇴로를 확보했습니다. ST -2 · 추적망 +7 · 전리품 없음.';return n;}
 const repeated=b.lastAction==='strike'&&(b.strikeChain??1)>0;b.strikeChain=action==='strike'?(b.strikeChain??0)+1:0;b.lastAction=action;let hit=0,shield=0,message='';
 if(action==='strike'){hit=b.enemy==='mutant'?(b.stagger?24:b.intent==='charge'?14:repeated?0:3):b.intent==='charge'||b.stagger?14:8;message=`제압봉으로 핵 타격 · 내구 -${hit}`;}
 if(action==='guard'){shield=b.enemy==='mutant'?19:8;b.stagger=b.enemy!=='mutant'||b.intent==='lunge'||b.stagger;message='방호 자세 · 피해 감소, 다음 타격 강화';}
 if(action==='cover'){shield=b.enemy==='mutant'?23:14;if(b.enemy==='mutant'&&b.intent==='spray')b.stagger=true;message='장애물 뒤 엄폐 · 피해를 크게 줄입니다. 새 반격 기회는 생성되지 않습니다.';}
 if(action==='heal'){run.integrity=cap(run.integrity+24);run.medkitUsed=true;shield=8;message='응급 키트로 방호 장비를 봉합했습니다. 방호 +24';}
 if(action==='pulse'){hit=10;shield=20;run.evePulseUsed=true;n.power-=3;message='EVE 전자 펄스 · 전력 -3 · 공격 차단';}
 if(action==='support'){
  const ids=run.companions??[run.companion];const team=n.crew!.members.filter(m=>ids.includes(m.id)&&m.mind>5);team.forEach(m=>m.mind=cap(m.mind-(m.bond>=100?0:m.bond>=70?1:3)));run.supportUsed=true;shield=8;hit=8;
  if(team.some(m=>m.id==='wolf')){hit=14;message='보안관이 전면을 막고 핵을 제압합니다.';}
  if(team.some(m=>m.id==='rabbit')){n.mind=cap(n.mind+8);message+=' 의무관이 안정제를 투여합니다. 정신 +8';}
  if(team.some(m=>m.id==='fox')){n.scrap+=3;run.earned??={scrap:0,knowledge:0,clues:0};run.earned.scrap+=3;message+=' 보급관이 자재를 회수합니다. 고철 +3';}
  if(team.some(m=>m.id==='deer')){n.infection=cap(n.infection-6);message+=' 기록관이 안전한 틈을 찾습니다. 감염 -6';}
 }
 if(action==='strike')b.stagger=false;
 b.hp=Math.max(0,b.hp-hit);n.stamina=Math.max(1,n.stamina-2);
 if(b.hp<=0){const loot=4+(run.region==='garden'?0:2);n.scrap+=loot;run.earned??={scrap:0,knowledge:0,clues:0};run.earned.scrap+=loot;run.loot+=2;f.loot+=2;if(b.source==='mobile')f.threat=null;f.combat=null;resumeCapture(n);f.pressure=Math.max(0,(f.pressure??0)-12);message+=` · ${b.enemy==='mutant'?'MUTANT 격퇴 · 생존 신호는 멀어졌습니다.':'오염 제거'}. 고철 +${loot}, 회수 점수 +2, 추적망 -12. 지정 출구로 회수하세요.`;}
 else{
  const attack=b.intent==='charge'?0:b.enemy==='mutant'?(b.intent==='lunge'?28:22):(b.intent==='lunge'?7:5);
  const damage=Math.max(0,attack-shield-Math.max(0,Math.min(3,run.suitLevel??0))-((run.companions??[run.companion]).includes('wolf')?2:0));run.integrity=cap(run.integrity-damage);if(b.enemy==='mutant'&&damage>0)n.mind=cap(n.mind-Math.ceil(damage/4));
  if(b.intent==='spray')n.infection=cap(n.infection+Math.max(0,damage-(run.gear.includes('filter')?3:0)));
  b.round++;if(b.enemy==='mutant'){b.seed=(Math.imul(b.seed??(n.day*97+f.position),1664525)+1013904223)>>>0;const pool:FieldCombat['intent'][]=b.strikeChain>=2?['lunge','spray','lunge']:['lunge','charge','spray'];b.intent=pool[b.seed%pool.length];}else b.intent=b.round%3===0?'spray':b.round%3===1?'lunge':'charge';const deltas=[['방호',run.integrity-(s.run?.integrity??run.integrity)],['정신',n.mind-s.mind],['ST',n.stamina-s.stamina],['전력',n.power-s.power],['감염',n.infection-s.infection],['적 내구',b.hp-s.field!.combat!.hp]] as const;const actual=deltas.filter(([,v])=>v!==0).map(([k,v])=>k+' '+(v>0?'+':'')+v).join(' · ');b.log=[message+' · 실제 변화: '+(actual||'없음'),...b.log].slice(0,4);
  if(b.round>combatRoundLimit(b)||run.integrity<=0||n.mind<=0){f.combat=null;f.interruptedCapture=null;if(f.threat){f.threat.cooldown=3;f.threat.warningTicks=0;f.threat.mode='search';f.threat.stage='retreat';}run.integrity=Math.max(1,run.integrity);n.mind=cap(n.mind-5);message+=' · 안전 거리로 긴급 이탈. 정신 -5, 전리품 없음.';}
 }
 queueCrewTerminations(n);f.lastEvent=n.lastOutcome=message;log(n,'현장 오염 대응',message,'info');return n;
}
export type UpgradeId='relay'|'battery'|'clinic'|'net'|'suit'|'scanner'|'sortie';
export const baseUpgrades:Record<UpgradeId,{name:string;effect:string;scrap:number;parts:number;power:number}>={
 relay:{name:'현장 추적망',effect:'1–5단계: 이동 압박 감소 · Lv1 출구 표시 · Lv2 동물 방위 · Lv4 적 경계 완화 · Lv5 적 감지 거리 감소',scrap:8,parts:1,power:4},
 battery:{name:'전력 축전기',effect:'단계마다 야간 전력 +5 · 탐사 손전등 소모 완화',scrap:10,parts:2,power:4},
 clinic:{name:'안정화 병동',effect:'단계마다 야간 개체 스트레스 -2 · 직원 정신 +1',scrap:9,parts:1,power:5},
 net:{name:'포획망 장력기',effect:'단계마다 추적 포획 행동 +1 · 그물 저항 중 추가 관찰 여유',scrap:8,parts:2,power:3},
 suit:{name:'방호복 보강판',effect:'단계마다 전투 피격 피해 -1 · 위험 지대 방호 내구도 보존',scrap:9,parts:2,power:4},
 sortie:{name:'탐사 운영 확장',effect:'하루 최대 탐사 2회 · 출동마다 AP와 장비 비용 소모',scrap:14,parts:3,power:8},
 scanner:{name:'EVE 스캐너 렌즈',effect:'EVE 스캐너 장착 시 2단계마다 조사 시야 +1칸',scrap:10,parts:2,power:5}
};
export function upgradeMaxLevel(id:UpgradeId){return id==='sortie'?1:id==='relay'?5:3;}
export function upgradeLevel(s:V10,id:UpgradeId){return Math.max(0,Math.min(upgradeMaxLevel(id),s.baseLevels?.[id]??0));}
export function upgradeCost(s:V10,id:UpgradeId){const r=baseUpgrades[id],level=upgradeLevel(s,id);return {scrap:r.scrap+level*6,parts:r.parts+level,power:r.power};}
export function upgradeBlock(s:V10,id:UpgradeId):string|null{
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident)return '진행 중인 작업을 먼저 마치세요.';
 if(!s.facilities.cctv)return 'CCTV 감시망 복구 후 강화 가능';
 if(upgradeLevel(s,id)>=upgradeMaxLevel(id))return '최대 단계';
 const c=upgradeCost(s,id);if(s.scrap<c.scrap||s.parts<c.parts||s.power<c.power)return '강화 자원 부족';return null;
}
export function upgradeBase(s:V10,id:UpgradeId):V10{if(upgradeBlock(s,id))return s;const n=structuredClone(s),c=upgradeCost(s,id);n.scrap-=c.scrap;n.parts-=c.parts;n.power-=c.power;n.baseLevels??={};n.baseLevels[id]=upgradeLevel(s,id)+1;n.lastOutcome=`${baseUpgrades[id].name} ${n.baseLevels[id]}단계 강화 완료`;log(n,'기지 강화',n.lastOutcome,'good');return n;}

