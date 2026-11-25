import type {V10} from './game-v10';
import {copy,cap,log} from './sim';
import {crewDialog,CREW_PROFILES,RABBIT_CRITICAL_MEMORY_LINE,DEER_CRITICAL_MEMORY_LINE,type CrewId} from './crew';
type Line={speaker:CrewId|'EVE'|'관리자';text:string;expression?:'neutral'|'anxious'|'critical'|'resolve'};
const fragments:Record<CrewId,string>={
 rabbit:'작은 물그릇을 채우던 손이 기억나요. 제가 돌보던 생명이었을까요, 저를 기다리던 생명이었을까요? 어느 쪽이든 혼자 두고 싶지 않았어요.',
 fox:'추운 바닥 아래에 먹을 것을 숨겼던 것 같아요. 이제 제 침대와 이름을 얻었는데, 다시 잃고 싶지 않아요.',
 wolf:'관리자님, 철문 반대쪽에 작은 누군가가 있었던 것 같습니다. 문을 긁은 건 나가려던 게 아니라… 그 아이를 지키려던 거였어요.',
 deer:'도서실에서 같은 문장을 몇 번이고 읽는 꿈을 꿨어요. 책 여백에는 제 이름 대신 낯선 번호가 적혀 있었어요. 담당자님, 그 원본도 같이 찾아봐 주실래요?',
};
const reactions:Record<CrewId,string>={
 rabbit:'제가 그 토끼였군요. 그래도 과거가 제 전부는 아니에요. 지금 제 앞에 있는 생명과 담당자님을 지키고 싶어요.',
 fox:'제가 그 여우였군요. 인간으로 돌아와 얻은 삶을 잃고 싶지 않아요. 그렇다고 다른 생명을 그 대가로 삼고 싶지도 않아요.',
 wolf:'관리자님, 제가 그 늑대였군요. 동물일 때도 누군가를 지키려 했습니다. 지시에는 복종하겠습니다. 그래도 이 마음만은… 빼앗기고 싶지 않습니다.',
 deer:'담당자님, 그 번호가 제 예전 기록이었군요. 그래도 지금 제가 좋아하는 책과 소중한 사람들은 진짜예요. 언니들한테도 이 이야기를 들려드리고 싶어요. 제 이야기도 기록에 남겨 주실래요?',
};
/** A paid daily conversation restores trust and a little morale; replay has no second reward. */
export function shareCrewMemory(s:V10,id:CrewId,roll=Math.random):{state:V10;lines:Line[]}{
 const old=s.crew?.members.find(m=>m.id===id);
 if(!old||old.mind<=0||s.phase!=='day'||s.run||s.pendingIncident||s.crew?.pendingTermination)return {state:s,lines:[]};
 if(old.lastSpokenDay===s.day)return {state:s,lines:(old.memoryStage??0)>=2?[{speaker:id,text:id==='rabbit'&&old.mind<35?RABBIT_CRITICAL_MEMORY_LINE:id==='deer'&&old.mind<35?DEER_CRITICAL_MEMORY_LINE:reactions[id],expression:old.mind<35?'critical':old.mind<62?'anxious':'resolve'}]:crewDialog(s,id)};
 if(s.ap<1||s.food<1)return {state:s,lines:[{speaker:'EVE',text:'오늘은 상담에 쓸 행동력이나 식량이 부족합니다. 오늘의 하루 배급을 먼저 확인해 주세요.'}]};
 const n=copy(s) as V10,m=n.crew!.members.find(x=>x.id===id)!;
 n.ap--;n.food--;m.lastSpokenDay=n.day;m.bond=cap(m.bond+3+Math.min(4,Math.max(0,Math.floor(roll()*5))));m.mind=cap(m.mind+1+Math.min(3,Math.max(0,Math.floor(roll()*4))));
 const key=m.sourceSpecimenId,entry=key?n.archive?.entries[key]:undefined;
 const matched=!!entry&&entry.species===id&&entry.status==='transferred';
 const age=n.day-m.arrivedDay,stage=m.memoryStage??0;
 let lines:Line[];
 if(stage<2&&matched&&(n.originZero?.photos??0)>=10&&n.flags.humanTruth&&m.bond>=65&&(stage>=1||old.mind<=28)){
  m.memoryStage=2;m.memoryEcho=cap(Math.max(65,m.memoryEcho??0));
  // Disclosure needs care, but this scene never silently kills a staff member.
  m.stability=cap(Math.max(1,(m.stability??88)-8));
  lines=[{speaker:id,text:id==='rabbit'?'기록을 정리하다 보니 이 번호가 눈에 익어요. 제가 오래전부터 적어 온 것 같아요. 이상하지만, 천천히 확인해 보겠습니다.':id==='deer'?'담당자님, 번호와 제 기록이 나란히 적혀 있어요. 이게... 제 예전 이름과 이어지는 걸까요? 죄송해요, 잠깐만요. 차근차근 읽어 볼게요.':'기록을 정리하다 보니 이 번호가 눈에 익어요. 왜인지 모르겠지만, 제가 오래전부터 적어 온 것 같아요.',expression:'neutral'},
   {speaker:id,text:id==='deer'?'문장도 낯선데 어쩐지 익숙해요. 책 여백에 이런 기록이 더 있을까요? 언니들한테도 알려 주고 싶은데... 아, 제가 너무 신났죠?':'아니, 손이 떨려요. 제 글씨 같으면서도 낯설어요. 이 기억은 어디서 온 거죠?',expression:'anxious'},
   {speaker:'EVE',text:`본부 이송 개체 ${key}. 이 직원의 뇌 보존 번호 ${key}. 두 기록이 일치합니다. 처음에는 본부의 접근 통제로 알지 못했어요. 확인한 뒤에도 당신들이 무너질까 봐 공개를 망설였습니다.`,expression:'critical'},
   {speaker:id,text:id==='rabbit'&&m.mind<35?RABBIT_CRITICAL_MEMORY_LINE:id==='deer'&&m.mind<35?DEER_CRITICAL_MEMORY_LINE:reactions[id],expression:m.mind<35?'critical':m.mind<62?'anxious':'resolve'},
   {speaker:'관리자',text:'그 기억이 네 선택을 대신할 수는 없어. 오늘부터 어떤 사람으로 살지는 네가 정해.',expression:'resolve'}];
  log(n,'직원 기억 회복 · '+CREW_PROFILES[id].post,`${key} 이송 기록과 뇌 보존 번호가 일치했다. ${reactions[id]}`,'mystery');
 }else if(stage<1&&age>=2&&m.bond>=55){
  m.memoryStage=1;m.memoryEcho=Math.max(25,m.memoryEcho??0);
  lines=[{speaker:id,text:id==='rabbit'&&m.mind<35?RABBIT_CRITICAL_MEMORY_LINE:id==='deer'&&m.mind<35?DEER_CRITICAL_MEMORY_LINE:fragments[id],expression:m.mind<35?'critical':'anxious'},{speaker:'관리자',text:'기억나지 않는 부분까지 억지로 말할 필요는 없어. 오늘은 여기까지 하자.',expression:'resolve'},{speaker:'EVE',text:'개별 기억의 파편을 기록했습니다. 안전한 환경과 신뢰가 더 필요합니다.',expression:'neutral'}];
  log(n,'직원 기억의 파편 · '+CREW_PROFILES[id].post,fragments[id],'mystery');
 }else if(stage>=2)lines=[{speaker:id,text:id==='rabbit'&&m.mind<35?RABBIT_CRITICAL_MEMORY_LINE:id==='deer'&&m.mind<35?DEER_CRITICAL_MEMORY_LINE:reactions[id],expression:m.mind<35?'critical':m.mind<62?'anxious':'resolve'},{speaker:'관리자',text:'기억을 되찾은 뒤에 어떤 삶을 살지는 네가 결정해.',expression:'resolve'}];
 else lines=crewDialog(n,id);
 n.lastOutcome=`${CREW_PROFILES[id].post}와 대화 · AP -1 · 식량 -1 · 신뢰 +${m.bond-old.bond} · 정신 +${m.mind-old.mind}`;
 return {state:n,lines};
}
export function emptyCageAvailable(s:V10){return !!s.crew?.members.some(m=>m.id==='rabbit'&&m.mind>0)&&s.headquarters.transferred.includes('rabbit');}
export function watchEmptyCage(s:V10):{state:V10;lines:Line[]}{
 if(!emptyCageAvailable(s))return {state:s,lines:[]};
 const seen=s.onboardingSeen?.includes('rabbit-empty-cage');
 const n=seen?s:copy(s) as V10;
 if(!seen){n.onboardingSeen=[...(n.onboardingSeen??[]),'rabbit-empty-cage'];log(n,'CCTV · 빈 토끼 우리','의무관은 빈 우리 앞에 오래 서 있었다. 그녀도 그 이유를 설명하지 못했다.','mystery');}
 return {state:n,lines:[
  {speaker:'관리자',text:'며칠 전에 보낸 토끼는 어떻게 됐지?'},
  {speaker:'EVE',text:'본부에서는 개체 상태가 안정적이라고 보고했습니다.'},
  {speaker:'관리자',text:'그럼 다시 볼 수 있겠네.'},
  {speaker:'EVE',text:'……그 부분은 확인이 어렵습니다.'},
  {speaker:'관리자',text:'그날 밤 녹화에 의무관이 보여. 빈 토끼 우리 앞에서 한참 움직이지 않아.'},
  {speaker:'rabbit',text:'저도 왜 거기 서 있었는지 정확히는 모르겠어요. 다만 물그릇이 비어 있어서, 누군가 목마르겠다 싶어 채워 두고 싶었어요.'},
 ]};
}
