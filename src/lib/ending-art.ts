/** All nineteen authored route endings stay distinct; the eight ORIGIN ZERO outcomes lead the table. */
export const ENDING_ASSET_DIRECTORY = '/assets/endings/';

export const ENDING_ART: ReadonlyArray<{ prefix: string; file: string; label: string }> = [
  { prefix: '영원한 실험', file: 'ending_eternal_experiment_finale.png', label: '임종 직전 관리자와 냉정한 인수인계 시스템' },
  { prefix: '에덴', file: 'ending_eden_finale.png', label: '임종을 맞은 관리자와 인공 낙원의 첫 새벽' },
  { prefix: '방주의 씨앗', file: 'ending_seed_ark_finale.png', label: '젊은 관리자의 마지막 보고를 이어받는 EVE' },
  { prefix: '마지막 동물원', file: 'ending_last_zoo_finale.png', label: '보호구역을 바라보는 관리자와 EVE의 작별' },
  { prefix: '제000번 우리', file: 'ending_subject_000_choice.png', label: '자신의 정체성을 직접 선택하는 젊은 관리자와 EVE' },
  { prefix: '침묵의 자동화', file: 'ending_silent_automation_finale.png', label: '감정 없이 자동 운영되는 시설의 EVE' },
  { prefix: '흩어진 이름들', file: 'ending_scattered_names_finale.png', label: '기록 보관실에서 이름과 흔적을 복원하는 EVE' },
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

/** Eight ORIGIN ZERO outcomes use new story-specific raster CGs when physically
 * present. The eleven existing legacy endings keep their original mappings.
 * Do not equate those eleven historical titles with the eleven epilogue storyboard
 * candidates: their narrative and save conditions are not interchangeable.
 */
export const ORIGIN_ZERO_CANONICAL_ENDING_ART = [
 {prefix:'영원한 실험',filename:'END_01_eternal_experiment.png'},
 {prefix:'에덴',filename:'END_02_eden.png'},
 {prefix:'방주의 씨앗',filename:'END_03_ark_seeds.png'},
 {prefix:'마지막 동물원',filename:'END_04_last_zoo.png'},
 {prefix:'제000번 우리',filename:'END_05_subject_000.png'},
 {prefix:'침묵의 자동화',filename:'END_06_silent_automation.png'},
 {prefix:'흩어진 이름들',filename:'END_07_scattered_names.png'},
 {prefix:'마지막 신호',filename:'END_08_last_signal.png'}
] as const;
export function endingArtworkCandidates(ending:string):readonly string[]{
 const fallback=ENDING_ASSET_DIRECTORY+findEndingArt(ending).file;
 const main=ORIGIN_ZERO_CANONICAL_ENDING_ART.find(x=>ending.startsWith(x.prefix));
 return main?[`/assets/cinematics/origin-zero/endings/${main.filename}`,fallback]:[fallback];
}

/** Eleven additional storyboards, not eleven independent ending decisions. */
export const ORIGIN_EPILOGUE_ART=[
 'END_09_experiment_successor.png','END_10_eden_memory_cost.png','END_11_seeds_long_research.png','END_12_zoo_protected_animals.png','END_13_subject_self_choice.png','END_14_automation_eve_offline.png','END_15_names_memorial.png','END_16_signal_uncertain.png','END_17_headquarters_aftermath.png','END_18_sanctuary_aftermath.png','END_19_eve_last_memory.png'
] as const;
export function originEndingSceneArt(slot:number):readonly string[]{
 if(slot>=1&&slot<=8)return endingArtworkCandidates(ORIGIN_ZERO_CANONICAL_ENDING_ART[slot-1].prefix);
 const name=ORIGIN_EPILOGUE_ART[slot-9];return name?['/assets/cinematics/origin-zero/epilogues/'+name,'/assets/cinematics/origin-zero/endings/'+name]:[];
}

/** Individual staff farewell CGs, shared across eligible ending routes. */
export const CREW_FAREWELL_ART={rabbit:'FAREWELL_01_rabbit.png',fox:'FAREWELL_02_fox.png',deer:'FAREWELL_03_deer.png',wolf:'FAREWELL_04_wolf.png'} as const;
export function crewFarewellArt(id:keyof typeof CREW_FAREWELL_ART):readonly string[]{return ['/assets/cinematics/origin-zero/farewells/'+CREW_FAREWELL_ART[id]];}
