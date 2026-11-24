const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {characterMood,characterPortrait,staffCondition,staffStatusPortrait,staffDialoguePortrait}=require('../src/lib/character-art.ts');
const {beginGame,startRun,expeditionBlockReason,loadGame}=require('../src/lib/game-v10.ts');
const {recruitCrew,crewSupport}=require('../src/lib/crew.ts');
const crewIds=['rabbit','fox','deer','wolf'];

assert.equal(staffCondition(undefined),'safe');
assert.equal(staffCondition(100),'safe');
assert.equal(staffCondition(61),'unstable');
assert.equal(staffCondition(34),'critical');

for(const id of crewIds){
 const options=[staffStatusPortrait(id,'safe'),staffStatusPortrait(id,'unstable'),staffStatusPortrait(id,'critical'),
   staffDialoguePortrait(id,'neutral','safe'),staffDialoguePortrait(id,'anxious','safe'),staffDialoguePortrait(id,'critical','safe')];
 for(const url of options){
  assert.ok(fs.existsSync(path.join(__dirname,'../public',url)),id+': missing portrait '+url);
 }
 assert.ok(staffStatusPortrait(id,'critical').endsWith('portrait_critical.webp'));
 assert.ok(staffDialoguePortrait(id,'critical','safe').endsWith('portrait_critical.png'));
 assert.ok(staffDialoguePortrait(id,'anxious','safe').endsWith('portrait_unstable.png'));
 assert.equal(staffDialoguePortrait(id,'neutral','critical'),staffStatusPortrait(id,'critical'));
 assert.equal(characterPortrait(id,'critical'),staffStatusPortrait(id,'critical'));
}
let s=beginGame('medic','generator');
s.day=4;s.tutorialStep=9;
for(const id of ['rabbit','fox'])recruitCrew(s,id,'PORTRAIT-'+id);
const medic=s.crew.members.find(m=>m.id==='rabbit');
medic.mind=12;
assert.equal(characterMood(s,'rabbit','괜찮아요.','neutral'),'critical','low-sanity dialogue cannot show calm art');
medic.mind=51;
assert.equal(characterMood(s,'rabbit','괜찮아요.','neutral'),'anxious');
assert.equal(characterMood(s,'rabbit','살려 주세요.','critical'),'critical');
medic.mind=92;
assert.equal(characterMood(s,'rabbit','죄송합니다.','neutral'),'neutral','explicit calm dialogue is honored at stable sanity');

assert.match(expeditionBlockReason(s,'garden',['flashlight'],['rabbit','rabbit']),/중복/);
assert.match(expeditionBlockReason(s,'garden',['flashlight'],['rabbit','fox','deer']),/최대 2명/);
assert.match(expeditionBlockReason(s,'garden',['flashlight'],['deer']),/미합류/);
assert.equal(startRun(s,'garden',['flashlight'],['rabbit','rabbit']),s);
assert.equal(startRun(s,'garden',['flashlight'],['deer']),s);
let supported=crewSupport(s,'rabbit');
assert.notEqual(supported,s);
assert.match(expeditionBlockReason(supported,'garden',['flashlight'],['rabbit']),/기지 지원/);
assert.equal(startRun(supported,'garden',['flashlight'],['rabbit']),supported);
const legal=startRun(s,'garden',['flashlight'],['rabbit','fox']);
assert.deepEqual(legal.run.companions,['rabbit','fox']);
const migrated=loadGame(JSON.parse(JSON.stringify(legal)));
assert.deepEqual(migrated.run.companions,['rabbit','fox']);
assert.deepEqual(migrated.crew.sortieWorked,['rabbit','fox'],'both deployed crew IDs survive save/load');
const home=structuredClone(migrated);home.run=null;home.field=null;
assert.equal(crewSupport(home,'rabbit'),home,'returned medic cannot also perform same-day HQ duty');
assert.equal(crewSupport(home,'fox'),home,'returned quartermaster cannot also perform same-day HQ duty');
const standby=crewSupport(home,'deer');
assert.equal(standby,home,'unrecruited members never grant HQ support');
const nextDay=structuredClone(home);nextDay.day++;nextDay.crew.sortieWorked=[];
assert.notEqual(crewSupport(nextDay,'rabbit'),nextDay,'crew member can work at HQ on a new day');
const source=fs.readFileSync(path.join(__dirname,'../src/components/Game.tsx'),'utf8');
const roster=fs.readFileSync(path.join(__dirname,'../src/components/CrewSystem.tsx'),'utf8');
assert.ok(source.includes('dialogueMood={mood}'),'dialogue expresses emotional portraits');
assert.ok(roster.includes('condition={staffCondition(member.mind)}'),'roster reflects sanity changes');
assert.ok(roster.includes('condition={staffCondition(selectedMember.mind)}'),'detail modal reflects sanity changes');
console.log('PASS v82: crew condition portraits, reactive dialogue expressions, and valid two-person sortie guards');
