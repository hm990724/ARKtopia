'use client';
import {useState} from 'react';
/** Load real story art only; missing art never blocks dialogue or game progression. */
function Still({sources,alt,className}:{sources:readonly string[];alt:string;className?:string}){
 const [index,setIndex]=useState(0);
 if(index>=sources.length)return null;
 return <img className={className??'origin-story-still'} src={sources[index]} alt={alt} onError={()=>setIndex(i=>i+1)}/>;
}
export default function StoryStill(props:{sources:readonly string[];alt:string;className?:string}){return <Still key={props.sources.join('|')} {...props}/>;}
