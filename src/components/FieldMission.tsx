'use client';
import {useState} from 'react';
import type {V10} from '@/lib/game-v10';
import {regions} from '@/lib/game-v10';
import type {AnimalId} from '@/lib/sim';
import {adjacentField,fieldVisible,type Pace} from '@/lib/tactical-field';
import {HUNT_TRAITS,HUNT_SIZE,huntSearchAge,huntSearchedCount,type HuntMode,type HuntTool} from '@/lib/hidden-hunt';
import {ArrowLeft,Radio,HeartPulse,Footprints,Clock3,Compass,ShieldAlert,ArrowUpRight,MapPin,Search,BookOpen,MoveRight,ScanEye} from 'lucide-react';

type Props={state:V10;animalSrc:(id:AnimalId)=>string;onMove:(index:number,pace:Pace)=>void;onRetreat:()=>void;onHunt:(action:{type:HuntMode;cell?:number;clue?:number})=>void;onMedkit:()=>void;feedback:string};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const tools:{kind:Exclude<HuntMode,'wait'|'reveal'>;name:string;cost:string;effect:string;tone:string}[]=[
 {kind:'search',name:'수풀 수색',cost:'행동 1',effect:'수풀을 열어 실제 위치를 확인합니다. 빈칸도 계속 표시되며 동물의 다음 이동은 막지 않습니다.',tone:'search'},
 {kind:'bait',name:'먹이 배치',cost:'행동 1',effect:'호응하는 개체가 한 칸씩 접근 · 반복 시 학습',tone:'bait'},
 {kind:'sound',name:'잔향 소리',cost:'행동 1',effect:'소리 선호 개체 접근, 소음 민감 개체 도주',tone:'sound'},
 {kind:'light',name:'유도 조명',cost:'행동 1',effect:'빛을 좇거나 피하는 반응 · 타일 광원 점등',tone:'light'},
 {kind:'barrier',name:'경로 봉쇄',cost:'행동 1',effect:'붉은 차단막으로 그 칸 진입 금지 · 이동 경로 변경',tone:'barrier'}
];
function PawPixel(){return <svg className="v33-paw-pixel" viewBox="0 0 28 28" aria-hidden="true" shapeRendering="crispEdges"><g fill="currentColor"><rect x="6" y="5" width="4" height="6"/><rect x="12" y="3" width="4" height="7"/><rect x="19" y="6" width="4" height="6"/><rect x="3" y="12" width="4" height="5"/><rect x="10" y="13" width="9" height="4"/><rect x="7" y="17" width="15" height="7"/><rect x="10" y="24" width="10" height="2"/></g></svg>}
function PixelFoliage({variant}:{variant:number}){return <span className={'v33-leaf v33-leaf-'+variant} aria-hidden="true"><i/><i/><i/><i/><i/></span>}
function Status({title,value,level,color}:{title:string;value:string;level:number;color:'rose'|'cyan'|'gold'|'green'}){return <div className={'v33-status v33-status-'+color}><span>{title}</span><b>{value}</b><i><em style={{width:`${clamp(level)}%`}}/></i></div>}
export default function FieldMission({state,animalSrc,onMove,onRetreat,onHunt,onMedkit,feedback}:Props){
 const [mode,setMode]=useState<Exclude<HuntMode,'wait'|'reveal'>>('search');
 const [notice,setNotice]=useState('');
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
 function tap(i:number){if(!hunt)return;setNotice('');onHunt({type:mode,cell:i});}
 return <section className={'v33-expedition '+(hunt?'v33-is-hunt':'v33-is-field')} aria-label="잔향 추적 — 전술형 탐사 및 은신 포획">
  <header className="v33-banner">
   <div className="v33-banner-copy"><span className="v33-eyebrow">ARK // EXPEDITION RECORD : {String(state.day).padStart(3,'0')} <i>● FIELD SIGNAL</i></span><h2>{hunt?'발자국이 멈춘 곳':'수풀이 잠든 구역'}</h2><p>{hunt?'확인한 풀숲은 계속 열려 있지만 안전한 칸은 아닙니다. 지난 턴 발자국으로 다음 이동 위치를 예측하세요.':'직접 걸어서 조사 구역을 확보하십시오. 시간이 지나면 외부 추적망이 가까워집니다.'}</p></div>
   <button className="v33-retreat" type="button" onClick={onRetreat}><ArrowLeft size={15}/>{hunt?'추적 중단':'현장 철수'}</button>
  </header>
  <div className="v33-hud" aria-label="탐사 생존 상태">
   <Status title={hunt?'남은 행동':'조사 진행'} value={hunt?`${hunt.actions} / ${hunt.maxActions}`:`${fieldProgress}%`} level={hunt?100*hunt.actions/hunt.maxActions:fieldProgress} color="gold"/>
   <Status title={hunt?'추적 위험':'추적 압박'} value={hunt?`${hunt.predator}/100`:`${pressure}%`} level={hunt?hunt.predator:pressure} color="rose"/>
   <Status title="생명력" value={`${state.hp}/100`} level={state.hp} color="green"/>
   <Status title="체력" value={`${state.stamina}/100`} level={state.stamina} color="cyan"/>
   <Status title="감염도" value={`${state.infection}%`} level={state.infection} color="rose"/>
   <Status title="EVE 코어" value={`${state.eve}/100`} level={state.eve} color="cyan"/>
  </div>
  <div className="v33-mission-layout">
   <div className="v33-theater">
    {hunt? <>
     <div className="v33-map-frame">
      <div className="v33-map-overline"><span><i/> SECTOR {run.region.toUpperCase()} · THICKET SCAN</span><b>GRID {HUNT_SIZE} × {HUNT_SIZE} · 수색 {huntSearchedCount(hunt)}/64</b></div>
      <div className={'v33-hidden-map v33-biome-'+run.region} style={{backgroundImage:`linear-gradient(135deg,#101b16dc,#10101ed2),url(/assets/backgrounds/${region.art}.png)`}} role="group" aria-label="발자국 추적 격자. 동물은 보이지 않습니다." data-tour="run-choice">
       {hunt.terrain.map((terrain,i)=>{
        const obj=hunt.objects.find(o=>o.cell===i),foot=hunt.footprints.includes(i),shake=hunt.shaking.includes(i);
        const age=huntSearchAge(hunt,i),opened=age>=0,recent=age>=0&&age<=2,wasLast=hunt.lastSearch?.cell===i&&hunt.turn-(hunt.lastSearch?.turn??0)<=1;
        return <button className={'v33-land v33-land-'+terrain+(foot?' v33-foot':'')+(shake?' v33-shake':'')+(obj?' v33-placed v33-placed-'+obj.kind:'')+(opened?' v34-cleared':'')+(recent?' v34-fresh-clearing':'')+(wasLast?' v34-last-inspected':'')+(mode==='search'?' v33-targeting':'')} type="button" key={i} onClick={()=>tap(i)} disabled={hunt.outcome!=='playing'} aria-label={`${Math.floor(i/8)+1}행 ${i%8+1}열${foot?' · 지난 턴 발자국':''}${shake?' · 수풀이 흔들리는 칸':''}${opened?' · 수색 완료, 동물 재진입 가능':''}${recent?' · 수색 소음 경계 중':''}${obj?' · '+obj.kind+' 장치':''}`} title={`${String.fromCharCode(65+i%8)}${Math.floor(i/8)+1} · ${foot?'지난 턴 발자국':shake?'수풀 흔들림':opened?'수색했던 풀숲 (재진입 가능)':'미확인 수풀'}`}>
          {opened&&<span className="v34-open-ground" aria-hidden="true"/>}
          <PixelFoliage variant={(i*7+hunt.seed)%5}/>
          {opened&&<span className="v34-clear-mark" aria-hidden="true">{recent?'◈':'·'}</span>}
          {shake&&<span className="v33-rustle" aria-hidden="true"/>}
          {foot&&<PawPixel/>}
          {obj&&<span className={'v33-world-effect v33-effect-'+obj.kind} aria-hidden="true"><i/><i/><i/></span>}
          {wasLast&&hunt.lastSearch&&!hunt.lastSearch.found&&<span className="v34-empty-stamp" aria-hidden="true">당시 빈칸</span>}
          <span className="v33-grid-cross" aria-hidden="true"/>
         </button>;
       })}
      </div>
      <div className="v33-map-bottom"><span><PawPixel/> 발자국 = 직전 위치 · 수색 기록은 계속 유지</span><span>최근 수색 2턴 경계 · 열린 칸도 재진입</span></div>
     </div>
     <div className="v33-stage-footnote"><span className="v33-scanner-dot"/> {hunt.lastSearch&&!hunt.lastSearch.found?`최근 확인: ${String.fromCharCode(65+hunt.lastSearch.cell%8)}${Math.floor(hunt.lastSearch.cell/8)+1} 비어 있음 · 다음 위치 재예측`:hunt.species==='fox'?'이상 신호: 진짜·가짜 발자국이 함께 감지되었습니다.':'생체 열영상 차단 · 현재 위치 비공개'} <span>TURN {String(hunt.turn).padStart(2,'0')}</span></div>
    </>:<>
     <div className="v33-map-frame"><div className="v33-map-overline"><span><i/> FIELD ROUTE : {region.name}</span><b>GRID 7 × 5</b></div>
      <div className={'v33-route-map v33-biome-'+run.region} style={{backgroundImage:`linear-gradient(125deg,#121a16db,#0a091aeb),url(/assets/backgrounds/${region.art}.png)`}} data-tour="run-choice" role="group" aria-label="현장 이동 지도">
       {field.tiles.map((tile,i)=>{const visible=fieldVisible(field,i,run.gear.includes('scanner')?3:run.gear.includes('flashlight')?2:1),here=field.position===i,walk=adjacentField(field.position,i)&&tile!=='wall';return <button type="button" key={i} disabled={!walk||!visible} className={'v33-route-cell '+(!visible?'v33-route-fog':'')+(walk?' v33-route-next':'')+(here?' v33-route-current':'')+' v33-land-'+tile} onClick={()=>{setNotice('');onMove(i,'normal')}} title={!visible?'미확인 지점':here?'담당자 위치':tile==='animal'?'생체 신호 포착':tile==='track'?'발자국':tile==='cache'?'물자':tile==='hazard'?'감염성 포자':tile==='exit'?'귀환 지점':tile==='wall'?'붕괴된 통로':'수색 가능 구역'}>
        <PixelFoliage variant={(i*5)%5}/>{here?<span className="v33-route-player"><Compass size={19}/> 담당자</span>:!visible?<span className="v33-route-veiled"/>:tile==='wall'?<span className="v33-route-block"/>:tile==='animal'?<span className="v33-route-object v33-signal">✧<small>생체</small></span>:tile==='cache'?<span className="v33-route-object v33-cache">▤<small>보급</small></span>:tile==='track'?<PawPixel/>:tile==='hazard'?<span className="v33-route-object v33-hazard">◆<small>오염</small></span>:tile==='exit'?<span className="v33-route-object">⇥<small>귀환</small></span>:tile==='signal'?<span className="v33-route-object">✧<small>기록</small></span>:null}
       </button>})}
      </div>
      <div className="v33-map-bottom"><span>강조된 인접 지역을 눌러 한 칸 이동</span><span>이동 {field.steps} · 흔적 {field.clues} · 물자 {field.loot}</span></div>
     </div>
    </>}
    <div className="v33-broadcast" role="status" aria-live="polite"><span className="v33-broadcast-label"><Radio size={13}/> EVE / LIVE TRANSCRIPT</span><p>{lastFeed}</p></div>
   </div>
   <aside className="v33-side-console">
    {hunt&&species? <>
     <div className="v33-specimen"><div className="v33-animal-frame"><img src={animalSrc(hunt.species)} alt="발견한 종의 표본 이미지 · 실제 위치가 아님"/></div><div><span className="v33-eyebrow">UNKNOWN POSITION / {hunt.species.toUpperCase()}</span><h3>{hunt.revealed[0]?species.title:'미확인 행동 패턴'}</h3><p>{hunt.revealed[0]?species.short:'EVE의 생체 분석 데이터가 잠겨 있습니다. 행동 분석을 해독하면 개체의 반응을 알 수 있습니다.'}</p></div></div>
     <div className="v33-section-kicker"><BookOpen size={14}/> 행동 습성 기록 <small>각 카드 해독 시 행동 -1</small></div>
     <div className="v33-clue-cards">
      {species.hints.map((clue,i)=><button type="button" key={i} className={'v33-clue '+(hunt.revealed[i]?'v33-clue-open':'')} disabled={hunt.revealed[i]||hunt.actions<1} onClick={()=>{setNotice('');onHunt({type:'reveal',clue:i})}} aria-label={hunt.revealed[i]?`해독한 힌트 ${i+1}: ${clue}`:`암호화된 행동 힌트 ${i+1}, 해독 시 행동 1 소모`}><span className="v33-clue-number">0{i+1}</span><span className="v33-clue-copy"><b>{hunt.revealed[i]?['서식지 반응','이동 습성','기억 패턴'][i]:'기밀 행동 패턴'}</b><small>{hunt.revealed[i]?clue:'기록을 해독하면 전술 힌트가 공개됩니다.'}</small></span><span className="v33-clue-cost">{hunt.revealed[i]?'확인':'해독 -1'}</span></button>)}
     </div>
     <div className="v33-section-kicker"><ScanEye size={14}/> 전술 명령 <small>칸 선택 시 1턴 경과</small></div>
     <div className="v33-tool-rack">{tools.map(t=><button type="button" key={t.kind} aria-pressed={mode===t.kind} onClick={()=>{setMode(t.kind);setNotice('')}} className={'v33-tool '+(mode===t.kind?'v33-tool-active ':'')+' v33-tool-'+t.tone}><span className="v33-tool-sample" aria-hidden="true"><i/><i/></span><span className="v33-tool-label"><b>{t.name}</b><small>{t.cost}</small></span></button>)}</div>
     <div className="v33-command-detail"><strong>{activeMode.name}</strong><p>{activeMode.effect}</p><span>위 지도에서 대상 칸을 직접 선택</span></div>
     <button type="button" className="v33-wait" onClick={()=>{setNotice('');onHunt({type:'wait'})}}><Clock3 size={16}/> 숨죽여 관찰 · 1턴 진행 <MoveRight size={15}/></button>
     {danger&&<div className="v33-danger-warning"><ShieldAlert size={18}/><p><b>포식자 역추적 위험</b>행동 기회를 모두 소진하면 {species.risk}. 공격 전 경보를 확인하세요.</p></div>}
     <div className="v34-tactics-note"><b>수색 흔적 {huntSearchedCount(hunt)}칸 확보</b><span>밝게 열린 칸은 조사한 장소입니다. 동물이 다시 숨을 수 있고, 최근 2턴의 수색 소음에만 경계 반응을 보입니다.</span></div>
     {hunt.tutorial&&<div className="v33-tutorial-note">EVE · 첫 토끼는 튜토리얼 개체입니다. 발자국과 8칸의 흔들림을 관찰해 보세요. 초회 구조는 확정 보정됩니다.</div>}
     <div className="v33-history"><span>최근 관측 기록</span>{hunt.log.slice(0,2).map((h,i)=><p key={`${h.turn}-${i}`}><b>T{h.turn}</b> {h.message}</p>)}</div>
    </>:<>
     <div className="v33-intro-panel"><span className="v33-eyebrow">SURVEY / OPERATING MANUAL</span><h3>발자국을 따라 들어가라</h3><p>발자국·연구 기록·보급 상자를 발견해 조사합니다. 생체 신호가 나타나면 숨겨진 동물을 찾는 추적 게임으로 전환됩니다.</p><div className="v33-flow-lines"><span><Footprints size={17}/> 지난 흔적 조사</span><span><ArrowUpRight size={16}/> 위험 구역 통과</span><span><Search size={16}/> 생체 신호 탐지</span></div></div>
     <div className="v33-travel-status"><span>추적망 접근</span><strong>{pressure}%</strong><i><em style={{width:pressure+'%'}}/></i><p>한 번 이동할 때마다 시간이 흐릅니다. 압박이 100%에 도달하면 강제 철수합니다.</p></div>
     <div className="v33-travel-status"><span>탐사 목적</span><strong>{field.encountered?'신호 조사 완료':'야생 개체 발견'}</strong><p>지도를 끝까지 밝힐 필요는 없습니다. 자료를 챙겼다면 언제든 귀환할 수 있습니다.</p></div>
    </>}
    {canWalkMedkit&&<button className="v33-wait v33-medkit" type="button" onClick={onMedkit}><HeartPulse size={16}/> 응급 키트 사용 · 생명력 +20</button>}
   </aside>
  </div>
 </section>
}
