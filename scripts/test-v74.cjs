const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
require('./test-v74-core.cjs');
const h=require('../src/lib/hidden-hunt.ts'),g=require('../src/lib/game-v10.ts'),sim=require('../src/lib/sim.ts'),c=require('../src/lib/field-combat.ts'),f=require('../src/lib/tactical-field.ts'),art=require('../src/lib/character-art.ts');
for(const size of [6,8])for(const spec of sim.specs)for(let seed=1;seed<=30;seed++){
 let hunt=h.newHunt(spec.id,seed,false,size);assert.equal(hunt.terrain.length,size*size);
 for(let k=0;k<12&&hunt.outcome==='playing';k++){hunt=h.performHuntAction(hunt,{type:'search',cell:(seed+k*7)%(size*size)}).state;assert.ok(hunt.position>=0&&hunt.position<size*size);for(const i of hunt.shaking){assert.ok(Math.abs(i%size-hunt.position%size)<=1);assert.ok(Math.abs(Math.floor(i/size)-Math.floor(hunt.position/size))<=1);}for(const i of hunt.footprints)assert.ok(hunt.trail.some(t=>t.cell===i));}
 const saved=h.normalizeHunt(JSON.parse(JSON.stringify(hunt)));assert.equal(h.huntSize(saved),size);assert.equal(saved.actions,hunt.actions);
}
let hunt=h.newHunt('fox',8);hunt.searchedAt={'10':0,'11':0};hunt.position=10;hunt.turn=8;
assert.equal(h.observedEvidence(hunt,10).kind,'caught');assert.equal(h.observedEvidence(hunt,5),null);hunt.position=11;hunt.trail=[{cell:10,turn:8}];assert.equal(h.observedEvidence(hunt,10).kind,'footprint');assert.equal(h.observedEvidence(hunt,11).kind,'caught');assert.equal(h.performHuntAction(hunt,{type:'net',cell:11}).won,true);
let old=h.newHunt('rabbit',7,false,8);delete old.size;assert.equal(h.huntSize(h.normalizeHunt(old)),8);
console.log('PASS 780 seeded hunts, radius-one grass, real trails, live opened cells, hidden fog and legacy dimensions');
let s=g.beginGame('medic','generator');s.eve=1;assert.equal(art.characterMood(s,'eve','무너져','critical'),'neutral');s.flags.humanTruth=true;assert.equal(art.characterMood(s,'eve'),'critical');
s.animals=[sim.makeAnimal('specter',1),sim.makeAnimal('chimera',2)];s.pending='chimera';let saved=g.loadGame(JSON.parse(JSON.stringify(s)));assert.equal(saved.animals.length,2);assert.equal(saved.pending,'chimera');assert.equal(sim.specs.length,13);assert.ok(g.regions.some(r=>r.animals.includes('specter')));
console.log('PASS early EVE expression lock, 13 species and legacy creature preservation');
s=g.beginGame('medic','generator');s.day=6;s.tutorialStep=9;s=g.startRun(s,'garden',[]);s.run.firstTutorial=false;s.field.tiles.fill('empty');s.field.tiles[s.field.position+1]='hazard';s=g.moveField(s,s.field.position+1);assert.ok(s.field.combat);assert.equal(g.moveField(s,s.field.position+1),s);
const initial=JSON.stringify(s),guard=c.resolveCombat(s,'guard');assert.equal(JSON.stringify(s),initial);assert.ok(guard.field.combat.stagger);const strike=c.resolveCombat(guard,'strike');assert.ok(strike.field.combat.hp<=10);const win=c.resolveCombat(strike,'pulse');assert.equal(win.field.combat,null);assert.ok(win.scrap>s.scrap);assert.equal(c.resolveCombat(win,'strike'),win);assert.equal(win.power,s.power-3);assert.equal(c.combatBlock({...win,field:{...win.field,combat:c.newFieldCombat(0)}},'pulse'),'EVE 지원은 출동당 한 번입니다.');
const flee=c.resolveCombat(s,'retreat');assert.equal(flee.field.combat,null);assert.equal(flee.scrap,s.scrap);
console.log('PASS saved combat intent, movement lock, guard counter, one-use support, single reward and retreat');
s=g.beginGame('medic','generator');s.facilities.cctv=true;s.scrap=100;s.parts=30;s.power=100;s=c.upgradeBase(s,'relay');assert.equal(c.upgradeLevel(s,'relay'),1);assert.equal(s.scrap,92);s=c.upgradeBase(s,'relay');s=c.upgradeBase(s,'relay');assert.equal(c.upgradeBase(s,'relay'),s);assert.equal(c.upgradeLevel(g.loadGame(JSON.parse(JSON.stringify(s))),'relay'),3);
const field=f.createField(4,'garden');field.position=15;field.tiles[16]='wall';assert.equal(f.fieldLineOfSight(field,17,3),false);f.revealField(field,2);const visible=[...field.discovered];field.position=0;for(const i of visible)assert.equal(f.fieldVisible(field,i,1),true);
const relayField={...field,position:14,tiles:Array(35).fill('empty'),width:7,height:5};relayField.tiles[33]='animal';assert.equal(f.fieldRelayBearing(relayField,1),null);assert.equal(f.fieldRelayBearing(relayField,2),'남동쪽에서 약한 생체 신호 · 원거리');assert.equal(f.fieldRelayBearing({...relayField,tiles:Array(35).fill('empty')},3),null);
console.log('PASS capped base upgrades, saved levels, wall occlusion, persistent map discovery and coarse CCTV relay bearings');
