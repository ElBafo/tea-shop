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
await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');

const wait=async expr=>{for(let i=0;i<160;i++){if(await evaluate(expr))return;await new Promise(r=>setTimeout(r,120));}throw Error('Timed out '+expr);};
const tap=async selector=>{
 const p=await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el||el.disabled||el.closest('[inert]'))throw Error('Unavailable '+${JSON.stringify(selector)});el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,100));
};
const shot=async name=>fs.writeFile('work/'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const origin='http://127.0.0.1:5174',url=origin+'/tea-shop/preview/';
const open=async(suffix='')=>{await send('Page.navigate',{url:url+suffix});await wait(`document.querySelector('#launch-start') && !document.querySelector('#launch-start').disabled`);};
const start=async()=>{await tap('#launch-start');await wait(`!document.querySelector('#launch-screen')`);};
const fresh=async()=>{await send('Storage.clearDataForOrigin',{origin,storageTypes:'all'});await open();};
const win=async()=>{for(const [from,to] of [[0,2],[1,0],[1,2]]){await tap(`[data-jar="${from}"]`);await tap(`[data-jar="${to}"]`);await wait(`document.querySelector('.shelves').getAttribute('aria-busy')==='false'`);}await wait(`!!document.querySelector('.result-overlay')`);};
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await fresh();
if(!await evaluate(`document.querySelector('#app').inert && document.title==='Decopu'`))throw Error('Start barrier or branding wrong');
await shot('decopu-start-phone');await start();if(!await evaluate(`document.activeElement.hasAttribute('data-guide-start')`))throw Error('Welcome focus not transferred');await shot('decopu-welcome-phone');
await tap('[data-guide-start]');
if(await evaluate(`document.querySelector('.guide-target').dataset.jar`)!=='0')throw Error('First source guidance missing');
await shot('decopu-first-puzzle-phone');await win();await shot('decopu-first-stars-phone');
if(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).bestStars[0]`)!==3)throw Error('Guided win reward changed');
await tap('.result-overlay [data-go="shop"]');
await wait(`!!document.querySelector('[data-upgrade="counter"]')`);
await tap('[data-upgrade="counter"]');await tap('[data-act="preview"][data-style="1"]');await shot('decopu-first-decoration-phone');
await tap('[data-act="buy"]');await wait(`!!document.querySelector('[data-guide-done]')`);
if(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-progress-v1')).shop.style.counter`)!==1)throw Error('First purchase wrong');
await tap('[data-guide-done]');await open();await start();
if(await evaluate(`!!document.querySelector('.welcome-overlay, .guide-card')`))throw Error('Finished guide repeats');
const saved=await evaluate(`localStorage.getItem('tea-shop-preview-progress-v1')`);
await evaluate(`localStorage.removeItem('tea-shop-preview-progress-v1:guide-v1')`);await open();await start();
if(await evaluate(`!!document.querySelector('.welcome-overlay')`))throw Error('Existing player forced into tour');
if(await evaluate(`localStorage.getItem('tea-shop-preview-progress-v1')`)!==saved)throw Error('Legacy save changed');
const allSaved=await evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])))`);
await open('?tour=1');await start();await tap('[data-guide-start]');await win();await tap('.result-overlay [data-go="shop"]');await wait(`!!document.querySelector('[data-upgrade="counter"]')`);await tap('[data-upgrade="counter"]');await tap('[data-act="buy"]');await tap('[data-guide-done]');
if(await evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])))`)!==allSaved)throw Error('Demo changed real preview progress');
for(const [width,height,name] of [[320,568,'small-phone'],[844,390,'landscape'],[1280,900,'desktop']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await open('?tour=1');await shot('decopu-start-'+name);await start();
 const fits=await evaluate(`(()=>{const r=document.querySelector('.welcome-card').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.right<=innerWidth;})()`);
 if(!fits)throw Error('Welcome clipped '+name);
 await tap('[data-guide-start]');
 const jarsFit=await evaluate(`[...document.querySelectorAll('.jar')].every(j=>{const r=j.getBoundingClientRect();return r.bottom<=document.querySelector('.play-bar').getBoundingClientRect().top&&r.left>=0&&r.right<=innerWidth;})`);
 if(!jarsFit)throw Error('Guided puzzle clipped '+name);
 await shot('decopu-guide-'+name);await tap('[data-guide-skip]');
 if(await evaluate(`!!document.querySelector('.guide-card')`))throw Error('Skip failed');
}
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await fresh();await start();await tap('[data-welcome-skip]');await open();await start();
if(await evaluate(`!!document.querySelector('.welcome-overlay, .guide-card')`))throw Error('Skipped guide repeated');
// A one-star first win still has a clear path to the first purchase.
await evaluate(`localStorage.setItem('tea-shop-preview-progress-v1',JSON.stringify({muted:true,bestStars:[1],bestMoves:[20],shop:{owned:[],style:{},place:{},finaleSeen:false}}));localStorage.setItem('tea-shop-preview-progress-v1:guide-v1','decorate')`);
await open();await start();
if(!await evaluate(`document.querySelector('#shop-guide').textContent.includes('Decorations start at 2 stars')`))throw Error('Missing low-star guidance');
await tap('[data-guide-play]');
if(!await evaluate(`!!document.querySelector('.level-grid')`))throw Error('Low-star guide did not lead to puzzles');
// Exercise an actual unavailable WebGL context, caught by bootstrap.
const brokenGL=await send('Page.addScriptToEvaluateOnNewDocument',{source:`const originalContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(String(type).includes('webgl'))return null;return originalContext.call(this,type,...args);};`});
await send('Page.navigate',{url});await wait(`!!document.querySelector('#launch-retry') && !document.querySelector('#launch-retry').hidden`);
await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:brokenGL.identifier});
if(!await evaluate(`document.querySelector('#launch-start').disabled && !document.querySelector('#launch-retry').hidden`))throw Error('No loading recovery');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
if(await evaluate(`getComputedStyle(document.querySelector('.launch-spark')).animationName`)!=='none')throw Error('Splash ignores reduced motion');
await send('Emulation.setEmulatedMedia',{features:[]});
if(errors.length)throw Error(JSON.stringify(errors));
console.log('PASS: Start/branding, real-touch guided win and purchase, completion/skip persistence, legacy saves, isolated tour demo, small/landscape/desktop layouts, loading recovery and reduced motion.');ws.close();
