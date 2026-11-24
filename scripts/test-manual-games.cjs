const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const M=require('../src/lib/manual-games.ts');
for(let seed=1;seed<=80;seed++){
 const board=M.searchBoard(seed);
 assert.deepEqual(board,M.searchBoard(seed));
 assert.equal(board.length,20);
 assert.equal(board.filter(c=>c==='supply').length,4);
 assert.equal(board.filter(c=>c==='hazard').length,4);
 assert.equal([0,1,2,3].reduce((n,i)=>n+M.searchSector(board,'row',i),0),4);
 assert.equal([0,1,2,3,4].reduce((n,i)=>n+M.searchSector(board,'column',i),0),4);
 const supplies=board.flatMap((v,i)=>v==='supply'?[i]:[]);
 const hazards=board.flatMap((v,i)=>v==='hazard'?[i]:[]);
 assert.equal(M.searchQuality(board,supplies.slice(0,2)),1);
 assert.equal(M.searchQuality(board,hazards.slice(0,2)),0);
 const demand=M.generatorDemand(seed);
 let best=0;
 function visit(state){if(state.step===demand.length){best=Math.max(best,M.generatorQuality(state,demand));return;}
 for(const a of ['drive','steady','vent']){const next=M.crankStep(state,a,demand);assert.ok(next.pressure>=0&&next.pressure<=6);assert.ok(next.heat>=0&&next.heat<=9);visit(next);}}
 visit(M.initialGenerator);
 assert.equal(best,1,'generator full quality must be reachable '+seed);
 for(let round=0;round<3;round++){
 const t=M.flowTargets(seed)[round],critical=(seed+round)%3;
 const a=[...t];a[(critical+1)%3]--;
 assert.equal(M.flowScore(a,t,critical),1);
 const b=[...t];b[critical]--;
 assert.ok(M.flowScore(b,t,critical)<1);
 assert.deepEqual(M.adjustFlow(a,critical,1),a);
 const {ref,raw}=M.calibrationRound(seed,round);
 let best=0;
 for(let phase=0;phase<7;phase++)for(let bias=-2;bias<=2;bias++)best=Math.max(best,M.signalQuality(ref,M.shiftWave(raw,phase,bias)));
 assert.equal(best,1,'signal must be fully recoverable');
 }
}
console.log('Manual minigame deterministic boards, limits, and optimal paths passed.');
