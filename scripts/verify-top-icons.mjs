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
await evaluate(`localStorage.removeItem('tea-shop-progress-v1');localStorage.setItem('tea-shop-preview-appearance-v1','day')`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
const tap=async(selector)=>{
 const p=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el||el.disabled||el.closest('[inert]'))throw Error('Unavailable control '+${JSON.stringify(selector)});el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,120));
};
const shot=async(name)=>fs.writeFile('work/'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));

if(await evaluate(`document.querySelector('#mute').getAttribute('data-state')`)!=='on')throw Error('Fresh audio not on');
await tap('#mute');
if(!await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).muted`))throw Error('Mute not saved');
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
if(await evaluate(`document.querySelector('#mute').getAttribute('aria-label')`)!=='Turn sound on')throw Error('Mute preference lost');
await tap('#mute');await tap('#theme-toggle');await new Promise(r=>setTimeout(r,350));
if(!await evaluate(`document.querySelector('#theme-toggle').getAttribute('data-state')==='night' && getComputedStyle(document.querySelector('.moon-icon')).opacity==='1' && getComputedStyle(document.querySelector('.sun-icon')).opacity==='0'`))throw Error('Theme icon failed');
await shot('top-icons-night-phone');
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
if(await evaluate(`document.querySelector('#theme-toggle').getAttribute('data-state')`)!=='night')throw Error('Night preference lost');
await tap('#theme-toggle');await tap('#play-tea');
if(await evaluate(`document.querySelector('#mute').getAttribute('data-state')`)!=='on')throw Error('Levels audio state wrong');
await tap('#mute');await tap('.continue-card');
if(await evaluate(`document.querySelector('#mute').getAttribute('data-state')`)!=='off')throw Error('Puzzle audio state wrong');
await evaluate(`document.querySelector('[data-jar="0"]').click();document.querySelector('[data-jar="2"]').click();window.__beforeMuteJar=document.querySelector('[data-jar="0"]');document.querySelector('#mute').click()`);
if(!await evaluate(`window.__beforeMuteJar===document.querySelector('[data-jar="0"]')`))throw Error('Audio toggle rebuilt puzzle during transfer');
await new Promise(r=>setTimeout(r,450));
if(await evaluate(`document.querySelector('.moves').textContent`)!=='1 move')throw Error('Audio interrupted move');
await shot('top-icons-puzzle-phone');
await tap('[data-go="levels"]');await tap('[data-go="shop"]');
await evaluate(`const p=JSON.parse(localStorage.getItem('tea-shop-progress-v1'));p.bestStars=Array(38).fill(3);localStorage.setItem('tea-shop-progress-v1',JSON.stringify(p))`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
for(const [width,height,name] of [[390,844,'phone'],[320,568,'small-phone'],[844,390,'landscape'],[1280,900,'desktop']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await new Promise(r=>setTimeout(r,250));
 if(!await evaluate(`(()=>{const bar=document.querySelector('.shop-toolbar');return bar.scrollWidth<=bar.clientWidth+1 && [...bar.querySelectorAll('.toolbar-toggle')].every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.right<=innerWidth;});})()`))throw Error('Toolbar overflow '+name);
 await shot('top-icons-'+name);
}
await tap('#edit-toggle');await tap('#theme-toggle');await tap('#mute');
if(!await evaluate(`document.querySelector('.settings-menu').classList.contains('hidden')`))throw Error('Empty menu visible during edit');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
if(await evaluate(`getComputedStyle(document.querySelector('.sun-icon')).transitionDuration`)!=='0s')throw Error('Reduced motion ignored');
await send('Emulation.setEmulatedMedia',{features:[]});
if(errors.length)throw Error(JSON.stringify(errors));
console.log('PASS: audio on by default, saved mute/night, direct icons across screens, current-state visuals, non-interrupting puzzle toggle, 44px targets, responsive toolbar and reduced motion.');await clearReturningStart();ws.close();
