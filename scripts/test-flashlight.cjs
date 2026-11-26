const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame,startRun,toggleFieldLight,moveField}=require('../src/lib/game-v10.ts');
const {fieldFlashlightContains}=require('../src/lib/tactical-field.ts');

let state=beginGame('medic','generator');
state.day=4;state.tutorialStep=9;
const initialPower=state.power,initialBattery=state.flashlight;
state=startRun(state,'garden',['flashlight']);
assert.notEqual(state.run,null,'flashlight sortie should start');
assert.equal(state.power,initialPower-5,'facility power is charged once at departure');
assert.equal(state.flashlight,initialBattery,'handheld battery is not consumed by field toggles');
const field=state.field;
field.tiles.fill('empty');field.threat=null;
const width=field.width??7;
field.position=3*width+3;field.visited=[field.position];field.discovered=[];
const center=field.position;
const beforeTogglePower=state.power;
state=toggleFieldLight(state);
assert.equal(state.power,beforeTogglePower,'turning the flashlight on is free');
assert.equal(state.field.lightOff,false);
for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){
 const cell=center+y*width+x;
 assert.ok(fieldFlashlightContains(state.field,cell),`flashlight includes 3x3 cell ${cell}`);
 assert.ok(state.field.discovered.includes(cell),`flashlight reveals 3x3 cell ${cell}`);
}
assert.equal(fieldFlashlightContains(state.field,center-2*width),false,'light does not spread beyond adjacent cells');
state=toggleFieldLight(state);
state=toggleFieldLight(state);
assert.equal(state.field.lightOff,false,'unlimited off/on toggles remain available');
assert.equal(state.power,beforeTogglePower,'repeated toggles do not spend power');
const destination=state.field.position+1;
state=moveField(state,destination,'quiet');
assert.equal(state.field.lightOff,false,'the flashlight remains on after movement');
assert.equal(state.power,beforeTogglePower,'movement with the flashlight on does not drain facility power');
for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){
 const cell=state.field.position+y*width+x;
 assert.ok(state.field.discovered.includes(cell),`movement updates illuminated cell ${cell}`);
}
console.log('PASS flashlight: -5%p once on departure, free unlimited field toggle, and 3x3 light follows player');
