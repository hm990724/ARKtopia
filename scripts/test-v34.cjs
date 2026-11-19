const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=function(mod,file){const code=fs.readFileSync(file,'utf8');mod._compile(ts.transpileModule(code,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file)};
const H=require('../src/lib/hidden-hunt.ts');
const G=require('../src/lib/game-v10.ts');
const Tactical=require('../src/lib/tactical-field.ts');
const R=(s,action)=>H.performHuntAction(s,action);
function aDifferentCell(state){return (state.position+1)%64;}
function testsSearchAndPersistence(){
 for(const species of Object.keys(H.HUNT_TRAITS)){
  let hunt=H.newHunt(species,13719+species.length*47);
  assert.equal(hunt.version,35);
  assert.equal(H.huntSearchedCount(hunt),0);
  const miss=aDifferentCell(hunt),beforePos=hunt.position;
  let r=R(hunt,{type:'search',cell:miss});
  assert.equal(r.won,false);assert.equal(r.changed,true);
  hunt=r.state;
  assert.equal(hunt.lastSearch.cell,miss);assert.equal(hunt.lastSearch.found,false);
  assert.equal(H.huntSearchedCount(hunt),1);
  assert.equal(hunt.searchedAt[String(miss)],1);
  assert.equal(H.huntSearchAge(hunt,miss),0);
  assert.equal(hunt.footprints[0],beforePos,'last position still used for footprints');
  hunt=R(hunt,{type:'wait'}).state;
  assert.equal(H.huntSearchAge(hunt,miss),1);
  hunt=R(hunt,{type:'wait'}).state;
  assert.equal(H.huntSearchAge(hunt,miss),2);
  hunt=R(hunt,{type:'wait'}).state;
  assert.equal(H.huntSearchAge(hunt,miss),3);
  assert.equal(H.huntSearchedCount(hunt),1,'visited memory never deleted');
  assert.equal(H.huntClearingBias(hunt,miss)>-7,true);
 }
 console.log('PASS 12 species: occupied tile check, persistent searched marking, 2-turn settling, single previous-turn footprint');
}
function testsMovementNotBlocked(){
 for(const species of Object.keys(H.HUNT_TRAITS)){
  let hunt=H.newHunt(species,5576+species.length*101);
  // Every single cell has been opened; the animal must still be able to move.
  hunt={...hunt,searchedAt:Object.fromEntries(Array.from({length:64},(_,i)=>[String(i),0]))};
  const before=hunt.position;
  hunt=R(hunt,{type:'wait'}).state;
  assert.equal(hunt.outcome,'playing');
  assert.equal(hunt.actions,hunt.maxActions-1);
  assert(H.huntSearchedCount(hunt)===64);
  assert.notEqual(hunt.position,before,`searched land must not become a wall: ${species}`);
 }
 console.log('PASS 12 species: even a completely opened map remains traversable; searched is not barrier');
}
function testsSpeciesDifferences(){
 let rabbit=H.newHunt('rabbit',99),fox=H.newHunt('fox',99),wolf=H.newHunt('wolf',99),mutant=H.newHunt('mutant',99);
 for(const [s,c] of [[rabbit,10],[fox,10],[wolf,10],[mutant,10]]){s.searchedAt[String(c)]=0;}
 assert(H.huntClearingBias(rabbit,10)<H.huntClearingBias(fox,10));
 assert(H.huntClearingBias(fox,10)<0);
 assert(H.huntClearingBias(mutant,10)>0);
 fox.turn=4;wolf.turn=4;assert(H.huntClearingBias(fox,10)>H.huntClearingBias(wolf,10),'fox returns deliberately to older cleared cells');
 assert(H.huntClearingBias(rabbit,11)===0,'unsearched cell neutral');
 // Searching previously visited land must still be able to catch the animal.
 const spot=22;let h=H.newHunt('fox',125);
 h={...h,turn:5,position:spot,searchedAt:{[String(spot)]:1}};
 const result=R(h,{type:'search',cell:spot});
 assert(result.won);assert.equal(result.state.lastSearch.found,true);
 assert.equal(result.state.searchedAt[String(spot)],6);
 assert.equal(result.state.outcome,'caught');
 assert.equal(result.state.footprints.length,2,'fox decoys remain after v34');
 console.log('PASS reactive species: rabbit avoids recent scans; fox reuses old clearings; discovered on already opened ground');
}
function testsOldSaveUpgrade(){
 const capture=Tactical.createCapture('fox',false,3123);
 const hunt=H.newHunt('fox',3123);
 hunt.revealed[1]=true;hunt.actions-=2;hunt.turn=2;
 const old=JSON.parse(JSON.stringify({...capture,hunt:{...hunt,version:33}}));
 delete old.hunt.searchedAt;delete old.hunt.lastSearch;
 const loaded=Tactical.normalizeCapture(old);
 assert.equal(loaded.hunt.version,35);assert.equal(loaded.hunt.actions,hunt.actions);
 assert.equal(loaded.hunt.position,hunt.position);assert.deepEqual(loaded.hunt.footprints,hunt.footprints);
 assert.equal(loaded.hunt.revealed[1],true);assert.deepEqual(loaded.hunt.searchedAt,{});
 assert.equal(loaded.hunt.lastSearch,null);
 // New v34 active hunts survive JSON and loadGame with search history.
 let game=G.startRun(G.beginGame('artist','medical'),'garden',['flashlight','filter']);
 for(const p of [15,16,17])game=G.moveField(game,p);
 assert(game.capture?.hunt);
 const miss=aDifferentCell(game.capture.hunt);
 game=G.performVeiledHunt(game,{type:'search',cell:miss});
 const restored=G.loadGame(JSON.parse(JSON.stringify(game)));
 assert(restored.capture.hunt.searchedAt[String(miss)]>=1);
 assert.equal(restored.capture.hunt.version,35);
 console.log('PASS v33 live hunt migration and new search records across save/load with no creature reset');
}
for(const test of [testsSearchAndPersistence,testsMovementNotBlocked,testsSpeciesDifferences,testsOldSaveUpgrade])test();
console.log('ALL v34 pursuit and persistent-clearings tests passed');
