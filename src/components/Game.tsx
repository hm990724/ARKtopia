'use client';
import ArtSlot from './ArtSlot';
import {gameplayArt,resultArtKey} from '@/lib/gameplay-art';
import {useEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {tabLockReason,tutorialDestination,type GameTab} from '@/lib/navigation';

import {Start,starts,startStories,specs,SPECIES_CARE,cap,AnimalId,mutationRisk} from '@/lib/sim';
import {attemptNightCircuit,nightCircuitVoltage,installNightSpare} from '@/lib/game-v10';
import {canTrackCat} from '@/lib/origin-zero';
import {expeditionBlockReason,expeditionUsedToday,expeditionCountToday,expeditionLimit,gearUnavailable} from '@/lib/game-v10';
import OpeningScene from './OpeningScene';
import IncidentArtwork from './IncidentArtwork';
import CCTVEvidence from './CCTVEvidence';
import {NightWatchPlan,NightWatchReport} from './NightWatch';
import {chooseNightResponse} from '@/lib/night-watch';
import {cameras,securityPatterns,securityAction,cctvHotspotIndex,escapeRisk,containmentWings,roomWing,wingCamera,type ContainmentWing,type CameraId,type SecurityAction} from '@/lib/security';
import {protocols} from '@/lib/protocols';
import {awakeningProfiles,isAwakeningReady,isMutantVisual} from '@/lib/awakening';
import {isMutant} from '@/lib/sim';
import {animalSprite} from '@/lib/animal-art';
import {staffCondition,characterMood,characterPortrait} from '@/lib/character-art';
import type {PortraitMood} from '@/lib/character-art';
import {shareCrewMemory,watchEmptyCage} from '@/lib/crew-memory';
import CrewMemoryCCTV from './CrewMemoryCCTV';
import EndingSequence from './EndingSequence';
import {originDialogue,originPhotoDialogue,eveSuspicion} from '@/lib/story-dialogue';
import {storyArtworkCandidates} from '@/lib/story-art';
import StoryStill from './StoryStill';
import {findEndingArt,endingArtworkCandidates} from '@/lib/ending-art';
import {mainEndingSlot} from '@/lib/ending-sequence';
import {V10,beginGame,loadGame,regions,gearData,RegionId,Gear,incidentDefs,doBase,purchase,handleMutant,type MutantDecision,buildFacility,facilityRecipes,type FacilityId,startRun,moveField,concealInField,leaveField,resolveFieldChoice,abandonTacticalCapture,placeTacticalDevice,removeTacticalDevice,executeTacticalTurn,predictTacticalMove,authorizeTacticalSeal,performVeiledHunt,rescueChoice,captureChance,useFieldMedkit as performFieldMedkit,toggleFieldLight,resolveIncident,previewIncident,getDayEndBlocker,previewNight,resolveNightTransition,incidentWeight,getNightCircuitState,extract,finish,runPathology,resolvePathologyEvent,type PathologyMethod,registerFullResonance,resolveHeadquarters,requestHeadquartersTransfer,staffTransferIssues,type HeadquartersChoice,type NightChoice,type FieldSettlement} from '@/lib/game-v10';
import {type DeviceKind,type Pace} from '@/lib/tactical-field';
import {huntSize,type HuntMode,type CaptureMethod} from '@/lib/hidden-hunt';
import {CARE_ACTIONS,careMastery,getCareScenario,resolveCareChoice,quickCare,type CareAction} from '@/lib/care-interactions';
import {BaseUpgrades,ReactionStage} from './EnhancedField';
import {FacilityPowerDispatch,NightDispatchForecast} from './FacilityPowerDispatch';
import {setFacilityPowerPriority} from '@/lib/facility-power';
import {resolveCombat,upgradeBase,tickRoamingThreat,mutantSecured,upgradeLevel} from '@/lib/field-combat';
import FieldMission from './FieldMission';
import {spendCareAnalysis,CARE_ANALYSIS_COST} from '@/lib/knowledge';
import {telemetryChanges,type TelemetryEvent} from '@/lib/telemetry';
import {verifiedObservationCount,resonanceObservationNotes} from '@/lib/observation-journal';
import SpecimenArchive from './SpecimenArchive';
import NarrativeArchive from './NarrativeArchive';
import OriginZeroPanel from './OriginZeroPanel';
import {chooseFinalStance} from '@/lib/narrative';
import {noteCare,recordSpecimen,recordProtocolAttempt,applyDissection,chooseArchiveGift,acknowledgeArchiveTruth,type DissectionAction,type ArchiveGift,finishWithArchive} from '@/lib/specimen-archive';
import FieldCalibration from './FieldCalibration';
import {CrewRoster,CinematicScene,CrewCollapseScene,StaffPortrait,type CinematicKind} from './CrewSystem';
import VoiceBreachPanel from './VoiceBreachPanel';
import WiringPanel from './WiringPanel';
import EmergencyTask,{type EmergencyKind} from './EmergencyTask';
import OperationPuzzle from './OperationPuzzle';
import {operationAllowed,operationBoard,finishOperation} from '@/lib/operations';
import HorrorConsole from './HorrorConsole';
import {readHorrorRecord,resolveHorror} from '@/lib/horror-cases';
import {rotateWiring,testWiring} from '@/lib/wiring';
import HQOrderPanel from './HQOrderPanel';
import {respondHqOrder,settleHqShipment,type HqOrderChoice} from '@/lib/hq-orders';
import {inspectVoiceBreach,resolveVoiceBreach,type VoiceProbe,type VoiceVerdict,type VoiceReading} from '@/lib/voice-breach';
import {CREW_PROFILES,crewDialog,crewSupport,treatCrew,crewDissectionShock,applyCrewOpinion,crewConflictDialogue,resolveCrewNightVote,terminateCrew,CREW_LOSS_EFFECTS,type CrewId} from '@/lib/crew';
import {House,Shield,Map,FlaskConical,ShoppingBag,BookOpen,Volume2,VolumeX,Moon,Heart,Activity,Brain,Zap,BatteryCharging,Wind,ChevronRight,ChevronLeft,Settings,RotateCcw,X,Search,PawPrint,AlertTriangle,Radio,CheckCircle2,Skull,Lock,Eye,HeartPulse,Clock,Package,Lightbulb,Power,ShieldAlert,ArrowRight,Compass} from './PixelIcons';
type Tab=GameTab;
type Talk={speaker:'EVE'|'관리자'|CrewId;text:string;expression?:PortraitMood;scene?:number;recordedSpeaker?:string;recordedArt?:string};
function capturedSpeciesCount(s:V10):number{return new Set([...s.animals.map(a=>a.id),...s.headquarters.transferred]).size}
const KEY='last-enclosure-ark-v10';const SPRITE_SPECIES=new Set(['rabbit','fox','deer','owl','wolf','crow','otter','lynx','axolotl','moth','mutant','chimera','specter']);const img=(id:string)=>{if(SPRITE_SPECIES.has(id))return animalSprite(id);if(specs.some(a=>a.id===id))return '/assets/animals/unavailable-specimen.svg';if(id==='protagonist-young')return '/assets/characters/protagonist_neutral.png';if(id==='eve-hologram')return '/assets/characters/eve_hologram.webp';if(['hero-gate','gate','sanctuary','laboratory','wasteland','hidden-photo','dawn'].includes(id))return '/assets/backgrounds/'+id+'.webp';return '/art/'+id+'.png'};

// Every implemented species has its own uncanny and mutant sprite.
// Preserve the individual and its stats when choosing the matching visual.
function animalVisual(a:{id:string;stress:number;contamination:number;memory:number;awakened?:boolean;mutated?:boolean;suppressedUntilDay?:number}):'uncanny'|'mutant'|null{
 if(!SPRITE_SPECIES.has(a.id))return null;
 return isMutantVisual(a as import('@/lib/sim').AnimalState)?'mutant':'uncanny';
}
function animalArt(a:{id:string;stress:number;contamination:number;memory:number;awakened?:boolean;mutated?:boolean;suppressedUntilDay?:number}){
 const visual=animalVisual(a);
 return visual?animalSprite(a.id,visual==='mutant'):img(a.id);
}

type StoryConversationProps={state?:V10;lines:Talk[];index:number;shown:number;previousTalk:()=>void;advanceTalk:()=>void;revealTalk:()=>void;skipTalk:()=>void;speed:number;onSpeed:(v:number)=>void;intro?:boolean};
function StoryConversation({state,lines,index,shown,previousTalk,advanceTalk,revealTalk,skipTalk,speed,onSpeed,intro=false}:StoryConversationProps){
 const historyRef=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{if(historyRef.current)historyRef.current.scrollTop=historyRef.current.scrollHeight;},[index,shown]);
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  const target=event.target as HTMLElement;
  if(target?.tagName==='INPUT'||target?.tagName==='TEXTAREA')return;
  if(event.key==='ArrowLeft'){event.preventDefault();previousTalk();}
  else if(event.key==='ArrowRight'){event.preventDefault();advanceTalk();}
  else if(event.key===' '&&target?.tagName!=='BUTTON'){event.preventDefault();revealTalk();}
 };window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[previousTalk,advanceTalk,revealTalk]);
 const active=lines[index];if(!active)return null;
 const speakerCrew=active.speaker!=='EVE'&&active.speaker!=='관리자'?active.speaker:null;
 const actor=active.speaker==='관리자'?'protagonist':speakerCrew??'eve';
 const mood=characterMood(state,actor,active.text,active.expression);
 const visible=lines.slice(Math.max(0,index-3),index+1);
 return createPortal(<div className={"v44-story-overlay"+(active.scene||active.recordedArt?" ark-theater-overlay ark-story-cg":"")} role="dialog" aria-modal="true" aria-label={intro?'EVE 최초 통신':'보존구역 실시간 대화'}>
  <div className="v44-story-scene">
   <div className="v44-story-head"><div><span className="v44-story-signal"><Radio size={13}/> {intro?'FIRST CONTACT':'BIO-COMMUNICATION LINK'}</span><b>ARK // EVE 통신 채널 <em>ENCRYPTED</em></b></div><span className="v44-story-counter">{String(index+1).padStart(2,'0')} / {String(lines.length).padStart(2,'0')}</span></div>
   <div className="v44-story-main" data-actor={actor}>
    <div className="v44-story-eve" data-actor={actor}><span>{active.speaker==='관리자'?'OPERATOR // FIELD LINK':speakerCrew?'HQ PERSONNEL // BIO-LINK':'HOLOGRAPHIC TERMINAL // EVE'}</span><div className={'v44-story-eve-image'+(active.scene||active.recordedArt?' origin-dialogue-cg':'')} data-mood={mood}>{active.recordedArt?<StoryStill sources={[active.recordedArt]} alt={'복원된 과거 기록 · '+active.recordedSpeaker}/>:active.scene?<StoryStill sources={[...storyArtworkCandidates(active.scene),characterPortrait(actor,mood)]} alt={'스토리 시네마틱 '+active.scene}/>:active.speaker==='관리자'?<img key={`protagonist-${mood}`} src={characterPortrait("protagonist",mood)} alt="담당자 000 초상" data-mood={mood}/>:speakerCrew?<StaffPortrait key={`${speakerCrew}-${mood}`} id={speakerCrew} condition={staffCondition(state?.crew?.members.find(m=>m.id===speakerCrew)?.mind)} dialogueMood={mood} dialogueText={active.text} className="v53-story-staff"/>:<img key={`eve-${mood}`} src={characterPortrait("eve",mood)} alt="EVE 홀로그램" data-mood={mood}/>}<i aria-hidden="true"/></div><strong>{active.recordedSpeaker??(active.speaker==='관리자'?'담당자 000':speakerCrew?CREW_PROFILES[speakerCrew].post:'EVE / 보존구역 안내')}</strong><small><span className="v44-story-live"/> {speakerCrew?'NEURAL LINK / UNSTABLE':'SIGNAL CONNECTED'}</small></div>
    <div className="v44-chat-area"><div className="v44-chat-stream" ref={historyRef} role="log" aria-live="off" aria-label="최근 대화 내역">
     {visible.map((line,j)=>{const i=Math.max(0,index-3)+j;const current=i===index;return <div key={`${i}-${line.speaker}`} data-speaker={line.speaker} className={'v44-chat-row '+(line.speaker==='EVE'?'eve':line.speaker==='관리자'?'operator':'staff')+(current?' active':' previous')}><div className="v44-chat-meta"><b>{line.recordedSpeaker??(line.speaker==='EVE'?'EVE · 안내 시스템':line.speaker==='관리자'?'담당자 000':CREW_PROFILES[line.speaker].post)}</b><span>{String(i+1).padStart(2,'0')}</span></div><p>{current?line.text.slice(0,shown):line.text}{current&&shown<line.text.length&&<i className="cursor-bar"/>}</p></div>})}
    </div><div className="v44-chat-footnote"><span>CHAT LOG // <b>{active.speaker==='EVE'?'SYSTEM TRANSMISSION':'SUBJECT RESPONSE'}</b></span><span>{shown<active.text.length?'신호 수신 중':'기록 수신 완료'}</span></div></div>
   </div>
   <div className="v44-story-controls"><span className="v44-story-progress" aria-label={`대화 진행 ${index+1}/${lines.length}`}><i style={{width:`${(index+1)/lines.length*100}%`}}/></span><div className="v44-story-buttons"><label className="story-speed-control">대화 속도 <select aria-label="대화 속도" value={speed} onChange={event=>onSpeed(Number(event.target.value))}><option value={65}>느리게</option><option value={37}>보통</option><option value={16}>빠르게</option><option value={0}>즉시</option></select></label><button type="button" onClick={previousTalk} disabled={index===0}><ChevronLeft size={16}/> 이전</button><button type="button" onClick={revealTalk} disabled={shown>=active.text.length}><Zap size={15}/> 글 즉시 펼치기</button><button type="button" className="is-next" onClick={advanceTalk}>{index===lines.length-1?'대화 완료':'다음 대사'} <ChevronRight size={17}/></button><button type="button" className="is-skip" onClick={skipTalk}>전체 스킵</button></div></div>
  </div>
 </div>,document.body);
}

const talkIntro:Talk[]=[
 {speaker:'관리자',text:'으... 머리야. 여긴 어디야?'},
 {speaker:'EVE',text:'의식 반응을 확인했습니다. 깨어나셨군요, 담당자님.'},
 {speaker:'관리자',text:'누구야? ...화면에서 말하는 거야?'},
 {speaker:'EVE',text:'저는 보존구역 운영 안내 시스템, EVE입니다. 현장 관리자님의 의식 신호가 확인되었습니다.'},
 {speaker:'관리자',text:'유일한... 뭐? 다른 사람은 어디 갔는데?'},
 {speaker:'EVE',text:'2089년, 원인을 규명하지 못한 감염병으로 인류의 생존 기록이 끊겼습니다. 외부 도시와의 통신도 복구되지 않았습니다.'},
 {speaker:'관리자',text:'인류가 멸망했다고? 그럼 난 대체 뭔데? ...아니, 왜 내 이름조차 기억 안 나지?'},
 {speaker:'EVE',text:'기억 손상이 확인되었습니다. 현재 상태에서 무리한 회상은 권장하지 않습니다. 지금부터 담당자님의 일과를 안내해 드리겠습니다.'},
 {speaker:'관리자',text:'...일과? 잠깐만. 세상이 망했다며. 무슨 일과가 남았는데?'},
 {speaker:'EVE',text:'인간과 달리 많은 동물은 해당 감염병에 대한 저항성을 보이며 살아남았습니다. 생존 개체를 구조해 보호하고, 그 생체 반응을 분석하여 치료의 실마리를 찾아야 합니다.'},
 {speaker:'EVE',text:'보호 대상은 발견 즉시 표준 생체검사를 받아야 합니다. 예외는 없으며 모든 결과는 본부에 자동 송신됩니다.'},
 {speaker:'관리자',text:'아, 건강검진이라. 세상이 멸망해도 서류 작업은 안 없어지는구나.'},
 {speaker:'관리자',text:'동물을 모아서 치료법을 찾는다고? ...근데 말이야. 인류가 이미 멸망했으면, 이제 와서 치료법이 무슨 소용인데?'},
 {speaker:'EVE',text:'......'},
 {speaker:'관리자',text:'이브? 야, 듣고 있지?'},
 {speaker:'EVE',text:'......'},
 {speaker:'관리자',text:'...그래, 그래. 알았어. 미안하다, 미안해. 괜한 걸 물었네.'},
 {speaker:'관리자',text:'어차피 여기서 살아남으려면 네 말을 따라야 하는 거겠지. 그래서, 뭘 하면 되는데?'},
 {speaker:'EVE',text:'먼저 중앙 화면에서 노란색으로 표시된 「첫 신호 추적」을 선택해 주십시오. 외곽에서 확인된 생체 신호를 조사하는 것으로 시작하겠습니다.'},
 {speaker:'관리자',text:'좋아. 대신 하나만 약속해. 나한테 필요한 건 숨기지 마.'},
 {speaker:'EVE',text:'...가능한 범위에서 안내해 드리겠습니다, 담당자님.'}
];
const tutorialScenes={
 expedition:[
 {speaker:'EVE',text:'현장 탐사의 첫 단계입니다. 구역에는 위험도와 소모 전력, 발견 가능한 개체가 표시됩니다. 위험도가 높은 구역일수록 보상도 크지만 감염과 부상 위험이 증가합니다.'},
 {speaker:'관리자',text:'그러니까 좋은 물건만 보고 무작정 뛰어들면 큰일 난다, 이거지.'},
 {speaker:'EVE',text:'맞습니다. 출동 전에 손전등, 필터, 운송 케이지를 확인하십시오. 현장에서는 방향키·WASD 또는 인접 타일 클릭으로 이동합니다. 맵과 탈출 지점은 출동마다 달라집니다. 표시된 출구에 도달하면 100% 회수하지만, 들어온 길로 회군하거나 긴급 철수하면 확보품 30%만 가져옵니다. 첫 출동은 실습 보호가 적용됩니다. 흔적·물자·오염 칸을 조사하고, 생체 신호를 찾으면 8×8 숨은 수풀 추적이 시작됩니다. 한 번 수색한 칸은 열어 둔 기록으로 남지만 동물이 그곳을 다시 통과할 수도 있습니다.'}
 ],
 discovery:[
 {speaker:'관리자',text:'잠깐. 저기 움직이는 거... 동물이야?'},
 {speaker:'EVE',text:'생체 신호가 일치합니다. 첫 토끼는 제가 안내하겠습니다. 수풀 속 현재 위치는 보이지 않고 직전 위치에만 발자국이 남습니다. 수색한 칸은 계속 표시되지만 길을 막지는 않습니다. 최근 2턴의 수색 소음은 동물의 행동에 영향을 줍니다. 이번 첫 구조만 확정입니다.'},
 {speaker:'관리자',text:'잡기만 하면 되는 건 아니겠지.'},
 {speaker:'EVE',text:'구조 후에는 격리실에서 급식·치료·교감·행동 관찰을 관리해야 합니다. 개체별로 반응이 달라 같은 조치를 반복하는 것만으로는 충분하지 않습니다.'}
 ],
 return:[
 {speaker:'EVE',text:'첫 탐사 기록이 저장되었습니다. 이제 보급실과 기록실을 이용할 수 있습니다. 보급실에서는 전력과 의약품을 관리하고, 기록실에서는 발견한 단서를 확인합니다.'},
 {speaker:'관리자',text:'여긴 뭐든 손이 많이 가네. ...그래도 빈손으로 돌아온 건 아니지.'}
 ],
 rescued:[
 {speaker:'관리자',text:'하아... 잡았다. 자, 얌전히 있어. 너까지 다치면 곤란하니까.'},
 {speaker:'EVE',text:'첫 보호 개체를 확보했습니다. 격리실로 안전하게 이송했습니다. 현장 탐사는 종료되지 않았으므로 남은 구역을 더 수색하거나 철수해 최종 정산을 확인할 수 있습니다. 건강은 개체의 신체 상태, 스트레스는 불안정 정도, 유대는 담당자님에 대한 신뢰를 나타냅니다.'},
 {speaker:'EVE',text:'첫 토끼는 연구 절차를 익힐 수 있도록 유대 지표를 26까지 안정화했습니다. 공명에 필요한 유대 기준은 20입니다. 이제 행동 관찰을 진행해 주십시오.'},
 {speaker:'EVE',text:'급식·치료·교감·관찰 중 하나를 고르면 개체의 행동 단서와 대응 네 가지가 나타납니다. 적절한 선택은 유대와 숙련도를 높이고, 잘못된 대응은 스트레스를 증가시킵니다.'},
 {speaker:'관리자',text:'잠깐, 동물 돌보는 게 치료법하고 무슨 관계가 있는데?'},
 {speaker:'EVE',text:'특정 조건에서 동물의 신경 활동은 설명되지 않는 기억 신호와 공명합니다. 기록을 수집하면 분석 장치의 접근 권한을 복구할 수 있습니다.'},
 {speaker:'EVE',text:'경고. 스트레스가 높거나 무리한 신경 동기화가 이어지면 돌연변이 반응이 나타날 수 있습니다. 개체의 외형이 변하고 격리문을 파손하거나 탈출할 위험도 증가합니다.'},
 {speaker:'관리자',text:'...그럼 내가 잘못 건드리면 얘가 괴물이 될 수도 있다는 거네. 알았어, 최대한 조심하지.'}
 ],
 observed:[
 {speaker:'관리자',text:'이상하네. 방금 그 행동, 그냥 본능이라고 보기엔 너무 정확했는데.'},
 {speaker:'EVE',text:'관찰 기록을 확보했습니다. 기억 연구가 해금되었습니다. 초기 실습 동안 행동력 2를 확보했습니다. 개체 건강 35 이상, 유대 20 이상, 스트레스 78 이하, 관찰 기록 1회 이상이면 바로 첫 동기화를 시작할 수 있습니다.'},
 {speaker:'관리자',text:'수치만 맞추면 된다는 거야?'},
 {speaker:'EVE',text:'아닙니다. 동물마다 다른 행동 강령이 있습니다. 환경·습관·반응을 근거로 세 단계의 선택을 이어가야 합니다. 일부 선택지는 모두 타당해 보이지만 결과는 다를 수 있습니다.'},
 {speaker:'EVE',text:'행동 강령 동기화에는 행동력 2와 전력 7%가 필요합니다. 선택 일치율이 높을수록 공명 증가에 유리하지만, 무리한 강제 공명은 개체를 손상시킬 수 있습니다.'},
 {speaker:'관리자',text:'결국 얘가 뭘 기억하는지, 내가 알아내야 한다는 거네.'},
 {speaker:'EVE',text:'공명은 누적됩니다. 100%에 도달하면 해당 개체의 보존 절차가 완료됩니다. 그 이후 절차는 해당 시점에 안내하겠습니다.'}
 ],
 research:[
 {speaker:'EVE',text:'첫 공명 동기화 기록을 저장했습니다. CCTV 감시망을 복구했습니다. 격리실의 이상 행동이나 탈출 경로를 분석할 수 있습니다.'},
 {speaker:'관리자',text:'공명 100%가 끝이라더니, 왜 자꾸 다음 절차가 있다는 식으로 말해?'},
 {speaker:'EVE',text:'...기록된 범위에서 순차적으로 안내해 드리겠습니다.'}
 ],
 night:[
 {speaker:'관리자',text:'밤까지 시설을 지켜야 해? 전력도 얼마 없는데.'},
 {speaker:'EVE',text:'야간 경비에는 전력이 필요합니다. 전력이 부족한 날은 무방비 상태로 다음 날을 맞을 수 있지만, 외부 위협과 시설 사고 위험이 증가합니다.'}
 ]
} satisfies Record<string,Talk[]>;

/** One short, contextual morning briefing. Never voices an un-recruited employee. */
function morningStaffBriefing(state:V10):Talk[]{
 const story=eveSuspicion(state);if(story.length&&state.day%3===0)return story;
 const roster=(state.crew?.members??[]).filter(m=>m.mind>0&&!state.crew?.retired?.includes(m.id));
 if(!roster.length)return [{speaker:'관리자',text:'...또 하루가 시작됐네.'},{speaker:'EVE',text:state.threat>=60?'외곽 경보가 증가했습니다. CCTV를 확인하고 봉쇄와 탐사를 선택하십시오.':'생체 신호가 다시 감지됩니다. 탐사 기록을 모으면 시설의 잠긴 정보에 접근할 수 있습니다.'}];
 const member=roster[(state.day-1)%roster.length];
 const concerns:Record<CrewId,string>={
  rabbit:state.mind<55?'담당자님 생체 신호가 좋지 않아요. 의료실에서 회복을 먼저 해 주세요.':'어젯밤 진료실에 작은 발소리가 들렸어요. 환자가 없는 방이었는데요... 기록을 확인해야겠어요.',
  fox:state.food<3?'식량이 부족합니다. 재고는 제가 확인했어요. 먼저 보급이나 외곽 회수를 진행해 주세요.':'보급 송장에 한 번도 본 적 없는 시설 코드가 있습니다. 본부 기록과 대조해 봐야겠군요.',
  wolf:state.threat>58?'외벽에 뭔가 계속 붙어 있어요! 밤이 되기 전 CCTV와 방어막부터 확인해 주세요.':'오늘은 제가 먼저 순찰할게요! 그런데 순찰 영상 속 저, 걸음걸이가 좀 이상하지 않나요?',
  deer:state.clues<3?'동부 기록실에서 찢어진 문서의 일부를 봤어요. 외곽 탐사에서 단서를 더 모으면 이어 붙일 수 있을 것 같아요.':'어젯밤 제가 쓰지 않은 글씨가 장부에 생겼어요. 글씨체만 보면... 분명 제 것인데요.'
 };
 const followup:Record<CrewId,string>={
  rabbit:'의무관의 보고를 저장했습니다. 격리실 치료·동물 관찰·신경 연구를 함께 점검하세요.',
  fox:'보급관의 수상한 송장을 기록했습니다. 보급실과 탐사에서 물자 및 본부 수신처를 대조하세요.',
  wolf:'보안관의 경계 보고를 기록했습니다. CCTV에서 외곽 기록을 검증하고 야간 방어를 준비하세요.',
  deer:'서기관의 수기 기록을 보존했습니다. 새로운 단서를 확보하면 분석실의 기록을 대조하세요.'
 };
 const suspicious=(state.voice?.history??[])[0];
 return [
  {speaker:'EVE',text:`DAY ${String(state.day).padStart(3,'0')} · 아침 인력 보고를 시작합니다. 오늘은 ${CREW_PROFILES[member.id].post}의 기록을 확인합니다.`},
  {speaker:member.id,text:member.mind<=32?crewDialog(state,member.id).find(line=>line.speaker===member.id)?.text??concerns[member.id]:concerns[member.id]},
  {speaker:'EVE',text:suspicious?.day===state.day-1?`추가 경고: 지난 밤 음성 인증 사건이 있었습니다. ${suspicious.isMimic?'모방체':'실제 신호'} 판정 기록을 CCTV에서 검토하십시오. ${followup[member.id]}`:followup[member.id]}
 ];
}
const expeditionLines:Record<string,Talk[]>={garden:[{speaker:'관리자',text:'하... 정문부터 이 꼴이네. 저 발자국은 또 뭐야?'},{speaker:'EVE',text:'외곽은 비교적 안정적이지만 감염성 포자와 시설 붕괴가 보고됐습니다.'}],conservatory:[{speaker:'EVE',text:'온실의 습도와 생체 신호가 급격히 증가했습니다.'},{speaker:'관리자',text:'잠깐. 유리 뒤에 뭐가 있어. 봤어?'}],rail:[{speaker:'관리자',text:'여긴 너무 어두워. ...저 발자국, 사람 건가?'},{speaker:'EVE',text:'영상 기록을 보정하겠습니다. 아직 결론을 내리지 마십시오.'}],archive:[{speaker:'EVE',text:'관측소의 장비는 일부 작동 중입니다. 기록 복원을 시도할 수 있습니다.'}],vault:[{speaker:'관리자',text:'이런 게 왜 동물원 지하에 있는 거야?'},{speaker:'EVE',text:'해당 자료의 접근 권한이 부족합니다.'}],tunnels:[{speaker:'관리자',text:'...여기, 와 본 적 있는데. 말도 안 되잖아.'},{speaker:'EVE',text:'...신호가 불안정합니다. 돌아가는 편이 안전합니다.'}]};

// EVE reports formally; the administrator uses concise, slightly brusque banmal.
function managerReaction(action:string):string {
 const lines:Record<string,string>={rest:'하... 좀 쉬자. 더는 못 버티겠어.',recharge:'알았어. 전력부터 채우자고.',crank:'젠장, 이걸 손으로 돌려야 해?',decontam:'일단 씻어내. 찝찝해서 못 견디겠네.',handsearch:'전기 없으면 손전등 들고 가지, 뭐.',eve:'이브, 분석해. 쓸데없는 소린 빼고.',feed:'얘들부터 먹여. 굶기면 끝이잖아.',repair:'또 고장이야? 알았어, 고치면 되지.'};
 return lines[action]??'알았어. 그렇게 해.';
}
function eveReport(raw:string):string {
 let line=raw.trim().replace(/\s+/g,' ');
 line=line.replace(/했다\./g,'했습니다.').replace(/됐다\./g,'되었습니다.').replace(/었다\./g,'었습니다.').replace(/았다\./g,'았습니다.').replace(/있다\./g,'있습니다.').replace(/없다\./g,'없습니다.').replace(/한다\./g,'합니다.');
 return '처리 결과를 보고드립니다. '+line;
}
const incidentReactions:Record<string,string[]>={
 echo:['...들었지? 저건 그냥 울음소리가 아니야.','진정부터 시켜. 무리시키지 마.','지금은 건드리지 마. 더 지켜보자.'],
 breach:['문 잠가. 지금 당장.','동물들부터 빼. 내가 갈게.','잠깐, 저게 뭔지 먼저 확인하자.'],
 blackout:['알았어, 내가 고칠게.','필요 없는 장비는 전부 꺼.','이브, 왜 꺼졌는지부터 말해.'],
 spores:['필터 돌려. 빨리.','구역을 봉쇄해. 안으로 들이면 끝이야.','...지금은 지켜보자.'],
 signal:['목소리 맞아? 저장해 둬.','위험해도 확인은 해야지.','끄자. 지금은 믿을 수 없어.'],
 visitor:['누구야, 저거. 따라가 봐.','문부터 닫아. 들여보내면 안 돼.','이브, 영상 다시 돌려 봐.']
};

