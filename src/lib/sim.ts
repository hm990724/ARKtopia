export type AnimalId='rabbit'|'fox'|'deer'|'owl'|'wolf'|'crow'|'otter'|'lynx'|'axolotl'|'moth'|'dino'|'mutant';
export type AnimalState={id:AnimalId;name:string;hp:number;stress:number;bond:number;memory:number;contamination:number;room:number;alive:boolean;records:number};
export type Origin='medic'|'engineer'|'artist'|'warden';
export type Start='medical'|'greenhouse'|'station'|'observatory';
export type EventRecord={day:number;title:string;text:string;kind:'info'|'good'|'bad'|'mystery'};
export type Flags={foundKey:boolean;foxStory:boolean;memoryDoor:boolean;humanTruth:boolean;mirror:boolean;consent:boolean;eveLied:boolean;infirmary:boolean;greenhouse:boolean;lab:boolean;outside:boolean};
export type State={version:9;day:number;ap:number;origin:Origin;start:Start;hp:number;stamina:number;mind:number;radiation:number;eve:number;power:number;credits:number;food:number;medicine:number;parts:number;knowledge:number;trust:number;animals:AnimalState[];rooms:number;flags:Flags;logs:EventRecord[];phase:'day'|'night'|'finale'|'ending';ending:string;scene:'gate'|'sanctuary'|'laboratory'|'wasteland'|'dawn';pending:AnimalId|null;pendingReport:string;daysWithoutFood:number;raidCount:number;eventRisk:number;shield:number;lastEvent:string;lifeSaved:number;extractions:number;decisions:{title:string;answer:string}[]};
export const specs:{id:AnimalId;name:string;former:string;trait:string;site:string;unlock:number}[]=[
{id:'rabbit',name:'흰 토끼',former:'미상의 의료 기록',trait:'다친 개체를 먼저 살핀다',site:'greenhouse',unlock:0},
{id:'fox',name:'붉은 여우',former:'출입 통제 기록',trait:'잠긴 문을 기억한다',site:'station',unlock:0},
{id:'deer',name:'밤사슴',former:'보존 계획 기록',trait:'낡은 명찰을 피해 다닌다',site:'observatory',unlock:1},
{id:'owl',name:'흰 올빼미',former:'수학 연구 기록',trait:'바닥에 도형을 그린다',site:'observatory',unlock:2},
{id:'wolf',name:'회색 늑대',former:'외부 경비 기록',trait:'함정 앞에서 움직이지 않는다',site:'station',unlock:3},
{id:'crow',name:'까마귀',former:'악보 조각',trait:'아직 없는 멜로디를 흥얼거린다',site:'greenhouse',unlock:4},
{id:'otter',name:'수달',former:'수로 설계 기록',trait:'금속 밸브를 열어본다',site:'greenhouse',unlock:5},
{id:'lynx',name:'스라소니',former:'판결문 사본',trait:'빈 의자를 응시한다',site:'station',unlock:7},
{id:'axolotl',name:'유리 아홀로틀',former:'신체 수복 기록',trait:'센서 손상 부위를 진단한다',site:'medical',unlock:9},
{id:'moth',name:'밤나방',former:'빛 감지 기록',trait:'낡은 신호를 따라간다',site:'observatory',unlock:11},
{id:'dino',name:'복원 소형룡',former:'고생물학 연구 기록',trait:'별 모양을 그린다',site:'observatory',unlock:14},
{id:'mutant',name:'복합체 07',former:'비밀 보존 기록',trait:'서로 다른 목소리를 낸다',site:'medical',unlock:17}];
export const origins:{id:Origin;title:string;desc:string;perk:string}[]=[{id:'medic',title:'누군가를 살리려 했다',desc:'희미한 수술등과 차가운 손',perk:'치료 효율 +15'},{id:'engineer',title:'문을 닫으려 했다',desc:'쏟아지는 경보와 마지막 철문',perk:'시설 수리 +15'},{id:'artist',title:'끝내지 못한 곡이 있다',desc:'불 꺼진 무대 위 오래된 선율',perk:'기억 동기화 +15'},{id:'warden',title:'누군가를 지키고 있었다',desc:'젖은 복도와 무전기 속 잡음',perk:'야간 방어 +15'}];
export const starts:{id:Start;title:string;desc:string;art:string;bonus:string}[]=[{id:'medical',title:'지하 의료실',desc:'안전하지만 잠긴 곳이 많다',art:'laboratory',bonus:'의약품 2개'},{id:'greenhouse',title:'붕괴된 온실',desc:'구조 대상을 먼저 발견한다',art:'sanctuary',bonus:'식량 3개'},{id:'station',title:'폐역 승강장',desc:'오염에 노출되지만 물자가 있다',art:'wasteland',bonus:'부품 3개'},{id:'observatory',title:'외곽 관측소',desc:'신호가 강하지만 EVE가 멀다',art:'gate',bonus:'지식 10'}];
export function cap(n:number){return Math.max(0,Math.min(100,Math.round(n)))}
export function makeAnimal(id:AnimalId,room:number):AnimalState {return {id,name:specs.find(s=>s.id===id)?.name||id,hp:65+Math.floor(Math.random()*25),stress:20+Math.floor(Math.random()*25),bond:15,memory:0,contamination:0,room,alive:true,records:0}}
export function createGame(origin:Origin,start:Start):State {const s:State={version:9,day:1,ap:4,origin,start,hp:origin==='medic'?95:86,stamina:83,mind:80,radiation:start==='station'?18:2,eve:start==='observatory'?67:88,power:72,credits:650,food:6,medicine:start==='medical'?4:2,parts:start==='station'?6:3,knowledge:start==='observatory'?10:0,trust:46,animals:[],rooms:3,flags:{foundKey:false,foxStory:false,memoryDoor:false,humanTruth:false,mirror:false,consent:false,eveLied:false,infirmary:false,greenhouse:false,lab:false,outside:false},logs:[],phase:'day',ending:'',scene:starts.find(s=>s.id===start)?.art as State['scene']||'gate',pending:null,pendingReport:'',daysWithoutFood:0,raidCount:0,eventRisk:16,shield:100,lastEvent:'',lifeSaved:0,extractions:0,decisions:[]};if(start==='greenhouse')s.food+=3;log(s,'첫 번째 기록','눈을 뜨자 벽에 문질러 지운 이름이 있었다. 누군가 이 시설을 관리하던 흔적만 남아 있다.','mystery');return s}
export function log(s:State,title:string,text:string,kind:EventRecord['kind']='info'){s.logs.unshift({day:s.day,title,text,kind});s.logs=s.logs.slice(0,80)}
export function copy(s:State):State{return structuredClone(s)}
export function spend(s:State,ap:number){if(s.phase!=='day'||s.ap<ap)return false;s.ap-=ap;return true}
export function recalc(s:State){s.hp=cap(s.hp);s.stamina=cap(s.stamina);s.mind=cap(s.mind);s.radiation=cap(s.radiation);s.eve=cap(s.eve);s.power=cap(s.power);s.trust=cap(s.trust);if(s.hp<=0){s.phase='ending';s.ending='제000번 우리 — 관리자가 돌아오지 않았다. EVE는 끝내 그를 하나의 보존 대상으로 등록했다.'}else if(s.eve<=0&&s.animals.length===0){s.phase='ending';s.ending='마지막 통신 — EVE가 꺼졌다. 기록은 누구에게도 전달되지 못했다.'}}
export function dailyWork(s:State,type:'feed'|'heal'|'comfort'|'observe',id:AnimalId):State {const n=copy(s);const a=n.animals.find(a=>a.id===id&&a.alive);if(!a||!spend(n,1))return s;const name=a.name;if(type==='feed'){if(n.food<1)return s;n.food--;a.hp=cap(a.hp+10);a.stress=cap(a.stress-8);a.bond=cap(a.bond+8);log(n,'급식 완료',`${name}가 경계하다가 조금씩 먹이를 받아먹었다.`,'good')}
if(type==='heal'){if(n.medicine<1)return s;n.medicine--;a.hp=cap(a.hp+(n.origin==='medic'?32:22));a.contamination=cap(a.contamination-18);log(n,'치료 기록',`${name}의 상처를 치료했다. 소독 장비의 작은 불빛이 꺼졌다.`,'good')}
if(type==='comfort'){a.stress=cap(a.stress-20);a.bond=cap(a.bond+12);n.mind=cap(n.mind+3);log(n,'교감 기록',`${name}가 손길을 피하지 않았다. 잠시 조용한 시간이 흘렀다.`,'good')}
if(type==='observe'){a.records++;a.memory=cap(a.memory+4);n.knowledge+=3;const line=a.records===1?'처음에는 단순한 반사 행동처럼 보였다.':a.records<3?'동일한 행동이 반복된다. 습관이라기에는 너무 규칙적이다.':'익숙하지 않은 도구를 마치 사용해본 것처럼 다룬다.';log(n,'행동 관찰',`${name}: ${line}`,'mystery')}
recalc(n);return n}
export function buy(s:State,item:'food'|'med'|'part'|'cell'|'filter'|'eve'):State {const n=copy(s);const cost={food:90,med:160,part:125,cell:480,filter:250,eve:340}[item];if(n.credits<cost)return s;n.credits-=cost;if(item==='food')n.food+=3;if(item==='med')n.medicine+=2;if(item==='part')n.parts+=3;if(item==='cell')n.rooms++;if(item==='filter'){n.radiation=cap(n.radiation-20);n.shield=cap(n.shield+50);}if(item==='eve')n.eve=cap(n.eve+26);log(n,'보급 터미널',`보급 크레딧 ${cost}을 사용하여 ${item} 물자를 확보했다.`);return n}
export function repair(s:State,what:'power'|'eve'|'rooms'):State{const n=copy(s);if(!spend(n,1)||n.parts<1)return s;n.parts--;if(what==='power')n.power=cap(n.power+(n.origin==='engineer'?33:24));if(what==='eve')n.eve=cap(n.eve+(n.origin==='engineer'?25:17));if(what==='rooms')n.animals.forEach(a=>a.stress=cap(a.stress-6));log(n,'시설 수리',what==='eve'?'EVE의 발광부가 다시 안정적인 파형을 그린다.':'고장난 기계가 낮은 소리를 내며 움직이기 시작한다.','good');return n}
export function extract(s:State,id:AnimalId,quality:number,choice:'gentle'|'force'|'stop'):State {const n=copy(s);const a=n.animals.find(a=>a.id===id&&a.alive);if(!a||!spend(n,2))return s;if(choice==='stop'){a.bond=cap(a.bond+7);log(n,'동기화 중지',`${a.name}의 불안 신호를 감지하고 추출을 멈췄다.`,'good');return n}const multiplier=choice==='force'?1.5:1;const strength=Math.floor(quality*multiplier*(n.origin==='artist'?1.15:1));a.memory=cap(a.memory+Math.round(strength*.55));n.knowledge+=Math.round(strength*.7);n.extractions++;a.stress=cap(a.stress+(choice==='force'?28:12));a.bond=cap(a.bond+(choice==='force'?-16:quality>48?5:-6));a.hp=cap(a.hp-(choice==='force'?12:3));n.eve=cap(n.eve-5);if(quality>58){log(n,'공명 성공',`${a.name}가 자신이 본 적 없는 물건의 이름을 정확하게 발음했다. 인간의 어투가 한순간 겹쳤다.`,'mystery');if(id==='fox')n.flags.foxStory=true;if(n.extractions>=3)n.flags.memoryDoor=true}else{log(n,'공명 불안정',`${a.name}의 호흡이 빨라졌다. 기억은 잡음 속에 흩어졌다.`,'bad')}n.credits+=Math.round(strength*1.2);recalc(n);return n}
export function rescue(s:State,id:AnimalId,choice:'rescue'|'field'|'leave',success:boolean):State{const n=copy(s);n.pending=null;const sp=specs.find(x=>x.id===id)!;if(choice==='leave'){log(n,'외부 방생',`${sp.name}를 발견했지만 접근하지 않았다. 자국만 흙 위에 남았다.`);n.trust=cap(n.trust-2);return n}if(choice==='field'){n.medicine=Math.max(0,n.medicine-1);n.trust=cap(n.trust+6);n.knowledge+=2;log(n,'현장 보호',`${sp.name}를 치료한 뒤 그 자리에 남겨두었다. 다시 만날 수 있을지는 알 수 없다.`,'good');return n}if(!success){n.hp=cap(n.hp-7);n.stamina=cap(n.stamina-9);log(n,'구조 실패',`${sp.name}가 겁에 질려 탈출했다. 주인공은 찢어진 장갑을 감싸 쥔다.`,'bad');recalc(n);return n}if(n.animals.filter(a=>a.alive).length>=n.rooms){log(n,'격리 공간 부족',`${sp.name}를 구조하려 했으나 빈 격리실이 없어 현장 보호로 전환했다.`,'bad');n.trust=cap(n.trust+2);return n}if(!n.animals.some(a=>a.id===id&&a.alive)){const free=new Set(n.animals.filter(a=>a.alive).map(a=>a.room));let room=1;while(free.has(room))room++;n.animals.push(makeAnimal(id,room));n.lifeSaved++;n.trust=cap(n.trust+5);n.credits+=75;n.eventRisk=cap(n.eventRisk+6);log(n,'구조 성공',`${sp.name}가 이동 케이지에 들어왔다. 진정 → 운송 → 격리실 배정까지 완료했다.`,'good')}return n}
export function night(s:State,def:{gate:boolean;evacuate:boolean;scan:boolean}):State {
 const n=copy(s);if(n.phase!=='night')return s;
 const cost=(def.gate?20:0)+(def.evacuate?15:0)+(def.scan?10:0);
 const affordable=n.power>=cost;const powered=affordable?def:{gate:false,evacuate:false,scan:false};
 if(affordable)n.power=cap(n.power-cost);
 const alive=n.animals.filter(a=>a.alive);
 const risk=cap(12+n.eventRisk+Math.round(n.radiation*.35)+(100-n.power)*.2+alive.length*4+(n.day>4?8:0));
 const roll=Math.random()*100;
 const event=roll<risk;
 if(event){n.raidCount++;const kinds=['침입자 접근','격리문 파손','오염 폭풍','동물 집단 공황'];
 const kind=kinds[(n.raidCount+n.day+Math.floor(roll))%kinds.length];n.lastEvent=kind;
 const blocked=powered.gate&&(kind==='침입자 접근'||kind==='격리문 파손');
 const protectedAnimals=powered.evacuate;
 if(!blocked){n.parts=Math.max(0,n.parts-1);n.power=cap(n.power-8);if(!protectedAnimals){const victim=alive[Math.floor(Math.random()*alive.length)];if(victim){victim.hp=cap(victim.hp-(16+Math.round(risk/8)));victim.stress=cap(victim.stress+24);if(victim.hp<=0){victim.alive=false;log(n,'개체 손실',`${victim.name}의 심박이 멈췄다.`,'bad')}}}n.hp=cap(n.hp-6)}
 if(kind==='오염 폭풍'){n.radiation=cap(n.radiation+(powered.gate?3:13));n.shield=cap(n.shield-10)}
 if(powered.scan){n.knowledge+=8;log(n,'특별 사건 분석',`${kind}의 원인과 움직임을 EVE가 기록했다. 다음 조사를 위한 단서가 남았다.`,'mystery')}
 log(n,'특별 이벤트 · '+kind,blocked?'방어문이 닫히며 위협을 막았다.':protectedAnimals?'개체를 피신시켰지만 시설은 손상되었다.':'침입과 손상으로 피해가 발생했다. 추가 대응이 필요하다.',blocked?'good':'bad');
 n.eventRisk=cap(n.eventRisk-16);
 }else{n.lastEvent='야간 정상 감시';if(powered.scan){n.knowledge+=3;log(n,'야간 정찰','열화상 신호를 기록했지만 시설까지 도달한 위협은 없었다.','info')}else log(n,'고요한 야간','감시실의 파형은 안정적이었다.','info');n.eventRisk=cap(n.eventRisk+5)}
 if(!affordable&&cost>0)log(n,'전력 부족','방어 작전 가동에 필요한 전력이 모자라 명령이 취소되었다.','bad');
 alive.forEach(a=>{a.stress=cap(a.stress+Math.max(0,8-Math.round(a.bond/20)));if(n.food>0){n.food--;a.hp=cap(a.hp+3)}else{a.hp=cap(a.hp-10);a.stress=cap(a.stress+9)}if(a.contamination>65)a.hp=cap(a.hp-8);if(a.hp<=0){a.alive=false;log(n,'야간 사망',`${a.name}의 심박 신호가 사라졌다.`,'bad')}});
 if(n.food<=0)n.daysWithoutFood++;n.power=cap(n.power-5);n.radiation=cap(n.radiation+Math.max(0,Math.round((100-n.power)/45)));if(n.radiation>65)n.hp=cap(n.hp-5);
 n.stamina=cap(n.stamina+35);n.mind=cap(n.mind+8);n.hp=cap(n.hp+3);n.day++;n.ap=4;n.phase='day';n.scene='gate';
 if(n.day>=14&&n.knowledge>=65&&n.extractions>=3&&!n.flags.humanTruth){n.flags.humanTruth=true;log(n,'ARK 의식 보존','보존 문서가 열렸다. 동물에게 인간의 기억이 분산되었다는 사실이 드러났다.','mystery')}
 if(n.day>=19&&n.knowledge>=110&&n.flags.humanTruth&&!n.flags.mirror){n.flags.mirror=true;log(n,'거울실','관리자의 모습은 인간과 다르다. EVE는 그가 인간에 가장 가까운 변이체라고 고백한다.','mystery')}
 if((n.day>=23&&n.flags.mirror)||n.day>=35){n.phase='finale';log(n,'마지막 보존 명령','모든 선택이 끝이 아니라 이곳에 남겨진 삶을 바꾸었다.','mystery')}
 recalc(n);return n
}
export function chooseEnding(s:State){if(s.hp<=0)return '제000번 우리 — 구조자가 마지막 보존 대상이 되었다.';if(s.eve<=0)return '무음의 방주 — 지식은 남았지만 EVE의 목소리는 돌아오지 않았다.';if(!s.flags.humanTruth)return '닫힌 기록 — 인간의 지식은 끝내 해독되지 못했다.';if(!s.flags.mirror)return '이름 없는 관리자 — 자신이 누구인지 모른 채 동물원을 지켰다.';if(s.animals.filter(a=>a.alive).length>=6&&s.knowledge>=180&&s.trust>=65)return '새로운 문장 — 인간의 지식과 동물의 새로운 자아가 함께 전혀 다른 의식을 낳았다.';if(s.knowledge>=200&&s.trust<45)return '완벽한 기록 — 기억은 복원됐지만 그 기억을 담았던 생명들은 침묵했다.';if(s.trust>=75)return '우리 밖의 봄 — 인간의 지식은 남기고 생명들은 각자의 길로 떠났다.';return '불완전한 사람 — 주인공은 인간이 아니지만 자신만의 선택을 이어가기로 했다.'}
export function startNight(s:State):State {if(s.phase!=='day')return s;const n=copy(s);n.phase='night';log(n,'일몰','동물원이 잠들자 중앙 경보기가 다시 켜진다.','info');return n}

