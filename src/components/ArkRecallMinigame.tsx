'use client';
import type {AnimalId} from '@/lib/sim';
import {protocols} from '@/lib/protocols';
import type {RecallSession} from '@/lib/origin-zero';

const modes:Record<AnimalId,{title:string;instruction:string}>= {
 rabbit:{title:'임상 반응 순서',instruction:'자극 뒤 호흡과 앞발 반응을 차례로 대조합니다.'},
 fox:{title:'보급 동선 복원',instruction:'물자의 위치 관계와 이동 흔적을 함께 확인합니다.'},
 deer:{title:'기록 배열 복원',instruction:'명찰보다 기록 사이의 위치와 공백을 비교합니다.'},
 owl:{title:'기하 궤도 관측',instruction:'회전한 도형의 주기와 어긋난 각도를 찾습니다.'},
 wolf:{title:'경계 교대 관측',instruction:'경고와 보호 행동 사이의 순서를 판독합니다.'},
 crow:{title:'미완성 네 음',instruction:'음표와 침묵이 이어지는 위치를 대조합니다.'},
 otter:{title:'수압 회로 복원',instruction:'밸브 표식과 흐름이 바뀐 순서를 읽습니다.'},
 lynx:{title:'발자국 분기 판독',instruction:'겹친 흔적에서 첫 시선과 실제 이동을 분리합니다.'},
 axolotl:{title:'재생 신호 정렬',instruction:'손상 전후의 조직 반응을 같은 지점에서 대조합니다.'},
 moth:{title:'잔광 간격 판독',instruction:'빛이 사라진 뒤 남은 간격을 기억 기록과 맞춥니다.'},
 mutant:{title:'중첩 발화 분리',instruction:'겹친 음성 중 숨과 침묵을 지우지 않고 분리합니다.'},
 chimera:{title:'상충 신호 동기화',instruction:'서로 다른 행동이 겹치는 구간을 찾아냅니다.'},
 specter:{title:'백색 잔향 추적',instruction:'사라진 뒤에도 남는 신호의 간격을 복원합니다.'},
};

