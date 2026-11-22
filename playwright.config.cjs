const fs=require('node:fs');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const production=process.env.ARK_PRODUCTION_TEST==='1';
const baseURL=`http://127.0.0.1:${production?3001:3000}`;
module.exports={testDir:'./tests',testMatch:'browser-*.spec.cjs',timeout:60000,workers:1,use:{baseURL,browserName:'chromium',headless:true,launchOptions:fs.existsSync(chrome)?{executablePath:chrome}:{},screenshot:'only-on-failure'},webServer:{command:production?'npm run start:qa':'npm run dev -- --hostname 127.0.0.1',url:baseURL,reuseExistingServer:!process.env.CI,timeout:120000},reporter:'list'};
