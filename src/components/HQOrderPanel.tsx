'use client';
import {AlertTriangle,BookOpen,ChevronRight,FileWarning,RadioTower,ShieldCheck,Skull,Timer} from 'lucide-react';
import type {V10} from '@/lib/game-v10';
import {CREW_PROFILES,type CrewId} from '@/lib/crew';
import type {HqOrderChoice} from '@/lib/hq-orders';
const opinions:Record<CrewId,string>={
 rabbit:'그 조직은 살아 있었을 수도 있어요. 그냥 보내선 안 돼요. 기록부터 검토해 주세요.',
 fox:'물자 잔고를 보세요. 본부 지원 없이 이 시설이 얼마나 버틸 수 있다고 생각하세요?',
 wolf:'위험한 개체를 놔둘 수도 없어요. 하지만 저쪽이 요구하는 이유도 확인해야죠!',
 deer:'표본 일련번호가 이상해요. 이전 송신 기록과 겹쳐요... 제가 기록을 다시 볼게요.'
};
type Props={state:V10;onChoose:(choice:HqOrderChoice)=>void};
export default function HQOrderPanel({state,onChoose}:Props){
 const order=state.hqOrders?.active;
 if(!order||order.status!=='offered')return null;
 const available=state.knowledge>=12&&state.clues>=2&&state.power>=6;
 const staff=(state.crew?.members??[]).filter(m=>m.mind>0&&!state.crew?.retired?.includes(m.id));
 return <div className="v56-hq-backdrop" role="dialog" aria-modal="true" aria-label="본부 우선 회수 지령">
  <div className="v56-hq-modal"><div className="v56-hq-top"><div><span className="v56-micro"><RadioTower size={15}/> HEADQUARTERS / CRITICAL TRANSMISSION</span><h2>{order.title}</h2><p>권한 등급 RED · 중앙 회수처에서 발신된 명령입니다.</p></div><span className="v56-hq-deadline"><Timer size={18}/> D{order.issueDay} → D{order.dueDay}</span></div>
   <section className="v56-hq-message"><span>중앙 본부 / 미확인 발신처</span><p>“시설 내 신경 조직 표본 하나를 회수하여 송신하십시오. 정해진 기한 내 회수가 이루어지지 않을 경우 지원 및 격리 안전 프로토콜이 조정됩니다.”</p><small>{order.brief}</small></section>
   <div className="v56-hq-crew"><b><BookOpen size={14}/> 내부 인력 의견 · 실제 배치 인원만 표시</b><div>{staff.length?staff.map(m=><div key={m.id}><span>{CREW_PROFILES[m.id].post}</span><p>“{opinions[m.id]}”</p></div>):<p className="v56-hq-empty">배치된 직원이 없어 EVE 분석만 수신됩니다.</p>}</div></div>
   <div className="v56-hq-choice-title">관리자 최종 응답 · 세 가지 지령 대응</div>
   <div className="v56-hq-options">
    <button type="button" onClick={()=>onChoose('accept')}><Skull size={23}/><strong>01 · 지령 수락</strong><p>기한 내 해부 신경 표본 1개 송신</p><small>완수 시 기본 표본 보상 외 CR +300 · 부품 +2 · 간섭도 -10</small></button>
    <button type="button" disabled={!available} title={!available?'지식 12·단서 2·전력 6 필요':'대체 자료 제출 가능'} onClick={()=>onChoose('substitute')}><ShieldCheck size={23}/><strong>02 · 대체 자료 제안</strong><p>비침습적 연구 자료로 협상</p><small>{available?'지식 -12 · 단서 -2 · 전력 -6 / CR +65 · 간섭도 +7':'지식 12 · 단서 2 · 전력 6 필요 · 현재 자원 부족'}</small></button>
    <button type="button" onClick={()=>onChoose('refuse')}><FileWarning size={23}/><strong>03 · 명령 거부</strong><p>동물의 생존과 독립 연구를 우선</p><small>즉시 불이익: 간섭도 +18 · 외부 위협 +11</small></button>
   </div>
   <footer className="v56-hq-footer"><AlertTriangle size={15}/> 인계된 살아 있는 개체는 조직 납품으로 계산되지 않습니다. 판정은 기록과 시설 상태에 영구 반영됩니다.</footer>
  </div>
 </div>
}
