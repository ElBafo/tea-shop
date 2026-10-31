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
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await new Promise(r=>setTimeout(r,1400));
const seed={muted:true,bestStars:Array(20).fill(0),bestMoves:Array(20).fill(0),shop:{owned:[],style:{},place:{},finaleSeen:false}};
await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));
const tap=async(selector)=>{
 const p=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el||el.disabled||el.closest('[inert]'))throw Error('Unavailable control '+${JSON.stringify(selector)});el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,120));
};
const shot=async(name)=>fs.writeFile('work/'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await tap('#play-tea');
if(await evaluate(`document.querySelectorAll('.level-btn:disabled').length`)!==19)throw Error('Locked levels changed');
await shot('ui-levels-phone');
await tap('.continue-card');
await shot('ui-puzzle-phone');
if(!await evaluate(`document.querySelector('#undo').disabled`))throw Error('Undo enabled initially');
// Known shortest solution to First Pour; level verification independently checks its par.
const solution=[{from:0,to:2},{from:1,to:0}];
await tap(`[data-jar="${solution[0].from}"]`);await tap(`[data-jar="${solution[0].to}"]`);await new Promise(r=>setTimeout(r,400));
if(await evaluate(`document.querySelector('.moves').textContent`)!=='1 move')throw Error('Move not counted');
await tap('#undo');
if(await evaluate(`document.querySelector('.moves').textContent`)!=='0 moves')throw Error('Undo failed');
await tap('#restart');
const win=async()=>{for(const move of solution){await tap(`[data-jar="${move.from}"]`);await tap(`[data-jar="${move.to}"]`);await new Promise(r=>setTimeout(r,420));}await new Promise(r=>setTimeout(r,450));};
await win();
if(!await evaluate(`document.querySelector('.result-reward').textContent.includes('+3')`))throw Error('Reward mismatch');
if(!await evaluate(`document.querySelector('.screen-toolbar').inert&&document.activeElement.matches('[data-next]')`))throw Error('Result dialog focus not isolated');
await shot('ui-result-phone');
await tap('[data-replay]');await win();
if(!await evaluate(`document.querySelector('.result-reward').textContent.includes('already collected')`))throw Error('Replay implies duplicate stars');
if(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).bestStars[0]`)!==3)throw Error('Best stars lost');
await tap('.result-overlay [data-go="shop"]');await new Promise(r=>setTimeout(r,1000));
if(!await evaluate(`document.querySelector('#shop-stars').textContent.includes('3')`))throw Error('Reward missing on shop');
await tap('#play-tea');
if(await evaluate(`document.querySelector('.continue-card').dataset.level`)!=='2')throw Error('Continue does not follow progress');
await tap('.continue-card');
if(await evaluate(`document.querySelector('.screen-toolbar h2').textContent`)!=='Pair of Tins')throw Error('Wrong next puzzle');
// Ignore delayed work from a puzzle after navigating away during a pour.
await tap('[data-go="levels"]');await tap('.level-btn[data-level="1"]');
await tap(`[data-jar="${solution[0].from}"]`);await tap(`[data-jar="${solution[0].to}"]`);
await tap('[data-go="levels"]');await tap('.level-btn[data-level="2"]');await new Promise(r=>setTimeout(r,700));
if(await evaluate(`document.querySelector('.moves').textContent`)!=='0 moves')throw Error('Old animation changed new puzzle');
seed.bestStars=Array(20).fill(3);
await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(seed))})`);
await send('Page.reload');await new Promise(r=>setTimeout(r,1400));await tap('#play-tea');await tap('.level-btn[data-level="20"]');
for(const [width,height,name] of [[390,844,'phone'],[320,568,'small-phone'],[844,390,'landscape'],[1280,900,'desktop']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await new Promise(r=>setTimeout(r,250));
 const fit=await evaluate(`(()=>{const s=document.querySelector('.shelves'),bounds=s.getBoundingClientRect(),bar=document.querySelector('.play-bar').getBoundingClientRect();return {fits:s.scrollHeight<=s.clientHeight+2&&[...document.querySelectorAll('.jar')].every(j=>{const r=j.getBoundingClientRect();return r.top>=bounds.top&&r.bottom<=bar.top&&r.left>=0&&r.right<=innerWidth;}),scroll:s.scrollHeight,client:s.clientHeight,width:innerWidth};})()`);
 if(!fit.fits||fit.width!==width)throw Error('Tall puzzle clipped '+name+' '+JSON.stringify(fit));
 await shot('ui-tall-puzzle-'+name);
}
await tap('[data-go="levels"]');await shot('ui-levels-desktop');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?showroom=1'});await new Promise(r=>setTimeout(r,1600));await shot('ui-home-phone');
if(errors.length)throw Error(JSON.stringify(errors));
console.log({navigation:true,lockedLevels:true,realTouchPuzzle:true,undoRestart:true,winAndReplayRewards:true,dialogFocus:true,continueProgress:true,tallJarLayouts:true,errors});ws.close();
