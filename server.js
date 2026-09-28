const http=require("http"),fs=require("fs"),path=require("path"),https=require("https");
const root=__dirname;
const farmingApi=require("./farming-companion/api");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".webp":"image/webp"};

function proxyWikiLoadout(req,res,url){
 const id=url.searchParams.get("id");
 if(!id){res.writeHead(400,{"Content-Type":"application/json"});return res.end(JSON.stringify({error:"Missing id"}))}
 const upstream="https://tools.runescape.wiki/osrs-dps/shortlink?id="+encodeURIComponent(id);
 const opts=new URL(upstream);
 opts.headers={"User-Agent":"RuneRoute/1.0 (osrs.nedtelfer.com)","Accept":"application/json"};
 https.get(opts,r=>{
   let body="";
   r.setEncoding("utf8");
   r.on("data",chunk=>body+=chunk);
   r.on("end",()=>{
     if(r.statusCode<200||r.statusCode>=300){
       res.writeHead(r.statusCode||502,{"Content-Type":"application/json","Cache-Control":"no-store"});
       return res.end(JSON.stringify({error:"Wiki shortlink request failed",status:r.statusCode,details:body.slice(0,500)}));
     }
     res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=300"});
     res.end(body);
   });
 }).on("error",err=>{
   res.writeHead(502,{"Content-Type":"application/json","Cache-Control":"no-store"});
   res.end(JSON.stringify({error:"Wiki shortlink proxy failed",details:err.message}));
 });
}

http.createServer((req,res)=>{
 const url=new URL(req.url,"http://localhost");
 if(url.pathname==="/runeroute/wiki-loadout") return proxyWikiLoadout(req,res,url);
 if(url.pathname==="/farming-companion/api/prices"||url.pathname==="/farming-companion/api/farming") return farmingApi.handle(req,res,url);
 if(url.pathname==="/farming-companion"){res.writeHead(308,{Location:"/farming-companion/"});return res.end()}

 let pathname=decodeURIComponent(url.pathname);
 if(pathname.endsWith("/")) pathname+="index.html";
 const file=path.join(root,pathname);
 if(!file.startsWith(root)){res.writeHead(403);return res.end("Forbidden")}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404,{"Content-Type":"text/plain"});return res.end("Not found")}
  res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"public, max-age=300"});
  fs.createReadStream(file).pipe(res);
 });
}).listen(process.env.PORT||3000,"0.0.0.0",()=>console.log("RuneRoute server running"));
