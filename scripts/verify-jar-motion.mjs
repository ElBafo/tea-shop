let clearReturningStart = async () => {};
import { installReturningPlayerStart } from './browser-start.mjs';
// Browser regression check. Requires Vite at 127.0.0.1:5174 with base /tea-shop/preview/
// and Chromium remote debugging on 127.0.0.1:9224. Run with Node 22 or newer.
import fs from 'node:fs/promises';
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





await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1400));
const seed={muted:true,bestStars:Array(38).fill(0),bestMoves:Array(38).fill(0),shop:{owned:[],style:{},place:{},finaleSeen:false}};
await evaluate(`localStorage.setItem('tea-shop-preview-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
await evaluate(`document.querySelector('#play-tea').click();document.querySelector('.continue-card').click();document.querySelector('[data-jar="0"]').click();document.querySelector('[data-jar="2"]').click()`);
if(await evaluate(`document.querySelectorAll('.flying-treat').length`)!==2)throw Error('Treats not animated');
await evaluate(`document.querySelector('[data-jar="1"]').click();document.querySelector('[data-jar="0"]').click()`);
if(await evaluate(`document.querySelector('.moves').textContent`)!=='1 move')throw Error('Rapid tap changed board mid-pour');
await fs.writeFile('work/jars-transfer.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await evaluate(`document.querySelector('[data-go="levels"]').click()`);
await new Promise(r=>setTimeout(r,450));
if(await evaluate(`document.querySelectorAll('.flying-treat').length`))throw Error('Flyer leaked on navigation');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await evaluate(`document.querySelector('.continue-card').click();document.querySelector('[data-jar="0"]').click();document.querySelector('[data-jar="2"]').click()`);
await new Promise(r=>setTimeout(r,40));
if(await evaluate(`document.querySelectorAll('.flying-treat').length`))throw Error('Reduced motion still flies');
if(await evaluate(`document.querySelector('.shelves').getAttribute('aria-busy')`)!=='false')throw Error('Reduced motion stuck');
await send('Emulation.setEmulatedMedia',{features:[]});
if(errors.length)throw Error(JSON.stringify(errors));
console.log('PASS: flying treats, rapid-tap guard, navigation cleanup, reduced motion.');await clearReturningStart();ws.close();
