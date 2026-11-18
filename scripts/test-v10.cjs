const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
function load(f, deps={}){const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const mod={exports:{}};vm.runInNewContext(code,{exports:mod.exports,module:mod,require(name){if(deps[name])return deps[name];throw Error('Missing '+name)},structuredClone,Math,console,Number,Set,Array,Object,JSON});return mod.exports}
const sim=load(path.join(__dirname,'../src/lib/sim.ts'));const g=load(path.join(__dirname,'../src/lib/game-v10.ts'),{'./sim':sim});let dayTotal=0,daysMin=100,daysMax=0;let deaths=0,events=0,animals=0,finales=0,manual=0,stalls=0,runCount=0;
for(let i=0;i<600;i++){
 let s=g.beginGame(sim.origins[i%4].id,sim.starts[Math.floor(i/4)%4].id);
 for(let day=0;day<42&&s.phase==='day';day++){
  if(s.pendingIncident){events++;const options=[0,1,2];let ns=s;for(const opt of options){ns=g.resolveIncident(s,opt);if(ns!==s)break}if(ns===s)throw Error('Event cannot be cleared');s=ns}
  if(s.infection>38&&s.filters>0&&s.ap>0)s=g.doBase(s,'decontam');
  if(s.hp<68&&s.ap>0)s=g.doBase(s,'rest');
  if(s.power<20){let ns=g.doBase(s,'crank');if(ns!==s){s=ns;manual++}}
  if(s.ap>=2&&day%3===0){const region=g.regions.filter(r=>r.unlocked<=s.day)[Math.min(Math.floor(day/13),g.regions.length-1)];let ns=g.startRun(s,region.id,['flashlight','filter']);if(ns===s)ns=g.startRun(s,'garden',['flashlight']);if(ns!==s){runCount++;s=ns;for(let j=0;j<4&&s.run;j++)s=g.runStep(s,j%2===0?'careful':'gear',Math.random());if(s.pending){s=g.rescueChoice(s,'secure',.2);animals+=s.animals.length}if(s.run)s=g.runStep(s,'retreat',.5)}}
  if(s.phase==='day'&&!s.pending&&!s.run){let n=g.finishDay(s,'rest');if(n===s){let attempt=g.doBase(s,'crank');if(attempt===s){stalls++;break;}s=attempt;n=g.finishDay(s,'rest')}if(n!==s)s=n}
  if(!Number.isFinite(s.hp)||!Number.isFinite(s.power)||!Number.isFinite(s.infection))throw Error('Invalid state');if(s.pending&&s.run)throw Error('Run and rescue overlap');
 }
 if(s.phase==='finale'){s=sim.finish(s,['rebuild','freedom','preserve'][i%3]);finales++}if(s.phase==='ending')deaths++;dayTotal+=s.day;daysMin=Math.min(daysMin,s.day);daysMax=Math.max(daysMax,s.day);
 const loaded=g.loadGame(JSON.parse(JSON.stringify(s)));if(!loaded||loaded.day!==s.day)throw Error('save failure');
}
console.log(JSON.stringify({runs:600,finished:deaths,meanDays:dayTotal/600,minDay:daysMin,maxDay:daysMax,finales,events,animalEntries:animals,manualPowerUses:manual,expeditions:runCount,stalls},null,2));
