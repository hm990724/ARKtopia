'use client';
import ArtSlot from './ArtSlot';
import {gameplayArt} from '@/lib/gameplay-art';
import {useEffect,useState} from 'react';
import type {AnimalId,AnimalState} from '@/lib/sim';
import {cameraSubjects,cameraPosition} from '@/lib/cctv-feed';
import type {V10} from '@/lib/game-v10';
import {cctvHotspotIndex,type CameraId} from '@/lib/security';
const labels=['잠금 장치','급수 밸브','바닥 흔적','감시 조명'],normal=['잠금','닫힘','흔적 없음','점등'],abnormal=['잠금 풀림','밸브 열림','새 발자국','소등'];
export default function CCTVEvidence({state,camera,onInspect,onWatch,animalSrc,onSelect}:{state:V10;camera:CameraId;onInspect:(spot:number)=>void;onWatch?:()=>void;animalSrc:(a:AnimalState)=>string;onSelect:(id:AnimalId)=>void}){
 const [reference,setReference]=useState(false),[zoom,setZoom]=useState(false),[compared,setCompared]=useState(false);
 const inc=state.security.incident;
 const [frame,setFrame]=useState(0);const live=state.power>=12&&state.eve>=15&&!reference;
 useEffect(()=>{if(!live)return;const timer=window.setInterval(()=>setFrame(x=>(x+1)%12),1100);return()=>window.clearInterval(timer)},[live]);
 const subjects=cameraSubjects(state,camera);const feed=<div className={'cctv-live-stage '+(!live&&!reference?'signal-off':'')} aria-label={reference?'정기 점검 기준 영상':'현재 개체 움직임 관측'}>{(live||reference)&&<ArtSlot src={gameplayArt.camera(camera)}/>}<div className="cctv-feed-grid" aria-hidden="true"/><span className="cctv-feed-stamp">{reference?'REFERENCE / 정지 프레임':live?'LIVE / FRAME '+String(frame+1).padStart(2,'0'):'SIGNAL LOST'}</span>{(live||reference)&&subjects.map((a,i)=>{const pos=cameraPosition(state,camera,a,i,reference?0:frame,reference);return <button key={a.id} type="button" className="cctv-moving-subject" style={{left:pos.x+'%',top:pos.y+'%'}} onClick={()=>onSelect(a.id)} aria-label={a.name+' 상태 보기'}><img src={animalSrc(a)} alt={a.name}/><small>{a.name}</small></button>})}{live&&!subjects.length&&<small className="cctv-feed-empty">현재 시야 내 확인된 생체 없음</small>}{!reference&&inc?.camera===camera&&inc.status==='escaped'&&<small className="cctv-feed-empty">{inc.tracked?'추적 동선 확인 · 위치 재확인 필요':'신호 소실 · 수동 추적 필요'}</small>}</div>;
 if(!inc||inc.camera!==camera)return <>{feed}<p className="ark-camera-quiet">{inc?'현재 채널에는 판독 대상이 없습니다. 경보 채널로 전환하십시오.':'정상 감시 중 · 이상 행동 발생 시 비교 판독이 열립니다.'}</p></>;
 const found=inc.camera===camera?cctvHotspotIndex(state):-1;
 const lost=state.power<3||state.eve<10;
 return <>{feed}<div className="v73-evidence cctv-forensics"><div className="v73-evidence-toolbar"><button type="button" aria-pressed={reference} onClick={()=>{setReference(!reference);setCompared(true)}}>{reference?'현재 영상으로 돌아가기':'정기 점검 기준과 비교'}</button><button type="button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'확대 해제':'영상 확대'}</button><span>{reference?'REFERENCE / 정상 점검 기준':lost?'SIGNAL DEGRADED':'LIVE / 현재 관측'} · 판독 전력 3</span></div>
 <div className="cctv-frame-strip"><span>FRAME {String((inc.observations??0)+1).padStart(2,'0')}</span><span>{compared?'기준 영상 확보':'기준 영상을 확인하세요'}</span><span>{inc.status==='escaped'?'신호 소실':inc.severity>=75?'격리 파손 임박':'감시 중'}</span></div>
 <div className={'v69-cctv-point-grid '+(zoom?'cctv-zoomed':'')} role="group" aria-label="CCTV 영상 속 이상 위치 클릭 판독">
 {[0,1,2,3].map(spot=>{const changed=!reference&&spot===found;return <button key={spot} type="button" disabled={reference||!!inc.manualInspected||state.power<3} className={'v69-cctv-point v73-evidence-point '+(changed?'has-trace ':'')+(inc.manualInspected&&spot===found?'v69-cctv-found':'')} onClick={()=>onInspect(spot)} aria-label={camera+' 영상 '+['좌상','우상','좌하','우하'][spot]+' 구역 직접 검사'}><span className={'v73-camera-detail detail-'+spot+(changed?' changed':'')} aria-hidden="true"><i/><i/><i/></span><b>{labels[spot]}</b><small>{reference?normal[spot]:inc.manualInspected?changed?abnormal[spot]:normal[spot]:compared||zoom?'시각적 변화 판독':'영상 비교 필요'}</small><span className="cctv-quadrant-index">Q0{spot+1}</span></button>})}
 </div><div className="cctv-forensics-footer"><p>{reference?'기준 영상은 판독할 수 없습니다. 현재 영상으로 돌아가 변화를 확인하세요.':inc.manualInspected?'판독 기록 저장됨 · 음성 교감 또는 야간 순찰로 이어갈 수 있습니다.':'정상 영상과 비교해 바뀐 지점을 판독하세요. 오탐 시 전력 -3, 위협 +2, 격리 위험 +8.'}</p>{onWatch&&<button type="button" disabled={reference||inc.manualInspected||inc.camera!==camera||state.power<2||inc.status==='escaped'} onClick={onWatch}>추가 프레임 관측 · 전력 -2 / 위험 +6</button>}</div></div></>;
}
