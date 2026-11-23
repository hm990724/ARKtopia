const {test,expect}=require('@playwright/test'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const game=require('../src/lib/game-v10.ts'),KEY='last-enclosure-ark-v10';
async function seed(page,s){await page.addInitScript(({state,key})=>localStorage.setItem(key,JSON.stringify(state)),{state:s,key:KEY});await page.goto('/')}
test('region selection opens a clear preflight loadout modal before spending resources',async({page})=>{
 const s=game.beginGame('medic','generator');s.tutorialStep=9;s.onboardingSeen=['base-work','first-sortie','field-map','cctv','night-shift','first-capture'];await seed(page,s);
 await page.getByRole('button',{name:'탐사',exact:true}).click();await page.locator('.zone-card').first().click();
 const modal=page.getByRole('dialog',{name:/출동 준비/});await expect(modal).toBeVisible();await expect(modal).toContainText('위험 16%');await expect(modal).toContainText('오늘 하루 한 번');
 const flashlight=modal.getByRole('button',{name:/수동 손전등/}),scanner=modal.getByRole('button',{name:/EVE 스캐너/});await expect(flashlight).toHaveAttribute('aria-pressed','true');await scanner.click();await expect(scanner).toHaveAttribute('aria-pressed','true');await expect(flashlight).toHaveAttribute('aria-pressed','false');await expect(modal).toContainText('시설 전력');
 await flashlight.click();await modal.getByRole('button',{name:/출동 확정/}).click();await expect(modal).toBeHidden();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field?.position,KEY)).not.toBeUndefined();
});
test('mobile contaminant enters central combat and retreat preserves the pursuer',async({page})=>{
 let s=game.beginGame('medic','generator');s.day=4;s.tutorialStep=9;s.onboardingSeen=['base-work','first-sortie','field-map','cctv','night-shift','first-capture'];s=game.startRun(s,'garden',['flashlight']);
 const f=s.field,start=f.position;f.tiles.fill('empty');f.tiles[f.exitIndex]='exit';f.discovered=[start,start+1,start+2,start+3];f.threat={position:start+3,alert:13,mode:'search'};await seed(page,s);
 await page.getByRole('button',{name:'탐사',exact:true}).click();await page.locator('.v33-route-cell').nth(start+1).click();
 const combat=page.locator('.v74-combat[role="dialog"]');await expect(combat).toBeVisible();await expect(combat).toContainText('다음 행동');
 await combat.getByRole('button',{name:/안전 우회/}).click();await expect(combat).toBeHidden();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field.combat,KEY)).toBeNull();
 const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field,KEY);expect(after.threat).not.toBeNull();expect(after.threat.mode).toBe('search');
});
