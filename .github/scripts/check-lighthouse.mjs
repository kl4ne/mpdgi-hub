import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const categories = ['performance', 'accessibility', 'best-practices'];

export function reportScores(report) {
  if (report?.runtimeError) throw new Error('Lighthouse runtime error: ' + report.runtimeError.message);
  return Object.fromEntries(categories.map(category => {
    const score = report?.categories?.[category]?.score;
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1) {
      throw new Error('Invalid Lighthouse score: ' + category);
    }
    return [category, score];
  }));
}

export function evaluateReports(reports) {
  if (!Array.isArray(reports) || reports.length !== 3) {
    throw new Error('Exactly three complete Lighthouse reports are required');
  }
  const samples = reports.map(reportScores);
  // Median performance reduces runner noise; every accessibility/best-practices sample must pass.
  const performance = samples.map(scores => scores.performance).sort((a, b) => a - b)[1];
  const accessibility = Math.min(...samples.map(scores => scores.accessibility));
  const bestPractices = Math.min(...samples.map(scores => scores['best-practices']));
  if (performance < .80) throw new Error('Lighthouse median performance below 0.80: ' + performance);
  if (accessibility < .90) throw new Error('Lighthouse accessibility below 0.90: ' + accessibility);
  if (bestPractices < .90) throw new Error('Lighthouse best-practices below 0.90: ' + bestPractices);
  return { performance, accessibility, 'best-practices': bestPractices };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const reports = process.argv.slice(2).map(path => JSON.parse(readFileSync(path, 'utf8')));
  for (const [index, report] of reports.entries()) {
    console.log('Lighthouse sample ' + (index + 1), reportScores(report));
    const metrics = Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint',
      'total-blocking-time', 'speed-index'].map(id => [id, report.audits?.[id]?.numericValue]));
    console.log('Timing metrics (ms)', metrics);
  }
  console.log('Lighthouse gate', evaluateReports(reports));
}
