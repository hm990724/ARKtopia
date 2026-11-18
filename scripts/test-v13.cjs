const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
function load(f,deps={}){const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const mod={exports:{}};vm.runInNewContext(code,{exports:mod.exports,module:mod,require(name){if(name in deps)return deps[name];throw Error('Missing '+name)},structuredClone,Math,console,Number,Set,Array,Object,JSON});return mod.exports}
const sim=load(path.join(__dirname,'../src/lib/sim.ts'));
const g=load(path.join(__dirname,'../src/lib/game-v10.ts'),{'./sim':sim});
const p=load(path.join(__dirname,'../src/lib/protocols.ts'));
if(sim.specs.length!==12)throw Error('Spec mismatch');
for(const sp of sim.specs){if(!p.protocols[sp.id]||p.protocols[sp.id].steps.length!==3)throw Error('Missing unique protocol '+sp.id);for(const st of p.protocols[sp.id].steps)if(st.choices.length!==3)throw Error('Missing choices '+sp.id)}
if(g.regions.some(r=>r.animals.some(id=>['dino','specter','chimera'].includes(id))))throw Error('Removed or lab-only species in region');
let s=g.beginGame('artist','medical');s.animals=[sim.makeAnimal('rabbit',1),sim.makeAnimal('fox',2)];s.rooms=5;s.ap=4;s.power=100;s.knowledge=80;s.parts=10;s.animals.forEach(a=>{a.bond=65;a.stress=15;a.records=2});
let ns=g.synthesize(s,'rabbit','fox',0.01);
if(ns===s||ns.animals.length!==3||ns.animals.find(a=>a.id==='chimera')==null)throw Error('Synthesis successful case broken');
if(ns.animals.filter(a=>a.alive).length!==3||ns.ap!==2)throw Error('Synthesis costs or donors wrong');
let fail=g.synthesize(s,'rabbit','fox',0.99);
if(fail.animals.length!==2||fail.infection<=s.infection)throw Error('Synthesis failure effects broken');
if(g.synthesize(ns,'rabbit','fox',0.01)!==ns)throw Error('Second chimera must be blocked');
if(g.synthesize(s,'mutant','fox',0.01)!==s)throw Error('Mutant cannot be used as donor');
const good=sim.extract(s,'rabbit',95,'gentle');if(good.knowledge<=s.knowledge||good.extractions<=s.extractions)throw Error('Extraction knowledge absent');
const bad=sim.extract(s,'rabbit',20,'gentle');if(bad.knowledge!==s.knowledge||bad.animals[0].stress<=s.animals[0].stress)throw Error('Bad choice must not yield knowledge');
const fresh=g.beginGame('artist','medical');fresh.animals=[sim.makeAnimal('rabbit',1)];const blocked=sim.extract(fresh,'rabbit',95,'gentle');if(blocked.animals[0].memory!==0)throw Error('Unobserved animal bypass');
const legacy=g.beginGame('artist','medical');legacy.animals=[{...sim.makeAnimal('rabbit',1),id:'dino'}];legacy.pending='dino';const clean=g.loadGame(legacy);if(clean.animals.length||clean.pending)throw Error('Old save migration failed');
console.log(JSON.stringify({specs:sim.specs.length,protocols:Object.keys(p.protocols).length,synthesis:'success/failure verified',extraction:'prerequisites and outcomes verified',oldSave:'dinosaur filtered',remainingDonors:ns.animals.filter(a=>a.alive).length},null,2));
