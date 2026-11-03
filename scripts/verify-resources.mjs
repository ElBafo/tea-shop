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
const seed={muted:true,bestStars:Array(20).fill(3),bestMoves:Array(20).fill(0),shop:{owned:['counter','lamp','lamp:2','bench','art','rug'],style:{},place:{},finaleSeen:true}};
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
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const counts=()=>evaluate(`({materials:window.__qaScene.materials.length,textures:window.__qaScene.textures.length,meshes:window.__qaScene.meshes.length})`);
await click('#edit-toggle');
const before=await counts();
const wallId=await evaluate(`window.__qaScene.getMeshByName('back-wall').material.uniqueId`);
const copyMaterial=await evaluate(`window.__qaScene.getTransformNodeByName('lamp:2').getChildMeshes()[0].material.uniqueId`);
for(const id of ['bench','art','rug','lamp']) {
 await click('[data-filter="owned"]');await click(`[data-upgrade="${id}"]`);
 for(let i=0;i<30;i++)await click(`[data-act="style"][data-style="${(i+1)%3}"]`);
}
await click('[data-filter="owned"]');
assert(JSON.stringify(await counts())===JSON.stringify(before),'Style cycles leaked resources '+JSON.stringify({before,after:await counts()}));
assert(await evaluate(`window.__qaScene.getMeshByName('back-wall').material.uniqueId`)===wallId,'Unchanged walls rebuilt');
assert(await evaluate(`window.__qaScene.getTransformNodeByName('lamp:2').getChildMeshes()[0].material.uniqueId`)===copyMaterial,'Restyling one copy disposed another');
await click('[data-filter="owned"]');await click('[data-upgrade="bench"]');
for(let i=0;i<12;i++){await click('[data-act="store"]');await click('[data-act="place"]');}
for(let i=0;i<12;i++){await click('[data-filter="all"]');await click('[data-upgrade="clock"]');await click('[data-act="preview"][data-style="2"]');await click('#editor-back');}
assert(JSON.stringify(await counts())===JSON.stringify(before),'Storage/preview leaked resources');
await click('[data-upgrade="paint"]');await click('[data-act="preview"][data-style="1"]');
assert(await evaluate(`window.__qaScene.getMeshByName('back-wall').material.uniqueId`)!==wallId,'Paint preview did not rebuild walls');
await click('#editor-back');
assert(JSON.stringify(await counts())===JSON.stringify(before),'Paint preview leaked resources');
await click('[data-filter="owned"]');await click('[data-upgrade="lamp"]');
for(let i=0;i<2;i++){
 await drag('lamp',1.28,i===0?1:-1,i===0?-1:1);
 assert(await evaluate(`window.__qaScene.particleSystems.length>0 && window.__qaScene.particleSystems.every(p=>p.particleTexture?.isReady())`),'Repeated placement sparkle lost its texture');
 await pause(1600);
 assert(await evaluate(`window.__qaScene.particleSystems.length===0`),'Completed sparkle retained');
}
await click('[data-filter="owned"]');
assert(JSON.stringify(await counts())===JSON.stringify(before),'Placement effects leaked resources');
await click('[data-upgrade="lamp"]');
const markerBaseline=await counts();
for(let i=0;i<30;i++){await click('[data-filter="owned"]');await click('[data-upgrade="lamp"]');}
assert(JSON.stringify(await counts())===JSON.stringify(markerBaseline),'Repeated selection leaked placement markers');
await click('[data-filter="owned"]');
const saveBefore=JSON.stringify(await saved());
await evaluate(`window.__frames=0;window.__qaScene.onBeforeRenderObservable.add(()=>window.__frames++);Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__hiddenForTest??false});`);
for(let i=0;i<3;i++){
 await evaluate(`window.__hiddenForTest=true;document.dispatchEvent(new Event('visibilitychange'))`);await pause(100);
 const frame=await evaluate(`window.__frames`);await pause(200);
 assert(await evaluate(`window.__frames`)===frame,'Hidden shop kept rendering');
 await evaluate(`window.__hiddenForTest=false;document.dispatchEvent(new Event('visibilitychange'))`);await pause(250);
 assert(await evaluate(`window.__frames`)>frame,'Shop did not resume');
 assert(await evaluate(`window.__qaScene.getEngine()._activeRenderLoops.length`)===1,'Resume duplicated render loop');
}
await evaluate(`delete document.hidden`);
assert(JSON.stringify(await saved())===saveBefore,'Visibility changed progress');
await click('#edit-toggle');
await fs.writeFile('work/release-polish-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
for(let i=0;i<3;i++){
 await click('#play-tea');
 assert(await evaluate(`window.__qaScene.isDisposed`),'Shop scene survived exit');
 await click('[data-go="shop"]');await pause(700);
 await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);if(Engine.Instances.length!==1)throw Error('Engine retained');window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();})()`);
}
assert(!errors.length,JSON.stringify(errors));
console.log({styleChanges:120,storeRestoreCycles:12,previewCancelCycles:12,countsBefore:before,countsAfter:await counts(),hiddenPauseResume:true,repeatedSparkles:true,sceneReentry:true,errors});await clearReturningStart();ws.close();
