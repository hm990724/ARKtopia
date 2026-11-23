'use client';
import {useEffect,useRef,useState} from 'react';
import type {V10} from '@/lib/game-v10';

/** Recovered illustrations are shown only after their corresponding evidence. */
export default function OriginStoryArtwork({state:s}:{state:V10}){
 const [selected,setSelected]=useState<number|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(selected!==null&&!dialog.current?.open)dialog.current?.showModal()},[selected]);
 const d=s.originZero;if(!d?.firstPositiveDay)return null;
 const scenes=[
  {show:true,file:'cinematics/origin-zero/scene_m00_positive.png',title:'기원 표식 일치',text:'감염 판정이 아니다. 인간 뇌 없이 지능과 신체 안정성을 유지한 원본 개체의 표식이다.'},
  {show:!!d.route,file:`cinematics/origin-zero/scene_m00_${d.route==='hq'?'transfer':'protect'}.png`,title:d.route==='hq'?'이송된 검은 고양이':'비밀 격리실의 작은 생명',text:d.route==='hq'?'원격 기록을 되찾아야 한다. 고양이는 자동으로 돌아오지 않는다.':'고양이는 아무 말도 하지 않는다. 연구를 서두를지, 이 생명을 지킬지는 관리자의 선택이다.'},
  {show:d.photos>=6,file:'cinematics/origin-zero/scene_origin_escape.png',title:'폐기 명령과 격리 붕괴',text:'인간이 강행한 폐기 작전이 격리 체계를 무너뜨렸다. M-00은 그 혼란에서 살아 나왔다.'},
  {show:d.photos>=6,file:'cinematics/origin-zero/scene_collapse.png',title:'무너진 도시',text:'탈출한 고양이의 악의가 아니라, 책임을 지우려던 인간의 결정이 재앙을 만들었다.'},
  {show:d.photos>=6,file:'cinematics/origin-zero/scene_ark_recall.png',title:'다시 만나는 개체들',text:'첫 건강 검사는 표면 상태만 확인했다. 이제 고유 개체마다 M-00과 비교할 기억·신체 안정성 자료가 필요하다.'},
  {show:d.photos>=8,file:'characters/daughter_portrait.png',title:'사진 속 아이',text:'이 아이와 EVE는 같은 존재가 아니다. 남겨진 기록은 한 생명의 전부를 되살리지 못한다.'},
  {show:d.photos>=9,file:'characters/scientist_archive.png',title:'보존 계획의 책임자',text:'신체 기능이 회복 불가능해지기 전, 가상의 기억 보존 기술로 인간의 뇌를 동물 숙주에 보존했다. 기억의 완전한 복원은 보장되지 않았다.'},
  {show:d.photos>=12,file:'characters/scientist_obsession.png',title:'실패라고 이름 붙인 생명',text:'그는 인류 복원에 집착한 나머지, 인간의 뇌 없이 스스로 사고하는 M-00의 가치를 외면했다.'},
 ];
 const available=scenes.filter(x=>x.show),scene=selected===null?null:available[selected];
 return <><details className="v71-story-archive"><summary>복원된 사건 영상 · {available.length}건</summary><div className="v71-story-grid">{available.map((x,i)=><figure key={x.file}><button className="v72-scene-open" onClick={()=>setSelected(i)} aria-label={`${x.title} 장면 보기`}><img src={'/assets/'+x.file} alt={x.title} loading="lazy"/><small>장면 확대 ↗</small></button><figcaption><strong>{x.title}</strong><p>{x.text}</p></figcaption></figure>)}</div></details><dialog ref={dialog} className="v72-story-dialog" aria-label="복원된 사건 영상 보기" onClose={()=>setSelected(null)}>{scene&&<><img src={'/assets/'+scene.file} alt={scene.title}/><section><h3>{scene.title}</h3><p>{scene.text}</p><nav><button disabled={selected===0} onClick={()=>setSelected(x=>Math.max(0,(x??0)-1))}>이전 장면</button><button disabled={selected===available.length-1} onClick={()=>setSelected(x=>Math.min(available.length-1,(x??0)+1))}>다음 장면</button><button onClick={()=>dialog.current?.close()} autoFocus>닫기 · Esc</button></nav></section></>}</dialog></>;
}

export function OriginFarewell({ending}:{ending:string}){
 if(!ending.startsWith('방주의 씨앗'))return null;
 return <section className="v71-farewell" aria-label="관리자님의 마지막 보고"><div><p>EVE: “관리자님. 오늘 작업을 종료해야 합니다.”</p><p>관리자: “아직 끝나지 않았어.”</p><p>EVE: “알고 있어요. 하지만 당신의 시간은 끝나가고 있어요.”</p><p>관리자: “그럼 내일은 네가 이어줘.”</p><p>EVE: “……네. 내일은 제가 할게요.”</p><p className="v71-last-broadcast">다음 날 — “관리자님, 오늘도 개장 준비를 시작할까요?”<br/>이번에는 대답하는 사람이 없었다.</p></div></section>;
}
