/** ORIGIN ZERO story runtime. Everything is data-only / JSON serializable.
 * Fictional diagnosis and resistance work are deliberately abstract gameplay.
 * No real-world biological procedure is represented here.
 */
import type {V10} from './game-v10';
import type {AnimalId} from './sim';
import {cap,copy,log,specs} from './sim';

export type CatStage='unknown'|'traced'|'captured'|'positive'|'hq'|'shelter';
export type OriginRoute='hq'|'shelter'|null;
export type RecallRecord={day:number;quality:number;source:'live'|'hq'|'archive';note:string};
export type OriginZeroState={version:1;scans:string[];privateMatches:Record<string,'NEGATIVE'|'POSITIVE'>;cat:CatStage;trackProgress:number;wrongTracks:number;firstPositiveDay:number|null;route:OriginRoute;photos:number;recalls:Partial<Record<AnimalId,RecallRecord>>;individualRecalls?:Record<string,RecallRecord>;recallSteps?:Record<string,number>;recallMilestones?:number;immunity:number;studies:number;hqPressure:number;endingEvidence:boolean;stability:number;hqIntel:number;crisisDone:boolean};
export const emptyOriginZero=():OriginZeroState=>({version:1,scans:[],privateMatches:{},cat:'unknown',trackProgress:0,wrongTracks:0,firstPositiveDay:null,route:null,photos:0,recalls:{},immunity:0,studies:0,hqPressure:0,endingEvidence:false,stability:85,hqIntel:0,crisisDone:false});
export function ensureOriginZero(s:V10):OriginZeroState{
 const o=s.originZero??(s.originZero=emptyOriginZero());
 o.scans??=[];o.privateMatches??={};o.recalls??={};o.photos=Math.max(0,Math.min(12,o.photos??0));o.immunity=cap(o.immunity??0);
 o.trackProgress=Math.max(0,Math.min(3,o.trackProgress??0));o.wrongTracks??=0;o.studies??=0;o.hqPressure??=0;o.stability??=85;o.hqIntel??=0;o.crisisDone??=false;
 if(!o.individualRecalls){
  o.individualRecalls={};
  // One legacy species result credits ONE recorded individual, never all siblings.
  for(const [species,result] of Object.entries(o.recalls)){
   const first=recallCandidates(s).find(c=>c.id===species);
   if(first&&result)o.individualRecalls[first.key]=result;
  }
 }
 o.recallSteps??={};o.recallMilestones??=Math.floor(Object.keys(o.individualRecalls).length/5);
 return o;
}
export const photoRecords=[
 {title:'PHOTO 01 · 최초 연구',detail:'폐쇄된 연구동. 쥐에서 시작된 신경 적응 연구가 다른 종으로 확대되고 있었다.'},
 {title:'PHOTO 02 · 고등 인지 각성',detail:'인간 뇌 이식 이력이 없는 실험체에서 고등 인지 행동이 확인됐다.'},
 {title:'PHOTO 03 · 원본 개체',detail:'폐기된 파일 속 평범한 검은 고양이. 귀 가장자리의 작은 흉터가 현재 개체와 일치한다.'},
 {title:'PHOTO 04 · 폐기 명령',detail:'안정성 기준 미달. 폐기 승인란에 최초 연구 책임자의 서명이 남아 있다.'},
 {title:'PHOTO 05 · 탈출 사고',detail:'과학자가 M-00 폐기를 강행하면서 격리 안전장치를 해제했다. 연쇄 고장으로 감염 인자가 유출됐다. 고양이가 재앙을 일으킨 것이 아니다.'},
 {title:'PHOTO 06 · 감염 재앙',detail:'격리 실패를 은폐하는 동안 감염 인자가 외부로 확산됐다. 연구 책임자의 폐기 명령과 본부의 통제가 문명 붕괴를 불렀다.'},
 {title:'PHOTO 07 · 뇌 보존',detail:'인류가 붕괴하자 동물 신체에 인간의 뇌를 보존하는 대체 계획이 시작됐다.'},
 {title:'PHOTO 08 · 아버지와 딸',detail:'낡은 가족사진. 어린 소녀와 연구 책임자, 그리고 사진 아래쪽의 검은 고양이.'},
 {title:'PHOTO 09 · 최초 인격 AI',detail:'딸이 사망한 뒤 음성·영상·신경 자료에서 EVE가 재구성됐다. 원본 딸의 의식은 아니다.'},
 {title:'PHOTO 10 · 인류 복원',detail:'보존된 뇌를 복제인간에게 다시 이식하는 본부의 재생 설계도.'},
 {title:'PHOTO 11 · 제000번 관리자',detail:'최초 과학자의 보존 뇌가 복제 신체로 이식됐다. 생존 신원: 현재 관리자.'},
 {title:'PHOTO 12 · 마지막 연구',detail:'M-00의 신체 안정성이 감염 예방 연구의 실마리였지만 원 연구자는 기존 계획의 오류를 인정하지 않았다.'}
] as const;
export function canTrackCat(s:V10):boolean{
 const o=s.originZero;
 return s.phase==='day'&&!s.run&&!s.pending&&!s.pendingIncident&&!s.headquarters?.pendingAnimal&&
  (o?.cat??'unknown')==='unknown'&&
  (s.headquarters?.revealStage>=2||s.flags.humanTruth) && s.encounters>=2 && (s.originZero?.scans.length??0)>=3;
}
export function importOldOriginScans(s:V10):void{
 const d=ensureOriginZero(s);
 for(const a of s.animals){const key=a.specimenId;if(key&&!d.scans.includes(key)){d.scans.push(key);d.privateMatches[key]='NEGATIVE';}}
 for(const entry of Object.values(s.archive?.entries??{})){const key=entry.key;if(key&&!d.scans.includes(key)){d.scans.push(key);d.privateMatches[key]='NEGATIVE';}}
}
export function routineOriginScan(s:V10,id:AnimalId):void{
 const o=ensureOriginZero(s);const a=s.animals.find(a=>a.id===id);
 const key=a?.specimenId||`${id}-DAY${s.day}`;
 if(o.scans.includes(key))return;
 o.scans.push(key);o.privateMatches[key]='NEGATIVE';
 // The HQ-only marker is intentionally concealed. This is not an infection test.
 log(s,'생체 건강 검사 완료',`${a?.name||specs.find(p=>p.id===id)?.name||'개체'}: 기초 건강 및 신경 반응 확인 · 세부 본부 항목 접근 제한.`,'info');
}
export function initiateOriginTrack(s:V10):V10{
 if(!canTrackCat(s)||s.ap<1)return s;
 const n=copy(s) as V10;o(n).cat='traced';n.ap--;
 return report(n,'새로운 생체 신호','외곽 카메라에 변이 징후 없는 검은 고양이가 찍혔다. 평범한 동물처럼 행동한다. 영상의 경로를 찾아 포획하자.');
}
function o(s:V10){return ensureOriginZero(s)}
// Player reads the camera hint and manually picks a matching view. Wrong guesses
// increase pressure; no random automatic success and no one-click capture.
export const catTrackFrames=[
 {hint:'세 번째 녹화 화면에서만 쓰러진 표지판이 보인다.',answer:2,frames:['출입문','지하 통로','쓰러진 표지판']},
 {hint:'바닥에 물기가 없는 유일한 화면으로 발자국이 이어진다.',answer:0,frames:['마른 복도','침수 창고','물웅덩이']},
 {hint:'작은 고양이 그림자가 붉은 비상등 아래에 멈춰 있다.',answer:1,frames:['일반 조명','붉은 비상등','파손된 창']}
] as const;
export function pickOriginTrace(s:V10,frame:number):V10{
 const state=s.originZero;if(state?.cat!=='traced'||!Number.isInteger(frame)||frame<0||frame>2||s.phase!=='day')return s;
 const n=copy(s) as V10;const d=o(n);const point=catTrackFrames[d.trackProgress];
 if(frame!==point.answer){d.wrongTracks++;n.threat=cap(n.threat+3);return report(n,'영상 경로 불일치','화면의 움직임이 끊어졌다. 흔적은 아직 남아 있다. 위협 +3.','bad');}
 d.trackProgress++;
 if(d.trackProgress===3){d.cat='captured';return report(n,'정상 개체 포획','검은 고양이를 안전 케이지에 옮겼다. 변이 징후가 전혀 없다. 본부 규정에 따라 생체검사를 실시해야 한다.','good');}
 return report(n,'영상 경로 확보',`감시 기록 ${d.trackProgress}/3 일치. 다음 카메라 흔적으로 이동한다.`,'good');
}
export function analyzeOriginCat(s:V10):V10{
 if(s.originZero?.cat!=='captured'||s.phase!=='day'||s.ap<1||s.power<6)return s;
 const n=copy(s) as V10;const d=o(n);n.ap--;n.power=cap(n.power-6);d.cat='positive';d.firstPositiveDay=n.day;d.privateMatches['ORIGIN-M00']='POSITIVE';
 return report(n,'ORIGIN SIGNATURE · POSITIVE','검사 완료. 기원 표식 일치: POSITIVE / M-00. 기존 감염 양성 판정과는 다른 검사다. 본부가 즉시 이송을 요구한다.','mystery');
}
export function chooseOriginRoute(s:V10,route:'hq'|'shelter'):V10{
 if(s.originZero?.cat!=='positive'||s.originZero.route||s.phase!=='day')return s;
 const n=copy(s) as V10;const d=o(n);d.route=route;d.cat=route==='hq'?'hq':'shelter';
 if(route==='hq'){
  n.knowledge+=12;n.credits+=140;d.hqPressure=0;d.hqIntel=20;
  return report(n,'M-00 · 본부 인계','고양이는 본부로 이송됐다. 본부 연구 로그를 원격 회수해야 한다. 자금 +140, 연구 지식 +12. 동물원으로 자동 귀환하지 않는다.','mystery');
 }
 n.trust=cap(n.trust+10);n.threat=cap(n.threat+16);d.hqPressure=25;d.stability=85;
 return report(n,'M-00 · 비밀 격리','고양이를 동물원에 보호하기로 했다. 본부가 보급 감사를 시작했다. 보호 상태를 유지하고 자체 연구를 추진해야 한다.','mystery');
}
export function restoreOriginPhotos(s:V10):V10{
 const d=s.originZero;if(!d?.route||d.photos>=12||s.ap<1||s.power<8||s.phase!=='day'||s.run||s.pendingIncident)return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-8);
 const start=state.photos;state.photos=Math.min(12,start+3);
 const titles=photoRecords.slice(start,state.photos).map(x=>x.title.replace(/PHOTO \d+ · /,'')).join(' · ');
 n.clues+=1;n.knowledge+=4;
 if(state.photos===12){n.flags.humanTruth=true;n.flags.mirror=true;n.headquarters.revealStage=Math.max(3,n.headquarters.revealStage);state.endingEvidence=true;}
 return report(n,'HIDDEN PHOTO · 원본 복원',`${String(start+1).padStart(2,'0')}~${String(state.photos).padStart(2,'0')}번 복원: ${titles}. ${state.photos===12?'제000호 관리자의 신원과 마지막 연구를 확인했다.':'손상된 사진의 다음 구획을 해독할 수 있다.'}`);
}
export const RECALL_CONTEXT:Partial<Record<AnimalId,string>>={
 rabbit:'기억 활성 상태에서 치료와 안정화 반응 확인',fox:'CCTV를 이용해 오래된 이동 경로 대조',wolf:'보호 행동과 접근 거부 신호 측정',deer:'오염 지역에서 안전한 이동 경로 확보',owl:'야간 음향 패턴의 반복성 기록',crow:'반복 수집 행동과 장소 기억 비교',otter:'유수 환경 적응 및 스트레스 대조',lynx:'은폐 행동과 미세 반응 관찰',axolotl:'신체 재생 신호의 안정성 검토',moth:'야간 빛 반응을 통한 신경 적응 비교',mutant:'불안정한 조직 재생 반응의 비침습 기록',chimera:'신경 동기화의 불안정한 결합 기록'
};
export type RecallCandidate={key:string;id:AnimalId;source:'live'|'hq'|'archive'|'escaped';label:string};
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
export function studyOriginImmunity(s:V10):V10{
 const d=s.originZero;if(!d?.route||d.photos<9||Object.keys(d.individualRecalls??{}).length<3||d.immunity>=100||s.phase!=='day'||s.ap<1||s.power<10||s.knowledge<12||s.run||s.pendingIncident||!d.crisisDone||(d.route==='hq'&&d.hqIntel<35)||(d.route==='shelter'&&d.stability<35))return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-10);n.knowledge-=12;state.studies++;
 const qualities=Object.values(state.individualRecalls??{}).map(r=>r.quality);
 const avg=Math.round(qualities.reduce((a,b)=>a+b,0)/qualities.length);
 const routeBoost=state.route==='shelter'?6:0;
 state.immunity=cap(state.immunity+20+Math.floor(avg/10)+routeBoost+(state.photos===12?5:0));
 if(state.route==='shelter'){state.hqPressure+=8;n.threat=cap(n.threat+4);}else n.eve=cap(n.eve-2);
 return report(n,'ORIGIN IMMUNITY · 비교 연구',`허구의 면역 안정성 모델 연구 ${state.studies}차. 개체별 기록 평균 품질 ${avg}%. 연구 진행 ${state.immunity}%. 새로운 실험은 침습적인 절차 없이 추상화된 데이터 비교로 처리한다.`,'good');
}
/** HQ branch retrieves remote records; shelter branch must maintain a living subject. */
export function originBranchAction(s:V10,choice:'retrieve'|'stabilize'):V10{
 const d=s.originZero;
 if(!d?.route||s.phase!=='day'||s.ap<1||s.run||s.pendingIncident)return s;
 if(choice==='retrieve'&&d.route==='hq'){
  if(s.power<10)return s;
  const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-10);
  state.hqIntel=cap(state.hqIntel+27);state.hqPressure+=4;n.clues++;
  return report(n,'본부 자료 회수','M-00을 반환받지 않고 중앙 연구 로그의 암호화된 조각을 확보했다. 직접 분석권이 없어도 독립 연구를 진행할 수 있다.');
 }
 if(choice==='stabilize'&&d.route==='shelter'){
  if(s.medicine<1)return s;
  const n=copy(s) as V10;const state=o(n);n.ap--;n.medicine--;state.stability=cap(state.stability+23);n.threat=cap(n.threat+2);
  return report(n,'M-00 비침습 안정화','격리 환경과 보조 처치를 조절하여 M-00의 생체 안정도를 회복했다. 건강한 고양이를 훼손하지 않았다.','good');
 }
 return s;
}
/** The branch's final emergency is a distinct, one-time choice with persistent cost. */
export function originCrisisAvailable(s:V10):boolean{
 const d=s.originZero;return !!d?.route&&!d.crisisDone&&d.photos>=6&&Object.keys(d.individualRecalls??{}).length>=1&&s.phase==='day'&&!s.run&&!s.pendingIncident;
}
export function resolveOriginCrisis(s:V10,choice:'protect'|'knowledge'):V10{
 if(!originCrisisAvailable(s))return s;
 const n=copy(s) as V10;const d=o(n);d.crisisDone=true;
 if(d.route==='hq'){
  if(choice==='protect'){n.trust=cap(n.trust+6);n.threat=cap(n.threat+9);d.hqIntel=cap(d.hqIntel+15);return report(n,'본부 연구 개입','M-00의 직접 실험 확대를 저지하고 원격 기록을 보존했다. 본부는 접근 권한을 제한하기 시작했다.');}
  n.knowledge+=16;n.eve=cap(n.eve-7);d.hqIntel=cap(d.hqIntel+25);
  return report(n,'본부 연구 결과 수신','본부가 위험한 실험을 강행했다. 자료는 확보했으나 무엇을 잃었는지 알 수 없다.','bad');
 }
 if(choice==='protect'){n.parts=Math.max(0,n.parts-1);d.stability=cap(d.stability+18);n.threat=cap(n.threat+8);return report(n,'격리시설 방어','파손된 차폐문을 보강하고 M-00을 보호했다. 부품과 시간을 잃었지만 개체는 안전하다.','good');}
 d.stability=cap(d.stability-24);n.knowledge+=15;n.trust=cap(n.trust-6);
 return report(n,'연구 우선 · 격리 불안정','기록을 확보하는 동안 시설 경보를 늦게 확인했다. M-00의 안정도가 떨어졌다.','bad');
}
/** Branch consequences persist between days; no random irreversible cat death. */
export function tickOriginDay(s:V10):void{
 const d=ensureOriginZero(s);if(!d.route)return;
 if(d.route==='shelter'){
  const decay=s.facility<40?12:s.infection>55?9:s.facilities.containment?2:5;
  d.stability=cap(d.stability-decay);
  if(d.stability<35)log(s,'비밀 격리실 경고','M-00의 안정도가 낮습니다. 보급실 의약품으로 환경을 안정화하십시오.','bad');
  d.hqPressure+=3;s.threat=cap(s.threat+3);
 }else{d.hqPressure+=1;}
}
export function originReadyForFinale(s:V10){const d=s.originZero;return !!d?.route && d.crisisDone && d.photos>=12 && Object.keys(d.individualRecalls??{}).length>=3 && recallCandidates(s).every(item=>!!d.individualRecalls?.[item.key]) && d.immunity>=75;}
export function originEndEpilogue(s:V10,goal:'rebuild'|'freedom'|'preserve'):{title:string;text:string}{
 const d=s.originZero;
 if(!d?.route)return {title:'닫힌 기록',text:'M-00의 신원이 확인되지 않은 채 마지막 관리자의 신경 신호가 끊겼다.'};
 if(goal==='rebuild')return {title: d.immunity>=100?'에덴':'영원한 실험',text:d.immunity>=100?'복제인간 사회가 구성되었다. 그러나 그들은 원본 인류와 다른 기억과 감각을 지닌 독립적인 생명들이었다.':'본부는 뇌 이식과 복제인간 생산을 멈추지 않았다. 최초 과학자의 집착이 또 한 번 명령으로 남았다.'};
 if(goal==='freedom')return {title:d.immunity>=85&&d.photos===12?'방주의 씨앗':'마지막 동물원',text:d.immunity>=85&&d.photos===12?'관리자는 M-00의 저항성 기록과 각 개체의 비교 자료를 EVE에게 남겼다. 예방 연구가 언젠가 결실을 볼지는 아무도 모른다.':'추출 장치가 멈췄다. 보존된 개체는 누구의 연구 재료가 아닌 생명으로 남았다.'};
 return {title:'제000번 우리',text:'관리자는 최초 과학자의 뇌를 물려받았지만 그의 신념을 따를 의무는 없다고 기록했다. EVE는 기억이 아니라 지금의 결정을 보존했다.'};
}
function report(s:V10,title:string,msg:string,kind:'info'|'good'|'bad'|'mystery'='mystery'):V10{s.lastOutcome=msg;log(s,title,msg,kind);return s;}
