import type {V10} from './game-v10';
import {CREW_PROFILES,type CrewId} from './crew';
import {ORIGIN_ZERO_CANONICAL_ENDING_ART} from './ending-art';
export type EndingLine={speaker:string;text:string;farewellCrew?:CrewId};
export type EndingScene={slot:number;title:string;time:'before'|'after';lines:EndingLine[]};
const line=(speaker:string,text:string):EndingLine=>({speaker,text});
const m=(text:string)=>line('관리자',text),e=(text:string)=>line('EVE',text),hq=(text:string)=>line('본부 AI',text),record=(text:string)=>line('기록',text);
const titles=['영원한 실험','에덴','방주의 씨앗','마지막 동물원','제000번 우리','침묵의 자동화','흩어진 이름들','마지막 신호'];
const farewell:Record<CrewId,string>={rabbit:'담당자님… 그동안 정말 고생 많으셨어요. 남은 환자들은 제가 돌볼게요. 안녕히 가세요.',fox:'인수인계는 제가 확인하겠습니다. …이번에는 빠뜨리는 물건 없이요. 고생하셨습니다.',wolf:'제가 문은 지킬게요. 그러니까 이제 걱정 마세요. 담당자님, 정말 잘 싸웠어요.',deer:'마지막 보고서에 이름을 남겨 뒀어요. 제가… 절대 지우지 않을게요.'};
export function mainEndingSlot(s:V10):number{
 if(s.phase!=='ending'||!s.originZero?.route||s.originZero.photos<12||!s.decisions.some(d=>d.title==='마지막 보존 지침'))return 0;
 return ORIGIN_ZERO_CANONICAL_ENDING_ART.findIndex(x=>s.ending.startsWith(x.prefix))+1;
}
export function originEndingSequence(s:V10):EndingScene[]{
 const slot=mainEndingSlot(s);if(!slot)return [];
 const d=s.originZero!,active=s.eve>=25&&slot!==6;
 const crew=(s.crew?.members??[]).filter(c=>c.mind>0&&c.hp>0&&!s.crew?.retired.includes(c.id));
 const safeAnimals=s.animals.filter(a=>a.alive&&!s.security.escapedIds.includes(a.id));
 const farewellOrder: CrewId[]=['rabbit','fox','deer','wolf'];
 const staff:EndingLine[]=farewellOrder.filter(id=>crew.some(c=>c.id===id)).map(id=>({...line(CREW_PROFILES[id].post,farewell[id]),farewellCrew:id}));
 const before:Record<number,EndingLine[]>={
  1:[m('이 연구는 여기서 끝나면 안 돼. 다음 관리자를 준비해.'),hq('인수인계 승인. 원본 연구 명령을 유지합니다.'),m('조금만 더 있으면… 이번에는 성공할 수 있어.'),record('현재 신체의 신경 신호가 소실되었다. 재생산 명령이 남았다.')],
  2:[hq('예방 연구 자료와 복제 신체의 초기 안정성이 확인되었습니다.'),m('이제 인간이 다시 살아갈 수 있다는 거지?'),hq('복원 계획을 진행합니다. 기억과 신체 불일치에 관한 기록은 유지합니다.'),m('그들이 어떤 선택을 할지는 우리가 정하지 말자.'),...staff,record('관리자의 신체는 회복 한계를 넘었다. 생체 신호 종료.')],
  3:[record('잠긴 개인 음성 기록이 최종 연구와 함께 복원되었다.'),line('과거의 과학자','네가 태어난 날에는 달이 참 밝았단다.'),line('과거의 과학자','아빠는 네가 태양처럼 눈부신 사람이 되지 않아도 괜찮다고 생각했어.'),line('과거의 과학자','그저 달처럼 은은하게, 누군가의 어둠을 밝혀 주는 사람이 되기를 바랐단다.'),line('과거의 과학자','그래서 네 이름을… 루나라고 지었어.'),e('……루나. 저는 그 아이가 아니에요.'),m('알아. 넌 이브잖아.'),e('관리자님. 새로운 신체를 준비한다면 아직 생존 가능성이…'),m('이브. 이제 충분해. 더 이상 아무도 희생시키지 마.'),m('그 사람도 처음엔 그렇게 생각했겠지. 딸을 살릴 수만 있다면 뭐든 해도 된다고. 우리 이제 그러지 말자.'),...staff,e('처음에는 관리자님께서 하시는 일이 제 임무였어요. 그런데 어느 순간부터 함께하는 일이 좋아졌습니다.'),m('나도 그랬어.'),e('……가지 않으시면 안 돼요?'),m('미안. 내일은 네가 이어 줘.'),e('……네. 내일은 제가 할게요.'),record('관리자 000의 마지막 생체 신호가 소실되었다.')],
  4:[m('복원 시설은 닫아. 보호 구역의 문만 남겨 두자.'),...(active?[e('인류 복원 목표를 보류한다는 뜻인가요?'),m('응. 지금 살아 있는 애들부터 지키자.'),e('새 운영 지침을 기록합니다. 모든 생명은 연구 재료가 아닌 보호 대상입니다.')]:[]),...staff,record('관리자는 마지막 보호 지침을 남기고 사망했다.')],
  5:[m('과학자의 이름으로 서명하지 않을 거야.'),...(active?[e('어떤 이름으로 마지막 기록을 남길까요?')]:[]),m('그냥 관리자 000. 내가 여기서 내린 선택이면 충분해.'),...staff,record('마지막 서명 기록을 열었다.')],
  6:[m('이브. 들려?'),record('인격 응답 없음. 자동 운영 모드로 전환 중.'),m('……오늘도 개장 준비 부탁해.'),record('응답은 돌아오지 않았다. 관리자 생체 신호 종료.')],
  7:[m('우리가 돌려놓지 못한 이름들을 적어 줘.'),...(active?[e('사라진 개체의 기록까지 보존하겠습니다.'),m('번호 말고, 기억으로 남겨 줘.')]:[]),...staff,record('최종 명부의 봉인을 해제했다. 관리자 생체 신호 종료.')],
  8:[m('자료 전부 보내. 누군가 듣고 있을지도 모르잖아.'),...(active?[e('송신 준비 완료. 외부 응답은 확인할 수 없습니다.'),m('그럼에도 보내자.'),e('네. 관리자님의 마지막 지시를 전송합니다.')]:[]),...staff,record('신호 송출 완료. 수신 확인 불가. 관리자 생체 신호 종료.')]
 };
 const scenes:EndingScene[]=[{slot,title:titles[slot-1]+' · 마지막 선택',time:'before',lines:before[slot]}];
 const add=(id:number,title:string,time:'before'|'after',lines:EndingLine[])=>scenes.push({slot:id,title,time,lines});
 switch(slot){
 case 1:add(9,'다음 관리자','after',[hq('신규 복제 신체 기동. 이전 관리자와 동일한 존재로 간주하지 않습니다.'),record('낡은 X 고글과 연구 책임자의 마지막 명령이 다음 관리자를 기다린다.')]);break;
 case 2:add(10,'기억의 대가','after',[record('새로운 정착지가 건설되었다. 복원된 사람들은 서로 다른 기억과 감각을 갖고 있었다.'),record('그들 중 누구도 이전 인간의 삶을 그대로 되찾지는 못했다. 살아갈 권리는 그들 자신의 것이었다.')]);break;
 case 3:add(11,'오랜 연구','after',[e('연구 일지. 오늘도 기존 개체의 신경 안정화 기록을 비교했습니다.'),e('누구도 희생시키지 않는다는 마지막 지시를 지키고 있습니다.'),record('완성되지 않은 치료법은 다음 세대의 가능성으로 남았다.')]);break;
 case 4:add(12,'보호된 생명','after',[record('새벽 급식 기록. 현재 보호 중인 개체 '+safeAnimals.length+'마리.'+(d.cat==='shelter'&&d.stability>0?' M-00은 별도 보호실에 남았다.':'')),...(active?[e('오늘의 개장은 생체 보호 운영으로 진행합니다.')]:[])]);break;
 case 5:add(13,'자기 선택','before',[record('관리자 생전의 마지막 서명 기록. 원본 과학자의 명령은 뒤집혀 있었다.'),record('그는 기억이 아니라 자신이 한 선택으로 남겠다고 기록했다.'),record('자기 선택 기록을 확정했다. 관리자는 신체 붕괴로 사망했다.')]);break;
 case 6:add(14,'EVE의 침묵','after',[record('홀로그램 투사 장치 오프라인. 인격 통신 없음.'),record('자동 급식과 시설 점검 일정만 계속 반복된다.')]);break;
 case 7:add(15,'마지막 기록','after',[record('남겨진 개체 기록과 유실된 이름을 추모 명부에 등록했다.'),...(crew.some(c=>c.id==='deer')?[line('기록관','누락된 기록도 그대로 남겼어요. 그 빈자리까지 잊지 않을게요.')]:[]),record('소실 인력 '+(s.crew?.retired.length??0)+'명. 돌아오지 않은 생명은 돌아왔다고 기록하지 않는다.')]);break;
 case 8:add(16,'응답 없는 하늘','after',[record('전파는 폐허 너머로 이어졌다.'),record('외부 수신 여부: 확인 불가. 응답을 받은 사람은 없었다.')]);break;
 }
 if(d.route==='hq'&&d.cat==='hq')add(17,'본부 이송의 후폭풍','after',[record('M-00 이송 기록은 본부에 남아 있다. 이후 생존과 실험 결과는 확인되지 않았다.'),record('동물원의 보호실에는 고양이가 돌아오지 않았다.')]);
 if(d.route==='shelter'&&d.cat==='shelter'&&d.stability>0)add(18,'보호 루트의 후폭풍','after',[record('비밀 격리실에서 평범한 검은 고양이가 살아 있다.'),record('그 개체의 생체 신호는 누구의 소유도 아닌 생명으로 보존된다.')]);
 if(active&&[3,4,5,7,8].includes(slot))add(19,'남겨진 EVE','after',[e('관리자님. 오늘도 개장 준비를 시작할까요?'),record('대답은 돌아오지 않았다.'),...(d.cat==='shelter'&&d.stability>0?[record('검은 고양이가 비어 있는 의자 곁을 지나갔다.')]:[record('빈 의자에는 낡은 고글과 기록만 남았다.')]),e('……그럼 시작하겠습니다.'),record(slot===3?'태양이 사라진 뒤에도, 달은 남아 있었다.':'남겨진 기록은 다음 날에도 이어졌다.')]);
 return scenes;
}
