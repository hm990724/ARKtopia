const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');

const limit=100*1024*1024;
function scanWorkingTree(){
  const ignoredDirectories=new Set(['.git','node_modules','.next','.next-qa','out','tmp','coverage','test-results','playwright-report']);
  const files=[];
  function visit(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      if(entry.isDirectory()&&ignoredDirectories.has(entry.name))continue;
      const absolute=path.join(directory,entry.name);
      if(entry.isDirectory())visit(absolute);
      else if(entry.isFile())files.push(absolute);
    }
  }
  visit(process.cwd());
  const oversized=files.map(file=>({file:path.relative(process.cwd(),file),size:fs.statSync(file).size})).filter(item=>item.size>=limit);
  if(oversized.length){
    console.error('Files at or above GitHub’s 100 MiB per-file limit:');
    for(const item of oversized)console.error(`- ${item.file}: ${(item.size/1024/1024).toFixed(1)} MiB`);
    process.exitCode=1;
  }else{
    console.log(`PASS: checked ${files.length} working-tree files; none reach GitHub’s 100 MiB single-file limit.`);
  }
  console.log('Git index/history check unavailable: this sandbox blocks Node child-process launches.');
}

let records;
try{records=execFileSync('git',['ls-files','-s','-z'],{encoding:'buffer'})}
catch(error){
  if(error.code==='EPERM'||error.code==='EACCES'){scanWorkingTree();process.exit();}
  throw error;
}
records=records
  .toString('utf8').split('\0').filter(Boolean);
const staged=records.map(record=>{
  const tab=record.indexOf('\t');
  if(tab<0)return null;
  const [mode,oid,stage]=record.slice(0,tab).split(' ');
  return {file:record.slice(tab+1),oid,stage:Number(stage),mode};
}).filter(Boolean);
const blobRecords=staged.filter(item=>item.mode==='100644'||item.mode==='100755');
const blobSizes=blobRecords.length
  ?execFileSync('git',['cat-file','--batch-check=%(objectsize)'],{input:blobRecords.map(item=>item.oid).join('\n')+'\n',encoding:'utf8'})
    .trim().split(/\r?\n/).map(Number)
  :[];
const sizes=new Map();
blobRecords.forEach((item,index)=>{
  const prior=sizes.get(item.file)||0;
  sizes.set(item.file,Math.max(prior,blobSizes[index]||0));
});
for(const item of staged){
  try{const stat=fs.statSync(path.resolve(item.file));sizes.set(item.file,Math.max(sizes.get(item.file)||0,stat.size));}
  catch{/* A missing working file can still be present in the Git index. */}
}
const untracked=execFileSync('git',['ls-files','--others','--exclude-standard','-z'],{encoding:'buffer'})
  .toString('utf8').split('\0').filter(Boolean);
for(const file of untracked){
  try{sizes.set(file,Math.max(sizes.get(file)||0,fs.statSync(path.resolve(file)).size));}
  catch{/* Ignore files removed during the check. */}
}
const oversized=[...sizes].filter(([,size])=>size>=limit).map(([file,size])=>({file,size}));
if(oversized.length){
  console.error('GitHub cannot accept individual files at or above 100 MiB:');
  for(const item of oversized)console.error(`- ${item.file}: ${(item.size/1024/1024).toFixed(1)} MiB`);
  console.error('Generated ZIPs are ignored. If one is already staged, run: git rm --cached -- <archive>');
  console.error('Then commit the source files only. Use Git LFS only for individual large assets that must be versioned.');
  process.exitCode=1;
}else{
  console.log(`PASS: checked ${sizes.size} indexed and untracked source files; none reach GitHub’s 100 MiB single-file limit.`);
}
