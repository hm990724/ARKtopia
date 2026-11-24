import type {V10} from './game-v10';
import type {AnimalId} from './sim';
import {cap,log,copy} from './sim';

export type CrewId='rabbit'|'fox'|'wolf'|'deer';
export const CREW_IDS:CrewId[]=['rabbit','fox','wolf','deer'];
export const CREW_PROFILES:Record<CrewId,{title:string;post:string;benefit:string;first:string;secret:string;appearance:string;personality:string}>={
 rabbit:{title:'의무관',post:'의무관',benefit:'담당자 정신력 +18 · 오늘의 휴식/응급처치 효과 강화',first:'...의료실은 어디죠? 출근 기록이 손상됐다고 들었습니다. 환자가 있다면 먼저 상태를 확인하겠습니다.',secret:'흰 장갑을 벗으면 손끝에 털이 보여요. 아까 환자에게... 당근을 주라고 했나요?',appearance:'눈처럼 흰 단발, 차분한 표정, 구식 양호실의 흰 간호복',personality:'상냥하고 말이 느린 양호선생님. 불안할 때 아이에게 말하듯 속삭인다.'},
 fox:{title:'보급관',post:'보급관',benefit:'부품 +1 · 식량 +1 · CR +30',first:'물품 목록과 영수증부터 확인하죠. 지급하지 않은 건 지급한 게 아닙니다. 서명 누락부터 정리하겠습니다.',secret:'어제도 재고가 맞았는데, 왜 오늘은 제 발자국이 보급실 선반 위에 남아 있죠?',appearance:'오렌지빛 짙은 갈색 장발, 얇은 사각 안경, 단정한 검정 보급 담당 제복',personality:'꼼꼼하고 차가운 여성. 사소한 물품 부족도 따지고 들지만 책임감이 높다.'},
 wolf:{title:'보안관',post:'보안관',benefit:'외부 위협 -13 · 오늘 밤 경계 후 추가 -7',first:'경비는 저한테 맡겨요! 교대조가 없으면 제가 두 번 돌면 되죠. 근데 저 철문, 누가 안쪽에서 긁었죠?',secret:'제가 쫓는 게 탈출한 개체인가요, 아니면... 따라 뛰고 있던 제가 개체인가요?',appearance:'높게 묶은 검은 포니테일, 근육이 잘 드러나는 실전 무도가 체형, 낡은 전투 조끼',personality:'쾌활한 열혈 여성 보안관. 먼저 움직이고 뒤늦게 공포를 알아차린다.'},
 deer:{title:'서기관',post:'서기관',benefit:'시설 감염 -14 · 현장 탐사 오염 저감',first:'기록 정리 완료했습니다! 아, 잠깐... 이 서류는 거꾸로 꽂았네요. 금방 고치겠습니다!',secret:'자꾸 글씨를 잘못 쓰네요. 이름 위에... 네 개의 발자국이 떠올라요. 제가 남긴 건가요?',appearance:'연갈색 긴 머리와 부드러운 웨이브, 작은 핀, 수수한 사무복과 기록용 단말',personality:'유능하고 다정하지만 가끔 덤벙대는 여성 서기관. 오류를 인정하고 바로 수습한다.'}
};
export type CrewMember={id:CrewId;arrivedDay:number;hp:number;mind:number;bond:number;lastSpokenDay:number;lastCareDay?:number;lastCounselDay?:number;stability?:number;sourceSpecimenId?:string;memoryEcho?:number;memoryStage?:number};
export type CrewIncident={day:number;id:CrewId;damage:number;before:number;after:number;text:string};
export type CrewConflictKind='treatment'|'disposal';
export type CrewConflictChoice='treat'|'withhold'|'protect'|'dispose';
export type CrewConflict={serial:number;day:number;kind:CrewConflictKind;choice:CrewConflictChoice;first:boolean;dissent:CrewId;mindBefore:number;mindAfter:number};
export type CrewNightVote={day:number;members:CrewId[]};
export type CrewNightResult={day:number;selected:CrewId;losses:{id:CrewId;before:number;after:number}[];effect:string};
export type CrewTermination={id:CrewId;day:number;cause?:'collapse'|'last-stand'};
export type CrewArrivalOrder={id:CrewId;transferDay:number;sourceSpecimenId?:string};
export type CrewState={arrivalQueue:CrewArrivalOrder[];lastArrivalDay:number;retired:CrewId[];pendingTermination:CrewId|null;lastTermination:CrewTermination|null;members:CrewMember[];supportDay:number;supportWorked:CrewId[];sortieWorked:CrewId[];counselDay:number;healingDay:number;guardDay:number;decontamDay:number;lastIncident:CrewIncident|null;incidentsSeen:string[];conflictsSeen:string[];lastConflict:CrewConflict|null;conflictSerial:number;pendingNightVote:CrewNightVote|null;lastNightResult:CrewNightResult|null};
export const emptyCrew=():CrewState=>({arrivalQueue:[],lastArrivalDay:0,retired:[],pendingTermination:null,lastTermination:null,members:[],supportDay:0,supportWorked:[],sortieWorked:[],counselDay:0,healingDay:0,guardDay:0,decontamDay:0,lastIncident:null,incidentsSeen:[],conflictsSeen:[],lastConflict:null,conflictSerial:0,pendingNightVote:null,lastNightResult:null});
export function ensureCrew(s:V10):CrewState{
 const existing=s.crew;
 const crew:{[K in keyof CrewState]:CrewState[K]}={...emptyCrew(),...existing,arrivalQueue:existing?.arrivalQueue??[],lastArrivalDay:existing?.lastArrivalDay??0,counselDay:existing?.counselDay??0,supportWorked:existing?.supportWorked??[],sortieWorked:existing?.sortieWorked??[],members:(existing?.members??[]).map(m=>({...m,lastCareDay:m.lastCareDay??0,stability:Math.max(0,Math.min(100,m.stability??88)),memoryEcho:m.memoryEcho??0})),retired:existing?.retired??[],pendingTermination:existing?.pendingTermination??null,lastTermination:existing?.lastTermination??null,incidentsSeen:existing?.incidentsSeen??[],conflictsSeen:existing?.conflictsSeen??[],lastConflict:existing?.lastConflict??null,conflictSerial:existing?.conflictSerial??0,pendingNightVote:existing?.pendingNightVote??null,lastNightResult:existing?.lastNightResult??null};
 if(existing){Object.assign(existing,crew);return existing;}
 s.crew=crew;
 return crew;
}
export function isCrewId(id:AnimalId):id is CrewId{return CREW_IDS.includes(id as CrewId)}
/** Staff appearances are bound to the four distinct original animal species. */
export function queueCrewArrival(s:V10,id:AnimalId):boolean{
 if(!isCrewId(id))return false;
 const crew=ensureCrew(s);
 if(crew.members.some(m=>m.id===id)||crew.retired.includes(id)||crew.arrivalQueue.some(a=>a.id===id))return false;
 const preserved=s.animals.find(a=>a.id===id);
 crew.arrivalQueue.push({id,transferDay:s.day,sourceSpecimenId:preserved?.specimenId});
 log(s,'본부 반송 캡슐 접수',`${CREW_PROFILES[id].post} 근무 인력 파견 대기. DAY ${s.day+1}부터 인력 한 명씩 순차 파견됩니다.`,'mystery');
 return true;
}
/** Recruit a staff member ONLY when its original animal is transferred to HQ. */
export function recruitCrew(s:V10,id:AnimalId,sourceSpecimenId?:string):boolean{
 if(!isCrewId(id))return false;
 const crew=ensureCrew(s);
 if(crew.members.some(m=>m.id===id)||crew.retired.includes(id)||crew.members.length>=4)return false;
 crew.members.push({id,arrivedDay:s.day,hp:85,mind:88,bond:45,lastSpokenDay:0,lastCareDay:0,stability:90,sourceSpecimenId,memoryEcho:0});
 log(s,'본부 인력 등록',`${CREW_PROFILES[id].post}이(가) 도착했습니다. 기존 근무 이력은 본부 보안 정책에 따라 비공개입니다.`,'mystery');
 return true;
}
export function crewDialog(s:V10,id:CrewId):{speaker:CrewId|'EVE'|'관리자';text:string;expression?:'neutral'|'anxious'|'critical'|'resolve'}[]{
 const member=ensureCrew(s).members.find(m=>m.id===id);if(!member)return [];
 const profile=CREW_PROFILES[id];const days=Math.max(0,s.day-member.arrivedDay);
 const personal:Record<CrewId,[string,string,string]>={
  rabbit:['소독약 냄새가 잠깐 피 냄새처럼 느껴졌어요. 제가 과로했나 봐요.','복도에 작은 환자가 울고 있었어요. 분명 토끼였는데... 아이 이름을 불렀어요.','담당자님, 잠깐만 제 손을 잡아 주세요. 제 손이 자꾸 발처럼 접혀요.'],
  fox:['재고 장부에 제가 쓰지 않은 숫자가 있어요. 전부 4씩 늘어나네요.','문에 귀를 대면 밖에서 네 발로 걷는 소리가 들려요. 그런데 안쪽에서 들려요.','전 그 물건을 숨기지 않았어요. 제가 보급품이었나요? 선반 안에 있었나요?'],
  wolf:['경보가 울리면 몸이 먼저 뛰어요. 훈련 덕이라고 생각했는데...','어제 밤 CCTV에 제 뒷모습이 나왔어요. 저는 그때 여기 있었는데.','그만! 문 열지 마세요. 저걸 막으려던 게 아니에요. 제가 들어가려고 했어요.'],
  deer:['아침에 일지 한 장을 잘못 분류했어요. 기록은 이미 고쳤습니다!','실험실 이름을 읽는데 제 이름처럼 들렸어요. 손이 떨려서 종이를 떨어뜨렸어요.','기록이 맞지 않아요. 제가 적은 이름이 제 이름을 지워요. 저 아직 사람 맞죠?']
 };
 if(member.mind<=22)return [
  {speaker:id,text:personal[id][2],expression:'critical'},
  {speaker:'EVE',text:`${profile.post} 생체 신호 위험. 정신력 ${member.mind}. 야간의 인격 충돌과 우발 공격을 주의하십시오.`,expression:'anxious'},
  {speaker:id,text:'제가 그러지 않았어요... 아니, 제가 그랬나요? 제 손이 기억을 못 해요.',expression:'critical'}];
 if((s.originZero?.photos??0)>=10&&s.flags.humanTruth)return [
  {speaker:id,text:profile.secret,expression:'anxious'},
  {speaker:'관리자',text:'그 기억은 어디서 온 거야?',expression:'anxious'},
  {speaker:id,text:personal[id][1],expression:'critical'},
  {speaker:'EVE',text:'복원된 인격의 기억 출처는 생체 기밀입니다. 추가 열람에는 윤리적 선택이 수반됩니다.',expression:'neutral'}];
 if(days>=5||member.mind<60)return [
  {speaker:id,text:personal[id][0],expression:'anxious'},
  {speaker:'EVE',text:'신경 동기화 이상 징후를 기록합니다. 업무 지원 횟수가 증가할수록 피로가 누적됩니다.',expression:'anxious'},
  {speaker:id,text:'그냥 피곤한 거겠죠. 제 직무는 계속하겠습니다.',expression:'resolve'}];
 return [{speaker:id,text:profile.first,expression:'neutral'},
  {speaker:'EVE',text:`${profile.post}의 근무 자격을 확인했습니다. 전 인력의 지원 명령은 하루에 단 한 번만 사용할 수 있습니다.`,expression:'neutral'}];
}
export function crewSupport(s:V10,id:CrewId):V10{
 const member=s.crew?.members.find(m=>m.id===id);
 if(!member||s.phase!=='day'||s.run||s.crew?.supportDay===s.day||s.crew?.sortieWorked?.includes(id)||member.mind<=0||s.crew?.pendingTermination)return s;
 const n=copy(s) as V10;const crew=ensureCrew(n);const m=crew.members.find(x=>x.id===id)!;
 crew.supportDay=n.day;crew.supportWorked=[...new Set([...crew.supportWorked,id])];const full=m.bond>=100;m.mind=cap(m.mind-(full?0:m.bond>=70?2:5));queueCrewTerminations(n);
 if(id==='rabbit'){n.mind=cap(n.mind+(full?30:18));crew.healingDay=n.day;}
 if(id==='fox'){n.parts+=full?2:1;n.food+=full?2:1;n.credits+=full?60:30;}
 if(id==='wolf'){n.threat=cap(n.threat-(full?22:13));crew.guardDay=n.day;}
 if(id==='deer'){n.infection=cap(n.infection-(full?24:14));if(full)n.knowledge+=3;crew.decontamDay=n.day;}
 const gains=[n.mind!==s.mind?'관리자 정신 '+(n.mind-s.mind):'',n.parts!==s.parts?'부품 +'+(n.parts-s.parts):'',n.food!==s.food?'식량 +'+(n.food-s.food):'',n.credits!==s.credits?'CR +'+(n.credits-s.credits):'',n.threat!==s.threat?'위협 '+(n.threat-s.threat):'',n.infection!==s.infection?'감염 '+(n.infection-s.infection):'',n.knowledge!==s.knowledge?'지식 +'+(n.knowledge-s.knowledge):'', '직원 정신 '+(m.mind-member.mind)].filter(Boolean).join(' · ');
 n.lastOutcome=`${CREW_PROFILES[id].post} 지원 완료 · ${gains}`;log(n,'직원 지원',n.lastOutcome,'good');
 return n;
}
/** Progressive deterioration. Early days are stable; prolonged duty and low vitals cause trouble. */
export function crewNight(s:V10):void{
 const crew=ensureCrew(s);
 crew.lastIncident=null;
 for(const m of crew.members){
  const days=s.day-m.arrivedDay;
  // Slower deterioration: duties and moral dilemmas are the main threats, not ordinary passing days.
  // Days 1-5 are safe. After that, stress is charged only once every few days.
  const drain=days<=2?0:days<=12?1:2;
  const infectionDrain=days<=2?0:s.infection>=90?2:s.infection>=70?1:0;
  m.mind=cap(m.mind-Math.max(0,drain-(m.bond>=100?1:0))-infectionDrain);
  // Fictional neuro-somatic instability: impaired power and psychological shock matter.
  const electricalStress=s.power<15?6:s.power<30?3:0;
  const emotionalStress=m.mind<25?5:m.mind<50?2:0;
  const stabilityLoss=electricalStress+emotionalStress+(s.facility<25?2:0);
  const quietRecovery=stabilityLoss===0&&s.power>=55&&m.mind>=62?1:0;
  m.stability=cap((m.stability??88)-stabilityLoss+quietRecovery);
  m.memoryEcho=cap((m.memoryEcho??0)+(m.stability<45?4:0)+(m.mind<25?3:0));
  if(m.stability<28&&m.mind>0){m.mind=cap(m.mind-3);if((s.day+m.arrivedDay)%3===0)log(s,'직원 신체 안정도 경고',`${CREW_PROFILES[m.id].post}: 신경-신체 동기화가 불안정합니다. 전력과 정신적 충격을 점검하십시오.`,'bad');}
  if(m.mind===0)continue; // An exhausted personality has already collapsed; no assault event.
  // Staff HP is no longer automatically drained by ordinary work or passage of time.
  if(m.mind<=28){
   const severe=m.mind<=17;
   if(!crew.lastIncident&&((s.day+CREW_IDS.indexOf(m.id)*2)%4===0||severe)){
    const before=s.mind;const damage=Math.min(before,severe?12:7);
    s.mind=cap(s.mind-damage);
    const text=`${CREW_PROFILES[m.id].post}이(가) 신경 혼란 중 담당자를 공격했습니다. 정신력 ${before} → ${s.mind} (-${damage}).`;
    crew.lastIncident={day:s.day,id:m.id,damage,before,after:s.mind,text};
    crew.incidentsSeen.push(`${s.day}/${m.id}`);
    log(s,'직원 안전 사고 · 야간 침입',text,'bad');
   }
  }
 }
 queueCrewTerminations(s);
 // Every 10th completed night offers ONE intervention among the people actually recruited.
 // E.g. DAY 10 -> DAY 11; absent staff can never speak or be penalized.
 if(s.day>0 && s.day%10===0 && crew.members.some(m=>m.mind>0) && !crew.pendingNightVote){
  crew.pendingNightVote={day:s.day,members:crew.members.filter(m=>m.mind>0).map(m=>m.id)};
  log(s,'야간 인력 회의',`DAY ${s.day}: 확보된 인력 ${crew.members.length}명의 우선 업무를 하나 결정해야 합니다.`,'mystery');
 }
}
/** Only BOTH recruited employees may argue. The first valid action plays dialogue once; every valid action causes -3 to the dissenter. */
export function applyCrewOpinion(s:V10,kind:CrewConflictKind,choice:CrewConflictChoice):CrewConflict|null{
 const crew=ensureCrew(s);
 const pair:readonly CrewId[]=kind==='treatment'?['rabbit','fox']:['wolf','deer'];
 if(!pair.every(id=>crew.members.some(m=>m.id===id&&m.mind>0)))return null;
 if(kind==='treatment' && choice!=='treat' && choice!=='withhold')return null;
 if(kind==='disposal' && choice!=='protect' && choice!=='dispose')return null;
 const dissent:CrewId=kind==='treatment'?(choice==='treat'?'fox':'rabbit'):(choice==='dispose'?'deer':'wolf');
 const member=crew.members.find(m=>m.id===dissent)!;
 const before=member.mind;
 member.mind=cap(member.mind-3);
 queueCrewTerminations(s);
 const first=!crew.conflictsSeen.includes(kind);
 if(first)crew.conflictsSeen.push(kind);
 crew.conflictSerial++;
 const record:CrewConflict={serial:crew.conflictSerial,day:s.day,kind,choice,first,dissent,mindBefore:before,mindAfter:member.mind};
 crew.lastConflict=record;
 log(s,`내부 의견 충돌 · ${kind==='treatment'?'치료와 배급':'개체 처분'}`,`${CREW_PROFILES[dissent].post}의 정신 ${before} → ${member.mind} (-${before-member.mind}).`, 'bad');
 return record;
}
export function crewConflictDialogue(c:CrewConflict):{speaker:CrewId|'EVE'|'관리자';text:string}[]{
 const first=c.kind==='disposal'?[{speaker:'deer' as const,text:'잠깐만요. 저 개체에게도 살아 있을 이유가 있어요. 아직 돌이킬 수 있어요.'},{speaker:'wolf' as const,text:'위험 인자를 남겨두면 더 많은 사람이 다칩니다. 끝내야 할 건 끝내야죠.'}]:[{speaker:'fox' as const,text:'잠깐. 약품과 식량은 무한하지 않아요. 한 개체에 낭비하면 다른 개체는 굶습니다.'},{speaker:'rabbit' as const,text:'목숨을 원가표로 계산하지 말아요. 아직 치료할 수 있다면 살려야 해요.'}];
 return [...first,{speaker:'관리자',text:c.choice==='treat'?'치료를 진행한다.':c.choice==='withhold'?'지금은 물자를 아낀다.':c.choice==='dispose'?'위협을 제거한다.':'죽이지 않는다. 다른 방법을 찾는다.'},{speaker:c.dissent,text:c.dissent==='deer'?'...기록에서 이 선택을 지우지 말아 주세요.':c.dissent==='wolf'?'알겠습니다. 하지만 다음 공격이 오면 제 책임입니까?':c.dissent==='fox'?'정확한 소모량을 기록하겠어요. 다음에도 같은 결정을 한다면...':'...다른 방법은 정말 없었나요?'},{speaker:'EVE',text:`내부 신경 충돌로 ${CREW_PROFILES[c.dissent].post}의 정신력 ${c.mindBefore} → ${c.mindAfter}. 두 직원 모두 배치되어 있을 때만 이 충돌이 발생합니다. 동일한 결정을 반복하면 반대 직원의 정신력이 매번 3씩 감소하며, 대화 기록은 반복하지 않습니다.`}];
}
export function resolveCrewNightVote(s:V10,selected:CrewId):V10{
 const pending=s.crew?.pendingNightVote;
 if(!pending||!pending.members.includes(selected)||!s.crew?.members.some(m=>m.id===selected&&m.mind>0)||s.crew?.pendingTermination)return s;
 const n=copy(s) as V10;const crew=ensureCrew(n);
 const losses:CrewNightResult['losses']=[];
 for(const id of pending.members){if(id===selected)continue;const member=crew.members.find(m=>m.id===id);if(!member||member.mind<=0)continue;const before=member.mind;member.mind=cap(member.mind-10);losses.push({id,before,after:member.mind});}
 let effect='';
 if(selected==='rabbit'){
  const previous=n.mind;n.mind=cap(n.mind+8);for(const animal of n.animals.filter(a=>a.alive))animal.hp=cap(animal.hp+10);
  effect=`담당자 정신력 ${previous} → ${n.mind}; 격리 개체 생명 +10`;
 }else if(selected==='fox'){n.parts++;n.food+=2;effect='부품 +1 · 식량 +2';}
 else if(selected==='wolf'){const old=n.threat;n.threat=cap(n.threat-10);n.facility=cap(n.facility+4);effect=`외부 위협 ${old} → ${n.threat} · 시설 안정성 +4`;}
 else {n.knowledge+=6;n.infection=cap(n.infection-4);effect='지식 +6 · 시설 감염도 -4';}
 crew.pendingNightVote=null;
 queueCrewTerminations(n);
 crew.lastNightResult={day:pending.day,selected,losses,effect};
 const lossText=losses.length?losses.map(v=>`${CREW_PROFILES[v.id].title} 정신 ${v.before}→${v.after}`).join(' / '):'다른 직원이 없어 정신력 불이익 없음';
 log(n,'야간 우선 업무 확정',`${CREW_PROFILES[selected].post} 배치: ${effect}. 미선택 직원: ${lossText}`,'mystery');
 n.lastOutcome=`야간 업무 · ${CREW_PROFILES[selected].post}: ${effect}. ${lossText}`;
 return n;
}
/** Archived actions have actual ethical weight; harm to an original specimen destabilizes the clones. */
export function crewDissectionShock(s:V10):void{
 const crew=ensureCrew(s);for(const m of crew.members){m.mind=cap(m.mind-9);}queueCrewTerminations(s);
 if(crew.members.length)log(s,'의무 기록 · 신경 혼란','해부 기록 이후 직원들의 신경 안정도가 일제히 떨어졌습니다.','bad');
}

