// Diagnostic only: HTTPS read requests and OPTIONS. No Production POST or D1 writes.
import assert from 'node:assert/strict';
const collector='https://mpdgi-stats.pages.dev/api/collect';
const cards=[
  {id:'ruben-suarez',origin:'https://rscard.mpdgi.org',page:'https://rscard.mpdgi.org/'},
  {id:'nancy-pagan',origin:'https://npcard.pages.dev',page:'https://npcard.pages.dev/'},
  {id:'nancy-pagan',origin:'https://npcard.mpdgi.org',page:null},
  {id:'roberto-macfie',origin:'https://rmcard.pages.dev',page:'https://rmcard.pages.dev/'}
];
async function probe(url,options={}){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{return await fetch(url,{cache:'no-store',redirect:'manual',...options,signal:controller.signal});}
  finally{clearTimeout(timeout);}
}
let failed=false;
for(const card of cards){
  let options;
  try{
    options=await probe(collector,{
      method:'OPTIONS',
      headers:{
        'Origin':card.origin,
        'Access-Control-Request-Method':'POST',
        'Access-Control-Request-Headers':'content-type'
      }
    });
    const cors=options.headers.get('access-control-allow-origin');
    const methods=options.headers.get('access-control-allow-methods');
    console.log(JSON.stringify({card:card.id,origin:card.origin,endpoint:'collector OPTIONS',
      status:options.status,allowedOrigin:cors,allowMethods:methods,
      server:options.headers.get('server'),cfRay:options.headers.get('cf-ray')}));
    if(options.status!==204||cors!==card.origin||!String(methods||'').includes('POST'))failed=true;
  }catch(error){failed=true;console.log(JSON.stringify({card:card.id,origin:card.origin,
    endpoint:'collector OPTIONS',error:String(error.message||error)}));}
  if(!card.page)continue;
  try{
    const url=card.page+'app.js';
    const response=await probe(url);
    const js=await response.text();
    const result={card:card.id,endpoint:'live card JS GET',url,status:response.status,
      collectorConfigured:js.includes(collector),
      targetConfigured:js.includes("const CARD_TARGET='business_card:'+CARD_ID;"),
      allowedHost:js.includes(card.origin.replace('https://','')),
      jsSize:js.length};
    console.log(JSON.stringify(result));
    if(response.status!==200||!result.collectorConfigured||!result.targetConfigured||!result.allowedHost)failed=true;
  }catch(error){failed=true;console.log(JSON.stringify({card:card.id,endpoint:'live card JS GET',
    error:String(error.message||error)}));}
}
try{
  const response=await probe(collector,{method:'GET'});
  console.log(JSON.stringify({endpoint:'collector GET method guard',status:response.status,
    contentType:response.headers.get('content-type')}));
  if(response.status!==405)failed=true;
}catch(error){failed=true;console.log(JSON.stringify({endpoint:'collector GET method guard',error:String(error)}));}
assert.equal(failed,false,'Production read-only collector diagnostic failed');
console.log('All card collector CORS and published JS read-only probes passed');
