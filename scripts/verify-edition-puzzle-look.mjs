// Requires preview Vite on5174 and an isolated Chromium CDP port (default9233).
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir('work', {recursive:true});
import { installReturningPlayerStart } from './browser-start.mjs';
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9233}/json`)).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const until=async expression=>{for(let i=0;i<150;i++){if(await evaluate(expression))return;await pause(100)}throw Error('Timed out '+expression)};
const tap=async selector=>{const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(220)};
const shot=async name=>fs.writeFile('work/edition-puzzle-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
await send('Runtime.enable');await send('Page.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});const clear=await installReturningPlayerStart(send);
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?edition=2'});await pause(1000);await until(`!!document.querySelector('#play-tea')&&!document.querySelector('#launch-screen')`);
await evaluate(`localStorage.setItem('tea-shop-preview-edition2-progress-v1',JSON.stringify({muted:true,bestStars:Array(10).fill(3),bestMoves:Array(10).fill(0),shop:{owned:[],stored:[],place:{},style:{},finaleSeen:true}}));localStorage.setItem('tea-shop-preview-edition2-progress-v1:guide-v1','done');localStorage.removeItem('tea-shop-preview-edition2-progress-v1:puzzle-v1')`);
await send('Page.reload');await pause(1200);await until(`!!document.querySelector('#play-tea')&&!document.querySelector('#launch-screen')`);await tap('#play-tea');
if(await evaluate(`!!document.querySelector('.play')`))await tap('[data-go="levels"]');
await evaluate(`document.querySelectorAll('.puzzle-chapter').forEach(e=>e.open=true)`);await tap('[data-level="1"]');
const pos=()=>evaluate(`JSON.stringify([0,1].map(i=>{const r=document.querySelector('[data-jar="'+i+'"]').getBoundingClientRect();return[r.x,r.y]}))`);
const stationary=await pos();await tap('[data-jar="0"]');assert.equal(await pos(),stationary,'jar containers stay stationary on selection');
await shot('selected-phone');await tap('[data-jar="2"]');await pause(400);assert.equal(await pos(),stationary,'jar containers stay stationary after transfer');
await tap('#undo');await tap('[data-go="levels"]');await evaluate(`document.querySelectorAll('.puzzle-chapter').forEach(e=>e.open=true)`);await tap('[data-level="5"]');
for(const [width,height,name] of [[390,844,'hidden-phone'],[320,568,'hidden-small'],[844,390,'hidden-landscape'],[1280,900,'hidden-desktop']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await pause(350);
 assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.shelves').scrollWidth<=document.querySelector('.shelves').clientWidth`),'no horizontal overflow in page or counter');
 assert.ok(await evaluate(`Array.from(document.querySelectorAll('.mystery')).every(e=>!e.getAttribute('style')&&!e.className.match(/rose|chai|matcha|jasmine/))`),'concealed pieces expose no item color');
 assert.ok(await evaluate(`Array.from(document.querySelectorAll('.mystery .fog')).every(e=>{const f=e.getBoundingClientRect(),s=e.closest('.slot').getBoundingClientRect();return Math.abs(f.x+f.width/2-s.x-s.width/2)<1&&Math.abs(f.y+f.height/2-s.y-s.height/2)<1})`),'frosting stays centered');
 await shot(name);
}
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await tap('[data-jar="0"]');assert.equal(await evaluate(`getComputedStyle(document.querySelector('.jar.selected .slot.held')).transform`),'none');
await send('Emulation.setEmulatedMedia',{features:[]});
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await tap('[data-go="levels"]');await evaluate(`document.querySelectorAll('.puzzle-chapter').forEach(e=>e.open=true)`);await tap('[data-level="1"]');
for(const [from,to] of [[0,2],[1,0],[2,1]]){await tap(`[data-jar="${from}"]`);await tap(`[data-jar="${to}"]`);await pause(450)}
await until(`!!document.querySelector('.result-card')`);await pause(800);await shot('win-phone');
assert.deepEqual(errors,[]);console.log('PASS: second-edition stationary jars, touch transfer/Undo, frosted concealment and centering, responsive phone/small/landscape/desktop and reduced motion.');await clear();ws.close();
