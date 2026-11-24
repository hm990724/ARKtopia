'use client';
import {useState} from 'react';
function Layer({src,className='',fit='cover'}:{src:string;className?:string;fit?:'cover'|'contain'}){
 const [status,setStatus]=useState<'loading'|'ready'|'missing'>('loading');
 if(status==='missing')return null;
 return <img src={src} alt="" aria-hidden="true" draggable={false} onLoad={()=>setStatus('ready')} onError={()=>setStatus('missing')} className={'ark-art-layer '+className+(status==='ready'?' is-ready':'')} style={{objectFit:fit}}/>;
}
export default function ArtSlot(props:{src:string;className?:string;fit?:'cover'|'contain'}){return <Layer key={props.src} {...props}/>;}
