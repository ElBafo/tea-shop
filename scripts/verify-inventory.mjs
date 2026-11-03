let clearReturningStart = async () => {};
import { installReturningPlayerStart } from './browser-start.mjs';
// Browser regression check. Requires Vite at 127.0.0.1:5174 with base /tea-shop/preview/
// and Chromium remote debugging on 127.0.0.1:9224. Run with Node 22 or newer.
import fs from 'node:fs/promises';
await fs.mkdir('work', {recursive:true});
const tabs=await (await fetch('http://127.0.0.1:9224/json')).json();
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
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1200));
const seed={muted:true,bestStars:Array(20).fill(3),bestMoves:Array(20).fill(0),shop:{owned:['counter','lamp'],style:{},place:{},finaleSeen:true}};
await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();})()`);
const click=selector=>evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});if(!button||button.getClientRects().length===0)throw Error('Button not visible: '+${JSON.stringify(selector)});button.click();})()`);
const saved=()=>evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`);
const drag=async(name,y,dx,dz)=>{
 const points=await evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.getTransformNodeByName('${name}').position.clone();const rect=document.querySelector('canvas').getBoundingClientRect();const project=(x,z)=>{const p=v.constructor.Project(new v.constructor(x,${y},z),scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return {x:rect.x+p.x*rect.width/e.getRenderWidth(),y:rect.y+p.y*rect.height/e.getRenderHeight()};};return {start:project(v.x,v.z),end:project(v.x+${dx},v.z+${dz})};})()`);
 await touch({type:'mousePressed',...points.start});
 for(let step=1;step<=10;step++){await touch({type:'mouseMoved',x:points.start.x+(points.end.x-points.start.x)*step/10,y:points.start.y+(points.end.y-points.start.y)*step/10});await new Promise(r=>setTimeout(r,30));}
 await touch({type:'mouseReleased',...points.end});await new Promise(r=>setTimeout(r,200));
};
const assert=(value,message)=>{if(!value)throw Error(message);};
await click('#edit-toggle');await click('[data-filter="all"]');await click('[data-upgrade="lamp:2"]');
await click('[data-act="preview"][data-style="2"]');
assert(!(await saved()).owned.includes('lamp:2'),'Preview saved ownership');
await click('[data-act="buy"]');await new Promise(r=>setTimeout(r,1700));
let shop=await saved();assert(shop.owned.includes('lamp:2')&&shop.style['lamp:2']===2,'Second lamp purchase');
assert(shop.style.lamp===0,'Original lamp style changed');
assert(await evaluate(`document.querySelector('#shop-stars').textContent.trim().endsWith('50')`),'Second copy must cost 4 stars');
const first=JSON.stringify(shop.place.lamp);
await drag('lamp:2',1.28,0,2);shop=await saved();
assert(JSON.stringify(shop.place.lamp)===first,'Moving copy moved original');
assert(shop.place['lamp:2'].z===2,'Second lamp cannot drag multiple cells');
await click('#theme-toggle');
await click('[data-act="store"]');
assert((await saved()).stored.includes('lamp:2'),'Store failed');
assert(await evaluate(`!window.__qaScene.getTransformNodeByName('lamp:2') && window.__qaScene.getLightByName('lamp:2-light').intensity===0 && window.__qaScene.getLightByName('lamp-light').intensity>0`),'Stored lamp still lights scene');
const storedState=JSON.stringify(await saved());
await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
await click('#edit-toggle');await click('[data-upgrade="lamp:2"]');
assert(JSON.stringify(await saved())===storedState,'Stored state changed after reload');
await fs.writeFile('work/inventory-stored-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await click('[data-act="place"]');
assert(!(await saved()).stored.includes('lamp:2'),'Place failed');
assert((await saved()).style['lamp:2']===2,'Restore lost style');
assert(await evaluate(`document.querySelector('#shop-stars').textContent.trim().endsWith('50')`),'Store/place changed balance');
const progress=await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1'))`);
assert(progress.bestStars.length===38&&progress.bestStars.slice(0,20).every(s=>s===3)&&progress.bestStars.slice(20).every(s=>s===0),'Legacy score migration');
await click('[data-act="browse"]');
await fs.writeFile('work/inventory-collection-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,300));
await fs.writeFile('work/inventory-desktop.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
assert(!errors.length,JSON.stringify(errors));
console.log('Phone purchase, independent touch drag, night lights, store/place, reload, legacy scores and desktop passed.');await clearReturningStart();ws.close();
