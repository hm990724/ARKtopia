// Generated-file cleanup only. Run from the repository root with: npm run clean:generated
// Optional: add --include-deps and/or --include-bundles to remove re-installable dependencies
// and the local project archive deliberately. Never touches src, public/assets, docs or .git.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const targets=['.next','.next-qa','test-results','playwright-report','tsconfig.tsbuildinfo','tmp/v68/npm-cache'];
if(process.argv.includes('--include-deps'))targets.push('node_modules');
if(process.argv.includes('--include-bundles'))targets.push('public.zip');
let deleted=0;
for(const rel of targets){
 const full=path.resolve(root,rel);
 if(!full.startsWith(root+path.sep))throw Error('Unsafe cleanup path: '+rel);
 if(!fs.existsSync(full)){console.log('SKIP',rel);continue;}
 const stats=fs.lstatSync(full);
 fs.rmSync(full,{recursive:stats.isDirectory(),force:true,maxRetries:3,retryDelay:150});
 console.log('REMOVED',rel);deleted++;
}
console.log('Cleaned '+deleted+' generated paths. Source, artworks, story, saves, and Git history were not modified.');
