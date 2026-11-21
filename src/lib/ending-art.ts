/** Ending illustrations are optional user-supplied single PNG assets. */
export const ENDING_ASSET_DIRECTORY='/assets/endings/';
export const ENDING_ART: ReadonlyArray<{prefix:string;file:string;label:string}>=
[
  {prefix:'방주의 씨앗',file:'../cinematics/origin-zero/scene_farewell.png',label:'다음 날의 일을 EVE에게 맡기는 마지막 관리자'},
  {prefix:'에덴',file:'ending_new_consciousness.webp',label:'새로운 몸과 기억으로 살아가는 독립적인 생명들'},
  {prefix:'영원한 실험',file:'ending_incomplete_revival.webp',label:'끝나지 않은 인간 복원 실험'},
  {prefix:'마지막 동물원',file:'ending_open_spring.webp',label:'연구 재료가 아닌 생명으로 남은 동물들'},
  {"prefix":"본부의 계승자","file":"ending_subject_000.webp","label":"본부의 지침을 계승한 관리자"},
  {"prefix":"상처 없는 복원","file":"ending_new_consciousness.webp","label":"희생 없는 기억 복원의 미래"},
  {"prefix":"기록 밖의 봄","file":"ending_open_spring.webp","label":"본부로 보낸 생명 없이 열린 철문"},
  {"prefix":"뒤늦은 철문","file":"ending_scattered_names.webp","label":"희생 후에 열려버린 철문"},
  {"prefix":"비어 있는 교대실","file":"ending_silent_automation.webp","label":"직원들이 사라진 보존소"},
  {
    "prefix": "인간 이후의 첫 문장",
    "file": "ending_new_consciousness.webp",
    "label": "새로 탄생한 의식과 동물원 밖 첫 새벽"
  },
  {
    "prefix": "미완의 부활",
    "file": "ending_incomplete_revival.webp",
    "label": "인간 기억 복원의 불완전한 성공, 희미한 격리실"
  },
  {
    "prefix": "제000번 우리",
    "file": "ending_subject_000.webp",
    "label": "관리자가 격리실 안에 갇혀 있고 EVE가 외부에서 기록"
  },
  {
    "prefix": "우리 밖의 봄",
    "file": "ending_open_spring.webp",
    "label": "개방된 철문과 숲으로 나아가는 동물들"
  },
  {
    "prefix": "흩어진 이름들",
    "file": "ending_scattered_names.webp",
    "label": "안개 속으로 흩어지는 동물들의 뒷모습"
  },
  {
    "prefix": "마지막 두 관리자",
    "file": "ending_two_caretakers.webp",
    "label": "주인공과 EVE가 관리실에서 마지막 불빛을 지킴"
  },
  {
    "prefix": "고요한 자동화",
    "file": "ending_silent_automation.webp",
    "label": "비어 있는 EVE 홀로그램과 홀로 작동하는 시설"
  },
  {
    "prefix": "마지막 통신",
    "file": "ending_last_signal.webp",
    "label": "꺼져버린 단말기와 정적의 통신실"
  }
] as const;
export function findEndingArt(ending:string):{file:string;label:string}{
 return ENDING_ART.find(item=>ending.startsWith(item.prefix))??ENDING_ART[2];
}
