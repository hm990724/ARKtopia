const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const assert=require('node:assert/strict');
const game=require('../src/lib/game-v10.ts');
const {doBase,purchase,finishDay,startRun,runStep,rescueChoice}=game;

function resolveBlockers(state){
 for(let guard=0;guard<16;guard++){
  const blocker=game.getDayEndBlocker(state);if(!blocker)return state;
  if(blocker.code==='incident'){
   const option=[0,1,2].find(index=>game.previewIncident(state,index).available);
   if(option===undefined)throw new Error(`Unresolved incident ${state.pendingIncident} at DAY ${state.day}`);
   state=game.resolveIncident(state,option);
  }else if(blocker.code==='voice'){
   const voice=require('../src/lib/voice-breach.ts');
   for(const probe of ['eve','enclosure','personnel'])state=voice.inspectVoiceBreach(state,probe);
   state=voice.resolveVoiceBreach(state,'seal');
  }else throw new Error(`Unexpected blocker ${blocker.code}: ${blocker.message}`);
 }
 throw new Error(`Blocker loop exceeded on DAY ${state.day}`);
}

function play(origin,seed){
 let randomSeed=seed>>>0;Math.random=()=>{randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/0x100000000};
 let state=game.beginGame(origin,'generator');
 state.tutorialStep=9;state.onboardingSeen=['first-sortie','field-map','cctv','night-shift','first-capture','base-work','mutation'];
 const log=[];let sorties=0,captures=0;
 for(let transition=0;transition<12;transition++){
  state=resolveBlockers(state);
  const shouldSortie=[4,8,12].includes(state.day);
  if(shouldSortie){
   if(state.parts<1&&state.credits>=115)state=purchase(state,'parts');
   if(state.flashlight<45){
    if(state.electricCells>0&&state.power>=12)state=doBase(state,'batteryCharge');
    else if(state.credits>=120)state=purchase(state,'battery');
    if(state.flashlight<25)throw new Error(`${origin}: no legal flashlight on sortie day ${state.day}`);
   }
   const gear=['flashlight','cage'];
   if(state.medicine>0)gear.push('medkit');
   const launched=startRun(state,'garden',gear);
   if(launched===state)throw new Error(`${origin}: sortie launch refused on DAY ${state.day}: ${game.expeditionBlockReason(state,'garden',gear)} (AP ${state.ap}, light ${state.flashlight}, parts ${state.parts}, power ${state.power})`);
   state=launched;sorties++;
   for(let stage=0;stage<3&&state.run;stage++)state=runStep(state,stage===0?'gear':'careful',Math.random(),75);
   if(state.pending){const beforeCount=state.animals.filter(animal=>animal.alive).length;const rescued=rescueChoice(state,'secure',Math.random());if(rescued===state)throw new Error(`${origin}: rescue choice refused on DAY ${state.day}`);state=rescued;if(state.animals.filter(animal=>animal.alive).length>beforeCount)captures++}
   if(state.run)throw new Error(`${origin}: expedition did not settle on DAY ${state.day}`);
  }
  if(state.animals.some(a=>a.alive)&&state.food<2&&state.credits>=90)state=purchase(state,'food');
  // Care for the current enclosure, then keep either the failing generator or damaged facility online.
  const vulnerable=state.animals.find(a=>a.alive&&(a.hunger>55||a.stress>55||a.hp<55));
  if(vulnerable&&state.ap>0&&state.food>0)state=doBase(state,'feed');
  if(state.infection>=40&&state.filters>0&&state.ap>0)state=doBase(state,'decontam');
  if(state.power<52&&state.parts>0&&state.ap>0)state=doBase(state,'recharge');
  else if(state.facility<52&&state.parts>0&&state.ap>0)state=doBase(state,'repair');
  state=resolveBlockers(state);
  const night=state.threat>=30&&state.power>=28?'shield':state.mind<72&&state.power>=11?'rest':state.power>=11?'rest':'standby';
  const before=state;state=finishDay(state,night);
  assert.equal(state.day,before.day+1,`${origin} day transition ${before.day}`);
  assert.ok(state.phase==='day'||state.phase==='finale',`${origin} remains in playable campaign`);
  log.push({day:state.day,night,sortie:shouldSortie?before.day:null,power:state.power,facility:state.facility,threat:state.threat,infection:state.infection,morale:state.mind,food:state.food,parts:state.parts,flashlight:state.flashlight,animals:state.animals.filter(a=>a.alive).length,event:state.lastEvent});
 }
 assert.equal(state.day,13,`${origin} reaches DAY 13`);
 assert.equal(sorties,3,`${origin} completes all planned sorties`);
 assert.ok(captures>=1,`${origin} secures at least one specimen`);
 assert.ok(state.animals.some(a=>a.alive),`${origin} preserves a living animal`);
 assert.ok(state.power>0&&state.facility>0,`${origin} avoids a total power/facility collapse`);
 assert.ok(state.infection<80,`${origin} avoids the critical infection band`);
 return {origin,seed:seed>>>0,day:state.day,phase:state.phase,sorties,captures,metrics:{power:state.power,facility:state.facility,threat:state.threat,infection:state.infection,morale:state.mind,food:state.food,parts:state.parts,flashlight:state.flashlight,animals:state.animals.filter(a=>a.alive).length},log};
}

const reports=['medic','engineer','artist','warden'].map((origin,index)=>play(origin,0xA82C1100+index*0x9081));
const output=reports.map(({origin,seed,day,phase,sorties,captures,metrics})=>({origin,seed,day,phase,sorties,captures,metrics}));
process.stdout.write(`${JSON.stringify(output,null,2)}\n`);
