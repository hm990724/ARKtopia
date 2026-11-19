const assert=require('node:assert/strict'),fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(mod,filename)=>{const result=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});mod._compile(result.outputText,filename)};
const {beginGame,loadGame,buildFacility}=require('../src/lib/game-v10.ts');
const {recruitCrew,crewNight,applyCrewOpinion,resolveCrewNightVote}=require('../src/lib/crew.ts');
const fresh=()=>beginGame('artist','generator');
let n=fresh();recruitCrew(n,'rabbit');n.infection=15;
for(let day=1;day<=6;day++){n.day=day;crewNight(n);assert.equal(n.crew.members[0].mind,88,'first five days since recruitment should not drain mental vitality')}
n.day=7;crewNight(n);assert.equal(n.crew.members[0].mind,87,'day 6 after joining should cost one mental point');
for(let day=8;day<=9;day++){n.day=day;crewNight(n)}
assert.equal(n.crew.members[0].mind,87,'mid-early days should be slow');
console.log('PASS staff fatigue is much slower than v49');
n.day=9;n.infection=72;crewNight(n);assert.equal(n.crew.members[0].mind,86,'infection >=70 increases nighttime mental drain');
const legacy=JSON.parse(JSON.stringify(fresh()));delete legacy.onboardingSeen;delete legacy.synthesisTutorialSeen;delete legacy.tutorialArchiveReviewPending;
const loaded=loadGame(legacy);assert.deepEqual(loaded.onboardingSeen,[]);assert.equal(loaded.synthesisTutorialSeen,false);assert.equal(loaded.tutorialArchiveReviewPending,false);
console.log('PASS old saved games receive durable, non-repeating tutorial flags');
const facility=fresh();facility.scrap=50;facility.parts=10;facility.power=100;
assert.equal(buildFacility(facility,'synthesis'),facility,'synthesis facility is disabled before two distinct captures');
facility.animals.push({id:'rabbit'});assert.equal(buildFacility(facility,'synthesis'),facility,'one species insufficient');
facility.animals.push({id:'fox'});assert.notEqual(buildFacility(facility,'synthesis'),facility,'two species available');
console.log('PASS synthesis gated by two different recruited specimen types');
const game=fs.readFileSync('src/components/Game.tsx','utf8');const dossier=fs.readFileSync('src/components/SpecimenArchive.tsx','utf8');const staff=fs.readFileSync('src/components/CrewSystem.tsx','utf8');
for(let [file,src] of [['Game.tsx',game],['SpecimenArchive.tsx',dossier],['CrewSystem.tsx',staff]]){const parsed=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(parsed.parseDiagnostics.length,0,file+': '+parsed.parseDiagnostics.map(x=>x.messageText).join(','))}
for(let fragment of ['v50-research-console','v50-protocol-modal','tutorialArchiveReviewPending','synthesisTutorialSeen','onboardingSeen','v51-cctv-help','escape','mutation','cctv','base-work'])assert(game.includes(fragment),fragment+' missing from UI');
assert(dossier.includes('v51-archive-drawer'));assert(staff.includes('v51-staff-guide'));
console.log('PASS UI onboarding events, compact resonance modal, archive accordion and React TSX parser');
console.log('ALL V51 TESTS PASSED');
