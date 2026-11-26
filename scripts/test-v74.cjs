const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
require('./test-v74-core.cjs');
const h=require('../src/lib/hidden-hunt.ts'),g=require('../src/lib/game-v10.ts'),sim=require('../src/lib/sim.ts'),c=require('../src/lib/field-combat.ts'),f=require('../src/lib/tactical-field.ts'),art=require('../src/lib/character-art.ts'),oz=require('../src/lib/origin-zero.ts'),archive=require('../src/lib/specimen-archive.ts'),protocols=require('../src/lib/protocols.ts').protocols;
for(const size of [6,8])for(const spec of sim.specs)for(let seed=1;seed<=30;seed++){
 let hunt=h.newHunt(spec.id,seed,false,size);assert.equal(hunt.terrain.length,size*size);
 for(let k=0;k<12&&hunt.outcome==='playing';k++){hunt=h.performHuntAction(hunt,{type:'search',cell:(seed+k*7)%(size*size)}).state;assert.ok(hunt.position>=0&&hunt.position<size*size);for(const i of hunt.shaking){assert.ok(Math.abs(i%size-hunt.position%size)<=1);assert.ok(Math.abs(Math.floor(i/size)-Math.floor(hunt.position/size))<=1);}for(const i of hunt.footprints)assert.ok(hunt.trail.some(t=>t.cell===i));}
 const saved=h.normalizeHunt(JSON.parse(JSON.stringify(hunt)));assert.equal(h.huntSize(saved),size);assert.equal(saved.actions,hunt.actions);
}
let hunt=h.newHunt('fox',8);hunt.searchedAt={'10':0,'11':0};hunt.position=10;hunt.turn=8;
assert.equal(h.observedEvidence(hunt,10).kind,'caught');assert.equal(h.observedEvidence(hunt,5),null);hunt.position=11;hunt.trail=[{cell:10,turn:8}];assert.equal(h.observedEvidence(hunt,10).kind,'footprint');assert.equal(h.observedEvidence(hunt,11).kind,'caught');assert.equal(h.performHuntAction(hunt,{type:'net',cell:11}).won,true);
let old=h.newHunt('rabbit',7,false,8);delete old.size;assert.equal(h.huntSize(h.normalizeHunt(old)),8);
console.log('PASS 780 seeded hunts, radius-one grass, real trails, live opened cells, hidden fog and legacy dimensions');
// Newly confirmed six-species identities and their differentiated field signals.
const axo=h.newHunt('axolotl',71);Object.assign(axo,{turn:5,position:35,trail:[{cell:8,turn:4}],footprints:[8],searchedAt:{'8':4}});axo.terrain[8]='water';assert.equal(h.observedEvidence(axo,8).kind,'regrowth');
const decoy=h.newHunt('mutant',5);decoy.position=35;decoy.terrain.fill('path');decoy.terrain[0]='ruin';const decoyResult=h.performHuntAction(decoy,{type:'search',cell:0});assert.equal(decoyResult.state.observations['0'].kind,'decoy');assert.equal(h.observedEvidence(decoyResult.state,0).kind,'decoy');
const lynx=h.newHunt('lynx',4);lynx.position=14;lynx.predator=20;const quiet=h.performHuntAction(lynx,{type:'wait'});assert.equal(quiet.state.quietTurn,1);assert.equal(quiet.state.predator,14);
const specter=h.newHunt('specter',41);specter.position=0;const mismatch=h.performHuntAction(specter,{type:'wait'});assert.notEqual(mismatch.state.cameraZone,undefined);assert.equal(mismatch.state.cameraTurn,mismatch.state.turn);
assert.match(sim.specs.find(x=>x.id==='lynx').former,/감시 분석관.*32세/);assert.match(sim.specs.find(x=>x.id==='axolotl').former,/재생의학 연구원.*36세/);assert.match(sim.specs.find(x=>x.id==='moth').former,/전력.*29세/);assert.match(sim.specs.find(x=>x.id==='mutant').former,/동기화 연구 책임자.*48세/);assert.match(sim.specs.find(x=>x.id==='specter').former,/기억 삭제 담당.*41세/);assert.match(protocols.chimera.title,/기억의 주기/);
console.log('PASS six confirmed identities, axolotl regrowth, mutant decoys, lynx quiet approach and specter camera afterimage');
let s=g.beginGame('medic','generator');s.eve=1;assert.equal(art.characterMood(s,'eve','무너져','critical'),'neutral');s.flags.humanTruth=true;assert.equal(art.characterMood(s,'eve'),'critical');
s.animals=[sim.makeAnimal('specter',1),sim.makeAnimal('chimera',2)];s.pending='chimera';let saved=g.loadGame(JSON.parse(JSON.stringify(s)));assert.equal(saved.animals.length,2);assert.equal(saved.pending,'chimera');assert.equal(sim.specs.length,13);assert.ok(g.regions.some(r=>r.animals.includes('specter')));
console.log('PASS early EVE expression lock, 13 species and legacy creature preservation');
s=g.beginGame('medic','generator');s.day=6;s.tutorialStep=9;s=g.startRun(s,'garden',['flashlight']);s.run.firstTutorial=false;s.field.tiles.fill('empty');s.field.combat=c.newFieldCombat(2);s.field.combat.hp=34;s.field.combat.maxHp=34;s.field.combat.intent='lunge';s.field.combat.source='hazard';assert.ok(s.field.combat);assert.equal(g.moveField(s,s.field.position+1),s);
const initial=JSON.stringify(s),guard=c.resolveCombat(s,'guard');assert.equal(JSON.stringify(s),initial);assert.ok(guard.field.combat.stagger);const strike=c.resolveCombat(guard,'strike');assert.ok(strike.field.combat.hp<=10);const win=c.resolveCombat(strike,'pulse');assert.equal(win.field.combat,null);assert.ok(win.scrap>s.scrap);assert.equal(c.resolveCombat(win,'strike'),win);assert.equal(win.power,s.power-3);assert.equal(c.combatBlock({...win,field:{...win.field,combat:c.newFieldCombat(0)}},'pulse'),'EVE 지원은 출동당 한 번입니다.');
const flee=c.resolveCombat(s,'retreat');assert.equal(flee.field.combat,null);assert.equal(flee.scrap,s.scrap);
console.log('PASS saved combat intent, movement lock, guard counter, one-use support, single reward and retreat');
s=g.beginGame('medic','generator');s.facilities.cctv=true;s.scrap=200;s.parts=40;s.power=100;s=c.upgradeBase(s,'relay');assert.equal(c.upgradeLevel(s,'relay'),1);assert.equal(s.scrap,192);for(let level=1;level<5;level++)s=c.upgradeBase(s,'relay');assert.equal(c.upgradeBase(s,'relay'),s);assert.equal(c.upgradeLevel(g.loadGame(JSON.parse(JSON.stringify(s))),'relay'),5);const batteryBase=g.beginGame('medic','generator');batteryBase.facilities.cctv=true;batteryBase.scrap=100;batteryBase.parts=30;batteryBase.power=100;let battery=batteryBase;for(let level=0;level<3;level++)battery=c.upgradeBase(battery,'battery');assert.equal(c.upgradeBase(battery,'battery'),battery,'battery remains capped at three levels');
const field=f.createField(4,'garden');field.position=15;field.tiles[16]='wall';assert.equal(f.fieldLineOfSight(field,17,3),false);f.revealField(field,2);const visible=[...field.discovered];field.position=0;for(const i of visible)assert.equal(f.fieldVisible(field,i,1),true);
const relayField={...field,position:14,tiles:Array(35).fill('empty'),width:7,height:5};relayField.tiles[33]='animal';assert.equal(f.fieldRelayBearing(relayField,1),null);assert.equal(f.fieldRelayBearing(relayField,2),'남동쪽에서 약한 생체 신호 · 원거리');assert.equal(f.fieldRelayBearing({...relayField,tiles:Array(35).fill('empty')},3),null);
console.log('PASS capped base upgrades, saved levels, wall occlusion, persistent map discovery and coarse CCTV relay bearings');
let recall=g.beginGame('medic','generator');recall.day=12;recall.tutorialStep=9;recall.animals=[sim.makeAnimal('rabbit',1)];archive.ensureArchive(recall);recall.originZero=oz.emptyOriginZero();recall.originZero.route='shelter';recall.originZero.photos=7;
const recallTarget=oz.recallCandidates(recall)[0];recall=oz.beginOriginRecall(recall,recallTarget.key);recall=oz.answerOriginRecall(recall,recallTarget.key,protocols.rabbit.steps[0].correct);assert.equal(recall.originZero.recallSessions[recallTarget.key].step,1);recall=g.loadGame(JSON.parse(JSON.stringify(recall)));assert.equal(recall.originZero.recallSessions[recallTarget.key].step,1);
for(let stage=1;stage<3;stage++)recall=oz.answerOriginRecall(recall,recallTarget.key,protocols.rabbit.steps[stage].correct);
const recallResult=oz.recallRecord(recall,recallTarget);assert.equal(recallResult.steps.length,3);assert.equal(recallResult.steps.filter(x=>x.matched).length,3);assert.equal(recall.originZero.recallSessions[recallTarget.key],undefined);assert.ok(recallResult.quality>75);
for(const species of sim.specs){assert.ok(protocols[species.id]);assert.equal(protocols[species.id].steps.length,3);}
console.log('PASS specimen-specific three-stage ARK RECALL, mid-session save/resume, and 13 animal behavior protocols');
function endingFixture({immunity=80,alive=3,coerced=0,retired=[],hqIntel=0,dispatches=0}={}){
 const state=g.beginGame('medic','generator');state.phase='finale';state.day=40;state.ap=0;state.animals=['rabbit','fox','deer'].map((id,i)=>({...sim.makeAnimal(id,i+1),alive:i<alive}));
 state.originZero=oz.emptyOriginZero();Object.assign(state.originZero,{route:'shelter',photos:12,immunity,crisisDone:true,hqIntel});
 state.archive=archive.emptyArchive();state.archive.dispatches=dispatches;state.crew.retired=retired;
 for(const animal of state.animals)state.originZero.recalls[animal.id]={day:40,quality:90,source:'archive',note:'ending fixture'};
 for(let i=0;i<coerced;i++)state.archive.entries[`fixture-${i}`]={key:`fixture-${i}`,species:'__fixture__',records:[{title:'강제 조직 회수'}]};
 return state;
}
const endingCases=[
 ['rebuild',{immunity:99,alive:3},'영원한 실험'],['rebuild',{immunity:100,alive:3},'에덴'],
 ['freedom',{immunity:85,alive:3},'방주의 씨앗'],['freedom',{immunity:84,alive:3},'마지막 동물원'],
 ['freedom',{immunity:84,alive:1,coerced:2},'흩어진 이름들'],['preserve',{immunity:80,alive:3},'제000번 우리'],
 ['preserve',{immunity:80,alive:3,retired:['medic','guard']},'침묵의 자동화'],
 ['preserve',{immunity:80,alive:3,hqIntel:65,dispatches:1},'마지막 신호'],
];
for(const [goal,options,title] of endingCases){const result=archive.finishWithArchive(endingFixture(options),goal);assert.ok(result.ending.startsWith(title),`${title}: ${result.ending}`);assert.match(result.ending,/관리자는 .*사망했다/);}
assert.equal(new Set(endingCases.map(([, ,title])=>title)).size,8);
console.log('PASS all eight ORIGIN ZERO epilogues resolve from distinct ethical outcomes and retain manager-death canon');
