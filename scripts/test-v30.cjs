// Run with: node scripts/test-v30.cjs (requires the project's devDependency: typescript)
const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (mod, file) => {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  mod._compile(code, file);
};
const game = require('../src/lib/game-v10.ts');
function init() { return game.beginGame('artist', 'medical'); }
const initial = init();
const run = game.startRun(initial,'garden',['flashlight','filter','scanner','medkit','cage']);
assert.notEqual(run, initial);
assert.equal(run.medicine, initial.medicine - 1);
assert.equal(run.parts, initial.parts - 1);
assert.equal(run.filters, initial.filters - 1);
assert.equal(run.power, initial.power - 17);
assert.equal(game.useFieldMedkit({...run,hp:100}).hp,100);
const healState = {...run,hp:55};
const healed = game.useFieldMedkit(healState);
assert.equal(healed.hp,75);
assert.equal(healed.run.medkitUsed,true);
assert.equal(game.useFieldMedkit(healed),healed);
const abandoned = game.runStep(run,'retreat');
assert.equal(abandoned.medicine,initial.medicine);
assert.equal(abandoned.parts,initial.parts);
assert.equal(game.runStep(healed,'retreat').medicine,initial.medicine-1);
let encounter = game.startRun(initial,'garden',['cage']);
for(let i=0;i<3;i++)encounter = game.runStep(encounter,'careful',0.99,100);
assert.ok(encounter.pending);
assert.equal(encounter.pendingCage,true);
assert.equal(game.captureChance(encounter)-game.captureChance({...encounter,pendingCage:false}),15);
const released = game.rescueChoice(encounter,'release');
assert.equal(released.pendingCage,false);
assert.equal(released.parts,encounter.parts+1);
const captured = game.rescueChoice(encounter,'secure',0);
assert.equal(captured.animals.filter(a=>a.alive).length,1);
assert.equal(captured.parts,encounter.parts);
const blackout = {...initial,power:0};
assert.notEqual(game.startRun(blackout,'garden',['flashlight']),blackout);
assert.equal(game.startRun(blackout,'garden',['flashlight','scanner']),blackout);
const unarmed = game.startRun(initial,'garden',[]);
unarmed.power=0;
assert.equal(game.canUseRunGear(unarmed),false);
assert.equal(game.runStep(unarmed,'gear'),unarmed);
console.log('ECHO WARD v30 gear and capture tests: PASS');
