'use client';
import {BookOpen,Lock,Shield,Radio,ChevronRight} from 'lucide-react';
import type {V10} from '@/lib/game-v10';
import {cases,chapters,currentChapter,availableCase,decideCase} from '@/lib/narrative';
import {neuralProfile} from '@/lib/neural-state';

/** Records are discovered gradually; even their titles stay hidden until unlocked. */
export default function NarrativeArchive({state,onDecide}:{state:V10;onDecide:(next:V10)=>void}){
 const chapter=currentChapter(state);
 const history=state.narrative?.history??[];
 const unlocked=cases.filter(item=>item.chapter<=chapter&&(availableCase(state,item.id)||state.narrative?.choices?.[item.id]!==undefined));
 const pending=unlocked.filter(item=>availableCase(state,item.id));
 return <section className="v65-narrative" aria-label="사건 연결 기록">
  <header className="v65-story-heading"><div><span><Radio size={14}/> ARK // EVIDENCE CHAIN</span><h2>사건 연결 기록</h2><p>관찰한 흔적에 대해 무엇을 할지 결정하십시오. 지금의 선택은 직원, 동물과 본부의 다음 대응에 남습니다.</p></div><div className="v65-story-chapter"><small>진행 중인 기록</small><b>CHAPTER {String(chapter).padStart(2,'0')}</b><strong>{chapters[chapter].title}</strong></div></header>
  <div className="v65-story-progress" aria-label={`스토리 챕터 ${chapter}/5`}>{[1,2,3,4,5].map(n=><span key={n} className={n<=chapter?'active':''}/>)}</div>
  <p className="v65-story-tip"><Shield size={14}/>{chapters[chapter].hint}</p>
  {!unlocked.length&&<div className="v65-story-empty"><Lock size={18}/><div><strong>현재 해독 가능한 사건 기록이 없습니다.</strong><p>동물을 관찰하고 생존 기록을 수집하십시오. 조건이 충족되면 새로운 기록이 나타납니다.</p></div></div>}
  {pending.map(item=><article className="v65-case" key={item.id}>
   <div className="v65-case-meta">CASE / {item.chapter.toString().padStart(2,'0')} <span>결정 대기</span></div>
   <h3>{item.title}</h3><p>{item.body}</p>
   {state.phase!=='day'||state.ap<1||state.pendingIncident||state.run?<small className="v65-case-locked">선택은 낮에만 가능하며 행동력 1이 필요합니다. 진행 중인 사건을 먼저 처리하십시오.</small>:null}
   <div className="v65-case-choices">{item.choices.map((choice,index)=><button type="button" key={choice.label} disabled={state.phase!=='day'||state.ap<1||!!state.pendingIncident||!!state.run||!!state.pending} onClick={()=>{const next=decideCase(state,item.id,index);if(next!==state)onDecide(next)}}><span>0{index+1}</span><span className="v65-choice-body"><b>{choice.label}</b><small>{choice.hint}</small></span><ChevronRight size={17}/></button>)}</div>
  </article>)}
  {chapter>=3&&<details className="v65-neural-board"><summary><BookOpen size={15}/> 생체 보존 기록 · 신경 동기화 원본 수치 열람</summary><p>가상 신경 적응 실험의 추정 지표입니다. 기억이 활성화될수록 본부의 관심을 끌 수 있지만, 스트레스·오염이 높아지면 안정도가 떨어집니다. 이러한 수치는 야간 사건에도 반영됩니다.</p><div className="v65-neural-grid">{state.animals.filter(a=>a.alive).map(a=>{const info=neuralProfile(a);return <div key={a.specimenId??a.id}><b>{a.name}</b><span>기억 활성 <strong>{info.activation}%</strong></span><span>신체 안정 <strong>{info.stability}%</strong></span><span>바이러스 저항 <strong>{info.resistance}%</strong></span><span>본부 관심 <strong>{info.hqAttention}%</strong></span></div>})}{!state.animals.some(a=>a.alive)&&<small>현재 격리된 개체가 없습니다.</small>}</div></details>}
  {!!history.length&&<details className="v65-case-history"><summary><BookOpen size={14}/> 과거의 선택 {history.length}건 · 다시 읽기</summary>{[...history].reverse().map(record=>{const c=cases.find(item=>item.id===record.id);return c?<div key={record.id}><small>DAY {record.day} · {c.title}</small><strong>{c.choices[record.choice]?.label}</strong><p>{record.result}</p></div>:null})}</details>}
 </section>;
}
