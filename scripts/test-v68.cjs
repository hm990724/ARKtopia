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
console.log(`v68: ${count} acceptance groups passed`);
