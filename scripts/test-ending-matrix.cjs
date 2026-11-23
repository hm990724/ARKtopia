const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);

const {beginGame}=require('../src/lib/game-v10.ts');
const {makeAnimal,finish}=require('../src/lib/sim.ts');
const {emptyOriginZero,recallCandidates}=require('../src/lib/origin-zero.ts');
const {emptyArchive,finishWithArchive}=require('../src/lib/specimen-archive.ts');
const {ENDING_ART,findEndingArt}=require('../src/lib/ending-art.ts');

function specimen(key,species,title=''){
 return {key,species,name:species,firstDay:1,lastDay:1,status:'dissected',captureMethod:'fixture',observedTraits:[],records:title?[{day:1,title,detail:'fixture',kind:'loss'}]:[],maxStress:10,maxMemory:0};
}
function ready({goal='freedom',immunity=85,photos=12,coerced=0,retired=[],hqIntel=0,dispatches=0,alive=3}={}){
 const s=beginGame('medic','generator');s.phase='finale';s.day=30;s.tutorialStep=9;
 s.animals=['rabbit','fox','deer','owl'].slice(0,alive).map((id,index)=>makeAnimal(id,index+1));
 s.crew.retired=[...retired];
 s.archive=emptyArchive();s.archive.dispatches=dispatches;
 for(let i=0;i<coerced;i++)s.archive.entries['FORCED-'+i]=specimen('FORCED-'+i,'rabbit','강제 조직 회수');
 s.originZero=emptyOriginZero();Object.assign(s.originZero,{route:'hq',crisisDone:true,photos,immunity,hqIntel,recalls:{}});
 for(const animal of s.animals)s.originZero.recalls[animal.id]={day:20,quality:80,source:'archive',note:'fixture'};
 s.originZero.individualRecalls={};
 for(const item of recallCandidates(s))s.originZero.individualRecalls[item.key]={specimenId:item.key,day:20,quality:80,source:'archive',note:'fixture'};
 return finishWithArchive(s,goal);
}
function notReady(goal,setup){
 const s=beginGame('medic','generator');s.phase='finale';s.day=30;s.tutorialStep=9;s.originZero=emptyOriginZero();s.archive=emptyArchive();
 if(setup)setup(s);
 return finishWithArchive(s,goal);
}
function verify(state,title,file){
 assert.equal(state.phase,'ending',`${title} resolves to an ending phase`);
 assert.ok(state.ending.startsWith(title),`expected ${title}, got ${state.ending}`);
 assert.equal(findEndingArt(state.ending).file,file,`${title} uses its intended route file`);
}
function verifyBase(goal,setup,title,file){
 const s=beginGame('medic','generator');s.phase='finale';s.day=30;s.tutorialStep=9;
 if(setup)setup(s);
 const ended=finish(s,goal);assert.equal(ended.phase,'ending');assert.ok(ended.ending.startsWith(title),`expected base ${title}, got ${ended.ending}`);
 assert.equal(findEndingArt(ended.ending).file,file,`${title} uses its intended base route file`);
}

// Eight main ORIGIN ZERO outcomes, driven through the real condition function.
verify(ready({goal:'rebuild',immunity:99}),'영원한 실험','ending_eternal_experiment_finale.png');
verify(ready({goal:'rebuild',immunity:100}),'에덴','ending_eden_finale.png');
verify(ready({goal:'freedom',immunity:85}),'방주의 씨앗','ending_seed_ark_finale.png');
verify(ready({goal:'freedom',immunity:84}),'마지막 동물원','ending_last_zoo_finale.png');
verify(ready({goal:'preserve',retired:[]}),'제000번 우리','ending_subject_000_choice.png');
verify(ready({goal:'preserve',retired:['rabbit','fox']}),'침묵의 자동화','ending_silent_automation_finale.png');
verify(ready({goal:'freedom',coerced:2}),'흩어진 이름들','ending_scattered_names_finale.png');
verify(ready({goal:'preserve',hqIntel:65,dispatches:1}),'마지막 신호','ending_last_signal_finale.png');

// Archive-specific endings remain reachable when the new route is not ready.
verify(notReady('rebuild',s=>{s.headquarters.transferred=['rabbit','fox'];s.archive.dispatches=1;s.archive.entries['FORCED']=specimen('FORCED','deer','강제 조직 회수')}),'본부의 계승자','ending_successor_cinematic.png');
verify(notReady('rebuild',s=>{s.knowledge=120;}),'상처 없는 복원','ending_humane_restoration_cinematic.png');
verify(notReady('freedom'),'기록 밖의 봄','ending_spring_outside_records_cinematic.png');
verify(notReady('freedom',s=>{for(let i=0;i<2;i++)s.archive.entries['FORCED-'+i]=specimen('FORCED-'+i,'deer','강제 조직 회수')}),'뒤늦은 철문','ending_late_gate_cinematic.png');
verify(notReady('preserve',s=>{s.crew.retired=['rabbit','fox']}),'비어 있는 교대실','ending_empty_shiftroom_cinematic.png');

// Legacy/base endings and the EVE-loss scene still resolve to their own art.
verifyBase('rebuild',s=>{s.flags.mirror=true;s.knowledge=155;s.animals=['rabbit','fox','deer','owl'].map((id,i)=>makeAnimal(id,i+1));},'인간 이후의 첫 문장','ending_first_sentence_cinematic.png');
verifyBase('rebuild',s=>{s.knowledge=100;},'미완의 부활','ending_incomplete_revival_cinematic.png');
verifyBase('rebuild',undefined,'제000번 우리','ending_subject_000_choice.png');
verifyBase('freedom',s=>{s.trust=63;s.animals=['rabbit','fox','deer'].map((id,i)=>makeAnimal(id,i+1));},'우리 밖의 봄','ending_spring_beyond_cage_cinematic.png');
verifyBase('freedom',s=>{s.trust=62;},'흩어진 이름들','ending_scattered_names_finale.png');
verifyBase('preserve',s=>{s.eve=45;},'마지막 두 관리자','ending_two_caretakers_cinematic.png');
verifyBase('preserve',s=>{s.eve=44;},'고요한 자동화','ending_quiet_automation_cinematic.png');
assert.equal(findEndingArt('마지막 통신 — EVE 코어 정지').file,'ending_final_transmission_cinematic.png');

assert.equal(ENDING_ART.length,19);
assert.equal(new Set(ENDING_ART.map(item=>item.file)).size,19);
for(const {file} of ENDING_ART)assert.ok(fs.existsSync(path.join(__dirname,'../public/assets/endings',file)),`scene exists: ${file}`);
console.log('PASS 8 ORIGIN ZERO outcomes, 11 additional ending paths, and distinct active route files');
