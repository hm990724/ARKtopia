'use client';
import {useState} from 'react';
import {BookOpen,Brain,CircleHelp,Activity,Footprints,LockKeyhole,FileWarning,Radio,FlaskConical,Send,ShieldAlert,HeartPulse,ArrowRight,Eye,Archive as ArchiveIcon} from './PixelIcons';
import {specs,type AnimalId} from '@/lib/sim';
import {archiveOf,knownSpeciesTraits,type DissectionAction,type SpecimenDossier} from '@/lib/specimen-archive';
import type {V10} from '@/lib/game-v10';

type Props={state:V10;onDissection:(action:DissectionAction,key?:string)=>void;animalSrc:(id:AnimalId)=>string};
const statusText:Record<SpecimenDossier['status'],string>={contained:'격리 중',escaped:'이탈·추적 중',deceased:'사망 기록',transferred:'본부 인계',dissected:'조직 회수 완료'};
export default function SpecimenArchive({state,onDissection,animalSrc}:Props){
 const [selected,setSelected]=useState<string>('');
 const [mode,setMode]=useState<'specimens'|'chronicle'|'dissection'>('specimens');
 const archive=archiveOf(state);const scrambled=!!state.crew?.retired?.includes('deer');
 const scramble=<T,>(values:T[],salt=0):T[]=>{
  if(!scrambled||values.length<2)return values;
  return values.map((v,i)=>({v,weight:((i+1)*7919+(state.day+salt)*104729)%15401})).sort((a,b)=>a.weight-b.weight).map(x=>x.v);
 };
 const entries=scramble(Object.values(archive.entries).sort((a,b)=>b.firstDay-a.firstDay),1);
 const sourceCurrent=entries.find(a=>a.key===selected)||entries[0];
 const current=sourceCurrent?{...sourceCurrent,protocolAttempts:scramble(sourceCurrent.protocolAttempts??[],3),records:scramble(sourceCurrent.records,4)}:undefined;
 const kind=archive.revealed?'해부실':'생체 분석실';
 const status:Record<string,string>={};for(const dossier of entries)status[dossier.species]=dossier.status;
 return <section className={'v37-archive '+(archive.revealed?'is-revealed':'')}>
  <div className="v37-archive-hero">
   <div className="v37-archive-kicker">ARK / {archive.revealed?'DEPARTMENT OF DISSECTION':'BIOLOGICAL ANALYSIS'}</div>
   <div className="v37-archive-hero-body"><div><h2>{kind}<span>{archive.revealed?' · 내부 명령 복원':' · 생태 관측 기록'}</span></h2><p>{archive.revealed?'이 시설이 수집해 온 것은 단순한 동물의 생태 정보가 아니었습니다. 관찰·돌봄·본부 이송에 이르는 모든 판단을 되돌아볼 수 있습니다.':'직접 알아낸 생물의 습성과 현장 수색·돌봄 이력을 기록합니다. 조사하지 않은 정보는 공개되지 않습니다.'}</p></div><div className="v37-archive-stamp"><ArchiveIcon size={23}/><strong>{entries.length}건</strong><span>보존 기록</span></div></div>
   <div className="v37-archive-indicators"><span>종별 조사 {Object.keys(archive.knownTraits).length}종</span><span>생체 표본 {archive.samples}개</span><span>생체 이송 {state.headquarters.transferred.length}건</span><span>표본 송신 {archive.dispatches}건</span></div>
  </div>
  {scrambled&&<div className="v49-data-warning" role="status"><FileWarning size={16}/> EVE · 서기관 부재. 자료 순서 검증 실패 — 화면의 일지·판정 순서는 교란되었습니다. 원본은 보존됩니다.</div>}
  <div className="v37-archive-nav" role="tablist" aria-label="분석실 보기 선택">
   <button role="tab" aria-selected={mode==='specimens'} className={mode==='specimens'?'active':''} onClick={()=>setMode('specimens')}><BookOpen size={16}/> 개체 도감</button>
   <button role="tab" aria-selected={mode==='chronicle'} className={mode==='chronicle'?'active':''} onClick={()=>setMode('chronicle')}><Radio size={16}/> 사건 기록</button>
   {archive.revealed&&<button role="tab" aria-selected={mode==='dissection'} className={mode==='dissection'?'active danger':''} onClick={()=>setMode('dissection')}><FlaskConical size={16}/> 병리·조직 회수</button>}
  </div>
  {mode==='chronicle'?<div className="v37-archive-chronicle"><h3>시설 일지</h3><p>구조와 추출·보존 명령이 발생한 순서대로 기록됩니다.</p><div className="v37-journal-list">{scramble([...state.logs],2).map((event,i)=><article key={i} className={'v37-journal-'+event.kind}><time>DAY {String(event.day).padStart(3,'0')}</time><div><strong>{event.title}</strong><p>{event.text}</p></div></article>)}</div></div>:
  mode==='dissection'?<div className="v37-dissection-layout"><div className="v37-dissection-instructions"><span>RESTRICTED ACCESS // NO REVERSAL</span><h3>해부실 · 신경 조직 회수</h3><p>모든 처리는 되돌릴 수 없습니다. 사후 부검은 사망한 개체만 가능하며, 생존 개체의 강제 회수는 영구적인 손실과 신뢰 하락을 남깁니다.</p><div className="v37-tissue-count"><FlaskConical size={22}/><div><small>보관 중인 신경 조직</small><strong>{archive.samples}개</strong></div></div><button className="v37-send-button" disabled={archive.samples<1||state.power<4} onClick={()=>onDissection('transmit')}><Send size={17}/> 조직 표본 1개 본부 전송 <span>CR +180 · 전력 -4 · 고급 지원 선택권 1</span></button><small>생체 인계는 고철·식량만 지급합니다. 고급 지원은 표본을 소모해 전송해야 얻을 수 있습니다. 송신 없이도 엔딩에 도달할 수 있습니다.</small></div>
   <div className="v37-dissection-targets"><h3>개체별 처리</h3>{entries.length?entries.map(entry=>{const animal=state.animals.find(a=>a.specimenId===entry.key);const isEscaped=!!animal&&state.security.escapedIds.includes(animal.id);const consumed=archive.processedKeys.includes(entry.key);return <div className="v37-dissection-target" key={entry.key}><div><strong>{entry.key} · {entry.name}</strong><small>{statusText[entry.status]}</small></div><div className="v37-dissection-actions"><button disabled={!animal||animal.alive||consumed||entry.status==='transferred'||state.ap<1||state.power<5} onClick={()=>onDissection('postmortem',entry.key)}>사후 부검 <span>AP -1 · 전력 -5 · 표본 +1</span></button><button className="danger" disabled={!animal?.alive||isEscaped||state.ap<2||state.power<10} onClick={()=>onDissection('forced',entry.key)}>강제 회수 <span>AP -2 · 전력 -10 · 표본 +2 · 개체 소실</span></button></div></div>}):<p>아직 확보한 개체 기록이 없습니다.</p>}</div></div>:
  <div className="v37-archive-grid"><aside className="v37-species-list"><h3>관측 대상 <small>{entries.length}개체</small></h3>{entries.length?entries.map(entry=><button className={current?.key===entry.key?'active':''} key={entry.key} onClick={()=>setSelected(entry.key)}><img src={animalSrc(entry.species)} alt=""/><span><strong>{entry.name}</strong><small>{entry.key} · {statusText[entry.status]}</small></span><ArrowRight size={15}/></button>):<div className="v37-species-empty"><CircleHelp size={25}/><p>첫 개체를 구조하면 현장 기록이 여기에 쌓입니다.</p></div>}</aside>
  <div className="v37-dossier">{!current?<div className="v37-no-dossier"><BookOpen size={36}/><h3>아직 분석 대상이 없습니다</h3><p>풀숲에서 수색한 습성은 첫 포획 이후 이곳에 정리됩니다. 현장 수색으로 돌아가 첫 신호를 확보하세요.</p></div>:<><div className="v37-dossier-lead"><div className="v37-dossier-portrait"><img src={animalSrc(current.species)} alt={current.name}/></div><div><span className="v37-dossier-code">SPECIMEN / {current.key}</span><h3>{current.name}</h3><span className="v37-dossier-status">{statusText[current.status]}</span><p>{specs.find(x=>x.id===current.species)?.trait}</p></div></div>
   <section className="v37-data-strip"><div><small>최대 스트레스</small><strong>{current.maxStress}<small>/100</small></strong></div><div><small>최고 공명</small><strong>{current.maxMemory}<small>/100</small></strong></div><div><small>관찰 내역</small><strong>{current.records.length}<small>건</small></strong></div></section>
   <section className="v37-dossier-section"><h4><Footprints size={17}/> 직접 밝혀낸 습성</h4><p>해독하지 않은 행동 패턴은 다음 포획에서도 추리해야 합니다.</p><div className="v37-trait-list">{knownSpeciesTraits(state,current.species).map((item,index)=><article className={item.known?'is-known':'is-secret'} key={index}>{item.known?<Eye size={16}/>:<LockKeyhole size={16}/>}<span><strong>행동 분석 {String(index+1).padStart(2,'0')}</strong><small>{item.known?item.label:'현장 조사 기록 없음 · 미해독'}</small></span></article>)}</div></section>
   <section className="v37-dossier-section"><h4><Activity size={17}/> 실제 확보 경위</h4><p>{current.captureMethod}</p>{(archive.fieldJournal[current.species]||[]).length>0&&<div className="v37-field-notes">{scramble([...(archive.fieldJournal[current.species]??[])].slice(-12).reverse(),5).map((line,i)=><span key={i}>{line}</span>)}</div>}</section>
   <details className="v51-archive-drawer"><summary><Brain size={15}/> 행동 강령 동기화 기록 <b>{current.protocolAttempts?.length??0}회</b></summary><section className="v42-protocol-audit" aria-label="실제 행동 강령 실험 선택 및 결과 이력"><div className="v42-protocol-audit-head"><Brain size={17}/><h4>행동 강령 동기화 · 단계별 판정 기록</h4><span>{current.protocolAttempts?.length??0}회 연구</span></div>
<p>어떤 행동을 선택했고 어떤 반응이 일어났는지 기록합니다. 완료된 실험은 선택과 판정을 영구 보존하므로 다음 공명 시 비교할 수 있습니다.</p>
{(current.protocolAttempts?.length??0)>0?<div className="v42-protocol-attempts">{current.protocolAttempts?.map((attempt,i)=><details key={`${attempt.day}-${i}`} open={i===0}><summary><span>DAY {String(attempt.day).padStart(3,'0')} · {attempt.mode==='gentle'?'비침습 공명':'강제 공명'}</span><strong>{attempt.quality}점 · {attempt.steps.filter(x=>x.matched).length}/3 일치</strong></summary><div className="v42-protocol-steps">{attempt.steps.map((step,j)=><article className={step.matched?'matched':'mismatch'} key={j}><b>0{step.stage} · {step.matched?'판정 일치':'판정 불일치'}</b><p>{step.prompt}</p><span><b>실제 선택</b> {step.chosen}</span><span><b>기록상 적합 반응</b> {step.expected}</span></article>)}</div><p className="v42-protocol-result">최종 기록: {attempt.result}</p></details>)}</div>:<p className="v42-protocol-empty">아직 완료한 행동 강령 공명 시도가 없습니다. 격리실에서 관찰을 마친 뒤 연구를 진행하세요.</p>}
</section></details>
<details className="v51-archive-drawer"><summary><HeartPulse size={15}/> 개체의 생애 기록 <b>{current.records.length}건</b></summary><section className="v37-dossier-section"><h4><HeartPulse size={17}/> 개체의 생애 기록</h4>{current.records.length?<div className="v37-record-timeline">{current.records.map((item,i)=><article key={i} className={'v37-event-'+item.kind}><time>DAY {String(item.day).padStart(3,'0')}</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}</div>:<p>기존 저장에서 가져온 개체입니다. 이후의 행동부터 정확히 기록됩니다.</p>}</section></details>
   {archive.revealed&&<div className="v37-evidence-disclosure"><FileWarning size={20}/><div><strong>기밀 기록과 대조된 항목</strong><p>동물의 행동은 한때 인간이었던 신경 조직에서 비롯되었습니다. 과거의 유대와 치료 기록도 이 새로운 사실에 비추어 읽을 수 있습니다.</p></div></div>}
  </>}</div></div>}
 </section>;
}
