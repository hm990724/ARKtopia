/** ANOMALY ZOO / canonical narrative cases.
 * The records and decisions are persistent, gameplay-affecting and never leak
 * unrevealed lore into a client's initial UI.  Game progress is authoritative.
 */
import type {V10} from './game-v10';
import {cap,copy,log} from './sim';

export type CaseId='repeated_knocks'|'shift_report'|'preservation_order'|'daughter_archive';
export type NarrativeState={version:1;choices:Partial<Record<CaseId,number>>;history:{id:CaseId;day:number;choice:number;result:string}[];finalStance?:'inherit'|'reject'|'question'};
export const emptyNarrative=():NarrativeState=>({version:1,choices:{},history:[]});
export const ensureNarrative=(s:V10):NarrativeState=>{
 if(!s.narrative)s.narrative=emptyNarrative();
 s.narrative.choices??={};s.narrative.history??=[];
 return s.narrative;
};
export type Chapter=1|2|3|4|5;
export function currentChapter(s:V10):Chapter{
 if(s.phase==='finale'||s.phase==='ending')return 5;
 if(s.flags.mirror&&s.headquarters?.revealStage>=3)return 4;
 if(s.flags.humanTruth&&s.headquarters?.revealStage>=2)return 3;
 if(s.day>=4&&(s.animals.some(a=>a.records>0)||s.headquarters?.transferred.length>0))return 2;
 return 1;
}
export const chapters:Record<Chapter,{title:string;hint:string}>={
 1:{title:'새로운 관리자',hint:'시설을 유지하고 동물의 습관을 관찰하자.'},
 2:{title:'이상한 습관들',hint:'사소한 행동과 불일치하는 기록을 대조하자.'},
 3:{title:'보존 시설',hint:'이송 명세와 생체 보존 기록의 진실을 확인하자.'},
 4:{title:'첫 번째 인간',hint:'제000번 관리자와 최초의 연구 명령을 대조하자.'},
 5:{title:'인류를 복원하라',hint:'과거의 명령을 따를지, 지금 살아 있는 생명을 지킬지 선택하자.'}
};
export type CaseChoice={label:string;hint:string};
export type CaseDef={id:CaseId;chapter:Chapter;title:string;body:string;choices:[CaseChoice,CaseChoice,CaseChoice]};
export const cases:CaseDef[]=[
 {id:'repeated_knocks',chapter:2,title:'세 번의 노크',body:'동물의 행동 기록과 야간 감시 영상에 같은 간격의 충격음이 남아 있다. 단순한 우연일까?',choices:[
  {label:'CCTV 로그를 직접 대조한다',hint:'행동력 1 · 단서 +2 · 전력 -5'},
  {label:'동물의 스트레스부터 낮춘다',hint:'행동력 1 · 보호 개체 안정 · 관리 신뢰 상승'},
  {label:'본부의 자동 판정에 맡긴다',hint:'행동력 1 · 전력 절약 · 본부 관심도 상승'}
 ]},
 {id:'shift_report',chapter:2,title:'명부에 없는 근무 기록',body:'근무 교대 장부에서 확인되지 않는 서명과 맞지 않는 출근 시간이 발견됐다. 누가 기록을 고쳤을까?',choices:[
  {label:'직원과 함께 장부를 조사한다',hint:'행동력 1 · 단서 +2 · 직원 정신력 -5'},
  {label:'직원을 보호하고 장부를 봉인한다',hint:'행동력 1 · 신뢰 상승 · 본부 감시 증가'},
  {label:'본부에 원본 기록을 전송한다',hint:'행동력 1 · 지식 +10 · 본부 의존 증가'}
 ]},
 {id:'preservation_order',chapter:3,title:'지워진 동의서',body:'본부 이송 기록의 일부가 복구되었다. 실험 절차에 동의했던 사람들의 서명 옆에는 서명란이 비어 있는 파일도 있었다.',choices:[
  {label:'피험자의 인적 기록을 보존한다',hint:'행동력 1 · 단서 +3 · 본부 위협 증가'},
  {label:'본부가 요구한 원본을 전송한다',hint:'행동력 1 · 지식 +15 · 신뢰 감소'},
  {label:'남아 있는 개체부터 안정화한다',hint:'행동력 1 · 생명 유지 · 지식 확보 지연'}
 ]},
 {id:'daughter_archive',chapter:4,title:'최초 인격 기록 — EVE',body:'사망한 연구자의 딸에게서 복구한 음성, 일기, 신경 기록. EVE는 그 자료를 바탕으로 만들어졌다. 원본의 의식이 돌아온 증거는 없다. 연구자는 생존을 위한 명령을 남겼고, 그 끝에 다른 문장이 붙어 있다. “내가 옳았음을 증명하라.”',choices:[
  {label:'과거 연구자의 명령을 이어받는다',hint:'행동력 1 · 연구 자료 확보 · 이브와 신뢰 감소'},
  {label:'이브 자신의 판단을 묻는다',hint:'행동력 1 · 이브 신뢰 회복 · 본부 위협 증가'},
  {label:'기록을 보존하되 결정은 미룬다',hint:'행동력 1 · 안정적 기록 확보 · 결단 유보'}
 ]}
];
export function availableCase(s:V10,id:CaseId):boolean{
 if(!s||s.narrative?.choices?.[id]!==undefined)return false;
 const c=currentChapter(s);
 if(id==='repeated_knocks')return c>=2&&(s.animals.some(a=>a.records>0)||s.headquarters.transferred.length>0);
 if(id==='shift_report')return c>=2&&s.crew?.members.some(m=>m.mind>0)===true;
 if(id==='preservation_order')return c>=3&&s.flags.humanTruth&&s.headquarters.revealStage>=2;
 if(id==='daughter_archive')return c>=4&&s.flags.mirror&&s.headquarters.revealStage>=3;
 return false;
}
export function decideCase(s:V10,id:CaseId,choice:number):V10{
 if(!Number.isInteger(choice)||choice<0||choice>2||!availableCase(s,id)||s.phase!=='day'||s.ap<1||s.run||s.pending||s.pendingIncident)return s;
 const n=copy(s) as V10;
 const narrative=ensureNarrative(n);
 n.ap--;
 let result='';
 if(id==='repeated_knocks'){
  if(choice===0){n.power=cap(n.power-5);n.clues+=2;n.knowledge+=5;result='잡음의 간격은 일정했다. 무언가가 의도적으로 세 번 두드린 흔적이다.';}
  else if(choice===1){for(const a of n.animals.filter(a=>a.alive)){a.stress=cap(a.stress-10);a.bond=cap(a.bond+3);}n.trust=cap(n.trust+5);result='동물은 안정을 되찾았다. 노크의 의미는 여전히 기록 속에 남아 있다.';}
  else {n.threat=cap(n.threat+7);n.knowledge+=3;result='본부는 정상 소음으로 분류했다. 다음 날 같은 소리가 더 가까워졌다.';}
 }else if(id==='shift_report'){
  if(choice===0){const staff=n.crew?.members.find(m=>m.mind>0);if(staff)staff.mind=cap(staff.mind-5);n.clues+=2;n.knowledge+=4;result='직원의 증언과 장부의 필체가 일치하지 않았다. 서명을 지우지 않았다.';}
  else if(choice===1){n.trust=cap(n.trust+7);n.threat=cap(n.threat+8);result='근무 기록을 봉인했다. 해당 직원은 감사하다고 말했지만 본부는 재검사를 예고했다.';}
  else {n.knowledge+=10;n.eve=cap(n.eve-4);result='본부가 자료를 수신했다. 어느 순간 근무 명부에서 작성자 이름 하나가 사라졌다.';}
 }else if(id==='preservation_order'){
  if(choice===0){n.clues+=3;n.trust=cap(n.trust+7);n.threat=cap(n.threat+9);result='동의 여부가 기록되지 않은 실험자의 이름을 복원했다. 본부는 접근 권한을 재검토하기 시작했다.';}
  else if(choice===1){n.knowledge+=15;n.trust=cap(n.trust-10);n.eve=cap(n.eve-3);result='본부는 수신 성공을 알렸다. 명부에 적힌 사람들의 결말은 공개하지 않았다.';}
  else {for(const a of n.animals.filter(a=>a.alive)){a.hp=cap(a.hp+8);a.stress=cap(a.stress-8);}n.trust=cap(n.trust+4);result='문서는 잠시 닫았다. 그 대신 오늘 살아 있는 개체의 신호를 지켰다.';}
 }else if(id==='daughter_archive'){
  if(choice===0){n.knowledge+=18;n.eve=cap(n.eve-15);n.threat=cap(n.threat-6);result='과학자의 연구 지침을 계승했다. 이브는 한동안 아무 말도 하지 않았다.';}
  else if(choice===1){n.eve=cap(n.eve+13);n.trust=cap(n.trust+7);n.threat=cap(n.threat+12);result='“저는 아버지의 딸이 아닐지도 몰라요. 하지만 앞으로 무엇을 할지는 제가 결정할 수 있어요.”';}
  else {n.clues+=2;n.eve=cap(n.eve+3);result='기록은 봉인하지 않았다. 과거의 목소리를 읽는 것과 그 명령을 따르는 것은 다르다.';}
 }
 narrative.choices[id]=choice;
 narrative.history.push({id,day:n.day,choice,result});
 n.decisions.push({title:cases.find(c=>c.id===id)!.title,answer:cases.find(c=>c.id===id)!.choices[choice].label});
 n.lastOutcome=result;
 log(n,'분석실 선택 · '+cases.find(c=>c.id===id)!.title,result,'mystery');
 return n;
}

