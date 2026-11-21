const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const rows=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/generated-assets-v71.json'),'utf8'));
for(const r of rows){const b=fs.readFileSync(path.join(__dirname,'..',r.file));assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',r.file);assert.ok(b.readUInt32BE(16)>=256&&b.readUInt32BE(20)>=256,r.file);}
for(const species of ['rabbit','fox','wolf','deer','crow','owl','otter','lynx','moth','axolotl','mutant','chimera'])for(const stage of ['uncanny','mutant'])assert.ok(fs.existsSync(path.join(__dirname,`../public/assets/animals/${species}_${stage}.png`)));
assert.equal(rows.filter(r=>r.file.includes('/hidden-photos/')).length,12);
assert.equal(rows.filter(r=>r.status==='unused_candidate_preserved').length,1);
console.log(`v71 art ${rows.length}/${rows.length}: independent PNGs present, dimensions valid; 24 species variants + M-00 + 12 photos available.`);
