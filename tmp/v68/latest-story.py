from pathlib import Path
p=Path('src/lib/origin-zero.ts');s=p.read_text(encoding='utf8')
replacements={
"폐쇄된 연구동. 쥐에서 시작된 신경 적응 연구가 다른 종으로 확대되고 있었다.":"전쟁 중 특정 인간 집단을 무력화하려던 비밀 군사 연구. 동물 숙주에서 허구의 감염 인자를 연구한 기록이다.",
"인간 뇌 이식 이력이 없는 실험체에서 고등 인지 행동이 확인됐다.":"병원체를 보유해도 겉보기에는 정상이던 동물들 중 검은 고양이만 인간 뇌 없이 고등 인지를 얻었다.",
"폐기된 파일 속 평범한 검은 고양이. 귀 가장자리의 작은 흉터가 현재 개체와 일치한다.":"M-00은 자신의 지능과 신체 안정성을 처음부터 유지한 유일한 원본이다. 평범한 검은 고양이의 오른쪽 귀 끝 흠집이 현재 개체와 일치한다.",
"안정성 기준 미달. 폐기 승인란에 최초 연구 책임자의 서명이 남아 있다.":"종전 후 비밀 시설과 실험체 전체의 폐기 명령. 최초 과학자의 승인 서명이 있다. M-00의 자율 인지는 보존할 가치로 인정받지 못했다.",
"과학자가 M-00 폐기를 강행하면서 격리 안전장치를 해제했다. 연쇄 고장으로 감염 인자가 유출됐다. 고양이가 재앙을 일으킨 것이 아니다.":"폐기 강행 중 격리 체계가 붕괴했다. M-00은 혼란을 이해하고 스스로 탈출했다. 유출 책임은 인간의 연구와 폐기 작전에 있다.",
"격리 실패를 은폐하는 동안 감염 인자가 외부로 확산됐다. 연구 책임자의 폐기 명령과 본부의 통제가 문명 붕괴를 불렀다.":"동물 숙주를 통해 감염 인자가 확산됐다. 인간의 신체 기능은 회복 불가능하게 무너졌다. 본부의 은폐로 대응이 지연됐다.",
"인류가 붕괴하자 동물 신체에 인간의 뇌를 보존하는 대체 계획이 시작됐다.":"ARKTOPIA — 인류 기억 보존 계획. 신체 붕괴 직전 뇌 기능과 기억을 가상의 기술로 보존해 살아 있는 동물 숙주에 맡겼다. 사망 직후 회수된 드문 예외는 불완전한 기억만 남았다.",
"보존된 뇌를 복제인간에게 다시 이식하는 본부의 재생 설계도.":"동물에게 보존된 뇌를 인공 인간 신체로 옮겼다. 직원과 이송 개체의 보존 번호가 일치한다. 복제 신체는 격리 환경에 의존하며 감정 충격과 동물 시절 신경 기억에 불안정해진다.",
"최초 과학자의 보존 뇌가 복제 신체로 이식됐다. 생존 신원: 현재 관리자.":"최초 과학자의 뇌도 동물 숙주에서 보존된 뒤 제000호 복제 관리자에게 이식됐다. 낮은 시선과 알 수 없는 동물의 기억은 환각이 아닌 자신의 과거였다. 그는 연구자의 기억을 가진 동시에 연구의 희생자다.",
"M-00의 신체 안정성이 감염 예방 연구의 실마리였지만 원 연구자는 기존 계획의 오류를 인정하지 않았다.":"M-00은 인간 기억 없이 자신의 지능과 신체 안정성을 함께 유지했다. 감염 억제와 신경·신체 안정성 연구의 단서지만 즉시 완성되는 치료법은 아니다. 기존 모든 개체와 비교할 자료가 필요하다."
}
for a,b in replacements.items():
 assert a in s,a;s=s.replace(a,b)
