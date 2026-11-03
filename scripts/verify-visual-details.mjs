let clearReturningStart = async () => {};
import { installReturningPlayerStart } from './browser-start.mjs';
// Browser regression check. Requires Vite at 127.0.0.1:5174 with base /tea-shop/preview/
// and Chromium remote debugging on 127.0.0.1:9224. Run with Node 22 or newer.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir('work', {recursive:true});
const tabs=await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9224}/json`)).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(); const errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async(expression)=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
let touching=false;
const touch = async p => {
 if(p.type==='mouseMoved'&&!touching)return;
 const type=p.type==='mousePressed'?'touchStart':p.type==='mouseReleased'?'touchEnd':'touchMove';
 touching=type!=='touchEnd';
 await send('Input.dispatchTouchEvent',{type,touchPoints:touching?[{x:p.x,y:p.y,id:1}]:[]});
};
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
await send('Runtime.enable');await send('Page.enable');clearReturningStart = await installReturningPlayerStart(send);await send('Page.bringToFront');
await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5174',storageTypes:'service_workers,cache_storage'});
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});






const pause=(ms=300)=>new Promise(r=>setTimeout(r,ms));
const tap=async selector=>{
 const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await touch({type:'mousePressed',...p});await touch({type:'mouseReleased',...p});await pause();
};
const ready=async()=>{for(let i=0;i<100;i++){if(await evaluate(`!!document.querySelector('#play-tea')&&!document.querySelector('#launch-screen')`))return;await pause(100);}throw Error('Shop did not load');};
const shot=async name=>fs.writeFile('work/visual-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await pause(1400);await ready();
await evaluate(`localStorage.setItem('tea-shop-progress-v1',JSON.stringify({muted:true,bestStars:Array(38).fill(3),bestMoves:Array(38).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:true}}));localStorage.setItem('tea-shop-progress-v1:guide-v1','done');localStorage.removeItem('tea-shop-progress-v1:puzzle-v1');localStorage.setItem('tea-shop-preview-appearance-v1','day')`);
await send('Page.reload');await pause(1400);await ready();await tap('#edit-toggle');await tap('[data-upgrade="counter"]');
for(const night of [false,true]){
 if(night)await tap('#theme-toggle');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('#editor-back')).backgroundColor`),'rgba(0, 0, 0, 0)');
 assert.ok(await evaluate(`document.querySelector('#editor-back').getBoundingClientRect().height>=40`));
 await shot('browse-'+(night?'night':'day'));
}
await tap('#editor-back');assert.ok(await evaluate(`!document.querySelector('#upgrade-rail').classList.contains('hidden')`));await tap('#edit-toggle');await tap('#play-tea');
for(const level of [6,16,38]){
 await evaluate(`document.querySelectorAll('.puzzle-chapter').forEach(e=>e.open=true)`);
 await tap(`[data-level="${level}"]`);
 for(const [width,height,name] of [[320,568,'small'],[390,844,'phone'],[844,390,'landscape'],[1280,900,'desktop']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await pause();
  const geometry=await evaluate(`Array.from(document.querySelectorAll('.mystery .fog')).map(e=>{const r=e.getBoundingClientRect(),s=e.closest('.slot').getBoundingClientRect();return {dx:Math.abs((r.left+r.right-s.left-s.right)/2),dy:Math.abs((r.top+r.bottom-s.top-s.bottom)/2),fits:r.width<=s.width&&r.height<=s.height};})`);
  assert.ok(geometry.length,'has hidden pieces');for(const g of geometry){assert.ok(g.dx<.75&&g.dy<.75&&g.fits,JSON.stringify({level,name,g}));}
  if((level===6||level===38)&&(name==='phone'||name==='desktop'))await shot(`jars-${level}-${name}`);
 }
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause();
 const source=await evaluate(`Number(document.querySelector('.mystery').closest('[data-jar]').dataset.jar)`);
 const dest=await evaluate(`Number([...document.querySelectorAll('[data-jar]')].find(e=>!e.querySelector('.treat')).dataset.jar)`);
 const count=await evaluate(`document.querySelector('[data-jar="${source}"]').querySelectorAll('.mystery').length`);
 await tap(`[data-jar="${source}"]`);await tap(`[data-jar="${dest}"]`);await pause(700);
 assert.equal(await evaluate(`document.querySelector('[data-jar="${source}"]').querySelectorAll('.mystery').length`),0,'pour reveals hidden contents');
 await tap('#undo');assert.equal(await evaluate(`document.querySelector('[data-jar="${source}"]').querySelectorAll('.mystery').length`),count,'Undo restores concealment');
 await tap('[data-go="levels"]');
}
assert.deepEqual(errors,[]);
console.log('PASS: transparent Browse day/night, usable target and return; hidden pieces centered and contained at four viewport sizes on four/five-slot levels; reveal and Undo unchanged.');
await clearReturningStart();ws.close();
