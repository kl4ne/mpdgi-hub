import {performance} from 'node:perf_hooks';
import {PBKDF2_ITERATIONS,passwordSalt,pbkdf2PasswordVerifier} from '../functions/_lib/auth.js';

const samples=[];
const pepper='benchmark-only-non-production-pepper';
const password='Benchmark-only-password-1234!';
const salt=passwordSalt();

await pbkdf2PasswordVerifier(password,salt,pepper,PBKDF2_ITERATIONS);

for(let i=0;i<7;i++){
  const started=performance.now();
  await pbkdf2PasswordVerifier(password,salt,pepper,PBKDF2_ITERATIONS);
  samples.push(performance.now()-started);
}

const sorted=[...samples].sort((a,b)=>a-b);
const percentile=p=>sorted[Math.min(sorted.length-1,Math.ceil((p/100)*sorted.length)-1)];
const result={
  environment:'GitHub Actions Node.js WebCrypto proxy; NOT Cloudflare production timing',
  iterations:PBKDF2_ITERATIONS,
  samples_ms:samples.map(v=>Number(v.toFixed(2))),
  min_ms:Number(sorted[0].toFixed(2)),
  p50_ms:Number(percentile(50).toFixed(2)),
  p95_ms:Number(percentile(95).toFixed(2)),
  max_ms:Number(sorted[sorted.length-1].toFixed(2))
};

console.log('MPDGI Stats PBKDF2 benchmark');
console.log(JSON.stringify(result,null,2));
