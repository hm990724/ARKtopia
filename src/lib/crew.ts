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
export type CrewMember={id:CrewId;arrivedDay:number;hp:number;mind:number;bond:number;lastSpokenDay:number;preservationId?:string;bodyStability?:number;memoryFragments?:number;memoryEvents?:string[]};
export type CrewIncident={day:number;id:CrewId;damage:number;before:number;after:number;text:string};
export type CrewConflictKind='treatment'|'disposal';
export type CrewConflictChoice='treat'|'withhold'|'protect'|'dispose';
export type CrewConflict={serial:number;day:number;kind:CrewConflictKind;choice:CrewConflictChoice;first:boolean;dissent:CrewId;mindBefore:number;mindAfter:number};
export type CrewNightVote={day:number;members:CrewId[]};
export type CrewNightResult={day:number;selected:CrewId;losses:{id:CrewId;before:number;after:number}[];effect:string};
export type CrewTermination={id:CrewId;day:number};
export type CrewArrivalOrder={id:CrewId;transferDay:number;specimenKey?:string};
export type CrewState={arrivalQueue:CrewArrivalOrder[];lastArrivalDay:number;retired:CrewId[];pendingTermination:CrewId|null;lastTermination:CrewTermination|null;members:CrewMember[];supportDay:number;healingDay:number;guardDay:number;decontamDay:number;lastIncident:CrewIncident|null;incidentsSeen:string[];conflictsSeen:string[];lastConflict:CrewConflict|null;conflictSerial:number;pendingNightVote:CrewNightVote|null;lastNightResult:CrewNightResult|null};
export const emptyCrew=():CrewState=>({arrivalQueue:[],lastArrivalDay:0,retired:[],pendingTermination:null,lastTermination:null,members:[],supportDay:0,healingDay:0,guardDay:0,decontamDay:0,lastIncident:null,incidentsSeen:[],conflictsSeen:[],lastConflict:null,conflictSerial:0,pendingNightVote:null,lastNightResult:null});
export function ensureCrew(s:V10):CrewState{
 const existing=s.crew;
 const crew:{[K in keyof CrewState]:CrewState[K]}={...emptyCrew(),...existing,arrivalQueue:existing?.arrivalQueue??[],lastArrivalDay:existing?.lastArrivalDay??0,members:existing?.members??[],retired:existing?.retired??[],pendingTermination:existing?.pendingTermination??null,lastTermination:existing?.lastTermination??null,incidentsSeen:existing?.incidentsSeen??[],conflictsSeen:existing?.conflictsSeen??[],lastConflict:existing?.lastConflict??null,conflictSerial:existing?.conflictSerial??0,pendingNightVote:existing?.pendingNightVote??null,lastNightResult:existing?.lastNightResult??null};
 for(const m of crew.members){m.bodyStability??=90;if(!m.preservationId)m.preservationId=Object.values(s.archive?.entries??{}).find(e=>e.species===m.id&&e.status==='transferred')?.key;}
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
 crew.arrivalQueue.push({id,transferDay:s.day,specimenKey:s.animals.find(a=>a.id===id&&(a as typeof a&{transferred?:boolean}).transferred)?.specimenId});
 log(s,'본부 반송 캡슐 접수',`${CREW_PROFILES[id].post} 근무 인력 파견 대기. DAY ${s.day+1}부터 인력 한 명씩 순차 파견됩니다.`,'mystery');
 return true;
}
/** Recruit a staff member ONLY when its original animal is transferred to HQ. */
export function recruitCrew(s:V10,id:AnimalId,specimenKey?:string):boolean{
 if(!isCrewId(id))return false;
 const crew=ensureCrew(s);
 if(crew.members.some(m=>m.id===id)||crew.retired.includes(id)||crew.members.length>=4)return false;
 const preservationId=specimenKey??Object.values(s.archive?.entries??{}).find(e=>e.species===id&&e.status==='transferred')?.key;
 crew.members.push({id,preservationId,bodyStability:90,arrivedDay:s.day,hp:85,mind:88,bond:45,lastSpokenDay:0});
 log(s,'본부 인력 등록',`${CREW_PROFILES[id].post}이(가) 도착했습니다. 기존 근무 이력은 본부 보안 정책에 따라 비공개입니다.`,'mystery');
 return true;
}

