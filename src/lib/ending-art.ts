/** One distinct cinematic illustration for each ending route. */
export const ENDING_ASSET_DIRECTORY = '/assets/endings/';

export const ENDING_ART: ReadonlyArray<{ prefix: string; file: string; label: string }> = [
  { prefix: '방주의 씨앗', file: 'ending_seed_ark_v75.png', label: 'EVE가 보존 시설에서 다음 날의 개장을 준비하는 장면' },
  { prefix: '에덴', file: 'ending_eden_v75.png', label: '동물들이 선택권과 새로운 보금자리를 얻은 미래' },
  { prefix: '영원한 실험', file: 'ending_eternal_experiment_v75.png', label: '중단되지 않은 격리 연구와 기록 장치' },
  { prefix: '마지막 동물원', file: 'ending_last_zoo_v75.png', label: '열린 문 앞에서 스스로 머물 곳을 고르는 동물들' },
  { prefix: '본부의 계승자', file: 'ending_successor_v75.png', label: '본부의 명령을 이어받은 관리자의 고독한 통제실' },
  { prefix: '상처 없는 복원', file: 'ending_humane_restoration_v75.png', label: '희생을 줄이고 기억을 보존하는 새로운 연구실' },
  { prefix: '기록 밖의 봄', file: 'ending_spring_outside_records_v75.png', label: '본부의 기록과 통제를 벗어나 열린 봄의 정원' },
  { prefix: '뒤늦은 철문', file: 'ending_late_gate_v75.png', label: '너무 늦게 열린 격리 구역의 철문' },
  { prefix: '비어 있는 교대실', file: 'ending_empty_shiftroom_v75.png', label: '직원들이 돌아오지 않은 뒤의 텅 빈 교대실' },
  { prefix: '침묵의 자동화', file: 'ending_silent_automation_v75.png', label: '사람이 사라진 뒤에도 반복되는 자동 보존 절차' },
  { prefix: '마지막 신호', file: 'ending_last_signal_v75.png', label: '폐허 위 안테나가 보내는 구조 요청' },
  { prefix: '인간 이후의 첫 문장', file: 'ending_first_sentence_v75.png', label: '새로운 의식이 기록한 인간 이후의 첫 문장' },
  { prefix: '미완의 부활', file: 'ending_incomplete_revival_v75.png', label: '완성되지 못한 복제 신체와 남겨진 연구 기록' },
  { prefix: '제000번 우리', file: 'ending_subject_000_v75.png', label: '관리자가 피험자 000으로 기록된 격리실' },
  { prefix: '우리 밖의 봄', file: 'ending_spring_beyond_cage_v75.png', label: '동물들이 격리문 밖으로 걸어 나가는 봄' },
  { prefix: '흩어진 이름들', file: 'ending_scattered_names_v75.png', label: '각자의 이름을 되찾고 흩어지는 생존자들' },
  { prefix: '마지막 두 관리자', file: 'ending_two_caretakers_v75.png', label: '마지막 불빛을 함께 지키는 EVE와 관리자' },
  { prefix: '고요한 자동화', file: 'ending_quiet_automation_v75.png', label: '기록만 남은 조용한 자동 운영 시설' },
  { prefix: '마지막 통신', file: 'ending_final_transmission_v75.png', label: '정적 속에서 전송을 마치는 마지막 통신실' }
] as const;

export function findEndingArt(ending: string): { file: string; label: string } {
  return ENDING_ART.find(item => ending.startsWith(item.prefix)) ?? ENDING_ART[2];
}
