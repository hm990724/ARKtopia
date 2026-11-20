import type {V10} from './game-v10';
export type GameTab='hub'|'expedition'|'animals'|'research'|'synthesis'|'supplies'|'records'|'cctv'|'hq';
/** Screen access is independent of action points and of daily settlement. */
export function tabLockReason(s:V10|null,id:GameTab):string|null{
 if(!s||id==='hub'||id==='expedition'||id==='supplies')return null;
 const rescuedCount=s.animals.filter(a=>a.alive).length;
 if(id==='records')return s.tutorialStep>=3||s.encounters>0||s.archive?.revealPending?null:'첫 탐사를 마치면 분석실이 해금됩니다.';
 if(id==='animals')return s.tutorialStep>=4||rescuedCount>0?null:'첫 동물 구조 성공 후 격리실이 해금됩니다.';
 if(id==='research')return s.tutorialStep>=5||s.extractions>0?null:'동물 구조 후 행동 관찰 1회로 공명 연구가 해금됩니다.';
 if(id==='synthesis')return s.facilities?.synthesis||s.pathologyPending?null:'보급실에서 병리·검시실을 복구하면 검체 검사가 열립니다.';
 if(id==='cctv')return s.facilities?.cctv||s.security.incident||s.voice?.pending?null:'보급실에서 고철 6개 + 부품 1개로 CCTV 감시망을 복구하세요.';
 if(id==='hq')return s.headquarters?.firstReport||s.headquarters?.pendingScene||s.day>=5||s.hqOrders?.active?.status==='offered'?null:'첫 공명 100% 달성 후 본부 통신 권한이 열립니다.';
 return null;
}
