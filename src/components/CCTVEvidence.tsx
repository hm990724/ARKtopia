import {useState} from 'react';
import type {V10} from '@/lib/game-v10';
import {cctvHotspotIndex,type CameraId} from '@/lib/security';
const labels=['잠금 장치','급수 밸브','바닥 흔적','감시 조명'],normal=['잠금','닫힘','흔적 없음','점등'],abnormal=['잠금 풀림','밸브 열림','새 발자국','소등'];
export default function CCTVEvidence({state,camera,onInspect}:{state:V10;camera:CameraId;onInspect:(spot:number)=>void}){
 const [reference,setReference]=useState(false);
 const inc=state.security.incident;if(!inc)return null;
 const found=inc.camera===camera?cctvHotspotIndex(state):-1;
 return <div className="v73-evidence"><div className="v73-evidence-toolbar"><button type="button" aria-pressed={reference} onClick={()=>setReference(!reference)}>{reference?'현재 영상으로 돌아가기':'정기 점검 기준과 비교'}</button><span>{reference?'REFERENCE / 정상 점검 기준':'LIVE / 현재 관측'} · 판독 전력 3</span></div><div className="v69-cctv-point-grid" role="group" aria-label="CCTV 영상 속 이상 위치 클릭 판독">
 {[0,1,2,3].map(spot=>{const changed=!reference&&spot===found;return <button key={spot} type="button" disabled={reference||!!inc.manualInspected||state.power<3} className={'v69-cctv-point v73-evidence-point '+(changed?'has-trace ':'')+(inc.manualInspected&&spot===found?'v69-cctv-found':'')} onClick={()=>onInspect(spot)} aria-label={`${camera} 영상 ${['좌상','우상','좌하','우하'][spot]} 구역 직접 검사`}><span className={'v73-camera-detail detail-'+spot+(changed?' changed':'')} aria-hidden="true"><i/><i/><i/></span><b>{labels[spot]}</b><small>{changed?abnormal[spot]:normal[spot]}</small></button>})}
 </div><p>{reference?'기준 영상은 판독할 수 없습니다. 현재 영상으로 돌아가 변화를 확인하세요.':inc.manualInspected?'판독 기록 저장됨 · 음성 교감 또는 야간 순찰로 이어갈 수 있습니다.':'바뀐 흔적을 찾아 판독하세요. 다른 카메라에는 변화가 없을 수 있습니다. 오탐 시 위협 +2.'}</p></div>;
}

