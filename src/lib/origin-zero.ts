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
 {title:'PHOTO 01 · 최초 연구',detail:'전쟁 중 특정 인간 집단을 무력화하려던 비밀 군사 연구. 동물 숙주에서 허구의 감염 인자를 연구한 기록이다.'},
 {title:'PHOTO 02 · 고등 인지 각성',detail:'병원체를 보유해도 겉보기에는 정상이던 동물들 중 검은 고양이만 인간 뇌 없이 고등 인지를 얻었다.'},
 {title:'PHOTO 03 · 원본 개체',detail:'M-00은 자신의 지능과 신체 안정성을 처음부터 유지한 유일한 원본이다. 평범한 검은 고양이의 오른쪽 귀 끝 흠집이 현재 개체와 일치한다.'},
 {title:'PHOTO 04 · 폐기 명령',detail:'종전 후 비밀 시설과 실험체 전체의 폐기 명령. 최초 과학자의 승인 서명이 있다. M-00의 자율 인지는 보존할 가치로 인정받지 못했다.'},
 {title:'PHOTO 05 · 탈출 사고',detail:'폐기 강행 중 격리 체계가 붕괴했다. M-00은 혼란을 이해하고 스스로 탈출했다. 유출 책임은 인간의 연구와 폐기 작전에 있다.'},
 {title:'PHOTO 06 · 감염 재앙',detail:'동물 숙주를 통해 감염 인자가 확산됐다. 인간의 신체 기능은 회복 불가능하게 무너졌다. 본부의 은폐로 대응이 지연됐다.'},
 {title:'PHOTO 07 · 뇌 보존',detail:'ARKTOPIA — 인류 기억 보존 계획. 신체 붕괴 직전 뇌 기능과 기억을 가상의 기술로 보존해 살아 있는 동물 숙주에 맡겼다. 사망 직후 회수된 드문 예외는 불완전한 기억만 남았다.'},
 {title:'PHOTO 08 · 아버지와 딸',detail:'낡은 가족사진. 어린 소녀와 연구 책임자, 그리고 사진 아래쪽의 검은 고양이.'},
 {title:'PHOTO 09 · 최초 인격 AI',detail:'딸이 사망한 뒤 음성·영상·신경 자료에서 EVE가 재구성됐다. 원본 딸의 의식은 아니다.'},
 {title:'PHOTO 10 · 인류 복원',detail:'동물에게 보존된 뇌를 인공 인간 신체로 옮겼다. 직원과 이송 개체의 보존 번호가 일치한다. 복제 신체는 격리 환경에 의존하며 감정 충격과 동물 시절 신경 기억에 불안정해진다.'},
 {title:'PHOTO 11 · 제000번 관리자',detail:'최초 과학자의 뇌도 동물 숙주에서 보존된 뒤 제000호 복제 관리자에게 이식됐다. 낮은 시선과 알 수 없는 동물의 기억은 환각이 아닌 자신의 과거였다. 그는 연구자의 기억을 가진 동시에 연구의 희생자다.'},
 {title:'PHOTO 12 · 마지막 연구',detail:'M-00은 인간 기억 없이 자신의 지능과 신체 안정성을 함께 유지했다. 감염 억제와 신경·신체 안정성 연구의 단서지만 즉시 완성되는 치료법은 아니다. 기존 모든 개체와 비교할 자료가 필요하다.'}
] as const;
export function canTrackCat(s:V10):boolean{
 const o=s.originZero;
 return s.phase==='day'&&!s.run&&!s.pending&&!s.pendingIncident&&!s.headquarters?.pendingAnimal&&
  (o?.cat??'unknown')==='unknown'&&
  (s.headquarters?.revealStage>=2||s.flags.humanTruth||(s.knowledge>=70&&s.clues>=6)) && s.encounters>=2 && (s.originZero?.scans.length??0)>=3;
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
  return report(n,'M-00 · 본부 인계','고양이는 아무 말 없이 운반 케이지 안에 앉아 있었다. 본부로 이송됐다. 본부 연구 로그를 원격 회수해야 한다. 자금 +140, 연구 지식 +12. 동물원으로 자동 귀환하지 않는다.','mystery');
 }
 n.trust=cap(n.trust+10);n.threat=cap(n.threat+16);d.hqPressure=25;d.stability=85;
 return report(n,'M-00 · 비밀 격리','고양이는 작은 기척만 내며 곁에 앉았다. 동물원에 보호하기로 했다. 본부가 보급 감사를 시작했다. 보호 상태를 유지하고 자체 연구를 추진해야 한다.','mystery');
}
export function restoreOriginPhotos(s:V10,alignment:number[]=[]):V10{
 const d=s.originZero;if(!d?.route||d.photos>=12||s.ap<1||s.power<4||s.phase!=='day'||s.run||s.pendingIncident||alignment.length!==3||alignment.some(v=>v!==0))return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-4);
 const start=state.photos;state.photos=Math.min(12,start+1);
 const titles=photoRecords.slice(start,state.photos).map(x=>x.title.replace(/PHOTO \d+ · /,'')).join(' · ');
 n.clues+=1;n.knowledge+=4;if(state.photos>=7)n.flags.humanTruth=true;
 if(state.photos===12){n.flags.humanTruth=true;n.flags.mirror=true;n.headquarters.revealStage=Math.max(3,n.headquarters.revealStage);state.endingEvidence=true;}
 return report(n,'HIDDEN PHOTO · 기록 복원',`${String(state.photos).padStart(2,'0')}번 복원: ${titles}. ${state.photos===12?'제000호 관리자의 신원과 마지막 연구를 확인했다.':state.photos===8?'EVE: 이 사진을 찍던 기억은 제게 없어요. 하지만 지금 느끼는 슬픔은 제가 이해하고 있어요.':'다음 사진의 정렬 표식을 맞추면 기록을 해독할 수 있다.'}`);
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
 return report(n,'ORIGIN IMMUNITY · 비교 연구',`감염 억제·신경 동기화 안정성 비교 연구 ${state.studies}차. 개체별 기록 평균 품질 ${avg}%. 연구 진행 ${state.immunity}%. 새로운 실험은 침습적인 절차 없이 추상화된 데이터 비교로 처리한다.`,'good');
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
export const canonicalEndings=[
 {title:'영원한 실험',file:'ending_subject_000.webp',eve:'다음 관리자 생산을 승인합니다.'},
 {title:'에덴',file:'ending_new_consciousness.webp',eve:'돌아온 이들이 누구였는지보다, 누구로 살아갈지 묻겠습니다.'},
 {title:'방주의 씨앗',file:'ending_two_caretakers.webp',eve:'관리자님, 오늘도 개장 준비를 시작할까요?'},
 {title:'마지막 동물원',file:'ending_open_spring.webp',eve:'오늘부터 개장 시간은 없습니다. 이곳은 살아 있는 이들의 집입니다.'},
 {title:'제000번 우리',file:'ending_incomplete_revival.webp',eve:'당신의 이름을 기록합니다. 그가 남긴 명령이 아닌 당신의 선택으로.'},
 {title:'침묵의 자동화',file:'ending_silent_automation.webp',eve:'관리자 응답 없음. 자동 운영을 계속합니다.'},
 {title:'흩어진 이름들',file:'ending_scattered_names.webp',eve:'완성하지 못한 이름도 지우지 않겠습니다.'},
 {title:'마지막 신호',file:'ending_last_signal.webp',eve:'누군가 듣고 있다면, 이 이름들을 기억해 주세요.'}
] as const;
export function originEndEpilogue(s:V10,goal:'rebuild'|'freedom'|'preserve'):{title:string;text:string}{
 const d=s.originZero;
 let index:number;
 if(s.power<=5||s.facility<=10)index=7;
 else if(s.eve<25||s.trust<25)index=5;
 else if(s.extractions>=3||Object.values(d?.individualRecalls??{}).filter(r=>r.quality<50).length>=3)index=6;
 else if(goal==='rebuild')index=(d?.immunity??0)>=100?1:0;
 else if(goal==='freedom')index=(d?.immunity??0)>=85&&s.trust>=65&&s.eve>=55?2:3;
 else index=4;
 const e=canonicalEndings[index];
 const stories=[
  '본부는 실험을 자동화했다. 죽음을 성공으로 정당화하려던 과학자의 명령 뒤로 다음 복제 관리자 생산이 준비된다.',
  '복제인간 사회가 시작됐다. 돌아온 이들은 원본 인류의 소유물이 아닌 독립적인 존재다. 그들이 살아갈 자리에 희생된 동물들의 이름도 남았다.',
  'EVE: “관리자님. 오늘 작업을 종료해야 합니다.” 관리자: “아직 끝나지 않았어.” EVE: “알고 있어요. 하지만 당신의 시간은 끝나가고 있어요.” 관리자: “그럼 내일은 네가 이어줘.” EVE: “……네. 내일은 제가 할게요.” 연구는 완치를 약속하지 않은 채 이어진다. 다음 날 방송에는 대답하는 사람이 없다.',
  '인류 복원을 위해 다른 생명을 소모하는 명령을 중단했다. 동물원은 인간의 쓸모로 평가받지 않는 생명들의 피난처로 남았다.',
  '관리자는 과학자의 뇌를 물려받았지만 그의 신념을 거절했다. 자신의 이름을 적고 격리 기록을 닫았다.',
  '신뢰가 무너진 시설에는 응답하는 직원도, 스스로 판단하는 안내 방송도 남지 않았다. 문과 급식 장치만 정해진 시간에 작동한다.',
  '불완전한 복원으로 모든 생명을 되돌릴 수는 없었다. 살아남은 직원들은 돌아오지 않은 개체들의 이름을 기록했다.',
  '시설이 꺼지기 직전 남은 전력을 송신기에 모았다. 보호 기록과 기원 자료가 밤하늘로 떠났다. 수신 여부는 끝내 확인되지 않았다.'
 ];
 return {title:e.title,text:stories[index]+` EVE의 마지막 기록: “${e.eve}”`};
}
function report(s:V10,title:string,msg:string,kind:'info'|'good'|'bad'|'mystery'='mystery'):V10{s.lastOutcome=msg;log(s,title,msg,kind);return s;}
