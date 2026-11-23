const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const game=require('../src/lib/game-v10.ts'),combat=require('../src/lib/field-combat.ts'),{beginGame,loadGame,startRun,moveField}=game;
const {recruitCrew}=require('../src/lib/crew.ts');
let s=beginGame('medic','generator');s.day=4;s.tutorialStep=9;s= startRun(s,'garden',['flashlight']);assert.ok(s.field?.threat,'later outings spawn an independent roaming threat');
const f=s.field,width=f.width??7,start=f.position;f.tiles.fill('empty');f.tiles[f.exitIndex]='exit';f.threat={position:start+3,alert:18,mode:'search'};
let moved=moveField(s,start+1,'normal');assert.notEqual(moved,s,'player can advance into the encounter');assert.equal(moved.field.combat?.source,'mobile','the roaming enemy engages independently of hazard tiles');assert.ok(moved.field.threat?.alert>=26,'noise increases the enemy alert');
const restored=loadGame(JSON.parse(JSON.stringify(moved)));assert.equal(restored.field.combat.source,'mobile','active central combat survives save/load');assert.deepEqual(restored.field.threat,moved.field.threat,'roaming position persists in saved field state');
const guarded=combat.resolveCombat(restored,'guard');assert.equal(guarded.field.combat.lastAction,'guard','combat action persists as an animation cue');const retreated=combat.resolveCombat(restored,'retreat');assert.equal(retreated.field.combat,null);assert.ok(retreated.field.threat,'retreat does not silently erase the pursuer');assert.equal(retreated.scrap,restored.scrap,'retreat awards no combat salvage');
const victory=structuredClone(restored);victory.field.combat.hp=1;const defeated=combat.resolveCombat(victory,'strike');assert.equal(defeated.field.combat,null);assert.equal(defeated.field.threat,null,'victory clears only the engaged roaming enemy');assert.ok(defeated.scrap>victory.scrap,'victory grants one real scrap reward');assert.equal(combat.resolveCombat(defeated,'strike'),defeated,'combat reward cannot be duplicated after clearing encounter');
const prep=fs.readFileSync(require('node:path').join(__dirname,'../src/components/Game.tsx'),'utf8'),view=fs.readFileSync(require('node:path').join(__dirname,'../src/components/EnhancedField.tsx'),'utf8');
assert.ok(prep.includes('SORTIE CONFIGURATION')&&prep.includes('role="dialog"')&&prep.includes('장비 선택')&&prep.includes('동행 직원'),'launch has a modal equipment and companion preparation flow');assert.match(prep,/탐사 출동 · 수풀 추적 시작/,'legacy tutorial launch remains connected');assert.match(view,/role="dialog" aria-modal="true"[\s\S]*FIELD ENGAGEMENT/,'combat is presented as a central blocking decision');assert.match(view,/data-action=\{b\.lastAction\?\?['"]idle['"]\}/,'combat actions select matching actor animations');assert.match(view,/companions\.map\(id=>[\s\S]*characterPortrait\(id,mood\)/,'the actual selected staff portrait participates in combat');
console.log('PASS v80 sortie prep, saveable roaming threat, central encounter, retreat and single combat reward');
for(const id of ['rabbit','fox','deer','wolf']){
 let crewState=beginGame('medic','generator');crewState.day=4;crewState.tutorialStep=9;crewState.infection=50;recruitCrew(crewState,id,`${id.toUpperCase()}-COMBAT`);crewState=startRun(crewState,'garden',['flashlight'],id);crewState.field.combat=combat.newFieldCombat(1);crewState.field.combat.intent='charge';if(id==='wolf')crewState.field.combat.hp=10;
 const memberBefore=crewState.crew.members.find(m=>m.id===id).mind,managerBefore=crewState.mind,scrapBefore=crewState.scrap,infectionBefore=crewState.infection,after=combat.resolveCombat(crewState,'support');
 if(id!=='wolf')assert.equal(after.field.combat?.lastAction,'support');assert.equal(after.crew.members.find(m=>m.id===id).mind,memberBefore-3);
 if(id==='rabbit')assert.equal(after.mind,managerBefore+8,'Medic support restores manager mental health');
 if(id==='fox')assert.equal(after.scrap,scrapBefore+3,'Supply staff recovers salvage');
 if(id==='deer')assert.equal(after.infection,infectionBefore-6,'Archivist decodes a safe opening and reduces infection');
 if(id==='wolf'){assert.equal(after.field.combat,null,'Ranger support can finish an exposed enemy');assert.match(after.lastOutcome,/보안관이 전면을 막고 핵을 제압/,'Ranger has a distinct attack line');assert.ok(after.run.integrity>=crewState.run.integrity-2,'Ranger reduces damage to the team');}
}
console.log('PASS each recruited companion has a distinct support effect and the correct combat state');


let duo=beginGame('medic','generator');duo.day=4;duo.tutorialStep=9;for(const id of ['rabbit','fox'])recruitCrew(duo,id,`DUO-${id}`);duo=startRun(duo,'garden',['flashlight'],['rabbit','fox']);assert.deepEqual(duo.run.companions,['rabbit','fox'],'two recruited staff are persisted on the sortie');duo.field.combat=combat.newFieldCombat(1);duo.field.combat.intent='charge';const duoMind=duo.crew.members.map(m=>m.mind),duoSupported=combat.resolveCombat(duo,'support');assert.equal(duoSupported.mind,duo.mind+8,'the medic supports the manager');assert.equal(duoSupported.scrap,duo.scrap+3,'the quartermaster salvages resources');assert.deepEqual(duoSupported.crew.members.map(m=>m.mind),duoMind.map(m=>m-3),'both present companions carry the support cost');assert.match(duoSupported.lastOutcome,/정신 \+8.*고철 \+3/,'both role outcomes are reported');
console.log('PASS two-person sortie support combines role effects and saves both crew IDs');



