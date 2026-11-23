const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const game=require('../src/lib/game-v10.ts'),hunt=require('../src/lib/hidden-hunt.ts'),{makeAnimal}=require('../src/lib/sim.ts');
let passed=0;function test(name,fn){fn();console.log('PASS',name);passed++}
test('5/10/15 actions earn four-cell snapshot and trait; no hidden exact marker',()=>{
 for(const species of ['rabbit','wolf','moth']){
  let h=hunt.newHunt(species,891);
  for(let i=1;i<=15;i++){
   h=hunt.performHuntAction(h,{type:'wait'}).state;
   const cells=hunt.freshTrailCells(h);
   if(i%5===0){assert.equal(cells.length,4);assert.ok(cells.includes(h.position));assert.ok(h.revealed[i/5-1]);}
   else assert.deepEqual(cells,[]);
  }
 }
});
test('earned trail permits a tactical net without sonar; expires on next action',()=>{
 let h=hunt.newHunt('rabbit',32);for(let i=0;i<5;i++)h=hunt.performHuntAction(h,{type:'wait'}).state;
 h.scanZone=null;h.scanTurn=undefined;h.lastSearch=null;
 assert.ok(hunt.performHuntAction(h,{type:'net',cell:h.position}).won);
 assert.equal(hunt.freshTrailCells({...h,turn:6}).length,0);
 assert.equal(hunt.freshTrailCells({...h,trailZone:NaN}).length,0);
 assert.equal(hunt.freshTrailCells(hunt.normalizeHunt(h)).length,4);
});
test('listening reduces fear and cannot grant extra actions',()=>{
 const h={...hunt.newHunt('wolf',43),fear:50},next=hunt.performHuntAction(h,{type:'wait'}).state;
 assert.ok(next.fear<h.fear);assert.equal(next.actions,h.actions-1);assert.equal(h.fear,50);
});
test('opened clearings show the newest footprint and shaking uses a one-cell radius',()=>{
 let h=hunt.newHunt('rabbit',918),visited=h.position;
 h={...h,searchedAt:{[String(visited)]:0},observations:{[String(visited)]:{kind:'empty',turn:0}}};
 h=hunt.performHuntAction(h,{type:'wait'}).state;
 assert.equal(hunt.observedEvidence(h,visited).kind,'footprint','new movement evidence must replace an old empty snapshot');
 const center=14,adjacent=hunt.huntGrassMotion([center],6);
 assert.equal(adjacent.length,8);assert.ok(!adjacent.includes(center));assert.ok(adjacent.every(cell=>Math.max(Math.abs(cell%6-center%6),Math.abs(Math.floor(cell/6)-Math.floor(center/6)))===1));
});
test('daily incident after day four, no immediate repeats and absent entities excluded',()=>{
 const s=game.beginGame('medic','generator');s.day=5;s.lastEvent=game.incidentDefs.garden.title;
 for(let i=0;i<100;i++)assert.ok(![null,'garden','quiet','keepsake','echo','rations','visitor'].includes(game.determineIncident(s,1,i/100)));
});
test('daily peaceful choices have real effects, cannot double claim, remain resolvable at zero resources',()=>{
 const s=game.beginGame('medic','generator');s.pendingIncident='garden';s.power=0;
 assert.equal(game.resolveIncident(s,0),s);
 const n=game.resolveIncident(s,2);assert.ok(n.mind>s.mind);assert.equal(n.pendingIncident,null);assert.equal(game.resolveIncident(n,2),n);
 const a={...s,pendingIncident:'keepsake',food:1,animals:[makeAnimal('rabbit',1)]};
 const b=game.resolveIncident(a,0);assert.equal(b.food,0);assert.equal(b.animals[0].bond,a.animals[0].bond+8);
 assert.equal(game.loadGame(JSON.parse(JSON.stringify(b))).food,0);
});
const origin=require('../src/lib/origin-zero.ts'),archive=require('../src/lib/specimen-archive.ts');
function recallFixture(){const s=game.beginGame('medic','generator');s.day=20;s.ap=10;s.power=100;s.tutorialStep=9;s.originZero={...origin.emptyOriginZero(),cat:'shelter',route:'shelter',photos:12};s.animals=[makeAnimal('rabbit',1),makeAnimal('rabbit',2)];archive.ensureArchive(s);return s;}
test('individual recall changes only selected specimen and survives load without shared completion',()=>{
 const s=recallFixture(),[a,b]=s.animals;
 const n=origin.performOriginRecall(s,b.specimenId);
 assert.equal(n.animals[0].stress,a.stress);assert.equal(n.animals[1].stress,b.stress+6);
 assert.equal(origin.completedRecalls(n).length,1);assert.equal(origin.completedRecalls(n)[0].key,b.specimenId);
 assert.equal(origin.performOriginRecall(n,b.specimenId),n);
 const loaded=game.loadGame(JSON.parse(JSON.stringify(n)));
 assert.equal(origin.completedRecalls(loaded).length,1);
 assert.equal(origin.completedRecalls(origin.performOriginRecall(loaded,a.specimenId)).length,2);
});
test('legacy species completion credits one dossier, escaped individual must be recovered',()=>{
 const s=recallFixture();s.originZero.recalls.rabbit={day:10,quality:70,source:'live',note:'legacy'};
 assert.equal(origin.completedRecalls(s).length,1);
 s.security.escapedIds=['rabbit'];
 assert.equal(origin.performOriginRecall(s,s.animals[1].specimenId),s);
 assert.equal(origin.studyOriginImmunity(s),s,'same-species individuals cannot replace three distinct species');
});
test('archival transfer never marks a new living or deceased animal of same species as transferred',()=>{
 const s=recallFixture(),old=s.animals[0],next=s.animals[1];s.headquarters.transferred=['rabbit'];old.alive=false;old.transferred=true;
 archive.ensureArchive(s);assert.equal(s.archive.entries[old.specimenId].status,'transferred');assert.equal(s.archive.entries[next.specimenId].status,'contained');
 delete old.transferred;next.alive=false;archive.ensureArchive(s);
 assert.equal(s.archive.entries[old.specimenId].status,'transferred');assert.equal(s.archive.entries[next.specimenId].status,'deceased');
 const legacy=game.beginGame('medic','generator');legacy.animals=[makeAnimal('rabbit',1)];legacy.animals[0].alive=false;legacy.headquarters.transferred=['rabbit'];archive.ensureArchive(legacy);
 assert.equal(legacy.archive.entries[legacy.animals[0].specimenId].status,'transferred');
});
const memory=require('../src/lib/crew-memory.ts'),crew=require('../src/lib/crew.ts');
test('staff termination applies the required one-time -30 morale shock to surviving crew',()=>{
 const s=game.beginGame('medic','generator');crew.recruitCrew(s,'rabbit','RB-LOSS');crew.recruitCrew(s,'fox','FX-SURVIVOR');
 s.crew.members.find(m=>m.id==='rabbit').mind=0;crew.queueCrewTerminations(s);
 const terminated=crew.terminateCrew(s,'rabbit');assert.equal(terminated.crew.members.some(m=>m.id==='rabbit'),false);assert.equal(terminated.crew.members.find(m=>m.id==='fox').mind,58);
 assert.match(terminated.lastOutcome,/정신력 -30/);assert.equal(crew.terminateCrew(terminated,'rabbit'),terminated,'termination cannot apply grief twice');
});
test('all four staff remember through trust and matching evidence, never another specimen',()=>{
 for(const id of crew.CREW_IDS){
  const s=game.beginGame('medic','generator');s.day=2;s.animals=[makeAnimal(id,1)];archive.ensureArchive(s);const a=s.animals[0];a.alive=false;a.transferred=true;s.headquarters.transferred=[id];archive.ensureArchive(s);crew.recruitCrew(s,id,a.specimenId);
  let first=memory.shareCrewMemory(s,id);assert.equal(first.state.crew.members[0].memoryStage,undefined);assert.equal(memory.shareCrewMemory(first.state,id).state,first.state,'no repeated daily reward');
  let later=first.state;later.day=5;later.crew.members[0].bond=55;
  const fragment=memory.shareCrewMemory(later,id);assert.equal(fragment.state.crew.members[0].memoryStage,1);assert.ok(!fragment.lines.some(x=>x.text.includes('두 기록이 일치')));
  later=fragment.state;later.day=6;later.crew.members[0].bond=70;later.originZero.photos=10;later.flags.humanTruth=true;
  const bad=structuredClone(later);bad.crew.members[0].sourceSpecimenId='NONEXISTENT';assert.equal(memory.shareCrewMemory(bad,id).state.crew.members[0].memoryStage,1);
  const full=memory.shareCrewMemory(later,id);assert.equal(full.state.crew.members[0].memoryStage,2);assert.ok(full.lines.some(x=>x.text.includes(a.specimenId)));assert.ok(full.lines.some(x=>x.text.includes('네 발로')));
  assert.equal(game.loadGame(JSON.parse(JSON.stringify(full.state))).crew.members[0].memoryStage,2);
 }
});
test('empty rabbit cage recording requires arrived medic, persists once, discloses no identity',()=>{
 const s=game.beginGame('medic','generator');assert.equal(memory.emptyCageAvailable(s),false);s.headquarters.transferred=['rabbit'];assert.equal(memory.emptyCageAvailable(s),false);crew.recruitCrew(s,'rabbit','RB-001');
 const n=memory.watchEmptyCage(s);assert.ok(n.state.onboardingSeen.includes('rabbit-empty-cage'));assert.equal(memory.watchEmptyCage(n.state).state,n.state);assert.ok(!n.lines.some(x=>x.text.includes('뇌 보존')));
});
test('staff talk buys trust only while costly care is limited and morale erodes by day',()=>{
 const s=game.beginGame('medic','generator');s.day=2;s.ap=4;s.food=3;
 crew.recruitCrew(s,'rabbit','RB-COST');const m=s.crew.members[0],mind=m.mind,bond=m.bond;
 const first=memory.shareCrewMemory(s,'rabbit');assert.equal(first.state.ap,3);assert.equal(first.state.food,2);assert.equal(first.state.crew.members[0].mind,mind);assert.equal(first.state.crew.members[0].bond,bond+4);
 assert.equal(memory.shareCrewMemory(first.state,'rabbit').state,first.state,'same-day replay must not spend twice');
 const counsel=crew.treatCrew(first.state,'rabbit','counsel');assert.equal(counsel.ap,1);assert.equal(counsel.food,1);assert.equal(counsel.crew.members[0].mind,mind+9);
 assert.equal(crew.treatCrew(counsel,'rabbit','counsel'),counsel,'counsel is once per facility day');
 let nightly=structuredClone(counsel);nightly.day=5;const oldMind=nightly.crew.members[0].mind;crew.crewNight(nightly);assert.equal(nightly.crew.members[0].mind,oldMind-1);
});
test('seed farewell is exclusive and every origin ending keeps the manager death',()=>{
 let s=recallFixture();s.animals.push(makeAnimal('fox',3),makeAnimal('deer',4));archive.ensureArchive(s);s.originZero.crisisDone=true;s.originZero.immunity=100;
 for(const c of origin.recallCandidates(s))s=origin.performOriginRecall(s,c.key);
 s.phase='finale';assert.ok(origin.originReadyForFinale(s));
 for(const goal of ['rebuild','freedom','preserve']){const n=archive.finishWithArchive(s,goal);assert.ok(n.ending.includes('사망했다'));assert.equal(n.ending.startsWith('방주의 씨앗'),goal==='freedom');}
});
console.log(`${passed} v71 regressions passed`);
