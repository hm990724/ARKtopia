'use client';
import ArtSlot from './ArtSlot';
import {useEffect,useRef,useState} from 'react';
import {Swords,Shield,ShieldHalf,Cross,Radio,Users,Footprints,AlertTriangle} from 'lucide-react';
import {gameplayArt} from '@/lib/gameplay-art';
import {createPortal} from 'react-dom';
import type {V10} from '@/lib/game-v10';
import {combatBlock,fieldEnemyClue,combatRoundLimit,escapeChance,resolveCombat,combatTurnFeedback,type CombatAction,baseUpgrades,upgradeLevel,upgradeMaxLevel,upgradeBlock,upgradeCost,type UpgradeId} from '@/lib/field-combat';
import {CREW_PROFILES,canWolfLastStand,type CrewId} from '@/lib/crew';
import {combatStaffSprite} from '@/lib/character-art';
import RangerSprite from './RangerSprite';
import StoryStill from './StoryStill';
import {storyArtworkCandidates} from '@/lib/story-art';
import {mutantReveal,mutantSprite} from '@/lib/monster-art';
import {mutantArchetype} from '@/lib/mutant-roster';
type CombatHandler=(action:CombatAction,prepared?:{before:V10;after:V10})=>void;
export function CombatPanel({state,onAction}:{state:V10;onAction:CombatHandler}){
 const b=state.field?.combat;if(!b)return null;
 const companions=(state.run?.companions??[state.run?.companion]).filter((id):id is CrewId=>!!id&&!!state.crew?.members.some(m=>m.id===id&&m.mind>0));
 if(b.introPending||b.lastStand){const last=!!b.lastStand,variant=b.mutantVariant??1,archetype=mutantArchetype(variant),label=`MUTANT-${String(variant).padStart(2,'0')} · ${archetype.name}`,art=last?storyArtworkCandidates(9):[mutantReveal(variant),gameplayArt.result('combatEncounter'),...storyArtworkCandidates(8)];return createPortal(<div className="v74-combat-shade"><section className="v74-combat origin-field-scene" role="dialog" aria-modal="true" aria-label={last?'경비관의 마지막 엄호':`최초 MUTANT 조우 · ${label}`}><h3>{last?'경비관의 마지막 엄호':`최초 MUTANT 조우 · ${label}`}</h3><StoryStill sources={art} alt={last?'경비관의 마지막 엄호':`어둠 속에서 모습을 드러낸 ${label}`}/><p>{last?'경비관: 관리자님, 먼저 가세요. 제가 막을게요.':`EVE: ${archetype.name} 생체 변이 신호가 접근합니다. ${archetype.fieldTell} 이동을 멈추고 퇴로와 동행자 상태를 확인하십시오.`}</p>{last&&<p>확인 시 경비관 영구 이탈 · 다른 생존 직원 정신력 -30 · 경비 부재 발생.</p>}<button type="button" onClick={()=>onAction(last?'retreat':'intro-continue')}>{last?'마지막 엄호를 받고 철수한다':'현장 대응 시작'}</button>{last&&<button type="button" onClick={()=>onAction('cancel-last-stand')}>엄호 거부 · 함께 다른 대응</button>}</section></div>,document.body);}
 return <CombatArena state={state} onAction={onAction}/>;
}
const actionDeck=[
 {id:'strike',label:'제압봉 타격',hint:'ST -2 · 직접 공격',icon:Swords,tone:'attack',key:'1'},
 {id:'guard',label:'방어',hint:'ST -2 · 방호 자세',icon:Shield,tone:'defense',key:'2'},
 {id:'cover',label:'엄폐',hint:'ST -2 · 장애물 이용',icon:ShieldHalf,tone:'defense',key:'3'},
 {id:'heal',label:'응급 치료',hint:'응급 키트 1회',icon:Cross,tone:'utility',key:'4'},
 {id:'pulse',label:'EVE 펄스',hint:'전력 -3 · 출격당 1회',icon:Radio,tone:'utility',key:'5'},
 {id:'support',label:'동행 지원',hint:'출격당 1회',icon:Users,tone:'utility',key:'6'},
 {id:'retreat',label:'도망',hint:'실패 시 적 행동 발생',icon:Footprints,tone:'escape',key:'7'}
] as const;
type TurnPreview={action:CombatAction;before:V10;after:V10;feedback:ReturnType<typeof combatTurnFeedback>};
function CombatGauge({label,value,max=100,kind}:{label:string;value:number;max?:number;kind:'enemy'|'operator'|'mind'|'stamina'|'infection'|'power'}){
 const pct=Math.max(0,Math.min(100,value/Math.max(1,max)*100)),danger=kind==='infection'?pct>=75:pct<=30;
 return <div className="ark-battle-gauge" data-kind={kind} data-critical={danger}><div><small>{label}</small><b>{value}/{max}</b></div><div className="ark-battle-bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0,Math.min(max,value))}><i style={{width:pct+'%'}}/></div></div>
}
function CombatArena({state,onAction}:{state:V10;onAction:CombatHandler}){
 const b=state.field!.combat!,run=state.run!;
 const [turn,setTurn]=useState<TurnPreview|null>(null),[impact,setImpact]=useState(false);
 const locked=useRef(false),timers=useRef<number[]>([]),latest=useRef({state,onAction});
 useEffect(()=>{latest.current={state,onAction}},[state,onAction]);
 useEffect(()=>()=>{timers.current.forEach(t=>window.clearTimeout(t));locked.current=false},[]);
 function act(action:CombatAction){
  if(locked.current||combatBlock(state,action))return;
  const after=resolveCombat(state,action);if(after===state)return;
  locked.current=true;const preview={action,before:state,after,feedback:combatTurnFeedback(state,after)};setTurn(preview);setImpact(false);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  timers.current.push(window.setTimeout(()=>setImpact(true),reduced?0:190));
  timers.current.push(window.setTimeout(()=>{
   // Settle exactly the same outcome once; never replay an old turn over a new save.
   const current=latest.current;
   if(current.state===preview.before)current.onAction(action,{before:preview.before,after:preview.after});
   locked.current=false;setTurn(null);setImpact(false);timers.current=[];
  },reduced?220:980));
 }
 useEffect(()=>{
  const key=(event:KeyboardEvent)=>{if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||locked.current)return;const target=event.target;if(target instanceof HTMLElement&&(target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(target.tagName)))return;const item=actionDeck.find(x=>x.key===event.key);if(item){event.preventDefault();event.stopPropagation();act(item.id)}};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
 });
 const companions=(run.companions??[run.companion]).filter((id):id is CrewId=>!!id&&!!state.crew?.members.some(m=>m.id===id&&m.mind>0&&m.hp>0));
 const enemyName=`${mutantArchetype(b.mutantVariant).name} · MUTANT-${String(b.mutantVariant??1).padStart(2,'0')}`;
 const display=turn&&impact?turn.after:state,fx=turn?.feedback;
 const hp=turn&&impact?fx!.hp:b.hp,integrity=turn&&impact?fx!.integrity:run.integrity;
 const critical=integrity<=30||display.mind<=30;
 const activeAction=turn?.action??'idle';
 return createPortal(<div className="v74-combat-shade ark-combat-shade ark-battle-shade" data-critical={critical} role="presentation"><section className="v74-combat ark-battle" data-critical={critical} role="dialog" aria-modal="true" aria-labelledby="v74-combat-title" aria-describedby="v74-combat-intent">
 <header className="ark-battle-header"><div><span>ARK / FIELD ENGAGEMENT</span><h3 id="v74-combat-title">{enemyName}</h3></div><div className="ark-battle-round"><small>ROUND</small><b>{String(b.round).padStart(2,'0')} / {combatRoundLimit(b)}</b></div></header>
 <div className="ark-battle-duel"><CombatGauge label="관리자 방호" value={integrity} kind="operator"/><span>VS</span><CombatGauge label="오염 핵 내구" value={hp} max={b.maxHp} kind="enemy"/></div>
 <div className="v74-combat-stage ark-battle-stage" data-action={activeAction} data-phase={turn?(impact?'impact':'windup'):'ready'} data-hit={!!(impact&&fx&&fx.damage>0)} data-enemy-hit={!!(impact&&fx&&fx.enemyDamage>0)} data-critical={critical} data-defeated={!!(impact&&fx?.defeated)}>
 <ArtSlot src={gameplayArt.combat(run.region)}/><div className="ark-battle-party" data-companions={companions.length} aria-label="전투 인원"><div className="ark-battle-fighter"><RangerSprite direction="right"/>{impact&&fx&&fx.damage>0&&<strong className="ark-battle-number">-{fx.damage}</strong>}{impact&&fx&&fx.recovery>0&&<strong className="ark-battle-number heal">+{fx.recovery}</strong>}</div>{companions.map(id=>{const member=state.crew!.members.find(m=>m.id===id)!;return <img className="ark-battle-staff-sprite" key={id} src={combatStaffSprite(id)} alt={`${CREW_PROFILES[id].post} 전투 지원`} title={`${CREW_PROFILES[id].post} · HP ${member.hp}/100`}/>})}</div><div className="ark-battle-foe"><img className="v74-enemy" src={mutantSprite(b.mutantVariant)} data-mutant="active" alt={enemyName}/>{impact&&fx&&fx.enemyDamage>0&&<strong className="ark-battle-number">-{fx.enemyDamage}</strong>}</div>
 {impact&&fx&&fx.infection>0&&<span className="ark-battle-infection">감염 +{fx.infection}</span>}
 <i className="ark-battle-hit-overlay" aria-hidden="true"/><span className="ark-battle-stage-label">{turn?(impact?fx?.defeated?'위협 격퇴':fx?.escaped?'도주 성공':fx?.fatal?'생체 신호 위급':'대응 결과 확인':'행동 실행 중'):'행동 대기'}</span></div>
 {critical&&<div className="ark-battle-critical" role="status"><AlertTriangle size={15}/> {integrity<=30?'방호 내구 위험':'관리자 정신력 위험'}{integrity<=30&&display.mind<=30?' · 정신력 위험':''}</div>}
 <div className="ark-battle-secondary"><CombatGauge label="정신력" value={display.mind} kind="mind"/><CombatGauge label="현장 ST" value={display.stamina} kind="stamina"/><CombatGauge label="전력" value={display.power} kind="power"/><CombatGauge label="감염" value={display.infection} kind="infection"/></div>
 <div className="ark-battle-observe" id="v74-combat-intent"><small>{turn?'ACTION RESOLUTION':'OBSERVATION / 관찰'}</small><p>{turn?(impact?turn.after.lastOutcome:'행동 수행 중…'):fieldEnemyClue(b)}{!turn&&b.stagger?' · 균형이 무너졌다.':''}</p></div>
 <div className="ark-battle-deck" aria-label="전투 행동" aria-busy={!!turn}>{actionDeck.map(item=>{const blocked=combatBlock(state,item.id),Icon=item.icon;return <button type="button" key={item.id} data-tone={item.tone} data-selected={activeAction===item.id} disabled={!!turn||!!blocked} onClick={()=>act(item.id)} title={blocked??item.label}><span className="ark-battle-key">{item.key}</span><Icon size={22} aria-hidden="true"/><span className="ark-battle-card-copy"><b>{item.label}</b><small>{blocked??item.hint}</small>{item.id==='retreat'&&<span className="ark-battle-escape"><span>도주 성공률 {escapeChance(state)}%</span><i><em style={{width:escapeChance(state)+'%'}}/></i></span>}</span></button>})}</div>
 {companions.length>0&&<div className="ark-combat-team" aria-label="동행 직원 상태">{companions.map(id=>{const member=state.crew!.members.find(m=>m.id===id)!;const mood=member.mind<35?'critical':member.mind<62?'anxious':'neutral';return <figure className="v74-combat-companion ark-combat-support-card" key={id}><img src={combatStaffSprite(id)} alt=""/><figcaption>{CREW_PROFILES[id].post} · HP {member.hp}/100 · 정신 {member.mind}% · {mood==='critical'?'위기':mood==='anxious'?'불안':'안정'}</figcaption></figure>})}</div>}
 {canWolfLastStand(state)&&<button type="button" className="origin-sacrifice" disabled={!!turn} onClick={()=>onAction('wolf-last-stand')}>경비관의 마지막 엄호 요청 · 영구 이탈</button>}
 <details className="ark-battle-history"><summary>전투 기록 · 최근 {b.log.length}건</summary>{b.log.map((line,i)=><p key={i}>{line}</p>)}</details>
 </section></div>,document.body);
}

