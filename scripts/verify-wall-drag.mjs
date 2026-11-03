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




await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1200));
const seed={muted:true,bestStars:Array(38).fill(3),bestMoves:Array(38).fill(0),shop:{owned:['clock'],style:{},place:{clock:{x:0,z:0,rot:0,wall:'back'}},finaleSeen:true}};
await evaluate(`localStorage.setItem('tea-shop-preview-progress-v1',${JSON.stringify(JSON.stringify(seed))});localStorage.setItem('tea-shop-preview-progress-v1:guide-v1','done')`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1800));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();document.querySelector('#edit-toggle').click();})()`);
const project=async (x,y,z)=>evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.activeCamera.position,rect=document.querySelector('canvas').getBoundingClientRect();const p=v.constructor.Project(new v.constructor(${x},${y},${z}),scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return {x:rect.x+p.x*rect.width/e.getRenderWidth(),y:rect.y+p.y*rect.height/e.getRenderHeight()};})()`);
const drag=async(a,b)=>{await touch({type:'mousePressed',...a});for(let i=1;i<=20;i++){await touch({type:'mouseMoved',x:a.x+(b.x-a.x)*i/20,y:a.y+(b.y-a.y)*i/20});await new Promise(r=>setTimeout(r,25));}await touch({type:'mouseReleased',...b});await new Promise(r=>setTimeout(r,250));};

const saved=()=>evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).shop.place.clock`);
for (const width of [390, 1200]) {
 await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<500});
 await new Promise(r=>setTimeout(r,350));
 await drag(await project(.5,2.48,.08),await project(.08,2.48,4.5));
 assert.deepEqual(await saved(),{x:4,z:0,rot:1,wall:'left'});
 // The window occupies the far half of the back wall: snap to its nearest free slot.
 await drag(await project(.08,2.48,4.5),await project(5.5,2.48,.08));
 assert.deepEqual(await saved(),{x:2,z:0,rot:0,wall:'back'});
 await drag(await project(2.5,2.48,.08),await project(.5,2.48,.08));
 assert.equal((await saved()).x,0);
 console.log(`Cross-wall touch dragging and window snapping passed at ${width}px`);
}
// A full wall gives feedback and retains the existing placement.
seed.shop.owned=['shelves','clock'];seed.shop.place={shelves:{x:0,z:0,rot:0,wall:'back'},clock:{x:4,z:0,rot:1,wall:'left'}};
await evaluate(`localStorage.setItem('tea-shop-preview-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.reload');await new Promise(r=>setTimeout(r,1800));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();document.querySelector('#edit-toggle').click();})()`);
await drag(await project(.08,2.48,4.5),await project(1.5,2.48,.08));
assert.deepEqual(await saved(),{x:4,z:0,rot:1,wall:'left'});
assert.equal(await evaluate(`document.querySelector('#placement-status').classList.contains('hidden')`),false);
const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('work/wall-drag-feedback.png',Buffer.from(shot.data,'base64'));
assert.deepEqual(errors,[]);
console.log('Full wall retains layout and announces the reason. No browser errors.');
await clearReturningStart();ws.close();
