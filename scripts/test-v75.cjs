const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {ENDING_ART,findEndingArt}=require('../src/lib/ending-art.ts');
const {incidentArtFiles,findIncidentArt}=require('../src/lib/incident-art.ts');
const {incidentDefs}=require('../src/lib/game-v10.ts');
const base=path.join(__dirname,'../public');
assert.equal(ENDING_ART.length,19,'all known ending prefixes must have a dedicated cinematic');
assert.equal(new Set(ENDING_ART.map(x=>x.file)).size,ENDING_ART.length,'ending art must not be reused');
for(const ending of ENDING_ART){
 const art=findEndingArt(`${ending.prefix} — test outcome`);assert.equal(art.file,ending.file);
 const file=path.join(base,'assets/endings',art.file),png=fs.readFileSync(file);
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file);
 assert.ok(png.readUInt32BE(16)>=1200&&png.readUInt32BE(20)>=800,file);
}
const ids=Object.keys(incidentDefs);assert.equal(ids.length,13);
assert.equal(incidentArtFiles.length,6,'incident set should use its six distinct scene illustrations');
for(const id of ids){const file=findIncidentArt(id),png=fs.readFileSync(path.join(base,'assets/events',file));assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id);assert.ok(png.readUInt32BE(16)>=1200&&png.readUInt32BE(20)>=800,id);}
console.log('PASS 19 distinct ending illustrations and all 13 incidents resolve to six contextual scene assets');
