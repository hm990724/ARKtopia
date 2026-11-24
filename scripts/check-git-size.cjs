const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');

const limit=100*1024*1024;
const files=execFileSync('git',['ls-files','-z'],{encoding:'buffer'})
  .toString('utf8').split('\0').filter(Boolean);
const oversized=files.flatMap(file=>{
  try{
    const size=fs.statSync(path.resolve(file)).size;
    return size>=limit?[{file,size}]:[];
  }catch{return [];}
});

if(oversized.length){
  console.error('Tracked files at or above GitHub’s 100 MiB single-file limit:');
  for(const item of oversized)console.error(`- ${item.file}: ${(item.size/1024/1024).toFixed(1)} MiB`);
  console.error('Remove generated bundles from the Git index, or use Git LFS for assets that must be versioned.');
  process.exitCode=1;
}else{
  console.log(`PASS: ${files.length} tracked files; none reach GitHub’s 100 MiB single-file limit.`);
}
