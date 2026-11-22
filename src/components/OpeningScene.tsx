export default function OpeningScene({onStart}:{onStart:()=>void}){
 return <section className="v73-opening" aria-label="ORIGIN ZERO 시작 화면">
 <img className="v73-opening-art" src="/assets/backgrounds/hero-gate.webp" alt="비에 젖은 마지막 동물원 정문. 철창 너머 거대한 생물의 뼈가 드러난다."/>
 <div className="v73-opening-grain" aria-hidden="true"/>
 <div className="v73-opening-copy"><span className="v73-kicker">ARKTOPIA / 인류 기억 보존 계획</span><h1>ORIGIN<br/><em>ZERO</em></h1><p className="v73-opening-hook">우리 안에서,<br/>누군가 내 이름을 불렀다.</p><p>먹이고, 치료하고, 지켜라.<br/>무엇을 살릴 것인지는 당신이 결정한다.</p><button className="v10-primary intro-launch" onClick={onStart}>최초 통신 복원 <span aria-hidden="true">↗</span></button><small>통신 복원 → 출발 지원 선택 → 첫 구조</small></div>
 <div className="v73-opening-signal"><span>CAM 01 / LAST ENCLOSURE</span><div><i aria-hidden="true"/><b>생체 신호 감지</b></div><p>“관리자님, 제 목소리가 들리나요?”</p><small>EVE / 연결 대기</small></div>
 <footer><span>ARKtopia · ORIGIN ZERO</span><span>모든 것의 시작은 인간의 욕심이었다.</span></footer>
 </section>;
}

