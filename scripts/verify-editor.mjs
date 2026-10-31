// Browser regression check. Requires Vite at 127.0.0.1:5174 with base /tea-shop/preview/
// and Chromium remote debugging on 127.0.0.1:9224. Run with Node 22 or newer.
import fs from 'node:fs/promises';
await fs.mkdir('work', {recursive:true});
const tabs=await (await fetch('http://127.0.0.1:9224/json')).json();
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
await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');
await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5174',storageTypes:'service_workers,cache_storage'});
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});




await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1200));
const seed={muted:true,bestStars:Array(20).fill(3),bestMoves:Array(20).fill(0),shop:{owned:['counter','lamp'],style:{},place:{},finaleSeen:true}};
await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('@babylonjs_core_Engines_engine.js')).name;const {Engine}=await import(url);window.__qaScene=Engine.Instances[0].scenes[0];await window.__qaScene.whenReadyAsync();})()`);
const click=selector=>evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});if(!button||button.getClientRects().length===0)throw Error('Button not visible: '+${JSON.stringify(selector)});button.click();})()`);
const saved=()=>evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop`);
const drag=async(name,y,dx,dz)=>{
 const points=await evaluate(`(()=>{const scene=window.__qaScene,e=scene.getEngine(),v=scene.getTransformNodeByName('${name}').position.clone();const rect=document.querySelector('canvas').getBoundingClientRect();const project=(x,z)=>{const p=v.constructor.Project(new v.constructor(x,${y},z),scene.getTransformMatrix().constructor.Identity(),scene.getTransformMatrix(),scene.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return {x:rect.x+p.x*rect.width/e.getRenderWidth(),y:rect.y+p.y*rect.height/e.getRenderHeight()};};return {start:project(v.x,v.z),end:project(v.x+${dx},v.z+${dz})};})()`);
 await touch({type:'mousePressed',...points.start});
 for(let step=1;step<=10;step++){await touch({type:'mouseMoved',x:points.start.x+(points.end.x-points.start.x)*step/10,y:points.start.y+(points.end.y-points.start.y)*step/10});await new Promise(r=>setTimeout(r,30));}
 await touch({type:'mouseReleased',...points.end});await new Promise(r=>setTimeout(r,200));
};
await fs.writeFile('work/shop-toolbar-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
if(await evaluate(`Boolean(document.querySelector('#shop-hint'))`))throw Error('Room helper strip remains');
await click('#showcase-toggle');
if(await evaluate(`getComputedStyle(document.querySelector('.shop-toolbar')).display`)!=='none')throw Error('Showcase toolbar visible');
await click('#showcase-back');
await click('#edit-toggle');
const owned=await evaluate(`[...document.querySelectorAll('[data-upgrade]')].map(b=>b.dataset.upgrade)`);
if(JSON.stringify(owned)!==JSON.stringify(['counter','lamp']))throw Error('Owned tab duplicates catalogue');
await fs.writeFile('work/editor-owned-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await click('[data-upgrade="lamp"]');await drag('lamp',1.28,2,-1);
if((await saved()).place.lamp.x!==2)throw Error('Cannot drag immediately after selection');
await click('[data-filter="all"]');
if(await evaluate(`Boolean(document.querySelector('[data-upgrade="counter"], [data-upgrade="lamp"]'))`))throw Error('Owned items shown for sale');
await fs.writeFile('work/editor-catalogue-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await click('[data-upgrade="table"]');await click('[data-act="preview"][data-style="2"]');
await new Promise(r=>setTimeout(r,200));
const before=JSON.stringify(await saved());
await drag('table',.60,0,-1);
let position=await evaluate(`window.__qaScene.getTransformNodeByName('table').position.asArray()`);
if(position[2]!==3)throw Error('Cannot move preview '+position);
if(JSON.stringify(await saved())!==before)throw Error('Preview movement persisted');
await click('[data-act="rotate"]');
await fs.writeFile('work/editor-preview-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await click('[data-act="buy"]');await new Promise(r=>setTimeout(r,1600));
if((await saved()).place.table.z!==2||(await saved()).style.table!==2)throw Error('Preview choice lost on purchase');
await drag('table',.60,1,0);
if((await saved()).place.table.x!==4)throw Error('Cannot drag immediately after purchase');
await click('[data-filter="all"]');
if(await evaluate(`Boolean(document.querySelector('[data-upgrade="table"]'))`))throw Error('Purchase remains in catalogue');
await click('[data-upgrade="basket"]');
// Directly grab owned furniture while a different item is being previewed.
await drag('lamp',1.28,1,1);
if((await saved()).place.lamp.x!==3||(await saved()).owned.includes('basket'))throw Error('Cannot return directly from preview to owned drag');
if(await evaluate(`Boolean(window.__qaScene.getTransformNodeByName('basket'))`))throw Error('Preview not cleared by owned selection');
await click('[data-filter="all"]');await click('[data-upgrade="shelves"]');await click('[data-act="buy"]');await new Promise(r=>setTimeout(r,1600));
await click('[data-act="rotate"]');await drag('shelves',1.85,0,1);
if((await saved()).place.shelves.wall!=='left'||(await saved()).place.shelves.x!==1)throw Error('Shelf movement regressed');
await click('[data-filter="all"]');await click('[data-upgrade="basket"]');await click('[data-act="cancel-preview"]');
await click('[data-filter="owned"]');await click('[data-upgrade="lamp"]');await drag('lamp',1.28,-2,0);
if((await saved()).place.lamp.x!==1)throw Error('Cannot move after cancelling preview');
await click('[data-filter="owned"]');await click('#theme-toggle');
await fs.writeFile('work/editor-night-phone.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
for(const [width,height,name] of [[1280,900,'desktop'],[844,390,'landscape'],[375,667,'small-phone'],[320,568,'narrow-phone']]) {
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await new Promise(r=>setTimeout(r,300));
 const fits=await evaluate(`(()=>{const panel=document.querySelector('#decorate-panel').getBoundingClientRect(),canvas=document.querySelector('canvas').getBoundingClientRect();const toolbar=document.querySelector('.shop-toolbar');return toolbar.scrollWidth<=toolbar.clientWidth&&panel.bottom<=innerHeight&&panel.left>=0&&panel.right<=innerWidth&&canvas.height>70&&document.documentElement.scrollWidth<=innerWidth;})()`);
 if(!fits)throw Error('Editor overflow at '+name);
 await fs.writeFile('work/editor-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
}
await click('#edit-toggle');
const final=JSON.stringify(await saved());await send('Page.reload');await new Promise(r=>setTimeout(r,1200));
if(JSON.stringify(await saved())!==final)throw Error('Layout changed on reload');
await evaluate(`localStorage.setItem('tea-shop-progress-v1',JSON.stringify({muted:true,bestStars:Array(20).fill(0),bestMoves:Array(20).fill(0),shop:{owned:[],style:{},place:{},finaleSeen:false}}))`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
await click('#edit-toggle');await click('[data-upgrade="counter"]');
if(!await evaluate(`document.querySelector('[data-act="buy"]').disabled`))throw Error('Unaffordable purchase enabled');
if(!await evaluate(`document.querySelector('#upgrade-detail').textContent.includes('2 more stars')`))throw Error('Missing shortfall');
await click('#edit-toggle');
if((await saved()).owned.length!==0)throw Error('Leaving Edit committed a preview');
if(errors.length)throw Error(JSON.stringify(errors));
console.log({ownedSelectionDrag:true,previewDragIsTemporary:true,previewPlacementPurchased:true,immediatePostPurchaseDrag:true,directOwnedSelectionDuringPreview:true,cancelAndMove:true,exclusiveCollections:true,phoneDesktopLandscape:true,reload:true,errors});ws.close();
