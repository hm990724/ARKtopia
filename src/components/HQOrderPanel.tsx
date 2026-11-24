'use client';
import {AlertTriangle,BookOpen,ChevronRight,FileWarning,RadioTower,ShieldCheck,Skull,Timer} from 'lucide-react';
import type {V10} from '@/lib/game-v10';
import {CREW_PROFILES,type CrewId} from '@/lib/crew';
import {animalSprite} from '@/lib/animal-art';
import {specs} from '@/lib/sim';
import type {HqOrderChoice} from '@/lib/hq-orders';
const opinions:Record<CrewId,string>={rabbit:'살아 있는 개체입니다. 다른 방법도 검토해 주세요.',fox:'본부 지원을 거부하면 물자 확보가 어려워질 거예요.',wolf:'명령의 목적을 모르는데 무조건 따를 수는 없죠.',deer:'새 개체 등록과 지령의 시각이 일치해요. 기록해 두겠습니다.'};
export default function HQOrderPanel({state,onChoose}:{state:V10;onChoose:(choice:HqOrderChoice)=>void}){
 const order=state.hqOrders?.active;if(!order||order.status!=='offered')return null;
 const available=state.knowledge>=12&&state.clues>=2&&state.power>=6;
 const staff=(state.crew?.members??[]).filter(m=>m.mind>0&&!state.crew?.retired?.includes(m.id));
 const name=specs.find(s=>s.id===order.species)?.name??'미지정 표본';
 return <div className="v56-hq-backdrop ark-directive-overlay" role="dialog" aria-modal="true" aria-label="본부 기밀 지령"><section className="ark-directive">
 <header><div><span><RadioTower size={16}/> ARK HEADQUARTERS / SECURE LINK</span><h2>기밀 회수 지령</h2></div><div className="ark-directive-live"><i/> 수신 완료 <small>CLASSIFIED / RED</small></div></header>
 <div className="ark-directive-main"><aside className="ark-directive-subject"><span>SUBJECT / 최초 등록</span>{order.species&&<img src={animalSprite(order.species)} alt={name}/>}<h3>{name}</h3><small>{order.id}</small><div><Timer size={16}/> DAY {order.dueDay}까지 제출</div></aside>
 <div className="ark-directive-letter"><span>중앙 본부 · 암호화 전문</span><h3>{order.title}</h3><p>신규 등록 생체의 신경 조직을 회수하여 본부로 송신하십시오. 이 지령의 세부 연구 목적은 공개하지 않습니다.</p><p>{order.brief}</p><div className="ark-directive-eve"><RadioTower size={16}/><span>EVE: 지령 수락은 조직 제출 계약입니다. 실제 회수 여부는 담당자님이 결정합니다.</span></div>{staff.length>0&&<details><summary><BookOpen size={14}/> 직원 의견 {staff.length}건</summary>{staff.map(m=><p key={m.id}><b>{CREW_PROFILES[m.id].post}</b> · {opinions[m.id]}</p>)}</details>}</div></div>
 <div className="ark-directive-actions"><button onClick={()=>onChoose('accept')}><Skull size={20}/><span><b>지령 수락</b><small>지정 개체 조직 회수 계약</small></span><ChevronRight size={16}/></button><button disabled={!available} onClick={()=>onChoose('substitute')}><ShieldCheck size={20}/><span><b>대체 자료 제안</b><small>{available?'비침습 연구 기록으로 협상':'연구 자원 부족'}</small></span><ChevronRight size={16}/></button><button onClick={()=>onChoose('refuse')}><FileWarning size={20}/><span><b>명령 거부</b><small>개체 보호 · 본부와 갈등</small></span><ChevronRight size={16}/></button></div>
 <footer><AlertTriangle size={14}/> 수락만으로 개체가 사라지지 않습니다. 실제 회수는 분석실에서 별도로 승인합니다.</footer></section></div>
}
