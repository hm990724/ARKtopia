import type {CrewId} from './crew';
import {storyArtworkCandidates} from './story-art';
const ARRIVAL_IDS:Record<CrewId,number>={rabbit:4,fox:5,deer:6,wolf:7};
export function cinematicArtworkCandidates(kind:'eve'|CrewId):readonly string[]{
 return storyArtworkCandidates(kind==='eve'?2:ARRIVAL_IDS[kind]);
}
