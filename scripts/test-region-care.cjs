const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const g=require('../src/lib/game-v10.ts'),field=require('../src/lib/tactical-field.ts'),sim=require('../src/lib/sim.ts'),care=require('../src/lib/care-interactions.ts'),archive=require('../src/lib/specimen-archive.ts'),security=require('../src/lib/security.ts');
assert.equal(field.fieldVision('rail',true,true,3),0);
assert.equal(field.fieldVision('tunnels',true,false),1);
const rail=field.createField(14,'rail');rail.originFragments={[rail.wildlifeIndex]:5};assert.equal(field.acousticBearing(rail,'fragment').kind,'fragment');assert.equal(field.acousticBearing(rail,'exit').kind,'exit');
assert.equal(field.REGION_RULES.conservatory.sporeRate,.50);assert.equal(field.REGION_RULES.garden.sporeRate,.50);assert.equal(field.REGION_RULES.garden.sporeWake,5);
let s=g.beginGame('medic','generator');s.tutorialStep=9;s.day=6;s.food=4;s.ap=4;let animal=sim.makeAnimal('fox',1);animal.hunger=70;animal.hp=75;animal.stress=30;animal.bond=60;s.animals=[animal];
const before=security.escapeRisk(s,animal);let scenario=care.getCareScenario(animal,'feed',s.day);let fed=care.resolveCareChoice(s,'fox','feed',scenario.correct).next;
assert.equal(fed.food,3);assert.equal(fed.animals[0].fedDay,6);assert.ok(security.escapeRisk(fed,fed.animals[0])<before);assert.equal(care.resolveCareChoice(fed,'fox','feed',scenario.correct),null);
scenario=care.getCareScenario(fed.animals[0],'observe',s.day);const bad=care.resolveCareChoice(fed,'fox','observe',(scenario.correct+1)%4).next;assert.equal(bad.animals[0].records,fed.animals[0].records);assert.equal(bad.knowledge,fed.knowledge);
const good=care.resolveCareChoice(fed,'fox','observe',scenario.correct).next;assert.ok(good.animals[0].records>fed.animals[0].records);archive.recordCareResearch(good,'fox');archive.recordCareResearch(good,'fox');archive.recordCareResearch(good,'fox');archive.recordCareResearch(good,'fox');assert.equal(good.archive.careResearch.fox,3);
Object.assign(good.animals[0],{hp:80,bond:80,stress:15,hunger:20,sickness:0,contamination:0,mutated:false,awakened:false});assert.deepEqual(g.welfareYield(good),{count:1,knowledge:2,mind:2});good.animals[0].hunger=90;assert.equal(g.welfareYield(good).count,0);
const hand={...animal,hunger:20};sim.nightlyAnimalCondition(hand,true,90,0,true);assert.equal(hand.hunger,20+sim.SPECIES_CARE.fox.hunger);
console.log('PASS region visibility, acoustic tracking, ration accounting, care outcomes and living sanctuary yield');

// Autonomous spread from turn five, at 50% per eligible turn, at most one new cell.
const patch=field.createField(8,'garden');assert.equal(field.fieldHeight(patch),10);patch.tiles.fill('empty');patch.position=0;patch.tiles[35]='hazard';for(let i=0;i<4;i++)assert.equal(field.advanceSporeSpread(patch,()=>0),null);assert.equal(field.advanceSporeSpread(patch,()=>.5),null);assert.notEqual(field.advanceSporeSpread(patch,()=>.49),null);assert.equal(patch.sporeSpread.cells.length,1);console.log('PASS expanded field and autonomous spore spread');