s=s.replace("(s.headquarters?.revealStage>=2||s.flags.humanTruth) && s.encounters>=2", "(s.headquarters?.revealStage>=2||s.flags.humanTruth||(s.knowledge>=70&&s.clues>=6)) && s.encounters>=2")
s=s.replace('n.clues+=1;n.knowledge+=4;', 'n.clues+=1;n.knowledge+=4;if(state.photos>=7)n.flags.humanTruth=true;')
s=s.replace('허구의 면역 안정성 모델 연구','감염 억제·신경 동기화 안정성 비교 연구')
s=s.replace('고양이는 본부로 이송됐다.', '고양이는 아무 말 없이 운반 케이지 안에 앉아 있었다. 본부로 이송됐다.')
s=s.replace('고양이를 동물원에 보호하기로 했다.', '고양이는 작은 기척만 내며 곁에 앉았다. 동물원에 보호하기로 했다.')
p.write_text(s,encoding='utf8')
p=Path('src/lib/game-v10.ts');s=p.read_text(encoding='utf8')
s=s.replace('n.knowledge>=70&&n.clues>=3&&!n.flags.humanTruth','(n.originZero?.photos??0)>=7&&!n.flags.humanTruth')
s=s.replace('h.revealStage===1&&n.flags.humanTruth&&n.clues>=6','h.revealStage===1&&n.knowledge>=70&&n.clues>=6')
s=s.replace('손끝 떨림과 짧은 기억 공백. EVE는 휴식 시간을 늘리겠다고 기록했다. 원인은 아직 확인되지 않았다.','손끝 떨림과 짧은 기억 공백. 잠깐 바닥 가까이에서 우리를 올려다본 기억이 스쳤다. EVE는 휴식을 권했다. 원인은 아직 확인되지 않았다.')
p.write_text(s,encoding='utf8')
p=Path('src/lib/crew.ts');s=p.read_text(encoding='utf8')
s=s.replace('memoryFragments?:number;','preservationId?:string;bodyStability?:number;memoryFragments?:number;')
s=s.replace('export type CrewArrivalOrder={id:CrewId;transferDay:number};','export type CrewArrivalOrder={id:CrewId;transferDay:number;specimenKey?:string};')
s=s.replace('crew.arrivalQueue.push({id,transferDay:s.day});',"crew.arrivalQueue.push({id,transferDay:s.day,specimenKey:s.animals.find(a=>a.id===id&&(a as typeof a&{transferred?:boolean}).transferred)?.specimenId});")
s=s.replace("export function recruitCrew(s:V10,id:AnimalId):boolean{", "export function recruitCrew(s:V10,id:AnimalId,specimenKey?:string):boolean{")
s=s.replace('crew.members.push({id,arrivedDay:s.day,hp:85,mind:88,bond:45,lastSpokenDay:0});',"const preservationId=specimenKey??Object.values(s.archive?.entries??{}).find(e=>e.species===id&&e.status==='transferred')?.key;\n crew.members.push({id,preservationId,bodyStability:90,arrivedDay:s.day,hp:85,mind:88,bond:45,lastSpokenDay:0});")
s=s.replace(' if(existing){Object.assign(existing,crew);return existing;}'," for(const m of crew.members){m.bodyStability??=90;if(!m.preservationId)m.preservationId=Object.values(s.archive?.entries??{}).find(e=>e.species===m.id&&e.status==='transferred')?.key;}\n if(existing){Object.assign(existing,crew);return existing;}")
s=s.replace(" member.lastSpokenDay=n.day;member.bond", " if(member.mind<=35&&(n.originZero?.photos??0)>=7){member.memoryEvents??=[];if(!member.memoryEvents.includes('body-shock'))member.memoryEvents.push('body-shock');}\n member.lastSpokenDay=n.day;member.bond")
s=s.replace(" if(id==='rabbit'&&member.memoryFragments===1)"," if(member.memoryEvents?.includes('body-shock')&&(member.memoryFragments??0)>=2&&(s.originZero?.photos??0)>=10&&member.preservationId)return [{speaker:id,text:'관리자님……. 제 손이 이상해요. 분명히 다섯 개였는데……. 왜 자꾸 네 발로 서야 할 것 같죠?'},{speaker:'EVE',text:`이송 개체 번호 ${member.preservationId}. 직원 뇌 보존 번호 ${member.preservationId}. 두 기록이 일치합니다.`},{speaker:id,text:'내가 그 동물이었던 거군요.'},{speaker:id,text:CREW_MEMORY[id][2]}];\n if(id==='rabbit'&&member.memoryFragments===1)")
s=s.replace("'여우의 몸으로 배고픔을 견딘 기억이 돌아왔어요. 보급품 숫자 뒤에 있는 생명을 잊지 않을게요.'", "'여우의 몸으로 배고팠던 기억이 돌아왔어요. 겨우 되찾은 이 손과 삶을 다시 잃는 게 무서워요.'")
s=s.replace("'사슴으로 살아온 시간이 제 기록에서도 지워졌어요. 다른 이들의 기록은 지우지 않겠습니다.'", "'사슴으로 살아온 시간이 기록에서 지워졌어요. 제가 누구였는지 증명할 원본부터 찾겠어요. 그 번호를 지우지 마세요.'")
needle=' for(const m of crew.members){\n  const days=s.day-m.arrivedDay;'
s=s.replace(needle,""" for(const m of crew.members){
  // Artificial bodies depend on containment, not simply on elapsed days.
  const environment=s.power<15||s.facility<35;
  const shock=m.mind<30;
  m.bodyStability=cap((m.bodyStability??90)+(environment?-6:2)-(shock?5:0));
  if(m.bodyStability<25){m.mind=cap(m.mind-4);log(s,'직원 신체 안정 경고',`${CREW_PROFILES[m.id].post}: 안정 ${m.bodyStability}. 시설 전원과 상담·의료 지원이 필요합니다.`,'bad');}
  const days=s.day-m.arrivedDay;""")
