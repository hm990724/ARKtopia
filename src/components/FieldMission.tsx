'use client';
import {useEffect,useRef,useState} from 'react';
import type {V10} from '@/lib/game-v10';
import {regions} from '@/lib/game-v10';
import type {AnimalId} from '@/lib/sim';
import {adjacentField,fieldVisible,type Pace} from '@/lib/tactical-field';
import {HUNT_TRAITS,HUNT_SIZE,huntSearchAge,huntSearchedCount,observedEvidence,observationAge,type HuntMode,type HuntTool} from '@/lib/hidden-hunt';
import {ArrowLeft,Package,AlertTriangle,Radio,HeartPulse,Footprints,Clock3,Compass,ShieldAlert,ArrowUpRight,MapPin,Search,BookOpen,MoveRight,ScanEye,CheckCircle2} from 'lucide-react';

type Props={state:V10;animalSrc:(id:AnimalId)=>string;onMove:(index:number,pace:Pace)=>void;onRetreat:()=>void;onHunt:(action:{type:HuntMode;cell?:number;clue?:number})=>void;onMedkit:()=>void;feedback:string};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const tools:{kind:Exclude<HuntMode,'wait'|'reveal'>;name:string;cost:string;effect:string;tone:string}[]=[
 {kind:'search',name:'수풀 수색',cost:'행동 1',effect:'선택한 딱 한 칸만 엽니다. 조사 시점의 발자국·풀 흔들림·빈칸을 확인합니다. 동물은 조사 직후 이동합니다.',tone:'search'},
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
function Status({title,value,level,color}:{title:string;value:string;level:number;color:'rose'|'cyan'|'gold'|'green'}){return <div className={'v33-status v33-status-'+color}><span>{title}</span><b>{value}</b><i><em style={{width:`${clamp(level)}%`}}/></i></div>}
export default function FieldMission({state,animalSrc,onMove,onRetreat,onHunt,onMedkit,feedback}:Props){
 const [mode,setMode]=useState<Exclude<HuntMode,'wait'|'reveal'>>('search');
 const [notice,setNotice]=useState('');
 const [walking,setWalking]=useState<{from:number;to:number}|null>(null);
 const walkTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 // The field guide is a fixed quick-read panel instead of a dropdown.
 useEffect(()=>()=>{if(walkTimeout.current)clearTimeout(walkTimeout.current)},[]);
 function walkTo(target:number){
  if(walking||!field||!adjacentField(field.position,target))return;
  setNotice('');setWalking({from:field.position,to:target});
  if(walkTimeout.current)clearTimeout(walkTimeout.current);
  walkTimeout.current=setTimeout(()=>{onMove(target,'normal');setWalking(null);walkTimeout.current=null},450);
 }

 const run=state.run,field=state.field,capture=state.capture;
 if(!run||!field)return <section className="v33-missing">현장 연결이 끊겼습니다. 탐사 메뉴에서 다시 출동해 주세요.</section>;
 const region=regions.find(r=>r.id===run.region)!;
 const hunt=capture?.hunt;
 const pressure=field.pressure??clamp(field.steps*(7+Math.round(region.danger/22)));
 const fieldProgress=Math.round(field.visited.length/35*100);
 const species=hunt?HUNT_TRAITS[hunt.species]:null;
 const activeMode=tools.find(x=>x.kind===mode)!;
 const danger=!!hunt&&['wolf','lynx','mutant','chimera'].includes(hunt.species);
 const canWalkMedkit=run.gear.includes('medkit')&&!run.medkitUsed&&state.hp<100;
 const lastFeed=notice||feedback||hunt?.lastEvent||field.lastEvent;
 const lastCell=hunt?.lastSearch?.cell;
 const lastEvidence=hunt&&lastCell!==undefined?observedEvidence(hunt,lastCell):null;
 const lastAge=hunt&&lastCell!==undefined?observationAge(hunt,lastCell):-1;
 const lastCoord=lastCell===undefined?'':`${String.fromCharCode(65+lastCell%8)}${Math.floor(lastCell/8)+1}`;
 const evidencePresentation=lastEvidence?.kind==='footprint'?{label:'발자국 확인',description:'이 칸은 동물이 이전 턴에 밟고 지나간 자리입니다. 현재도 여기에 있다는 뜻은 아닙니다.',tone:'foot'}:lastEvidence?.kind==='rustle'?{label:'풀숲 흔들림',description:'직전 발자국에서 한 칸 이내의 흔적을 발견했습니다. 지금 위치는 알 수 없으며 다음 칸을 추리해야 합니다.',tone:'rustle'}:lastEvidence?.kind==='caught'?{label:'개체 발견',description:'현재 숨어 있던 위치를 정확히 찾았습니다. 안전 이송 절차를 시작합니다.',tone:'caught'}:{label:'아무 흔적 없음',description:'조사할 때에는 발자국이나 흔들림이 없었습니다. 나중에 동물이 다시 이 칸에 들어올 수 있습니다.',tone:'empty'};

 function tap(i:number){if(!hunt)return;setNotice('');onHunt({type:mode,cell:i});if(mode!=='search')setMode('search');}
 return <section className={'v33-expedition '+(hunt?'v33-is-hunt':'v33-is-field')} aria-label="잔향 추적 — 전술형 탐사 및 은신 포획">
  <header className="v33-banner">
   <div className="v33-banner-copy"><span className="v33-eyebrow">ARK // EXPEDITION RECORD : {String(state.day).padStart(3,'0')} <i>● FIELD SIGNAL</i></span><h2>{hunt?'보이지 않는 발자취':'수풀이 잠든 구역'}</h2><p>{hunt?'64칸 모두 어둠에 잠겨 있습니다. 직접 연 칸에만 그 순간의 흔적이 남고, 동물은 매 턴 다시 움직입니다.':'직접 걸어서 조사 구역을 확보하십시오. 시간이 지나면 외부 추적망이 가까워집니다.'}</p></div>
   <button className="v33-retreat" type="button" onClick={onRetreat}><ArrowLeft size={15}/>{hunt?'추적 중단':'현장 철수'}</button>
  </header>
  {!hunt&&(run.captures?.length??0)>0&&<div className="v41-field-continue" role="status"><CheckCircle2 size={17}/><span><strong>포획 처리 완료 · 탐사 진행 중</strong> 개체 처리 결과가 기록되었습니다. 남은 물자와 단서를 더 조사하거나 현장 철수로 보상을 정산하세요.</span><b>확인 {run.captures?.length}건</b></div>}
  <div className="v33-hud" aria-label="탐사 생존 상태">
   <Status title={hunt?'남은 행동':'조사 진행'} value={hunt?`${hunt.actions} / ${hunt.maxActions}`:`${fieldProgress}%`} level={hunt?100*hunt.actions/hunt.maxActions:fieldProgress} color="gold"/>
   <Status title={hunt?'추적 위험':'추적 압박'} value={hunt?`${hunt.predator}/100`:`${pressure}%`} level={hunt?hunt.predator:pressure} color="rose"/>
   <Status title="HP · 생명력" value={`${state.hp}/100`} level={state.hp} color="green"/>
   <Status title="ST · 활동 체력" value={`${state.stamina}/100`} level={state.stamina} color="cyan"/>
  </div>
  <div className="v42-hud-help v44-hud-help"><span>HP 생존 · ST 이동</span><strong>{hunt?'명령 1회마다 남은 수색 행동 감소':'지도에서 인접 칸 이동 · 체력 소모'}</strong></div>
  <div className="v33-mission-layout">
   <aside className="v44-specimen-column" aria-label="개체와 지역 정보">
    {hunt&&species?<>
     <span className="v33-eyebrow">SPECIMEN // {hunt.species.toUpperCase()}</span>
     <div className="v44-specimen-image"><img src={animalSrc(hunt.species)} alt="확보된 표본 이미지, 실제 위치는 미확인"/></div>
     <h3>{HUNT_TRAITS[hunt.species].title}</h3>
     <p className="v44-specimen-desc">{hunt.revealed[0]?species.short:'행동 기록이 잠겨 있습니다. 오른쪽에서 습성 카드를 해독하세요.'}</p>
     <div className="v44-specimen-traits"><b>행동 특성 · {hunt.revealed.filter(Boolean).length}/3 복원</b>
      {species.hints.map((hint,i)=><p key={i} className={hunt.revealed[i]?'known':'unknown'}><span>0{i+1}</span>{hunt.revealed[i]?hint:'기록 암호화 · 오른쪽에서 해독'}</p>)}
     </div>
     <div className="v44-specimen-risk"><span>은신 상태</span><b>{hunt.outcome==='playing'?'위치 미확정':'탐사 종료'}</b></div>
    </>:<>
     <span className="v33-eyebrow">ARK // SECTOR SURVEY</span>
     <div className="v44-sector-banner" style={{backgroundImage:`linear-gradient(170deg,#0e1116b9,#0e101ae8),url(/assets/backgrounds/${region.art}.png)`}} />
     <h3>{region.name}</h3><p className="v44-specimen-desc">{region.desc}</p>
     <div className="v44-specimen-traits"><b>현장 분석</b><p>탐사 경로: {field.steps}칸</p><p>회수 기록: {field.loot}점</p><p>생체 신호: {field.encountered?'조사 완료':'추적 중'}</p></div>
    </>}
   </aside>
   <div className="v33-theater">
    {hunt? <>
     <div className="v33-map-frame">
      <div className="v33-map-overline"><span><i/> SECTOR {run.region.toUpperCase()} · THICKET SCAN</span><b>GRID {HUNT_SIZE} × {HUNT_SIZE} · 수색 {huntSearchedCount(hunt)}/64</b></div>
      <div className={'v33-hidden-map v33-biome-'+run.region} style={{backgroundImage:`linear-gradient(135deg,#101b16dc,#10101ed2),url(/assets/backgrounds/${region.art}.png)`}} role="group" aria-label="전부 가려진 추적 격자. 조사한 칸에서만 과거 흔적을 확인합니다.">
       {hunt.terrain.map((terrain,i)=>{
        const obj=hunt.objects.find(o=>o.cell===i);
        const age=huntSearchAge(hunt,i),opened=age>=0,recent=age>=0&&age<=2;
        const evidence=observedEvidence(hunt,i),evidenceAge=observationAge(hunt,i);
        const foot=evidence?.kind==='footprint',shake=evidence?.kind==='rustle';
        const newlyInspected=!!evidence&&evidenceAge<=1;
        const wasLast=hunt.lastSearch?.cell===i&&hunt.turn-(hunt.lastSearch?.turn??0)<=1;
        const label=!opened?'미수색 풀숲':foot?'조사 당시 이전 위치 발자국':shake?'조사 당시 발자국 주변의 풀 흔들림':evidence?.kind==='caught'?'발견 완료':'조사 당시 흔적 없음';
        return <button className={'v33-land '+(opened?'v33-land-'+terrain:'v35-unknown-land')+(foot?' v35-observed-foot':shake?' v35-observed-rustle':'')+(obj?' v33-placed v33-placed-'+obj.kind:'')+(opened?' v34-cleared':'')+(recent?' v34-fresh-clearing':'')+(wasLast?' v34-last-inspected':'')+(mode==='search'?' v33-targeting':'')} type="button" key={i} onClick={()=>tap(i)} disabled={hunt.outcome!=='playing'} aria-label={`${Math.floor(i/8)+1}행 ${i%8+1}열 · ${label}${obj?' · '+obj.kind+' 설치됨':''}`} title={`${String.fromCharCode(65+i%8)}${Math.floor(i/8)+1} · ${label}${evidence?` (T${evidence.turn} 기록 · 현재 위치 아님)`:''}`}>
          {opened&&<span className="v34-open-ground" aria-hidden="true"/>}
          <PixelFoliage variant={(i*7+hunt.seed)%5}/>
          {opened&&<span className="v34-clear-mark" aria-hidden="true">{recent?'◈':'·'}</span>}
          {shake&&newlyInspected&&<span className="v33-rustle v35-inspected-rustle" aria-hidden="true"/>}
          {foot&&<PawPixel/>}
          {shake&&<span className="v35-rustle-signal" aria-hidden="true"><i/><i/><i/></span>}
          {opened&&!foot&&!shake&&<span className="v35-empty-mark" aria-hidden="true">{newlyInspected?'–':''}</span>}
          {obj&&<span className={'v33-world-effect v33-effect-'+obj.kind} aria-hidden="true"><i/><i/><i/></span>}
          {opened&&<span className="v36-tile-coord" aria-hidden="true">{String.fromCharCode(65+i%8)}{Math.floor(i/8)+1}</span>}{evidence&&<span className={'v35-evidence-age'+(evidenceAge>2?' v35-aged-evidence':'')} aria-hidden="true">T{evidence.turn}</span>}
          <span className="v33-grid-cross" aria-hidden="true"/>
         </button>;
       })}
      </div>
      <div className="v33-map-bottom"><span><PawPixel/> 조사한 칸만 공개 · 발자국은 지난 자리</span><span>풀 흔들림은 주변 1칸 · 재방문 가능</span></div>
     </div>
     <div className="v33-stage-footnote"><span className="v33-scanner-dot"/> {hunt.lastSearch?`최근 수색: ${String.fromCharCode(65+hunt.lastSearch.cell%8)}${Math.floor(hunt.lastSearch.cell/8)+1} · 관측 기록은 시간이 지나면 낡습니다.`:'미수색 구역 · 모든 발자국과 풀 흔들림 비공개'} <span>TURN {String(hunt.turn).padStart(2,'0')}</span></div>
    </>:<>
     <div className="v33-map-frame"><div className="v33-map-overline"><span><i/> FIELD ROUTE : {region.name}</span><b>GRID 7 × 5</b></div>
      <div className={'v33-route-map v33-biome-'+run.region} style={{backgroundImage:`linear-gradient(125deg,#121a16db,#0a091aeb),url(/assets/backgrounds/${region.art}.png)`}} role="group" aria-label="현장 이동 지도">
       {field.tiles.map((tile,i)=>{const visible=fieldVisible(field,i,run.gear.includes('scanner')?3:run.gear.includes('flashlight')?2:1),here=field.position===i,walk=adjacentField(field.position,i)&&tile!=='wall';return <button type="button" key={i} disabled={!walk||!visible||!!walking} className={'v33-route-cell '+(!visible?'v33-route-fog':'')+(walk?' v33-route-next':'')+(here?' v33-route-current':'')+' v33-land-'+tile} onClick={()=>walkTo(i)} title={!visible?'미확인 지점':here?'담당자 위치':tile==='animal'?'생체 신호 포착':tile==='track'?'발자국':tile==='cache'?'물자':tile==='hazard'?'감염성 포자':tile==='exit'?'귀환 지점':tile==='wall'?'붕괴된 통로':'수색 가능 구역'}>
        <PixelFoliage variant={(i*5)%5}/>{here&&!walking?<span className="v33-route-player"><Compass size={19}/> 담당자</span>:!visible?<span className="v33-route-veiled"/>:tile==='wall'?<span className="v33-route-block"/>:tile==='animal'?<span className="v33-route-object v33-signal">✧<small>생체</small></span>:tile==='cache'?<span className="v33-route-object v33-cache">▤<small>보급</small></span>:tile==='track'?<PawPixel/>:tile==='hazard'?<span className="v33-route-object v33-hazard">◆<small>오염</small></span>:tile==='exit'?<span className="v33-route-object">⇥<small>귀환</small></span>:tile==='signal'?<span className="v33-route-object">✧<small>기록</small></span>:null}
       </button>})}
       {walking&&<span className="v42-walker-path" aria-hidden="true" style={{'--walk-from-x':`${((walking.from%7)+.5)/7*100}%`,'--walk-from-y':`${(Math.floor(walking.from/7)+.5)/5*100}%`,'--walk-to-x':`${((walking.to%7)+.5)/7*100}%`,'--walk-to-y':`${(Math.floor(walking.to/7)+.5)/5*100}%`} as React.CSSProperties}><span className="v42-walker-shadow"/><span className="v42-walker-head"/><span className="v42-walker-body"/><span className="v42-walker-limb left"/><span className="v42-walker-limb right"/><span className="v42-walker-lantern"/></span>}
      </div>
      <div className="v33-map-bottom"><span>{walking?'격리복 관리자 이동 중 · 다음 칸으로 접근': '강조된 인접 지역을 눌러 한 칸 이동'}</span><span>이동 {field.steps} · 흔적 {field.clues} · 물자 {field.loot}</span></div>
     </div>
    </>}
    <div className="v42-field-ledger" aria-label="현재 탐사에서 획득한 보상 수량"><div className="v42-field-ledger-title"><Package size={15}/><strong>현장 회수 장부</strong><span>회수 즉시 적립 · 최종 보상은 철수 시 표시</span></div><div className="v42-field-ledger-items"><span>고철 <b>+{run.earned?.scrap??0}</b></span><span>지식 <b>+{run.earned?.knowledge??0}</b></span><span>단서 <b>+{run.earned?.clues??0}</b></span><span>물자 점수 <b>{run.loot}</b></span><span>처리 개체 <b>{run.captures?.length??0}</b></span></div></div>
   </div>
   <aside className="v33-side-console">
    {hunt&&species? <>
     <div className="v44-side-label"><ScanEye size={14}/> 포획 도구 · 아래 전술 아이템 선택 후 중앙 타일 클릭</div>
     <div className="v33-section-kicker"><ScanEye size={14}/> 전술 명령 <small>칸 선택 시 1턴 경과</small></div>
     <div className={"v33-tool-rack v42-tools-target "+(hunt.tutorial?"v42-tutorial-active":"")}>{tools.map(t=><button type="button" key={t.kind} aria-pressed={mode===t.kind} onClick={()=>{setMode(t.kind);setNotice('')}} className={'v33-tool '+(mode===t.kind?'v33-tool-active ':'')+' v33-tool-'+t.tone}><span className="v33-tool-sample" aria-hidden="true"><i/><i/></span><span className="v33-tool-label"><b>{t.name}</b><small>{t.cost}</small></span></button>)}</div>
     <div className="v33-command-detail"><strong>{activeMode.name}</strong><p>{activeMode.effect}</p><span>위 지도에서 대상 칸을 직접 선택</span></div>
     <button type="button" className="v33-wait" onClick={()=>{setNotice('');setMode('search');onHunt({type:'wait'})}}><Clock3 size={16}/> 숨죽여 관찰 · 1턴 진행 <MoveRight size={15}/></button>
     <div className="v44-live-readout" aria-live="polite">     <div className={'v36-observation '+(lastEvidence?'v36-observation-'+evidencePresentation.tone:'v36-observation-idle')} role="status" aria-live="polite">
      <span className="v36-observation-emblem">{lastEvidence?.kind==='footprint'?<PawPixel/>:lastEvidence?.kind==='rustle'?<PixelFoliage variant={2}/>:lastEvidence?.kind==='caught'?<Search size={26}/>:<ScanEye size={26}/>}</span>
      <div className="v36-observation-copy"><span className="v36-observation-kicker">{lastEvidence?`${lastCoord} 조사 기록 · ${lastAge}턴 경과`:'EVE / 추적 기록 대기'}</span><strong>{lastEvidence?evidencePresentation.label:'먼저 풀숲 한 칸을 조사하세요'}</strong><p>{lastEvidence?evidencePresentation.description:'발자국과 풀 흔들림은 조사하지 않으면 보이지 않습니다. 조사하면 1행동을 소비하고, 동물은 그 직후 다시 움직입니다.'}</p></div>
      {lastEvidence&&<span className="v36-observation-stale">{lastAge>2?'지난 기록 · 재수색 가능':'직전 조사 · 현재 위치 미확정'}</span>}
     </div>
</div>
     <div className="v33-broadcast" role="status" aria-live="polite"><span className="v33-broadcast-label"><Radio size={13}/> EVE / LIVE TRANSCRIPT</span><p>{lastFeed}</p></div>
     <div className="v44-guide-static" aria-label="수색 판독 요령"><b>판독 기록 / 수풀의 반응</b><p><strong>발자국</strong> 이전 위치 · <strong>흔들림</strong> 주변 1칸 · <strong>빈 수풀</strong> 당시 흔적 없음. 동물은 한 번 행동할 때마다 움직입니다.</p></div>
     <div className="v33-section-kicker"><BookOpen size={14}/> 행동 습성 기록 <small>각 카드 해독 시 행동 -1</small></div>
     <div className={"v33-clue-cards v42-decode-target "+(hunt.tutorial?"v42-tutorial-active":"")}>
      {species.hints.map((clue,i)=><button type="button" key={i} className={'v33-clue '+(hunt.revealed[i]?'v33-clue-open':'')} disabled={hunt.revealed[i]||hunt.actions<1} onClick={()=>{setNotice('');onHunt({type:'reveal',clue:i})}} aria-label={hunt.revealed[i]?`해독한 힌트 ${i+1}: ${clue}`:`암호화된 행동 힌트 ${i+1}, 해독 시 행동 1 소모`}><span className="v33-clue-number">0{i+1}</span><span className="v33-clue-copy"><b>{hunt.revealed[i]?['서식지 반응','이동 습성','기억 패턴'][i]:'기밀 행동 패턴'}</b><small>{hunt.revealed[i]?clue:'기록을 해독하면 전술 힌트가 공개됩니다.'}</small></span><span className="v33-clue-cost">{hunt.revealed[i]?'확인':'해독 -1'}</span></button>)}
     </div>
     {canWalkMedkit&&<button className="v33-wait v33-medkit" type="button" onClick={onMedkit}><HeartPulse size={15}/> 응급 키트 · HP +20</button>}
     {danger&&<div className="v33-danger-warning"><ShieldAlert size={18}/><p><b>포식자 역추적 위험</b>행동 기회를 모두 소진하면 {species.risk}. 공격 전 경보를 확인하세요.</p></div>}
     <div className="v34-tactics-note"><b>수색 흔적 {huntSearchedCount(hunt)}칸 확보</b><span>열었던 칸은 다시 가려지지 않습니다. 다만 발자국과 풀 흔들림은 조사 당시의 기록이므로 현재도 그곳에 있다는 보장은 없습니다. 최근 2턴의 수색 소음만 개체 행동에 영향을 줍니다.</span></div>

     <div className="v33-history"><span>최근 관측 기록</span>{hunt.log.slice(0,2).map((h,i)=><p key={`${h.turn}-${i}`}><b>T{h.turn}</b> {h.message}</p>)}</div>
    </>:<>
     <div className="v44-side-label"><Package size={14}/> 출동 장비 / 즉시 확인</div>
     <div className="v44-equipped">{run.gear.map(g=><span key={g}>{({flashlight:'손전등',filter:'바이오필터',scanner:'생체 스캐너',medkit:'응급 키트',cage:'운송 케이지'} as Record<string,string>)[g]}</span>)}</div>
     {canWalkMedkit&&<button className="v33-wait v33-medkit" type="button" onClick={onMedkit}><HeartPulse size={16}/> 응급 키트 사용 · HP +20</button>}
     <div className="v44-guide-static"><b>현장 이동 매뉴얼</b><p>빛나는 인접 칸을 누르면 관리자가 이동합니다. 발자국은 동물이 다녀간 흔적, 물자 상자는 회수 자원, 붉은 표식은 오염입니다.</p><p>포획 성공 뒤에도 탐사 가능 · 회수 보상은 철수 시 일괄 정산됩니다.</p></div>
     <div className="v33-broadcast" role="status" aria-live="polite"><span className="v33-broadcast-label"><Radio size={13}/> EVE / LIVE TRANSCRIPT</span><p>{lastFeed}</p></div>
     <div className="v33-travel-status"><span>추적망 접근</span><strong>{pressure}%</strong><i><em style={{width:pressure+'%'}}/></i><p>한 번 이동할 때마다 시간이 흐릅니다. 압박이 100%에 도달하면 강제 철수합니다.</p></div>
     <div className="v33-travel-status"><span>탐사 목적</span><strong>{field.encountered?'신호 조사 완료':'야생 개체 발견'}</strong><p>지도를 끝까지 밝힐 필요는 없습니다. 자료를 챙겼다면 언제든 귀환할 수 있습니다.</p></div>
    </>}

   </aside>
  </div>
 </section>
}