export function treatCrew(s:V10,id:CrewId,kind:'medical'|'counsel',roll=Math.random):V10{
 const member=s.crew?.members.find(m=>m.id===id);
 const crew=s.crew;
 if(!member||member.mind<=0||crew?.pendingTermination||s.phase!=='day'||s.run||s.pendingIncident)return s;
 if(kind==='medical'&&(s.ap<1||s.medicine<1||member.lastCareDay===s.day))return s;
 if(kind==='counsel'&&(s.ap<1||s.food<1||member.lastCounselDay===s.day))return s;
 const n=copy(s) as V10;const team=ensureCrew(n);const m=team.members.find(a=>a.id===id)!;
 const random=(lo:number,hi:number)=>lo+Math.min(hi-lo,Math.max(0,Math.floor(roll()*(hi-lo+1))));
 n.ap--;
 if(kind==='medical'){n.medicine--;m.lastCareDay=n.day;m.mind=cap(m.mind+random(12,22));m.stability=cap((m.stability??88)+random(3,7));}
 else{n.food--;m.lastCounselDay=n.day;team.counselDay=n.day;m.mind=cap(m.mind+random(7,14));m.bond=cap(m.bond+random(2,5));}
 const gains=[`정신 +${m.mind-member.mind}`,kind==='medical'?`신체 안정 +${(m.stability??88)-(member.stability??88)}`:`신뢰 +${m.bond-member.bond}`];
 n.lastOutcome=`${CREW_PROFILES[id].post} ${kind==='medical'?'의료 지원':'상담'} 완료 · AP -1 · ${kind==='medical'?'의약품 -1':'식량 -1'} · ${gains.join(' · ')}`;
 log(n,'직원 관리 · '+CREW_PROFILES[id].post,n.lastOutcome,'good');
 return n;
}

