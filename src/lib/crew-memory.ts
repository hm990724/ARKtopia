import type {V10} from './game-v10';
import {copy,cap,log} from './sim';
import {crewDialog,CREW_PROFILES,type CrewId} from './crew';
type Line={speaker:CrewId|'EVE'|'관리자';text:string};
const fragments:Record<CrewId,string>={
 rabbit:'작은 그릇에 물을 담아 주던 손이 기억나요. 그게 제 환자였을까요, 아니면 제가 그릇 앞에 있었을까요?',
 fox:'추운 바닥 아래에 먹을 것을 숨겼던 것 같아요. 이제 제 침대와 이름을 얻었는데, 다시 잃고 싶지 않아요.',
 wolf:'철문 반대쪽에 작은 누군가가 있었어요. 문을 긁었던 건 나가려던 게 아니라, 그 아이를 지키려던 거였어요.',
 deer:'같은 번호가 반복되는 장부를 꿈에서 봤어요. 제 이름보다 그 번호가 익숙해요. 원본 기록부터 찾아보고 싶어요.',
};
const reactions:Record<CrewId,string>={
 rabbit:'제가 그 토끼였군요. 지금 두려운 건 제 과거보다, 이 손으로 환자를 지킬 수 없게 되는 거예요.',
 fox:'제가 그 여우였군요. 인간으로 돌아와 얻은 삶을 잃고 싶지 않아요. 그렇다고 다른 생명을 그 대가로 삼고 싶지도 않아요.',
 wolf:'제가 그 늑대였군요. 동물일 때도 지키려던 존재가 있었어요. 그 마음까지 본부의 소유는 아니에요.',
 deer:'제가 그 사슴이었군요. 제 기록을 복사해 주세요. 제가 누구였는지, 지금 무엇을 선택했는지 증명하고 싶어요.',
};
/** Conversations cost daily provisions and build trust; mental recovery is a separate scarce action. */
export function shareCrewMemory(s:V10,id:CrewId):{state:V10;lines:Line[]}{
 const old=s.crew?.members.find(m=>m.id===id);
 if(!old||old.mind<=0||s.phase!=='day'||s.run||s.pendingIncident||s.crew?.pendingTermination)return {state:s,lines:[]};
 if(old.lastSpokenDay===s.day)return {state:s,lines:(old.memoryStage??0)>=2?[{speaker:id,text:reactions[id]}]:crewDialog(s,id)};
 if(s.ap<1||s.food<1)return {state:s,lines:[{speaker:'EVE',text:'오늘은 상담에 쓸 행동력이나 식량이 부족합니다. 오늘의 하루 배급을 먼저 확인해 주세요.'}]};
 const n=copy(s) as V10,m=n.crew!.members.find(x=>x.id===id)!;
 n.ap--;n.food--;m.lastSpokenDay=n.day;m.bond=cap(m.bond+4);
 const key=m.sourceSpecimenId,entry=key?n.archive?.entries[key]:undefined;
 const matched=!!entry&&entry.species===id&&entry.status==='transferred';
 const age=n.day-m.arrivedDay,stage=m.memoryStage??0;
 let lines:Line[];
 if(stage<2&&matched&&(n.originZero?.photos??0)>=10&&n.flags.humanTruth&&m.bond>=65&&(stage>=1||old.mind<=28)){
  m.memoryStage=2;m.memoryEcho=cap(Math.max(65,m.memoryEcho??0));
  // Disclosure needs care, but this scene never silently kills a staff member.
  m.stability=cap(Math.max(1,(m.stability??88)-8));
  lines=[{speaker:id,text:'관리자님…… 제 손이 이상해요. 분명히 다섯 개였는데…… 왜 자꾸 네 발로 서야 할 것 같죠?'},
   {speaker:'관리자',text:'지금은 여기 있어. 천천히 숨을 쉬어. 기록은 함께 보자.'},
   {speaker:'EVE',text:`본부 이송 개체 ${key}. 이 직원의 뇌 보존 번호 ${key}. 두 기록이 일치합니다. 처음에는 본부의 접근 통제로 알지 못했어요. 확인한 뒤에도 당신들이 무너질까 봐 공개를 망설였습니다.`},
   {speaker:id,text:reactions[id]},
   {speaker:'EVE',text:'그 기억은 인간의 신경계와 동물의 몸이 함께 남긴 흔적입니다. 당신은 본부의 실험 번호만으로 정의되지 않아요.'}];
  log(n,'직원 기억 회복 · '+CREW_PROFILES[id].post,`${key} 이송 기록과 뇌 보존 번호가 일치했다. ${reactions[id]}`,'mystery');
 }else if(stage<1&&age>=2&&m.bond>=55){
  m.memoryStage=1;m.memoryEcho=Math.max(25,m.memoryEcho??0);
  lines=[{speaker:id,text:fragments[id]},{speaker:'관리자',text:'기억나지 않는 부분까지 억지로 말할 필요는 없어. 오늘은 여기까지 하자.'},{speaker:'EVE',text:'개별 기억의 파편을 기록했습니다. 안전한 환경과 신뢰가 더 필요합니다.'}];
  log(n,'직원 기억의 파편 · '+CREW_PROFILES[id].post,fragments[id],'mystery');
 }else if(stage>=2)lines=[{speaker:id,text:reactions[id]},{speaker:'관리자',text:'기억을 되찾은 뒤에 어떤 삶을 살지는 네가 결정해.'}];
 else lines=crewDialog(n,id);
 n.lastOutcome=`${CREW_PROFILES[id].post}와 대화 · AP -1 · 식량 -1 · 신뢰 +${m.bond-old.bond} · 정신력은 회복되지 않음`;
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
  {speaker:'rabbit',text:'저도 왜 거기 있었는지 모르겠어요. 누군가에게 물을 갈아 줘야 한다는 생각이 들었어요.'},
 ]};
}
