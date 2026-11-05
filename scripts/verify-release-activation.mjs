// Production-only browser rehearsal. Use a disposable Chromium profile/CDP9244.
// Copies of the preceding and current production builds live in work/release-before
// and work/release-after; every save below is synthetic test data.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
const origin='http://127.0.0.1:5188',base='/tea-shop/';
const key='tea-shop-edition2-progress-v1',appearance='tea-shop-edition2-appearance-v1';
let build='before';
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,origin).pathname);
  if(pathname.startsWith(base+'preview/')){http.get('http://127.0.0.1:5189'+req.url,upstream=>{res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);}).on('error',()=>{res.writeHead(502);res.end();});return;}
  if(!pathname.startsWith(base)||pathname.includes('..'))throw Error('path');
  const path=pathname.slice(base.length)||'index.html';
  const data=await fs.readFile('work/release-'+build+'/'+path);
  const ext=path.split('.').pop();res.writeHead(200,{'Content-Type':({js:'application/javascript',html:'text/html',css:'text/css',webmanifest:'application/manifest+json',png:'image/png',webp:'image/webp'})[ext]??'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(5188,'127.0.0.1',r));
const tabs=await(await fetch('http://127.0.0.1:'+(process.env.CDP_PORT??9244)+'/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(),errors=[],evidence={};
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}));});
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const page=(fn,...args)=>ev('('+fn.toString()+')('+args.map(a=>JSON.stringify(a)).join(',')+')');
const pause=(ms=160)=>new Promise(r=>setTimeout(r,ms));
const until=async(fn,...args)=>{for(let i=0;i<600;i++){if(await page(fn,...args))return;await pause(125);}throw Error('Timed out '+fn);};
const ready=async()=>{await pause(500);for(let i=0;i<600;i++){try{if(await page(()=>document.readyState==='complete'&&document.querySelector('#launch-start')?.disabled===false))return;}catch(e){if(e?.code!==-32000||!/navigated|context.*destroyed|Cannot find context/i.test(e.message))throw e;}await pause(125);}throw Error('Start unavailable');};
const tap=async selector=>{const p=await page(selector=>{const e=document.querySelector(selector);if(!e||e.disabled||e.closest('[inert]')||!e.checkVisibility())throw Error('Unavailable '+selector);e.scrollIntoView({block:'nearest',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},selector);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause();};
const view=(width,height)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
const shot=async name=>fs.writeFile('work/release-activation-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const saved=()=>page(key=>JSON.parse(localStorage.getItem(key)),key);
const outside=()=>page((key,appearance)=>JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().filter(k=>!k.startsWith(key)&&k!==appearance).map(k=>[k,localStorage.getItem(k)]))),key,appearance);
const enter=async()=>{await ready();await tap('#launch-start');await until(()=>!!document.querySelector('#shop-canvas'));};
const noDevControls=()=>page(()=>!document.querySelector('.preview-bar,#reset-preview')&&!document.body.innerText.includes('See finished shop'));
const synthetic=count=>({muted:true,bestStars:Array(count).fill(3),bestMoves:Array.from({length:count},(_,i)=>i+3),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:true}});
const fit=()=>page(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
try{
 await fs.mkdir('work',{recursive:true});await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});await view(390,844);
 await send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});
 await send('Page.navigate',{url:origin+base});await ready();
 await page((old,preview)=>{localStorage.clear();localStorage.setItem('tea-shop-progress-v1',JSON.stringify(old));localStorage.setItem('tea-shop-progress-v1:recovery',JSON.stringify(old));localStorage.setItem('tea-shop-progress-v1:guide-v1','done');localStorage.setItem('tea-shop-appearance-v1','night');localStorage.setItem('tea-shop-preview-progress-v1','untouched-classic-preview');localStorage.setItem('tea-shop-preview-edition2-progress-v1',JSON.stringify(preview));localStorage.setItem('tea-shop-preview-edition2-progress-v1:guide-v1','done');localStorage.setItem('tea-shop-preview-edition2-appearance-v1','night');localStorage.setItem('activation-unrelated','keep');},synthetic(38),synthetic(24));
 await send('Page.reload');await enter();
 assert.equal(await page(()=>document.body.classList.contains('edition-two')),false,'preceding production runs original game');
 await until(()=>!!navigator.serviceWorker.controller);
 assert.equal(await page(()=>navigator.serviceWorker.getRegistration().then(r=>r.scope)),origin+base);
 const sentinels=await outside();const oldWorker=await page(()=>navigator.serviceWorker.controller.scriptURL);
 build='after';
 await page(()=>navigator.serviceWorker.getRegistration().then(r=>r.update()));
 await until(()=>navigator.serviceWorker.getRegistration().then(r=>!!r.waiting));
 await until(()=>!!document.querySelector('[data-update]'));await tap('[data-update]');await ready();
 assert.equal(await page(()=>document.querySelector('.launch-version').textContent),'v0.2.0 · Second edition');
 assert.equal(await page(()=>document.body.classList.contains('edition-two')),true);
 await shot('start-phone');await tap('#launch-start');await until(()=>!!document.querySelector('[data-guide-start]'));
 assert.equal(await page(()=>Number(document.querySelector('#shop-stars strong').textContent)),0);
 assert.equal((await saved())?.shop.owned.length??0,0);assert.equal(await noDevControls(),true);
 assert.equal(await outside(),sentinels,'installed update leaves legacy/preview saves untouched');
 await shot('welcome-phone');await view(320,568);await pause();const welcomeBox=await page(()=>{const r=document.querySelector('.welcome-card').getBoundingClientRect();return{top:r.top,bottom:r.bottom,right:r.right};});assert.ok(welcomeBox.top>=0&&welcomeBox.bottom<=568&&welcomeBox.right<=320,JSON.stringify(welcomeBox));await shot('welcome-small-phone');await view(390,844);
 evidence.installedUpdate={oldWorker,version:'0.2.0',freshGuide:true,balance:0,legacyAndPreviewUnchanged:true};
 await tap('[data-guide-start]');assert.equal(await page(()=>document.querySelector('.play h2').textContent),'First Pour');await shot('first-puzzle-phone');
 for(const [from,to]of [[0,2],[1,0],[1,2]]){await tap('[data-jar="'+from+'"]');await tap('[data-jar="'+to+'"]');await until(()=>document.querySelector('.shelves')?.getAttribute('aria-busy')==='false');}
 await until(()=>!!document.querySelector('.result-overlay'));assert.equal((await saved()).bestStars.length,24);assert.equal((await saved()).bestStars[0],3);await shot('first-win-phone');
 await tap('.result-overlay [data-go="shop"][data-edit]');await until(()=>document.querySelector('.shop-room')?.classList.contains('decorating'));
 if(!await page(()=>!!document.querySelector('[data-act="preview"]')))await tap('[data-upgrade="counter"]');
 await tap('[data-act="preview"][data-style="1"]');const beforePurchase=await saved();assert.deepEqual(beforePurchase.shop.owned,[]);
 await tap('[data-act="buy"]');assert.deepEqual((await saved()).shop.owned,['counter']);assert.equal((await saved()).shop.style.counter,1);assert.equal(await page(()=>Number(document.querySelector('#shop-stars strong').textContent)),1);
 const placement=(await saved()).shop.place.counter;await tap('[data-act="rotate"]');assert.notDeepEqual((await saved()).shop.place.counter,placement);await tap('#undo-move');assert.deepEqual((await saved()).shop.place.counter,placement);
 await tap('[data-guide-done]');await shot('first-decoration-phone');await tap('#edit-toggle');
 await tap('#theme-toggle');await tap('#mute');
 assert.equal(await page(appearance=>localStorage.getItem(appearance),appearance),'night');assert.equal((await saved()).muted,true);
 await send('Page.reload');await enter();assert.equal(await page(()=>!!document.querySelector('[data-guide-start]')),false);assert.deepEqual((await saved()).shop.owned,['counter']);assert.equal((await saved()).muted,true);assert.equal(await page(()=>document.documentElement.classList.contains('shop-night')),true);
 await tap('.settings-menu summary');assert.equal(await page(()=>!!document.querySelector('#reset-preview')),false);await tap('#browse-puzzles');assert.equal(await page(()=>document.querySelectorAll('.level-btn').length),24);await tap('[data-go="shop"]');
 await tap('#edit-toggle');await tap('[data-filter="all"]');assert.equal(await page(()=>document.querySelectorAll('#upgrade-rail [data-upgrade]').length),17,'one of18designs already owned');await tap('#edit-toggle');
 await tap('#play-tea');assert.equal(await page(()=>document.querySelector('.play h2').textContent),'A Little Space');await tap('[data-jar="1"]');await tap('[data-jar="2"]');await until(()=>document.querySelector('.shelves')?.getAttribute('aria-busy')==='false');
 assert.equal(await page(()=>document.querySelector('.moves').textContent),'1 move');
 await send('Page.reload');await enter();await tap('#play-tea');assert.equal(await page(()=>document.querySelector('.moves').textContent),'1 move');await tap('#undo');assert.equal(await page(()=>document.querySelector('.moves').textContent),'0 moves');
 await tap('[data-go="levels"]');await tap('[data-go="shop"]');
 assert.equal(await outside(),sentinels);evidence.onboarding={firstWin:3,firstPurchase:'counter',style:1,balance:1,rotationUndo:true,nextPuzzle:2,resumeUndo:true,mainCount:24,catalogue:18,preferences:true};
 const current=await saved();
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await send('Page.reload');await enter();assert.deepEqual(await saved(),current);assert.equal(await page(()=>document.body.classList.contains('edition-two')),true);assert.equal(await noDevControls(),true);await shot('offline-reopened-phone');
 await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});evidence.offline={reopened:true,progressPreserved:true,editionTwo:true};
 for(const [name,w,h] of [['small-phone',320,568],['phone',390,844],['landscape',844,390],['desktop',1280,900]]){
  await view(w,h);await send('Page.navigate',{url:origin+base+'?edition=2&tour=1&showroom=1'});await enter();assert.equal(await noDevControls(),true);assert.deepEqual(await saved(),current,'main query demo flags never overwrite/grant a showroom');assert.equal(await page(()=>document.querySelector('.welcome-overlay')),null);
  const dimensions=await fit();assert.ok(dimensions.scroll<=w+1&&dimensions.body<=w+1,JSON.stringify(dimensions));await shot('shop-'+name);
  await tap('#play-tea');await shot('puzzle-'+name);assert.ok((await fit()).scroll<=w+1);
 }
 await view(390,844);await send('Page.navigate',{url:origin+base});await enter();
 const beforeCorrupt=await saved();await page(()=>localStorage.setItem('tea-shop-progress-v1','corrupt old save'));await send('Page.reload');await enter();assert.deepEqual(await saved(),beforeCorrupt,'corrupted old save cannot damage active edition');
 await page(old=>localStorage.setItem('tea-shop-progress-v1',old),JSON.parse(sentinels)['tea-shop-progress-v1']);assert.equal(await outside(),sentinels);
 const releaseState=await saved();await send('Page.navigate',{url:origin+base+'preview/?edition=2'});await enter();assert.equal(await page(()=>!!document.querySelector('.preview-bar')),true);assert.equal(await page(()=>Number(document.querySelector('#shop-stars strong').textContent)),92);assert.deepEqual(await saved(),releaseState,'preview does not read or mutate the main second-edition save');assert.equal(await outside(),sentinels,'opening preview retains its prior progress');await tap('.settings-menu summary');assert.equal(await page(()=>!!document.querySelector('#reset-preview')),true);await send('Page.navigate',{url:origin+base});await enter();assert.deepEqual(await saved(),releaseState);assert.equal(await noDevControls(),true);evidence.previewIsolation={previousProgressRetained:true,mainUnchanged:true,resetPreviewOnly:true};
 evidence.viewports=['320×568','390×844','844×390','1280×900'];evidence.queryFlags={tourIgnored:true,showroomIgnored:true,resetAbsent:true};
 assert.deepEqual(errors,[]);evidence.errors=errors;await fs.writeFile('work/release-activation-check.json',JSON.stringify(evidence,null,2));
 console.log('PASS: real installed production update opens fresh second-edition onboarding; first win→preview→purchase→arrange, 24 puzzles/18 designs, normal save/preferences/resume, hidden development controls, four viewport sizes and offline reopening; synthetic classic/preview data remains unchanged.');
}catch(error){await shot('failure').catch(()=>{});await fs.writeFile('work/release-activation-failure.json',JSON.stringify({error:String(error),stack:error.stack,screen:await page(()=>document.body.innerText).catch(()=>null)},null,2));throw error;}
finally{await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1}).catch(()=>{});ws.close();server.close();}
