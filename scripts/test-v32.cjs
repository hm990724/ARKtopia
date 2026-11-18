/** ECHO WARD v32: executable, deterministic tests of capture gates, tracking and field pressure. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=function(mod,file){const source=fs.readFileSync(file,'utf8');const output=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;mod._compile(output,file)};
const G=require('../src/lib/game-v10.ts');
const T=require('../src/lib/tactical-field.ts');
const S=require('../src/lib/security.ts');
const A=require('../src/lib/sim.ts');
function startTutorial(){
 let n=G.startRun(G.beginGame('artist','medical'),'garden',['flashlight','filter','cage']);
 assert(n.run&&n.field);for(const tile of [15,16,17])n=G.moveField(n,tile);
 assert.equal(n.capture?.species,'rabbit');assert.equal(n.capture?.tutorial,true);
 return n;
}
function testFirstRabbit(){
 let n=startTutorial(); const gate=n.capture.gate;
 assert.equal(T.canPlaceDevice(n.capture,1,'cage'),false,'cannot cage outside the designated gate');
 n=G.placeTacticalDevice(n,gate,'cage');n=G.placeTacticalDevice(n,21,'bait');
 assert(n.capture.devices.some(d=>d.position===gate&&d.kind==='cage'));
 for(let i=0;i<3&&n.capture;i++){
  const next=T.forecastCapture(n.capture).position;
  n=G.predictTacticalMove(n,next);n=G.executeTacticalTurn(n);
 }
 assert.equal(n.pending,'rabbit');assert.equal(n.tacticalCaptured,true);
 n=G.rescueChoice(n,'secure',.999);assert.equal(n.animals[0]?.id,'rabbit');
 console.log('OK first rabbit guaranteed encounter, tactical tutorial and 100% secure');
}
function testNoBaitAutoCapture(){
 let c=T.createCapture('fox');const gate=c.gate;
 c=T.setDevice(c,gate,'cage');c=T.setDevice(c,21,'bait');
 assert.equal(T.advanceCapture(c).turn,0,'without prediction cannot advance');
 for(let i=0;i<4;i++){
  const target=T.forecastCapture(c).position;
  c=T.markCapturePrediction(c,target);c=T.advanceCapture(c);
  assert.notEqual(c.outcome,'caught','cannot catch without deliberate seal');
 }
 assert.equal(T.canPlaceDevice(c,33,'cage'),false,'invalid cage coordinates must fail');
 console.log('OK bait alone cannot catch; observation, gate and seal are required');
}
function testPredictionAndSeal(){
 let c=T.createCapture('rabbit');c=T.setDevice(c,c.gate,'cage');c=T.setDevice(c,21,'bait');
 assert.equal(T.armCaptureSeal(c).sealArmed,false,'cannot seal without two observations');
 let predicted=0;
 for(let i=0;i<8&&c.outcome==='playing'&&c.confirmed<2;i++){
  if(c.confirmed===1){c=T.removeDevice(c,21);c=T.setDevice(c,33,'bait')} // redirect the animal instead of reusing the same tile
  const pos=T.forecastCapture(c).position;
  c=T.markCapturePrediction(c,pos);
  c=T.advanceCapture(c);
  predicted++;
 }
 assert(c.confirmed>=2,`need two distinct verified positions; got ${c.confirmed} after ${predicted}`);
 c=T.armCaptureSeal(c);assert.equal(c.sealArmed,true, c.lastEvent);
 for(let i=0;i<10&&c.outcome==='playing';i++)c=T.advanceCapture(c);
 assert.equal(c.outcome,'caught',`verified route and sealed gate must allow capture: ${c.lastEvent}`);
 console.log('OK two verified movements + explicit seal -> tactical capture');
}
function testPressure(){
 let n=G.startRun(G.beginGame('engineer','medical'),'garden',[]);
 assert(n.field);const hp=n.hp;
 // Safe back-and-forth repeatedly still raises pursuit pressure; cannot farm forever.
 for(let i=0;i<25&&n.run;i++)n=G.moveField(n,i%2===0?15:14);
 assert.equal(n.run,null,'pressure eventually triggers forced retreat');
 assert(n.hp<hp,'forced retreat costs HP');
 console.log('OK expedition pursuit clock and anti-farming forced extraction');
}
function testProfilesAndSave(){
 assert.equal(Object.keys(T.captureBehaviours).length,12);
 const patterns=new Set(Object.values(T.captureBehaviours).map(x=>x.name));assert.equal(patterns.size,12);
 let c=T.createCapture('wolf');const legacy={...c};delete legacy.gate;delete legacy.confirmed;delete legacy.lastConfirmed;delete legacy.sealArmed;delete legacy.prediction;
 const fixed=T.normalizeCapture(legacy);assert.equal(fixed.gate,T.gateForSpecies('wolf'));
 const n=G.beginGame('artist','medical');n.capture=legacy;
 assert.equal(G.loadGame(n).capture.gate,T.gateForSpecies('wolf'));
 console.log('OK 12 species and safe migration of legacy active captures');
}
function testSecurity(){
 let n=G.beginGame('artist','medical');n.day=3;n.power=60;n.ap=4;
 n.animals.push(A.makeAnimal('fox',1));n.animals[0].stress=100;n.animals[0].bond=0;
 S.nightlySecurity(n,0);
 for(let i=0;i<4;i++)S.nightlySecurity(n,0);
 assert.equal(n.security.incident?.status,'escaped');assert.equal(S.securityAction(n,'recover'),n);
 const tracked=S.securityAction(n,'track');assert(tracked.security.incident.tracked);
 console.log('OK CCTV escape still requires tracking before recontainment');
}
for(const f of [testFirstRabbit,testNoBaitAutoCapture,testPredictionAndSeal,testPressure,testProfilesAndSave,testSecurity])f();
function testCommandBudgetAndExit(){
 let n=startTutorial();n=G.placeTacticalDevice(n,n.capture.gate,'cage');
 assert.equal(n.capture.focus,98);
 const before=n.capture.focus;
 n=G.predictTacticalMove(n,0); // invalid distant forecast: no command spent
 assert.equal(n.capture.focus,before);
 n=G.abandonTacticalCapture(n);
 assert.equal(n.capture,null);assert(n.run&&n.field,'abandonment returns to field without losing the run');
 n=G.leaveField(n);
 assert.equal(n.run,null,'after abandonment player can safely retreat');
 let c=T.createCapture('fox');c=T.setDevice(c,c.gate,'cage');
 assert.equal(c.focus,8);
 c=T.setDevice(c,21,'bait');
 const p=T.forecastCapture(c).position;c=T.markCapturePrediction(c,p);
 assert.equal(c.focus,6);
 for(let i=0;i<6;i++)c=T.markCapturePrediction(c,p);
 assert.equal(c.focus,0);
 assert.equal(T.markCapturePrediction(c,p),c,'no free commands at zero focus');
 console.log('OK command budget, no free rerolls and tactical abandonment');
}
testCommandBudgetAndExit();
console.log('PASS v32 tactical capture and expedition regression suite');
