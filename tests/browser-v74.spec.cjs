const {test,expect}=require('@playwright/test');
const fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {beginGame}=require('../src/lib/game-v10.ts');
const {makeAnimal}=require('../src/lib/sim.ts');
const {emptyOriginZero}=require('../src/lib/origin-zero.ts');
const archive=require('../src/lib/specimen-archive.ts');
const {recruitCrew}=require('../src/lib/crew.ts');
const KEY='last-enclosure-ark-v10';
async function state(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY)}
async function seed(page,s,seedId='v74-recall-seed'){await page.addInitScript(({s,key,seedId})=>{if(!sessionStorage.getItem(seedId)){localStorage.setItem(key,JSON.stringify(s));sessionStorage.setItem(seedId,'1')}},{s,key:KEY,seedId});await page.addLocatorHandler(page.locator('.v44-story-overlay'),()=>page.locator('.v44-story-overlay .is-skip').click(),{noWaitAfter:true});await page.addLocatorHandler(page.locator('.awakening-shade'),()=>page.locator('.awakening-next').click(),{noWaitAfter:true});await page.goto('/')}
test('ARK RECALL specimen puzzle persists mid-session and resolves only after three inputs',async({page})=>{
 const s=beginGame('medic','generator');s.day=20;s.ap=10;s.power=100;s.tutorialStep=9;s.animals=[makeAnimal('rabbit',1)];archive.ensureArchive(s);s.originZero={...emptyOriginZero(),cat:'shelter',route:'shelter',firstPositiveDay:12,photos:6};
 await seed(page,s);await page.getByRole('button',{name:'분석실',exact:true}).click();
 const specimen=page.locator('.oz-recall-grid button').filter({hasText:'RB-001'});await expect(specimen).toBeVisible();await specimen.click();
 await expect(page.getByRole('dialog',{name:/개체별 기억 재수집/})).toBeVisible();await expect(page.locator('.ark-recall-card h3')).toContainText('임상 반응 순서');
 await page.getByRole('button',{name:'맥박 기록 확정'}).click();await expect.poll(async()=> (await state(page)).originZero.recallSessions['RB-001'].step).toBe(1);
 await page.reload();await page.getByRole('button',{name:'분석실',exact:true}).click();await page.locator('.oz-recall-grid button').filter({hasText:'RB-001'}).click();
 await expect(page.locator('.ark-recall-meters')).toContainText('2 / 3');
 await page.getByRole('button',{name:'맥박 기록 확정'}).click();await page.getByRole('button',{name:'맥박 기록 확정'}).click();
 await expect(page.getByRole('dialog',{name:/개체별 기억 재수집/})).toHaveCount(0);
 const saved=await state(page),record=saved.originZero.individualRecalls['RB-001'];expect(record.steps).toHaveLength(3);expect(saved.ap).toBe(9);expect(saved.power).toBe(92);expect(saved.originZero.recallSessions['RB-001']).toBeUndefined();
});
test('13 animal recollection profiles open their own interaction instruments',async({page})=>{
 const profiles=[['rabbit','RB-001','pulse'],['fox','FX-001','shelf'],['deer','DR-001','archive'],['owl','OW-001','orbit'],['wolf','WF-001','patrol'],['crow','CR-001','melody'],['otter','OT-001','valves'],['lynx','LX-001','tracks'],['axolotl','AX-001','graft'],['moth','MT-001','afterglow'],['mutant','MX-001','channels'],['chimera','CH-001','sync'],['specter','SP-001','echo']];
 const s=beginGame('medic','generator');s.day=1;s.ap=20;s.power=100;s.tutorialStep=9;s.onboardingSeen=['first-sortie','field-map','cctv','night-shift','first-capture','base-work','mutation'];s.animals=profiles.map(([id],i)=>makeAnimal(id,i+1));s.originZero={...emptyOriginZero(),route:'shelter',firstPositiveDay:1,photos:6};archive.ensureArchive(s);
 await page.setViewportSize({width:390,height:844});await seed(page,s,'v74-recall-profiles');await page.getByRole('button',{name:'분석실',exact:true}).click();
 const resolve=async(id)=>{
  if(id==='rabbit')return page.getByRole('button',{name:'맥박 기록 확정'}).click();
  if(id==='fox'||id==='axolotl')return page.locator('.ark-recall-drop-zones button').first().click();
  if(id==='deer')return page.getByRole('button',{name:'기록 순서 확정'}).click();
  if(id==='owl')return page.getByRole('button',{name:'궤도 고정'}).click();
  if(id==='wolf'||id==='lynx')return page.locator('.ark-recall-route-map button').first().click();
  if(id==='crow'){for(let i=0;i<4;i++)await page.locator('.ark-recall-note-pads button').nth(i%3).click();return}
  if(id==='otter')return page.getByRole('button',{name:'펌프 가동 · 흐름 판독'}).click();
  if(id==='moth'||id==='specter')return page.locator('.ark-recall-afterglow button,.ark-recall-echo-grid button').first().click();
  if(id==='mutant')return page.getByRole('button',{name:'분리 신호 저장'}).click();
  if(id==='chimera')return page.getByRole('button',{name:'공명 교차점 기록'}).click();
 };
 for(const [id,serial,action] of profiles){await page.locator('.oz-recall-grid button').filter({hasText:serial}).click();await expect(page.locator('.ark-recall-action')).toHaveAttribute('data-action',action);await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await resolve(id);await expect.poll(async()=> (await state(page)).originZero.recallSessions[serial].step).toBe(1);await page.getByRole('button',{name:'기록하고 닫기'}).click();}
});
const endings=[
 {goal:'rebuild',title:'영원한 실험',immunity:99},
 {goal:'rebuild',title:'에덴',immunity:100},
 {goal:'freedom',title:'방주의 씨앗',immunity:85},
 {goal:'freedom',title:'마지막 동물원',immunity:84},
 {goal:'freedom',title:'흩어진 이름들',immunity:84,alive:1,coerced:2},
 {goal:'preserve',title:'제000번 우리',immunity:80},
 {goal:'preserve',title:'침묵의 자동화',immunity:80,retired:['wolf','deer'],members:['rabbit','fox']},
 {goal:'preserve',title:'마지막 신호',immunity:80,hqIntel:65,dispatches:1},
];
for(const [index,ending] of endings.entries())test(`ORIGIN ZERO ending UI resolves ${ending.title} and shows its final record`,async({page})=>{
 const s=beginGame('medic','generator');s.phase='finale';s.day=40;s.ap=0;s.tutorialStep=9;s.onboardingSeen=['first-sortie','field-map','cctv','night-shift','first-capture'];s.animals=['rabbit','fox','deer'].map((id,i)=>({...makeAnimal(id,i+1),alive:i<(ending.alive??3)}));
 s.originZero={...emptyOriginZero(),route:'shelter',photos:12,immunity:ending.immunity,crisisDone:true,hqIntel:ending.hqIntel??0};s.archive=archive.emptyArchive();s.archive.dispatches=ending.dispatches??0;s.crew.retired=ending.retired??[];for(const id of ending.members??[])recruitCrew(s,id,`ending-${id}`);
 for(const animal of s.animals)s.originZero.recalls[animal.id]={day:40,quality:90,source:'archive',note:'browser ending fixture'};
 for(let i=0;i<(ending.coerced??0);i++)s.archive.entries[`ending-fixture-${i}`]={key:`ending-fixture-${i}`,species:'__fixture__',records:[{title:'강제 조직 회수'}]};
 await seed(page,s,`v74-ending-${index}`);const goalIndex=ending.goal==='rebuild'?0:ending.goal==='freedom'?1:2;
 const choice=page.locator('.finale-modal .v54-finale-choices button').nth(goalIndex);await expect(choice).toBeVisible();await choice.click();
 const result=page.locator('.ending-modal');await expect(result).toBeVisible();if(!ending.members){const endingText=result.locator('p').filter({hasText:ending.title}).first();await expect(endingText).toBeVisible();await expect(endingText).toContainText('사망했다')}
 await expect.poll(()=>result.locator('.ending-art-display img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 if(ending.title==='방주의 씨앗'){await expect(result.locator('.ending-art-display img')).toHaveAttribute('src','/assets/endings/ending_seed_ark_finale.png');await expect.poll(()=>result.locator('.ending-art-display img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);await expect(result.locator('.v71-farewell>img')).toHaveCount(0);await expect(result.locator('.v71-farewell')).toContainText('그럼 내일은 네가 이어줘.')}
 if(ending.title==='마지막 신호'){await expect(result.locator('.ending-art-display img')).toHaveAttribute('src','/assets/endings/ending_last_signal_finale.png');await expect.poll(()=>result.locator('.ending-art-display img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true)}
 await expect(result.locator('.v82-ending-specimen-card')).toHaveCount(ending.alive??3);
 if(ending.members){await expect(result.locator('.v80-ending-cast-card')).toHaveCount(ending.members.length);for(const id of ending.members)await expect(result.locator(`.v80-ending-cast-card[data-crew-id="${id}"] img`)).toHaveAttribute('alt',/.+/);await expect(result.locator('.v80-ending-cast-card[data-crew-id="wolf"]')).toHaveCount(0);await expect(result.locator('.v49-ending-scars')).toBeVisible()}
});

test('ending cast keeps protected M-00 as its own pixel-art specimen',async({page})=>{
 const s=beginGame('medic','generator');s.phase='finale';s.day=40;s.tutorialStep=9;s.animals=['rabbit','fox','deer'].map((id,i)=>makeAnimal(id,i+1));
 s.originZero={...emptyOriginZero(),cat:'shelter',route:'shelter',photos:12,immunity:85,crisisDone:true};s.archive=archive.emptyArchive();
 for(const animal of s.animals)s.originZero.recalls[animal.id]={day:40,quality:90,source:'archive',note:'M-00 ending fixture'};
 await seed(page,s,'v82-ending-m00');await page.locator('.finale-modal .v54-finale-choices button').nth(1).click();
 const result=page.locator('.ending-modal'),cat=result.locator('.v82-ending-specimen-card[data-animal-id="m00"] img');
 await expect(result.locator('.v82-ending-specimen-card')).toHaveCount(4);await expect(cat).toHaveAttribute('src','/assets/animals/m00_normal.png');
 await expect.poll(()=>cat.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
});
