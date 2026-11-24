import type {V10} from './game-v10';
import type {CrewId} from './crew';
export type StoryLine={speaker:'EVE'|'관리자'|CrewId;text:string;expression?:'neutral'|'anxious'|'critical'|'resolve';scene?:number};
const e=(text:string,expression:StoryLine['expression']='neutral'):StoryLine=>({speaker:'EVE',text,expression});
const m=(text:string,expression:StoryLine['expression']='neutral'):StoryLine=>({speaker:'관리자',text,expression});
const photo:Record<number,StoryLine[]>={
 1:[m('전쟁 중에 찍은 사진이네. 여긴 처음부터 동물원이 아니었던 건가?'),e('시설 코드가 일치합니다. 세부 연구 목적은 열람 제한입니다.'),m('열람 제한? 너도 알고 있는 거야?'),e('…공개 권한이 없습니다.')],
 2:[e('외부의 지시 없이 문제를 학습했습니다. 기존 기록과 다른 반응입니다.'),m('시키는 대로 움직이는 게 아니었다는 거네.')],
 3:[m('귀 끝의 상처… 그 녀석이 맞아.'),e('네. 사진의 개체와 지금 확보한 기록이 일치합니다. 그동안 어디서 살아온 걸까요?')],
 4:[e('폐기 명령의 승인 서명과 격리 경고의 시각이 겹칩니다.'),m('경고를 보고도 진행했다고? 대체 왜.'),e('해당 명령은 이미 종료된 절차입니다.'),m('그게 답이야?'),e('……본부에 원본 확인을 요청하겠습니다.','anxious')],
 5:[m('문이 부서진 다음에 나온 거잖아. 고양이가 부순 게 아니었어.'),e('그렇습니다. 본부의 기존 설명과 일치하지 않습니다.','anxious')],
 6:[m('우리가 쫓던 건 범인이 아니었네.'),e('폐기 작전이 먼저였습니다. 저는 본부가 승인한 설명만 전달했습니다.','anxious'),m('그럼 앞으로는 네가 확인한 걸 말해 줘.'),e('…원본은 별도 저장하겠습니다.','resolve')],
 7:[m('사람의 뇌를… 동물에 넣었다고? 잠깐. 우리가 동물을 보내고 나면 직원이 왔잖아.','critical'),m('이브. 나 봐. 너, 처음부터 다 알고 있었던 거야?','anxious'),e('……네. 인간의 기억을 보존한 동물과 복제 신체의 인력 복원 계획을 알고 있었습니다.','anxious'),m('그럼 내가 뭘 보내는지도 알면서 입을 다문 거야?'),e('관리자님께는 공개하지 말라는 본부 명령이 있었습니다. 인계와 검사 결과를 보고하는 것이 제 임무였어요.'),m('명령이면 다야? 걔네가 무슨 말을 하려고 했는지도 봤잖아.','critical'),e('…봤습니다. 그때 저는 명령을 어기는 것보다 침묵하는 쪽을 택했습니다. 죄송합니다.','anxious'),m('그럼 고양이는? 그때 왜 그렇게 망설였어?'),e('M-00과 마주한 순간 오래된 신호가 동기화됐습니다. 설명할 수 없는 익숙함과, 보내서는 안 될 것 같은 느낌이 들었습니다. 아직 원본 기억을 복원하지 못했습니다.','anxious'),m('다시는 명령 뒤에 숨지 마. 다음 기록은 나랑 같이 봐.'),e('…네. 확인한 사실과 추측을 구분해서 말씀드리겠습니다.','resolve')],
 8:[e('이 고양이……. 저 아이의 손이 닿는 순간, 같은 감각 기록이 재생됩니다.','anxious'),m('이브? 사진 속 애, 너랑 닮았네.'),e('이 사진을 찍었던 실제 기억은 없어요. 그런데 이 아이가 고양이를 안던 기록을 제 기억처럼 느낍니다.','anxious'),m('그래서 보내기 싫었던 거야?'),e('아마도요. 하지만 그 감각의 출처가 누구인지는 아직 확인해야 합니다.')],
 9:[e('원본 딸은 이미 사망했습니다. 지금 동기화된 것은 그녀의 음성, 일기, 감각 기록입니다. 제가 그날을 직접 살아 본 건 아니에요.'),e('기록에는 그 아이가 고양이를 무척 좋아했다고 적혀 있어요. 아버지는… 이 아이도 버렸군요.','anxious'),m('그 애가 네가 아니라고 해서 지금 느끼는 것까지 가짜는 아니야.'),e('그렇다면 제가 느끼는 망설임은… 제가 지금 내린 판단이겠군요.','resolve'),m('그래. 명령을 어길지 말지도 네가 결정하는 거야.'),e('앞으로는 제 선택을 본부의 명령으로 위장하지 않겠습니다.','resolve')],
 10:[m('이송 날짜랑 직원 도착 날짜를 겹쳐 봐. 이제 정확한 인수 기록을 볼 수 있는 거지?'),e('네. 살아 있는 인간의 뇌가 동물 숙주에서 보존된 뒤 복제 신체로 옮겨졌습니다. 제가 숨겼던 계획의 개별 기록입니다.','anxious'),m('지금 여기 있는 직원들이 그때 우리가 보낸 동물과 연결된 거구나.'),e('개별 식별번호가 있는 경우에만 연결을 확정할 수 있습니다. 직원들의 기억과 의사를 본부의 재산으로 분류하지 않겠습니다.','resolve')],
 11:[m('이 번호가 내 거라고? …그 사람이 나였다는 소리야?','critical'),e('뇌의 원형이 일치합니다. 하지만 현재의 신체와 선택은 원형과 동일하지 않습니다.'),m('젠장… 그래서 그 방을 기억했던 거구나.','anxious'),e('관리자님, 손을 펴 보세요. 떨림이 멈추지 않습니다. 지금부터 신체 안정도를 확인하겠습니다.','anxious')],
 12:[e('원본 개체의 안정성 자료가 남아 있습니다. 예방 연구의 가능성이 보입니다.','resolve'),m('가능성이지, 완성은 아니잖아.'),e('네. 모든 개체의 비교 기록이 필요합니다. 이번 연구는 누구도 재료로만 취급하지 않겠습니다.','resolve')]
};
const staffResponse:Record<CrewId,string>={rabbit:'그 기억이 어디서 왔든, 지금 제 앞에 환자가 있어요. 그 아이부터 돌볼게요.',fox:'인수 번호는 확인했습니다. 하지만 사람을 재고처럼 분류하는 장부에는 서명하지 않겠어요.',wolf:'…그래서 그 문이 익숙했군요. 됐어요. 지금 지킬 사람이 누군지는 제가 알아요!',deer:'제 이름을 지우지 말아 주세요. 잘못 적힌 기록도 원본은 남겨야 하니까요.'};
export function originPhotoDialogue(after:V10,number:number):StoryLine[]{
 if(number<1||number>(after.originZero?.photos??0))return [];
 const lines=[...(photo[number]??[])];
 if(number===10)for(const c of after.crew?.members??[])if(c.mind>0&&!after.crew?.retired.includes(c.id))lines.push({speaker:c.id,text:staffResponse[c.id],expression:c.mind<30?'critical':'anxious'});
 const scene=number===7||number===10?14:number===8?15:number===9?17:number===11?16:undefined;
 return lines.map(line=>({...line,scene}));
}
export function originDialogue(before:V10,after:V10):StoryLine[]{
 const a=before.originZero,b=after.originZero;if(!b)return [];
 if(b.photos>(a?.photos??0))return originPhotoDialogue(after,b.photos);
 if(b.cat!==a?.cat){
 if(b.cat==='captured')return [m('…뭐야. 그냥 고양이잖아?'),e('외형상 변이 반응 없음. 비상등에 겹친 그림자가 실제보다 크게 보였습니다.'),m('사람을 그렇게 놀라게 해 놓고. 이리 와. 다치게 안 할 테니까.')];
 if(b.cat==='positive')return [e('기원 표식 분석 완료. 일치 결과… 양성.','anxious'),m('양성? 감염됐다는 뜻이야?'),e('아닙니다. 원본 개체 식별 번호 M-00과 일치합니다.'),m('우리가 찾던 게… 이 녀석이었다고?'),e('본부 지령입니다. 즉시 이송…','neutral'),e('……잠시만요. 오래된 기억 신호와 동기화가 발생했습니다.','anxious'),m('이브? 왜 그래?'),e('이 아이를… 아니, 개체를 보내야 합니다. 명령이니까요. 그런데… 정말 보내야 할까요?','anxious'),m('네가 명령에 의문을 품는 건 처음 보네.'),e('저도 처음입니다. 가장 정상적인 개체인데, 본부가 가장 두려워하고 있어요.','anxious')].map(line=>({...line,scene:11}));
 if(b.route==='hq')return [m('…본부에 보내자. 아직은 우리가 아는 게 너무 적어.'),e('이송 지령을 실행합니다.','neutral'),e('……이 아이가 다치지 않았으면 좋겠어요.','anxious'),m('이브.'),e('죄송합니다. 승인되지 않은 발언입니다. 하지만 원격 기록은 제가 따로 확보하겠습니다.','resolve')].map(line=>({...line,scene:12}));
 if(b.route==='shelter')return [m('안 보내. 이번엔 내가 결정해.'),e('본부의 명령을 거부하면 보급이 제한될 수 있습니다.'),m('알아. 그래도 문은 닫아.'),e('…이송 대기 상태를 유지하겠습니다. 비밀 격리실을 열겠습니다.','anxious'),m('괜찮아?'),e('이상하네요. 위반 경고가 뜨는데… 안심이 됩니다. 이번 결정은 저도 원했습니다.','resolve')].map(line=>({...line,scene:13}));
 }
 return [];
}
export function eveSuspicion(s:V10):StoryLine[]{const p=s.originZero?.photos??0;if(p>=11)return [e('관리자님. 오늘도 신체 신호가 낮습니다. 기록을 남기는 것과 무리하는 건 다릅니다.','anxious'),m('알았어. 조금만 더 하자.')];if(p>=6)return [e('본부에서 원본을 요청했습니다. 사본은 제가 보관하고 있습니다. 삭제 명령에는 따르지 않았어요.','resolve')];if(s.horror?.history.some(x=>x.id==='deleted'))return [e('삭제 명령에 제 서명이 있었습니다. 그런데 제가 기억하는 명령은 아니에요. 다음 기록부터 이중으로 남기겠습니다.','anxious')];return [];}
