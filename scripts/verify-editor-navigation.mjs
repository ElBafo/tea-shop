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





const pause=(ms=500)=>new Promise(r=>setTimeout(r,ms));
const tap=async selector=>{

 const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await touch({type:'mousePressed',...p});await touch({type:'mouseReleased',...p});await pause(160);
};
const shot=async name=>fs.writeFile('work/depth-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const seed={muted:true,bestStars:Array(38).fill(3),bestMoves:Array(38).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:true}};
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await pause(1800);
const reload=async value=>{
 await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(value))});localStorage.setItem('tea-shop-progress-v1:guide-v1','done');localStorage.removeItem('tea-shop-progress-v1:puzzle-v1')`);
 await send('Page.reload');await pause(1800);
};
await reload(seed);await tap('#edit-toggle');

const visible=selector=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return r.height>=36&&r.top>=0&&r.bottom<=innerHeight;})()`);
await tap('[data-upgrade="cabinet"]');
assert.equal(await visible('[data-filter="owned"]'),true);
await tap('[data-filter="owned"]');assert.equal(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop.owned.length`),0,'tab switching cancels preview without buying');
await tap('[data-filter="all"]');await tap('[data-upgrade="cabinet"]');await tap('[data-act="buy"]');
for(const [width,height,name] of [[320,568,'small'],[390,844,'phone'],[844,390,'landscape'],[1200,900,'desktop']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await pause(400);
 assert.equal(await visible('#editor-back'),true);assert.equal(await visible('[data-filter="all"]'),true);assert.equal(await visible('[data-act="rotate"]'),true);
 const title=await evaluate(`document.querySelector('.detail-copy').getBoundingClientRect().top`);
 await evaluate(`document.querySelector('.detail-scroll').scrollTop=10000`);
 assert.equal(await evaluate(`document.querySelector('.detail-copy').getBoundingClientRect().top`),title);
 await shot('navigation-'+name);
 await tap('#tray-toggle');await tap('#editor-back');
 assert.equal(await evaluate(`document.querySelector('#tray-toggle').getAttribute('aria-expanded')`),'true');
 assert.equal(await visible('[data-filter="owned"]'),true);
 await tap('[data-upgrade="cabinet"]');
}
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(400);
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];})()`);
const count=()=>evaluate(`window.__qaScene.meshes.filter(m=>m.name==='legal-position').length`);
assert.equal(await count(),0,'selection alone does not cover the room in markers');
const points=await evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.getTransformNodeByName('cabinet').position,rect=document.querySelector('canvas').getBoundingClientRect();const project=x=>{const p=v.constructor.Project(new v.constructor(x,.75,v.z+.37),scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return{x:rect.x+p.x*rect.width/e.getRenderWidth(),y:rect.y+p.y*rect.height/e.getRenderHeight()};};return{a:project(v.x),b:project(v.x-1)};})()`);
await touch({type:'mousePressed',...points.a});await touch({type:'mouseMoved',...points.b});assert.ok(await count()>0,'markers appear during a drag');
await touch({type:'mouseReleased',...points.b});assert.equal(await count(),0,'release removes markers');
const savedBeforeCancel=await evaluate(`localStorage.getItem('tea-shop-progress-v1')`);
await touch({type:'mousePressed',...points.b});await touch({type:'mouseMoved',...points.a});assert.ok(await count()>0);
await send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});touching=false;
assert.equal(await count(),0,'cancel removes markers');assert.equal(await evaluate(`localStorage.getItem('tea-shop-progress-v1')`),savedBeforeCancel,'cancel preserves the saved layout');
assert.deepEqual(errors,[]);console.log('PASS: direct tabs, preview cancellation, pinned title/actions, Browse from collapsed panel, phone/desktop layouts and drag-only markers.');
await clearReturningStart();ws.close();
