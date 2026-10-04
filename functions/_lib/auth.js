import {getCookie,json} from './http.js';

const SESSION_COOKIE='mpdgi_stats_session';
export const LEGACY_PASSWORD_SCHEME='hmac-sha256-v1';
export const TARGET_PASSWORD_SCHEME='pbkdf2-sha256-v1';
export const PBKDF2_ITERATIONS=600000;
// Keep current production behavior unchanged until dual-scheme login wiring is validated.
export const PASSWORD_SCHEME=LEGACY_PASSWORD_SCHEME;

function bytesToBase64Url(bytes){
  let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function base64UrlToBytes(value){
  const text=String(value||'');
  if(!/^[A-Za-z0-9_-]+$/.test(text))throw new Error('invalid_base64url');
  const padded=(text.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((text.length+3)%4));
  const binary=atob(padded);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}
export function randomToken(size=32){
  const bytes=new Uint8Array(size);crypto.getRandomValues(bytes);return bytesToBase64Url(bytes);
}
export async function sha256(value){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value)));
  return bytesToBase64Url(new Uint8Array(digest));
}
export async function passwordVerifier(password,salt,pepper){
  const secret=new TextEncoder().encode(String(pepper||''));
  const key=await crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const message=new TextEncoder().encode(String(salt)+'\u0000'+String(password));
  const signature=await crypto.subtle.sign('HMAC',key,message);
  return bytesToBase64Url(new Uint8Array(signature));
}
export function parsePbkdf2Verifier(value){
  const match=/^i=(\d+)\$([A-Za-z0-9_-]+)$/.exec(String(value||''));
  if(!match)return null;
  const iterations=Number(match[1]);
  if(!Number.isSafeInteger(iterations)||iterations<100000||iterations>5000000)return null;
  return {iterations,verifier:match[2]};
}
export async function pbkdf2PasswordVerifier(password,salt,pepper,iterations=PBKDF2_ITERATIONS){
  if(!Number.isSafeInteger(iterations)||iterations<100000||iterations>5000000)throw new Error('invalid_pbkdf2_iterations');
  const pepperKey=await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(pepper||'')),
    {name:'HMAC',hash:'SHA-256'},
    false,
    ['sign']
  );
  const peppered=await crypto.subtle.sign('HMAC',pepperKey,new TextEncoder().encode(String(password)));
  const keyMaterial=await crypto.subtle.importKey('raw',peppered,{name:'PBKDF2'},false,['deriveBits']);
  const derived=await crypto.subtle.deriveBits(
    {name:'PBKDF2',hash:'SHA-256',salt:base64UrlToBytes(salt),iterations},
    keyMaterial,
    256
  );
  return 'i='+iterations+String.fromCharCode(36)+bytesToBase64Url(new Uint8Array(derived));
}
export function passwordSalt(){return randomToken(18);}
export async function createTargetPasswordRecord(password,pepper,iterations=PBKDF2_ITERATIONS){
  const salt=passwordSalt();
  const hash=await pbkdf2PasswordVerifier(password,salt,pepper,iterations);
  return {password_hash:hash,password_salt:salt,password_scheme:TARGET_PASSWORD_SCHEME};
}
export async function verifyPasswordRecord(password,record,pepper){
  const scheme=String(record?.password_scheme||'');
  const salt=String(record?.password_salt||'');
  const stored=String(record?.password_hash||'');
  if(scheme===LEGACY_PASSWORD_SCHEME){
    const calculated=await passwordVerifier(password,salt,pepper);
    const ok=constantTimeEqual(calculated,stored);
    return {ok,needsUpgrade:ok,error:null};
  }
  if(scheme===TARGET_PASSWORD_SCHEME){
    const parsed=parsePbkdf2Verifier(stored);
    if(!parsed)return {ok:false,needsUpgrade:false,error:'invalid_password_record'};
    const calculated=await pbkdf2PasswordVerifier(password,salt,pepper,parsed.iterations);
    const ok=constantTimeEqual(calculated,stored);
    return {ok,needsUpgrade:ok&&parsed.iterations<PBKDF2_ITERATIONS,error:null};
  }
  return {ok:false,needsUpgrade:false,error:'unsupported_password_scheme'};
}
export function constantTimeEqual(a,b){
  const x=new TextEncoder().encode(String(a||'')),y=new TextEncoder().encode(String(b||''));let diff=x.length^y.length;
  const len=Math.max(x.length,y.length);
  for(let i=0;i<len;i++)diff|=(x[i]||0)^(y[i]||0);
  return diff===0;
}
export function sessionCookie(token,maxAge){
  return SESSION_COOKIE+'='+encodeURIComponent(token)+'; Max-Age='+maxAge+'; Path=/; HttpOnly; Secure; SameSite=Strict';
}
export function clearSessionCookie(){
  return SESSION_COOKIE+'=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict';
}
export async function getAuthenticatedUser(context){
  const token=getCookie(context.request,SESSION_COOKIE);if(!token)return null;
  const tokenHash=await sha256(token);
  const now=Math.floor(Date.now()/1000);
  const row=await context.env.STATS_DB.prepare(
    'SELECT u.id,u.email,u.role,s.expires_at FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1 LIMIT 1'
  ).bind(tokenHash,now).first();
  return row||null;
}
export async function requireUser(context){
  const user=await getAuthenticatedUser(context);
  if(!user)return {user:null,response:json({error:'unauthorized'},401)};
  return {user,response:null};
}
export async function requireRole(context,roles){
  const auth=await requireUser(context);
  if(auth.response)return auth;
  const allowed=new Set(Array.isArray(roles)?roles:[roles]);
  if(!allowed.has(String(auth.user.role||'')))return {user:auth.user,response:json({error:'forbidden'},403)};
  return auth;
}
