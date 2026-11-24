const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {EXTENDED_INCIDENT_IDS}=require('../src/lib/incident-content.ts');
const {GAME_EVENT_ART_ORDER,incidentArtworkCandidates,findIncidentArt}=require('../src/lib/incident-art.ts');
const {cinematicArtworkCandidates}=require('../src/lib/cinematic-art.ts');
const core=['echo','breach','blackout','spores','signal','visitor','predator','coolant','rations','intrusion','garden','keepsake','quiet'];
const ids=[...core,...EXTENDED_INCIDENT_IDS];
assert.equal(ids.length,41,'exactly 41 game incidents');
assert.equal(GAME_EVENT_ART_ORDER.length,41);
assert.equal(new Set(GAME_EVENT_ART_ORDER).size,41,'one unique CG target per incident');
assert.deepEqual([...GAME_EVENT_ART_ORDER].sort(),ids.sort(),'all executable incident IDs have CG targets');
const all=new Set();
for(const id of ids){
 const [canonical,legacy]=incidentArtworkCandidates(id);
 assert.match(canonical,/^\/assets\/cinematics\/origin-zero\/events\/EVT_\d\d_[a-z_]+\.png$/);
 assert.equal(legacy,`/assets/events/${findIncidentArt(id)}`);
 assert.ok(fs.existsSync(path.join(__dirname,'../public',legacy)),'missing legacy incident art for '+id);
 all.add(canonical);
}
assert.equal(all.size,41);
const arrivals=['rabbit','fox','deer','wolf','eve'];
for(const id of arrivals){
 const [canonical,legacy]=cinematicArtworkCandidates(id);
 assert.ok(canonical.startsWith('/assets/cinematics/origin-zero/story/SCN_'),id+' canonical art path');
 assert.ok(fs.existsSync(path.join(__dirname,'../public',legacy)),id+' legacy cinematic must be playable');
}
const scene=fs.readFileSync(path.join(__dirname,'../src/components/CrewSystem.tsx'),'utf8');
const event=fs.readFileSync(path.join(__dirname,'../src/components/IncidentArtwork.tsx'),'utf8');
assert.ok(scene.includes("cinematicArtworkCandidates(kind)"));
assert.ok(event.includes("incidentArtworkCandidates(id)"));
assert.ok(scene.includes("setImageIndex(v=>v+1)"));
assert.ok(event.includes("setImageIndex(i=>Math.min(sources.length-1,i+1))"));
console.log('PASS v83: 41 unique future event CG targets and 5 canonical story scenes; all runtime fallback files are present');
