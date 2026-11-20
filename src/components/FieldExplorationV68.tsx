'use client';
import {useEffect,useRef,useState,type KeyboardEvent,type CSSProperties} from 'react';
import {regions,type V10} from '@/lib/game-v10';
import {specs,type AnimalId} from '@/lib/sim';
import {fieldWidth,fieldHeight,fieldVisible,adjacentField,type Pace} from '@/lib/tactical-field';
import {HUNT_TRAITS,observedEvidence,type HuntMode,type HuntTool} from '@/lib/hidden-hunt';
import {ArrowUp,ArrowDown,ArrowLeft,ArrowRight,Footprints,Package,Radio,ShieldAlert,Compass,DoorOpen,Lock,Trees,Search,HeartPulse} from 'lucide-react';

type Props={state:V10;animalSrc:(id:AnimalId)=>string;onMove:(index:number,pace:Pace)=>void;onRetreat:()=>void;onHunt:(action:{type:HuntMode;cell?:number;clue?:number})=>void;onMedkit:()=>void;onDecision:(action:'leave'|'survey'|'risk')=>void;feedback:string};
const labels={empty:'통로',wall:'막힌 통로',track:'발자국',cache:'물자',hazard:'오염',signal:'기록 신호',animal:'생체 신호',exit:'귀환'};
const toolNames:Record<HuntTool,string>={bait:'먹이 유인',sound:'음향 유인',light:'조명 유인',barrier:'경로 차단'};
export default function FieldExplorationV68({state:s,animalSrc,onMove,onRetreat,onHunt,onMedkit,onDecision,feedback}:Props){
 const root=useRef<HTMLElement>(null),locked=useRef(false);
 const [cursor,setCursor]=useState(0),[tool,setTool]=useState<HuntTool|null>(null),[notice,setNotice]=useState(''),[paused,setPaused]=useState(false),[gauge,setGauge]=useState(0);
 const field=s.field,hunt=s.capture?.hunt,run=s.run;
 const located=hunt?.located!=null;
 useEffect(()=>{root.current?.focus({preventScroll:true})},[]);
 useEffect(()=>{locked.current=false},[field?.position,hunt?.turn]);
 useEffect(()=>{
  if(!located||paused)return;
  let value=0,direction=1;
  const timer=window.setInterval(()=>{
   if(document.hidden||document.querySelector('[aria-modal="true"]'))return;
   const speed=['rabbit','deer','moth'].includes(hunt!.species)?5:3;
   value+=direction*speed;if(value>=100){value=100;direction=-1;}if(value<=0){value=0;direction=1;}
   setGauge(value);
  },70);
  return()=>window.clearInterval(timer);
 },[located,paused,hunt?.species]);
 if(!run||!field)return null;
 const width=hunt?8:fieldWidth(field),height=hunt?8:fieldHeight(field),region=regions.find(r=>r.id===run.region)!;
 const phase=located?'포획':hunt?'추적':field.clues?'흔적 발견':'탐색';
 const remaining=hunt?hunt.actions:Math.max(0,20-field.steps);
 function move(dx:number,dy:number){
  if(paused||field!.choice||locked.current)return;
  const at=hunt?cursor:field!.position,x=at%width+dx,y=Math.floor(at/width)+dy;
  if(x<0||y<0||x>=width||y>=height){setNotice('지도의 가장자리입니다. 다른 방향을 선택하세요.');return;}
  const next=y*width+x;
  if(hunt){setCursor(next);return;}
  if(field!.tiles[next]==='wall'){setNotice('무너진 통로입니다. 빛나는 인접 칸으로 이동하세요.');return;}
  locked.current=true;setNotice('');onMove(next,'normal');
 }
 function inspect(cell=cursor){
  if(paused||field!.choice||locked.current)return;
  if(hunt){locked.current=true;setCursor(cell);onHunt({type:tool??'search',cell});setTool(null);window.setTimeout(()=>{locked.current=false},120);}
  else{
   const target=field!.tiles.findIndex((tile,i)=>adjacentField(field!.position,i,width,field!.tiles.length)&&['track','signal','cache','animal'].includes(tile));
   if(target<0){setNotice('인접한 조사 지점이 없습니다. 지도에서 이동 가능한 칸을 선택하세요.');return;}
   onMove(target,'quiet');
  }
 }
 function capture(){if(!paused&&located&&!locked.current){locked.current=true;onHunt({type:'capture',clue:gauge});window.setTimeout(()=>{locked.current=false},120);}}
 function key(e:KeyboardEvent){
  if(e.target instanceof HTMLElement&&(e.target.matches('input,select,textarea')||e.target.isContentEditable)||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
  if(document.querySelector('[aria-modal="true"]'))return;
  const dir:Record<string,[number,number]>={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};
  const name=e.key.toLowerCase();
  if(dir[name]){e.preventDefault();move(...dir[name]);}
  else if(name==='e'){e.preventDefault();inspect();}
  else if(name==='f'){e.preventDefault();capture();}
  else if(name==='escape'){e.preventDefault();setPaused(p=>!p);}
 }
 const last=notice||hunt?.lastEvent||feedback||field.lastEvent;
 return <section ref={root} tabIndex={0} onKeyDown={key} className="field-v68" aria-label="탐사 조작 영역">
  <header className="field-header"><div><span>현장 탐사 · {phase}</span><h2>{region.name}</h2></div><div className="field-metrics"><span>체력 <b>{s.stamina}</b></span><span>위험 <b>{hunt?.predator??field.pressure??0}%</b></span><span>{hunt?'남은 행동':'수색 목표까지'} <b>{remaining}</b></span></div><button onClick={()=>setPaused(!paused)}>{paused?'재개':'일시정지'}</button><button onClick={onRetreat}>{hunt?'추적 중단':'귀환 · 회수 30%'}</button></header>
  <div className="field-objective" role="status"><strong>현재 목표</strong> {located?'안전 구간에 바늘이 들어올 때 포획하세요.':hunt?'발자국과 풀 흔들림으로 이동 경로를 좁히세요.':'밝은 인접 칸으로 이동해 생체 신호를 찾으세요.'}</div>
  <div className="field-layout">
   <div className="field-stage" data-tour="run-choice">
    <div className="field-scroll"><div className={'field-grid '+(hunt?'is-hunt':'')} style={{'--columns':width,'--rows':height,backgroundImage:`linear-gradient(#161b22aa,#191720bb),url(/assets/backgrounds/${region.art}.webp)`} as CSSProperties}>
     {(hunt?hunt.terrain:field.tiles).map((tile,i)=>{
      const here=!hunt&&i===field.position,seen=!!hunt||fieldVisible(field,i,run.gear.includes('flashlight')?2:1),walk=!hunt&&adjacentField(field.position,i,width,field.tiles.length)&&tile!=='wall';
      const evidence=hunt?observedEvidence(hunt,i):null,object=hunt?.objects.find(o=>o.cell===i),animal=hunt?.located===i;
      const meaningful=!!hunt||seen;
      return <button key={i} type="button" className={'field-cell '+(seen?'seen':'unseen')+(here?' current':'')+(walk?' reachable':'')+(hunt&&i===cursor?' selected':'')+(animal?' located':'')+' terrain-'+(meaningful?tile:'unknown')} disabled={paused||!!field.choice||(!hunt&&!walk)} onClick={()=>{if(hunt)inspect(i);else if(!locked.current){locked.current=true;onMove(i,'normal');}}} aria-label={`${Math.floor(i/width)+1}행 ${i%width+1}열 · ${hunt?(animal?'개체 발견':evidence?.kind==='footprint'?'과거 발자국':evidence?.kind==='rustle'?'풀 흔들림':'조사 지점'):here?'현재 위치':seen?labels[tile as keyof typeof labels]:'미확인'}`}>
       <span className="field-terrain"><Trees/></span>
       {here?<span className="field-player"><Compass/><b>관리자</b></span>:animal?<img className="field-animal" src={animalSrc(hunt!.species)} alt="발견한 개체"/>:hunt?<>{evidence?.kind==='footprint'?<Footprints/>:evidence?.kind==='rustle'?<Radio/>:null}{object&&<b>{toolNames[object.kind]}</b>}<small>{String.fromCharCode(65+i%8)}{Math.floor(i/8)+1}</small></>:seen?<>{tile==='track'?<Footprints/>:tile==='cache'?<Package/>:tile==='hazard'?<ShieldAlert/>:tile==='wall'?<Lock/>:tile==='exit'?<DoorOpen/>:['signal','animal'].includes(tile)?<Radio/>:null}<small>{tile==='empty'?(walk?'이동':'통로'):labels[tile as keyof typeof labels]}</small></>:<small>미확인</small>}
      </button>;
     })}
    </div></div>
    {paused&&<div className="field-pause"><h3>탐사 일시정지</h3><button onClick={()=>setPaused(false)}>탐사 재개</button></div>}
    {field.choice&&<div className="field-choice" role="dialog" aria-modal="true" aria-label="현장 선택"><h3>{field.choice.title}</h3><p>{field.choice.description}</p><div className="ops-toolbar"><button onClick={()=>onDecision('leave')}>지나가기</button><button onClick={()=>onDecision('survey')}>신중 조사 · ST 3</button><button onClick={()=>onDecision('risk')}>강행 회수 · ST 6</button></div></div>}
    <div className="field-controls"><div className="field-dpad"><button aria-label="위로 이동" onClick={()=>move(0,-1)}><ArrowUp/></button><button aria-label="왼쪽 이동" onClick={()=>move(-1,0)}><ArrowLeft/></button><button aria-label="아래로 이동" onClick={()=>move(0,1)}><ArrowDown/></button><button aria-label="오른쪽 이동" onClick={()=>move(1,0)}><ArrowRight/></button></div><button disabled={paused||!!field.choice} onClick={()=>inspect()}><Search/> E 조사</button><button disabled={paused||!located} onClick={capture}>F 포획</button></div>
    {located&&<div className="capture-timing"><span>포획 거리 확보 · 초록 구간에서 멈추세요</span><div className="capture-track"><i className="capture-safe"/><i className="capture-needle" style={{left:gauge+'%'}}/></div><button disabled={paused} onClick={capture}>포획망 던지기 · F</button></div>}
    <p className="field-help">WASD / 방향키 이동 · E 조사 · F 포획 · ESC 일시정지 · 터치 버튼 지원</p>
   </div>
   <aside className="field-context">
    <h3>{located?specs.find(a=>a.id===hunt?.species)?.name:'미확인 생체 신호'}</h3>
    <ol className="field-phases">{['탐색','흔적 발견','추적','포획'].map(label=><li key={label} aria-current={label===phase?'step':undefined}>{label}</li>)}</ol>
    <p>흔적 <b>{hunt?Object.values(hunt.observations??{}).filter(e=>e.kind!=='empty').length:field.clues}</b> · 회수 물자 <b>{run.loot}</b></p>
    {hunt?<><div className="field-tools" data-tour="hunt-tools">{Object.entries(toolNames).map(([id,name])=><button disabled={paused||located} aria-pressed={tool===id} key={id} onClick={()=>setTool(tool===id?null:id as HuntTool)}>{name}</button>)}</div><p>{tool?`${toolNames[tool]} 선택 · 중앙 지도에서 배치할 칸을 누르세요.`:'도구 배치·조사마다 행동 1 소모'}</p><button disabled={paused||located} onClick={()=>onHunt({type:'wait'})}>청음 · 방향 확인</button><details data-tour="hunt-decode"><summary>행동 기록 {hunt.revealed.filter(Boolean).length}/3</summary>{HUNT_TRAITS[hunt.species].hints.map((hint,i)=><p key={i}>{hunt.revealed[i]?hint:<button disabled={paused||hunt.actions<=0} onClick={()=>onHunt({type:'reveal',clue:i})}>행동 기록 {i+1} 해독 · 행동 1</button>}</p>)}</details></>:<><p>장비: {run.gear.map(g=>({flashlight:'손전등',filter:'필터',scanner:'스캐너',medkit:'응급 키트',cage:'운송 케이지'}[g])).join(' · ')||'기본 포획망'}</p>{width>7&&<details><summary>지역 미니맵</summary><div className="field-minimap" style={{gridTemplateColumns:`repeat(${width},1fr)`}}>{field.tiles.map((_,i)=><span key={i} className={i===field.position?'current':field.visited.includes(i)?'seen':''}/>)}</div></details>}</>}
    {run.gear.includes('medkit')&&!run.medkitUsed&&<button disabled={s.mind>=100} onClick={onMedkit}><HeartPulse/> 응급 키트 사용</button>}
    <details><summary>회수 장부</summary><p>고철 {run.earned?.scrap??0} · 지식 {run.earned?.knowledge??0} · 단서 {run.earned?.clues??0}</p></details>
   </aside>
  </div>
  <footer className="field-radio" role="status" aria-live="polite"><Radio/><span><b>EVE</b> {last}</span></footer>
 </section>;
}
