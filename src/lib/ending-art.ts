/** All nineteen authored route endings stay distinct; the eight ORIGIN ZERO outcomes lead the table. */
export const ENDING_ASSET_DIRECTORY = '/assets/endings/';

export const ENDING_ART: ReadonlyArray<{ prefix: string; file: string; label: string }> = [
  { prefix: '영원한 실험', file: 'ending_eternal_experiment_cinematic.png', label: '끝없이 되풀이되는 빈 복제 실험실' },
  { prefix: '에덴', file: 'ending_eden_cinematic.png', label: '인공 새벽 아래 다시 세운 복제 사회의 정원' },
  { prefix: '방주의 씨앗', file: 'ending_seed_ark_finale.png', label: '젊은 관리자의 마지막 보고를 이어받는 EVE' },
  { prefix: '마지막 동물원', file: 'ending_last_zoo_cinematic.png', label: '인간이 사라진 뒤에도 남은 동물 피난처' },
  { prefix: '제000번 우리', file: 'ending_subject_000_choice.png', label: '자신의 정체성을 직접 선택하는 젊은 관리자와 EVE' },
  { prefix: '침묵의 자동화', file: 'ending_silent_automation_cinematic.png', label: '사람의 온기 없이 계속 작동하는 통제실' },
  { prefix: '흩어진 이름들', file: 'ending_scattered_names_cinematic.png', label: '돌아오지 못한 존재의 기록을 보존하는 추모실' },
  { prefix: '마지막 신호', file: 'ending_last_signal_finale.png', label: '비바람 속 마지막 송신을 마치는 젊은 관리자와 EVE' },
  { prefix: '본부의 계승자', file: 'ending_successor_cinematic.png', label: '복제 계획을 이어받는 본부 지휘실' },
  { prefix: '상처 없는 복원', file: 'ending_humane_restoration_cinematic.png', label: '비침습 연구와 생명 보존을 함께 남긴 실험실' },
  { prefix: '기록 밖의 봄', file: 'ending_spring_outside_records_cinematic.png', label: '공식 기록 바깥으로 이어지는 야생의 봄' },
  { prefix: '뒤늦은 철문', file: 'ending_late_gate_cinematic.png', label: '늦은 선택으로 닫혀 버린 격리문' },
  { prefix: '비어 있는 교대실', file: 'ending_empty_shiftroom_cinematic.png', label: '마지막 근무 뒤 비어 있는 교대실' },
  { prefix: '인간 이후의 첫 문장', file: 'ending_first_sentence_cinematic.png', label: '새로운 의식이 시작되는 기록 공간' },
  { prefix: '미완의 부활', file: 'ending_incomplete_revival_cinematic.png', label: '복원에 실패한 뒤 남은 실험실' },
  { prefix: '우리 밖의 봄', file: 'ending_spring_beyond_cage_cinematic.png', label: '열린 우리 밖으로 이어지는 숲길' },
  { prefix: '마지막 두 관리자', file: 'ending_two_caretakers_cinematic.png', label: '두 관리자의 마지막 야간 통제실' },
  { prefix: '고요한 자동화', file: 'ending_quiet_automation_cinematic.png', label: '직원 없이 기록을 정리하는 자동 자료실' },
  { prefix: '마지막 통신', file: 'ending_final_transmission_cinematic.png', label: '마지막 송신이 끝나는 통신실' }
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