export const CREW_MEMORY:Record<CrewId,string[]>={
 rabbit:['빈 우리 앞에서 발을 멈췄어요. 누군가를 밤새 기다렸던 기분이 들어요.','내 손이 닿지 않아, 다친 아이 옆에 몸을 붙였던 것 같아요.','그 토끼였던 시간도 제 삶이에요. 치료를 위해 살아 있는 누군가를 버리고 싶지 않아요.'],
 fox:['창고의 측문이 낯설지 않아요. 출근한 적도 없는데요.','물건을 숨겨 둔 곳의 냄새가 기억나요. 손보다 코가 먼저 찾았어요.','여우의 몸으로 배고팠던 기억이 돌아왔어요. 겨우 되찾은 이 손과 삶을 다시 잃는 게 무서워요.'],
 wolf:['문을 세 번 두드리면 돌아봐야 할 것 같아요.','작은 개체들 앞을 막아섰던 기억이 있어요. 낮은 시선으로요.','늑대로 지켰던 이들은 아직 여기 있어요. 명령보다 그들을 지키겠습니다.'],
 deer:['이름표의 선을 따라 걷고 싶은 기분이 들어요.','종이를 넘기려 했는데 발굽이 닿았어요. 꿈이라고 생각했어요.','사슴으로 살아온 시간이 기록에서 지워졌어요. 제가 누구였는지 증명할 원본부터 찾겠어요. 그 번호를 지우지 마세요.']
};
/** A trusted conversation remembers only a witnessed personal event. No calendar reveal. */
export function rememberCrew(s:V10,id:CrewId):V10{
 const m=s.crew?.members.find(x=>x.id===id);
 if(!m||m.mind<=0||s.phase!=='day'||m.lastSpokenDay===s.day)return s;
 const n=copy(s) as V10,member=ensureCrew(n).members.find(x=>x.id===id)!;
 if(member.mind<=35&&(n.originZero?.photos??0)>=7){member.memoryEvents??=[];if(!member.memoryEvents.includes('body-shock'))member.memoryEvents.push('body-shock');}
 member.lastSpokenDay=n.day;member.bond=cap(member.bond+5);member.memoryEvents??=[];
 const event=id==='rabbit'?(n.operations?.correct??0)>0:id==='fox'?n.suppliesCollected>0||n.crew?.supportDay===n.day:id==='wolf'?n.security.resolved>0||n.operations?.night?.status==='success':n.narrative?.choices.shift_report!==undefined||(n.originZero?.photos??0)>0;
 const stage=member.memoryFragments??0;
 const allowed=stage===0?event&&member.bond>=50:stage===1?event&&member.bond>=65&&(n.narrative?.choices.shift_report!==undefined||(n.originZero?.photos??0)>=6):member.bond>=80&&(n.originZero?.photos??0)>=10;
 if(stage<3&&allowed){member.memoryFragments=stage+1;member.memoryEvents.push(`fragment-${stage+1}`);member.mind=cap(member.mind+3);n.trust=cap(n.trust+2);log(n,'직원 기억 조각',CREW_MEMORY[id][stage],'mystery');}
 return n;
}

