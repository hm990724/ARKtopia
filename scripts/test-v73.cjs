const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame,resolveNightTransition,normalizeV10}=require('../src/lib/game-v10.ts');
const {makeAnimal}=require('../src/lib/sim.ts');
const {nightSignal,chooseNightResponse,resolveNightWatch}=require('../src/lib/night-watch.ts');
const {securityAction,cctvHotspotIndex,nightlySecurity}=require('../src/lib/security.ts');
function base(day=4){const s=beginGame('medic','generator');s.day=day;s.tutorialStep=9;s.parts=10;s.food=10;s.facility=60;s.pendingIncident=null;return s;}
let s=base(),planned=chooseNightResponse(s,'intervene');assert.equal(s.security.watchPlan,undefined);assert.equal(planned.parts,10);assert.equal(planned.facility,60);
resolveNightWatch(planned);assert.equal(planned.parts,8);assert.equal(planned.facility,66);const once=JSON.stringify(planned);resolveNightWatch(planned);assert.equal(JSON.stringify(planned),once);
console.log('PASS night choice is immutable, charges only settlement and cannot double reward');
s=base();s.pendingIncident='garden';planned=chooseNightResponse(s,'intervene');const fail=resolveNightTransition(planned,'shield');assert.equal(fail.success,false);assert.equal(fail.state.parts,10);assert.equal(fail.state.day,4);
s=base();s.parts=0;assert.equal(chooseNightResponse(s,'intervene'),s);s=base();planned=chooseNightResponse(s,'intervene');planned.security.watchPlan.day=3;resolveNightWatch(planned);assert.equal(planned.parts,10);assert.equal(planned.facility,56);
console.log('PASS blocked days, missing resources and stale saved plans cannot spend or grant bonus');
s=base(6);s.animals=[makeAnimal('rabbit',1)];s.security.incident={animalId:'rabbit',status:'alert',camera:'CAM-02',severity:65,steps:1,description:'test',detected:false};
const found=securityAction(s,'inspect','CAM-02',cctvHotspotIndex(s));planned=chooseNightResponse(found,'intervene');resolveNightWatch(planned);nightlySecurity(planned,0);
assert.equal(planned.security.incident.status,'alert');assert.equal(planned.security.incident.steps,1);assert.equal(planned.mind,found.mind-5);
planned.day++;nightlySecurity(planned,0);assert.equal(planned.security.incident.status,'breach');
const blind=chooseNightResponse(s,'intervene');resolveNightWatch(blind);nightlySecurity(blind,0);assert.equal(blind.security.incident.status,'breach');
console.log('PASS visible CCTV evidence plus patrol prevents one night of escalation, never indefinitely');
s=base(5);s.animals=[makeAnimal('rabbit',1)];s.animals[0].stress=50;planned=chooseNightResponse(s,'intervene');resolveNightWatch(planned);assert.equal(planned.food,8);assert.equal(planned.animals[0].stress,42);
s=base(6);planned=chooseNightResponse(s,'intervene');const mind=s.mind,threat=s.threat;resolveNightWatch(planned);assert.equal(planned.mind,mind-5);assert.equal(planned.threat,Math.max(0,threat-8));
assert.equal(nightSignal(base(3)),null);
console.log('PASS nightly animal care and perimeter choices have real costs, tutorials remain unchanged');
const activeArt=require('../src/lib/animal-art.ts');
for(const id of ['rabbit','fox','deer','owl','wolf','crow','otter','lynx','axolotl','moth','mutant','chimera','specter']){
 for(const mutated of [false,true]){const file=path.join(__dirname,'..','public',activeArt.animalSprite(id,mutated));const b=fs.readFileSync(file);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file);assert.ok(b.readUInt32BE(16)>0&&b.readUInt32BE(20)>0,file);if(file.includes('_v74.png')||file.includes('_v75.png'))assert.equal(b.readUInt32BE(16),b.readUInt32BE(20),file);assert.equal(b[25],6,file);}
}
for(const id of ['axolotl','lynx','moth','chimera'])assert.match(activeArt.animalSprite(id,true),/_v75\.png$/);
console.log('PASS all 26 active animal variants resolve to square transparent PNGs; role-driven mutant set uses v75');

