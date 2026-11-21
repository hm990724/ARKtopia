/** ORIGIN ZERO story runtime. Everything is data-only / JSON serializable.
 * Fictional diagnosis and resistance work are deliberately abstract gameplay.
 * No real-world biological procedure is represented here.
 */
import type {V10} from './game-v10';
import type {AnimalId} from './sim';
import {cap,copy,log,specs} from './sim';

export type CatStage='unknown'|'traced'|'captured'|'positive'|'hq'|'shelter';
export type OriginRoute='hq'|'shelter'|null;
export type RecallRecord={specimenId?:string;day:number;quality:number;source:'live'|'hq'|'archive';note:string};
export type OriginZeroState={version:1;scans:string[];privateMatches:Record<string,'NEGATIVE'|'POSITIVE'>;cat:CatStage;trackProgress:number;wrongTracks:number;firstPositiveDay:number|null;route:OriginRoute;photos:number;recalls:Partial<Record<AnimalId,RecallRecord>>;individualRecalls?:Record<string,RecallRecord>;immunity:number;studies:number;hqPressure:number;endingEvidence:boolean;stability:number;hqIntel:number;crisisDone:boolean};
export const emptyOriginZero=():OriginZeroState=>({version:1,scans:[],privateMatches:{},cat:'unknown',trackProgress:0,wrongTracks:0,firstPositiveDay:null,route:null,photos:0,recalls:{},immunity:0,studies:0,hqPressure:0,endingEvidence:false,stability:85,hqIntel:0,crisisDone:false});
export function ensureOriginZero(s:V10):OriginZeroState{
 const o=s.originZero??(s.originZero=emptyOriginZero());
 o.scans??=[];o.privateMatches??={};o.recalls??={};o.photos=Math.max(0,Math.min(12,o.photos??0));o.immunity=cap(o.immunity??0);
 o.trackProgress=Math.max(0,Math.min(3,o.trackProgress??0));o.wrongTracks??=0;o.studies??=0;o.hqPressure??=0;o.stability??=85;o.hqIntel??=0;o.crisisDone??=false;
 return o;
}
export const photoRecords=[
 {title:'PHOTO 01 · 전쟁의 그림자',detail:'전쟁 당시 비공개 군사 연구의 시작. 동물 숙주를 이용한 허구의 변이 인자 연구가 숨겨져 있다.'},
 {title:'PHOTO 02 · 예상 밖의 지능',detail:'연구 중 동물 숙주 한 마리가 인간 뇌 없이도 스스로 학습하고 탈출 경로를 기억했다.'},
 {title:'PHOTO 03 · M-00',detail:'겉으로는 정상인 검은 고양이. 오른쪽 귀 끝의 작은 흠집과 가슴의 흰 털 한 가닥이 원본과 일치한다.'},
 {title:'PHOTO 04 · 종전과 폐기',detail:'전쟁 종료 후 비밀 프로젝트 폐기 승인. 연구 책임자는 생존·보존 목적의 가치를 외면한 채 명령을 내렸다.'},
 {title:'PHOTO 05 · 사라진 개체',detail:'종전 후 폐기 작전 당일, M-00은 경비의 허점을 기억해 스스로 빠져나갔다. 격리 체계가 무너진 날이었다.'},
 {title:'PHOTO 06 · 인간의 종말',detail:'허구의 감염 인자는 동물에게선 큰 외형 변화 없이 이동했지만 인간의 신체에는 치명적 기능 붕괴를 일으켰다. 전 세계의 사회 기반이 무너졌다.'},
 {title:'PHOTO 07 · ARKTOPIA 방주',detail:'인류 붕괴 후 뇌 장기 동결 기술이 부족하자, 기능이 남은 인간의 뇌와 기억을 살아 있는 동물 숙주에 보존하기 시작했다. 동물의 인간적 행동은 기억 동기화의 흔적이다.'},
 {title:'PHOTO 08 · 아버지와 딸',detail:'낡은 가족사진. 어린 소녀와 연구 책임자, 그리고 사진 아래쪽의 검은 고양이.'},
 {title:'PHOTO 09 · 최초 인격 AI',detail:'딸이 사망한 뒤 음성·영상·신경 자료에서 EVE가 재구성됐다. 원본 딸의 의식은 아니다.'},
 {title:'PHOTO 10 · 불안정한 귀환',detail:'본부는 동물 숙주에 보존한 인간의 뇌를 복제 신체로 옮겼다. 성공한 인간 직원들도 감정적 충격과 전력 불안정으로 신체 기억 충돌을 겪는다.'},
 {title:'PHOTO 11 · 제000번 숙주',detail:'최초 연구 책임자의 뇌는 한동안 동물 숙주를 거친 뒤 제1호 복제 관리자 신체로 돌아왔다. 동물 시절 기억의 파편이 현재 관리자의 꿈에 남아 있다.'},
 {title:'PHOTO 12 · 놓친 치료의 가능성',detail:'정상 동물인 M-00만은 지능과 신체 안정성을 장기간 유지했다. 이 특성이 허구의 예방·신체 안정화 연구의 핵심이었지만 과학자는 자신의 실패를 인정하지 않았다.'}
] as const;
export function canTrackCat(s:V10):boolean{
 const o=s.originZero;
 return s.phase==='day'&&!s.run&&!s.pending&&!s.pendingIncident&&!s.headquarters?.pendingAnimal&&
  (o?.cat??'unknown')==='unknown'&&
  (((s.headquarters?.revealStage??0)>=2&&s.encounters>=2) || (s.encounters>=3&&(s.archive?.revealed||((s.crew?.members.length??0)>=2))&&(s.headquarters?.revealStage>=1||s.flags.humanTruth)) || (s.day>=30&&s.encounters>=2));
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
/** Archive grouping puzzles: select matching evidence before decoding each three-photo bundle.
 * A missing answer is kept as the legacy batch recovery API for existing automated tests.
 */
export const originArchiveCiphers=[
 {question:'종전 후 폐기 문서에 찍힌 식별 코드는 무엇을 의미하는가?',options:['기원 실험체','이송 차량','시설 전원'],answer:0},
 {question:'폐기 당일 가장 중요한 누락 자료는?',options:['배식 기록','비상 격리 기록','출근 명부'],answer:1},
 {question:'인간이 살아남기 위해 시작한 방주 계획은?',options:['관람 시설 재개장','야생 개체 방생','살아 있는 숙주에 기억 보존'],answer:2},
 {question:'동물에서 되돌아온 인간이 지닌 위험은?',options:['기억-신체 동기화 오류','색소 결핍','단순 피로'],answer:0}
] as const;
export function restoreOriginPhotos(s:V10,answer?:number):V10{
 const d=s.originZero;if(!d?.route||d.photos>=12||s.ap<1||s.power<8||s.phase!=='day'||s.run||s.pendingIncident)return s;
 const start=d.photos;
 if(answer!==undefined&&answer!==originArchiveCiphers[Math.floor(start/3)].answer){
  const n=copy(s) as V10;n.power=cap(n.power-2);n.threat=cap(n.threat+2);
  return report(n,'사진 암호 대조 실패','보존 기록의 순서가 맞지 않습니다. 전력 -2, 위협 +2. 올바른 증거를 다시 선택하세요.','bad');
 }
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-8);state.photos=Math.min(12,start+3);
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
 const items=new Map<string,RecallCandidate>();
 for(const entry of Object.values(s.archive?.entries??{})){
  if(!RECALL_CONTEXT[entry.species])continue;
  items.set(entry.key,{key:entry.key,id:entry.species,label:entry.name,source:entry.status==='transferred'?'hq':entry.status==='escaped'?'escaped':'archive'});
 }
 for(const a of s.animals){
  const key=a.specimenId||a.id+'-legacy-'+a.room;
  const old=s.archive?.entries[key];
  const transferred=!!(a as typeof a&{transferred?:boolean}).transferred||(!a.alive&&(old?.status==='transferred'||(!old&&s.headquarters?.transferred.includes(a.id))));
  items.set(key,{key,id:a.id,label:a.name,source:transferred?'hq':!a.alive?'archive':s.security?.escapedIds.includes(a.id)?'escaped':'live'});
 }
 for(const id of s.headquarters?.transferred??[])if(![...items.values()].some(c=>c.id===id&&c.source==='hq')){
  const key=id+'-legacy-hq';items.set(key,{key,id,source:'hq',label:specs.find(a=>a.id===id)?.name||id});
 }
 return [...items.values()].sort((a,b)=>a.key.localeCompare(b.key));
}
/** One old species-level completion credits one original dossier, never every future animal. */
export function recallRecord(s:V10,c:RecallCandidate):RecallRecord|undefined{
 const individual=s.originZero?.individualRecalls?.[c.key];if(individual)return individual;
 const legacy=s.originZero?.recalls[c.id];if(!legacy)return undefined;
 if(legacy.specimenId)return legacy.specimenId===c.key?legacy:undefined;
 return recallCandidates(s).find(x=>x.id===c.id)?.key===c.key?legacy:undefined;
}
export function completedRecalls(s:V10){return recallCandidates(s).filter(c=>!!recallRecord(s,c));}
export function performOriginRecall(s:V10,keyOrSpecies:string):V10{
 const d=s.originZero;if(!d?.route||d.photos<6||s.phase!=='day'||s.ap<1||s.run||s.pendingIncident)return s;
 const list=recallCandidates(s);
 const candidate=list.find(c=>c.key===keyOrSpecies)||list.find(c=>c.id===keyOrSpecies&&!recallRecord(s,c));
 if(!candidate||recallRecord(s,candidate)||candidate.source==='escaped')return s;
 const powerCost=candidate.source==='hq'?12:candidate.source==='live'?8:5;
 if(s.power<powerCost)return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-powerCost);
 const animal=n.animals.find(a=>(a.specimenId||a.id+'-legacy-'+a.room)===candidate.key&&a.alive);
 const quality=candidate.source==='live'?Math.max(55,Math.min(95,95-Math.round((animal?.stress??10)/3))):candidate.source==='hq'?70:42;
 const record:RecallRecord={specimenId:candidate.key,day:n.day,quality,source:candidate.source,note:RECALL_CONTEXT[candidate.id]!};
 state.individualRecalls??={};state.individualRecalls[candidate.key]=record;
 // Retain the legacy species index for old save consumers and ending history.
 state.recalls[candidate.id]??=record;
 n.knowledge+=Math.round(quality/10);
 if(candidate.source==='live'&&animal){animal.stress=cap(animal.stress+6);animal.bond=cap(animal.bond+3);}
 if(candidate.source==='hq'){state.hqPressure+=5;if(state.route==='hq')state.hqIntel=cap(state.hqIntel+12);}
 return report(n,'ARK RECALL · 개체 재분석',candidate.label+' ['+candidate.key+']: '+RECALL_CONTEXT[candidate.id]+'. 자료 품질 '+quality+'%. 개체 번호에 비교 기록을 보존했습니다.');
}
export function studyOriginImmunity(s:V10):V10{
 const d=s.originZero;if(!d?.route||d.photos<9||new Set(completedRecalls(s).map(c=>c.id)).size<3||d.immunity>=100||s.phase!=='day'||s.ap<1||s.power<10||s.knowledge<12||s.run||s.pendingIncident||!d.crisisDone||(d.route==='hq'&&d.hqIntel<35)||(d.route==='shelter'&&d.stability<35))return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-10);n.knowledge-=12;state.studies++;
 const qualities=completedRecalls(n).map(c=>recallRecord(n,c)!.quality);
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
 const d=s.originZero;return !!d?.route&&!d.crisisDone&&s.day>=(d.firstPositiveDay??Infinity)+2&&s.phase==='day'&&!s.run&&!s.pendingIncident;
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
export function originReadyForFinale(s:V10){const d=s.originZero;return !!d?.route && d.crisisDone && d.photos>=12 && new Set(completedRecalls(s).map(c=>c.id)).size>=3 && recallCandidates(s).every(item=>!!recallRecord(s,item)) && d.immunity>=75;}
export function originEndEpilogue(s:V10,goal:'rebuild'|'freedom'|'preserve'):{title:string;text:string}{
 const d=s.originZero;
 if(!d?.route)return {title:'닫힌 기록',text:'M-00의 신원이 확인되지 않은 채 마지막 관리자의 신경 신호가 끊겼다.'};
 if(goal==='rebuild')return {title: d.immunity>=100?'에덴':'영원한 실험',text:d.immunity>=100?'복제인간 사회가 구성되었다. 그러나 그들은 원본 인류와 다른 기억과 감각을 지닌 독립적인 생명들이었다.':'본부는 뇌 이식과 복제인간 생산을 멈추지 않았다. 최초 과학자의 집착이 또 한 번 명령으로 남았다.'};
 if(goal==='freedom')return {title:d.immunity>=85&&d.photos===12?'방주의 씨앗':'마지막 동물원',text:d.immunity>=85&&d.photos===12?'관리자는 M-00의 저항성 기록과 각 개체의 비교 자료를 EVE에게 남겼다. 예방 연구가 언젠가 결실을 볼지는 아무도 모른다.':'추출 장치가 멈췄다. 보존된 개체는 누구의 연구 재료가 아닌 생명으로 남았다.'};
 return {title:'제000번 우리',text:'관리자는 최초 과학자의 뇌를 물려받았지만 그의 신념을 따를 의무는 없다고 기록했다. EVE는 기억이 아니라 지금의 결정을 보존했다.'};
}
function report(s:V10,title:string,msg:string,kind:'info'|'good'|'bad'|'mystery'='mystery'):V10{s.lastOutcome=msg;log(s,title,msg,kind);return s;}
