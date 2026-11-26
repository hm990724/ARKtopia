import type {CoreIncidentId,IncidentId} from './game-v10';
import type {ExtendedIncidentId} from './incident-content';

const CORE_INCIDENT_ART:Record<CoreIncidentId,string>={
 echo:'event_garden.webp',
 breach:'event_containment.webp',
 blackout:'event_blackout.webp',
 spores:'event_spores.webp',
 signal:'event_signal.webp',
 visitor:'event_signal.webp',
 predator:'event_containment.webp',
 coolant:'event_coolant.webp',
 rations:'event_garden.webp',
 intrusion:'event_signal.webp',
 garden:'event_garden.webp',
 keepsake:'event_garden.webp',
 quiet:'event_garden.webp'
};

const EXTENDED_INCIDENT_ART:Record<ExtendedIncidentId,string>={
 cctv_loop:'event_signal.webp',cctv_blindspot:'event_signal.webp',evidence_gap:'event_signal.webp',patrol_echo:'event_containment.webp',
 generator_overheat:'event_blackout.webp',cable_arc:'event_blackout.webp',battery_swelling:'event_blackout.webp',pump_backflow:'event_coolant.webp',filter_clog:'event_spores.webp',
 fence_crack:'event_containment.webp',enclosure_rattle:'event_containment.webp',escape_tracks:'event_signal.webp',animal_fever:'event_garden.webp',feed_shortage:'event_garden.webp',
 medic_memory:'event_garden.webp',guard_refusal:'event_containment.webp',staff_conflict:'event_signal.webp',empty_chair:'event_garden.webp',neural_static:'event_signal.webp',
 resonance_drift:'event_signal.webp',data_corruption:'event_signal.webp',hq_recall_order:'event_signal.webp',hq_delete_order:'event_signal.webp',field_scavenger:'event_coolant.webp',
 contamination_pool:'event_spores.webp',construction_noise:'event_blackout.webp',m00_signature:'event_signal.webp',exposure_critical:'event_containment.webp',fox_supply_memory:'event_garden.webp',deer_archive_memory:'event_signal.webp'
};

export function findIncidentArt(id:IncidentId):string{return id in CORE_INCIDENT_ART?CORE_INCIDENT_ART[id as CoreIncidentId]:EXTENDED_INCIDENT_ART[id as ExtendedIncidentId];}
export const incidentArtFiles=[...new Set([...Object.values(CORE_INCIDENT_ART),...Object.values(EXTENDED_INCIDENT_ART)])];

/** 43 distinct gameplay incident artwork targets (separate from the story EVT storyboard).
 * Names are tied to actual executable incident IDs, not guessed story scenes.
 * A missing replacement never causes a blank event: the known legacy illustration
 * remains an explicit fallback until visual QA approves and commits each new CG.
 */
export const GAME_EVENT_ART_ORDER:readonly IncidentId[]=[
 'generator_overheat',
 'blackout',
 'breach',
 'cctv_loop',
 'rations',
 'coolant',
 'filter_clog',
 'escape_tracks',
 'patrol_echo',
 'feed_shortage',
 'echo',
 'evidence_gap',
 'quiet',
 'pump_backflow',
 'medic_memory',
 'staff_conflict',
 'guard_refusal',
 'animal_fever',
 'empty_chair',
 'signal',
 'intrusion',
 'hq_recall_order',
 'hq_delete_order',
 'field_scavenger',
 'contamination_pool',
 'battery_swelling',
 'cable_arc',
 'resonance_drift',
 'enclosure_rattle',
 'predator',
 'keepsake',
 'garden',
 'm00_signature',
 'cctv_blindspot',
 'visitor',
 'spores',
 'exposure_critical',
 'data_corruption',
 'fence_crack',
 'construction_noise',
 'neural_static',
 'fox_supply_memory',
 'deer_archive_memory'
];
export function incidentArtworkCandidates(id:IncidentId):readonly string[]{
 const order=GAME_EVENT_ART_ORDER.indexOf(id);
 const fallback=`/assets/events/${findIncidentArt(id)}`;
 if(order<0)return [fallback];
 const extension=id==='medic_memory'?'png':'webp';
 return [
  `/assets/cinematics/origin-zero/events/EVT_${String(order+1).padStart(2,'0')}_${id}.${extension}`,
  fallback
 ];
}

/** Source storyboard filenames are aliases only where the event semantics match. */
export const SOURCE_EVENT_ART:Partial<Record<IncidentId,string>>={breach:'EVT_03_containment_door_breach.png',cctv_loop:'EVT_04_cctv_interference.png',filter_clog:'EVT_07_filter_contamination.png',escape_tracks:'EVT_08_perimeter_escape.png',staff_conflict:'EVT_16_staff_dispute.png',guard_refusal:'EVT_17_staff_refusal.png',hq_recall_order:'EVT_22_hq_recall.png',hq_delete_order:'EVT_23_hq_erase.png',enclosure_rattle:'EVT_29_night_cage_sound.png',intrusion:'EVT_41_night_infiltration.png'};
export function sourceIncidentArtwork(id:IncidentId):string[]{const name=SOURCE_EVENT_ART[id];return name?['/assets/cinematics/origin-zero/events/'+name]:[];}
