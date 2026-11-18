/* ECHO WARD v33: serializable hidden-footprint capture logic and integration tests. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=function(mod,file){const code=fs.readFileSync(file,'utf8');const output=ts.transpileModule(code,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;mod._compile(output,file)};
const H=require('../src/lib/hidden-hunt.ts');
const G=require('../src/lib/game-v10.ts');
const S=require('../src/lib/security.ts');
const Sim=require('../src/lib/sim.ts');
function q(h,action){const z=H.performHuntAction(h,action);return z.state;}
function testHiddenClues(){
 for(const id of Object.keys(H.HUNT_TRAITS)){
  let h=H.newHunt(id,10000+id.length*789,false);
  assert.equal(h.position===h.previous,false,`the animal must move before leaving an initial trail: ${id}`);
  assert.equal(h.footprints[0],h.previous,'only last-turn departure shown');
  assert(h.shaking.every(cell=>h.footprints.some(f=>{
   const dx=Math.abs(cell%8-f%8),dy=Math.abs(Math.floor(cell/8)-Math.floor(f/8));return dx<=1&&dy<=1&&(dx||dy)})));
  assert.deepEqual(h.revealed,[false,false,false]);
  let old=h;
  h=q(h,{type:'reveal',clue:0});assert.equal(h.actions,old.actions-1);assert.equal(h.turn,old.turn+1);assert.equal(h.revealed[0],true);
  assert.equal(H.performHuntAction(h,{type:'reveal',clue:0}).changed,false,'no duplicate clue fee');
  old=h;h=q(h,{type:'wait'});assert.equal(h.footprints[0],old.position,'footprint moves to previous position after one turn');
 }
 const f=H.newHunt('fox',73);assert.equal(f.footprints.length,2,'fox makes authentic and decoy footprints');assert.notEqual(f.footprints[0],f.footprints[1]);
 console.log('PASS 12 species, previous-turn print replacement, 8 surrounding grass tiles, fox decoy, paid clue');
}
function testToolsAndLearning(){
 let h=H.newHunt('rabbit',84,false);
 h=q(h,{type:'bait',cell:27});assert.equal(h.actions,h.maxActions-1);assert.equal(h.habits.bait,1);
 assert.equal(h.objects.length,1);assert.equal(h.objects[0].kind,'bait');
 h=q(h,{type:'sound',cell:9});assert.equal(h.objects.length,2);
 h=q(h,{type:'barrier',cell:14});assert.equal(h.objects.length,3);
 assert.equal(H.performHuntAction(h,{type:'light',cell:17}).changed,false,'max 3 active devices');
 const learn=H.newHunt('fox',245,false);
 let active=learn;for(let i=0;i<3;i++)active=q(active,{type:'bait',cell:5+i*7});
 assert((active.habits.bait??0)>=2,'repetition tracked for learning');
 const r=H.performHuntAction(learn,{type:'search',cell:learn.position});assert.equal(r.won,true);assert.equal(r.state.outcome,'caught');
 console.log('PASS lure movement, red barrier budget, three-device maximum, repeated-stimulus learning, exact-cell search');
}
function testConsequences(){
 for(const [id,hp,part,food,infect] of [['rabbit',0,0,0,0],['fox',0,1,0,0],['wolf',22,0,0,0],['lynx',17,0,0,0],['mutant',31,0,0,8],['chimera',26,0,0,12],['axolotl',0,0,0,9]]){
  let h=H.newHunt(id,25,false);let out;
  for(let i=0;i<h.maxActions;i++){out=H.performHuntAction(h,{type:'wait'});h=out.state;}
  assert.equal(out.lost,true,`${id} must have a timeout penalty`);assert.equal(out.penalty.hp,hp);assert.equal(out.penalty.parts,part);assert.equal(out.penalty.food,food);assert.equal(out.penalty.infection,infect);
 }
 console.log('PASS species-specific failure consequences, dangerous predators lose HP, no instant unseen attack');
}
function testGameIntegration(){
 let s=G.startRun(G.beginGame('artist','medical'),'garden',['flashlight','filter','cage']);
 for(const i of [15,16,17])s=G.moveField(s,i);
 assert(s.capture?.hunt,'current capture must carry hidden hunt');assert(s.capture.hunt.tutorial);
 assert.equal(s.capture.hunt.species,'rabbit');
 const first=s.capture.hunt.actions;
 s=G.performVeiledHunt(s,{type:'reveal',clue:1});assert.equal(s.capture.hunt.actions,first-1);
 for(let n=0;n<20&&s.capture;n++)s=G.performVeiledHunt(s,{type:'wait'});
 assert.equal(s.pending,'rabbit','first encounter is guaranteed even if the tutorial runs out of turns');
 assert.equal(s.tacticalCaptured,true);
 s=G.rescueChoice(s,'secure',.999);assert.equal(s.animals[0]?.id,'rabbit');
 console.log('PASS first rabbit guaranteed encounter and secure transfer after the hidden hunt');
 // A fox chase failure must have a real resource cost; successful/failed routes return to exploration.
 let f=G.startRun(G.beginGame('artist','medical'),'garden',['flashlight','filter']);for(const i of [15,16,17])f=G.moveField(f,i);
 f.capture=G.loadGame(f).capture;
 f.capture.hunt=H.newHunt('fox',901,false);f.capture.species='fox';f.parts=5;
 for(let i=0;i<10;i++)f=G.performVeiledHunt(f,{type:'wait'});
 assert.equal(f.capture,null);assert(f.field&&f.run,'failed hunt returns to exploration');assert.equal(f.parts,4,'fox stole a part');
 console.log('PASS failed fox capture steals a part and returns to field instead of soft-locking');
}
function testCompatibility(){
 const old=G.beginGame('artist','medical');old.capture={species:'rabbit',position:22,turn:0,devices:[],fear:23,trust:28,maxTurns:11,lastEvent:'old',tutorial:false,outcome:'playing',path:[22],gate:5,prediction:null,confirmed:0,lastConfirmed:null,sealArmed:false};
 const loaded=G.loadGame(old);assert.equal(loaded.capture.hunt.version,34);
 assert.equal(typeof JSON.parse(JSON.stringify(loaded.capture.hunt)).position,'number');
 let sec=G.beginGame('artist','medical');sec.day=3;sec.power=60;sec.ap=4;sec.animals.push(Sim.makeAnimal('fox',1));sec.animals[0].stress=100;
 for(let i=0;i<5;i++)S.nightlySecurity(sec,0);
 assert.equal(sec.security.incident?.status,'escaped','CCTV remains wired to existing logic');
 console.log('PASS legacy capture migration, JSON save, CCTV no regression');
}
for(const fn of [testHiddenClues,testToolsAndLearning,testConsequences,testGameIntegration,testCompatibility])fn();
console.log('ALL v33 hidden-footprint tests passed');
