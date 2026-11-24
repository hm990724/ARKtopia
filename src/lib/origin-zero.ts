/** ORIGIN ZERO story runtime. Everything is data-only / JSON serializable.
 * Fictional diagnosis and resistance work are deliberately abstract gameplay.
 * No real-world biological procedure is represented here.
 */
import type {V10} from './game-v10';
import type {AnimalId} from './sim';
import {cap,copy,log,specs} from './sim';
import {protocols} from './protocols';

export type CatStage='unknown'|'traced'|'captured'|'positive'|'hq'|'shelter';
export type OriginRoute='hq'|'shelter'|null;
export type RecallTrial={stage:number;chosen:string;expected:string;matched:boolean};
export type RecallSession={step:number;correct:number;startedDay:number;answers:RecallTrial[]};
export type RecallRecord={specimenId?:string;day:number;quality:number;source:'live'|'hq'|'archive';note:string;steps?:RecallTrial[]};
export type OriginZeroState={version:1;scans:string[];privateMatches:Record<string,'NEGATIVE'|'POSITIVE'>;cat:CatStage;trackProgress:number;approachStep?:number;contactField?:import('./origin-contact').ContactField;bodyStability?:number;bodyDay?:number;resonance?:number;resonanceRisk?:number;resonanceDay?:number;wrongTracks:number;firstPositiveDay:number|null;route:OriginRoute;photos:number;recalls:Partial<Record<AnimalId,RecallRecord>>;individualRecalls?:Record<string,RecallRecord>;recallSessions?:Record<string,RecallSession>;immunity:number;studies:number;hqPressure:number;endingEvidence:boolean;stability:number;hqIntel:number;crisisDone:boolean;crisisSession?:{step:number;actions:string[];quality:number}};
export const emptyOriginZero=():OriginZeroState=>({version:1,scans:[],privateMatches:{},cat:'unknown',trackProgress:0,wrongTracks:0,firstPositiveDay:null,route:null,photos:0,recalls:{},immunity:0,studies:0,hqPressure:0,endingEvidence:false,stability:85,hqIntel:0,crisisDone:false});
export function ensureOriginZero(s:V10):OriginZeroState{
 const o=s.originZero??(s.originZero=emptyOriginZero());
 o.scans??=[];o.privateMatches??={};o.recalls??={};o.photos=Math.max(0,Math.min(12,o.photos??0));o.immunity=cap(o.immunity??0);
 o.recallSessions??={};o.resonance=cap(o.resonance??35);o.resonanceRisk=cap(o.resonanceRisk??0);
 o.trackProgress=Math.max(0,Math.min(3,o.trackProgress??0));o.approachStep=Math.max(0,Math.min(3,o.approachStep??0));o.wrongTracks??=0;o.studies??=0;o.hqPressure??=0;o.stability??=85;o.hqIntel??=0;o.crisisDone??=false;
 return o;
}
export const photoRecords=[
 {title:"PHOTO 01 · 전쟁의 그림자",detail:"전쟁 중 발생한 바이러스는 인간의 신체를 붕괴시켰다. 동물은 저항성을 보였다. 군사 연구에 합류한 책임자의 최초 임무는 인간용 예방·치료 연구였다."},
 {title:"PHOTO 02 · 최초 숙주 적응",detail:"동물의 몸에서 신경 반응을 안정적으로 보존하려던 연구. 최초 후보는 인간의 뇌를 이식하기 전에 독립적인 학습 능력을 보였다. 상세한 보존 대상은 봉인되어 있다."},
 {title:"PHOTO 03 · M-00",detail:"최초로 개량된 생체 숙주 후보. 검은 고양이의 오른쪽 귀 흠집과 가슴의 흰 털이 현재 개체와 일치한다. 인간의 뇌는 이식되지 않았다."},
 {title:"PHOTO 04 · 검증되지 않은 승인",detail:"다른 시험 숙주의 장기 안정성 검증이 끝나기 전, 책임자가 M-00 최종 실험을 강행했다. 신경 안정성은 높았지만 연구원들은 새로운 인지 반응의 검증을 요구했다."},
 {title:"PHOTO 05 · 무너진 연구실",detail:"종전 이전 군사 공격으로 전력과 격리 시설이 붕괴했다. 보존 장치의 신호가 끊겼다. M-00과 다른 시험 숙주들은 이미 무너진 격리 시설에서 탈출했다. 고양이가 파괴한 것이 아니다."},
 {title:"PHOTO 06 · 두 번째 재앙",detail:"탈출한 불안정한 실험체들이 최초 바이러스와 다른 가상의 변이 감염을 확산시켰다. 인간에게 더 치명적인 두 번째 재앙과 신경 공명 붕괴가 사회를 무너뜨렸다."},
 {title:"PHOTO 07 · ARK 방주 계획",detail:"사망한 감염자의 뇌는 비교적 온전했다. 동물의 신체에 뇌를 활성 상태로 임시 보존하고 백신 개발 후 인간의 신체로 돌려놓으려 했다. 동물의 인간적 행동은 그 기억의 잔향이다."},
 {title:"PHOTO 08 · 아버지와 딸",detail:"전쟁 바이러스에 감염된 어린 딸을 치료하기 위해 과학자가 참전했다. 끝내 딸을 잃고 뇌를 보존했다. 가장 친했던 검은 고양이를 유대감에 기반한 최초 숙주로 선택했다. 이름 부분은 손상되었다."},
 {title:"PHOTO 09 · 최초 인격 AI",detail:"딸의 뇌 기록과 음성·감각 자료를 디지털화하여 EVE를 만들었다. 딸의 실제 뇌는 시설 붕괴 때 소실되었다. EVE는 원본 딸의 의식이 아닌 독립 인격이다."},
 {title:"PHOTO 10 · 불안정한 귀환",detail:"본부 AI는 백신 완성 전에 인간 복원을 시작했다. 보존된 뇌를 복제 신체로 옮겼으나 숙주 시절의 감각은 남았다. 기억 충돌이 심해지면 직원에게도 동물화가 발현된다."},
 {title:"PHOTO 11 · 제000번 관리자",detail:"군사 공격 때 치명상을 입은 과학자가 PROJECT ORIGIN 비상 지속을 명령했다. 그의 뇌는 M-00이 아닌 별도 동물 숙주에서 보존된 뒤 현재 복제 관리자 000에게 이전됐다."},
 {title:"PHOTO 12 · 놓친 치료의 가능성",detail:"M-00은 인간 뇌 없이도 안정된 지능을 유지한다. 그 생체 신호는 다른 숙주의 잠든 기억을 깨워 공명 붕괴를 촉진할 수 있지만 동시에 안정화·예방 연구의 유일한 원본이다. 과학자는 이 가능성을 외면했다."}
] as const;
export function originSpeciesProgress(s:V10){const seen=new Set<AnimalId>([...s.animals.map(a=>a.id),...(s.headquarters?.transferred??[]),...Object.values(s.archive?.entries??{}).map(a=>a.species)]);return specs.filter(a=>seen.has(a.id)).length;}
export function canTrackCat(s:V10):boolean{
 const o=s.originZero;
 return s.phase==='day'&&s.facilities.cctv&&!s.run&&!s.pending&&!s.pendingIncident&&!s.headquarters?.pendingAnimal&&
  (o?.cat??'unknown')==='unknown'&&
  s.tutorialStep>=9&&s.day>=20&&originSpeciesProgress(s)>=specs.length&&((s.completedRegions??[]).includes('tunnels')||(s.lastFieldSummary?.region==='tunnels'&&s.lastFieldSummary.reason==='정상 귀환'));
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
 return report(n,'시초 개체 의심 · 미확인 실루엣','전쟁으로 붕괴한 연구동 CCTV에 격리문을 부순 듯한 거대한 변이 실루엣이 잡혔다. 본부는 M-00, 즉 재앙의 시초일 가능성을 제기한다. 비상등과 깨진 화면 때문에 실제 크기와 정체는 확인되지 않았다.');
}
function o(s:V10){return ensureOriginZero(s)}
// Player reads the camera hint and manually picks a matching view. Wrong guesses
// increase pressure; no random automatic success and no one-click capture.
export const catTrackFrames=[
 {hint:'파손된 격리문 앞에 큰 변이 실루엣이 찍혔다. 본부는 시초 개체로 의심했지만 비상등과 깨진 화면 탓에 실제 크기는 알 수 없다.',answer:2,frames:['정문 통로 · 정상 출입문','급식실 · 빈 그릇','격리문 02 · 긁힌 차폐판']},
 {hint:'거대한 몸집으로 보이는 화면과 달리 발자국은 좁은 동물 이동구로 이어진다. 렌즈가 흔들린 순간 실루엣도 길게 늘어났다.',answer:0,frames:['낮은 이동구 · 작은 발자국','배수로 · 끌린 오염 자국','중앙 통로 · 큰 발자국']},
 {hint:'전원이 순간적으로 끊겼다. 형체가 사라졌지만 낮은 이동구 아래에서 가느다란 그림자가 한 번 더 움직였다. 화면의 시간과 이동 방향을 대조하라.',answer:1,frames:['빈 복도 · 03:17:08','낮은 이동구 · 03:17:12','격리문 · 03:16:59']}
] as const;
export function pickOriginTrace(s:V10,frame:number):V10{
 const state=s.originZero;if(state?.cat!=='traced'||state.trackProgress>=3||s.run||s.pendingIncident||!Number.isInteger(frame)||frame<0||frame>2||s.phase!=='day')return s;
 const n=copy(s) as V10;const d=o(n);const point=catTrackFrames[d.trackProgress];
 if(frame!==point.answer){d.wrongTracks++;n.threat=cap(n.threat+3);return report(n,'영상 경로 불일치','화면의 움직임이 끊어졌다. 흔적은 아직 남아 있다. 위협 +3.','bad');}
 d.trackProgress++;
 if(d.trackProgress===3){d.approachStep=0;return report(n,'외곽 좌표 확보 · 영상 종료','마지막 프레임의 이동구에서 신호가 끊겼다. EVE: 관리자님, 이 영상은 더 이상 실시간이 아닙니다. 현장 확인이 필요합니다.');}
 return report(n,'영상 경로 확보',`감시 기록 ${d.trackProgress}/3 일치. 다음 카메라 흔적으로 이동한다.`,'good');
}
export const originApproachScenes=[
 {title:'외곽 · 끊어진 조명',speaker:'EVE',text:'03:17 이후 기록이 없습니다. 철창 너머에서 움직임이 감지됩니다. 크기와 거리는 아직 판별할 수 없습니다. 소음이 없는 경로를 확보하십시오.',choices:['낮은 자세로 움직임을 관찰한다','손전등을 높이 들고 달려간다','철창을 두드려 반응을 유도한다'],answer:0},
 {title:'시야 끝의 두 눈',speaker:'관리자',text:'이브. 저거 보여? 아까 영상에 찍힌 것과 비슷한데… 잠깐, 그림자가 왜 저렇게 커?',choices:['그림자를 따라 전력 질주한다','광원을 낮춰 벽과 실루엣의 거리를 비교한다','큰 소리로 위협한다'],answer:1},
 {title:'철창 아래의 움직임',speaker:'EVE',text:'두 번째 그림자는 움직이지 않습니다. 움직이는 신호는 아래쪽 하나뿐입니다. 소리를 내지 말고 접근하십시오.',choices:['격리문을 세게 닫는다','등을 돌리고 철창에 부딪힌다','몸을 낮추고 손을 내밀어 기다린다'],answer:2}
] as const;
export function approachOriginSignal(s:V10,choice:number):V10{
 const d=s.originZero;if(d?.cat!=='traced'||d.trackProgress!==3||s.phase!=='day'||s.run||s.pending||s.pendingIncident||s.headquarters?.pendingAnimal||s.mind<=0||!Number.isInteger(choice)||choice<0||choice>2)return s;
 const step=d.approachStep??0,scene=originApproachScenes[step];if(!scene||step===0&&!d.contactField?.done)return s;
 const n=copy(s) as V10,state=o(n);
 if(choice!==scene.answer){state.wrongTracks++;n.threat=cap(n.threat+5);n.mind=cap(n.mind-2);return report(n,'외곽 접근 중단','철판이 울렸다. 가까운 곳에서 무언가 움직였다. 숨을 고르고 다시 시도한다. 위협 +5, 정신 -2.','bad');}
 state.approachStep=step+1;
 if(state.approachStep===3){state.cat='captured';return report(n,'미확인 생체 신호 확보','관리자: ……고양이? EVE: 외형에 변이가 없습니다. 거대한 실루엣은 뒤쪽 조명과 철창의 겹친 그림자였습니다. 실제 배회형 MUTANT와는 별개의 개체입니다. 고양이가 유출을 일으켰다는 증거는 없다. 아직 신원은 확인되지 않았습니다.','mystery');}
 return report(n,'현장 접근 · 신호 유지',step===0?'발소리가 끊겼다. 시야 끝의 움직임을 확인한다.':'그림자의 크기와 실제 움직임이 일치하지 않는다. 가까이에서 확인한다.','mystery');
}
export function analyzeOriginCat(s:V10):V10{
 if(s.originZero?.cat!=='captured'||s.phase!=='day'||s.ap<1||s.power<6)return s;
 const n=copy(s) as V10;const d=o(n);n.ap--;n.power=cap(n.power-6);d.cat='positive';d.firstPositiveDay=n.day;d.privateMatches['ORIGIN-M00']='POSITIVE';
 return report(n,'M-00 표식 일치 · POSITIVE','검사 결과는 고양이의 생물학적 식별 표식이 M-00과 일치한다는 뜻이다. 감염 양성도, 인류 붕괴의 원인이라는 판정도 아니다. 본부가 즉시 이송을 요구한다.','mystery');
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
 {question:'전쟁 중 실험 승인 문서에 찍힌 식별 코드는 무엇을 의미하는가?',options:['기원 실험체','이송 차량','시설 전원'],answer:0},
 {question:'격리 붕괴 당일 가장 중요한 누락 자료는?',options:['배식 기록','비상 격리 기록','출근 명부'],answer:1},
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
 applyPhotoTruth(n);
 return report(n,'HIDDEN PHOTO · 원본 복원',`${String(start+1).padStart(2,'0')}~${String(state.photos).padStart(2,'0')}번 복원: ${titles}. ${state.photos===12?'제000호 관리자의 신원과 마지막 연구를 확인했다.':'손상된 사진의 다음 구획을 해독할 수 있다.'}`);
}
function applyPhotoTruth(n:V10){
 const d=o(n);if(d.photos>=7)n.flags.humanTruth=true;
 if(d.photos>=10)n.headquarters.revealStage=Math.max(2,n.headquarters.revealStage);
 if(d.photos>=11){n.flags.mirror=true;n.headquarters.revealStage=Math.max(3,n.headquarters.revealStage);d.bodyStability??=72;d.bodyDay??=n.day;}
 if(d.photos>=12)d.endingEvidence=true;
}
export const individualPhotoPuzzles=[
 {question:'최초 기록의 시각과 일치하는 자료는?',hint:'기록 시작은 종전 이전이다.',options:['전쟁 중 연구 일지','폐허 구조 일지','오늘 급식표'],answer:0},
 {question:'신경 반응 기록의 대조 항목은?',hint:'외부 입력 없이 반응이 반복된다.',options:['운송 온도','스스로 반복한 학습 패턴','사료 배급 시간'],answer:1},
 {question:'훼손된 사진의 동일 개체를 판별하라.',hint:'오른쪽 귀와 가슴을 대조한다.',options:['왼쪽 발의 흉터','목걸이 번호','오른쪽 귀 흠집과 흰 털'],answer:2},
 {question:'최종 실험 승인서의 원본은?',hint:'군사 공격 이전이며 책임자의 서명이 남았다.',options:['공격 이전 서명 문서','오늘 본부 명령','서명 없는 창고 전표'],answer:0},
 {question:'격리동 사고의 순서를 복원하라.',hint:'전력 차단이 출입구 경보보다 먼저였다.',options:['외부 이동 → 전력 차단','전력 차단 → 출입구 경보','경보 → 평상시 점검'],answer:1},
 {question:'오염 확산 지도를 연결하라.',hint:'최초 경보 위치에서 시간순으로 연결한다.',options:['최종 폐허부터 역순','지도 좌측부터','최초 격리 시설부터 시간순'],answer:2},
 {question:'분리된 문서의 일련번호를 대조하라.',hint:'같은 번호가 다른 날짜에도 반복된다.',options:['동일한 번호의 두 기록','오늘 날짜만 있는 기록','번호가 없는 기록'],answer:0},
 {question:'사진의 유실된 영역은?',hint:'촬영 기록에 어린아이와 두 개의 그림자가 표시된다.',options:['빈 출입구','가족 촬영 원본','시설 배선도'],answer:1},
 {question:'음성 기록의 시간 순서를 대조하라.',hint:'오래된 녹음과 시스템 기동은 다른 날짜다.',options:['기동 이후 녹음만','가장 큰 음량 순','녹음 원본 → 시스템 기동'],answer:2},
 {question:'반출 명세와 인수 명세를 연결하라.',hint:'동일 식별번호가 두 명세에 존재한다.',options:['같은 식별번호','가장 최근 문서','서명 없는 문서'],answer:0},
 {question:'관리자 신원 문서의 검사값을 대조하라.',hint:'외형 정보가 아닌 신경 기록을 대조한다.',options:['얼굴 사진만 비교','신경 기록 식별값 비교','복장 번호 비교'],answer:1},
 {question:'마지막 연구 문서의 누락된 분류표는?',hint:'이전 연구 결과와 원본 안정성 자료를 연결한다.',options:['폐기 명세만','직원 근무표만','원본과 비교 기록'],answer:2}
] as const;
export function restoreOriginPhoto(s:V10,answer:number):V10{
 const d=s.originZero;if(!d?.route||d.photos>=12||s.ap<1||s.power<4||s.phase!=='day'||s.run||s.pendingIncident||s.pending||!Number.isInteger(answer)||answer<0||answer>2)return s;
 const n=copy(s) as V10,state=o(n),puzzle=individualPhotoPuzzles[state.photos];
 if(answer!==puzzle.answer){n.power=cap(n.power-2);n.threat=cap(n.threat+2);return report(n,'기록 무결성 경고','복원 순서가 맞지 않습니다. 원본은 보존됩니다. 전력 -2, 위협 +2.','bad');}
 n.ap--;n.power=cap(n.power-4);state.photos++;n.clues++;n.knowledge+=2;applyPhotoTruth(n);
 return report(n,'HIDDEN PHOTO · 개별 증거 복원',photoRecords[state.photos-1].title+' — '+photoRecords[state.photos-1].detail);
}
export const RECALL_CONTEXT:Partial<Record<AnimalId,string>>={
 rabbit:'기억 활성 상태에서 치료와 안정화 반응 확인',fox:'창고의 보급 동선과 물자 배치 기억 대조',wolf:'보호 행동과 접근 거부 신호 측정',deer:'오염 지역에서 안전한 이동 경로 확보',owl:'야간 음향 패턴의 반복성 기록',crow:'반복 수집 행동과 장소 기억 비교',otter:'유수 환경 적응 및 스트레스 대조',lynx:'은폐 행동과 미세 반응 관찰',axolotl:'신체 재생 신호의 안정성 검토',moth:'야간 빛 반응을 통한 신경 적응 비교',mutant:'불안정한 조직 재생 반응의 비침습 기록',chimera:'신경 동기화의 불안정한 결합 기록',specter:'빛이 사라진 뒤 남는 잔향과 정체성 공백 기록'
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
function recallCanStart(s:V10,candidate:RecallCandidate):boolean{
 const powerCost=candidate.source==='hq'?12:candidate.source==='live'?8:5;
 return !!s.originZero?.route&&(s.originZero.photos>=7||!!s.originZero.recallSessions?.[candidate.key])&&s.phase==='day'&&s.ap>=1&&!s.run&&!s.pendingIncident&&s.power>=powerCost&&candidate.source!=='escaped'&&!recallRecord(s,candidate);
}
/** Begin a specimen-specific three-stage recall. Sessions live in the save so closing the panel is safe. */
export function beginOriginRecall(s:V10,key:string):V10{
 const candidate=recallCandidates(s).find(c=>c.key===key);if(!candidate||!recallCanStart(s,candidate))return s;
 if(s.originZero?.recallSessions?.[key])return s;
 const n=copy(s) as V10;const state=o(n);state.recallSessions??={};state.recallSessions[key]={step:0,correct:0,startedDay:n.day,answers:[]};
 n.lastOutcome=`${candidate.label} · ${protocols[candidate.id].title} 재분석 시작. 세 단계의 행동 반응을 기록하세요.`;
 return n;
}
/** Record one deliberate response. The final response settles the existing recall action and resource cost. */
export function answerOriginRecall(s:V10,key:string,choice:number):V10{
 const candidate=recallCandidates(s).find(c=>c.key===key),session=s.originZero?.recallSessions?.[key];
 if(!candidate||!session||!Number.isInteger(choice)||choice<0||choice>2||!recallCanStart(s,candidate))return s;
 const stage=protocols[candidate.id].steps[session.step];if(!stage)return s;
 const trial:RecallTrial={stage:session.step+1,chosen:stage.choices[choice],expected:stage.choices[stage.correct],matched:choice===stage.correct};
 const n=copy(s) as V10;const saved=o(n).recallSessions![key];saved.answers.push(trial);if(trial.matched)saved.correct++;
 if(saved.step<2){saved.step++;n.lastOutcome=trial.matched?'관찰 반응을 기록했습니다. 다음 기억 신호를 대조하세요.':'반응이 예상과 달랐습니다. 흔적은 보존했습니다. 다음 신호를 확인하세요.';return n;}
 return performOriginRecall(n,key,saved.correct);
}
export function performOriginRecall(s:V10,keyOrSpecies:string,accuracy?:number):V10{
 const d=s.originZero;if(!d?.route||d.photos<7&&!d.recallSessions?.[keyOrSpecies]||s.phase!=='day'||s.ap<1||s.run||s.pendingIncident)return s;
 const list=recallCandidates(s);
 const candidate=list.find(c=>c.key===keyOrSpecies)||list.find(c=>c.id===keyOrSpecies&&!recallRecord(s,c));
 if(!candidate||recallRecord(s,candidate)||candidate.source==='escaped')return s;
 const powerCost=candidate.source==='hq'?12:candidate.source==='live'?8:5;
 if(s.power<powerCost)return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-powerCost);
 const animal=n.animals.find(a=>(a.specimenId||a.id+'-legacy-'+a.room)===candidate.key&&a.alive);
 const baseQuality=candidate.source==='live'?Math.max(55,Math.min(95,95-Math.round((animal?.stress??10)/3))):candidate.source==='hq'?70:42;
 const session=state.recallSessions?.[candidate.key];
 const score=accuracy??session?.correct;
 const quality=Math.max(25,Math.min(100,baseQuality+(score===undefined?0:(score-1)*10)));
 const record:RecallRecord={specimenId:candidate.key,day:n.day,quality,source:candidate.source,note:RECALL_CONTEXT[candidate.id]!,steps:session?.answers};
 state.individualRecalls??={};state.individualRecalls[candidate.key]=record;
 if(state.recallSessions)delete state.recallSessions[candidate.key];
 // Retain the legacy species index for old save consumers and ending history.
 state.recalls[candidate.id]??=record;
 n.knowledge+=Math.round(quality/10);
 if(candidate.source==='live'&&animal){animal.stress=cap(animal.stress+6);animal.bond=cap(animal.bond+3);}
 if(candidate.source==='hq'){state.hqPressure+=5;if(state.route==='hq')state.hqIntel=cap(state.hqIntel+12);}
 return report(n,'ARK RECALL · 개체 재분석',candidate.label+' ['+candidate.key+']: '+RECALL_CONTEXT[candidate.id]+'. 자료 품질 '+quality+'%. 개체 번호에 비교 기록을 보존했습니다.');
}
export function resonanceRisk(s:V10,strength=s.originZero?.resonance??35){return Math.round(cap(strength)*(100-(s.originZero?.immunity??0)*.82)/100);}
export function setOriginResonance(s:V10,value:number):V10{if(s.phase!=='day'||s.run||s.pendingIncident||!s.originZero?.route||s.originZero.photos<12||!Number.isFinite(value))return s;const n=copy(s) as V10;o(n).resonance=Math.round(cap(value));return n;}
function applyOriginResonance(s:V10,risk:number){const d=o(s);d.resonanceRisk=risk;if(risk<30)return;const impact=risk>=60?9:4;if(d.route==='shelter'){for(const a of s.animals){if(!a.alive||a.tutorialProtected||s.security.escapedIds.includes(a.id))continue;a.stress=cap(a.stress+impact);a.memory=cap(a.memory+Math.ceil(impact/2));}for(const member of s.crew?.members??[]){if(member.mind<=0||s.crew?.retired.includes(member.id))continue;member.mind=Math.max(1,member.mind-Math.ceil(impact/2));member.memoryEcho=cap((member.memoryEcho??0)+impact);member.stability=Math.max(1,(member.stability??90)-Math.ceil(impact/2));}s.threat=cap(s.threat+impact);d.stability=Math.max(1,d.stability-Math.ceil(impact/2));}else{d.hqPressure+=impact;s.eve=cap(s.eve-Math.ceil(impact/2));}log(s,'M-00 공명 경고',d.route==='shelter'?'원본 신호가 기존 숙주의 잠든 기억을 자극했습니다. 스트레스 및 직원 기억 잔향 증가.':'원격 실험의 과도한 공명 요청으로 본부 압력과 EVE 부담이 증가했습니다.','bad');}
export function studyOriginImmunity(s:V10):V10{
 const d=s.originZero;if(!d?.route||d.photos<9||new Set(completedRecalls(s).map(c=>c.id)).size<3||d.immunity>=100||s.phase!=='day'||s.ap<1||s.power<10||s.knowledge<12||s.run||s.pendingIncident||!d.crisisDone||(d.route==='hq'&&d.hqIntel<35)||(d.route==='shelter'&&d.stability<35))return s;
 const n=copy(s) as V10;const state=o(n);n.ap--;n.power=cap(n.power-10);n.knowledge-=12;state.studies++;
 const qualities=completedRecalls(n).map(c=>recallRecord(n,c)!.quality);
 const avg=Math.round(qualities.reduce((a,b)=>a+b,0)/qualities.length);
 const routeBoost=state.route==='shelter'?6:0;
 const strength=state.resonance??35,risk=resonanceRisk(s,strength);
 state.immunity=cap(state.immunity+14+Math.floor(avg/10)+routeBoost+(state.photos===12?5:0)+Math.floor(strength/10));
 if(state.photos>=12)applyOriginResonance(n,risk);
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
 if(d.photos>=12&&d.route==='shelter'&&d.resonanceDay!==s.day){d.resonanceDay=s.day;const risk=resonanceRisk(s,Math.min(45,d.resonance??35));applyOriginResonance(s,risk);}
 if(d.photos>=11&&d.bodyDay!==s.day){const before=d.bodyStability??72;d.bodyStability=Math.max(8,before-(s.infection>=55?9:5));d.bodyDay=s.day;if(d.bodyStability<=20)s.nextFieldFatigued=true;if(before>45&&d.bodyStability<=45)log(s,'관리자 생체 안정도 저하','EVE: 손의 떨림이 증가했습니다. 지금은 무리하지 마십시오.','bad');if(before>20&&d.bodyStability<=20)log(s,'관리자 생체 신호 임계','EVE: 남은 신체 안정성이 낮습니다. 기록을 마칠 시간이 얼마 남지 않았습니다.','bad');}
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
 const coerced=Object.values(s.archive?.entries??{}).filter(entry=>entry.records.some(record=>record.title==='강제 조직 회수')).length;
 const protectedAnimals=s.animals.filter(animal=>animal.alive&&!s.security.escapedIds.includes(animal.id)).length;
 const staffLost=s.crew?.retired?.length??0;
 const dispatched=s.archive?.dispatches??0;
 if(goal==='rebuild'){const eden=d.immunity>=100&&s.narrative?.finalStance!=='inherit';return {title:eden?'에덴':'영원한 실험',text:eden?'복제인간 사회가 구성되었다. 그러나 그들은 원본 인류와 다른 기억과 감각을 지닌 독립적인 생명들이었다.':'본부는 뇌 이식과 복제인간 생산을 멈추지 않았다. 최초 과학자의 집착이 또 한 번 명령으로 남았다.'};}
 if(goal==='freedom'){
  if(d.immunity>=85&&d.photos===12&&coerced<2&&s.eve>=55&&s.trust>=35&&protectedAnimals>=2)return {title:'방주의 씨앗',text:'관리자는 M-00의 저항성 기록과 각 개체의 비교 자료를 EVE에게 남겼다. 예방 연구가 언젠가 결실을 볼지는 아무도 모른다.'};
  if(coerced>=2||protectedAnimals<=1)return {title:'흩어진 이름들',text:'복원은 실패했고 여러 생명이 돌아오지 못했다. EVE는 마지막 명부에서 그들의 이름을 지우지 않고, 누구의 소유도 아닌 기억으로 남겼다.'};
  return {title:'마지막 동물원',text:'추출 장치가 멈췄다. 보존된 개체는 누구의 연구 재료가 아닌 생명으로 남았다.'};
 }
 if(staffLost>=2||s.eve<25||s.trust<20)return {title:'침묵의 자동화',text:'관리자의 신호가 끊기고 EVE의 인격 통신이 종료된 뒤에도 시설은 정해진 일과를 반복했다. EVE의 목소리는 사라졌고, 남겨진 이름만 자동 기록에 남았다.'};
 if((d.hqIntel>=65&&dispatched>0)||(s.narrative?.finalStance!==undefined&&s.narrative.finalStance!=='reject'))return {title:'마지막 신호',text:'관리자는 보존한 자료와 구조 요청을 마지막으로 송신했다. 응답이 돌아왔는지 확인하기 전에 그의 신체는 멈췄다.'};
 return {title:'제000번 우리',text:'관리자는 최초 과학자의 뇌를 물려받았지만 그의 신념을 따를 의무는 없다고 기록했다. EVE는 기억이 아니라 지금의 결정을 보존했다.'};
}
function report(s:V10,title:string,msg:string,kind:'info'|'good'|'bad'|'mystery'='mystery'):V10{s.lastOutcome=msg;log(s,title,msg,kind);return s;}