function Instrument({id,step}:{id:AnimalId;step:number}){
 const active=step+1;
 if(id==='owl')return <svg className="ark-recall-instrument owl" viewBox="0 0 300 96" aria-label="회전 각도 관측기"><circle cx="150" cy="48" r="34"/><circle cx="150" cy="48" r="21"/><path d="M150 10v76M112 48h76M123 21l54 54M177 21l-54 54"/><path className="active" d={`M150 48 L${150+30*Math.cos(active*1.2)} ${48+30*Math.sin(active*1.2)}`}/></svg>;
 if(id==='crow')return <svg className="ark-recall-instrument crow" viewBox="0 0 300 96" aria-label="네 박자 악보"><path d="M28 31h244M28 43h244M28 55h244M28 67h244M28 79h244"/>{[0,1,2,3].map(i=><g key={i} className={i===step?'active':''}><ellipse cx={75+i*51} cy={49+(i%2)*15} rx="8" ry="5"/><path d={`M83 ${49+(i%2)*15}v-30`}/></g>)}</svg>;
 if(id==='moth')return <svg className="ark-recall-instrument moth" viewBox="0 0 300 96" aria-label="나방 잔광 간격"><path d="M150 48 Q92 4 42 28 Q64 56 150 48 Q208 4 258 28 Q236 56 150 48Z"/><path d="M150 48 Q94 88 46 67 Q83 48 150 48 Q207 88 254 67 Q218 48 150 48Z"/>{[0,1,2].map(i=><circle key={i} className={i===step?'active':''} cx={88+i*62} cy={48} r={18-i*4}/>)}</svg>;
 if(id==='otter')return <svg className="ark-recall-instrument otter" viewBox="0 0 300 96" aria-label="수압 밸브 회로"><path d="M26 48h67v-24h65v48h54V35h62M93 24v48M158 24v48M212 35v26"/>{[93,158,212].map((x,i)=><g key={x} className={i===step?'active':''}><circle cx={x} cy={48} r="12"/><path d={`M${x-7} 48h14M${x} 41v14`}/></g>)}</svg>;
 if(id==='wolf')return <svg className="ark-recall-instrument wolf" viewBox="0 0 300 96" aria-label="경비 순찰 지도"><path d="M24 72h60V28h54v44h58V28h80"/><path d="M78 28v44M138 28v44M196 28v44" strokeDasharray="4 5"/>{[0,1,2,3].map(i=><circle key={i} className={i===step?'active':''} cx={54+i*62} cy={i%2?50:72} r="8"/>)}</svg>;
 if(id==='fox')return <svg className="ark-recall-instrument fox" viewBox="0 0 300 96" aria-label="물자 선반 배치"><path d="M44 22h212v62H44zM44 52h212M114 22v62M184 22v62"/>{[0,1,2,3,4,5].map(i=><g key={i} className={i===step+1?'active':''}><rect x={58+(i%3)*70} y={29+Math.floor(i/3)*30} width="24" height="16" rx="2"/><path d={`M${82+(i%3)*70} ${37+Math.floor(i/3)*30}h18`}/></g>)}</svg>;
 if(id==='lynx')return <svg className="ark-recall-instrument lynx" viewBox="0 0 300 96" aria-label="겹친 발자국 분기"><path d="M24 70 C75 70 64 28 120 28 S162 69 213 69 S247 35 276 35"/><path d="M24 70 C75 70 93 49 120 48 S162 26 213 26 S247 60 276 60" strokeDasharray="5 5"/>{[0,1,2,3].map(i=><g key={i} className={i===step?'active':''}><ellipse cx={55+i*62} cy={65-i%2*34} rx="7" ry="4"/><circle cx={48+i*62} cy={59-i%2*34} r="2"/><circle cx={55+i*62} cy={56-i%2*34} r="2"/><circle cx={62+i*62} cy={59-i%2*34} r="2"/></g>)}</svg>;
 if(id==='rabbit')return <svg className="ark-recall-instrument rabbit" viewBox="0 0 300 96" aria-label="의료 심박 파형"><path d="M20 51h50l12-7 12 14 15-40 18 61 14-29 11 3h128"/><path className="active" d={`M${37+active*58} 38v26`}/></svg>;
 if(id==='axolotl')return <svg className="ark-recall-instrument axolotl" viewBox="0 0 300 96" aria-label="재생 조직 단계"><path d="M44 49h212"/>{[0,1,2,3].map(i=><g key={i} className={i<=step?'active':''}><circle cx={54+i*64} cy="49" r={7+i*4}/><path d={`M${54+i*64} ${28-i*2}v-10M${54+i*64} ${70+i*2}v10`}/></g>)}</svg>;
 if(id==='deer')return <svg className="ark-recall-instrument deer" viewBox="0 0 300 96" aria-label="기록 보존 계보"><path d="M150 82V24M150 37L96 19M150 37l54-18M150 56L72 45M150 56l78-11M150 73l-94-7M150 73l94-7"/>{[0,1,2,3].map(i=><rect key={i} className={i===step?'active':''} x={136-i*6} y={16+i*17} width={28+i*12} height="8" rx="2"/>)}</svg>;
 if(id==='specter')return <svg className="ark-recall-instrument specter" viewBox="0 0 300 96" aria-label="사라지는 잔향"><path d="M20 48h260"/>{[0,1,2,3,4].map(i=><g key={i} className={i===step+1?'active':''} opacity={1-i*.14}><circle cx={48+i*51} cy={48} r={15-i*2}/><circle cx={48+i*51} cy={48} r={5}/></g>)}</svg>;
 if(id==='mutant')return <svg className="ark-recall-instrument mutant" viewBox="0 0 300 96" aria-label="중첩 발화 분리"><path className="wave-a" d="M20 33h22l8-16 11 32 12-24 12 12h27l10-12 10 24 11-38 12 22h30l10-8 12 19 12-24 12 13h36"/><path className="wave-b" d="M20 68h34l10-8 10 16 12-20 12 12h35l9-18 11 30 12-12h31l10-13 12 22 12-18 10 9h30"/></svg>;
 return <svg className="ark-recall-instrument chimera" viewBox="0 0 300 96" aria-label="상충 신호 교차"><path className="wave-a" d="M20 24 C80 24 60 70 120 70 S170 24 220 24 S255 48 280 48"/><path className="wave-b" d="M20 72 C80 72 60 26 120 26 S170 72 220 72 S255 48 280 48"/><circle cx="150" cy="48" r="12"/></svg>;
}

export default function ArkRecallMinigame({id,name,session,onAnswer,onClose}:{id:AnimalId;name:string;session:RecallSession;onAnswer:(choice:number)=>void;onClose:()=>void}){
 const mode=modes[id],protocol=protocols[id],stage=protocol.steps[session.step];
 const ordered=[0,1,2].map(index=>(index+(id.length+session.step*2))%3);
 return <div className="ark-recall-shade" role="dialog" aria-modal="true" aria-label={`${name} 개체별 기억 재수집`}>
  <section className="ark-recall-card">
   <header><div><span>ARK RECALL // SPECIMEN LINK</span><h3>{name} · {mode.title}</h3><p>{mode.instruction}</p></div><button type="button" onClick={onClose} aria-label="기록하고 닫기">기록 저장 · 닫기</button></header>
   <div className="ark-recall-instrument-wrap"><Instrument id={id} step={session.step}/><div className="ark-recall-meters"><span>신호 단계 <b>{session.step+1} / 3</b></span><span>일치 기록 <b>{session.correct} / {session.step}</b></span></div></div>
   <p className="ark-recall-cue">{protocol.hint}</p><h4>{stage.prompt}</h4>
   <div className="ark-recall-choices">{ordered.map((choice,index)=><button key={choice} type="button" onClick={()=>onAnswer(choice)}><b>0{index+1}</b><span>{stage.choices[choice]}</span><i aria-hidden="true">↗</i></button>)}</div>
   <small>응답은 개체 번호와 함께 저장됩니다. 틀린 반응도 연구 자료이며 개체를 해치지 않습니다.</small>
  </section>
 </div>;
}
