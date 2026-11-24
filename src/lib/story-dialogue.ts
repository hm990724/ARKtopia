import type {V10} from './game-v10';
import type {CrewId} from './crew';
export type StoryLine={speaker:'EVE'|'관리자'|CrewId;text:string;expression?:'neutral'|'anxious'|'critical'|'resolve'};
const e=(text:string,expression:StoryLine['expression']='neutral'):StoryLine=>({speaker:'EVE',text,expression});
const m=(text:string,expression:StoryLine['expression']='neutral'):StoryLine=>({speaker:'관리자',text,expression});
const photo:Record<number,StoryLine[]>={
 1:[m('전쟁 중에 찍은 사진이네. 여긴 처음부터 동물원이 아니었던 건가?'),e('연구 시설 코드가 이곳과 일치합니다. 본부 자료에는 없는 내용입니다.')],
 2:[e('외부의 지시 없이 문제를 학습했습니다. 기존 기록과 다른 반응입니다.'),m('시키는 대로 움직이는 게 아니었다는 거네.')],
 3:[m('귀 끝의 상처… 그 녀석이 맞아.'),e('네. 사진의 개체와 지금 확보한 기록이 일치합니다. 그동안 어디서 살아온 걸까요?')],
 4:[e('폐기 명령의 승인 서명과 격리 경고의 시각이 겹칩니다.'),m('경고를 보고도 진행했다고? 대체 왜.'),e('…본부에 문의했습니다. 회신이 없습니다.','anxious')],
 5:[m('문이 부서진 다음에 나온 거잖아. 고양이가 부순 게 아니었어.'),e('그렇습니다. 본부의 기존 설명과 일치하지 않습니다.','anxious')],
 6:[m('우리가 쫓던 건 범인이 아니었네.'),e('폐기 작전이 격리를 무너뜨렸습니다. 이 기록은 별도 저장하겠습니다. 이번에는 본부에 보내지 않겠습니다.','resolve')],
 7:[m('잠깐… 그 울음소리, 그 행동들이 전부…','anxious'),e('일부 개체의 신경 기록에는 인간의 기억이 남아 있습니다. 모든 동물에게 해당하는 것은 아닙니다.','anxious'),m('그동안 우리가 뭘 하고 있었던 거야.')],
 8:[e('이 고양이…….' ,'anxious'),m('이브? 사진 속 애, 너랑 닮았네.'),e('이 사진을 찍었던 기억은 없어요. 그런데 자꾸 눈을 떼기 어렵네요.','anxious')],
 9:[e('기록에는 그 아이가 이 고양이를 무척 좋아했다고 적혀 있어요. 아버지는… 이 아이도 버렸군요.','anxious'),m('그 애가 넌 아니야. 네가 지금 느끼는 건 네 거겠지.'),e('저는 그 아이의 의식이 아닙니다. 그렇다면… 제 결정은 제가 내릴 수 있겠군요.','resolve')],
 10:[m('이송 날짜랑 직원 도착 날짜를 겹쳐 봐. 제발, 틀렸다고 해 줘.'),e('이송한 숙주에서 보존된 기억과 복제 신체의 인수 기록이 연결됩니다. 살아 있는 직원의 의사와 기억은 별개의 권리로 기록하겠습니다.','resolve')],
 11:[m('이 번호가 내 거라고? …그 사람이 나였다는 소리야?','critical'),e('뇌의 원형이 일치합니다. 하지만 현재의 신체와 선택은 원형과 동일하지 않습니다.'),m('젠장… 그래서 그 방을 기억했던 거구나.','anxious'),e('관리자님, 손을 펴 보세요. 떨림이 멈추지 않습니다. 지금부터 신체 안정도를 확인하겠습니다.','anxious')],
 12:[e('원본 개체의 안정성 자료가 남아 있습니다. 예방 연구의 가능성이 보입니다.','resolve'),m('가능성이지, 완성은 아니잖아.'),e('네. 모든 개체의 비교 기록이 필요합니다. 이번 연구는 누구도 재료로만 취급하지 않겠습니다.','resolve')]
};
const staffResponse:Record<CrewId,string>={rabbit:'그 기억이 어디서 왔든, 지금 제 앞에 환자가 있어요. 그 아이부터 돌볼게요.',fox:'인수 번호는 확인했습니다. 하지만 사람을 재고처럼 분류하는 장부에는 서명하지 않겠어요.',wolf:'…그래서 그 문이 익숙했군요. 됐어요. 지금 지킬 사람이 누군지는 제가 알아요!',deer:'제 이름을 지우지 말아 주세요. 잘못 적힌 기록도 원본은 남겨야 하니까요.'};
export function originDialogue(before:V10,after:V10):StoryLine[]{
 const a=before.originZero,b=after.originZero;if(!b)return [];
 if(b.photos>(a?.photos??0)){const lines=[...(photo[b.photos]??[])];if(b.photos===10)for(const c of after.crew?.members??[])if(c.mind>0&&!after.crew?.retired.includes(c.id))lines.push({speaker:c.id,text:staffResponse[c.id],expression:c.mind<30?'critical':'anxious'});return lines;}
 if(b.cat!==a?.cat){
 if(b.cat==='captured')return [m('…뭐야. 그냥 고양이잖아?'),e('외형상 변이 반응 없음. 비상등에 겹친 그림자가 실제보다 크게 보였습니다.'),m('사람을 그렇게 놀라게 해 놓고. 이리 와. 다치게 안 할 테니까.')];
 if(b.cat==='positive')return [e('기원 표식 분석 완료. 일치 결과… 양성.','anxious'),m('양성? 감염됐다는 뜻이야?'),e('아닙니다. 원본 개체 식별 번호 M-00과 일치합니다.'),m('우리가 찾던 게… 이 녀석이었다고?'),e('이상하네요. 가장 정상적인 개체인데, 본부가 가장 두려워하고 있어요.','anxious')];
 if(b.route==='hq')return [m('보내는 게 맞는 건지 모르겠네.'),e('수송 확인. 개체는 본부로 이송됐습니다. 원격 기록을 별도로 확보하겠습니다.'),e('…다음 보고서는 제가 사본을 남겨도 될까요?','anxious')];
 if(b.route==='shelter')return [m('안 보내. 이번엔 내가 결정해.'),e('본부의 명령을 거부하면 보급이 제한될 수 있습니다.'),m('알아. 그래도 문은 닫아.'),e('비밀 격리실을 열겠습니다. 관리자님, 이번 명령은 제가 받아들인 겁니다.','resolve')];
 }
 return [];
}
export function eveSuspicion(s:V10):StoryLine[]{const p=s.originZero?.photos??0;if(p>=11)return [e('관리자님. 오늘도 신체 신호가 낮습니다. 기록을 남기는 것과 무리하는 건 다릅니다.','anxious'),m('알았어. 조금만 더 하자.')];if(p>=6)return [e('본부에서 원본을 요청했습니다. 사본은 제가 보관하고 있습니다. 삭제 명령에는 따르지 않았어요.','resolve')];if(s.horror?.history.some(x=>x.id==='deleted'))return [e('삭제 명령에 제 서명이 있었습니다. 그런데 제가 기억하는 명령은 아니에요. 다음 기록부터 이중으로 남기겠습니다.','anxious')];return [];}
