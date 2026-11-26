const {test,expect}=require('@playwright/test');
const fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame}=require('../src/lib/game-v10.ts');
const {emptyOriginZero,catTrackFrames}=require('../src/lib/origin-zero.ts');
const {ENDING_ART}=require('../src/lib/ending-art.ts');
const KEY='last-enclosure-ark-v10';
async function seed(page,s){await page.addInitScript(({s,key})=>localStorage.setItem(key,JSON.stringify(s)),{s,key:KEY});await page.goto('/')}

test('all nineteen ending route compositions load while original handoff art remains archived',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async(files)=>Promise.all(files.map(file=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve({file,width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>resolve({file,error:true});image.src=`/assets/endings/${file}`}))),ENDING_ART.map(item=>item.file));
 for(const item of results){expect(item.error,item.file).toBeUndefined();expect(item.width,item.file).toBeGreaterThan(0);expect(item.height,item.file).toBeGreaterThan(0)}
});

test('daily incident opens with a contextual scene illustration and remains usable on mobile',async({page})=>{
 const s=beginGame('medic','generator');s.day=8;s.tutorialStep=9;s.pendingIncident='blackout';s.onboardingSeen=['first-sortie','field-map','cctv','night-shift','first-capture'];
 await page.setViewportSize({width:390,height:844});await seed(page,s);
 const dialog=page.getByRole('dialog').filter({has:page.locator('.v75-incident-art')});await expect(dialog).toBeVisible();
 const art=dialog.locator('.v75-incident-art img');await expect(art).toHaveAttribute('src','/assets/events/event_blackout.webp');await expect.poll(()=>art.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
 await dialog.locator('.v39-incident-options button:not([disabled])').first().click();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).pendingIncident,KEY)).toBe(null);
});

test('CCTV false lead reveals the ordinary M-00 cat through three trace choices',async({page})=>{
 const s=beginGame('artist','generator');s.day=26;s.tutorialStep=9;s.encounters=5;s.ap=4;s.headquarters.revealStage=2;s.onboardingSeen=['base-work','mutation','first-sortie','field-map','cctv','night-shift','first-capture'];s.originZero=emptyOriginZero();
 await seed(page,s);await page.getByRole('button',{name:'탐사',exact:true}).click();
 const panel=page.getByRole('region',{name:'외곽 특수 생체 신호'});await expect(panel.getByRole('heading',{name:'시초 개체 의심 · 미확인 실루엣'})).toBeVisible();
 const suspect=panel.locator('.oz-suspect-still img');await expect(suspect).toHaveAttribute('src','/assets/events/m00_suspected_origin.webp');await expect.poll(()=>suspect.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 await panel.getByRole('button',{name:/외곽 영상 추적 시작/}).click();
 for(const cam of ['CAM 03','CAM 01','CAM 02'])await panel.getByRole('button',{name:new RegExp(cam)}).click();
 await panel.getByRole('button',{name:'미확인 신호 현장 출동 · AP 1'}).click();for(const cell of [15,10,11,12,7,2,3,4])await panel.getByRole('button',{name:'현장 칸 '+cell,exact:true}).click();await expect(panel.getByRole('region',{name:'미확인 신호 현장 접근'})).toBeVisible();await expect(panel.locator('.oz-cat-image')).toHaveCount(0);for(const label of ['낮은 자세로 움직임을 관찰한다','광원을 낮춰 벽과 실루엣의 거리를 비교한다','몸을 낮추고 손을 내밀어 기다린다'])await panel.getByRole('button',{name:label,exact:true}).click();
 await expect(page.getByRole('dialog',{name:'보존구역 실시간 대화'})).toBeVisible();await page.getByRole('button',{name:'글 즉시 펼치기'}).click();await expect(page.getByRole('dialog',{name:'보존구역 실시간 대화'})).toContainText('그냥 고양이잖아');await page.locator('.v44-story-overlay .is-skip').click();await expect(panel.getByRole('heading',{name:'시초가 아니었다 · 검은 고양이'})).toBeVisible();await expect(panel.locator('.oz-cat-image img')).toHaveAttribute('src','/assets/animals/m00_normal.png');
 const reveal=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).lastOutcome,KEY);expect(reveal).toContain('별개의 개체입니다');expect(reveal).toContain('고양이가 유출을 일으켰다는 증거는 없다');
 expect(catTrackFrames).toHaveLength(3);
});

test('commercially licensed local fonts load offline and story portraits keep their full frame',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  await Promise.all([document.fonts.load('400 16px ARKText'),document.fonts.load('400 16px ARKTerminal')]);
  const portrait=document.createElement('div');portrait.className='talk-portrait';portrait.innerHTML='<img alt="portrait" src="/assets/characters/protagonist_neutral.webp">';document.body.append(portrait);
  const img=portrait.querySelector('img');const fit=getComputedStyle(img).objectFit;const loaded=await new Promise(resolve=>{if(img.complete)return resolve(img.naturalWidth>0);img.onload=()=>resolve(true);img.onerror=()=>resolve(false)});
  const fonts=[...document.fonts].map(font=>font.family);
  const external=performance.getEntriesByType('resource').some(item=>/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(item.name));
  portrait.remove();
  return {text:document.fonts.check('400 16px ARKText'),terminal:document.fonts.check('400 16px ARKTerminal'),fonts,fit,loaded,external};
 });
 expect(result.text).toBe(true);expect(result.terminal).toBe(true);expect(result.fonts).toContain('ARKText');expect(result.fonts).toContain('ARKTerminal');expect(result.fit).toBe('contain');expect(result.loaded).toBe(true);expect(result.external).toBe(false);
});