export function BaseUpgrades({state,onUpgrade}:{state:V10;onUpgrade:(id:UpgradeId)=>void}){return <section className="v90-upgrade-workbench" aria-label="기지 단계 강화"><h3>회수한 자재로 기지 강화</h3><p>현장 고철 → 시설 강화 → 다음 탐사와 야간 생존 지원. 추적망·제압봉·방호복·필터 밀폐는 5단계, 축전기·병동·포획망·스캐너는 3단계, 탐사 운영 확장은 1단계까지 강화합니다. AP 소모 없음.</p><div className="v74-upgrades">{(Object.keys(baseUpgrades) as UpgradeId[]).map(id=>{const r=baseUpgrades[id],c=upgradeCost(state,id),block=upgradeBlock(state,id);return <article key={id}><h4>{r.name} · {upgradeLevel(state,id)}/{upgradeMaxLevel(id)}</h4><p>{r.effect}</p><p>고철 {c.scrap} · 부품 {c.parts} · 전력 {c.power}</p><button disabled={!!block} onClick={()=>onUpgrade(id)}>{block??'다음 단계 강화'}</button></article>})}</div></section>}
/** The choice shows its reaction before proceeding; keyboard and reduced-motion users can continue explicitly. */
export function ReactionStage({src,label,responding}:{src:string;label:string;responding:boolean}){return <div className={'v74-reaction-stage'+(responding?' is-responding':'')} aria-label="개체 반응 관찰"><img src={src} alt="관찰 중인 개체"/><i aria-hidden="true"/><span role="status">{label}</span></div>}