/** STAFF TERMINATION: a recruit's neural collapse can never be reversed by treatment.
 * The queue is persisted, so reloading before the cinematic does not skip the event. */
export function queueCrewTerminations(s:V10):void{
 const c=ensureCrew(s);
 if(c.pendingTermination)return;
 const next=c.members.find(m=>m.mind<=0);
 if(next){c.pendingTermination=next.id;log(s,'인력 신경 신호 소실',`${CREW_PROFILES[next.id].post}의 인격 신호가 0에 도달했습니다. 후속 처리가 필요합니다.`,'bad');}
}
export const CREW_LOSS_EFFECTS:Record<CrewId,{name:string;summary:string;eve:string;quote:string[]}>={
 rabbit:{name:'의무관 공백',summary:'매일 관리자 정신력 -8',eve:'의무관이 사라졌습니다. 의료 관제의 자율 회복 루틴이 끊어졌습니다. 매일 아침 담당자님의 정신력이 8 감소합니다. 회복하더라도 이 손실은 반복됩니다.',quote:['...환자들이 아직 기다리고 있어요.','저는... 그저 치료하고 싶을 뿐이에요.','담당자님, 부탁이에요. 오늘만큼은... 아무도 아프지 않게 해주세요.']},
 fox:{name:'보급 체계 붕괴',summary:'매일 물품 1~3개 무작위 소실',eve:'보급관의 재고 체계가 정지했습니다. 무인 운송 장치가 출고 내역을 잘못 인식합니다. 매일 자재·식량·치료제·필터·전지 중 실제 보관한 물품 1~3개가 사라집니다.',quote:['재고가... 맞지 않아요. 분명 제가 확인했는데.','장부는 거짓말하지 않아요. ...그런데 왜 제 이름이 삭제됐죠?','마지막 부탁입니다. 제가 숨긴 건 없어요. 숫자만... 다시 세어 주세요.']},
 wolf:{name:'경비 관제 부재',summary:'매일 외부 위협 +20%p',eve:'보안관의 순찰 신호가 끊겼습니다. 마지막 녹음에는 인간의 문장과 늑대의 울음이 겹쳐 있습니다. 손상된 신경 패턴의 발화자를 분리할 수 없으며, 외곽 방어망의 야간 보정도 정지해 매일 외부 위협 수치가 20%p 추가 증가합니다.',quote:['걱정 마세요... 제가 막을게요. 눈앞이 흔들려도, 아직은.','제 손이 이상해요. 분명 문을 잡았는데… 왜 바닥에 닿아 있죠?','아직 싸울 수 있어요. 제발 문을 열지 마세요. 제 안에서 늑대가… 아니, 제가…']},
 deer:{name:'기록 무결성 붕괴',summary:'분석실 기록의 표시 순서 교란',eve:'서기관의 대조 검증이 중지됐습니다. 분석실의 사건·관찰·행동 강령 기록이 뒤섞여 표시됩니다. 원본 데이터는 사라지지 않지만, 화면에 나타난 순서만으로 사실을 판단하기 어려워집니다.',quote:['제가... 정리해 둔 파일이 전부 엉망이에요.','이번엔 틀리지 않으려고 했는데... 모든 이름이 바뀌어요.','죄송해요. 딱 한 번만... 제대로 해보고 싶었는데.']}
};
/** Single available ending choice; after acknowledgement the staff member is gone permanently. */
export function terminateCrew(s:V10,id:CrewId):V10{
 const c=s.crew;
 if(!c||c.pendingTermination!==id||!c.members.some(m=>m.id===id&&m.mind<=0))return s;
 return finalizeCrewLoss(s,id,'collapse');
}
/** A separate field sacrifice, not a fabricated zero-SANITY collapse. */
export function canWolfLastStand(s:V10):boolean{
 const c=s.crew,b=s.field?.combat,run=s.run;
 return !!(c&&!c.pendingTermination&&!c.retired.includes('wolf')&&run&&b?.source==='mobile'&&b.enemy==='mutant'&&b.round>=2&&run.integrity<=35&&(run.companions??[run.companion]).includes('wolf')&&c.members.some(m=>m.id==='wolf'&&m.mind>0));
}
export function sacrificeWolf(s:V10):V10{
 if(!canWolfLastStand(s)||!s.field?.combat?.lastStand)return s;
 return finalizeCrewLoss(s,'wolf','last-stand');
}
function finalizeCrewLoss(s:V10,id:CrewId,cause:'collapse'|'last-stand'):V10{
 const n=copy(s) as V10;const crew=ensureCrew(n);
 crew.members=crew.members.filter(m=>m.id!==id);
 if(!crew.retired.includes(id))crew.retired.push(id);
 crew.pendingTermination=null;
 crew.lastTermination={id,day:n.day,cause};
 if(n.run){n.run.companions=(n.run.companions??(n.run.companion?[n.run.companion]:[])).filter(memberId=>memberId!==id);if(n.run.companion===id)n.run.companion=null;}
 const grief=crew.members.filter(member=>member.mind>0).map(member=>{
  const before=member.mind;member.mind=cap(member.mind-30);
  return `${CREW_PROFILES[member.id].post} ${before}→${member.mind}`;
 });
 if(crew.pendingNightVote){
  crew.pendingNightVote.members=crew.pendingNightVote.members.filter(memberId=>memberId!==id&&crew.members.some(m=>m.id===memberId&&m.mind>0));
  if(!crew.pendingNightVote.members.length)crew.pendingNightVote=null;
 }
 const griefText=grief.length?` 남은 직원 정신력 -30: ${grief.join(', ')}.`:' 남은 직원이 없어 정신력 후폭풍은 없습니다.';
 log(n,`인력 처리 완료 · ${CREW_PROFILES[id].post}`,`${cause==='last-stand'?'현장 엄호 중 신호 소실':'직원 신호 제거'}. ${CREW_LOSS_EFFECTS[id].name}: ${CREW_LOSS_EFFECTS[id].summary}.${griefText} 처리 기록은 되돌릴 수 없습니다.`,'bad');
 n.lastOutcome=`${cause==='last-stand'?'마지막 엄호':'인력 처리'}: ${CREW_PROFILES[id].title}. ${CREW_LOSS_EFFECTS[id].summary}.${griefText}`;
 queueCrewTerminations(n);
 return n;
}
/** Permanent real-world consequences, charged exactly once at each completed night.
 * Supplies are selected deterministically from actual available inventory to avoid save/reload exploits. */
