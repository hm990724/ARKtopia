const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const G=require('../src/lib/game-v10.ts');const S=require('../src/lib/sim.ts');
const base=()=>{const s=G.beginGame('artist','medical');s.day=12;s.power=80;s.hp=100;s.eve=90;s.facility=80;s.parts=10;s.filters=8;s.food=8;s.animals=[S.makeAnimal('rabbit',1)];return s};
const events=Object.keys(G.incidentDefs);assert.equal(events.length,10);
for(const id of events){
 for(let option=0;option<3;option++){
  const s=base();s.pendingIncident=id;
  const snapshot=JSON.stringify(s);
  const predicted=G.previewIncident(s,option);assert.equal(JSON.stringify(s),snapshot,'preview must be side-effect free');
  assert(predicted.available,`${id}/${option} should be available at stocked base`);
  const n=G.resolveIncident(s,option);assert.notStrictEqual(n,s);assert.equal(n.pendingIncident,null);assert.equal(n.lastEvent,G.incidentDefs[id].title);
  for(const [key] of [['hp'],['eve'],['facility'],['power']]){assert(n[key]>=0&&n[key]<=100,`${id}/${option} ${key} clamped`)}
  for(const effect of predicted.effects){const map={'생명':'hp','체력':'stamina','정신':'mind','EVE 코어':'eve','전력':'power','시설':'facility','감염':'infection','위협':'threat','부품':'parts','필터':'filters','식량':'food','지식':'knowledge','단서':'clues','신뢰':'trust'};if(map[effect.name])assert.equal(effect.delta,n[map[effect.name]]-s[map[effect.name]],'preview matches actual');}
 }
}
console.log('PASS all 10 incident types x 3 options; preview matches actual with no side effects');
const cases=[['breach',22,'hp'],['blackout',13,'hp'],['spores',14,'hp'],['predator',24,'hp'],['coolant',25,'eve'],['intrusion',24,'eve']];
for(const [id,min,key] of cases){const s=base();s.pendingIncident=id;const n=G.resolveIncident(s,2);assert(s[key]-n[key]>=min,`${id}: failed response damage`)}
console.log('PASS severe consequences for unsafe night responses');
const s=base();s.lastEvent=G.incidentDefs.blackout.title;const list=[];for(let i=0;i<1000;i++){
 const n=G.determineIncident(s,0,(i+.5)/1000);assert(n);list.push(n);
}
const by=Object.fromEntries(events.map(id=>[id,list.filter(x=>x===id).length]));assert(events.every(id=>by[id]>0),'all incident types must be reachable');assert(by.blackout<200,'blackout must not dominate selection');
assert.notEqual(G.determineIncident(s,0,0),G.determineIncident(s,0,.999));
console.log('PASS independent event-type draw, event variety and repetition penalty:',by);
let low=base();low.day=8;low.power=0;low.pendingIncident=null;let later=G.finishDay(low,'shield');assert.equal(later.day,9);assert.equal(later.power,0);assert(later.threat>low.threat);console.log('PASS powerless night advances and increases risk');
assert.equal(G.gearData.some(g=>g.id==='cage'),false,'cage must be HQ reward only');
console.log('PASS standard loadout excludes HQ cage bonus');
console.log('ALL v39 REGRESSION TESTS PASSED');
