const {defineConfig}=require('@playwright/test');

module.exports=defineConfig({
  testDir:'./tests',
  testMatch:'**/stats-ui.spec.js',
  timeout:30000,
  maxFailures:1,
  retries:1,
  workers:1,
  reporter:'line',
  use:{
    baseURL:process.env.BASE_URL||'http://127.0.0.1:4173',
    headless:true
  },
  projects:[
    {name:'chromium',use:{browserName:'chromium'}},
    {name:'webkit',use:{browserName:'webkit'}}
  ]
});
