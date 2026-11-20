'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import type {V10} from '@/lib/game-v10';
import {regions} from '@/lib/game-v10';
import type {AnimalId} from '@/lib/sim';
import {adjacentField,fieldVisible,fieldWidth,fieldHeight,type Pace} from '@/lib/tactical-field';
import {HUNT_TRAITS,HUNT_SIZE,huntSearchAge,huntSearchedCount,observedEvidence,observationAge,type HuntMode,type HuntTool} from '@/lib/hidden-hunt';
import {ArrowLeft,Package,AlertTriangle,Radio,HeartPulse,Footprints,Clock3,Compass,ShieldAlert,ArrowUpRight,MapPin,Search,MoveRight,ScanEye,CheckCircle2,Lock,UnlockKeyhole} from 'lucide-react';

type Props={state:V10;animalSrc:(id:AnimalId)=>string;onMove:(index:number,pace:Pace)=>void;onRetreat:()=>void;onHunt:(action:{type:HuntMode;cell?:number;clue?:number})=>void;onMedkit:()=>void;onDecision:(action:'leave'|'survey'|'risk')=>void;feedback:string};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const tools:{kind:Exclude<HuntMode,'wait'|'reveal'>;name:string;cost:string;effect:string;tone:string}[]=[
 {kind:'search',name:'기본 조사',cost:'행동 1',effect:'선택한 딱 한 칸만 엽니다. 조사 시점의 발자국·풀 흔들림·빈칸을 확인합니다. 동물은 조사 직후 이동합니다.',tone:'search'},
 {kind:'bait',name:'먹이 배치',cost:'행동 1',effect:'호응하는 개체가 한 칸씩 접근 · 반복 시 학습',tone:'bait'},
 {kind:'sound',name:'잔향 소리',cost:'행동 1',effect:'소리 선호 개체 접근, 소음 민감 개체 도주',tone:'sound'},
 {kind:'light',name:'유도 조명',cost:'행동 1',effect:'빛을 좇거나 피하는 반응 · 타일 광원 점등',tone:'light'},
 {kind:'barrier',name:'경로 봉쇄',cost:'행동 1',effect:'붉은 차단막으로 그 칸 진입 금지 · 이동 경로 변경',tone:'barrier'}
];
function PawPixel(){return <svg className="v33-paw-pixel" viewBox="0 0 28 28" aria-hidden="true" shapeRendering="crispEdges"><g fill="currentColor"><rect x="6" y="5" width="4" height="6"/><rect x="12" y="3" width="4" height="7"/><rect x="19" y="6" width="4" height="6"/><rect x="3" y="12" width="4" height="5"/><rect x="10" y="13" width="9" height="4"/><rect x="7" y="17" width="15" height="7"/><rect x="10" y="24" width="10" height="2"/></g></svg>}
function PixelFoliage({variant}:{variant:number}){return <span className={'v33-leaf v33-leaf-'+variant} aria-hidden="true"><svg className="v36-grass-sprite" viewBox="0 0 64 64" shapeRendering="crispEdges" focusable="false">
  <path fill="#192a24" d="M0 48h64v16H0z M4 36h8v20H4z M18 28h7v30h-7z M42 26h7v32h-7z M54 41h7v17h-7z"/>
  <path fill="#436348" d="M6 50h7V27h-4V17H5v12h3z M17 50h8V23h-4V9h-5v18h4z M29 56h7V34h-4V17h-5v19h4z M39 52h7V26h5V12h-6v15h-6z M51 55h6V35h5V24h-6v12h-5z"/>
  <path fill="#6d8450" d="M7 16h4v17H7z M18 11h4v23h-4z M30 19h4v22h-4z M44 13h4v21h-4z M54 26h4v20h-4z"/>
  <path fill="#314b38" d="M0 58h64v6H0z M10 46h11v5H10z M26 52h14v6H26z M45 46h13v4H45z"/>
  <path fill="#98a46a" d="M10 26h4v5h-4z M19 13h3v8h-3z M33 30h3v7h-3z M48 23h3v8h-3z M57 32h3v6h-3z"/>
 </svg></span>}
