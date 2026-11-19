const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(mod,filename)=>{const out=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});mod._compile(out.outputText,filename)};
const {beginGame,finishDay,loadGame}=require('../src/lib/game-v10.ts');
const {CREW_IDS,recruitCrew,crewNight,applyCrewOpinion,crewConflictDialogue,crewSupport,resolveCrewNightVote}=require('../src/lib/crew.ts');
function fresh(ids){let n=beginGame('artist','generator');ids.forEach(id=>assert.equal(recruitCrew(n,id),true));return n}
for(const size of [0,1,2,3,4]){
 const a=fresh(CREW_IDS.slice(0,size));a.day=10;a.infection=0;a.crew.members.forEach(m=>m.arrivedDay=10);
 crewNight(a);
 const opts=a.crew.pendingNightVote?.members||[];
 assert.equal(opts.length,size,`10-day meeting options must equal recruited staff count ${size}`);
 if(size){
  assert.deepEqual(opts,CREW_IDS.slice(0,size),'no unrecruited staff may appear');
  const chosen=opts.at(-1);
  const before=new Map(a.crew.members.map(m=>[m.id,m.mind]));
  const n=resolveCrewNightVote(a,chosen);
  assert.equal(n.crew.pendingNightVote,null);
  assert.equal(resolveCrewNightVote(n,chosen),n,'no double claim of a night meeting');
  for(const member of n.crew.members) assert.equal(member.mind,before.get(member.id)-(member.id===chosen?0:10));
  const loaded=loadGame(JSON.parse(JSON.stringify(n)));
  assert.equal(loaded.crew.pendingNightVote,null);
 }
}
console.log('PASS 0–4 recruited staff yield exactly 0–4 choices, all nonchosen -10, once only');
let n=fresh(['rabbit']);let mind=n.crew.members[0].mind;
assert.equal(applyCrewOpinion(n,'treatment','treat'),null);
assert.equal(n.crew.members[0].mind,mind);
recruitCrew(n,'fox');let first=applyCrewOpinion(n,'treatment','treat');
assert.equal(first.first,true);assert.equal(first.dissent,'fox');assert.equal(n.crew.members.find(x=>x.id==='fox').mind,85);
assert(crewConflictDialogue(first).some(line=>line.speaker==='rabbit'));
let second=applyCrewOpinion(n,'treatment','treat');assert.equal(second.first,false);assert.equal(n.crew.members.find(x=>x.id==='fox').mind,82);
let reverse=applyCrewOpinion(n,'treatment','withhold');assert.equal(reverse.first,false);assert.equal(reverse.dissent,'rabbit');
console.log('PASS first qualified pair conflict dialogue only once and repeat decisions -3');
let w=fresh(['wolf']);assert.equal(applyCrewOpinion(w,'disposal','dispose'),null);
recruitCrew(w,'deer');let firstFate=applyCrewOpinion(w,'disposal','dispose');assert.equal(firstFate.first,true);assert.equal(firstFate.dissent,'deer');
let later=applyCrewOpinion(w,'disposal','protect');assert.equal(later.first,false);assert.equal(later.dissent,'wolf');
const legacy=JSON.parse(JSON.stringify(w));delete legacy.crew.conflictsSeen;delete legacy.crew.pendingNightVote;delete legacy.crew.conflictSerial;let migrated=loadGame(legacy);assert(Array.isArray(migrated.crew.conflictsSeen));assert.equal(migrated.crew.pendingNightVote,null);
console.log('PASS fate conflict requires wolf+deer; no missing staff dialogs; old save migration');
const zero=fresh([]);zero.day=9;zero.pendingIncident=null;let next=finishDay(zero,'rest');assert.equal(next.crew.pendingNightVote,null);
let eligible=fresh(['rabbit','fox']);eligible.day=10;eligible.pendingIncident=null;eligible.crew.members.forEach(x=>x.arrivedDay=10);
let afterNight=finishDay(eligible,'rest');assert.deepEqual(afterNight.crew.pendingNightVote.members,['rabbit','fox']);
assert.equal(finishDay(afterNight,'rest'),afterNight,'cannot advance night with unresolved employee vote');
const finished=resolveCrewNightVote(afterNight,'rabbit');assert.equal(finished.crew.members.find(x=>x.id==='fox').mind,78);
const beforeSupport=finished.crew.members.find(x=>x.id==='rabbit').hp;
const support=crewSupport(finished,'rabbit');assert.equal(support.crew.members.find(x=>x.id==='rabbit').hp,beforeSupport,'work uses mind, not HP');
assert.equal(support.crew.members.find(x=>x.id==='rabbit').mind,83);
console.log('PASS day 10 -> day 11 vote, no early vote, mandatory resolution, support mind-only');
for(const f of ['src/components/Game.tsx','src/components/CrewSystem.tsx']){
 const src=fs.readFileSync(f,'utf8');const parsed=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.equal(parsed.parseDiagnostics.length,0,`${f} parse errors: ${parsed.parseDiagnostics.map(x=>x.messageText).join('; ')}`);
}
const ui=fs.readFileSync('src/components/Game.tsx','utf8');assert(ui.includes('resolveCrewNightVote(s,id)')&&ui.includes('showFirstCrewConflict(s,next)')&&ui.includes('v48-night-choice'));
console.log('PASS UI TSX syntax and player choice binding');
console.log('ALL V48 TESTS PASSED');
