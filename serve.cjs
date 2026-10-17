/* Optional local preview. Run: node serve.cjs */
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const root=__dirname;
const port=Number(process.env.PORT||8080);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=pathname==='/'?'index.html':pathname.slice(1);
    if(file.includes('/')||file.includes('\\')||file.includes('\0')||file.startsWith('.')||!types[path.extname(file)]){res.writeHead(404);res.end('Not found');return;}
    const data=await fs.readFile(path.join(root,file));
    res.writeHead(200,{'Content-Type':types[path.extname(file)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log('JLSI preview: http://127.0.0.1:'+port+'/'));

