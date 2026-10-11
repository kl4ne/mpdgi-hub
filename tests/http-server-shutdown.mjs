// F8: terminate active HTTP test connections before waiting for server shutdown.
// Runtime application servers and Cloudflare deployment are not affected.
export async function closeHttpServer(server){
  if(!server)return;
  server.closeAllConnections?.();
  await new Promise((resolve,reject)=>{
    server.close(error=>error?reject(error):resolve());
  });
}
