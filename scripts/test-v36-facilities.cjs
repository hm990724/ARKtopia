const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=function(mod,file){mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file)};
const G=require('../src/lib/game-v10.ts');
const S=require('../src/lib/sim.ts');
const C=require('../src/lib/care-interactions.ts');
function stage(){const x=G.beginGame('artist','medical');assert.equal(x.scrap,0);assert(!x.facilities.cctv);assert(!x.facilities.synthesis);x.pending='rabbit';x.tacticalCaptured=true;x.tutorialStep=3;return G.rescueChoice(x,'secure',.99)}
{
 const x=stage();assert.equal(x.lifeSaved,1);assert(x.scrap>=16);assert(x.animals[0].bond>=20);
 const a=G.loadGame(JSON.parse(JSON.stringify(x)));assert.equal(a.scrap,x.scrap);assert.equal(a.animals[0].hunger,22);
 a.tutorialStep=6;const cam=G.buildFacility(a,'cctv');assert.notEqual(cam,a);assert(cam.facilities.cctv);assert.equal(cam.tutorialStep,7);assert.equal(a.facilities.cctv,false);assert.equal(cam.scrap,a.scrap-6);
 assert.strictEqual(G.buildFacility(cam,'cctv'),cam);
 const lab=G.buildFacility(cam,'synthesis');assert(lab.facilities.synthesis);assert.equal(lab.tutorialStep,8);assert.equal(lab.scrap,a.scrap-15);assert(lab.parts>=0);
 assert.strictEqual(G.buildFacility(lab,'synthesis'),lab);
 console.log('PASS first rabbit grants salvage; CCTV then synthesis require real resources, progress tutorial exactly once');
}
{
 const x=stage();x.tutorialStep=6;
 x.scrap=0;assert.strictEqual(G.buildFacility(x,'cctv'),x);
 x.scrap=16;x.parts=0;assert.strictEqual(G.buildFacility(x,'cctv'),x);
 x.parts=3;x.power=0;assert.strictEqual(G.buildFacility(x,'cctv'),x);
 console.log('PASS construction cannot occur without scrap, parts or power');
}
{
 const x=G.beginGame('medic','medical');x.day=4;x.ap=4;x.food=0;x.animals.push(S.makeAnimal('axolotl',1));x.animals.push(S.makeAnimal('wolf',2));
 const a=x.animals[0],b=x.animals[1];a.hunger=66;b.hunger=66;a.contamination=55;b.contamination=55;
 const after=G.finishDay(x,'standby');assert(after.day===x.day+1);assert(after.animals[0].hunger>a.hunger);assert(after.animals[1].hunger>b.hunger);assert(after.animals[0].sickness>0);assert(after.animals[1].sickness>0);
 const before=JSON.parse(JSON.stringify(after));after.animals[0].sickness=80;const treated=S.dailyWork(after,'heal','axolotl');assert(treated.animals[0].sickness<80);
 assert.equal(before.animals[0].alive,true);
 console.log('PASS species-aware hunger and contamination drive disease, treatment decreases illness');
}
{
 const x=G.beginGame('artist','medical');x.animals=[S.makeAnimal('rabbit',1)];x.ap=4;x.day=2;x.animals[0].stress=70;
 const sc=C.getCareScenario(x.animals[0],'comfort',x.day);assert(sc.cue.includes('신경 충돌 전조'));
 const wrong=C.resolveCareChoice(x,'rabbit','comfort',(sc.correct+1)%4);
 assert(wrong.next.animals[0].stress>x.animals[0].stress);
 const observed=S.dailyWork(x,'observe','rabbit');const sc2=C.getCareScenario(observed.animals[0],'feed',x.day);assert(sc2.cue.includes('관찰 기록:'));
 console.log('PASS nervous tremor cue, wrong soothing raises stress, successful observation informs future care');
}
{
 const s=G.beginGame('artist','medical');s.animals.push(S.makeAnimal('rabbit',1));s.animals[0].stress=75;s.animals[0].memory=60;s.facilities.containment=true;
 const sec=require('../src/lib/security.ts');const protectedRisk=sec.escapeRisk(s,s.animals[0]);s.facilities.containment=false;assert(sec.escapeRisk(s,s.animals[0])>protectedRisk);
 console.log('PASS upgraded containment reduces mutation escape risk');
}
{
 const old=G.beginGame('artist','medical');delete old.scrap;delete old.facilities;old.tutorialStep=7;
 const loaded=G.loadGame(JSON.parse(JSON.stringify(old)));assert.equal(loaded.tutorialStep,9);assert(loaded.facilities.cctv);assert(loaded.facilities.synthesis);
 const oldHalf=G.beginGame('artist','medical');delete oldHalf.scrap;delete oldHalf.facilities;oldHalf.tutorialStep=5;
 const repaired=G.loadGame(JSON.parse(JSON.stringify(oldHalf)));assert(repaired.scrap>=16);
 console.log('PASS old saves keep completed access; in-progress tutorial receives starter salvage');
}
console.log('ALL v36 facility and survival tests passed');
