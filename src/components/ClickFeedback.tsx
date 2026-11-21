'use client';
import {useEffect,useState} from 'react';

/** Purely visual; never dispatches a gameplay action or consumes resources. */
export default function ClickFeedback(){
 const [pulses,setPulses]=useState<{id:number;x:number;y:number}[]>([]);
 useEffect(()=>{
  let id=0;const timers=new Set<ReturnType<typeof setTimeout>>();
  const click=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target.closest('button'):null;
   if(!target||target.disabled||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const rect=target.getBoundingClientRect(),key=++id;
   const x=event.detail?event.clientX:rect.left+rect.width/2;
   const y=event.detail?event.clientY:rect.top+rect.height/2;
   setPulses(old=>[...old.slice(-4),{id:key,x,y}]);
   const timer=setTimeout(()=>{setPulses(old=>old.filter(p=>p.id!==key));timers.delete(timer)},420);
   timers.add(timer);
  };
  document.addEventListener('click',click,true);
  return()=>{document.removeEventListener('click',click,true);timers.forEach(clearTimeout)};
 },[]);
 return <div aria-hidden="true" className="v71-click-layer">{pulses.map(p=><span key={p.id} style={{left:p.x,top:p.y}}><i/><i/><i/><i/></span>)}</div>;
}
