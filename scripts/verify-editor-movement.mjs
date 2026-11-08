// Vite at 5174, preview base; isolated Chromium CDP defaults to 9233.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const tabs = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9233}/json`)).json();
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
let seq = 0;
const pending = new Map(), errors = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id); pending.delete(message.id);
    message.error ? request.reject(message.error) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++seq, {resolve, reject}); ws.send(JSON.stringify({id: seq, method, params}));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));
const until = async expression => {
  for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await pause(125); }
  throw Error('Timed out: ' + expression);
};
const tap = async selector => {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element || element.disabled || element.closest('[inert]')) throw Error('Unavailable: ' + ${JSON.stringify(selector)});
    element.scrollIntoView({block: 'nearest', behavior: 'instant'});
    const rect = element.getBoundingClientRect(); return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
  })()`);
  await send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{...point, id: 1}]});
  await send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await pause();
};
const key = 'tea-shop-preview-edition2-progress-v1';
const previewUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5174/tea-shop/preview/?edition=2';
const saved = () => evaluate(`JSON.parse(localStorage.getItem('${key}'))`);
const available = () => evaluate(`Number(document.querySelector('#shop-stars strong').textContent)`);
const empty = () => ({owned: [], stored: [], style: {}, place: {}, finaleSeen: true});
const progress = (count, stars = 3, shop = empty()) => ({muted: true, bestStars: Array.from({length: 24}, (_, i) => i < count ? stars : 0), bestMoves: Array(16).fill(0), shop});
const ready = async () => { await pause(500); await until(`document.querySelector('#launch-start')?.disabled === false`); };
const seed = async (value, goal = null) => {
  await evaluate(`Object.keys(localStorage).filter(k => k.startsWith('tea-shop-preview-edition2')).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('${key}', ${JSON.stringify(JSON.stringify(value))});
    localStorage.setItem('${key}:guide-v1', 'done');
    ${goal ? `localStorage.setItem('${key}:goal-v1', ${JSON.stringify(JSON.stringify(goal))});` : ''}`);
  await send('Page.reload'); await ready(); await tap('#launch-start');
};
const shot = async name => fs.writeFile(`work/edition2-choices-${name}.png`, Buffer.from((await send('Page.captureScreenshot')).data, 'base64'));
const choose = async (id, style = 0) => {
  await tap('#edit-toggle'); await tap(`[data-upgrade="${id}"]`); await tap(`[data-act="preview"][data-style="${style}"]`);
};
const checkViewport = async () => {
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), 'no horizontal page overflow');
  assert.ok(await evaluate(`(() => {const e = document.querySelector('[data-act="buy"]'); if (!e) return true; const r = e.getBoundingClientRect(); return r.x >= 0 && r.right <= innerWidth + 1 && r.y >= 0 && r.bottom <= innerHeight + 1;})()`), 'purchase action remains visible');
};

try {
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Page.navigate',{url:previewUrl});await ready();
 const inspectScene=async()=>{await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.editorScene=Engine.Instances[0].scenes[0];await editorScene.whenReadyAsync();})()`);};
 const drag=async(id,dx,dz)=>{
  await pause(200);const points=await evaluate(`(()=>{const scene=editorScene,e=scene.getEngine(),c=document.querySelector('#shop-canvas').getBoundingClientRect(),root=scene.getTransformNodeByName('${id}');const V=scene.activeCamera.position.constructor;const project=v=>{const p=V.Project(v,scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return{x:c.x+p.x*c.width/e.getRenderWidth(),y:c.y+p.y*c.height/e.getRenderHeight()};};for(const mesh of root.getChildMeshes()){if(!mesh.isPickable)continue;const v=mesh.getBoundingInfo().boundingBox.centerWorld.clone();const p=project(v);const hit=scene.pick(p.x-c.x,p.y-c.y);if(hit?.pickedMesh?.metadata?.upgradeId==='${id}'&&p.y<c.bottom-55){const to=v.clone();to.x+=${dx};to.z+=${dz};return{start:p,end:project(to)};}}throw Error('No exposed pickable mesh for ${id}');})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...points.start,id:1}]});
  for(let i=1;i<=16;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:points.start.x+(points.end.x-points.start.x)*i/16,y:points.start.y+(points.end.y-points.start.y)*i/16,id:1}]});await pause(25);}
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(400);
 };
 const checks=[];
 for(const night of [false,true])for(const style of [0,1,2]){
  const p=progress(6,3,{owned:['lamp'],stored:[],style:{lamp:style},place:{lamp:{x:1,z:3,rot:0}},finaleSeen:true});await seed(p);
  await evaluate(`localStorage.setItem('tea-shop-preview-edition2-appearance-v1','${night?'night':'day'}')`);await send('Page.reload');await ready();await tap('#launch-start');await tap('#edit-toggle');await tap('[data-upgrade="lamp"]');await tap(`[data-act="style"][data-style="${style}"]`);await inspectScene();
  await drag('lamp',2,-2);assert.equal((await saved()).shop.place.lamp.x,3);assert.equal((await saved()).shop.place.lamp.z,1);await tap('#undo-move');assert.deepEqual((await saved()).shop.place.lamp,p.shop.place.lamp);checks.push({night,style,moved:true,undo:true});
 }
 await seed(progress(6));await choose('counter',1);await tap('[data-act="buy"]');await inspectScene();const before=(await saved()).shop.place.counter;
 await drag('counter',1,2);assert.equal((await saved()).shop.place.counter.x,before.x+1);assert.equal((await saved()).shop.place.counter.z,before.z+2);await tap('#undo-move');assert.deepEqual((await saved()).shop.place.counter,before);
 assert.deepEqual(errors,[]);await fs.writeFile('work/editor-movement.json',JSON.stringify({passed:true,checks,newCounter:true,errors},null,2));console.log('PASS: immediate multi-cell lamp dragging and Undo after UI style selection, all 3 styles in day/night; newly bought counter immediately draggable.');
} finally {ws.close();}
