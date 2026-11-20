/** Optional real-browser test: npm install -D @playwright/test && npx playwright install chromium && npm run test:browser */
const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/day003-ap0.json'),'utf8'));
const key='last-enclosure-ark-v10';
test.beforeEach(async ({page})=>{
 await page.addInitScript(({key,fixture})=>{localStorage.setItem(key,JSON.stringify(fixture));},{key,fixture});
 await page.goto('/');
});
test('DAY 003 AP 0 -> supply screen (no date or AP spent)',async({page})=>{
 await page.getByRole('button',{name:/보급/}).first().click();
 await expect(page.getByRole('heading',{name:'보급 · 전력 · 시설 정비'})).toBeVisible();
 const state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 expect(state.day).toBe(3);expect(state.ap).toBe(0);
});
test('AP 0 -> night handling -> day 004 and 4 AP saved',async({page})=>{
 await page.getByRole('button',{name:/야간 대응/}).last().click();
 await expect(page.getByRole('heading',{name:'밤이 오기 전에'})).toBeVisible();
 await page.getByRole('button',{name:/야간 운영 확정|무방비로 다음 날/}).last().click();
 await expect.poll(async()=>page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key));return [x.day,x.ap];},key)).toEqual([4,4]);
 await page.reload();
 await expect.poll(async()=>page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key));return [x.day,x.ap];},key)).toEqual([4,4]);
});
for(const [w,h] of [[1366,768],[1600,900],[1920,1080],[390,844]]){
 test(`UI shell renders without horizontal overflow ${w}x${h}`,async({page})=>{
  await page.setViewportSize({width:w,height:h});
  await expect(page.getByRole('button',{name:/보급/}).first()).toBeVisible();
  const documentWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(w+3);
 });
}
