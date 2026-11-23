/** All nineteen authored route endings stay distinct; the eight ORIGIN ZERO outcomes lead the table. */
export const ENDING_ASSET_DIRECTORY = '/assets/endings/';

export const ENDING_ART: ReadonlyArray<{ prefix: string; file: string; label: string }> = [
  { prefix: '영원한 실험', file: 'ending_eternal_experiment_v77.svg', label: '관리자와 EVE가 폐기되지 않은 연구 기록 앞에 선 장면' },
  { prefix: '에덴', file: 'ending_eden_v77.svg', label: '새로운 복제 사회의 첫날을 기록하는 장면' },
  { prefix: '방주의 씨앗', file: 'ending_seed_ark_v77.svg', label: '관리자의 마지막 보고를 EVE가 이어받는 장면' },
  { prefix: '마지막 동물원', file: 'ending_last_zoo_v77.svg', label: '관리자가 동물원 문을 열고 마지막 선택을 남기는 장면' },
  { prefix: '제000번 우리', file: 'ending_subject_000_v77.svg', label: '관리자가 자신의 피험자 기록과 마주한 장면' },
  { prefix: '침묵의 자동화', file: 'ending_silent_automation_v77.svg', label: '사람이 떠난 통제실에서 자동화가 계속되는 장면' },
  { prefix: '흩어진 이름들', file: 'ending_scattered_names_v77.svg', label: '돌아오지 못한 동료의 이름을 기록하는 장면' },
  { prefix: '마지막 신호', file: 'ending_last_signal_v77.svg', label: '관리자와 EVE가 마지막 구조 신호를 보내는 장면' },
  { prefix: '본부의 계승자', file: 'ending_successor_v77.svg', label: '관리자가 본부의 복원 명령을 계승하는 장면' },
  { prefix: '상처 없는 복원', file: 'ending_humane_restoration_v77.svg', label: '강제 회수 없이 복원 연구를 남기는 장면' },
  { prefix: '기록 밖의 봄', file: 'ending_spring_outside_records_v77.svg', label: '기록을 벗어난 생명들의 미래를 보내는 장면' },
  { prefix: '뒤늦은 철문', file: 'ending_late_gate_v77.svg', label: '구하지 못한 이들의 이름을 출입 명단에 남기는 장면' },
  { prefix: '비어 있는 교대실', file: 'ending_empty_shiftroom_v77.svg', label: '직원 네 자리가 비어 있는 마지막 근무표 장면' },
  { prefix: '인간 이후의 첫 문장', file: 'ending_first_sentence_v77.svg', label: 'EVE와 관리자가 새 의식의 첫 문장을 기록하는 장면' },
  { prefix: '미완의 부활', file: 'ending_incomplete_revival_v77.svg', label: '복원에 실패한 뒤 남은 결과를 확인하는 장면' },
  { prefix: '우리 밖의 봄', file: 'ending_spring_beyond_cage_v77.svg', label: '관리자가 열린 우리와 바깥의 길을 선택하는 장면' },
  { prefix: '마지막 두 관리자', file: 'ending_two_caretakers_v77.svg', label: 'EVE와 관리자가 마지막 밤을 함께 지키는 장면' },
  { prefix: '고요한 자동화', file: 'ending_quiet_automation_v77.svg', label: 'EVE만 남아 자동 운영 기록을 읽는 장면' },
  { prefix: '마지막 통신', file: 'ending_final_transmission_v77.svg', label: '관리자가 마지막 전송을 마치는 장면' }
] as const;

/** Older saves and epilogue variants retain their original title and dedicated scene. */
export const LEGACY_ENDING_ART: ReadonlyArray<{ prefix: string; canonicalPrefix: string }> = [
  { prefix: '이름 없는 기록', canonicalPrefix: '제000번 우리' },
  { prefix: '닫힌 기록', canonicalPrefix: '제000번 우리' },
  { prefix: '이름 없는 관리자', canonicalPrefix: '제000번 우리' },
  { prefix: '새로운 문장', canonicalPrefix: '인간 이후의 첫 문장' },
  { prefix: '완벽한 기록', canonicalPrefix: '영원한 실험' },
  { prefix: '불완전한 사람', canonicalPrefix: '제000번 우리' },
  { prefix: '무음의 방주', canonicalPrefix: '고요한 자동화' }
] as const;

export function findEndingArt(ending: string): { file: string; label: string } {
  const matched = ENDING_ART.find(item => ending.startsWith(item.prefix));
  if (matched) return matched;
  const legacy = LEGACY_ENDING_ART.find(item => ending.startsWith(item.prefix));
  return ENDING_ART.find(item => item.prefix === legacy?.canonicalPrefix) ?? ENDING_ART[4];
}
