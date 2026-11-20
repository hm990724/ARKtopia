from pathlib import Path
p=Path('src/lib/origin-zero.ts')
s=p.read_text(encoding='utf8')
a=s.index('export function recallCandidates(')
b=s.index('export function studyOriginImmunity',a)
s=s[:a]+'''export type RecallCandidate={key:string;id:AnimalId;source:'live'|'hq'|'archive'|'escaped';label:string};
export function recallCandidates(s:V10):RecallCandidate[]{
 const entries=new Map<string,RecallCandidate>();
 for(const e of Object.values(s.archive?.entries??{})){
  if(!RECALL_CONTEXT[e.species])continue;
  entries.set(e.key,{key:e.key,id:e.species,source:e.status==='transferred'?'hq':e.status==='escaped'?'escaped':e.status==='contained'?'live':'archive',label:e.name});
 }
 for(const a of s.animals){
  const key=a.specimenId||`${a.id}-legacy-${a.room}`;
  const dossier=s.archive?.entries[key];
  const transferred=dossier?.status==='transferred'||(!a.alive&&s.headquarters?.transferred.includes(a.id));
  entries.set(key,{key,id:a.id,source:transferred?'hq':!a.alive?'archive':s.security?.escapedIds.includes(a.id)?'escaped':'live',label:a.name});
 }
 // Historical saves sometimes retained only the transfer species, without a body/dossier.
 for(const id of s.headquarters?.transferred??[])if(![...entries.values()].some(e=>e.id===id&&e.source==='hq')){
  const key=`${id}-legacy-hq`;entries.set(key,{key,id,source:'hq',label:specs.find(x=>x.id===id)?.name||id});
 }
 return [...entries.values()];
}
export const recallProtocols:Record<AnimalId,{title:string;signals:string[];sequence:number[]}>= {
 rabbit:{title:'보호 기억 · 진정 순서',signals:['호흡','접근','휴식'],sequence:[0,2,1]},
 fox:{title:'창고 CCTV · 우회 경로',signals:['정문','측문','창고'],sequence:[1,2,0]},
 deer:{title:'격리 회로 · 안전 경로',signals:['입력','접지','격리문'],sequence:[1,0,2]},
 wolf:{title:'경계 행동 · 안전 접근',signals:['멈춤','눈 낮추기','한 걸음'],sequence:[0,1,2]},
 owl:{title:'시야 회전 · 관측 각도',signals:['좌측','중앙','우측'],sequence:[2,0,1]},
 crow:{title:'미완성 선율 · 박자 복원',signals:['낮은 음','중간 음','높은 음'],sequence:[0,2,1]},
 otter:{title:'펌프 · 압력 흐름',signals:['밸브','펌프','배수'],sequence:[2,0,1]},
 lynx:{title:'사각지대 · 은폐 경로',signals:['그늘','정지','통로'],sequence:[0,1,2]},
 axolotl:{title:'재생 신호 · 안정 주기',signals:['수온','휴식','미광'],sequence:[0,2,1]},
 moth:{title:'광원 · 점등 순서',signals:['약광','암전','잔광'],sequence:[1,0,2]},
 mutant:{title:'간섭 신호 · 역순 복원',signals:['신호 A','신호 B','신호 C'],sequence:[2,1,0]},
 chimera:{title:'두 기억 · 동기화',signals:['기억 A','휴지','기억 B'],sequence:[0,2,1]}
};
export function recallSequence(c:RecallCandidate):number[]{
 const offset=[...c.key].reduce((v,ch)=>v+ch.charCodeAt(0),0)%3;
 const seq=recallProtocols[c.id].sequence;
 return [...seq.slice(offset),...seq.slice(0,offset)];
}
/** Each step is persisted. Incorrect input costs power but cannot erase a completed record. */
export function performRecallStep(s:V10,key:string,input:number):V10{
 const d=s.originZero,c=recallCandidates(s).find(x=>x.key===key);
 if(!c||!d?.route||d.photos<6||d.individualRecalls?.[key]||s.phase!=='day'||s.run||s.pendingIncident||s.ap<1||s.power<1||!Number.isInteger(input)||input<0||input>2)return s;
 const n=copy(s) as V10,state=o(n),step=state.recallSteps![key]??0;
 if(step>=3)return s;
 if(recallSequence(c)[step]!==input){n.power=cap(n.power-1);state.recallSteps![key]=0;return report(n,'재검사 신호 불일치','신호 순서가 어긋났습니다. 전력 -1. 기록을 다시 확인하고 재시도하세요.','bad');}
 state.recallSteps![key]=step+1;
 return report(n,'개체별 비교 신호',`${c.label} · ${key}: ${step+1}/3 신호 일치. ${step===2?'자료를 확정할 수 있습니다.':'다음 신호를 연결하세요.'}`);
}
export function performOriginRecall(s:V10,key:string):V10{
 const d=s.originZero,candidate=recallCandidates(s).find(x=>x.key===key);
 if(!d?.route||d.photos<6||!candidate||d.individualRecalls?.[key]||(d.recallSteps?.[key]??0)<3||s.phase!=='day'||s.ap<1||s.run||s.pendingIncident)return s;
 const powerCost=candidate.source==='hq'?12:candidate.source==='live'?8:5;
 if(s.power<powerCost)return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-powerCost);
 const animal=n.animals.find(a=>a.specimenId===key&&a.alive);
 const quality=candidate.source==='live'?Math.max(55,Math.min(95,95-Math.round((animal?.stress??10)/3))):candidate.source==='hq'?70:candidate.source==='escaped'?50:42;
 const result:RecallRecord={day:n.day,quality,source:candidate.source==='escaped'?'archive':candidate.source,note:RECALL_CONTEXT[candidate.id]!};
 state.individualRecalls![key]=result;
 // Keep old aggregate fields readable by previous builds; progression uses IDs only.
 state.recalls[candidate.id]=result;
 n.knowledge+=Math.round(quality/10);if(candidate.source==='live'&&animal){animal.stress=cap(animal.stress+6);animal.bond=cap(animal.bond+3);}
 if(candidate.source==='hq'){state.hqPressure+=5;if(state.route==='hq')state.hqIntel=cap(state.hqIntel+12);}
 const milestone=Math.floor(Object.keys(state.individualRecalls!).length/5);
 if(milestone>(state.recallMilestones??0)){n.parts+=2;n.knowledge+=10;state.recallMilestones=milestone;}
 return report(n,'ARK RECALL · 개체 재분석',`${candidate.label} · ${key}: ${result.note}. 품질 ${quality}%. ${candidate.source==='escaped'?'재포획 전 원격 흔적 대조로 부분 자료를 보존했습니다.':'기록 확정.'}`);
}
''' +s[b:]
s=s.replace('Object.keys(d.recalls).length<3','Object.keys(d.individualRecalls??{}).length<3').replace('Object.values(state.recalls)','Object.values(state.individualRecalls??{})').replace('Object.keys(d.recalls).length>=3','Object.keys(d.individualRecalls??{}).length>=3').replace('!!d.recalls[item.id]','!!d.individualRecalls?.[item.key]')
s=s.replace("s.day>=(d.firstPositiveDay??Infinity)+2", "d.photos>=6&&Object.keys(d.individualRecalls??{}).length>=1")
s=s.replace('폐기 구역 외벽의 잠금장치가 열렸다. 이송 기록에 공백이 생긴 날이다.','과학자가 M-00 폐기를 강행하면서 격리 안전장치를 해제했다. 연쇄 고장으로 감염 인자가 유출됐다. 고양이가 재앙을 일으킨 것이 아니다.')
s=s.replace('유출 뒤 여러 지역에서 동일한 이상 신호가 관측됐다. 확산 원인은 연구시설과 연관돼 있었다.','격리 실패를 은폐하는 동안 감염 인자가 외부로 확산됐다. 연구 책임자의 폐기 명령과 본부의 통제가 문명 붕괴를 불렀다.')
p.write_text(s,encoding='utf8')
