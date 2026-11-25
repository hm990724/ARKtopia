'use client';
import {useEffect,useRef,useState} from 'react';
import {photoRecords} from '@/lib/origin-zero';
import {storyArtworkCandidates} from '@/lib/story-art';
import StoryStill from './StoryStill';
const source=(i:number)=>`/assets/hidden-photos/photo_${String(i+1).padStart(2,'0')}.png`;
const sources=(i:number):readonly string[]=>i===7?[source(i),...storyArtworkCandidates(15)]:[source(i)];
export default function OriginPhotoGallery({count}:{count:number}){
 const [selected,setSelected]=useState<number|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(selected!==null&&!dialog.current?.open)dialog.current?.showModal()},[selected]);
 return <><div className="oz-photo-grid">{photoRecords.map((p,i)=><article key={p.title} className={i<count?'restored':'locked'}>
  <span>{String(i+1).padStart(2,'0')}</span>{i<count?<><button className="v71-photo-open" onClick={()=>setSelected(i)} aria-label={`${p.title} 확대`}><StoryStill sources={sources(i)} alt={p.title}/><small>기록 확대 ↗</small></button><b>{p.title.split(' · ')[1]}</b><p>{p.detail}</p></>:<b>암호화된 사진</b>}
 </article>)}</div><dialog className="v71-photo-dialog" ref={dialog} onClose={()=>setSelected(null)} aria-label="복원한 사진 원본">{selected!==null&&selected<count&&<>
 <button className="v71-photo-close" onClick={()=>dialog.current?.close()} autoFocus>닫기 · Esc</button><StoryStill sources={sources(selected)} alt={photoRecords[selected].title}/><h3>{photoRecords[selected].title}</h3><p>{photoRecords[selected].detail}</p>
 </>}</dialog></>;
}
