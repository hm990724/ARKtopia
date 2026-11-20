'use client';
import {useEffect,useState} from 'react';
import {Radio,HeartPulse,Brain,ChevronRight,ShieldAlert,Lock,BookOpen} from 'lucide-react';
import {CREW_IDS,CREW_PROFILES,CREW_LOSS_EFFECTS,type CrewId} from '@/lib/crew';
import type {V10} from '@/lib/game-v10';

export function StaffPortrait({id,className='',condition='safe'}:{id:CrewId;className?:string;condition?:'safe'|'unstable'|'critical'}){
 const sources=[
  ...(condition==='safe'?[]:[`/assets/staff/${id}/portrait_${condition}.png`]),
  `/assets/staff/${id}/portrait.png`,
  `/assets/staff/${id}/portrait.webp`,
  `/assets/cinematics/staff-arrivals/${id}/scene.png`,
  `/assets/animals/${id}_uncanny.png`,
  `/assets/animals/${id}.png`
 ];
 const [index,setIndex]=useState(0);
 useEffect(()=>setIndex(0),[id,condition]);
 const key=`${id}-${condition}`;
 const current=index;
 const fallback=current>=sources.length-2;
 const arrivalFrame=current===sources.length-3;
 return <span className={'v45-portrait v53-staff-portrait '+className+' '+condition+(fallback?' uses-fallback':'')+(arrivalFrame?' uses-arrival-frame':'')} title={fallback?'인물 초상화와 도착 기록이 없어 동물 기록 이미지를 표시합니다.':arrivalFrame?'도착 기록(scene.png)을 초상화 대신 표시합니다.':CREW_PROFILES[id].post}>
  {current<sources.length?<img key={`${key}-${current}`} src={sources[current]} alt={CREW_PROFILES[id].post} onError={()=>setIndex(v=>Math.min(sources.length,v+1))}/>:<span className="v45-portrait-fallback">{CREW_PROFILES[id].title.slice(0,1)}</span>}
  {fallback&&<small className="v53-staff-fallback-label">PERSONNEL RECORD</small>}
 </span>;
}
export type CinematicKind='eve'|CrewId;
export function CinematicScene({kind,onFinish}:{kind:CinematicKind;onFinish:()=>void}){
 const [imageStatus,setImageStatus]=useState<'loading'|'loaded'|'missing'>('loading');
 const [step,setStep]=useState(0);
 const first=kind==='eve';const data=first?null:CREW_PROFILES[kind];
 const bg=first?'/assets/cinematics/eve-first-meeting/scene.png':`/assets/cinematics/staff-arrivals/${kind}/scene.png`;
 useEffect(()=>{setImageStatus('loading');setStep(0);},[kind]);
 const lines=first?[
  'SECURE CHANNEL // OFFLINE · 2089',
  '비상 전원이 응답합니다. 유리창 너머에서 누군가 깨어납니다.',
  '아직 눈을 가진 것은 아닙니다. 하지만 당신을 보고 있습니다.'
 ]:[
  `HQ TRANSPORT // ${data!.post} ARRIVAL`,
  '지하 통로에서 반송 캡슐이 도착했습니다. 생체 기록은 암호화되어 있습니다.',
  `PERSONNEL ${kind.toUpperCase()} · ${data!.post} · 신경 분화 안정화. 본부는 원본 조직의 출처를 비공개 처리했습니다.`
 ];
 return <div className="v45-cinematic-overlay v54-cinematic-overlay" role="dialog" aria-modal="true" aria-label={first?'EVE 첫 만남 연출':`${data!.post} 도착 연출`}>
  <div className={'v45-cinematic v54-cinematic '+(first?'is-eve':'is-crew')}>
   <div className="v45-cinematic-scan" aria-hidden="true"/>
   <div className={'v45-cinematic-image v54-cinematic-image '+(imageStatus==='loaded'?'is-loaded':'is-unavailable')}>
    <img key={bg} src={bg} className="v54-cinematic-art" alt={first?'EVE 첫 만남 배경':`${data!.post} 본부 도착 장면`} onLoad={()=>setImageStatus('loaded')} onError={()=>setImageStatus('missing')}/>
    {imageStatus!=='loaded'&&<div className="v45-cinematic-fallback v54-cinematic-fallback">
      {first?<span>EVE <i>INITIALIZATION</i></span>:<div className="v53-cinematic-personnel"><StaffPortrait id={kind as CrewId} className="v53-cinematic-personnel-art"/><span>ARK / PERSONNEL ARRIVAL<i>{data!.post}</i></span></div>}
      {imageStatus==='missing'&&<div className="v54-image-status"><b>SCENE FILE UNAVAILABLE</b><span>배포된 이미지 응답 실패 · 아래 파일을 확인하세요.</span><a href={bg} target="_blank" rel="noreferrer">scene.png 직접 열어 확인</a></div>}
    </div>}
   </div>
   <div className="v45-cinematic-top"><span><Radio size={14}/> ARK · {first?'EMERGENCY AWAKENING':'PERSONNEL RECONSTRUCTION'}</span><small>{String(step+1).padStart(2,'0')} / 03 · {imageStatus==='loaded'?'SCENE ONLINE':imageStatus==='missing'?'SIGNAL LOST':'DECODING'}</small></div>
   <div className="v45-cinematic-bottom" key={step}><span>{first?'FIRST CONTACT / UNKNOWN VOICE':'HQ / UNVERIFIED ORIGIN'}</span><p>{lines[step]}</p><div className="v45-cinematic-controls"><button type="button" onClick={()=>setStep(v=>Math.max(0,v-1))} disabled={step===0}>이전</button><button type="button" onClick={()=>step<2?setStep(v=>v+1):onFinish()}>{step<2?'다음 장면':'통신 연결'} <ChevronRight size={16}/></button><button type="button" className="v45-cinema-skip" onClick={onFinish}>연출 건너뛰기</button></div></div>
  </div>
 </div>;
}
export function CrewRoster({state,onSupport,onTalk,onTreat,onReplayArrival}:{state:V10;onSupport:(id:CrewId)=>void;onTalk:(id:CrewId)=>void;onTreat:(id:CrewId,kind:'medical'|'counsel')=>void;onReplayArrival?:(id:CrewId)=>void}){
 const [selected,setSelected]=useState<CrewId|null>(null);
 const crew=state.crew;
 const selectedMember=crew?.members.find(m=>m.id===selected);
 const used=crew?.supportDay===state.day;const retired=crew?.retired??[];
 return <section className="v45-roster" aria-label="본부 파견 인력과 일일 지원">
  <div className="v45-roster-head"><span><Radio size={12}/> HQ / STAFF</span><b>{crew?.members.length??0} / 4</b></div>
  <div className="v45-roster-grid">{CREW_IDS.map(id=>{const member=crew?.members.find(m=>m.id===id);const lost=retired.includes(id);return <button key={id} className={'v45-roster-item '+(member?'arrived':lost?'v49-retired':'locked')+(selected===id?' selected':'')} disabled={!member} type="button" onClick={()=>setSelected(v=>v===id?null:id)} aria-label={`${CREW_PROFILES[id].post} ${member?`직원 상세`: lost?'영구 처리 · 복귀 불가':'아직 미배치'}`}>
   {member?<StaffPortrait key={`${id}-${member.mind<35?'critical':member.mind<62?'unstable':'safe'}`} id={id} condition={member.mind<35?'critical':member.mind<62?'unstable':'safe'}/>:<span className="v45-portrait v45-portrait-empty"><Lock size={15}/></span>}
   <span className="v60-staff-info"><b>{CREW_PROFILES[id].post}</b><small>{member?`정신력 ${member.mind} · ${member.mind<35?'위험':member.mind<62?'주의':'안정'}`:lost?'인격 신호 소실':'미배치'}</small>{member&&<span className="v60-staff-progress"><i style={{width:`${member.mind}%`}}/></span>}</span>
   {member&&<i className={member.mind<35?'v45-staff-danger':member.mind<62?'v45-staff-warning':'v45-staff-ok'}/>}
  </button>})}</div>
  {retired.length>0&&<div className="v49-roster-losses"><ShieldAlert size={14}/><span>시설 인력 공백 · {retired.map(id=>CREW_LOSS_EFFECTS[id].summary).join(' / ')}</span></div>}
  <div className="v45-roster-foot"><span>{used?'오늘의 지원 완료':'공동 지원: 하루 1회'}</span><span>{crew?.members.length?'직원 선택해 대화·지원':'본부 이송 후 인력 파견'}</span></div>
  {selectedMember&&selected&&<div className="v45-roster-detail">
   <header><b>{CREW_PROFILES[selected].post} <small>· 본부 직원</small></b><button type="button" onClick={()=>setSelected(null)} aria-label="직원 상세 닫기">×</button></header>
   <div className="v45-roster-stats"><span>정신력 <b>{selectedMember.mind}/100</b></span></div>
   <p>{CREW_PROFILES[selected].benefit}</p><small className="v45-personality">{CREW_PROFILES[selected].personality}</small><div className="v51-staff-guide">지원 시 정신력 -5 · 영입 후 5일 동안 자연 감소 없음 · 이후 몇 일 간격으로 천천히 감소. 감염 70% 이상이면 추가 감소하며, 10일 회의에서 선택받지 못하면 -10입니다.</div>
   {(selectedMember.mind<=28)&&<div className="v45-roster-warning"><ShieldAlert size={13}/> 신경 불안정 · 야간 공격 위험</div>}
   <div className="v53-crew-replay"><button type="button" onClick={()=>onReplayArrival?.(selected)}>본부 도착 기록 재생</button></div><div className="v45-roster-actions"><button onClick={()=>onTalk(selected)}><BookOpen size={13}/> 대화</button><button className="support" disabled={!!used||selectedMember.mind<=0||!!state.crew?.pendingTermination} onClick={()=>onSupport(selected)}>오늘 지원</button></div>
   <div className="v45-care-actions"><button disabled={selectedMember.mind<=0||state.ap<1||state.medicine<1} onClick={()=>onTreat(selected,'medical')}><HeartPulse size={13}/> 신경 회복 +28 · 약1</button><button disabled={selectedMember.mind<=0||state.ap<1} onClick={()=>onTreat(selected,'counsel')}><Brain size={13}/> 대화 안정 +12 · AP 1</button></div>
  </div>}
 </section>;
}

