'use client';
import type {V10} from '@/lib/game-v10';
import {canTrackCat,initiateOriginTrack,catTrackFrames,pickOriginTrace,analyzeOriginCat,chooseOriginRoute,restoreOriginPhotos,photoRecords,originArchiveCiphers,recallCandidates,performOriginRecall,studyOriginImmunity,originBranchAction,originCrisisAvailable,resolveOriginCrisis,originReadyForFinale} from '@/lib/origin-zero';
import {useState} from 'react';

// Until the commissioned 12 photographs exist, keep archival *visualization* distinct from original evidence.
const archiveFallbackArt=[
 '/assets/backgrounds/laboratory.webp','/assets/backgrounds/hidden-photo.webp',
 '/assets/backgrounds/sanctuary.webp','/assets/backgrounds/laboratory.webp',
 '/assets/backgrounds/wasteland.webp','/assets/backgrounds/dawn.webp',
 '/assets/backgrounds/laboratory.webp','/assets/cinematics/eve-first-meeting/scene.webp',
 '/assets/characters/eve_hologram.webp','/assets/backgrounds/hidden-photo.webp',
 '/assets/characters/protagonist_neutral.webp','/assets/backgrounds/hidden-photo.webp'
];
type Mode='expedition'|'records'|'research';
export default function OriginZeroPanel({state:s,mode,onUpdate}:{state:V10;mode:Mode;onUpdate:(next:V10)=>void}){
 const d=s.originZero;
 const [showReveal,setShowReveal]=useState(false);
 const found=d?.cat==='traced'||d?.cat==='captured';
 const positive=!!d?.firstPositiveDay;
 const candidates=recallCandidates(s);
 const update=(next:V10)=>{if(next!==s)onUpdate(next)};
 if(mode==='expedition'){
  if(!canTrackCat(s)&&!found)return null;
  return <section className="oz-panel oz-expedition" aria-label="외곽 특수 생체 신호">
    <span className="oz-eyebrow">FIELD / UNIDENTIFIED SIGNAL</span><h3>이상 반응 없는 개체 · 외곽 CCTV</h3>
    <p>흔적에는 오염이나 변이의 징후가 없다. 다른 동물과 달리 평범하게 걷는 검은 고양이다.</p>
    {d?.cat==='unknown'||!d?<button className="oz-action" disabled={s.ap<1} onClick={()=>update(initiateOriginTrack(s))}>외곽 영상 추적 시작 · 행동력 1</button>:null}
    {d?.cat==='traced'&&<><p className="oz-signal">SIGNAL {d.trackProgress+1} / 3 · {catTrackFrames[d.trackProgress].hint}</p><div className="oz-trace-grid">{catTrackFrames[d.trackProgress].frames.map((frame,i)=><button key={frame} onClick={()=>update(pickOriginTrace(s,i))}><span>CAM 0{i+1}</span><b>{frame}</b></button>)}</div><small>잘못된 화면을 선택하면 위협이 증가하지만 흔적은 잃지 않는다.</small></>}
    {d?.cat==='captured'&&<><div className="oz-cat-image" role="img" aria-label="변이 없는 평범한 검은 고양이"><span>🐈‍⬛</span><p>임시 격리 케이지 · 변이 없는 검은 고양이 · 고유 스프라이트 제작 필요</p></div><button className="oz-action" disabled={s.ap<1||s.power<6} onClick={()=>update(analyzeOriginCat(s))}>표준 생체검사 · 행동력 1 · 전력 6%</button></>}
   </section>;
 }
 if(mode==='research'){
  if(!d?.route)return null;
  const count=Object.keys(d.recalls).length;
  const ready=d.photos>=9&&count>=3&&d.crisisDone&&(d.route==='hq'?d.hqIntel>=35:d.stability>=35);
  return <section className="oz-panel" aria-label="면역 연구 프로젝트"><span className="oz-eyebrow">RESEARCH / AUTHORIZED</span><h3>ORIGIN IMMUNITY PROJECT</h3>
   <p>M-00과 기존 개체의 생체 안정성 자료를 대조해 가상의 감염 예방 가능성을 검증한다. M-00 양성이 감염 양성을 뜻하는 것은 아니다.</p>
   <div className="oz-stats"><div><b>{d.photos}<small>/12</small></b><span>사진 기록</span></div><div><b>{count}<small>/{candidates.length}</small></b><span>재분석 완료</span></div><div><b>{d.immunity}<small>%</small></b><span>연구 진척</span></div></div>
   <div className="oz-progress"><span style={{width:`${d.immunity}%`}}/></div>
   <p>{ready?'비교 연구 가능 · 연구마다 행동력 1, 전력 10%, 지식 12 필요':`필요: 사진 9장 (${d.photos}), 서로 다른 3종 재분석 (${count}), 최종 위기 대응 (${d.crisisDone?'완료':'미완료'}), ${d.route==='hq'?`본부 자료 접근 ${d.hqIntel}/35`:`고양이 생체 안정성 ${d.stability}/35`}`}</p>
   <button className="oz-action" disabled={!ready||s.ap<1||s.power<10||s.knowledge<12||d.immunity>=100||s.phase!=='day'} onClick={()=>update(studyOriginImmunity(s))}>{d.immunity>=100?'연구 기반 구축 완료':'동물 기록 비교 분석 수행'}</button>
   {originReadyForFinale(s)&&<div className="oz-complete">기존 확보 개체 재분석 완료 · 다음 날 최종 지시가 도착한다</div>}
  </section>;
 }
 // Records panel is intentionally innocuous until a positive ORIGIN marker.
 if(!positive)return <section className="oz-panel oz-dormant" aria-label="정기 생체검사 로그"><span className="oz-eyebrow">BIO-STATUS / AUTOMATIC</span><h3>정기 생체검사 기록</h3><p>개체 포획 시 건강·신경 반응 검사를 자동 수행합니다. 추가 분석 항목의 조회 권한은 제한됩니다.</p><span className="oz-neutral">등록된 검사 {d?.scans.length??0}건 · 상세 결과 비공개</span></section>;
 return <section className="oz-panel oz-origin" aria-label="기원 표식 분석 및 숨겨진 사진">
  <span className="oz-eyebrow">ORIGIN SIGNATURE ANALYSIS · RESTRICTED</span><h3>기원 표식 일치 · <em>POSITIVE</em></h3>
  <p>검사 결과가 확인되었습니다. 기원 ID: <strong>M-00</strong>. 이는 감염 판정이 아닌 원본 실험체의 생물학적 식별 표식 일치입니다.</p>
  {!d?.route&&<div className="oz-choice-grid"><button onClick={()=>update(chooseOriginRoute(s,'hq'))}><b>본부에 전송한다</b><small>지원과 원격 연구 기록 확보. M-00 직접 관찰권 상실.</small></button><button onClick={()=>update(chooseOriginRoute(s,'shelter'))}><b>본부에 전송하지 않는다</b><small>동물원 내 보호 · 본부 감시 및 보급 제한 증가.</small></button></div>}
  {d?.route&&<><div className="oz-branch">{d.route==='hq'?'ROUTE A · 본부 이송 / 원격 연구 자료 회수':'ROUTE B · 비밀 격리 / 독립 생체 연구'}<small>{d.route==='hq'?'개체는 동물원에 자동으로 돌아오지 않는다.':'본부 감사와 이송 요구가 증가한다.'}</small></div>
   {<div className="oz-management"><span>최종 경보 준비</span><b>{d.route==='hq'?`원격 연구 자료 접근 ${d.hqIntel}%`:`M-00 생체 안정 ${d.stability}%`}</b><button disabled={s.ap<1||(d.route==='hq'?s.power<10:s.medicine<1)} onClick={()=>update(originBranchAction(s,d.route==='hq'?'retrieve':'stabilize'))}>{d.route==='hq'?'본부 기밀 자료 회수 (AP 1 / 전력 10)':'격리 환경 안정화 (AP 1 / 약품 1)'}</button></div>}
   {originCrisisAvailable(s)&&<div className="oz-crisis"><span>EMERGENCY / FINAL BREACH</span><h4>{d.route==='hq'?'본부가 M-00에 대한 강행 연구를 지시했다':'본부 회수팀이 비밀 격리실을 포위했다'}</h4><p>이번 선택은 다음 연구의 안정성과 본부와의 관계에 영향을 미친다.</p><div className="oz-choice-grid"><button onClick={()=>update(resolveOriginCrisis(s,'protect'))}><b>생존 개체의 보호를 우선한다</b><small>위협이 증가하지만 위험한 절차를 억제한다.</small></button><button onClick={()=>update(resolveOriginCrisis(s,'knowledge'))}><b>연구 기록 확보를 우선한다</b><small>자료를 얻지만 안정성과 신뢰를 잃을 수 있다.</small></button></div></div>}
   <div className="oz-heading"><h4>HIDDEN PHOTO · 원본 12장</h4><b>{d.photos} / 12</b></div>
   <div className="oz-photo-grid">{photoRecords.map((photo,i)=><article key={photo.title} className={i<d.photos?'restored':'locked'}><span>{String(i+1).padStart(2,'0')}</span>{i<d.photos?<><div className="v67-photo-preview"><img src={archiveFallbackArt[i]} alt="기존 시설·인물 자료를 이용한 보조 시각화. 신규 원본 사진이 아닙니다"/><small>ARCHIVE VISUALIZATION</small></div><b>{photo.title.split(' · ')[1]}</b><p>{photo.detail}</p></>:<b>암호화된 사진</b>}</article>)}</div>
   {d.photos<12&&<div className="v69-archive-puzzle"><span className="oz-eyebrow">ARCHIVE AUTHENTICATION · {Math.floor(d.photos/3)+1}/4</span><strong>{originArchiveCiphers[Math.floor(d.photos/3)].question}</strong><p>흩어진 기록의 증거를 맞춰야 사진 3장의 순서를 복원합니다. 틀리면 전력과 위협이 변합니다.</p><div className="v69-archive-options">{originArchiveCiphers[Math.floor(d.photos/3)].options.map((label,i)=><button key={label} type="button" disabled={s.ap<1||s.power<8||s.phase!=='day'} onClick={()=>{update(restoreOriginPhotos(s,i));if(d.photos===9&&i===originArchiveCiphers[3].answer)setShowReveal(true);}}><b>{String(i+1).padStart(2,'0')}</b>{label}</button>)}</div></div>}
   {d.photos===12&&<button className="oz-action" onClick={()=>setShowReveal(true)}>마지막 사진과 이브의 기록 다시 보기</button>}
   {d.photos>=6&&<><div className="oz-heading"><h4>OPERATION ARK RECALL</h4><b>{Object.keys(d.recalls).length}종 분석</b></div>
   <p>모든 기존에 확보한 개체는 전원 다른 방식으로 재분석합니다. 살아 있다면 비침습 조사, 본부 이송 개체는 원격 자료, 사망 개체는 보존 기록으로 대체합니다.</p>
   <div className="oz-recall-grid">{candidates.map(c=><button key={c.id} disabled={!!d.recalls[c.id]||s.ap<1||s.power<(c.source==='hq'?12:c.source==='live'?8:5)||s.phase!=='day'} onClick={()=>update(performOriginRecall(s,c.id))}><b>{c.label}</b><span>{d.recalls[c.id]?`분석 완료 · 품질 ${d.recalls[c.id]!.quality}%`:c.source==='live'?'현장 안정성 비교':c.source==='hq'?'본부 자료 원격 회수':'과거 보존 기록 회수'}</span></button>)}</div>
   {candidates.length<3&&<p className="oz-warning">기존 확보 개체가 부족합니다. 탐사에서 다른 종을 추가로 확보하면 재분석 대상이 늘어납니다.</p>}</>}
   {d.photos>=9&&<p className="oz-reminder">자료 복원 진행 중 · 면역 연구는 상단 [기억 연구]에서 진행 가능</p>}
  </>}
  {showReveal&&d?.photos>=12&&<div className="oz-reveal-backdrop" role="dialog" aria-modal="true" aria-label="마지막 숨겨진 사진"><div className="oz-reveal"><span>ARCHIVE // THE LAST PHOTO</span><div className="oz-portrait"><strong>PHOTO 08 · 아버지와 딸</strong><p>어린 소녀와 최초 과학자. 그리고 사진 가장자리에 앉아 있는, 지금의 M-00과 똑같은 검은 고양이.</p></div><p><b>EVE:</b> “이 고양이…… 제게는 이 사진을 찍었던 기억이 없어요.”</p><p><b>EVE:</b> “하지만 기록에는 제가 이 아이를 무척 좋아했다고 적혀 있네요.”</p><p><b>EVE:</b> “아버지는 이 아이도 버렸군요.”</p><p><b>복원된 과학자 기록:</b> “폐기해. 우리가 원한 건 인간의 사고를 가진 동물이 아니라 인간 그 자체야.”</p><p><b>ARK:</b> 군사 연구 책임자의 뇌는 동물 숙주를 거쳐 제000번 관리자에게 보존됐다. 그가 동물처럼 꿈꾸는 이유다.</p><button className="oz-action" onClick={()=>setShowReveal(false)}>현재의 선택으로 돌아가기</button></div></div>}
 </section>;
}
