import assert from 'node:assert/strict';
import { evaluateReports } from '../.github/scripts/check-lighthouse.mjs';

const report = (performance, accessibility = 1, bestPractices = 1) => ({
  categories: {
    performance: { score: performance },
    accessibility: { score: accessibility },
    'best-practices': { score: bestPractices }
  }
});

// One slow sample cannot mask two slow measurements or downgrade other categories.
assert.equal(evaluateReports([report(.67), report(.99), report(.98)]).performance, .98);
assert.throws(() => evaluateReports([report(.67), report(.77), report(.99)]), /median performance/);
assert.throws(() => evaluateReports([report(.99, .89), report(.99), report(.99)]), /accessibility/);
assert.throws(() => evaluateReports([report(.99, 1, .89), report(.99), report(.99)]), /best-practices/);
assert.deepEqual(evaluateReports([report(.8, .9, .9), report(.8, .9, .9), report(.8, .9, .9)]),
  { performance: .8, accessibility: .9, 'best-practices': .9 });
assert.throws(() => evaluateReports([report(.99), report(.99)]), /Exactly three/);
assert.throws(() => evaluateReports([report(.99), report(.99), report(.99), report(.99)]), /Exactly three/);
for (const score of [null, undefined, NaN, Infinity, '1', -1, 1.1]) {
  assert.throws(() => evaluateReports([report(.99), report(score), report(.99)]), /Invalid Lighthouse score/);
}
assert.throws(() => evaluateReports([report(.99), {}, report(.99)]), /Invalid Lighthouse score/);
assert.throws(() => evaluateReports([report(.99), null, report(.99)]), /Invalid Lighthouse score/);
assert.throws(() => evaluateReports([report(.99), { ...report(.99), runtimeError: { message: 'Chrome failed' } },
  report(.99)]), /runtime error/);
console.log('Lighthouse gate unit tests passed');
