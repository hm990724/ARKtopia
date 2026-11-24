const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const game=require('../src/lib/game-v10.ts');
const dispatch=require('../src/lib/facility-power.ts');
const all={cctv:true,containment:true,infirmary:true,synthesis:true};
function prepared(){const s=game.beginGame('engineer','generator');s.day=2;s.tutorialStep=9;s.ap=0;s.power=27;s.facilities={...all};s.pendingIncident=null;s.pending=null;s.run=null;return s;}
let s=prepared();
assert.deepEqual(s.facilityPowerPriority,['cctv','containment','infirmary','synthesis']);
const preview=game.previewNight(s,'shield');assert.equal(preview.powerAfter,3);assert.deepEqual(preview.facilityDispatch.powered,['cctv']);assert.deepEqual(preview.facilityDispatch.shed,['containment','infirmary','synthesis']);
let next=game.finishDay(s,'shield');assert.equal(next.day,3);assert.equal(next.power,0);assert.deepEqual(next.facilityPowerState.powered,['cctv']);assert.deepEqual(next.facilityPowerState.shed,['containment','infirmary','synthesis']);
assert.ok(next.eventHistory.some(e=>e.includes('야간 배전 차단')));
let reordered=dispatch.setFacilityPowerPriority(s,'infirmary',-1);assert.deepEqual(reordered.facilityPowerPriority,['cctv','infirmary','containment','synthesis']);
reordered=dispatch.setFacilityPowerPriority(reordered,'infirmary',-1);assert.deepEqual(reordered.facilityPowerPriority,['infirmary','cctv','containment','synthesis']);
const alternate=game.finishDay(reordered,'shield');assert.deepEqual(alternate.facilityPowerState.powered,['infirmary']);assert.ok(alternate.animals.every(a=>!a.alive||a.sickness>=0));
assert.equal(dispatch.setFacilityPowerPriority(s,'cctv',-1),s,'top priority cannot move above first');
const loaded=game.loadGame(JSON.parse(JSON.stringify(reordered)));assert.deepEqual(loaded.facilityPowerPriority,reordered.facilityPowerPriority);assert.deepEqual(loaded.facilityPowerState,reordered.facilityPowerState);
const old={...prepared()};delete old.facilityPowerPriority;delete old.facilityPowerState;const migrated=game.loadGame(JSON.parse(JSON.stringify(old)));assert.deepEqual(migrated.facilityPowerPriority,dispatch.FACILITY_POWER_ORDER);assert.equal(migrated.facilityPowerState,undefined);
console.log('PASS night dispatch spends remaining power by saved priority, sheds lower systems and persists legacy-safe ordering');
