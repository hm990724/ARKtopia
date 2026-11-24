'use client';

import {useEffect,useState} from 'react';
import type {IncidentId} from '@/lib/game-v10';
import {incidentArtworkCandidates} from '@/lib/incident-art';
import {storyArtworkCandidates} from '@/lib/story-art';

/** A CG that has not yet been committed must never break the event panel. */
export default function IncidentArtwork({id,title}:{id:IncidentId;title:string}){
 const sources=id==='evidence_gap'?[...storyArtworkCandidates(3),...incidentArtworkCandidates(id)]:incidentArtworkCandidates(id);
 const [imageIndex,setImageIndex]=useState(0);
 useEffect(()=>setImageIndex(0),[id]);
 const source=sources[Math.min(imageIndex,sources.length-1)];
 return <figure className="v75-incident-art">
  <img key={`${id}-${imageIndex}`} src={source} alt={`${title} 사건 현장 삽화`}
   loading="eager" onError={()=>setImageIndex(i=>Math.min(sources.length-1,i+1))}/>
 </figure>;
}
