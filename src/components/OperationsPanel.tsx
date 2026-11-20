'use client';
import {useEffect,useState,useRef} from 'react';
import type {V10} from '@/lib/game-v10';
import {CREW_PROFILES,type CrewId} from '@/lib/crew';
import {cameraNames,sceneObjects,cameraChange,reportCamera,startNightRepair,operateNightRepair,FUSE_TARGET} from '@/lib/field-operations';
import {DoorClosed,DoorOpen,Lightbulb,UtensilsCrossed,Camera,Zap} from 'lucide-react';

export function CameraComparison({state:s,onUpdate}:{state:V10;onUpdate:(s:V10)=>void}){
 const [camera,setCamera]=useState(0),[baseline,setBaseline]=useState(false);
 const changed=baseline?null:cameraChange(s,camera);
 const reports=s.operations?.cameraDay===s.day?s.operations.reports:{};
 const done=reports?.[String(camera)]!==undefined;
 return <section className="ops-panel" aria-label="CCTV 차이 관찰">
  <header><Camera/><div><h3>어제와 다른 것</h3><p>기준 영상을 비교하고 변한 물체를 누르세요. 변화가 없으면 정상 보고.</p></div></header>
  <div className="ops-toolbar">{cameraNames.map((name,i)=><button key={name} aria-pressed={camera===i} onClick={()=>{setCamera(i);setBaseline(false)}}>{name} {reports?.[String(i)]!==undefined?'· 판독 종료':''}</button>)}</div>
  <div className="ops-toolbar"><button aria-pressed={baseline} onClick={()=>setBaseline(!baseline)}>{baseline?'오늘 영상 보기':'어제 기준 보기'}</button><strong>{baseline?(s.day===1?'개장 전 기준 영상':'어제 기준 영상'):'오늘 생중계'}</strong></div>
  <div className="ops-camera-scene" data-baseline={baseline}>
   {sceneObjects.map((name,i)=><button key={name} className={'ops-scene-object object-'+i+(changed===i?' changed':'')} aria-label={`${name} 조사`} disabled={baseline||done||s.phase!=='day'||!!s.pendingIncident} onClick={()=>onUpdate(reportCamera(s,camera,i))}>
    {i===0?(changed===0?<DoorOpen/>:<DoorClosed/>):i===1?<UtensilsCrossed/>:<Lightbulb/>}<span>{name}</span>
   </button>)}
   {camera===0&&!baseline&&s.crew?.members.some(m=>m.id==='rabbit')&&s.headquarters.transferred.includes('rabbit')&&<div className="ops-cameo"><img src="/assets/staff/rabbit/portrait.webp" alt="빈 우리 앞에 서 있는 의무관"/><span>의무관은 빈 우리 앞에서 한동안 움직이지 않는다.</span></div>}<span className="ops-feed-label">CAM {camera+1} · {baseline?'기준':'현재'}</span>
  </div>
  <button disabled={baseline||done||s.phase!=='day'||!!s.pendingIncident} onClick={()=>onUpdate(reportCamera(s,camera,null))}>변화 없음 · 정상 보고</button>
  <p role="status">{s.operations?.lastFeedback||'EVE: 문, 급식대, 조명의 위치와 동작을 살펴보세요. 판독은 카메라마다 최대 세 번입니다.'}</p>
 </section>;
}

export function NightRepairBoard({state:s,onUpdate}:{state:V10;onUpdate:(s:V10)=>void}){
 const [crew,setCrew]=useState<CrewId|null>(null),[fuse,setFuse]=useState(0);
 const latest=useRef({s,onUpdate});latest.current={s,onUpdate};
 const r=s.operations?.night?.day===s.day?s.operations.night:null;
 useEffect(()=>{
  const timer=window.setInterval(()=>{
   const {s,onUpdate}=latest.current;
   if(document.hidden||document.querySelector('[data-repair-obscured="true"]'))return;
   const n=operateNightRepair(s,{type:'tick'});if(n!==s)onUpdate(n);
  },1000);
  return()=>window.clearInterval(timer);
 },[]);
 const marks=['●','▲','■'];
 return <section className="ops-panel ops-repair" aria-label="야간 전력 직접 수리">
  <header><Zap/><div><h3>격리동 비상 전원</h3><p>퓨즈를 연결하고 전력을 배치해 시설을 지키세요.</p></div><b>시설 전력 {s.power}%</b></header>
  {!r?<><label>지원 직원 <select value={crew??''} onChange={e=>setCrew((e.target.value||null) as CrewId|null)}><option value="">단독 작업</option>{s.crew?.members.filter(m=>m.mind>=25).map(m=><option key={m.id} value={m.id}>{CREW_PROFILES[m.id].post}</option>)}</select></label><p>의무관: 스트레스 피해 방지 · 보급관: 시설 피해 완화 · 보안관: 시간 +20초 · 서기관: 오접속 시간 손실 감소</p><button onClick={()=>onUpdate(startNightRepair(s,crew))}>비상 수리 시작 · 75초</button></>:<>
   <div className="ops-toolbar"><strong role="timer">남은 시간 {r.remaining}초</strong><span>가용 회로 4 / 배치 {r.loads.reduce((a,b)=>a+b,0)}</span>{r.status==='active'&&<button onClick={()=>onUpdate(operateNightRepair(s,{type:'pause'}))}>{r.paused?'수리 재개':'일시정지'}</button>}</div>
   <fieldset disabled={r.status!=='active'||r.paused}><legend>1. 퓨즈 선택 후 같은 표식의 소켓 클릭 · 드래그 지원</legend>
    <div className="ops-toolbar">{marks.map((mark,i)=><button draggable key={mark} aria-pressed={fuse===i} onDragStart={e=>e.dataTransfer.setData('text/plain',String(i))} onClick={()=>setFuse(i)} aria-label={`퓨즈 ${mark}`}>{mark} 퓨즈</button>)}</div>
    <div className="ops-toolbar">{FUSE_TARGET.map((target,i)=><button key={i} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const value=e.dataTransfer.getData('text/plain');if(/^[0-2]$/.test(value))onUpdate(operateNightRepair(s,{type:'wire',socket:i,fuse:Number(value)}));}} onClick={()=>onUpdate(operateNightRepair(s,{type:'wire',socket:i,fuse}))}>{marks[target]} 소켓 : {r.wires[i]<0?'비어 있음':marks[r.wires[i]]}</button>)}</div>
   </fieldset>
   <fieldset disabled={r.status!=='active'||r.paused}><legend>2. 전력 배치 · 격리문 2 / 관측 1 / 환기 1</legend><div className="ops-toolbar">{['격리문','관측','환기'].map((label,i)=><button key={label} onClick={()=>onUpdate(operateNightRepair(s,{type:'load',circuit:i}))}>{label} {'▰'.repeat(r.loads[i])}{'▱'.repeat(2-r.loads[i])}</button>)}</div></fieldset>
   {r.status==='active'&&<div className="ops-toolbar"><button disabled={r.paused} onClick={()=>onUpdate(operateNightRepair(s,{type:'submit'}))}>회로 검증 · 전원 연결</button><button onClick={()=>onUpdate(operateNightRepair(s,{type:'abandon'}))}>복구 포기 · 피해 감수</button></div>}
   <p role="status">{r.paused?'수리 일시정지 · 메뉴를 닫거나 창을 벗어나도 시간은 흐르지 않습니다.':s.operations?.lastFeedback}</p>
  </>}
 </section>;
}
