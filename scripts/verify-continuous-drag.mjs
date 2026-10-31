// Browser regression check. Requires Vite at 127.0.0.1:5174 with base /tea-shop/preview/
// and Chromium remote debugging on 127.0.0.1:9223. Run with Node 22 or newer.
import fs from 'node:fs/promises';
await fs.mkdir('work', {recursive:true});
const tabs=await (await fetch('http://127.0.0.1:9223/json')).json();
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
await send('Runtime.enable');await send('Page.enable');
await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5174',storageTypes:'service_workers,cache_storage'});
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});


const results=[];
for(const dpr of [1,2]) for(const style of [0,1,2]){
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:dpr,mobile:true});
 await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?showroom=1'});await new Promise(r=>setTimeout(r,1500));
 await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();document.querySelector('canvas').addEventListener('pointerdown',e=>window.__qaPointer=e.pointerId);})()`);
 if(await evaluate(`document.querySelector('#theme-toggle').textContent`)!=='Night')await evaluate(`document.querySelector('#theme-toggle').click()`);
 await evaluate(`document.querySelector('#edit-toggle').click();document.querySelector('[data-upgrade="lamp"]').click();document.querySelector('[data-act="style"][data-style="${style}"]').click()`);
 for(const [x,z] of [[.5,2.5],[2.5,2.5],[5.5,2.5],[5.5,4.5],[.5,4.5]]) {
   const points=await evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.getTransformNodeByName('lamp').position.clone();const rect=document.querySelector('canvas').getBoundingClientRect();const project=(x,z)=>{const point=v.clone();point.x=x;point.y=1.28;point.z=z;const p=v.constructor.Project(point,scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return {x:rect.x+p.x*rect.width/e.getRenderWidth(),y:rect.y+p.y*rect.height/e.getRenderHeight()};};return {start:project(v.x,v.z),end:project(${x},${z})};})()`);
   await touch({type:'mousePressed',...points.start});
   for(let step=1;step<=12;step++){
     await touch({type:'mouseMoved',x:points.start.x+(points.end.x-points.start.x)*step/12,y:points.start.y+(points.end.y-points.start.y)*step/12});
     if(step===3)await evaluate(`document.querySelector('canvas').releasePointerCapture(window.__qaPointer)`);
     await new Promise(r=>setTimeout(r,30));
   }
   const moving=await evaluate(`window.__qaScene.getTransformNodeByName('lamp').position.asArray()`);
   if(Math.abs(moving[0]-x)>.01||Math.abs(moving[2]-z)>.01)throw Error('Stopped following '+JSON.stringify({dpr,style,x,z,moving}));
   await touch({type:'mouseReleased',...points.end});await new Promise(r=>setTimeout(r,80));
   const placed=await evaluate(`window.__qaScene.getTransformNodeByName('lamp').position.asArray()`);
   if(Math.abs(placed[0]-x)>.01||Math.abs(placed[2]-z)>.01)throw Error('Placement mismatch '+JSON.stringify({dpr,style,x,z,placed}));
   results.push({dpr,style,x,z});
 }
}
console.log({longAndRepeatedDragsPassed:results.length,captureReleasedDuringEachDrag:true,errors});ws.close();
