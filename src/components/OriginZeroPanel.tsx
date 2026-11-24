'use client';
import type {V10} from '@/lib/game-v10';
import {canTrackCat,initiateOriginTrack,catTrackFrames,pickOriginTrace,analyzeOriginCat,chooseOriginRoute,individualPhotoPuzzles,approachOriginSignal,originApproachScenes,recallCandidates,recallRecord,completedRecalls,beginOriginRecall,answerOriginRecall,studyOriginImmunity,setOriginResonance,resonanceRisk,originBranchAction,originCrisisAvailable,originReadyForFinale} from '@/lib/origin-zero';
import {useState} from 'react';
import OriginPhotoGallery from './OriginPhotoGallery';
import OriginStoryArtwork from './OriginStoryArtwork';
import StoryStill from './StoryStill';
import {storyArtworkCandidates} from '@/lib/story-art';
import ArkRecallMinigame from './ArkRecallMinigame';
import OriginContactField from './OriginContactField';
import OperationPuzzle from './OperationPuzzle';
import OriginEmergency from './OriginEmergency';
import {operationBoard,finishOperation} from '@/lib/operations';
import {SPECIES_MEMORY} from '@/lib/species-memory';

type Mode='expedition'|'records'|'research';
export default function OriginZeroPanel({state:s,mode,onUpdate,onReplay}:{state:V10;mode:Mode;onUpdate:(next:V10)=>void;onReplay?:(number:number)=>void}){
 const d=s.originZero;
 const [showReveal,setShowReveal]=useState(false);
 const [activeRecallKey,setActiveRecallKey]=useState<string|null>(null);
 const found=d?.cat==='traced'||d?.cat==='captured';
 const suspect=!d||d.cat==='unknown'||(d.cat==='traced'&&d.trackProgress<3);
 const approach=d?.cat==='traced'&&d.trackProgress===3&&(d.contactField?.done||(d.approachStep??0)>0)?originApproachScenes[d.approachStep??0]:undefined;
 const positive=!!d?.firstPositiveDay;
 const candidates=recallCandidates(s);
 const update=(next:V10)=>{if(next!==s)onUpdate(next)};
 if(mode==='expedition'){
  if(!canTrackCat(s)&&!found)return null;
  return <section className="oz-panel oz-expedition" aria-label="외곽 특수 생체 신호">
    <span className="oz-eyebrow">FIELD / UNIDENTIFIED SIGNAL</span><h3>{suspect?'외곽 CCTV · 미확인 실루엣':d?.cat==='captured'?'생체검사 대기':'외곽 CCTV · 신호 추적'}</h3>
    <p>{suspect?'저화질 CCTV에는 격리문을 부순 거대한 생물처럼 보이는 실루엣이 찍혔다. 본부는 재앙의 시초일 수 있다고 판단했지만, 비상등과 깨진 화면 때문에 실제 정체는 확인되지 않았다.':d?.cat==='captured'?'확보한 생체 신호의 정체는 검사 기록에서 확인할 수 있습니다.':'마지막 영상 이후 드론으로 주변 반경을 재조사한다. 정체는 아직 알 수 없다.'}</p>
    {suspect&&<figure className="oz-suspect-still"><img src="/assets/events/m00_suspected_origin.png" alt="격리동 CCTV에 흐릿하게 잡힌 거대한 변이 실루엣"/><figcaption><b>RECOVERED CCTV / ORIGIN CANDIDATE</b><span>저화질 실루엣 · 위협 수준 미확인</span></figcaption></figure>}
    {d?.cat==='unknown'||!d?<button className="oz-action" disabled={s.ap<1} onClick={()=>update(initiateOriginTrack(s))}>외곽 영상 추적 시작 · 행동력 1</button>:null}
    {d?.cat==='traced'&&d.trackProgress<3&&<><p className="oz-signal">SIGNAL {d.trackProgress+1} / 3 · {catTrackFrames[d.trackProgress].hint}</p><div className="oz-trace-grid">{catTrackFrames[d.trackProgress].frames.map((frame,i)=><button key={frame} onClick={()=>update(pickOriginTrace(s,i))}><span>CAM 0{i+1}</span><b>{frame}</b></button>)}</div><small>잘못된 화면을 선택하면 위협이 증가하지만 흔적은 잃지 않는다.</small></>}
    {d?.cat==='traced'&&d.trackProgress===3&&!approach&&<OriginContactField state={s} onUpdate={update}/>}
    {approach&&<section className="origin-approach" aria-label="미확인 신호 현장 접근"><StoryStill sources={['/assets/events/m00_suspected_origin.png']} alt="어둠 속에 가려진 생체 신호"/><header><span>FIELD CONTACT · {(d?.approachStep??0)+1}/3</span><b>{approach.title}</b></header><p className="origin-approach-dialogue"><strong>{approach.speaker}</strong> {approach.text}</p><div className="oz-choice-grid">{approach.choices.map((label,i)=><button key={label} disabled={!!s.pendingIncident} onClick={()=>update(approachOriginSignal(s,i))}>{label}</button>)}</div><small>현장 출동 비용은 이미 정산됐습니다. 잘못된 접근은 정신력과 위협에 영향을 줍니다. 흔적은 저장됩니다.</small></section>}
    {d?.cat==='captured'&&<><button className="oz-action" disabled={s.ap<1||s.power<6} onClick={()=>update(analyzeOriginCat(s))}>표준 생체검사 · 행동력 1 · 전력 6%</button></>}
   </section>;
 }
 if(mode==='research'){
  if(!d?.route)return null;
  const count=completedRecalls(s).length;
  const speciesCount=new Set(completedRecalls(s).map(c=>c.id)).size;
  const ready=d.photos>=9&&new Set(completedRecalls(s).map(c=>c.id)).size>=3&&d.crisisDone&&(d.route==='hq'?d.hqIntel>=35:d.stability>=35);
  return <section className="oz-panel" aria-label="면역 연구 프로젝트"><span className="oz-eyebrow">RESEARCH / AUTHORIZED</span><h3>ORIGIN IMMUNITY PROJECT</h3>
   <p>M-00과 기존 개체의 생체 안정성 자료를 대조해 가상의 감염 예방 가능성을 검증한다. M-00 양성이 감염 양성을 뜻하는 것은 아니다.</p>
   <div className="oz-stats"><div><b>{d.photos}<small>/12</small></b><span>사진 기록</span></div><div><b>{count}<small>/{candidates.length}</small></b><span>재분석 완료</span></div><div><b>{d.immunity}<small>%</small></b><span>연구 진척</span></div></div>
   <div className="oz-progress"><span style={{width:`${d.immunity}%`}}/></div>{d.photos>=12&&<section className="origin-resonance"><b>{d.route==='hq'?'원격 공명 요청':'M-00 신경 공명 제어'}</b><label>활성 강도 {d.resonance??35}%<input type="range" min="0" max="100" step="5" value={d.resonance??35} onChange={event=>update(setOriginResonance(s,Number(event.target.value)))}/></label><p>예상 공명 붕괴 위험 {resonanceRisk(s)}% · {resonanceRisk(s)>=60?'위험: 숙주·직원에 강한 부담':resonanceRisk(s)>=30?'주의: 기억 잔향 상승':'안정 범위'}</p><small>{d.route==='hq'?'원격 기록을 분석합니다. 과도한 요청은 본부 압력과 EVE 부담을 높입니다.':'강도를 높이면 연구 진척이 빨라지지만 숙주 스트레스와 직원 기억 잔향이 상승합니다. 낮은 강도에서도 연구할 수 있습니다.'}</small></section>}
   <p>{ready?'비교 연구 가능 · 연구마다 행동력 1, 전력 10%, 지식 12 필요':`필요: 사진 9장 (${d.photos}), 서로 다른 3종 재분석 (${speciesCount}), 최종 위기 대응 (${d.crisisDone?'완료':'미완료'}), ${d.route==='hq'?`본부 자료 접근 ${d.hqIntel}/35`:`고양이 생체 안정성 ${d.stability}/35`}`}</p>
   <button className="oz-action" disabled={!ready||s.ap<1||s.power<10||s.knowledge<12||d.immunity>=100||s.phase!=='day'} onClick={()=>update(studyOriginImmunity(s))}>{d.immunity>=100?'연구 기반 구축 완료':'동물 기록 비교 분석 수행'}</button>
   {originReadyForFinale(s)&&<div className="oz-complete">기존 확보 개체 재분석 완료 · 다음 날 최종 지시가 도착한다</div>}
  </section>;
 }
 // Records panel is intentionally innocuous until a positive ORIGIN marker.
 if(!positive)return <section className="oz-panel oz-dormant" aria-label="정기 생체검사 로그"><span className="oz-eyebrow">BIO-STATUS / AUTOMATIC</span><h3>정기 생체검사 기록</h3><p>개체 포획 시 건강·신경 반응 검사를 자동 수행합니다. 추가 분석 항목의 조회 권한은 제한됩니다.</p><span className="oz-neutral">등록된 검사 {d?.scans.length??0}건 · 상세 결과 비공개</span></section>;
 return <section className="oz-panel oz-origin v71-origin-lab" aria-label="기원 표식 분석 및 숨겨진 사진">
  <span className="oz-eyebrow">ORIGIN SIGNATURE ANALYSIS · RESTRICTED</span><h3>기원 표식 일치 · <em>POSITIVE</em></h3>
  <p>검사 결과가 확인되었습니다. 기원 ID: <strong>M-00</strong>. 이는 감염 판정이 아닌 원본 실험체의 생물학적 식별 표식 일치입니다.</p>{!d?.route&&<div className="origin-approach-dialogue"><p><b>관리자:</b> 우리가 찾던 게… 이 녀석이었다고?</p><p><b>본부:</b> 즉시 격리 후 이송하십시오. 추가 조회 권한은 없습니다.</p><p><b>EVE:</b> 이송 지령을 실행해야 합니다. …그런데, 오래된 기억 신호가 동기화됐습니다. 정말 보내야 할까요?</p></div>}
  {!d?.route&&<StoryStill sources={storyArtworkCandidates(11)} alt="기원 표식 양성"/>}
  {!d?.route&&<div className="oz-choice-grid"><button onClick={()=>update(chooseOriginRoute(s,'hq'))}><b>본부에 전송한다</b><small>지원과 원격 연구 기록 확보. M-00 직접 관찰권 상실.</small></button><button onClick={()=>update(chooseOriginRoute(s,'shelter'))}><b>본부에 전송하지 않는다</b><small>동물원 내 보호 · 본부 감시 및 보급 제한 증가.</small></button></div>}
  {d?.route&&<><div className="oz-branch">{d.route==='hq'?'ROUTE A · 본부 이송 / 원격 연구 자료 회수':'ROUTE B · 비밀 격리 / 독립 생체 연구'}<small>{d.route==='hq'?'개체는 동물원에 자동으로 돌아오지 않는다.':'본부 감사와 이송 요구가 증가한다.'}</small></div>
   {<div className="oz-management"><span>최종 경보 준비</span><b>{d.route==='hq'?`원격 연구 자료 접근 ${d.hqIntel}%`:`M-00 생체 안정 ${d.stability}%`}</b><button disabled={s.ap<1||(d.route==='hq'?s.power<10:s.medicine<1)} onClick={()=>update(originBranchAction(s,d.route==='hq'?'retrieve':'stabilize'))}>{d.route==='hq'?'본부 기밀 자료 회수 (AP 1 / 전력 10)':'격리 환경 안정화 (AP 1 / 약품 1)'}</button></div>}
   {originCrisisAvailable(s)&&<OriginEmergency state={s} onUpdate={update}/>}
   <div className="oz-heading"><h4>HIDDEN PHOTO · 원본 12장</h4><b>{d.photos} / 12</b></div>
   <OriginPhotoGallery count={d.photos}/>{onReplay&&d.photos>=1&&<section className="origin-replay"><b>복원된 대화 기록</b>{Array.from({length:d.photos},(_,i)=>i+1).map(number=><button type="button" key={number} onClick={()=>onReplay(number)}>PHOTO {String(number).padStart(2,'0')} · {['전쟁의 기록','최초 숙주','M-00 원본','최종 실험','무너진 연구실','두 번째 재앙','EVE의 고백','동기화된 기억','EVE의 선택','직원 인수 기록','관리자의 정체','마지막 연구'][number-1]}</button>)}</section>}
   {d.photos<12&&<div className="v69-archive-puzzle"><OperationPuzzle key={d.photos} state={s} mode="photo" onUpdate={update}/><span className="oz-eyebrow">ARCHIVE AUTHENTICATION · {d.photos+1}/12</span><strong>{individualPhotoPuzzles[d.photos].question}</strong><p>{individualPhotoPuzzles[d.photos].hint} · AP 1 / 전력 4</p><div className="v69-archive-options">{individualPhotoPuzzles[d.photos].options.map((label,i)=><button key={label} type="button" disabled={s.ap<1||s.power<4||s.phase!=='day'||!operationBoard(s,'photo').verified} onClick={()=>update(finishOperation(s,'photo',undefined,i))}><b>{String(i+1).padStart(2,'0')}</b>{label}</button>)}</div></div>}
   {d.photos===12&&<button className="oz-action" onClick={()=>setShowReveal(true)}>마지막 사진과 이브의 기록 다시 보기</button>}
   {(d.photos>=7||Object.keys(d.recallSessions??{}).length>0)&&<><div className="oz-heading"><h4>OPERATION ARK RECALL</h4><b>{completedRecalls(s).length}개체 분석</b></div><StoryStill sources={storyArtworkCandidates(18)} alt="ARK RECALL 작전 개시"/>
   <p>모든 기존에 확보한 개체는 전원 다른 방식으로 재분석합니다. 살아 있다면 비침습 조사, 본부 이송 개체는 원격 자료, 사망 개체는 보존 기록으로 대체합니다.</p>
   {d.photos>=10&&completedRecalls(s).length>0&&<section className="oz-memory-fragments" aria-label="개체별 기억 조각"><div className="oz-heading"><h4>RECOVERED HUMAN MEMORY · 종별 조각</h4><b>{new Set(completedRecalls(s).map(c=>c.id)).size} / 13</b></div><div className="oz-memory-grid">{Array.from(new Set(completedRecalls(s).map(c=>c.id))).map(id=>{const memory=SPECIES_MEMORY[id];const name=candidates.find(c=>c.id===id)?.label??id;return <article key={id}><span>{name} · 기억 기록</span><b>{memory.role}</b><p>{memory.fragment}</p></article>})}</div></section>}
   <div className="oz-recall-grid">{candidates.map(c=>{const record=recallRecord(s,c),session=d.recallSessions?.[c.key];return <button key={c.key} disabled={c.source==='escaped'||!!record||s.ap<1||s.power<(c.source==='hq'?12:c.source==='live'?8:5)||s.phase!=='day'} onClick={()=>{const next=beginOriginRecall(s,c.key);if(next!==s)update(next);if(next!==s||session)setActiveRecallKey(c.key);}}><b>{c.label} · {c.key}</b><span>{record?`분석 완료 · 품질 ${record.quality}% · 개인 기록 보존`:session?`분석 재개 · ${session.step+1}/3`:c.source==='escaped'?'CCTV에서 먼저 재격리':c.source==='live'?'비침습 안정성 비교 3단계':c.source==='hq'?'본부 자료 원격 회수 3단계':'보존 기록 재생 3단계'}</span></button>})}</div>
   {activeRecallKey&&d.recallSessions?.[activeRecallKey]&&(()=>{const candidate=candidates.find(c=>c.key===activeRecallKey);if(!candidate)return null;return <ArkRecallMinigame id={candidate.id} name={candidate.label} session={d.recallSessions[activeRecallKey]} onClose={()=>setActiveRecallKey(null)} onAnswer={choice=>{const next=answerOriginRecall(s,activeRecallKey,choice);if(next!==s){update(next);if(!next.originZero?.recallSessions?.[activeRecallKey])setActiveRecallKey(null);}}}/>})()}
   {new Set(candidates.map(c=>c.id)).size<3&&<p className="oz-warning">기존 확보 개체가 부족합니다. 탐사에서 다른 종을 추가로 확보하면 재분석 대상이 늘어납니다.</p>}</>}
   {d.photos>=9&&<p className="oz-reminder">자료 복원 진행 중 · 면역 연구는 상단 [기억 연구]에서 진행 가능</p>}
  </>}
  <OriginStoryArtwork state={s}/>
  {showReveal&&d?.photos>=12&&<div className="oz-reveal-backdrop" role="dialog" aria-modal="true" aria-label="마지막 숨겨진 사진"><div className="oz-reveal"><span>ARCHIVE // THE LAST PHOTO</span><div className="oz-portrait"><StoryStill sources={storyArtworkCandidates(15)} alt="과학자와 어린 딸, 검은 고양이의 과거"/><strong>PHOTO 08 · 아버지와 딸</strong><p>어린 소녀와 최초 과학자. 그리고 사진 가장자리에 앉아 있는, 지금의 M-00과 똑같은 검은 고양이.</p></div><p><b>EVE:</b> “저는 그날의 기억을 가지고 있지 않아요.”</p><p><b>EVE:</b> “하지만 사진 속 아이가 이 고양이를 아주 좋아했다는 사실은 알고 있어요.”</p><p><b>EVE:</b> “이 슬픔은 제게 주어진 기억이 아니에요. 지금 제가 이해한 마음이에요.”</p><p><b>복원된 과학자 기록:</b> “조금만 더 있었으면 됐는데!!! 왜 하필 지금이야!!!”</p><StoryStill sources={storyArtworkCandidates(16)} alt="제000번 관리자 신원 복원"/><p><b>ARK:</b> 군사 연구 책임자의 뇌는 동물 숙주를 거쳐 제000번 관리자에게 보존됐다. 그가 동물처럼 꿈꾸는 이유다.</p><button className="oz-action" onClick={()=>setShowReveal(false)}>현재의 선택으로 돌아가기</button></div></div>}
 </section>;
}