function Status({title,value,level,color}:{title:string;value:string;level:number;color:'rose'|'cyan'|'gold'|'green'}){const tone={rose:'#ed9ba9',cyan:'#87d7d5',gold:'#eac383',green:'#91dabc'}[color];return <div className={'v33-status v57-field-ring v33-status-'+color}><div className="v57-field-ring-circle" style={{background:`conic-gradient(${tone} ${clamp(level)}%,#423849 ${clamp(level)}% 100%)`}}><div>{value}</div></div><span>{title}</span></div>}
export default function FieldMission({state,animalSrc,onMove,onRetreat,onHunt,onMedkit,onDecision,feedback}:Props){
 const [mode,setMode]=useState<Exclude<HuntMode,'wait'|'reveal'>>('search');
 const [notice,setNotice]=useState('');
 const [searchFlash,setSearchFlash]=useState<number|null>(null);
 const [walking,setWalking]=useState<{from:number;to:number}|null>(null);
 const walkTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const fieldChoiceFirstButton=useRef<HTMLButtonElement|null>(null);
 // The field guide is a fixed quick-read panel instead of a dropdown.
 useEffect(()=>()=>{if(walkTimeout.current)clearTimeout(walkTimeout.current)},[]);
 // A paused field event must announce itself where the player is looking: on the map.
 useEffect(()=>{if(state.field?.choice&&!state.capture)fieldChoiceFirstButton.current?.focus();},[state.field?.choice?.id,state.capture]);
 function walkTo(target:number){
  if(walking||!field||field.choice||!adjacentField(field.position,target,fieldWidth(field),field.tiles.length))return;
  setNotice('');setWalking({from:field.position,to:target});
  if(walkTimeout.current)clearTimeout(walkTimeout.current);
  walkTimeout.current=setTimeout(()=>{onMove(target,'normal');setWalking(null);walkTimeout.current=null},450);
 }

 // Keyboard travel is disabled while an overlay or field choice is active.
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{
   if(!state.field||state.capture||state.field.choice||event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
   if(document.querySelector('[aria-modal="true"]'))return;
   const target=event.target as HTMLElement|null;
   if(target&&['INPUT','TEXTAREA','SELECT'].includes(target.tagName))return;
   const d:Record<string,number>={w:-fieldWidth(state.field),ArrowUp:-fieldWidth(state.field),s:fieldWidth(state.field),ArrowDown:fieldWidth(state.field),a:-1,ArrowLeft:-1,d:1,ArrowRight:1};
   const shift=d[event.key];if(shift===undefined)return;
   const at=state.field.position+shift;
   if(!adjacentField(state.field.position,at,fieldWidth(state.field),state.field.tiles.length)||state.field.tiles[at]==='wall')return;
   event.preventDefault();walkTo(at);
  };
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[state.field?.position,state.field?.choice,state.capture,walking,state.run]);

 const run=state.run,field=state.field,capture=state.capture;
 if(!run||!field)return <section className="v33-missing">현장 연결이 끊겼습니다. 탐사 메뉴에서 다시 출동해 주세요.</section>;
 const region=regions.find(r=>r.id===run.region)!;
 const hunt=capture?.hunt;
 const pressure=field.pressure??clamp(field.steps*(7+Math.round(region.danger/22)));
 const width=fieldWidth(field),height=fieldHeight(field);
 const fieldProgress=Math.round(field.visited.length/field.tiles.length*100);
 const seasonalShiver=hunt&&hunt.turn>0&&hunt.turn%3===0?(()=>{const row=Math.floor(hunt.position/8),col=hunt.position%8;const neighbours=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].map(([dy,dx])=>[row+dy,col+dx]).filter(([r,c])=>r>=0&&r<8&&c>=0&&c<8);const at=neighbours[(hunt.seed+hunt.turn*11)%neighbours.length];return at?at[0]*8+at[1]:null;})():null;
 const species=hunt?HUNT_TRAITS[hunt.species]:null;
 const activeMode=tools.find(x=>x.kind===mode)!;
 const danger=!!hunt&&['wolf','lynx','mutant','chimera'].includes(hunt.species);
 const canWalkMedkit=run.gear.includes('medkit')&&!run.medkitUsed&&state.mind<100;
 const lastFeed=notice||feedback||hunt?.lastEvent||field.lastEvent;
 const lastCell=hunt?.lastSearch?.cell;
 const lastEvidence=hunt&&lastCell!==undefined?observedEvidence(hunt,lastCell):null;
 const lastAge=hunt&&lastCell!==undefined?observationAge(hunt,lastCell):-1;
 const lastCoord=lastCell===undefined?'':`${String.fromCharCode(65+lastCell%8)}${Math.floor(lastCell/8)+1}`;
 const evidencePresentation=lastEvidence?.kind==='footprint'?{label:'발자국 확인',description:'이 칸은 동물이 이전 턴에 밟고 지나간 자리입니다. 현재도 여기에 있다는 뜻은 아닙니다.',tone:'foot'}:lastEvidence?.kind==='rustle'?{label:'풀숲 흔들림',description:'직전 발자국에서 한 칸 이내의 흔적을 발견했습니다. 지금 위치는 알 수 없으며 다음 칸을 추리해야 합니다.',tone:'rustle'}:lastEvidence?.kind==='caught'?{label:'개체 발견',description:'현재 숨어 있던 위치를 정확히 찾았습니다. 안전 이송 절차를 시작합니다.',tone:'caught'}:{label:'아무 흔적 없음',description:'조사할 때에는 발자국이나 흔들림이 없었습니다. 나중에 동물이 다시 이 칸에 들어올 수 있습니다.',tone:'empty'};

 function tap(i:number){if(!hunt)return;setNotice('');if(mode==='search'){setSearchFlash(i);window.setTimeout(()=>setSearchFlash(x=>x===i?null:x),440);}onHunt({type:mode,cell:i});if(mode!=='search')setMode('search');}
 return <section className={'v33-expedition '+(hunt?'v33-is-hunt':'v33-is-field')} aria-label="잔향 추적 — 전술형 탐사 및 은신 포획">
  <header className="v33-banner">
   <div className="v33-banner-copy"><span className="v33-eyebrow">ARK // EXPEDITION RECORD : {String(state.day).padStart(3,'0')} <i>● FIELD SIGNAL</i></span><h2>{hunt?'보이지 않는 발자취':'수풀이 잠든 구역'}</h2><p>{hunt?'64칸 모두 어둠에 잠겨 있습니다. 직접 연 칸에만 그 순간의 흔적이 남고, 동물은 매 턴 다시 움직입니다.':'직접 걸어서 조사 구역을 확보하십시오. 시간이 지나면 외부 추적망이 가까워집니다.'}</p></div>
   <button className="v33-retreat v59-retreat" type="button" onClick={onRetreat}><ArrowLeft size={15}/>{hunt?'추적 중단':'긴급 귀환 · 회수 30%'}</button>
  </header>
  <div className="v59-field-essentials" role="status"><div><span>현장 ST</span><b>{state.stamina}/100</b><i style={{width:`${state.stamina}%`}}/></div><div><span>관리자 정신력</span><b>{state.mind}/100</b><i style={{width:`${state.mind}%`}}/></div><div><span>추적망</span><b>{pressure}/100</b><i style={{width:`${pressure}%`}}/></div></div>
  {!hunt&&(run.captures?.length??0)>0&&<div className="v41-field-continue" role="status"><CheckCircle2 size={17}/><span><strong>포획 처리 완료 · 탐사 진행 중</strong> 개체 처리 결과가 기록되었습니다. 남은 물자와 단서를 더 조사하거나 현장 철수로 보상을 정산하세요.</span><b>확인 {run.captures?.length}건</b></div>}
  <div className="v33-hud" aria-label="탐사 생존 상태">
   <Status title={hunt?'남은 행동':'조사 진행'} value={hunt?`${hunt.actions} / ${hunt.maxActions}`:`${fieldProgress}%`} level={hunt?100*hunt.actions/hunt.maxActions:fieldProgress} color="gold"/>
   <Status title={hunt?'추적 위험':'추적 압박'} value={hunt?`${hunt.predator}/100`:`${pressure}%`} level={hunt?hunt.predator:pressure} color="rose"/>
   <Status title="정신력" value={`${state.mind}/100`} level={state.mind} color="green"/>
   <Status title="현장 이동 ST" value={`${state.stamina}/100`} level={state.stamina} color="cyan"/>
  </div>
  <div className="v42-hud-help v44-hud-help"><span>정신력 = 신경 안정 · ST = 현장 이동</span><strong>{hunt?'3턴마다 풀숲 근처 반응 감지':field.choice?'현장 이벤트 발생 · 지도 중앙 선택지 클릭 후 이동':'WASD / 방향키 이동 · 청록색 칸이 이동 가능'}</strong></div>
  <div className="v33-mission-layout">
   <aside className="v44-specimen-column" aria-label="개체와 지역 정보">
    {hunt&&species?<>
     <span className="v33-eyebrow">SPECIMEN // {hunt.species.toUpperCase()}</span>
     <div className="v44-specimen-image"><img src={animalSrc(hunt.species)} alt="확보된 표본 이미지, 실제 위치는 미확인"/></div>
     <h3>{hunt.revealed.some(Boolean)?species.title:'행동 프로파일 · 미해독'}</h3>
     <p className="v44-specimen-desc">{hunt.revealed.some(Boolean)?species.short:'은폐된 행동 정보입니다. 아래 잠금 기록을 직접 해독하면 하나씩 공개됩니다.'}</p>
     <div data-tour="hunt-decode" className={'v47-trait-vault '+(hunt.tutorial?'v42-decode-target v42-tutorial-active':'')} aria-label="개체 행동 특성 해독">
      <div className="v47-trait-vault-head"><b>행동 특성 · {hunt.revealed.filter(Boolean).length}/3 해독</b><small>해독 1회 = 수색 행동 1</small></div>
      {species.hints.map((hint,i)=>{
       const known=!!hunt.revealed[i];
       return <button key={i} type="button" className={'v47-trait-card '+(known?'v47-trait-unlocked':'v47-trait-locked')} disabled={known||hunt.actions<1||hunt.outcome!=='playing'} onClick={()=>{setNotice('');onHunt({type:'reveal',clue:i})}} aria-label={known?`해독 완료 ${i+1}: ${hint}`:`미해독 행동 특성 ${i+1} · 해독 시 행동 1 소모`}>
        <span className="v47-trait-symbol">{known?<UnlockKeyhole size={15}/>:<Lock size={15}/>}</span>
        <span className="v47-trait-copy"><strong>{known?['서식지 반응','이동 습성','기억 패턴'][i]:`기밀 행동 0${i+1}`}</strong><small>{known?hint:'████ ███████ ████'}</small></span>
        <span className="v47-trait-action">{known?'복원':hunt.actions>0&&hunt.outcome==='playing'?'해독 -1':'대기'}</span>
       </button>
      })}
     </div>
     <div className="v44-specimen-risk"><span>은신 상태</span><b>{hunt.outcome==='playing'?'위치 미확정':'탐사 종료'}</b></div>
    </>:<>
     <span className="v33-eyebrow">ARK // SECTOR SURVEY</span>
     <div className="v44-sector-banner v61-sector-photo" style={{backgroundImage:`linear-gradient(160deg,#070b10b9,#121021bb),url(/assets/backgrounds/${region.art}.webp)`}} aria-label={`${region.name} 전경`} />
     <div className="v61-sector-name"><h3>{region.name}</h3><span className="v61-sector-signal"><i/> SIGNAL ACTIVE</span></div>
     <div className="v61-live-map-card" aria-label="현장 실시간 미니맵">
       <div className="v61-live-map-title"><b><MapPin size={13}/> LIVE MAP</b><span>{fieldWidth(field)} × {fieldHeight(field)}</span></div>
       <div className="v61-live-map" style={{gridTemplateColumns:`repeat(${fieldWidth(field)},minmax(0,1fr))`,aspectRatio:`${fieldWidth(field)}/${fieldHeight(field)}`}}>
        {field.tiles.map((tile,i)=>{const seen=fieldVisible(field,i);const here=field.position===i;const exit=tile==='exit'&&seen;
         return <span key={i} className={'v61-mini-tile'+(seen?' is-seen':'')+(tile==='wall'?' is-wall':'')+(here?' is-player':'')+(exit?' is-exit':'')} title={here?'관리자 현재 위치':exit?'귀환 지점':seen?'확인된 지역':'미확인'}>
          {here?<i className="v61-player-dot"/>:exit?<i className="v61-exit-dot"/>:null}
         </span>})}
       </div>
       <div className="v61-live-map-legend"><span><i/> 관리자</span><span><i/> 귀환지점</span></div>
     </div>
     <div className="v61-field-summary"><span>이동 <b>{field.steps}</b>칸</span><span>자원 <b>{field.loot}</b>점</span><span>현장 ST <b>{state.stamina}</b></span></div>
     {run.companion&&<p className="v57-companion-readout">동행: {({rabbit:'의무관',fox:'보급관',wolf:'보안관',deer:'서기관'} as Record<string,string>)[run.companion]}</p>}
     <div className="v44-specimen-traits"><b>현장 분석</b><p>탐사 경로: {field.steps}칸</p><p>회수 기록: {field.loot}점</p><p>생체 신호: {field.encountered?'조사 완료':'추적 중'}</p></div>
    </>}
   </aside>
   <div className="v33-theater" data-tour="run-choice">
    {hunt? <>
     <div className="v33-map-frame">
      <div className="v33-map-overline"><span><i/> SECTOR {run.region.toUpperCase()} · THICKET SCAN</span><b>GRID {HUNT_SIZE} × {HUNT_SIZE} · 수색 {huntSearchedCount(hunt)}/64</b></div>
      <div className={'v33-hidden-map v33-biome-'+run.region} style={{backgroundImage:`linear-gradient(135deg,#101b16dc,#10101ed2),url(/assets/backgrounds/${region.art}.webp)`}} role="group" aria-label="전부 가려진 추적 격자. 조사한 칸에서만 과거 흔적을 확인합니다.">
       {hunt.terrain.map((terrain,i)=>{
        const obj=hunt.objects.find(o=>o.cell===i);
        const age=huntSearchAge(hunt,i),opened=age>=0,recent=age>=0&&age<=2;
        const evidence=observedEvidence(hunt,i),evidenceAge=observationAge(hunt,i);
        const foot=evidence?.kind==='footprint',shake=evidence?.kind==='rustle';
        const newlyInspected=!!evidence&&evidenceAge<=1;
        const wasLast=hunt.lastSearch?.cell===i&&hunt.turn-(hunt.lastSearch?.turn??0)<=1;
        const label=!opened?'미수색 풀숲':foot?'조사 당시 이전 위치 발자국':shake?'조사 당시 발자국 주변의 풀 흔들림':evidence?.kind==='caught'?'발견 완료':'조사 당시 흔적 없음';
        return <button className={'v33-land '+(opened?'v33-land-'+terrain:'v35-unknown-land')+(foot?' v35-observed-foot':shake?' v35-observed-rustle':'')+(obj?' v33-placed v33-placed-'+obj.kind:'')+(opened?' v34-cleared':'')+(recent?' v34-fresh-clearing':'')+(wasLast?' v34-last-inspected v55-last-scan':'')+(mode==='search'?' v33-targeting':'')+(seasonalShiver===i?' v57-nearby-rustle':'')} type="button" key={i} onClick={()=>tap(i)} disabled={hunt.outcome!=='playing'} aria-label={`${Math.floor(i/8)+1}행 ${i%8+1}열 · ${label}${obj?' · '+obj.kind+' 설치됨':''}`} title={`${String.fromCharCode(65+i%8)}${Math.floor(i/8)+1} · ${label}${evidence?` (T${evidence.turn} 기록 · 현재 위치 아님)`:''}`}>
          {opened&&<span className="v34-open-ground" aria-hidden="true"/>}
          <PixelFoliage variant={(i*7+hunt.seed)%5}/>
          {opened&&<span className="v34-clear-mark" aria-hidden="true">{recent?'◈':'·'}</span>}
          {shake&&newlyInspected&&<span className="v33-rustle v35-inspected-rustle" aria-hidden="true"/>}
          {foot&&<PawPixel/>}
          {shake&&<span className="v35-rustle-signal" aria-hidden="true"><i/><i/><i/></span>}
          {opened&&!foot&&!shake&&<span className="v35-empty-mark" aria-hidden="true">{newlyInspected?'–':''}</span>}
          {obj&&<span className={'v33-world-effect v33-effect-'+obj.kind} aria-hidden="true"><i/><i/><i/></span>}
          {opened&&<span className="v36-tile-coord" aria-hidden="true">{String.fromCharCode(65+i%8)}{Math.floor(i/8)+1}</span>}{evidence&&<span className={'v35-evidence-age'+(evidenceAge>2?' v35-aged-evidence':'')} aria-hidden="true">T{evidence.turn}</span>}
          {wasLast&&<span key={`scan-${hunt.turn}-${i}`} className="v55-scan-contact" aria-hidden="true"/>}{searchFlash===i&&<span className="v57-grass-sweep" aria-hidden="true"/>}{seasonalShiver===i&&<span className="v57-ambient-pulse" aria-hidden="true"/>}
          <span className="v33-grid-cross" aria-hidden="true"/>
         </button>;
       })}
      </div>
      <div className="v33-map-bottom"><span><PawPixel/> 조사한 칸만 공개 · 발자국은 지난 자리</span><span>3턴마다 인접 1칸의 풀 반응 발생</span></div>
     </div>
     {Object.keys(hunt.observations??{}).length>0&&<div className="v58-trace-strip" aria-label="최근 수색으로 얻은 좌표 단서">{Object.entries(hunt.observations).filter(([,entry])=>hunt.turn-entry.turn<=3).sort((a,b)=>b[1].turn-a[1].turn).slice(0,3).map(([cell,entry])=><span key={cell} className={'v58-trace-'+entry.kind}>{String.fromCharCode(65+Number(cell)%8)}{Math.floor(Number(cell)/8)+1} · {entry.kind==='footprint'?'발자국':entry.kind==='rustle'?'풀 흔들림':entry.kind==='caught'?'개체 발견':'흔적 없음'} <small>T{entry.turn}</small></span>)}</div>}
     <div className="v58-hunt-command-bar" aria-label="지도 바로 아래 수색 조작">
       <div className="v58-hunt-live"><span className="v58-hunt-beacon"/><strong>{mode==='search'?'조사 기록 · 탐지 준비':activeMode.name+' 배치 모드'}</strong><small>남은 행동 {hunt.actions}회 · 수색한 칸도 재조사 가능</small></div>
       <button type="button" className="v58-listen" disabled={hunt.actions<=0||hunt.outcome!=='playing'} onClick={()=>{setNotice('');setMode('search');onHunt({type:'wait'})}}><Clock3 size={16}/> 청음 · 1행동 <MoveRight size={15}/></button>
     </div>
     <div key={`${hunt.turn}-${hunt.lastEvent}`} className={'v58-map-result'+(hunt.lastEvent.includes('근접 신호')?' is-near':'')+(hunt.lastEvent.includes('청음 결과')?' is-listen':'')} role="status" aria-live="polite"><Radio size={15}/><span>{hunt.lastEvent}</span></div>
     <div className="v33-stage-footnote"><span className="v33-scanner-dot"/> {hunt.lastSearch?`최근 수색: ${String.fromCharCode(65+hunt.lastSearch.cell%8)}${Math.floor(hunt.lastSearch.cell/8)+1} · 기록은 과거 위치입니다.`:'첫 수색으로 흔적 확인 · 청음은 대략적인 방향을 감지'} <span key={hunt.turn} className="v55-turn-counter">TURN {String(hunt.turn).padStart(2,'0')}</span></div>
    </>:<>
     <div className="v33-map-frame"><div className="v33-map-overline"><span><i/> FIELD ROUTE : {region.name}</span><b>GRID {width} × {height} · 귀환점 매 출동 변경</b></div>
      <div className="v57-mini-overlay" aria-label="현장 미니맵"><span>LIVE MAP · <b>● 관리자</b></span><div style={{gridTemplateColumns:`repeat(${width},4px)`}}>{field.tiles.map((t,i)=><i key={i} className={i===field.position?'here':field.visited.includes(i)?t==='wall'?'wall':'seen':'unknown'}/>)}</div></div>
      <div className={'v33-route-map v57-field-map v33-biome-'+run.region} style={{gridTemplateColumns:`repeat(${width},minmax(0,1fr))`,aspectRatio:`${width}/${height}`,['--v57-light-x' as string]:`${((field.position%width)+.5)/width*100}%`,['--v57-light-y' as string]:`${(Math.floor(field.position/width)+.5)/height*100}%`,backgroundImage:`linear-gradient(125deg,#121a16db,#0a091aeb),url(/assets/backgrounds/${region.art}.webp)`} as CSSProperties} role="group" aria-label="현장 이동 지도">
       {field.tiles.map((tile,i)=>{const visible=fieldVisible(field,i,run.gear.includes('scanner')?3:run.gear.includes('flashlight')?2:1),here=field.position===i,walk=adjacentField(field.position,i,width,field.tiles.length)&&tile!=='wall'&&(!field.choice);return <button type="button" key={i} disabled={!walk||!visible||!!walking} className={'v33-route-cell '+(!visible?'v33-route-fog':'')+(walk?' v33-route-next':'')+(walk&&visible&&!walking?' v62-route-walkable':'')+(here?' v33-route-current':'')+' v33-land-'+tile} onClick={()=>walkTo(i)} title={!visible?'미확인 지점':here?'담당자 위치':tile==='animal'?'생체 신호 포착':tile==='track'?'발자국':tile==='cache'?'물자':tile==='hazard'?'감염성 포자':tile==='exit'?'귀환 지점':tile==='wall'?'붕괴된 통로':'수색 가능 구역'}>
        <PixelFoliage variant={(i*5)%5}/>{here&&!walking?<span className="v33-route-player"><Compass size={19}/> 담당자</span>:!visible?<span className="v33-route-veiled"/>:tile==='wall'?<span className="v33-route-block"/>:tile==='animal'?<span className="v33-route-object v33-signal">✧<small>생체</small></span>:tile==='cache'?<span className="v33-route-object v33-cache">▤<small>보급</small></span>:tile==='track'?<PawPixel/>:tile==='hazard'?<span className="v33-route-object v33-hazard">◆<small>오염</small></span>:tile==='exit'?<span className="v33-route-object">⇥<small>귀환</small></span>:tile==='signal'?<span className="v33-route-object">✧<small>기록</small></span>:i===(field.origin??14)?<span className="v33-route-object">↩<small>입구 30%</small></span>:null}
         {walk&&visible&&!walking&&<span className="v62-move-indicator" aria-hidden="true">이동 <span>↗</span></span>}
       </button>})}
       {walking&&<span className="v42-walker-path" aria-hidden="true" style={{'--walk-from-x':`${((walking.from%width)+.5)/width*100}%`,'--walk-from-y':`${(Math.floor(walking.from/width)+.5)/height*100}%`,'--walk-to-x':`${((walking.to%width)+.5)/width*100}%`,'--walk-to-y':`${(Math.floor(walking.to/width)+.5)/height*100}%`} as React.CSSProperties}><span className="v42-walker-shadow"/><span className="v42-walker-head"/><span className="v42-walker-body"/><span className="v42-walker-limb left"/><span className="v42-walker-limb right"/><span className="v42-walker-lantern"/></span>}

      </div>
       {field.choice&&<section className="v62-map-choice-mask" role="dialog" aria-modal="true" aria-labelledby="v62-choice-heading" aria-describedby="v62-choice-description">
        <div className="v62-map-choice-card">
         <div className="v62-map-choice-alert"><AlertTriangle size={16}/><span>FIELD INTERVENTION · 이동 일시 정지</span><b>선택 필요</b></div>
         <h3 id="v62-choice-heading">{field.choice.title}</h3>
         <p id="v62-choice-description">{field.choice.description}</p>
         <div className="v62-choice-caption">다음 행동을 선택하면 탐사가 이어집니다.</div>
         <div className="v62-map-choice-actions">
          <button type="button" ref={fieldChoiceFirstButton} onClick={()=>onDecision('leave')}><span className="v62-choice-icon"><MoveRight size={17}/></span><strong>지나간다</strong><small>추가 손실 없이 진행</small></button>
          <button type="button" onClick={()=>onDecision('survey')}><span className="v62-choice-icon"><Search size={17}/></span><strong>신중 조사</strong><small>ST -3 · 지식 +2</small></button>
          <button type="button" className="v62-choice-risk" onClick={()=>onDecision('risk')}><span className="v62-choice-icon"><ShieldAlert size={17}/></span><strong>강행 회수</strong><small>ST -6 · 실패 위험 {field.choice.danger}%</small></button>
         </div>
        </div>
       </section>}
      <div className={'v33-map-bottom'+(field.choice?' v62-map-bottom-paused':'')}><span>{walking?'격리복 이동 중':field.choice?'⚠ 지도 중앙에서 행동을 선택하세요 · 선택 후 이동 재개':'빛나는 인접 칸 클릭 / WASD·방향키로 이동'}</span><span>이동 {field.steps} · 흔적 {field.clues} · 물자 {field.loot}</span></div>
     </div>
    </>}
    <div className="v42-field-ledger" aria-label="현재 탐사에서 획득한 보상 수량"><div className="v42-field-ledger-title"><Package size={15}/><strong>현장 회수 장부</strong><span>회수 즉시 적립 · 최종 보상은 철수 시 표시</span></div><div className="v42-field-ledger-items"><span>고철 <b>+{run.earned?.scrap??0}</b></span><span>지식 <b>+{run.earned?.knowledge??0}</b></span><span>단서 <b>+{run.earned?.clues??0}</b></span><span>물자 점수 <b>{run.loot}</b></span><span>처리 개체 <b>{run.captures?.length??0}</b></span></div></div>
   </div>
   <aside className="v33-side-console">
    {hunt&&species? <>
     <div className="v44-side-label"><ScanEye size={14}/> 포획 도구 · 아래 전술 아이템 선택 후 중앙 타일 클릭</div>
     <div className="v33-section-kicker"><ScanEye size={14}/> 전술 명령 <small>칸 선택 시 1턴 경과</small></div>
     <div data-tour="hunt-tools" className={"v33-tool-rack v42-tools-target v60-hunt-tools "+(hunt.tutorial?"v42-tutorial-active":"")}><div className="v60-hunt-record" role="status"><span><ScanEye size={14}/> 최근 조사 기록</span><strong>{hunt.lastSearch?`${String.fromCharCode(65+hunt.lastSearch.cell%8)}${Math.floor(hunt.lastSearch.cell/8)+1} 조사 완료`:'아직 조사한 수풀이 없습니다'}</strong><small>{hunt.lastEvent||'중앙 지도에서 칸을 선택하면 과거 흔적이 기록됩니다.'}</small></div>{tools.filter(t=>t.kind!=='search').map(t=><button type="button" key={t.kind} aria-pressed={mode===t.kind} onClick={()=>{setMode(t.kind);setNotice('')}} className={'v33-tool '+(mode===t.kind?'v33-tool-active ':'')+' v33-tool-'+t.tone}><span className="v33-tool-sample" aria-hidden="true"><i/><i/></span><span className="v33-tool-label"><b>{t.name}</b><small>{t.cost}</small></span></button>)}</div>
     {mode!=='search'&&<button type="button" className="v60-back-search" onClick={()=>{setMode('search');setNotice('')}}>기본 조사로 복귀 · 지도 칸 선택</button>}
     <div className="v33-command-detail"><strong>{activeMode.name}</strong><p>{activeMode.effect}</p>{hunt.revealed.some(Boolean)&&mode!=='search'&&<p className={'v58-tool-affinity '+(species.likes.includes(mode as HuntTool)?'likes':species.hates.includes(mode as HuntTool)?'hates':'neutral')}>{species.likes.includes(mode as HuntTool)?'● 해독된 습성: 이 자극에 접근 가능':species.hates.includes(mode as HuntTool)?'▲ 해독된 습성: 이 자극을 회피':'● 해독된 습성: 반응 불확실'}</p>}<span>위 지도에서 대상 칸을 직접 선택</span></div>
     
     <div className="v60-brief-observation" role="status" aria-live="polite"><b><Radio size={13}/> EVE · 조사 판독</b><strong>{lastEvidence?evidencePresentation.label:'흔적 수집 대기'}</strong><span>{lastEvidence?`${lastCoord} · ${evidencePresentation.description}`:'발자국은 지나간 자리, 풀 흔들림은 주변 한 칸 안의 이동 단서입니다.'}</span></div>
     {canWalkMedkit&&<button className="v33-wait v33-medkit" type="button" onClick={onMedkit}><HeartPulse size={15}/> 응급 키트 · 정신력 +20</button>}
     {danger&&<div className="v33-danger-warning"><ShieldAlert size={18}/><p><b>포식자 역추적 위험</b>행동 기회를 모두 소진하면 {species.risk}. 공격 전 경보를 확인하세요.</p></div>}
     <div className="v58-side-hint"><b>진행</b> 수색 {huntSearchedCount(hunt)}칸 · 재수색 가능 · 도구 선택 후 중앙 칸 클릭</div>

     <div className="v33-history"><span>최근 관측 기록</span>{hunt.log.slice(0,2).map((h,i)=><p key={`${h.turn}-${i}`}><b>T{h.turn}</b> {h.message}</p>)}</div>
    </>:<>
     <div className="v44-side-label"><Package size={14}/> 출동 장비 / 즉시 확인</div>
     <div className="v44-equipped">{run.gear.map(g=><span key={g}>{({flashlight:'손전등',filter:'바이오필터',scanner:'생체 스캐너',medkit:'응급 키트',cage:'운송 케이지'} as Record<string,string>)[g]}</span>)}</div>
     {canWalkMedkit&&<button className="v33-wait v33-medkit" type="button" onClick={onMedkit}><HeartPulse size={16}/> 응급 키트 사용 · 정신력 +20</button>}
     <div className={'v44-guide-static'+(field.choice?' v62-guide-paused':'')}><b>{field.choice?'⚠ 이동 일시 정지':'현장 안내'}</b><p>{field.choice?'지도 중앙에 나타난 현장 선택지 3개 중 하나를 선택하세요. 선택 후 탐사가 계속됩니다.':'빛나는 인접 칸 클릭·WASD 이동 · 정식 출구 100% · 긴급 철수 30%.'}</p></div>
     <div className="v33-broadcast v55-signal-report" role="status" aria-live="polite"><span className="v33-broadcast-label"><Radio size={13}/> EVE / LIVE TRANSCRIPT</span><p key={lastFeed} className="v55-signal-line">{lastFeed}</p></div>
     <div className="v33-travel-status"><span>추적망 접근</span><strong>{pressure}%</strong><i><em style={{width:pressure+'%'}}/></i><p>압박 100% 시 정신력 피해와 긴급 철수.</p></div>
     <div className="v33-travel-status"><span>탐사 목적</span><strong>{field.encountered?'신호 조사 완료':'야생 개체 발견'}</strong><p>흔적을 찾거나 귀환점을 확보하세요.</p></div>
    </>}

   </aside>
  </div>
 </section>
}
