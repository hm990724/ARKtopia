import type {CrewId} from './crew';

/** New cinematic originals live at canonical, story-specific paths.
 * Legacy paths stay available until the high-resolution replacement has been
 * generated, visually approved, committed and verified in the actual game.
 */
const ARRIVAL_SCENES:Record<CrewId,string>={
 rabbit:'SCN_04_rabbit_medic_arrival.png',
 fox:'SCN_05_fox_supply_arrival.png',
 deer:'SCN_06_deer_archive_arrival.png',
 wolf:'SCN_07_wolf_guard_arrival.png'
};
export function cinematicArtworkCandidates(kind:'eve'|CrewId):readonly string[]{
 if(kind==='eve')return [
  '/assets/cinematics/origin-zero/story/SCN_02_eve_first_meeting.png',
  '/assets/cinematics/eve-first-meeting/scene.webp'
 ];
 return [
  `/assets/cinematics/origin-zero/story/${ARRIVAL_SCENES[kind]}`,
  `/assets/cinematics/staff-arrivals/${kind}/scene.webp`
 ];
}
