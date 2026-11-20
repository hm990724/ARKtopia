from pathlib import Path
p=Path('src/lib/game-v10.ts');s=p.read_text(encoding='utf8')
s="import {settleCameraDay,type Operations} from './field-operations';\n"+s
s=s.replace('export type V10=State & {','export type V10=State & {operations?:Operations;')
s=s.replace("const charge={shield:22,rest:5,standby:0}[nightChoice];", "if(n.operations?.night?.day===n.day&&n.operations.night.status==='active')return s;settleCameraDay(n);const charge={shield:22,rest:5,standby:0}[nightChoice];")
p.write_text(s,encoding='utf8')
p=Path('src/components/Game.tsx');s=p.read_text(encoding='utf8')
s=s.replace("import FieldMission from './FieldMission';", "import FieldMission from './FieldMission';\nimport {CameraComparison,NightRepairBoard} from './OperationsPanel';\nimport {ModalAccess} from './ModalAccess';")
s=s.replace("new Set(['rabbit','fox','deer','owl','wolf','crow'])", "new Set(['rabbit','fox','deer','owl','wolf','crow','otter'])")
s=s.replace("if(specs.some(a=>a.id===id))return '/assets/animals/'+id+'.png';", "if(specs.some(a=>a.id===id))return '/assets/animals/missing.svg';")
s=s.replace("{tab==='hub'&&<>", "{tab==='hub'&&<><ModalAccess/>{s.day===1&&<CameraComparison state={s} onUpdate={setS}/>} ")
s=s.replace("{tab==='cctv'&&<section className=\"tab-content cctv-page\">", "{tab==='cctv'&&<section className=\"tab-content cctv-page\"><CameraComparison state={s} onUpdate={setS}/>")
s=s.replace('<h2>밤이 오기 전에</h2>','<h2>밤이 오기 전에</h2><NightRepairBoard state={s} onUpdate={setS}/>')
s=s.replace('className="v10-primary" onClick={()=>applyNight()}', 'className="v10-primary" disabled={s.operations?.night?.day!==s.day||s.operations.night.status===\'active\'} onClick={()=>applyNight()}')
s=s.replace("useEffect(()=>{if(ready&&s)localStorage.setItem(KEY,JSON.stringify(s))},[ready,s]);", "useEffect(()=>{if(ready&&s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{setRunFeedback('자동 저장 공간이 부족합니다. 현재 창을 유지하고 브라우저 저장 공간을 확인하세요.')}}},[ready,s]);")
# Persist capture transition before opening any result dialog.
s=s.replace("setS(n);setRunFeedback(n.lastOutcome);\n if(won)", "try{localStorage.setItem(KEY,JSON.stringify(n))}catch{setRunFeedback('자동 저장 실패 · 현재 창을 유지하세요.')}\n setS(n);setRunFeedback(n.lastOutcome);\n if(won)")
p.write_text(s,encoding='utf8')
p=Path('src/components/OriginZeroPanel.tsx');s=p.read_text(encoding='utf8')
s=s.replace('recallCandidates,performOriginRecall,','recallCandidates,performOriginRecall,performRecallStep,recallProtocols,recallSequence,')
s=s.replace('Object.keys(d.recalls).length','Object.keys(d.individualRecalls??{}).length').replace('서로 다른 3종 재분석','고유 개체 3마리 재분석')
s=s.replace('<span>🐈‍⬛</span>', '<img src="/assets/animals/m00_normal.png" alt="오른쪽 귀에 작은 흠집이 있는 평범한 검은 고양이"/>')
a=s.index('   <div className="oz-recall-grid">');b=s.index('\n   {candidates.length<3',a)
s=s[:a]+'''   <div className="oz-recall-grid">{candidates.map(c=>{
    const result=d.individualRecalls?.[c.key],step=d.recallSteps?.[c.key]??0,protocol=recallProtocols[c.id];
    const blocked=!!result||s.ap<1||s.phase!=='day';
    return <article className="ops-panel" key={c.key}><h4>{c.label} · {c.key}</h4><p>{result?`분석 완료 · 품질 ${result.quality}%`:c.source==='live'?'보호 중 · 비침습 재검사':c.source==='hq'?'본부 이송 · 원격 기록 회수':c.source==='escaped'?'탈출 · 원격 흔적 대조 (부분 자료)':'사망 · 보존 기록 분석'}</p>
     {!result&&<><b>{protocol.title}</b><p>관측된 순서: {recallSequence(c).map(i=>protocol.signals[i]).join(' → ')}</p><span>대조 {step}/3 · 아래 신호를 순서대로 연결하세요.</span><div className="ops-toolbar">{protocol.signals.map((label,i)=><button key={label} disabled={blocked||step>=3||s.power<1} onClick={()=>update(performRecallStep(s,c.key,i))}>{label}</button>)}</div>
     <button disabled={blocked||step<3||s.power<(c.source==='hq'?12:c.source==='live'?8:5)} onClick={()=>update(performOriginRecall(s,c.key))}>기록 확정 · 행동력 1 / 전력 {c.source==='hq'?12:c.source==='live'?8:5}</button></>}
    </article>;
   })}</div>''' +s[b:]
s=s.replace('종 분석</b>',' / {candidates.length}개체 분석</b>')
s=s.replace('모든 기존에 확보한 개체는 전원 다른 방식으로 재분석합니다.','초기 검사는 표면 건강만 확인했습니다. 이제 M-00의 기원 특성과 비교하기 위해 모든 고유 개체의 기억·안정 자료가 다시 필요합니다.')
s=s.replace('“아버지는 이 아이도 버렸군요.”','“그 아이의 기억은 제 것이 아니에요. 하지만 이 아이를 잃는 슬픔은 지금 제가 이해하고 있어요.”')
p.write_text(s,encoding='utf8')
