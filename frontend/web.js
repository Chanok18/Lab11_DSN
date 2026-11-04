const http=require('http');
const fs=require('fs');

http.createServer((req,res)=>{
  if(req.url.startsWith('/api/')){
    const proxy=http.request({
      hostname:'127.0.0.1',
      port:3000,
      path:req.url,
      method:req.method,
      headers:{'content-type':req.headers['content-type']||'application/json'}
    },respuesta=>{
      res.writeHead(respuesta.statusCode,respuesta.headers);
      respuesta.pipe(res);
    });

    proxy.on('error',()=>{
      res.writeHead(502);
      res.end('Backend no disponible');
    });

    req.pipe(proxy);
    return;
  }

  if(req.url!=='/'&&req.url!=='/index.html'){
    res.writeHead(404);
    res.end('No encontrado');
    return;
  }

  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  fs.createReadStream('index.html').pipe(res);
}).listen(8080,'0.0.0.0',()=>{
  console.log('Frontend disponible en puerto 8080');
});
