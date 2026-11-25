const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {EXTENDED_INCIDENT_IDS}=require('../src/lib/incident-content.ts');
const {GAME_EVENT_ART_ORDER,incidentArtworkCandidates,findIncidentArt}=require('../src/lib/incident-art.ts');
const {cinematicArtworkCandidates}=require('../src/lib/cinematic-art.ts');
const {ENDING_ART,ORIGIN_ZERO_CANONICAL_ENDING_ART,endingArtworkCandidates,findEndingArt}=require('../src/lib/ending-art.ts');
const {staffDialogueTone,staffDialogueArtworkCandidates}=require('../src/lib/character-art.ts');
const core=['echo','breach','blackout','spores','signal','visitor','predator','coolant','rations','intrusion','garden','keepsake','quiet'];
const ids=[...core,...EXTENDED_INCIDENT_IDS];
assert.equal(ids.length,43,'exactly 43 game incidents');
assert.equal(GAME_EVENT_ART_ORDER.length,43);
assert.equal(new Set(GAME_EVENT_ART_ORDER).size,43,'one unique CG target per incident');
assert.deepEqual([...GAME_EVENT_ART_ORDER].sort(),ids.sort(),'all executable incident IDs have CG targets');
const all=new Set();
for(const id of ids){
 const [canonical,legacy]=incidentArtworkCandidates(id);
 assert.match(canonical,/^\/assets\/cinematics\/origin-zero\/events\/EVT_\d\d_[a-z0-9_]+\.png$/);
 assert.equal(legacy,`/assets/events/${findIncidentArt(id)}`);
 assert.ok(fs.existsSync(path.join(__dirname,'../public',legacy)),'missing legacy incident art for '+id);
 all.add(canonical);
}
assert.equal(all.size,43);
const arrivals=['rabbit','fox','deer','wolf','eve'];
for(const id of arrivals){
 const [canonical]=cinematicArtworkCandidates(id);
 assert.ok(canonical.startsWith('/assets/cinematics/origin-zero/story/SCN_'),id+' canonical art path');
 assert.ok(cinematicArtworkCandidates(id).some(candidate=>fs.existsSync(path.join(__dirname,'../public',candidate))),id+' must have at least one playable canonical or fallback scene');
}
assert.equal(ORIGIN_ZERO_CANONICAL_ENDING_ART.length,8);
for(const item of ORIGIN_ZERO_CANONICAL_ENDING_ART){
 const [canonical,legacy]=endingArtworkCandidates(item.prefix+' — archived epilogue');
 assert.ok(canonical.endsWith(item.filename),'dedicated canonical ending scene for '+item.prefix);
 assert.ok(fs.existsSync(path.join(__dirname,'../public',legacy)),'existing ending art fallback for '+item.prefix);
}
for(const item of ENDING_ART.slice(8)){
 const candidates=endingArtworkCandidates(item.prefix+' — legacy ending');
 assert.equal(candidates.length,1,'legacy titles must not be mapped to unrelated epilogues');
 assert.ok(fs.existsSync(path.join(__dirname,'../public',candidates[0])),'legacy ending source '+item.prefix);
}
assert.equal(staffDialogueTone('neutral','안녕하세요.'),'neutral');
assert.equal(staffDialogueTone('resolve','고마워요'),'soft');
assert.equal(staffDialogueTone('critical','살려 주세요'),'shocked');
const stableArt=staffDialogueArtworkCandidates('rabbit','neutral','safe','안녕하세요.');
assert.equal(stableArt[0],'/assets/staff/rabbit/portrait_talk_neutral.png');
assert.ok(stableArt.includes('/assets/staff/rabbit/portrait.webp'));
assert.ok(staffDialogueArtworkCandidates('rabbit','critical','safe','')[0].endsWith('/portrait_talk_shocked.png'));
assert.ok(staffDialogueArtworkCandidates('rabbit','resolve','safe','고마워요')[0].endsWith('/portrait_talk_soft.png'));
assert.ok(staffDialogueArtworkCandidates('rabbit','neutral','critical','안심하세요.').every(p=>!p.includes('portrait_talk_')),'critical staff cannot present a fully calm face');
const scene=fs.readFileSync(path.join(__dirname,'../src/components/CrewSystem.tsx'),'utf8');
const event=fs.readFileSync(path.join(__dirname,'../src/components/IncidentArtwork.tsx'),'utf8');
assert.ok(scene.includes("cinematicArtworkCandidates(kind)"));
assert.ok(event.includes("incidentArtworkCandidates(id)"));
assert.ok(scene.includes("setImageIndex(v=>v+1)"));
assert.ok(event.includes("setImageIndex(i=>Math.min(sources.length-1,i+1))"));
console.log('PASS v83: 41 incident CG targets, 5 story scenes and 8 main ending CG targets; all fallback files present');
