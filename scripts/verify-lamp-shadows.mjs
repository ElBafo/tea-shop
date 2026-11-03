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
const seed={muted:true,bestStars:Array(20).fill(3),bestMoves:Array(20).fill(0),shop:{owned:['lamp','lamp:2','table','basket'],style:{},place:{lamp:{x:0,z:3,rot:0},'lamp:2':{x:5,z:3,rot:0},table:{x:2,z:3,rot:0},basket:{x:3,z:1,rot:0}},finaleSeen:true}};
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
if(await evaluate(`document.querySelector('#theme-toggle').textContent`)!=='Night')await click('#theme-toggle');
await evaluate(`window.__shadowRenders={lamp:0,'lamp:2':0};for(const id of ['lamp','lamp:2'])window.__qaScene.getLightByName(id+'-light').getShadowGenerator().getShadowMap().onAfterRenderObservable.add(()=>window.__shadowRenders[id]++);`);
await new Promise(r=>setTimeout(r,500));
const before=await evaluate(`({...window.__shadowRenders})`);await new Promise(r=>setTimeout(r,500));
assert(JSON.stringify(before)===JSON.stringify(await evaluate(`window.__shadowRenders`)),'Idle maps keep rendering');
assert(await evaluate(`['lamp','lamp:2'].every(id=>{const l=window.__qaScene.getLightByName(id+'-light');return l.shadowEnabled && !l.needCube() && l.getShadowGenerator().getShadowMap().getSize().width===512})`),'Missing economical shadow maps');
await fs.writeFile('work/lamp-shadows-before.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await click('#edit-toggle');await click('[data-upgrade="lamp"]');
const old=await evaluate(`window.__qaScene.getLightByName('lamp-light').position.asArray()`);
await drag('lamp',1.28,0,-2);await new Promise(r=>setTimeout(r,200));
assert((await saved()).place.lamp.z===1,'Lamp drag failed');
assert(await evaluate(`window.__shadowRenders.lamp`) > before.lamp,'Lamp move did not refresh shadow');
assert(JSON.stringify(old)!==JSON.stringify(await evaluate(`window.__qaScene.getLightByName('lamp-light').position.asArray()`)),'Light stayed behind');
await click('[data-filter="owned"]');await click('[data-upgrade="lamp:2"]');await drag('lamp:2',1.28,0,-2);
assert((await saved()).place['lamp:2'].z===1,'Second lamp drag failed');
const renders=await evaluate(`({...window.__shadowRenders})`);
await click('[data-filter="owned"]');await click('[data-upgrade="table"]');await drag('table',.6,0,1);await new Promise(r=>setTimeout(r,200));
assert(await evaluate(`window.__shadowRenders.lamp > ${renders.lamp} && window.__shadowRenders['lamp:2'] > ${renders['lamp:2']}`),'Moving furniture left stale shadows');
await click('[data-filter="owned"]');await click('[data-upgrade="lamp"]');await click('[data-act="store"]');
assert(await evaluate(`!window.__qaScene.getLightByName('lamp-light').shadowEnabled && window.__qaScene.getLightByName('lamp-light').intensity===0`),'Stored lamp shadows remain');
await click('[data-act="place"]');await click('#edit-toggle');
await fs.writeFile('work/lamp-shadows-after.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await click('#theme-toggle');assert(await evaluate(`['lamp','lamp:2'].every(id=>!window.__qaScene.getLightByName(id+'-light').shadowEnabled)`),'Day lamp maps enabled');
assert(!errors.length,JSON.stringify(errors));console.log('Both lamp maps, idle cache, lamp/furniture movement, storage and day/night passed.');await clearReturningStart();ws.close();
