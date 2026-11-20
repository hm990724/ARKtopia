/** v70 source-asset manifest integrity. Unlike HTTP checks, works offline before build. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../public/assets');
const checks=[];
const add=(relative)=>checks.push(relative);
for(const species of ['rabbit','fox','deer','owl','wolf','crow','otter'])for(const state of ['uncanny','mutant'])add(`animals/${species}_${state}.png`);
add('animals/unavailable-specimen.svg');
for(const id of ['hero-gate','gate','sanctuary','laboratory','wasteland','hidden-photo','dawn'])add(`backgrounds/${id}.webp`);
for(const id of ['eve_hologram','protagonist_neutral'])add(`characters/${id}.webp`);
for(const id of ['rabbit','fox','deer','wolf']){
 for(const state of ['','_unstable','_critical'])add(`staff/${id}/portrait${state}.webp`);
 for(const action of ['staff-arrivals','staff-terminations'])add(`cinematics/${action}/${id}/scene.webp`);
}
add('cinematics/eve-first-meeting/scene.webp');
for(const id of ['ending_incomplete_revival','ending_subject_000','ending_two_caretakers','ending_open_spring','ending_last_signal','ending_silent_automation','ending_scattered_names','ending_new_consciousness'])add(`endings/${id}.webp`);
let failures=[];
for(const rel of checks){const filepath=path.join(root,rel);if(!fs.existsSync(filepath)){failures.push(`MISSING ${rel}`);continue;}
 const buf=fs.readFileSync(filepath);const png=buf.subarray(0,8).toString('hex')==='89504e470d0a1a0a';
 const webp=buf.subarray(0,4).toString()==='RIFF'&&buf.subarray(8,12).toString()==='WEBP';
 const svg=buf.toString('utf8',0,200).includes('<svg');
 const good=rel.endsWith('.png')?png:rel.endsWith('.webp')?webp:svg;
 if(!good)failures.push(`INVALID FORMAT ${rel}`);
}
console.log(`v70 required art: ${checks.length-failures.length}/${checks.length} present and headers valid`);
for(const e of failures)console.error(e);
if(failures.length)process.exitCode=1;
