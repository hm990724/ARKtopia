const {test,expect}=require('@playwright/test'),fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame,startRun}=require('../src/lib/game-v10.ts'),{makeAnimal}=require('../src/lib/sim.ts');
const KEY='last-enclosure-ark-v10';
async function state(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY)}
async function seed(page,s){await page.addInitScript(({s,KEY})=>{if(!sessionStorage.getItem('v73seed')){localStorage.setItem(KEY,JSON.stringify(s));sessionStorage.setItem('v73seed','1')}},{s,KEY});await page.addLocatorHandler(page.locator('.v44-story-overlay'),()=>page.locator('.v44-story-overlay .is-skip').click(),{noWaitAfter:true});await page.goto('/');}
function base(day=4){const s=beginGame('medic','generator');s.day=day;s.tutorialStep=9;s.parts=10;s.facility=60;s.facilities.cctv=true;return s;}
test('opening scene has readable start on desktop and mobile, all hero portraits share 3:4',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'ORIGIN ZERO'})).toBeVisible();await expect(page.locator('.v73-opening footer')).toContainText('ARKtopia · ORIGIN ZERO');
 for(const [width,height] of [[1366,768],[390,844]]){await page.setViewportSize({width,height});await expect(page.getByRole('button',{name:'최초 통신 복원'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);expect((await page.locator('.v73-opening').boundingBox()).width).toBeGreaterThanOrEqual(width-2);await page.screenshot({path:`test-results/v73-opening-${width}.png`,fullPage:true});}
 const dims=await page.evaluate(async()=>Promise.all(['neutral','anxious','critical','resolve'].map(m=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve([i.naturalWidth,i.naturalHeight]);i.onerror=()=>resolve([0,1]);i.src='/assets/characters/protagonist_'+m+'.png'}))));
 dims.forEach(size=>expect(size).toEqual([768,1024]));
});
test('walking feet retain the same tile baseline and scale before, during and after motion',async({page})=>{
 let s=base(5);s=startRun(s,'garden',['flashlight']);await seed(page,s);await page.getByRole('button',{name:'탐사',exact:true}).click();
 const idle=page.locator('.v33-route-current .v72-ranger');await expect(idle).toBeVisible();
 async function measure(){return idle.evaluate(el=>{const r=el.getBoundingClientRect(),t=el.closest('button').getBoundingClientRect();return {width:r.width,tile:t.width,foot:r.top+r.height*.98,anchor:t.top+t.height*.85}})}
 const before=await measure();expect(Math.abs(before.foot-before.anchor)).toBeLessThan(3);
 await page.evaluate(()=>{window.walkSizes=[];window.walkPoll=setInterval(()=>{const e=document.querySelector('.v42-walker-path .v72-ranger');if(e){const r=e.getBoundingClientRect();window.walkSizes.push(r.width)}},16)});
 const target=await page.evaluate(key=>{const f=JSON.parse(localStorage.getItem(key)).field,w=f.width??7,p=f.position;return [p-w,p+1,p+w,p-1].find(i=>i>=0&&i<f.tiles.length&&Math.abs(i%w-p%w)+Math.abs(Math.floor(i/w)-Math.floor(p/w))===1&&f.tiles[i]==='empty')},KEY);expect(target).toBeDefined();
 await page.locator('.v33-route-cell').nth(target).click();await expect.poll(async()=> (await state(page)).field.position).not.toBe(s.field.position);
 const widths=await page.evaluate(()=>{clearInterval(window.walkPoll);return window.walkSizes});expect(widths.length).toBeGreaterThan(0);for(const w of widths)expect(Math.abs(w-before.width)).toBeLessThan(4);
 const after=await measure();expect(Math.abs(after.foot-after.anchor)).toBeLessThan(3);await page.screenshot({path:'test-results/v73-grounded-walk.png',fullPage:true});
});
test('CCTV comparison exposes the changed detail; observed patrol survives reload and holds escalation',async({page})=>{
 const s=base(6);s.animals=[makeAnimal('rabbit',1)];s.security.incident={animalId:'rabbit',status:'alert',camera:'CAM-02',severity:65,steps:1,description:'잠금 이상',detected:false};
 await seed(page,s);await page.getByRole('button',{name:'CCTV',exact:true}).click();
 await page.locator('.cctv-channels button').filter({hasText:'CAM-02'}).click();
 await expect(page.locator('.v73-evidence-point.has-trace')).toHaveCount(1);await page.getByRole('button',{name:'정기 점검 기준과 비교'}).click();await expect(page.locator('.v73-evidence-point.has-trace')).toHaveCount(0);await expect(page.locator('.v73-evidence-point').first()).toBeDisabled();
 await page.getByRole('button',{name:'현재 영상으로 돌아가기'}).click();await page.locator('.v73-evidence-point.has-trace').click();
 await expect.poll(async()=> (await state(page)).security.incident.manualInspected).toBe(true);await page.screenshot({path:'test-results/v73-cctv.png',fullPage:true});
 await page.getByRole('button',{name:'중앙',exact:true}).click();await page.getByRole('button',{name:/야간 대응/}).last().click();
 await page.getByRole('button',{name:/직접 대응 예약/}).click();await page.getByRole('button',{name:'야간 운영 닫기'}).click();const before=await state(page);expect(before.mind).toBe(s.mind);expect(before.security.watchPlan.response).toBe('intervene');
 await page.reload();expect((await state(page)).security.watchPlan.response).toBe('intervene');
 await page.getByRole('button',{name:/야간 대응/}).last().click();await page.screenshot({path:'test-results/v73-night-plan.png',fullPage:true});await page.getByRole('button',{name:'야간 운영 확정',exact:false}).last().click();
 await expect.poll(async()=> (await state(page)).day).toBe(7);const after=await state(page);expect(after.security.incident.status).toBe('alert');expect(after.security.incident.steps).toBe(1);expect(after.security.lastWatch.helped).toBe(true);expect(after.mind).toBe(before.mind-5);
});
test('new mutant sprites and matching hero portrait are consumed by the actual roster',async({page})=>{
 const s=base(10);s.animals=[makeAnimal('axolotl',1)];s.animals[0].mutated=true;
 await seed(page,s);
 await expect(page.locator('.awakening-shade')).toBeVisible();
 for(let i=0;i<6;i++)await page.locator('.awakening-next').click();
 await page.getByRole('button',{name:'격리실',exact:true}).click();await expect(page.locator('img[src="/assets/animals/axolotl_mutant.png"]').first()).toBeVisible();
 await expect(page.locator('.v43-operator-head img')).toHaveAttribute('src','/assets/characters/protagonist_neutral.png');expect(await page.locator('img[src="/assets/animals/axolotl_mutant.png"]').first().evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
});


test('mobile CCTV and night choices fit the viewport with a reachable confirmation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const s=base(4);s.animals=[makeAnimal('rabbit',1)];s.security.incident={animalId:'rabbit',status:'alert',camera:'CAM-02',severity:65,steps:1,description:'잠금 이상',detected:false};
 await seed(page,s);await page.getByRole('button',{name:'CCTV',exact:true}).click();await page.locator('.cctv-channels button').filter({hasText:'CAM-02'}).click();
 const point=page.locator('.v73-evidence-point.has-trace');await point.scrollIntoViewIfNeeded();await expect(point).toBeInViewport();await point.click();expect((await state(page)).security.incident.manualInspected).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(393);await page.screenshot({path:'test-results/v73-cctv-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'중앙',exact:true}).click();await page.getByRole('button',{name:/야간 대응/}).last().click();await page.getByRole('button',{name:/직접 대응 예약/}).click();
 const confirm=page.getByRole('button',{name:'야간 운영 확정',exact:false}).last();await expect(confirm).toBeInViewport();await expect(page.locator('.v42-telemetry')).toBeHidden();await page.screenshot({path:'test-results/v73-night-mobile.png',fullPage:false});
});

test('first roaming MUTANT encounter shows its dedicated cinematic reveal',async({page})=>{
 const {beginRoamingCombat}=require('../src/lib/field-combat.ts');
 let s=base(5);s=startRun(s,'garden',['flashlight']);
 s.field.threat={position:s.field.exitIndex,origin:s.field.exitIndex,alert:70,mode:'closing',stage:'chase',ticks:0};
 expect(beginRoamingCombat(s)).toBe(true);expect(s.field.combat.introPending).toBe(true);
 await seed(page,s);await page.getByRole('button',{name:'탐사',exact:true}).click();
 const intro=page.getByRole('dialog',{name:'최초 배회 위협 조우 · MUTANT'});await expect(intro).toBeVisible();
 const still=intro.locator('img').first();await expect(still).toHaveAttribute('src','/assets/cinematics/field-threats/roaming-mutant/reveal.png');
 await expect.poll(()=>still.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
});
for(const [enemy,label] of [['slime','오염 점액체'],['echo','신경 잔향체']])test(`first roaming ${label} encounter uses its creature-specific cinematic`,async({page})=>{
 const {beginRoamingCombat}=require('../src/lib/field-combat.ts');let s=base(6);s=startRun(s,'conservatory',['flashlight']);
 s.field.threat={kind:enemy,position:s.field.exitIndex,origin:s.field.exitIndex,alert:62,mode:'closing',stage:'chase',ticks:0};
 expect(beginRoamingCombat(s)).toBe(true);expect(s.field.combat.enemy).toBe(enemy);expect(s.field.combat.introPending).toBe(true);
 await seed(page,s);await page.getByRole('button',{name:'탐사',exact:true}).click();
 const intro=page.getByRole('dialog',{name:`최초 배회 위협 조우 · ${label}`});await expect(intro).toBeVisible();
 const still=intro.locator('img').first();await expect(still).toHaveAttribute('src',`/assets/cinematics/field-threats/roaming-${enemy}/reveal.png`);
 await expect.poll(()=>still.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
});

