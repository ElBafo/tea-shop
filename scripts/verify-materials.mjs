// Local browser regression; starts Vite and disposable Chromium. Synthetic saves only.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import path from 'node:path';

const base='/tea-shop/preview/',origin='http://127.0.0.1:5196',cdp=9262;
const key='tea-shop-preview-edition2-progress-v1',appearance='tea-shop-preview-edition2-appearance-v1';
const checks=[],errors=[],evidence={version:process.env.KEEPER_BASELINE==='1'?'0.3.0-preview.10':'0.3.0-preview.11',origin,disposableProfile:true,syntheticSave:true,checks,errors};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp('/tmp/decopu-release-021-smoke-');
const {createServer}=await import('vite');
const server=await createServer({base,server:{host:'127.0.0.1',port:5196,strictPort:true}});
let browser,ws,send,ev;
const log=createWriteStream('work/materials.chromium.log');
try {
  await server.listen();
  browser=spawn('/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run','--no-default-browser-check',`--remote-debugging-port=${cdp}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
  browser.stdout.pipe(log);browser.stderr.pipe(log);
  let tab;
  for(let i=0;i<120;i++){
    try{tab=(await(await fetch(`http://127.0.0.1:${cdp}/json`)).json()).find(t=>t.type==='page');if(tab)break;}catch{}
    await pause(250);
  }
  assert.ok(tab,'disposable Chromium starts');
  ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let sequence=0;const pending=new Map();
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
  send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}));});
  ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const page=(fn,...args)=>ev(`(${fn.toString()})(${args.map(a=>JSON.stringify(a)).join(',')})`);
  const until=async(fn,...args)=>{for(let i=0;i<300;i++){try{if(await page(fn,...args))return;}catch(e){if(!/context|navigation/i.test(String(e)))throw e;}await pause(100);}throw Error('Timed out: '+fn);};
  const tap=async selector=>{const p=await page(selector=>{const e=document.querySelector(selector);if(!e||e.disabled||e.closest('[inert]'))throw Error('Unavailable '+selector);e.scrollIntoView({block:'nearest',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},selector);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await pause(35);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(170);};
  const ready=async()=>{await pause(400);await until(()=>document.querySelector('#launch-start')?.disabled===false);};
  const enter=async()=>{await ready();await tap('#launch-start');await until(()=>!!document.querySelector('#shop-canvas'));};
  const snapshot=()=>page(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
  const noDev=()=>page(()=>!document.querySelector('.preview-bar,#reset-preview,.welcome-overlay')&&!document.body.innerText.includes('See finished shop'));
  const shot=async label=>fs.writeFile('work/materials.'+(process.env.KEEPER_BASELINE==='1'?'before-':'')+label+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Page.navigate',{url:origin+base});await ready();
  const progress={muted:true,bestStars:[3,...Array(23).fill(0)],bestMoves:[3,...Array(23).fill(0)],shop:{owned:[],stored:[],style:{},place:{},finaleSeen:false}};
  await page((key,progress)=>{localStorage.setItem(key,JSON.stringify(progress));localStorage.setItem(key+':guide-v1','done');},key,progress);
  await send('Page.reload');await enter();await pause(600);
  const scene=async()=>ev(`(async()=>{const {Engine}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');window.starterScene=()=>Engine.Instances.find(e=>e.getRenderingCanvas()?.id==='shop-canvas')?.scenes[0];})()`);
  await scene();
  const state=()=>page(()=>{const s=starterScene(),bench=s.getTransformNodeByName('starter-workbench'),keeper=s.getTransformNodeByName('shopkeeper');return {bench:bench?.isEnabled(),keeper:keeper?.isEnabled(),position:keeper?.position.asArray(),benchPickable:bench?.getChildMeshes().some(m=>m.isPickable),meshes:s.meshes.length,materials:s.materials.length,sky:s.getMeshByName('sky').material.diffuseColor.toHexString()};});
  assert.equal((await state()).bench,true);assert.equal((await state()).keeper,true);assert.equal((await state()).benchPickable,false);
  const idle=()=>page(()=>{const k=starterScene().getTransformNodeByName('shopkeeper'),r=k.metadata.keeperIdle;return {head:r.head.rotation.asArray(),body:r.body.scaling.y,position:k.position.asArray(),lights:starterScene().lights.length};});
  const first=await idle();await pause(700);const second=await idle();assert.notDeepEqual(first.head,second.head);assert.deepEqual(first.position,second.position);assert.equal(first.lights,second.lights);await shot('day');
  await tap('#theme-toggle');await pause(400);await shot('night');
  await tap('#theme-toggle');
  await tap('#edit-toggle');await pause(100);assert.equal((await state()).bench,false);assert.equal((await state()).keeper,false);assert.deepEqual((await idle()).head,[0,0,0]);
  await tap('[data-upgrade="counter"]');await tap('[data-act="preview"][data-style="1"]');assert.equal((await state()).bench,false);assert.equal((await state()).keeper,true);assert.deepEqual((await page(key=>JSON.parse(localStorage.getItem(key)),key)).shop.owned,[]);await shot('preview');
  await tap('#edit-toggle');assert.equal((await state()).bench,true);assert.equal((await state()).keeper,true);
  await tap('#edit-toggle');await tap('[data-upgrade="counter"]');await tap('[data-act="preview"][data-style="1"]');await tap('[data-act="buy"]');await tap('#edit-toggle');
  assert.equal((await state()).bench,false);assert.equal((await state()).keeper,true);assert.deepEqual((await page(key=>JSON.parse(localStorage.getItem(key)),key)).shop.owned,['counter']);await shot('bought');
  const saved=await snapshot();await send('Page.reload');await enter();await scene();assert.deepEqual(await snapshot(),saved);assert.equal((await state()).bench,false);
  await page((key,progress)=>localStorage.setItem(key,JSON.stringify(progress)),key,progress);await send('Page.reload');await enter();await scene();
  for(const [w,h,label] of [[320,568,'small'],[844,390,'landscape'],[1280,900,'desktop']]){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<600});await pause(400);await shot(label);assert.equal(await page(()=>document.documentElement.scrollWidth>innerWidth),false);}
  for (const [label,shop,visible] of [
    ['paint',{owned:['paint'],stored:[],style:{},place:{},finaleSeen:false},true],
    ['stored-counter',{owned:['counter'],stored:['counter'],style:{},place:{},finaleSeen:false},false],
    ['occupied',{owned:['table'],stored:[],style:{},place:{table:{x:2,z:1,rot:0}},finaleSeen:false},false]]) {
    await page((key,shop)=>localStorage.setItem(key,JSON.stringify({muted:true,bestStars:Array(24).fill(3),bestMoves:Array(24).fill(3),shop})),key,shop);
    await send('Page.reload');await enter();await scene();assert.equal((await state()).bench,visible,label);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await page(key=>localStorage.setItem(key,JSON.stringify({muted:true,bestStars:Array(24).fill(3),bestMoves:Array(24).fill(3),shop:{owned:['counter','paint','sign','shelves','plant','rug','lamp','table'],stored:[],style:{},place:{},finaleSeen:false}})),key);
  await send('Page.reload');await enter();await scene();await pause(500);await shot('furnished-day');await tap('#theme-toggle');await pause(400);await shot('furnished-night');assert.equal((await idle()).lights,5);await tap('#theme-toggle');
  if(process.env.KEEPER_BASELINE==='1') { evidence.passed=true; console.log('PASS baseline'); } else {
  for(let style=0;style<3;style++){
    await page((key,style)=>localStorage.setItem(key,JSON.stringify({muted:true,bestStars:Array(24).fill(3),bestMoves:Array(24).fill(3),shop:{owned:['counter','paint','sign','shelves','plant','rug','lamp','table'],stored:[],style:{counter:style,table:(style+1)%3,shelves:(style+2)%3,paint:style},place:{},finaleSeen:true}})),key,style);
    await send('Page.reload');await enter();await scene();await shot('mixed-'+style);
    for(let i=0;i<3;i++)await tap('[data-zoom="in"]');await shot('detail-'+style);
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await page((key,progress)=>localStorage.setItem(key,JSON.stringify(progress)),key,progress);await send('Page.reload');await enter();await scene();await pause(100);
  assert.equal(await page(()=>starterScene().getMeshByName('starter-steam-puff').isEnabled()),false);assert.deepEqual((await idle()).head,[0,0,0]);const still=await idle();await pause(400);assert.deepEqual(await idle(),still);
  // Rotation/variant fixtures preserve the working aisle and one keeper per scene.
  if(process.env.KEEPER_BASELINE!=='1') {
    for(let rot=0;rot<4;rot++) {
      await page((key,progress,rot)=>localStorage.setItem(key,JSON.stringify({...progress,shop:{owned:['counter'],stored:[],style:{counter:rot%3},place:{counter:{x:2,z:2,rot}},finaleSeen:true}})),key,progress,rot);
      await send('Page.reload');await enter();await scene();
      const actual=await page(()=>{const s=starterScene(),k=s.getTransformNodeByName('shopkeeper');return {count:s.transformNodes.filter(n=>n.name==='shopkeeper').length,position:k.position.asArray(),rotation:k.rotation.y,pickable:k.getChildMeshes().some(m=>m.isPickable)};});
      const angle=rot*Math.PI/2,center=rot%2?[2.5,3.5]:[3.5,2.5];
      assert.equal(actual.count,1);assert.equal(actual.rotation,angle);
      assert.ok(Math.abs(actual.position[0]-(center[0]-Math.sin(angle)))<1e-6);assert.ok(Math.abs(actual.position[2]-(center[1]-Math.cos(angle)))<1e-6);
      await shot('rotation-'+rot);
    }
    await page((key,progress)=>localStorage.setItem(key,JSON.stringify(progress)),key,progress);await send('Page.reload');await enter();await scene();
    const furnished={...progress,bestStars:[...Array(20).fill(3),...Array(4).fill(0)],shop:{owned:['counter','table','shelves'],stored:[],style:{counter:0,table:2,shelves:1},place:{},finaleSeen:true}};
    await page((key,p)=>localStorage.setItem(key,JSON.stringify(p)),key,furnished);await send('Page.reload');await enter();await scene();
    const counts=()=>page(()=>{const s=starterScene();return [s.meshes.length,s.materials.length,s.textures.length,s.transformNodes.length,s.lights.length];});
    const expected=await counts();
    for(let i=0;i<3;i++) {
      await page(()=>{window.oldKeeperScene=starterScene();});await tap('#play-tea');await until(()=>!!document.querySelector('.play'));
      assert.deepEqual(await page(()=>({disposed:oldKeeperScene.isDisposed,meshes:oldKeeperScene.meshes.length,materials:oldKeeperScene.materials.length,textures:oldKeeperScene.textures.length,lights:oldKeeperScene.lights.length})),{disposed:true,meshes:0,materials:0,textures:0,lights:0});
      await tap('[data-go="levels"]');await tap('[data-go="shop"]');await until(()=>!!document.querySelector('#shop-canvas'));await scene();
      assert.deepEqual(await counts(),expected);
    }
    evidence.lifecycle={cycles:3,stableCounts:expected};
    for(let i=0;i<4;i++)await tap('[data-zoom="in"]');await shot('zoomed');
    checks.push('All four counter rotations and three styles retain keeper orientation and aisle; three scene cycles release every scene resource and rebuild with stable counts');
  }
  assert.deepEqual(errors,[]);evidence.passed=true;evidence.checks=[...checks,'opening bench and keeper','day/night','edit hides temporary scenery','preview/cancel','purchase replaces bench','reload preserves progress','phone/small/landscape/desktop','paint retains starter','stored counter suppresses starter','occupied footprint suppresses starter','reduced-motion steam hidden','keeper animates without placement drift','Edit and reduced-motion neutral pose','no additional lights'];console.log('PASS',JSON.stringify(evidence));

  }
} catch(error) {
  evidence.passed=false;evidence.error=String(error);evidence.stack=error.stack;
  if(ev)evidence.screen=await ev('document.body.innerText').catch(()=>null);
  if(send)await fs.writeFile('work/materials.failure.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64')).catch(()=>{});
  console.error(error);process.exitCode=1;
} finally {
  await fs.writeFile('work/materials'+(process.env.KEEPER_BASELINE==='1'?'-baseline':'')+'.json',JSON.stringify(evidence,null,2));
  ws?.close();browser?.kill('SIGTERM');server.close();
  await pause(300);browser?.kill('SIGKILL');log.end();
}
