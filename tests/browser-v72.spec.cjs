const {test,expect}=require('@playwright/test'),fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame,startRun}=require('../src/lib/game-v10.ts'),{recruitCrew}=require('../src/lib/crew.ts'),{emptyOriginZero}=require('../src/lib/origin-zero.ts');
const KEY='last-enclosure-ark-v10';
async function seed(page,s){await page.addInitScript(({s,KEY})=>{if(!sessionStorage.getItem('v72-seed')){localStorage.setItem(KEY,JSON.stringify(s));sessionStorage.setItem('v72-seed','1')}},{s,KEY});await page.goto('/');}
async function skipStory(page){await page.addLocatorHandler(page.locator('.v44-story-overlay'),()=>page.locator('.v44-story-overlay .is-skip').click(),{noWaitAfter:true});}
test('ranger uses changing walk frames during real movement, then returns to idle',async({page})=>{
 let s=beginGame('medic','generator');s.day=5;s.tutorialStep=9;s=startRun(s,'garden',['flashlight']);
 await skipStory(page);await seed(page,s);await page.getByRole('button',{name:'탐사',exact:true}).click();
 await expect(page.locator('.v33-route-player .v72-ranger.is-idle')).toBeVisible();
 await page.evaluate(()=>{window.walkFrames=[];window.walkTimer=setInterval(()=>{const el=document.querySelector('.v72-ranger.is-walking>span');if(el)window.walkFrames.push(getComputedStyle(el).backgroundPositionX)},20)});
 const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field.position,KEY);
 await page.locator('.v62-route-walkable:not([disabled])').first().click();
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field.position,KEY)).not.toBe(before);
 const frames=await page.evaluate(()=>{clearInterval(window.walkTimer);return [...new Set(window.walkFrames)]});expect(frames.length).toBeGreaterThanOrEqual(2);
 await expect(page.locator('.v72-ranger.is-walking')).toHaveCount(0);
 await expect(page.locator('.v33-route-player .v72-ranger.is-idle')).toBeVisible();
 await page.screenshot({path:'docs/qa-v71/v72-field-walk.png',fullPage:true});
});
test('critically unstable medic remains visibly critical in roster, detail modal and dialogue',async({page})=>{
 const s=beginGame('medic','generator');s.day=10;s.tutorialStep=9;s.onboardingSeen=['base-work'];recruitCrew(s,'rabbit','RB-001');s.crew.members[0].mind=20;
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Suppress the independent base-work onboarding so the staff portrait check can open its own conversation.
 await seed(page,s);
 await page.getByRole('button',{name:'의무관 직원 상세',exact:true}).click();
 await expect(page.locator('.v45-roster-item.arrived img')).toHaveAttribute('src','/assets/staff/rabbit/portrait_critical.webp');
 await expect(page.locator('.v67-staff-modal img')).toHaveAttribute('src','/assets/staff/rabbit/portrait_critical.webp');
 await page.getByRole('button',{name:/^대화\s/}).click();
 await expect(page.locator('.v44-story-eve-image img')).toHaveAttribute('src','/assets/staff/rabbit/portrait_critical.webp');
 await expect(page.locator('.v44-story-eve-image img')).toHaveCount(1);
 await expect(page.locator('.v44-story-scene')).toHaveCSS('background-color','rgb(23, 20, 33)');
 const reveal=page.getByRole('button',{name:'글 즉시 펼치기'});if(await reveal.isEnabled())await reveal.click();
 await page.screenshot({path:'docs/qa-v71/v72-critical-dialogue.png',fullPage:true});expect(errors).toEqual([]);
});
test('archivist conversation transitions neutral, unstable, critical, then resolve on authored lines',async({page})=>{
 const {emptyArchive}=require('../src/lib/specimen-archive.ts');const s=beginGame('medic','generator');s.day=3;s.tutorialStep=9;s.onboardingSeen=['base-work'];s.ap=5;s.food=5;s.flags.humanTruth=true;s.originZero={...emptyOriginZero(),photos:10};s.archive=emptyArchive();recruitCrew(s,'deer','DR-001');Object.assign(s.crew.members[0],{bond:65,memoryStage:1});s.archive.entries['DR-001']={key:'DR-001',species:'deer',name:'deer',firstDay:1,lastDay:3,status:'transferred',captureMethod:'fixture',observedTraits:[],records:[],maxStress:0,maxMemory:0};
 await seed(page,s);await page.getByRole('button',{name:'서기관 직원 상세',exact:true}).click();await page.getByRole('button',{name:/^대화\s/}).click();
 const portrait=page.locator('.v44-story-eve-image');await expect(portrait).toHaveAttribute('data-mood','neutral');await expect(portrait.locator('img')).toHaveAttribute('src','/assets/staff/deer/portrait.webp');
 await page.getByRole('button',{name:'다음 대사'}).click();await expect(portrait).toHaveAttribute('data-mood','anxious');await expect(portrait.locator('img')).toHaveAttribute('src','/assets/staff/deer/portrait_unstable.png');
 await page.getByRole('button',{name:'다음 대사'}).click();await expect(portrait).toHaveAttribute('data-mood','critical');await expect(portrait.locator('img')).toHaveAttribute('src','/assets/characters/eve_critical.png');
 await page.getByRole('button',{name:'다음 대사'}).click();await expect(portrait).toHaveAttribute('data-mood','critical');await expect(portrait.locator('img')).toHaveAttribute('src','/assets/staff/deer/portrait_critical.png');
 await page.getByRole('button',{name:'다음 대사'}).click();await expect(portrait).toHaveAttribute('data-mood','resolve');await expect(portrait.locator('img')).toHaveAttribute('src','/assets/characters/protagonist_resolve.png');
});
test('wolf guard neural collapse displays the dedicated transformation cinematic',async({page})=>{
 const {queueCrewTerminations}=require('../src/lib/crew.ts');
 const s=beginGame('medic','generator');s.day=10;s.tutorialStep=9;s.onboardingSeen=['base-work'];recruitCrew(s,'wolf','WF-001');s.crew.members[0].mind=0;queueCrewTerminations(s);
 await seed(page,s);
 const scene=page.locator('.v49-collapse-image img');
 await expect(scene).toHaveAttribute('src','/assets/cinematics/staff-terminations/wolf/scene.webp');
 await expect.poll(()=>scene.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
});
test('current cinematic opens without cropping or duplicate characters from UI layers',async({page})=>{
 const s=beginGame('medic','generator');s.day=20;s.tutorialStep=9;s.originZero={...emptyOriginZero(),cat:'shelter',route:'shelter',firstPositiveDay:20,photos:9};
 await skipStory(page);await seed(page,s);await page.getByRole('button',{name:'분석실',exact:true}).click();
 await page.locator('.v71-story-archive summary').click();await page.getByRole('button',{name:'기원 표식 일치 장면 보기'}).click();
 const dialog=page.getByRole('dialog',{name:'복원된 사건 영상 보기'});await expect(dialog).toBeVisible();await expect(dialog.locator('img')).toHaveCount(1);
 await expect(dialog.locator('img')).toHaveAttribute('src',/(scene_m00_positive|SCN_11_m00_origin_signature)/);await expect(dialog.locator('img')).toHaveCSS('object-fit','contain');
 await expect.poll(()=>dialog.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 await page.screenshot({path:'docs/qa-v71/v72-cinematic.png',fullPage:true});
 await dialog.getByRole('button',{name:'다음 장면'}).click();await expect(dialog.locator('img')).toHaveAttribute('src',/(scene_m00_protect|SCN_13_m00_protection)/);
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});
