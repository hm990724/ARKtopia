const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {ENDING_ART,findEndingArt}=require('../src/lib/ending-art.ts');
const {incidentArtFiles,findIncidentArt}=require('../src/lib/incident-art.ts');
const {incidentDefs,beginGame}=require('../src/lib/game-v10.ts');
const crewSource=fs.readFileSync(path.join(__dirname,'../src/components/CrewSystem.tsx'),'utf8');
const wolfScene=fs.readFileSync(path.join(__dirname,'../public/assets/cinematics/staff-terminations/wolf/scene.webp'));
assert.equal(wolfScene.subarray(0,4).toString(),'RIFF');assert.equal(wolfScene.subarray(8,12).toString(),'WEBP');assert.ok(wolfScene.length>150000);
assert.match(crewSource,/\/assets\/cinematics\/staff-terminations\/\$\{id\}\/scene\.webp/);assert.doesNotMatch(crewSource,/wolf\/scene_v\d+/);
const origin=require('../src/lib/origin-zero.ts');
const {emptyOriginZero}=origin;
const base=path.join(__dirname,'../public');
assert.equal(ENDING_ART.length,19,'all known ending prefixes must have an ending scene');
assert.equal(new Set(ENDING_ART.map(x=>x.file)).size,ENDING_ART.length,'each ending route must resolve to its own asset URL');
for(const ending of ENDING_ART){
 const art=findEndingArt(`${ending.prefix} — test outcome`);assert.equal(art.file,ending.file);
 const file=path.join(base,'assets/endings',art.file),svg=fs.readFileSync(file,'utf8');
 assert.match(svg,/^<svg xmlns=/,file);
 assert.match(svg,/href="data:image\/(webp|png);base64,/,file);
 assert.ok(svg.includes(fs.readFileSync(path.join(base,'assets/characters','eve_hologram.webp')).toString('base64'))||svg.includes(fs.readFileSync(path.join(base,'assets/characters','protagonist_neutral_v74_768.png')).toString('base64')),file);
 assert.doesNotMatch(svg,/href="\/assets\//,file);
 assert.doesNotMatch(svg.replace(/data:image\/(?:webp|png);base64,[^\"]+/g,''),/mutant|rabbit|fox|wolf|deer|cat/i,file);
}
const ids=Object.keys(incidentDefs);assert.equal(ids.length,13);
assert.equal(incidentArtFiles.length,6,'incident set should use its six distinct scene illustrations');
for(const id of ids){const file=findIncidentArt(id),png=fs.readFileSync(path.join(base,'assets/events',file));assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id);assert.ok(png.readUInt32BE(16)>=1200&&png.readUInt32BE(20)>=800,id);}
const suspect=fs.readFileSync(path.join(base,'assets/events','m00_suspected_origin_v75.png'));assert.equal(suspect.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.ok(suspect.readUInt32BE(16)>=1200&&suspect.readUInt32BE(20)>=800);
assert.match(origin.catTrackFrames[0].hint,/시초 개체로 의심/);assert.doesNotMatch(origin.catTrackFrames[0].hint,/검은 고양이/);assert.match(origin.catTrackFrames[2].hint,/작은 검은 고양이/);
const route=beginGame('artist','generator');route.day=26;route.tutorialStep=9;route.encounters=5;route.ap=4;route.headquarters.revealStage=2;route.originZero=emptyOriginZero();
assert.equal(origin.canTrackCat(route),true);let traced=origin.initiateOriginTrack(route);assert.match(traced.lastOutcome,/시초일 가능성을 제기/);
for(const frame of origin.catTrackFrames)traced=origin.pickOriginTrace(traced,frame.answer);
assert.equal(traced.originZero.cat,'captured');assert.match(traced.lastOutcome,/별개의 개체가 아니었다/);assert.match(traced.lastOutcome,/작은 검은 고양이/);
traced=origin.analyzeOriginCat(traced);assert.match(traced.lastOutcome,/인류 붕괴의 원인이라는 판정도 아니다/);
 console.log('PASS all ending routes, incident art, and the dangerous-silhouette-to-ordinary-cat M-00 reveal');
