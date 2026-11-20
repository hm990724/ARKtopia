const {chromium}=require('../tmp/v68/browser/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const g=require('../src/lib/game-v10.ts'),sim=require('../src/lib/sim.ts'),archive=require('../src/lib/specimen-archive.ts'),origin=require('../src/lib/origin-zero.ts');
const root=path.resolve('docs/qa-v68');fs.mkdirSync(root,{recursive:true});
const base=()=>{const s=g.beginGame('artist','generator');Object.assign(s,{day:5,tutorialStep:9,ap:20,power:100,rooms:10,mind:100,food:30,parts:20,scrap:50,onboardingSeen:['first-night-defense'],facilities:{cctv:true,synthesis:true,infirmary:true,containment:true}});return s;};
async function main(){
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[],broken=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/assets/'))broken.push({url:r.url(),status:r.status()});});
 await page.addLocatorHandler(page.locator('.v44-story-overlay'),async()=>{await page.locator('.v44-story-overlay button').filter({hasText:/건너|스킵/}).click();});
 const reset=async s=>{await page.goto('http://127.0.0.1:3000');await page.evaluate(s=>localStorage.setItem('last-enclosure-ark-v10',JSON.stringify(s)),s);await page.reload();await page.locator('.v10-main').waitFor();};
 const snapshot=async name=>{await page.screenshot({path:path.join(root,name+'.png'),fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);results.push({name,overflow});assert.equal(overflow,false,name+' horizontal page overflow');};
 try{
  await reset(base());await page.locator('.v10-top nav button').filter({hasText:'CCTV'}).click();
  const cameras=page.getByRole('region',{name:'CCTV 차이 관찰'});await cameras.getByRole('button',{name:'어제 기준 보기'}).click();await cameras.getByRole('button',{name:'오늘 영상 보기'}).click();
  // Day 5 target = feed bowl; compare before committing the report.
  await cameras.getByRole('button',{name:'급식대 조사'}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('last-enclosure-ark-v10')).operations?.correct===1);await snapshot('cctv-1366');
  let run=g.startRun(base(),'garden',['flashlight']);await reset(run);await page.locator('.v10-top nav button').filter({hasText:'탐사'}).click();
  await page.getByRole('region',{name:'탐사 조작 영역'}).focus();await page.keyboard.press('d');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('last-enclosure-ark-v10')).field.steps===1);results.push({name:'keyboard movement',passed:true});
  for(const [w,h] of [[1366,768],[1600,900],[1920,1080],[1024,768],[390,844],[360,800]]){await page.setViewportSize({width:w,height:h});await snapshot('field-'+w);}
  await page.setViewportSize({width:1366,height:768});await reset(base());
  const night=page.getByRole('button').filter({hasText:/하루 종료|오늘 종료|야간 운영/});
  console.log('Night buttons',await night.allTextContents());
  await night.first().click();await page.getByRole('button',{name:'비상 수리 시작 · 75초'}).click();await page.getByRole('button',{name:'일시정지',exact:true}).click();
  const time=await page.getByRole('timer').textContent();await page.waitForTimeout(1200);assert.equal(await page.getByRole('timer').textContent(),time);
  await snapshot('night-repair');results.push({name:'night pause',passed:true});
  await page.getByRole('button',{name:'수리 재개'}).click();
  for(const [i,mark] of ['■','●','▲'].entries()){await page.getByRole('button',{name:'퓨즈 '+mark,exact:true}).click();await page.getByRole('button',{name:new RegExp('^'+mark+' 소켓')}).click();}
  const board=page.getByRole('region',{name:'야간 전력 직접 수리'});for(const circuit of ['격리문','격리문','관측','환기'])await board.getByRole('button',{name:new RegExp('^'+circuit+' ')}).click();await page.getByRole('button',{name:'회로 검증 · 전원 연결'}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('last-enclosure-ark-v10')).operations?.night?.status==='success');results.push({name:'night circuit success',passed:true});
  // The final snapshot is saved even if a subsequent assertion fails.
  await snapshot('night-success');
 }finally{await page.screenshot({path:path.join(root,'last-browser-state.png'),fullPage:true});fs.writeFileSync(path.join(root,'browser-results.json'),JSON.stringify({results,errors,broken},null,2));await browser.close();}
 assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);console.log(JSON.stringify(results,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