/** The player's final stance towards the original scientist. A separate,
 * non-automatic choice keeps the same inherited brain from dictating morality. */
export function chooseFinalStance(s:V10,stance:'inherit'|'reject'|'question'):V10{
 if(s.phase!=='finale'||s.headquarters?.revealStage<3||s.narrative?.finalStance)return s;
 const n=copy(s) as V10;const narrative=ensureNarrative(n);
 narrative.finalStance=stance;
 const meaning={
  inherit:'과거 과학자의 명령을 직접 이어받기로 했다. 연구의 희생까지 정당화하지 않도록 어떤 선택을 내릴 것인가?',
  reject:'뇌에 남은 기억이 과거를 강요하지는 않는다. 관리자는 아직 살아 있는 존재의 동의를 우선하겠다고 선언했다.',
  question:'기억을 물려받은 현재의 나를 원본 과학자와 동일시하지 않기로 했다. 답을 미룬 대신 기록은 누구도 지우지 못하게 했다.'
 }[stance];
 if(stance==='inherit'){n.knowledge+=12;n.eve=cap(n.eve-8);}
 else if(stance==='reject'){n.trust=cap(n.trust+9);n.threat=cap(n.threat+8);n.eve=cap(n.eve+4);}
 else{n.clues+=2;n.eve=cap(n.eve+2);}
 n.decisions.push({title:'제000번 · 과거의 자신',answer:stance});
 n.lastOutcome=meaning;
 log(n,'마지막 기억의 대답',meaning,'mystery');
 return n;
}