export function crewDialog(s:V10,id:CrewId):{speaker:CrewId|'EVE'|'관리자';text:string}[]{
 const member=ensureCrew(s).members.find(m=>m.id===id);if(!member)return [];
 if(member.memoryEvents?.includes('body-shock')&&(member.memoryFragments??0)>=2&&(s.originZero?.photos??0)>=10&&member.preservationId)return [{speaker:id,text:'관리자님……. 제 손이 이상해요. 분명히 다섯 개였는데……. 왜 자꾸 네 발로 서야 할 것 같죠?'},{speaker:'EVE',text:`이송 개체 번호 ${member.preservationId}. 직원 뇌 보존 번호 ${member.preservationId}. 두 기록이 일치합니다.`},{speaker:id,text:'내가 그 동물이었던 거군요.'},{speaker:id,text:CREW_MEMORY[id][2]}];
 if(id==='rabbit'&&member.memoryFragments===1)return [{speaker:'관리자',text:'며칠 전에 보낸 토끼는 어떻게 됐지?'},{speaker:'EVE',text:'본부에서는 개체 상태가 안정적이라고 보고했습니다.'},{speaker:'관리자',text:'그럼 다시 볼 수 있겠네.'},{speaker:'EVE',text:'……그 부분은 확인이 어렵습니다.'},{speaker:id,text:CREW_MEMORY.rabbit[0]}];
 if((member.memoryFragments??0)>0)return [{speaker:id,text:CREW_MEMORY[id][member.memoryFragments!-1]},{speaker:'EVE',text:'기억을 말할지, 지금은 멈출지 당신이 선택해도 됩니다.'}];
 const profile=CREW_PROFILES[id];const days=Math.max(0,s.day-member.arrivedDay);
 const personal:Record<CrewId,[string,string,string]>={
  rabbit:['소독약 냄새가 잠깐 피 냄새처럼 느껴졌어요. 제가 과로했나 봐요.','복도에 작은 환자가 울고 있었어요. 분명 토끼였는데... 아이 이름을 불렀어요.','담당자님, 잠깐만 제 손을 잡아 주세요. 제 손이 자꾸 발처럼 접혀요.'],
  fox:['재고 장부에 제가 쓰지 않은 숫자가 있어요. 전부 4씩 늘어나네요.','문에 귀를 대면 밖에서 네 발로 걷는 소리가 들려요. 그런데 안쪽에서 들려요.','전 그 물건을 숨기지 않았어요. 제가 보급품이었나요? 선반 안에 있었나요?'],
  wolf:['경보가 울리면 몸이 먼저 뛰어요. 훈련 덕이라고 생각했는데...','어제 밤 CCTV에 제 뒷모습이 나왔어요. 저는 그때 여기 있었는데.','그만! 문 열지 마세요. 저걸 막으려던 게 아니에요. 제가 들어가려고 했어요.'],
  deer:['아침에 일지 한 장을 잘못 분류했어요. 기록은 이미 고쳤습니다!','실험실 이름을 읽는데 제 이름처럼 들렸어요. 손이 떨려서 종이를 떨어뜨렸어요.','기록이 맞지 않아요. 제가 적은 이름이 제 이름을 지워요. 저 아직 사람 맞죠?']
 };
 if(member.mind<=22)return [
  {speaker:id,text:personal[id][0]},
  {speaker:'EVE',text:`${profile.post} 생체 신호 위험. 정신력 ${member.mind}. 야간의 인격 충돌과 우발 공격을 주의하십시오.`},
  {speaker:id,text:'제가 그러지 않았어요... 아니, 제가 그랬나요? 제 손이 기억을 못 해요.'}];
 if((member.memoryFragments??0)>=3&&s.headquarters.revealStage>=2&&s.flags.humanTruth)return [
  {speaker:id,text:profile.secret},
  {speaker:'관리자',text:'그 기억은 어디서 온 거야?'},
  {speaker:id,text:personal[id][1]},
  {speaker:'EVE',text:'복원된 인격의 기억 출처는 생체 기밀입니다. 추가 열람에는 윤리적 선택이 수반됩니다.'}];
 if(days>=5||member.mind<60)return [
  {speaker:id,text:personal[id][0]},
  {speaker:'EVE',text:'신경 동기화 이상 징후를 기록합니다. 업무 지원 횟수가 증가할수록 피로가 누적됩니다.'},
  {speaker:id,text:'그냥 피곤한 거겠죠. 제 직무는 계속하겠습니다.'}];
 return [{speaker:id,text:profile.first},
  {speaker:'EVE',text:`${profile.post}의 근무 자격을 확인했습니다. 전 인력의 지원 명령은 하루에 단 한 번만 사용할 수 있습니다.`}];
}
export function crewSupport(s:V10,id:CrewId):V10{
 const member=s.crew?.members.find(m=>m.id===id);
 if(!member||s.phase!=='day'||s.crew?.supportDay===s.day||member.mind<=0||s.crew?.pendingTermination)return s;
 const n=copy(s) as V10;const crew=ensureCrew(n);const m=crew.members.find(x=>x.id===id)!;
 crew.supportDay=n.day;m.mind=cap(m.mind-5);queueCrewTerminations(n);
 if(id==='rabbit'){n.mind=cap(n.mind+18);crew.healingDay=n.day;}
 if(id==='fox'){n.parts++;n.food++;n.credits+=30;}
 if(id==='wolf'){n.threat=cap(n.threat-13);crew.guardDay=n.day;}
 if(id==='deer'){n.infection=cap(n.infection-14);crew.decontamDay=n.day;}
 log(n,`직원 지원 · ${CREW_PROFILES[id].post}`,`${CREW_PROFILES[id].benefit}. 대가: 직원 정신 -5`,'good');
 n.lastOutcome=`${CREW_PROFILES[id].post} 지원: ${CREW_PROFILES[id].benefit}`;
 return n;
}
/** Progressive deterioration. Early days are stable; prolonged duty and low vitals cause trouble. */
export function crewNight(s:V10):void{
 const crew=ensureCrew(s);
 crew.lastIncident=null;
 for(const m of crew.members){
  // Artificial bodies depend on containment, not simply on elapsed days.
  const environment=s.power<15||s.facility<35;
  const shock=m.mind<30;
  m.bodyStability=cap((m.bodyStability??90)+(environment?-6:2)-(shock?5:0));
  if(m.bodyStability<25){m.mind=cap(m.mind-4);log(s,'직원 신체 안정 경고',`${CREW_PROFILES[m.id].post}: 안정 ${m.bodyStability}. 시설 전원과 상담·의료 지원이 필요합니다.`,'bad');}
  const days=s.day-m.arrivedDay;
  // Slower deterioration: duties and moral dilemmas are the main threats, not ordinary passing days.
  // Days 1-5 are safe. After that, stress is charged only once every few days.
  const drain=days<=5?0:days<=12?(days%3===0?1:0):(days%2===0?1:0);
  const infectionDrain=days<=2?0:s.infection>=90?2:s.infection>=70?1:0;
  m.mind=cap(m.mind-drain-infectionDrain);
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

export function treatCrew(s:V10,id:CrewId,kind:'medical'|'counsel'):V10{
 const member=s.crew?.members.find(m=>m.id===id);
 if(!member||member.mind<=0||s.crew?.pendingTermination||s.phase!=='day'||s.ap<1||(kind==='medical'&&s.medicine<1))return s;
 const n=copy(s) as V10;const m=ensureCrew(n).members.find(a=>a.id===id)!;n.ap--;
 if(kind==='medical'){n.medicine--;m.mind=cap(m.mind+28);m.bodyStability=cap((m.bodyStability??90)+18)}
 else{m.mind=cap(m.mind+12);m.bond=cap(m.bond+8)}
 log(n,`직원 관리 · ${CREW_PROFILES[id].post}`,`${kind==='medical'?'의약품 1개로 정신력 +28':'대화 안정화로 정신력 +12'} 회복`,'good');
 n.lastOutcome=`${CREW_PROFILES[id].title}의 ${kind==='medical'?'신경 회복':'대화 안정화'} 완료`;
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
 wolf:{name:'경비 관제 부재',summary:'매일 외부 위협 +20%p',eve:'보안관의 순찰 신호가 끊겼습니다. 외곽 방어망의 야간 보정이 정지해 매일 외부 위협 수치가 20%p 추가 증가합니다. 침입 및 습격 사건 위험도 높아집니다.',quote:['걱정 마세요... 제가 막을게요.','이상하네. 분명 문 앞에서 지키고 있었는데, 문 안쪽에 제가 있어요.','아직 싸울 수 있어요. 부탁이에요... 저한테 문을 열지 마세요.']},
 deer:{name:'기록 무결성 붕괴',summary:'분석실 기록의 표시 순서 교란',eve:'서기관의 대조 검증이 중지됐습니다. 분석실의 사건·관찰·행동 강령 기록이 뒤섞여 표시됩니다. 원본 데이터는 사라지지 않지만, 화면에 나타난 순서만으로 사실을 판단하기 어려워집니다.',quote:['제가... 정리해 둔 파일이 전부 엉망이에요.','이번엔 틀리지 않으려고 했는데... 모든 이름이 바뀌어요.','죄송해요. 딱 한 번만... 제대로 해보고 싶었는데.']}
};
/** Single available ending choice; after acknowledgement the staff member is gone permanently. */
export function terminateCrew(s:V10,id:CrewId):V10{
 const c=s.crew;
 if(!c||c.pendingTermination!==id||!c.members.some(m=>m.id===id&&m.mind<=0))return s;
 const n=copy(s) as V10;const crew=ensureCrew(n);
 crew.members=crew.members.filter(m=>m.id!==id);
 if(!crew.retired.includes(id))crew.retired.push(id);
 crew.pendingTermination=null;
 crew.lastTermination={id,day:n.day};
 if(crew.pendingNightVote){
  crew.pendingNightVote.members=crew.pendingNightVote.members.filter(memberId=>memberId!==id&&crew.members.some(m=>m.id===memberId&&m.mind>0));
  if(!crew.pendingNightVote.members.length)crew.pendingNightVote=null;
 }
 log(n,`인력 처리 완료 · ${CREW_PROFILES[id].post}`,`직원 신호 제거. ${CREW_LOSS_EFFECTS[id].name}: ${CREW_LOSS_EFFECTS[id].summary}. 처리 기록은 되돌릴 수 없습니다.`,'bad');
 n.lastOutcome=`인력 처리: ${CREW_PROFILES[id].title}. ${CREW_LOSS_EFFECTS[id].summary}`;
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
