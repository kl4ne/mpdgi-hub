const {defineConfig}=require('@playwright/test');

module.exports=defineConfig({
  testDir:'./tests',
  timeout:30000,
  retries:1,
  workers:1,
  reporter:'line',
  use:{
    baseURL:process.env.BASE_URL||'http://127.0.0.1:4173',
    headless:true
  },
  projects:[
    {name:'chromium',testMatch:'**/ui.spec.js',use:{browserName:'chromium'}},
    {name:'webkit',testMatch:'**/webkit.spec.js',use:{browserName:'webkit'}}
  ]
});
