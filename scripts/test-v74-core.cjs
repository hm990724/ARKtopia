const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const g=require('../src/lib/game-v10.ts');
const origin=require('../src/lib/origin-zero.ts');
assert.match(origin.photoRecords[3].detail,/연쇄적으로 붕괴하고 감염 인자가 유출/);
assert.match(origin.photoRecords[4].detail,/M-00은 이미 무너진 시설/);
assert.match(origin.photoRecords[4].detail,/탈출이 유출을 일으킨 것은 아니다/);
console.log('PASS canon: forced disposal causes facility collapse and leak; M-00 escapes separately');
let s=g.beginGame('medic','generator');s.day=6;s.tutorialStep=9;
for(const [gear,key] of [['filter','filters'],['flashlight','flashlight'],['medkit','medicine'],['cage','parts']]){const z={...s,[key]:0};assert.ok(g.gearUnavailable(z,gear,'garden'));assert.equal(g.startRun(z,'garden',[gear]),z);}
console.log('PASS empty equipment rejected without resource changes');
const n=g.startRun(s,'garden',['flashlight']);assert.equal(n.ap,s.ap-1);assert.equal(n.flashlight,s.flashlight-10);assert.equal(n.lastExpeditionDay,6);
const back={...n,run:null,field:null,capture:null};assert.equal(g.startRun(back,'rail',[]),back);assert.ok(g.expeditionBlockReason(back,'rail',[]).includes('오늘 탐사'));
const restored=g.loadGame(JSON.parse(JSON.stringify(back)));assert.equal(g.startRun(restored,'garden',[]),restored);
const next={...back,day:7};assert.notEqual(g.startRun(next,'garden',[]),next);
console.log('PASS one daily sortie, AP1, saved limit and next-day reset');
assert.equal(g.startRun({...s,power:0},'garden',[]).lastExpeditionDay,undefined);
console.log('PASS refused launch never consumes daily sortie');

