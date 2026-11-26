'use client';

import {useEffect,useState} from 'react';
import type {IncidentId} from '@/lib/game-v10';
import {incidentArtworkCandidates,sourceIncidentArtwork} from '@/lib/incident-art';
import {storyArtworkCandidates} from '@/lib/story-art';

/** A CG that has not yet been committed must never break the event panel. */
export default function IncidentArtwork({id,title}:{id:IncidentId;title:string}){
 const [primary,...fallbacks]=incidentArtworkCandidates(id);const candidates=[primary,...sourceIncidentArtwork(id),...fallbacks];const sources=id==='evidence_gap'?[...storyArtworkCandidates(3),...candidates]:candidates;
 const [imageIndex,setImageIndex]=useState(0),[failed,setFailed]=useState(false);
 useEffect(()=>{setImageIndex(0);setFailed(false)},[id]);
 const source=sources[Math.min(imageIndex,sources.length-1)];
 return <figure className="v75-incident-art">
  {!failed?<img key={`${id}-${imageIndex}`} src={source} alt={`${title} 사건 현장 삽화`}
   loading="eager" onError={()=>{if(imageIndex<sources.length-1)setImageIndex(i=>i+1);else setFailed(true)}}/>:
   <div className="v91-event-art-fallback" role="img" aria-label={`${title} 사건 삽화 대체 이미지`}><span>ARK // FIELD INCIDENT</span><strong>{title}</strong><i aria-hidden="true">◈</i><small>현장 기록 이미지 · 대체 관측</small></div>}
 </figure>;
}
