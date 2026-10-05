import assert from 'node:assert/strict';
import {PROTECTED_BRANCHES,selectBootstrapCandidates,shouldDeleteMergedHead} from '../.github/scripts/branch-cleanup.mjs';

assert(PROTECTED_BRANCHES.has('main'));
assert(PROTECTED_BRANCHES.has('mpdgi-stats-v1.0'));
assert(PROTECTED_BRANCHES.has('checkpoint/hub-v1.6.0-current'));
assert(PROTECTED_BRANCHES.has('checkpoint/stats-v1.4.10-auth-e2e'));
assert(PROTECTED_BRANCHES.has('checkpoint/stats-v1.4.7-dual-scheme'));

const branches=[
  'main',
  'mpdgi-stats-v1.0',
  'checkpoint/hub-v1.6.0-current',
  'checkpoint/stats-v1.4.10-auth-e2e',
  'checkpoint/stats-v1.4.7-dual-scheme',
  'checkpoint/stats-v1.4.4',
  'audit-fix/merged',
  'docs/old-checkpoint',
  'ops/diagnostic',
  'hotfix/old-login',
  'stats-v1.4.4-old',
  'feature/unmerged',
  'audit-fix/unmerged',
  'audit-fix/open-pr'
];
const selected=selectBootstrapCandidates(branches,{openBranches:new Set(['audit-fix/open-pr']),mergedBranches:new Set(['checkpoint/stats-v1.4.4','audit-fix/merged','docs/old-checkpoint','ops/diagnostic','hotfix/old-login','stats-v1.4.4-old','audit-fix/open-pr'])});
assert.deepEqual(selected,[
  'checkpoint/stats-v1.4.4',
  'audit-fix/merged',
  'docs/old-checkpoint',
  'ops/diagnostic',
  'hotfix/old-login',
  'stats-v1.4.4-old'
]);

assert.equal(shouldDeleteMergedHead('feature/merged',{merged:true,sameRepo:true}),true);
assert.equal(shouldDeleteMergedHead('main',{merged:true,sameRepo:true}),false);
assert.equal(shouldDeleteMergedHead('mpdgi-stats-v1.0',{merged:true,sameRepo:true}),false);
assert.equal(shouldDeleteMergedHead('checkpoint/new',{merged:true,sameRepo:true}),false);
assert.equal(shouldDeleteMergedHead('feature/open',{merged:false,sameRepo:true}),false);
assert.equal(shouldDeleteMergedHead('feature/fork',{merged:true,sameRepo:false}),false);

console.log('branch cleanup unit validation passed');

assert(!selected.includes('audit-fix/unmerged'),'Unmerged historical-looking branches must never be bootstrap-deleted');
