import assert from 'node:assert/strict';
import {createServer,get,Agent} from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';
import {closeHttpServer} from './http-server-shutdown.mjs';

const server=createServer((_req,res)=>{
  // Simulate a browser request that has received headers but has not finished.
  res.writeHead(200,{'Content-Type':'text/plain','Connection':'keep-alive'});
  res.write('partial response');
});
const events=[];
const oldCloseAll=server.closeAllConnections.bind(server);
const oldClose=server.close.bind(server);
server.closeAllConnections=()=>{events.push('closeAllConnections');oldCloseAll();};
server.close=(callback)=>{events.push('close');oldClose(callback);};
const agent=new Agent({keepAlive:true});
let response;
let req;
try{
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  response=await new Promise((resolve,reject)=>{
    req=get('http://127.0.0.1:'+server.address().port,{agent},resolve);
    req.once('error',reject);
  });
  response.on('error',()=>{});
  const shutdown=closeHttpServer(server).then(()=>true);
  const result=await Promise.race([shutdown,delay(1500).then(()=>false)]);
  assert.equal(result,true,'Test HTTP server shutdown was blocked by an active request');
  assert.deepEqual(events,['closeAllConnections','close'],'Server connections must be terminated before close');
  await closeHttpServer(null);
  console.log('F8: active-connection server cleanup and null guard verified');
}finally{
  response?.destroy();
  req?.destroy();
  agent.destroy();
  if(server.listening){
    server.closeAllConnections?.();
    await new Promise(resolve=>server.close(()=>resolve()));
  }
}
