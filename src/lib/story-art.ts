/** Story IDs are stable; they are never inferred from event order or save dates.
 * The Wolf sacrifice deliberately uses the protected legacy illustration.
 * A missing new CG has only a semantically matching fallback, never unrelated cast.
 */
const root='/assets/cinematics/origin-zero/';
const story=root+'story/';
const scenes:Record<number,readonly string[]>={
 1:[story+'SCN_01_zoo_gate_prologue.png','/assets/backgrounds/hero-gate.webp'],
 2:[story+'SCN_02_eve_first_meeting.png'],
 3:[story+'SCN_03_cctv_missing_frame.png'],
 4:[story+'SCN_04_rabbit_medic_arrival.png','/assets/cinematics/staff-arrivals/rabbit/scene.webp'],
 5:[story+'SCN_05_fox_supply_arrival.png','/assets/cinematics/staff-arrivals/fox/scene.webp'],
 6:[story+'SCN_06_deer_archive_arrival.png','/assets/cinematics/staff-arrivals/deer/scene.webp'],
 7:[story+'SCN_07_wolf_guard_arrival.png','/assets/cinematics/staff-arrivals/wolf/scene.webp'],
 8:[story+'SCN_08_first_roaming_threat.png'],
 9:[story+'SCN_09_wolf_last_stand.png'],
 10:[story+'SCN_10_m00_encounter.png'],
 11:[story+'SCN_11_m00_origin_signature.png',root+'scene_m00_positive.png'],
 12:[story+'SCN_12_m00_transfer.png',root+'scene_m00_transfer.png'],
 13:[story+'SCN_13_m00_protection.png',root+'scene_m00_protect.png'],
 14:[story+'SCN_14_human_origin_revelation.png','/assets/hidden-photos/photo_07.png'],
 15:[story+'SCN_15_scientist_daughter_cat.png','/assets/hidden-photos/photo_08.png'],
 16:[story+'SCN_16_protagonist_scientist_memory.png','/assets/hidden-photos/photo_11.png'],
 17:[story+'SCN_17_eve_independent_choice.png'],
 18:[story+'SCN_18_operation_ark_recall.png',root+'scene_ark_recall.png'],
 19:[story+'SCN_19_final_farewell.png',root+'scene_farewell.png']
};
export function storyArtworkCandidates(id:number):readonly string[]{return scenes[id]??[];}
