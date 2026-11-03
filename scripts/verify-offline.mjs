let clearReturningStart = async () => {};
import { installReturningPlayerStart } from './browser-start.mjs';
// Production-browser test. Build work/offline-a with base /tea-shop/preview/ first.
// Requires Chromium CDP; serves two versions on a temporary local HTTP server.
import fs from 'node:fs/promises';
import http from 'node:http';
import assert from 'node:assert/strict';
import {buildOffline} from './build-offline.mjs';
const saveKey=process.env.SAVE_KEY || 'tea-shop-progress-v1';
await fs.cp('work/offline-a','work/offline-b',{recursive:true});
for(const version of ['a','b']) {
 const dir='work/offline-'+version;
 const html=await fs.readFile(dir+'/index.html','utf8');
 await fs.writeFile(dir+'/index.html',html.replace('<head>','<head><meta name="test-build" content="'+version+'">'));
 await buildOffline(dir,'/tea-shop/preview/');
}
let version='a';
const server=http.createServer(async(req,res)=>{
 try{
 let path=new URL(req.url,'http://localhost').pathname.replace('/tea-shop/preview/','');
 if(!path || path.endsWith('/'))path+='index.html';
 if(path.includes('..'))throw Error('path');
 const data=await fs.readFile('work/offline-'+version+'/'+path);
 const ext=path.split('.').pop();
 res.writeHead(200,{'Content-Type':({js:'application/javascript',html:'text/html',css:'text/css',webmanifest:'application/manifest+json',png:'image/png'})[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(5180,'127.0.0.1',r));
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT||9225}/json`)).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=async expr=>{for(let i=0;i<160;i++){if(await ev(expr))return;await new Promise(r=>setTimeout(r,150));}throw Error('Timed out: '+expr);};
try{
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
 clearReturningStart = await installReturningPlayerStart(send);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5180',storageTypes:'all'});
 await send('Page.navigate',{url:'http://127.0.0.1:5180/tea-shop/preview/offline/'});
 await wait(`!document.querySelector('#launch-screen') && !!document.querySelector('#play-tea') && !!navigator.serviceWorker.controller`);
 assert.equal(await ev(`document.querySelector('[name="test-build"]').content`),'a');
 const scope=await ev(`navigator.serviceWorker.getRegistration().then(r=>r.scope)`);
 assert.ok(scope.endsWith('/preview/offline/'));
 await ev(`caches.open('unrelated-app').then(c=>c.put('/unrelated',new Response('keep')))`);
 await ev(`document.querySelector('#play-tea').click();document.querySelector('.continue-card').click()`);
 version='b';
 await ev(`navigator.serviceWorker.getRegistration().then(r=>r.update())`);
 await wait(`navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)`);
 assert.equal(await ev(`!!document.querySelector('.update-notice')`),false,'No update prompt during puzzle');
 assert.equal(await ev(`document.querySelector('[name="test-build"]').content`),'a','No forced reload');
 for(const [from,to] of [[0,2],[1,0],[1,2]]){
  await ev(`document.querySelector('[data-jar="${from}"]').click();document.querySelector('[data-jar="${to}"]').click()`);
  if(from===1&&to===2)assert.equal(await ev(`JSON.parse(localStorage.getItem('${saveKey}')).bestStars[0]`),3,'Save precedes celebration');
  await wait(`document.querySelector('.shelves').getAttribute('aria-busy')==='false'`);
 }
 await wait(`!!document.querySelector('.result-overlay') && !!document.querySelector('[data-update]')`);
 await fs.writeFile('work/jars-celebration.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
 await ev(`document.querySelector('[data-update]').click()`);
 await wait(`document.querySelector('[name="test-build"]')?.content==='b' && !document.querySelector('#launch-screen') && !!document.querySelector('#play-tea')`);
 assert.equal(await ev(`JSON.parse(localStorage.getItem('${saveKey}')).bestStars[0]`),3);
 assert.equal(await ev(`caches.has('unrelated-app')`),true);
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await send('Page.reload');
 await wait(`!document.querySelector('#launch-screen') && !!document.querySelector('#play-tea')`);
 assert.equal(await ev(`document.querySelector('[name="test-build"]').content`),'b');
 await ev(`document.querySelector('#play-tea').click();document.querySelector('.continue-card').click()`);
 await wait(`!!document.querySelector('.shelves')`);
 assert.equal(await ev(`JSON.parse(localStorage.getItem('${saveKey}')).bestStars[0]`),3);
 await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 await send('Page.navigate',{url:'http://127.0.0.1:5180/tea-shop/preview/'});
 await wait(`!document.querySelector('#launch-screen') && !!document.querySelector('#play-tea')`);
 assert.equal(await ev(`!!navigator.serviceWorker.controller`),false,'Ordinary preview stays uncontrolled');
 await send('Network.setBlockedURLs',{urls:['*/assets/index-*.js']});
 await send('Page.reload');
 await wait(`document.querySelector('#launch-status')?.textContent.includes('couldn’t open')`);
 assert.equal(await ev(`document.querySelector('#launch-start').disabled && !document.querySelector('#launch-retry').hidden`),true,'Failed module keeps Reload available');
 await send('Network.setBlockedURLs',{urls:[]});
 console.log('PASS: coherent offline shell, scoped preview, deferred update, immediate saved reward, explicit upgrade, offline reopen, unrelated cache preservation.');
}finally{await send('Network.setBlockedURLs',{urls:[]}).catch(()=>{});await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1}).catch(()=>{});await clearReturningStart();ws.close();server.close();}