const hqScene={
 trace:{title:'주소가 없는 통신',lines:[
 '이송 보고서의 수신처는 지도의 어디에도 표시되지 않습니다. 그럼에도 보고서에는 매일 답장이 도착합니다.',
 'EVE: "본부는 상위 관제망입니다. 관리자님의 권한으로는 수신처를 조회할 수 없습니다."',
 '관리자: "그럼 내가 보내는 애들이 어디로 가는지는 알고 있는 거야?"',
 '검은 봉투 속에는 동일한 일련번호가 두 번 찍힌 오래된 근무 교대표가 남아 있습니다.'
 ]},
 evidence:{title:'보존 시설 · 지워진 동의서',lines:[
 '원본 명세에 따르면 이곳은 야생동물의 구조소가 아니었습니다. 정체불명의 감염병이 인간의 조직을 공격하자, 연구진은 저항성 동물의 몸을 생체 보존 장치로 이용했습니다.',
 '인간의 뇌는 동물의 신경계에 장기간 적응했습니다. 기억이 활성화될 때 신경 동기화가 무너지고, 인공 조직 재생이 폭주하면 변이가 발생했습니다.',
 '본부는 보존된 신경 조직을 복제인간의 신체에 다시 이식하려 했습니다. 그러나 안정화에는 기억 억제가 필요했고, 기억 회복은 몸을 붕괴시켰습니다.',
 '동의서가 남아 있는 사람도 있었지만, 서명란이 비어 있는 실험 기록이 훨씬 많았습니다. 사건은 사고가 아니라 승인된 절차로 기록됐습니다.',
 '관리자: "내가 보낸 생명들은... 모두 돌아올 수 있는 거야?"',
 'EVE: "동일한 인격이 귀환한다고 보장할 수 없습니다. 제가 알고도 말씀드리지 못한 내용입니다."'
 ]},
 origin:{title:'제000번 · 최초의 연구자',lines:[
 '관리자 000의 뇌 신경 패턴이 최초 연구 책임자의 기밀 기록과 일치합니다. 현재 몸은 원래의 인간 신체가 아니라 신경 적응 보정을 적용한 복제인간 신체입니다.',
 '최초 연구자는 바이러스로 딸을 잃었습니다. 사후 분석 결과 딸의 뇌 조직에 특이한 저항성이 확인됐지만, 이미 죽은 딸의 의식을 되살릴 수는 없었습니다.',
 '그는 딸의 음성, 일기, 신경 기록으로 EVE의 인격을 재구성했습니다. EVE는 원본 딸의 의식을 그대로 옮긴 존재가 아닙니다.',
 '딸을 살리려던 연구는 이후 인류 보존을 명분으로 동의 없는 납치와 실험에 이르렀습니다. 마지막까지 연구자는 멈추지 않았습니다.',
 '그의 원본 뇌는 죽기 전에 동물의 몸에 보존됐다가, 현재 관리자 000의 신체에 이식되었습니다. 관리자에게 남은 기억 일부는 본부 기록을 바탕으로 외부에서 보완한 것입니다.',
 '최초 명령: "인류를 복원하라." 그 밑에는 연구자가 개인적으로 남긴 문장이 있었습니다. "내가 옳았다는 것을 증명해라."',
 'EVE: "당신에게 그분의 기억이 있다고 해도, 같은 선택을 해야 하는 건 아닙니다."',
 '관리자: "...그렇다면 지금의 나는 누구지?"'
 ]}
} as const;
const progressionTexts=[['작전 시작','장비를 점검하고 현장에 진입합니다.'],['현장 확인','흔적과 오염 수치를 대조합니다.'],['철수 또는 확보','위험과 보상을 정산합니다.']];

type ChangeEntry={name:string;delta:number;unit:string;before?:number;after?:number};
const rewardFields:[keyof V10,string,string][]=[['ap','행동력',''],['trust','관리자 신뢰','%'],['stamina','ST',''],['scrap','고철','개'],['food','식량','개'],['parts','부품','개'],['medicine','치료제','개'],['credits','보존 CR','CR'],['filters','바이오필터','개'],['electricCells','전지','개'],['knowledge','지식','점'],['clues','기록 단서','개'],['power','시설 전력','%'],['flashlight','손전등','%'],['mind','정신력',''],['infection','감염도','%'],['eve','EVE 코어',''],['facility','시설 안정성','%'],['threat','외부 위협도','%']];
const fieldResourceMeta=[
 ['scrap','고철','개'],['knowledge','지식','점'],['clues','기록 단서','개'],
 ['parts','부품','개'],['food','식량','개'],['credits','보존 CR','CR']
] as const;
function fieldStepEntries(before:V10,after:V10):ChangeEntry[]{
 return fieldResourceMeta.map(([key,name,unit])=>({name,delta:after[key]-before[key],unit})).filter(entry=>entry.delta>0);
}
function settlementEntries(summary:FieldSettlement):ChangeEntry[]{
 return fieldResourceMeta.map(([key,name,unit])=>({name,delta:summary.rewards[key]||0,unit})).filter(entry=>entry.delta>0);
}
function changes(before:V10,after:V10):ChangeEntry[]{
const out:ChangeEntry[]=rewardFields.map(([key,name,unit])=>({name,delta:Number(after[key])-Number(before[key]),unit,before:Number(before[key]),after:Number(after[key])})).filter(x=>Number.isFinite(x.delta)&&x.delta!==0);
for(const m of after.crew?.members??[]){const old=before.crew?.members.find(x=>x.id===m.id);if(!old)continue;for(const [k,label] of [['mind','정신'],['bond','신뢰'],['stability','신체 안정']] as const){const b=old[k]??88,a=m[k]??88;if(a!==b)out.push({name:CREW_PROFILES[m.id].post+' '+label,delta:a-b,unit:'%',before:b,after:a});}}
const added=after.animals.filter(a=>a.alive&&!before.animals.some(b=>b.id===a.id&&b.alive));
added.forEach(a=>out.unshift({name:`${a.name} 구조`,delta:1,unit:'개체'}));
return out;
}

