// Vite preview at5177 (HMR disabled recommended), Chromium CDP9232.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {installReturningPlayerStart} from './browser-start.mjs';
const origin=process.env.GAME_ORIGIN??'http://127.0.0.1:5177';
const base='/tea-shop/preview/';
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT??9232}/json`)).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=(ms=180)=>new Promise(r=>setTimeout(r,ms));
const until=async expression=>{for(let i=0;i<150;i++){if(await evaluate(expression))return;await pause(150);}throw Error('Timed out '+expression);};
const shot=async name=>fs.writeFile(`work/edition-guest-${name}.png`,Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await pause();};
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});
const clear=await installReturningPlayerStart(send);
const navigate=async(search='?edition=2')=>{await send('Page.navigate',{url:origin+base+search});await pause(400);await until(`!document.querySelector('#launch-screen')&&!!document.querySelector('#shop-canvas')`);await evaluate(`(async()=>{const {Engine}=await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');window.guestScene=()=>Engine.Instances.find(e=>e.getRenderingCanvas()?.id==='shop-canvas')?.scenes[0];window.guest=()=>guestScene()?.getTransformNodeByName('edition-seated-guest');})()`);};
const enabled=()=>evaluate(`!!guest()?.isEnabled()`);
try {
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await navigate();
 await evaluate(`(async()=>{const {UPGRADES}=await import('${base}src/shop/upgrades.ts');const core=UPGRADES.filter(d=>!d.optional);const shop={owned:core.map(d=>d.id),stored:[],style:{counter:2,paint:1,sign:1,plant:2,rug:2,lamp:0,table:1},place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}])),finaleSeen:true};localStorage.setItem('tea-shop-preview-edition2-progress-v1',JSON.stringify({muted:true,bestStars:Array(10).fill(3),bestMoves:Array(10).fill(0),shop}));localStorage.setItem('tea-shop-preview-edition2-progress-v1:guide-v1','done');localStorage.setItem('tea-shop-preview-edition2-appearance-v1','day');})()`);
 await navigate();assert.equal(await enabled(),true,'guest appears in furnished shop');
 assert.equal(await evaluate(`guest().getChildMeshes().every(m=>!m.isPickable)`),true,'guest never intercepts taps');
 await shot('day-phone');
 await click('#theme-toggle');assert.equal(await enabled(),true);await shot('night-phone');await click('#theme-toggle');
 await click('#edit-toggle');assert.equal(await enabled(),false,'guest hides immediately in Edit');await shot('edit-phone');
 await click('[data-filter="owned"]');await click('[data-upgrade="table"]');
 for(let style=0;style<3;style++){
   await click(`[data-act="style"][data-style="${style}"]`);assert.equal(await enabled(),false,'guest stays hidden through restyling');
   await click('#edit-toggle');assert.equal(await enabled(),true,'guest returns after Edit');
   const footprint=await evaluate(`(()=>{const g=guest(),t=g.parent;g.computeWorldMatrix(true);const b=g.getHierarchyBoundingVectors(true);return{min:b.min.asArray(),max:b.max.asArray(),center:t.position.asArray(),parent:t.name};})()`);
   assert.equal(footprint.parent,'table');for(const axis of [0,2]){assert.ok(footprint.min[axis]>=footprint.center[axis]-1);assert.ok(footprint.max[axis]<=footprint.center[axis]+1);}
   await shot(`table-style-${style}`);
   await click('#edit-toggle');await click('[data-filter="owned"]');await click('[data-upgrade="table"]');
 }
 await click('[data-act="rotate"]');assert.equal(await enabled(),false);
 await click('#edit-toggle');assert.equal(await enabled(),true,'guest follows rotated table');
 assert.equal(await evaluate(`guest().parent.rotation.y`),Math.PI/2);
 await click('#edit-toggle');await click('[data-filter="owned"]');await click('[data-upgrade="counter"]');await click('[data-act="store"]');await click('#edit-toggle');assert.equal(await enabled(),false,'stored counter means no guest');
 await click('#edit-toggle');await click('[data-filter="owned"]');await click('[data-upgrade="counter"]');await click('[data-act="place"]');await click('#edit-toggle');assert.equal(await enabled(),true,'placing counter restores guest');
 await click('#edit-toggle');await click('[data-filter="owned"]');await click('[data-upgrade="table"]');await click('[data-act="store"]');await click('#edit-toggle');assert.equal(await enabled(),false,'stored table means no guest');
 await click('#edit-toggle');await click('[data-filter="owned"]');await click('[data-upgrade="table"]');await click('[data-act="place"]');await click('#edit-toggle');assert.equal(await enabled(),true);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 const before=await evaluate(`guest().position.asArray()`);await pause(700);assert.deepEqual(await evaluate(`guest().position.asArray()`),before,'guest is stationary, including reduced motion');
 await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await pause(300);await shot('desktop');
 // Exercise full Diorama synchronization repeatedly, including draft-only furniture.
 const lifecycle=await evaluate(`(async()=>{const {Diorama}=await import('${base}src/shop/diorama.ts');const {UPGRADE_BY_ID}=await import('${base}src/shop/upgrades.ts');const saved=JSON.parse(localStorage.getItem('tea-shop-preview-edition2-progress-v1')).shop;const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;document.body.append(canvas);const d=new Diorama(canvas,structuredClone(saved),{onSelect(){},onMove(){},onPlaced(){}});const counts=()=>({meshes:d.scene.meshes.length,materials:d.scene.materials.length,textures:d.scene.textures.length});const initial=counts();const issues=[];for(let i=0;i<18;i++){const shop=structuredClone(saved);shop.style.table=i%3;shop.place.table.rot=i%4;d.setEditMode(true);d.sync(shop);if(d.scene.getTransformNodeByName('edition-seated-guest')?.isEnabled())issues.push('edit');d.setEditMode(false);const g=d.scene.getTransformNodeByName('edition-seated-guest');if(!g?.isEnabled()||g.parent.name!=='table')issues.push('home');shop.stored=['counter'];d.sync(shop);if(g.isEnabled())issues.push('counter');shop.stored=['table'];d.sync(shop);if(d.scene.getTransformNodeByName('edition-seated-guest'))issues.push('table');d.setEditMode(true);shop.stored=[];d.sync(shop);if(d.scene.getTransformNodeByName('edition-seated-guest')?.isEnabled())issues.push('draft');d.setEditMode(false);}d.sync(structuredClone(saved));const final=counts();const lights=d.scene.lights.length;d.dispose();canvas.remove();return{initial,final,issues,lights,disposed:d.scene.isDisposed};})()`);
 assert.deepEqual(lifecycle.issues,[]);assert.deepEqual(lifecycle.final,lifecycle.initial,'rebuilding/storing/restoring guests releases all owned resources');assert.equal(lifecycle.disposed,true);assert.equal(lifecycle.lights,5,'guest adds no lights');
 await navigate('');assert.equal(await enabled(),false,'classic preview has no edition guest');
 assert.deepEqual(errors,[]);
 console.log('PASS: guest across all table styles, rotation, day/night, phone/desktop, Edit hiding, counter/table storage, reduced motion, non-pickability and classic isolation; repeated scene resources stable.',lifecycle);
} finally {await clear();ws.close();}
