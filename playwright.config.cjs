const fs=require('node:fs');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
module.exports={testDir:'./tests',testMatch:'browser-*.spec.cjs',timeout:60000,workers:1,use:{baseURL:'http://127.0.0.1:3000',browserName:'chromium',headless:true,launchOptions:fs.existsSync(chrome)?{executablePath:chrome}:{},screenshot:'only-on-failure'},webServer:{command:'npm run dev -- --hostname 127.0.0.1',url:'http://127.0.0.1:3000',reuseExistingServer:!process.env.CI,timeout:120000},reporter:'list'};
