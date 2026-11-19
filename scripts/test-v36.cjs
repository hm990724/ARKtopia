const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=function(mod,file){mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file)};
const G=require('../src/lib/game-v10.ts');
const S=require('../src/lib/sim.ts');
const C=require('../src/lib/care-interactions.ts');
const {applyFamiliarRoutine}=C;
for(const id of S.specs.map(x=>x.id))for(const kind of Object.keys(C.CARE_ACTIONS)){
 const a=S.makeAnimal(id,1);const sc=C.getCareScenario(a,kind,3);
 assert.equal(sc.options.length,4);
 assert.equal(new Set(sc.options).size,4);
 assert(sc.correct>=0&&sc.correct<=3);
 assert(sc.options[sc.correct].length>8);
}
console.log('PASS 12 species × 4 care actions = 48 four-choice behavior encounters');
function setup(){const s=G.beginGame('artist','medical');s.ap=4;s.food=9;s.medicine=9;s.day=2;s.animals.push(S.makeAnimal('rabbit',1));return s}
{
 const game=G.beginGame('artist','medical');
 game.pending='rabbit';game.tacticalCaptured=true;game.tutorialStep=3;
 const after=G.rescueChoice(game,'secure',.999);
 assert(after.animals.some(a=>a.id==='rabbit'));
 assert(after.animals[0].bond>=20);
 assert.equal(game.lifeSaved,0);
 console.log('PASS first rabbit guaranteed capture + research-ready bond');
}
{
 const s=setup();const a=s.animals[0];const scenario=C.getCareScenario(a,'observe',s.day);
 const res=C.resolveCareChoice(s,'rabbit','observe',scenario.correct);
 assert(res.correct);assert.equal(res.next.ap,s.ap-1);assert.equal(res.next.animals[0].records,1);
 assert(res.next.animals[0].bond>a.bond);
 assert.equal(s.animals[0].records,0);
 assert.equal(res.mastery,1);
 console.log('PASS first observation registers and success improves affinity without mutating source');
}
{
 const s=setup();const a=s.animals[0];const scenario=C.getCareScenario(a,'feed',s.day);const wrong=(scenario.correct+1)%4;
 const res=C.resolveCareChoice(s,'rabbit','feed',wrong);
 assert(!res.correct);assert.equal(res.next.ap,s.ap-1);assert.equal(res.next.food,s.food-1);
 assert(res.next.animals[0].stress>a.stress);assert(res.next.animals[0].bond<a.bond);
 console.log('PASS wrong answer consumes real resources, raises stress and lowers bond');
}
{
 let s=setup();for(let n=0;n<2;n++){
  const sc=C.getCareScenario(s.animals[0],'comfort',s.day);s=C.resolveCareChoice(s,'rabbit','comfort',sc.correct).next;
 }
 assert(C.canQuickCare(s.animals[0],'comfort'));
 let q=C.quickCare(s,'rabbit','comfort');assert.equal(q.ap,s.ap-1);
 assert.notStrictEqual(q,s);
 const blocked=C.quickCare(setup(),'rabbit','comfort');assert.strictEqual(blocked.animals[0].bond,15);
 console.log('PASS two correct choices unlock quick care, still costing AP');
}
{
 let s=setup();for(const kind of ['feed','comfort'])for(let k=0;k<2;k++){
  const sc=C.getCareScenario(s.animals[0],kind,s.day);s=C.resolveCareChoice(s,'rabbit',kind,sc.correct).next;
 }
 const a=s.animals[0];assert.equal(a.careRoutine,undefined);
 a.careRoutine=true;a.stress=52;a.bond=38;
 assert(applyFamiliarRoutine(a));assert.equal(a.stress,48);assert.equal(a.bond,40);
 a.careRoutine=false;assert.equal(applyFamiliarRoutine(a),false);
 console.log('PASS routine unlock requires feeding + comforting mastery, toggleable');
}
{
 const s=setup();s.tutorialStep=4;s.animals[0].bond=15;s.animals[0].records=0;
 const loaded=G.loadGame(JSON.parse(JSON.stringify(s)));
 assert(loaded.animals[0].bond>=20,'legacy tutorial saves should receive correction');
 assert.equal(loaded.animals[0].records,0);
 console.log('PASS legacy tutorial save repair without wiping progress');
}
{
 const s=setup();assert.strictEqual(C.resolveCareChoice(s,'rabbit','heal',99),null);
 const a=s.animals[0];assert(!C.canQuickCare(a,'feed'));
 s.ap=0;assert.strictEqual(C.resolveCareChoice(s,'rabbit','feed',0),null);
 console.log('PASS invalid choice and no-AP cannot exploit care');
}
console.log('ALL V36 tests passed');
