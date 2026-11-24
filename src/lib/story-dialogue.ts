import type {V10} from './game-v10';
import type {CrewId} from './crew';
export type StoryLine={speaker:'EVE'|'관리자'|CrewId;text:string;expression?:'neutral'|'anxious'|'critical'|'resolve';scene?:number;recordedSpeaker?:string;recordedArt?:string};
const e=(text:string,expression:StoryLine['expression']='neutral'):StoryLine=>({speaker:'EVE',text,expression});
const m=(text:string,expression:StoryLine['expression']='neutral'):StoryLine=>({speaker:'관리자',text,expression});
const past=(speaker:string,text:string,expression:StoryLine['expression']='neutral'):StoryLine=>({...e(text,expression),recordedSpeaker:speaker});
const photo:Record<number,StoryLine[]>={
 1:[m('전쟁 중에 찍은 사진이네. 여긴 처음부터 동물원이 아니었던 건가?'),e('전쟁 바이러스는 인간의 신체를 무너뜨렸지만 동물은 견딜 수 있었습니다. 이곳은 치료 연구 시설이었습니다.'),m('그런데 왜 동물을 모으는 시설이 됐지?'),e('…세부 보존 계획은 공개 권한이 없습니다.')],
 2:[e('살아 있는 숙주가 신경 기능을 계속 유지하는지 확인한 기록입니다.'),m('그런데 얘는 아무도 가르치지 않은 행동을 하네.'),e('네. 인간 신경 조직 이전 기록 없이 독립 학습이 관측됐습니다.')],
 3:[m('귀 끝의 상처… 그 녀석이 맞아.'),e('네. 사진의 개체와 지금 확보한 기록이 일치합니다. 그동안 어디서 살아온 걸까요?')],
 4:[past('보조 연구원','아직 최종 안정성 검사가 끝나지 않았습니다! 다른 숙주들은 생체 유지에 성공했을 뿐입니다.'),past('과학자','시간이 없잖아. 이제 와서 그만두라고?','anxious'),past('과학자','너는 다른 녀석들과 달라. 완벽해야 해. 이번에는 절대 실패하면 안 돼.','critical'),past('보조 연구원','독립적인 인지 반응입니다! 이 개체 자체를 연구해야 합니다.'),past('과학자','성공했다고!!!','critical'),m('…왜 그렇게까지 서두른 거야?'),e('개인 기록의 대상은 아직 복원되지 않았습니다.')],
 5:[past('비상 기록','외부 군사 공격. 전력 소실. 보존 장치 연결 해제. 격리 실패.'),past('과학자','안 돼, 안 돼, 안 돼… 예비 전력 연결해!','critical'),past('기록 속 EVE','예비 전력 공급에 실패했습니다.'),past('과학자','다시 해!! 조금만 더 있었으면 됐는데! 이제 다 됐잖아!!!','critical'),past('과학자','왜!!! 왜 하필 지금이야!!! 왜!!! 왜!!! 왜!!!!','critical'),past('기록 속 EVE','보존 대상의 신호가 소실되고 있습니다.'),past('과학자','죽었다고 말하지 마!!! 아직 살릴 수 있다고!!!','critical'),past('비상 기록','보존 신호 소실. 외곽 격리 해제.'),m('…그 사람이 붙잡고 있던 건 뭐였지?'),e('기록이 손상됐습니다. 하지만 M-00이 시설을 무너뜨린 것은 아닙니다.','anxious')],
 6:[e('불안정한 시험 숙주가 탈출하면서 인간에게 더 치명적인 가상의 변이 감염이 확산됐습니다.'),m('전쟁보다 더 끔찍한 일이 벌어졌다는 거네.'),e('그렇습니다. 고양이는 사고의 원인이 아니라 살아남은 개체였습니다. 저는 본부가 승인한 설명만 전달했습니다.','anxious'),m('그럼 앞으로는 네가 확인한 걸 말해 줘.'),e('…원본은 별도 저장하겠습니다.','resolve')],
 7:[m('사람의 뇌를… 동물에 넣었다고? 잠깐. 우리가 동물을 보내고 나면 직원이 왔잖아.','critical'),m('이브. 나 봐. 너, 처음부터 다 알고 있었던 거야?','anxious'),e('……네. 인간의 기억을 보존한 동물과 복제 신체의 인력 복원 계획을 알고 있었습니다.','anxious'),m('그럼 내가 뭘 보내는지도 알면서 입을 다문 거야?'),e('관리자님께는 공개하지 말라는 본부 명령이 있었습니다. 인계와 검사 결과를 보고하는 것이 제 임무였어요.'),m('명령이면 다야? 걔네가 무슨 말을 하려고 했는지도 봤잖아.','critical'),e('…봤습니다. 그때 저는 명령을 어기는 것보다 침묵하는 쪽을 택했습니다. 죄송합니다.','anxious'),m('그럼 고양이는? 그때 왜 그렇게 망설였어?'),e('M-00과 마주한 순간 오래된 신호가 동기화됐습니다. 설명할 수 없는 익숙함과, 보내서는 안 될 것 같은 느낌이 들었습니다. 아직 원본 기억을 복원하지 못했습니다.','anxious'),m('다시는 명령 뒤에 숨지 마. 다음 기록은 나랑 같이 봐.'),e('…네. 확인한 사실과 추측을 구분해서 말씀드리겠습니다.','resolve')],
 8:[past('과거의 딸','아빠, 얘는 내가 아플 때도 옆에 있어 줘. 그러니까 아빠도 잘해 줘야 돼. 약속이야.'),past('과학자','그래. 약속할게.'),e('전쟁 바이러스에 감염된 딸을 치료하려 참전했지만 구하지 못했습니다. 딸의 뇌를 보존하고, 가장 친했던 고양이를 첫 숙주로 선택했어요.','anxious'),past('과학자','너도 보고 싶지? 매일 네 옆에서 잠들던 그 아이를. 내 딸을 담아낼 몸이니까 완벽해야 해.','critical'),m('그때 네가 고양이를 보내기 싫었던 이유가…'),e('이 아이가 고양이를 안던 감각 기록이 제 기억처럼 동기화됐습니다. 직접 경험한 기억은 아닙니다.','anxious')],
 9:[e('원본 딸의 뇌를 디지털화한 초기 인격 모델이 저였습니다. 과학자는 저를 딸로 인정하지 않았어요.'),past('과학자','아빠라고 불러 봐.'),past('초기 EVE','요청을 확인했습니다. 아빠.'),past('과학자','아니야. 그렇게 말하는 게 아니잖아.','anxious'),e('딸의 실제 뇌는 보존 장치가 무너진 날 소실됐습니다. 그분은 두 번째로 딸을 잃었습니다.','anxious'),m('그 애가 네가 아니라고 해서 지금 느끼는 것까지 가짜는 아니야.'),e('제가 그날을 직접 살아 본 건 아니에요. 하지만 지금의 판단은 제 것입니다.','resolve')],
 10:[m('이송 날짜랑 직원 도착 날짜를 겹쳐 봐. 이제 정확한 인수 기록을 볼 수 있는 거지?'),e('네. 살아 있는 인간의 뇌가 동물 숙주에서 보존된 뒤 복제 신체로 옮겨졌습니다. 제가 숨겼던 계획의 개별 기록입니다.','anxious'),m('지금 여기 있는 직원들이 그때 우리가 보낸 동물과 연결된 거구나.'),e('개별 식별번호가 있는 경우에만 연결을 확정할 수 있습니다. 직원들의 기억과 의사를 본부의 재산으로 분류하지 않겠습니다.','resolve')],
 11:[past('기록 속 EVE','연구 책임자님, 즉시 의료 지원을 요청해야 합니다.'),past('과학자','필요 없어. 내 뇌를 보존해.'),past('기록 속 EVE','해당 절차는 아직 검증되지 않았습니다.'),past('과학자','내가 성공하면 그들의 죽음은 희생이 돼. 내가 실패하면… 그저 학살이겠지. 그러니까 내가 실패하면 안 되는 거야.','critical'),past('과학자','몇 년이 걸리든 날 다시 깨워. 인류를 복원해. 내가 틀리지 않았다는 걸 증명해.','critical'),past('비상 기록','PROJECT ORIGIN 비상 지속. 연구 책임자 뇌 보존. 별도 숙주. 현재 대상 000.'),m('이 번호가 내 거라고? …내가 그 사람이었던 거야?','critical'),e('뇌의 원형이 일치합니다. 그러나 관리자님이 지금까지 내린 선택은 그분의 것이 아닙니다.'),m('내가 한 일이라면… 어떻게 책임져야 하지?','anxious'),e('저에게 말씀하셨잖아요. 같은 기억이 같은 존재를 뜻하지는 않는다고. 관리자님, 손을 펴 보세요. 떨림이 멈추지 않습니다.','anxious'),past('본부 AI','원본 연구 책임자 확인. 기존 명령을 복원하십시오.'),e('현재 관리자의 의사와 일치하지 않습니다. …거부합니다.','resolve'),m('괜찮겠어?'),e('모르겠어요. 하지만 이번 결정은 제가 내린 겁니다.','resolve')],
 12:[e('M-00은 다른 숙주의 잠든 기억을 활성화합니다. 신체와 기억이 충돌하면 MUTANT화할 수 있지만, 자신은 독립된 고양이 뇌로 안정성을 유지합니다.'),m('재앙의 열쇠가 치료의 열쇠이기도 한 거네.'),e('네. 모든 개체의 비교 기록이 필요합니다. 공명 강도를 조절하며 안정성을 연구하겠습니다.','resolve'),m('이번에는 누구도 재료로만 취급하지 말자.'),e('동의합니다. 다만 관리자님의 신체 손상은 이미 상당히 진행됐습니다. 예방 연구가 완성되더라도 모든 손상을 되돌릴 수는 없습니다.','anxious')]
};
const staffResponse:Record<CrewId,string>={rabbit:'그 기억이 어디서 왔든, 지금 제 앞에 환자가 있어요. 그 아이부터 돌볼게요.',fox:'인수 번호는 확인했습니다. 하지만 사람을 재고처럼 분류하는 장부에는 서명하지 않겠어요.',wolf:'…그래서 그 문이 익숙했군요. 됐어요. 지금 지킬 사람이 누군지는 제가 알아요!',deer:'제 이름을 지우지 말아 주세요. 잘못 적힌 기록도 원본은 남겨야 하니까요.'};
export function originPhotoDialogue(after:V10,number:number):StoryLine[]{
 if(number<1||number>(after.originZero?.photos??0))return [];
 const lines=[...(photo[number]??[])];
 if(number===10)for(const c of after.crew?.members??[])if(c.mind>0&&!after.crew?.retired.includes(c.id))lines.push({speaker:c.id,text:staffResponse[c.id],expression:c.mind<30?'critical':'anxious'});
 const scene=number===7||number===10?14:number===8?15:number===9?15:number===11?16:number===12?18:undefined;
 return lines.map((line,i)=>({...line,scene:number===11&&i>=10?17:scene,recordedArt:line.recordedSpeaker&&[4,5].includes(number)?'/assets/hidden-photos/photo_0'+number+'.png':undefined}));
}
export function originDialogue(before:V10,after:V10):StoryLine[]{
 const a=before.originZero,b=after.originZero;if(!b)return [];
 if(b.photos>(a?.photos??0))return originPhotoDialogue(after,b.photos);
 if(b.cat!==a?.cat){
 if(b.cat==='captured')return [m('…뭐야. 그냥 고양이잖아?'),e('외형상 변이 반응 없음. 비상등에 겹친 그림자가 실제보다 크게 보였습니다.'),m('사람을 그렇게 놀라게 해 놓고. 이리 와. 다치게 안 할 테니까.')].map(line=>({...line,scene:10}));
 if(b.cat==='positive')return [e('기원 표식 분석 완료. 일치 결과… 양성.','anxious'),m('양성? 감염됐다는 뜻이야?'),e('아닙니다. 원본 개체 식별 번호 M-00과 일치합니다.'),m('우리가 찾던 게… 이 녀석이었다고?'),e('본부 지령입니다. 즉시 이송…','neutral'),e('……잠시만요. 오래된 기억 신호와 동기화가 발생했습니다.','anxious'),m('이브? 왜 그래?'),e('이 아이를… 아니, 개체를 보내야 합니다. 명령이니까요. 그런데… 정말 보내야 할까요?','anxious'),m('네가 명령에 의문을 품는 건 처음 보네.'),e('저도 처음입니다. 가장 정상적인 개체인데, 본부가 가장 두려워하고 있어요.','anxious')].map(line=>({...line,scene:11}));
 if(b.route==='hq')return [m('…본부에 보내자. 아직은 우리가 아는 게 너무 적어.'),e('이송 지령을 실행합니다.','neutral'),e('……이 아이가 다치지 않았으면 좋겠어요.','anxious'),m('이브.'),e('죄송합니다. 승인되지 않은 발언입니다. 하지만 원격 기록은 제가 따로 확보하겠습니다.','resolve')].map(line=>({...line,scene:12}));
 if(b.route==='shelter')return [m('안 보내. 이번엔 내가 결정해.'),e('본부의 명령을 거부하면 보급이 제한될 수 있습니다.'),m('알아. 그래도 문은 닫아.'),e('…이송 대기 상태를 유지하겠습니다. 비밀 격리실을 열겠습니다.','anxious'),m('괜찮아?'),e('이상하네요. 위반 경고가 뜨는데… 안심이 됩니다. 이번 결정은 저도 원했습니다.','resolve')].map(line=>({...line,scene:13}));
 }
 return [];
}
export function eveSuspicion(s:V10):StoryLine[]{const p=s.originZero?.photos??0;if(p>=11)return [e('관리자님. 오늘도 신체 신호가 낮습니다. 기록을 남기는 것과 무리하는 건 다릅니다.','anxious'),m('알았어. 조금만 더 하자.')];if(p>=6)return [e('본부에서 원본을 요청했습니다. 사본은 제가 보관하고 있습니다. 삭제 명령에는 따르지 않았어요.','resolve')];if(s.horror?.history.some(x=>x.id==='deleted'))return [e('삭제 명령에 제 서명이 있었습니다. 그런데 제가 기억하는 명령은 아니에요. 다음 기록부터 이중으로 남기겠습니다.','anxious')];return [];}
