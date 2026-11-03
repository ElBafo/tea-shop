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
const seed={muted:true,bestStars:Array(30).fill(3),bestMoves:Array(30).fill(0),shop:{owned:['counter','lamp'],style:{},place:{},finaleSeen:true}};
await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();})()`);
const click=async selector=>{if(selector.startsWith('[data-filter') && await evaluate(`Boolean(document.querySelector('.has-selection'))`))await click('[data-act="browse"]');return evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});if(!button||button.getClientRects().length===0)throw Error('Button not visible: '+${JSON.stringify(selector)});button.click();})()`);};
const saved=()=>evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`);
const drag=async(name,y,dx,dz)=>{
 const points=await evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.getTransformNodeByName('${name}').position.clone();const rect=document.querySelector('canvas').getBoundingClientRect();const project=(x,z)=>{const p=v.constructor.Project(new v.constructor(x,${y},z),scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return {x:rect.x+p.x*rect.width/e.getRenderWidth(),y:rect.y+p.y*rect.height/e.getRenderHeight()};};return {start:project(v.x,v.z),end:project(v.x+${dx},v.z+${dz})};})()`);
 await touch({type:'mousePressed',...points.start});
 for(let step=1;step<=10;step++){await touch({type:'mouseMoved',x:points.start.x+(points.end.x-points.start.x)*step/10,y:points.start.y+(points.end.y-points.start.y)*step/10});await new Promise(r=>setTimeout(r,30));}
 await touch({type:'mouseReleased',...points.end});await new Promise(r=>setTimeout(r,200));
};
const assert=(v,m)=>{if(!v)throw Error(m);};
const shot=async(name)=>fs.writeFile('work/'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await click('#edit-toggle');
for(const [id,cost,y,dx,dz] of [['bench',6,.65,1,-2],['trolley',8,.78,0,-1],['planter',10,1.55,-1,0]]) {
 await click('[data-filter="all"]');await click(`[data-upgrade="${id}"]`);
 const before=JSON.stringify(await saved());
 const signatures=[];
 for(let style=0;style<3;style++) {
  await click(`[data-act="preview"][data-style="${style}"]`);
  await new Promise(r=>setTimeout(r,120));
  const meshes=await evaluate(`window.__qaScene.getTransformNodeByName('${id}').getChildMeshes().map(m=>m.name)`);
  assert(meshes.length>5,id+' missing mesh');signatures.push(JSON.stringify(meshes));
  assert(JSON.stringify(await saved())===before,'Preview persisted');
 }
 assert(new Set(signatures).size>=2,id+' styles lack distinct shapes');
 await shot('collection-'+id+'-phone');
 const balance=await evaluate(`Number(document.querySelector('#shop-stars').textContent.replace(/[^0-9]/g,''))`);
 await click('[data-act="buy"]');await new Promise(r=>setTimeout(r,1600));
 assert((await saved()).owned.includes(id),'Purchase missing');
 assert(await evaluate(`Number(document.querySelector('#shop-stars').textContent.replace(/[^0-9]/g,''))`)==balance-cost,'Incorrect cost');
 const previous=(await saved()).place[id];
 await drag(id,y,dx,dz);
 const moved=(await saved()).place[id];
 assert(moved.x===previous.x+dx&&moved.z===previous.z+dz,id+' touch move failed '+JSON.stringify({previous,moved}));
 await click('[data-act="store"]');
 assert(await evaluate(`!window.__qaScene.getTransformNodeByName('${id}')`),'Stored mesh remains');
 await click('[data-act="place"]');
 assert((await saved()).style[id]===2,'Style not retained');
}
const final=JSON.stringify(await saved());
await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
assert(JSON.stringify(await saved())===final,'Reload lost collection');
const progress=await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1'))`);
assert(progress.bestStars.length===38&&progress.bestStars.slice(0,30).every(s=>s===3)&&progress.bestStars.slice(30).every(s=>s===0),'30-level migration failed');
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?showroom=1'});await new Promise(r=>setTimeout(r,1600));
await shot('collection-showroom-phone');await click('#theme-toggle');await shot('collection-showroom-night');
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,500));await shot('collection-showroom-desktop');
assert(!errors.length,JSON.stringify(errors));
console.log('All nine previews, star purchases, touch placement, storage, migration, phone/night/desktop views passed.');await clearReturningStart();ws.close();
