import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workflow=readFileSync(new URL('../.github/workflows/f12-monitor.yml',import.meta.url),'utf8');
const crons=workflow.split('\n').filter(line=>line.trim().startsWith('- cron:')).map(line=>line.trim());
assert.equal(crons.length,1,'F12 must run once daily');
assert.match(crons[0],/^- cron: '17 10 \* \* \*'/,'F12 must run at 10:17 Eastern');
assert.equal(workflow.split('timezone: "America/New_York"').length-1,1);
assert.match(workflow,/workflow_dispatch:/,'owner manual fallback stays available');
console.log('F12 schedule: one daily Eastern daytime run at 10:17');
