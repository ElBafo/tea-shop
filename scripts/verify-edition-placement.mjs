// Run with Vite5174/base /tea-shop/preview/ and an isolated CDP browser.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir('work',{recursive:true});
await fs.writeFile('work/placement-harness.html','<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><canvas id="placement-canvas" style="display:block;width:100vw;height:90dvh;touch-action:none"></canvas></body></html>');
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT??9232}/json`)).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=(ms=100)=>new Promise(r=>setTimeout(r,ms));
await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
const load=async edition=>{
 await send('Page.navigate',{url:`http://127.0.0.1:${process.env.TEST_PORT??5174}/tea-shop/preview/work/placement-harness.html`+(edition?'?edition=2':'')});await pause(600);await send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]}).catch(()=>{});
 await evaluate(`(async()=>{const {Diorama}=await import('/tea-shop/preview/src/shop/diorama.ts');window.shop={owned:['plant','table','sign'],stored:[],style:{},place:{plant:{x:1,z:2,rot:0},table:{x:4,z:4,rot:0},sign:{x:0,z:0,rot:0,wall:'back'}},finaleSeen:true};window.moves=[];window.blocked=0;window.selections=[];window.d=new Diorama(document.querySelector('canvas'),shop,{onSelect:id=>selections.push(id),onMove:(id,place)=>{moves.push({id,place});shop.place[id]=place;d.sync(shop);},onPlaced:()=>{},onPlacementBlocked:()=>blocked++});d.setEditMode(true);await d.ready();})()`);
 await pause(250);
};
const project=(x,y,z)=>evaluate(`(()=>{const s=d.scene,e=d.engine,v=s.activeCamera.position,c=document.querySelector('canvas').getBoundingClientRect();const p=v.constructor.Project(new v.constructor(${x},${y},${z}),s.getTransformMatrix().constructor.Identity(),s.getTransformMatrix(),s.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return{x:c.x+p.x*c.width/e.getRenderWidth(),y:c.y+p.y*c.height/e.getRenderHeight()};})()`);
const touch=(type,points)=>send('Input.dispatchTouchEvent',{type,touchPoints:points});
const tap=async p=>{await touch('touchStart',[{...p,id:1}]);await pause(60);await touch('touchEnd',[]);await pause(120);};
const saved=()=>evaluate(`JSON.stringify(shop.place)`);
try {
for(const [width,height] of [[390,844],[1200,900]]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});await load(true);
 await evaluate(`d.select('plant')`);
 const target=await project(3.5,.02,2.5);await touch('touchStart',[{...target,id:1}]);await pause();
 assert.equal(await evaluate(`shop.place.plant.x`),1,'holding destination only previews');
 assert.ok(await evaluate(`d.scene.getTransformNodeByName('plant').position.x>3`),'piece previews chosen destination');
 await touch('touchEnd',[]);await pause();assert.deepEqual(await evaluate(`shop.place.plant`),{x:3,z:2,rot:0});
 // Tapping a different item selects it, rather than moving the previously selected piece.
 await tap(await project(5,.68,5));assert.equal(await evaluate(`selections.at(-1)`),'table');assert.equal(await evaluate(`moves.length`),1);
 await evaluate(`d.select('plant')`);const before=await saved();
 // A wall tap cannot accidentally project a floor item behind that wall.
 await tap(await project(2,2,.02));assert.equal(await saved(),before);assert.equal(await evaluate(`blocked`),1);
 // Moving off a tap destination cancels; it does not turn into an unintentional drag.
 const point=await project(.5,.02,4.5);await touch('touchStart',[{...point,id:1}]);await touch('touchMove',[{x:point.x+20,y:point.y,id:1}]);await touch('touchEnd',[]);await pause();assert.equal(await saved(),before);
 // A second finger cancels the pending placement before zoom begins.
 await touch('touchStart',[{...point,id:1}]);await touch('touchStart',[{...point,id:1},{x:point.x+50,y:point.y,id:2}]);await touch('touchMove',[{x:point.x-10,y:point.y,id:1},{x:point.x+65,y:point.y,id:2}]);await touch('touchEnd',[]);await pause();assert.equal(await saved(),before);
 await touch('touchStart',[{...point,id:1}]);await evaluate(`d.select(null)`);await touch('touchEnd',[]);await pause();assert.equal(await saved(),before,'changing selection cancels pending tap');
 await evaluate(`d.resetView();d.select('sign')`);await pause();await tap(await project(.02,2.48,3));assert.equal(await evaluate(`shop.place.sign.wall`),'left','wall tap crosses walls');
 await evaluate(`shop.owned.push('shelves');shop.place.shelves={x:0,z:0,rot:0,wall:'back'};d.sync(shop)`);const fullWall=await saved();const blockedBefore=await evaluate(`blocked`);await tap(await project(1.5,2.9,.02));assert.equal(await saved(),fullWall,'full wall rejects tap placement');assert.equal(await evaluate(`blocked`),blockedBefore+1);
 await evaluate(`shop.owned=shop.owned.filter(id=>id!=='shelves');delete shop.place.shelves;d.sync(shop)`);
 // Drag remains usable immediately after tapping and pinching.
 await evaluate(`d.select('plant')`);const start=await project(3.5,.55,2.5),end=await project(2.5,.55,3.5);
 await touch('touchStart',[{...start,id:1}]);for(let i=1;i<=10;i++)await touch('touchMove',[{x:start.x+(end.x-start.x)*i/10,y:start.y+(end.y-start.y)*i/10,id:1}]);await touch('touchEnd',[]);await pause();assert.deepEqual(await evaluate(`shop.place.plant`),{x:2,z:3,rot:0});
 await fs.writeFile(`work/edition-placement-${width}.png`,Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
 await evaluate(`d.dispose()`);
}
await load(false);await evaluate(`d.select('plant')`);const before=await saved();await tap(await project(3.5,.02,2.5));assert.equal(await saved(),before,'classic blank tap behavior unchanged');await evaluate(`d.dispose()`);
assert.deepEqual(errors,[]);console.log('PASS: floor/wall tap placement, transient preview, other-piece selection, invalid surface, swipe/pinch cancellation, drag continuation and classic isolation at phone/desktop sizes.');} finally { await touch('touchCancel',[]).catch(()=>{}); await evaluate('window.d?.dispose()').catch(()=>{}); ws.close(); }
