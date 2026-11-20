/** Not an installed dependency. Optional browser suite when @playwright/test is available. */
module.exports={testDir:'./tests',testMatch:'browser-v70.spec.cjs',use:{baseURL:'http://127.0.0.1:3000',browserName:'chromium',headless:true},webServer:{command:'npm run dev -- --hostname 127.0.0.1',url:'http://127.0.0.1:3000',reuseExistingServer:!process.env.CI,timeout:120000},reporter:'list'};
