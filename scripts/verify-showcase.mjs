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


await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?showroom=1'});await new Promise(r=>setTimeout(r,2000));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async({files})=>{window.__export=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(files[0]);});}});})()`);
const saveBefore=await evaluate(`localStorage.getItem('tea-shop-progress-v1')`);
for(const night of [false,true]){
 if(await evaluate(`document.querySelector('#theme-toggle').textContent`)!==(night?'Night':'Day'))await evaluate(`document.querySelector('#theme-toggle').click()`);
 await evaluate(`document.querySelector('#showcase-toggle').click()`);await new Promise(r=>setTimeout(r,300));
 const hidden=await evaluate(`['.topbar','.shop-overlay','.shop-dock','.preview-bar'].every(s=>getComputedStyle(document.querySelector(s)).display==='none')`);
 if(!hidden)throw Error('UI visible in showcase');
 const original=await evaluate(`[window.__qaScene.getEngine().getRenderWidth(),window.__qaScene.getEngine().getRenderHeight()]`);
 await evaluate(`document.querySelector('#share-shop').click()`);await new Promise(r=>setTimeout(r,800));
 const data=await evaluate(`window.__export`);
 if(!data?.startsWith('data:image/png;base64,'))throw Error('Export missing');
 await fs.writeFile(`work/export-${night?'night':'day'}.png`,Buffer.from(data.split(',')[1],'base64'));
 const stats=await evaluate(`(async()=>{const image=await createImageBitmap(await(await fetch(window.__export)).blob());const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,image.width,image.height).data;const colors=new Set();for(let i=0;i<pixels.length;i+=400)colors.add(pixels.slice(i,i+3).join(','));return {width:image.width,height:image.height,colors:colors.size};})()`);
 if(stats.width!==1200||stats.colors<100)throw Error('Blank or undersized export '+JSON.stringify(stats));
 const restored=await evaluate(`[window.__qaScene.getEngine().getRenderWidth(),window.__qaScene.getEngine().getRenderHeight()]`);
 if(JSON.stringify(original)!==JSON.stringify(restored))throw Error('Canvas size not restored');
 await fs.writeFile(`work/showcase-${night?'night':'day'}-phone.png`,Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
 await evaluate(`document.querySelector('#showcase-back').click()`);
 console.log({night,...stats});
}
await evaluate(`document.querySelector('#showcase-toggle').click();Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError')}});document.querySelector('#share-shop').click()`);
await new Promise(r=>setTimeout(r,200));
if(await evaluate(`document.querySelector('#share-status').textContent`))throw Error('Cancellation displayed an error');
await evaluate(`Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false});HTMLAnchorElement.prototype.click=function(){window.__download=this.download;};document.querySelector('#share-shop').click()`);
if(await evaluate(`window.__download`)!=='my-tea-shop.png')throw Error('Download fallback missing');
if(await evaluate(`localStorage.getItem('tea-shop-progress-v1')`)!==saveBefore)throw Error('Export changed progress');
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
await new Promise(r=>setTimeout(r,400));
if(!await evaluate(`document.querySelector('#showcase-back').getBoundingClientRect().bottom<=innerHeight && document.documentElement.scrollWidth<=innerWidth`))throw Error('Desktop showcase overflows');
await fs.writeFile('work/showcase-desktop.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await evaluate(`document.querySelector('#showcase-back').click()`);
if(await evaluate(`getComputedStyle(document.querySelector('.shop-overlay')).display`)==='none')throw Error('Back did not restore controls');
if(errors.length)throw Error(JSON.stringify(errors));
console.log({sharingAndDownloadFallback:true,cancelHandled:true,progressUnchanged:true,desktop:true,errors});ws.close();
