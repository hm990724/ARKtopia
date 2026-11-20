const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const g=require('../src/lib/game-v10.ts'),sim=require('../src/lib/sim.ts'),archive=require('../src/lib/specimen-archive.ts');
const origin=require('../src/lib/origin-zero.ts'),ops=require('../src/lib/field-operations.ts'),hunt=require('../src/lib/hidden-hunt.ts');
let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
function fresh(){const s=g.beginGame('artist','generator');s.tutorialStep=9;s.rooms=20;s.ap=20;s.power=100;s.mind=100;return s;}
function add(s,id,alive=true){const a=sim.makeAnimal(id,s.animals.length+1);Object.assign(a,{alive,hp:alive?90:0,memory:100,stress:10,contamination:0,sickness:0,records:3});s.animals.push(a);archive.ensureArchive(s);origin.routineOriginScan(s,id);return a;}
function late(){const s=fresh();for(const id of ['rabbit','fox','deer'])add(s,id);Object.assign(s.originZero,{cat:'shelter',route:'shelter',photos:12,firstPositiveDay:1,crisisDone:true});origin.ensureOriginZero(s);return s;}
function recall(s,key){for(const i of origin.recallSequence(origin.recallCandidates(s).find(c=>c.key===key)))s=origin.performRecallStep(s,key,i);return origin.performOriginRecall(s,key);}

