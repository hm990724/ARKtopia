import type {CoreIncidentId,IncidentId} from './game-v10';
import type {ExtendedIncidentId} from './incident-content';

const CORE_INCIDENT_ART:Record<CoreIncidentId,string>={
 echo:'event_garden.png',
 breach:'event_containment.png',
 blackout:'event_blackout.png',
 spores:'event_spores.png',
 signal:'event_signal.png',
 visitor:'event_signal.png',
 predator:'event_containment.png',
 coolant:'event_coolant.png',
 rations:'event_garden.png',
 intrusion:'event_signal.png',
 garden:'event_garden.png',
 keepsake:'event_garden.png',
 quiet:'event_garden.png'
};

const EXTENDED_INCIDENT_ART:Record<ExtendedIncidentId,string>={
 cctv_loop:'event_signal.png',cctv_blindspot:'event_signal.png',evidence_gap:'event_signal.png',patrol_echo:'event_containment.png',
 generator_overheat:'event_blackout.png',cable_arc:'event_blackout.png',battery_swelling:'event_blackout.png',pump_backflow:'event_coolant.png',filter_clog:'event_spores.png',
 fence_crack:'event_containment.png',enclosure_rattle:'event_containment.png',escape_tracks:'event_signal.png',animal_fever:'event_garden.png',feed_shortage:'event_garden.png',
 medic_memory:'event_garden.png',guard_refusal:'event_containment.png',staff_conflict:'event_signal.png',empty_chair:'event_garden.png',neural_static:'event_signal.png',
 resonance_drift:'event_signal.png',data_corruption:'event_signal.png',hq_recall_order:'event_signal.png',hq_delete_order:'event_signal.png',field_scavenger:'event_coolant.png',
 contamination_pool:'event_spores.png',construction_noise:'event_blackout.png',m00_signature:'event_signal.png',exposure_critical:'event_containment.png'
};

export function findIncidentArt(id:IncidentId):string{return id in CORE_INCIDENT_ART?CORE_INCIDENT_ART[id as CoreIncidentId]:EXTENDED_INCIDENT_ART[id as ExtendedIncidentId];}
export const incidentArtFiles=[...new Set([...Object.values(CORE_INCIDENT_ART),...Object.values(EXTENDED_INCIDENT_ART)])];

/** 41 distinct gameplay incident artwork targets (separate from the story EVT storyboard).
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
 'neural_static'
];
export function incidentArtworkCandidates(id:IncidentId):readonly string[]{
 const order=GAME_EVENT_ART_ORDER.indexOf(id);
 const fallback=`/assets/events/${findIncidentArt(id)}`;
 if(order<0)return [fallback];
 return [
  `/assets/cinematics/origin-zero/events/EVT_${String(order+1).padStart(2,'0')}_${id}.png`,
  fallback
 ];
}
