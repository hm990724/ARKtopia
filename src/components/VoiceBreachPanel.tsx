'use client';
import {useEffect,useRef,useState} from 'react';
import {AudioLines,ChevronRight,DoorClosed,DoorOpen,LockKeyhole,Radio,ScanEye,ShieldAlert,Volume2,VolumeX} from 'lucide-react';
import type {VoiceEvent,VoiceProbe,VoiceRecord,VoiceVerdict,VoiceReading} from '@/lib/voice-breach';
import {voiceProbeNames,voiceSignal,voiceKnockPattern} from '@/lib/voice-breach';

type Props={event:VoiceEvent;history:VoiceRecord[];onProbe:(kind:VoiceProbe,reading?:VoiceReading,alignment?:number)=>void;onVerdict:(verdict:VoiceVerdict)=>void};
const probes:{id:VoiceProbe;subtitle:string;symbol:string}[]=[
 {id:'eve',subtitle:'음성 파형·인증 주파수 대조',symbol:'01'},
 {id:'enclosure',subtitle:'우리 안의 개체 위치·생체 신호',symbol:'02'},
 {id:'personnel',subtitle:'직원 출입 태그·교대 기록',symbol:'03'}
];
export default function VoiceBreachPanel({event,history,onProbe,onVerdict}:Props){
 const [muted,setMuted]=useState(true);
 const [confirmation,setConfirmation]=useState<VoiceVerdict|null>(null);
 const [active,setActive]=useState<VoiceProbe|null>(null);
 const [phase,setPhase]=useState(0);
 const context=useRef<AudioContext|null>(null);
 useEffect(()=>{setConfirmation(null);setActive(null);setPhase(0)},[event.id]);
 function knock(){if(muted)return;try{const ctx=context.current??new AudioContext();context.current=ctx;voiceKnockPattern(event).reduce<number[]>((times,delay)=>[...times,(times.at(-1)??-delay)+delay],[]).forEach((offset,index)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.value=68+index*7;gain.gain.setValueAtTime(0,ctx.currentTime+offset);gain.gain.linearRampToValueAtTime(.09,ctx.currentTime+offset+.014);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+offset+.105);osc.connect(gain);gain.connect(ctx.destination);osc.start(ctx.currentTime+offset);osc.stop(ctx.currentTime+offset+.12);});}catch{}}
 useEffect(()=>()=>{void context.current?.close();context.current=null},[]);
 const done=event.checks.length;
 return <div className="v56-voice-backdrop" role="dialog" aria-modal="true" aria-label="미확인 음성 · 야간 CCTV 출입 판정">
  <div className="v56-voice-shell">
   <header className="v56-voice-head"><div><span className="v56-micro"><Radio size={14}/> ARK // NIGHT SURVEILLANCE · UNVERIFIED SIGNAL</span><h2>똑. 똑. 똑.</h2><p>정문에서 익숙한 목소리가 들려온다. 하지만 그 목소리의 주인을 보지는 못했다.</p></div><button className="v56-sound" onClick={()=>setMuted(v=>!v)} aria-label={muted?'소리 활성화':'소리 끄기'}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>} {muted?'소리 꺼짐':'소리 켜짐'}</button></header>
   <div className="v56-voice-layout">
    <section className="v56-voice-monitor" aria-label="외곽 CCTV 신호"><div className="v56-voice-screen"><div className="v56-monitor-top"><span>● REC · {event.camera}</span><span>DAY {String(event.day).padStart(3,'0')} / 02:41</span></div><div className="v56-door"><span className="v56-door-frame"><span className="v56-knock-marker">···</span></span></div><div className="v56-monitor-bottom"><span>VOICE TRACK / {event.name}</span><span>VISUAL LOST</span></div></div><div className="v56-voice-wave"><AudioLines size={18}/><div className="v56-wave-bars" aria-hidden="true">{Array.from({length:30},(_,i)=><i key={i} style={{height:`${12+Math.abs(Math.sin(i*1.29))*72}%`,animationDelay:`-${i*.073}s`}}/>)}</div><b>AUTH / UNKNOWN</b><button type="button" onClick={knock} disabled={muted}>노크 재생</button></div><div className="v56-voice-transcript"><span>외부 통신 · 실시간 음성</span><p>“{event.line}”</p><small>외부 화면에는 아무도 보이지 않습니다. 소리만으로 문을 열지 마십시오.</small></div></section>
    <section className="v56-voice-analysis"><div className="v56-analysis-head"><div><span className="v56-micro">EVE / IDENTITY PROTOCOL</span><h3>신원 확인 · 조사 기록</h3></div><div className="v56-charges"><b>{event.remaining}</b><small>/ 3회 남음</small></div></div><p className="v56-analysis-intro">조사는 세 번까지만 가능해. 동일한 조사는 다시 할 수 없고, 단서를 모은 뒤 출입문을 열거나 차단해야 해.</p>
      <div className="v56-probe-list">{probes.map(p=>{const found=event.checks.find(c=>c.probe===p.id);return <button key={p.id} type="button" className={'v56-probe '+(found?'investigated':'')+(active===p.id?' selected':'')} disabled={!!found||event.remaining<1} onClick={()=>{setActive(p.id);setPhase(0);knock()}}><span className="v56-probe-count">{found?'✓':p.symbol}</span><span><strong>{voiceProbeNames[p.id]}</strong><small>{found?found.text:p.subtitle}</small></span><ChevronRight size={16}/></button>})}</div>
      {active&&event.remaining>0&&!event.checks.some(c=>c.probe===active)&&(()=>{const signal=voiceSignal(event,active);const aligned=[...signal.received.slice(phase),...signal.received.slice(0,phase)];return <section className="voice-deduction" aria-label="신호 대조 미니게임"><header><b>{voiceProbeNames[active]}</b><small>수신 표본을 이동시켜 동기화 기준점(◆)을 맞춘 뒤 높이와 결손을 비교하십시오.</small></header>{([['기준 기록',signal.base],['현재 수신',aligned]] as const).map(([label,values])=><div className="voice-signal-row" key={label}><span>{label}</span><div>{values.map((value,k)=><i key={k} className={value===0?'missing':value===6?'sync':''} style={{height:value===0?8:10+value*8}}><small>{value===6?'◆':value===0?'?':''}</small></i>)}</div></div>)}<div className="voice-phase-controls"><button type="button" onClick={()=>setPhase(v=>(v+1)%6)} aria-label="수신 파형 왼쪽 이동">◀ 이동</button><span>위상 {phase}/5</span><button type="button" onClick={()=>setPhase(v=>(v+5)%6)} aria-label="수신 파형 오른쪽 이동">이동 ▶</button></div><div className="voice-reading-buttons">{(['match','mismatch','uncertain'] as VoiceReading[]).map((reading,i)=><button key={reading} onClick={()=>{onProbe(active,reading,phase);setActive(null)}}>{['일치','불일치','결손 · 판독 불가'][i]}</button>)}</div><small>한 번 판독하면 조사 1회가 소모됩니다. 모든 채널이 믿을 만한 것은 아닙니다.</small></section>})()}
      <div className="v56-voice-hypothesis"><div className="v56-voice-hypothesis-head"><ScanEye size={16}/><b>현재까지의 증거</b><span>{done} / 3</span></div>{done===0?<p>아직 객관적인 증거가 없습니다. 누군가의 목소리라는 이유만으로 신뢰하지 마십시오.</p>:<p>{event.checks.map(c=>c.tone==='doubt'?'불일치':c.tone==='safe'?'일치':'판독 불가').join(' · ')}. 복제된 신호와 기록 오차가 섞일 수 있습니다. 여러 채널의 결과를 교차 검증하십시오.</p>}</div>
      <div className="v56-voice-decision"><span>최종 판정 · 선택은 되돌릴 수 없음</span><div className="v56-verdict-actions"><button type="button" onClick={()=>setConfirmation('seal')}><DoorClosed size={19}/><b>봉쇄한다</b><small>모방체라면 차단 성공. 진짜 직원·동물이라면 상실과 후유증 발생</small></button><button type="button" onClick={()=>setConfirmation('open')}><DoorOpen size={19}/><b>문을 연다</b><small>진짜라면 구조 성공. 모방체면 직원 전원 정신력 -20</small></button></div></div>
     </section>
   </div>
   <footer className="v56-voice-foot"><span><LockKeyhole size={14}/> 보안 기록 자동 저장 · 직책/동물 신분은 실제 합류 인원 기준</span><span>판정 누적 {history.length}건</span></footer>
  </div>
  {confirmation&&<div className="v56-verify-backdrop"><div className="v56-verify-dialog"><ShieldAlert size={27}/><h3>{confirmation==='open'?'출입문 개방을 승인할까요?':'출입문 봉쇄를 확정할까요?'}</h3><p>상대의 정체는 아직 확정되지 않았습니다. 결과와 피해는 되돌릴 수 없습니다.</p><div><button onClick={()=>setConfirmation(null)}>판정 취소 · 재검토</button><button className={confirmation==='open'?'v56-allow':'v56-deny'} onClick={()=>{setConfirmation(null);onVerdict(confirmation)}}>{confirmation==='open'?'개방 확정':'봉쇄 확정'}</button></div></div></div>}
 </div>
}