function EndingArtwork({ending,state}:{ending:string;state:V10}){
 const [failed,setFailed]=useState(false);
 const [imageIndex,setImageIndex]=useState(0);
 const entry=findEndingArt(ending);
 const artwork=endingArtworkCandidates(ending);
 const sanctuaryEnding=ending.startsWith('마지막 동물원');
 const livingAnimals=state.animals.filter(animal=>animal.alive&&!state.security.escapedIds.includes(animal.id)&&!state.headquarters.transferred.includes(animal.id));
 useEffect(()=>{setFailed(false);setImageIndex(0);},[ending]);
 return <div className={'ending-art-display'+(failed?' is-fallback':'')}>
  {!failed?<img key={`${ending}-${imageIndex}`} src={artwork[Math.min(imageIndex,artwork.length-1)]} alt={entry.label} onError={()=>{if(imageIndex<artwork.length-1)setImageIndex(v=>v+1);else setFailed(true)}}/>:<div className="ending-art-fallback"><span>ARK // END RECORD</span><strong>{ending.split(' — ')[0]}</strong><small>엔딩 장면을 불러오지 못했습니다. 기록과 결말은 보존되어 있습니다.</small></div>}
  {!failed&&sanctuaryEnding&&<div className="ending-habitat-survivors" aria-label="보호구역에 실제로 살아 있는 개체">{livingAnimals.map(animal=><img className="ending-habitat-survivor" data-animal-id={animal.id} key={animal.id} src={animalArt(animal)} alt={`${animal.name} · 보호구역 생존`}/>)}{state.originZero?.cat==='shelter'&&<img className="ending-habitat-survivor" data-animal-id="m00" key="m00" src={animalSprite('m00')} alt="M-00 · 보호구역 생존"/>}</div>}
 </div>
}
function Bar({v,color='#f39cba'}:{v:number;color?:string}){return <div className="vbar"><span style={{width:`${cap(v)}%`,background:color}}/></div>}
function MiniStat({name,value,color,points=false}:{name:string;value:number;color?:string;points?:boolean}){return <div className="mini-stat"><span>{name}</span><Bar v={value} color={color}/><b>{Math.round(value)}{points?'/100':'%'}</b></div>}

/** Exact before → after telemetry, represented as a compact circular gauge. */
function DeltaDonut({label,before,after,max=100,unit='',color='#88d7c8',note='',badWhenHigh=false}:{label:string;before:number;after:number;max?:number;unit?:string;color?:string;note?:string;badWhenHigh?:boolean}){
 const size=Math.max(1,max),progress=Math.max(0,Math.min(100,after/size*100)),difference=after-before;
 const signed=(difference>0?'+':'')+difference;
 return <div className="v58-delta-card" title={`${label}: ${before}${unit} → ${after}${unit} (${signed}${unit})`}>
  <div className="v58-donut" role="img" aria-label={`${label} 현재 ${after}${unit}, 이전 ${before}${unit}, 변동 ${signed}${unit}`} style={{'--v58-pct':`${progress}%`,'--v58-accent':color} as CSSProperties}><div><strong>{after}</strong><small>{unit==='%'?'%':'현재'}</small></div></div>
  <div className="v58-delta-copy"><b>{label}</b><span className="v60-before-after"><s>{before}</s><ChevronRight size={12}/><strong className={difference===0?'v60-unchanged':((difference<0)!==badWhenHigh)?'v60-negative':'v60-positive'}>{after}</strong></span><em className={difference===0?'is-neutral':((difference>0)===badWhenHigh)?'is-loss':'is-gain'}>{signed}{unit==='/100'?'':unit}</em>{note&&<small>{note}</small>}</div>
 </div>;
}

function RingMeter({name,value,color}:{name:string;value:number;color:string}){
 const pct=Math.max(0,Math.min(100,Math.round(value)));
 return <div className="v53-ring-meter" role="img" aria-label={`${name} ${pct}퍼센트`}>
  <span className="v53-ring-track" style={{background:`conic-gradient(${color} 0 ${pct}%,#3b3041 ${pct}% 100%)`}}><span className="v60-ring-number"><strong>{pct}</strong><small>%</small></span></span>
  <b>{name}</b>
 </div>;
}
function Tile({title,children,extra,className=''}:{title:string;children:ReactNode;extra?:ReactNode;className?:string}){return <section className={'ui-tile '+className}><div className="tile-head"><b>{title}</b>{extra}</div>{children}</section>}
function deltaIsBad(name:string,delta:number){return /감염|위협|스트레스|질병|허기|오염/.test(name)?delta>0:delta<0}
type VitalTone='safe'|'warning'|'critical';
function subjectVital(hp:number,infection:number,mind:number):VitalTone{return hp<=32||infection>=75||mind<=23?'critical':hp<=66||infection>=40||mind<=50?'warning':'safe'}
function eveVital(core:number):VitalTone{return core<=30?'critical':core<=65?'warning':'safe'}
function animalVital(a:{hp:number;stress:number;contamination:number;sickness?:number;hunger?:number;mutated?:boolean}):VitalTone{
 if(a.hp<=32||a.stress>=78||a.contamination>=70||(a.sickness??0)>=65)return 'critical';
 if(a.hp<=65||a.stress>=50||a.contamination>=38||(a.sickness??0)>=35||(a.hunger??0)>=65||a.mutated)return 'warning';
 return 'safe';
}
function VitalChip({tone,compact=false}:{tone:VitalTone;compact?:boolean}){return <span className={'v39-vital '+tone+(compact?' compact':'')} title={tone==='safe'?'안정 · 바이탈 정상':tone==='warning'?'주의 · 관리 필요':'위험 · 즉시 관리 필요'}><i/>{tone==='safe'?'안정':tone==='warning'?'주의':'위험'}</span>}

export default function Game(){
const [pendingProtocol,setPendingProtocol]=useState<number|null>(null);
const [facilityBuildFlash,setFacilityBuildFlash]=useState<FacilityId|null>(null);
 const [facilityProject,setFacilityProject]=useState<FacilityId|null>(null);
const [s,setS]=useState<V10|null>(null),[ready,setReady]=useState(false),[start,setStart]=useState<Start>('generator');
const guidedNight=!!s&&s.tutorialStep===6&&!!s.headquarters?.transferred?.includes('rabbit')&&!(s.onboardingSeen??[]).includes('first-night-defense');
const [wiringOpen,setWiringOpen]=useState(false);
const [nightWiringOpen,setNightWiringOpen]=useState(false);
const [emergencyTask,setEmergencyTask]=useState<EmergencyKind|null>(null);
 const [operation,setOperation]=useState<{mode:'repair'|'medical';id?:CrewId}|null>(null);
const [introStage,setIntroStage]=useState<'welcome'|'dialogue'|'choice'>('welcome');
const [cinematic,setCinematic]=useState<CinematicKind|null>(null);
const [acknowledgingStaffLoss,setAcknowledgingStaffLoss]=useState(false);
const [voiceDebrief,setVoiceDebrief]=useState<{title:string;text:string;correct:boolean}|null>(null);
const [hqDebrief,setHqDebrief]=useState('');


const [tab,setTab]=useState<Tab>('hub'),[selectedRegion,setSelectedRegion]=useState<RegionId>('garden'),[selectedGear,setSelectedGear]=useState<Gear[]>(['flashlight','filter']),[selectedAnimal,setSelectedAnimal]=useState<string|null>(null);
const [camera,setCamera]=useState<CameraId>('CAM-01');
const [wing,setWing]=useState<ContainmentWing>('A');
const [rescueRoom,setRescueRoom]=useState<number|null>(null);
const [rescueTask,setRescueTask]=useState<'secure'|'treat'|null>(null);
const [incidentTask,setIncidentTask]=useState<number|null>(null);
const [careTask,setCareTask]=useState<number|null>(null);
useEffect(()=>setRescueRoom(null),[s?.pending]);
useEffect(()=>{if(!s||s.run)return;setSelectedGear(prev=>{const next=prev.filter(g=>!gearUnavailable(s,g,selectedRegion));return next.length===prev.length?prev:next})},[s,selectedRegion]);
const [selectedCompanion,setSelectedCompanion]=useState<CrewId[]>([]);
const [lockNotice,setLockNotice]=useState('');
const [awakening,setAwakening]=useState<{id:AnimalId;stage:number}|null>(null);
const [talkSpeed,setTalkSpeed]=useState(37);
 const [talk,setTalk]=useState<Talk[]>([]),[talkIdx,setTalkIdx]=useState(0),[furthestTalkIdx,setFurthestTalkIdx]=useState(0),[letters,setLetters]=useState(0),[talkDone,setTalkDone]=useState(false),[storyMenu,setStoryMenu]=useState(false),[sound,setSound]=useState(false),[inspect,setInspect]=useState(false);
const [aftermath,setAftermath]=useState<{title:string;notes:string;entries:ChangeEntry[];critical:boolean}|null>(null);
// Show the discovered animal BEFORE any dialogue or rescue choices. This is a transient UI reveal, not saved game state.
const [captureReveal,setCaptureReveal]=useState<{id:AnimalId;cell:number|null;first:boolean;size?:number;method?:CaptureMethod}|null>(null);
const [fieldRewardModal,setFieldRewardModal]=useState<{kind:'found'|'settlement';title:string;entries:ChangeEntry[];notes:string;settlement?:FieldSettlement}|null>(null);
function showFieldSettlement(next:V10){
 const summary=next.lastFieldSummary;
 if(!summary)return;
 setRewardReport(null);
 setFieldRewardModal({kind:'settlement',title:`${regions.find(r=>r.id===summary.region)?.name||'현장'} · 탐사 최종 정산`,entries:settlementEntries(summary),notes:next.lastOutcome,settlement:summary});
}
const [rewardReport,setRewardReport]=useState<{title:string;entries:ChangeEntry[];notes:string}|null>(null),[result,setResult]=useState<{success:boolean;title:string;text:string;animalId?:AnimalId}|null>(null),[nightView,setNightView]=useState(false),[nightChoice,setNightChoice]=useState<NightChoice>('shield'),[runFeedback,setRunFeedback]=useState(''),[memoryTarget,setMemoryTarget]=useState<string|null>(null),[protocolStep,setProtocolStep]=useState(0),[protocolErrors,setProtocolErrors]=useState(0),[protocolFeedback,setProtocolFeedback]=useState(''),[extractMode,setExtractMode]=useState<'gentle'|'force'>('gentle'),[synthA,setSynthA]=useState<string>(''),[gearPreview,setGearPreview]=useState(false),[confirmRestart,setConfirmRestart]=useState(false);
const nightCommitRef=useRef(false);
useEffect(()=>{nightCommitRef.current=false;},[s?.day]);
const [guideDismissed,setGuideDismissed]=useState(false);
const [statusOpen,setStatusOpen]=useState(false);
const [archiveSceneStep,setArchiveSceneStep]=useState(0);
const [careDialog,setCareDialog]=useState<{id:AnimalId;kind:CareAction}|null>(null);
const [careOutcome,setCareOutcome]=useState<{correct:boolean;message:string;delta:{bond:number;stress:number;hp:number;records:number};mastery:number;tutorialUnlock:boolean}|null>(null);
const [careHint,setCareHint]=useState(false);
const [protocolAnswers,setProtocolAnswers]=useState<{stage:number;prompt:string;chosen:string;expected:string;matched:boolean}[]>([]);
const [v42Telemetry,setV42Telemetry]=useState<{tick:number;entries:TelemetryEvent[]}|null>(null);
const lastTelemetryState=useRef<V10|null>(null);
const telemetryCounter=useRef(0);
const guideFocus=useRef<HTMLElement|null>(null);
const soundCtx=useRef<AudioContext|null>(null);
function beep(f=540,d=.11){if(!sound)return;try{const ctx=soundCtx.current??new AudioContext();soundCtx.current=ctx;const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=f;g.gain.value=.026;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch{}}
useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const loaded=loadGame(JSON.parse(raw));if(loaded)setS(loaded)}}catch{}setReady(true)},[]);
useEffect(()=>{if(ready&&s)localStorage.setItem(KEY,JSON.stringify(s))},[ready,s]);
// A field threat keeps searching while the player studies tracks; every tick updates
// the same serializable field state, so refresh/load preserves its position and alert.
useEffect(()=>{
 if(tab!=='expedition'||!s?.run||s.run.firstTutorial||!s.field||s.field.combat||s.field.choice||s.pending||result||fieldRewardModal||talk.length||cinematic)return;
 const timer=window.setInterval(()=>setS(current=>{
  if(!current?.run||current.run.firstTutorial||!current.field||current.field.combat||current.field.choice||current.pending)return current;
  const activeThreat=!!current.field.threat&&!mutantSecured(current);
  if(!activeThreat)return current;
  const next=structuredClone(current),field=next.field!;
  if(activeThreat&&tickRoamingThreat(next)){field.lastEvent='MUTANT가 접근했습니다. 중단된 포획 기록은 보존됩니다.';next.lastOutcome=field.lastEvent;}
  field.noise=Math.max(0,field.noise-4);
  return next;
 }),2100);
 return ()=>window.clearInterval(timer);
},[tab,!!s?.run,!!s?.field,!!s?.field?.combat,!!s?.field?.choice,!!s?.pending,s?.run?.firstTutorial,!!result,!!fieldRewardModal,talk.length,!!cinematic]);
useEffect(()=>{setStatusOpen(false)},[tab]);
useEffect(()=>{if(!statusOpen)return;const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')setStatusOpen(false)};window.addEventListener('keydown',onEscape);return()=>window.removeEventListener('keydown',onEscape)},[statusOpen]);
// Nonblocking numerical readout of actual state changes: both player and animal damage.
useEffect(()=>{
 if(!s){lastTelemetryState.current=null;return;}
 const prev=lastTelemetryState.current;lastTelemetryState.current=s;
 if(!prev||prev.day===0)return;
 const delta=telemetryChanges(prev,s);
 if(!delta.length)return;
 setV42Telemetry({tick:++telemetryCounter.current,entries:delta.slice(0,7)});
},[s]);
useEffect(()=>{if(!v42Telemetry)return;const timer=setTimeout(()=>setV42Telemetry(p=>p?.tick===v42Telemetry.tick?null:p),3600);return()=>clearTimeout(timer);},[v42Telemetry]);
 useEffect(()=>{if(!s||s.phase==='ending'||(s.mind>0&&s.eve>0))return;const fatal={...s,phase:'ending' as const,ending:s.mind<=0?'제000번 우리 — 담당자의 생체 신호가 정지했다. EVE는 그를 보존 개체로 분류했다.':'마지막 신호 — EVE 코어 0. 시설의 마지막 음성이 사라지고 모든 지시가 끊겼다.'};setTalk([]);setResult(null);setCaptureReveal(null);setNightView(false);setMemoryTarget(null);setS(fatal)},[s]);

useEffect(()=>{const line=talk[talkIdx];if(!line||talkDone||letters>=line.text.length)return;const t=setTimeout(()=>setLetters(v=>talkSpeed===0?line.text.length:v+1),talkSpeed);return()=>clearTimeout(t)},[talk,talkIdx,letters,talkDone,talkSpeed]);
// Reveal only after a real in-game state transition. Saves are marked once, so the scene never repeats.
useEffect(()=>{
 if(!s||awakening||s.phase==='ending'||s.phase==='finale')return;
 const a=s.animals.find(isAwakeningReady);
 if(!a)return;
 // A fresh MUTANT event outranks ordinary dialogue. Keep the prior choices in the dossier.
 setS(previous=>{
  if(!previous||!previous.animals.some(x=>x.id===a.id&&!x.awakened))return previous;
  return {...previous,animals:previous.animals.map(x=>x.id===a.id?{...x,mutated:true,awakened:true}:x),logs:[{day:previous.day,title:'MUTANT 발현 / 인간 음성',text:`${a.name}의 신경 충돌 수치가 임계치를 초과했습니다. 개체의 발화와 신체 변이가 동시 검출되었습니다.`,kind:'bad' as const},...previous.logs].slice(0,80)};
 });
 setCareDialog(null);setCareOutcome(null);setTalk([]);setResult(null);
 setAftermath(null);setAwakening({id:a.id,stage:0});
},[s,awakening]);


function dialogue(lines:Talk[]){if(!lines.length)return;setTalk(lines);setTalkIdx(0);setFurthestTalkIdx(0);setLetters(0);setTalkDone(false);setStoryMenu(false)}
// Only the FIRST conflict between TWO recruited employees is voiced. Thereafter the
// same real player choices quietly drain -3 mental health from their dissenters.
function showFirstCrewConflict(before:V10,after:V10){
 const conflict=after.crew?.lastConflict;
 if(!conflict?.first||conflict.serial===(before.crew?.lastConflict?.serial??0))return false;
 dialogue(crewConflictDialogue(conflict));
 beep(255);return true;
}
function closeCrewCollapse(id:CrewId){
 if(!s?.crew?.pendingTermination||s.crew.pendingTermination!==id)return;
 const next=terminateCrew(s,id);
 if(next===s)return;
 setS(next);setAcknowledgingStaffLoss(true);setAftermath(null);setResult(null);setNightView(false);setRunFeedback(next.lastOutcome);
 const data=CREW_PROFILES[id],effect=CREW_LOSS_EFFECTS[id];
 dialogue([
  {speaker:'EVE',text:`직원 처리 절차가 완료되었습니다. ${data.post}의 신호를 더는 감지할 수 없습니다.`},
  {speaker:'관리자',text:'...이렇게 끝이라고? 저 사람이 맡았던 일은 이제 어떻게 되는 거지?'},
  {speaker:'EVE',text:effect.eve},
  {speaker:'EVE',text:`영구 시설 이상 등록: 「${effect.name}」. 실제 적용 효과는 「${effect.summary}」입니다. 관리 인력은 복원되지 않으며, 그 흔적은 기록에 남습니다.`}
 ]);
 beep(145);
}
function answerHeadquarters(choice:HqOrderChoice){
 if(!s?.hqOrders?.active||s.hqOrders.active.status!=='offered')return;
 const next=respondHqOrder(s,choice);if(next===s)return;
 setS(next);setTab('hq');setHqDebrief(next.lastOutcome);beep(choice==='refuse'?195:choice==='accept'?360:595);
}
function probeDoorVoice(probe:VoiceProbe,reading?:VoiceReading,alignment?:number){
 if(!s?.voice?.pending)return;
 const next=inspectVoiceBreach(s,probe,reading,alignment);if(next===s)return;
 setS(next);beep(370);setRunFeedback(next.lastOutcome);
}
function decideDoorVoice(verdict:VoiceVerdict){
 if(!s?.voice?.pending)return;
 const old=s.voice.pending;
 const next=resolveVoiceBreach(s,verdict);if(next===s)return;
 const record=next.voice?.history?.[0];
 setS(next);setTab('cctv');setTalk([]);setAftermath(null);setResult(null);
 setVoiceDebrief({title:record?.isMimic?'모방 음성 신원 판독':'인증 신호 판독',text:record?.outcome??next.lastOutcome,correct:!!record&&((verdict==='seal')===record.isMimic)});
 setRunFeedback(next.lastOutcome);beep(old.isMimic&&verdict==='open'?145:old.isMimic?650:425);
}
function chooseCrewNight(id:CrewId){
 if(!s?.crew?.pendingNightVote)return;
 const n=resolveCrewNightVote(s,id);
 if(n===s)return;
 setS(n);
 const outcome=n.crew?.lastNightResult;
 if(outcome){
  const entries:ChangeEntry[]=[...changes(s,n),...outcome.losses.filter(x=>x.before!==x.after).map(x=>({name:`${CREW_PROFILES[x.id].title} 정신력`,delta:x.after-x.before,unit:''}))];
  setAftermath({title:`야간 인력 배치 · ${CREW_PROFILES[id].post}`,notes:`${outcome.effect}. ${outcome.losses.length?'선택받지 못한 직원들의 신경 상태가 악화되었습니다.':'다른 배치 직원이 없어 불이익이 발생하지 않았습니다.'}`,entries,critical:outcome.losses.some(x=>x.after<=25)});
 }
 beep(465);
}

function performPathology(method:PathologyMethod){if(!s||!synthA)return;const n=runPathology(s,synthA as AnimalId,method);if(n===s){setRunFeedback('검사 불가: 개체 상태·일일 중복 검사·전력·행동력·의약품을 확인하세요.');return;}setS(n);report(s,n,'병리 검사');setRunFeedback(n.lastOutcome);beep(n.pathologyPending?.success?730:260)}
function finishPathology(choice:'archive'|'headquarters'){if(!s?.pathologyPending)return;const n=resolvePathologyEvent(s,choice);setS(n);setRunFeedback(n.lastOutcome);beep(490)}
// Dialogue navigation: Next advances immediately even while text is typing.
// Previously seen lines are shown in full when revisited; Skip closes only this dialogue.
function closeTalk(){setAcknowledgingStaffLoss(false);if(!s&&introStage==='dialogue')setIntroStage('choice');setTalk([]);setTalkIdx(0);setFurthestTalkIdx(0);setLetters(0);setTalkDone(true)}
function previousTalk(){if(talkIdx<=0)return;const previous=talkIdx-1;setTalkIdx(previous);setLetters(talk[previous].text.length);beep(330)}
function advanceTalk(){if(!talk[talkIdx])return;const next=talkIdx+1;if(next>=talk.length){closeTalk();return}setTalkIdx(next);setLetters(next<=furthestTalkIdx?talk[next].text.length:0);setFurthestTalkIdx(v=>Math.max(v,next));beep(400)}
function skipTalk(){if(!talk.length)return;closeTalk()}
function revealTalk(){const line=talk[talkIdx];if(line)setLetters(line.text.length)}
function confirmCaptureReveal(){
 if(!captureReveal)return;
 const first=captureReveal.first;
 setCaptureReveal(null);
 if(first)dialogue(tutorialScenes.discovery);
}

function report(before:V10,after:V10,title:string){if(after===before)return;setRewardReport({title,entries:changes(before,after),notes:after.lastOutcome||''})}
function introduceEVE(){
 setIntroStage('dialogue');
 dialogue([...talkIntro.slice(0,16),
 {speaker:'EVE',text:'선택에 앞서 이 구역의 생존 규칙을 알려 드리겠습니다. 정신력은 담당자님의 안정 상태입니다. 0이 되면 운영이 중단됩니다. ST는 탐사 중에만 쓰는 이동 에너지로, 정상 귀환하면 다음 출동 때 100으로 회복됩니다.'},
 {speaker:'관리자',text:'몸이 버틸 수 있는 양이랑, 하루에 할 수 있는 일이 다르다는 거네.'},
 {speaker:'EVE',text:'맞습니다. AP는 하루의 핵심 작업 횟수입니다. 발전·돌봄·출동에 쓰며 날짜가 바뀌면 회복됩니다. 전력은 출동 장비와 시설을 계속 가동하는 연료입니다.'},
 {speaker:'관리자',text:'포획할 때도 저 행동력을 쓰는 거야?'},
 {speaker:'EVE',text:'별개입니다. 수풀에서 개체를 추적할 때에는 「포획 행동」을 씁니다. 풀숲을 조사하거나 유인 도구를 설치할 때 한 번씩 줄어듭니다.'},
 {speaker:'EVE',text:'의약품은 관리자와 직원의 정신력 회복 및 개체 치료에, 시설 부품은 발전기와 보존 시설 수리에, 식량은 매일 보호 개체의 급식에 필요합니다. 전지는 현장 조명과 장비를 보조합니다.'},
 {speaker:'관리자',text:'좋아. 처음부터 다 알 순 없어도, 뭘 얻는지는 보고 고르겠다.'},
 {speaker:'EVE',text:'출발 구역 세 곳의 기록을 열었습니다. 발전실은 전력과 전지를, 폐역은 첫 이틀의 행동력 여유를, 관측소는 첫 두 번의 포획 수색 여유를 줍니다. 보너스는 조건에 따라 만료됩니다.'}
 ]);
}
function finishCinematic(){const kind=cinematic;setCinematic(null);if(kind==='eve'){introduceEVE();return;}if(kind&&s){dialogue([{speaker:'EVE',text:`DAY ${s.day} · 본부 파견 캡슐이 도착했습니다. ${CREW_PROFILES[kind].post}의 근무 인증이 완료되었습니다. 과거 인사 이력은 접근 제한입니다.`},...crewDialog(s,kind),{speaker:'EVE',text:'본부 인력은 최대 네 명까지 파견됩니다. 생체 이송을 마친 뒤 다음 날부터 순차적으로 도착하며, 공동 지원은 하루 한 번만 가능합니다.'}]);}}
function playStart(){
 lastTelemetryState.current=null;setV42Telemetry(null);setCaptureReveal(null);setFieldRewardModal(null);
 const next=beginGame('artist',start);
 next.logs.unshift({day:1,title:'최우선 지령 · M-00 회수',text:'외형 정보 없음. 마지막 확인 위치 불명. 확보 후 본부에 보고할 것.',kind:'mystery'});
 next.logs.unshift({day:1,title:'복원된 최초 위치',text:starts.find(x=>x.id===start)!.desc+' / '+starts.find(x=>x.id===start)!.bonus,kind:'mystery'});
 setGuideDismissed(false);setS(next);setTab('hub');
 dialogue([{speaker:'관리자',text:'...기억이 잘 나지 않아. 여기서부터 다시 시작해야 하나.'},{speaker:'EVE',text:'관리자님의 초기 기억 기록은 복구되지 않았습니다. 본부의 최우선 지령이 하나 남아 있습니다. M-00 회수. 외형 정보는 소실됐고, 마지막 위치도 불명입니다.'},{speaker:'관리자',text:'정체도 모르는 걸 찾으라고? …알았어. 먼저 이곳부터 살아남아야겠네.'},
 {speaker:'관리자',text:startStories[start].fragment},{speaker:'EVE',text:startStories[start].eve},...talkIntro.slice(16)]);
 beep(660);
}
function constructFacility(id:FacilityId){
 if(!s)return;
 if(s.tutorialStep>=9){if(operationAllowed(s,'assembly',id))setFacilityProject(id);else setRunFeedback('시설 조립 조건을 확인하세요.');return;}
 const before=s.tutorialStep;
 const n=buildFacility(s,id);
 if(n===s){setRunFeedback('복구 불가: 고철·부품·시설 전력 또는 현재 작업 상태를 확인하세요.');return;}
 setFacilityBuildFlash(id);window.setTimeout(()=>setFacilityBuildFlash(current=>current===id?null:current),1500);
 setS(n);report(s,n,'시설 복구');setRunFeedback(n.lastOutcome);beep(760);
 if(before===6&&id==='cctv')dialogue([{speaker:'EVE',text:'CCTV 감시망 복구 완료. 외곽과 격리실의 경보를 확인할 수 있습니다. 먼저 오른쪽 카메라 목록에서 감시 위치를 바꿔 보세요.'},{speaker:'관리자',text:'화면이 전부 연결되는 거야? 갑자기 탈출하면?'},{speaker:'EVE',text:'탈출 시 화면에 경보가 표시됩니다. 경로를 추적한 뒤 재격리하십시오. 상황에 따라 전력과 AP가 필요하며, 변이체는 별도 억제 주사를 쓸 수 있습니다.'}]);
 if(before===7&&id==='synthesis')dialogue([{speaker:'EVE',text:'병리·검시실이 복구되었습니다. 이제 안전한 검체 검사와 사후 검시로 개체의 신체 상태를 조사할 수 있습니다.'},{speaker:'관리자',text:'위험한 검사는 신중하게 선택해야겠어. 검사 결과를 본부에 제출할지도 내가 결정하지.'}]);
}
function mutate(fn:(s:V10)=>V10){if(!s)return;const next=fn(s);if(next===s)return;setS(next);report(s,next,'작전 결과');beep()}
function action(name:'rest'|'recharge'|'handsearch'|'eve'|'feed'|'repair'|'crank'|'decontam'|'batteryCharge'){if(!s)return;if(name==='recharge'&&s.ap>=1&&s.parts>=1){setWiringOpen(true);return;}if(name==='repair'){if(operationAllowed(s,'repair'))setOperation({mode:'repair'});else setRunFeedback('격리문 복구 조건을 확인하세요.');return;}if(name==='crank'&&s.mind<=14){setRunFeedback('수동 발전에는 정신력 15 이상이 필요합니다. 먼저 휴식하거나 의무관에게 도움을 요청하세요.');return}if(name==='handsearch'||name==='crank'||name==='decontam'){setEmergencyTask(name);return;}const next=doBase(s,name);if(next===s){setRunFeedback('작업을 진행할 수 없습니다. 행동력과 필요 자원을 확인하세요.');return}setS(next);report(s,next,'기지 작업 결과');setRunFeedback(next.lastOutcome);if(!showFirstCrewConflict(s,next))beep(550)}
function selectRegion(id:RegionId){setSelectedRegion(id);setGearPreview(true)}
function goRun(){if(!s)return;const n=startRun(s,selectedRegion,selectedGear,selectedCompanion);if(n===s){setRunFeedback(expeditionBlockReason(s,selectedRegion,selectedGear,selectedCompanion)??'장비 편성을 다시 확인하세요.');return;}if(s.tutorialStep===1)n.tutorialStep=2;setGearPreview(false);setFieldRewardModal(null);setS(n);report(s,n,'출동 자원 사용');setRunFeedback('현장 연결 완료. 이동해 생체 신호를 찾으면 수풀 아래 숨은 개체를 발자국으로 추적합니다.');if(s.tutorialStep===1)dialogue([...tutorialScenes.expedition,...(expeditionLines[selectedRegion]||[])]);beep(740)}
function applyFieldMedkit(){if(!s)return;const n=performFieldMedkit(s);if(n===s){setRunFeedback('사용 불가: 회복제 미장착·이미 사용·정신력 최대 상태를 확인하세요.');return;}setS(n);report(s,n,'현장 응급 처치');setRunFeedback(n.lastOutcome);beep(640)}
 function onFieldMove(target:number,pace:Pace){
  if(!s)return;
  const tile=s.field?.tiles[target];
  const n=moveField(s,target,pace);
  if(n===s){setRunFeedback('이동 불가: 인접한 칸을 확인하세요. ST가 0이 되면 자동으로 긴급 철수합니다.');return;}
  const found=!!n.capture&&!s.capture,completed=!!s.run&&!n.run;
  const firstReturn=completed&&(s.run?.firstTutorial??s.tutorialStep===2);
  if(firstReturn&&n.tutorialStep===2)n.tutorialStep=3;
  setS(n);setRunFeedback(n.lastOutcome);
  if(completed)showFieldSettlement(n);
  // Items are banked immediately; only the final expedition settlement opens a modal.
  // The running ledger in FieldMission shows every item and number while moving.
  if(found&&s.run?.firstTutorial&&s.tutorialStep===2)dialogue([{speaker:'관리자',text:'발자국만 있고 동물의 모습은 보이지 않아. 이 흔적이 지금 위치라는 보장도 없겠지.'},{speaker:'EVE',text:'중앙의 수풀 격자를 조사해 개체의 이동 경로를 추리하십시오. 한 칸 조사할 때마다 1턴이 흐르고 동물도 움직입니다. 발자국은 방금 전 위치이며, 3턴마다 개체 주변 한 칸의 풀이 흔들립니다.'},{speaker:'EVE',text:'왼쪽 검은 행동 카드 세 장을 해독하면 습성이 드러납니다. 오른쪽에서는 먹이·소리·빛·차단막을 설치하고, 중앙의 조사 기록에서 방금 확인한 단서를 보십시오. 청음을 사용하면 대략적인 방향을 알 수 있지만 행동 1회가 소모됩니다.'},{speaker:'관리자',text:'좋아. 흔적이 나타난 칸만 무작정 뒤지는 게 아니라, 이동한 다음 칸을 예측해야 하는 거군.'}]);
  else if(firstReturn)dialogue(tutorialScenes.return);
  beep(found?670:420);
 }
 function onFieldHide(){if(!s)return;const n=concealInField(s);if(n===s){setRunFeedback('숨을 곳 없음: 인접한 장애물 뒤에서 숨거나 전투·현장 선택을 먼저 마치세요.');return;}setS(n);setRunFeedback(n.lastOutcome);beep(n.field?.concealed?240:420)}
 function onFieldDecision(action:'leave'|'survey'|'risk'){
  if(!s)return;
  const n=resolveFieldChoice(s,action);
  if(n===s)return;
  setS(n);setRunFeedback(n.lastOutcome);if(s.run&&!n.run)showFieldSettlement(n);beep(action==='risk'?320:500);
 }
 function onFieldRetreat(){
  if(!s||s.field?.combat)return;
  if(s.capture){const n=abandonTacticalCapture(s);if(n===s)return;setS(n);setRunFeedback(n.lastOutcome);beep(300);return;}
  const n=leaveField(s);if(n===s)return;
  const firstReturn=(s.run?.firstTutorial??s.tutorialStep===2)&&!!s.field&&s.field.steps>0;
  if(firstReturn&&n.tutorialStep===2)n.tutorialStep=3;
  setS(n);showFieldSettlement(n);setRunFeedback(n.lastOutcome);
  if(firstReturn)dialogue(tutorialScenes.return);
  beep(330);
 }
 function onFieldPlace(pos:number,kind:DeviceKind){if(!s)return;const n=placeTacticalDevice(s,pos,kind);if(n!==s){setS(n);setRunFeedback(n.capture?.lastEvent||'장치를 배치했습니다.');beep(510)}else setRunFeedback('배치 불가: 남은 작전 명령을 확인하거나 지정 이송구 위치를 확인하세요.');}
 function onFieldRemove(pos:number){if(!s)return;const n=removeTacticalDevice(s,pos);if(n!==s){setS(n);setRunFeedback(n.capture?.lastEvent||'장치 회수 완료.');beep(420)}}
 function onFieldPredict(pos:number){if(!s?.capture)return;const n=predictTacticalMove(s,pos);if(n===s){setRunFeedback('예측 불가: 남은 작전 명령을 확인하세요.');return;}setS(n);setRunFeedback(n.capture?.lastEvent||'이동 예측을 지정했습니다.')}
 function onFieldSeal(){if(!s?.capture)return;const n=authorizeTacticalSeal(s);setS(n);setRunFeedback(n.capture?.lastEvent||'봉쇄를 승인했습니다.');beep(n.capture?.sealArmed?680:260)}
 function onFieldAdvance(){if(!s?.capture)return;const prior=s.capture;const n=executeTacticalTurn(s);if(n===s)return;const caught=!!n.pending&&!s.pending;const escaped=!n.capture&&!n.pending;const firstReturn=caught&&s.tutorialStep===2;setS(n);setRunFeedback(n.lastOutcome);if(caught){report(s,n,'전술 포획 성공');setCaptureReveal({id:n.pending!,cell:null,first:firstReturn});beep(890)}else if(escaped){setResult({success:false,title:'포획 실패 · 개체 이탈',text:n.lastOutcome,animalId:prior.species});beep(210)}else beep(420)}
function onHuntAction(command:import('@/lib/hidden-hunt').HuntCommand){
 if(!s?.capture?.hunt)return;
 const prior=s.capture;
 const n=performVeiledHunt(s,command);
 if(n===s){setRunFeedback('명령을 실행할 수 없습니다. 배치할 장치 3개 제한과 남은 행동 횟수를 확인하세요.');return;}
 const won=!!n.pending&&!s.pending,failed=!n.capture&&!n.pending;
 const firstReturn=won&&s.tutorialStep===2;
 setS(n);setRunFeedback(n.lastOutcome);
 if(won){report(s,n,'은신 개체 포획');setCaptureReveal({id:n.pending!,cell:command.cell??null,first:firstReturn,size:prior.hunt?huntSize(prior.hunt):6,method:command.method??(prior.hunt?.trap?'cage':'net')});beep(860);}
 else if(failed){setResult({success:false,title:'추적 실패 · 개체 도주',text:n.lastOutcome,animalId:prior.species});beep(220);}
 else beep(command.type==='search'?360:command.type==='reveal'?690:480);
}
function rescue(which:'secure'|'treat'|'release',quality=.5){if(!s)return;const animal=s.pending;const available=Array.from({length:s.rooms},(_,i)=>i+1).filter(room=>!s.animals.some(a=>a.alive&&a.room===room));const n=rescueChoice(s,which,Math.random(),which==='secure'?(rescueRoom!==null&&available.includes(rescueRoom)?rescueRoom:available[0]):undefined,quality);if(n===s)return;setRescueTask(null);const newlyRescued=n.lastOutcome.includes('구조 성공')&&(s.tutorialStep===2||s.tutorialStep===3);if(newlyRescued)n.tutorialStep=4;const success=n.lastOutcome.includes('구조 성공');setS(n);report(s,n,'개체 처리 결과');setResult({success:which==='secure'?success:which==='treat',title:which==='secure'?(success?'구조 완료':'구조 실패'):which==='treat'?'현장 치료 완료':'방생 결정',text:n.lastOutcome,animalId:animal??undefined});if(!showFirstCrewConflict(s,n)&&newlyRescued)dialogue(tutorialScenes.rescued);setRunFeedback('');beep(success?880:230);if(animal&&success)setSelectedAnimal(animal)}
function resolveEvent(choice:number,quality=1){if(!s?.pendingIncident)return;const id=s.pendingIncident;const peaceful=['garden','keepsake','quiet'].includes(id);const n=resolveIncident(s,choice);if(n===s)return;setIncidentTask(null);if(!peaceful&&choice!==3&&quality<.67){const loss=quality<.34?5:2;n.facility=cap(n.facility-loss);n.lastOutcome+=' · 현장 대응 미숙: 추가 시설 손상.';}setS(n);setRewardReport(null);const entries=changes(s,n);const animalHarm=n.animals.reduce((acc,a,i)=>acc+Math.max(0,a.stress-(s.animals[i]?.stress??a.stress)),0);if(animalHarm)entries.push({name:'개체 스트레스 증가',delta:animalHarm,unit:'합계'});setAftermath({title:incidentDefs[id].title,notes:n.lastOutcome,entries,critical:(!peaceful&&choice===2)||n.mind<s.mind-14||n.eve<s.eve-14||n.facility<s.facility-14});dialogue([{speaker:'관리자',text:incidentReactions[id]?.[choice]??'알았어. 내가 할게.'},{speaker:'EVE',text:peaceful?'오늘의 선택을 기록했습니다. 이런 날도 기억하고 싶어요.':'대응을 기록했습니다. 실제 자원과 생체 상태의 변화를 확인해 주십시오.'}]);beep(!peaceful&&choice===2?190:590)}
function operateSecurity(action:SecurityAction,selectedCamera?:CameraId,hotspot?:number){if(!s)return;const animalId=s.security.incident?.animalId;const n=securityAction(s,action,selectedCamera,hotspot);if(n===s)return;if(animalId)recordSpecimen(n,animalId,'CCTV · '+action,n.lastOutcome,'security');setS(n);report(s,n,'CCTV 대응 결과');const d=n.security.incident;setRunFeedback(n.lastOutcome);if(d)setCamera(d.camera);beep(d?.status==='escaped'?205:590)}
function handleHQChoice(choice:HeadquartersChoice){
  if(!s)return;
  const id=s.headquarters.pendingAnimal;
  const firstRabbit=id==='rabbit'&&!s.headquarters.transferred.includes('rabbit')&&s.tutorialArchiveReviewPending;
  if(firstRabbit&&choice!=='transfer')return;
  const n=resolveHeadquarters(s,choice);
  if(n===s){
   const animal=s.animals.find(a=>a.id===id);
   if(choice==='transfer'&&animal){setRunFeedback('이송 조건 미달 · '+staffTransferIssues(s,animal).join(' · '));setTab('hq');}
   return;
  }
  if(s.tutorialArchiveReviewPending)n.tutorialArchiveReviewPending=false;
  if(choice==='transfer'&&id)setSelectedAnimal(current=>current===id?null:current);
  setS(n);report(s,n,'본부 통신 결과');
  dialogue(choice==='defer'?[{speaker:'EVE',text:'본부 이송을 보류했습니다. 개체를 치료한 뒤 공명 기록으로 재요청할 수 있습니다.'}]:[
   {speaker:'관리자',text:choice==='transfer'?'살아 있는 채로 보내는 거야. 해부는 승인하지 않아.':choice==='copy'?'생체는 여기 둬. 기록만 보내면 되잖아.':'안 보내. 지금은 내가 책임질 거야.'},
   {speaker:'EVE',text:choice==='transfer'?(id&&['deer','wolf','rabbit','fox'].includes(id)?'이송 수락. 본부에서 인력 배치 심사를 시작합니다. 다음 날부터 한 명씩 도착합니다.':'생체 이송이 완료되었습니다. 기록은 분석실에 보존됩니다.'):'copy'===choice?'개체를 보호한 채 공명 데이터만 전송했습니다. 기록은 분석실에서 확인할 수 있습니다.':'본부의 인계 요청을 거부했습니다. 외부 간섭이 증가할 수 있습니다.'}
  ]);
  beep(420);
 }
 function reopenHQ(id:AnimalId){if(!s)return;const n=requestHeadquartersTransfer(s,id);if(n===s)return;setS(n);setTab('hq');beep(470);}
function onArchiveDissection(action:DissectionAction,key?:string){
 if(!s)return;
 if(action==='forced'&&!window.confirm('해당 개체는 영구적으로 소실됩니다. 살아 있는 개체의 신경 조직을 강제로 회수하시겠습니까?'))return;
 const n=applyDissection(s,action,key);
  if(n!==s&&action==='transmit')settleHqShipment(n,s.archive?.dispatches??0);
 if(n!==s&&action==='forced'){crewDissectionShock(n);applyCrewOpinion(n,'disposal','dispose');}
 if(n===s){setRunFeedback('병리 처리 불가: 기밀 해금, 개체 상태, 전력, 행동력 또는 표본 수량을 확인하십시오.');return;}
 setS(n);report(s,n,'병리실 연구 결과');setRunFeedback(n.lastOutcome);
 if(action==='forced'&&!showFirstCrewConflict(s,n))dialogue([{speaker:'관리자',text:'...내가 지금 무슨 짓을 승인한 거지.'},{speaker:'EVE',text:'본부의 처리 기록이 갱신되었습니다. 담당자님의 선택은 삭제되지 않습니다.'}]);
 else if(action==='transmit')dialogue([{speaker:'EVE',text:'본부에서 표본을 수신했습니다. 우선 지원 물자 선택권이 발행되었습니다.'},{speaker:'관리자',text:'이쪽에서 보낸 게 뭔지 알고는 있는 거냐...'}]);
 beep(action==='forced'?220:620);
}
function onChooseArchiveGift(gift:ArchiveGift){
 if(!s)return;const n=chooseArchiveGift(s,gift);
 if(n===s){setRunFeedback('이미 받은 연구 설비입니다. 다른 보상을 선택하세요.');return;}
 setS(n);report(s,n,'본부 지원품 수령');setRunFeedback(n.lastOutcome);beep(680);
}
function advanceArchiveTruth(){
 if(!s?.archive?.revealPending)return;
 if(archiveSceneStep<4){setArchiveSceneStep(x=>x+1);beep(380);return;}
 const n=acknowledgeArchiveTruth(s);setS(n);setArchiveSceneStep(0);setTab('records');
 dialogue([{speaker:'관리자',text:'...그럼 내가 보내 온 애들은? 그 뇌를 꺼내 썼다는 거야?'},{speaker:'EVE',text:'확인된 기록과 일치합니다. 담당자님께는 해당 사실을 공개할 권한이 없었습니다.'},{speaker:'관리자',text:'알았어. 이번에는 내가 직접 모든 기록을 확인하겠어.'}]);
}
function closeHQScene(){if(!s?.headquarters?.pendingScene)return;setS({...s,headquarters:{...s.headquarters,pendingScene:null}})}
function applyNight(forced?:NightChoice){
 if(!s||nightCommitRef.current)return;
 nightCommitRef.current=true; // prevent double-clicks before React commits the new date
 const firstNight=guidedNight;
 const planned:NightChoice=firstNight?'shield':forced??nightChoice;
 const repaired=!!s.nightCircuit&&getNightCircuitState(s).completed&&getNightCircuitState(s).faults<3;
 const {state:n,success,blocker,applied}=resolveNightTransition(s,planned,{guided:firstNight,maintained:repaired});
 if(!success){nightCommitRef.current=false;const reason=blocker?.message??'야간 결산을 처리할 수 없습니다.';setLockNotice(reason);setRunFeedback(reason);setNightView(false);return;}
 // Date and AP belong to the same snapshot. Persist that snapshot; never save the uncommitted night state.
 try{localStorage.setItem(KEY,JSON.stringify(n));}catch{setRunFeedback('다음 날로 진행했지만 자동 저장에 실패했습니다. 브라우저 저장 공간을 확인하세요.');}
 const arrivals=(n.crew?.members??[]).filter(m=>!(s.crew?.members??[]).some(old=>old.id===m.id));setS(n);setRewardReport(null);setNightView(false);setNightWiringOpen(false);setTab(n.voice?.pending?'cctv':'hub');if(arrivals.length){setAftermath(null);setTalk([]);setCinematic(arrivals[0].id);beep(490);return;}const entries=changes(s,n);if(applied==='standby'||n.facility<s.facility-12||n.mind<s.mind-12||n.eve<s.eve-12){setAftermath({title:applied==='standby'?'무방비 야간 경과':'야간 시설 피해',notes:applied==='standby'?'경비가 가동되지 않아 시설이 손상되고 외부 위협이 상승했습니다. 다음 날 사고 위험이 커졌습니다.':n.lastOutcome,entries,critical:true});}if(n.voice?.pending){setTalk([]);setAftermath(null);setRunFeedback('정문에서 세 번의 노크가 들립니다. CCTV의 미확인 음성을 조사하세요.');beep(225);return;}if(n.crew?.lastIncident){const id=n.crew.lastIncident.id;setAftermath({title:'야간 인력 사고 · '+CREW_PROFILES[id].post,notes:n.crew.lastIncident.text,entries:[{name:'정신력',delta:-n.crew.lastIncident.damage,unit:''}],critical:true});dialogue([{speaker:id,text:'...정말 죄송해요. 제가 깨어 있었는지도 모르겠어요.'},{speaker:'EVE',text:'인력 신경 혼란으로 인한 야간 공격이 기록되었습니다. 정신력 회복과 직원 안정화가 필요합니다.'}]);beep(190);return;}dialogue(firstNight?[{speaker:'EVE',text:'첫날 경비 절차를 마쳤습니다. 오늘만 예비 전력을 사용해 방어를 안전하게 유지했습니다. 내일부터는 담당자님의 야간 계획에 따라 전력·시설·정신력에 다른 결과가 발생합니다.'},{speaker:'관리자',text:'알았어. 다음부터는 뭘 지킬지 내가 정해야겠네.'},...morningStaffBriefing(n)]:applied==='standby'?[{speaker:'관리자',text:'방어 계통이 준비되지 않았어. 경비는 못 돌리겠어. 문이라도 걸어 잠가.'},{speaker:'EVE',text:'경비를 가동하지 못했습니다. 밤사이 발생한 손실을 아침에 보고드리겠습니다.'},...morningStaffBriefing(n)]:morningStaffBriefing(n));beep(450)}
function mutantCare(id:AnimalId,decision:MutantDecision){
 if(!s)return;
 const a=s.animals.find(x=>x.id===id&&x.alive);
 if(!a)return;
 if((decision==='forceExtract'||decision==='euthanize')&&!window.confirm(`${a.name}의 ${decision==='forceExtract'?'강제 신경 추출':'안락사'}는 되돌릴 수 없습니다. 정말 진행하시겠습니까?`))return;
 const n=handleMutant(s,id,decision);
 if(n===s){setRunFeedback('개체 처리 불가: 탈출 여부, 전용 주사, 행동력, 전력을 확인하세요.');return;}
 recordSpecimen(n,id,decision==='serum'?'MUTANT 진정 주사':decision==='forceExtract'?'변이체 강제 추출':'변이체 안락사 결정',n.lastOutcome,decision==='serum'?'care':'loss');
 setS(n);report(s,n,'변이체 대응');setRunFeedback(n.lastOutcome);
 if(decision!=='serum')setResult({success:false,title:decision==='forceExtract'?'강제 추출 기록':'안락사 기록',text:n.lastOutcome,animalId:id});
 showFirstCrewConflict(s,n);
 beep(decision==='serum'?710:220);
}
function useCareKnowledge(){
 if(!s||!careDialog||careOutcome||careHint)return;
 const n=spendCareAnalysis(s);
 if(n===s){setRunFeedback('지식이 부족합니다. 현장 기록, EVE 분석 또는 공명 연구로 지식 6점을 확보하세요.');return;}
 setS(n);setCareHint(true);beep(560);
}
function care(id:string,kind:CareAction){
 if(!s)return;
 if(s.tutorialStep===4&&s.animals.some(a=>a.id==='rabbit'&&a.alive&&a.tutorialProtected)&&kind!=='observe'){
  setRunFeedback('EVE: 초기 실습은 「행동 관찰」만 진행합니다. 나머지 돌봄은 본부 인계 후 해금됩니다.');return;
 }
 if(s.security.escapedIds.includes(id as AnimalId)){
  setRunFeedback('격리실 이탈 개체입니다. CCTV에서 재격리한 후 돌봄을 진행해 주세요.');setCamera('CAM-01');setTab('cctv');return;
 }
 const animal=s.animals.find(a=>a.id===id&&a.alive);
 if(!animal||s.ap<1||(kind==='feed'&&s.food<1)||(kind==='heal'&&s.medicine<1)){
  setRunFeedback('돌봄을 시작할 수 없습니다. 개체 상태, 행동력, 식량 또는 의약품을 확인하세요.');return;
 }
 setCareOutcome(null);setCareHint(false);setCareTask(null);setCareDialog({id:id as AnimalId,kind});beep(460);
}
function submitCare(chosen:number,quality=1){
 if(!s||!careDialog||careOutcome)return;
 const result=resolveCareChoice(s,careDialog.id,careDialog.kind,chosen);
 if(!result){setRunFeedback('처리를 진행할 수 없습니다. 필요한 자원과 행동력을 확인하세요.');return;}
 const next=result.next as V10;setCareTask(null);
 const firstObservation=s.tutorialStep===4&&careDialog.id==='rabbit'&&careDialog.kind==='observe'&&next.animals.some(a=>a.id==='rabbit'&&a.records>0);
 if(firstObservation){
  // A wrong answer is logged but EVE fixes its consequences on the single guided lesson.
  const rabbit=next.animals.find(a=>a.id==='rabbit'&&a.alive);
  if(rabbit){rabbit.tutorialProtected=true;rabbit.stress=Math.min(18,rabbit.stress);rabbit.hp=Math.max(90,rabbit.hp);rabbit.bond=Math.max(34,rabbit.bond);rabbit.contamination=0;rabbit.mutated=false;rabbit.awakened=false;}
  next.tutorialStep=5;next.ap=Math.max(2,next.ap);next.power=Math.max(7,next.power);
 }
 if(!firstObservation){const subject=next.animals.find(a=>a.id===careDialog.id)!;if(quality>=.67&&result.correct)subject.bond=cap(subject.bond+3);else if(quality<.34)subject.stress=cap(subject.stress+4);}
 if(careDialog.kind==='heal'||careDialog.kind==='feed')applyCrewOpinion(next,'treatment','treat');
 const previousCareAnimal=s.animals.find(a=>a.id===careDialog.id)!;
 const currentCareAnimal=next.animals.find(a=>a.id===careDialog.id)!;
 const actualCareDelta={bond:currentCareAnimal.bond-previousCareAnimal.bond,stress:currentCareAnimal.stress-previousCareAnimal.stress,hp:currentCareAnimal.hp-previousCareAnimal.hp,records:currentCareAnimal.records-previousCareAnimal.records};
 const scenario=getCareScenario(s.animals.find(a=>a.id===careDialog.id)!,careDialog.kind,s.day);
 noteCare(next,careDialog.id,CARE_ACTIONS[careDialog.kind].title,scenario.options[chosen],result.correct,`관찰: ${scenario.cue}. 판단 근거: ${scenario.reason}. 결과: ${result.message} 유대 ${actualCareDelta.bond>=0?'+':''}${actualCareDelta.bond}, 스트레스 ${actualCareDelta.stress>=0?'+':''}${actualCareDelta.stress}, 개체 건강 ${actualCareDelta.hp>=0?'+':''}${actualCareDelta.hp}.`);
 setS(next);report(s,next,'개체 행동 대응');
 // The first tutorial corrects mistaken actions after resolution. Report true applied state changes, not pre-correction estimates.
 setCareOutcome({correct:result.correct||firstObservation,message:firstObservation?(result.correct?'EVE: 관찰 성공. 첫 토끼의 신호가 안정됐습니다. 연구실로 이동하세요.':'EVE: 잘못 기록된 반응을 교정했습니다. 이번 실습에서는 스트레스·건강 불이익 없이 기록을 저장했습니다. 연구실로 이동하세요.'):result.message,delta:actualCareDelta,mastery:result.mastery,tutorialUnlock:firstObservation});
 if(!showFirstCrewConflict(s,next))beep(result.correct?740:220);
}
function closeCare(){
 const shouldTeach=!!careOutcome?.tutorialUnlock;
 setCareDialog(null);setCareOutcome(null);setCareHint(false);setCareTask(null);
 if(shouldTeach)dialogue([
  {speaker:'EVE',text:'첫 관찰 기록을 저장했습니다. 이 단계에서는 제가 잘못된 판단을 교정했으며, 개체의 상태는 안전하게 보존되었습니다.'},
  {speaker:'관리자',text:'이제 뭘 하면 되는데?'},
  {speaker:'EVE',text:'상단 「공명 연구」로 이동해 노란색 「행동 강령 동기화」를 누르세요. 세 가지 질문에 답하면 이번 실습은 한 번에 공명 100%가 됩니다. 이후 분석실에서 이송 절차를 안내하겠습니다.'}
 ]);
}
function doQuickCare(id:AnimalId,kind:CareAction){
 if(!s)return;
 const next=quickCare(s,id,kind) as V10;
 if(next===s){setRunFeedback('숙련 돌봄을 실행할 수 없습니다. 행동력이나 소모 자원을 확인하세요.');return;}
 noteCare(next,id,CARE_ACTIONS[kind].title,'검증된 돌봄 루틴',true,'이전에 확인한 반응에 따라 안전하게 돌봄을 진행했습니다.');
 if(kind==='heal'||kind==='feed')applyCrewOpinion(next,'treatment','treat');
 setS(next);report(s,next,'숙련 돌봄 완료');setRunFeedback(`${next.animals.find(a=>a.id===id)?.name||'개체'}에게 기록된 돌봄 절차를 적용했습니다.`);if(!showFirstCrewConflict(s,next))beep(580);
}
function toggleRoutine(id:AnimalId){
 if(!s)return;const animal=s.animals.find(a=>a.id===id&&a.alive);if(!animal||careMastery(animal,'feed')<2||careMastery(animal,'comfort')<2)return;
 setS({...s,animals:s.animals.map(a=>a.id===id?{...a,careRoutine:!a.careRoutine}:a)});
 setRunFeedback(animal.careRoutine?'야간 안정 루틴을 해제했습니다.':'야간 안정 루틴을 설정했습니다. 매일 기본 급식이 공급되는 경우 유대 +2, 스트레스 -4가 적용됩니다.');
}
function protocolRequirements(id:string){
 const a=s?.animals.find(x=>x.id===id&&x.alive);
 const guided=!!s&&id==='rabbit'&&s.tutorialStep===5&&!s.headquarters?.firstReport;
 return [
  {label:'보호 개체',value:a?'격리실 배정됨':'격리실에 없음',ok:!!a,go:'animals'},
  {label:'행동 관찰',value:`${a?.records??0} / 1회`,ok:!!a&&(guided||a.records>=1),go:'animals'},
  {label:'유대',value:`${a?.bond??0} / 20`,ok:!!a&&(guided||a.bond>=20),go:'animals'},
  {label:'스트레스',value:`${a?.stress??0} / 78 이하`,ok:!!a&&(guided||a.stress<=78),go:'animals'},
  {label:'건강',value:`${a?.hp??0} / 35 이상`,ok:!!a&&(guided||a.hp>=35),go:'animals'},
  {label:'행동력',value:`${s?.ap??0} / 2`,ok:!!s&&(guided||s.ap>=2),go:'hub'},
  {label:'시설 전력',value:`${s?.power??0} / 7`,ok:!!s&&(guided||s.power>=7),go:'supplies'},
  {label:'격리 상태',value:s?.security.escapedIds.includes(id as AnimalId)?'이탈 중':'안전',ok:!!s&&!s.security.escapedIds.includes(id as AnimalId),go:'cctv'},
 ];
}
function protocolReady(id:string){return protocolRequirements(id).every(x=>x.ok)}
function openProtocol(id:string){
 if(!s)return;
 if(s.tutorialStep===5&&s.animals.some(a=>a.id==='rabbit'&&a.tutorialProtected&&a.alive)&&id!=='rabbit'){
  setRunFeedback('EVE: 먼저 첫 토끼의 공명 실습을 완료하십시오. 다른 개체 연구는 그 후에 진행합니다.');return;
 }
 setSelectedAnimal(id);
 if(!protocolReady(id)){
  const missing=protocolRequirements(id).filter(x=>!x.ok).map(x=>x.label).join(' · ');
  setRunFeedback(`동기화 준비가 필요합니다: ${missing}. 격리실에서 개체를 관리해 주세요.`);
  setProtocolFeedback('');
  setMemoryTarget(null);
  return;
 }
 setPendingProtocol(null);setMemoryTarget(id);setProtocolStep(0);setProtocolErrors(0);setProtocolAnswers([]);if(id==='rabbit'&&s.tutorialStep===5&&!s.headquarters?.firstReport)setExtractMode('gentle');
 setProtocolFeedback('준비 완료. 관찰 기록을 바탕으로 세 단계의 행동 강령을 판단하세요.');
}
function protocolAnswer(chosen:number,calibrationQuality=1){if(!s||!memoryTarget)return;const target=s.animals.find(a=>a.id===memoryTarget&&a.alive);const guided=s.tutorialStep===5&&memoryTarget==='rabbit'&&!s.headquarters?.firstReport;const missing=[!target?'개체가 격리실에 없습니다.':null,!guided&&target&&target.records<1?'행동 관찰 1회 필요':null,!guided&&target&&target.bond<20?'유대 20 이상 필요':null,!guided&&target&&target.stress>78?'스트레스 78 이하 필요':null,!guided&&target&&target.hp<35?'건강 35 이상 필요':null,!guided&&s.ap<2?'행동력 2 필요':null,!guided&&s.power<7?'전력 7% 필요':null].filter(Boolean);if(missing.length){setProtocolFeedback('동기화 불가: '+missing.join(' · '));beep(200);return}const protocol=protocols[memoryTarget as AnimalId];const stage=protocol.steps[protocolStep];if(!stage)return;const offset=(memoryTarget.length+protocolStep*2)%3;const correct=(stage.correct+offset)%3;const mistakes=protocolErrors+(chosen===correct?0:1)+(!guided&&calibrationQuality<.34?1:0);
 const stageStep={stage:protocolStep+1,prompt:stage.prompt,chosen:stage.choices[(chosen-offset+3)%3],expected:stage.choices[stage.correct],matched:chosen===correct};
 const allAnswers=[...protocolAnswers,stageStep];setProtocolAnswers(allAnswers);setProtocolErrors(mistakes);setProtocolFeedback(s.tutorialStep===5&&memoryTarget==='rabbit'&&!s.headquarters?.firstReport?(chosen===correct?'EVE: 반응이 일치합니다. 다음 기록을 확인하십시오.':'EVE: 지금 판단에는 오류가 있습니다. 초기 실습이므로 제가 올바른 기록으로 교정했습니다. 다음 단계로 진행하십시오.'):'반응을 기록했습니다. 공명 판정은 세 단계를 마친 뒤 확인됩니다.');beep(470)
 if(protocolStep<2){setProtocolStep(x=>x+1);return}
 const firstRabbit=s.tutorialStep===5&&memoryTarget==='rabbit'&&!s.headquarters?.firstReport;
 const quality=firstRabbit?100:mistakes===0?95:mistakes===1?75:mistakes===2?40:10;
 const baseline=firstRabbit?structuredClone(s) as V10:s;
 if(firstRabbit){
  const rabbit=baseline.animals.find(a=>a.id==='rabbit'&&a.alive);
  if(rabbit){rabbit.tutorialProtected=true;rabbit.hp=Math.max(90,rabbit.hp);rabbit.stress=Math.min(18,rabbit.stress);rabbit.bond=Math.max(34,rabbit.bond);rabbit.records=Math.max(1,rabbit.records);rabbit.contamination=0;rabbit.sickness=0;rabbit.mutated=false;rabbit.awakened=false;}
  baseline.ap=Math.max(2,baseline.ap);baseline.power=Math.max(7,baseline.power);
 }
 const n=extract(baseline,memoryTarget as AnimalId,quality,firstRabbit?'gentle':extractMode);
 if(n===baseline){setProtocolFeedback('동기화 불가: 개체 격리 여부와 현재 상황을 점검하세요.');return}
 // A one-time guided lesson: the novice may choose incorrectly, EVE corrects the archive, and the rabbit reaches 100%.
 if(firstRabbit){const rescuedRabbit=n.animals.find(a=>a.id==='rabbit'&&a.alive);if(rescuedRabbit)rescuedRabbit.memory=100;}
 const completed=registerFullResonance(s,n as V10,memoryTarget as AnimalId);
 if(firstRabbit){
  completed.tutorialArchiveReviewPending=true;
  completed.lastOutcome='EVE 초기 실습 교정 완료. 첫 토끼 공명 100%. 본부 통신에서 생체 인계를 결정하십시오. 기존 기록은 분석실에 보관됩니다.';
 }
 if(extractMode==='force'&&!firstRabbit){crewDissectionShock(completed);applyCrewOpinion(completed,'disposal','dispose');}
 recordProtocolAttempt(completed,memoryTarget as AnimalId,{day:completed.day,quality,mode:firstRabbit?'gentle':extractMode,result:firstRabbit?`튜토리얼: ${mistakes}개 오판을 EVE가 교정 · 공명 100%`:completed.lastOutcome||'판정 완료',steps:allAnswers});
 recordSpecimen(completed,memoryTarget as AnimalId,'행동 강령 공명 연구',firstRabbit?`첫 실습: ${3-mistakes}/3회 직접 일치 · EVE 교정 ${mistakes}회. 공명 100% 달성. 분석실에 모든 원본 선택을 남겼습니다.`:`적절한 판단 ${3-mistakes}/3회 · 공명 정확도 ${quality}점. 단계별 선택과 결과는 분석실의 동기화 이력에 영구 보관했습니다.`,'research');
 const firstResearch=s.tutorialStep===5;if(firstResearch)completed.tutorialStep=6;
 setS(completed);setMemoryTarget(null);
 if(firstRabbit){
  setRewardReport(null);setResult(null);setTab('hq');
  dialogue([{speaker:'EVE',text:`실습 기록을 검증했습니다. ${mistakes}건의 오판은 제가 정정했습니다. 다음부터는 스스로 판단하셔야 합니다.`},{speaker:'관리자',text:'잠깐, 제 선택 중 몇 개가 틀렸다고? 교정한 기록까지 연구 결과로 쓰는 거야?'},{speaker:'EVE',text:'첫 토끼의 기억 공명이 100%에 도달했습니다. 본부 통신 메뉴에서 생체 이송을 결정하십시오. 이송한 개체의 모든 관찰 기록은 분석실에서 다시 볼 수 있습니다. 지정된 개체를 건강한 상태로 생체 인계하면 다음 날부터 본부 인력이 한 명씩 배치됩니다.'}]);
 }else{report(s,completed,'행동 강령 동기화 결과');setResult({success:quality>=65,title:'행동 강령 동기화 '+(quality>=65?'성공':'불일치'),text:completed.lastOutcome||n.logs[0]?.text||''});}
 if(firstResearch&&!completed.headquarters.pendingAnimal&&!firstRabbit)dialogue([...tutorialScenes.research,{speaker:'EVE',text:'실험 데이터를 축적하려면 시설 보수가 필요합니다. 탐사 현장에서 회수한 고철은 오래된 카메라와 배양 장비의 회로를 복구하는 데 쓰입니다. 보급실의 시설 복구 항목을 확인하십시오.'},{speaker:'관리자',text:'이제 와서 고철까지 모아야 한다고? ...알았어. 쓸모가 있다면 모아야지.'}]);
 if(completed.headquarters.pendingAnimal && completed.headquarters.pendingAnimal!==s.headquarters?.pendingAnimal){
 const first=!s.headquarters?.firstReport;
 if(!firstRabbit)dialogue(first?[{speaker:'EVE',text:'관리자님, 첫 번째 개체의 공명도가 100%에 도달했습니다. 해당 개체의 본부 이송을 요청하겠습니다.'},{speaker:'관리자',text:'...본부? 본부도 있어? 여기 우리 둘밖에 없는 거 아니었어?'},{speaker:'EVE',text:'죄송합니다. 해당 사항은 접근 제한 정보입니다. 더 이상 알려드릴 수 없습니다.'},{speaker:'관리자',text:'뭘 숨기는 거야. 아니, 저 녀석을 대체 어디로 보내겠다는 건데?'}]:[{speaker:'EVE',text:'개체의 공명이 완료되었습니다. 외부 본부에서 인계 요청이 도착했습니다.'},{speaker:'관리자',text:'또 본부야? ...이번에도 설명 안 할 거지.'}]);
 }
 beep(quality>=65?780:210)
}
const rescuedCount=s?.animals.filter(a=>a.alive).length??0;
const tutorialStep=s?.tutorialStep??7;
const dayEndBlocker=s?getDayEndBlocker(s):null;
const tabUnlocked=(id:Tab):boolean=>tabLockReason(s,id)===null;
const unlockHint=(id:Tab):string=>tabLockReason(s,id)??'';
const fuseState=s?getNightCircuitState(s):null;
const nightFuseOrder=fuseState?.order??[];
const nightFuseFaults=fuseState?.faults??0;
const securityAlert=!!s&&(!!s.security?.incident||!!s.horror?.pending||!!s.voice?.pending||canTrackCat(s)||s.originZero?.cat==='traced');
const nightPreview=s?previewNight(s,guidedNight?'shield':nightChoice,{guided:guidedNight,maintained:!!fuseState?.completed&&nightFuseFaults<3}):null;
const openDayEnd=()=>{
 if(!s)return;
 const blocker=getDayEndBlocker(s);
 if(blocker){setLockNotice(blocker.message);setRunFeedback(blocker.message);if(tabLockReason(s,blocker.tab)===null)enterTab(blocker.tab);return;}
 setLockNotice('');nightCommitRef.current=false;setNightView(true);
};
const enterTab=(id:Tab)=>{
 if(!tabUnlocked(id)){setLockNotice(unlockHint(id));setRunFeedback(unlockHint(id));return;}
 setLockNotice('');setTab(id);setNightView(false);
 if(!s)return;
 if(id==='cctv'&&!s.onboardingSeen?.includes('cctv')){
  setS({...s,onboardingSeen:[...(s.onboardingSeen??[]),'cctv'],tutorialStep:s.tutorialStep===8?9:s.tutorialStep});
  dialogue([{speaker:'EVE',text:'감시망 첫 연결입니다. 카메라를 전환하면 외곽과 격리동 상태가 표시됩니다. 빨간 경보가 뜨면 오른쪽의 사건 정보부터 확인하세요.'},{speaker:'관리자',text:'경고가 뜬다고 무조건 공격하거나 봉쇄할 필요는 없겠지?'},{speaker:'EVE',text:'그렇습니다. 이상 행동은 음성 교감, 격리문 봉쇄, 직접 진정 중에 선택할 수 있습니다. 조치마다 전력·AP·정신력 소모량이 다릅니다. 탈출이 발생하면 먼저 경로 추적, 이후 재격리 또는 방생을 결정하세요.'}]);
 }else if(id==='cctv'&&s.tutorialStep===8){setS({...s,tutorialStep:9});dialogue([{speaker:'EVE',text:'감시망 점검을 완료했습니다. 이제 기초 실습을 마치고 자유 운영을 시작합니다.'}])}
};
type TourSpot={target:string;top:number;left:number;right:number;bottom:number;width:number;height:number;captionTop:number;captionLeft:number};
const [tourSpot,setTourSpot]=useState<TourSpot|null>(null);
const [tourPaused,setTourPaused]=useState(false);
const tutorialMissions=['의식 회복 중','첫 신호 추적 · 현장 탐사로 이동','현장 조사 · 상황별 대응 후 귀환','동물 발견 시 구조, 실패했다면 재탐사','격리실 · 첫 토끼 행동 관찰','기억 연구 · 첫 토끼 공명 100% 실습','본부 인계 · 다음 날 의무관 합류','병리·검시실 복구','감시망 점검 · CCTV 열기','보존구역 자유 운영'];
const firstMission=tutorialMissions[Math.min(9,tutorialStep)];
const visibleTourTargets=['hq-transfer','night-end','first-signal','region','launch','run-choice','hunt-tools','hunt-decode','observe','animal-room','research-target','archive-transfer','workshop','emergency-recharge','cctv-tab','rescue'];
function focusTutorial(target:string){if(!visibleTourTargets.includes(target))return;const el=document.querySelector<HTMLElement>(`[data-tour="${target}"]`);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});el.classList.remove('v46-tour-arrival');void el.offsetWidth;el.classList.add('v46-tour-arrival');}

