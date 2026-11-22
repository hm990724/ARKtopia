const {test,expect}=require('@playwright/test');
const fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame}=require('../src/lib/game-v10.ts');
const {ENDING_ART}=require('../src/lib/ending-art.ts');
const KEY='last-enclosure-ark-v10';
async function seed(page,s){await page.addInitScript(({s,key})=>localStorage.setItem(key,JSON.stringify(s)),{s,key:KEY});await page.goto('/')}

test('all 19 distinct ending artworks are served by the game',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async(files)=>Promise.all(files.map(file=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve({file,width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>resolve({file,error:true});image.src=`/assets/endings/${file}`}))),ENDING_ART.map(item=>item.file));
 for(const item of results){expect(item.error,item.file).toBeUndefined();expect(item.width,item.file).toBeGreaterThan(0);expect(item.height,item.file).toBeGreaterThan(0)}
});

test('daily incident opens with a contextual scene illustration and remains usable on mobile',async({page})=>{
 const s=beginGame('medic','generator');s.day=8;s.tutorialStep=9;s.pendingIncident='blackout';s.onboardingSeen=['first-sortie','field-map','cctv','night-shift','first-capture'];
 await page.setViewportSize({width:390,height:844});await seed(page,s);
 const dialog=page.getByRole('dialog').filter({has:page.locator('.v75-incident-art')});await expect(dialog).toBeVisible();
 const art=dialog.locator('.v75-incident-art img');await expect(art).toHaveAttribute('src','/assets/events/event_blackout_v75.png');await expect.poll(()=>art.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
 await dialog.locator('.v39-incident-options button:not([disabled])').first().click();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).pendingIncident,KEY)).toBe(null);
});
