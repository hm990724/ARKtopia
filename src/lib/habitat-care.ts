import {cap,copy,log,recordMutation,type AnimalState,type AnimalId} from './sim';
import type {V10} from './game-v10';
export type HabitatAction='clean'|'play'|'install';
type Profile={clean:string;play:string;install:string;cue:string;water:boolean};
export const HABITAT_PROFILES:Record<AnimalId,Profile>={
 rabbit:{clean:'깔짚 교체',play:'먹이 숨기기',install:'은신 굴 설치',cue:'소음 없이 굴에 숨거나 먹이를 찾아다닐 공간을 마련합니다.',water:false},
 fox:{clean:'바닥 정리',play:'냄새 추적 놀이',install:'탐색 통로 설치',cue:'퇴로를 확보하고 여러 방향의 냄새를 탐색하게 합니다.',water:false},
 deer:{clean:'건초 교체',play:'채식 탐색',install:'조용한 식생 쉼터',cue:'시야가 트인 공간에서 스스로 이동하도록 돕습니다.',water:false},
 owl:{clean:'횃대 청소',play:'그늘 속 탐색',install:'차광 횃대 설치',cue:'낮은 조도와 높은 휴식 장소가 안정감을 줍니다.',water:false},
 wolf:{clean:'휴식 구역 청소',play:'냄새 경로 추적',install:'순찰 공간 확장',cue:'정면 대치 없이 냄새를 따라 움직이도록 합니다.',water:false},
 crow:{clean:'물그릇·바닥 청소',play:'물체 분류 놀이',install:'탐색 물체 선반',cue:'안전한 물체를 옮기고 비교하는 행동을 유도합니다.',water:false},
 otter:{clean:'수조 여과·청소',play:'물속 탐색',install:'물길 순환 장치',cue:'깨끗한 물과 자유로운 왕복 동선이 중요합니다.',water:true},
 lynx:{clean:'은신처 정리',play:'측면 추적 놀이',install:'차폐 은신처',cue:'시선을 피하면서 움직일 수 있는 사각지대를 제공합니다.',water:false},
 axolotl:{clean:'수질 정화',play:'약한 수류 탐색',install:'수온·수류 안정 장치',cue:'급격한 수온 변화와 강한 수류를 피합니다.',water:true},
 moth:{clean:'휴식판 청소',play:'약광 탐색',install:'확산광 쉼터',cue:'강한 집중광 대신 약한 일정한 빛을 제공합니다.',water:false},
 mutant:{clean:'차폐 구역 정화',play:'단일 신호 안정화',install:'신경 자극 차폐막',cue:'충돌하는 자극을 줄이고 일정한 신호를 유지합니다.',water:false},
 specter:{clean:'잔향 구역 정리',play:'그림자 경로 탐색',install:'저조도 차폐막',cue:'갑작스러운 밝기 변화 없이 익숙한 공간을 유지합니다.',water:false},
 chimera:{clean:'분리 구역 정화',play:'단일 자극 탐색',install:'분리 자극 쉼터',cue:'동시에 여러 자극을 가하지 않고 각 반응을 분리합니다.',water:false}
};
export function habitatState(a:AnimalState):NonNullable<AnimalState['habitat']>{const h=a.habitat;return {cleanliness:cap(h?.cleanliness??80),activity:cap(h?.activity??65),installed:!!h?.installed,cleanDay:h?.cleanDay,playDay:h?.playDay};}
export function habitatBlock(s:V10,a:AnimalState,action:HabitatAction):string|null{
 const h=habitatState(a);
 if(s.phase!=='day'||s.run||s.pending||!a.alive||s.security?.escapedIds.includes(a.id))return '격리실 관리 가능 상태가 아닙니다.';
 if(a.tutorialProtected&&s.tutorialStep<9)return '첫 실습 완료 후 개방';
 if(action==='install')return h.installed?'설치 완료':s.scrap<3||s.parts<1?'고철 3 · 부품 1 필요':null;
 if(action==='clean'&&h.cleanDay===s.day||action==='play'&&h.playDay===s.day)return '오늘 완료';
 if(s.ap<1)return '행동력 1 필요';
 if(action==='clean'&&s.power<2)return '전력 2 필요';
 if(action==='play'&&(a.hp<35||a.stress>=85))return '건강·스트레스부터 안정시키세요.';
 return null;
}
export function manageHabitat(s:V10,id:AnimalId,action:HabitatAction):V10{
 const target=s.animals.find(a=>a.id===id&&a.alive);if(!target||habitatBlock(s,target,action))return s;
 const n=copy(s) as V10,a=n.animals.find(x=>x.id===id&&x.alive)!,h=habitatState(a),p=HABITAT_PROFILES[id];a.habitat=h;
 if(action==='clean'){n.ap--;n.power-=2;h.cleanDay=n.day;h.cleanliness=cap(h.cleanliness+45);a.contamination=cap(a.contamination-8);a.sickness=cap((a.sickness??0)-4);}
 if(action==='play'){n.ap--;h.playDay=n.day;h.activity=cap(h.activity+40);a.stress=cap(a.stress-10);a.bond=cap(a.bond+6);}
 if(action==='install'){n.scrap-=3;n.parts--;h.installed=true;h.activity=cap(h.activity+15);a.stress=cap(a.stress-5);}
 const title=action==='clean'?p.clean:action==='play'?p.play:p.install;
 n.lastOutcome=a.name+' · '+title+' 완료. '+p.cue;
 log(n,'격리 환경 관리',n.lastOutcome,'good');recordMutation(n,a);return n;
}
/** Apply once per completed night; no additional AP or automatic material charge. */
export function advanceHabitatNight(a:AnimalState,day:number,power:number,facility:number){
 if(!a.alive||a.tutorialProtected)return;
 const h=habitatState(a),p=HABITAT_PROFILES[a.id];
 const maintained=h.installed&&power>=15;
 h.cleanliness=cap(h.cleanliness-(p.water?16:12)-(facility<45?6:0)+(maintained?5:0));
 h.activity=cap(h.activity-14+(maintained?8:0));
 a.habitat=h;
 if(h.cleanliness<35){a.contamination=cap(a.contamination+(p.water?5:3));a.sickness=cap((a.sickness??0)+3);}
 if(h.activity<30)a.stress=cap(a.stress+4);
 if(h.cleanliness>=65&&h.activity>=55){a.stress=cap(a.stress-3);if(a.hp>=50)a.bond=cap(a.bond+1);}
 if(maintained&&h.cleanliness>=50&&a.hp>=50&&a.stress<60&&h.playDay===day)a.memory=cap(a.memory+1);
}
