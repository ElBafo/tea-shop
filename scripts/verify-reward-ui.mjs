let clearReturningStart = async () => {};
import { installReturningPlayerStart } from './browser-start.mjs';
// Browser regression check. Requires Vite at 127.0.0.1:5174 with base /tea-shop/preview/
// and Chromium remote debugging on 127.0.0.1:9224. Run with Node 22 or newer.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir('work', {recursive:true});
const tabs=await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9229}/json`)).json();
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





const pause=(ms=500)=>new Promise(r=>setTimeout(r,ms));
const tap=async selector=>{
 if(selector.startsWith('[data-filter') && await evaluate(`Boolean(document.querySelector('.has-selection'))`)) await tap('[data-act="browse"]');
 const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await touch({type:'mousePressed',...p});await touch({type:'mouseReleased',...p});await pause(160);
};
const shot=async name=>fs.writeFile('work/reward-ui-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));

const seed = count => ({muted:true,bestStars:Array.from({length:38},(_,i)=>i<count?3:0),bestMoves:Array(38).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:true}});
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await pause(1800);
const reload=async value=>{
 if(value)await evaluate(`localStorage.setItem('tea-shop-preview-progress-v1',${JSON.stringify(JSON.stringify(value))});localStorage.setItem('tea-shop-preview-progress-v1:guide-v1','done');localStorage.removeItem('tea-shop-preview-progress-v1:puzzle-v1')`);
 await send('Page.reload');await pause(500);
 for(let attempt=0;attempt<80;attempt++){
  if(await evaluate(`Boolean(document.querySelector('#shop-stars strong')) && !document.querySelector('#launch-screen')`))return;
  await pause(250);
 }
 throw Error('Shop did not become ready after reload');
};
const snapshot=()=>evaluate(`localStorage.getItem('tea-shop-preview-progress-v1')`);
const balance=()=>evaluate(`Number(document.querySelector('#shop-stars strong').textContent)`);
const preview=async(id)=>{
 assert.equal(await evaluate(`document.querySelector('.shop-room').classList.contains('decorating')`),true);
 assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').dataset.id`),id);
 assert.equal(await evaluate(`document.querySelector('[data-act="preview"][aria-pressed="true"]').dataset.style`),'0');
};

// Home and puzzle-list rewards must enter a real preview, without spending.
await reload(seed(0));
let before=await snapshot();
await shot('home');
await tap('[data-reward="terrarium"]');await preview('terrarium');
assert.equal(await snapshot(),before);
await tap('#edit-toggle');await tap('#play-tea');
await shot('levels');
await tap('[data-reward="terrarium"]');await preview('terrarium');
assert.equal(await snapshot(),before,'levels preview does not mutate progress');

// Locked reward previews are allowed; even a programmatic click cannot buy early.
for(const [count,id] of [[31,'armchair'],[37,'fountain']]){
 await reload(seed(count));before=await snapshot();
 await tap(`[data-reward="${id}"]`);await preview(id);
 assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').disabled`),true);
 await evaluate(`const buy=document.querySelector('[data-act="buy"]');buy.disabled=false;buy.click()`);
 assert.equal(await snapshot(),before,`${id} purchase guard honors completion gate`);
 assert.match(await evaluate(`document.querySelector('[data-act="buy"]').textContent`), /Unlock at (32|38) puzzles/);
 await evaluate(`document.querySelector('[data-act="buy"]').disabled=true`);
 await shot('locked-'+id);
}

await reload(seed(38));
assert.equal(await balance(),132);
await tap('#edit-toggle');
for(const id of ['armchair','fountain']){
 await tap('[data-filter="all"]');await tap(`[data-upgrade="${id}"]`);
 await tap('[data-act="preview"][data-style="1"]');await tap('[data-act="buy"]');
 assert.equal(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).shop.style[${JSON.stringify(id)}]`),1);
}
assert.equal(await balance(),96,'both late rewards cost36');
await shot('owned-fountain');
before=await snapshot();
await tap('[data-act="return"]');await shot('return-confirm');
assert.equal(await evaluate(`document.activeElement.matches('[data-cancel-return]')`),true,'safe action has initial focus');
await tap('[data-cancel-return]');assert.equal(await snapshot(),before,'cancel leaves progress exactly intact');
await tap('[data-act="return"]');await tap('[data-confirm-return]');
assert.equal(await balance(),116,'fountain full refund');
assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).shop.owned`),['armchair']);
assert.equal(await evaluate(`document.querySelector('.return-dialog')`),null);
await reload();assert.equal(await balance(),116,'refund survives reload');
await tap('#edit-toggle');await tap('[data-filter="owned"]');await tap('[data-upgrade="armchair"]');
await tap('[data-act="return"]');await tap('[data-confirm-return]');
assert.equal(await balance(),132);
await tap('[data-upgrade="counter"]');await tap('[data-act="preview"][data-style="0"]');await tap('[data-act="buy"]');
assert.equal(await balance(),130);
assert.equal(await evaluate(`Boolean(document.querySelector('[data-act="return"]'))`),false,'core pieces expose no return action');
await reload();assert.equal(await balance(),130);
assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).shop.owned`),['counter']);
assert.deepEqual(errors,[],'no runtime exceptions');
console.log('PASS: home/levels reward previews preserve saves;32/38 gates guard purchases; paid style previews, confirm/cancel returns, exact balances, reload persistence and core protection.');
await clearReturningStart();ws.close();
