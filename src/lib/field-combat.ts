import type {V10} from './game-v10';
import {cap,log} from './sim';
export type FieldEnemy='slime'|'echo';
export type CombatAction='strike'|'guard'|'pulse'|'support'|'retreat';
export type FieldCombat={enemy:FieldEnemy;hp:number;maxHp:number;round:number;intent:'lunge'|'charge'|'spray';stagger:boolean;log:string[]};
export const combatIntent={lunge:'돌진 준비 · 방어하면 반격 기회가 생깁니다.',charge:'핵 노출 · 지금 제압하면 큰 피해를 줍니다.',spray:'포자 분사 · EVE 펄스로 차단하거나 방어하십시오.'};
export function newFieldCombat(seed:number):FieldCombat{return {enemy:seed%2?'echo':'slime',hp:24,maxHp:24,round:1,intent:seed%2?'spray':'lunge',stagger:false,log:['EVE: 동물의 생체 신호가 아닙니다. 오염 덩어리의 다음 움직임을 확인하세요.']};}
export function combatBlock(s:V10,action:CombatAction):string|null{
 if(!s.run||!s.field?.combat||s.capture||s.phase!=='day')return '진행 중인 현장 전투가 없습니다.';
 if(action==='pulse'&&(s.run.evePulseUsed||s.power<3))return s.run.evePulseUsed?'EVE 지원은 출동당 한 번입니다.':'전력 3 필요';
 const m=s.crew?.members.find(m=>m.id===s.run?.companion&&m.mind>5);
 if(action==='support'&&(!m||s.run.supportUsed))return !m?'동행 직원이 없거나 정신력이 부족합니다.':'동행 지원은 출동당 한 번입니다.';
 return null;
}
/** Each action settles once. No timers or random rerolls; reloading preserves intent. */
export function resolveCombat(s:V10,action:CombatAction):V10{
 if(combatBlock(s,action))return s;
 const n=structuredClone(s),f=n.field!,b=f.combat!,run=n.run!;
 if(action==='retreat'){f.combat=null;f.pressure=Math.min(94,(f.pressure??0)+7);n.stamina=Math.max(1,n.stamina-2);f.lastEvent=n.lastOutcome='후퇴로를 확보했습니다. ST -2 · 추적망 +7 · 전리품 없음.';return n;}
 let hit=0,shield=0,message='';
 if(action==='strike'){hit=b.intent==='charge'||b.stagger?14:8;message=`제압봉으로 핵 타격 · 내구 -${hit}`;}
 if(action==='guard'){shield=8;b.stagger=true;message='방호 자세 · 이번 공격 차단, 다음 타격 강화';}
 if(action==='pulse'){hit=10;shield=20;run.evePulseUsed=true;n.power-=3;message='EVE 전자 펄스 · 전력 -3 · 공격 차단';}
 if(action==='support'){
  const m=n.crew!.members.find(m=>m.id===run.companion)!;m.mind=cap(m.mind-3);run.supportUsed=true;shield=8;hit=8;
  if(m.id==='wolf'){hit=14;message='보안관이 전면을 막고 핵을 제압합니다.';}
  if(m.id==='rabbit'){n.mind=cap(n.mind+8);message='의무관이 안정제를 투여하고 안전 거리를 확보합니다. 정신 +8';}
  if(m.id==='fox'){n.scrap+=3;run.earned??={scrap:0,knowledge:0,clues:0};run.earned.scrap+=3;message='보급관이 잔해로 공격을 막고 자재를 회수합니다. 고철 +3';}
  if(m.id==='deer'){n.infection=cap(n.infection-6);message='기록관이 분사 주기를 대조해 안전한 틈으로 안내합니다. 감염 -6';}
 }
 if(action==='strike')b.stagger=false;
 b.hp=Math.max(0,b.hp-hit);n.stamina=Math.max(1,n.stamina-2);
 if(b.hp<=0){const loot=4+(run.region==='garden'?0:2);n.scrap+=loot;run.earned??={scrap:0,knowledge:0,clues:0};run.earned.scrap+=loot;run.loot+=2;f.loot+=2;f.combat=null;f.pressure=Math.max(0,(f.pressure??0)-12);message+=` · 오염 제거. 고철 +${loot}, 회수 점수 +2, 추적망 -12. 지정 출구로 회수하세요.`;}
 else{
  const attack=b.intent==='charge'?0:b.intent==='lunge'?7:5;
  const damage=Math.max(0,attack-shield-(run.companion==='wolf'?2:0));run.integrity=cap(run.integrity-damage);
  if(b.intent==='spray')n.infection=cap(n.infection+Math.max(0,damage-(run.gear.includes('filter')?3:0)));
  b.round++;b.intent=b.round%3===0?'spray':b.round%3===1?'lunge':'charge';b.log=[message+` · 방호 -${damage}`, ...b.log].slice(0,4);
  if(b.round>6||run.integrity<=0){f.combat=null;run.integrity=Math.max(1,run.integrity);n.mind=cap(n.mind-5);message+=' · 안전 거리로 긴급 이탈. 정신 -5, 전리품 없음.';}
 }
 f.lastEvent=n.lastOutcome=message;log(n,'현장 오염 대응',message,'info');return n;
}
export type UpgradeId='relay'|'battery'|'clinic';
export const baseUpgrades:Record<UpgradeId,{name:string;effect:string;scrap:number;parts:number;power:number}>={
 relay:{name:'현장 중계기',effect:'단계마다 추적망 증가 -1 · 1단계부터 미니맵 출구 표시 · 2단계부터 동물의 대략적인 방향 수신',scrap:8,parts:1,power:4},
 battery:{name:'전력 축전기',effect:'단계마다 야간 전력 +5 · 탐사 손전등 소모 완화',scrap:10,parts:2,power:4},
 clinic:{name:'안정화 병동',effect:'단계마다 야간 개체 스트레스 -2 · 직원 정신 +1',scrap:9,parts:1,power:5}
};
export function upgradeLevel(s:V10,id:UpgradeId){return Math.max(0,Math.min(3,s.baseLevels?.[id]??0));}
export function upgradeCost(s:V10,id:UpgradeId){const r=baseUpgrades[id],level=upgradeLevel(s,id);return {scrap:r.scrap+level*6,parts:r.parts+level,power:r.power};}
export function upgradeBlock(s:V10,id:UpgradeId):string|null{
 if(s.phase!=='day'||s.run||s.pending||s.pendingIncident)return '진행 중인 작업을 먼저 마치세요.';
 if(!s.facilities.cctv)return 'CCTV 감시망 복구 후 강화 가능';
 if(upgradeLevel(s,id)>=3)return '최대 단계';
 const c=upgradeCost(s,id);if(s.scrap<c.scrap||s.parts<c.parts||s.power<c.power)return '강화 자원 부족';return null;
}
export function upgradeBase(s:V10,id:UpgradeId):V10{if(upgradeBlock(s,id))return s;const n=structuredClone(s),c=upgradeCost(s,id);n.scrap-=c.scrap;n.parts-=c.parts;n.power-=c.power;n.baseLevels??={};n.baseLevels[id]=upgradeLevel(s,id)+1;n.lastOutcome=`${baseUpgrades[id].name} ${n.baseLevels[id]}단계 강화 완료`;log(n,'기지 강화',n.lastOutcome,'good');return n;}
