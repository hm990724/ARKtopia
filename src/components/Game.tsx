'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Origin,Start,origins,starts,originStories,startStories,specs,SPECIES_CARE,cap,AnimalId} from '@/lib/sim';
import {cameras,securityPatterns,securityAction,escapeRisk,type CameraId,type SecurityAction} from '@/lib/security';
import {protocols} from '@/lib/protocols';
import {awakeningProfiles,isAwakeningReady,isMutantVisual} from '@/lib/awakening';
import {isMutant} from '@/lib/sim';
import {findEndingArt,ENDING_ASSET_DIRECTORY} from '@/lib/ending-art';
import {V10,beginGame,loadGame,regions,gearData,RegionId,Gear,incidentDefs,doBase,purchase,handleMutant,type MutantDecision,buildFacility,facilityRecipes,type FacilityId,startRun,moveField,leaveField,abandonTacticalCapture,placeTacticalDevice,removeTacticalDevice,executeTacticalTurn,predictTacticalMove,authorizeTacticalSeal,performVeiledHunt,rescueChoice,captureChance,useFieldMedkit,resolveIncident,previewIncident,finishDay,incidentWeight,extract,finish,synthesize,registerFullResonance,resolveHeadquarters,type HeadquartersChoice,type NightChoice,type FieldSettlement} from '@/lib/game-v10';
import type {DeviceKind,Pace} from '@/lib/tactical-field';
import type {HuntMode} from '@/lib/hidden-hunt';
import {CARE_ACTIONS,careMastery,getCareScenario,resolveCareChoice,quickCare,type CareAction} from '@/lib/care-interactions';
import FieldMission from './FieldMission';
import {verifiedObservationCount,resonanceObservationNotes} from '@/lib/observation-journal';
import SpecimenArchive from './SpecimenArchive';
import {noteCare,recordSpecimen,applyDissection,chooseArchiveGift,acknowledgeArchiveTruth,type DissectionAction,type ArchiveGift,finishWithArchive} from '@/lib/specimen-archive';
import {House,Shield,Map,FlaskConical,ShoppingBag,BookOpen,Volume2,VolumeX,Moon,Heart,Activity,Brain,Zap,BatteryCharging,Wind,ChevronRight,ChevronLeft,Settings,RotateCcw,X,Search,PawPrint,AlertTriangle,Radio,CheckCircle2,Skull,Lock,Eye,HeartPulse,Clock,Package,Lightbulb,Power,ShieldAlert,ArrowRight,Compass} from 'lucide-react';
type Tab='hub'|'expedition'|'animals'|'research'|'synthesis'|'supplies'|'records'|'cctv';
type Talk={speaker:'EVE'|'관리자';text:string};
const KEY='last-enclosure-ark-v10';const img=(id:string)=>{if(id==='rabbit'||id==='fox')return '/assets/animals/'+id+'_uncanny.png';if(specs.some(a=>a.id===id))return '/assets/animals/'+id+'.png';if(id==='protagonist-young')return '/assets/characters/protagonist_neutral.png';if(id==='eve-hologram')return '/assets/characters/eve_hologram.png';if(['hero-gate','gate','sanctuary','laboratory','wasteland','hidden-photo','dawn'].includes(id))return '/assets/backgrounds/'+id+'.png';return '/art/'+id+'.png'};

// Rabbit/fox have no normal artwork. Uncanny is the initial appearance;
// high stress combined with biological strain changes only the displayed sprite.
// The same rescued animal and all its stats remain unchanged.
function animalVisual(a:{id:string;stress:number;contamination:number;memory:number;awakened?:boolean;mutated?:boolean;suppressedUntilDay?:number}):'uncanny'|'mutant'|null{
 if(a.id!=='rabbit'&&a.id!=='fox')return null;
 return isMutantVisual(a as import('@/lib/sim').AnimalState)?'mutant':'uncanny';
}
function animalArt(a:{id:string;stress:number;contamination:number;memory:number;awakened?:boolean;mutated?:boolean;suppressedUntilDay?:number}){
 const visual=animalVisual(a);
 return visual?`/assets/animals/${a.id}_${visual}.png`:img(a.id);
}

const talkIntro:Talk[]=[
 {speaker:'관리자',text:'으... 머리야. 여긴 어디야?'},
 {speaker:'EVE',text:'의식 반응을 확인했습니다. 깨어나셨군요, 담당자님.'},
 {speaker:'관리자',text:'누구야? ...사람은 아니네. 이 화면에서 말하는 거야?'},
 {speaker:'EVE',text:'저는 보존구역의 운영 보조 인공지능, EVE입니다. 현재 담당자님께서는 확인된 유일한 지성체이십니다.'},
 {speaker:'관리자',text:'유일한... 뭐? 다른 사람은 어디 갔는데?'},
 {speaker:'EVE',text:'2089년, 원인을 규명하지 못한 감염병으로 인류의 생존 기록이 끊겼습니다. 외부 도시와의 통신도 복구되지 않았습니다.'},
 {speaker:'관리자',text:'인류가 멸망했다고? 그럼 난 대체 뭔데? ...아니, 왜 내 이름조차 기억 안 나지?'},
 {speaker:'EVE',text:'기억 손상이 확인되었습니다. 현재 상태에서 무리한 회상은 권장하지 않습니다. 지금부터 담당자님의 일과를 안내해 드리겠습니다.'},
 {speaker:'관리자',text:'...일과? 잠깐만. 세상이 망했다며. 무슨 일과가 남았는데?'},
 {speaker:'EVE',text:'인간과 달리 많은 동물은 해당 감염병에 대한 저항성을 보이며 살아남았습니다. 생존 개체를 구조해 보호하고, 그 생체 반응을 분석하여 치료의 실마리를 찾아야 합니다.'},
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
 {speaker:'EVE',text:'맞습니다. 출동 전에 손전등, 필터, 운송 케이지를 확인하십시오. 현장에서는 7×5 지도에서 인접한 칸을 눌러 이동합니다. 흔적·물자·오염 칸을 조사하고, 생체 신호를 찾으면 8×8 숨은 수풀 추적이 시작됩니다. 한 번 수색한 칸은 열어 둔 기록으로 남지만 동물이 그곳을 다시 통과할 수도 있습니다.'}
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
 {speaker:'EVE',text:'첫 보호 개체를 확보했습니다. 격리실로 안전하게 이송했습니다. 현장 탐사는 종료되지 않았으므로 남은 구역을 더 수색하거나 철수해 최종 정산을 확인할 수 있습니다. 체력은 생존 상태, 스트레스는 불안정 정도, 유대는 담당자님에 대한 신뢰를 나타냅니다.'},
 {speaker:'EVE',text:'첫 토끼는 연구 절차를 익힐 수 있도록 유대 지표를 26까지 안정화했습니다. 공명에 필요한 유대 기준은 20입니다. 이제 행동 관찰을 진행해 주십시오.'},
 {speaker:'EVE',text:'급식·치료·교감·관찰 중 하나를 고르면 개체의 행동 단서와 대응 네 가지가 나타납니다. 적절한 선택은 유대와 숙련도를 높이고, 잘못된 대응은 스트레스를 증가시킵니다.'},
 {speaker:'관리자',text:'잠깐, 동물 돌보는 게 치료법하고 무슨 관계가 있는데?'},
 {speaker:'EVE',text:'특정 조건에서 동물의 신경 활동은 설명되지 않는 기억 신호와 공명합니다. 기록을 수집하면 분석 장치의 접근 권한을 복구할 수 있습니다.'},
 {speaker:'EVE',text:'경고. 스트레스가 높거나 무리한 신경 동기화가 이어지면 돌연변이 반응이 나타날 수 있습니다. 개체의 외형이 변하고 격리문을 파손하거나 탈출할 위험도 증가합니다.'},
 {speaker:'관리자',text:'...그럼 내가 잘못 건드리면 얘가 괴물이 될 수도 있다는 거네. 알았어, 최대한 조심하지.'}
 ],
 observed:[
 {speaker:'관리자',text:'이상하네. 방금 그 행동, 그냥 본능이라고 보기엔 너무 정확했는데.'},
 {speaker:'EVE',text:'관찰 기록을 확보했습니다. 기억 연구가 해금되었습니다. 초기 실습 동안 행동력 2를 확보했습니다. 체력 35 이상, 유대 20 이상, 스트레스 78 이하, 관찰 기록 1회 이상이면 바로 첫 동기화를 시작할 수 있습니다.'},
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
trace:{title:'주소가 없는 통신',lines:['이송 보고서의 최종 수신처는 현재 시설이 아닙니다. 누군가 모든 보존구역의 기록을 모으고 있습니다.','EVE: "본부는 중앙 총괄 AI가 관리하는 상위 보존 체계입니다. 저는 지정된 업무만 수행할 수 있습니다."','관리자: "상위? ...나 말고 누가 또 있다는 거야?"','오래된 수송 기록에는 생체 상태보다 ‘신경 활성률’이라는 항목이 더 크게 표시되어 있습니다.']},
evidence:{title:'이송된 개체는 어디로 갔는가',lines:['중앙 총괄 AI가 관리하는 본부의 연구 기록을 복원했습니다. 바이러스에 비교적 강한 저항성을 보였던 인간들마저 결국 사망했습니다. 인류는 그들의 지식과 신경 조직을 보존 대상으로 삼았습니다.','동물은 해당 바이러스에 영향을 덜 받았기에, 보존된 인간의 뇌 조직과 기억 신호를 동물의 신경계에 결합했습니다. 이는 과거 연구 기록 속 허구의 실험 설정입니다.','공명도가 높은 개체는 본부에서 신경 조직을 분리해 차세대 복제체와 재생 실험에 활용한 것으로 보입니다. 안전한 ‘귀환’이 아니었습니다.','관리자: "...그래서 보냈던 거야? 내가 애써 살려 놓은 애들을?"','EVE: "관리자님. 저는 본부 명령을 따르도록 설계되었습니다. 해당 기록의 공개는 제한되어 있었습니다."']},
origin:{title:'개체 000 · 제조 기록',lines:['최종 기록에는 한 명의 인간이 아닌, 인간과 유사한 감정·인지 패턴을 가진 복제 생명체의 생산 과정이 남아 있습니다. 개체 000의 사진은 주인공의 얼굴과 동일합니다.','로봇과 EVE의 AI 연산만으로는 살아 있는 대상과의 감정적 교감, 불완전한 선택과 새로운 판단을 충분히 구현하지 못했습니다. 본부는 인간처럼 공감하는 몸이 필요했습니다.','당신은 처음부터 인간 생존자가 아니었습니다. 지식 복원을 위해 만들어진, 인간에 가장 가까운 생물학적 클론 관리자였습니다. 기억이 없는 이유도 여기 있습니다. 동일한 관리 개체의 생산 번호가 여러 개 확인되지만, 이 시설의 생존자는 당신 하나뿐입니다.','EVE: "죄송합니다. 제 판단에는 상위 명령의 제약이 있었습니다. 하지만 관리자님을 지키고자 했던 기록도 남아 있습니다."','관리자: "알았어, 알았다고... 그럼 이제 선택은 내가 해. 본부가 아니라."']}
} as const;
const progressionTexts=[['작전 시작','장비를 점검하고 현장에 진입합니다.'],['현장 확인','흔적과 오염 수치를 대조합니다.'],['철수 또는 확보','위험과 보상을 정산합니다.']];

type ChangeEntry={name:string;delta:number;unit:string};
const rewardFields:[keyof V10,string,string][]=[['scrap','고철','개'],['food','식량','개'],['parts','부품','개'],['medicine','치료제','개'],['credits','보존 CR','CR'],['filters','바이오필터','개'],['electricCells','전지','개'],['knowledge','지식','점'],['clues','기록 단서','개'],['power','시설 전력','%'],['flashlight','손전등','%'],['hp','생명',''],['stamina','체력',''],['infection','감염도','%'],['eve','EVE 코어',''],['facility','시설 안정성','%'],['threat','외부 위협도','%'],['mind','정신','']];
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
const out=rewardFields.map(([key,name,unit])=>({name,delta:Number(after[key])-Number(before[key]),unit})).filter(x=>Number.isFinite(x.delta)&&x.delta!==0);
const added=after.animals.filter(a=>a.alive&&!before.animals.some(b=>b.id===a.id&&b.alive));
added.forEach(a=>out.unshift({name:`${a.name} 구조`,delta:1,unit:'개체'}));
return out;
}

function EndingArtwork({ending}:{ending:string}){
 const [failed,setFailed]=useState(false);
 const entry=findEndingArt(ending);
 useEffect(()=>setFailed(false),[ending]);
 return <div className={'ending-art-display'+(failed?' is-fallback':'')}>
  {!failed?<img src={ENDING_ASSET_DIRECTORY+entry.file} alt={entry.label} onError={()=>setFailed(true)}/>:<div className="ending-art-fallback"><span>ARK // END RECORD</span><strong>{ending.split(' — ')[0]}</strong><small>해당 엔딩의 일러스트를 추가하면 이 화면에 자동으로 표시됩니다.</small></div>}
 </div>;
}
function Bar({v,color='#f39cba'}:{v:number;color?:string}){return <div className="vbar"><span style={{width:`${cap(v)}%`,background:color}}/></div>}
function MiniStat({name,value,color,points=false}:{name:string;value:number;color?:string;points?:boolean}){return <div className="mini-stat"><span>{name}</span><Bar v={value} color={color}/><b>{Math.round(value)}{points?'/100':'%'}</b></div>}
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
const [s,setS]=useState<V10|null>(null),[ready,setReady]=useState(false),[origin,setOrigin]=useState<Origin>('artist'),[start,setStart]=useState<Start>('medical');


const [tab,setTab]=useState<Tab>('hub'),[selectedRegion,setSelectedRegion]=useState<RegionId>('garden'),[selectedGear,setSelectedGear]=useState<Gear[]>(['flashlight','filter']),[selectedAnimal,setSelectedAnimal]=useState<string|null>(null);
const [camera,setCamera]=useState<CameraId>('CAM-01');
const [lockNotice,setLockNotice]=useState('');
const [awakening,setAwakening]=useState<{id:AnimalId;stage:number}|null>(null);
const [talk,setTalk]=useState<Talk[]>([]),[talkIdx,setTalkIdx]=useState(0),[furthestTalkIdx,setFurthestTalkIdx]=useState(0),[letters,setLetters]=useState(0),[talkDone,setTalkDone]=useState(false),[storyMenu,setStoryMenu]=useState(false),[sound,setSound]=useState(false),[inspect,setInspect]=useState(false);
const [aftermath,setAftermath]=useState<{title:string;notes:string;entries:ChangeEntry[];critical:boolean}|null>(null);
// Show the discovered animal BEFORE any dialogue or rescue choices. This is a transient UI reveal, not saved game state.
const [captureReveal,setCaptureReveal]=useState<{id:AnimalId;cell:number|null;first:boolean}|null>(null);
const [fieldRewardModal,setFieldRewardModal]=useState<{kind:'found'|'settlement';title:string;entries:ChangeEntry[];notes:string;settlement?:FieldSettlement}|null>(null);
function showFieldSettlement(next:V10){
 const summary=next.lastFieldSummary;
 if(!summary)return;
 setRewardReport(null);
 setFieldRewardModal({kind:'settlement',title:`${regions.find(r=>r.id===summary.region)?.name||'현장'} · 탐사 최종 정산`,entries:settlementEntries(summary),notes:next.lastOutcome,settlement:summary});
}
const [rewardReport,setRewardReport]=useState<{title:string;entries:ChangeEntry[];notes:string}|null>(null),[result,setResult]=useState<{success:boolean;title:string;text:string;animalId?:AnimalId}|null>(null),[nightView,setNightView]=useState(false),[nightChoice,setNightChoice]=useState<NightChoice>('shield'),[runFeedback,setRunFeedback]=useState(''),[memoryTarget,setMemoryTarget]=useState<string|null>(null),[protocolStep,setProtocolStep]=useState(0),[protocolErrors,setProtocolErrors]=useState(0),[protocolFeedback,setProtocolFeedback]=useState(''),[extractMode,setExtractMode]=useState<'gentle'|'force'>('gentle'),[synthA,setSynthA]=useState<string>(''),[synthB,setSynthB]=useState<string>(''),[gearPreview,setGearPreview]=useState(false),[confirmRestart,setConfirmRestart]=useState(false);
const [guideDismissed,setGuideDismissed]=useState(false);
const [archiveSceneStep,setArchiveSceneStep]=useState(0);
const [careDialog,setCareDialog]=useState<{id:AnimalId;kind:CareAction}|null>(null);
const [careOutcome,setCareOutcome]=useState<{correct:boolean;message:string;delta:{bond:number;stress:number;hp:number;records:number};mastery:number;tutorialUnlock:boolean}|null>(null);
const guideFocus=useRef<HTMLElement|null>(null);
const soundCtx=useRef<AudioContext|null>(null);
function beep(f=540,d=.11){if(!sound)return;try{const ctx=soundCtx.current??new AudioContext();soundCtx.current=ctx;const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=f;g.gain.value=.026;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch{}}
useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const loaded=loadGame(JSON.parse(raw));if(loaded)setS(loaded)}}catch{}setReady(true)},[]);
useEffect(()=>{if(ready&&s)localStorage.setItem(KEY,JSON.stringify(s))},[ready,s]);
 useEffect(()=>{if(!s||s.phase==='ending'||(s.hp>0&&s.eve>0))return;const fatal={...s,phase:'ending' as const,ending:s.hp<=0?'제000번 우리 — 담당자의 생체 신호가 정지했다. EVE는 그를 보존 개체로 분류했다.':'마지막 통신 — EVE 코어 0. 시설의 마지막 음성이 사라지고 모든 지시가 끊겼다.'};setTalk([]);setResult(null);setCaptureReveal(null);setNightView(false);setMemoryTarget(null);setS(fatal)},[s?.hp,s?.eve,s?.phase]);

