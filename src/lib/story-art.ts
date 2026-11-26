/** Story IDs are stable; they are never inferred from event order or save dates.
 * Every fallback is a verified, semantically matching asset with the same cast.
 */
const root='/assets/cinematics/origin-zero/';
const story=root+'story/';
const scenes:Record<number,readonly string[]>={
 1:[story+'SCN_01_zoo_gate_prologue.webp','/assets/backgrounds/hero-gate.webp'],
 2:[story+'SCN_02_eve_first_meeting.webp'],
 3:[story+'SCN_03_cctv_missing_frame.webp'],
 4:[story+'SCN_04_rabbit_medic_arrival.png'],
 5:[story+'SCN_05_fox_supply_arrival.webp'],
 6:[story+'SCN_06_deer_archive_arrival.png'],
 7:[story+'SCN_07_wolf_guard_arrival.webp'],
 8:[story+'SCN_08_first_roaming_threat.webp'],
 9:[story+'SCN_09_wolf_last_stand.webp'],
 10:[story+'SCN_10_m00_encounter.webp'],
 11:[story+'SCN_11_m00_origin_signature.webp'],
 12:[story+'SCN_12_m00_transfer.webp'],
 13:[story+'SCN_13_m00_protection.webp'],
 14:[story+'SCN_14_human_origin_revelation.webp','/assets/hidden-photos/photo_07.webp'],
 15:[story+'SCN_15_scientist_daughter_cat.webp','/assets/hidden-photos/photo_08.webp'],
 16:[story+'SCN_16_protagonist_scientist_memory.webp','/assets/hidden-photos/photo_11.webp'],
 17:[story+'SCN_17_eve_independent_choice.webp'],
 18:[story+'SCN_18_operation_ark_recall.webp'],
 19:[story+'SCN_19_final_farewell.webp']
};
export function storyArtworkCandidates(id:number):readonly string[]{return scenes[id]??[];}
