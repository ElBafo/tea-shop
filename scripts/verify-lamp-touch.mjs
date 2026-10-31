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
for (const dpr of [1,2]) for (const night of [false,true]) for (const style of [0,1,2]) {
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:dpr,mobile:true});
 await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?showroom=1'});
 await new Promise(r=>setTimeout(r,1500));
 await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();})()`);
 if(await evaluate(`document.querySelector('#theme-toggle').textContent`)!==(night?'Night':'Day'))await evaluate(`document.querySelector('#theme-toggle').click()`);
 await evaluate(`document.querySelector('#edit-toggle').click();document.querySelector('[data-upgrade="lamp"]').click();document.querySelector('[data-act="style"][data-style="${style}"]').click();document.querySelector('[data-upgrade="table"]').click()`);
 const points=await evaluate(`(()=>{const scene=window.__qaScene,engine=scene.getEngine(),lamp=scene.getTransformNodeByName('lamp'); const rect=document.querySelector('canvas').getBoundingClientRect();const w=engine.getRenderWidth(),h=engine.getRenderHeight();const project=(z)=>{const v=lamp.position.clone();v.y=1.28;v.z=z;const p=v.constructor.Project(v,scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(w,h));return {x:rect.x+p.x*rect.width/w+18,y:rect.y+p.y*rect.height/h};};return {start:project(5.5),end:project(4.5)};})()`);
 await touch({type:'mousePressed',...points.start});await touch({type:'mouseReleased',...points.start});
 if(!(await evaluate(`document.querySelector('#upgrade-detail').textContent`)).includes('lamp'))throw Error('Near tap did not select lamp '+JSON.stringify({dpr,night,style}));
 await touch({type:'mousePressed',...points.start});
 await touch({type:'mouseMoved',x:points.start.x+(points.end.x-points.start.x)*0.35,y:points.start.y+(points.end.y-points.start.y)*0.35});
 let pos=await evaluate(`window.__qaScene.getTransformNodeByName('lamp').position.asArray()`);
 if(Math.abs(pos[0]-.5)>0.01||Math.abs(pos[2]-5.5)>0.01)throw Error('Lamp jumped at grab '+JSON.stringify(pos));
 await touch({type:'mouseMoved',...points.end});await touch({type:'mouseReleased',...points.end});
 pos=await evaluate(`window.__qaScene.getTransformNodeByName('lamp').position.asArray()`);
 if(Math.abs(pos[0]-.5)>0.01||Math.abs(pos[2]-4.5)>0.01)throw Error('Incorrect drag destination '+JSON.stringify({dpr,night,style,pos}));
 results.push({dpr,night,style});
}
await fs.writeFile('work/lamp-touch-night.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
console.log({passed:results.length,cases:results,errors});ws.close();
