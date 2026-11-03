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
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
await send('Runtime.enable');await send('Page.enable');clearReturningStart = await installReturningPlayerStart(send);await send('Page.bringToFront');
await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5174',storageTypes:'service_workers,cache_storage'});
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});





await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1400));
const seed={muted:true,bestStars:Array(38).fill(3),bestMoves:Array(38).fill(0),shop:{owned:[],style:{},place:{},finaleSeen:false}};
await evaluate(`localStorage.setItem('tea-shop-preview-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await evaluate(`localStorage.setItem('tea-shop-preview-appearance-v1','day')`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
const tap=async(selector)=>{
 if(selector.startsWith('[data-filter') && await evaluate(`Boolean(document.querySelector('.has-selection'))`)) await tap('[data-act="browse"]');
 const p=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el||el.disabled||el.closest('[inert]'))throw Error('Unavailable control '+${JSON.stringify(selector)});el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,120));
};
const shot=async(name)=>fs.writeFile('work/'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));

await shot('refine-home-phone');
if(!await evaluate(`document.querySelector('#shop-stars strong').textContent==='132'`))throw Error('Balance not prominent');
await tap('.settings-menu summary');await shot('refine-settings-phone');
await tap('#theme-toggle');
if(!await evaluate(`document.querySelector('.shop-room').classList.contains('is-night')`))throw Error('Theme menu failed');
await tap('.settings-menu summary');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
if(await evaluate(`document.querySelector('.settings-menu').open`))throw Error('Escape did not dismiss settings');
await tap('#edit-toggle');await tap('[data-upgrade="lamp"]');
if(await evaluate(`document.querySelectorAll('.style-thumbnail').length`)!==3)throw Error('Missing style thumbnails');
await tap('[data-act="preview"][data-style="2"]');await shot('refine-styles-night-phone');
const before=await evaluate(`localStorage.getItem('tea-shop-preview-progress-v1')`);
const expanded=await evaluate(`document.querySelector('#shop-canvas').getBoundingClientRect().height`);
await tap('#tray-toggle');await new Promise(r=>setTimeout(r,300));
if(await evaluate(`document.querySelector('#shop-canvas').getBoundingClientRect().height`)<=expanded+80)throw Error('Collapsed tray did not enlarge room');
if(await evaluate(`localStorage.getItem('tea-shop-preview-progress-v1')`)!==before)throw Error('Collapse changed progress');
if(!await evaluate(`document.querySelector('#editor-body').inert`))throw Error('Hidden controls still focusable');
await shot('refine-expanded-room-phone');await tap('#tray-toggle');
if(!await evaluate(`document.querySelector('[data-act="preview"][data-style="2"]').getAttribute('aria-pressed')==='true'`))throw Error('Collapse lost preview');
await tap('[data-act="buy"]');
if(!await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).shop.owned.includes('lamp')`))throw Error('Purchase failed');
await tap('[data-act="style"][data-style="1"]');
if(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).shop.style.lamp`)!==1)throw Error('Owned restyle failed');
await tap('[data-act="store"]');await tap('[data-act="place"]');
await tap('#theme-toggle');await tap('#tray-toggle');await tap('#tray-toggle');
for(const [width,height,name] of [[390,844,'phone'],[320,568,'small-phone'],[844,390,'landscape'],[1280,900,'desktop']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await new Promise(r=>setTimeout(r,300));
 const fits=await evaluate(`(()=>{const b=document.querySelector('#decorate-panel').getBoundingClientRect();return b.bottom<=innerHeight+1 && b.right<=innerWidth+1 && document.documentElement.scrollWidth===innerWidth;})()`);
 if(!fits)throw Error('Editor clipped '+name);
 await shot('refine-styles-'+name);
}
await tap('#edit-toggle');await tap('.settings-menu summary');await tap('#showcase-toggle');
if(!await evaluate(`document.querySelector('.shop-room').classList.contains('showcasing')`))throw Error('Showcase menu failed');
await tap('#showcase-back');
if(errors.length)throw Error(JSON.stringify(errors));
console.log('PASS: prominent balance, settings/theme/Escape/showcase, variant thumbnails, larger room, preserved preview/save, purchase/restyle/store/restore and responsive editor.');await clearReturningStart();ws.close();