useEffect(()=>{const line=talk[talkIdx];if(!line||talkDone||letters>=line.text.length)return;const t=setTimeout(()=>setLetters(v=>v+1),37);return()=>clearTimeout(t)},[talk,talkIdx,letters,talkDone]);
// Reveal only after a real in-game state transition. Saves are marked once, so the scene never repeats.
useEffect(()=>{
 if(!s||awakening||talk.length||result||s.phase==='ending'||s.phase==='finale')return;
 const a=s.animals.find(isAwakeningReady);
 if(!a)return;
 setS(previous=>{
  if(!previous||!previous.animals.some(x=>x.id===a.id&&!x.awakened))return previous;
  return {...previous,animals:previous.animals.map(x=>x.id===a.id?{...x,awakened:true}:x),logs:[{day:previous.day,title:'개체의 첫 발화',text:`${a.name}에게서 사람의 말과 유사한 음성 신호가 검출되었습니다.`,kind:'mystery' as const},...previous.logs].slice(0,80)};
 });
 setAwakening({id:a.id,stage:0});
},[s,awakening,talk.length,result]);


function dialogue(lines:Talk[]){if(!lines.length)return;setTalk(lines);setTalkIdx(0);setFurthestTalkIdx(0);setLetters(0);setTalkDone(false);setStoryMenu(false)}
function performSynthesis(){if(!s||!synthA||!synthB)return;const n=synthesize(s,synthA as AnimalId,synthB as AnimalId);if(n===s){setRunFeedback('합성 조건이 충족되지 않았습니다. 서로 다른 개체 2마리, 빈 격리실, 지식·전력·부품을 확인하세요.');return}setS(n);report(s,n,'생체 합성 실험');const success=n.logs[0]?.kind==='good';setResult({success,title:success?'합성 배양 완료':'합성 실험 결과',text:n.lastOutcome});setSynthA('');setSynthB('');beep(success?780:200)}
// Dialogue navigation: Next advances immediately even while text is typing.
// Previously seen lines are shown in full when revisited; Skip closes only this dialogue.
function closeTalk(){setTalk([]);setTalkIdx(0);setFurthestTalkIdx(0);setLetters(0);setTalkDone(true)}
function previousTalk(){if(talkIdx<=0)return;const previous=talkIdx-1;setTalkIdx(previous);setLetters(talk[previous].text.length);beep(330)}
function advanceTalk(){if(!talk[talkIdx])return;const next=talkIdx+1;if(next>=talk.length){closeTalk();return}setTalkIdx(next);setLetters(next<=furthestTalkIdx?talk[next].text.length:0);setFurthestTalkIdx(v=>Math.max(v,next));beep(400)}
function skipTalk(){if(!talk.length)return;closeTalk()}
function confirmCaptureReveal(){
 if(!captureReveal)return;
 const first=captureReveal.first;
 setCaptureReveal(null);
 dialogue(first?tutorialScenes.discovery:[
  {speaker:'관리자',text:'...잠깐, 거기 있었어? 제대로 맞혔네. 모습을 확인하니까 이제야 실감이 나.'},
  {speaker:'EVE',text:'은신 개체 발견을 확인했습니다. 수색 지점과 현재 생체 신호가 일치합니다. 격리실 이송 여부를 결정해 주십시오.'}
 ]);
}

