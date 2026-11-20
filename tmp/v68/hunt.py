from pathlib import Path
p=Path('src/lib/hidden-hunt.ts');s=p.read_text(encoding='utf8')
s=s.replace("export type HuntMode='search'|HuntTool|'wait'|'reveal';", "export type HuntMode='search'|HuntTool|'wait'|'reveal'|'capture';")
s=s.replace('version:35;species:AnimalId;', 'version:35;located?:number|null;species:AnimalId;')
needle=" const current={...raw,objects:raw.objects.map(x=>({...x})),revealed:[...raw.revealed],"
s=s.replace(needle," if(action.type==='capture'&&(raw.located==null||raw.located!==raw.position||!Number.isFinite(action.clue)||action.clue!<0||action.clue!>100))return unchanged;\n"+needle)
s=s.replace(" if(action.type==='search'){\n  const searchedCell", " if(action.type==='capture'){\n  current.actions--;current.turn++;current.lastCommand='capture';\n  if(action.clue!>=38&&action.clue!<=68){current.outcome='caught';current.resultText='포획망을 안전 구간에 맞췄습니다. 개체를 보호 격리실로 이송합니다.';return {state:msg(current,current.resultText,'hint'),changed:true,won:true,lost:false,penalty:nil};}\n  current.located=null;current.fear=Math.min(100,current.fear+12);\n  if(current.actions<=0){current.outcome='escaped';current.resultText='마지막 포획 시도가 빗나갔습니다. 흔적은 기록에 남습니다.';return {state:msg(current,current.resultText,'error'),changed:true,won:false,lost:true,penalty:finishPenalty(current)};}\n  current.previous=current.position;current.position=chooseStep(current);\n  return {state:msg(current,'포획망이 빗나갔습니다. 경계 +12 · 흔적을 다시 조사하거나 청음하세요.','warning'),changed:true,won:false,lost:false,penalty:nil};\n }\n if(action.type==='search'){\n  const searchedCell")
a=s.index("   current.actions--;current.turn++;current.outcome='caught';current.selectedCell=action.cell!;")
b=s.index('\n  }',a)
s=s[:a]+"""   current.actions=Math.max(1,current.actions-1);current.turn++;current.located=current.position;current.selectedCell=action.cell!;current.lastCommand='search';
   return {state:msg(current,'개체 발견 · 안전 구간에 바늘이 들어오면 F 또는 포획 버튼을 누르세요.','hint'),changed:true,won:false,lost:false,penalty:nil};"""+s[b:]
s=s.replace(' const from=current.position;', ' current.located=null;\n const from=current.position;')
s=s.replace("  const note=HUNT_TRAITS[current.species].hints[current.turn/5-1];", "  const index=current.turn/5-1;current.revealed[index]=true;\n  const note=HUNT_TRAITS[current.species].hints[index];")
needle=' if(current.actions<=0){\n  if(current.tutorial)'
s=s.replace(needle,""" if(current.turn>=Math.min(19,current.maxActions-2)&&current.actions>0){
  current.located=current.position;
  text+=' · 누적 흔적을 연결해 현재 위치를 확정했습니다. 포획 타이밍을 맞추세요.';
 }
"""+needle)
# The tutorial also requires a successful timed capture; no automatic victory on timeout.
a=s.index('  if(current.tutorial){\n   // Explicit scripted tutorial guarantee')
b=s.index("  current.outcome='escaped';const penalty",a)
s=s[:a]+"""  if(current.tutorial){
   current.actions=2;current.located=current.position;
   return {state:msg(current,'EVE가 포획 위치를 다시 표시합니다. 초회 실습은 재시도할 수 있습니다.','hint'),changed:true,won:false,lost:false,penalty:nil};
  }
"""+s[b:]
p.write_text(s,encoding='utf8')
p=Path('src/lib/game-v10.ts');s=p.read_text(encoding='utf8')
needle="  log(n,'발자국 역추적 · 포획 성공',n.lastOutcome,'good');"
s=s.replace(needle,needle+"\n  if(n.animals.filter(a=>a.alive).length<n.rooms){const secured=rescueChoice(n,'secure',0);if(secured.lifeSaved>n.lifeSaved&&secured.tutorialStep<=3)secured.tutorialStep=4;return secured;}")
p.write_text(s,encoding='utf8')
p=Path('src/components/Game.tsx');s=p.read_text(encoding='utf8')
s=s.replace("import FieldMission from './FieldMission';", "import FieldMission from './FieldExplorationV68';")
s=s.replace("{tab==='hub'&&<><ModalAccess/>","{tab==='hub'&&<>")
s=s.replace('<main className="v10-main">','<main className="v10-main"><ModalAccess/>')
s=s.replace("const won=!!n.pending&&!s.pending,failed=!n.capture&&!n.pending;", "const secured=n.lifeSaved>s.lifeSaved;\n const won=secured||!!n.pending&&!s.pending,failed=!won&&!n.capture&&!n.pending;")
s=s.replace("if(won){report(s,n,'은신 개체 포획');setCaptureReveal({id:n.pending!,cell:command.cell??null,first:firstReturn});beep(860);}", "if(won){report(s,n,'은신 개체 포획');if(secured){setResult({success:true,title:'포획 완료 · 격리실에 저장됨',text:n.lastOutcome,animalId:prior.species});setSelectedAnimal(prior.species);}else setCaptureReveal({id:n.pending!,cell:command.cell??null,first:firstReturn});beep(860);}")
p.write_text(s,encoding='utf8')
# Old component still typechecks, although no longer routed.
p=Path('src/components/FieldMission.tsx');s=p.read_text(encoding='utf8').replace("Exclude<HuntMode,'wait'|'reveal'>","Exclude<HuntMode,'wait'|'reveal'|'capture'>");p.write_text(s,encoding='utf8')
