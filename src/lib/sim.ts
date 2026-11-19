export type AnimalId='rabbit'|'fox'|'deer'|'owl'|'wolf'|'crow'|'otter'|'lynx'|'axolotl'|'moth'|'mutant'|'chimera';
export type AnimalState={specimenId?:string;id:AnimalId;name:string;hp:number;stress:number;bond:number;memory:number;contamination:number;room:number;alive:boolean;records:number;awakened?:boolean;mutated?:boolean;suppressedUntilDay?:number;careMastery?:Partial<Record<'feed'|'heal'|'comfort'|'observe',number>>;careRoutine?:boolean;hunger?:number;sickness?:number};
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
{id:'mutant',name:'복합체 07',former:'분산된 인간의 언어 기록',trait:'하나의 입에서 서로 다른 목소리가 섞인다',site:'medical',unlock:17},
{id:'chimera',name:'접합체 미라',former:'의식 합성 실험 기록',trait:'서로 다른 동물의 반응이 충돌한다',site:'medical',unlock:20}];
// Four selectable memory fragments. These are memories, not proof of humanity.
export const origins:{id:Origin;title:string;desc:string;perk:string}[]=[
 {id:'medic',title:'문 너머의 환자',desc:'누군가 유리문을 두드렸다. 나는 마지막 남은 붕대를 쥐고 있었다.',perk:'구조 +11%p · 치료 회복량 증가'},
 {id:'engineer',title:'꺼져 가는 발전기',desc:'멀리서 비명이 들렸지만, 나는 아직 돌아가는 발전기를 놓을 수 없었다.',perk:'전력 재가동 +9 · EVE 수리 강화'},
 {id:'artist',title:'끝나지 않은 선율',desc:'객석은 텅 비었는데 누군가는 내 이름 대신 번호를 불렀다.',perk:'기억 동기화 지식 +15%'},
 {id:'warden',title:'마지막으로 잠근 문',desc:'철문 반대편에 그림자가 있었다. 나는 누구를 지키려 했던 걸까.',perk:'야간 방어 시 위협 -5 추가'}
];
export const starts:{id:Start;title:string;desc:string;art:string;bonus:string}[]=[
 {id:'medical',title:'지하 의료실',desc:'격리 침상 옆에 약품과 지워진 환자 번호가 남아 있다.',art:'laboratory',bonus:'시작 의약품 4개 · 보존 장비 점검'},
 {id:'greenhouse',title:'붕괴된 온실',desc:'깨진 유리 안쪽에서 작은 생명이 유리를 긁는 소리가 들린다.',art:'sanctuary',bonus:'시작 식량 9개 · 첫 울음의 출처'},
 {id:'station',title:'폐역 승강장',desc:'방송이 끊긴 승강장. 당신의 발보다 먼저 젖은 발자국이 찍혔다.',art:'wasteland',bonus:'시작 부품 6개 · 감염도 14%'},
 {id:'observatory',title:'외곽 관측소',desc:'수신기에 누군가의 호흡이 반복된다. 마지막 기록은 당신보다 오래됐다.',art:'gate',bonus:'시작 지식 10 · EVE 코어 67/100'}
];
export const originStories:Record<Origin,{fragment:string;eve:string}>={
 medic:{fragment:'...붕대를 감던 손이 기억나. 그런데 환자의 얼굴은, 이상하게 하나도 떠오르지 않아.',eve:'담당자님, 의료 실무 기록과 유사한 기억 파편이 확인되었습니다. 위기 상황에서 생체 반응을 보다 안정적으로 다룰 수 있습니다.'},
 engineer:{fragment:'손끝에 기름이 묻어 있어. 경보가 울릴 때까지 발전기를 붙잡고 있었던 것 같아.',eve:'설비 조작에 관련된 기억 신호가 남아 있습니다. 발전기와 보존 코어를 복구할 때 도움이 됩니다.'},
 artist:{fragment:'...누가 노래를 부르고 있었어. 분명 익숙한 곡인데, 가사는 왜 하나도 생각 안 나지?',eve:'청각·패턴 인식 기록을 감지했습니다. 반복된 행동에서 기억 공명을 분석하는 데 유리합니다.'},
 warden:{fragment:'철문을 닫았어. 내가 안쪽에 있었는지 바깥에 있었는지도... 기억이 안 나.',eve:'보안 프로토콜에 관한 반응이 남아 있습니다. 야간 방어 절차에서 더 정밀하게 위협을 억제할 수 있습니다.'}
};
export const startStories:Record<Start,{fragment:string;eve:string}>={
 medical:{fragment:'침상 옆에 번호가 적혀 있어. ...이건 이름이 아니라, 실험 기록 같은데.',eve:'의료실의 예비 의약품 4개를 확인했습니다. 침상 기록은 아직 접근 권한이 없습니다.'},
 greenhouse:{fragment:'유리 너머에서 뭔가 움직였어. ...누가 아직 살아 있어.',eve:'온실 비상 식량 9개를 확보했습니다. 외부 생체 신호의 출처는 직접 조사해야 합니다.'},
 station:{fragment:'역 전체가 젖었어. 기차가 끊긴 지 꽤 됐을 텐데, 누가 이 부품들을 모아 둔 거지?',eve:'회수 가능한 부품 6개를 확인했습니다. 외부 오염이 높아 감염도 14%로 시작합니다.'},
 observatory:{fragment:'수신기에서 숨소리가 들렸어. 녹음이겠지? ...이곳엔 아무도 없다며.',eve:'관측 기록으로 초기 지식 10을 복원했습니다. 다만 외곽 코어 상태가 나빠 EVE 신호는 67/100에서 시작합니다.'}
};
export function cap(n:number){return Math.max(0,Math.min(100,Math.round(n)))}
export function makeAnimal(id:AnimalId,room:number):AnimalState {return {id,name:specs.find(s=>s.id===id)?.name||id,hp:65+Math.floor(Math.random()*25),stress:20+Math.floor(Math.random()*25),bond:15,memory:0,contamination:0,room,alive:true,records:0,hunger:22,sickness:0}}
export function createGame(origin:Origin,start:Start):State {const s:State={version:9,day:1,ap:4,origin,start,hp:origin==='medic'?95:86,stamina:83,mind:80,radiation:start==='station'?18:2,eve:start==='observatory'?67:88,power:72,credits:650,food:6,medicine:start==='medical'?4:2,parts:start==='station'?6:3,knowledge:start==='observatory'?10:0,trust:46,animals:[],rooms:3,flags:{foundKey:false,foxStory:false,memoryDoor:false,humanTruth:false,mirror:false,consent:false,eveLied:false,infirmary:false,greenhouse:false,lab:false,outside:false},logs:[],phase:'day',ending:'',scene:starts.find(s=>s.id===start)?.art as State['scene']||'gate',pending:null,pendingReport:'',daysWithoutFood:0,raidCount:0,eventRisk:16,shield:100,lastEvent:'',lifeSaved:0,extractions:0,decisions:[]};if(start==='greenhouse')s.food+=3;log(s,'첫 번째 기록','눈을 뜨자 벽에 문질러 지운 이름이 있었다. 누군가 이 시설을 관리하던 흔적만 남아 있다.','mystery');return s}
export function log(s:State,title:string,text:string,kind:EventRecord['kind']='info'){s.logs.unshift({day:s.day,title,text,kind});s.logs=s.logs.slice(0,80)}
export function copy(s:State):State{return structuredClone(s)}
export function spend(s:State,ap:number){if(s.phase!=='day'||s.ap<ap)return false;s.ap-=ap;return true}
export function recalc(s:State){s.hp=cap(s.hp);s.stamina=cap(s.stamina);s.mind=cap(s.mind);s.radiation=cap(s.radiation);s.eve=cap(s.eve);s.power=cap(s.power);s.trust=cap(s.trust);if(s.hp<=0){s.phase='ending';s.ending='제000번 우리 — 관리자가 돌아오지 않았다. EVE는 끝내 그를 하나의 보존 대상으로 등록했다.'}else if(s.eve<=0){s.phase='ending';s.ending='마지막 통신 — EVE 코어 정지. 모든 보존 지시가 중단되었고, 담당자는 더 이상 외부와 연결할 수 없었다.'}}
/** Distinct readout lets the UI warn players well before the irreversible threshold. */
export function mutationRisk(a:AnimalState):{score:number;danger:boolean;description:string}{
 const score=Math.min(100,Math.round(a.stress*.68+a.contamination*.55+a.memory*.48));
 return {score,danger:isMutant(a),description:isMutant(a)?'신경 충돌 발생 · 변이 영구 확정':score>=32?'불안정 · 돌봄 대응 실패 시 급격히 악화':'잠복 상태 · 스트레스·오염·공명 증가에 유의'};
}
/** A mutation is a permanent neural state; suppressant only lowers its short-term risk. */
export function isMutant(a:AnimalState):boolean {
 return !!a.mutated || !!a.awakened || a.id==='mutant' || a.id==='chimera'
   || a.stress>=60
   || (a.stress>=48 && (a.contamination>=8 || a.memory>=10))
   || (a.stress>=35 && a.contamination>=23)
   || (a.stress>=30 && a.memory>=26);
}
export function recordMutation(s:State,a:AnimalState):boolean {
 if(!a.alive||a.mutated||!isMutant(a))return false;
 a.mutated=true;
 log(s,'MUTANT 발현 · 격리 경보',`${a.name}의 신경 동기화가 임계치를 넘었습니다. 변이 후에는 돌봄만으로 정상화되지 않으며 진정 주사 또는 위험한 개체 처리 결정이 필요합니다.`,'bad');
 return true;
}
// Nightly upkeep is species-aware. Hunger/illness produce visible warnings before loss.
export const SPECIES_CARE:Record<AnimalId,{hunger:number;fragility:number;contagion:number;note:string}>={
 rabbit:{hunger:18,fragility:1.3,contagion:1.1,note:'작은 몸집 · 굶주림과 소음에 취약'},
 fox:{hunger:15,fragility:.8,contagion:1.0,note:'경계심이 강하고 스트레스에 민감'},
 deer:{hunger:21,fragility:1.2,contagion:1.2,note:'큰 식사량 · 외부 자극에 취약'},
 owl:{hunger:13,fragility:1.2,contagion:.9,note:'야간 활동 · 강한 조명에 취약'},
 wolf:{hunger:23,fragility:.8,contagion:1.0,note:'큰 식사량 · 관리 실패 시 위협'},
 crow:{hunger:12,fragility:.9,contagion:.8,note:'자극에 적응하지만 불신을 오래 기억'},
 otter:{hunger:20,fragility:1.1,contagion:1.5,note:'물 환경 · 오염에 취약'},
 lynx:{hunger:19,fragility:.9,contagion:1.1,note:'격리 환경과 접촉 스트레스'},
 axolotl:{hunger:10,fragility:1.5,contagion:1.7,note:'수질·오염에 매우 취약'},
 moth:{hunger:12,fragility:1.4,contagion:.9,note:'조명 변화와 체력 저하에 취약'},
 mutant:{hunger:24,fragility:1.2,contagion:1.5,note:'변이로 인한 불안정과 급격한 소모'},
 chimera:{hunger:25,fragility:1.3,contagion:1.6,note:'복합 신경계 · 관리 난이도 높음'}
};
export function nightlyAnimalCondition(a:AnimalState,fed:boolean,facility:number,externalInfection:number){
 const p=SPECIES_CARE[a.id];
 const hunger=cap((a.hunger??22)+p.hunger-(fed?28:0));a.hunger=hunger;
 const previousDisease=a.sickness??0;
 a.sickness=cap(previousDisease+(hunger>=65?Math.round(8*p.fragility):0)+(a.contamination>=45?Math.round(7*p.contagion):0)+(facility<45?7:0)+(externalInfection>=70?5:0)-(fed?2:0));
 if(hunger>=60){a.stress=cap(a.stress+Math.round(4*p.fragility));a.hp=cap(a.hp-Math.round((hunger>=85?9:3)*p.fragility));}
 if((a.sickness??0)>=50){a.hp=cap(a.hp-Math.round(((a.sickness??0)>=80?10:4)*p.fragility));a.stress=cap(a.stress+3);}
 if(a.stress>=90){a.hp=cap(a.hp-3);}
}
export function dailyWork(s:State,type:'feed'|'heal'|'comfort'|'observe',id:AnimalId):State {const n=copy(s);const a=n.animals.find(a=>a.id===id&&a.alive);if(!a||!spend(n,1))return s;const name=a.name;if(type==='feed'){if(n.food<1)return s;n.food--;a.hunger=cap((a.hunger??22)-34);a.hp=cap(a.hp+10);a.stress=cap(a.stress-8);a.bond=cap(a.bond+8);log(n,'급식 완료',`${name}가 경계하다가 조금씩 먹이를 받아먹었다.`,'good')}
if(type==='heal'){if(n.medicine<1)return s;n.medicine--;a.hp=cap(a.hp+(n.origin==='medic'?32:22));a.contamination=cap(a.contamination-18);a.sickness=cap((a.sickness??0)-24);log(n,'치료 기록',`${name}의 상처를 치료했다. 소독 장비의 작은 불빛이 꺼졌다.`,'good')}
if(type==='comfort'){a.stress=cap(a.stress-20);a.bond=cap(a.bond+12);n.mind=cap(n.mind+3);log(n,'교감 기록',`${name}가 손길을 피하지 않았다. 잠시 조용한 시간이 흘렀다.`,'good')}
if(type==='observe'){a.records++;a.memory=cap(a.memory+4);n.knowledge+=a.records<=3?2:0;const line=a.records===1?'처음에는 단순한 반사 행동처럼 보였다.':a.records<3?'동일한 행동이 반복된다. 습관이라기에는 너무 규칙적이다.':'익숙하지 않은 도구를 마치 사용해본 것처럼 다룬다.';log(n,'행동 관찰',`${name}: ${line}`,'mystery')}
recordMutation(n,a);recalc(n);return n}
export function buy(s:State,item:'food'|'med'|'part'|'cell'|'filter'|'eve'):State {const n=copy(s);const cost={food:90,med:160,part:125,cell:480,filter:250,eve:340}[item];if(n.credits<cost)return s;n.credits-=cost;if(item==='food')n.food+=3;if(item==='med')n.medicine+=2;if(item==='part')n.parts+=3;if(item==='cell')n.rooms++;if(item==='filter'){n.radiation=cap(n.radiation-20);n.shield=cap(n.shield+50);}if(item==='eve')n.eve=cap(n.eve+26);log(n,'보급 터미널',`보급 크레딧 ${cost}을 사용하여 ${item} 물자를 확보했다.`);return n}
export function repair(s:State,what:'power'|'eve'|'rooms'):State{const n=copy(s);if(!spend(n,1)||n.parts<1)return s;n.parts--;if(what==='power')n.power=cap(n.power+(n.origin==='engineer'?33:24));if(what==='eve')n.eve=cap(n.eve+(n.origin==='engineer'?25:17));if(what==='rooms')n.animals.forEach(a=>a.stress=cap(a.stress-6));log(n,'시설 수리',what==='eve'?'EVE의 발광부가 다시 안정적인 파형을 그린다.':'고장난 기계가 낮은 소리를 내며 움직이기 시작한다.','good');return n}
export function extract(s:State,id:AnimalId,quality:number,choice:'gentle'|'force'|'stop'):State {
 const n=copy(s);const a=n.animals.find(a=>a.id===id&&a.alive);
 if(!a||n.phase!=='day')return s;
 if(choice==='stop'){a.bond=cap(a.bond+3);log(n,'교감 중지',`${a.name}의 거부 신호를 존중하고 장치를 껐다.`,'good');return n}
 // 행동 강령을 관찰하지 않고 강제로 실행하면 지식을 얻을 수 없다.
 if(a.records<1||a.bond<20||a.stress>78||a.hp<35){log(n,'접근 불가',`${a.name}의 행동 기록·유대·안정도가 부족합니다. 먼저 관찰하고 돌보세요.`,'bad');return n}
 if(!spend(n,2)||n.power<7)return s;
 n.power=cap(n.power-7);
 const safe=choice==='gentle';const successful=quality>=65;
 if(successful){const value=Math.round((safe?17:25)*(n.origin==='artist'?1.15:1));a.memory=cap(a.memory+value);n.knowledge+=value;n.extractions++;a.stress=cap(a.stress+(safe?7:21));a.bond=cap(a.bond+(safe?5:-13));a.hp=cap(a.hp-(safe?0:7));log(n,'행동 강령 일치',`${a.name}의 본능적 행동을 재현하자 낯선 기억이 스스로 떠올랐다. 지식 +${value}.`,'mystery');if(id==='fox')n.flags.foxStory=true;if(n.extractions>=3)n.flags.memoryDoor=true}
 else {a.stress=cap(a.stress+(safe?12:26));a.bond=cap(a.bond-(safe?4:12));a.hp=cap(a.hp-(safe?0:9));log(n,'행동 강령 위반',`${a.name}가 신호를 거부했다. 지식은 얻지 못했고 신뢰가 흔들렸다.`,'bad')}
 n.eve=cap(n.eve-3);recordMutation(n,a);recalc(n);return n;
}
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
