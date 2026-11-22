'use client';

import type {IncidentId} from '@/lib/game-v10';
import {findIncidentArt} from '@/lib/incident-art';

export default function IncidentArtwork({id,title}:{id:IncidentId;title:string}){
 const file=findIncidentArt(id);
 return <figure className="v75-incident-art"><img src={`/assets/events/${file}`} alt={`${title} 사건 현장 삽화`} loading="eager"/></figure>;
}
