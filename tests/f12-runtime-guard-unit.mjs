import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {schedulePermission} from '../.github/scripts/daytime-schedule-guard.mjs';

const allowed=(date,event='schedule')=>schedulePermission(event,new Date(date)).allow;
for(const date of ['2026-10-12T13:00:00Z','2026-10-12T20:59:59Z',
                   '2026-01-12T14:00:00Z','2026-01-12T21:59:59Z'])
  assert.equal(allowed(date),true,date+' should be permitted');
for(const date of ['2026-10-13T01:28:43Z','2026-10-12T21:00:00Z',
                   '2026-01-12T22:00:00Z','2026-10-12T12:59:59Z',
                   '2026-01-12T13:59:59Z'])
  assert.equal(allowed(date),false,date+' should be skipped');
assert.equal(allowed('2026-10-13T01:28:43Z','workflow_dispatch'),true);
assert.equal(allowed('2026-10-13T01:28:43Z','push'),true);
assert.equal(schedulePermission('schedule',new Date('invalid')).allow,false);

const workflow=readFileSync(new URL('../.github/workflows/f12-monitor.yml',import.meta.url),'utf8');
const crons=workflow.split('\n').filter(l=>l.trim().startsWith('- cron:')).map(l=>l.trim());
assert.equal(crons.length,1,'F12 must run only once daily');
assert.match(crons[0],/^- cron: '17 10 \* \* \*'/);
assert.equal(workflow.split('timezone: "America/New_York"').length-1,1);
assert.match(workflow,/id: daytime/);
assert.match(workflow,/node \.github\/scripts\/daytime-schedule-guard\.mjs/);
assert.equal(workflow.split("if: steps.daytime.outputs.allow == 'true'").length-1,3,
  'Node setup, tests and monitor+incident writer must be gated');
assert.match(workflow,/workflow_dispatch:/);
console.log('F12 runtime: Eastern guard, DST, delayed schedule and manual fallback passed');
