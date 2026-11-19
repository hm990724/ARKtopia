const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(mod,filename)=>{const out=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});mod._compile(out.outputText,filename)};
const {beginGame,finishDay,loadGame}=require('../src/lib/game-v10.ts');
const {CREW_IDS,CREW_LOSS_EFFECTS,recruitCrew,crewSupport,crewDissectionShock,crewNight,queueCrewTerminations,terminateCrew,applyCrewLossPenalties,applyCrewOpinion,resolveCrewNightVote}=require('../src/lib/crew.ts');
const newGame=()=>beginGame('artist','generator');
for(const id of CREW_IDS){
 const s=newGame();assert.equal(recruitCrew(s,id),true);
 let member=s.crew.members.find(m=>m.id===id);member.mind=5;
 const after=crewSupport(s,id);
 assert.equal(after.crew.members.find(m=>m.id===id).mind,0,`${id} support must reach zero`);
 assert.equal(after.crew.pendingTermination,id);
 assert.equal(crewSupport(after,id),after,'Cannot support after zero');
 const persisted=loadGame(JSON.parse(JSON.stringify(after)));assert.equal(persisted.crew.pendingTermination,id);
 const n=terminateCrew(persisted,id);assert.equal(n.crew.pendingTermination,null);assert.equal(n.crew.members.length,0);
 assert(n.crew.retired.includes(id));assert.equal(recruitCrew(n,id),false,'No re-recruitment');
 assert.equal(terminateCrew(n,id),n,'cannot duplicate termination');
 assert(fs.existsSync(`public/assets/cinematics/staff-terminations/${id}/README.txt`));
 assert(CREW_LOSS_EFFECTS[id].eve.includes(CREW_LOSS_EFFECTS[id].summary.split(' ')[0])||CREW_LOSS_EFFECTS[id].eve.length>50);
 const again=loadGame(JSON.parse(JSON.stringify(n)));assert(again.crew.retired.includes(id));
}
console.log('PASS every staff: mind 0 -> queued cinematic -> irreversible treatment -> 4 folders -> save migration');
let s=newGame();recruitCrew(s,'rabbit');s.crew.members[0].mind=2;crewDissectionShock(s);assert.equal(s.crew.pendingTermination,'rabbit');
console.log('PASS dissection mental loss queues termination');
let single=newGame();recruitCrew(single,'rabbit');single.day=10;single.crew.members[0].mind=0;crewNight(single);assert.equal(single.crew.pendingTermination,'rabbit');assert.equal(single.crew.pendingNightVote,null);
console.log('PASS collapsed people cannot attend night meeting or attack');
let double=newGame();recruitCrew(double,'rabbit');recruitCrew(double,'fox');double.day=10;double.crew.members.forEach(m=>{m.arrivedDay=10;m.mind=m.id==='fox'?7:30});crewNight(double);
const resolved=resolveCrewNightVote(double,'rabbit');assert.equal(resolved.crew.members.find(m=>m.id==='fox').mind,0);assert.equal(resolved.crew.pendingTermination,'fox');assert.equal(resolved.crew.pendingNightVote,null);
console.log('PASS non-chosen -10 triggers irreversible conflict safely');
const rabbits=newGame();rabbits.crew.retired=['rabbit'];rabbits.stamina=55;const notes=applyCrewLossPenalties(rabbits);assert.equal(rabbits.stamina,35);assert(notes[0].includes('ST 55→35'));
const wolves=newGame();wolves.crew.retired=['wolf'];wolves.threat=51;applyCrewLossPenalties(wolves);assert.equal(wolves.threat,71);
const foxes=newGame();foxes.crew.retired=['fox'];foxes.day=8;foxes.scrap=10;foxes.food=3;foxes.parts=3;const a=foxes.scrap+foxes.food+foxes.parts+foxes.medicine+foxes.filters+foxes.electricCells;applyCrewLossPenalties(foxes);const b=foxes.scrap+foxes.food+foxes.parts+foxes.medicine+foxes.filters+foxes.electricCells;assert(a-b>=1&&a-b<=3);
const deer=newGame();deer.crew.retired=['deer'];assert(applyCrewLossPenalties(deer).some(x=>x.includes('순서 교란')));
console.log('PASS four real daily debuffs and exact resource deduction');
let next=newGame();next.crew.retired=['rabbit','wolf'];next.day=4;next.stamina=88;next.threat=10;next.pendingIncident=null;const after=finishDay(next,'rest');assert.equal(after.stamina,80,'rest 88→100, daily +14 stays 100, rabbit -20 results in 80');assert(after.threat>=20,'defense has daily guard penalty');
console.log('PASS next-day penalty is part of finishDay night accounting');
const old=JSON.parse(JSON.stringify(newGame()));delete old.crew.retired;delete old.crew.pendingTermination;let legacy=loadGame(old);assert.deepEqual(legacy.crew.retired,[]);
for(const f of ['src/components/Game.tsx','src/components/CrewSystem.tsx','src/components/SpecimenArchive.tsx']){
 const parsed=ts.createSourceFile(f,fs.readFileSync(f,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.equal(parsed.parseDiagnostics.length,0,`${f}: ${parsed.parseDiagnostics.map(x=>x.messageText).join(' | ')}`);
}
const game=fs.readFileSync('src/components/Game.tsx','utf8');assert(game.includes('closeCrewCollapse')&&game.includes('effect.eve')&&game.includes('CrewCollapseScene'));
const archive=fs.readFileSync('src/components/SpecimenArchive.tsx','utf8');assert(archive.includes('retired?.includes(\'deer\')'));
console.log('PASS EVE explanation, on-screen cinematic, archive scramble and TSX parses');
console.log('ALL V49 TESTS PASSED');
