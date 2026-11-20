/** ARKtopia v70 regression suite: source data and real simulation transitions. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(mod,file)=>{const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});mod._compile(out.outputText,file);};
const root=path.resolve(__dirname,'..');
const g=require(path.join(root,'src/lib/game-v10.ts'));
const nav=require(path.join(root,'src/lib/navigation.ts'));
const hunt=require(path.join(root,'src/lib/hidden-hunt.ts'));
const tests=[];
function test(title,fn){tests.push([title,fn]);}
function game(){const s=g.beginGame('artist','generator');s.day=3;s.ap=0;s.power=82;s.facility=88;s.tutorialStep=7;s.crew.pendingNightVote=null;s.pendingIncident=null;return s;}

test('01 DAY 003 / AP 0: supplies navigation is accessible without spending AP',()=>{
 const s=game();s.tutorialStep=2;
 assert.equal(nav.tabLockReason(s,'supplies'),null);
 assert.equal(s.ap,0);assert.equal(s.day,3);
 assert.ok(nav.tabLockReason(s,'animals'));
});
test('02 AP 0: nightly transition advances a day (no AP prerequisite)',()=>{
 const s=game();const x=g.resolveNightTransition(s,'shield');
 assert.equal(x.success,true);assert.equal(x.state.day,4);assert.notEqual(x.state,s);
});
test('03 daily AP resets to 4; station early-day AP 5 remains unchanged',()=>{
 const s=game(),out=g.finishDay(s,'standby');assert.equal(out.day,4);assert.equal(out.ap,4);
 const station=g.beginGame('artist','station');station.ap=0;station.power=90;
 const st=g.finishDay(station,'shield');assert.equal(st.day,2);assert.equal(st.ap,5);
});
test('04 no power and no AP: costly standby advances with actual penalties',()=>{
 const s=game();s.power=0;s.facility=50;s.threat=8;const x=g.resolveNightTransition(s,'shield');
 assert.equal(g.getDayEndBlocker(s),null);assert.equal(x.applied,'standby');assert.equal(x.success,true);
 assert.equal(x.state.ap,4);assert.equal(x.state.day,4);assert.ok(x.state.threat>s.threat);
 assert.ok(x.state.facility<s.facility);
});
test('05 active incident correctly blocks with exact reason and route',()=>{
 const s=game();s.pendingIncident='blackout';const b=g.getDayEndBlocker(s);
 assert.equal(b.code,'incident');assert.ok(b.message.includes('전력망 이상'));assert.equal(b.tab,'hub');
 assert.equal(g.finishDay(s,'standby'),s);assert.equal(g.resolveNightTransition(s,'standby').success,false);
 const cleared=g.resolveIncident(s,1);assert.equal(cleared.pendingIncident,null);assert.equal(g.getDayEndBlocker(cleared),null);
});
test('06 fuse maintenance must never make a blocked result appear successful',()=>{
 const s=game();s.pendingIncident='echo';const out=g.resolveNightTransition(s,'shield',{maintained:true,guided:true});
 assert.equal(out.success,false);assert.equal(out.state,s);assert.equal(out.state.day,3);assert.equal(out.state.ap,0);
 assert.equal(s.power,82);assert.equal(s.facility,88);assert.equal((s.onboardingSeen??[]).includes('first-night-defense'),false);
});
test('07 fuse bonus counts BEFORE selected night defense and is persisted',()=>{
 const s=game();s.power=20;s.facility=65;s.threat=10;
 const a=g.previewNight(s,'shield');const b=g.previewNight(s,'shield',{maintained:true});
 assert.equal(a.applied,'standby');assert.equal(b.applied,'shield');assert.equal(b.powerBefore,24);
 const result=g.resolveNightTransition(s,'shield',{maintained:true});assert.equal(result.success,true);
 assert.equal(result.applied,'shield');assert.equal(result.state.power,b.powerAfter);
 assert.ok(result.state.facility>g.resolveNightTransition(s,'shield').state.facility);
});
test('08 day/AP persist together through legacy-key JSON save and load',()=>{
 const s=game();s.ap=0;const out=g.resolveNightTransition(s,'rest').state;
 const saved=JSON.stringify(out);const loaded=g.loadGame(JSON.parse(saved));
 assert.equal(loaded.day,out.day);assert.equal(loaded.ap,out.ap);assert.equal(loaded.ap,4);
 assert.equal(loaded.facility,out.facility);
});
test('09 tutorial supply stages 6/7, including zero AP, navigate properly',()=>{
 for(const step of [1,3,6,7,8]){const s=game();s.tutorialStep=step;s.ap=0;
  assert.equal(nav.tabLockReason(s,'supplies'),null,`tutorial ${step}`);
 }
 const src=fs.readFileSync(path.join(root,'src/components/Game.tsx'),'utf8');
 assert.match(src,/onClick=\{\(\)=>enterTab\(s\.power<35\?'supplies'/);
 assert.match(src,/const openDayEnd=/);
});
test('10 listening, near-signal, direct pointer net handlers remain in actual game UI',()=>{
 const field=fs.readFileSync(path.join(root,'src/components/FieldMission.tsx'),'utf8');
 for(const token of ['String(hunt.lastEvent ?? "").includes("근접 신호")','String(hunt.lastEvent ?? "").includes("청음 결과")','is-near','is-listen','<Radio','onPointerDown','onPointerMove','onPointerUp','netDrag'])assert.ok(field.includes(token),`missing ${token}`);
 const h=hunt.newHunt('otter',2026);assert.equal(typeof h.lastEvent,'string');assert.equal(h.outcome,'playing');
});
test('11 protected day-commit UI cannot apply a second day from a rapid double click',()=>{
 const src=fs.readFileSync(path.join(root,'src/components/Game.tsx'),'utf8');
 assert.ok(src.includes('if(!s||nightCommitRef.current)return;'));
 assert.ok(src.includes('nightCommitRef.current=true;'));
 assert.ok(src.includes('const {state:n,success,blocker,applied}=resolveNightTransition'));
 assert.ok(src.includes('nightCommitRef.current=false;},[s?.day]'));
});
test('12 story/old-save compatibility: ORIGIN ZERO photos, staff, endings remain',()=>{
 const original=game();delete original.originZero;delete original.narrative;original.tutorialStep=9;
 const restored=g.loadGame(JSON.parse(JSON.stringify(original)));assert.ok(restored.originZero);assert.ok(restored.narrative);
 const origin=require(path.join(root,'src/lib/origin-zero.ts'));assert.equal(origin.photoRecords.length,12);
 const art=require(path.join(root,'src/lib/ending-art.ts'));assert.ok(fs.existsSync(path.join(root,'public/assets/endings')));
 assert.ok(Object.keys(art).length>0);
 const src=fs.readFileSync(path.join(root,'src/components/Game.tsx'),'utf8');
 assert.ok(src.includes("last-enclosure-ark-v10"));
});
test('13 blockers identify ongoing expedition, voice, staff vote and HQ order',()=>{
 const s=game();s.run={region:'garden'};assert.equal(g.getDayEndBlocker(s).code,'expedition');s.run=null;
 s.voice.pending={};assert.equal(g.getDayEndBlocker(s).code,'voice');s.voice.pending=null;
 s.crew.pendingNightVote={};assert.equal(g.getDayEndBlocker(s).code,'night-vote');s.crew.pendingNightVote=null;
 s.hqOrders.active={status:'offered'};assert.equal(g.getDayEndBlocker(s).code,'hq-order');
});
test('14 guided tutorial defense is a one-time rule, only on successful day change',()=>{
 const s=game();s.power=0;
 const x=g.resolveNightTransition(s,'shield',{guided:true});assert.equal(x.success,true);
 assert.equal(x.applied,'shield');assert.equal(x.state.day,4);
 assert.ok(x.state.onboardingSeen.includes('first-night-defense'));
 assert.equal(s.onboardingSeen.includes('first-night-defense'),false);
});
let fails=0;
for(const [title,fn] of tests){try{fn();console.log('PASS',title);}catch(error){fails++;console.error('FAIL',title,error.stack||error);}}
console.log(`${tests.length-fails}/${tests.length} v70 regressions passed`);
if(fails)process.exitCode=1;
