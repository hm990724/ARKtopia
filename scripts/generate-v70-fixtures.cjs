/** Deterministic, disposable UI test saves. Never overwrites a player's real save. */
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(mod,file)=>{mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file)};
const {beginGame}=require('../src/lib/game-v10.ts');
const s=beginGame('artist','generator');
Object.assign(s,{day:3,ap:0,power:17,facility:76,tutorialStep:7,pendingIncident:null,run:null,phase:'day',onboardingSeen:['low-power','ap-empty','base-work','escape','mutation','cctv']});
const out=path.join(__dirname,'../tests/fixtures/day003-ap0.json');
fs.writeFileSync(out,JSON.stringify(s,null,2)+'\n');
console.log('Wrote safe test-only save',out);
