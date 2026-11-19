import type {AnimalId,AnimalState} from "./sim";
import {isMutant} from "./sim";

export type AwakeningProfile={signal:string;identity:string;animalCry:string;firstWords:string;secondWords:string;manager:string};
export const awakeningProfiles:Record<AnimalId,AwakeningProfile>={
  rabbit:{signal:'의료 인력의 잔존 음성',identity:'30대 초반 · 소아과 의사',animalCry:'끙… 끼익…',firstWords:'화… 환자분…? 어디… 어디가 아프신가요?',secondWords:'아, 잠깐만요… 체온부터… 재야 하는데… 제 손이… 왜…',manager:'무리하지 마. 지금은 누구도 치료할 필요 없어.'},
  fox:{signal:'출입 통제 인력의 잔존 음성',identity:'40대 · 보안 책임자',animalCry:'캥… 캥!',firstWords:'정지…! 신분 확인… 신분증을… 보여 주십시오.',secondWords:'문부터… 닫아야… 아니, 여긴… 출입 허가가…',manager:'알았어. 문은 내가 지킬게. 진정해.'},
  deer:{signal:'보존 책임자의 잔존 음성',identity:'50대 · 생태 보존 책임자',animalCry:'끄으… 흐응…',firstWords:'잠깐… 그 구역은… 개방하면 안 됩니다.',secondWords:'아이들이… 아니… 표본들이… 아직 안에 있어요.',manager:'안 연다니까. 지금은 쉬어.'},
  owl:{signal:'연구자의 잔존 음성',identity:'60대 · 수학자',animalCry:'후우… 후욱…',firstWords:'틀렸어… 아니… 잠깐, 다시 계산하면…',secondWords:'세 번째 선이… 빠졌군요. 분명 거기에… 있었는데…',manager:'계산은 나중에 해. 네가 먼저 버텨야지.'},
  wolf:{signal:'경비 인력의 잔존 음성',identity:'20대 후반 · 경비대원',animalCry:'으르릉… 크르르…',firstWords:'뒤로… 물러서! 이쪽은 내가… 막을 테니까!',secondWords:'대피부터… 시켜… 난 괜찮… 윽…',manager:'네가 지킬 차례 아니야. 이제 내가 해.'},
  crow:{signal:'창작자의 잔존 음성',identity:'20대 · 작곡가',animalCry:'까악… 까, 까악…',firstWords:'그 다음 음은… 미… 아니… 들리지 않아…',secondWords:'한 마디만… 한 마디만 더 쓰면… 끝인데…',manager:'서두르지 마. 들릴 때까지 기다려.'},
  otter:{signal:'기술자의 잔존 음성',identity:'30대 후반 · 설비 기술자',animalCry:'끼르륵… 끽…',firstWords:'밸브를… 왼쪽으로… 아니, 그건 위험해요.',secondWords:'수압이… 안 맞아… 맨날 내가 고쳤는데…',manager:'여기서는 안 고쳐도 돼. 가만있어.'},
  lynx:{signal:'사법 기록 인력의 잔존 음성',identity:'40대 · 판사',animalCry:'크릉… 야옹…',firstWords:'피고인은… 아니… 누구를… 심문하고 있죠?',secondWords:'그 아이는… 잘못이… 없었습니다…',manager:'누굴 말하는 건지 모르겠어. 그래도 듣고 있어.'},
  axolotl:{signal:'재생 연구 인력의 잔존 음성',identity:'30대 · 재생의학 연구원',animalCry:'꼬륵… 뽀글…',firstWords:'세포가… 다시 자라고 있어요… 그런데…',secondWords:'그렇게… 붙이면 안 되는데… 이건… 내 몸인가요?',manager:'움직이지 마. 내가 기록할게.'},
  moth:{signal:'통신 인력의 잔존 음성',identity:'10대 후반 · 통신 보조원',animalCry:'파르륵… 파르륵…',firstWords:'저기… 아직… 신호가 들려요.',secondWords:'엄마…? 아니… 채널이… 바뀌었어요…',manager:'괜찮아. 그 신호, 내가 찾아볼게.'},
  mutant:{signal:'중첩된 생존자 음성',identity:'나이·신원 불명 · 중첩 의식',animalCry:'키이… 키익…',firstWords:'제… 이름은… 아니, 아니야… 우리 이름은…',secondWords:'그만… 서로… 말하지 마… 머릿속이…',manager:'알았어. 한 명씩 말해. 내가 듣고 있어.'},
  chimera:{signal:'두 기억의 간섭 신호',identity:'나이 미상 · 접합 의식',animalCry:'르르… 끼익…',firstWords:'여기가… 어디죠? 아니… 난 여길 알아…',secondWords:'두 개의… 기억이… 같은 문을 가리켜요…',manager:'어느 쪽이 네 기억이든, 지금은 쉬어.'},
};

// One-time transition: the animal starts as an animal; acquired human memory can override instincts.
export function isAwakeningReady(a:AnimalState):boolean {
  return a.alive&&!a.awakened&&isMutant(a);
}
export function isMutantVisual(a:AnimalState):boolean {
  return isMutant(a)||isAwakeningReady(a);
}
