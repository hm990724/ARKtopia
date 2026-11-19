const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(mod,filename)=>{const source=fs.readFileSync(filename,'utf8');const out=ts.transpileModule(source,{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});mod._compile(out.outputText,filename)};
const {makeAnimal,isMutant,mutationRisk,extract}=require('../src/lib/sim.ts');
const {beginGame,loadGame,registerFullResonance,resolveHeadquarters}=require('../src/lib/game-v10.ts');
for(const stress of [30,48,60,72,87]){const a=makeAnimal('fox',1);a.stress=stress;assert.equal(isMutant(a),false,'Normal fox should not mutate at stress '+stress)}
const peak=makeAnimal('fox',1);peak.stress=88;assert.equal(isMutant(peak),true);
const hybrid=makeAnimal('fox',1);hybrid.stress=74;hybrid.memory=65;assert.equal(isMutant(hybrid),true);
const lowHybrid=makeAnimal('fox',1);lowHybrid.stress=48;lowHybrid.memory=26;lowHybrid.contamination=23;assert.equal(isMutant(lowHybrid),false);
console.log('PASS medium mutation thresholds: several errors no longer force permanent mutation');
const a=makeAnimal('rabbit',1);Object.assign(a,{tutorialProtected:true,stress:100,contamination:100,memory:100});assert.equal(isMutant(a),false);assert.equal(mutationRisk(a).danger,false);
let s=beginGame('artist','generator');s.tutorialStep=5;Object.assign(a,{memory:4,stress:18,contamination:0,records:1,bond:34,hp:90});s.animals.push(a);s.ap=2;s.power=10;
let next=extract(s,'rabbit',100,'gentle');assert.notStrictEqual(next,s);
const tutorialRabbit=next.animals.find(x=>x.id==='rabbit');tutorialRabbit.memory=100;
next=registerFullResonance(s,next,'rabbit');assert.equal(next.headquarters.pendingAnimal,'rabbit');assert.equal(next.headquarters.firstReport,true);
next.tutorialArchiveReviewPending=true;next.tutorialStep=6;
const persisted=loadGame(JSON.parse(JSON.stringify(next)));assert.equal(persisted.headquarters.pendingAnimal,'rabbit');assert.equal(persisted.animals[0].tutorialProtected,true);
const completed=resolveHeadquarters(persisted,'transfer');assert.equal(completed.headquarters.transferred.includes('rabbit'),true);assert.equal(completed.animals[0].alive,false);assert.equal(completed.crew.members.some(m=>m.id==='rabbit'),true);
console.log('PASS tutorial rabbit: immunity, first synchronization 100, archive transfer and medical staff arrival');
const old=beginGame('artist','generator');old.tutorialStep=5;old.animals=[makeAnimal('rabbit',1)];old.animals[0].mutated=true;old.animals[0].awakened=true;old.animals[0].stress=95;
const restored=loadGame(JSON.parse(JSON.stringify(old)));assert.equal(restored.animals[0].tutorialProtected,true);assert.equal(restored.animals[0].mutated,false);assert.equal(restored.animals[0].awakened,false);
const orphan=beginGame('artist','generator');orphan.animals=[makeAnimal('rabbit',1)];orphan.animals[0].memory=100;orphan.tutorialStep=6;
const oldResumed=loadGame(JSON.parse(JSON.stringify(orphan)));assert.equal(oldResumed.headquarters.pendingAnimal,'rabbit');assert.equal(oldResumed.tutorialArchiveReviewPending,true);
console.log('PASS migration rescues v51 mutated tutorial rabbits and lost HQ request');
const game=fs.readFileSync('src/components/Game.tsx','utf8'),css=fs.readFileSync('src/app/globals.css','utf8');
assert(game.includes("setTab('records')"));assert(game.includes("setResult(null);setTab('records')"));assert(game.includes("setTalk([])")||game.includes('dialogue('));assert(game.includes('data-tour="archive-transfer"'));assert(css.includes('.v50-research-page .v50-research-main-action>.v10-primary'));
for(const f of ['Game.tsx','FieldMission.tsx','CrewSystem.tsx','SpecimenArchive.tsx']){const source=fs.readFileSync('src/components/'+f,'utf8');const ast=ts.createSourceFile(f,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(ast.parseDiagnostics.length,0,`Syntax error in ${f}`)}
console.log('PASS corrected intro routing, compact research UI, TypeScript JSX syntax');
