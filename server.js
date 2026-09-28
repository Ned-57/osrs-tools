const http=require("http"),fs=require("fs"),path=require("path");
const root=__dirname;
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml"};
http.createServer((req,res)=>{
 let pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 if(pathname.endsWith("/")) pathname+="index.html";
 let file=path.join(root,pathname);
 if(!file.startsWith(root)){res.writeHead(403);return res.end("Forbidden")}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404,{"Content-Type":"text/plain"});return res.end("Not found")}
  res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"public, max-age=300"});
  fs.createReadStream(file).pipe(res);
 });
}).listen(process.env.PORT||3000,"0.0.0.0",()=>console.log("RuneRoute server running"));