test('CCTV: correct/normal/false reports have distinct effects; rewards cannot repeat',()=>{
 let s=fresh(),before=s.knowledge;
 s=ops.reportCamera(s,0,2);assert.equal(s.power,98);assert.equal(s.operations.falseAlarms,1);
 s=ops.reportCamera(s,0,0);assert.equal(s.knowledge,before+2);assert.equal(s.operations.correct,1);
 assert.equal(ops.reportCamera(s,0,0),s);
 s=ops.reportCamera(s,1,null);assert.equal(s.operations.correct,2);
 s=ops.reportCamera(s,2,0);s=ops.reportCamera(s,2,0);s=ops.reportCamera(s,2,0);assert.equal(s.operations.reports['2'],false);
 assert.equal(ops.reportCamera(s,2,null),s);
});
test('CCTV: missed anomaly is charged at day settlement, new day resets reports',()=>{
 let s=fresh();const threat=s.threat;ops.settleCameraDay(s);assert.equal(s.threat,threat+3);
 s.day++;s=ops.reportCamera(s,0,1);assert.equal(s.operations.cameraDay,2);assert.equal(s.operations.correct,1);
});
test('Night: wiring and allocation required; pause, reload, success and replay protection',()=>{
 let s=ops.startNightRepair(fresh(),null);assert.equal(s.operations.night.remaining,75);
 assert.equal(g.finishDay(s,'shield'),s,'cannot bypass running repair');
 s=ops.operateNightRepair(s,{type:'pause'});assert.equal(ops.operateNightRepair(s,{type:'tick'}),s);
 s=g.loadGame(JSON.parse(JSON.stringify(s)));assert.equal(s.operations.night.paused,true);
 s=ops.operateNightRepair(s,{type:'pause'});s=ops.operateNightRepair(s,{type:'submit'});assert.equal(s.operations.night.remaining,67);
 ops.FUSE_TARGET.forEach((fuse,socket)=>{s=ops.operateNightRepair(s,{type:'wire',socket,fuse});});
 for(const circuit of [0,0,1,2])s=ops.operateNightRepair(s,{type:'load',circuit});
 s=ops.operateNightRepair(s,{type:'submit'});assert.equal(s.operations.night.status,'success');
 assert.equal(ops.operateNightRepair(s,{type:'submit'}),s);assert.equal(ops.startNightRepair(s,null),s);
});
test('Night: timeout persists damage; absent staff cannot support; actual staff benefit',()=>{
 let s=fresh();assert.equal(ops.startNightRepair(s,'wolf'),s);s.crew.members.push({id:'wolf',arrivedDay:1,hp:90,mind:80,bond:45,lastSpokenDay:0});
 s=ops.startNightRepair(s,'wolf');assert.equal(s.operations.night.remaining,95);s.operations.night.remaining=1;
 const facility=s.facility;s=ops.operateNightRepair(s,{type:'tick'});assert.equal(s.operations.night.status,'failed');assert.equal(s.facility,facility-12);assert.equal(s.crew.members[0].mind,76);
 assert.equal(ops.operateNightRepair(s,{type:'tick'}),s);assert.equal(g.loadGame(JSON.parse(JSON.stringify(s))).operations.night.status,'failed');
});
test('Recall: distinct same-species IDs; live, deceased, transferred, escaped and historical paths',()=>{
 let s=late();add(s,'rabbit',false);const dead=s.animals.at(-1);s.archive.entries[dead.specimenId].status='deceased';
 const fox=s.animals.find(a=>a.id==='fox');fox.alive=false;s.headquarters.transferred.push('fox');s.archive.entries[fox.specimenId].status='transferred';
 s.security.escapedIds.push('deer');
 const candidates=origin.recallCandidates(s);assert.equal(candidates.length,4);assert.equal(new Set(candidates.map(c=>c.key)).size,4);
 assert.deepEqual(new Set(candidates.map(c=>c.source)),new Set(['live','archive','hq','escaped']));
 assert.equal(origin.performOriginRecall(s,candidates[0].key),s,'must interact before confirming');
 for(const c of candidates){s.power=100;s=recall(s,c.key);assert.ok(s.originZero.individualRecalls[c.key]);assert.equal(origin.performOriginRecall(s,c.key),s);}
 assert.equal(Object.keys(s.originZero.individualRecalls).length,4);s.originZero.immunity=90;assert.equal(origin.originReadyForFinale(s),true);
 add(s,'owl');assert.equal(origin.originReadyForFinale(s),false,'new ID needs its own study');
});
test('Recall: legacy species result migrates once, never completes sibling individuals',()=>{
 const s=late();add(s,'rabbit',false);delete s.originZero.individualRecalls;
 s.originZero.recalls={rabbit:{day:2,quality:80,source:'live',note:'legacy'}};
 const restored=g.loadGame(JSON.parse(JSON.stringify(s)));
 assert.equal(Object.keys(restored.originZero.individualRecalls).length,1);
 const again=g.loadGame(JSON.parse(JSON.stringify(restored)));assert.deepEqual(again.originZero.individualRecalls,restored.originZero.individualRecalls);
});
test('Recall: incorrect input costs power, no progress; milestones granted once',()=>{
 let s=late();for(const id of ['crow','otter'])add(s,id);
 const c=origin.recallCandidates(s)[0],wrong=(origin.recallSequence(c)[0]+1)%3;
 const before=s.power;s=origin.performRecallStep(s,c.key,wrong);assert.equal(s.power,before-1);assert.equal(s.originZero.recallSteps[c.key],0);
 const parts=s.parts;for(const item of origin.recallCandidates(s)){s.power=100;s=recall(s,item.key);}
 assert.equal(s.parts,parts+2);assert.equal(s.originZero.recallMilestones,1);
});
test('M-00 discovery uses evidence instead of day locks, ordinary new save cannot discover',()=>{
 let s=fresh();s.day=99;assert.equal(origin.canTrackCat(s),false);
 s=late();s.day=2;s.originZero.cat='unknown';s.headquarters.revealStage=2;s.encounters=2;
 assert.equal(origin.canTrackCat(s),true);
});
test('Hunt: exact discovery is not capture; timing failure and success; state saved immediately',()=>{
 let s=fresh();s=g.startRun(s,'garden',['flashlight']);s.capture=require('../src/lib/tactical-field.ts').createCapture('rabbit',false);
 const position=s.capture.hunt.position;s=g.performVeiledHunt(s,{type:'search',cell:position});assert.equal(s.capture.hunt.located,position);assert.equal(s.lifeSaved,0);
 let miss=g.performVeiledHunt(s,{type:'capture',clue:5});assert.equal(miss.lifeSaved,0);assert.ok(miss.capture.hunt.fear>s.capture.hunt.fear);
 let secured=g.performVeiledHunt(s,{type:'capture',clue:50});assert.equal(secured.lifeSaved,1);assert.equal(secured.pending,null);assert.equal(secured.capture,null);
 assert.ok(secured.animals[0].specimenId);let loaded=g.loadGame(JSON.parse(JSON.stringify(secured)));assert.equal(loaded.animals.length,1);assert.equal(loaded.run.captures[0].result,'secured');
 assert.equal(g.performVeiledHunt(secured,{type:'capture',clue:50}),secured);
});
test('Hunt: 5/10/15 unlock records; guaranteed actionable location within 20 actions',()=>{
 let h=hunt.newHunt('fox',14345,false);h.actions=24;h.maxActions=24;
 for(let i=0;i<19;i++)h=hunt.performHuntAction(h,{type:'wait'}).state;
 assert.deepEqual(h.revealed,[true,true,true]);assert.equal(h.located,h.position);assert.ok(h.actions>0);
 assert.equal(hunt.performHuntAction(h,{type:'capture',clue:50}).won,true);
});
test('Photos: alignment required; one record per confirmation; old progress preserved',()=>{
 let s=late();s.originZero.photos=0;
 assert.equal(origin.restoreOriginPhotos(s),s);assert.equal(origin.restoreOriginPhotos(s,[0,1,0]),s);
 for(let i=0;i<12;i++){s.ap=4;s.power=100;s=origin.restoreOriginPhotos(s,[0,0,0]);assert.equal(s.originZero.photos,i+1);}
 assert.equal(origin.restoreOriginPhotos(s,[0,0,0]),s);assert.equal(g.loadGame(JSON.parse(JSON.stringify(s))).originZero.photos,12);
});
test('Crew: trust plus individual event gates memories; no absent speakers or repeated daily reward',()=>{
 const crew=require('../src/lib/crew.ts');let s=late();assert.deepEqual(crew.crewDialog(s,'rabbit'),[]);
 crew.recruitCrew(s,'rabbit');s=crew.rememberCrew(s,'rabbit');assert.equal(s.crew.members[0].memoryFragments,undefined);
 s.day++;s.operations=ops.emptyOperations();s.operations.correct=1;s=crew.rememberCrew(s,'rabbit');assert.equal(s.crew.members[0].memoryFragments,1);
 assert.ok(crew.crewDialog(s,'rabbit').some(l=>l.text.includes('다시 볼 수')));assert.equal(crew.rememberCrew(s,'rabbit'),s);
 s.day++;s.crew.members[0].bond=65;s=crew.rememberCrew(s,'rabbit');assert.equal(s.crew.members[0].memoryFragments,2);
 s.day++;s.crew.members[0].bond=80;s=crew.rememberCrew(s,'rabbit');assert.equal(s.crew.members[0].memoryFragments,3);
 assert.equal(g.loadGame(JSON.parse(JSON.stringify(s))).crew.members[0].memoryFragments,3);
});
test('Eight canonical endings remain reachable, distinct artwork mappings, death in every ending',()=>{
 const art=require('../src/lib/ending-art.ts');let s=late();s.trust=80;s.eve=80;s.facility=90;s.power=90;
 for(const c of origin.recallCandidates(s)){s.power=100;s=recall(s,c.key);}s.originZero.immunity=90;s.phase='finale';
 const fixtures=[['rebuild',{immunity:90},{}],['rebuild',{immunity:100},{}],['freedom',{immunity:90},{}],['freedom',{immunity:80},{}],['preserve',{},{}],['preserve',{}, {eve:20}],['freedom',{}, {extractions:3}],['preserve',{}, {power:1}]];
 const titles=[],files=[];
 fixtures.forEach(([goal,originPatch,patch],i)=>{const candidate=structuredClone(s);Object.assign(candidate,patch);Object.assign(candidate.originZero,originPatch);const final=archive.finishWithArchive(candidate,goal);assert.equal(final.phase,'ending');assert.ok(final.ending.startsWith(origin.canonicalEndings[i].title));assert.ok(final.ending.includes('사망했다'));titles.push(final.ending.split(' — ')[0]);files.push(art.findEndingArt(final.ending).file);if(i!==2)assert.ok(!final.ending.includes('내일은 제가 할게요'));assert.equal(g.loadGame(JSON.parse(JSON.stringify(final))).ending,final.ending);});
 assert.equal(new Set(titles).size,8);assert.equal(new Set(files).size,8);
 const legacy=fresh();legacy.phase='finale';assert.ok(archive.finishWithArchive(legacy,'preserve').ending.includes('사망'));
});
console.log(`v68: ${count} acceptance groups passed`);