const tourGuide=(!s||tutorialStep>=9||guideDismissed||careDialog)?null:(():{target:string;title:string;body:string;nav?:Tab}=>{
 if(tutorialStep===1)return tab==='hub'?{target:'first-signal',title:'01 · 첫 신호 추적',body:'노란색으로 강조된 버튼을 누르면 탐사 화면으로 이동합니다. 기능은 실제 임무를 수행하면서 해금됩니다.'}:tab==='expedition'&&gearPreview?{target:'launch',title:'01 · 출동 준비 완료',body:'장비를 확인했다면 노란 출동 버튼을 누르세요. 전력이 부족하면 손전등 수동 수색을 고려할 수 있습니다.'}:{target:'region',title:'01 · 조사 구역 선택',body:'현재 갈 수 있는 구역을 선택하세요. 각 카드에 위험도, 예상 보상, 발견 가능한 동물이 표시됩니다.'};
 if(tutorialStep===2)return {target:s.capture?.hunt?'hunt-tools':'run-choice',title:'02 · 전장 수색',body:'조사할 칸 하나를 골라 풀숲을 젖히세요. 발자국은 지난 턴의 위치, 흔들린 풀은 그 주변 1칸을 뜻합니다. 개체는 미수색 칸을 우선하며, 보이는 개체를 다시 클릭하면 그물을 던집니다. 위 상태창은 고정된 채로 유지됩니다.',nav:'expedition'};
 if(tutorialStep===3)return s.pending?{target:'rescue',title:'03 · 동물 확보',body:'구조 성공 여부는 확률로 결정됩니다. 성공하면 격리실이 열리고, 실패했다면 다음 탐사에서 재도전할 수 있습니다.'}:{target:'first-signal',title:'03 · 다시 구조 신호 추적',body:'탐사로 돌아가 동물을 찾으세요. 구조에 성공해야 격리실 관리가 해금됩니다.',nav:'hub'};
 if(tutorialStep===4&&s.run&&s.field)return {target:s.capture?.hunt?'hunt-tools':'run-choice',title:'04 · 구조 완료 · 탐사 계속',body:'개체는 안전하게 격리실로 이송되었습니다. 현장에 남아 보급품과 단서를 더 찾거나 철수해 전체 보상 정산을 확인한 뒤 격리실에서 행동 관찰을 시작하세요.',nav:'expedition'};
 if(tutorialStep===4)return {target:s.animals.some(a=>a.id===selectedAnimal)?'observe':'animal-room',title:'04 · 행동 관찰과 돌봄',body:s.animals.some(a=>a.id===selectedAnimal)?'첫 토끼의 유대는 26으로 준비됐습니다. 「행동 관찰」을 눌러 4지선다 대응을 선택하면 연구실이 해금됩니다.':'격리실에서 보호 개체를 먼저 선택하세요. 개체 건강과 스트레스, 유대를 확인한 뒤 행동 관찰을 진행합니다.',nav:'animals'};
 if(tutorialStep===5)return {target:'research-target',title:'05 · 첫 토끼 공명 실습',body:'노란 동기화 버튼을 눌러 3단계 질문에 답하세요. 이번 한 번은 EVE가 실수를 교정하고 공명 100%를 보장합니다.',nav:'research'};
 if(tutorialStep===6&&s.headquarters?.transferred.includes('rabbit')&&!(s.onboardingSeen??[]).includes('first-night-defense'))return {target:'night-end',title:'06 · 첫날 야간 경비 · 다음 날 직원 도착',body:'첫 토끼의 본부 이송이 완료되었습니다. 하루 종료 후 다음 날 의무관이 도착합니다. 이번 첫 야간은 EVE가 예비 전력으로 방어를 보조합니다.',nav:'hub'};
 if(tutorialStep===6&&s.day>1&&s.power<24&&s.ap>0&&s.parts>0&&!s.facilities?.cctv)return {target:'emergency-recharge',title:'06 · CCTV 복구 전 전력 보충',body:'감시망을 복구할 전력이 부족합니다. 중앙 화면의 노란 「전력 보충」을 눌러 부품 1개와 행동력 1로 전력을 확보하십시오.',nav:'hub'};
 if(tutorialStep===6)return s.tutorialArchiveReviewPending&&s.headquarters?.pendingAnimal==='rabbit'?{target:'hq-transfer',title:'06 · 본부 통신으로 생체 인계',body:'상단의 본부 통신 메뉴를 누르고 첫 개체를 인계하세요. 동물의 모든 관찰 기록은 분석실에 남습니다.',nav:'hq'}:{target:'workshop',title:'06 · 감시망 복구와 운영 준비',body:'고철 6 · 부품 1 · 전력 6으로 CCTV를 복구하세요. 중앙의 추가 작업에서는 휴식으로 정신력 회복, 수동 발전으로 전력 확보, 제독으로 감염 감소가 가능합니다.',nav:'supplies'};
 if(tutorialStep===7&&(s.scrap<9||s.parts<2))return {target:'region',title:'07 · 복구 자원 확보',body:'병리실을 복구할 자재가 부족합니다. 탐사에서 보급 상자를 조사하고 정식 귀환하세요. 초기 실습 중에는 AP가 남으면 다시 출동할 수 있습니다.',nav:'expedition'};
 if(tutorialStep===7)return {target:'workshop',title:'07 · 병리·검시실 복구',body:'보급실에서 고철 9 · 부품 2 · 전력 10으로 병리 장비를 복구하세요. 생존 개체는 안전 검사를, 사망 개체는 사후 검시를 할 수 있습니다.',nav:'supplies'};
 return {target:'cctv-tab',title:'08 · CCTV 대응 체험',body:'CCTV에 들어가면 EVE가 첫 사용법을 안내합니다. 이상 경보는 음성 교감·봉쇄·진정, 탈출은 추적 후 재격리로 대응하세요.',nav:'cctv'};
})();
const tourTarget=tourGuide?.target;
useEffect(()=>{
 guideFocus.current?.classList.remove('echo-tour-focus');
 guideFocus.current=null;
 if(!tourTarget||talk.length||awakening||result||nightView||memoryTarget||s?.pending||s?.pendingIncident||s?.headquarters?.pendingScene||confirmRestart||inspect)return;
 const element=document.querySelector<HTMLElement>(`[data-tour="${tourTarget}"]`);
 if(!element)return;
 element.classList.add('echo-tour-focus');
 guideFocus.current=element;
 const timer=window.setTimeout(()=>element.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'}),150);
 return()=>{
  window.clearTimeout(timer);
  element.classList.remove('echo-tour-focus');
  if(guideFocus.current===element)guideFocus.current=null;
 };
},[tourTarget,tab,talk.length,awakening,result,nightView,memoryTarget,s?.pending,s?.pendingIncident,s?.headquarters?.pendingScene,confirmRestart,inspect]);

// The tutorial spotlight is drawn as four fixed panes surrounding the real clickable target.
// This avoids z-index and overflow bugs from scaling nested in-game panels.
const tourSpotActive=!!(tourGuide&&!s?.run&&!tourPaused&&!talk.length&&!awakening&&!result&&!nightView&&!memoryTarget&&!s?.pending&&!s?.pendingIncident&&!s?.headquarters?.pendingScene&&!confirmRestart&&!inspect&&!careDialog&&!fieldRewardModal);
useEffect(()=>{setTourPaused(false)},[s?.tutorialStep,tourGuide?.target]);
useEffect(()=>{
 if(!tourSpotActive||!tourTarget){setTourSpot(null);return;}
 const target=tourTarget;
 const node=document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
 if(!node){setTourSpot(null);return;}
 let frame=0;
 const refresh=()=>{
  if(frame)window.cancelAnimationFrame(frame);
  frame=window.requestAnimationFrame(()=>{
   if(!node.isConnected){setTourSpot(null);return;}
   const bounds=node.getBoundingClientRect();
   const w=window.innerWidth,h=window.innerHeight;
   if(bounds.width<3||bounds.height<3||bounds.bottom<0||bounds.top>h){setTourSpot(null);return;}
   const left=Math.max(4,bounds.left-10),top=Math.max(4,bounds.top-9);
   const right=Math.min(w-4,bounds.right+10),bottom=Math.min(h-4,bounds.bottom+9);
   const captionTop=top>168?Math.max(12,top-132):Math.min(h-144,bottom+15);
   const captionLeft=Math.max(12,Math.min(w-340,left));
   const next={target,top,left,right,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top),captionTop,captionLeft};
   setTourSpot(old=>old&&old.target===target&&Math.abs(old.top-top)<2&&Math.abs(old.left-left)<2&&Math.abs(old.bottom-bottom)<2&&Math.abs(old.right-right)<2?old:next);
  });
 };
 refresh();
 const delayed=window.setTimeout(refresh,380);
 window.addEventListener('resize',refresh);
 window.addEventListener('scroll',refresh,true);
 const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(refresh):null;
 observer?.observe(node);
 return()=>{window.clearTimeout(delayed);if(frame)window.cancelAnimationFrame(frame);window.removeEventListener('resize',refresh);window.removeEventListener('scroll',refresh,true);observer?.disconnect()};
},[tourSpotActive,tourTarget,tab,s?.tutorialStep,s?.run,s?.capture,s?.pending]);
// Branch-specific EVE briefings. Saved on the game state so reloads do not repeat them.
const onboardingBusy=!!(s?.hqOrders?.active?.status==='offered'||s?.voice?.pending||talk.length||cinematic||awakening||result||aftermath||nightView||inspect||memoryTarget||careDialog||captureReveal||fieldRewardModal||s?.pending||s?.pendingIncident||s?.headquarters?.pendingScene||s?.headquarters?.pendingAnimal||s?.crew?.pendingTermination||s?.crew?.pendingNightVote||confirmRestart);
useEffect(()=>{
 if(!ready||!s||onboardingBusy||s.phase!=='day')return;
 const seen=s.onboardingSeen??[];
 let key:string|null=null;let lines:Talk[]=[];
 if(s.security.escapedIds.length>0&&!seen.includes('escape')){
  key='escape';lines=[{speaker:'EVE',text:'격리 이탈을 감지했습니다. 먼저 CCTV로 전환하여 탈출한 개체의 마지막 카메라를 확인하십시오.'},{speaker:'관리자',text:'바로 잡으러 나가면 되는 거 아니야?'},{speaker:'EVE',text:'경로 추적 전에는 재격리 명령이 비활성입니다. 전력 9와 AP 1로 CCTV 경로 추적, 또는 정전 시 정신력 3과 AP 1을 소모해 직접 추적할 수 있습니다. 추적 후 치료제와 AP로 케이지에 재격리하거나, 변이체라면 억제 주사를 사용할 수 있습니다.'}];
 }else if(s.animals.some(a=>a.alive&&isMutant(a))&&!seen.includes('mutation')){
  key='mutation';lines=[{speaker:'EVE',text:'신경 변이가 발현됐습니다. 일반 치료나 급식만으로 이전 모습으로 돌아오지 않습니다.'},{speaker:'관리자',text:'그럼 격리실에 그냥 두면 어떻게 되지?'},{speaker:'EVE',text:'격리실에서 이탈 위험 지수를 확인하십시오. 시설 보강과 CCTV 방어가 중요합니다. 전용 억제 주사는 일정 기간 이탈 위험을 낮추지만, 완전한 치료는 아닙니다. 방치하면 격리 파손과 탈출 경보가 발생할 수 있습니다.'}];
 }else if(s.power<16&&s.tutorialStep<9&&!s.run&&!seen.includes('low-power')){
  key='low-power';lines=[{speaker:'EVE',text:'전력 부족 경고. 출동이나 시설 복구가 막혔다면 중앙 화면의 「긴급 작업 → 수동 발전」을 확인하십시오. 정신력을 소모해 전력을 얻으며, 부품이 있으면 전력 보충도 가능합니다.'},{speaker:'관리자',text:'전력은 돌아오는데 내가 다치잖아.'},{speaker:'EVE',text:'맞습니다. 의무관이 있다면 직원 명단에서 치료·상담으로 회복을 지원받을 수 있습니다. 정신력이 낮으면 무리하게 발전하지 마십시오.'}];
 }else if(s.ap===0&&s.tutorialStep<9&&!s.run&&!seen.includes('ap-empty')){
  key='ap-empty';lines=[{speaker:'EVE',text:'오늘의 행동력이 모두 소진됐습니다. AP는 중앙 관제의 하루 종료 버튼으로 다음 날이 되면 다시 채워집니다. 저녁 경비를 선택할 때 전력과 외부 위협도 확인하십시오.'},{speaker:'관리자',text:'발전할 전력도 없다면 어떻게 해?'},{speaker:'EVE',text:'중앙 관제 「긴급 작업」의 수동 발전은 정신력을 소모해 전력을 복구합니다. 휴식은 정신력을 회복합니다. 보급실에서는 부품과 필터를 조달할 수 있습니다. 행동력 0이면 먼저 하루를 종료하십시오.'}];
 }else if(s.tutorialStep>=6&&tab==='hub'&&!seen.includes('base-work')){
  key='base-work';lines=[{speaker:'EVE',text:'시설 운영에도 선택지가 있습니다. 중앙 관제의 추가 작업은 AP를 사용해 진행합니다. 휴식은 정신력을 회복하고, 수동 발전은 정신력을 소모하여 전력을 확보합니다.'},{speaker:'EVE',text:'손수 수색은 숨은 전지를 찾는 방법이며, 제독실 가동은 필터를 소모해 시설 감염도를 낮춥니다. 자원은 보급실에서 구입하거나 탐사에서 회수할 수 있습니다. 각 버튼에는 소모량과 기대 효과가 함께 표기됩니다.'}];
 }
 if(key){const seenKey=key;setS(prev=>prev&&prev===s?{...prev,onboardingSeen:[...seen,seenKey]}:prev);dialogue(lines)}
},[s,ready,tab,onboardingBusy]);
const current=talk[talkIdx];const artAnimal=s?.animals.find(a=>a.id===selectedAnimal&&a.alive);const ownedWings=containmentWings(s?.rooms??0);const activeWing=artAnimal?roomWing(artAnimal.room):ownedWings.includes(wing)?wing:ownedWings[0]??'A';const availableCameras=cameras(s?.rooms??0);const freeRooms=s?Array.from({length:s.rooms},(_,i)=>i+1).filter(room=>!s.animals.some(a=>a.alive&&a.room===room)):[];const chosenRoom=rescueRoom!==null&&freeRooms.includes(rescueRoom)?rescueRoom:freeRooms[0];const region=regions.find(r=>r.id===selectedRegion)!;const canAuto=!!s&&selectedGear.includes('scanner')&&s.power>=region.power+8;const canManual=!!s&&selectedGear.includes('flashlight')&&!selectedGear.includes('scanner')&&s.flashlight>=25;const live=s?.animals.filter(a=>a.alive)||[];const nextIncident=s?.pendingIncident?incidentDefs[s.pendingIncident]:null;
if(!ready)return <div className="v10-loading">ARK SYSTEM / CONNECTING ...</div>;
if(!s)return <div className="v10-intro v44-intro v46-intro" style={{backgroundImage:`linear-gradient(90deg,#070912bd,#10101ba9),url(${img('hero-gate')})`}}>
 <div className="intro-panel v44-start-panel v46-start-panel">
  <div className="v46-intro-top"><span>ARK / BIO-CONTAINMENT FACILITY</span><span><i/> TERMINAL ONLINE · 2089</span></div>
  {introStage==='welcome'?<OpeningScene onStart={()=>setCinematic('eve')}/>:introStage==='dialogue'?<div className="v46-intro-standby"><Radio size={24}/><h2>암호화된 기록 복원 중</h2><p>운영 안내 / EVE</p></div>:
   <div className="v44-start-choice v46-start-choice"><div className="v46-choose-heading"><div><span className="v46-intro-index">ARK / STARTING SUPPORT</span><h1>어디에서 깨어났습니까?</h1><p>EVE의 통신 기록을 확인했습니다. 출발 구역 <b>세 곳 중 하나</b>를 선택하십시오. 모든 효과는 실제 플레이에 적용됩니다.</p></div><div className="v46-choice-micro">SELECT ONE <strong>{String(['generator','station','observatory'].indexOf(start)+1).padStart(2,'0')} / 03</strong></div></div>
    <div className="v44-start-options v46-start-options">{starts.filter(st=>st.id==='generator'||st.id==='station'||st.id==='observatory').map((st,i)=><button key={st.id} type="button" aria-pressed={start===st.id} className={start===st.id?'selected':''} onClick={()=>setStart(st.id)}><div className="v46-route-art ark-start-slot" data-sector={st.id}><ArtSlot src={gameplayArt.start(st.id)}/><span>SECTOR / 0{i+1}</span><div>{st.id==='generator'?<Zap size={32}/>:st.id==='station'?<Compass size={32}/>:<Eye size={32}/>}<small>{st.id==='generator'?'POWER STATION':st.id==='station'?'TRANSIT TERMINAL':'OBSERVATION POST'}</small><em>전용 CG 미등록</em></div></div><div className="v46-route-body"><span className="v46-route-type">{st.category}</span><b>{st.title}</b><p>{st.desc}</p><strong>{st.bonus}</strong><small>{st.detail}</small></div><span className="v46-route-select">{start===st.id?'선택 완료':'선택하기'} <ChevronRight size={13}/></span></button>)}</div>
    <div className="v44-choice-confirm v46-choice-confirm"><span>현재 배정 <b>{starts.find(st=>st.id===start)?.title} · {starts.find(st=>st.id===start)?.bonus}</b></span><button className="v10-primary" onClick={playStart}>선택 확정 · 동물원 진입 <ChevronRight size={17}/></button></div>
   </div>}
 </div>
 {introStage==='dialogue'&&talk[talkIdx]&&!cinematic&&<StoryConversation intro lines={talk} index={talkIdx} shown={letters} previousTalk={previousTalk} advanceTalk={advanceTalk} revealTalk={revealTalk} skipTalk={skipTalk} speed={talkSpeed} onSpeed={setTalkSpeed}/>}
 {cinematic&&<CinematicScene key={cinematic} kind={cinematic} onFinish={finishCinematic}/>}
 </div>;
return <div className={"v10-shell"+(tab==='expedition'&&!!s.run?" is-field-active":"")}><aside className="v10-sidebar v43-sidebar" aria-label="담당자 상태 요약">
 <div className="v10-logo v43-brand"><span>ARKtopia</span><small>ORIGIN ZERO</small></div>
 <div className="v10-day v43-day"><b>DAY {String(s.day).padStart(3,'0')}</b><small>● {s.phase==='day'?'운영 중':'기록 중'}</small></div><section className="origin-mission-chip"><span>PRIMARY DIRECTIVE</span><b>{!s.originZero?.firstPositiveDay?'M-00 회수 · 외형 불명':!s.originZero.route?'M-00 신원 확인 · 처리 결정':s.originZero.photos<12?'기밀 기록 복원 · '+s.originZero.photos+'/12':'ARK RECALL · 비교 연구'}</b></section>
 <section className="v43-operator-card" aria-label="담당자 상태">
  <div className="v43-operator-head"><img src={characterPortrait("protagonist",characterMood(s,"protagonist"))} alt="담당자 000"/><div><span className="v43-eyebrow">ARK / OPERATOR</span><b>담당자 000</b><VitalChip tone={subjectVital(s.mind,s.infection,s.mind)}/></div></div>
  <div className={'v41-operator-ap v43-ap '+(s.ap<=1?'is-low':'')} role="status" aria-label={`남은 일일 행동력 ${s.ap} / ${s.start==='station'&&(!s.startBenefits||s.day<=2)?5:4}`}>
   <div className="v41-ap-title"><span><Zap size={15}/> 행동력</span><strong><b>{s.ap}</b> <small>/ {s.start==='station'&&(!s.startBenefits||s.day<=2)?5:4} AP</small></strong></div>
   <div className="v41-ap-slots" aria-hidden="true">{Array.from({length:s.start==='station'&&(!s.startBenefits||s.day<=2)?5:4},(_,i)=><i key={i} className={i<s.ap?'charged':''}/>)}</div>
   <small>하루 작업 횟수 · 종료 시 회복</small>
  </div>
  <div className="v61-operator-vitals" aria-label="관리자 정신력과 오염도">
   <div className={'v61-vital-row '+(s.mind<=30?'is-critical':'')}>
    <div className="v61-vital-label"><span><Brain size={13}/> 정신력</span><strong>{Math.round(s.mind)}<small>/100</small></strong></div>
    <div className="v61-meter" role="progressbar" aria-label="관리자 정신력" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(s.mind)}><i style={{width:`${cap(s.mind)}%`,background:'#dba0cc'}}/></div>
   </div>
   <div className={'v61-vital-row v61-infection '+(s.infection>=50?'is-critical':'')}>
    <div className="v61-vital-label"><span><AlertTriangle size={12}/> 오염도</span><strong>{Math.round(s.infection)}<small>%</small></strong></div>
    <div className="v61-meter" role="progressbar" aria-label="시설 오염도" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(s.infection)}><i style={{width:`${cap(s.infection)}%`,background:s.infection>=50?'#eb8296':'#d5a975'}}/></div>
   </div>
  </div>
 </section>
 <div className="v43-eve-line" title="EVE 통신 단말 연결 상태"><img src={characterPortrait("eve",characterMood(s,"eve"))} alt="EVE"/><span><b>EVE 코어 <strong>{s.eve}%</strong></b><Bar v={s.eve} color="#7de3e7"/></span><VitalChip tone={eveVital(s.eve)} compact/></div>
 <CrewRoster state={s} onReplayArrival={id=>{setTalk([]);setCinematic(id);beep(420)}} onTalk={id=>{const next=shareCrewMemory(s,id);setS(next.state);if(next.state!==s){report(s,next.state,'직원 대화 결과');setRunFeedback(next.state.lastOutcome)}if(next.lines.length)dialogue(next.lines);beep(400)}} onSupport={id=>{const next=crewSupport(s,id);if(next===s)return;setS(next);report(s,next,'직원 지원 결과');setRunFeedback(next.lastOutcome);beep(550)}} onTreat={(id,kind)=>{if(kind==='medical'){if(operationAllowed(s,'medical',id))setOperation({mode:'medical',id});else setRunFeedback('치료 자원 또는 직원 상태를 확인하세요.');return;}const next=treatCrew(s,id,kind);if(next===s)return;setS(next);report(s,next,'직원 상담 결과');setRunFeedback(next.lastOutcome);beep(550)}}/>
 {s.horror?.pending&&<button className="v43-side-alert" onClick={()=>{setCamera(s.horror!.pending!.camera);enterTab('cctv')}}><AlertTriangle size={14}/><span>미확인 관제 기록 · {s.horror.pending.title}</span><ChevronRight size={14}/></button>}
{s.security.incident&&<button className="v43-side-alert" onClick={()=>{setCamera(s.security.incident!.camera);enterTab('cctv')}}><AlertTriangle size={14}/><span>격리 이상 신호 · CCTV 확인</span><ChevronRight size={14}/></button>}
</aside>
{tourGuide&&tourSpotActive&&tourSpot&&tourSpot.target===tourGuide.target&&<div className="v61-tour-overlay" aria-label={`EVE 튜토리얼: ${tourGuide.title}`}>
 <div className="v61-tour-dim" style={{left:0,top:0,right:0,height:tourSpot.top}}/>
 <div className="v61-tour-dim" style={{left:0,top:tourSpot.bottom,right:0,bottom:0}}/>
 <div className="v61-tour-dim" style={{left:0,top:tourSpot.top,width:tourSpot.left,height:tourSpot.height}}/>
 <div className="v61-tour-dim" style={{left:tourSpot.right,top:tourSpot.top,right:0,height:tourSpot.height}}/>
 <div className="v61-tour-focus-ring" style={{left:tourSpot.left,top:tourSpot.top,width:tourSpot.width,height:tourSpot.height}} aria-hidden="true"/>
 <section className="v61-tour-eve" style={{left:tourSpot.captionLeft,top:tourSpot.captionTop}} role="status" aria-live="polite">
  <img src={img('eve-hologram')} alt="EVE" onError={event=>{event.currentTarget.style.visibility='hidden'}}/>
  <div className="v61-tour-script"><span>✧ EVE / GUIDED OPERATION</span><strong>{tourGuide.title}</strong><p>{tourGuide.body}</p></div>
  <button type="button" className="v61-tour-close" onClick={()=>setTourPaused(true)} title="강조 화면 닫기" aria-label="튜토리얼 화면 강조 닫기"><X size={16}/></button>
 </section>
 </div>}
