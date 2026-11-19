const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=function(mod,file){mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file)};
const H=require('../src/lib/hidden-hunt.ts');
const T=require('../src/lib/tactical-field.ts');
const G=require('../src/lib/game-v10.ts');
const A=(h,type,cell)=>H.performHuntAction(h,{type,cell});
const all=Object.keys(H.HUNT_TRAITS);
function choose(h,kind){for(let i=0;i<64;i++)if(i!==h.position&&(kind==='footprint'?h.footprints.includes(i):kind==='rustle'?(!h.footprints.includes(i)&&h.shaking.includes(i)):(!h.footprints.includes(i)&&!h.shaking.includes(i))))return i;throw Error('no valid '+kind)}
for(const species of all){
  let h=H.newHunt(species,2439+species.length*100);
  assert.equal(h.version,35);assert.equal(H.huntSearchedCount(h),0);
  assert.deepEqual(h.observations,{});
  assert.equal(H.observedEvidence(h,h.previous),null,'previous location must not leak before searching');
  assert.equal(H.observedEvidence(h,choose(h,'rustle')),null,'neighbouring rustle must be hidden');
  const foot=choose(h,'footprint');
  const after=A(h,'search',foot);
  assert.equal(after.changed,true);assert.equal(after.won,false);h=after.state;
  assert.equal(H.observedEvidence(h,foot).kind,'footprint');
  assert.equal(H.observedEvidence(h,foot).turn,0);
  assert.equal(H.observationAge(h,foot),1,'observation should already be historical after movement');
  assert.equal(H.huntSearchedCount(h),1);
  for(let i=0;i<64;i++)if(i!==foot)assert.equal(H.observedEvidence(h,i),null,'must reveal only clicked cell');
  h=A(h,'wait').state;
  assert.equal(H.observedEvidence(h,foot).kind,'footprint','historical evidence retained');
  assert.equal(H.observedEvidence(h,foot).turn,0,'historical evidence cannot refresh itself');
  assert.equal(H.observationAge(h,foot),2);
  assert.equal(h.searchedAt[String(foot)],1,'opened clearing retained');
  console.log('PASS',species,'hidden start, one-cell observation, stale footprint, persistent cleared cell');
}
// Recorded rustle must represent one-square radius of a PREVIOUS footprint, not actual sighting.
{
 const h=H.newHunt('rabbit', 22148);const c=choose(h,'rustle');
 assert(h.shaking.includes(c));
 const result=A(h,'search',c);
 assert.equal(H.observedEvidence(result.state,c).kind,'rustle');
 assert.notEqual(c,h.position);
 assert.equal(result.state.turn,1);
 console.log('PASS rustle only in 8 neighbouring squares, only revealed when searched');
}
// Rechecking same tile updates its snapshot and consumes an action.
{
 let h=H.newHunt('rabbit',781);const c=choose(h,'empty');
 h=A(h,'search',c).state;
 assert.equal(H.observedEvidence(h,c).kind,'empty');
 const oldTurn=H.observedEvidence(h,c).turn;
 if(h.position===c){h={...h,position:(c+2)%64};}
 h=A(h,'search',c).state;
 assert(H.observedEvidence(h,c).turn>oldTurn);
 assert.equal(h.actions,h.maxActions-2);
 assert.equal(H.huntSearchedCount(h),1,'repeat visits must not create fake extra cells');
 console.log('PASS repeat inspection refreshes stale evidence at action cost');
}
// Fox: TWO footprint candidates exist internally, neither is passively revealed.
{
 let h=H.newHunt('fox',910);
 assert.equal(h.footprints.length,2);
 assert.equal(h.shaking.length>0,true);
 for(const cell of h.footprints)assert.equal(H.observedEvidence(h,cell),null);
 const decoy=h.footprints[1];
 const res=A(h,'search',decoy);
 assert.equal(H.observedEvidence(res.state,decoy).kind,'footprint');
 assert.equal(H.observedEvidence(res.state,h.footprints[0]),null);
 console.log('PASS fox real+false tracks are indistinguishable without inspection');
}
// Direct discovery of hidden animal; searched clearings remain walkable.
{
 let h=H.newHunt('rabbit',10002);
 h={...h,searchedAt:{[String(h.position)]:0},observations:{}};
 const res=A(h,'search',h.position);
 assert(res.won);assert.equal(res.state.outcome,'caught');
 assert.equal(H.observedEvidence(res.state,h.position).kind,'caught');
 let open=H.newHunt('fox',777);
 open={...open,searchedAt:Object.fromEntries(Array.from({length:64},(_,i)=>[String(i),0]))};
 const prev=open.position;
 open=A(open,'wait').state;
 assert.notEqual(open.position,prev,'opened map must never become a wall');
 console.log('PASS real discovery and reopening without blocking movement');
}
// Existing saved game migration must not retroactively reveal all old v34 traces.
{
 const old=H.newHunt('fox',972);
 const raw=JSON.parse(JSON.stringify({...old,version:34,searchedAt:{'12':2}}));delete raw.observations;
 const restored=H.normalizeHunt(raw);
 assert.equal(restored.version,35);
 assert.deepEqual(restored.observations,{});
 assert.equal(restored.searchedAt['12'],0,'future or malformed stamps clamped to turn 0');
 const capture=T.createCapture('fox',false,972);
 capture.hunt=raw;
 assert.equal(T.normalizeCapture(capture).hunt.version,35);
 let game=G.startRun(G.beginGame('artist','medical'),'garden',['flashlight','filter']);
 for(const p of [15,16,17])game=G.moveField(game,p);
 assert(game.capture?.hunt);
 const cell=choose(game.capture.hunt,'empty');
 game=G.performVeiledHunt(game,{type:'search',cell});
 const recovered=G.loadGame(JSON.parse(JSON.stringify(game)));
 assert.equal(H.observedEvidence(recovered.capture.hunt,cell).kind,'empty');
 assert.equal(recovered.capture.hunt.version,35);
 console.log('PASS v34 migration + active game persistence + privacy preserved');
}
console.log('ALL v35 field investigation tests passed');