export function applyCrewLossPenalties(s:V10):string[]{
 const retired=ensureCrew(s).retired;
 const changes:string[]=[];
 if(retired.includes('rabbit')){const before=s.mind;s.mind=cap(s.mind-8);changes.push(`의료 공백 · 정신력 ${before}→${s.mind} (-${before-s.mind})`);}
 if(retired.includes('wolf')){const before=s.threat;s.threat=cap(s.threat+20);changes.push(`경비 부재 · 외부 위협 ${before}→${s.threat} (+${s.threat-before}%p)`);}
 if(retired.includes('fox')){
  const keys=['scrap','parts','food','medicine','filters','electricCells'] as const;
  const count=1+((s.day*7+retired.length*11)%3);
  const lost:string[]=[];
  for(let i=0;i<count;i++){
   const available=keys.filter(k=>s[k]>0);
   if(!available.length)break;
   const key=available[(s.day*13+i*17+retired.length*5)%available.length];s[key]--;
   lost.push(({scrap:'고철',parts:'부품',food:'식량',medicine:'의약품',filters:'필터',electricCells:'전지'} as const)[key]);
  }
  changes.push(`보급 체계 붕괴 · ${lost.length?lost.join(' · ')+' 소실':'보유 물품 없음'}`);
 }
 if(retired.includes('deer'))changes.push('기록 대조 실패 · 분석실 표시 순서 교란');
 for(const message of changes)log(s,'시설 인력 공백 · 영구 후유증',message,'bad');
 return changes;
}
