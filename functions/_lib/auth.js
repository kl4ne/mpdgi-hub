import {getCookie,json} from './http.js';

const SESSION_COOKIE='mpdgi_stats_session';
export const PASSWORD_SCHEME='hmac-sha256-v1';

function bytesToBase64Url(bytes){
  let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export async function passwordVerifier(password,salt,pepper){
  const secret=new TextEncoder().encode(String(pepper||''));
  const key=await crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const message=new TextEncoder().encode(String(salt)+'\u0000'+String(password));
  const signature=await crypto.subtle.sign('HMAC',key,message);
  return bytesToBase64Url(new Uint8Array(signature));
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
