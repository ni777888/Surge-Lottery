/*
Surge iOS 6 | Official Lottery Notifications
Cron only. First successful read establishes baseline; later issue changes notify.
*/
const U="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile";
const W=[
{k:"ssq",n:"双色球",api:"ssq",p:"https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/",c:7,m:"ssq"},
{k:"kl8",n:"快乐8",api:"kl8",p:"https://www.cwl.gov.cn/ygkj/wqkjgg/kl8/",c:20},
{k:"fc3d",n:"福彩3D",api:"3d",p:"https://www.cwl.gov.cn/ygkj/wqkjgg/fc3d/",c:3},
{k:"qlc",n:"七乐彩",api:"qlc",p:"https://www.cwl.gov.cn/ygkj/wqkjgg/qlc/",c:8,m:"qlc"}];
const T=[{k:"dlt",n:"超级大乐透",g:"85",c:7},{k:"pls",n:"排列3",g:"35",c:3},{k:"plw",n:"排列5",g:"350133",c:5},{k:"qxc",n:"7星彩",g:"04",c:7}];
const KEY="lottery_official_last_v3";
function get(u,h,cb){$httpClient.get({url:u,timeout:25,headers:h},(e,r,b)=>{if(e)return cb(String(e));if(!r||r.status<200||r.status>=300||!b)return cb("HTTP失败");cb(null,b,r.headers||{});});}
function a(x){return (Array.isArray(x)?x:String(x||"").trim().split(/[\s,，+|]+/)).map(String).filter(Boolean);}
function valid(x,n){return x.length===n&&x.every(v=>/^\d{1,2}$/.test(v));}
function wf(s,cb){get(s.p,{"User-Agent":U,"Referer":s.p},(e,b,h)=>{if(e)return cb(e);let cs=[];Object.keys(h).forEach(k=>{if(k.toLowerCase()==="set-cookie"){let v=h[k];cs=cs.concat(Array.isArray(v)?v:[v]);}});let ck=cs.map(x=>String(x).split(";")[0]).filter(Boolean).join("; ");let u="https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name="+encodeURIComponent(s.api)+"&pageNo=1&pageSize=3&systemType=PC";let hh={"User-Agent":U,"Accept":"application/json","Referer":s.p,"Origin":"https://www.cwl.gov.cn"};if(ck)hh.Cookie=ck;get(u,hh,(e2,b2)=>{if(e2)return cb(e2);let j;try{j=JSON.parse(b2)}catch(_){return cb("非JSON")};let x=j&&j.result&&j.result[0];if(!x)return cb("官方无记录");let ns=s.m==="ssq"?a(x.red).concat(a(x.blue)):s.m==="qlc"?a(x.red).concat(a(x.blue||x.special)):a(x.red||x.openCode||x.codeNumber||x.number);if(!x.code||!valid(ns,s.c))return cb("字段校验失败");cb(null,{k:s.k,n:s.n,i:String(x.code),v:ns.join(" ")});});});}
function sp(s,cb){let u="https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo="+s.g+"&provinceId=0&pageSize=3&isVerify=1&pageNo=1";get(u,{"User-Agent":U,"Accept":"application/json","Referer":"https://m.lottery.gov.cn/"},(e,b)=>{if(e)return cb(e);let j;try{j=JSON.parse(b)}catch(_){return cb("非JSON")};let x=j&&j.value&&j.value.list&&j.value.list[0];if(!x)return cb("官方无记录");let ns=a(x.lotteryDrawResult);if(!x.lotteryDrawNum||!valid(ns,s.c))return cb("字段校验失败");cb(null,{k:s.k,n:s.n,i:String(x.lotteryDrawNum),v:ns.join(" ")});});}
let state={};try{state=JSON.parse($persistentStore.read(KEY)||"{}")}catch(_){}let first=Object.keys(state).length===0,changed=[],errs=[],left=8;
W.concat(T).forEach(s=>{let cb=(e,x)=>{if(e)errs.push(s.n+": "+e);else{if(!first&&state[x.k]&&state[x.k]!==x.i)$notification.post("彩票开奖更新",x.n+" 第"+x.i+"期","开奖号码："+x.v);state[x.k]=x.i;}left--;if(!left){$persistentStore.write(JSON.stringify(state),KEY);$done();}};if(W.indexOf(s)>=0)wf(s,cb);else sp(s,cb);});