function report(before:V10,after:V10,title:string){if(after===before)return;setRewardReport({title,entries:changes(before,after),notes:after.lastOutcome||''})}
function playStart(){setCaptureReveal(null);setFieldRewardModal(null);const next=beginGame(origin,start);next.logs.unshift({day:1,title:'단편적으로 돌아온 기억',text:origins.find(x=>x.id===origin)!.desc+' / '+starts.find(x=>x.id===start)!.desc,kind:'mystery'});setGuideDismissed(false);setS(next);setTab('hub');dialogue([talkIntro[0],{speaker:'관리자',text:originStories[origin].fragment},{speaker:'EVE',text:originStories[origin].eve},...talkIntro.slice(1,4),{speaker:'관리자',text:startStories[start].fragment},{speaker:'EVE',text:startStories[start].eve},...talkIntro.slice(4)]);beep(660)}
function constructFacility(id:FacilityId){
 if(!s)return;
 const before=s.tutorialStep;
 const n=buildFacility(s,id);
 if(n===s){setRunFeedback('복구 불가: 고철·부품·시설 전력 또는 현재 작업 상태를 확인하세요.');return;}
 setS(n);report(s,n,'시설 복구');setRunFeedback(n.lastOutcome);beep(760);
 if(before===6&&id==='cctv')dialogue([{speaker:'EVE',text:'고철과 부품을 연결해 감시망을 복구했습니다. 이제 외곽과 격리실의 탈출 경보를 카메라로 추적할 수 있습니다. 다음은 생체 합성실의 기반 회로입니다.'},{speaker:'관리자',text:'카메라도 고철로 고치는구나. ...다음은 또 뭔데?'}]);
 if(before===7&&id==='synthesis')dialogue([{speaker:'EVE',text:'합성실의 회로가 복구됐습니다. 지금은 공여 개체가 부족하므로 실험은 실행할 수 없습니다. 먼저 CCTV에서 감시 절차를 확인하십시오.'},{speaker:'관리자',text:'또 이런 실험실을 만든다고? ...일단 감시부터 해보자.'}]);
}
function mutate(fn:(s:V10)=>V10){if(!s)return;const next=fn(s);if(next===s)return;setS(next);report(s,next,'작전 결과');beep()}
function action(name:'rest'|'recharge'|'handsearch'|'eve'|'feed'|'repair'|'crank'|'decontam'){if(!s)return;if(name==='crank'&&s.hp<=14){setRunFeedback('수동 발전에는 생명력 14가 필요합니다. 먼저 휴식하거나 치료해 주세요.');return}const next=doBase(s,name);if(next===s){setRunFeedback('작업을 진행할 수 없습니다. 행동력과 필요 자원을 확인하세요.');return}setS(next);report(s,next,'기지 작업 결과');dialogue([{speaker:'관리자',text:managerReaction(name)},{speaker:'EVE',text:eveReport(next.lastOutcome)}]);beep(550)}
function selectRegion(id:RegionId){setSelectedRegion(id);setGearPreview(true)}
function goRun(){if(!s)return;const n=startRun(s,selectedRegion,selectedGear);if(n===s){setRunFeedback('출동 불가: 행동력·전력·장비 보유량을 확인하세요. 스캐너는 수동 손전등 탐사와 함께 사용할 수 없습니다.');return;}if(s.tutorialStep===1)n.tutorialStep=2;setFieldRewardModal(null);setS(n);report(s,n,'출동 자원 사용');setRunFeedback('현장 연결 완료. 이동해 생체 신호를 찾으면 수풀 아래 숨은 개체를 발자국으로 추적합니다.');dialogue(s.tutorialStep===1?[...tutorialScenes.expedition,...(expeditionLines[selectedRegion]||[])]:expeditionLines[selectedRegion]||[]);beep(740)}
function useMedkitNow(){if(!s)return;const n=useFieldMedkit(s);if(n===s){setRunFeedback('사용 불가: 키트 미장착·이미 사용·생명력 최대 상태를 확인하세요.');return;}setS(n);report(s,n,'현장 응급 처치');setRunFeedback(n.lastOutcome);beep(640)}
 function onFieldMove(target:number,pace:Pace){
  if(!s)return;
  const tile=s.field?.tiles[target];
  const n=moveField(s,target,pace);
  if(n===s){setRunFeedback('이동 불가: 체력이 부족하거나 인접하지 않은 칸입니다. 철수하거나 치료하고 진행하세요.');return;}
  const found=!!n.capture&&!s.capture,completed=!!s.run&&!n.run;
  const firstReturn=completed&&(s.run?.firstTutorial??s.tutorialStep===2);
  if(firstReturn&&n.tutorialStep===2)n.tutorialStep=3;
  setS(n);setRunFeedback(n.lastOutcome);
  if(completed)showFieldSettlement(n);
  else if(['cache','track','signal'].includes(tile||'')){
   const entries=fieldStepEntries(s,n);
   if(entries.length)setFieldRewardModal({kind:'found',title:tile==='cache'?'보급 상자 회수 완료':tile==='track'?'발자국 조사 보상':'연구 신호 복원 완료',entries,notes:n.lastOutcome});
  }
  if(found)dialogue([{speaker:'관리자',text:'잠깐, 저기 움직였어. 도망가지 않게 조심하자.'},{speaker:'EVE',text:'현재 좌표는 가려져 있습니다. 발자국은 동물이 방금 떠난 칸이며, 주변 여덟 칸의 흔들림을 참고해 다음 위치를 예측하십시오. 한 번 뒤진 풀숲은 열려 있지만, 개체가 다시 그 칸에 숨을 수 있습니다. 특성 카드 해독에는 행동 1회가 필요합니다.'}]);
  else if(firstReturn)dialogue(tutorialScenes.return);
  beep(found?670:420);
 }
 function onFieldRetreat(){
  if(!s)return;
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
function onHuntAction(command:{type:HuntMode;cell?:number;clue?:number}){
 if(!s?.capture?.hunt)return;
 const prior=s.capture;
 const n=performVeiledHunt(s,command);
 if(n===s){setRunFeedback('명령을 실행할 수 없습니다. 배치할 장치 3개 제한과 남은 행동 횟수를 확인하세요.');return;}
 const won=!!n.pending&&!s.pending,failed=!n.capture&&!n.pending;
 const firstReturn=won&&s.tutorialStep===2;
 setS(n);setRunFeedback(n.lastOutcome);
 if(won){report(s,n,'은신 개체 포획');setCaptureReveal({id:n.pending!,cell:command.cell??null,first:firstReturn});beep(860);}
 else if(failed){setResult({success:false,title:'추적 실패 · 개체 도주',text:n.lastOutcome,animalId:prior.species});beep(220);}
 else beep(command.type==='search'?360:command.type==='reveal'?690:480);
}
function rescue(which:'secure'|'treat'|'release'){if(!s)return;const animal=s.pending;const n=rescueChoice(s,which);if(n===s)return;const newlyRescued=n.lastOutcome.includes('구조 성공')&&(s.tutorialStep===2||s.tutorialStep===3);if(newlyRescued)n.tutorialStep=4;setS(n);report(s,n,'개체 처리 결과');const success=n.lastOutcome.includes('구조 성공');setResult({success:which==='secure'?success:which==='treat',title:which==='secure'?(success?'구조 완료':'구조 실패'):which==='treat'?'현장 치료 완료':'방생 결정',text:n.lastOutcome,animalId:animal??undefined});dialogue([{speaker:'관리자',text:success?'하... 됐다. 이제 안전한 데로 가자.':which==='release'?'가. 여기 있으면 더 위험해.':'젠장... 조금만 더 빨랐으면.'},{speaker:'EVE',text:eveReport(n.lastOutcome)},...(newlyRescued?tutorialScenes.rescued:[])]);setRunFeedback('');beep(success?880:230);if(animal&&success)setSelectedAnimal(animal)}
function resolveEvent(choice:number){if(!s?.pendingIncident)return;const id=s.pendingIncident;const n=resolveIncident(s,choice);if(n===s)return;setS(n);setRewardReport(null);const entries=changes(s,n);const animalHarm=n.animals.reduce((acc,a,i)=>acc+Math.max(0,a.stress-(s.animals[i]?.stress??a.stress)),0);if(animalHarm)entries.push({name:'개체 스트레스 증가',delta:animalHarm,unit:'합계'});setAftermath({title:incidentDefs[id].title,notes:n.lastOutcome,entries,critical:choice===2||n.hp<s.hp-14||n.eve<s.eve-14||n.facility<s.facility-14});dialogue([{speaker:'관리자',text:incidentReactions[id]?.[choice]??'알았어. 내가 할게.'},{speaker:'EVE',text:choice===2?'담당자님. 방어에 실패했습니다. 실제 피해를 확인해 주십시오.':'처리 완료했습니다. 대응 결과를 기록했습니다.'}]);beep(choice===2?190:390)}
function operateSecurity(action:SecurityAction){if(!s)return;const animalId=s.security.incident?.animalId;const n=securityAction(s,action);if(n===s)return;if(animalId)recordSpecimen(n,animalId,'CCTV · '+action,n.lastOutcome,'security');setS(n);report(s,n,'CCTV 대응 결과');const d=n.security.incident;dialogue([{speaker:'관리자',text:action==='lock'?'문 닫아. 다치게 하진 마.':action==='track'?'도망친 길을 찾아. 아직 멀리 못 갔을 거야.':action==='talk'?'야, 괜찮아. 나야. 진정해.':'알았어. 지금 확인할게.'},{speaker:'EVE',text:n.lastOutcome}]);if(d)setCamera(d.camera);beep(d?.status==='escaped'?205:590)}
function handleHQChoice(choice:HeadquartersChoice){if(!s)return;const n=resolveHeadquarters(s,choice);setS(n);report(s,n,'본부 이송 결정');dialogue([{speaker:'관리자',text:choice==='transfer'?'...돌아올 수 있는 거지? 그 약속은 지켜.':choice==='copy'?'먼저 기록부터 복사해. 확인도 안 하고 보내진 않아.':'안 보내. 여기선 내가 책임질 거야.'},{speaker:'EVE',text:choice==='transfer'?'이송 절차가 완료되었습니다. 본부에서는 추가 정보를 제공하지 않습니다.':choice==='copy'?'기록 사본을 확보했습니다. 외부 요청은 보류합니다.':'인계 거부를 기록했습니다. 상위 체계의 재요청이 예상됩니다.'}]);beep(420)}
function onArchiveDissection(action:DissectionAction,key?:string){
 if(!s)return;
 if(action==='forced'&&!window.confirm('해당 개체는 영구적으로 소실됩니다. 살아 있는 개체의 신경 조직을 강제로 회수하시겠습니까?'))return;
 const n=applyDissection(s,action,key);
 if(n===s){setRunFeedback('병리 처리 불가: 기밀 해금, 개체 상태, 전력, 행동력 또는 표본 수량을 확인하십시오.');return;}
 setS(n);report(s,n,'병리실 연구 결과');setRunFeedback(n.lastOutcome);
 if(action==='forced')dialogue([{speaker:'관리자',text:'...내가 지금 무슨 짓을 승인한 거지.'},{speaker:'EVE',text:'본부의 처리 기록이 갱신되었습니다. 담당자님의 선택은 삭제되지 않습니다.'}]);
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
function applyNight(forced?:NightChoice){if(!s)return;const planned=forced??nightChoice;const applied:NightChoice=s.power<({shield:22,rest:5,analyze:16,standby:0}[planned])?'standby':planned;const n=finishDay(s,planned);if(n===s)return;setS(n);setRewardReport(null);setNightView(false);setTab('hub');const entries=changes(s,n);if(applied==='standby'||n.facility<s.facility-12||n.hp<s.hp-12||n.eve<s.eve-12){setAftermath({title:applied==='standby'?'무방비 야간 경과':'야간 시설 피해',notes:applied==='standby'?'경비가 가동되지 않아 시설이 손상되고 외부 위협이 상승했습니다. 다음 날 사고 위험이 커졌습니다.':n.lastOutcome,entries,critical:true});}dialogue(applied==='standby'?[{speaker:'관리자',text:'전력이 없네. 경비는 못 돌리겠어. 문이라도 걸어 잠가.'},{speaker:'EVE',text:'경비를 가동하지 못했습니다. 밤사이 발생한 손실을 아침에 보고드리겠습니다.'}]:[{speaker:'관리자',text:'...오늘도 살았네. 내일은 좀 조용했으면 좋겠는데.'},{speaker:'EVE',text:n.pendingIncident?'경고. 시설의 이상 사건이 탐지되었습니다.':'야간 운영을 마쳤습니다. 다음 일과를 시작하십시오.'}]);beep(450)}
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
 beep(decision==='serum'?710:220);
}
function care(id:string,kind:CareAction){
 if(!s)return;
 if(s.security.escapedIds.includes(id as AnimalId)){
  setRunFeedback('격리실 이탈 개체입니다. CCTV에서 재격리한 후 돌봄을 진행해 주세요.');setCamera('CAM-01');setTab('cctv');return;
 }
 const animal=s.animals.find(a=>a.id===id&&a.alive);
 if(!animal||s.ap<1||(kind==='feed'&&s.food<1)||(kind==='heal'&&s.medicine<1)){
  setRunFeedback('돌봄을 시작할 수 없습니다. 개체 상태, 행동력, 식량 또는 의약품을 확인하세요.');return;
 }
 setCareOutcome(null);setCareDialog({id:id as AnimalId,kind});beep(460);
}
function submitCare(chosen:number){
 if(!s||!careDialog||careOutcome)return;
 const result=resolveCareChoice(s,careDialog.id,careDialog.kind,chosen);
 if(!result){setRunFeedback('처리를 진행할 수 없습니다. 필요한 자원과 행동력을 확인하세요.');return;}
 const next=result.next as V10;
 const firstObservation=s.tutorialStep===4&&careDialog.kind==='observe'&&next.animals.some(a=>a.id===careDialog.id&&a.records>0);
 if(firstObservation){next.tutorialStep=5;next.ap=Math.max(2,next.ap);}
 const scenario=getCareScenario(s.animals.find(a=>a.id===careDialog.id)!,careDialog.kind,s.day);
 noteCare(next,careDialog.id,CARE_ACTIONS[careDialog.kind].title,scenario.options[chosen],result.correct,result.message);
 setS(next);report(s,next,'개체 행동 대응');
 setCareOutcome({correct:result.correct,message:result.message,delta:result.delta,mastery:result.mastery,tutorialUnlock:firstObservation});
 beep(result.correct?740:220);
}
function closeCare(){const shouldTeach=!!careOutcome?.tutorialUnlock;setCareDialog(null);setCareOutcome(null);if(shouldTeach)dialogue(tutorialScenes.observed);}
function doQuickCare(id:AnimalId,kind:CareAction){
 if(!s)return;
 const next=quickCare(s,id,kind) as V10;
 if(next===s){setRunFeedback('숙련 돌봄을 실행할 수 없습니다. 행동력이나 소모 자원을 확인하세요.');return;}
 noteCare(next,id,CARE_ACTIONS[kind].title,'검증된 돌봄 루틴',true,'이전에 확인한 반응에 따라 안전하게 돌봄을 진행했습니다.');
 setS(next);report(s,next,'숙련 돌봄 완료');setRunFeedback(`${next.animals.find(a=>a.id===id)?.name||'개체'}에게 기록된 돌봄 절차를 적용했습니다.`);beep(580);
}
function toggleRoutine(id:AnimalId){
 if(!s)return;const animal=s.animals.find(a=>a.id===id&&a.alive);if(!animal||careMastery(animal,'feed')<2||careMastery(animal,'comfort')<2)return;
 setS({...s,animals:s.animals.map(a=>a.id===id?{...a,careRoutine:!a.careRoutine}:a)});
 setRunFeedback(animal.careRoutine?'야간 안정 루틴을 해제했습니다.':'야간 안정 루틴을 설정했습니다. 매일 기본 급식이 공급되는 경우 유대 +2, 스트레스 -4가 적용됩니다.');
}
function protocolRequirements(id:string){
 const a=s?.animals.find(x=>x.id===id&&x.alive);
 return [
  {label:'보호 개체',value:a?'격리실 배정됨':'격리실에 없음',ok:!!a,go:'animals'},
  {label:'행동 관찰',value:`${a?.records??0} / 1회`,ok:!!a&&a.records>=1,go:'animals'},
  {label:'유대',value:`${a?.bond??0} / 20`,ok:!!a&&a.bond>=20,go:'animals'},
  {label:'스트레스',value:`${a?.stress??0} / 78 이하`,ok:!!a&&a.stress<=78,go:'animals'},
  {label:'체력',value:`${a?.hp??0} / 35 이상`,ok:!!a&&a.hp>=35,go:'animals'},
  {label:'행동력',value:`${s?.ap??0} / 2`,ok:!!s&&s.ap>=2,go:'hub'},
  {label:'시설 전력',value:`${s?.power??0} / 7`,ok:!!s&&s.power>=7,go:'supplies'},
  {label:'격리 상태',value:s?.security.escapedIds.includes(id as AnimalId)?'이탈 중':'안전',ok:!!s&&!s.security.escapedIds.includes(id as AnimalId),go:'cctv'},
 ];
}
function protocolReady(id:string){return protocolRequirements(id).every(x=>x.ok)}
function openProtocol(id:string){
 if(!s)return;
 setSelectedAnimal(id);
 if(!protocolReady(id)){
  const missing=protocolRequirements(id).filter(x=>!x.ok).map(x=>x.label).join(' · ');
  setRunFeedback(`동기화 준비가 필요합니다: ${missing}. 격리실에서 개체를 관리해 주세요.`);
  setProtocolFeedback('');
  setMemoryTarget(null);
  return;
 }
 setMemoryTarget(id);setProtocolStep(0);setProtocolErrors(0);
 setProtocolFeedback('준비 완료. 관찰 기록을 바탕으로 세 단계의 행동 강령을 판단하세요.');
}
function protocolAnswer(chosen:number){if(!s||!memoryTarget)return;const target=s.animals.find(a=>a.id===memoryTarget&&a.alive);const missing=[!target?'개체가 격리실에 없습니다.':null,target&&target.records<1?'행동 관찰 1회 필요':null,target&&target.bond<20?'유대 20 이상 필요':null,target&&target.stress>78?'스트레스 78 이하 필요':null,target&&target.hp<35?'체력 35 이상 필요':null,s.ap<2?'행동력 2 필요':null,s.power<7?'전력 7% 필요':null].filter(Boolean);if(missing.length){setProtocolFeedback('동기화 불가: '+missing.join(' · '));beep(200);return}const protocol=protocols[memoryTarget as AnimalId];const stage=protocol.steps[protocolStep];if(!stage)return;const offset=(memoryTarget.length+protocolStep*2)%3;const correct=(stage.correct+offset)%3;const mistakes=protocolErrors+(chosen===correct?0:1);setProtocolErrors(mistakes);setProtocolFeedback('반응을 기록했습니다. 공명 판정은 세 단계를 마친 뒤 확인됩니다.');beep(470)
 if(protocolStep<2){setProtocolStep(x=>x+1);return}
 const quality=mistakes===0?95:mistakes===1?75:mistakes===2?40:10;
 const n=extract(s,memoryTarget as AnimalId,quality,extractMode);
 if(n===s){setProtocolFeedback('동기화 불가: 동물의 안정도·유대·관찰 기록 또는 행동력·전력을 점검하세요.');return}
 const completed=registerFullResonance(s,n as V10,memoryTarget as AnimalId);
 recordSpecimen(completed,memoryTarget as AnimalId,'행동 강령 공명 연구',`선택 결과: 적절한 판단 ${3-mistakes}/3회, 공명 정확도 ${quality}점. 연구 이후 공명 ${completed.animals.find(a=>a.id===memoryTarget)?.memory??0}/100.`,'research');
 const firstResearch=s.tutorialStep===5;if(firstResearch)completed.tutorialStep=6;
 setS(completed);report(s,completed,'행동 강령 동기화 결과');setResult({success:quality>=65,title:quality>=65?'행동 강령 동기화 성공':'행동 강령 불일치',text:completed.lastOutcome||n.logs[0]?.text||''});setMemoryTarget(null);
 if(firstResearch&&!completed.headquarters.pendingAnimal)dialogue([...tutorialScenes.research,{speaker:'EVE',text:'실험 데이터를 축적하려면 시설 보수가 필요합니다. 탐사 현장에서 회수한 고철은 오래된 카메라와 배양 장비의 회로를 복구하는 데 쓰입니다. 보급실의 시설 복구 항목을 확인하십시오.'},{speaker:'관리자',text:'이제 와서 고철까지 모아야 한다고? ...알았어. 쓸모가 있다면 모아야지.'}]);
 if(completed.headquarters.pendingAnimal && completed.headquarters.pendingAnimal!==s.headquarters?.pendingAnimal){
 const first=!s.headquarters?.firstReport;
 dialogue(first?[{speaker:'EVE',text:'관리자님, 첫 번째 개체의 공명도가 100%에 도달했습니다. 해당 개체의 본부 이송을 요청하겠습니다.'},{speaker:'관리자',text:'...본부? 본부도 있어? 여기 우리 둘밖에 없는 거 아니었어?'},{speaker:'EVE',text:'죄송합니다. 해당 사항은 접근 제한 정보입니다. 더 이상 알려드릴 수 없습니다.'},{speaker:'관리자',text:'뭘 숨기는 거야. 아니, 저 녀석을 대체 어디로 보내겠다는 건데?'}]:[{speaker:'EVE',text:'개체의 공명이 완료되었습니다. 외부 본부에서 인계 요청이 도착했습니다.'},{speaker:'관리자',text:'또 본부야? ...이번에도 설명 안 할 거지.'}]);
 }
 beep(quality>=65?780:210)
}
const rescuedCount=s?.animals.filter(a=>a.alive).length??0;
const tutorialStep=s?.tutorialStep??7;
const tabUnlocked=(id:Tab):boolean=>{
 if(!s||id==='hub'||id==='expedition')return true;
 if(id==='supplies'||id==='records')return tutorialStep>=3||s.encounters>0;
 if(id==='animals')return tutorialStep>=4||rescuedCount>0;
 if(id==='research')return tutorialStep>=5||s.extractions>0;
 if(id==='synthesis')return !!s.facilities?.synthesis;
 if(id==='cctv')return !!s.facilities?.cctv||!!s.security.incident;
 return false;
};
const unlockHint=(id:Tab):string=>({hub:'',expedition:'',supplies:'첫 탐사를 마치면 해금',records:'첫 탐사를 마치면 해금',animals:'첫 동물 구조 성공 후 해금',research:'동물 구조 후 행동 관찰 1회로 해금',synthesis:'보급실에서 고철 9개 + 부품 2개로 생체 합성실 복구',cctv:'보급실에서 고철 6개 + 부품 1개로 CCTV 감시망 복구'}[id]);
const enterTab=(id:Tab)=>{if(tabUnlocked(id)){setLockNotice('');setTab(id);setNightView(false);if(id==='cctv'&&s?.tutorialStep===8&&s.facilities?.cctv&&s.facilities?.synthesis){setS({...s,tutorialStep:9});dialogue([{speaker:'EVE',text:'수집·돌봄·행동 관찰·공명 연구·시설 복구·CCTV 감시 절차가 모두 연결되었습니다. 이제 기초 실습을 종료하고 보존구역의 자유 운영을 시작합니다.'},{speaker:'관리자',text:'겨우 이제 시작이라고? 그래, 살아남아 볼게. ...근데 넌 뭘 숨기는 거냐.'},{speaker:'EVE',text:'담당자님. 지금부터의 모든 운영 판단은 담당자님께 위임됩니다.'}])}}else {setLockNotice(unlockHint(id));setRunFeedback(unlockHint(id))}};
const tutorialMissions=['의식 회복 중','첫 신호 추적 · 현장 탐사로 이동','현장 조사 · 상황별 대응 후 귀환','동물 발견 시 구조, 실패했다면 재탐사','격리실 · 첫 개체 행동 관찰','기억 연구 · 공명 동기화 1회 완료','고철로 CCTV 감시망 복구','생체 합성실 기반 회로 복구','감시망 점검 · CCTV 열기','보존구역 자유 운영'];
const firstMission=tutorialMissions[Math.min(9,tutorialStep)];
const tourGuide=(!s||tutorialStep>=9||guideDismissed||careDialog)?null:(():{target:string;title:string;body:string;nav?:Tab}=>{
 if(tutorialStep===1)return tab==='hub'?{target:'first-signal',title:'01 · 첫 신호 추적',body:'노란색으로 강조된 버튼을 누르면 탐사 화면으로 이동합니다. 기능은 실제 임무를 수행하면서 해금됩니다.'}:tab==='expedition'&&gearPreview?{target:'launch',title:'01 · 출동 준비 완료',body:'장비를 확인했다면 노란 출동 버튼을 누르세요. 전력이 부족하면 손전등 수동 수색을 고려할 수 있습니다.'}:{target:'region',title:'01 · 조사 구역 선택',body:'현재 갈 수 있는 구역을 선택하세요. 각 카드에 위험도, 예상 보상, 발견 가능한 동물이 표시됩니다.'};
 if(tutorialStep===2)return {target:'run-choice',title:'02 · 전장 수색',body:'조사할 칸 하나를 골라 풀숲을 젖히세요. 발자국은 지난 턴의 위치, 흔들린 풀은 그 주변 1칸을 뜻합니다. 수색해도 동물은 다시 들어올 수 있어요. 위 상태창은 고정된 채로 유지됩니다.',nav:'expedition'};
 if(tutorialStep===3)return s.pending?{target:'rescue',title:'03 · 동물 확보',body:'구조 성공 여부는 확률로 결정됩니다. 성공하면 격리실이 열리고, 실패했다면 다음 탐사에서 재도전할 수 있습니다.'}:{target:'first-signal',title:'03 · 다시 구조 신호 추적',body:'탐사로 돌아가 동물을 찾으세요. 구조에 성공해야 격리실 관리가 해금됩니다.',nav:'hub'};
 if(tutorialStep===4&&s.run&&s.field)return {target:'run-choice',title:'04 · 구조 완료 · 탐사 계속',body:'개체는 안전하게 격리실로 이송되었습니다. 현장에 남아 보급품과 단서를 더 찾거나 철수해 전체 보상 정산을 확인한 뒤 격리실에서 행동 관찰을 시작하세요.',nav:'expedition'};
 if(tutorialStep===4)return {target:s.animals.some(a=>a.id===selectedAnimal)?'observe':'animal-room',title:'04 · 행동 관찰과 돌봄',body:s.animals.some(a=>a.id===selectedAnimal)?'첫 토끼의 유대는 26으로 준비됐습니다. 「행동 관찰」을 눌러 4지선다 대응을 선택하면 연구실이 해금됩니다.':'격리실에서 보호 개체를 먼저 선택하세요. 체력과 스트레스, 유대를 확인한 뒤 행동 관찰을 진행합니다.',nav:'animals'};
 if(tutorialStep===5)return {target:'research-target',title:'05 · 기억 공명 연구',body:'개체를 선택해 준비 조건을 확인하세요. 부족한 수치는 격리실의 관찰·교감·급식·치료로 맞춘 뒤 연구를 시작할 수 있습니다.',nav:'research'};
 if(tutorialStep===6)return {target:'workshop',title:'06 · 폐자재로 감시망 복구',body:'첫 개체 구조 과정에서 얻은 고철을 사용해 CCTV 감시망을 복구하세요. 고철 6 · 부품 1 · 전력 6이 필요합니다.',nav:'supplies'};
 if(tutorialStep===7)return {target:'workshop',title:'07 · 생체 합성실 기반 구축',body:'고철 9 · 부품 2 · 전력 10으로 생체 합성실을 복구하세요. 시설이 열려도 합성 실험에는 일반 동물 두 종이 필요합니다.',nav:'supplies'};
 return {target:'cctv-tab',title:'08 · 감시망 최종 점검',body:'복구된 CCTV로 이동해 감시 절차를 확인하면 튜토리얼이 종료되고 자유 운영이 시작됩니다.',nav:'cctv'};
})();
useEffect(()=>{
 guideFocus.current?.classList.remove('echo-tour-focus');guideFocus.current=null;
 if(!tourGuide||tourGuide.target==='run-choice'||talk.length||awakening||result||nightView||memoryTarget||s?.pending||s?.pendingIncident||s?.headquarters?.pendingAnimal||s?.headquarters?.pendingScene||confirmRestart||inspect)return;
 const el=document.querySelector<HTMLElement>(`[data-tour="${tourGuide.target}"]`);
 if(el){el.classList.add('echo-tour-focus');guideFocus.current=el;}
 return()=>{el?.classList.remove('echo-tour-focus');if(guideFocus.current===el)guideFocus.current=null};
},[tourGuide?.target,tab,talk.length,awakening,result,nightView,s?.pending]);

const current=talk[talkIdx];const artAnimal=s?.animals.find(a=>a.id===selectedAnimal);const region=regions.find(r=>r.id===selectedRegion)!;const canAuto=!!s&&s.power>=region.power+(selectedGear.includes('scanner')?8:0);const canManual=!!s&&selectedGear.includes('flashlight')&&!selectedGear.includes('scanner')&&s.flashlight>=25;const live=s?.animals.filter(a=>a.alive)||[];const nextIncident=s?.pendingIncident?incidentDefs[s.pendingIncident]:null;
if(!ready)return <div className="v10-loading">ARK SYSTEM / CONNECTING ...</div>;
if(!s)return <div className="v10-intro" style={{backgroundImage:`linear-gradient(90deg,#0c0816ee,#130e20a8),url(${img('hero-gate')})`}}><div className="intro-panel"><span className="micro-label">ARK // BOOT SEQUENCE · 2089</span><h1>잔향보존구역 <small>ECHO WARD</small></h1><p>사람이 사라진 세계. 마지막으로 남은 동물원.<br/>당신이 기억하는 과거와 처음 눈뜨는 장소가 오늘의 생존을 바꿉니다.</p><h3>01. 마지막으로 남은 기억</h3><div className="start-grid v36-origin-grid">{origins.map((o,i)=><button key={o.id} className={'start-card v36-memory-card '+(origin===o.id?'selected':'')} onClick={()=>setOrigin(o.id)}><span className="v36-memory-num">기억 {String(i+1).padStart(2,'0')}</span><b>{o.title}</b><small>{o.desc}</small><em>{o.perk}</em></button>)}</div><div className="v36-choice-story"><span>흐릿한 기억</span><p>{originStories[origin].fragment}</p></div><h3>02. 눈을 뜬 장소</h3><div className="start-grid region-start v36-start-grid">{starts.map((st,i)=><button key={st.id} className={'start-card v36-start-card '+(start===st.id?'selected':'')} onClick={()=>setStart(st.id)}><img src={img(st.art)} alt=""/><span className="v36-memory-num">현장 {String(i+1).padStart(2,'0')}</span><b>{st.title}</b><small>{st.desc}</small><em>{st.bonus}</em></button>)}</div><div className="v36-choice-story v36-choice-scene"><span>현장 초기 기록</span><p>{startStories[start].fragment}</p></div><button className="v10-primary intro-launch" onClick={playStart}>기록을 시작한다 <ArrowRight size={18}/></button></div></div>;
return <div className={"v10-shell"+(tab==='expedition'&&!!s.run?" is-field-active":"")}><aside className="v10-sidebar"><div className="v10-logo"><span>✿ 잔향보존구역 ☾</span><small>ECHO WARD</small></div><div className="v10-day"><b>DAY {String(s.day).padStart(3,'0')}</b><small>{s.phase==='day'?'잔존 생명 신호 연결됨':'보존 절차'}</small></div><Tile title="담당자 / 생체 신호" extra={<HeartPulse size={14}/> }><div className="person-row"><img src={img('protagonist-young')} alt="젊은 관리자"/><div><b>담당자 000</b><small>신체 판정: 비공개</small><small>기억: 단편적</small><VitalChip tone={subjectVital(s.hp,s.infection,s.mind)}/></div></div><div className={'v41-operator-ap '+(s.ap<=1?'is-low':'')} role="status" aria-label={`남은 일일 행동력 ${s.ap} / 4`}>
 <div className="v41-ap-title"><span><Zap size={15}/> 오늘의 행동력</span><strong><b>{s.ap}</b> <small>/ 4 AP</small></strong></div>
 <div className="v41-ap-slots" aria-hidden="true">{[0,1,2,3].map(i=><i key={i} className={i<s.ap?'charged':''}/>)}</div>
 <small>{s.ap<=0?'오늘의 행동 소진 · 하루 종료 후 회복':s.ap===1?'남은 행동 1회 · 출동 전 비용 확인':'출동·돌봄·연구에 사용하는 하루 행동력'}</small>
 </div><MiniStat points name="생명" value={s.hp}/><MiniStat points name="체력" value={s.stamina} color="#b696f2"/><MiniStat points name="정신" value={s.mind} color="#80bada"/><MiniStat name="감염" value={s.infection} color="#e5a74f"/></Tile><Tile title="EVE · 보존 AI" extra={<Radio size={13}/>}><div className="eve-side"><img src={img('eve-hologram')} alt="EVE"/><div><b>CORE {s.eve}%</b><Bar v={s.eve} color="#7de3e7"/><small>연결 상태: {s.eve>35?'안정':'불안정'}</small><VitalChip tone={eveVital(s.eve)}/></div></div></Tile><Tile title="복원 중인 사진" extra={<Search size={14}/>}><button className="v10-polaroid" onClick={()=>setInspect(true)}><img src={img('hidden-photo')} style={{filter:`blur(${Math.max(0,8-s.clues*.9)}px)`}} alt="복원 중인 과거 사진"/><span>기록 No.00 · 복원도 {Math.min(100,s.clues*10)}%</span></button></Tile><Tile title={`보호 개체 ${live.length} / ${s.rooms}`} extra={<PawPrint size={14}/>}><div className="animal-mini">{live.length?live.slice(0,12).map(a=><button key={a.id} onClick={()=>{setSelectedAnimal(a.id);setTab('animals')}} title={`${a.name}의 바이탈 보기`}><img src={animalArt(a)} alt=""/><small>{a.name}</small><VitalChip tone={animalVital(a)} compact/></button>):<p className="muted">아직 확보한 동물이 없습니다.</p>}</div></Tile></aside>
<main className="v10-main"><header className="v10-top"><div className="v10-top-label">ARK // ACCESS-LIMITED <span>● CONNECTED</span></div><nav>{([['hub','중앙',House],['cctv','CCTV',Radio],['animals','격리실',PawPrint],['expedition','탐사',Compass],['research','공명 연구',FlaskConical],['synthesis','생체 합성',Brain],['supplies','보급',ShoppingBag],['records',s.archive?.revealed?'해부실':'분석실',BookOpen]] as const).map(([id,name,Icon])=><button data-tour={id==='cctv'?'cctv-tab':undefined} key={id} onClick={()=>enterTab(id)} title={!tabUnlocked(id)?unlockHint(id):name} aria-disabled={!tabUnlocked(id)} className={(tab===id?'on':'')+(!tabUnlocked(id)?' echo-locked':'')}><Icon size={14}/><span>{name}</span>{!tabUnlocked(id)&&<Lock size={11}/>}</button>)}<button onClick={()=>setSound(x=>!x)} title="효과음 켜기/끄기">{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button onClick={()=>setConfirmRestart(true)} title="새 게임"><RotateCcw size={15}/></button></nav></header>
{tourGuide&&!current&&!guideDismissed&&!awakening&&!result&&!nightView&&!memoryTarget&&!s.pending&&!s.pendingIncident&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&!confirmRestart&&!inspect&&<div className="echo-tour-coach" role="status" aria-live="polite"><div className="echo-tour-coach-main"><span>✦ EVE · 현장 안내</span><strong>{tourGuide.title}</strong><p>{tourGuide.body}</p></div><div className="echo-tour-controls">{tourGuide.nav&&tab!==tourGuide.nav&&<button onClick={()=>enterTab(tourGuide.nav!)}>해당 화면 열기 <ChevronRight size={13}/></button>}<button className="echo-tour-skip" onClick={()=>setGuideDismissed(true)}>안내 접기</button></div></div>}<div className="v10-content"><div className="v10-core">{lockNotice&&<div className="echo-lock-notice" role="status"><Lock size={15}/><span>{lockNotice}</span><button onClick={()=>setLockNotice('')} aria-label="해금 안내 닫기"><X size={13}/></button></div>}{tab==='hub'&&<><div className="scene-banner" style={{backgroundImage:`linear-gradient(180deg,#0c081733,#0806117a),url(${img('hero-gate')})`}}><div className="scene-caption"><span className="micro-label">보존 구역 · CENTRAL GATE</span><h2>사람이 없는 동물원</h2><p>벽 너머의 생명은 여전히 움직이고 있다.</p></div><div className="scene-roam">{live.slice(0,4).map((a,i)=><button key={a.id} className="moving-animal" style={{left:`${21+i*17}%`,animationDelay:`-${i*1.2}s`}} onClick={()=>{setSelectedAnimal(a.id);setTab('animals')}} title={`${a.name} 상태 확인`}><img src={animalArt(a)} alt={a.name}/></button>)}</div></div>{s.security.incident&&<button className="hub-security-alert" onClick={()=>{setCamera(s.security.incident!.camera);setTab('cctv')}}><AlertTriangle size={17}/> {s.security.incident.status==='escaped'?'격리 개체 탈출':s.security.incident.status==='breach'?'격리문 손상':'CCTV 이상 행동'} 감지 · 감시 화면 확인 <ChevronRight size={14}/></button>}<div className="v10-actions-panel"><div className="action-head"><b>오늘의 행동</b><span>선택은 비용과 후속 사건을 남깁니다 · 행동력 {s.ap}/4</span></div><div className="echo-first-mission"><div><span className="echo-tutorial-progress">안내 {Math.max(1,Math.min(6,tutorialStep))}/6 · 진행 상태 자동 저장</span><span>FIRST SIGNAL · {rescuedCount?"생존 기록":"미확인 신호"}</span><strong>{firstMission}</strong><small>잠긴 설비는 목표를 완료하면 순서대로 해금됩니다. EVE의 안내를 확인하세요.</small></div><button data-tour="first-signal" onClick={()=>enterTab(tutorialStep>=5?"research":tutorialStep>=4?"animals":"expedition")}>{tutorialStep>=4?"격리실 확인":"첫 신호 추적"}<ChevronRight size={15}/></button></div><div className="echo-guided-roadmap" aria-label="시설 복구 안내"><div className="echo-guided-head"><strong>시설 복구 순서</strong></div><div className="echo-guided-steps">{[['01','첫 탐사',3],['02','동물 구조',4],['03','행동 관찰',5],['04','공명 연구',6],['05','감시망 복구',7]].map(([number,name,required])=><span key={number} className={tutorialStep>=Number(required)?'is-done':tutorialStep===Number(required)-1?'is-next':'is-locked'}>{tutorialStep>=Number(required)?'✓':number} {name}</span>)}</div></div><div className="home-actions">{([['expedition','현장 탐사','위험과 보상을 비교하고 출동',Compass,'wasteland'],['animals','격리실 관리','개체 바이탈·급식·치료',PawPrint,'sanctuary'],['research','기억 연구','인간의 흔적과 지식 회복',Brain,'laboratory'],['supplies','보급·전력','시설 유지와 장비 확보',BatteryCharging,'eve-terminal']] as const).map(([id,title,desc,Icon,art])=><button key={id} onClick={()=>enterTab(id)} title={!tabUnlocked(id)?unlockHint(id):title} className={"home-action "+(!tabUnlocked(id)?"echo-locked-action":"")}><div className="action-illustration action-design"><Icon size={35} strokeWidth={1.5}/><span className="action-mark" aria-hidden="true">✦</span></div><div className="action-copy"><span className="action-eyebrow">{id==='expedition'?'FIELD OPERATIONS':id==='animals'?'CONTAINMENT':id==='research'?'ARCHIVE RESEARCH':'POWER & SUPPLIES'}</span><div className="action-title"><Icon size={16}/><b>{title}</b>{!tabUnlocked(id)&&<Lock size={14}/>}</div><small>{tabUnlocked(id)?desc:unlockHint(id)}</small></div></button>)}</div><div className="base-actions"><button disabled={s.encounters===0||s.ap<1} onClick={()=>action('rest')}><Heart size={14}/> 휴식 <small>HP·체력 회복 / AP 1</small></button><button disabled={s.encounters===0||s.ap<1||s.parts<1} onClick={()=>action('recharge')}><Zap size={14}/> 전력 보충 <small>부품 1 / AP 1</small></button><button disabled={s.encounters===0||s.ap<1||s.flashlight<16} onClick={()=>action('handsearch')}><Lightbulb size={14}/> 수동 수색 <small>손전등 전지 -16 / AP 1</small></button><button disabled={s.encounters===0||s.ap<1||s.hp<=14} onClick={()=>action('crank')}><BatteryCharging size={14}/> 수동 발전 <small>생명 -14 / 전력 +17</small></button><button disabled={s.encounters===0||s.ap<1||s.filters<1} onClick={()=>action('decontam')}><Wind size={14}/> 제독실 가동 <small>필터 -1 / 감염 -26</small></button></div></div>
<section className="ark-operations" aria-label="동물원 상황 관제">
  <div className="ark-ops-heading"><div><span className="micro-label">ARK // LIVE OPERATIONS</span><h3>동물원 상황 관제</h3></div><span className="ark-live-dot"><i/> LIVE · DAY {String(s.day).padStart(3,'0')}</span></div>
  <div className="ark-ops-grid">
    <div className="ark-monitor">
      <div className="ark-panel-head"><b><Radio size={14}/> 외곽 감시 카메라</b><small>CAM 01 · CENTRAL GATE</small></div>
      <button className="ark-monitor-screen" onClick={()=>enterTab('expedition')} title="현장 탐사 구역 선택으로 이동" style={{backgroundImage:`linear-gradient(0deg,#0c0919bf,#0c091930),url(${img('hero-gate')})`}}>
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
      <button className="ark-advice" onClick={()=>setTab(s.power<35?'supplies':s.infection>35?'supplies':live.length>0?'animals':'expedition')}>
        <span>{s.power<35?'전력 저하 경고':s.infection>35?'생체 오염 주의':live.length>0?'보존 개체 점검':'외부 생체 신호 추적'}</span>
        <small>{s.power<35?'보급 메뉴에서 전력을 확보해야 합니다.':s.infection>35?'제독과 필터 보급을 검토하세요.':live.length>0?'구조 개체의 상태를 관찰하세요.':'외곽 탐사를 통해 첫 개체를 찾아보세요.'}</small>
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
</section></>}
{tab==='cctv'&&<section className="tab-content cctv-page"><div className="section-title"><div><span className="micro-label">ARK SECURITY // LIVE SURVEILLANCE</span><h2>격리 시설 · CCTV 관제</h2><p>이상 행동은 공격의 전조이거나 오래된 인간 기억의 반응일 수 있습니다. 무조건 봉쇄하기 전에 원인을 확인하세요.</p></div><Radio size={26}/></div>
<div className="cctv-layout"><div className="cctv-main"><div className="cctv-channels">{cameras.map(ch=><button key={ch.id} onClick={()=>setCamera(ch.id)} className={camera===ch.id?'active':''}><b>{ch.id}</b><small>{ch.title}</small>{s.security.incident?.camera===ch.id&&<span className="cctv-dot">● 경고</span>}</button>)}</div>
<div className={'cctv-viewport '+(s.security.incident?.camera===camera?'has-alert':'')} style={{backgroundImage:`linear-gradient(0deg,#090712c4,#140d2640),url(${img(camera==='CAM-01'?'hero-gate':camera==='CAM-04'?'laboratory':'sanctuary')})`}}><div className="cctv-overlay"><span>● {s.power>=12&&s.eve>=15?'REC • LIVE':'SIGNAL LOST'}</span><span>{camera} / {cameras.find(x=>x.id===camera)?.title}</span></div><div className="cctv-animals">{s.animals.filter(a=>a.alive&&!s.security.escapedIds.includes(a.id)&&(camera==='CAM-02'?a.room<=2:camera==='CAM-03'?a.room>2:camera==='CAM-04'?s.security.incident?.animalId===a.id&&s.security.incident.camera==='CAM-04':false)).map(a=><button key={a.id} title={a.name+' 상태 보기'} onClick={()=>{setSelectedAnimal(a.id);setTab('animals')}}><img src={animalArt(a)} alt={a.name}/><span>{a.name}</span></button>)}{s.security.incident?.camera===camera&&s.security.incident.status==='escaped'&&<div className="v31-escaped-signal"><img src={animalArt(s.animals.find(a=>a.id===s.security.incident!.animalId)??{id:s.security.incident.animalId,stress:0,contamination:0,memory:0})} alt="탈출 개체의 마지막 포착 모습"/><span>마지막 포착 · {s.security.incident.tracked?'동선 확인됨':'위치 불명'}<small>{securityPatterns[s.security.incident.animalId].escape}</small></span></div>}</div><div className="cctv-bottom"><span>DAY {String(s.day).padStart(3,'0')} · CCTV ARCHIVE</span><span>{s.power<12?'저전력 영상':'생체 움직임 분석 중'}</span></div></div>
<div className="cctv-telemetry"><div><small>격리실 안정성</small><b>{s.facility}%</b><Bar v={s.facility}/></div><div><small>시설 전력</small><b>{s.power}%</b><Bar v={s.power} color="#7de3e7"/></div><div><small>보호 개체</small><b>{s.animals.filter(a=>a.alive).length}종</b></div><div><small>해결한 사고</small><b>{s.security.resolved}건</b></div></div></div>
<aside className="cctv-control"><div className="cctv-section-head"><AlertTriangle size={16}/><b>{s.security.incident?'이상 신호 확인':'현재 감시 상태'}</b></div>{s.security.incident?(()=>{const i=s.security.incident;const a=s.animals.find(x=>x.id===i.animalId);return <><div className="cctv-threat"><span>{i.status==='alert'?'이상 행동':i.status==='breach'?'격리 파손':'시설 이탈'}</span><b>{a?.name}</b><p>{i.description}</p><div>위험도 {i.severity}% <Bar v={i.severity} color="#e5748e"/></div><small>{i.status==='escaped'?(i.tracked?'이동 경로 확보 · 재격리 가능':'이동 경로 미확보 · 추적 필요'):(i.detected?'영상 분석 완료':'영상 분석 필요')} · {i.steps}일째 관측</small>{i.status==='escaped'&&<p className="v31-trace">마지막 포착: {i.camera} · {i.lastTrace||securityPatterns[i.animalId].escape}</p>}</div><div className="cctv-buttons">{i.status!=='escaped'?<><button disabled={s.power<6||s.ap<1||s.eve<10} onClick={()=>operateSecurity('talk')}>음성 교감 <small>전력 -6 · AP -1 · 유대 반영</small></button><button disabled={s.power<18} onClick={()=>operateSecurity('lock')}>격리문 긴급 봉쇄 <small>전력 -18 · 스트레스 증가</small></button><button disabled={s.ap<1} onClick={()=>operateSecurity('enter')}>직접 진정 시도 <small>AP -1 · 관리자 부상 위험</small></button></>:<><button disabled={s.power<9||s.ap<1} onClick={()=>operateSecurity('track')}>CCTV 경로 추적 <small>전력 -9 · AP -1 · 새 카메라 표시</small></button><button disabled={s.ap<1||s.stamina<14} onClick={()=>operateSecurity('manualTrack')}>수동 흔적 수색 <small>정전 대응 · 체력 -14 / 생명력 -3 / AP -1</small></button>{a&&isMutant(a)&&<button disabled={!i.tracked||s.mutantSerum<1||s.ap<1} onClick={()=>operateSecurity('serum')}>억제 주사 · 진정 후 재격리 <small>추적 완료 필요 · 전용 주사 1개 · AP -1</small></button>}<button disabled={!i.tracked||s.medicine<1||s.ap<1} onClick={()=>operateSecurity('recover')}>응급 케이지로 재격리 <small>치료제 -1 · AP -1 · 실패 가능</small></button><button className="cctv-release" onClick={()=>operateSecurity('release')}>다시 가두지 않고 방생 <small>영구적인 개체 이탈</small></button></>}</div><p className="cctv-subtext">{a?securityPatterns[a.id].escape:''}</p></>})():<p className="muted">위험 신호는 없습니다. 구조한 동물의 스트레스와 격리실 상태에 따라 이상 행동이 발생할 수 있습니다.</p>}<button className="cctv-scan" disabled={s.ap<1||s.power<8||s.security.lastScanDay===s.day} onClick={()=>operateSecurity('scan')}><Search size={15}/> CCTV 정밀 분석 <small>전력 -8 / AP -1 / 하루 1회</small></button><div className="cctv-section-head"><BookOpen size={15}/><b>관제 사건 기록</b></div><div className="cctv-history">{s.security.history.length?s.security.history.slice(0,5).map((entry,i)=><div key={i}><small>D{entry.day} · {entry.title}</small><p>{entry.detail}</p></div>):<p className="muted">아직 사건 기록이 없습니다.</p>}</div></aside></div></section>}
{tab==='expedition'&&(s.run ? <FieldMission state={s} animalSrc={img} onMove={onFieldMove} onRetreat={onFieldRetreat} onHunt={onHuntAction} onMedkit={useMedkitNow} feedback={runFeedback}/> : <div className="tab-content"><div className="section-title"><div><span className="micro-label">FIELD OPERATIONS // CLICK EXPEDITION</span><h2>전술 탐사 · 구역 선택</h2><p>현장을 조사하고, 은신 개체가 한 턴 전에 남긴 발자국으로 현재 위치를 추리하십시오. 정보와 장비는 모두 행동 기회를 소모합니다.</p></div><ShieldAlert size={27}/></div><div className={'exp-grid echo-exp-grid '+(s.run?'echo-is-running':'echo-is-preparing')}><div className="echo-location-column"><div className="zone-grid">{!s.run&&regions.map(r=><button data-tour={r.id===selectedRegion?"region":undefined} key={r.id} disabled={s.day<r.unlocked||!!s.run} onClick={()=>selectRegion(r.id)} className={'zone-card '+(selectedRegion===r.id?'active':'')}><div className="zone-pic zone-design"><Compass size={23}/><span>SECTOR {String(r.unlocked).padStart(2,'0')}</span></div><div className="zone-meta"><b>{s.day<r.unlocked?<Lock size={13}/>:<Compass size={14}/>} {r.name}</b><small>{r.desc}</small><span className={r.danger>=60?'danger-text':''}>위험 {r.danger}% · 보상 {r.reward}단계 {s.day<r.unlocked?`· ${r.unlocked}일차 개방`:''}</span></div></button>)}</div><section className="echo-zone-intel" aria-label="선택 구역 안내"><div className="echo-intel-heading"><Eye size={16}/><b>{s.run?'현재 작전 구역':'선택 구역 브리핑'}</b><span>{s.run?'LIVE':'READY'}</span></div><h3>{region.name}</h3><p>{region.desc}</p><div className="echo-intel-metrics"><div><small>위험도</small><strong className={region.danger>=60?'echo-red':''}>{region.danger}%</strong></div><div><small>회수 보상</small><strong>{region.reward}단계</strong></div><div><small>발견 가능 개체</small><strong>{region.animals.length}종</strong></div></div><p className="echo-intel-note">{s.run?'현장 상황과 철수 시점을 판단하세요.':'구역을 선택하면 오른쪽에서 장비와 자원 소모를 확인할 수 있습니다.'}</p></section></div><div className="exp-control"><span className="micro-label">{s.run?'FIELD REPORT / 현장 관측':'LOADOUT / 출동 준비'} · {region.name}</span><h3>{s.run?'탐사 진행 중':'현장 장비 편성'}</h3><p>{region.desc}</p><div className="danger-track"><span>예상 감염·사고 위험</span><b>{region.danger}%</b><Bar v={region.danger} color={region.danger>60?'#e66b84':'#e8b169'}/></div>{!s.run&&<div className="v39-loadout" aria-label="탐사 장비 편성">{gearData.map(g=>{const selected=selectedGear.includes(g.id);const cost:Record<Gear,string>={flashlight:'수동 출동 전지 -25',filter:'필터 -1',scanner:'전력 -8',medkit:'의약품 -1',cage:'본부 개량 전용'};return <button key={g.id} type="button" title={g.desc} aria-pressed={selected} className={'v39-gear-chip '+(selected?'equipped':'')} onClick={()=>setSelectedGear(x=>x.includes(g.id)?x.filter(a=>a!==g.id):[...x,g.id])}><span>{selected?'✓':'＋'}</span><b>{g.name}</b><small>{cost[g.id]}</small></button>})}{s.archive?.bonuses.tracking&&<span className="v39-hq-gear">본부 특수 케이지 적용 · 포획 행동 +3</span>}</div>}<div className="zone-rewards"><b>현장 예상 회수물</b><span>식량 · 부품 · 보존 CR · {region.animals.map(id=>specs.find(a=>a.id===id)?.name).filter(Boolean).join(" / ")} 발견 가능</span><small>고철·지식·단서는 현장 즉시 획득, 부품·식량·CR은 철수 시 한 번만 지급됩니다.</small></div><div className="operation-cost"><span>소모 행동력 <strong>{region.ap}</strong></span><span>시설 전력 <strong>{region.power+(selectedGear.includes('scanner')?8:0)}</strong></span><span>수동 출동 전지 <strong>25</strong></span></div><p className="muted">{canAuto?'자동 탐사 가능':canManual?'전력 부족 · 손전등 수동 탐사 가능':selectedGear.includes('scanner')?'스캐너는 시설 전력이 충분해야 사용 가능합니다. 정전 시 스캐너를 해제하고 손전등을 장착하세요.':'전력 부족 · 손전등이 필요합니다'}</p><button data-tour="launch" className="v10-primary wide" disabled={s.ap<region.ap||s.day<region.unlocked||(!canAuto&&!canManual)||(selectedGear.includes('filter')&&s.filters<1)||(selectedGear.includes('medkit')&&s.medicine<1)} onClick={goRun}>탐사 출동 · 수풀 추적 시작 <ChevronRight size={17}/></button></div></div>{runFeedback&&<div className="v10-notice">◈ {runFeedback}</div>}</div>)}
{tab==='animals'&&<div className="tab-content"><div className="section-title"><div><span className="micro-label">LIVING ARCHIVE / CONTAINMENT</span><h2>격리실 · 보호 개체 관리</h2><p>스트레스가 높아지면 추출이 위험해지고, 치료와 교감은 다른 결과를 만듭니다.</p></div><PawPrint/></div><div className="room-layout"><div className="room-cards">{Array.from({length:s.rooms},(_,i)=>{const a=s.animals.find(a=>a.room===i+1&&a.alive);return <button data-tour={a&&!artAnimal?"animal-room":undefined} key={i} className={'enclosure '+(selectedAnimal===a?.id?'active':'')} onClick={()=>a&&setSelectedAnimal(a.id)}><b>격리실 {String(i+1).padStart(2,'0')} <small>{a?'생체 연결':'비어 있음'}</small></b><div style={{backgroundImage:`url(${img('sanctuary')})`}}>{a?<img src={animalArt(a)} alt={a.name}/>:<span>+</span>}</div><strong>{a?.name||'배정 대기'}</strong>{a&&<VitalChip tone={animalVital(a)} compact/>}{a&&<Bar v={a.hp} color="#ef9ab0"/>}</button>})}</div><div className="animal-inspector">{artAnimal?<><div className={"inspector-header "+(artAnimal.stress>=65?"v36-neural-tremor":"")}><img src={animalArt(artAnimal)} alt={artAnimal.name}/><div><span className="micro-label">BIO SIGNAL · ROOM {artAnimal.room}</span><h3>{artAnimal.name}</h3><VitalChip tone={animalVital(artAnimal)}/>{animalVisual(artAnimal)&&<small className="animal-visual-phase">외형 단계: {animalVisual(artAnimal)==="mutant"?"MUTANT · 변이 발현":"UNCANNY · 불안정"}</small>}<p>{specs.find(x=>x.id===artAnimal.id)?.trait}</p>{isMutant(artAnimal)&&!animalVisual(artAnimal)&&<small className="animal-visual-phase">MUTANT · 신경 변이 진행</small>}</div></div><MiniStat name="체력" value={artAnimal.hp}/><MiniStat name="스트레스" value={artAnimal.stress} color="#eeb974"/><MiniStat name="유대" value={artAnimal.bond} color="#83d7bb"/><MiniStat name="기억 공명" value={artAnimal.memory} color="#9b9df3"/><MiniStat name="오염" value={artAnimal.contamination} color="#ea737a"/><MiniStat name="허기" value={artAnimal.hunger??22} color="#d7b26a"/><MiniStat name="질병" value={artAnimal.sickness??0} color="#e88b99"/><div className="v36-animal-alert"><strong>{SPECIES_CARE[artAnimal.id].note}</strong>{artAnimal.stress>=65&&<p>⚠ 신경 전조: 몸을 가늘게 떨고 있습니다. 관찰 후 적절한 교감을 선택하세요.</p>}{(artAnimal.hunger??0)>=60&&<p>⚠ 굶주림 경보: 다음 밤 체력 손실 위험이 있습니다.</p>}{(artAnimal.sickness??0)>=45&&<p>⚠ 질병 진행: 치료하지 않으면 체력에 손상이 누적됩니다.</p>}</div>{isMutant(artAnimal)&&<section className="v32-mutant-panel" aria-label="변이체 관리 조치"><div className="v32-mutant-head"><span><AlertTriangle size={17}/> MUTANT · 신경 충돌 경보</span><strong>이탈 위험 지수 {escapeRisk(s,artAnimal)}/100</strong></div><p>변이는 일반 치료로 되돌릴 수 없습니다. 장기 방치 시 격리 파손·탈출 위험이 높아집니다. CCTV 이상 행동을 확인하세요.</p><div className="v32-mutant-status"><span>안정화 {Math.max(0,(artAnimal.suppressedUntilDay??0)-s.day+1)}일 남음</span><span>전용 주사 {s.mutantSerum}개</span><span>오늘 행동력 {s.ap}</span></div><div className="v32-mutant-actions"><button disabled={s.ap<1||s.mutantSerum<1||s.security.escapedIds.includes(artAnimal.id)} onClick={()=>mutantCare(artAnimal.id,'serum')}>진정 주사 투여<small>주사 -1 · AP -1 · 3일간 탈출 위험 억제</small></button><button className="danger" disabled={s.ap<2||s.power<10||s.security.escapedIds.includes(artAnimal.id)} onClick={()=>mutantCare(artAnimal.id,'forceExtract')}>강제 신경 추출<small>전력 -10 · AP -2 · 개체 상실 · 지식 확보</small></button><button className="danger" disabled={s.ap<1||s.security.escapedIds.includes(artAnimal.id)} onClick={()=>mutantCare(artAnimal.id,'euthanize')}>안락사 결정<small>AP -1 · 개체 영구 상실 · 정신 부담</small></button></div></section>}<div className="v36-care-guide"><span>ARK · 동물 행동 돌봄</span><p>관찰에 성공하면 공명 동기화의 1·2·3단계 대응 단서가 순서대로 복원됩니다. 관찰 기록 1회는 연구 시작 조건, 올바른 관찰 3회는 세 단계의 검증된 대응 지침입니다.</p>{s.tutorialStep===4&&<b>첫 토끼 튜토리얼: 유대 {artAnimal.bond}/20 · 관찰 1회 완료 후 연구실 해금</b>}</div>
<section className="v41-observation-journal" aria-label="개체 행동 관찰과 공명 기록">
 <header><span><BookOpen size={15}/> 행동 관찰 노트</span><strong>검증 {verifiedObservationCount(artAnimal)} / 3 · 전체 기록 {artAnimal.records}회</strong></header>
 <p>종별 행동을 정확히 관찰하면 공명 단계별로 힌트가 해금됩니다. 관찰 중 오답을 선택해도 일반 기록은 남지만 검증 노트는 열리지 않습니다.</p>
 <div className="v41-observation-notes">{resonanceObservationNotes(artAnimal).map(note=><div key={note.stage} className={note.unlocked?'unlocked':'locked'}><b>{String(note.stage).padStart(2,'0')} · {note.name}</b><span>{note.unlocked?note.message:'잠금 · 정확한 관찰 대응 필요'}</span></div>)}</div>
 </section>
<div className="inspect-actions v36-care-actions">{(['feed','heal','comfort','observe'] as CareAction[]).map(kind=><div className="v36-care-action" key={kind}><button data-tour={kind==='observe'?'observe':undefined} disabled={s.ap<1||(kind==='feed'&&s.food<1)||(kind==='heal'&&s.medicine<1)} onClick={()=>care(artAnimal.id,kind)}><strong>{CARE_ACTIONS[kind].title}</strong><small>{CARE_ACTIONS[kind].cost}</small></button><div className="v36-care-mastery"><span>행동 숙련 {careMastery(artAnimal,kind)}/2</span>{careMastery(artAnimal,kind)>=2&&<button type="button" disabled={s.ap<1} onClick={()=>doQuickCare(artAnimal.id,kind)}>기록대로 빠른 돌봄</button>}</div></div>)}</div>{careMastery(artAnimal,'feed')>=2&&careMastery(artAnimal,'comfort')>=2&&<button type="button" className="v36-routine-switch" onClick={()=>toggleRoutine(artAnimal.id)}>{artAnimal.careRoutine?'✓ 야간 안정 루틴 가동 중 · 해제':'야간 안정 루틴 활성화 · 급식 공급 시 유대 +2 / 스트레스 -4'}</button>}<div className="inspect-actions"><button className="research-link" onClick={()=>{setSelectedAnimal(artAnimal.id);setTab('research');setRunFeedback('개체 상태를 점검한 뒤 준비 조건이 충족되면 행동 강령을 시작할 수 있습니다.')}}>연구 준비 상태 확인</button>{s.security.escapedIds.includes(artAnimal.id)&&<p className="cctv-escape-warning">⚠ 현재 격리실을 이탈했습니다. CCTV 관제에서 추적 후 재격리하세요.</p>}{artAnimal.awakened&&<button className="awakening-replay" onClick={()=>setAwakening({id:artAnimal.id,stage:0})}>인간 음성 기록 재생 <Radio size={13}/></button>}</div></>:<div className="empty-inspect"><PawPrint size={35}/><h3>개체를 선택하세요</h3><p>동물을 발견해 구조하면 이곳에 배정되고, 개체를 눌러 바이탈과 돌봄을 확인할 수 있어요.</p></div>}</div></div></div>}
{tab==='research'&&<div className="tab-content research-readiness-page"><div className="section-title"><div><span className="micro-label">NEURAL ARCHIVE / MEMORY</span><h2>기억 동기화 · 준비 점검</h2><p>행동 강령은 격리실에서 개체를 관찰하고 관리한 뒤 시작할 수 있습니다.</p></div><Brain size={28}/></div>
<div className="research-layout"><div className="research-visual" style={{backgroundImage:`linear-gradient(180deg,#0f0b2166,#0f0b21c4),url(${img('laboratory')})`}}><div className="research-center"><Brain size={42}/><b>ARK-02 MEMORY LINK</b><p>해독된 지식 {s.knowledge} · 기억 단서 {s.clues}</p><p>① 격리실 관리 → ② 조건 충족 → ③ 행동 강령 연구</p></div></div>
<div data-tour="research-target" className="research-target research-preparation"><h3>동기화 대상 선택</h3>{live.length?live.map(a=><button key={a.id} className={'research-animal-select '+(selectedAnimal===a.id?'selected':'')} onClick={()=>setSelectedAnimal(a.id)}><img src={animalArt(a)} alt=""/><span>{a.name}<small>공명 {a.memory}% · 관찰 {a.records}회 · 공명 단서 {verifiedObservationCount(a)}/3 · 유대 {a.bond}</small></span><span className={'research-ready-label '+(protocolReady(a.id)?'is-ready':'is-unready')}>{protocolReady(a.id)?'준비 완료':'준비 필요'}</span></button>):<p className="muted">먼저 탐사에서 동물을 구조하고 격리실에 배정하세요.</p>}
{(()=>{const a=live.find(x=>x.id===selectedAnimal)||live[0];if(!a)return <button className="v10-primary wide" onClick={()=>setTab('expedition')}>첫 개체를 찾으러 탐사하기</button>;const req=protocolRequirements(a.id);const ready=req.every(r=>r.ok);return <div className="research-readiness"><div className="research-readiness-head"><b>{a.name} · 동기화 준비 상태</b><span>{req.filter(r=>r.ok).length}/{req.length} 충족</span></div>
<div className="v41-research-journal"><b><BookOpen size={14}/> 관찰로 복원된 공명 단서 {verifiedObservationCount(a)}/3</b><span>{verifiedObservationCount(a)===3?'세 단계의 검증 기록이 모두 준비되었습니다.':`격리실에서 행동 관찰에 성공하면 다음 공명 단계의 대응 단서가 열립니다. (${3-verifiedObservationCount(a)}개 남음)`}</span></div><div className="research-requirement-list">{req.map(r=><div className={'research-requirement '+(r.ok?'met':'missing')} key={r.label}><span aria-hidden="true">{r.ok?'✓':'!'}</span><b>{r.label}</b><small>{r.value}</small></div>)}</div>{ready?<><p className="research-readiness-help">EVE: "모든 사전 조건이 충족되었습니다. 이제 개체의 관찰 기록을 바탕으로 행동 강령을 진행할 수 있습니다."</p><button className="v10-primary wide" onClick={()=>openProtocol(a.id)}>행동 강령 동기화 시작 <ChevronRight size={16}/></button></>:<><p className="research-readiness-help">EVE: "동기화 전 개체의 상태를 안정화해야 합니다. 격리실에서 행동 관찰·교감·급식·치료를 진행해 주십시오."</p><button className="v10-primary wide" onClick={()=>{setSelectedAnimal(a.id);setTab('animals');setRunFeedback('격리실에서 부족한 연구 조건을 먼저 충족하세요.')}}>격리실로 이동 · {a.name} 관리 <ChevronRight size={16}/></button>{req.some(r=>!r.ok&&r.go==='hub')&&<button className="subbutton" onClick={()=>setTab('hub')}>행동력 부족 · 다음 날 준비</button>}{req.some(r=>!r.ok&&r.go==='supplies')&&<button className="subbutton" onClick={()=>setTab('supplies')}>전력 부족 · 보급실 이동</button>}</>}</div>})()}
<button onClick={()=>action('eve')} disabled={s.ap<1||s.power<8||s.eve<10} className="subbutton"><Search size={14}/> EVE 기록 분석 · 전력 8 / AP 1</button></div></div></div>}
{tab==='synthesis'&&<div className="tab-content synthesis-page"><div className="section-title"><div><span className="micro-label">ARK // BIOLOGICAL SYNTHESIS</span><h2>세포·행동 합성 연구</h2><p>기억 공명 동기화와는 독립된 고급 연구입니다. 서로 다른 두 보호 개체의 샘플을 조합합니다.</p></div><Brain size={28}/></div><div className="synthesis-standalone"><div className="synthesis-intro" style={{backgroundImage:`linear-gradient(180deg,#100b20a6,#100b20de),url(${img('laboratory')})`}}><span className="micro-label">ARK // SYNTHESIS CHAMBER</span><h3>생체 합성실</h3><p>복구한 배양 시설에서 공여 개체 2종을 연결합니다. 지식과 전력이 충분해도 일반 동물 두 종이 필요하며 실패 시 오염이 증가할 수 있습니다.</p><div className="synthesis-status"><span>보호 개체 {live.filter(a=>a.id!=='mutant'&&a.id!=='chimera').length}종</span><span>지식 {s.knowledge}/25</span><span>전력 {s.power}/18</span><span>부품 {s.parts}/2</span><span>행동력 {s.ap}/2</span></div></div><div className="synthesis-panel"><h3>세포·행동 합성 연구</h3><p>일반 동물 두 종의 보존 샘플과 기억 패턴을 조합합니다. 현재 합성 가능한 결과는 접합체 미라 한 종뿐입니다. 공여 개체는 살아남지만 스트레스가 증가합니다. 성공하면 새로운 변이 개체가 태어날 수 있습니다.</p><div className="synthesis-pair"><select value={synthA} onChange={(e:{target:{value:string}})=>setSynthA(e.target.value)} aria-label="첫 번째 공여 개체"><option value="">공여 개체 A</option>{live.filter(a=>a.id!=='mutant'&&a.id!=='chimera').map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><select value={synthB} onChange={(e:{target:{value:string}})=>setSynthB(e.target.value)} aria-label="두 번째 공여 개체"><option value="">공여 개체 B</option>{live.filter(a=>a.id!==synthA&&a.id!=='mutant'&&a.id!=='chimera').map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div><small>필요: 지식 25 · 전력 18% · 부품 2 · 행동력 2 · 빈 격리실 1칸</small><button className="v10-primary wide" onClick={performSynthesis} disabled={live.some(a=>a.id==='chimera')||!synthA||!synthB||synthA===synthB||s.knowledge<25||s.power<18||s.parts<2||s.ap<2||live.length>=s.rooms}>{live.some(a=>a.id==='chimera')?'합성 개체 보존 완료':'합성 실험 실행'}</button></div></div></div>}
{tab==='supplies'&&<div className="tab-content"><div className="section-title"><div><span className="micro-label">SUPPLY TERMINAL / LIFE SUPPORT</span><h2>보급 · 전력 · 시설 정비</h2><p>고철은 탐사에서 수집하며 시설을 복구하는 핵심 자원입니다. 부품은 작동 회로, 전력은 복구 과정에 사용됩니다.</p></div><Power size={27}/></div>
 <section data-tour="workshop" className="v36-workshop" aria-label="보존 시설 복구 작업장">
  <div className="v36-workshop-title"><span>ARK / RECOVERY WORKSHOP</span><h3>시설 복구 작업장</h3><p>폐허에서 회수한 고철을 보존 시설로 연결합니다. 복구한 시설은 다음 날에도 계속 이용할 수 있습니다.</p><div className="v36-workshop-wallet"><b>고철 {s.scrap}개</b><span>부품 {s.parts}개</span><span>전력 {s.power}/100</span></div></div>
  <div className="v36-workshop-grid">{(Object.keys(facilityRecipes) as FacilityId[]).map((id,i)=>{const r=facilityRecipes[id];const done=s.facilities[id];const available=s.scrap>=r.scrap&&s.parts>=r.parts&&s.power>=r.power;return <article className={'v36-facility-card '+(done?'is-built':'')} key={id}><span className="v36-facility-index">REPAIR // {String(i+1).padStart(2,'0')}</span><div className="v36-facility-head"><h4>{r.name}</h4><span>{done?'작동 중':available?'복구 가능':'자원 부족'}</span></div><p>{r.description}</p><div className="v36-facility-cost"><span>고철 {r.scrap}</span><span>부품 {r.parts}</span><span>전력 {r.power}</span></div><strong>{r.benefit}</strong><button type="button" disabled={done||!available||s.phase!=='day'||!!s.run||!!s.pending||!!s.pendingIncident} onClick={()=>constructFacility(id)}>{done?'시설 복구 완료':available?'고철 사용 · 복구 실행':'복구 자원 확보 필요'}</button></article>})}</div>
 </section><div className="supply-grid">{([['food','사료 ×3',90,'하루 급식과 개체 회복'],['med','의약품 ×2',145,'동물 치료와 현장 응급 처치'],['parts','시설 부품 ×3',115,'발전기·격리실 수리'],['filter','바이오필터 ×2',170,'감염 노출 감소'],['battery','전지 ×2',120,'손전등 및 장비 충전'],['room','격리실 추가',480,'수용 개체 수 증가'],['serum','MUTANT 억제 주사 ×1',360,'변이체 탈출 위험을 3일간 낮춤 · 변이 복구 불가']] as const).map(([id,name,price,desc])=><button key={id} onClick={()=>mutate(s=>purchase(s,id))} disabled={s.credits<price}><Package size={22}/><b>{name}</b><small>{desc}</small><strong>{price} CR</strong></button>)}</div><div className="supply-service"><button onClick={()=>action('recharge')} disabled={s.ap<1||s.parts<1}><Zap/> 발전기 재가동 · 부품 1 / AP 1</button><button onClick={()=>action('repair')} disabled={s.ap<1||s.parts<1}><Shield/> 시설 수리 · 부품 1 / AP 1</button><button onClick={()=>action('rest')} disabled={s.ap<1}><Heart/> 휴식 · AP 1</button><button onClick={()=>action('crank')} disabled={s.ap<1}><BatteryCharging/> 수동 발전 · 생명 -14</button><button onClick={()=>action('decontam')} disabled={s.ap<1||s.filters<1}><Wind/> 제독 · 바이오필터 1</button></div></div>}
{tab==='records'&&<div className="tab-content"><SpecimenArchive state={s} onDissection={onArchiveDissection} animalSrc={img}/></div>}
</div><aside className="v10-right"><Tile title="시설 전력 · 상시 계측" extra={<Zap size={16}/>} className="electric-box"><div className="big-power"><b>{s.power}%</b><span>{s.power>=40?'전력망 정상':s.power>0?'전력 부족':'시설 정전'}</span></div><Bar v={s.power} color={s.power<25?'#e97888':'#7ee2e4'}/><div className="right-data"><span>손전등 잔량</span><strong>{s.flashlight}%</strong></div><div className="right-data"><span>예비 전지</span><strong>{s.electricCells}개</strong></div><div className="right-data"><span>시설 안정성</span><strong>{s.facility}%</strong></div></Tile><Tile title="외부 감염·위협" extra={<AlertTriangle size={16}/>}><div className="risk-block"><span>바이러스 감염도</span><b>{s.infection}%</b><Bar v={s.infection} color="#e9a461"/><small>오염이 높아지면 인체와 개체 건강 악화</small></div><div className="risk-block"><span>외부 위협도</span><b>{s.threat}%</b><Bar v={s.threat} color="#e66b85"/><small>방어 준비·시설 정비로 조절 가능</small></div><div className="event-signal"><span>야간 특별 사건 예상</span><b>{incidentWeight(s)}%</b><small>감염·시설 손상·위협·개체 수가 확률에 반영돼요.</small></div></Tile><Tile title="자원 현황" extra={<Package size={15}/>}><div className="right-data"><span>보존 크레딧</span><strong>{s.credits} CR</strong></div><div className="right-data"><span>식량 / 치료제</span><strong>{s.food} / {s.medicine}</strong></div><div className="right-data"><span>부품 / 필터 / 고철</span><strong>{s.parts} / {s.filters} / {s.scrap}</strong></div><div className="right-data"><span>변이체 억제 주사</span><strong>{s.mutantSerum}개</strong></div><div className="right-data"><span>지식 / 단서</span><strong>{s.knowledge} / {s.clues}</strong></div><div className="right-data"><span>행동력</span><strong>{s.ap} / 4</strong></div></Tile><Tile title="최근 신호" extra={<Radio size={14}/>}><p className="small-story">{s.lastOutcome||s.logs[0]?.text}</p></Tile></aside></div>
<div className="v10-bottom"><div className="v10-status"><span><Clock size={13}/> DAY {s.day}</span><span><Zap size={13}/> 전력 {s.power}%</span><span><Heart size={13}/> 생명 {s.hp}/100</span><span className={"v39-status-pill "+eveVital(s.eve)}><Radio size={13}/> EVE {s.eve}/100</span><span><AlertTriangle size={13}/> 감염 {s.infection}%</span><span><PawPrint size={13}/> {live.length}개체</span></div><button className="v10-primary" disabled={!!s.run||!!s.pending||!!s.pendingIncident||s.phase!=='day'} onClick={()=>s.power<5?applyNight('standby'):setNightView(true)}><Moon size={16}/> {s.power<5?'전력 없음 · 무방비로 다음 날':'하루 종료 · 야간 대응'}</button></div>
</main>
{awakening&&!aftermath&&!confirmRestart&&(()=>{const profile=awakeningProfiles[awakening.id];const animal=s.animals.find(a=>a.id===awakening.id);const stage=awakening.stage;const text=[`이상 신호가 발생했습니다. ${animal?.name||'개체'}의 움직임이 멈춥니다.`,profile.animalCry,profile.firstWords,profile.secondWords,'관리자님. 해당 개체에게서 인간 언어에 가까운 발화가 검출되었습니다.',profile.manager][stage];const name=stage<2?animal?.name:stage<4?'??? · 미확인 음성':stage===4?'EVE · 보존 AI':'담당자 000';return <div className="awakening-shade" role="dialog" aria-modal="true" aria-label="의식 이상 발현"><div className="awakening-scene"><div className="awakening-noise"/><div className="awakening-top"><span>ARK // NEURAL ANOMALY</span><b>신경 신호 불일치 감지</b><small>{stage+1} / 6</small></div><div className="awakening-visual">{stage===4?<img className="awakening-avatar eve" src={img('eve-hologram')} alt="EVE"/>:stage===5?<img className="awakening-avatar" src={img('protagonist-young')} alt="관리자"/>:<img className={'awakening-animal '+(stage>=2?'transformed':'')} src={animalArt(animal!)} alt={animal?.name||'개체'}/>}<div className="awakening-signal">{stage<2?'비정상 생체 반응':stage<4?'HUMAN VOICE DETECTED':'SIGNAL STABILIZING'}</div></div><div className="awakening-subtitle"><span>{name}</span><p>{text}</p></div><button className="awakening-next" onClick={()=>{if(stage>=5){setAwakening(null);setSelectedAnimal(awakening.id);setTab('animals')}else setAwakening(x=>x?{...x,stage:x.stage+1}:null)}}>{stage===5?'격리실로 돌아가기':'계속 보기'} <ChevronRight size={17}/></button></div></div>})()}
{current&&!confirmRestart&&<div className="v10-dialog-overlay" role="dialog" aria-modal="true" aria-label="스토리 대화"><div className="v10-dialog"><div className="talk-portrait"><img src={img(current.speaker==='EVE'?'eve-hologram':'protagonist-young')} alt={current.speaker}/></div><div className="talk-body"><span className="micro-label">{current.speaker==='EVE'?'HOLOGRAM · EVE':'SUBJECT · 000'}</span><b>{current.speaker==='관리자'?'담당자':current.speaker}</b><p key={talkIdx}>{current.text.slice(0,letters)}{letters<current.text.length&&<i className="cursor-bar"/>}</p><small>기록 {talkIdx+1} / {talk.length}</small></div><div className="talk-actions"><button type="button" className="talk-back" onClick={previousTalk} disabled={talkIdx===0} aria-label="이전 대사"><ChevronLeft size={15}/> 이전</button><button type="button" className="talk-next" onClick={advanceTalk} aria-label={talkIdx<talk.length-1?'다음 대사':'대화 마치기'}>{talkIdx<talk.length-1?'다음 대사':'대화 마치기'} <ChevronRight size={15}/></button><button type="button" className="talk-skip" onClick={skipTalk} aria-label="남은 대사 모두 건너뛰기">스킵 <X size={13}/></button></div></div></div>}
{nextIncident&&!aftermath&&!current&&!awakening&&!nightView&&!inspect&&!confirmRestart&&!result&&!memoryTarget&&!s.pending&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal event-modal"><span className="micro-label">SPECIAL EVENT / 원인과 결과</span><h2><AlertTriangle/> {nextIncident.title}</h2><p>{nextIncident.desc}</p><div className="event-cause">발생 징후: {nextIncident.cause}<br/>현재 위협 {s.threat}% · 감염 {s.infection}% · 전력 {s.power}%</div><div className="event-options v39-incident-options">{nextIncident.options.map((optionText,i)=>{const preview=previewIncident(s,i);return <button key={i} disabled={!preview.available} onClick={()=>resolveEvent(i)}><span className="v39-incident-number">0{i+1}</span><span className="v39-incident-copy"><strong>{optionText}</strong><small className="v39-incident-effects">{preview.available?preview.effects.slice(0,6).map((e,j)=><em className={deltaIsBad(e.name,e.delta)?'loss':'gain'} key={j}>{e.name} {e.delta>0?'+':''}{e.delta}</em>):'필요 자원 부족 · 다른 대응을 선택하세요'}</small></span><ChevronRight size={15}/></button>})}</div></div></div>}
{aftermath&&!current&&!awakening&&!confirmRestart&&!result&&!nightView&&!inspect&&!memoryTarget&&<div className="v10-modal-shade v39-after-shade" role="dialog" aria-modal="true" aria-label="EVE 대응 결과 보고"><div className={'v10-modal v39-after-modal '+(aftermath.critical?'has-loss':'')}><span className="micro-label">EVE // DAMAGE ASSESSMENT</span><div className="v39-after-top"><AlertTriangle size={24}/><div><h2>{aftermath.title}</h2><p>{aftermath.critical?'작전 실패 또는 방어 불능 · 피해 보고':'사건 처리 완료 · 자원 정산'}</p></div></div><div className="v39-after-effects">{aftermath.entries.length?aftermath.entries.map((d,i)=><div key={i} className={deltaIsBad(d.name,d.delta)?'negative':'positive'}><span>{d.name}</span><strong>{d.delta>0?'+':''}{d.delta}{d.unit}</strong></div>):<p>계측 가능한 자원 증감은 없습니다.</p>}</div><p className="v39-after-summary">{aftermath.notes}</p><button className="v10-primary wide" onClick={()=>{setAftermath(null);setRewardReport(null)}}>보고 확인 · 다음 일과 <ChevronRight size={15}/></button></div></div>}

{fieldRewardModal&&!current&&!result&&!captureReveal&&!aftermath&&!awakening&&!nightView&&!confirmRestart&&<div className="v10-modal-shade v41-rewards-shade" role="dialog" aria-modal="true" aria-label={fieldRewardModal.kind==='settlement'?'현장 탐사 최종 보상':'현장 탐색 보상'}>
 <section className="v10-modal v41-rewards-modal">
  <div className="v41-rewards-heading"><span className="v41-reward-icon"><Package size={25}/></span><div><span className="micro-label">{fieldRewardModal.kind==='settlement'?'MISSION COMPLETE // EXPEDITION LEDGER':'SUPPLY SECURED // FIELD DISCOVERY'}</span><h2>{fieldRewardModal.title}</h2></div></div>
  {fieldRewardModal.settlement&&<div className="v41-settlement-metrics"><span>이동 <strong>{fieldRewardModal.settlement.steps}칸</strong></span><span>현장 단서 <strong>{fieldRewardModal.settlement.clues}건</strong></span><span>회수 점수 <strong>{fieldRewardModal.settlement.loot}점</strong></span></div>}
  <div className="v41-rewards-list" aria-live="polite">{fieldRewardModal.entries.length?fieldRewardModal.entries.map((entry,i)=><div className="v41-reward-entry" key={i}><span><CheckCircle2 size={16}/>{entry.name}</span><strong>+{entry.delta.toLocaleString()}{entry.unit}</strong></div>):<div className="v41-empty-reward">이번 탐사에서 확보한 물자가 없습니다. 위험과 이동 내역만 기록되었습니다.</div>}</div>
  {fieldRewardModal.settlement&&<div className="v41-capture-ledger"><b><PawPrint size={15}/> 개체 처리 기록</b>{fieldRewardModal.settlement.captures.length?fieldRewardModal.settlement.captures.map((record,i)=><div key={i}><span>{specs.find(a=>a.id===record.id)?.name||record.id}</span><strong className={record.result==='secured'?'secured':''}>{record.result==='secured'?'격리실 구조 성공':record.result==='treated'?'현장 치료':record.result==='released'?'방생':'구조 실패'}</strong></div>):<small>이번 탐사에서 확보하거나 처리한 개체는 없습니다.</small>}</div>}
  <p className="v41-rewards-note">{fieldRewardModal.kind==='settlement'?'위 수량은 현장에서 즉시 회수한 물자와 귀환 시 정산한 보상의 합계입니다. 중복 지급되지 않습니다.':'획득 물자는 즉시 보관함에 반영되었습니다. 이 화면을 닫으면 남은 구역을 계속 탐색할 수 있습니다.'}</p>
  <button className="v10-primary wide v41-reward-confirm" type="button" onClick={()=>setFieldRewardModal(null)}>{fieldRewardModal.kind==='settlement'?'최종 정산 확인 · 탐사 메뉴로':'보상 확인 · 계속 수색'} <ChevronRight size={16}/></button>
 </section></div>}
{captureReveal&&s.pending===captureReveal.id&&!current&&!result&&!awakening&&!confirmRestart&&<div className="v10-modal-shade v40-discovery-shade" role="dialog" aria-modal="true" aria-label="숨겨진 동물 발견 확인">
 <section className="v40-discovery-card" aria-live="polite">
  <div className="v40-discovery-scene" style={{backgroundImage:`linear-gradient(180deg,#17182755,#100c1ce8),url(${img('sanctuary')})`}}>
   <div className="v40-pixel-lights" aria-hidden="true"><i/><i/><i/><i/><i/></div>
   <span className="v40-discovery-scan">ARK // SIGNAL VERIFIED · LIVE TARGET</span>
   <span className="v40-reveal-halo" aria-hidden="true"/>
   <img className="v40-discovered-animal" src={img(captureReveal.id)} alt={`수풀에서 찾아낸 ${specs.find(a=>a.id===captureReveal.id)?.name||'동물'}`} />
   <span className="v40-discovery-ground" aria-hidden="true"/>
   <span className="v40-discovery-target" aria-hidden="true"><i/><i/><i/><i/></span>
  </div>
  <div className="v40-discovery-copy">
   <span className="v40-discovery-kicker">DISCOVERY CONFIRMED {captureReveal.cell!==null?`/ ${String.fromCharCode(65+captureReveal.cell%8)}${Math.floor(captureReveal.cell/8)+1}`:''}</span>
   <h2>찾았다. <em>{specs.find(a=>a.id===captureReveal.id)?.name||'미확인 개체'}!</em></h2>
   <p>방금 선택한 지점에서 개체가 모습을 드러냈습니다. 정확한 위치를 맞혔습니다.</p>
   <div className="v40-discovery-confirm"><span>● 현재 좌표 확인</span><span>● 생체 신호 일치</span><span>● 구조 판단 대기</span></div>
   <button type="button" className="v40-discovery-next" onClick={confirmCaptureReveal}>개체 모습 확인 · 대사 이어보기 <ChevronRight size={18}/></button>
  </div>
 </section>
</div>}
{s.pending&&!captureReveal&&!aftermath&&!current&&!result&&!memoryTarget&&!awakening&&!confirmRestart&&<div data-tour="rescue" className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal rescue-modal"><span className="micro-label">BIOLOGICAL SIGNAL / 구조 판단</span><div className="echo-rescue-portrait"><img className="rescue-animal" src={img(s.pending)} alt={`${specs.find(a=>a.id===s.pending)?.name||'발견 동물'}의 모습`}/><small>LIVE BIOLOGICAL SIGNAL</small></div><h2>{specs.find(a=>a.id===s.pending)?.name} 발견</h2><div className="v30-capture-rate"><strong>예상 구조 성공률 {s.tacticalCaptured?100:captureChance(s)}%</strong><span>{s.tacticalCaptured?"전술 포획 성공 · 격리 이송 확정":s.pendingCage?"기존 운송 보정 +15%p 적용":"격자 포획 성공률 기준"} · 감염도 {s.infection}%</span></div><p>개체가 경계하며 물러선다. 운송 과정에서 부상과 감염 위험이 발생할 수 있다.</p><div className="event-options"><button onClick={()=>rescue('secure')}><span>01</span>격리실로 구조한다 <small>성공 시 수용 / 실패 시 부상</small></button><button disabled={s.medicine<1} onClick={()=>rescue('treat')}><span>02</span>현장에서 치료한다 <small>의약품 -1 / 기록 확보</small></button><button onClick={()=>rescue('release')}><span>03</span>거리를 두고 돌려보낸다 <small>생명 존중 / 수집하지 않음</small></button></div></div></div>}
{result&&!aftermath&&!current&&!awakening&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal result-v10"><div className="result-image" style={{backgroundImage:`linear-gradient(180deg,#150d2066,#090513c9),url('/art/rescue-${result.success?'success':'failure'}.jpg')`}}>{result.animalId&&<img className="echo-result-animal" src={img(result.animalId)} alt={specs.find(a=>a.id===result.animalId)?.name||'구조 개체'}/>}</div><div className="result-copy"><span className="micro-label">OPERATION REPORT</span><h2 className={result.success?'good':'bad'}>{result.title}</h2><p>{result.text}</p>{rewardReport&&<div className="v11-result-ledger">{rewardReport.entries.map((item,i)=><span key={i} className={item.delta>0?'reward-gain':'reward-loss'}>{item.name} <b>{item.delta>0?'+':''}{item.delta}{item.unit}</b></span>)}</div>}<button className="v10-primary wide" onClick={()=>{setResult(null);setRewardReport(null);if(s.run&&s.field)setTab('expedition')}}>{s.run&&s.field?"결과 확인 · 현장 수색 계속하기":"결과 확인 · 계속하기"}</button></div></div></div>}
{s.headquarters?.pendingAnimal&&!aftermath&&!current&&!result&&!awakening&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal hq-transfer-modal"><span className="micro-label">CONFIDENTIAL TRANSMISSION · HQ</span><h2>공명도 100% · 이송 승인 요청</h2><p>{s.animals.find(a=>a.id===s.headquarters.pendingAnimal)?.name}의 행동 기록이 완성되었습니다. EVE는 정체가 공개되지 않은 ‘본부’로 개체를 보내겠다고 합니다.</p><div className="hq-security-note">◈ 수신처 식별 불가 · 생체 인계 요청 · 거부 가능</div><div className="event-options"><button onClick={()=>handleHQChoice('transfer')}>본부에 개체 인계 <small>개체 영구 이탈 · CR +220 · 지식 +12 · 본부 지원품 선택 1회</small></button><button onClick={()=>handleHQChoice('copy')}>이송 기록을 먼저 복사한다 <small>개체 보유 · 단서 +2 · 전력 -12</small></button><button onClick={()=>handleHQChoice('refuse')}>인계 거부 · 시설에 남긴다 <small>유대 보존 · 외부 위협 증가</small></button></div></div></div>}
{s.headquarters?.pendingScene&&!aftermath&&s.phase!=='ending'&&!current&&!result&&!awakening&&!confirmRestart&&!s.headquarters.pendingAnimal&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal hq-story-modal"><span className="micro-label">ENCRYPTED DIRECTIVE · {s.headquarters.revealStage}/3</span><h2>{hqScene[s.headquarters.pendingScene].title}</h2><div className="hq-story-lines">{hqScene[s.headquarters.pendingScene].lines.map((line,i)=><p key={i}>{line}</p>)}</div><button className="v10-primary wide" onClick={closeHQScene}>기록을 보존한다 <ChevronRight size={16}/></button></div></div>}
{s.archive?.revealPending&&!aftermath&&s.phase==='day'&&!current&&!result&&!awakening&&!nightView&&!inspect&&!memoryTarget&&!careDialog&&!s.pending&&!confirmRestart&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade v37-truth-shade" role="dialog" aria-modal="true" aria-label="병리실 기밀 발견"><div className="v10-modal v37-truth-modal"><span className="micro-label">TOP SECRET // THE PROTOCOL WAS NEVER FOR THE ANIMALS</span><h2>병리실 원본 기록 복구</h2><div className="v37-sequence" key={archiveSceneStep}><span>{String(archiveSceneStep+1).padStart(2,'0')} / 05 · EVE / 수신처 원본</span><p>{[
 '본부 이송 명세에서 "신경 조직 회수"와 "의식 안정화 약물"이라는 항목이 반복됩니다.',
 '동물은 감염병에 강했습니다. 면역성을 보였던 인간의 뇌 조직은 동물의 신경계에 이식되었습니다.',
 '정상적인 인간의 인지가 깨어나면 동물의 육체와 신경계가 충돌했습니다. 연구진은 의도적으로 인지 기능을 낮추고 기억을 잠재웠습니다.',
 '공명 100%는 회복이 아니었습니다. 본부가 활성화된 신경 조직을 수거하기 위한 신호였습니다.',
 '담당자님이 보내셨던 개체의 처리 기록이 모두 남아 있습니다. 분석실의 원래 명칭은 "해부실"입니다.'
 ][archiveSceneStep]}</p></div><button className="v10-primary wide" onClick={advanceArchiveTruth}>{archiveSceneStep===4?'기록 확인 · 해부실 해금':'다음 기밀 문서'} <ChevronRight size={16}/></button></div></div>}
{s.archive?.pendingGifts>0&&!aftermath&&!s.archive.revealPending&&s.phase==='day'&&!current&&!result&&!awakening&&!nightView&&!inspect&&!memoryTarget&&!careDialog&&!s.pending&&!confirmRestart&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade v37-gift-shade" role="dialog" aria-modal="true" aria-label="본부 지원 물품 선택"><div className="v10-modal v37-gift-modal"><span className="micro-label">HEADQUARTERS / PRIORITY SUPPORT</span><h2>본부로부터 지원품 선택권 도착</h2><p>외부 생체 이송 또는 신경 조직 송신의 대가입니다. 다음 세 가지 중 하나를 선택하십시오.</p><div className="v37-gift-options"><button disabled={s.archive.bonuses.tracking} onClick={()=>onChooseArchiveGift('tracking')}><Compass size={22}/><strong>본부 특수 운송 케이지</strong><span>포획 행동 기회 영구 +3</span></button><button disabled={s.archive.bonuses.power} onClick={()=>onChooseArchiveGift('power')}><Zap size={22}/><strong>무인 발전 제어기</strong><span>매일 새벽 전력 자동 +30 (최대 100)</span></button><button onClick={()=>onChooseArchiveGift('serum')}><HeartPulse size={22}/><strong>신경 억제 혈청</strong><span>MUTANT 진정 주사 3개 즉시 지급</span></button></div><p className="muted">남은 지원권 {s.archive.pendingGifts}건 · 본부의 실제 실험 목적은 연구 기록에 남습니다.</p></div></div>}
{nightView&&!aftermath&&!current&&!awakening&&!confirmRestart&&!inspect&&!memoryTarget&&!result&&!s.pending&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal night-modal"><button className="modal-x" onClick={()=>setNightView(false)}><X size={18}/></button><span className="micro-label">NIGHT PROTOCOL / 사전 전력 배분</span><h2>밤이 오기 전에</h2><p>전력이 부족하면 경비를 포기한 채 다음 날로 넘어갈 수 있습니다. 대신 외부 위협과 사건 확률이 크게 상승합니다.</p><div className="night-power"><div><b>가용 전력 {s.power}%</b><small>기본 유지 최대 6% · 부족 시 경비 없이 경과</small></div><Bar v={s.power} color="#78e2df"/></div><div className="night-choices">{([['shield','격리문·방어 강화',22,'위협도 감소 · 시설 보호'],['rest','관리자 휴식',5,'체력·정신 회복 · 위협 증가 가능'],['analyze','EVE 야간 기록 분석',16,'지식·단서 획득 · EVE 코어 소모'],['standby','경비 중단 · 야간 경과',0,'전력 0도 진행 가능 · 위협도·사고 위험 대폭 상승']] as const).map(([id,name,cost,desc])=><button className={nightChoice===id?'active':''} key={id} onClick={()=>setNightChoice(id)}><b>{name}</b><span>전력 -{cost}%</span><small>{desc}</small></button>)}</div><div className="power-result"><span>계획 후 예상 전력</span><strong>{Math.max(0,s.power-({shield:22,rest:5,analyze:16,standby:0}[nightChoice]+6))}%</strong></div><div className="modal-actions"><button onClick={()=>setNightView(false)}>돌아가기</button><button className="v10-primary"  onClick={()=>applyNight()}>{s.power<({shield:22,rest:5,analyze:16,standby:0}[nightChoice])?'경비 불가 · 무방비로 다음 날':'야간 운영 확정'} <ChevronRight size={16}/></button></div></div></div>}
{careDialog&&!aftermath&&!current&&!result&&!awakening&&!nightView&&!confirmRestart&&!inspect&&!memoryTarget&&!s.headquarters?.pendingScene&&!s.headquarters?.pendingAnimal&&(()=>{
 const animal=s.animals.find(a=>a.id===careDialog.id&&a.alive);
 if(!animal)return null;
 const scenario=getCareScenario(animal,careDialog.kind,s.day);
 return <div className="v10-modal-shade v36-care-shade" role="dialog" aria-modal="true" aria-label="보호 개체 행동 대응">
 <div className="v10-modal v36-care-modal"><header className="v36-care-modal-head"><div><span className="micro-label">ARK / BEHAVIORAL CARE</span><h2>{scenario.title}</h2><small>{CARE_ACTIONS[careDialog.kind].cost} · 행동 선택 후 실제 자원이 소모됩니다.</small></div><button type="button" className="v36-care-close" onClick={closeCare} aria-label="돌봄 닫기"><X size={19}/></button></header>
 <div className="v36-care-specimen"><img src={animalArt(animal)} alt={animal.name}/><div><span>현재 행동 관찰</span><p>{scenario.cue}</p><b>유대 {animal.bond}/100 · 스트레스 {animal.stress}/100</b></div></div>
 {!careOutcome?<><p className="v36-care-question">{scenario.question}</p><div className="v36-care-options">{scenario.options.map((label,i)=><button type="button" key={i} onClick={()=>submitCare(i)}><span>{String(i+1).padStart(2,'0')}</span><b>{label}</b><ChevronRight size={17}/></button>)}</div><p className="v36-care-footnote">※ 정답을 누르기 전까지 행동력과 물자를 쓰지 않습니다. 대응을 선택하면 하루의 돌봄 행동 1회가 소모됩니다.</p></>:<div className={'v36-care-outcome '+(careOutcome.correct?'success':'failure')}><strong>{careOutcome.correct?'행동 대응 일치 · 안정화 성공':'행동 대응 불일치 · 신경 긴장 증가'}</strong><p>{careOutcome.message}</p><div className="v36-care-deltas"><span>유대 {careOutcome.delta.bond>=0?'+':''}{careOutcome.delta.bond}</span><span>스트레스 {careOutcome.delta.stress>=0?'+':''}{careOutcome.delta.stress}</span><span>체력 {careOutcome.delta.hp>=0?'+':''}{careOutcome.delta.hp}</span><span>행동 기록 +{careOutcome.delta.records}</span></div><small>행동 숙련도 {careOutcome.mastery}/2{careDialog.kind==='observe'&&careOutcome.correct?' · 공명 단서 복원 '+Math.min(3,careOutcome.mastery)+'/3':''}{careOutcome.tutorialUnlock?' · 첫 공명 연구 해금':''}</small><button className="v10-primary wide" type="button" onClick={closeCare}>{careOutcome.tutorialUnlock?'EVE의 공명 연구 안내 듣기':'격리실로 돌아가기'} <ChevronRight size={16}/></button></div>}
 </div></div>;
})()}
{memoryTarget&&!aftermath&&!current&&!result&&!awakening&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal memory-modal protocol-modal"><button className="modal-x" onClick={()=>setMemoryTarget(null)} aria-label="닫기"><X/></button><span className="micro-label">ARK-02 / 행동 강령 기반 의식 공명</span><h2>{specs.find(a=>a.id===memoryTarget)?.name} · {protocols[memoryTarget as AnimalId].title}</h2><p>{protocols[memoryTarget as AnimalId].hint}</p>{s.extractions===0&&<div className="protocol-tutorial"><b>EVE · 행동 강령 실습</b><p>먼저 격리실에서 행동 관찰을 기록하고 유대를 확보하세요. 환경 구성 → 행동 반응 → 기억 해석, 세 차례 판단이 서로 연결됩니다. 정답은 즉시 공개되지 않으며, 세 선택의 일치율과 개체 상태에 따라 공명도가 달라집니다.</p><p>완성된 공명 기록이 100%에 도달하면 외부 이송 요청이 발생합니다. 동물을 무조건 보내야 하는 것은 아닙니다.</p></div>}<div className="protocol-conditions"><span>사전 관찰 {s.animals.find(a=>a.id===memoryTarget)?.records||0}회</span><span>유대 {s.animals.find(a=>a.id===memoryTarget)?.bond||0}%</span><span>스트레스 {s.animals.find(a=>a.id===memoryTarget)?.stress||0}%</span><span>전력 {s.power}%</span><span>현재 공명 {s.animals.find(a=>a.id===memoryTarget)?.memory||0}% / 100%</span></div><div className="protocol-stages">{[0,1,2].map(i=><span key={i} className={protocolStep===i?'active':protocolStep>i?'complete':''}>{['① 행동 환경','② 본능 반응','③ 기억 기록'][i]}</span>)}</div><div className={'v41-protocol-note '+(resonanceObservationNotes(s.animals.find(a=>a.id===memoryTarget)!)[protocolStep].unlocked?'unlocked':'locked')}><BookOpen size={15}/><div><b>행동 관찰 연동 · {protocolStep+1}단계</b><span>{resonanceObservationNotes(s.animals.find(a=>a.id===memoryTarget)!)[protocolStep].message}</span></div></div><h3>{protocols[memoryTarget as AnimalId].steps[protocolStep].prompt}</h3><div className="protocol-choices">{(()=>{const stage=protocols[memoryTarget as AnimalId].steps[protocolStep];const offset=(memoryTarget.length+protocolStep*2)%3;return [0,1,2].map((i)=><button key={i} onClick={()=>protocolAnswer(i)} ><span>0{i+1}</span>{stage.choices[(i-offset+3)%3]}<ChevronRight size={15}/></button>)})()}</div><p className="protocol-feedback" role="status">{protocolFeedback||'조건이 비슷한 선택지들이 섞여 있습니다. 관찰 기록과 앞선 반응을 함께 고려하세요. 결과는 세 단계 종료 후 공개됩니다.'}</p><div className="mode-select"><button className={extractMode==='gentle'?'active':''} onClick={()=>setExtractMode('gentle')}>비침습적 관찰</button><button className={extractMode==='force'?'active':''} onClick={()=>setExtractMode('force')}>강제 공명 · 개체 손상 위험</button></div><small className="protocol-warning">필요 조건: 관찰 1회 · 유대 20 이상 · 스트레스 78 이하 · 체력 35 이상 · 행동력 2 · 전력 7%</small></div></div>}
{inspect&&!current&&!awakening&&!result&&!nightView&&!memoryTarget&&!s.pending&&!s.headquarters?.pendingAnimal&&!s.headquarters?.pendingScene&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal photograph-modal"><button className="modal-x" onClick={()=>setInspect(false)}><X/></button><h2>복원 중인 사진</h2><img src={img('hidden-photo')} style={{filter:`blur(${Math.max(0,8-s.clues*.9)}px)`}} alt="과거 기록"/><p>{s.flags.humanTruth?'사진 속 생명들은 한때 인간의 기억을 품었다.':s.clues>3?'오래된 사진 속에서 인간과 동물이 함께 있었다는 사실이 드러난다.':'유리 표면이 심하게 손상되어 누가 찍혔는지 알아볼 수 없다.'}</p></div></div>}
{s.phase==='finale'&&!current&&!result&&!awakening&&!memoryTarget&&!nightView&&!confirmRestart&&!s.headquarters?.pendingScene&&!s.headquarters?.pendingAnimal&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal finale-modal"><span className="micro-label">ARK // FINAL DIRECTIVE</span><h2>보존 명령의 마지막 문장</h2><p>이곳에 남은 생명과 기록의 미래를 결정해야 한다. 하지만 결과는 지금까지의 구조와 연구, 신뢰에 영향을 받는다.</p><div className="event-options"><button onClick={()=>mutate(s=>finishWithArchive(s,'rebuild'))}>인간의 의식을 복원한다</button><button onClick={()=>mutate(s=>finishWithArchive(s,'freedom'))}>동물원을 개방한다</button><button onClick={()=>mutate(s=>finishWithArchive(s,'preserve'))}>EVE와 보존을 이어간다</button></div></div></div>}
{s.phase==='ending'&&!current&&!result&&!awakening&&!memoryTarget&&!nightView&&!confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal ending-modal"><span className="micro-label">ECHO WARD / ENDING</span><h2>잔향보존구역</h2><EndingArtwork ending={s.ending}/><p>{s.ending}</p>{s.headquarters?.revealStage>=3&&<p className="ending-hq-aftermath">본부의 계획은 인간이었던 이들의 신경 조직을 재사용해 인류를 재생하는 것이었습니다. 당신 역시 그 계획에서 태어난 복제 관리자였습니다. 본부에 인계된 개체 {s.headquarters.transferred.length}종, 송신한 신경 조직 {s.archive?.dispatches??0}건, 시설에 남겨 지킨 개체 {live.length}종. 그들의 최종 운명은 지금까지 당신이 내린 결정과 함께 기록됩니다.</p>}<div>남은 생명 {live.length}마리 · 복원 지식 {s.knowledge} · 단서 {s.clues}개 · 생존 {s.day}일</div><button className="v10-primary" onClick={()=>setConfirmRestart(true)}>새로운 기록 시작하기</button></div></div>}
{confirmRestart&&<div className="v10-modal-shade" role="dialog" aria-modal="true"><div className="v10-modal"><h2>새로운 기록을 시작할까요?</h2><p>현재 자동 저장 기록이 교체됩니다.</p><div className="modal-actions"><button onClick={()=>setConfirmRestart(false)}>취소</button><button className="v10-primary" onClick={()=>{localStorage.removeItem(KEY);setS(null);setConfirmRestart(false);setTalk([]);setResult(null);setCaptureReveal(null);setNightView(false);setMemoryTarget(null)}}>새 게임</button></div></div></div>}
</div>}
