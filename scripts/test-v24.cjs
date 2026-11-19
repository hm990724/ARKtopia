const fs=require('fs'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const g=fs.readFileSync('src/components/Game.tsx','utf8');
const lib=fs.readFileSync('src/lib/game-v10.ts','utf8');
const css=fs.readFileSync('src/app/globals.css','utf8');
for(const [file,kind] of [['src/components/Game.tsx',ts.ScriptKind.TSX],['src/lib/game-v10.ts',ts.ScriptKind.TS]]){
 const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,kind);
 assert.equal(source.parseDiagnostics.length,0, file+' syntax errors');
}
assert(!g.includes('prologueFrames')&&!g.includes('cinematicStep'),'slideshow removed');
assert(g.includes('const talkIntro:Talk[]')&&g.includes('유일한 지성체이십니다'),'narrative dialogue');
for(const x of ['tutorialScenes.expedition','tutorialScenes.discovery','tutorialScenes.rescued','tutorialScenes.observed','tutorialScenes.research'])assert(g.includes(x),x+' included');
for(const n of [1,2,3,4,5,6,7])assert(g.includes('tutorialStep'+(n===7?'': '')),'stage persisted');
assert(lib.includes('tutorialStep:1')&&lib.includes('const wasComplete=')&&lib.includes('tutorialStep:wasComplete?9:'),'save migration preserves completed tutorials');
assert(css.includes('.v10-dialog{height:clamp')&&css.includes('overflow-y:auto'),'fixed dialogue height');
assert(g.includes('registerFullResonance')&&g.includes('resolveHeadquarters'),'HQ preserved');
console.log('v24 dialogue onboarding, unlock persistence, no slideshow, syntax: PASS');
