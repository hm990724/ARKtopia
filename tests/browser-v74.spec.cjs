const {test,expect}=require('@playwright/test');
const fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame}=require('../src/lib/game-v10.ts');
const {makeAnimal}=require('../src/lib/sim.ts');
const {emptyOriginZero}=require('../src/lib/origin-zero.ts');
const archive=require('../src/lib/specimen-archive.ts');
const KEY='last-enclosure-ark-v10';
async function state(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY)}
async function seed(page,s){await page.addInitScript(({s,key})=>{if(!sessionStorage.getItem('v74-recall-seed')){localStorage.setItem(key,JSON.stringify(s));sessionStorage.setItem('v74-recall-seed','1')}},{s,key:KEY});await page.addLocatorHandler(page.locator('.v44-story-overlay'),()=>page.locator('.v44-story-overlay .is-skip').click(),{noWaitAfter:true});await page.goto('/')}
test('ARK RECALL specimen puzzle persists mid-session and resolves only after three inputs',async({page})=>{
 const s=beginGame('medic','generator');s.day=20;s.ap=10;s.power=100;s.tutorialStep=9;s.animals=[makeAnimal('rabbit',1)];archive.ensureArchive(s);s.originZero={...emptyOriginZero(),cat:'shelter',route:'shelter',firstPositiveDay:12,photos:6};
 await seed(page,s);await page.getByRole('button',{name:'분석실',exact:true}).click();
 const specimen=page.locator('.oz-recall-grid button').filter({hasText:'RB-001'});await expect(specimen).toBeVisible();await specimen.click();
 await expect(page.getByRole('dialog',{name:/개체별 기억 재수집/})).toBeVisible();await expect(page.locator('.ark-recall-card h3')).toContainText('임상 반응 순서');
 await page.locator('.ark-recall-choices button').first().click();await expect.poll(async()=> (await state(page)).originZero.recallSessions['RB-001'].step).toBe(1);
 await page.reload();await page.getByRole('button',{name:'분석실',exact:true}).click();await page.locator('.oz-recall-grid button').filter({hasText:'RB-001'}).click();
 await expect(page.locator('.ark-recall-meters')).toContainText('2 / 3');
 await page.locator('.ark-recall-choices button').first().click();await page.locator('.ark-recall-choices button').first().click();
 await expect(page.getByRole('dialog',{name:/개체별 기억 재수집/})).toHaveCount(0);
 const saved=await state(page),record=saved.originZero.individualRecalls['RB-001'];expect(record.steps).toHaveLength(3);expect(saved.ap).toBe(9);expect(saved.power).toBe(92);expect(saved.originZero.recallSessions['RB-001']).toBeUndefined();
});
