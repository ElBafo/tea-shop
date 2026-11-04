// Vite preview on5177 without HMR; an isolated Chromium on9233.
// The integration harness owns its Diorama and steps the existing traffic method;
// no debug hooks or accelerated clocks are added to the shipped application.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { installReturningPlayerStart } from './browser-start.mjs';

const origin = process.env.GAME_ORIGIN ?? 'http://127.0.0.1:5177';
const base = '/tea-shop/preview/';
const key = 'tea-shop-preview-edition2-progress-v1';
const tabs = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9233}/json`)).json();
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
let seq = 0;
const pending = new Map(), errors = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const promise = pending.get(message.id); pending.delete(message.id);
    message.error ? promise.reject(message.error) : promise.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++seq, {resolve,reject}); ws.send(JSON.stringify({id:seq,method,params}));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression,awaitPromise:true,returnByValue:true});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
const until = async (expression, attempts = 600) => {
  for (let i=0;i<attempts;i++) { if (await evaluate(expression)) return; await pause(150); }
  throw Error('Timed out: '+expression);
};
const tap = async selector => {
  const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await pause(120);
};
const shot = async name => fs.writeFile(`work/edition-traffic-${name}.png`, Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await fs.mkdir('work',{recursive:true});
await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
await send('Network.setBypassServiceWorker',{bypass:true});
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
const clearStart = await installReturningPlayerStart(send);
const navigate = async (search='?edition=2') => {
  await send('Page.navigate',{url:origin+base+search});
  await until(`!document.querySelector('#launch-screen') && !!document.querySelector('#shop-canvas')`);
  await evaluate(`(async()=>{const {Engine}=await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');window.trafficScene=()=>Engine.Instances.find(engine=>engine.getRenderingCanvas()?.id==='shop-canvas')?.scenes[0];window.trafficRoots=()=>trafficScene()?.transformNodes.filter(node=>/^traffic-guest-[01]$/.test(node.name))??[];window.visibleTraffic=()=>trafficRoots().filter(node=>node.isEnabled());})()`);
};
const protectedSaves = () => evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().filter(k=>!k.includes('appearance')).map(k=>[k,localStorage.getItem(k)])))`);

try {
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate();
  await evaluate(`(async()=>{const {UPGRADES}=await import('${base}src/shop/upgrades.ts');const core=UPGRADES.filter(d=>!d.optional);window.trafficSeed={muted:true,bestStars:Array(10).fill(3),bestMoves:Array(10).fill(0),shop:{owned:core.map(d=>d.id),stored:[],style:{counter:2,paint:1,sign:1,plant:2,rug:2,lamp:1,table:1},place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}])),finaleSeen:true}};localStorage.setItem('${key}',JSON.stringify(trafficSeed));localStorage.setItem('${key}:guide-v1','done');localStorage.setItem('tea-shop-preview-edition2-appearance-v1','day');localStorage.setItem('tea-shop-progress-v1','main-traffic-sentinel');localStorage.setItem('tea-shop-preview-progress-v1','classic-traffic-sentinel');localStorage.setItem('${key}:goal-v1',JSON.stringify({id:'bench',style:2}));})();`);
  await navigate();
  const savesBefore = await protectedSaves();
  await until(`visibleTraffic().length>0`);
  assert.equal(await evaluate(`trafficRoots().length`),2,'at most two visual instances are pooled');
  assert.ok(await evaluate(`visibleTraffic().length<=2`));
  assert.equal(await evaluate(`trafficRoots().every(root=>root.getChildMeshes().every(mesh=>!mesh.isPickable))`),true,'guests cannot intercept taps');
  await shot('day-phone');
  await tap('#theme-toggle'); await shot('night-phone'); await tap('#theme-toggle');
  assert.equal(await protectedSaves(),savesBefore,'ambient visits cannot change any progress or goals');

  await tap('#edit-toggle');
  assert.equal(await evaluate(`visibleTraffic().length`),0,'all guests hide immediately in Edit');
  await tap('[data-filter="all"]'); await tap('[data-upgrade="bench"]');
  await tap('[data-act="preview"][data-style="1"]');
  assert.equal(await evaluate(`visibleTraffic().length`),0,'a temporary decoration preview cannot summon guests');
  await shot('edit-hidden-phone');
  await tap('#edit-toggle');
  assert.equal(await protectedSaves(),savesBefore,'cancelled preview and visits preserve the real room');
  await until(`visibleTraffic().length>0`);
  await until(`visibleTraffic().length===2`,1200); await shot('busy-phone');
  await tap('#theme-toggle'); await shot('busy-night-phone'); await tap('#theme-toggle');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await pause(200); await shot('desktop');

  // Pause/background the real app; no offscreen simulation or catch-up visit burst.
  await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))`);
  const frozen = await evaluate(`trafficRoots().map(root=>({position:root.position.asArray(),state:root.metadata?.guestState}))`);
  await pause(500);
  assert.deepEqual(await evaluate(`trafficRoots().map(root=>({position:root.position.asArray(),state:root.metadata?.guestState}))`),frozen,'hidden page pauses guest transforms and state');
  await evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`);
  await pause(150);
  assert.ok(await evaluate(`visibleTraffic().length<=2`),'resuming cannot exceed the guest cap');

  // A private, test-owned Diorama can be stepped deterministically without
  // turning review controls or accelerated simulation into product features.
  const integration = await evaluate(`(async()=>{
    const {Diorama}=await import('${base}src/shop/diorama.ts');
    const {GuestTraffic}=await import('${base}src/shop/guest-traffic.ts');
    const {UPGRADES}=await import('${base}src/shop/upgrades.ts');
    const core=UPGRADES.filter(d=>!d.optional);
    const full={owned:core.map(d=>d.id),stored:[],style:{counter:2,paint:1,table:1},place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}])),finaleSeen:true};
    const empty={owned:[],stored:[],style:{},place:{},finaleSeen:false};
    const random=()=>{let state=12345;return()=>((state=(state*1664525+1013904223)>>>0)/4294967296)};
    const canvas=document.createElement('canvas');canvas.width=390;canvas.height=390;document.body.append(canvas);
    const d=new Diorama(canvas,structuredClone(full),{onSelect(){},onMove(){},onPlaced(){}});
    d.engine.stopRenderLoop(); d.traffic=new GuestTraffic(structuredClone(full),random());
    const counts=()=>({meshes:d.scene.meshes.length,materials:d.scene.materials.length,textures:d.scene.textures.length,transforms:d.scene.transformNodes.length,lights:d.scene.lights.length});
    const initial=counts(),issues=[],phases=new Set(),poses=new Set();let peak=0,minSeparation=Infinity;
    const guests=()=>d.trafficGuests??[];
    const sparse=new GuestTraffic(structuredClone(empty),random());
    for(let i=0;i<3600;i++){
      d.tickTraffic(.1);sparse.tick(.1);
      const frames=d.traffic.snapshot();peak=Math.max(peak,frames.length);
      if(frames.length===2)minSeparation=Math.min(minSeparation,Math.hypot(frames[0].x-frames[1].x,frames[0].z-frames[1].z));
      if(frames.length>2)issues.push('cap');
      const occupying=frames.filter(frame=>!frame.moving&&frame.stopKey).map(frame=>frame.stopKey);
      if(new Set(occupying).size!==occupying.length)issues.push('shared-stop');
      for(const frame of frames){phases.add(frame.phase);poses.add(frame.pose);const root=guests()[frame.slot]?.root;if(!root?.isEnabled())issues.push('missing-visual');else if(Math.abs(root.position.x-frame.x)>1e-5||Math.abs(root.position.y-(frame.y??0))>1e-5||Math.abs(root.position.z-frame.z)>1e-5)issues.push('projection');}
    }
    const rates={full:{...d.traffic.stats},sparse:{...sparse.stats},fullFurnishing:d.traffic.furnishing,sparseFurnishing:sparse.furnishing};
    const guestMeshes=new Set(guests().flatMap(guest=>guest.root.getChildMeshes()));
    const casterOverlap=[d.shadows,...Object.values(d.lampShadows)].flatMap(shadow=>shadow.getShadowMap()?.renderList??[]).filter(mesh=>guestMeshes.has(mesh)).length;
    // The right table approach coincides with the entrance. A seated visitor
    // must not stand up into a newly arrived guest waiting on that cell.
    const collisionPlace={paint:{x:4,z:4,rot:1},shelves:{x:0,z:1,rot:2,wall:'back'},plant:{x:5,z:1,rot:0},table:{x:2,z:3,rot:3},art:{x:0,z:1,rot:3,wall:'left'},clock:{x:4,z:1,rot:3,wall:'left'},basket:{x:3,z:0,rot:0},planter:{x:0,z:5,rot:0}};
    const collisionShop={owned:Object.keys(collisionPlace),stored:[],style:{},place:collisionPlace,finaleSeen:false};
    d.sync(collisionShop);d.traffic=new GuestTraffic(collisionShop,()=>.5);
    let entranceSeparation=Infinity;
    for(let i=0;i<12000;i++){
      d.tickTraffic(.1);const frames=d.traffic.snapshot();
      if(frames.length===2)entranceSeparation=Math.min(entranceSeparation,Math.hypot(frames[0].x-frames[1].x,frames[0].z-frames[1].z));
    }
    const entranceDepartures=d.traffic.stats.departures;
    const states=[];
    for(let i=0;i<16;i++){
      d.setEditMode(true);if(guests().some(guest=>guest.root.isEnabled()))issues.push('edit-visible');
      const shop=structuredClone(full);shop.style.table=i%3;shop.place.table.rot=i%4;
      if(i%2)shop.stored=['table','shelves'];d.sync(shop);for(let j=0;j<40;j++)d.tickTraffic(.1);
      if(guests().some(guest=>guest.root.isEnabled()))issues.push('draft-visible');
      d.setEditMode(false);for(let j=0;j<160;j++)d.tickTraffic(.1);
      if(i%2&&d.traffic.snapshot().some(frame=>frame.pose==='sit'||String(frame.stopKey).includes('shelves')))issues.push('stored-activity');
      states.push(d.traffic.snapshot().length);
    }
    d.sync(structuredClone(full));
    const final=counts();
    const reduced=new GuestTraffic(structuredClone(full),random());
    let prior=new Map(),reducedMoves=0,reducedVisitors=0;
    for(let i=0;i<1800;i++){
      reduced.tick(.1,true);
      for(const frame of reduced.snapshot()){
        reducedVisitors++;if(frame.moving)reducedMoves++;
        const last=prior.get(frame.visitId);if(last&&(last.x!==frame.x||last.z!==frame.z))reducedMoves++;
        prior.set(frame.visitId,{x:frame.x,z:frame.z});
      }
    }
    const stored=structuredClone(full);stored.stored=[...stored.owned];
    const storedLevel=new GuestTraffic(stored,random()).furnishing;
    const styles=structuredClone(full);styles.style=Object.fromEntries(core.map(d=>[d.id,2]));
    const styleLevel=new GuestTraffic(styles,random()).furnishing;
    d.dispose();canvas.remove();
    return{initial,final,issues:[...new Set(issues)],peak,minSeparation,entranceSeparation,entranceDepartures,phases:[...phases],poses:[...poses],rates,casterOverlap,reducedMoves,reducedVisitors,storedLevel,styleLevel,disposed:d.scene.isDisposed};
  })()`);
  assert.deepEqual(integration.issues,[]);
  assert.equal(integration.peak,2,'a furnished core shop supports two guests when there is space');
  assert.ok(integration.minSeparation>=.5,'two guests keep personal space');
  assert.ok(integration.entranceSeparation>=.5,'chair exit cannot overlap a waiting arrival');
  assert.ok(integration.entranceDepartures>2,'shared entrance/chair approach cannot deadlock visits');
  assert.ok(integration.rates.full.arrivals>integration.rates.sparse.arrivals,'furnishing raises arrival frequency');
  assert.ok(integration.rates.full.departures>0,'visits end rather than remaining forever');
  assert.equal(integration.casterOverlap,0,'moving guests do not invalidate cached room shadow maps');
  assert.equal(integration.reducedMoves,0,'reduced motion uses stationary activity visits');
  assert.ok(integration.reducedVisitors>0,'reduced motion still offers room life');
  assert.equal(integration.storedLevel,integration.rates.sparseFurnishing,'stored pieces cannot increase traffic');
  assert.equal(integration.styleLevel,integration.rates.fullFurnishing,'styles do not affect traffic');
  assert.deepEqual(integration.final,integration.initial,'repeated visits and Edit/style/storage rebuilds release resources');
  assert.equal(integration.final.lights,5,'guests add no lights');
  assert.equal(integration.disposed,true);
  await fs.writeFile('work/edition-traffic-check.json',JSON.stringify(integration,null,2));

  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate();await until(`visibleTraffic().length>0`);await shot('reduced-motion-phone');
  const reducedPosition=await evaluate(`visibleTraffic().map(root=>root.position.asArray())`);
  await pause(350);assert.deepEqual(await evaluate(`visibleTraffic().map(root=>root.position.asArray())`),reducedPosition);
  await send('Emulation.setEmulatedMedia',{features:[]});
  await navigate('');assert.equal(await evaluate(`trafficRoots().length`),0,'classic preview has no traffic pool');
  assert.deepEqual(errors,[]);
  console.log('PASS: rendered arrivals/activities/departures, two-guest cap, furnishing rates, reserved activities, Edit and draft hiding, stored/style rules, save isolation, phone/desktop day/night, background pause, reduced motion, shadow/lights budget, classic isolation and stable pooled resources.',integration);
} finally {
  await evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`).catch(()=>{});
  await clearStart(); ws.close();
}
