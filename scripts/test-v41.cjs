const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>{
 const source=fs.readFileSync(filename,'utf8');
 const out=ts.transpileModule(source,{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 module._compile(out.outputText,filename);
};
const game=require('../src/lib/game-v10.ts');
const {createCapture,adjacentField}=require('../src/lib/tactical-field.ts');
const {makeAnimal}=require('../src/lib/sim.ts');
const {resolveCareChoice,getCareScenario}=require('../src/lib/care-interactions.ts');
const {resonanceObservationNotes,verifiedObservationCount}=require('../src/lib/observation-journal.ts');
const tsx=fs.readFileSync('src/components/Game.tsx','utf8');
const css=fs.readFileSync('src/app/globals.css','utf8');
const fm=fs.readFileSync('src/components/FieldMission.tsx','utf8');
for(const [name,code] of [['Game.tsx',tsx],['FieldMission.tsx',fm],['observation-journal.ts',fs.readFileSync('src/lib/observation-journal.ts','utf8')]]){
 const parsed=ts.createSourceFile(name,code,ts.ScriptTarget.Latest,true,name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(parsed.parseDiagnostics.length,0,`${name}: TS syntax errors: ${parsed.parseDiagnostics.map(x=>x.messageText)}`);
}
let s=game.beginGame('artist','medical');
s=game.startRun(s,'garden',['flashlight']);
assert(s.run&&s.field,'must start field');
const startPos=s.field.position;
let cache=Array.from({length:35},(_,i)=>i).find(i=>adjacentField(startPos,i)&&s.field.tiles[i]!=='wall');
assert.notEqual(cache,undefined);
s.field.tiles[cache]='cache';
const scrapBefore=s.scrap,lootBefore=s.run.loot;
let after=game.moveField(s,cache,'quiet');
assert(after!==s&&after.run&&after.field,'cache move continues expedition');
assert(after.scrap>scrapBefore,'cache immediately deposits scrap');
assert(after.run.loot>lootBefore,'cache adds loot points');
assert.equal(after.run.earned.scrap,after.scrap-scrapBefore,'field ledger records actual scrap gains');
console.log('PASS field cache deposits scrap and continues expedition');

// Exact-cell catch does not terminate the expedition or pay out its loot.
let captureState={...after,capture:createCapture('rabbit',true,12455)};
const target=captureState.capture.hunt.position;
const creditsBefore=captureState.credits,partsBefore=captureState.parts,foodBefore=captureState.food;
let caught=game.performVeiledHunt(captureState,{type:'search',cell:target});
assert(caught.pending==='rabbit','correct search sets rescue choice');
assert(caught.run&&caught.field,'caught animal must preserve expedition state');
assert(!caught.capture,'active hunt ends, not expedition');
assert.equal(caught.credits,creditsBefore,'catch must not settle credits prematurely');
assert.equal(caught.parts,partsBefore,'catch must not settle parts prematurely');
assert.equal(caught.food,foodBefore,'catch must not settle food prematurely');
let rescued=game.rescueChoice(caught,'secure',0);
assert(rescued.run&&rescued.field&&!rescued.pending,'after securing rabbit expedition remains active');
assert.equal(rescued.run.captures.at(-1).result,'secured');
assert(rescued.animals.some(a=>a.id==='rabbit'),'rabbit present in quarantine');
console.log('PASS exact-cell capture, rescue, and field continuation without duplicate loot');

const preLeave=rescued;
const left=game.leaveField(preLeave);
assert(!left.run&&!left.field,'explicit leave ends expedition');
assert(left.lastFieldSummary,'summary must be generated');
assert.equal(left.lastFieldSummary.captures.at(-1).id,'rabbit');
assert.equal(left.lastFieldSummary.rewards.scrap,preLeave.run.earned.scrap,'settlement includes acquired scrap');
assert.equal(left.credits-preLeave.credits,left.lastFieldSummary.rewards.credits,'credits paid once on leave');
assert.equal(left.parts-preLeave.parts,left.lastFieldSummary.rewards.parts,'parts paid once on leave');
assert.equal(left.food-preLeave.food,left.lastFieldSummary.rewards.food,'food paid once on leave');
assert.equal(game.leaveField(left),left,'cannot settle twice');
console.log('PASS exit ledger includes field items, returned animal, and one-time payout');

const loaded=game.loadGame(JSON.parse(JSON.stringify(preLeave)));
assert(loaded.run&&loaded.run.captures.length,'resumed save retains field capture data');
const legacy=game.loadGame({...JSON.parse(JSON.stringify(preLeave)),run:{...preLeave.run,earned:undefined,captures:undefined},lastFieldSummary:undefined});
assert(legacy.run.earned&&Array.isArray(legacy.run.captures),'old active expeditions safely migrated');
console.log('PASS existing save/legacy field migration');

let care=game.beginGame('artist','medical');care.animals=[makeAnimal('rabbit',1)];care.animals[0].bond=65;care.ap=4;
assert.equal(verifiedObservationCount(care.animals[0]),0);
for(let i=0;i<3;i++){
 const animal=care.animals[0];
 const scenario=getCareScenario(animal,'observe',care.day);
 const outcome=resolveCareChoice(care,'rabbit','observe',scenario.correct);
 assert(outcome&&outcome.correct,'correct observation action');
 care=outcome.next;
 assert.equal(verifiedObservationCount(care.animals[0]),i+1);
 const notes=resonanceObservationNotes(care.animals[0]);
 assert.equal(notes.filter(x=>x.unlocked).length,i+1);
 assert(notes[i].message.includes('검증된 대응'));
}
assert.equal(care.animals[0].records,3,'three actual observations recorded');
console.log('PASS successful animal observations unlock 3 distinct hints used in resonance UI');
const wrong=game.beginGame('artist','medical');wrong.animals=[makeAnimal('fox',1)];
const sc=getCareScenario(wrong.animals[0],'observe',wrong.day);
const failed=resolveCareChoice(wrong,'fox','observe',(sc.correct+1)%4);
assert(failed&&!failed.correct&&failed.next.animals[0].records===1);
assert.equal(verifiedObservationCount(failed.next.animals[0]),0,'wrong observation must not unlock an answer');
console.log('PASS failed observation saves record, not verified clue');
assert(tsx.includes('fieldRewardModal')&&tsx.includes('showFieldSettlement(n)')&&tsx.includes('v41-observation-journal'));
assert(tsx.includes('v41-operator-ap')&&tsx.includes('v41-protocol-note'));
assert(css.includes('button{appearance:none')&&css.includes('.v41-protocol-note')&&css.includes('.v41-rewards-modal'));
assert(fm.includes("if(mode!=='search')setMode('search')"),'equipment returns to search mode after a use');
console.log('PASS dialogs, action meter, dark buttons, observation dossier, auto-return search CSS/TSX presence');
