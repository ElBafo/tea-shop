// Normal 3D renderer integration against an isolated Chromium CDP profile.
// PREVIEW_URL can target a compiled main/preview build; fixtures never touch a user's browser.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {installReturningPlayerStart} from './browser-start.mjs';
const url=process.env.PREVIEW_URL??'http://127.0.0.1:5174/tea-shop/preview/';
const production=!new URL(url).pathname.includes('/preview/');
const key=`tea-shop-${production?'':'preview-'}edition2-progress-v1`;
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT??9250}/json`)).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(),errors=[],checks=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}));});
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const until=async expression=>{for(let i=0;i<240;i++){if(await ev(expression))return;await pause(100);}throw Error('Timed out: '+expression);};
const click=async selector=>{await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await pause(250);};
const idle=()=>until(`document.querySelector('.shelves')?.getAttribute('aria-busy')==='false'`);
const active=()=>until(`!!document.querySelector('.normal-puzzle-3d canvas') && document.querySelector('#app').classList.contains('puzzle-in-3d')`);
const snapshot=()=>ev(`Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]))`);
const check=name=>{checks.push(name);console.log('PASS:',name);};
const shot=async name=>{await pause(300);await fs.writeFile(`work/normal-3d-${name}.png`,Buffer.from((await send('Page.captureScreenshot',{captureBeyondViewport:false})).data,'base64'));};
const seed=async(level=1,actions=[])=>{
 const progress={muted:true,bestStars:Array.from({length:24},(_,i)=>i<level-1?1:0),bestMoves:Array(24).fill(0),shop:{owned:[],stored:[],place:{},style:{},finaleSeen:false}};
 await ev(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(progress))});localStorage.setItem('${key}:guide-v1','done');localStorage.setItem('${key}:puzzle-v1',${JSON.stringify(JSON.stringify({version:1,levelId:level,actions}))});`);
 await send('Page.reload');await pause(500);await until(`!!document.querySelector('#play-tea')&&!document.querySelector('#launch-screen')`);await click('#play-tea');await idle();
};
let clearStart=()=>{};
try {
 await fs.mkdir('work',{recursive:true});await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 clearStart=await installReturningPlayerStart(send);await send('Page.navigate',{url});await pause(500);await until(`!!document.querySelector('#play-tea')&&!document.querySelector('#launch-screen')`);
 // Preserve unrelated edition and other deployment sentinels through every scenario.
 const other=production?'tea-shop-preview-edition2-progress-v1':'tea-shop-edition2-progress-v1';
 await ev(`localStorage.setItem('${other}','other-deployment-sentinel');localStorage.setItem('tea-shop-progress-v1','classic-sentinel')`);
 await seed();await active();await shot('phone');
 await ev(`window.__normalCanvas=document.querySelector('.normal-puzzle-canvas')`);
 await click('[data-jar="0"]');await active();
 assert.equal(await ev(`window.__normalCanvas===document.querySelector('.normal-puzzle-canvas')`),true);
 await click('[data-jar="2"]');await idle();await active();
 assert.deepEqual(await ev(`JSON.parse(localStorage.getItem('${key}:puzzle-v1')).actions`),[[0,2]]);
 await send('Page.reload');await pause(500);await until(`!!document.querySelector('#play-tea')&&!document.querySelector('#launch-screen')`);await click('#play-tea');await active();await click('#undo');await idle();
 assert.deepEqual(await ev(`JSON.parse(localStorage.getItem('${key}:puzzle-v1')).actions`),[]);
 check('3D is default; scene canvas survives selection; normal transfers, reload and saved Undo work');
 for(const [width,height,level,name] of [[320,568,18,'small-tall'],[390,844,5,'hidden'],[844,390,18,'landscape'],[1280,900,18,'desktop']]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await seed(level);await active();
  assert.equal(await ev(`document.documentElement.scrollWidth<=innerWidth+1 && [...document.querySelectorAll('[data-jar],.play-bar button')].every(e=>{const r=e.getBoundingClientRect();return r.x>=-1&&r.right<=innerWidth+1&&r.y>=-1&&r.bottom<=innerHeight+1})`),true,name+' fits');
  if(level===5)assert.equal(await ev(`[...document.querySelectorAll('.mystery')].every(e=>!e.getAttribute('style')&&!/rose|chai|matcha|jasmine/.test(e.className))`),true);
  await shot(name);
 }
 check('small phone, standard phone, landscape and desktop fit; concealed DOM remains private');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await seed();await active();
 const before=await snapshot();
 await ev(`document.querySelector('.normal-puzzle-canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()`);
 await until(`!!document.querySelector('.renderer-recovery')&&!document.querySelector('.normal-puzzle-canvas')`);
 assert.deepEqual(await snapshot(),before,'real context loss does not write saved state');
 await click('[data-jar="0"]');await click('[data-jar="2"]');await idle();
 assert.deepEqual(await ev(`JSON.parse(localStorage.getItem('${key}:puzzle-v1')).actions`),[[0,2]]);
 await shot('recovery');check('real WebGL context loss disposes 3D and keeps the same board playable without save changes');
 // Module failure is recoverable and cannot leave native jar art hidden.
 await send('Network.setBlockedURLs',{urls:['*puzzle-3d*']});await seed();await until(`!!document.querySelector('.renderer-recovery')`);
 assert.equal(await ev(`getComputedStyle(document.querySelector('.jar-glass')).opacity`),'1');
 await click('[data-jar="0"]');await click('[data-jar="2"]');await idle();
 await send('Network.setBlockedURLs',{urls:[]});check('failed renderer module retains playable native controls');
 // A stalled module must time out even though the rest of the app is ready.
 await send('Fetch.enable',{patterns:[{urlPattern:'*puzzle-3d*.js',requestStage:'Request'}]});
 await seed();await until(`!!document.querySelector('.renderer-recovery')`);
 await send('Fetch.disable');
 await click('[data-jar="0"]');await click('[data-jar="2"]');await idle();
 check('stalled renderer loading times out and keeps the same puzzle playable');
 // WebGL context creation can fail independently of module loading.
 const stalled=(await send('Page.addScriptToEvaluateOnNewDocument',{source:`const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){if(this.classList.contains('normal-puzzle-canvas')){this.dispatchEvent(new CustomEvent('puzzle3d-unavailable'));throw Error('synthetic unavailable context');}return getContext.apply(this,args);};`})).identifier;
 await seed();await until(`!!document.querySelector('.renderer-recovery')`);await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:stalled});
 check('unavailable WebGL initialization recovers without blocking normal puzzle entry');
 await seed();await active();
 for(let i=0;i<6;i++){
  await click('[data-go="levels"]');assert.equal(await ev(`document.querySelectorAll('.normal-puzzle-canvas').length`),0);
  await click('[data-level="1"]');await active();assert.equal(await ev(`document.querySelectorAll('.normal-puzzle-canvas').length`),1);
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await click('[data-jar="0"]');await click('[data-jar="2"]');await idle();
 check('six navigation/disposal cycles and reduced-motion transfer work');
 assert.equal(await ev(`localStorage.getItem('${other}')`),'other-deployment-sentinel');assert.equal(await ev(`localStorage.getItem('tea-shop-progress-v1')`),'classic-sentinel');
 assert.deepEqual(errors,[]);check('other deployment/classic saves remain untouched; zero runtime exceptions');
} finally {
 await send('Fetch.disable');await send('Network.setBlockedURLs',{urls:[]});
 await send('Emulation.setEmulatedMedia',{features:[]});await clearStart();
 await fs.writeFile('work/normal-3d-check.json',JSON.stringify({url,checks,errors},null,2));ws.close();
}
