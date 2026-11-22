import type {IncidentId} from './game-v10';

const INCIDENT_ART:Record<IncidentId,string>={
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

export function findIncidentArt(id:IncidentId):string{return INCIDENT_ART[id];}
export const incidentArtFiles=[...new Set(Object.values(INCIDENT_ART))];
