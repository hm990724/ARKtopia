'use client';
import {useEffect,useRef,useState} from 'react';
import type {V10} from '@/lib/game-v10';
import {storyArtworkCandidates} from '@/lib/story-art';
import StoryStill from './StoryStill';
type Scene={id:string;show:boolean;sources:readonly string[];title:string;text:string};
/** All archive entries reflect genuine evidence and past choices. */
export default function OriginStoryArtwork({state:s}:{state:V10}){
 const [selected,setSelected]=useState<number|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(selected!==null&&!dialog.current?.open)dialog.current?.showModal()},[selected]);
 const d=s.originZero;if(!d?.firstPositiveDay)return null;
 const cg=(id:number,show:boolean,title:string,text:string):Scene=>({id:String(id),show,sources:storyArtworkCandidates(id),title,text});
 const scenes:Scene[]=[
  cg(8,!!s.roamingStory?.firstEncounterDay,'최초 배회 위협 조우','특수 변이체 MUTANT의 실제 배회 신호를 확인했다. 검은 고양이 M-00과는 별개의 개체다.'),
  cg(9,!!s.roamingStory?.lastStandDay&&!!s.crew?.retired.includes('wolf'),'경비관의 마지막 엄호','현장 엄호를 선택한 결과 경비관이 돌아오지 못했다. 일반 정신력 붕괴와는 다른 사건이다.'),
  cg(10,true,'검은 고양이 발견','깨진 CCTV의 과장된 그림자 뒤에는 정상적인 검은 고양이가 있었다.'),
  cg(11,true,'기원 표식 일치','감염 판정이 아니다. 원본 개체의 식별 표식이 일치했다. 왜 본부가 집착하는지는 아직 밝혀지지 않았다.'),
  cg(12,d.route==='hq','이송된 검은 고양이','원격 기록을 되찾아야 한다. 고양이는 자동으로 돌아오지 않는다.'),
  cg(13,d.route==='shelter','비밀 격리실의 작은 생명','고양이는 아무 말도 하지 않는다. 연구를 서두를지, 이 생명을 지킬지는 관리자의 선택이다.'),
  {id:'escape',show:d.photos>=6,sources:['/assets/cinematics/origin-zero/scene_origin_escape.png'],title:'폐기 명령과 격리 붕괴',text:'인간이 강행한 폐기 작전이 격리 체계를 무너뜨렸다. M-00은 그 혼란에서 살아 나왔다.'},
  {id:'collapse',show:d.photos>=6,sources:['/assets/cinematics/origin-zero/scene_collapse.png'],title:'무너진 도시',text:'탈출한 고양이의 악의가 아니라, 책임을 지우려던 인간의 결정이 재앙을 만들었다.'},
  cg(14,d.photos>=7,'인간과 동물의 관계','일부 동물은 인간의 뇌를 보존한 숙주였다. 본부의 인력 복원 기록과 연결된다. M-00은 이 이식의 결과가 아니다.'),
  cg(15,d.photos>=8,'사진 속 아이','과학자와 딸, 그리고 검은 고양이. 오래된 사진 속 아이가 EVE와 닮아 있다.'),
  cg(16,d.photos>=11,'제000번 관리자','최초 과학자의 뇌는 동물 숙주를 거쳐 관리자 신체로 돌아왔다. 기억이 같아도 선택은 같을 필요가 없다.'),
  cg(17,d.photos>=8&&s.narrative?.choices?.daughter_archive===1,'EVE의 독립적 선택','EVE는 과거의 기록이 아니라 자신이 내릴 선택으로 살아가겠다고 말했다.'),
  cg(18,!!d.route&&d.photos>=6,'다시 만나는 개체들','첫 건강 검사는 표면 상태만 확인했다. 각 개체의 기억과 신체 안정성을 재분석한다.'),
  {id:'scientist',show:d.photos>=12,sources:['/assets/characters/scientist_obsession.png'],title:'실패라고 이름 붙인 생명',text:'과학자는 인간의 뇌 없이 사고하는 M-00의 가치를 외면했다.'}
 ];
 const available=scenes.filter(x=>x.show),scene=selected===null?null:available[selected];
 return <><details className="v71-story-archive"><summary>복원된 사건 영상 · {available.length}건</summary><div className="v71-story-grid">{available.map((x,i)=><figure key={x.id}><button className="v72-scene-open" onClick={()=>setSelected(i)} aria-label={x.title+' 장면 보기'}><StoryStill sources={x.sources} alt={x.title}/><small>장면 확대 ↗</small></button><figcaption><strong>{x.title}</strong><p>{x.text}</p></figcaption></figure>)}</div></details><dialog ref={dialog} className="v72-story-dialog" aria-label="복원된 사건 영상 보기" onClose={()=>setSelected(null)}>{scene&&<><StoryStill sources={scene.sources} alt={scene.title}/><section><h3>{scene.title}</h3><p>{scene.text}</p><nav><button disabled={selected===0} onClick={()=>setSelected(x=>Math.max(0,(x??0)-1))}>이전 장면</button><button disabled={selected===available.length-1} onClick={()=>setSelected(x=>Math.min(available.length-1,(x??0)+1))}>다음 장면</button><button onClick={()=>dialog.current?.close()} autoFocus>닫기 · Esc</button></nav></section></>}</dialog></>;
}
export function OriginFarewell({ending}:{ending:string}){
 if(!ending.startsWith('방주의 씨앗'))return null;
 return <section className="v71-farewell" aria-label="관리자님의 마지막 보고"><StoryStill sources={storyArtworkCandidates(19)} alt="주인공과 EVE의 마지막 보고"/><div><p>EVE: “관리자님. 오늘 작업을 종료해야 합니다.”</p><p>관리자: “아직 끝나지 않았어.”</p><p>EVE: “알고 있어요. 하지만 당신의 시간은 끝나가고 있어요.”</p><p>관리자: “그럼 내일은 네가 이어줘.”</p><p>EVE: “……네. 내일은 제가 할게요.”</p><p className="v71-last-broadcast">다음 날 — “관리자님, 오늘도 개장 준비를 시작할까요?”<br/>이번에는 대답하는 사람이 없었다.</p></div></section>;
}
