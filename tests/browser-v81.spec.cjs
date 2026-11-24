const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame}=require('../src/lib/game-v10.ts');
const KEY='last-enclosure-ark-v10';
test('facility dispatch order changes the saved priority and predicts a night load shed',async({page})=>{
 const s=beginGame('engineer','generator');s.day=2;s.tutorialStep=9;s.ap=0;s.power=27;s.onboardingSeen=['first-sortie','field-map','cctv','night-shift','first-capture','base-work'];s.facilities={cctv:true,containment:true,infirmary:true,synthesis:true};
 await page.addInitScript(({state,key})=>{if(!sessionStorage.getItem('v81-dispatch-seeded')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('v81-dispatch-seeded','1')}},{state:s,key:KEY});await page.goto('/');
 await page.getByRole('button',{name:'보급',exact:true}).click();
 const dispatch=page.getByRole('region',{name:'야간 시설 전력 우선순위'});await expect(dispatch).toBeVisible();
 const clinic=dispatch.getByRole('button',{name:'진료·검시실 우선순위 올리기'});await clinic.click();await clinic.click();
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).facilityPowerPriority,KEY)).toEqual(['infirmary','cctv','containment','synthesis']);
 await page.getByRole('button',{name:/AP 0.*다음 날/}).click();
 await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('.v81-night-forecast')).toContainText('가동 진료·검시실');await expect(page.locator('.v81-night-forecast')).toContainText('차단 · CCTV 감시망');
});