s=s.replace("if(kind==='medical'){n.medicine--;m.mind=cap(m.mind+28)}", "if(kind==='medical'){n.medicine--;m.mind=cap(m.mind+28);m.bodyStability=cap((m.bodyStability??90)+18)}")
p.write_text(s,encoding='utf8')
p=Path('src/lib/game-v10.ts');s=p.read_text(encoding='utf8').replace('recruitCrew(s,order.id)','recruitCrew(s,order.id,order.specimenKey)');p.write_text(s,encoding='utf8')
p=Path('src/components/CrewSystem.tsx');s=p.read_text(encoding='utf8').replace('신뢰 {selectedMember.bond} · 기억 조각','신체 안정 {selectedMember.bodyStability??90} · 신뢰 {selectedMember.bond} · 기억 조각');p.write_text(s,encoding='utf8')
p=Path('src/lib/sim.ts');s=p.read_text(encoding='utf8')
s=s.replace("|| a.stress>=MUTATION_LIMITS.stress", "|| (a.memory>=40 && a.stress>=MUTATION_LIMITS.stress)")
s=s.replace("|| (a.stress>=MUTATION_LIMITS.mixedStress && (a.contamination>=MUTATION_LIMITS.contamination || a.memory>=MUTATION_LIMITS.memory))", "|| (a.memory>=40 && a.stress>=MUTATION_LIMITS.mixedStress && (a.contamination>=MUTATION_LIMITS.contamination || a.memory>=MUTATION_LIMITS.memory))")
s=s.replace('EVE는 끝내 그를 하나의 보존 대상으로 등록했다.', '복제 신체도 유지 한계를 넘었고 관리자는 사망했다. EVE는 마지막 기록을 보존했다.')
s=s.replace('담당자는 더 이상 외부와 연결할 수 없었다.', '담당자는 더 이상 외부와 연결할 수 없었다. 격리 환경을 잃은 복제 신체는 무너졌고 관리자는 사망했다.')
p.write_text(s,encoding='utf8')
