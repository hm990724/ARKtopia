import type {V10} from './game-v10';
import type {AnimalId} from './sim';
import {cap,log,copy} from './sim';

export type CrewId='rabbit'|'fox'|'wolf'|'deer';
export const CREW_IDS:CrewId[]=['rabbit','fox','wolf','deer'];
export const CREW_PROFILES:Record<CrewId,{title:string;post:string;benefit:string;first:string;secret:string;appearance:string;personality:string}>={
 rabbit:{title:'서윤',post:'의무관',benefit:'담당자 HP +18 · 오늘의 휴식/응급처치 효과 강화',first:'...의료실은 어디죠? 흰 붕대가 있는 곳이라면 익숙해요. 전에 아픈 아이들을 돌봤던 것 같은데.',secret:'흰 장갑을 벗으면 손끝에 털이 보여요. 아까 환자에게... 당근을 주라고 했나요?',appearance:'눈처럼 흰 단발, 차분한 표정, 구식 양호실의 흰 간호복',personality:'상냥하고 말이 느린 양호선생님. 불안할 때 아이에게 말하듯 속삭인다.'},
 fox:{title:'유진',post:'보급관',benefit:'부품 +1 · 식량 +1 · CR +30',first:'물품 목록과 영수증부터 보죠. 지급하지 않은 건 지급한 게 아닙니다. ...제가 문을 잠근 적이 있나요?',secret:'어제도 재고가 맞았는데, 왜 오늘은 제 발자국이 보급실 선반 위에 남아 있죠?',appearance:'오렌지빛 짙은 갈색 장발, 얇은 사각 안경, 단정한 검정 보급 담당 제복',personality:'꼼꼼하고 차가운 여성. 사소한 물품 부족도 따지고 들지만 책임감이 높다.'},
 wolf:{title:'채아',post:'경비관',benefit:'외부 위협 -13 · 오늘 밤 경계 후 추가 -7',first:'경비는 저한테 맡겨요! 이번엔 아무도 못 지나가요. 헤, 근데 저 철문은 왜 손톱 자국이 있죠?',secret:'제가 쫓는 게 탈출한 개체인가요, 아니면... 따라 뛰고 있던 제가 개체인가요?',appearance:'높게 묶은 검은 포니테일, 근육이 잘 드러나는 실전 무도가 체형, 낡은 전투 조끼',personality:'쾌활한 열혈 여성 경비관. 먼저 움직이고 뒤늦게 공포를 알아차린다.'},
 deer:{title:'하린',post:'기록관',benefit:'시설 감염 -14 · ST +7 · 오늘의 탐사 오염 저감',first:'기록 정리 완료했습니다! 아, 잠깐... 이 서류는 제가 거꾸로 꽂았네요. 금방 고치겠습니다!',secret:'자꾸 글씨를 잘못 쓰네요. 이름 위에... 네 개의 발자국이 떠올라요. 제가 남긴 건가요?',appearance:'연갈색 긴 머리와 부드러운 웨이브, 작은 핀, 수수한 사무복과 기록용 단말',personality:'유능하고 다정하지만 가끔 덤벙대는 여성 기록관. 오류를 인정하고 바로 수습한다.'}
};
export type CrewMember={id:CrewId;arrivedDay:number;hp:number;mind:number;bond:number;lastSpokenDay:number};
export type CrewIncident={day:number;id:CrewId;damage:number;before:number;after:number;text:string};
export type CrewState={members:CrewMember[];supportDay:number;healingDay:number;guardDay:number;decontamDay:number;lastIncident:CrewIncident|null;incidentsSeen:string[]};
export const emptyCrew=():CrewState=>({members:[],supportDay:0,healingDay:0,guardDay:0,decontamDay:0,lastIncident:null,incidentsSeen:[]});
export function ensureCrew(s:V10):CrewState{
 const existing=s.crew;
 const crew:{[K in keyof CrewState]:CrewState[K]}={...emptyCrew(),...existing,members:existing?.members??[],incidentsSeen:existing?.incidentsSeen??[]};
 s.crew=crew;
 return crew;
}
export function isCrewId(id:AnimalId):id is CrewId{return CREW_IDS.includes(id as CrewId)}
/** Recruit a staff member ONLY when its original animal is transferred to HQ. */
export function recruitCrew(s:V10,id:AnimalId):boolean{
 if(!isCrewId(id))return false;
 const crew=ensureCrew(s);
 if(crew.members.some(m=>m.id===id)||crew.members.length>=4)return false;
 crew.members.push({id,arrivedDay:s.day,hp:85,mind:88,bond:45,lastSpokenDay:0});
 log(s,'본부 인력 등록 · 신경 세포 분화',`${CREW_PROFILES[id].post} ${CREW_PROFILES[id].title}이(가) 도착했습니다. 본부의 출생 기록은 기밀입니다.`,'mystery');
 return true;
}
export function crewDialog(s:V10,id:CrewId):{speaker:CrewId|'EVE'|'관리자';text:string}[]{
 const member=ensureCrew(s).members.find(m=>m.id===id);if(!member)return [];
 const profile=CREW_PROFILES[id];const days=Math.max(0,s.day-member.arrivedDay);
 const personal:Record<CrewId,[string,string,string]>={
  rabbit:['소독약 냄새가 잠깐 피 냄새처럼 느껴졌어요. 제가 과로했나 봐요.','복도에 작은 환자가 울고 있었어요. 분명 토끼였는데... 아이 이름을 불렀어요.','담당자님, 잠깐만 제 손을 잡아 주세요. 제 손이 자꾸 발처럼 접혀요.'],
  fox:['재고 장부에 제가 쓰지 않은 숫자가 있어요. 전부 4씩 늘어나네요.','문에 귀를 대면 밖에서 네 발로 걷는 소리가 들려요. 그런데 안쪽에서 들려요.','전 그 물건을 숨기지 않았어요. 제가 보급품이었나요? 선반 안에 있었나요?'],
  wolf:['경보가 울리면 몸이 먼저 뛰어요. 훈련 덕이라고 생각했는데...','어제 밤 CCTV에 제 뒷모습이 나왔어요. 저는 그때 여기 있었는데.','그만! 문 열지 마세요. 저걸 막으려던 게 아니에요. 제가 들어가려고 했어요.'],
  deer:['아침에 일지 한 장을 잘못 분류했어요. 기록은 이미 고쳤습니다!','실험실 이름을 읽는데 제 이름처럼 들렸어요. 손이 떨려서 종이를 떨어뜨렸어요.','기록이 맞지 않아요. 제가 적은 이름이 제 이름을 지워요. 저 아직 사람 맞죠?']
 };
 if(member.hp<=20||member.mind<=22)return [
  {speaker:id,text:personal[id][2]},
  {speaker:'EVE',text:`${profile.post} 생체 신호 위험. HP ${member.hp}, 정신 ${member.mind}. 야간의 인격 충돌과 우발 공격을 주의하십시오.`},
  {speaker:id,text:'제가 그러지 않았어요... 아니, 제가 그랬나요? 제 손이 기억을 못 해요.'}];
 if(s.headquarters.revealStage>=2||days>=12)return [
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
 if(!member||s.phase!=='day'||s.crew?.supportDay===s.day||member.hp<=12||member.mind<=12)return s;
 const n=copy(s) as V10;const crew=ensureCrew(n);const m=crew.members.find(x=>x.id===id)!;
 crew.supportDay=n.day;m.hp=cap(m.hp-4);m.mind=cap(m.mind-3);
 if(id==='rabbit'){n.hp=cap(n.hp+18);crew.healingDay=n.day;}
 if(id==='fox'){n.parts++;n.food++;n.credits+=30;}
 if(id==='wolf'){n.threat=cap(n.threat-13);crew.guardDay=n.day;}
 if(id==='deer'){n.infection=cap(n.infection-14);n.stamina=cap(n.stamina+7);crew.decontamDay=n.day;}
 log(n,`직원 지원 · ${CREW_PROFILES[id].post}`,`${CREW_PROFILES[id].benefit}. 대가: 직원 HP -4, 정신 -3`,'good');
 n.lastOutcome=`${CREW_PROFILES[id].title}의 ${CREW_PROFILES[id].post} 지원: ${CREW_PROFILES[id].benefit}`;
 return n;
}
/** Progressive deterioration. Early days are stable; prolonged duty and low vitals cause trouble. */
export function crewNight(s:V10):void{
 const crew=ensureCrew(s);
 crew.lastIncident=null;
 for(const m of crew.members){
  const days=s.day-m.arrivedDay;
  if(days<=3)continue;
  const drain=days>=14?5:days>=8?3:1;
  m.mind=cap(m.mind-drain-(s.infection>=65?2:0));
  if(days>=7)m.hp=cap(m.hp-(days>=14?3:1));
  if(m.hp<=25||m.mind<=28){
   const severe=m.hp<=16||m.mind<=17;
   if(!crew.lastIncident&&((s.day+CREW_IDS.indexOf(m.id)*2)%4===0||severe)){
    const before=s.hp;const damage=Math.min(before,severe?12:7);
    s.hp=cap(s.hp-damage);
    const text=`${CREW_PROFILES[m.id].post} ${CREW_PROFILES[m.id].title}이(가) 신경 혼란 중 담당자를 공격했습니다. HP ${before} → ${s.hp} (-${damage}).`;
    crew.lastIncident={day:s.day,id:m.id,damage,before,after:s.hp,text};
    crew.incidentsSeen.push(`${s.day}/${m.id}`);
    log(s,'직원 안전 사고 · 야간 침입',text,'bad');
   }
  }
 }
}
/** Archived actions have actual ethical weight; harm to an original specimen destabilizes the clones. */
export function crewDissectionShock(s:V10):void{
 const crew=ensureCrew(s);for(const m of crew.members){m.mind=cap(m.mind-9);}
 if(crew.members.length)log(s,'의무 기록 · 신경 혼란','해부 기록 이후 직원들의 신경 안정도가 일제히 떨어졌습니다.','bad');
}

export function treatCrew(s:V10,id:CrewId,kind:'medical'|'counsel'):V10{
 const member=s.crew?.members.find(m=>m.id===id);
 if(!member||s.phase!=='day'||s.ap<1||((kind==='medical')?s.medicine<1:s.knowledge<5))return s;
 const n=copy(s) as V10;const m=ensureCrew(n).members.find(a=>a.id===id)!;n.ap--;
 if(kind==='medical'){n.medicine--;m.hp=cap(m.hp+28);m.mind=cap(m.mind+5)}
 else{n.knowledge-=5;m.mind=cap(m.mind+23);m.hp=cap(m.hp+2)}
 log(n,`직원 관리 · ${CREW_PROFILES[id].post}`,`${kind==='medical'?'의약품 1개로 HP +28, 정신 +5':'지식 5점으로 정신 +23, HP +2'} 회복`,'good');
 n.lastOutcome=`${CREW_PROFILES[id].title}의 ${kind==='medical'?'생체 치료':'기억 안정 상담'} 완료`;
 return n;
}
