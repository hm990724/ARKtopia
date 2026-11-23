const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const game=require('../src/lib/game-v10.ts');
const sim=require('../src/lib/sim.ts');
const voice=require('../src/lib/voice-breach.ts');
const assert=require('node:assert/strict');

const weights={'정신력':.65,'EVE 코어':.55,'전력':.9,'시설':1.15,'감염':-1.25,'위협':-.95,'부품':.35,'고철':.45,'전지':.2,'필터':.3,'의약품':.4,'식량':.4,'크레딧':.002,'지식':.16,'단서':.2,'신뢰':.1,'개체 스트레스 합계':-.5,'개체 건강 합계':.5,'개체 유대 합계':.12,'직원 정신력 합계':.6};
function bestIncidentResponse(state){
 const choices=[0,1,2].map(option=>({option,preview:game.previewIncident(state,option)})).filter(x=>x.preview.available);
 if(!choices.length)throw new Error(`No affordable response to ${state.pendingIncident} on DAY ${state.day}`);
 choices.sort((a,b)=>b.preview.effects.reduce((n,e)=>n+e.delta*(weights[e.name]??0),0)-a.preview.effects.reduce((n,e)=>n+e.delta*(weights[e.name]??0),0));
 return choices[0].option;
}
function clearForcedBlockers(state){
 for(let guard=0;guard<12;guard++){
  const blocker=game.getDayEndBlocker(state);if(!blocker)return state;
  if(blocker.code==='incident')state=game.resolveIncident(state,bestIncidentResponse(state));
  else if(blocker.code==='voice'){
   for(const probe of ['eve','enclosure','personnel'])state=voice.inspectVoiceBreach(state,probe);
   state=voice.resolveVoiceBreach(state,'seal');
  }else throw new Error(`Unexpected blocker ${blocker.code}: ${blocker.message}`);
 }
 throw new Error(`Forced blockers did not clear on DAY ${state.day}`);
}
function runScenario(origin,seed){
 let randomSeed=seed>>>0;Math.random=()=>{randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/0x100000000;};
 let state=game.beginGame(origin,'generator');const log=[];
 for(let step=0;step<12;step++){
  state=clearForcedBlockers(state);
  // Spend a work point to keep the generator out of the failure band; restock repair parts from credits.
  if(state.power<68&&state.ap>0){if(state.parts<1&&state.credits>=125)state=sim.buy(state,'part');if(state.parts>0)state=sim.repair(state,'power');}
  state=clearForcedBlockers(state);
  const night=state.threat>=24&&state.power>=28?'shield':state.mind<74&&state.power>=11?'rest':state.threat>0&&state.power>=28?'shield':state.power>=11?'rest':'standby';
  const before=state;state=game.finishDay(state,night);
  if(state.day!==before.day+1)throw new Error(`${origin} DAY ${before.day}: selected ${night} but transition failed`);
  log.push({day:state.day,night,power:state.power,facility:state.facility,threat:state.threat,infection:state.infection,morale:state.mind,credits:state.credits,parts:state.parts,event:state.lastEvent});
 }
 return {origin,seed:seed>>>0,day:state.day,phase:state.phase,metrics:{power:state.power,facility:state.facility,threat:state.threat,infection:state.infection,morale:state.mind,credits:state.credits,parts:state.parts},days:log};
}

const scenarios=[];
for(const [index,origin] of ['medic','engineer','artist','warden'].entries())scenarios.push(runScenario(origin,0xA70F2026+index*0x10203));
for(const scenario of scenarios){
 assert.equal(scenario.day,13,`${scenario.origin} strategy must advance twelve days`);
 assert.equal(scenario.phase,'day',`${scenario.origin} strategy remains playable`);
 assert.ok(scenario.metrics.credits>=0,`${scenario.origin} credits cannot underflow`);
 assert.ok(scenario.metrics.power>=0&&scenario.metrics.facility>=0,`${scenario.origin} meters remain bounded`);
}
process.stdout.write(`${JSON.stringify(scenarios.map(({origin,seed,day,phase,metrics})=>({origin,seed,day,phase,metrics})),null,2)}\n`);
