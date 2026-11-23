const {test,expect}=require('@playwright/test');
const fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame,startRun}=require('../src/lib/game-v10.ts');
const {createCapture}=require('../src/lib/tactical-field.ts');
const KEY='last-enclosure-ark-v10';
async function state(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY)}
async function seed(page,s){
 await page.addInitScript(({s,KEY})=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(KEY,JSON.stringify(s));sessionStorage.setItem('seeded','1')}},{s,KEY});
 await page.addLocatorHandler(page.locator('.v44-story-overlay'),()=>page.locator('.v44-story-overlay .is-skip').click(),{noWaitAfter:true});
 await page.goto('/');
}
test('fresh opening reaches support selection and persists first day',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'최초 통신 복원'}).click();
 await page.getByRole('button',{name:/건너뛰|스킵/}).first().click();
 await page.locator('.v44-story-overlay .is-skip').click();
 await page.getByRole('button',{name:/선택 확정/}).click();
 await expect.poll(async()=> (await state(page))?.day).toBe(1);
 await page.reload();await expect.poll(async()=> (await state(page))?.tutorialStep).toBe(1);
});
test('recovered photos load, enlarge and close with Escape while early records stay locked',async({page})=>{
 const {emptyOriginZero}=require('../src/lib/origin-zero.ts');
 const s=beginGame('medic','generator');s.day=20;s.tutorialStep=9;s.originZero={...emptyOriginZero(),cat:'shelter',route:'shelter',firstPositiveDay:20,photos:9};
 await seed(page,s);await page.getByRole('button',{name:'분석실',exact:true}).click();
 await expect(page.locator('.v71-photo-open')).toHaveCount(9);await expect(page.locator('.oz-photo-grid .locked')).toHaveCount(3);
 await page.getByRole('button',{name:'PHOTO 08 · 아버지와 딸 확대'}).click();
 await expect(page.locator('.v71-photo-dialog')).toBeVisible();
 await expect.poll(()=>page.locator('.v71-photo-dialog>img').evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 await page.keyboard.press('Escape');await expect(page.locator('.v71-photo-dialog')).not.toBeVisible();
 await page.locator('.v71-story-archive summary').click();
 await expect(page.locator('.v71-story-grid')).not.toContainText('실패라고 이름 붙인 생명');
 await page.screenshot({path:'docs/qa-v71/archive.png',fullPage:true});
});
test('night fuse wrong order resets and correct order changes the actual saved settlement',async({page})=>{
 const fixture=JSON.parse(fs.readFileSync(require('path').join(__dirname,'fixtures/day003-ap0.json'),'utf8'));
 const {previewNight,nightCircuitSequence}=require('../src/lib/game-v10.ts');
 await seed(page,fixture);await page.getByRole('button',{name:/야간 대응/}).last().click();
 await page.locator('.v73-legacy-repair summary').click();
 const f=page.locator('.v69-fuse-buttons button'),sequence=nightCircuitSequence(fixture.day);
 // One out-of-order input must reset immediately; then use the voltage order shown by the live game.
 await f.nth(sequence[1]).click();await expect(page.locator('.v69-fuse-buttons .is-connected')).toHaveCount(0);
 for(const i of sequence)await f.nth(i).click();
 await expect(page.locator('.v69-fuse-buttons .is-connected')).toHaveCount(4);
 const before=await state(page),expected=previewNight(before,'shield',{maintained:true});
 await page.getByRole('button',{name:/야간 운영 확정|무방비로 다음 날/}).last().click();
 await expect.poll(async()=> (await state(page)).day).toBe(4);
 // Night power preview is before automatic facility dispatch; settlement also pays each powered facility draw.
 expect((await state(page)).power).toBe(expected.powerAfter-expected.facilityDispatch.spent);
 await page.reload();expect((await state(page)).ap).toBe(4);
});
test('tutorial facility mission routes to supplies even with zero AP',async({page})=>{
 const s=beginGame('medic','generator');s.tutorialStep=7;s.ap=0;s.day=3;
 await seed(page,s);await page.locator('.echo-first-mission button').click();
 await expect(page.getByRole('heading',{name:'보급 · 전력 · 시설 정비'})).toBeVisible();
 expect((await state(page)).ap).toBe(0);
});
test('hunt earned evidence, pointer net capture and pending save survive reload',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let s=beginGame('medic','generator');s.tutorialStep=9;s.day=5;s=startRun(s,'garden',['flashlight']);s.capture=createCapture('rabbit',false,123);
 await seed(page,s);await page.getByRole('button',{name:'탐사',exact:true}).click();
 const listen=page.locator('.v71-primary-tools button').first();
 for(let i=1;i<=5;i++){await listen.click();await expect.poll(async()=> (await state(page)).capture?.hunt.turn).toBe(i)}
 await expect(page.locator('.v71-trail-zone')).toHaveCount(4);
 await page.reload();await page.getByRole('button',{name:'탐사',exact:true}).click();
 await expect(page.locator('.v71-trail-zone')).toHaveCount(4);
 // Choose only from visible four-cell evidence, without reading hidden position.
 const target=page.locator('.v71-trail-zone').first();await target.scrollIntoViewIfNeeded();
 const net=page.locator('.v69-drag-net');await net.scrollIntoViewIfNeeded();
 const a=await net.boundingBox(),b=await target.boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await page.mouse.up();
 const after=await state(page);expect(after.pending||after.capture?.hunt.turn===6).toBeTruthy();
 if(after.pending){await page.reload();expect((await state(page)).pending).toBe('rabbit')}
 expect(errors).toEqual([]);
});
for(const [width,height] of [[1366,768],[390,844]])test(`pixel hunt fits and renders all assets ${width}`,async({page})=>{
 await page.setViewportSize({width,height});let s=beginGame('medic','generator');s.day=5;s.tutorialStep=9;s=startRun(s,'garden',['flashlight']);s.capture=createCapture('rabbit',false,123);
 await seed(page,s);await page.getByRole('button',{name:'탐사',exact:true}).click();
 await expect(page.locator('.v33-hidden-map')).toBeVisible();
 const budget=page.locator('.v74-capture-budget');await expect(budget.getByRole('status')).toContainText('포획 남은 행동');
 const captureStatus=budget.getByRole('status');await expect(captureStatus.locator('.v74-actions-copy>p')).toContainText('AP와 별도');
 const content=await captureStatus.evaluate(el=>{const box=selector=>{const r=el.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}};return {copy:box('.v74-actions-copy'),title:box('.v74-actions-copy>span'),note:box('.v74-actions-copy>p'),count:box(':scope>strong')}});
 expect(content.title.bottom).toBeLessThanOrEqual(content.note.y+1);expect(content.copy.right).toBeLessThanOrEqual(content.count.x+1);
 const layout=await budget.evaluate(el=>{const boxes=[...el.children].map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}});return {boxes,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}});
 expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth+1);
 for(let i=0;i<layout.boxes.length;i++)for(let j=i+1;j<layout.boxes.length;j++){const a=layout.boxes[i],b=layout.boxes[j];expect(Math.min(a.right,b.right)-Math.max(a.x,b.x)>0&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>0,`capture toolbar children ${i}/${j} overlap`).toBe(false)}
 await expect.poll(()=>page.locator('.v71-grass').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+3);
 await page.screenshot({path:`docs/qa-v71/hunt-${width}.png`,fullPage:true});
});
test('low facility power displays an explicit red unguarded-night warning',async({page})=>{
 const s=beginGame('medic','generator');s.day=7;s.tutorialStep=9;s.power=0;s.onboardingSeen=['first-sortie','field-map','cctv','night-shift','first-capture','base-work'];
 await seed(page,s);const warning=page.getByRole('alert',{name:'야간 전력 부족 경고'});await expect(warning).toBeVisible();
 await expect(warning).toContainText('무방비로 지나갑니다');
 expect(await warning.evaluate(el=>getComputedStyle(el).borderColor)).toMatch(/rgb\(229, 93, 86\)|rgb\(255, 104, 95\)/);
});
test('first expedition tutorial reaches a durable rescued rabbit without hidden coordinates',async({page})=>{
 test.setTimeout(90000);
 await seed(page,beginGame('medic','generator'));
 await page.addLocatorHandler(page.locator('.v61-tour-overlay'),()=>page.getByRole('button',{name:'튜토리얼 화면 강조 닫기'}).click(),{noWaitAfter:true});
 await page.addLocatorHandler(page.locator('.v41-rewards-shade'),()=>page.locator('.v41-rewards-shade button').last().click(),{noWaitAfter:true});
 await page.locator('[data-tour=first-signal]').click();
 await page.locator('.zone-card').first().click();
 await page.locator('[data-tour=launch]').click();
 await expect.poll(async()=>!!(await state(page)).field).toBe(true);
 for(const target of [15,16,17]){
  if((await state(page)).field.choice)await page.locator('.v62-map-choice-card button').first().click();
  await page.locator('.v33-route-cell').nth(target).click();
  await expect.poll(async()=> (await state(page)).field.position).toBe(target);
 }
 await expect(page.locator('.v33-hidden-map')).toBeVisible();
 for(let i=0;i<13&&(await state(page)).capture;i++){
  await page.locator('.v71-primary-tools button').first().click();
 }
 await expect.poll(async()=> (await state(page)).pending).toBe('rabbit');
 // A reload must restore the actual rescue choice, not discard the captured animal.
 await page.reload();await page.getByRole('button',{name:/격리실로 구조한다/}).click();
 await expect.poll(async()=> (await state(page)).animals.some(a=>a.id==='rabbit'&&a.alive)).toBe(true);
 await page.getByRole('button',{name:/결과 확인 · 현장 수색 계속하기/}).click();
 await page.getByRole('button',{name:/긴급 귀환/}).click();
 await expect.poll(async()=> (await state(page)).run).toBe(null);
 await page.reload();expect((await state(page)).tutorialStep).toBe(4);
 expect((await state(page)).animals.filter(a=>a.id==='rabbit')).toHaveLength(1);
 await page.getByRole('button',{name:'격리실',exact:true}).click();
 await page.getByRole('button',{name:/격리실 01.*흰 토끼/}).click();
 await page.getByRole('button',{name:/행동 관찰/}).first().click();
 await page.locator('.v36-care-options button').first().click();
 await page.getByRole('button',{name:'EVE의 공명 연구 안내 듣기'}).click();
 await page.getByRole('button',{name:'공명 연구',exact:true}).click();
 await page.locator('[data-tour=research-target]').click();
 for(let i=0;i<3;i++){
  await page.locator('.protocol-choices button:not([disabled])').first().click();
  await page.getByRole('button',{name:'반응 기록 확정 · 다음 단계'}).click();
 }
 await expect.poll(async()=> (await state(page)).tutorialStep).toBe(6);
 await page.addLocatorHandler(page.locator('.result-v10'),()=>page.locator('.result-v10 button').last().click(),{noWaitAfter:true});
 await page.getByRole('button',{name:'본부 통신',exact:true}).click();
 await page.getByRole('button',{name:'첫 토끼 생체 이송 승인'}).click();
 await expect.poll(async()=> (await state(page)).headquarters.transferred.includes('rabbit')).toBe(true);
 await page.getByRole('button',{name:/하루 종료|야간 대응으로 다음 날/}).last().click();
 await page.getByRole('button',{name:'예비 전력 방어 · 첫날 종료'}).click();
 await expect.poll(async()=> (await state(page)).day).toBe(2);
 await page.reload();expect((await state(page)).crew.members.some(m=>m.id==='rabbit')).toBe(true);
 if((await state(page)).pendingIncident){
  await page.locator('.event-options button:not([disabled])').nth(1).click();
  await page.getByRole('button',{name:'보고 확인 · 다음 일과'}).click();
 }
 await page.getByRole('button',{name:'보급',exact:true}).click();
 for(const facility of ['CCTV 감시망','병리·검시실']){
  await page.locator('.v36-facility-card').filter({has:page.getByRole('heading',{name:facility,exact:true})}).getByRole('button').click();
 }
 await expect.poll(async()=> (await state(page)).tutorialStep).toBe(8);
 await page.getByRole('button',{name:'CCTV',exact:true}).click();
 await expect.poll(async()=> (await state(page)).tutorialStep).toBe(9);
 await page.reload();expect((await state(page)).tutorialStep).toBe(9);
});
