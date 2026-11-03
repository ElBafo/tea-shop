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
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
await send('Runtime.enable');await send('Page.enable');clearReturningStart = await installReturningPlayerStart(send);await send('Page.bringToFront');
await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5174',storageTypes:'service_workers,cache_storage'});
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});




await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1200));
const seed={muted:true,bestStars:Array(20).fill(3),bestMoves:Array(20).fill(0),shop:{owned:['counter','lamp'],style:{},place:{},finaleSeen:true}};
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
const half=()=>evaluate(`window.__qaScene.activeCamera.orthoRight`);
const shot=async n=>fs.writeFile('work/'+n+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const start=await half();const original=JSON.stringify(await saved());
await click('[data-zoom="in"]');assert(Math.abs(await half()-start/1.2)<.001,'Zoom in');
await click('[data-zoom="out"]');assert(Math.abs(await half()-start)<.001,'Zoom out');
for(let i=0;i<10;i++)await click('[data-zoom="in"]');
assert(await evaluate(`document.querySelector('[data-zoom="in"]').disabled`),'Max zoom unbounded');
assert(Math.abs(await half()-start/1.9)<.001,'Max clamp');
await click('[data-zoom="fit"]');assert(Math.abs(await half()-start)<.001,'Fit');
const bounds=await evaluate(`(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
await send('Input.dispatchMouseEvent',{type:'mouseWheel',...bounds,deltaX:0,deltaY:-100});
assert(await half()<start,'Wheel zoom');await click('[data-zoom="fit"]');
const pinch=async(edit)=>{
 if(edit)await click('#edit-toggle');
 const center=await evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.getTransformNodeByName('lamp').position.clone();v.y=1.28;const p=v.constructor.Project(v,scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+p.x*r.width/e.getRenderWidth(),y:r.y+p.y*r.height/e.getRenderHeight()};})()`);
 const before=JSON.stringify(await saved());
 // First finger grabs the lamp; the second turns this into a camera gesture.
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...center,id:1}]});
 await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:center.x-8,y:center.y-8,id:1}]});
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:center.x-8,y:center.y-8,id:1},{x:center.x-68,y:center.y-8,id:2}]});
 for(let i=1;i<=6;i++)await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:center.x-8+i*3,y:center.y-8,id:1},{x:center.x-68-i*4,y:center.y-8,id:2}]});
 assert(await half()<start,'Pinch did not zoom');
 await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:center.x+10,y:center.y-8,id:1}]});
 await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:center.x-40,y:center.y-45,id:1}]});
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(JSON.stringify(await saved())===before,'Pinch committed a furniture move');
 await click('[data-zoom="fit"]');
};
await pinch(false);await pinch(true);
await click('[data-zoom="in"]');await click('[data-filter="owned"]');await click('[data-upgrade="lamp"]');
await drag('lamp',1.28,2,-1);
assert((await saved()).place.lamp.x===2,'Drag after pinch at zoom failed');
await click('[data-zoom="fit"]');
for(let i=0;i<6;i++)await click('[data-zoom="out"]');
assert(await evaluate(`document.querySelector('[data-zoom="out"]').disabled`),'Min zoom unbounded');
await click('[data-zoom="fit"]');
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?showroom=1'});await new Promise(r=>setTimeout(r,1600));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();})()`);
const steam=await evaluate(`window.__qaScene.meshes.filter(m=>m.metadata?.steam).length`);assert(steam>=3,'Missing steam');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await new Promise(r=>setTimeout(r,100));
assert(await evaluate(`window.__qaScene.meshes.filter(m=>m.metadata?.steam).every(m=>!m.isEnabled())`),'Reduced motion ignored');
await send('Emulation.setEmulatedMedia',{features:[]});await new Promise(r=>setTimeout(r,100));
if(await evaluate(`document.querySelector('#theme-toggle').textContent==='Night'`))await click('#theme-toggle');
await shot('cozy-fit-phone');await click('[data-zoom="in"]');await shot('cozy-zoom-phone');
await click('#theme-toggle');await shot('cozy-zoom-night');
const beforeResize=await half();
await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await new Promise(r=>setTimeout(r,300));
assert(await half()>0,'Landscape zoom invalid');await click('[data-zoom="fit"]');await shot('cozy-landscape');
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,400));await shot('cozy-desktop');
assert(!errors.length,JSON.stringify(errors));console.log('Buttons, wheel, pinch, clamps, edit cancellation, post-pinch dragging, reduced motion and responsive camera checks passed.');await clearReturningStart();ws.close();