export function finish(s:State,goal:'rebuild'|'freedom'|'preserve'):State {const n=copy(s);if(n.phase!=='finale')return s;n.phase='ending';n.decisions.push({title:'마지막 보존 지침',answer:goal});if(goal==='rebuild'){n.ending=n.flags.mirror&&n.knowledge>=155&&n.animals.filter(a=>a.alive).length>=4?'인간 이후의 첫 문장 — 남겨진 기억들이 전혀 새로운 의식의 언어를 만들었다. 인간과 닮았지만 어느 인간도 아니었다.':n.knowledge>=100?'미완의 부활 — 인간의 지식은 돌아왔지만, 그를 인간이라 부를 수 있는지는 끝내 결정되지 않았다.':'제000번 우리 — 재생이 실패했다. EVE는 마지막 관리자를 가장 소중한 보존 대상이라 기록하고 잠금장치를 내렸다.'}if(goal==='freedom'){n.ending=n.trust>=63&&n.animals.filter(a=>a.alive).length>=3?'우리 밖의 봄 — 관리자는 방주를 열었다. 인간의 기억을 품은 동물들은 스스로 자신들의 세계를 선택했다.':'흩어진 이름들 — 철문이 열렸다. 동물들은 떠났지만 그들이 어디까지 살아남았는지 누구도 알지 못했다.'}if(goal==='preserve'){n.ending=n.eve>=45?'마지막 두 관리자 — EVE와 개체 000은 보존소에 남았다. 과거의 지식은 사라지지 않았지만, 문 밖에는 새로운 계절이 왔다.':'고요한 자동화 — 시스템은 기록을 지켰지만 EVE의 얼굴은 끝내 돌아오지 않았다.'}return n}
