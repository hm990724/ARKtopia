import {cap,copy,log,recordMutation,dailyWork,type AnimalId,type AnimalState,type State} from './sim';

/** Behavioural care is an observation/patient-handling puzzle, not a free-stat click. */
export type CareAction='feed'|'heal'|'comfort'|'observe';
export const CARE_ACTIONS:Record<CareAction,{title:string;cost:string;purpose:string}>= {
 feed:{title:'급식',cost:'식량 1 · 행동력 1',purpose:'체력 회복 및 먹이 신뢰 형성'},
 heal:{title:'치료',cost:'의약품 1 · 행동력 1',purpose:'상처 치료 및 생체 오염 저감'},
 comfort:{title:'교감',cost:'행동력 1',purpose:'유대 상승과 신경 스트레스 완화'},
 observe:{title:'행동 관찰',cost:'행동력 1',purpose:'관찰 기록과 공명 연구 단서 확보'}
};

type Profile={cue:string;feed:string;heal:string;comfort:string;observe:string;mislead:[string,string];rationale:string};
const profiles:Record<AnimalId,Profile>={
 rabbit:{cue:'소리에 놀라면 귀를 붙이고 가만히 숨을 고릅니다.',feed:'먹이를 입구에 두고 시선을 거둔 채 스스로 다가오도록 기다린다.',heal:'낮은 자세에서 한쪽 귀의 움직임을 확인하고 짧게 처치한다.',comfort:'앞을 막지 않고 정적인 거리를 유지하며 손을 낮게 둔다.',observe:'귀를 접는 순서와 숨을 고르는 시간을 간섭 없이 기록한다.',mislead:['가까운 거리를 유지하며 계속 눈을 맞춘다.','가벼운 소리를 주어 반응을 확인한다.'],rationale:'토끼는 출구와 정숙함을 확보할 때 안정됩니다.'},
 fox:{cue:'먼저 출구를 확인하고, 모르는 도구를 곁눈질합니다.',feed:'퇴로를 열어 둔 채 사료를 사각지대 가까이에 둔다.',heal:'케이지 문을 열어 둔 채 접근 경로가 보이게 짧게 처치한다.',comfort:'출구 방향에 서지 않고 먼저 선택권을 준다.',observe:'같은 장소를 두 번 돌아보는지, 실제 발자국과 몸의 방향을 비교한다.',mislead:['관찰하기 쉽게 출구 옆에서 기다린다.','도구를 앞에 놓고 얼마나 빨리 피하는지 살핀다.'],rationale:'여우는 시야와 퇴로를 먼저 계산합니다. 막아서는 행동을 경계합니다.'},
 deer:{cue:'사소한 진동에도 고개를 들고 경계합니다.',feed:'일정한 거리를 두고 먹이를 낮은 곳에 분산한다.',heal:'시야에서 벗어나지 않도록 느리게 옆으로 접근한다.',comfort:'몸을 낮추고 움직임을 멈춰 경계가 풀리는 순간을 기다린다.',observe:'고개가 향하는 방향과 뒷발의 체중 이동을 기록한다.',mislead:['시선을 끌기 위해 밝은 손전등을 천천히 비춘다.','먹이와 장비를 한곳에 모아 움직임을 최소화한다.'],rationale:'사슴은 갑작스러운 진입과 좁은 동선을 위협으로 받아들입니다.'},
 owl:{cue:'낮에는 어두운 횃대에서 눈을 반쯤 감고 있습니다.',feed:'빛이 적은 횃대 가까이 먹이를 놓고 시야를 가리지 않는다.',heal:'조도를 낮추고 날개 움직임을 확인해 짧게 처치한다.',comfort:'정면 응시를 피하고 소음을 낮춰 횃대를 유지한다.',observe:'날개를 정리하는 순서와 시선 회전을 어두운 곳에서 관찰한다.',mislead:['밝은 조명 아래에서 자세를 분명히 확인한다.','횃대에서 내려오도록 주변을 가볍게 건드린다.'],rationale:'올빼미는 어둠과 높은 휴식 지점에서 더 자연스럽게 행동합니다.'},
 wolf:{cue:'접근하는 사람의 손보다 발과 퇴로를 먼저 살핍니다.',feed:'먹이를 둔 뒤 뒤로 물러나 경계 거리를 유지한다.',heal:'정면 대치를 피하고 짧은 동선으로 안전하게 처치한다.',comfort:'움직임을 예고한 뒤 충분한 거리를 두고 기다린다.',observe:'이동 전에 바닥 냄새를 확인하는 순서와 경계 방향을 기록한다.',mislead:['통제력을 보이기 위해 정면에서 가까이 선다.','경계가 풀릴 때까지 짧은 소리를 반복한다.'],rationale:'늑대는 정면 대치와 반복적인 위협 신호를 민감하게 받아들입니다.'},
 crow:{cue:'반짝이는 금속과 같은 모양의 물체를 반복해서 비교합니다.',feed:'먹이를 놓고 가벼운 금속 도구를 충분히 떨어뜨려 둔다.',heal:'움직이는 장신구를 치우고 일정한 손동작으로 처치한다.',comfort:'반짝이는 물건을 강제로 빼앗지 않고 거리를 유지한다.',observe:'물건을 옮기는 순서와 같은 소리를 흉내 내는 횟수를 기록한다.',mislead:['관심을 끌기 위해 빛나는 도구를 손앞에서 흔든다.','반응을 유도하려고 같은 소리를 빠르게 반복한다.'],rationale:'까마귀는 사물의 순서와 변화를 기억합니다. 반복 자극은 경계가 됩니다.'},
 otter:{cue:'물가를 떠나지 않고 작은 물체를 씻어 확인합니다.',feed:'먹이를 얕은 물 옆에 놓고 손으로 잡아당기지 않는다.',heal:'젖은 몸을 급히 말리지 않고 물가에서 짧게 확인한다.',comfort:'물가의 자유로운 왕복을 보장하고 조용히 기다린다.',observe:'물체를 물에 담그는 횟수와 밸브를 만지는 순서를 기록한다.',mislead:['물밖으로 먼저 유도하여 상태를 관찰한다.','먹이를 한곳에 모아 물과의 접촉을 줄인다.'],rationale:'수달에게 물길은 안전한 이동 경로이자 탐색 행동의 일부입니다.'},
 lynx:{cue:'눈을 맞추면 곧장 옆으로 몸을 숨깁니다.',feed:'직접 다가가지 않고 측면 그늘에 먹이를 남긴다.',heal:'낮은 측면으로 이동해 짧게 상태를 확인한다.',comfort:'시선을 피하고 숨을 수 있는 공간을 확보한다.',observe:'숨었다가 다시 나타나는 측면 위치와 멈춤 간격을 기록한다.',mislead:['정면 시선을 유지해 움직임을 멈추게 한다.','먹이를 열린 공간 중앙에 두어 모습을 확인한다.'],rationale:'스라소니는 직선 접근보다 측면 이동과 은신처를 선호합니다.'},
 axolotl:{cue:'수온과 물의 진동이 바뀔 때 아가미가 먼저 반응합니다.',feed:'수류를 약하게 유지한 채 먹이를 바닥에 천천히 떨어뜨린다.',heal:'수온 변화를 최소화하고 물속에서 필요한 부위만 확인한다.',comfort:'수류를 안정화하고 외부 자극을 줄인다.',observe:'아가미 움직임과 물의 미세한 진동이 일치하는지 기록한다.',mislead:['물 밖으로 잠깐 올려 세밀한 반응을 확인한다.','반응을 높이기 위해 수류를 반복해서 바꾼다.'],rationale:'아홀로틀은 수온·수류 변화에 민감하며 물밖 관찰은 큰 스트레스입니다.'},
 moth:{cue:'빛을 향해 움직이지만 강한 광원에는 날개가 흐트러집니다.',feed:'약한 확산광 아래 먹이를 두고 강한 빛을 피한다.',heal:'날개에 직접 손대지 않고 어두운 곳에서 상태를 확인한다.',comfort:'확산광 하나만 남겨 광원의 변화를 줄인다.',observe:'약한 빛과 그림자 사이를 오가는 경로를 기록한다.',mislead:['밝은 집중 조명으로 날개 모양을 살핀다.','빛을 여러 곳에서 빠르게 켰다 끈다.'],rationale:'나방의 광주성은 강한 자극을 오래 견딘다는 뜻이 아닙니다.'},
 mutant:{cue:'같은 소리에 서로 다른 방향의 반응이 번갈아 나타납니다.',feed:'강한 자극 없이 먹이를 놓고 어떤 신호에 반응하는지 기다린다.',heal:'충돌하는 움직임이 잦아들 때 짧은 부위만 처치한다.',comfort:'하나의 반복되는 낮은 신호만 유지하고 거리를 둔다.',observe:'목소리와 신체 움직임 사이의 시간 차이를 기록한다.',mislead:['강한 빛으로 한쪽 반응을 억제한다.','두 종류의 신호를 동시에 보내 반응을 비교한다.'],rationale:'변이체는 서로 충돌하는 신경 신호에 추가 자극을 주면 위험해집니다.'},
 specter:{cue:'빛이 사라진 곳에서만 몸을 낮춥니다.',feed:'그늘 가장자리에 먹이를 두고 거리를 유지한다.',heal:'조명을 낮추고 잔향이 안정될 때 처치한다.',comfort:'익숙한 밝기를 유지하고 천천히 기다린다.',observe:'빛이 꺼진 뒤 남는 잔향의 길이를 기록한다.',mislead:['강한 조명으로 몸의 경계를 계속 추적한다.','갑자기 다가가 잔향의 위치를 확인한다.'],rationale:'아직 신원이 확인되지 않았습니다. 안정된 환경에서 반응 자체를 기록합니다.'},
 chimera:{cue:'두 신체 부위의 움직임이 서로 어긋납니다.',feed:'반응이 안정적인 부위의 반대편에 조용히 먹이를 놓는다.',heal:'움직임이 일치하는 짧은 구간에 국소 처치한다.',comfort:'시각과 청각 신호를 하나씩 줄여 반응을 안정시킨다.',observe:'두 반응이 일치하거나 어긋나는 시점을 따로 기록한다.',mislead:['반응이 빠른 부위를 먼저 붙잡아 움직임을 맞춘다.','두 부위에 같은 강도의 신호를 동시에 준다.'],rationale:'접합체는 다른 신경 패턴이 동시에 작동해 신호 간섭이 발생합니다.'}
};
const actionCues:Record<CareAction,string>={feed:'먹이를 주려 하지만 먼저 반응을 살펴야 합니다.',heal:'회복 처치가 필요하지만 직접적인 접촉은 불안정을 유발할 수 있습니다.',comfort:'스트레스 완화를 위해 어떻게 접근할지 판단해야 합니다.',observe:'다음 기억 동기화를 위한 행동 기록을 남길 차례입니다.'};
const thirdAlternatives:Record<CareAction,string>={feed:'먹이의 양을 늘려 빠르게 접근하도록 유도한다.',heal:'치료 속도를 높이기 위해 움직이지 못하도록 붙잡는다.',comfort:'손을 뻗어 직접 쓰다듬으며 친밀감을 확인한다.',observe:'반응을 재현하려고 같은 자극을 반복해서 준다.'};
export type CareScenario={id:AnimalId;kind:CareAction;title:string;cue:string;question:string;options:string[];correct:number;reason:string};
export function getCareScenario(a:AnimalState,kind:CareAction,day:number):CareScenario{
 const profile=profiles[a.id];
 const condition=[(a.hunger??22)>=65?'허기가 심해 주변을 급하게 훑고 있습니다.':null,(a.sickness??0)>=40?'호흡이 불규칙하고 몸을 떠는 증상이 있습니다.':null,a.stress>=70?'경고: 근육이 떨리고 같은 움직임을 반복합니다. 신경 충돌 전조가 의심됩니다.':null].filter(Boolean).join(' ');
 const intelligence=a.records>=1?` 관찰 기록: ${profile.rationale}`:' 행동 관찰 1회를 먼저 진행하면 안전한 대응의 실마리가 제공됩니다.';
 const actions=[profile[kind],...profile.mislead,thirdAlternatives[kind]];
 const offset=(day+a.records+a.id.length+({feed:0,heal:1,comfort:2,observe:3}[kind]))%4;
 const options=Array.from({length:4},(_,i)=>actions[(i+offset)%4]);
 const correct=(4-offset)%4;
 return {id:a.id,kind,title:`${a.name} · ${CARE_ACTIONS[kind].title}`,cue:profile.cue+' '+condition+intelligence,
  question:(a.stress>=60?'[신경 긴장 경보] ':'')+actionCues[kind],options,correct,reason:profile.rationale};
}
export function careMastery(a:AnimalState,kind:CareAction):number{return a.careMastery?.[kind]??0;}
export function canQuickCare(a:AnimalState,kind:CareAction):boolean{return careMastery(a,kind)>=2;}
export type CareResult={next:State;correct:boolean;message:string;delta:{bond:number;stress:number;hp:number;records:number};mastery:number};
export function resolveCareChoice(s:State,id:AnimalId,kind:CareAction,chosen:number):CareResult|null{
 const animal=s.animals.find(x=>x.id===id&&x.alive);if(!animal||!Number.isInteger(chosen)||chosen<0||chosen>3)return null;
 const scenario=getCareScenario(animal,kind,s.day);
 const next=dailyWork(s,kind,id);if(next===s)return null;
 const a=next.animals.find(x=>x.id===id&&x.alive)!;
 const correct=chosen===scenario.correct;
 if(correct){a.bond=cap(a.bond+3);a.stress=cap(a.stress-3);a.careMastery={...(a.careMastery||{}),[kind]:Math.min(3,careMastery(animal,kind)+1)};}
 else{
  // A real consequence: food/medicine/AP are still spent, with weaker gains and more stress.
  a.bond=cap(a.bond-(kind==='comfort'?18:kind==='feed'?13:6));a.stress=cap(a.stress+(kind==='comfort'?30:kind==='feed'?19:kind==='observe'?18:18));
  if(kind==='feed'){a.hp=cap(a.hp-5);a.hunger=cap((a.hunger??0)+24);}
  if(kind==='heal'){a.contamination=cap(a.contamination+7);a.sickness=cap((a.sickness??0)+18);}
  if(kind==='observe')a.memory=cap(a.memory-2);
 }
 const message=correct?`${scenario.reason} 성공적인 대응으로 유대가 추가 상승했습니다.`:`개체가 예상과 다르게 반응했습니다. ${scenario.reason} 스트레스가 높아지고 신뢰가 감소했습니다.`;
 log(next,correct?'돌봄 반응 일치':'돌봄 반응 불일치',`${animal.name}: ${message}`,correct?'good':'bad');
 recordMutation(next,a);
 return {next,correct,message,delta:{bond:a.bond-animal.bond,stress:a.stress-animal.stress,hp:a.hp-animal.hp,records:a.records-animal.records},mastery:careMastery(a,kind)};
}
export function quickCare(s:State,id:AnimalId,kind:CareAction):State{
 const animal=s.animals.find(x=>x.id===id&&x.alive);
 if(!animal||!canQuickCare(animal,kind))return s;
 const next=dailyWork(s,kind,id);if(next===s)return s;
 log(next,'숙련 돌봄',`${animal.name}의 검증된 돌봄 절차를 적용했습니다. 행동력과 소모 자원은 일반 돌봄과 동일합니다.`,'good');
 return next;
}
/** After two correct comforting/feeding records, the nightly ration gives small passive stability. */
export function applyFamiliarRoutine(a:AnimalState):boolean{
 if(!a.careRoutine||!a.alive||careMastery(a,'feed')<2||careMastery(a,'comfort')<2)return false;
 a.stress=cap(a.stress-4);a.bond=cap(a.bond+2);
 return true;
}
