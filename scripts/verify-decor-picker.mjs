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
await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');
await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5174',storageTypes:'service_workers,cache_storage'});
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});



await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1200));
const seed={muted:true,bestStars:Array(20).fill(3),bestMoves:Array(20).fill(0),shop:{owned:[],style:{},place:{},finaleSeen:true}};
await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1600));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();})()`);
await evaluate(`document.querySelector('#edit-toggle').click();document.querySelector('[data-upgrade="counter"]').click();document.querySelector('[data-act="preview"][data-style="2"]').click()`);
if(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop.owned.length`)!==0)throw Error('Preview spent stars');
if(!await evaluate(`Boolean(window.__qaScene.getTransformNodeByName('counter'))`))throw Error('Preview not rendered');
await fs.writeFile('work/decor-preview-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await evaluate(`document.querySelector('[data-act="cancel-preview"]').click()`);
if(await evaluate(`Boolean(window.__qaScene.getTransformNodeByName('counter'))`))throw Error('Cancelled preview remains');
await evaluate(`document.querySelector('[data-act="preview"][data-style="1"]').click();document.querySelector('[data-act="buy"]').click()`);
let saved=await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`);
if(saved.style.counter!==1||saved.owned.length!==1)throw Error('Wrong purchase');
const drag=async(name,y,dx,dz)=>{
 const points=await evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.getTransformNodeByName('${name}').position.clone();const rect=document.querySelector('canvas').getBoundingClientRect();const project=(x,z)=>{const p=v.constructor.Project(new v.constructor(x,${y},z),scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return {x:rect.x+p.x*rect.width/e.getRenderWidth(),y:rect.y+p.y*rect.height/e.getRenderHeight()};};return {start:project(v.x,v.z),end:project(v.x+${dx},v.z+${dz})};})()`);
 await touch({type:'mousePressed',...points.start});
 for(let step=1;step<=12;step++){await touch({type:'mouseMoved',x:points.start.x+(points.end.x-points.start.x)*step/12,y:points.start.y+(points.end.y-points.start.y)*step/12});await new Promise(r=>setTimeout(r,25));}
 await touch({type:'mouseReleased',...points.end});await new Promise(r=>setTimeout(r,200));
};
await new Promise(r=>setTimeout(r,1600));
await drag('counter',1.12,-1,0);
saved=await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`);
if(saved.place.counter.x!==0)throw Error('Counter did not move '+JSON.stringify(saved.place));
const owner=await evaluate(`window.__qaScene.getTransformNodeByName('shopkeeper').position.asArray()`);
if(owner[0]!==1.5||owner[2]!==.5)throw Error('Owner not behind counter '+owner);
await evaluate(`document.querySelector('[data-upgrade="shelves"]').click();document.querySelector('[data-act="preview"][data-style="2"]').click();document.querySelector('[data-act="buy"]').click()`);
await new Promise(r=>setTimeout(r,1600));
await evaluate(`document.querySelector('[data-act="rotate"]').click()`);
saved=await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`);
if(saved.place.shelves.wall!=='left')throw Error('Shelves not on other wall');
await drag('shelves',1.85,0,1);
saved=await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`);
if(saved.place.shelves.x!==1)throw Error('Shelves did not drag '+JSON.stringify(saved.place));
await evaluate(`document.querySelector('#edit-toggle').click()`);
await fs.writeFile('work/shopkeeper-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
if(JSON.stringify(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`))!==JSON.stringify(saved))throw Error('Saved layout changed on reload');
await evaluate(`document.querySelector('#edit-toggle').click();document.querySelector('[data-upgrade="plant"]').click()`);
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,300));
await fs.writeFile('work/decor-preview-desktop.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await evaluate(`localStorage.setItem('tea-shop-progress-v1',JSON.stringify({muted:true,bestStars:Array(20).fill(0),bestMoves:Array(20).fill(0),shop:{owned:[],style:{},place:{},finaleSeen:false}}))`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
await evaluate(`document.querySelector('#edit-toggle').click();document.querySelector('[data-upgrade="counter"]').click();document.querySelector('[data-act="preview"][data-style="2"]').click()`);
if(!await evaluate(`document.querySelector('[data-act="buy"]').disabled`))throw Error('Unaffordable purchase enabled');
if(!await evaluate(`document.querySelector('#upgrade-detail').textContent.includes('2 more stars')`))throw Error('Missing shortfall');
await evaluate(`document.querySelector('#edit-toggle').click()`);
if(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop.owned.length`)!==0)throw Error('Done committed preview');
if(errors.length)throw Error(JSON.stringify(errors));
console.log({previewIsFree:true,cancelRestores:true,explicitPurchase:true,counterTouchDrag:true,ownerFollows:true,shelvesWallSwitchAndTouchDrag:true,reload:true,errors});ws.close();
