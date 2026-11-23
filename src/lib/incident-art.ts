import type {CoreIncidentId,IncidentId} from './game-v10';
import type {ExtendedIncidentId} from './incident-content';

const CORE_INCIDENT_ART:Record<CoreIncidentId,string>={
 echo:'event_garden_v75.png',
 breach:'event_containment_v75.png',
 blackout:'event_blackout_v75.png',
 spores:'event_spores_v75.png',
 signal:'event_signal_v75.png',
 visitor:'event_signal_v75.png',
 predator:'event_containment_v75.png',
 coolant:'event_coolant_v75.png',
 rations:'event_garden_v75.png',
 intrusion:'event_signal_v75.png',
 garden:'event_garden_v75.png',
 keepsake:'event_garden_v75.png',
 quiet:'event_garden_v75.png'
};

const EXTENDED_INCIDENT_ART:Record<ExtendedIncidentId,string>={
 cctv_loop:'event_signal_v75.png',cctv_blindspot:'event_signal_v75.png',evidence_gap:'event_signal_v75.png',patrol_echo:'event_containment_v75.png',
 generator_overheat:'event_blackout_v75.png',cable_arc:'event_blackout_v75.png',battery_swelling:'event_blackout_v75.png',pump_backflow:'event_coolant_v75.png',filter_clog:'event_spores_v75.png',
 fence_crack:'event_containment_v75.png',enclosure_rattle:'event_containment_v75.png',escape_tracks:'event_signal_v75.png',animal_fever:'event_garden_v75.png',feed_shortage:'event_garden_v75.png',
 medic_memory:'event_garden_v75.png',guard_refusal:'event_containment_v75.png',staff_conflict:'event_signal_v75.png',empty_chair:'event_garden_v75.png',neural_static:'event_signal_v75.png',
 resonance_drift:'event_signal_v75.png',data_corruption:'event_signal_v75.png',hq_recall_order:'event_signal_v75.png',hq_delete_order:'event_signal_v75.png',field_scavenger:'event_coolant_v75.png',
 contamination_pool:'event_spores_v75.png',construction_noise:'event_blackout_v75.png',m00_signature:'event_signal_v75.png'
};

export function findIncidentArt(id:IncidentId):string{return id in CORE_INCIDENT_ART?CORE_INCIDENT_ART[id as CoreIncidentId]:EXTENDED_INCIDENT_ART[id as ExtendedIncidentId];}
export const incidentArtFiles=[...new Set([...Object.values(CORE_INCIDENT_ART),...Object.values(EXTENDED_INCIDENT_ART)])];