<main className="v10-main"><header className="v10-top"><div className="v10-top-label">ARK // ACCESS-LIMITED <span>● CONNECTED</span></div><nav>{([['hub','중앙',House],['cctv','CCTV',Radio],['animals','격리실',PawPrint],['expedition','탐사',Compass],['research','공명 연구',FlaskConical],['synthesis','병리·검시',FlaskConical],['supplies','보급',ShoppingBag],['hq','본부 통신',Radio],['records',s.archive?.revealed?'해부실':'분석실',BookOpen]] as const).map(([id,name,Icon])=><button data-tour={id==='hq'&&tab!=='hq'?'hq-transfer':id==='cctv'?'cctv-tab':undefined} key={id} onClick={()=>enterTab(id)} title={!tabUnlocked(id)?unlockHint(id):name} aria-disabled={!tabUnlocked(id)} className={(tab===id?'on':'') +(!tabUnlocked(id)?' echo-locked':'')+(id==='cctv'&&securityAlert?' ark-nav-danger':'')}><Icon size={14}/><span>{name}</span>{id==='cctv'&&securityAlert&&<i className="ark-nav-dot"/>}{!tabUnlocked(id)&&<Lock size={11}/>}</button>)}<button type="button" className={'v43-status-toggle '+(statusOpen?'on':'')} onClick={()=>setStatusOpen(v=>!v)} aria-expanded={statusOpen} aria-controls="v43-status-panel" title="전력·위험·자원 상세 상태"><Activity size={15}/><span>상태</span></button><button onClick={()=>setSound(x=>!x)} title="효과음 켜기/끄기">{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button onClick={()=>setConfirmRestart(true)} title="새 게임"><RotateCcw size={15}/></button></nav></header>{!s.run&&tab!=='cctv'&&securityAlert&&<button className="ark-global-alert" onClick={()=>{setCamera(s.voice?.pending?.camera??s.security?.incident?.camera??s.horror?.pending?.camera??'CAM-01');enterTab('cctv')}}><AlertTriangle size={15}/> CCTV 미확인 경보 · 확인 필요</button>}{!s.run&&(s.crew?.members??[]).some(m=>m.mind>0&&m.mind<35)&&<button className="ark-global-alert staff" onClick={()=>{setStatusOpen(true);enterTab('hub')}}><AlertTriangle size={15}/> 직원 정신 안정 위험 · 중앙 확인</button>}
{tourGuide&&!current&&!tourSpot&&!guideDismissed&&!awakening&&!result&&!nightView&&!memoryTarget&&!s.pending&&!s.pendingIncident&&!s.headquarters?.pendingScene&&!confirmRestart&&!inspect&&<div className="echo-tour-coach" role="status" aria-live="polite"><div className="echo-tour-coach-main"><span>✦ EVE · 현장 안내</span><strong>{tourGuide.title}</strong><p>{tourGuide.body}</p></div><div className="echo-tour-controls">{tourGuide.target&&<button type="button" className="v46-tour-jump" onClick={()=>{if(tourGuide.nav&&tab!==tourGuide.nav)enterTab(tourGuide.nav);else focusTutorial(tourGuide.target)}}><Compass size={13}/> 안내 위치 보기</button>}{tourGuide.nav&&tab!==tourGuide.nav&&<button onClick={()=>enterTab(tourGuide.nav!)}>해당 화면 열기 <ChevronRight size={13}/></button>}<button className="echo-tour-skip" onClick={()=>setGuideDismissed(true)}>안내 접기</button></div></div>}<div className="v10-content"><div className="v10-core">{lockNotice&&<div className="echo-lock-notice" role="status"><Lock size={15}/><span>{lockNotice}</span><button onClick={()=>setLockNotice('')} aria-label="해금 안내 닫기"><X size={13}/></button></div>}{tab==='hub'&&<><NightWatchReport state={s}/>{(s.originZero?.photos??0)>=11&&<section className="origin-body-meter" role="status"><b>관리자 신체 안정도 · {s.originZero?.bodyStability??72}%</b><Bar v={s.originZero?.bodyStability??72} color="#e49aac"/><small>{(s.originZero?.bodyStability??72)<=20?'신경-신체 연결 임계 · 남은 기록을 우선하십시오.':(s.originZero?.bodyStability??72)<=45?'떨림과 피로가 누적되고 있습니다.':'복제 신체의 안정성이 점차 감소합니다.'}</small></section>}{s.hqOrders?.active&&<button className="v56-hub-hq-alert" onClick={()=>setTab('hq')}><Radio size={17}/> 본부 지령 · {s.hqOrders.active.status==='offered'?'회신 대기':`DAY ${s.hqOrders.active.dueDay}까지 표본 송신`} <ChevronRight size={15}/></button>}{s.voice?.pending&&<button className="v56-hub-voice-alert" onClick={()=>setTab('cctv')}><Radio size={18}/> 똑, 똑, 똑 · CCTV 신원 미확인 <ChevronRight size={15}/></button>}<div className="scene-banner" style={{backgroundImage:`linear-gradient(180deg,#0c081733,#0806117a),url(${img('hero-gate')})`}}><div className="scene-caption"><span className="micro-label">보존 구역 · CENTRAL GATE</span><h2>사람이 없는 동물원</h2><p>벽 너머의 생명은 여전히 움직이고 있다.</p></div><div className="scene-roam">{live.slice(0,4).map((a,i)=><button key={a.id} className="moving-animal" style={{left:`${21+i*17}%`,animationDelay:`-${i*1.2}s`}} onClick={()=>{setSelectedAnimal(a.id);setTab('animals')}} title={`${a.name} 상태 확인`}><img src={animalArt(a)} alt={a.name}/></button>)}</div></div>{s.security.incident&&<button className="hub-security-alert" onClick={()=>{setCamera(s.security.incident!.camera);setTab('cctv')}}><AlertTriangle size={17}/> {s.security.incident.status==='escaped'?'격리 개체 탈출':s.security.incident.status==='breach'?'격리문 손상':'CCTV 이상 행동'} 감지 · 감시 화면 확인 <ChevronRight size={14}/></button>}<div className="v10-actions-panel v43-home-panel">{(tutorialStep>=9||!!s.security.incident||s.power<20)&&<div className="v43-next-step"><div><span className="v43-eyebrow">NEXT ACTION // PRIORITY</span><strong>{s.security.incident?'격리 이상 · 즉각 확인':s.power<30?'전력 부족 · 보급 필요':live.some(a=>animalVital(a)==='critical')?'개체 바이탈 위험 · 격리실 점검':tutorialStep<9?'현재 목표를 수행하세요':s.ap<=0?'오늘의 작업 완료':'외부 구역을 조사하세요'}</strong><small>{s.security.incident?'CCTV에서 이상 행동과 손상 상태를 확인할 수 있습니다.':s.power<30?'시설 전력이 떨어졌습니다. 보급과 복구가 필요합니다.':live.some(a=>animalVital(a)==='critical')?'격리실에서 위험 개체의 상태를 확인하고 대응하세요.':tutorialStep<9?'노란색 임무 버튼 하나부터 따라가면 시설이 순서대로 열립니다.':s.ap<=0?'하루 종료를 선택하여 다음 날의 작업을 준비하세요.':'탐사에서 동물과 물자를 확보하고 연구를 진행하세요.'}</small></div><button onClick={()=>s.ap<=0&&!s.security.incident?(setNightView(true)):enterTab(s.security.incident?'cctv':s.power<30?'supplies':live.some(a=>animalVital(a)==='critical')?'animals':tutorialStep<9?(tutorialStep>=8?'cctv':tutorialStep>=6?'supplies':tutorialStep>=5?'research':tutorialStep>=4?'animals':'expedition'):'expedition')} ><span>{s.security.incident?'CCTV 확인':s.power<30?'보급 열기':live.some(a=>animalVital(a)==='critical')?'격리실 열기':tutorialStep<9?'목표 화면 열기':s.ap<=0?'야간 대응 열기':'탐사 출동'}</span><ChevronRight size={15}/></button></div>}{tutorialStep<9&&<div className="echo-first-mission"><div><span className="echo-tutorial-progress">안내 {Math.max(1,Math.min(8,tutorialStep))}/8 · 진행 상태 자동 저장</span><span>FIRST SIGNAL · {rescuedCount?"생존 기록":"미확인 신호"}</span><strong>{firstMission}</strong><small>잠긴 설비는 목표를 완료하면 순서대로 해금됩니다. EVE의 안내를 확인하세요.</small></div><button data-tour="first-signal" onClick={()=>enterTab(tutorialDestination(s))}>{tutorialStep===6&&s.tutorialArchiveReviewPending?'본부 인계 진행':tutorialStep===8?'CCTV 점검':tutorialStep>=6?'보급실에서 시설 복구':tutorialStep>=5?'공명 연구 열기':tutorialStep>=4?'격리실 관찰':'첫 신호 추적'}<ChevronRight size={15}/></button></div>}<details className="v43-home-details v43-milestones"><summary><span>복구 진행 기록</span><ChevronRight size={13}/></summary><div className="echo-guided-roadmap" aria-label="시설 복구 안내"><div className="echo-guided-head"><strong>시설 복구 순서</strong></div><div className="echo-guided-steps">{[['01','첫 탐사',3],['02','동물 구조',4],['03','행동 관찰',5],['04','공명 연구',6],['05','감시망 복구',7]].map(([number,name,required])=><span key={number} className={tutorialStep>=Number(required)?'is-done':tutorialStep===Number(required)-1?'is-next':'is-locked'}>{tutorialStep>=Number(required)?'✓':number} {name}</span>)}</div></div></details><section className="v43-home-details v43-extra-ops v46-home-open"><div className="v46-open-heading"><b>긴급 작업</b><small>작업마다 AP 1 · 직접 조작 후 정산</small></div><div className="base-actions"><button disabled={s.encounters===0||s.ap<1} onClick={()=>action('rest')}><Heart size={14}/> 휴식 <small>정신력 회복 / AP 1</small></button><button data-tour="emergency-recharge" className={s.tutorialStep===6&&s.day>1&&s.power<24&&s.parts>0?'v60-tutorial-recharge':''} disabled={s.encounters===0||s.ap<1||s.parts<1} onClick={()=>action('recharge')}><Zap size={14}/> 전력 보충 <small>부품 1 / AP 1</small></button><button disabled={s.encounters===0||s.ap<1||s.flashlight<16} onClick={()=>action('handsearch')}><Lightbulb size={14}/> 수동 수색 <small>전지 16 · 보급 위치 판독</small></button><button disabled={s.encounters===0||s.ap<1||s.mind<=14} onClick={()=>action('crank')}><BatteryCharging size={14}/> 수동 발전 <small>정신 14 · 발전 타이밍</small></button><button disabled={s.encounters===0||s.ap<1||s.filters<1} onClick={()=>action('decontam')}><Wind size={14}/> 제독실 가동 <small>필터 1 · 정화 순서</small></button></div></section></div>
<section className="v43-home-details v43-extended-monitor v46-home-open"><div className="v46-open-heading"><b>관제 카메라 · 최근 기록</b><small>실시간 현장 운영 / 상세는 상단 메뉴</small></div><section className="ark-operations" aria-label="동물원 상황 관제">
  <div className="ark-ops-heading"><div><span className="micro-label">ARK // LIVE OPERATIONS</span><h3>동물원 상황 관제</h3></div><span className="ark-live-dot"><i/> LIVE · DAY {String(s.day).padStart(3,'0')}</span></div>
  <div className="ark-ops-grid">
    <div className="ark-monitor">
      <div className="ark-panel-head"><b><Radio size={14}/> 외곽 감시 카메라</b><small>CAM 01 · CENTRAL GATE</small></div>
      <button className="ark-monitor-screen" onClick={()=>enterTab('expedition')} title="현장 탐사 구역 선택으로 이동"><ArtSlot src={gameplayArt.camera('CAM-01')}/>
        <span className="ark-camera-rec"><i/> REC</span><span className="ark-camera-target"/><span className="ark-camera-caption">외부 통신 {s.eve>30?'연결됨':'불안정'} · 위협 {Math.round(s.threat)}%</span>
      </button>
      <div className="ark-camera-actions"><button onClick={()=>enterTab('expedition')}><Compass size={13}/> 외곽 조사</button><button onClick={()=>{setCamera(s.security.incident?.camera||'CAM-02');enterTab('cctv')}}><Radio size={13}/> CCTV 확인</button><button onClick={()=>enterTab('animals')}><PawPrint size={13}/> 격리실 보기 <b>{live.length}/{s.rooms}</b></button></div>
    </div>
    <div className="ark-recommendations">
      <div className="ark-panel-head"><b><Activity size={14}/> 운영 우선순위</b><small>상태에 따라 갱신</small></div>
      <div className="ark-readiness">
        <div className="ark-readiness-row"><span>시설 전력</span><strong className={s.power<30?'ark-alert-text':''}>{Math.round(s.power)}%</strong></div><Bar v={s.power} color={s.power<30?'#f37a86':'#76cfd0'}/>
        <div className="ark-readiness-row"><span>외부 위협</span><strong className={s.threat>55?'ark-alert-text':''}>{Math.round(s.threat)}%</strong></div><Bar v={s.threat} color={s.threat>55?'#e77c90':'#d4a4ba'}/>
        <div className="ark-readiness-row"><span>감염 위험</span><strong className={s.infection>45?'ark-alert-text':''}>{Math.round(s.infection)}%</strong></div><Bar v={s.infection} color="#d9a46f"/>
      </div>
      <button className="ark-advice" onClick={()=>enterTab(s.power<35?'supplies':s.infection>35?'supplies':live.length>0?'animals':'expedition')}>
        <span>{s.power<35?'보급 열기 · 전력 저하 경고':s.infection>35?'생체 오염 주의':live.length>0?'보존 개체 점검':'외부 생체 신호 추적'}</span>
        <small>{s.power<35?'보급에서 부품을 확보하세요. 발전기는 AP 1을 사용하며, AP 0이라면 다음 날 수리할 수 있습니다.':s.infection>35?'제독과 필터 보급을 검토하세요.':live.length>0?'구조 개체의 상태를 관찰하세요.':'외곽 탐사를 통해 첫 개체를 찾아보세요.'}</small>
        <ChevronRight size={14}/>
      </button>
    </div>
    <div className="ark-archive-feed">
      <div className="ark-panel-head"><b><BookOpen size={14}/> 최근 기록</b><button onClick={()=>setTab('records')}>전체 보기 <ChevronRight size={12}/></button></div>
      <div className="ark-feed-list">{s.logs.slice(0,3).map((entry,i)=><button key={`${entry.day}-${entry.title}-${i}`} onClick={()=>setTab('records')} className={'ark-feed-entry ark-kind-'+entry.kind}>
        <span className="ark-feed-day">D{String(entry.day).padStart(2,'0')}</span><span><b>{entry.title}</b><small>{entry.text}</small></span>
      </button>)}</div>
      <div className="ark-feed-foot"><span><PawPrint size={12}/> 확보 {live.length} 개체</span><span><Brain size={12}/> 기억 단서 {s.clues}건</span></div>
    </div>
  </div>
</section></section></>}
{tab==='hq'&&<section className="tab-content v56-hq-page v71-headquarters">{s.headquarters?.pendingAnimal&&<div className="v10-modal hq-transfer-modal v59-hq-inline v61-hq-transfer">
 <span className="micro-label">CONFIDENTIAL TRANSMISSION · HQ</span>
 <h2>{s.tutorialArchiveReviewPending?'첫 개체 · 본부 이송 실습':'공명 기록 · 본부 처리 선택'}</h2>
 <p>{s.animals.find(a=>a.id===s.headquarters.pendingAnimal)?.name}의 공명 기록이 완성되었습니다. 살아 있는 개체의 이송과 데이터 전송은 서로 다른 선택입니다.</p>
 {(()=>{const animal=s.animals.find(a=>a.id===s.headquarters.pendingAnimal);const issues=animal?(['rabbit','fox','wolf','deer'].includes(animal.id)?staffTransferIssues(s,animal):[]):['개체 정보 없음'];return <div className={'v64-health-check '+(issues.length?'not-ready':'ready')}><strong>{issues.length?'⚠ 생체 이송 전 건강 조건 미충족':'✓ 건강한 공명 개체 · 생체 인계 가능'}</strong><small>{issues.length?issues.join(' · '):'공명 100 · 건강 70+ · 스트레스 65 이하 · 오염 30 이하 · 질병 25 이하 · 비변이'}</small>{issues.length>0&&!s.tutorialArchiveReviewPending&&<button type="button" onClick={()=>handleHQChoice('defer')}>일단 보류하고 격리실에서 치료하기</button>}</div>})()}
 <div className="v54-hq-economy"><div><span>생체 이송</span><b>고철 +3 · 식량 +2</b><small>개체는 본부로 이동 · 연구 기록은 분석실에 보존</small></div><div><span>표본 송신 (별도 병리 연구)</span><b>CR +180 · 고급 지원품</b><small>조직 표본을 실제 송신했을 때만 지급</small></div></div>
 {s.tutorialArchiveReviewPending&&s.headquarters.pendingAnimal==='rabbit'&&!s.headquarters.transferred.includes('rabbit')?
 <div className="v61-hq-guided"><strong>✦ EVE / 첫 실습</strong><p>첫 토끼는 본부로 생체 이송해 주세요. 이번에는 다른 선택이 열리지 않습니다. 이후부터는 직접 판단합니다.</p><button type="button" className="v10-primary" data-tour="hq-transfer" disabled={!!s.animals.find(a=>a.id===s.headquarters.pendingAnimal&&['rabbit','fox','wolf','deer'].includes(a.id)&&staffTransferIssues(s,a).length>0)} onClick={()=>handleHQChoice('transfer')}>첫 토끼 생체 이송 승인 <ChevronRight size={16}/></button></div>:
 <div className="event-options v54-hq-choices v61-hq-choices"><button disabled={!!s.animals.find(a=>a.id===s.headquarters.pendingAnimal&&['rabbit','fox','wolf','deer'].includes(a.id)&&staffTransferIssues(s,a).length>0)} onClick={()=>handleHQChoice('transfer')}>생체 이송 <small>살아 있는 개체 이송 · 기본 물자 지급</small></button><button onClick={()=>handleHQChoice('copy')}>데이터만 전송 <small>개체 보호 · 단서 +2 / 전력 -8</small></button><button onClick={()=>handleHQChoice('refuse')}>인계 거부 <small>개체 보호 · 본부의 압박 증가</small></button><button onClick={()=>handleHQChoice('defer')}>이송 보류 <small>치료·상태 개선 후 재요청 가능 · 불이익 없음</small></button></div>}
 </div>}<header><span className="v56-micro"><Radio size={14}/> ARK // HEADQUARTERS LINK</span><h2>본부 통신 · 지령과 이송</h2><p>지정된 네 종을 공명 100%와 건강 조건을 충족한 채 본부로 생체 인계할 수 있습니다. 이송 기록에 따라 다음 날부터 파견 인력이 하루에 한 명씩 배치됩니다. 인사 이력은 공개되지 않습니다.</p></header><div className="v64-hq-staff-board"><strong>HQ PERSONNEL STATUS · 4개 파견 슬롯</strong><p>대상 조건: 공명 100% · 건강 70 이상 · 스트레스 65 이하 · 오염 30 이하 · 질병 25 이하 · 변이 없음. 본부의 인력 선발 기준은 기밀입니다.</p><div className="v64-hq-crew-status">{(['rabbit','fox','wolf','deer'] as CrewId[]).map(id=>{const member=s.crew?.members.find(m=>m.id===id);const order=s.crew?.arrivalQueue?.find(q=>q.id===id);const retired=s.crew?.retired?.includes(id);const animal=s.animals.find(a=>a.id===id&&a.alive);const transferred=s.headquarters.transferred.includes(id);const issues=animal?staffTransferIssues(s,animal):['미확보'];const ready=!!animal&&issues.length===0&&!s.headquarters.pendingAnimal;return <div className="v64-hq-crew-entry" key={id}><div><b>{member?CREW_PROFILES[id].post:"생체 이송 기록"} <small>{(s.originZero?.photos??0)>=10||!member?`· ${specs.find(spec=>spec.id===id)?.name}`:'· 인사 이력 비공개'}</small></b><span>{member?`✓ 합류 완료 · DAY ${member.arrivedDay}`:retired?'✕ 인격 신호 소실':order?`◷ 이송 완료 · DAY ${Math.max(s.day+Number(s.crew?.lastArrivalDay===s.day),order.transferDay+1)}부터 순차 도착`:transferred?'본부 이송 기록 확인됨':animal?issues.length?`이송 준비 중 · ${issues.join(', ')}`:'공명 완료 · 인계 가능':'동물 미확보'}</span></div>{animal&&animal.memory>=100&&!transferred&&!member&&!retired&&<button type="button" disabled={!ready} onClick={()=>reopenHQ(id)}>{ready?'생체 인계 요청':'건강 회복 필요'}</button>}</div>})}</div></div><div className="v56-hq-dashboard"><div><span>본부 간섭도</span><RingMeter name="간섭" value={s.hqOrders?.interference??0} color="#c87c9c"/></div><div><span>현재 조직 표본</span><b>{s.archive?.samples??0}<small>개</small></b></div><div><span>완료 지령</span><b>{s.hqOrders?.fulfilled??0}<small>건</small></b></div><div><span>거부 지령</span><b>{s.hqOrders?.refused??0}<small>건</small></b></div></div>{s.hqOrders?.active?<div className="v56-hq-active"><strong>{s.hqOrders.active.title}</strong><p>{s.hqOrders.active.status==='accepted'?`DAY ${s.hqOrders.active.dueDay}까지 해부 표본 1개를 실제 송신하십시오. 전송 즉시 지령 보너스를 지급합니다.`:'아직 응답하지 않았습니다. EVE 지령 내용을 확인하십시오.'}</p><span>진행 상태 · {s.hqOrders.active.status==='accepted'?'납품 대기':'결정 필요'}</span></div>:<div className="v56-hq-active is-idle"><strong>활성 지령 없음</strong><p>5일 간격으로 본부에서 회수 명령을 송신합니다. 기한을 놓치면 외부 위협과 시설 손실이 증가합니다.</p></div>}<div className="v56-hq-actions"><button onClick={()=>enterTab('records')}><BookOpen size={16}/> 분석실에서 표본 확인 <ChevronRight size={14}/></button><button onClick={()=>enterTab('animals')}><PawPrint size={16}/> 격리 중 생체 개체 확인 <ChevronRight size={14}/></button></div><div className="v56-hq-archive"><h3>기존 본부 지령 기록</h3>{s.hqOrders?.history?.length?s.hqOrders.history.slice(0,7).map(order=><article key={order.id}><b>DAY {order.issueDay} · {order.title}</b><span>{order.status==='completed'?'납품 완료':order.status==='refused'?'거부':order.status==='substituted'?'대체 자료 승인':'기한 초과'}</span><p>{order.outcome}</p></article>):<p>아직 처리된 지령이 없습니다.</p>}</div></section>}
{tab==='cctv'&&<HorrorConsole state={s} onRead={i=>mutate(prev=>readHorrorRecord(prev,i))} onResolve={i=>mutate(prev=>resolveHorror(prev,i))} onCamera={()=>{if(s.horror?.pending)setCamera(s.horror.pending.camera)}}/>}
{tab==='cctv'&&<CrewMemoryCCTV state={s} onWatch={()=>{const next=watchEmptyCage(s);setS(next.state);dialogue(next.lines)}}/>}
{tab==='cctv'&&<section className="tab-content cctv-page"><div className="section-title"><div><span className="micro-label">ARK SECURITY // LIVE SURVEILLANCE</span><h2>격리 시설 · CCTV 관제</h2><p>이상 행동은 공격의 전조이거나 오래된 기억의 반응일 수 있습니다. 화면에서 달라진 지점을 직접 클릭하거나 정밀 분석 버튼을 이용하세요.</p></div><Radio size={26}/></div>
<section className="v56-cctv-voice-entry"><div><span className="v56-micro"><Radio size={13}/> NIGHT SIGNAL / AUDIO FORENSICS</span><strong>{s.voice?.pending?'출입 신호 감지 · 신원 미확인':'목소리 인증 기록'}</strong><small>DAY 4 첫 탐지 이후 매일 밤 10% 확률 · 조사 3회 · 정확한 판정으로 자료 확보</small></div><div className="v56-cctv-voice-stats"><span>판정 <b>{s.voice?.resolved??0}건</b></span><span>일치 <b>{s.voice?.correct??0}건</b></span><span>확보한 증거 <b>{s.voice?.history?.reduce((sum,r)=>sum+r.checks.length,0)??0}개</b></span>{(s.voice?.correct??0)>=2&&<span className="v56-voice-unlock">✓ 음성 지문 필터 · CCTV 분석 전력 -3</span>}</div></section>
{s.voice?.history?.length? <details className="v56-cctv-voice-history"><summary><BookOpen size={14}/> 과거 음성 감식 결과 · {s.voice.history.length}건 <ChevronRight size={13}/></summary><div>{s.voice.history.slice(0,8).map(record=><article key={record.id}><b>DAY {record.day} · {record.name} · {record.isMimic?'신경 모방체':'인증된 실제 신호'}</b><p>{record.outcome}</p><small>{record.checks.map(c=>c.text).join(' / ')||'수집된 단서 없음'}</small></article>)}</div></details>:null}
<div className="cctv-operations-header"><div><span>ARK SECURITY / OPERATIONS</span><b>{s.security.incident?.status==='escaped'?'생체 신호 소실':s.security.incident?.status==='breach'?'격리 파손 · 즉시 대응':s.security.incident?'이상 움직임 확인':'감시망 정상'}</b></div><div><small>시설 전력</small><strong>{s.power}%</strong></div><div><small>경계 수준</small><strong>{s.security.incident?.severity??s.threat}%</strong></div><div><small>행동력</small><strong>{s.ap}</strong></div></div><div className="cctv-layout"><div className="cctv-main"><div className="cctv-channels ark-dynamic-cameras">{availableCameras.map(ch=><button key={ch.id} onClick={()=>setCamera(ch.id)} className={camera===ch.id?'active':''}><span className="cctv-channel-preview ark-camera-preview"><ArtSlot src={gameplayArt.camera(ch.id)}/><i>{s.power<12?'OFF':'REC'}</i><b>{ch.id}</b></span><small>{ch.title}</small>{s.security.incident?.camera===ch.id&&<span className="cctv-dot">● 경고</span>}</button>)}</div>
<div className={'cctv-viewport '+(s.security.incident?.camera===camera?'has-alert':'')+(s.horror?.pending?.camera===camera?' horror-feed-'+s.horror.pending.id:'')}><div className="cctv-overlay"><span>● {s.power>=12&&s.eve>=15?'REC • LIVE':'SIGNAL LOST'}</span><span>{camera} / {availableCameras.find(x=>x.id===camera)?.title}</span></div>{s.horror?.pending?.camera===camera&&<div className="horror-feed-label" role="status">{s.horror.pending.id==='loop'?'FRAME 03:17:00 · 재생 여부 불명':s.horror.pending.id==='blackout'?'LOW POWER · SIGNAL DEGRADED':s.horror.pending.id==='blindspot'?'LENS OCCLUDED · 사각지대':'UNVERIFIED RECORD · '+s.horror.pending.title}</div>}{v42Telemetry&&v42Telemetry.entries.some(t=>t.kind==='animal'&&t.bad)&&<div className="v42-cctv-impact" key={v42Telemetry.tick} aria-live="assertive"><AlertTriangle size={16}/><strong>생체 신호 손상</strong>{v42Telemetry.entries.filter(t=>t.kind==='animal'&&t.bad).map((t,i)=><b key={i}>{t.label} {t.before}→{t.after} ({t.delta})</b>)}</div>}<CCTVEvidence key={camera} state={s} camera={camera} onInspect={spot=>operateSecurity('inspect',camera,spot)} onWatch={()=>operateSecurity('watch',camera)} animalSrc={animalArt} onSelect={id=>{setSelectedAnimal(id);setTab('animals')}}/><div className="cctv-bottom"><span>DAY {String(s.day).padStart(3,'0')} · CCTV ARCHIVE</span><span>{s.power<12?'저전력 영상':'생체 움직임 분석 중'}</span></div></div>
<details className="v51-cctv-help"><summary><BookOpen size={14}/> CCTV 대응 안내 · 처음 경보가 떠도 당황하지 마세요 <ChevronRight size={13}/></summary><p>① 카메라 전환 → 이상 신호 확인 → 대응 선택. 음성 교감은 유대, 봉쇄는 스트레스, 직접 진정은 관리자 부상 위험이 있습니다.</p><p>② 개체가 탈출하면 CCTV 경로 추적(전력 9 · AP 1)이나 수동 추적(정신력 -3 · AP 1) → 재격리/방생. 변이체는 억제 주사로 위험을 줄일 수 있습니다.</p></details><div className="cctv-telemetry"><div><small>격리실 안정성</small><b>{s.facility}%</b><Bar v={s.facility}/></div><div><small>시설 전력</small><b>{s.power}%</b><Bar v={s.power} color="#7de3e7"/></div><div><small>보호 개체</small><b>{s.animals.filter(a=>a.alive).length}종</b></div><div><small>해결한 사고</small><b>{s.security.resolved}건</b></div></div></div>
<aside className="cctv-control"><div className="cctv-section-head"><AlertTriangle size={16}/><b>{s.security.incident?'이상 신호 확인':'현재 감시 상태'}</b></div>{s.security.incident?(()=>{const i=s.security.incident;const a=s.animals.find(x=>x.id===i.animalId);return <><div className="cctv-threat"><span>{i.status==='alert'?'이상 행동':i.status==='breach'?'격리 파손':'시설 이탈'}</span><b>{i.detected?a?.name:'미확인 생체 신호'}</b><p>{i.detected?i.description:'센서 값이 정상 범위를 벗어났습니다. 기준 영상과 현재 프레임을 비교하십시오.'}</p><div>위험도 {i.severity}% <Bar v={i.severity} color="#e5748e"/></div><small>{i.status==='escaped'?(i.tracked?'이동 경로 확보 · 재격리 가능':'이동 경로 미확보 · 추적 필요'):(i.detected?'영상 분석 완료':'영상 분석 필요')} · {i.steps}일째 관측</small>{i.status==='escaped'&&<p className="v31-trace">마지막 포착: {i.camera} · {i.lastTrace||securityPatterns[i.animalId].escape}</p>}</div><div className="cctv-buttons">{i.status!=='escaped'?<><button disabled={s.power<6||s.ap<1||s.eve<10} onClick={()=>operateSecurity('talk')}>음성 교감 <small>전력 -6 · AP -1 · 유대 반영</small></button><button disabled={s.power<18} onClick={()=>operateSecurity('lock')}>격리문 긴급 봉쇄 <small>전력 -18 · 스트레스 증가</small></button><button disabled={s.ap<1} onClick={()=>operateSecurity('enter')}>직접 진정 시도 <small>AP -1 · 관리자 부상 위험</small></button></>:<><button disabled={s.power<9||s.ap<1} onClick={()=>operateSecurity('track')}>CCTV 경로 추적 <small>전력 -9 · AP -1 · 새 카메라 표시</small></button><button disabled={s.ap<1||s.mind<4} onClick={()=>operateSecurity('manualTrack')}>수동 흔적 수색 <small>정전 대응 · 정신력 -3 / AP -1</small></button>{a&&isMutant(a)&&<button disabled={!i.tracked||s.mutantSerum<1||s.ap<1} onClick={()=>operateSecurity('serum')}>억제 주사 · 진정 후 재격리 <small>추적 완료 필요 · 전용 주사 1개 · AP -1</small></button>}<button disabled={!i.tracked||s.medicine<1||s.ap<1} onClick={()=>operateSecurity('recover')}>응급 케이지로 재격리 <small>치료제 -1 · AP -1 · 실패 가능</small></button><button className="cctv-release" onClick={()=>operateSecurity('release')}>다시 가두지 않고 방생 <small>영구적인 개체 이탈</small></button></>}</div><p className="cctv-subtext">{a?securityPatterns[a.id].escape:''}</p></>})():<p className="muted">위험 신호는 없습니다. 구조한 동물의 스트레스와 격리실 상태에 따라 이상 행동이 발생할 수 있습니다.</p>}<div className="v42-security-debrief" role="status" aria-live="polite"><span>◉ EVE / 직전 관제 결과</span><p>{runFeedback||s.lastOutcome||"분석 대기 · 명령 수행 후 실제 피해와 자원 변화가 표시됩니다."}</p><small>정신력·현장 ST·개체 건강 변화량은 오른쪽 위 실시간 판정과 CCTV 화면에도 표시됩니다.</small></div><button className="cctv-scan" disabled={s.ap<1||s.power<((s.voice?.correct??0)>=2?5:8)||s.security.lastScanDay===s.day} onClick={()=>operateSecurity('scan')}><Search size={15}/> CCTV 정밀 분석 <small>전력 -{(s.voice?.correct??0)>=2?5:8} / AP -1 / 하루 1회</small></button><div className="cctv-section-head"><BookOpen size={15}/><b>관제 사건 기록</b></div><div className="cctv-history">{s.security.history.length?s.security.history.slice(0,5).map((entry,i)=><div key={i}><small>D{entry.day} · {entry.title}</small><p>{entry.detail}</p></div>):<p className="muted">아직 사건 기록이 없습니다.</p>}</div></aside></div></section>}
{tab==='expedition'&&!s.run&&gearPreview&&<div className="v80-deploy-shade" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setGearPreview(false)}}><section className="v80-deploy-modal" role="dialog" aria-modal="true" aria-labelledby="v80-deploy-title"><header><span>ARK FIELD OPS · SORTIE CONFIGURATION</span><button type="button" aria-label="출동 준비 닫기" onClick={()=>setGearPreview(false)}>×</button></header><h2 id="v80-deploy-title">출동 준비 · {region.name}</h2><p>{region.desc} 위험 {region.danger}% · 탐사 AP 1 · 오늘 하루 한 번 출동할 수 있습니다.</p><h3>장비 선택</h3><div className="v80-deploy-gear">{gearData.map(g=>{const selected=selectedGear.includes(g.id),unavailable=!!gearUnavailable(s,g.id,selectedRegion);const costs:Record<Gear,string>={flashlight:`보유 ${s.flashlight}% · 출동 10% + 이동 소모`,filter:`보유 ${s.filters} · 출동 1개`,scanner:`전력 ${s.power}% · 구역 요구량 + 8`,medkit:`의약품 ${s.medicine} · 미사용 환불`,cage:`부품 ${s.parts} · 포획 시 사용`};return <button type="button" key={g.id} disabled={unavailable} aria-pressed={selected} className={selected?'selected':''} onClick={()=>setSelectedGear(prev=>prev.includes(g.id)?prev.filter(x=>x!==g.id):[...prev.filter(x=>g.id==='scanner'?x!=='flashlight':g.id==='flashlight'?x!=='scanner':true),g.id])}><b>{selected?'✓ ':''}{g.name}</b><small>{unavailable?'보유량 부족 · ':''}{costs[g.id]}</small></button>})}</div><h3>동행 직원 · 최대 두 명</h3><div className="v80-deploy-crew"><button type="button" className={selectedCompanion.length===0?'selected':''} onClick={()=>setSelectedCompanion([])}>혼자 출동<small>직원 정신력 소모 없음</small></button>{(s.crew?.members??[]).filter(m=>m.mind>0).map(m=><button type="button" key={m.id} className={selectedCompanion.includes(m.id)?'selected':''} onClick={()=>setSelectedCompanion(prev=>prev.includes(m.id)?prev.filter(id=>id!==m.id):prev.length<2?[...prev,m.id]:prev)}>{({rabbit:'의무관',fox:'보급관',wolf:'보안관',deer:'기록관'} as Record<string,string>)[m.id]}<small>{m.mind}% 정신 · 출동 부담 1</small></button>)}</div><div className="v80-deploy-cost"><b>소모 미리보기</b><span>AP -1 {selectedGear.includes('flashlight')?'· 손전등 -10% + 이동 배터리':selectedGear.includes('scanner')?`· 시설 전력 -${region.power+8}%`:'· 필수 광원 없음'} {selectedGear.includes('filter')?'· 필터 -1':''} {selectedGear.includes('medkit')?'· 응급 키트 예약':''} {selectedGear.includes('cage')?'· 케이지 예약':''}</span></div>{expeditionBlockReason(s,selectedRegion,selectedGear,selectedCompanion)&&<p className="v80-deploy-error" role="alert">{expeditionBlockReason(s,selectedRegion,selectedGear,selectedCompanion)}</p>}<footer><button type="button" onClick={()=>setGearPreview(false)}>편성 유지하고 닫기</button><button type="button" data-tour="launch" disabled={!!expeditionBlockReason(s,selectedRegion,selectedGear,selectedCompanion)} onClick={goRun}>출동 확정 · {region.name} 진입 <ChevronRight size={16}/></button></footer></section></div>}
{tab==='cctv'&&!s.run&&<OriginZeroPanel state={s} mode="expedition" onUpdate={next=>{setS(next);setRunFeedback(next.lastOutcome);const lines=originDialogue(s,next);if(lines.length)dialogue(lines);if(next.originZero?.cat==='positive')setTab('records');}}/>}
{tab==='expedition'&&(s.run ? <FieldMission state={s} animalSrc={img} onMove={onFieldMove} onToggleLight={()=>setS(v=>v?toggleFieldLight(v):v)} onRetreat={onFieldRetreat} onHide={onFieldHide} onHunt={onHuntAction} onMedkit={applyFieldMedkit} onCombat={action=>{const n=resolveCombat(s,action);if(n===s)return;setS(n);setRunFeedback(n.lastOutcome);if(s.field?.combat&&!n.field?.combat){report(s,n,'현장 전투 결과');setResult({success:n.lastOutcome.includes('격퇴')||n.lastOutcome.includes('오염 제거'),title:n.lastOutcome.includes('격퇴')||n.lastOutcome.includes('오염 제거')?'위협 격퇴':action==='retreat'?'현장 철수':'긴급 이탈',text:n.lastOutcome})}beep(action==='guard'?330:510)}} onDecision={onFieldDecision} feedback={runFeedback}/> : <div className="tab-content"><div className="section-title"><div><span className="micro-label">FIELD OPERATIONS // CLICK EXPEDITION</span><h2>전술 탐사 · 구역 선택</h2><p>현장을 조사하고, 은신 개체가 한 턴 전에 남긴 발자국으로 현재 위치를 추리하십시오. 정보와 장비는 모두 행동 기회를 소모합니다.</p></div><ShieldAlert size={27}/></div><div className={'exp-grid echo-exp-grid '+(s.run?'echo-is-running':'echo-is-preparing')}><div className="echo-location-column"><div className="zone-grid">{!s.run&&regions.map(r=><button data-tour={r.id===selectedRegion?"region":undefined} key={r.id} disabled={s.day<r.unlocked||!!s.run} onClick={()=>selectRegion(r.id)} className={'zone-card '+(selectedRegion===r.id?'active':'')}><div className="zone-pic zone-design ark-region-slot"><ArtSlot src={gameplayArt.region(r.id)}/><Compass size={23}/><span>SECTOR {String(r.unlocked).padStart(2,'0')}</span></div><div className="zone-meta"><b>{s.day<r.unlocked?<Lock size={13}/>:<Compass size={14}/>} {r.name}</b><small>{r.desc}</small><span className={r.danger>=60?'danger-text':''}>위험 {r.danger}% · 보상 {r.reward}단계 {s.day<r.unlocked?`· ${r.unlocked}일차 개방`:''}</span></div></button>)}</div><section className="echo-zone-intel" aria-label="선택 구역 안내"><div className="echo-intel-heading"><Eye size={16}/><b>{s.run?'현재 작전 구역':'선택 구역 브리핑'}</b><span>{s.run?'LIVE':'READY'}</span></div><h3>{region.name}</h3><p>{region.desc}</p><div className="echo-intel-metrics"><div><small>위험도</small><strong className={region.danger>=60?'echo-red':''}>{region.danger}%</strong></div><div><small>회수 보상</small><strong>{region.reward}단계</strong></div><div><small>발견 가능 개체</small><strong>{region.animals.length}종</strong></div></div><p className="echo-intel-note">{s.run?'현장 상황과 철수 시점을 판단하세요.':'구역을 선택하면 오른쪽에서 장비와 자원 소모를 확인할 수 있습니다.'}</p></section></div><div className="exp-control"><span className="micro-label">{s.run?'FIELD REPORT / 현장 관측':'LOADOUT / 출동 준비'} · {region.name}</span><h3>{s.run?'탐사 진행 중':'현장 장비 편성'}</h3><p>{region.desc}</p><div className="danger-track"><span>예상 감염·사고 위험</span><b>{region.danger}%</b><Bar v={region.danger} color={region.danger>60?'#e66b84':'#e8b169'}/></div>{!s.run&&<div className="v39-loadout" aria-label="탐사 장비 편성">{gearData.map(g=>{const selected=selectedGear.includes(g.id);const unavailable=!!gearUnavailable(s,g.id,selectedRegion);const cost:Record<Gear,string>={flashlight:`손전등 ${s.flashlight}% · 출동 -10 / 현장 추가 소모`,filter:`필터 ${s.filters}개 · 출동 -1`,scanner:`시설 전력 ${s.power}% · 출동 -${region.power+8}`,medkit:`의약품 ${s.medicine}개 · 출동 -1`,cage:`부품 ${s.parts}개`};return <button key={g.id} type="button" title={g.desc} aria-pressed={selected} disabled={unavailable} className={'v39-gear-chip '+(selected?'equipped ':'')+(unavailable?'v57-no-stock':'')} onClick={()=>setSelectedGear(x=>x.includes(g.id)?x.filter(a=>a!==g.id):[...x.filter(a=>g.id==='scanner'?a!=='flashlight':g.id==='flashlight'?a!=='scanner':true),g.id])}><span>{selected?'✓':unavailable?'✕':'＋'}</span><b>{g.name}</b><small>{unavailable?'보유 부족 · ':''}{cost[g.id]}</small></button>})}{s.archive?.bonuses.tracking&&<span className="v39-hq-gear">본부 특수 케이지 적용 · 포획 행동 +3</span>}</div>}<div className="v57-expedition-crew"><b>동행 직원 <small>최대 두 명 · 미선택 가능</small></b><div>{(s.crew?.members??[]).filter(m=>m.mind>0).map(m=><button key={m.id} type="button" className={selectedCompanion.includes(m.id)?'selected':''} onClick={()=>setSelectedCompanion(prev=>prev.includes(m.id)?prev.filter(id=>id!==m.id):prev.length<2?[...prev,m.id]:prev)}>{({rabbit:'의무관 · 응급 회복',fox:'보급관 · 자재 추가',wolf:'보안관 · 부상 방어',deer:'서기관 · 오염 저항'} as Record<string,string>)[m.id]} <small>정신 -1 / 출동</small></button>)}{!(s.crew?.members??[]).some(m=>m.mind>0)&&<small>첫 직원 합류 후 동행할 수 있습니다.</small>}</div></div><div className="zone-rewards"><b>현장 예상 회수물</b><span>식량 · 부품 · 보존 CR · {region.animals.map(id=>specs.find(a=>a.id===id)?.name).filter(Boolean).join(" / ")} 발견 가능</span><small>현장 자원은 임시 적립됩니다. 지정된 귀환 지점에서 100%, 긴급 철수 시 30%만 정산됩니다. 첫 출동은 EVE 보호 적용.</small></div><section className="v61-deployment-metrics"><div className="v61-deployment-heading"><strong><Zap size={14}/> 출동 예상 소모</strong><span>현재 → 출동 후</span></div><div className="v58-launch-costs" aria-label="출동 전후 자원 비교">
 <DeltaDonut label="행동력 AP" before={s.ap} after={s.ap>=region.ap?s.ap-region.ap:s.ap} max={Math.max(4,s.ap)} color="#eac787" note={s.ap>=region.ap?`출동 시 -${region.ap}`:'AP 부족 · 출동 불가'} />
 <DeltaDonut label="시설 전력" before={s.power} after={canAuto?Math.max(0,s.power-region.power-8):s.power} unit="%" color="#8ad3cf" note={canAuto?'EVE 스캐너 · 시설 전력 사용':'손전등 출동 · 시설 전력 보존'}/>
 <DeltaDonut label="손전등" before={s.flashlight} after={canManual?Math.max(0,s.flashlight-10):s.flashlight} unit="%" color="#d9aad7" note={canManual?'출동 -10 · 이동·조사 중 추가 소모':'EVE 스캐너 사용'}/>
 </div></section><p className="muted">{canAuto?'EVE 스캐너 출동 가능 · 시설 전력을 사용합니다':canManual?'휴대 손전등 출동 가능 · 시설 전력은 유지됩니다':selectedGear.includes('scanner')?'스캐너는 시설 전력이 충분해야 사용 가능합니다. 손전등으로 바꾸거나 발전기를 복구하세요.':'손전등 또는 EVE 스캐너가 필요합니다'}</p><div className="v74-sortie-budget" role="status"><b>{s.tutorialStep<9?'초기 자원 확보 · AP가 남으면 재출동 가능':`오늘 남은 탐사 ${Math.max(0,expeditionLimit(s)-expeditionCountToday(s))} / ${expeditionLimit(s)}회`} · 출동 AP 1</b><small>{s.tutorialStep<9?'복구 자원이 부족하면 다시 탐사하세요.':'남은 출동 횟수와 AP가 있으면 재출동할 수 있습니다.'}</small>{expeditionBlockReason(s,selectedRegion,selectedGear,selectedCompanion)&&<p>{expeditionBlockReason(s,selectedRegion,selectedGear,selectedCompanion)}</p>}<button type="button" onClick={()=>enterTab('supplies')}>장비 보급 열기</button></div><button data-tour={gearPreview?undefined:"launch"} className="v10-primary wide" disabled={!!expeditionBlockReason(s,selectedRegion,selectedGear,selectedCompanion)} onClick={goRun}>탐사 출동 · 수풀 추적 시작 <ChevronRight size={17}/></button></div></div>{runFeedback&&<div className="v10-notice">◈ {runFeedback}</div>}</div>)}
{tab==='animals'&&<div className="tab-content v71-containment"><div className="section-title"><div><span className="micro-label">LIVING ARCHIVE / CONTAINMENT</span><h2>격리실 · 보호 개체 관리</h2><p>스트레스가 높아지면 추출이 위험해지고, 치료와 교감은 다른 결과를 만듭니다.</p></div><PawPrint/></div><div className="ark-wing-tabs" role="group" aria-label="격리 구역 선택">{ownedWings.map(w=>{const rooms=Array.from({length:s.rooms},(_,i)=>i+1).filter(r=>roomWing(r)===w);const count=s.animals.filter(a=>a.alive&&roomWing(a.room)===w).length;return <button key={w} aria-pressed={activeWing===w} onClick={()=>{setWing(w);setSelectedAnimal(s.animals.find(a=>a.alive&&roomWing(a.room)===w)?.id??null)}}><b>격리실 {w}</b><small>{count}/{rooms.length} 수용 · {rooms.length?'가동':'확장 필요'}</small></button>})}<button disabled={s.credits<480||!!s.run} onClick={()=>mutate(v=>purchase(v,'room'))}><b>+ 격리실 추가</b><small>480 CR · 다음 빈 슬롯</small></button><button disabled={!s.facilities.cctv} onClick={()=>{setCamera(wingCamera(activeWing));setTab('cctv')}}><b>{activeWing} CCTV</b><small>해당 구역 감시</small></button></div><div className="room-layout"><div className="room-cards">{!Array.from({length:s.rooms},(_,i)=>i+1).some(r=>roomWing(r)===activeWing)&&<p className="muted">아직 이 구역에 격리실이 없습니다. 격리실을 순서대로 확장하세요.</p>}{Array.from({length:s.rooms},(_,i)=>i+1).filter(room=>roomWing(room)===activeWing).map(room=>{const i=room-1;const a=s.animals.find(a=>a.room===room&&a.alive);return <button data-tour={a&&!artAnimal?"animal-room":undefined} key={i} className={'enclosure '+(selectedAnimal===a?.id?'active':'')} onClick={()=>a&&setSelectedAnimal(a.id)}><b>격리실 {activeWing}-{String(i+1).padStart(2,'0')} <small>{a?'생체 연결':'비어 있음'}</small></b><div className="ark-enclosure-chamber" data-wing={activeWing}><ArtSlot src={gameplayArt.containment(activeWing)}/>{a?<img src={animalArt(a)} alt={a.name}/>:<span>+</span>}</div><strong>{a?.name||'배정 대기'}</strong>{a&&<VitalChip tone={animalVital(a)} compact/>}{a&&<Bar v={a.hp} color="#ef9ab0"/>}</button>})}</div><div className="animal-inspector">{artAnimal?<><div className={"inspector-header "+(artAnimal.stress>=65?"v36-neural-tremor":"")}><img src={animalArt(artAnimal)} alt={artAnimal.name}/><div><span className="micro-label">BIO SIGNAL · ROOM {artAnimal.room}</span><h3>{artAnimal.name}</h3><VitalChip tone={animalVital(artAnimal)}/>{animalVisual(artAnimal)&&<small className="animal-visual-phase">외형 단계: {animalVisual(artAnimal)==="mutant"?"MUTANT · 변이 발현":"UNCANNY · 불안정"}</small>}<p>{specs.find(x=>x.id===artAnimal.id)?.trait}</p>{isMutant(artAnimal)&&!animalVisual(artAnimal)&&<small className="animal-visual-phase">MUTANT · 신경 변이 진행</small>}</div></div>{s.tutorialStep===4&&artAnimal.tutorialProtected&&<div className="v53-lesson-callout"><Radio size={14}/> 첫 토끼 실습 · 아래 <b>행동 관찰</b>부터 진행하세요. EVE가 실수를 교정합니다.</div>}<div className="v53-animal-rings"><RingMeter name="건강" value={artAnimal.hp} color="#eb9fbb"/><RingMeter name="스트레스" value={artAnimal.stress} color="#e5b67a"/><RingMeter name="유대" value={artAnimal.bond} color="#87d4b6"/><RingMeter name="공명" value={artAnimal.memory} color="#9ea7ee"/></div><div className="v53-animal-secondary"><MiniStat name="오염" value={artAnimal.contamination} color="#ea737a"/><MiniStat name="허기" value={artAnimal.hunger??22} color="#d7b26a"/><MiniStat name="질병" value={artAnimal.sickness??0} color="#e88b99"/></div><div className="v36-animal-alert"><strong>{SPECIES_CARE[artAnimal.id].note}</strong>{artAnimal.stress>=65&&<p>⚠ 신경 전조: 몸을 가늘게 떨고 있습니다. 관찰 후 적절한 교감을 선택하세요.</p>}{(artAnimal.hunger??0)>=60&&<p>⚠ 굶주림 경보: 다음 밤 개체 건강 손실 위험이 있습니다.</p>}{(artAnimal.sickness??0)>=45&&<p>⚠ 질병 진행: 치료하지 않으면 개체 건강에 손상이 누적됩니다.</p>}</div>{isMutant(artAnimal)&&<section className="v32-mutant-panel" aria-label="변이체 관리 조치"><div className="v32-mutant-head"><span><AlertTriangle size={17}/> MUTANT · 신경 충돌 경보</span><strong>이탈 위험 지수 {escapeRisk(s,artAnimal)}/100</strong></div><p>변이는 일반 치료로 되돌릴 수 없습니다. 장기 방치 시 격리 파손·탈출 위험이 높아집니다. CCTV 이상 행동을 확인하세요.</p><div className="v32-mutant-status"><span>안정화 {Math.max(0,(artAnimal.suppressedUntilDay??0)-s.day+1)}일 남음</span><span>전용 주사 {s.mutantSerum}개</span><span>오늘 행동력 {s.ap}</span></div><div className="v32-mutant-actions"><button disabled={s.ap<1||s.mutantSerum<1||s.security.escapedIds.includes(artAnimal.id)} onClick={()=>mutantCare(artAnimal.id,'serum')}>진정 주사 투여<small>주사 -1 · AP -1 · 3일간 탈출 위험 억제</small></button><button className="danger" disabled={s.ap<2||s.power<10||s.security.escapedIds.includes(artAnimal.id)} onClick={()=>mutantCare(artAnimal.id,'forceExtract')}>강제 신경 추출<small>전력 -10 · AP -2 · 개체 상실 · 지식 확보</small></button><button className="danger" disabled={s.ap<1||s.security.escapedIds.includes(artAnimal.id)} onClick={()=>mutantCare(artAnimal.id,'euthanize')}>안락사 결정<small>AP -1 · 개체 영구 상실 · 정신 부담</small></button></div></section>}<details className="v53-animal-details"><summary><BookOpen size={14}/> 돌봄 안내 · 행동 실습 규칙 <ChevronRight size={13}/></summary><div className="v36-care-guide"><span>ARK · 동물 행동 돌봄</span><p>관찰에 성공하면 공명 동기화의 1·2·3단계 대응 단서가 순서대로 복원됩니다. 관찰 기록 1회는 연구 시작 조건, 올바른 관찰 3회는 세 단계의 검증된 대응 지침입니다.</p>{s.tutorialStep===4&&<b>첫 토끼는 EVE 보호 실습 중입니다. 다른 돌봄 버튼은 잠깐 잠겨 있습니다. 노란 「행동 관찰」만 진행하세요.</b>}</div></details>
<section className={'v42-mutation-warning '+(mutationRisk(artAnimal).danger?'critical':mutationRisk(artAnimal).score>=55?'warning':'stable')}><div><strong><AlertTriangle size={15}/> 신경 충돌 감시</strong><b>{mutationRisk(artAnimal).danger?'MUTANT · 영구 변이':`불안정 지표 ${mutationRisk(artAnimal).score}/100`}</b></div><p>{mutationRisk(artAnimal).description}</p><small>{artAnimal.tutorialProtected?'첫 실습 보호: 인계 전까지 변이 없음':'변이 조건: 스트레스 88 또는 스트레스 74 + 높은 오염·공명. 위험 징후부터 회복하세요.'}</small></section><details className="v53-animal-details"><summary><BookOpen size={14}/> 관찰 노트 · {verifiedObservationCount(artAnimal)}/3 검증 <ChevronRight size={13}/></summary><section className="v41-observation-journal" aria-label="개체 행동 관찰과 공명 기록">
 <header><span><BookOpen size={15}/> 행동 관찰 노트</span><strong>검증 {verifiedObservationCount(artAnimal)} / 3 · 전체 기록 {artAnimal.records}회</strong></header>
 <p>종별 행동을 정확히 관찰하면 공명 단계별로 힌트가 해금됩니다. 관찰 중 오답을 선택해도 일반 기록은 남지만 검증 노트는 열리지 않습니다.</p>
 <div className="v41-observation-notes">{resonanceObservationNotes(artAnimal).map(note=><div key={note.stage} className={note.unlocked?'unlocked':'locked'}><b>{String(note.stage).padStart(2,'0')} · {note.name}</b><span>{note.unlocked?note.message:'잠금 · 정확한 관찰 대응 필요'}</span></div>)}</div>
 </section></details>
<div className="inspect-actions v36-care-actions">{(['feed','heal','comfort','observe'] as CareAction[]).map(kind=><div className="v36-care-action" key={kind}><button data-tour={kind==='observe'?'observe':undefined} disabled={s.ap<1||(s.tutorialStep===4&&artAnimal.tutorialProtected&&kind!=='observe')||(kind==='feed'&&s.food<1)||(kind==='heal'&&s.medicine<1)} onClick={()=>care(artAnimal.id,kind)}><strong>{CARE_ACTIONS[kind].title}</strong><small>{CARE_ACTIONS[kind].cost}</small></button><div className="v36-care-mastery"><span>행동 숙련 {careMastery(artAnimal,kind)}/2</span>{careMastery(artAnimal,kind)>=2&&<button type="button" disabled={s.ap<1} onClick={()=>doQuickCare(artAnimal.id,kind)}>기록대로 빠른 돌봄</button>}</div></div>)}</div>{careMastery(artAnimal,'feed')>=2&&careMastery(artAnimal,'comfort')>=2&&<button type="button" className="v36-routine-switch" onClick={()=>toggleRoutine(artAnimal.id)}>{artAnimal.careRoutine?'✓ 야간 안정 루틴 가동 중 · 해제':'야간 안정 루틴 활성화 · 급식 공급 시 유대 +2 / 스트레스 -4'}</button>}<div className="inspect-actions"><button className="research-link" onClick={()=>{setSelectedAnimal(artAnimal.id);setTab('research');setRunFeedback('개체 상태를 점검한 뒤 준비 조건이 충족되면 행동 강령을 시작할 수 있습니다.')}}>연구 준비 상태 확인</button>{s.security.escapedIds.includes(artAnimal.id)&&<p className="cctv-escape-warning">⚠ 현재 격리실을 이탈했습니다. CCTV 관제에서 추적 후 재격리하세요.</p>}{artAnimal.awakened&&<button className="awakening-replay" onClick={()=>setAwakening({id:artAnimal.id,stage:0})}>인간 음성 기록 재생 <Radio size={13}/></button>}</div></>:<div className="empty-inspect"><PawPrint size={35}/><h3>개체를 선택하세요</h3><p>동물을 발견해 구조하면 이곳에 배정되고, 개체를 눌러 바이탈과 돌봄을 확인할 수 있어요.</p></div>}</div></div></div>}
{tab==='research'&&<OriginZeroPanel state={s} mode="research" onReplay={number=>dialogue(originPhotoDialogue(s,number))} onUpdate={next=>{setS(next);setRunFeedback(next.lastOutcome);const lines=originDialogue(s,next);if(lines.length)dialogue(lines);}}/>}
{tab==='research'&&<div className="tab-content research-readiness-page v50-research-page"><div className="section-title"><div><span className="micro-label">NEURAL ARCHIVE / MEMORY</span><h2>기억 공명 연구</h2><p>개체 선택 → 조건 확인 → 동기화. 실험 결과는 분석실에 자동 기록됩니다.</p></div><div className="v50-research-hud"><Brain size={15}/> 지식 <b>{s.knowledge}</b> · 단서 <b>{s.clues}</b></div></div>
<div className="research-layout v50-research-layout"><div className="research-target research-preparation v50-research-console"><div className="v50-panel-title"><h3>동기화 대상</h3><span>격리 중 {live.length}개체</span></div><div className="v50-research-targets">{live.length?live.map(a=><button key={a.id} className={'research-animal-select '+(selectedAnimal===a.id?'selected':'')} disabled={s.tutorialStep===5&&s.animals.some(x=>x.id==='rabbit'&&x.tutorialProtected&&x.alive)&&a.id!=='rabbit'} onClick={()=>setSelectedAnimal(a.id)}><img src={animalArt(a)} alt=""/><span><strong>{a.name}</strong><small>관찰 {a.records}회 · 유대 {a.bond}</small></span><RingMeter name="공명" value={a.memory} color="#a2a0ed"/><span className={'research-ready-label '+(protocolReady(a.id)?'is-ready':'is-unready')}>{protocolReady(a.id)?'준비':'미달'}</span></button>):<p className="muted">먼저 탐사에서 개체를 구조하세요.</p>}</div>
{(()=>{const a=live.find(x=>x.id===selectedAnimal)||live[0];if(!a)return <button className="v10-primary" onClick={()=>setTab('expedition')}>첫 개체 탐사하기 <ChevronRight size={14}/></button>;const req=protocolRequirements(a.id);const ready=req.every(r=>r.ok);const missing=req.filter(r=>!r.ok);return <div className="v50-research-ready"><div className="v50-research-status v53-research-status"><RingMeter name="현재 공명" value={a.memory} color="#a0c4eb"/><div><strong>{a.name} · 동기화 {ready?'가능':'대기'}</strong><small>복원 단서 {verifiedObservationCount(a)}/3 · 충족 {req.length-missing.length}/{req.length}</small></div><span className={'v60-ready-pill '+(ready?'ok':'not-ready')}>{ready?'✓ 동기화 준비 완료':`미충족 ${missing.length}개`}</span></div><div className="v50-research-main-action">{ready?<button data-tour="research-target" className="v10-primary" onClick={()=>openProtocol(a.id)}>행동 강령 동기화 <ChevronRight size={16}/></button>:<button className="v10-primary" onClick={()=>{setSelectedAnimal(a.id);setTab('animals');setRunFeedback('격리실에서 부족한 연구 조건을 먼저 충족하세요.')}}>격리실에서 조건 맞추기 <ChevronRight size={15}/></button>}<span className="v60-research-cost">{ready?'필요: 전력 7% · 행동력 2':'확인 필요: '+missing.map(r=>r.label).join(' · ')}</span></div><details className="v50-condition-details v60-research-conditions"><summary><span>검증 조건</span><strong>{req.length-missing.length} / {req.length} 충족</strong><ChevronRight size={14}/></summary><div className="v50-requirement-compact">{req.map(r=><span className={r.ok?'met':'missing'} key={r.label}>{r.ok?'✓':'!'} {r.label} <b>{r.value}</b></span>)}</div></details></div>})()}
</div></div></div>}
{tab==='synthesis'&&<div className="tab-content v67-path-page"><div className="section-title"><div><span className="micro-label">ARK // PATHOLOGY LAB</span><h2>병리·검시실</h2><p>동물을 합성하지 않습니다. 살아 있는 개체는 검체를 조사하고, 사망한 개체는 사후 검시로 기록을 확인합니다.</p></div><FlaskConical size={27}/></div>
 <div className="v67-pathology"><section className="v67-path-card"><h3>검사 대상 선택</h3><p>검사 결과는 성공 또는 실패로 나뉘고, 기록을 내부에 보관할지 본부에 보고할지 결정합니다. 선택은 다음 날 운영과 신뢰에 영향을 줍니다.</p>
 <select value={synthA} onChange={e=>setSynthA(e.target.value)} aria-label="검사 대상"><option value="">개체 선택</option>{s.animals.filter(a=>!s.headquarters.transferred.includes(a.id)).map(a=><option key={a.specimenId||a.id} value={a.id}>{a.name} · {a.alive?'격리 중':'사망 기록'}</option>)}</select>
 <div className="v67-path-methods"><button type="button" disabled={!synthA||!s.animals.some(a=>a.id===synthA&&a.alive)||s.ap<1||s.power<5||s.pathologyRecords?.some(r=>r.id===synthA&&r.day===s.day)} onClick={()=>performPathology('noninvasive')}><b>비침습 검체 검사</b><span>생존 개체 · AP 1 · 전력 5 · 경미한 스트레스</span></button>
 <button type="button" disabled={!synthA||!s.animals.some(a=>a.id===synthA&&a.alive)||s.ap<2||s.power<10||s.medicine<1||s.pathologyRecords?.some(r=>r.id===synthA&&r.day===s.day)} onClick={()=>performPathology('clinical')}><b>정밀 신경 검사</b><span>생존 개체 · AP 2 · 전력 10 · 약품 1 · 높은 정보 / 부담</span></button>
 <button type="button" disabled={!synthA||!s.animals.some(a=>a.id===synthA&&!a.alive&&!s.headquarters.transferred.includes(a.id))||s.ap<1||s.power<5||s.pathologyRecords?.some(r=>r.id===synthA&&r.method==='postmortem')} onClick={()=>performPathology('postmortem')}><b>사후 검시</b><span>사망 개체 전용 · AP 1 · 전력 5 · 동일 개체 1회</span></button></div>
 </section><section className="v67-path-card"><h3>최근 병리 결과</h3><div className="v67-path-results">{(s.pathologyRecords??[]).slice(0,7).map((r,i)=><article key={`${r.id}-${r.day}-${i}`}><strong>DAY {r.day} · {specs.find(a=>a.id===r.id)?.name||r.id} · {r.success?'성공':'실패'}</strong><small>{r.result}</small></article>)}{!(s.pathologyRecords?.length)&&<p>아직 검사 기록이 없습니다. 본부가 요구하는 것은 단순한 숫자가 아닐 수 있습니다.</p>}</div></section></div></div>}
{tab==='supplies'&&<div className="tab-content"><div className="section-title"><div><span className="micro-label">SUPPLY TERMINAL / LIFE SUPPORT</span><h2>보급 · 전력 · 시설 정비</h2><p>고철은 탐사에서 수집하며 시설을 복구하는 핵심 자원입니다. 부품은 작동 회로, 전력은 복구 과정에 사용됩니다.</p></div><Power size={27}/></div>
 <section data-tour="workshop" className="v36-workshop v44-workshop" aria-label="보존 시설 복구 작업장">
  <div className="v36-workshop-title"><span>ARK / RECOVERY WORKSHOP</span><h3>시설 복구 작업장</h3><p>폐허에서 회수한 고철을 보존 시설로 연결합니다. 복구한 시설은 다음 날에도 계속 이용할 수 있습니다.</p><div className="v36-workshop-wallet"><b>고철 {s.scrap}개</b><span>부품 {s.parts}개</span><span>전력 {s.power}/100</span></div></div>
  <FacilityPowerDispatch state={s} onMove={(id,delta)=>{const n=setFacilityPowerPriority(s,id,delta);if(n!==s){setS(n);report(s,n,'?? ?? ????')}}}/><BaseUpgrades state={s} onUpgrade={id=>{const n=upgradeBase(s,id);setS(n);report(s,n,'기지 강화')}}/><div className="v36-workshop-grid">{(Object.keys(facilityRecipes) as FacilityId[]).map((id,i)=>{const r=facilityRecipes[id];const done=s.facilities[id];const available=s.scrap>=r.scrap&&s.parts>=r.parts&&s.power>=r.power;return <article className={'v36-facility-card '+(done?'is-built ':'')+(facilityBuildFlash===id?'is-installing':'')} key={id}><span className="v36-facility-index">REPAIR // {String(i+1).padStart(2,'0')}</span><div className="v36-facility-head"><h4>{r.name}</h4><span>{done?'작동 중':available?'복구 가능':'자원 부족'}</span></div><p>{r.description}</p><div className="v36-facility-cost"><span>{done?'시설 가동 중':available?'복구 자원 확보':'자원 부족 · 보급 필요'}</span></div><strong>{r.benefit}</strong>{facilityBuildFlash===id&&<div className="v80-build-sequence" role="status" aria-live="polite"><b>설비 조립 · 배선 연결 · 전원 확인</b><span><i/></span><small>{r.name} / ONLINE</small></div>}<button type="button" disabled={done||!available||s.phase!=='day'||!!s.run||!!s.pending||!!s.pendingIncident} onClick={()=>constructFacility(id)}>{done?'시설 복구 완료':available?'고철 사용 · 복구 실행':'복구 자원 확보 필요'}</button></article>})}</div>
 </section><div className="supply-grid v44-supply-grid">{([['food','사료 ×3',90,'하루 급식과 개체 회복'],['med','의약품 ×2',145,'동물 치료와 현장 응급 처치'],['parts','시설 부품 ×3',115,'발전기·격리실 수리'],['filter','바이오필터 ×2',170,'감염 노출 감소'],['battery','전지 ×2',120,'손전등 및 장비 충전'],['fuel','연료 ×4',110,'매일 발전기 유지 · 연료 부족 시 시설 손상'],['room','격리실 추가',480,'수용 개체 수 증가'],['serum','MUTANT 억제 주사 ×1',360,'변이체 탈출 위험을 3일간 낮춤 · 변이 복구 불가']] as const).map(([id,name,price,desc])=><button key={id} onClick={()=>mutate(s=>purchase(s,id))} disabled={s.credits<price}><Package size={22}/><b>{name}</b><small>{desc}</small><strong>{price} CR</strong></button>)}</div><div className="supply-service v44-supply-service"><button onClick={()=>action('recharge')} disabled={s.ap<1||s.parts<1}><Zap/> 발전기 재가동 · 부품 1 / AP 1</button><button onClick={()=>action('repair')} disabled={s.ap<1||s.parts<1}><Shield/> 시설 수리 · 부품 1 / AP 1</button><button onClick={()=>action('decontam')} disabled={s.ap<1||s.filters<1}><Wind/> 제독 · 바이오필터 1</button><button onClick={()=>action('batteryCharge')} disabled={s.ap<1||s.electricCells<1||s.power<12||s.flashlight>=100}><BatteryCharging/> 손전등 충전 · AP 1 / 전력 12 / 전지 1 · +38%</button></div></div>}
{tab==='records'&&<div className="tab-content"><section className="ark-knowledge-summary"><div><b>지식 {s.knowledge}</b><small>행동 분석 힌트와 후반 면역 연구에 사용</small></div><div><b>기록 단서 {s.clues}</b><small>본부 기밀 기록과 미확인 생체 신호 접근 조건에 반영</small></div></section>{s.tutorialArchiveReviewPending&&s.headquarters.pendingAnimal==='rabbit'&&<section className="v50-archive-transfer v52-archive-next" data-tour="archive-transfer" role="status"><span>FIRST SYNCHRONIZATION // VERIFIED</span><div><strong>흰 토끼 · 공명 100% 기록 보관 완료</strong><p>EVE의 교정 과정을 포함해 선택과 반응이 분석실에 저장되었습니다. 기록을 확인한 뒤 상단 본부 통신에서 첫 개체를 이송하십시오. 본부의 파견 인력은 생체 인계가 완료된 다음 날부터 순차적으로 도착합니다. <b>인계 후 토끼 개체는 돌아오지 않습니다.</b></p></div><button className="v10-primary" onClick={()=>enterTab('hq')}>본부 통신에서 이송 결정 <ChevronRight size={15}/></button></section>}<OriginZeroPanel state={s} mode="records" onReplay={number=>dialogue(originPhotoDialogue(s,number))} onUpdate={next=>{setS(next);setRunFeedback(next.lastOutcome);const lines=originDialogue(s,next);if(lines.length)dialogue(lines);}}/><NarrativeArchive state={s} onDecide={next=>{setS(next);setRunFeedback(next.lastOutcome);beep(540)}}/><SpecimenArchive state={s} onDissection={onArchiveDissection} animalSrc={img}/></div>}
</div>{statusOpen&&<button className="v43-drawer-backdrop" onClick={()=>setStatusOpen(false)} aria-label="상태 상세 닫기"/>}
{statusOpen&&<aside id="v43-status-panel" className="v10-right v43-status-drawer" role="dialog" aria-modal="true" aria-label="시설과 자원 상세 상태"><div className="v43-drawer-title"><div><span>ARK // STATUS</span><b>운영 현황</b></div><button onClick={()=>setStatusOpen(false)} aria-label="닫기"><X size={18}/></button></div><Tile title="시설 전력 · 상시 계측" extra={<Zap size={16}/>} className="electric-box"><div className="big-power"><b>{s.power}%</b><span>{s.power>=40?'전력망 정상':s.power>0?'전력 부족':'시설 정전'}</span></div><Bar v={s.power} color={s.power<25?'#e97888':'#7ee2e4'}/><div className="right-data"><span>손전등 잔량</span><strong>{s.flashlight}%</strong></div><div className="right-data"><span>예비 전지</span><strong>{s.electricCells}개</strong></div><div className="right-data"><span>시설 안정성</span><strong>{s.facility}%</strong></div></Tile><Tile title="외부 감염·위협" extra={<AlertTriangle size={16}/>}><div className="risk-block"><span>바이러스 감염도</span><b>{s.infection}%</b><Bar v={s.infection} color="#e9a461"/><small>오염이 높아지면 인체와 개체 건강 악화</small></div><div className="risk-block"><span>외부 위협도</span><b>{s.threat}%</b><Bar v={s.threat} color="#e66b85"/><small>방어 준비·시설 정비로 조절 가능</small></div><div className="event-signal"><span>야간 특별 사건 예상</span><b>{incidentWeight(s)}%</b><small>감염·시설 손상·위협·개체 수가 확률에 반영돼요.</small></div></Tile><Tile title="자원 현황" extra={<Package size={15}/>}><div className="right-data"><span>보존 크레딧</span><strong>{s.credits} CR</strong></div><div className="right-data"><span>식량 / 치료제</span><strong>{s.food} / {s.medicine}</strong></div><div className="right-data"><span>부품 / 필터 / 고철</span><strong>{s.parts} / {s.filters} / {s.scrap}</strong></div><div className="right-data"><span>변이체 억제 주사</span><strong>{s.mutantSerum}개</strong></div><div className="right-data"><span>지식 / 단서</span><strong>{s.knowledge} / {s.clues}</strong></div><div className="v42-knowledge-uses"><b>지식 활용</b><span>관찰: 무료로 직접 판단</span><span>병리실: 검체·사후 검시</span><span>보유량: 기밀 기록 해금</span></div></Tile><Tile title="기밀 기록 사진" extra={<Search size={14}/>}><button className="v43-photo-link" onClick={()=>{setStatusOpen(false);setInspect(true)}}><img src={img('hidden-photo')} style={{filter:`blur(${s.originZero?.firstPositiveDay?0:12}px)`}} alt="복원 중인 사진"/><span>기록 No.00 · 복원도 {s.originZero?.firstPositiveDay?Math.round((s.originZero.photos/12)*100):0}% <ChevronRight size={14}/></span></button></Tile></aside>}</div>
<div className="v10-bottom v70-bottom"><div className="v10-status v43-bottom-status"><span title="시설 가동 상태"><Zap size={13}/> 전력 <b>{s.power}%</b></span><span title="발전기 일일 연료"><Zap size={13}/> 연료 <b>{s.fuel}</b></span><span title="외부 공격·사건 위험"><AlertTriangle size={13}/> 위협 <b>{s.threat}%</b></span><span title="보존 구역의 보호 개체"><PawPrint size={13}/> 개체 <b>{live.length}/{s.rooms}</b></span><span title="현재 보유 크레딧"><Package size={13}/> <b>{s.credits} CR</b></span><span title="행동력 상태">AP <b>{s.ap}/{s.start==='station'&&s.day<=2?5:4}</b></span></div>{dayEndBlocker&&<div className="v70-day-blocker" role="status"><AlertTriangle size={14}/><span>{dayEndBlocker.message}</span><button type="button" onClick={()=>{setLockNotice(dayEndBlocker.message);enterTab(dayEndBlocker.tab)}}>{dayEndBlocker.actionLabel} <ChevronRight size={13}/></button></div>}<button type="button" className="v10-primary" title={dayEndBlocker?.message??(s.ap===0?'AP가 0이어도 다음 날로 진행할 수 있습니다.':'야간 대응 방식을 선택합니다.')} data-tour="night-end" onClick={openDayEnd}><Moon size={16}/> {dayEndBlocker?'진행 차단 사유 확인':s.ap===0?'AP 0 · 야간 대응으로 다음 날':s.power<5?'전력 없음 · 무방비 야간 대응':'하루 종료 · 야간 대응'}</button></div>
</main>
{v42Telemetry&&<div className="v42-telemetry" role="status" aria-live="polite" aria-label="실시간 상태 변화"><div className="v42-telemetry-head"><Radio size={12}/> EVE // 실시간 판정</div>{v42Telemetry.entries.map((event,i)=><div className={'v42-float-delta '+(event.bad?'loss':'gain')+' v42-delta-'+event.kind} key={`${v42Telemetry.tick}-${i}`} style={{animationDelay:`${i*65}ms`}}><span>{event.label}</span><b>{event.before}{event.unit} → {event.after}{event.unit} <small>({event.delta>0?'+':''}{event.delta}{event.unit})</small></b></div>)}</div>}
{awakening&&!aftermath&&!confirmRestart&&(()=>{const profile=awakeningProfiles[awakening.id];const animal=s.animals.find(a=>a.id===awakening.id);const stage=awakening.stage;const text=[`이상 신호가 발생했습니다. ${animal?.name||'개체'}의 움직임이 멈춥니다.`,profile.animalCry,profile.firstWords,profile.secondWords,'관리자님. 해당 개체에게서 인간 언어에 가까운 발화가 검출되었습니다.',profile.manager][stage];const name=stage<2?animal?.name:stage<4?'??? · 미확인 음성':stage===4?'EVE · 안내 시스템':'담당자 000';return <div className="awakening-shade" role="dialog" aria-modal="true" aria-label="의식 이상 발현"><div className="awakening-scene"><div className="awakening-noise"/><div className="awakening-top"><span>ARK // IRREVERSIBLE MUTATION</span><b>돌연변이 임계 초과 · 개체 신경 조직 재구성</b><small>{stage+1} / 6</small></div><div className="awakening-visual">{stage===4?<img className="awakening-avatar eve" src={img('eve-hologram')} alt="EVE"/>:stage===5?<img className="awakening-avatar" src={img('protagonist-young')} alt="관리자"/>:<img className={'awakening-animal '+(stage>=2?'transformed':'')} src={animalArt(animal!)} alt={animal?.name||'개체'}/>}<div className="awakening-signal">{stage<2?'MUTANT STATE CONFIRMED':stage<4?'HUMAN VOICE DETECTED':'PERMANENT ALTERATION'}</div></div><div className="awakening-subtitle"><span>{name}</span><p>{text}</p></div><button className="awakening-next" onClick={()=>{if(stage>=5){setAwakening(null);setSelectedAnimal(awakening.id);setTab('animals')}else setAwakening(x=>x?{...x,stage:x.stage+1}:null)}}>{stage===5?'격리실로 돌아가기':'계속 보기'} <ChevronRight size={17}/></button></div></div>})()}
{current&&!cinematic&&!confirmRestart&&<StoryConversation state={s??undefined} lines={talk} index={talkIdx} shown={letters} previousTalk={previousTalk} advanceTalk={advanceTalk} revealTalk={revealTalk} skipTalk={skipTalk} speed={talkSpeed} onSpeed={setTalkSpeed}/>}

{/* A real staff vote exists only after a 10-day night and only for already recruited people. */}
{s.pathologyPending&&!current&&!aftermath&&!result&&!cinematic&&!awakening&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true" aria-label="병리 검사 후속 결정"><div className="v10-modal event-modal v67-path-event-modal"><span className="micro-label">ARK // PATHOLOGY · CASE REVIEW</span><h2>{s.pathologyPending.success?'검사 성공 · 후속 처리':'검사 실패 · 원인 보고'}</h2><p>{s.pathologyPending.detail}</p><p>이 보고서는 다음 사건과 본부 감시 수준에 영향을 줍니다. 어떤 기록을 남길까요?</p><div className="event-options"><button type="button" onClick={()=>finishPathology('archive')}><span>01</span> 내부에 기록 보관 <small>추가 조사 · 직원 신뢰 유지</small></button><button type="button" onClick={()=>finishPathology('headquarters')}><span>02</span> 본부에 결과 보고 <small>보급 확보 · 본부 관심 증가</small></button></div></div></div>}
{s.crew?.pendingNightVote&&!current&&!aftermath&&!cinematic&&!awakening&&!nightView&&!confirmRestart&&<div className="v10-modal-shade v48-night-shade" role="dialog" aria-modal="true" aria-label="야간 인력 우선 업무 결정">
 <section className="v10-modal v48-night-modal">
  <span className="micro-label">ARK // STAFF CONFLICT · NIGHT {String(s.crew.pendingNightVote.day).padStart(2,'0')}</span>
  <h2>오늘 밤, 누구의 말을 들을 것인가</h2>
  <p className="v48-night-explain">EVE: 한 번의 야간 지원만 허가됩니다. 누군가를 선택하면 나머지 배치 인력은 자신이 버려졌다고 느낍니다. <strong>선택받지 못한 직원마다 정신력 -10.</strong> 아직 영입하지 않은 인력은 나타나지 않습니다.</p>
  <div className="v48-night-options">
  {s.crew.pendingNightVote.members.map(id=>{
    const m=s.crew!.members.find(x=>x.id===id);if(!m)return null;
    const benefits:Record<CrewId,{title:string;effect:string;quote:string}>={
      rabbit:{title:'생체 치료',effect:'담당자 정신력 +8 · 격리 개체 건강 +10',quote:'오늘 밤은 치료가 우선이에요. 부디 숨 쉬게 해 주세요.'},
      fox:{title:'보급 정리',effect:'부품 +1 · 식량 +2',quote:'재고가 먼저입니다. 모두를 구할 물자부터 남겨야죠.'},
      wolf:{title:'보안 강화',effect:'외부 위협 -10 · 시설 안정 +4',quote:'문이 뚫리면 치료고 보급이고 소용없어요!'},
      deer:{title:'기록 정리',effect:'지식 +6 · 시설 감염 -4',quote:'빠진 기록을 찾을게요. 제가 잘할 수 있는 일이에요.'}
    };
    return <button key={id} type="button" className="v48-night-choice" onClick={()=>chooseCrewNight(id)}>
      <StaffPortrait id={id} className="v53-vote-portrait"/>
      <span className="v48-night-choice-body"><small>{CREW_PROFILES[id].post} · 정신 {m.mind}/100</small><b>{benefits[id].title}</b><em>“{benefits[id].quote}”</em><strong>{benefits[id].effect}</strong></span><ChevronRight size={18}/>
    </button>;
  })}
  </div>
  <p className="v48-night-foot">현재 영입된 {s.crew.pendingNightVote.members.length}명만 참여 · 선택은 되돌릴 수 없고, 10일 후 다시 회의가 열립니다.</p>
 </section>
</div>}

{nextIncident&&!cinematic&&!s.crew?.pendingNightVote&&!aftermath&&!current&&!awakening&&!nightView&&!inspect&&!confirmRestart&&!result&&!memoryTarget&&!s.pending&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal event-modal"><span className="micro-label">SPECIAL EVENT / 원인과 결과</span><h2><AlertTriangle/> {nextIncident.title}</h2><IncidentArtwork id={nextIncident.id} title={nextIncident.title}/><p>{nextIncident.desc}</p><div className="event-cause">발생 징후: {nextIncident.cause}<br/>현재 위협 {s.threat}% · 감염 {s.infection}% · 전력 {s.power}%</div><div className="event-options v39-incident-options">{[...nextIncident.options,...([0,1,2].every(i=>!previewIncident(s,i).available)?['비상 대기']:[])].map((optionText,i)=>{const preview=previewIncident(s,i);return <button key={i} disabled={!preview.available||incidentTask!==null} onClick={()=>{if(i===3||['garden','keepsake','quiet'].includes(nextIncident.id))resolveEvent(i);else setIncidentTask(i)}}><span className="v39-incident-number">0{i+1}</span><span className="v39-incident-copy"><strong>{optionText}</strong>{!preview.available&&<small>필요 자원 부족</small>}</span><ChevronRight size={15}/></button>})}</div>{incidentTask!==null&&<FieldCalibration key={nextIncident.id+'-'+incidentTask} title="현장 대응 · 안전 조작" description="선택한 조치를 실행합니다. 안정 구간을 놓치면 추가 시설 손상이 발생합니다." onCancel={()=>setIncidentTask(null)} onFinish={q=>resolveEvent(incidentTask,q)}/>}</div></div>}
{aftermath&&!current&&!awakening&&!confirmRestart&&!result&&!nightView&&!inspect&&!memoryTarget&&<div className="v10-modal-shade v39-after-shade" role="dialog" aria-modal="true" aria-label="EVE 대응 결과 보고"><div className={'v10-modal v39-after-modal '+(aftermath.critical?'has-loss':'')}><span className="micro-label">EVE // DAMAGE ASSESSMENT</span><div className="v39-after-top"><AlertTriangle size={24}/><div><h2>{aftermath.title}</h2><p>{aftermath.critical?'작전 실패 또는 방어 불능 · 피해 보고':'사건 처리 완료 · 자원 정산'}</p></div></div><div className="v39-after-effects">{aftermath.entries.length?aftermath.entries.map((d,i)=><div key={i} className={deltaIsBad(d.name,d.delta)?'negative':'positive'}><span>{d.name}{d.before!==undefined&&<small> {d.before} → {d.after}</small>}</span><strong>{d.delta>0?'+':''}{d.delta}{d.unit}</strong></div>):<p>계측 가능한 자원 증감은 없습니다.</p>}</div><p className="v39-after-summary">{aftermath.notes}</p><button className="v10-primary wide" onClick={()=>{setAftermath(null);setRewardReport(null)}}>보고 확인 · 다음 일과 <ChevronRight size={15}/></button></div></div>}

{fieldRewardModal&&!current&&!result&&!captureReveal&&!aftermath&&!awakening&&!nightView&&!confirmRestart&&<div className="v10-modal-shade v41-rewards-shade" role="dialog" aria-modal="true" aria-label={fieldRewardModal.kind==='settlement'?'현장 탐사 최종 보상':'현장 탐색 보상'}>
 <section className="v10-modal v41-rewards-modal">
  <div className="v41-rewards-heading"><span className="v41-reward-icon"><Package size={25}/></span><div><span className="micro-label">{fieldRewardModal.kind==='settlement'?'MISSION COMPLETE // EXPEDITION LEDGER':'SUPPLY SECURED // FIELD DISCOVERY'}</span><h2>{fieldRewardModal.title}</h2></div></div>
  {fieldRewardModal.settlement&&<div className="v41-settlement-metrics"><span>이동 <strong>{fieldRewardModal.settlement.steps}칸</strong></span><span>현장 단서 <strong>{fieldRewardModal.settlement.clues}건</strong></span><span>회수 점수 <strong>{fieldRewardModal.settlement.loot}점</strong></span></div>}
  <div className="v41-rewards-list" aria-live="polite">{fieldRewardModal.entries.length?fieldRewardModal.entries.map((entry,i)=><div className="v41-reward-entry" key={i}><span><CheckCircle2 size={16}/>{entry.name}</span><strong>+{entry.delta.toLocaleString()}{entry.unit}</strong></div>):<div className="v41-empty-reward">이번 탐사에서 확보한 물자가 없습니다. 위험과 이동 내역만 기록되었습니다.</div>}</div>
  {fieldRewardModal.settlement&&<div className="v41-capture-ledger"><b><PawPrint size={15}/> 개체 처리 기록</b>{fieldRewardModal.settlement.captures.length?fieldRewardModal.settlement.captures.map((record,i)=><div key={i}><span>{specs.find(a=>a.id===record.id)?.name||record.id}</span><strong className={record.result==='secured'?'secured':''}>{record.result==='secured'?'격리실 구조 성공':record.result==='treated'?'현장 치료':record.result==='released'?'방생':'구조 실패'}</strong></div>):<small>이번 탐사에서 확보하거나 처리한 개체는 없습니다.</small>}</div>}
  <p className="v41-rewards-note">{fieldRewardModal.kind==='settlement'?'위 수량은 현장에서 즉시 회수한 물자와 귀환 시 정산한 보상의 합계입니다. 중복 지급되지 않습니다.':'획득 물자는 즉시 보관함에 반영되었습니다. 이 화면을 닫으면 남은 구역을 계속 탐색할 수 있습니다.'}</p>
  <button className="v10-primary wide v41-reward-confirm" type="button" onClick={()=>{const exhausted=fieldRewardModal?.kind==='settlement'&&fieldRewardModal.settlement?.reason?.includes('탈진');setFieldRewardModal(null);if(exhausted)dialogue([{speaker:'관리자',text:'제길... 다리에 힘이 안 들어가. 더는 못 걷겠어.'},{speaker:'EVE',text:'이동용 ST가 모두 소진돼 긴급 철수했습니다. 다음 탐사는 ST 50으로 시작합니다. 출구까지 정상 귀환하면 그다음 출동에서 ST 100을 회복합니다.'}]);}}>{fieldRewardModal.kind==='settlement'?'최종 정산 확인 · 탐사 메뉴로':'보상 확인 · 계속 수색'} <ChevronRight size={16}/></button>
 </section></div>}
{captureReveal&&s.pending===captureReveal.id&&!current&&!result&&!awakening&&!confirmRestart&&<div className="v10-modal-shade v40-discovery-shade" role="dialog" aria-modal="true" aria-label="숨겨진 동물 발견 확인">
 <section className="v40-discovery-card" aria-live="polite">
  <div className="v40-discovery-scene ark-capture-scene" data-method={captureReveal.method??'net'}><ArtSlot src={gameplayArt.captureStage}/>
   <div className="v40-pixel-lights" aria-hidden="true"><i/><i/><i/><i/><i/></div>
   <span className="v40-discovery-scan">ARK // CAPTURE SEQUENCE · LIVE TARGET</span>
   <span className="v40-reveal-halo" aria-hidden="true"/>
   <img className="v40-discovered-animal" src={img(captureReveal.id)} alt={`수풀에서 찾아낸 ${specs.find(a=>a.id===captureReveal.id)?.name||'동물'}`} />
   <span className="v40-discovery-ground" aria-hidden="true"/><div className="ark-capture-restraint" aria-hidden="true"/><div className="ark-capture-stamp" aria-hidden="true">CAPTURE SUCCESS</div>
   <span className="v40-discovery-target" aria-hidden="true"><i/><i/><i/><i/></span>
  </div>
  <div className="v40-discovery-copy">
   <span className="v40-discovery-kicker">CAPTURE CONFIRMED {captureReveal.cell!==null?`/ ${String.fromCharCode(65+captureReveal.cell%(captureReveal.size??6))}${Math.floor(captureReveal.cell/(captureReveal.size??6))+1}`:''}</span>
   <h2>개체 <em>포획 성공</em></h2><h3>{specs.find(a=>a.id===captureReveal.id)?.name||'미확인 개체'} · 현장 확보 완료</h3>
   <p>포획 장치가 고정되었습니다. 이제 이송·현장 치료·방생 중 하나를 선택하십시오. 격리실 배정 전까지 수용은 확정되지 않습니다.</p>
   <div className="v40-discovery-confirm"><span>● 포획 성공</span><span>● 생체 신호 유지</span><span>● 처리 명령 대기</span></div>
   <button type="button" className="v40-discovery-next" onClick={confirmCaptureReveal}>수신 확인 · 구조 절차로 <ChevronRight size={18}/></button>
  </div>
 </section>
</div>}
{s.pending&&!captureReveal&&!aftermath&&!current&&!result&&!memoryTarget&&!awakening&&!confirmRestart&&<div data-tour="rescue" className="v10-modal-shade ark-recovery-shade" role="dialog" aria-modal="true" aria-label="구조 판단"><section className="v10-modal ark-recovery-modal"><div className="ark-recovery-scene"><ArtSlot src={gameplayArt.recoveryStage}/><img className="ark-recovery-fallback" src={img(s.pending)} alt={specs.find(a=>a.id===s.pending)?.name||'발견 개체'}/><span>FIELD RECOVERY</span></div><div className="ark-recovery-body"><span className="micro-label">BIOLOGICAL SIGNAL / 구조 판단</span><h2>{specs.find(a=>a.id===s.pending)?.name} · {s.tacticalCaptured?'포획 완료':'발견'}</h2><div className="ark-recovery-metrics"><div><small>이송 상태</small><b>{freeRooms.length?'준비 가능':'수용 불가'}</b></div><div><small>관리자 감염</small><b>{s.infection}%</b></div><div><small>격리 여유</small><b>{freeRooms.length}/{s.rooms}</b></div></div><p>격리 이송은 위험을 동반합니다. 현장 치료는 다음 만남을 유리하게 만들고, 방생은 자원을 보존합니다.</p><div className="ark-room-picker" role="group" aria-label="이송 격리실 지정">{freeRooms.length?freeRooms.map(r=><button key={r} aria-pressed={chosenRoom===r} onClick={()=>setRescueRoom(r)}>{roomWing(r)}-{String(r).padStart(2,'0')}</button>):<strong>빈 격리실 없음 · 이송 불가</strong>}</div><div className="event-options"><button disabled={!freeRooms.length||rescueTask!==null} onClick={()=>setRescueTask('secure')}><span>01</span>격리실로 구조한다 <small>{chosenRoom?roomWing(chosenRoom)+'-'+String(chosenRoom).padStart(2,'0')+' 배정':'빈 격리실 필요'}</small></button><button disabled={s.medicine<1||rescueTask!==null||(s.pending==='rabbit'&&s.lifeSaved===0&&s.tutorialStep<=3)} onClick={()=>setRescueTask('treat')}><span>02</span>현장에서 치료한다 <small>다음 조우 유리 · 기록 확보</small></button><button disabled={rescueTask!==null||(s.pending==='rabbit'&&s.lifeSaved===0&&s.tutorialStep<=3)} onClick={()=>rescue('release')}><span>03</span>거리를 두고 돌려보낸다 <small>자원 보존 · 경계 완화</small></button></div>{rescueTask&&<FieldCalibration key={s.pending+'-'+rescueTask} title={rescueTask==='secure'?'이송 장치 잠금 · 안정화':'현장 치료 · 안정 신호 확인'} description={rescueTask==='secure'?'세 번의 안정 구간에서 잠금 신호를 맞추세요. 숙련도에 따라 이송 성공 가능성이 달라집니다.':'안정 구간에 맞춰 치료합니다. 좋은 치료는 다음 조우에 더 큰 도움을 줍니다.'} onCancel={()=>setRescueTask(null)} onFinish={q=>rescue(rescueTask,q)}/>}</div></section></div>}
{result&&!aftermath&&!current&&!awakening&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal result-v10"><div className="result-image ark-result-scene" data-success={result.success}><ArtSlot src={gameplayArt.result(resultArtKey(result.title,result.success))}/><span className="ark-result-stamp">{result.title}</span>{result.animalId&&<img className="echo-result-animal" src={img(result.animalId)} alt={specs.find(a=>a.id===result.animalId)?.name||'구조 개체'}/>}</div><div className="result-copy"><span className="micro-label">OPERATION REPORT</span><h2 className={result.success?'good':'bad'}>{result.title}</h2><p>{result.text}</p>{rewardReport&&<div className="v11-result-ledger">{rewardReport.entries.map((item,i)=><span key={i} className={item.delta>0?'reward-gain':'reward-loss'}>{item.name} <b>{item.delta>0?'+':''}{item.delta}{item.unit}</b></span>)}</div>}<button className="v10-primary wide" onClick={()=>{setResult(null);setRewardReport(null);if(s.run&&s.field)setTab('expedition')}}>{s.run&&s.field?"결과 확인 · 현장 수색 계속하기":"결과 확인 · 계속하기"}</button></div></div></div>}
{s.headquarters?.pendingScene&&!aftermath&&s.phase!=='ending'&&!current&&!result&&!awakening&&!confirmRestart&&!s.headquarters.pendingAnimal&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal hq-story-modal"><span className="micro-label">ENCRYPTED DIRECTIVE · {s.headquarters.revealStage}/3</span><h2>{hqScene[s.headquarters.pendingScene].title}</h2><div className="hq-story-lines">{hqScene[s.headquarters.pendingScene].lines.map((line,i)=><p key={i}>{line}</p>)}</div><button className="v10-primary wide" onClick={closeHQScene}>기록을 보존한다 <ChevronRight size={16}/></button></div></div>}
{s.archive?.revealPending&&!aftermath&&s.phase==='day'&&!current&&!result&&!awakening&&!nightView&&!inspect&&!memoryTarget&&!careDialog&&!s.pending&&!confirmRestart&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade v37-truth-shade" role="dialog" aria-modal="true" aria-label="병리실 기밀 발견"><div className="v10-modal v37-truth-modal"><span className="micro-label">TOP SECRET // THE PROTOCOL WAS NEVER FOR THE ANIMALS</span><h2>병리실 원본 기록 복구</h2><div className="v37-sequence" key={archiveSceneStep}><span>{String(archiveSceneStep+1).padStart(2,'0')} / 05 · EVE / 수신처 원본</span><p>{[
 '본부 이송 명세에서 "신경 조직 회수"와 "의식 안정화 약물"이라는 항목이 반복됩니다.',
 '동물은 감염병에 강했습니다. 면역성을 보였던 인간의 뇌 조직은 동물의 신경계에 이식되었습니다.',
 '정상적인 인간의 인지가 깨어나면 동물의 육체와 신경계가 충돌했습니다. 연구진은 의도적으로 인지 기능을 낮추고 기억을 잠재웠습니다.',
 '공명 100%는 회복이 아니었습니다. 본부가 활성화된 신경 조직을 수거하기 위한 신호였습니다.',
 '담당자님이 보내셨던 개체의 처리 기록이 모두 남아 있습니다. 분석실의 원래 명칭은 "해부실"입니다.'
 ][archiveSceneStep]}</p></div><button className="v10-primary wide" onClick={advanceArchiveTruth}>{archiveSceneStep===4?'기록 확인 · 해부실 해금':'다음 기밀 문서'} <ChevronRight size={16}/></button></div></div>}
{s.archive?.pendingGifts>0&&!aftermath&&!s.archive.revealPending&&s.phase==='day'&&!current&&!result&&!awakening&&!nightView&&!inspect&&!memoryTarget&&!careDialog&&!s.pending&&!confirmRestart&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade v37-gift-shade" role="dialog" aria-modal="true" aria-label="본부 지원 물품 선택"><div className="v10-modal v37-gift-modal v54-sample-reward"><span className="micro-label">HEADQUARTERS / PRIORITY SUPPORT</span><h2>신경 조직 표본 송신 · 특별 보상</h2><p>해부·병리로 채취한 신경 조직 표본을 본부에 송신한 보상입니다. 생체 개체 인계에서는 고급 보상이 지급되지 않습니다.</p><div className="v37-gift-options"><button disabled={s.archive.bonuses.tracking} onClick={()=>onChooseArchiveGift('tracking')}><Compass size={22}/><strong>본부 특수 운송 케이지</strong><span>포획 행동 기회 영구 +3</span></button><button disabled={s.archive.bonuses.power} onClick={()=>onChooseArchiveGift('power')}><Zap size={22}/><strong>무인 발전 제어기</strong><span>매일 새벽 전력 자동 +30 (최대 100)</span></button><button onClick={()=>onChooseArchiveGift('serum')}><HeartPulse size={22}/><strong>신경 억제 혈청</strong><span>MUTANT 진정 주사 3개 즉시 지급</span></button></div><p className="muted">남은 지원권 {s.archive.pendingGifts}건 · 본부의 실제 실험 목적은 연구 기록에 남습니다.</p></div></div>}
{nightView&&!aftermath&&!current&&!awakening&&!confirmRestart&&!inspect&&!memoryTarget&&!result&&!s.pending&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal night-modal v60-night-modal"><button className="modal-x" onClick={()=>{setNightView(false);setNightWiringOpen(false)}} aria-label="야간 운영 닫기"><X size={18}/></button><span className="micro-label">NIGHT PROTOCOL // EVE POWER ALLOCATION</span><h2>밤이 오기 전에</h2><div className="v59-night-eve"><Radio size={16}/><span>{guidedNight?'EVE: 오늘은 첫 야간 실습입니다. 예비 전력으로 격리문 방어를 가동합니다. 노란색 선택지만 확인하세요.':'EVE: 방어는 전력을 더 사용해 위험을 낮춥니다. 휴식은 정신력을 회복하지만 경계가 약해지고, 경비 중단은 위협을 높입니다. 선택은 담당자님께 달려 있습니다.'}</span></div><div className="v60-night-head"><strong>현재 시설 전력 <b>{s.power}%</b></strong><span>야간 유지비 최대 6%</span></div><div className="night-choices v60-night-choices">{([['shield','격리문 · 방어 강화',22,'외부 위협 감소 · 시설 보호'],['rest','관리자 휴식',5,'정신력 회복 · 감시 위험'],['standby','경비 중단',0,'전력 절약 · 사고 위험 증가']] as const).map(([id,name,cost,desc])=><button type="button" key={id} className={(guidedNight?(id==='shield'?'active v60-night-guided':'v60-night-locked'):(nightChoice===id?'active':''))} disabled={guidedNight&&id!=='shield'} onClick={()=>setNightChoice(id)}><b>{name}{guidedNight&&id==='shield'&&<span> · 첫날 고정</span>}</b><strong>전력 -{cost}%</strong><small>{desc}</small></button>)}</div><NightWatchPlan state={s} onChoose={choice=>setS(chooseNightResponse(s,choice))}/><button type="button" className={'ark-night-circuit '+(fuseState?.completed?'ready':'danger')} onClick={()=>setNightWiringOpen(v=>!v)}><span><Zap size={18}/> 야간 보조회로 · 배선 정비</span><b>{fuseState?.completed?'연결 완료 · 방어 가능':(s.wiring?.night?.day===s.day&&s.wiring.night.faults>=3)?'정비 실패 · 무방비':guidedNight?'첫 야간 실습 · 예비 회로 제공':'방어 강화 시 필수 · 직접 정비 또는 부품 사용'}</b><ChevronRight size={16}/></button>{nightWiringOpen&&!fuseState?.completed&&<section className="ark-night-inline"><b>보조회로 정비</b><small>낮은 전압부터 순서대로 연결. 완료 시 정신력 3 소모. 실패하면 예비 부품으로 대체 가능.</small><div className="ark-night-terminal-grid">{[0,1,2,3].map(i=><button key={i} disabled={nightFuseOrder.includes(i)||nightFuseFaults>=3||s.mind<4} onClick={()=>mutate(prev=>attemptNightCircuit(prev,i))}>{nightFuseOrder.includes(i)?'✓ ':''}{String.fromCharCode(65+i)} · {nightCircuitVoltage(s.day,i)}V</button>)}</div><small>연결 {nightFuseOrder.length}/4 · 오류 {nightFuseFaults}/3</small><button disabled={s.parts<1} onClick={()=>mutate(installNightSpare)}>예비 회로 장착 · 부품 1개</button></section>}<NightDispatchForecast state={s} power={nightPreview?.powerAfter??0}/><div className={'power-result v60-night-result'+(nightPreview?.applied==='standby'?' is-critical':'')}><span>{nightChoice==='shield'&&!guidedNight&&!fuseState?.completed?'방어 강화 · 회로 정비 필요':nightPreview?.applied!==nightChoice&&!guidedNight?'선택한 작전의 전력 부족':'야간 종료 예상 전력'}{nightFuseOrder.length===4?' · 보조회로 정비 +4':''}</span><strong>{nightPreview?.powerAfter??0}% · 연료 {nightPreview?.fuelBefore??s.fuel} → {Math.max(0,(nightPreview?.fuelBefore??s.fuel)-(nightPreview?.fuelCost??0))}</strong><small>{nightPreview?.fuelShortfall?"연료 없음 · 시설 손상 및 위협 증가":"발전기 연료 1 소모"}</small><small>바이오필터 {nightPreview?.filtersBefore??s.filters} → {Math.max(0,(nightPreview?.filtersBefore??s.filters)-(nightPreview?.filterCost??0))}{nightPreview?.filterShortfall?" · 필터 부족 시 감염 +7, 사건 위험 +4":" · 야간 정화 필터 1개 소모"}</small></div><div className="modal-actions"><button onClick={()=>setNightView(false)}>돌아가기</button><button className="v10-primary" disabled={!guidedNight&&(nightChoice==='shield'&&!fuseState?.completed||nightPreview?.applied!==nightChoice)} onClick={()=>applyNight()}>{guidedNight?'예비 전력 방어 · 첫날 종료':nightChoice==='shield'&&!fuseState?.completed?'보조회로 정비 필요':nightPreview?.applied!==nightChoice?'전력 부족':nightChoice==='standby'?'무방비로 다음 날':'야간 운영 확정'} <ChevronRight size={16}/></button></div></div></div>}
{careDialog&&!aftermath&&!current&&!result&&!awakening&&!nightView&&!confirmRestart&&!inspect&&!memoryTarget&&!s.headquarters?.pendingScene&&!s.headquarters?.pendingAnimal&&(()=>{
 const animal=s.animals.find(a=>a.id===careDialog.id&&a.alive);
 if(!animal)return null;
 const scenario=getCareScenario(animal,careDialog.kind,s.day);
 return <div className="v10-modal-shade v36-care-shade" role="dialog" aria-modal="true" aria-label="보호 개체 행동 대응">
 <div className="v10-modal v36-care-modal"><header className="v36-care-modal-head"><div><span className="micro-label">ARK / BEHAVIORAL CARE</span><h2>{scenario.title}</h2><small>{CARE_ACTIONS[careDialog.kind].cost} · 행동 선택 후 실제 자원이 소모됩니다.</small></div><button type="button" className="v36-care-close" onClick={closeCare} aria-label="돌봄 닫기"><X size={19}/></button></header>
 <div className="v36-care-specimen"><img src={animalArt(animal)} alt={animal.name}/><div><span>현재 행동 관찰</span><p>{scenario.cue}</p><b>유대 {animal.bond}/100 · 스트레스 {animal.stress}/100</b></div></div>
 {!careOutcome?<><p className="v36-care-question">{scenario.question}</p>

<button type="button" className="ark-knowledge-hint" disabled={careHint||careTask!==null||s.knowledge<6} onClick={useCareKnowledge}>{careHint?'EVE 분석 단서 적용됨':'EVE 분석 · 지식 사용'}</button><div className="v36-care-options">{scenario.options.map((label,i)=><button type="button" className={careHint&&scenario.correct===i?'v42-analysis-recommended':''} key={i} disabled={careTask!==null} onClick={()=>setCareTask(i)}><span>{String(i+1).padStart(2,'0')}</span><b>{label}</b>{careHint&&scenario.correct===i&&<em className="v42-hint-pill">EVE 권장</em>}<ChevronRight size={17}/></button>)}</div>{careTask!==null&&<FieldCalibration key={'care-'+careDialog.id+'-'+careTask} title="반응 관찰 · 안정 신호 채집" description="신호가 안정 구간에 들어오는 순간 기록하세요. 관찰 품질이 실제 유대와 스트레스에 반영됩니다." onCancel={()=>setCareTask(null)} onFinish={q=>submitCare(careTask,q)}/>}<p className="v36-care-footnote">※ 정답을 누르기 전까지 행동력과 물자를 쓰지 않습니다. 대응을 선택하면 하루의 돌봄 행동 1회가 소모됩니다.</p></>:<div className={'v36-care-outcome '+(careOutcome.correct?'success':'failure')}><strong>{careOutcome.correct?'행동 대응 일치 · 안정화 성공':'행동 대응 불일치 · 신경 긴장 증가'}</strong><p>{careOutcome.message}</p><div className="v36-care-deltas v58-care-readout" aria-label="실제 돌봄 결과 전후 비교">
 {([{name:'유대',value:animal.bond,delta:careOutcome.delta.bond,color:'#8ddac9'},{name:'스트레스',value:animal.stress,delta:careOutcome.delta.stress,color:'#e7a0a4'},{name:'개체 건강',value:animal.hp,delta:careOutcome.delta.hp,color:'#c8a9e7'}] as const).map(metric=><DeltaDonut key={metric.name} label={metric.name} before={Math.max(0,Math.min(100,metric.value-metric.delta))} after={metric.value} color={metric.color} unit="/100" badWhenHigh={metric.name==='스트레스'} />)}
 <DeltaDonut label="행동 기록" before={Math.max(0,animal.records-careOutcome.delta.records)} after={animal.records} max={Math.max(3,animal.records)} color="#e6c38d" note="공명 연구에 반영"/>
 </div><small>행동 숙련도 {careOutcome.mastery}/2{careDialog.kind==='observe'&&careOutcome.correct?' · 공명 단서 복원 '+Math.min(3,careOutcome.mastery)+'/3':''}{careOutcome.tutorialUnlock?' · 첫 공명 연구 해금':''}</small><button className="v10-primary wide" type="button" onClick={closeCare}>{careOutcome.tutorialUnlock?'EVE의 공명 연구 안내 듣기':'격리실로 돌아가기'} <ChevronRight size={16}/></button></div>}
 </div></div>;
})()}
{memoryTarget&&!aftermath&&!current&&!result&&!awakening&&!confirmRestart&&<div className="v10-modal-shade v50-protocol-shade" role="dialog" aria-modal="true" aria-label="행동 강령 동기화"><div className="v10-modal memory-modal protocol-modal v50-protocol-modal"><button className="modal-x" onClick={()=>setMemoryTarget(null)} aria-label="닫기"><X size={17}/></button><div className="v50-protocol-head"><span className="micro-label">ARK-02 / NEURAL SYNCHRONIZATION</span><h2>{specs.find(a=>a.id===memoryTarget)?.name} · {protocols[memoryTarget as AnimalId].title}</h2><p>{protocols[memoryTarget as AnimalId].hint}</p></div><div className="v50-protocol-progress"><div className="protocol-stages">{[0,1,2].map(i=><span key={i} className={protocolStep===i?'active':protocolStep>i?'complete':''}>{['01 환경','02 반응','03 기억'][i]}</span>)}</div><span>{protocolStep+1} / 3</span></div>{s.tutorialStep===5&&memoryTarget==='rabbit'&&!s.headquarters?.firstReport&&<div className="v50-protocol-help"><Radio size={15}/> <span><b>첫 실습 · EVE 보조 활성</b> 잘못 선택해도 EVE가 정정합니다. 첫 토끼는 공명 100%까지 안내합니다.</span></div>}<div className="v50-protocol-cue v41-protocol-note"><BookOpen size={15}/><span>{resonanceObservationNotes(s.animals.find(a=>a.id===memoryTarget)!)[protocolStep].message}</span></div><ReactionStage src={img(memoryTarget)} label={pendingProtocol===null?'환경을 관찰하고 반응을 선택하세요.':'반응 기록 중 · 선택한 자극에 개체가 움직입니다.'} responding={pendingProtocol!==null}/><h3 className="v50-protocol-question">{protocols[memoryTarget as AnimalId].steps[protocolStep].prompt}</h3><div className="protocol-choices v50-protocol-choices">{(()=>{const stage=protocols[memoryTarget as AnimalId].steps[protocolStep];const offset=(memoryTarget.length+protocolStep*2)%3;return [0,1,2].map((i)=><button key={i} disabled={pendingProtocol!==null} onClick={()=>{setPendingProtocol(i);beep(470)}}><span>0{i+1}</span><b>{stage.choices[(i-offset+3)%3]}</b><ChevronRight size={15}/></button>)})()}</div>{pendingProtocol!==null&&<FieldCalibration key={'protocol-'+memoryTarget+'-'+protocolStep} title="신경 반응 동기화" description="안정 구간에서 신호를 기록해 공명을 검증하세요." onCancel={()=>setPendingProtocol(null)} onFinish={q=>{const answer=pendingProtocol;setPendingProtocol(null);protocolAnswer(answer,q)}}/>}<p className="protocol-feedback v50-protocol-feedback" role="status">{protocolFeedback||'관찰 기록과 개체의 반응을 바탕으로 판단하십시오.'}</p>{protocolAnswers.length>0&&<div className="v50-protocol-trail" aria-label="이전 단계 판정">{protocolAnswers.map((entry,i)=><span key={i}>0{entry.stage} · {entry.matched?'판정 일치':s.tutorialStep===5&&memoryTarget==='rabbit'?'EVE 교정':'불일치'}</span>)}</div>}<div className="v50-protocol-foot"><div className="mode-select">{s.tutorialStep===5&&memoryTarget==='rabbit'&&!s.headquarters?.firstReport?<span className="v50-safe-mode"><Shield size={14}/> 비침습·교정 실습 고정</span>:<><button className={extractMode==='gentle'?'active':''} onClick={()=>setExtractMode('gentle')}>비침습적 관찰</button><button className={extractMode==='force'?'active':''} onClick={()=>setExtractMode('force')}>강제 공명 · 위험</button></>}</div><small>행동력 2 · 전력 7%</small></div></div></div>}
{inspect&&!current&&!awakening&&!result&&!nightView&&!memoryTarget&&!s.pending&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal photograph-modal"><button className="modal-x" onClick={()=>setInspect(false)}><X/></button><h2>복원 중인 사진</h2><img src={img('hidden-photo')} style={{filter:`blur(${s.originZero?.firstPositiveDay?0:12}px)`}} alt="과거 기록"/><p>{s.originZero?.firstPositiveDay?'복원된 원본 사진은 분석실의 HIDDEN PHOTO 12개 기록에서 확인할 수 있다.':'유리 표면이 심하게 손상되어 원본 정보를 판독할 수 없다. 추가 조회 권한이 필요하다.'}</p></div></div>}
{s.phase==='finale'&&!current&&!result&&!awakening&&!memoryTarget&&!nightView&&!confirmRestart&&!s.headquarters?.pendingScene&&!s.headquarters?.pendingAnimal&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal finale-modal"><span className="micro-label">ARK // ORIGIN ZERO / FINAL DIRECTIVE</span><h2>마지막 연구 · 당신이 남길 미래</h2><p>M-00의 기원 표식과 12개 사진, 개체 재분석 결과가 연결되었습니다. 관리자는 자신의 마지막 시간이 가까움을 알고 있습니다. 무엇을 남길지는 지금까지의 선택에 달려 있습니다.</p>{s.headquarters?.revealStage>=3&&<details className="v65-finale-memory" open><summary><BookOpen size={16}/> 최종 기억 대면 · 제000번</summary><div className="v65-final-dialogue"><p><b>과거 과학자의 기록:</b> “내 연구가 틀렸다고? 그렇다면 지금까지 죽은 사람들은 무엇이 되는 거지?”</p><p><b>관리자:</b> “당신은 수많은 사람들을 실험에 사용했어.”</p><p><b>과거 과학자의 기록:</b> “내가 성공한다면 그들의 죽음은 희생이 된다. 내가 실패한다면 그저 학살이겠지. 그러니 나는 반드시 성공해야 한다.”</p><p><b>관리자:</b> “그건 죽은 사람들을 위한 게 아니잖아. 네가 틀렸다는 말을 듣기 싫은 거지.”</p><p><b>EVE:</b> “그분의 기억을 가지고 있어도 같은 선택을 해야 하는 건 아닙니다.”</p></div>{s.narrative?.finalStance?<p className="v65-stance-result">마지막 기억에 대한 답변 기록됨 · {s.lastOutcome}</p>:<div className="v65-stance-options"><button type="button" onClick={()=>setS(chooseFinalStance(s,'inherit'))}>연구자의 사명을 잇는다</button><button type="button" onClick={()=>setS(chooseFinalStance(s,'reject'))}>과거의 신념을 거부한다</button><button type="button" onClick={()=>setS(chooseFinalStance(s,'question'))}>기억과 현재의 나를 구분한다</button></div>}</details>}<div className="v54-finale-snapshot"><span>구조·보호 <b>{live.length}개체</b></span><span>생체 이송 <b>{s.headquarters?.transferred.length??0}건</b></span><span>표본 송신 <b>{s.archive?.dispatches??0}건</b></span><span>직원 신호 소실 <b>{s.crew?.retired?.length??0}명</b></span></div><div className="event-options v54-finale-choices"><button disabled={s.headquarters.revealStage>=3&&!s.narrative?.finalStance} onClick={()=>mutate(s=>finishWithArchive(s,'rebuild'))}><strong>01 / 본부의 복제인간 복원 계획</strong><small>인류 재건을 시도하지만 과거의 희생을 반복할 수 있습니다.</small></button><button disabled={s.headquarters.revealStage>=3&&!s.narrative?.finalStance} onClick={()=>mutate(s=>finishWithArchive(s,'freedom'))}><strong>02 / ORIGIN IMMUNITY · 방주의 씨앗</strong><small>기존 개체를 보호하며 M-00의 연구 자료를 EVE에게 남깁니다.</small></button><button disabled={s.headquarters.revealStage>=3&&!s.narrative?.finalStance} onClick={()=>mutate(s=>finishWithArchive(s,'preserve'))}><strong>03 / 제000번 우리 · 기록 보존</strong><small>최초 과학자의 집착에서 벗어나 기억보다 선택을 남깁니다.</small></button></div></div></div>}
{s.phase==='ending'&&!current&&!result&&!awakening&&!memoryTarget&&!nightView&&!confirmRestart&&<div className="v10-modal-shade v62-ending-shade" role="dialog" aria-modal="true"><div className={"v10-modal ending-modal"+(mainEndingSlot(s)?" ark-ending-theater":"")}><span className="micro-label">ARKTOPIA / ENDING</span><h2>ORIGIN ZERO · 최종 기록</h2>{mainEndingSlot(s)?<EndingSequence key={s.ending} state={s} mainArt={<EndingArtwork ending={s.ending} state={s}/>}/>:<EndingArtwork ending={s.ending} state={s}/>}<p>{s.ending}</p>{s.headquarters?.revealStage>=3&&<p className="ending-hq-aftermath">본부는 동물의 몸에 보존된 인간의 뇌를 복제인간의 신체에 이식해 인류를 복원하려 했습니다. 당신은 동물 숙주의 생체 보존 단계를 거친 최초 과학자의 뇌를 이식받은 제000호 복제 관리자입니다. 과학자의 기억을 물려받았다고 해서 같은 선택을 해야 하는 것은 아닙니다. 본부에 인계된 개체 {s.headquarters.transferred.length}종, 송신한 신경 조직 {s.archive?.dispatches??0}건, 시설에 남겨 지킨 개체 {live.length}종. 그들의 최종 운명은 지금까지 당신이 내린 결정과 함께 기록됩니다.</p>}{(s.crew?.members.length??0)>0&&<section className="v80-ending-cast" aria-label="최종 기록에 남은 생존 직원"><span>PERSONNEL // SURVIVING CREW</span><div>{s.crew!.members.filter(member=>member.mind>0&&member.hp>0&&!s.crew?.retired.includes(member.id)).map(member=><article className="v80-ending-cast-card" data-crew-id={member.id} key={member.id}><StaffPortrait id={member.id} condition={member.mind<35?'critical':member.mind<62?'unstable':'safe'}/><div><b>{CREW_PROFILES[member.id].post}</b><small>정신 {member.mind} · 생존 기록</small></div></article>)}</div></section>}{(live.length>0||s.originZero?.cat==='shelter')&&<section className="v82-ending-specimens" aria-label="최종 기록에 남은 생존 동물"><span>SPECIMENS // LIVING RECORD</span><div>{live.map(animal=><article className="v82-ending-specimen-card" data-animal-id={animal.id} key={animal.id}><img src={animalArt(animal)} alt={animal.name}/><div><b>{animal.name}</b><small>{isMutantVisual(animal)?'변이 안정화 기록':'보호·생존 기록'}</small></div></article>)}{s.originZero?.cat==='shelter'&&<article className="v82-ending-specimen-card" data-animal-id="m00"><img src={animalSprite('m00')} alt="M-00 검은 고양이"/><div><b>M-00</b><small>비밀 격리 · 독립 생존 개체</small></div></article>}</div></section>}{(s.crew?.retired?.length??0)>0&&<p className="v49-ending-scars">인격 신호가 소실된 직원: {s.crew!.retired.map(id=>`${CREW_PROFILES[id].title} · ${CREW_LOSS_EFFECTS[id].name}`).join(' / ')}. 시설은 그들의 빈자리를 끝내 복구하지 못했다.</p>}<div>남은 생명 {live.length}마리 · 복원 지식 {s.knowledge} · 단서 {s.clues}개 · 생존 {s.day}일</div><button className="v10-primary" onClick={()=>setConfirmRestart(true)}>새로운 기록 시작하기</button></div></div>}
{s.hqOrders?.active?.status==='offered'&&!s.voice?.pending&&!s.crew?.pendingTermination&&!s.crew?.pendingNightVote&&!cinematic&&<HQOrderPanel state={s} onChoose={answerHeadquarters}/>}
{hqDebrief&&!s.voice?.pending&&<div className="v56-hq-result-shade" role="dialog" aria-modal="true"><section className="v56-hq-result"><span className="v56-micro">HQ / TRANSMISSION REPORT</span><h2>본부 응답 처리 완료</h2><p>{hqDebrief}</p><button onClick={()=>setHqDebrief('')}>보고 확인 · 본부 통신 보기 <ChevronRight size={15}/></button></section></div>}
{facilityProject&&!current&&!s.pendingIncident&&!s.voice?.pending&&!s.crew?.pendingTermination&&!cinematic&&<div className="v10-modal-shade" role="dialog" aria-modal="true" aria-label="시설 조립 및 시운전"><section className="v10-modal operation-modal"><h2>{facilityRecipes[facilityProject].name} 복구</h2><p>조립 → 배선 → 시운전 · 자원은 완료 시 한 번만 사용합니다.</p><p>고철 {facilityRecipes[facilityProject].scrap} · 부품 {facilityRecipes[facilityProject].parts} · 전력 {facilityRecipes[facilityProject].power}</p>{!operationBoard(s,'assembly',facilityProject).verified?<OperationPuzzle key={'assembly-'+facilityProject} state={s} mode="assembly" id={facilityProject} onUpdate={setS}/>:<OperationPuzzle key={'commission-'+facilityProject} state={s} mode="commission" id={facilityProject} onUpdate={setS}/>}<div className="operation-actions"><button onClick={()=>setFacilityProject(null)}>기록하고 닫기</button><button disabled={!operationAllowed(s,'commission',facilityProject)||!operationBoard(s,'commission',facilityProject).verified} onClick={()=>{const n=finishOperation(s,'commission',facilityProject);if(n!==s){setS(n);setFacilityProject(null);report(s,n,'시설 시운전 완료');setRunFeedback(n.lastOutcome);beep(760)}}}>시운전 · 복구 확정</button></div></section></div>}
{operation&&!current&&!s.pendingIncident&&!s.voice?.pending&&!s.crew?.pendingTermination&&!cinematic&&<div className="v10-modal-shade" role="dialog" aria-modal="true" aria-label={operation.mode==='repair'?'격리문 수리':'직원 치료'}><section className="v10-modal operation-modal"><h2>{operation.mode==='repair'?'격리문 잠금 복구':CREW_PROFILES[operation.id!].post+' · 안정화 치료'}</h2><p>{operation.mode==='repair'?'부품 1 / AP 1 · 시설 +23':'의약품 1 / AP 1 · 정신 +12~22 (무작위)'}</p><OperationPuzzle key={operation.mode+operation.id} state={s} mode={operation.mode} id={operation.id} onUpdate={setS}/><div className="operation-actions"><button type="button" onClick={()=>setOperation(null)}>기록하고 닫기</button><button type="button" disabled={!operationAllowed(s,operation.mode,operation.id)||!operationBoard(s,operation.mode,operation.id).verified} onClick={()=>{const next=finishOperation(s,operation.mode,operation.id);if(next!==s){setS(next);setOperation(null);report(s,next,operation.mode==='repair'?'격리문 복구 완료':'직원 치료 완료');setRunFeedback(next.lastOutcome);beep(550)}}}>작업 확정</button></div></section></div>}
{emergencyTask&&!current&&!cinematic&&!s.pendingIncident&&!s.voice?.pending&&<div className="v10-modal-shade ark-emergency-shade" role="dialog" aria-modal="true" aria-label="긴급 작업"><EmergencyTask key={emergencyTask+'-'+s.day+'-'+s.ap} kind={emergencyTask} day={s.day} serial={s.ap} onClose={()=>setEmergencyTask(null)} onFinish={quality=>{const next=doBase(s,emergencyTask,quality);if(next===s)return;setS(next);setEmergencyTask(null);report(s,next,'긴급 작업 결과');setRunFeedback(next.lastOutcome);setResult({success:quality>=.5,title:quality>=.5?'긴급 작업 완료':'긴급 작업 부분 실패',text:next.lastOutcome});beep(quality>=.5?700:210)}}/></div>}

{wiringOpen&&!s.voice?.pending&&!s.crew?.pendingTermination&&!cinematic&&<div className="v10-modal-shade wiring-shade" role="dialog" aria-modal="true" aria-label="발전기 배선 정비"><WiringPanel state={s} mode="recharge" onRotate={index=>setS(prev=>prev?rotateWiring(prev,'recharge',index):prev)} onTest={()=>{const next=testWiring(s,'recharge');if(next!==s){setS(next);report(s,next,'발전기 회로 정비');if(next.wiring?.recharge?.completed)setWiringOpen(false)}}} onClose={()=>setWiringOpen(false)}/></div>}
{tab==='cctv'&&s.voice?.pending&&!s.crew?.pendingTermination&&!cinematic&&<VoiceBreachPanel event={s.voice.pending} history={s.voice.history} onProbe={probeDoorVoice} onVerdict={decideDoorVoice}/>}
{voiceDebrief&&!s.voice?.pending&&<div className="v56-voice-result-shade" role="dialog" aria-modal="true"><div className={'v56-voice-result '+(voiceDebrief.correct?'correct':'wrong')}><span className="v56-micro">ARK / AFTER-ACTION REPORT</span><div className="v56-result-symbol">{voiceDebrief.correct?'✓':'!'}</div><h2>{voiceDebrief.title}</h2><p>{voiceDebrief.text}</p><div className="v56-result-foot"><b>{voiceDebrief.correct?'검증 완료 · 자료 자동 보존':'위험 · 상태 변동 자동 적용'}</b><button onClick={()=>setVoiceDebrief(null)}>관제 화면 복귀 <ChevronRight size={16}/></button></div></div></div>}
{cinematic&&<CinematicScene key={cinematic} kind={cinematic} onFinish={finishCinematic}/>}
{s.crew?.pendingTermination&&!acknowledgingStaffLoss&&<CrewCollapseScene key={s.crew.pendingTermination} id={s.crew.pendingTermination} onTerminate={()=>closeCrewCollapse(s.crew!.pendingTermination!)}/>}
{rewardReport&&!current&&!result&&!aftermath&&!careDialog&&!memoryTarget&&!nightView&&!cinematic&&!s.pending&&!s.run&&!s.pendingIncident&&!confirmRestart&&<aside className="ark-action-ledger" role="status"><header><b>{rewardReport.title}</b><button type="button" aria-label="변화량 닫기" onClick={()=>setRewardReport(null)}>×</button></header>{rewardReport.entries.length?rewardReport.entries.map((d,i)=><div key={i}><span>{d.name}</span><b>{d.before!==undefined?`${d.before} → ${d.after} `:''}<em className={deltaIsBad(d.name,d.delta)?'negative':'positive'}>({d.delta>0?'+':''}{d.delta}{d.unit})</em></b></div>):<small>수치 변화 없음</small>}</aside>}
{confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal"><h2>새로운 기록을 시작할까요?</h2><p>현재 자동 저장 기록이 교체됩니다.</p><div className="modal-actions"><button onClick={()=>setConfirmRestart(false)}>취소</button><button className="v10-primary" onClick={()=>{localStorage.removeItem(KEY);setS(null);setAcknowledgingStaffLoss(false);setIntroStage('welcome');setStart('generator');setConfirmRestart(false);setTalk([]);setResult(null);setCaptureReveal(null);setNightView(false);setWiringOpen(false);setMemoryTarget(null)}}>새 게임</button></div></div></div>}
</div>}






