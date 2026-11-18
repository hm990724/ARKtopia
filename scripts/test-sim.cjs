const fs=require('fs');
const path=require('path');
const ts=require('typescript');
const vm=require('vm');
const source=fs.readFileSync(path.join(__dirname,'../src/lib/sim.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText;
const moduleObj={exports:{}};
vm.runInNewContext(compiled,{exports:moduleObj.exports,module:moduleObj,structuredClone,Math,console});
const sim=moduleObj.exports;
let successful=0;
for(let i=0;i<200;i++){
 let state=sim.createGame(sim.origins[i%4].id,sim.starts[Math.floor(i/4)%4].id);
 for(let day=0;day<37&&state.phase==='day';day++){
  if(day===2)state=sim.rescue(state,'rabbit','rescue',true);
  if(day===4)state=sim.rescue(state,'fox','rescue',true);
  if(state.animals[0]){state.food+=2;state=sim.dailyWork(state,'observe',state.animals[0].id);state=sim.extract(state,state.animals[0].id,80,'gentle')}
  state=sim.startNight(state);if(state.phase==='night')state=sim.night(state,{gate:true,evacuate:true,scan:false});
 }
 if(state.phase==='finale')state=sim.finish(state,['rebuild','freedom','preserve'][i%3]);
 if(state.phase==='ending')successful++;
 if(!Number.isFinite(state.hp))throw new Error('Invalid HP');
}
console.log(`${successful}/200 runs reached endings`);
if(successful!==200)process.exit(1);
