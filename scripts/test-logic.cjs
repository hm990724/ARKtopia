/** Local regression tests. Node and installed TypeScript are the only requirements. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(mod,file)=>{
 const transpiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
 mod._compile(transpiled.outputText,file);
};
const g=require(path.resolve(__dirname,'../src/lib/game-v10.ts'));
const sim=require(path.resolve(__dirname,'../src/lib/sim.ts'));
function add(s,id,alive=true){let a=sim.makeAnimal(id,s.animals.length+1);a.alive=alive;a.hp=90;a.stress=10;a.memory=100;a.sickness=0;a.contamination=0;a.records=3;s.animals.push(a);return a}
let st=g.beginGame('artist','generator');st.day=5;st.tutorialStep=5;st.ap=5;st.rooms=5;const a=add(st,'rabbit');st.headquarters.pendingAnimal='rabbit';st.headquarters.firstReport=true;st.tutorialArchiveReviewPending=true;
let moved=g.resolveHeadquarters(st,'transfer');assert.notEqual(moved,st);assert.equal(moved.headquarters.transferred.includes('rabbit'),true);assert.equal(moved.animals.find(x=>x.id==='rabbit').alive,false);assert.equal(moved.tutorialStep,6);assert.equal(moved.tutorialArchiveReviewPending,false);assert.equal(moved.headquarters.pendingAnimal,null);console.log('PASS rabbit sent HQ clears tutorial flag and advances mission');
// older broken saves must migrate without resurrecting rabbit
let broken=structuredClone(moved);broken.tutorialStep=4;broken.tutorialArchiveReviewPending=true;broken.animals.find(x=>x.id==='rabbit').tutorialProtected=true;const recovered=g.loadGame(broken);assert.ok(recovered.tutorialStep>=6);assert.equal(recovered.tutorialArchiveReviewPending,false);assert.equal(recovered.animals[0].alive,false);console.log('PASS old saves migrate out of empty containment tutorial');
let s=g.beginGame('artist','generator');s.tutorialStep=7;s.phase='day';s.scrap=20;s.parts=20;s.power=100;s.ap=4;let built=g.buildFacility(s,'synthesis');assert.notEqual(built,s);assert.equal(built.tutorialStep,7);assert.equal(built.facilities.synthesis,true);const linked=g.buildFacility({...built,scrap:20,parts:20,power:100},'cctv');assert.equal(linked.tutorialStep,8);console.log('PASS pathology facility opens without two animal donors, tutorial advances after CCTV');
s=built;add(s,'fox');s.ap=4;s.power=100;s.medicine=5;
let studied=g.runPathology(s,'fox','noninvasive',0);assert.ok(studied.pathologyPending.success);assert.equal(studied.pathologyRecords.length,1);assert.ok(studied.knowledge>s.knowledge);assert.equal(studied.animals.length,1);assert.equal(g.runPathology(studied,'fox','noninvasive',0),studied,'must finish event first');studied=g.resolvePathologyEvent(studied,'archive');assert.equal(studied.pathologyPending,null);assert.equal(g.runPathology(studied,'fox','clinical',0),studied,'once per day on live animal');console.log('PASS successful non-invasive exam -> evidence choice, no synthetic animal, no daily spam');
studied.day++;studied.ap=4;studied.power=100;let failed=g.runPathology(studied,'fox','clinical',1);assert.equal(failed.pathologyPending.success,false);assert.ok(failed.animals[0].stress>studied.animals[0].stress);failed=g.resolvePathologyEvent(failed,'headquarters');assert.equal(failed.pathologyPending,null);assert.ok(failed.credits>studied.credits);console.log('PASS failed clinical exam has effect and HQ followup');
const dead=add(failed,'deer',false);failed.ap=4;failed.power=100;let examined=g.runPathology(failed,'deer','postmortem',0);assert.equal(examined.pathologyPending.success,true);examined=g.resolvePathologyEvent(examined,'archive');assert.equal(g.runPathology(examined,'deer','postmortem',0),examined,'one postmortem only');assert.equal(g.runPathology(examined,'fox','postmortem',0),examined,'no autopsy of living subject');console.log('PASS death-only postmortem, once per specimen');
let old=g.loadGame({...g.beginGame('artist','generator'),pathologyRecords:undefined,pathologyPending:undefined});assert.deepEqual(old.pathologyRecords,[]);assert.equal(old.pathologyPending,null);console.log('PASS pathology save migration');

// ORIGIN ZERO regression scenarios — preserved by the pathology refactor.
{
const archive=require(path.resolve(__dirname,'../src/lib/specimen-archive.ts'));
const origin=require(path.resolve(__dirname,'../src/lib/origin-zero.ts'));
function add(s,id){const a=sim.makeAnimal(id,s.animals.length+1);Object.assign(a,{memory:100,hp:90,stress:15,contamination:0,sickness:0,records:3});s.animals.push(a);archive.noteRescue(s,id);return a;}
let s=g.beginGame('artist','generator');s.day=26;s.tutorialStep=9;s.encounters=5;s.headquarters.revealStage=2;s.ap=4;s.rooms=8;
for(const id of ['rabbit','fox','deer'])add(s,id);
assert.equal(s.originZero.scans.length,3,'every captured specimen receives a hidden routine test');
assert.equal(origin.canTrackCat(s),true,'late exploration opens the ordinary cat');
let c=origin.initiateOriginTrack(s);assert.equal(c.originZero.cat,'traced');assert.equal(c.ap,3);
let wrong=origin.pickOriginTrace(c,0);assert.equal(wrong.originZero.trackProgress,0);assert.equal(wrong.threat,c.threat+3);
for(const frame of origin.catTrackFrames)c=origin.pickOriginTrace(c,frame.answer);
assert.equal(c.originZero.cat,'traced');assert.equal(c.originZero.trackProgress,3);assert.equal(origin.analyzeOriginCat(c),c);{const contact=require('../src/lib/origin-contact.ts');assert.equal(origin.approachOriginSignal(c,0),c);c=contact.startOriginContact(c);for(const cell of contact.contactPath)c=contact.moveOriginContact(c,cell);assert.equal(c.originZero.contactField.done,true);}for(const scene of origin.originApproachScenes)c=origin.approachOriginSignal(c,scene.answer);
assert.equal(c.originZero.cat,'captured');assert.equal(c.originZero.trackProgress,3);
c=origin.analyzeOriginCat(c);assert.equal(c.originZero.cat,'positive');assert.equal(c.originZero.firstPositiveDay,26);assert.ok(c.lastOutcome.includes('M-00'));
let hq=origin.chooseOriginRoute(c,'hq');let kept=origin.chooseOriginRoute(c,'shelter');
assert.equal(hq.originZero.route,'hq');assert.equal(kept.originZero.route,'shelter');assert.equal(hq.originZero.cat,'hq');assert.equal(kept.originZero.cat,'shelter');
assert.equal(origin.chooseOriginRoute(hq,'shelter'),hq,'branch cannot be reversed without a new save');
console.log('PASS automatic concealed scans / cat tracking / positive / irreversible fork');
function fill(x){for(let i=0;i<4;i++){x.ap=4;x.power=100;x=origin.restoreOriginPhotos(x);}return x;}
hq=fill(hq);kept=fill(kept);
assert.equal(hq.originZero.photos,12);assert.equal(hq.flags.mirror,true);assert.equal(kept.originZero.photos,12);
assert.equal(origin.photoRecords.length,12);console.log('PASS 12 photos unlocked only after positive branch and restored as 4 groups');
// Each already known specimen, including transferred or dead, has an alternate retrieval route.
hq.ap=4;hq.power=100;
for(const id of ['rabbit','fox','deer'])hq=origin.performOriginRecall(hq,id);
assert.equal(Object.keys(hq.originZero.recalls).length,3);
assert.ok(origin.originCrisisAvailable({...hq,day:28}));hq.day=28;
hq=origin.resolveOriginCrisis(hq,'protect');assert.equal(hq.originZero.crisisDone,true);
hq.ap=4;hq.power=100;hq=origin.originBranchAction(hq,'retrieve');
for(let i=0;i<5&&hq.originZero.immunity<75;i++){hq.ap=4;hq.power=100;hq.knowledge=100;hq=origin.studyOriginImmunity(hq)}
assert.ok(hq.originZero.immunity>=75);assert.equal(origin.originReadyForFinale(hq),true);
hq.day=31;hq.pendingIncident=null;hq.power=99;hq.food=99;hq.rooms=8;
let pre=g.finishDay(hq,'shield');assert.equal(pre.phase,'finale');
let out=archive.finishWithArchive(pre,'rebuild');assert.equal(out.phase,'ending');assert.ok(out.ending.includes('사망했다'));
console.log('PASS HQ remote evidence -> crisis -> recall -> immunity -> final ending with death');
// Keep branch remains independent; not requiring HQ specimen magically back at the zoo.
kept.day=28;kept.ap=4;kept.power=100;assert.ok(origin.originCrisisAvailable(kept));kept=origin.resolveOriginCrisis(kept,'protect');
kept.ap=4;kept.power=100;
for(const id of ['rabbit','fox','deer'])kept=origin.performOriginRecall(kept,id);
for(let i=0;i<4&&kept.originZero.immunity<75;i++){kept.ap=4;kept.power=100;kept.knowledge=100;kept=origin.studyOriginImmunity(kept)}
assert.equal(origin.originReadyForFinale(kept),true);
kept.phase='finale';const protect=archive.finishWithArchive(kept,'freedom');assert.ok(/방주의 씨앗|마지막 동물원/.test(protect.ending));assert.ok(protect.ending.includes('사망했다'));
console.log('PASS shelter protection branch -> alternative ending');
// Old saves without origin-state should load and never fabricate positive markers.
const old=g.beginGame('artist','generator');delete old.originZero;const migrated=g.loadGame(structuredClone(old));assert.equal(migrated.originZero.cat,'unknown');assert.equal(migrated.originZero.scans.length,0);
console.log('PASS older save origin-state migration');
// No premature finale even on Day 40 until player completes the final research.
const unfinished=g.beginGame('artist','generator');unfinished.day=39;unfinished.power=99;unfinished.food=99;unfinished.pendingIncident=null;const still=g.finishDay(unfinished,'shield');assert.equal(still.phase,'day');
console.log('PASS calendar does not skip M-00 / Hidden Photo / recall before finale');
// Legacy staff transfer must still produce next-day personnel.
let staff=g.beginGame('artist','generator');staff.day=5;staff.rooms=5;add(staff,'rabbit');staff=g.requestHeadquartersTransfer(staff,'rabbit');staff=g.resolveHeadquarters(staff,'transfer');assert.equal(staff.crew.members.length,0);staff.day=6;assert.deepEqual(g.scheduleStaffByDay(staff),['rabbit']);
console.log('PASS v64 HQ transfer retains next-day 1-person arrival');
}

// New UI restores each photo separately; the grouped legacy API is preserved for compatibility.
{const origin=require('../src/lib/origin-zero.ts');let v=g.beginGame('artist','generator');v.originZero={...origin.emptyOriginZero(),cat:'shelter',route:'shelter',firstPositiveDay:1};for(let k=0;k<12;k++){v.ap=4;v.power=100;v=origin.restoreOriginPhoto(v,origin.individualPhotoPuzzles[k].answer);assert.equal(v.originZero.photos,k+1);if(k<6)assert.equal(!!v.flags.humanTruth,false);if(k<10)assert.equal(!!v.flags.mirror,false);}assert.equal(v.flags.mirror,true);}

// CCTV observation is a deliberate risky action, not a wall-clock penalty.
{const security=require('../src/lib/security.ts');let v=g.beginGame('artist','generator');v.day=8;v.power=100;v.animals=[sim.makeAnimal('rabbit',1)];v.security.incident={animalId:'rabbit',status:'alert',camera:'CAM-02',severity:72,steps:0,description:'signal',detected:false};const spot=security.cctvHotspotIndex(v);const wrongCam=security.securityAction(v,'watch','CAM-03');assert.equal(wrongCam,v);v=security.securityAction(v,'watch','CAM-02');assert.equal(v.power,98);assert.equal(v.security.incident.status,'breach');assert.notEqual(security.cctvHotspotIndex(v),spot);v.security.incident.severity=90;v=security.securityAction(v,'inspect','CAM-02',(security.cctvHotspotIndex(v)+1)%4);assert.equal(v.security.incident.status,'escaped');assert.ok(v.security.escapedIds.includes('rabbit'));assert.equal(v.security.incident.tracked,false);}

{const w=require('../src/lib/wiring.ts'),voice=require('../src/lib/voice-breach.ts');let v=g.beginGame('artist','generator');v.day=8;v.ap=4;v.parts=3;v.power=20;const b=w.wiringBoard(v,'recharge');assert.equal(w.wiringStatus({...b,rotations:Array(16).fill(0)}).valid,true);assert.equal(w.wiringStatus(b).valid,false);let wrong=w.testWiring(v,'recharge');assert.equal(wrong.wiring.recharge.faults,1);assert.equal(wrong.ap,v.ap);for(let k=0;k<16;k++)while(w.wiringBoard(wrong,'recharge').rotations[k]&&w.wiringMasks(w.wiringBoard(wrong,'recharge').layout)[k])wrong=w.rotateWiring(wrong,'recharge',k);wrong=g.loadGame(JSON.parse(JSON.stringify(wrong)));let fixed=w.testWiring(wrong,'recharge');assert.equal(fixed.parts,v.parts-1);assert.equal(fixed.ap,v.ap-1);assert.equal(fixed.power,44);for(const mimic of [true,false]){let s=g.beginGame('artist','generator');s.day=8;voice.scheduleVoiceBreach(s,0,0,mimic?.1:.9);const ev=s.voice.pending;let matching=0;for(const probe of ['eve','enclosure','personnel']){const sig=voice.voiceSignal(ev,probe);if(sig.reading===(mimic?'mismatch':'match'))matching++;s=voice.inspectVoiceBreach(s,probe,sig.reading,sig.alignment);}assert.ok(matching>=2);assert.equal(s.voice.pending.remaining,0);assert.equal(voice.resolveVoiceBreach(s,mimic?'seal':'open').voice.correct,1);}console.log('PASS wiring connection graph and noisy three-channel identity deduction');}

{const h=require('../src/lib/horror-cases.ts'),crew=require('../src/lib/crew.ts');let s=g.beginGame('artist','generator');s.day=8;s.tutorialStep=9;s.facilities.cctv=true;s.power=40;s.threat=40;s.clues=6;s.headquarters.firstReport=true;crew.recruitCrew(s,'wolf','W-1');const seen=new Set;for(let k=0;k<21&&seen.size<7;k++){s.day+=3;h.tickHorror(s);const ev=s.horror.pending;if(!ev)continue;seen.add(ev.id);assert.equal(h.resolveHorror(s,ev.answer),s);s=h.readHorrorRecord(s,0);s=g.loadGame(JSON.parse(JSON.stringify(s)));s=h.readHorrorRecord(s,1);const before=s.clues;s=h.resolveHorror(s,ev.answer);assert.equal(s.horror.pending,null);assert.equal(s.clues,before+1);}assert.equal(seen.size,7);s.day+=3;h.tickHorror(s);if(s.horror.pending){const before=s.horror.history.length;s.day=s.horror.pending.expires;h.tickHorror(s);assert.equal(s.horror.history.length,before+1);assert.equal(s.horror.history[0].correct,false);}console.log('PASS seven contextual horror case paths, read gate, reload and deadline');}

{const w=require('../src/lib/wiring.ts');for(let layout=0;layout<3;layout++)assert.equal(w.wiringStatus({day:1,mode:'night',serial:0,layout,rotations:Array(16).fill(0),faults:0,completed:false}).valid,true);console.log('PASS all three circuit topologies');}

{const d=require('../src/lib/story-dialogue.ts'),o=require('../src/lib/origin-zero.ts');let s=g.beginGame('artist','generator');s.originZero=o.emptyOriginZero();let after=JSON.parse(JSON.stringify(s));after.originZero.cat='positive';after.originZero.firstPositiveDay=8;assert.ok(d.originDialogue(s,after).some(x=>x.text.includes('동기화')));after.originZero.photos=6;assert.equal(d.originPhotoDialogue(after,7).length,0);after.originZero.photos=7;assert.ok(d.originPhotoDialogue(after,7).some(x=>x.text.includes('처음부터 다 알고')));assert.ok(d.originPhotoDialogue(after,7).every(x=>x.scene===14));assert.equal(d.originPhotoDialogue(after,10).length,0);after.originZero.photos=9;assert.ok(d.originPhotoDialogue(after,9).some(x=>x.text.includes('직접 살아 본 건 아니')));console.log('PASS EVE obedience, withheld truth, M-00 memory synchronization and evidence-gated dialogue');}

{const o=require('../src/lib/origin-zero.ts'),d=require('../src/lib/story-dialogue.ts');let s=g.beginGame('artist','generator');s.originZero={...o.emptyOriginZero(),route:'shelter',cat:'shelter',photos:12,immunity:0};assert.equal(o.resonanceRisk(o.setOriginResonance(s,100)),100);assert.equal(o.resonanceRisk(o.setOriginResonance(s,0)),0);assert.ok(d.originPhotoDialogue(s,5).some(x=>x.text.includes('조금만 더 있었으면')));assert.ok(d.originPhotoDialogue(s,11).some(x=>x.recordedSpeaker==='과학자'));assert.ok(!JSON.stringify(o.photoRecords).includes('루나'));console.log('PASS final canon and fictional resonance control');}
