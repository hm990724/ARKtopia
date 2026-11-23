const {test,expect}=require('@playwright/test'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const game=require('../src/lib/game-v10.ts'),{recruitCrew}=require('../src/lib/crew.ts'),KEY='last-enclosure-ark-v10';
async function seed(page,s){await page.addInitScript(({state,key})=>{if(!sessionStorage.getItem('v80-seeded')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('v80-seeded','1')}},{state:s,key:KEY});await page.goto('/')}
test('region selection opens a clear preflight loadout modal before spending resources',async({page})=>{
 const s=game.beginGame('medic','generator');s.tutorialStep=9;s.onboardingSeen=['base-work','first-sortie','field-map','cctv','night-shift','first-capture'];await seed(page,s);
 await page.getByRole('button',{name:'탐사',exact:true}).click();await page.locator('.zone-card').first().click();
 const modal=page.getByRole('dialog',{name:/출동 준비/});await expect(modal).toBeVisible();await expect(modal).toContainText('위험 16%');await expect(modal).toContainText('오늘 하루 한 번');
 const flashlight=modal.getByRole('button',{name:/수동 손전등/}),scanner=modal.getByRole('button',{name:/EVE 스캐너/});await expect(flashlight).toHaveAttribute('aria-pressed','true');await scanner.click();await expect(scanner).toHaveAttribute('aria-pressed','true');await expect(flashlight).toHaveAttribute('aria-pressed','false');await expect(modal).toContainText('시설 전력');
 await flashlight.click();await modal.getByRole('button',{name:/출동 확정/}).click();await expect(modal).toBeHidden();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field?.position,KEY)).not.toBeUndefined();
});
test('mobile contaminant enters central combat and retreat preserves the pursuer',async({page})=>{
 let s=game.beginGame('medic','generator');s.day=4;s.tutorialStep=9;s.onboardingSeen=['base-work','first-sortie','field-map','cctv','night-shift','first-capture'];recruitCrew(s,'wolf','WOLF-TEST');s=game.startRun(s,'garden',['flashlight'],'wolf');
 const f=s.field,start=f.position;f.tiles.fill('empty');f.tiles[f.exitIndex]='exit';f.discovered=[start,start+1,start+2,start+3];f.threat={position:start+3,alert:13,mode:'search'};await seed(page,s);
 await page.getByRole('button',{name:'탐사',exact:true}).click();await page.locator('.v33-route-cell').nth(start+1).click();
 const combat=page.locator('.v74-combat[role="dialog"]');await expect(combat).toBeVisible();await expect(combat).toContainText('다음 행동');await expect(combat.locator('.v74-combat-companion img')).toHaveAttribute('src','/assets/staff/wolf/portrait.webp');
 await combat.getByRole('button',{name:/동행 지원/}).click();await expect(combat.locator('.v74-combat-stage')).toHaveAttribute('data-action','support');await combat.getByRole('button',{name:/방어/}).click();await expect(combat.locator('.v74-combat-stage')).toHaveAttribute('data-action','guard');
 await combat.getByRole('button',{name:/안전 우회/}).click();await expect(combat).toBeHidden();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field.combat,KEY)).toBeNull();
 const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field,KEY);expect(after.threat).not.toBeNull();expect(after.threat.mode).toBe('search');
});
test('one sortie links preparation, combat salvage, animal rescue, and extraction',async({page})=>{
 test.setTimeout(90000);
 let s=game.beginGame('medic','generator');s.day=4;s.tutorialStep=9;s.onboardingSeen=['base-work','first-sortie','field-map','cctv','night-shift','first-capture'];recruitCrew(s,'wolf','WOLF-E2E');await seed(page,s);
 await page.getByRole('button',{name:'탐사',exact:true}).click();await page.locator('.zone-card').first().click();
 const prep=page.getByRole('dialog',{name:/출동 준비/});await prep.getByRole('button',{name:/보안관/}).click();await prep.getByRole('button',{name:/출동 확정/}).click();
 let seeded=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY),f=seeded.field,start=f.position;
 f.tiles.fill('empty');f.tiles[start+2]='animal';f.tiles[start+3]='cache';f.tiles[start+4]='cache';f.tiles[start+6]='exit';f.wildlifeIndex=start+2;f.exitIndex=start+6;f.encountered=false;f.threat={position:start+3,alert:13,mode:'search'};f.discovered=[start,start+1,start+2,start+3,start+4,start+5,start+6];await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:KEY,state:seeded});await page.reload();await page.getByRole('button',{name:'탐사',exact:true}).click();
 await page.locator('.v33-route-cell').nth(start+1).click();const combat=page.locator('.v74-combat[role="dialog"]');await expect(combat).toBeVisible();
 await combat.getByRole('button',{name:/EVE 펄스/}).click();await combat.getByRole('button',{name:/동행 지원/}).click();await expect(combat).toBeHidden();
 await page.locator('.v33-route-cell').nth(start+2).click();await expect(page.locator('.v33-hidden-map')).toBeVisible();
 for(let i=0;i<14&&(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).capture?.hunt,KEY));i++)await page.locator('.v71-primary-tools button').first().click();
 await page.getByRole('button',{name:/수신 확인 · 구조 절차로/}).click();await expect(page.getByRole('heading',{name:/토끼 발견/})).toBeVisible();await page.getByRole('button',{name:/격리실로 구조한다/}).click();await expect(page.getByRole('heading',{name:'구조 완료'})).toBeVisible();
 await page.getByRole('button',{name:/결과 확인 · 현장 수색 계속하기/}).click();
 const route=[start+3,start+4,start+5,start+6];for(let i=0;i<route.length;i++){const target=route[i];await page.locator('.v33-route-cell').nth(target).click();if(i<route.length-1){await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field?.position,KEY)).toBe(target);if(target===start+4&&await page.evaluate(key=>!!JSON.parse(localStorage.getItem(key)).field?.choice,KEY)){await page.locator('.v62-map-choice-actions button').nth(1).click();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).field?.choice,KEY)).toBeNull()}}else await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).run,KEY)).toBeNull()}
 await expect(page.getByRole('dialog',{name:/현장 탐사 최종 보상/})).toBeVisible();
 let final=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);expect(final.animals.some(a=>a.id==='rabbit'&&a.alive)).toBe(true);expect(final.run).toBeNull();expect(final.field).toBeNull();expect(final.lastOutcome).toMatch(/정상 귀환/);expect(final.scrap).toBeGreaterThanOrEqual(6);expect(final.parts).toBeGreaterThanOrEqual(1);
 await page.getByRole('button',{name:/최종 정산 확인 · 탐사 메뉴로/}).click();await page.getByRole('button',{name:'보급',exact:true}).click();
 const supply=page.locator('.v36-facility-card').filter({hasText:'CCTV 감시망'}),before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);await supply.getByRole('button',{name:/고철 사용 · 복구 실행/}).click();await expect(supply.locator('.v80-build-sequence')).toContainText('설비 조립 · 배선 연결 · 전원 확인');final=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);expect(final.facilities.cctv).toBe(true);expect(final.scrap).toBe(before.scrap-6);expect(final.parts).toBe(before.parts-1);expect(final.power).toBe(before.power-6);
});
