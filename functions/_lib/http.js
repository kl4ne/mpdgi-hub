export const NO_STORE_HEADERS={
  'Cache-Control':'no-store, no-cache, must-revalidate, private',
  'Pragma':'no-cache',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer'
};

export function json(data,status=200,extraHeaders={}){
  return new Response(JSON.stringify(data),{status,headers:{...NO_STORE_HEADERS,'Content-Type':'application/json; charset=utf-8',...extraHeaders}});
}

export function text(body,status=200,extraHeaders={}){
  return new Response(body,{status,headers:{...NO_STORE_HEADERS,'Content-Type':'text/plain; charset=utf-8',...extraHeaders}});
}

export async function readJson(request,maxBytes=8192){
  const raw=await request.text();
  if(raw.length>maxBytes)throw Object.assign(new Error('payload_too_large'),{status:413});
  try{return JSON.parse(raw||'{}');}
  catch{throw Object.assign(new Error('invalid_json'),{status:400});}
}

export function getCookie(request,name){
  const raw=request.headers.get('Cookie')||'';
  for(const item of raw.split(';')){
    const [key,...rest]=item.trim().split('=');
    if(key===name)return decodeURIComponent(rest.join('='));
  }
  return '';
}

export function isSameOrigin(request){
  const origin=request.headers.get('Origin');
  if(!origin)return true;
  return origin===new URL(request.url).origin;
}

export function methodNotAllowed(allow='GET'){
  return json({error:'method_not_allowed'},405,{Allow:allow});
}
