'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Radio,HeartPulse,Brain,ChevronRight,ShieldAlert,Lock,BookOpen} from 'lucide-react';
import {CREW_IDS,CREW_PROFILES,CREW_LOSS_EFFECTS,type CrewId} from '@/lib/crew';
import type {V10} from '@/lib/game-v10';

export function StaffPortrait({id,className='',condition='safe'}:{id:CrewId;className?:string;condition?:'safe'|'unstable'|'critical'}){
 const sources=[
  ...(condition==='safe'?[]:[`/assets/staff/${id}/portrait_${condition}.webp`]),
  `/assets/staff/${id}/portrait.webp`,
  `/assets/cinematics/staff-arrivals/${id}/scene.webp`
 ];
 const [index,setIndex]=useState(0);
 useEffect(()=>setIndex(0),[id,condition]);
 const key=`${id}-${condition}`;
 const current=index;
 const fallback=current>=sources.length;
 const arrivalFrame=current===sources.length-1;
 return <span className={'v45-portrait v53-staff-portrait '+className+' '+condition+(fallback?' uses-fallback':'')+(arrivalFrame?' uses-arrival-frame':'')} title={fallback?'인물 초상화가 누락되어 임시 이니셜을 표시합니다.':arrivalFrame?'도착 기록(scene.webp)을 초상화 대신 표시합니다.':CREW_PROFILES[id].post}>
  {current<sources.length?<img key={`${key}-${current}`} src={sources[current]} alt={CREW_PROFILES[id].post} onError={()=>setIndex(v=>Math.min(sources.length,v+1))}/>:<span className="v45-portrait-fallback">{CREW_PROFILES[id].title.slice(0,1)}</span>}
  {fallback&&<small className="v53-staff-fallback-label">PERSONNEL RECORD</small>}
 </span>;
}
export type CinematicKind='eve'|CrewId;
/** Full-screen, uncropped cinematic. Art and captions always occupy separate regions. */
export function CinematicScene({kind,onFinish}:{kind:CinematicKind;onFinish:()=>void}){
 const [imageStatus,setImageStatus]=useState<'loading'|'loaded'|'missing'>('loading');
 const [step,setStep]=useState(0);
 const [shown,setShown]=useState(0);
 const textTimer=useRef<number|null>(null);
 const first=kind==='eve';
 const data=first?null:CREW_PROFILES[kind];
 const bg=first?'/assets/cinematics/eve-first-meeting/scene.webp':`/assets/cinematics/staff-arrivals/${kind}/scene.webp`;
 const lines=first?[
  'SECURE CHANNEL // OFFLINE · 2089',
  '비상 전원이 응답합니다. 유리창 너머에서 누군가 깨어납니다.',
  '아직 눈을 가진 것은 아닙니다. 하지만 당신을 보고 있습니다.'
 ]:[
  `HQ TRANSPORT // ${data!.post} ARRIVAL`,
  '지하 통로에서 반송 캡슐이 도착했습니다. 생체 기록은 암호화되어 있습니다.',
  `${data!.post} · 파견 인력 인증 완료. 이전 근무 기록은 보안 정책에 따라 비공개 처리되었습니다.`
 ];
 const line=lines[step]??'';
 useEffect(()=>{setImageStatus('loading');setStep(0);setShown(0);},[kind]);
 useEffect(()=>{
  setShown(0);
  let position=0;
  const timer=window.setInterval(()=>{
   position=Math.min(line.length,position+1);
   setShown(position);
   if(position>=line.length){window.clearInterval(timer);textTimer.current=null;}
  },27);
  textTimer.current=timer;
  return()=>{window.clearInterval(timer);textTimer.current=null;};
 },[kind,step,line]);
 function next(){if(shown<line.length){if(textTimer.current!==null)window.clearInterval(textTimer.current);textTimer.current=null;setShown(line.length);return;}if(step<lines.length-1){setStep(v=>v+1);return;}onFinish();}
 function previous(){setStep(v=>Math.max(0,v-1));}
 useEffect(()=>{
  const handler=(e:KeyboardEvent)=>{
   if(e.altKey||e.ctrlKey||e.metaKey)return;
   if(['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName))return;
   if(e.key==='ArrowRight'||(e.key===' '&&(e.target as HTMLElement)?.tagName!=='BUTTON')){e.preventDefault();next();}
   else if(e.key==='ArrowLeft'){e.preventDefault();previous();}
  };
  window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
 });
 return <div className="v45-cinematic-overlay v54-cinematic-overlay v62-cinema-overlay" role="dialog" aria-modal="true" aria-label={first?'EVE 첫 만남 연출':`${data!.post} 도착 연출`}>
  <div className={'v45-cinematic v54-cinematic v62-cinema '+(first?'is-eve':'is-crew')}>
   <header className="v45-cinematic-top v62-cinema-header"><span><Radio size={14}/> ARK // {first?'FIRST CONTACT':'PERSONNEL ARRIVAL'}</span><span className="v62-cinema-live"><i/> {imageStatus==='loaded'?'ARCHIVE RESTORED':imageStatus==='missing'?'IMAGE UNAVAILABLE':'SIGNAL DECODING'}</span><small>CHAPTER {String(step+1).padStart(2,'0')} / {String(lines.length).padStart(2,'0')}</small></header>
   <div className={'v45-cinematic-image v54-cinematic-image v62-cinema-stage '+(imageStatus==='loaded'?'is-loaded':'is-unavailable')}>
    <div className="v62-cinema-ambient" style={{backgroundImage:`url(${bg})`}} aria-hidden="true"/>
    <img key={bg} src={bg} className="v54-cinematic-art" alt={first?'주인공과 이브의 첫 만남 장면':`${data!.post} 본부 도착 장면`} onLoad={()=>setImageStatus('loaded')} onError={()=>setImageStatus('missing')}/>
    {imageStatus!=='loaded'&&<div className="v45-cinematic-fallback v54-cinematic-fallback">
      {first?<span>EVE <i>INITIALIZATION</i></span>:<div className="v53-cinematic-personnel"><StaffPortrait id={kind as CrewId} className="v53-cinematic-personnel-art"/><span>ARK / PERSONNEL ARRIVAL<i>{data!.post}</i></span></div>}
      {imageStatus==='missing'&&<div className="v54-image-status"><b>SCENE FILE UNAVAILABLE</b><span>이미지 파일이 확인되지 않습니다. 자막은 계속 진행할 수 있습니다.</span><a href={bg} target="_blank" rel="noreferrer">장면 파일 확인</a></div>}
    </div>}
    <div className="v62-cinema-stage-corner upper"><span>ARK / RECOVERED MEMORY</span><i/></div>
    <div className="v62-cinema-stage-corner lower"><i/><span>{first?'SUBJECT 000 // EVE':'PERSONNEL // TRANSFER RECORD'}</span></div>
   </div>
   <section className="v45-cinematic-bottom v62-cinema-subtitle" >
    <div className="v62-cinema-caption-top"><span className="v62-cinema-speaker-dot"/><strong>{first?'EVE · 최초 통신':`${data!.post} · 인사 기록`}</strong><span className="v62-cinema-caption-label">{first?'RECONSTRUCTED SIGNAL':'HEADQUARTERS ENCRYPTED FEED'}</span></div>
    <p className="v62-cinema-line" aria-label={line}>{line.slice(0,shown)}{shown<line.length&&<i className="v62-cinema-type-cursor" aria-hidden="true"/>}</p>
    <div className="v62-cinema-footer"><div className="v62-cinema-progress" aria-label={`장면 ${step+1} / ${lines.length}`}>{lines.map((_,idx)=><span key={idx} className={idx<=step?'active':''}/>)}</div><div className="v45-cinematic-controls v62-cinema-actions"><button type="button" onClick={previous} disabled={step===0}>이전</button><button type="button" className="v62-cinema-next" onClick={next}>{shown<line.length?'전체 대사 보기':step<lines.length-1?'다음 장면':'통신 연결'} <ChevronRight size={16}/></button><button type="button" className="v45-cinema-skip" onClick={onFinish}>건너뛰기</button></div></div>
   </section>
  </div>
 </div>;
}
export function CrewRoster({state,onSupport,onTalk,onTreat,onReplayArrival}:{state:V10;onSupport:(id:CrewId)=>void;onTalk:(id:CrewId)=>void;onTreat:(id:CrewId,kind:'medical'|'counsel')=>void;onReplayArrival?:(id:CrewId)=>void}){
 const [selected,setSelected]=useState<CrewId|null>(null);
 const [rosterOpen,setRosterOpen]=useState(false);
 const crew=state.crew;
 const selectedMember=crew?.members.find(m=>m.id===selected);
 const used=crew?.supportDay===state.day;const retired=crew?.retired??[];
 useEffect(()=>{if(!selected)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setSelected(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[selected]);

 return <section className="v45-roster" aria-label="본부 파견 인력과 일일 지원">
  <div className="v45-roster-head"><span><Radio size={12}/> HQ / STAFF</span><b>{crew?.members.length??0} / 4</b><button className="v69-roster-toggle" type="button" aria-expanded={rosterOpen} aria-controls="v69-roster-content" onClick={()=>setRosterOpen(v=>!v)}>{rosterOpen?"직원 접기":"직원 펼치기"} <ChevronRight size={14}/></button></div>
  <div id="v69-roster-content" className={"v69-roster-content "+(rosterOpen?"is-open":"")}>
  <div className="v45-roster-grid">{CREW_IDS.map(id=>{const member=crew?.members.find(m=>m.id===id);const lost=retired.includes(id);return <button key={id} className={'v45-roster-item '+(member?'arrived':lost?'v49-retired':'locked')+(selected===id?' selected':'')} disabled={!member} type="button" onClick={()=>setSelected(v=>v===id?null:id)} aria-label={`${CREW_PROFILES[id].post} ${member?`직원 상세`: lost?'영구 처리 · 복귀 불가':'아직 미배치'}`}>
   {member?<StaffPortrait key={`${id}-${member.mind<35?'critical':member.mind<62?'unstable':'safe'}`} id={id} condition={member.mind<35?'critical':member.mind<62?'unstable':'safe'}/>:<span className="v45-portrait v45-portrait-empty"><Lock size={15}/></span>}
   <span className="v60-staff-info"><b>{CREW_PROFILES[id].post}</b><small>{member?`정신력 ${member.mind} · ${member.mind<35?'위험':member.mind<62?'주의':'안정'}`:lost?'인격 신호 소실':'미배치'}</small>{member&&<span className="v60-staff-progress"><i style={{width:`${member.mind}%`}}/></span>}</span>
   {member&&<i className={member.mind<35?'v45-staff-danger':member.mind<62?'v45-staff-warning':'v45-staff-ok'}/>}
  </button>})}</div>
  {retired.length>0&&<div className="v49-roster-losses"><ShieldAlert size={14}/><span>시설 인력 공백 · {retired.map(id=>CREW_LOSS_EFFECTS[id].summary).join(' / ')}</span></div>}
  <div className="v45-roster-foot"><span>{used?'오늘의 지원 완료':'공동 지원: 하루 1회'}</span><span>{crew?.arrivalQueue?.length?`본부 복원 대기 ${crew.arrivalQueue.length}명 · 다음 날부터 하루 1명`:crew?.members.length?'직원 선택해 대화·지원':'공명 100% · 건강한 개체를 본부 이송'}</span></div>
  </div>
  {selectedMember&&selected&&createPortal(<div className="v67-staff-overlay" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setSelected(null)}}>
    <div className="v67-staff-modal" role="dialog" aria-modal="true" aria-labelledby="v67-staff-title" key={selected}>
     <div className="v67-staff-hero"><StaffPortrait id={selected} condition={selectedMember.mind<35?'critical':selectedMember.mind<62?'unstable':'safe'} className="v67-staff-hero-art"/><span className="v67-staff-hero-tint"/><div className="v67-staff-hero-label">ARK // PERSONNEL RECORD <b>{CREW_PROFILES[selected].post}</b></div></div>
     <div className="v67-staff-content">
      <div className="v67-staff-heading"><div><span className="micro-label">HQ // PERSONNEL</span><h2 id="v67-staff-title">{CREW_PROFILES[selected].post}</h2><p>{CREW_PROFILES[selected].personality}</p></div><button className="v67-staff-close" type="button" aria-label="직원 정보 닫기" onClick={()=>setSelected(null)}>×</button></div>
      <div className="v67-staff-mind"><span>정신 안정도</span><strong>{selectedMember.mind}<small> / 100</small></strong><div className="v60-staff-progress"><i style={{width:`${selectedMember.mind}%`}}/></div></div>
      <p className="v71-staff-trust">신뢰 {selectedMember.bond}% · {selectedMember.lastSpokenDay===state.day?'오늘의 교감 완료':'하루 한 번 대화로 신뢰와 정신 회복'}{(selectedMember.memoryStage??0)>0&&<><br/>{selectedMember.memoryStage===2?'자신의 보존 기록을 확인했다.':'설명할 수 없는 기억의 파편을 나눴다.'}</>}</p>
      {(state.originZero?.photos??0)>=7&&<div className="v69-staff-body-status"><span>복제 신체 안정도</span><strong>{selectedMember.stability??88}%</strong><div className="v60-staff-progress"><i style={{width:`${selectedMember.stability??88}%`,background:(selectedMember.stability??88)<35?'#e68da2':'#82c5c7'}}/></div><small>기억 잔향 {selectedMember.memoryEcho??0}% · 연결 보존 번호 {selectedMember.sourceSpecimenId??'기록 복구 중'}</small></div>}
      <p className="v67-staff-brief">{({rabbit:'응급처치와 회복을 돕습니다.',fox:'식량과 보급품을 추가로 확보합니다.',wolf:'야간 경계와 시설 방어를 지원합니다.',deer:'오염 관리와 기록 분석을 지원합니다.'} as Record<CrewId,string>)[selected]}</p>
      {selectedMember.mind<=28&&<div className="v45-roster-warning"><ShieldAlert size={13}/> 위험 상태 · 조속한 안정 조치가 필요합니다.</div>}
      <div className="v67-staff-action-grid">
       <button type="button" onClick={()=>{setSelected(null);onTalk(selected)}}><BookOpen size={16}/> 대화</button>
       <button type="button" className="primary" disabled={!!used||selectedMember.mind<=0||!!state.crew?.pendingTermination} onClick={()=>{setSelected(null);onSupport(selected)}}>오늘 지원</button>
       <button type="button" disabled={selectedMember.mind<=0||state.ap<1||state.medicine<1} onClick={()=>onTreat(selected,'medical')}><HeartPulse size={16}/> 의료 지원</button>
       <button type="button" disabled={selectedMember.mind<=0||state.ap<1} onClick={()=>onTreat(selected,'counsel')}><Brain size={16}/> 상담</button>
      </div>
      {onReplayArrival&&<button type="button" className="v67-staff-replay" onClick={()=>{setSelected(null);onReplayArrival(selected)}}>도착 장면 다시 보기 <ChevronRight size={15}/></button>}
     </div>
    </div>
   </div>,document.body)}
 </section>;
}

/** A one-way, multi-line neural termination. The only actual decision is '처리한다'. */
export function CrewCollapseScene({id,onTerminate}:{id:CrewId;onTerminate:()=>void}){
 const [step,setStep]=useState(0),[missing,setMissing]=useState(false);
 const [shown,setShown]=useState(0);
 const textTimer=useRef<number|null>(null);
 const profile=CREW_PROFILES[id],effect=CREW_LOSS_EFFECTS[id];
 const lines=effect.quote;
 const line=lines[step]??'';
 useEffect(()=>{setShown(0);let i=0;const timer=window.setInterval(()=>{i=Math.min(line.length,i+1);setShown(i);if(i===line.length){window.clearInterval(timer);textTimer.current=null;}},31);textTimer.current=timer;return()=>{window.clearInterval(timer);textTimer.current=null;}},[line,step]);
 function advance(){if(shown<line.length){if(textTimer.current!==null)window.clearInterval(textTimer.current);textTimer.current=null;setShown(line.length);return;}if(step<lines.length-1)setStep(step+1);else onTerminate();}
 return <div className="v49-collapse-shade" role="dialog" aria-modal="true" aria-label={`${profile.post} 인격 신호 소실`}>
  <div className="v49-collapse-window">
   <div className="v49-collapse-image">
    {!missing&&<img src={`/assets/cinematics/staff-terminations/${id}/scene.webp`} alt={`${profile.post} 마지막 장면`} onError={()=>setMissing(true)}/>}
    <div className="v49-collapse-glitch" aria-hidden="true"/>
    <div className="v49-collapse-diagnostics"><small>STAFF / NEURAL LINK FAILURE</small><strong>{profile.post}</strong><span>MENTAL RESILIENCE: 0% · IRREVERSIBLE</span></div>
   </div>
   <div className="v49-collapse-talk" ><span>FINAL VOICE LOG · {String(step+1).padStart(2,'0')} / 03</span><p aria-label={line}>“{line.slice(0,shown)}{shown<line.length&&<i className="v62-cinema-type-cursor" aria-hidden="true"/>}”</p><div className="v49-collapse-actions"><span>RECORDING // SIGNAL DECAY</span><button type="button" onClick={advance}>{shown<line.length?'전체 대사 보기':step<lines.length-1?'다음 대사':'처리한다'} <ChevronRight size={16}/></button></div></div>
  </div>
 </div>;
}
