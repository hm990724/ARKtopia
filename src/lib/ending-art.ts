/** Human-only cinematic illustrations for each ending route. */
export const ENDING_ASSET_DIRECTORY = '/assets/endings/';

export const ENDING_ART: ReadonlyArray<{ prefix: string; file: string; label: string }> = [
  { prefix: '방주의 씨앗', file: 'ending_seed_ark_v77.svg', label: 'EVE와 직원이 보존 시설의 다음 날을 준비하는 장면' },
  { prefix: '에덴', file: 'ending_eden_v77.svg', label: '생존한 직원들이 새 보금자리의 아침을 맞는 장면' },
  { prefix: '영원한 실험', file: 'ending_eternal_experiment_v77.svg', label: '연구자가 격리 시설에서 실험 기록을 마주하는 장면' },
  { prefix: '마지막 동물원', file: 'ending_last_zoo_v77.svg', label: '직원들이 열린 시설 출구 앞에서 각자의 길을 택하는 장면' },
  { prefix: '본부의 계승자', file: 'ending_successor_v77.svg', label: '젊은 직원이 본부 통제실을 이어받는 장면' },
  { prefix: '상처 없는 복원', file: 'ending_humane_restoration_v77.svg', label: '직원들이 동의와 생존을 우선하는 연구를 이어가는 장면' },
  { prefix: '기록 밖의 봄', file: 'ending_spring_outside_records_v77.svg', label: '생존한 직원들이 기록 보관소를 떠나 온실로 향하는 장면' },
  { prefix: '뒤늦은 철문', file: 'ending_late_gate_v77.svg', label: '직원들이 열린 시설 출구 앞에서 각자의 길을 택하는 장면' },
  { prefix: '비어 있는 교대실', file: 'ending_empty_shiftroom_v77.svg', label: 'EVE와 직원이 보존 시설의 다음 날을 준비하는 장면' },
  { prefix: '침묵의 자동화', file: 'ending_silent_automation_v77.svg', label: '젊은 직원이 본부 통제실을 이어받는 장면' },
  { prefix: '마지막 신호', file: 'ending_last_signal_v77.svg', label: '젊은 직원이 본부 통제실을 이어받는 장면' },
  { prefix: '인간 이후의 첫 문장', file: 'ending_first_sentence_v77.svg', label: '직원들이 희생을 줄이는 복원 연구를 이어가는 장면' },
  { prefix: '미완의 부활', file: 'ending_incomplete_revival_v77.svg', label: '연구자가 격리 시설에서 실험 기록을 마주하는 장면' },
  { prefix: '제000번 우리', file: 'ending_subject_000_v77.svg', label: '연구자가 격리 시설에서 실험 기록을 마주하는 장면' },
  { prefix: '우리 밖의 봄', file: 'ending_spring_beyond_cage_v77.svg', label: '생존한 직원들이 새 보금자리의 아침을 맞는 장면' },
  { prefix: '흩어진 이름들', file: 'ending_scattered_names_v77.svg', label: '생존한 직원들이 새 보금자리의 아침을 맞는 장면' },
  { prefix: '마지막 두 관리자', file: 'ending_two_caretakers_v77.svg', label: 'EVE와 직원이 보존 시설의 다음 날을 준비하는 장면' },
  { prefix: '고요한 자동화', file: 'ending_quiet_automation_v77.svg', label: '젊은 직원이 본부 통제실을 이어받는 장면' },
  { prefix: '마지막 통신', file: 'ending_final_transmission_v77.svg', label: 'EVE와 직원이 보존 시설의 다음 날을 준비하는 장면' }
] as const;

export function findEndingArt(ending: string): { file: string; label: string } {
  return ENDING_ART.find(item => ending.startsWith(item.prefix)) ?? ENDING_ART[2];
}