/** A one-way, multi-line neural termination. The only actual decision is '처리한다'. */
export function CrewCollapseScene({id,onTerminate}:{id:CrewId;onTerminate:()=>void}){
 const [step,setStep]=useState(0),[missing,setMissing]=useState(false);
 const profile=CREW_PROFILES[id],effect=CREW_LOSS_EFFECTS[id];
 const lines=effect.quote;
 return <div className="v49-collapse-shade" role="dialog" aria-modal="true" aria-label={`${profile.post} 인격 신호 소실`}>
  <div className="v49-collapse-window">
   <div className="v49-collapse-image">
    {!missing&&<img src={`/assets/cinematics/staff-terminations/${id}/scene.png`} alt={`${profile.post} 마지막 장면`} onError={()=>setMissing(true)}/>}
    <div className="v49-collapse-glitch" aria-hidden="true"/>
    <div className="v49-collapse-diagnostics"><small>STAFF / NEURAL LINK FAILURE</small><strong>{profile.post}</strong><span>MENTAL RESILIENCE: 0% · IRREVERSIBLE</span></div>
   </div>
   <div className="v49-collapse-talk" key={step}><span>FINAL VOICE LOG · {String(step+1).padStart(2,'0')} / 03</span><p>“{lines[step]}”</p><div className="v49-collapse-actions"><span>RECORDING // SIGNAL DECAY</span><button type="button" onClick={()=>step<lines.length-1?setStep(step+1):onTerminate()}>{step<lines.length-1?'다음 대사':'처리한다'} <ChevronRight size={16}/></button></div></div>
  </div>
 </div>;
}
