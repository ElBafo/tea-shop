// Inspect the actual fourteen-design showroom, then stress isolated model disposal.
// Vite5174 preview and CDP9231 are required. This writes only preview test progress.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {installReturningPlayerStart} from './browser-start.mjs';
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT??9231}/json`)).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;
const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
await send('Page.enable');await send('Runtime.enable');
const clear=await installReturningPlayerStart(send);
const navigate=async(showroom=true)=>{
 await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?edition=2'+(showroom?'&showroom=1':'')});
 await pause(1700);
 for(let i=0;i<100;i++){
  if(await evaluate(`!document.querySelector('#launch-screen')&&!!document.querySelector('#shop-canvas')`))return;
  await pause(100);
 }
 throw Error('Shop not ready');
};
await fs.mkdir('work',{recursive:true});
const shot=async n=>fs.writeFile('work/edition-art-v2-'+n+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await navigate();
await evaluate(`localStorage.setItem('tea-shop-preview-edition2-appearance-v1','day')`);
await navigate();await shot('mixed-phone');
await evaluate(`document.querySelector('#theme-toggle').click()`);await pause(500);await shot('night-phone');
await evaluate(`document.querySelector('#theme-toggle').click()`);
await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
await pause(400);await shot('mixed-desktop');
const lifecycle=await evaluate(`(async()=>{
 const {Engine}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');
 const {Scene}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_scene.js');
 const {buildItem,buildCustomer}=await import('/tea-shop/preview/src/shop/meshes.ts');
 const {EDITION_DECORATIONS:UPGRADES}=await import('/tea-shop/preview/src/shop/upgrades.ts');
 const {editionArtIds}=await import('/tea-shop/preview/src/shop/edition-art.ts');
 const {editionShowroomShop}=await import('/tea-shop/preview/src/game/preview.ts');
 const active=Engine.Instances[0].scenes[0];
 const showroom={meshes:active.meshes.length,materials:active.materials.length,textures:active.textures.length,vertices:active.meshes.reduce((n,m)=>n+m.getTotalVertices(),0),triangles:active.meshes.reduce((n,m)=>n+m.getTotalIndices()/3,0)};
 const scene=new Scene(Engine.Instances[0]);
 const counts=()=>({meshes:scene.meshes.length,materials:scene.materials.length,textures:scene.textures.length,transforms:scene.transformNodes.length});
 const initial=counts(),peak={meshes:0,materials:0,textures:0,transforms:0},overflow=[];
 const extraIds=['art','clock','basket','bench','trolley','planter'];
 for(let i=0;i<12;i++)for(const d of UPGRADES){
  const shop=editionShowroomShop();shop.style[d.id]=i%3;
  const item=buildItem(scene,d.id,shop);
  if(i<3&&extraIds.includes(d.id)){
   item.position.setAll(0);item.rotation.setAll(0);item.computeWorldMatrix(true);
   const b=item.getHierarchyBoundingVectors(true),epsilon=.02;
   if(b.min.x < -d.size.w/2-epsilon || b.max.x > d.size.w/2+epsilon || (d.surface==='floor'&&(b.min.z < -d.size.d/2-epsilon || b.max.z > d.size.d/2+epsilon)))overflow.push({id:d.id,style:i,min:b.min.asArray(),max:b.max.asArray()});
  }
  const current=counts();for(const k of Object.keys(peak))peak[k]=Math.max(peak[k],current[k]);
  item.dispose(false,false);
 }
 const keeper=buildCustomer(scene);keeper.dispose(false,false);
 const final=counts();scene.dispose();
 return{designs:UPGRADES.map(d=>d.id),artIds:editionArtIds,cycles:12,initial,final,peak,overflow,showroom};
})();`);
assert.deepEqual(lifecycle.overflow,[],'new decorations fit their placement footprints across all styles');
assert.equal(lifecycle.designs.length,14,'all fourteen active designs are exercised');
assert.deepEqual(new Set(lifecycle.designs),new Set(lifecycle.artIds),'every active design uses edition art');
assert.deepEqual(lifecycle.final,lifecycle.initial,'materials, textures, meshes and transforms release after repeated rebuilds');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await evaluate(`localStorage.setItem('tea-shop-preview-edition2-progress-v1',JSON.stringify({muted:true,bestStars:Array(10).fill(0),bestMoves:Array(10).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:false}}));`);
await navigate(false);await shot('empty-phone');
assert.deepEqual(errors,[]);
console.log('PASS: all fourteen active designs, mixed phone/day/night/desktop, empty room, and twelve rebuild cycles per design plus keeper release owned resources.',lifecycle);
await fs.writeFile('work/edition-art-v2-check.json',JSON.stringify(lifecycle,null,2));
await clear();ws.close();
