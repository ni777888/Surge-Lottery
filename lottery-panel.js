/*
Surge iOS 6 | Official Lottery Panel
Reads official public JSON endpoints only. No guessed results.
*/
const UA="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile";
const W=[
{name:"双色球",key:"ssq",api:"ssq",page:"https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/",n:7,mode:"ssq"},
{name:"快乐8",key:"kl8",api:"kl8",page:"https://www.cwl.gov.cn/ygkj/wqkjgg/kl8/",n:20},
{name:"福彩3D",key:"fc3d",api:"3d",page:"https://www.cwl.gov.cn/ygkj/wqkjgg/fc3d/",n:3},
{name:"七乐彩",key:"qlc",api:"qlc",page:"https://www.cwl.gov.cn/ygkj/wqkjgg/qlc/",n:8,mode:"qlc"}
];
const T=[
{name:"超级大乐透",key:"dlt",game:"85",n:7},
{name:"排列3",key:"pls",game:"35",n:3},
{name:"排列5",key:"plw",game:"350133",n:5},
{name:"7星彩",key:"qxc",game:"04",n:7}
];
function get(url,h,cb){$httpClient.get({url:url,timeout:25,headers:h},(e,r,b)=>{if(e)return cb(String(e));if(!r||r.status<200||r.status>=300||!b)return cb("HTTP请求失败"+(r?"："+r.status:""));cb(null,b,r.headers||{});});}
function arr(x){return (Array.isArray(x)?x:String(x||"").trim().split(/[\s,，+|]+/)).map(String).filter(Boolean);}
function ok(a,n){return a.length===n&&a.every(x=>/^\d{1,2}$/.test(x));}
function welfare(s,cb){
get(s.page,{"User-Agent":UA,"Referer":s.page},(e,b,h)=>{
if(e)return cb(e);
let cookies=[];Object.keys(h).forEach(k=>{if(k.toLowerCase()==="set-cookie"){let v=h[k];cookies=cookies.concat(Array.isArray(v)?v:[v]);}});
let cookie=cookies.map(x=>String(x).split(";")[0]).filter(Boolean).join("; ");
let url="https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name="+encodeURIComponent(s.api)+"&issueCount=&issueStart=&issueEnd=&dayStart=&dayEnd=&pageNo=1&pageSize=5&systemType=PC";
let hh={"User-Agent":UA,"Accept":"application/json","Referer":s.page,"Origin":"https://www.cwl.gov.cn"};if(cookie)hh.Cookie=cookie;
get(url,hh,(e2,raw)=>{if(e2)return cb(e2);let j;try{j=JSON.parse(raw)}catch(_){return cb("官方接口返回非JSON")};let x=j&&j.result&&j.result[0];if(!x)return cb(j.message||"官方接口无开奖记录");let a=[];
if(s.mode==="ssq")a=arr(x.red).concat(arr(x.blue));else if(s.mode==="qlc")a=arr(x.red).concat(arr(x.blue||x.special));else a=arr(x.red||x.openCode||x.codeNumber||x.number);
if(!x.code||!ok(a,s.n))return cb("官方字段/号码数量校验失败");cb(null,{name:s.name,issue:String(x.code),date:String(x.date||""),numbers:a.join(" ")});
});
});
}
function sport(s,cb){
let url="https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo="+s.game+"&provinceId=0&pageSize=5&isVerify=1&pageNo=1";
get(url,{"User-Agent":UA,"Accept":"application/json","Referer":"https://m.lottery.gov.cn/"},(e,b)=>{if(e)return cb(e);let j;try{j=JSON.parse(b)}catch(_){return cb("官方接口返回非JSON")};let x=j&&j.value&&j.value.list&&j.value.list[0];if(!x)return cb("官方接口无开奖记录");let a=arr(x.lotteryDrawResult);if(!x.lotteryDrawNum||!ok(a,s.n))return cb("官方字段/号码数量校验失败");cb(null,{name:s.name,issue:String(x.lotteryDrawNum),date:String(x.lotteryDrawTime||""),numbers:a.join(" ")})});
}
let specs=W.concat(T),out=[],left=specs.length;
specs.forEach(s=>{let fn=(e,x)=>{out.push(e?{name:s.name,error:e}:x);left--;if(left)return;out.sort((a,b)=>specs.findIndex(z=>z.name===a.name)-specs.findIndex(z=>z.name===b.name));let good=out.filter(x=>!x.error),bad=out.filter(x=>x.error);let lines=["官方开奖数据："+good.length+"/8项成功",""];out.forEach(x=>{lines.push("【"+x.name+"】");lines.push(x.error?"获取失败："+x.error:"第"+x.issue+"期"+(x.date?" · "+x.date:"")+"\n"+x.numbers);lines.push("");});lines.push("来源：中国福彩网 / 中国体彩网");lines.push("检查时间："+new Date().toLocaleString());lines.push("失败项目不会用模拟号码填充。");$done({title:"体彩 · 福彩开奖结果",content:lines.join("\n"),style:bad.length?"alert":"good"});};if(W.indexOf(s)>=0)welfare(s,fn);else sport(s,fn);});
