// Identify the actual source of a large Windows project directory without modifying it.
// Usage: npm run size:report
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const failures=[];
function sizeOf(full){
 let st;
 try{st=fs.lstatSync(full);}catch(err){failures.push(full+': '+err.code);return 0;}
 if(st.isSymbolicLink())return 0;
 if(!st.isDirectory())return st.size;
 let bytes=0,entries;
 try{entries=fs.readdirSync(full,{withFileTypes:true});}catch(err){failures.push(full+': '+err.code);return 0;}
 for(const entry of entries){bytes+=sizeOf(path.join(full,entry.name));}
 return bytes;
}
const names=fs.readdirSync(root,{withFileTypes:true}).map(entry=>({
 name:entry.name,
 directory:entry.isDirectory(),
 bytes:sizeOf(path.join(root,entry.name))
}));
names.sort((a,b)=>b.bytes-a.bytes);
function fmt(n){return n>=1024**3?(n/1024**3).toFixed(2)+' GiB':(n/1024**2).toFixed(1)+' MiB';}
console.log('ARKtopia disk usage (local actual bytes, not the GitHub repository size)');
console.log('Root: '+root);
for(const x of names.slice(0,40))console.log(fmt(x.bytes).padStart(12)+'  '+(x.directory?'[DIR]  ':'[FILE] ')+x.name);
console.log('TOTAL: '+fmt(names.reduce((n,x)=>n+x.bytes,0)));
if(failures.length)console.log('Unreadable entries ('+failures.length+'):',failures.slice(0,10));
console.log('Safe generated-data cleanup: npm run clean:generated');
console.log('Optional dependency cleanup: npm run clean:generated -- --include-deps');
console.log('Optional project ZIP cleanup: npm run clean:generated -- --include-bundles');
