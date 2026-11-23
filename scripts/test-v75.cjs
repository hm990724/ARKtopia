const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {ENDING_ART,LEGACY_ENDING_ART,findEndingArt}=require('../src/lib/ending-art.ts');
const {incidentArtFiles,findIncidentArt}=require('../src/lib/incident-art.ts');
const {incidentDefs,beginGame,previewIncident}=require('../src/lib/game-v10.ts');
const {EXTENDED_INCIDENT_IDS,extendedIncidentWeight}=require('../src/lib/incident-content.ts');
const {makeAnimal}=require('../src/lib/sim.ts');
const {recruitCrew}=require('../src/lib/crew.ts');
const crewSource=fs.readFileSync(path.join(__dirname,'../src/components/CrewSystem.tsx'),'utf8');
const wolfScene=fs.readFileSync(path.join(__dirname,'../public/assets/cinematics/staff-terminations/wolf/scene.webp'));
assert.equal(wolfScene.subarray(0,4).toString(),'RIFF');assert.equal(wolfScene.subarray(8,12).toString(),'WEBP');assert.ok(wolfScene.length>150000);
assert.match(crewSource,/\/assets\/cinematics\/staff-terminations\/\$\{id\}\/scene\.webp/);assert.doesNotMatch(crewSource,/wolf\/scene_v\d+/);
const origin=require('../src/lib/origin-zero.ts');
const {emptyOriginZero}=origin;
const base=path.join(__dirname,'../public');
const m00Sprite=fs.readFileSync(path.join(base,'assets/animals/m00_normal.png'));
assert.equal(m00Sprite.subarray(0,8).toString('hex'),'89504e470d0a1a0a','canonical M-00 asset is a real PNG');
assert.equal(m00Sprite.readUInt32BE(16),1254);assert.equal(m00Sprite.readUInt32BE(20),1254);
assert.equal(m00Sprite[25],6,'M-00 sprite has transparent RGBA');
assert.match(fs.readFileSync(path.join(__dirname,'../src/lib/animal-art.ts'),'utf8'),/m00_normal\.png/);
assert.ok(fs.existsSync(path.join(base,'assets/archive/m00_normal_pre_pixel.png')),'replaced M-00 art is archived instead of deleted');
const preservedOriginalFiles=['ending_incomplete_revival.webp','ending_new_consciousness.webp','ending_two_caretakers.webp','ending_open_spring.webp','ending_subject_000.webp','ending_silent_automation.webp','ending_scattered_names.webp','ending_last_signal.webp'];
const expectedEndingFiles=['ending_eternal_experiment_v77.svg','ending_eden_v77.svg','ending_seed_ark_v77.svg','ending_last_zoo_v77.svg','ending_subject_000_v77.svg','ending_silent_automation_v77.svg','ending_scattered_names_v77.svg','ending_last_signal_v77.svg','ending_successor_v77.svg','ending_humane_restoration_v77.svg','ending_spring_outside_records_v77.svg','ending_late_gate_v77.svg','ending_empty_shiftroom_v77.svg','ending_first_sentence_v77.svg','ending_incomplete_revival_v77.svg','ending_spring_beyond_cage_v77.svg','ending_two_caretakers_v77.svg','ending_quiet_automation_v77.svg','ending_final_transmission_v77.svg'];
assert.equal(ENDING_ART.length,19,'all nineteen ending scenes remain separately addressable');
assert.deepEqual(ENDING_ART.map(x=>x.file),expectedEndingFiles,'each ending keeps its own existing scene asset');
assert.equal(new Set(ENDING_ART.map(x=>x.file)).size,19,'all ending routes use distinct scene assets');
const endingFiles=fs.readdirSync(path.join(base,'assets/endings'));
for(const file of [...expectedEndingFiles,...preservedOriginalFiles])assert.ok(endingFiles.includes(file),`ending artwork remains available: ${file}`);
const preservedRouteCards=endingFiles.filter(file=>/^ending_[a-z0-9_]+_v77\.svg$/.test(file));
assert.equal(preservedRouteCards.length,19,'all nineteen prior route-specific ending compositions remain preserved');
for(const file of preservedRouteCards)assert.ok(fs.statSync(path.join(base,'assets/endings',file)).size>100000,`${file}: preserved ending composition is intact`);
for(const ending of ENDING_ART){
 const art=findEndingArt(`${ending.prefix} — test outcome`);assert.equal(art.file,ending.file);
 const file=path.join(base,'assets/endings',art.file);
 const svg=fs.readFileSync(file,'utf8');assert.match(svg,/^<svg\b/,file);assert.ok(svg.length>100000,`${file}: preserved route composition must remain intact`);
}
for(const file of preservedOriginalFiles){const webp=fs.readFileSync(path.join(base,'assets/endings',file));assert.equal(webp.subarray(0,4).toString(),'RIFF',file);assert.equal(webp.subarray(8,12).toString(),'WEBP',file);assert.ok(webp.length>250000,`${file}: original handoff artwork must remain intact`)}
for(const legacy of LEGACY_ENDING_ART){
 const canonical=ENDING_ART.find(item=>item.prefix===legacy.canonicalPrefix);assert.ok(canonical,`${legacy.prefix} must map to a canonical outcome`);
 assert.equal(findEndingArt(`${legacy.prefix} — legacy save` ).file,canonical.file,`${legacy.prefix} preserves saved ending compatibility`);
}
const ids=Object.keys(incidentDefs);assert.equal(ids.length,40,'13 core + 27 stateful incidents');
assert.equal(new Set(ids).size,ids.length,'incident IDs must remain unique');
assert.equal(EXTENDED_INCIDENT_IDS.length,27);
assert.equal(incidentArtFiles.length,6,'incident set should use its six distinct scene illustrations');
for(const id of ids){
 const event=incidentDefs[id];assert.ok(event.title&&event.desc&&event.cause,id);assert.equal(event.options.length,3,id);
 const file=findIncidentArt(id),png=fs.readFileSync(path.join(base,'assets/events',file));assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id);assert.ok(png.readUInt32BE(16)>=1200&&png.readUInt32BE(20)>=800,id);
}
// Every extended event must be gated by meaningful game state and resolve all three choices.
const eligible=beginGame('artist','generator');eligible.day=8;eligible.power=48;eligible.facility=50;eligible.infection=60;eligible.threat=70;eligible.clues=10;eligible.knowledge=50;
eligible.parts=30;eligible.scrap=30;eligible.food=2;eligible.medicine=20;eligible.filters=8;eligible.electricCells=8;eligible.facilities.cctv=true;eligible.facilities.containment=true;
eligible.baseLevels={relay:1};eligible.animals=[makeAnimal('rabbit',1)];Object.assign(eligible.animals[0],{stress:70,hp:60,sickness:20,memory:55,contamination:20});
eligible.headquarters.transferred=['rabbit'];eligible.headquarters.revealStage=2;eligible.encounters=2;eligible.originZero.cat='captured';eligible.security.escapedIds=['lynx'];
for(const id of ['rabbit','fox','wolf','deer'])recruitCrew(eligible,id,`${id}-fixture`);
eligible.crew.retired.push('rabbit');
for(const id of EXTENDED_INCIDENT_IDS){
 const {copy}=require('../src/lib/sim.ts');const before=copy(eligible);assert.ok(extendedIncidentWeight(before,id)>0,`${id} should have a reachable state gate`);
 for(let option=0;option<3;option++){
  const state=copy(before);state.pendingIncident=id;const after=require('../src/lib/game-v10.ts').resolveIncident(state,option);
  assert.notEqual(after,state,`${id} option ${option} resolves`);assert.equal(after.pendingIncident,null,`${id} option ${option} clears pending event`);
  assert.ok(after.eventHistory.length>before.eventHistory.length,`${id} option ${option} is recorded`);
 }
}
const stale=beginGame('artist','generator');const staleBefore=JSON.stringify(stale);assert.equal(require('../src/lib/game-v10.ts').resolveIncident(stale,0),stale,'a missing pending event must not resolve');assert.equal(JSON.stringify(stale),staleBefore,'a rejected event choice must not mutate the save');
const unaffordable=beginGame('artist','generator');unaffordable.pendingIncident='cctv_loop';unaffordable.facilities.cctv=true;unaffordable.parts=0;const unaffordableBefore=JSON.stringify(unaffordable);assert.equal(require('../src/lib/game-v10.ts').resolveIncident(unaffordable,0),unaffordable,'an unaffordable response must be rejected');assert.equal(JSON.stringify(unaffordable),unaffordableBefore,'an unaffordable response must not partially mutate the save');
const previewState=beginGame('artist','generator');previewState.pendingIncident='battery_swelling';const cellPreview=previewIncident(previewState,0);assert.ok(cellPreview.effects.some(x=>x.name==='전지'&&x.delta===-1),'new event cards must show battery costs');
const suspect=fs.readFileSync(path.join(base,'assets/events','m00_suspected_origin_v75.png'));assert.equal(suspect.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.ok(suspect.readUInt32BE(16)>=1200&&suspect.readUInt32BE(20)>=800);
assert.match(origin.catTrackFrames[0].hint,/시초 개체로 의심/);assert.doesNotMatch(origin.catTrackFrames[0].hint,/검은 고양이/);assert.match(origin.catTrackFrames[2].hint,/작은 검은 고양이/);
const route=beginGame('artist','generator');route.day=26;route.tutorialStep=9;route.encounters=5;route.ap=4;route.headquarters.revealStage=2;route.originZero=emptyOriginZero();
assert.equal(origin.canTrackCat(route),true);let traced=origin.initiateOriginTrack(route);assert.match(traced.lastOutcome,/시초일 가능성을 제기/);
for(const frame of origin.catTrackFrames)traced=origin.pickOriginTrace(traced,frame.answer);
assert.equal(traced.originZero.cat,'captured');assert.match(traced.lastOutcome,/별개의 개체가 아니었다/);assert.match(traced.lastOutcome,/작은 검은 고양이/);
traced=origin.analyzeOriginCat(traced);assert.match(traced.lastOutcome,/인류 붕괴의 원인이라는 판정도 아니다/);
 console.log('PASS all ending routes, incident art, and the dangerous-silhouette-to-ordinary-cat M-00 reveal');
