import {getCookie,json} from './http.js';

const SESSION_COOKIE='mpdgi_stats_session';
export const PASSWORD_ITERATIONS=60000;

function bytesToBase64Url(bytes){
  let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function base64UrlToBytes(value){
  const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
  const pad='='.repeat((4-normalized.length%4)%4);
  const binary=atob(normalized+pad),bytes=new Uint8Array(binary.length);
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
export async function hashPassword(password,salt,iterations,pepper){
  const material=new TextEncoder().encode(String(password)+'\u0000'+String(pepper||''));
  const key=await crypto.subtle.importKey('raw',material,'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:base64UrlToBytes(salt),iterations},key,256);
  return bytesToBase64Url(new Uint8Array(bits));
}
export function passwordSalt(){return randomToken(18);}
export function constantTimeEqual(a,b){
  const x=String(a||''),y=String(b||'');let diff=x.length^y.length;
  const len=Math.max(x.length,y.length);
  for(let i=0;i<len;i++)diff|=(x.charCodeAt(i%x.length||0)||0)^(y.charCodeAt(i%y.length||0)||0);
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
