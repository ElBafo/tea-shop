// Isolated Chromium (default CDP 9251) and the development preview on 5174.
// Uses a fresh synthetic profile and real touch input; Node 22+.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9251}/json`)).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),errors=[],checks=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}))});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const until=async expression=>{for(let i=0;i<150;i++){if(await evaluate(expression))return;await pause(100)}throw Error('Timed out: '+expression)};
const point=selector=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||e.closest('[inert]'))throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
const touch=(type,points=[])=>send('Input.dispatchTouchEvent',{type,touchPoints:points.map(p=>({...p,id:1}))});
const tap=async selector=>{const p=await point(selector);await touch('touchStart',[p]);await pause(35);await touch('touchEnd');await pause(160)};
const shot=async name=>fs.writeFile('work/visual-guide-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const url=process.env.PREVIEW_URL ?? 'http://127.0.0.1:5174/tea-shop/preview/?edition=2';
const open=async(tour=false)=>{await send('Page.navigate',{url:url+(tour?'&tour=1':'')});await pause(600);await until(`document.querySelector('#launch-start')?.disabled===false`);await tap('#launch-start');await until(`!!document.querySelector('[data-guide-start]')`);await tap('[data-guide-start]');await until(`!!document.querySelector('.puzzle-hand-guide')`)};
const idle=()=>until(`document.querySelector('.shelves')?.getAttribute('aria-busy')==='false'`);
const drag=async(from,to,inspect)=>{
 const a=await point(`[data-jar="${from}"]`),b=await point(`[data-jar="${to}"]`);
 // A complete browser-native touch gesture prevents a synthetic fling from
 // swallowing the next tap. Raw dispatchTouchEvent drags reproduce that driver
 // behaviour even on static HTML with no app handlers or DOM replacement.
 const gesture=send('Input.synthesizeScrollGesture',{x:a.x,y:a.y,xDistance:b.x-a.x,yDistance:b.y-a.y,speed:600,gestureSourceType:'touch',preventFling:true});
 if(inspect){await pause(100);await inspect();}
 await gesture;await idle();
};
const step=()=>evaluate(`(()=>{const e=document.querySelector('.puzzle-hand-guide');return{from:Number(e.dataset.guideFrom),to:Number(e.dataset.guideTo),mode:e.className,text:e.querySelector('.puzzle-guide-bubble').textContent}})()`);
const geometry=()=>evaluate(`(()=>{const shelf=document.querySelector('.shelves').getBoundingClientRect(), bubble=document.querySelector('.puzzle-guide-bubble').getBoundingClientRect(),hand=document.querySelector('.puzzle-guide-hand').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth,shelfOverflow:document.querySelector('.shelves').scrollHeight>document.querySelector('.shelves').clientHeight+1,bubbleFits:bubble.x>=shelf.x&&bubble.right<=shelf.right&&bubble.y>=shelf.y&&bubble.bottom<=shelf.bottom,passThrough:getComputedStyle(document.querySelector('.puzzle-hand-guide')).pointerEvents==='none',animations:document.querySelector('.puzzle-hand-guide').getAnimations({subtree:true}).length,hand:{x:hand.x,y:hand.y}}})()`);
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
const traceScript = await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__guideTrace=[];for(const name of ['pointerdown','pointerup','pointercancel','click'])document.addEventListener(name,e=>{window.__guideTrace.push({name,id:e.pointerId,detail:e.detail,x:e.clientX,y:e.clientY,target:e.target.closest?.('[data-jar]')?.dataset.jar??e.target.id,prevented:e.defaultPrevented,time:performance.now()});},true);`});
try{
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await send('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5174',storageTypes:'all'});await open();
 assert.deepEqual((({from,to})=>({from,to}))(await step()),{from:0,to:2});
 const initial=await geometry();assert.ok(initial.bubbleFits&&initial.passThrough&&!initial.overflow&&!initial.shelfOverflow);assert.ok(initial.animations>0);
 assert.ok(await evaluate(`document.querySelector('.puzzle-guide-instruction').textContent.includes('jar 1 to jar 3')`),'the visual instruction has accessible text');
 await shot('phone-drag');await tap('[data-jar="0"]');assert.match((await step()).mode,/guide-tap/);assert.equal((await step()).text,'Tap here');await shot('phone-tap');
 await drag(0,2,async()=>assert.equal(await evaluate(`getComputedStyle(document.querySelector('.puzzle-hand-guide')).visibility`),'hidden'));
 assert.deepEqual((({from,to})=>({from,to}))(await step()),{from:1,to:0});
 await drag(1,0);assert.deepEqual((({from,to})=>({from,to}))(await step()),{from:1,to:2});
 await drag(1,2);await until(`!!document.querySelector('.result-overlay')`);
 assert.equal(await evaluate(`document.querySelectorAll('.puzzle-hand-guide').length`),0);assert.equal(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-preview-edition2-progress-v1')).bestStars[0]`),3);
 checks.push('Fresh welcome → visual source/target → three real drags complete the puzzle; guide disappears after win');
 await open(true);await tap('[data-jar="0"]');await tap('[data-jar="2"]');await idle();
 await tap('[data-jar="0"]');assert.equal((await step()).text,'Try dragging these');assert.equal((await step()).from,1);await shot('alternative');
 await tap('[data-jar="1"]');await tap('[data-jar="0"]');await idle();assert.deepEqual((({from,to})=>({from,to}))(await step()),{from:1,to:2});
 await tap('[data-jar="1"]');await tap('[data-jar="2"]');await until(`!!document.querySelector('.result-overlay')`);assert.equal(await evaluate(`document.querySelectorAll('.puzzle-hand-guide').length`),0);checks.push('Tap guidance handles an unhelpful source selection, follows each legal step and completes the puzzle');
 for(const [width,height,name] of [[320,568,'small'],[390,844,'phone'],[844,390,'landscape'],[1280,900,'desktop']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await open(true);await pause(180);
  const g=await geometry();assert.ok(g.bubbleFits&&g.passThrough&&!g.overflow&&!g.shelfOverflow,name+' guide stays inside usable board');
  assert.ok(await evaluate(`[...document.querySelectorAll('[data-jar],.play-bar button')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})`));
  await shot(name);await tap('[data-guide-skip]');assert.equal(await evaluate(`document.querySelectorAll('.puzzle-hand-guide,.puzzle-guide-instruction').length`),0);checks.push(name+' visual guide fits and Skip removes artwork and accessible text');
 }
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await open(true);await pause(100);
 assert.equal((await geometry()).animations,0);await shot('reduced');await tap('[data-jar="0"]');assert.equal((await geometry()).animations,0);assert.equal((await step()).text,'Tap here');checks.push('Reduced motion retains static source/target hand without looping animations');
 await evaluate(`document.querySelector('.shelves').style.flex='0 0 140px'`);await pause(100);const scrollHeight=await evaluate(`document.querySelector('.shelves').scrollHeight`);
 await evaluate(`document.querySelector('.shelves').scrollTop=30`);await pause(100);
 assert.equal(await evaluate(`document.querySelector('.shelves').scrollHeight`),scrollHeight,'overlay does not enlarge scrolling content');
 assert.ok(await evaluate(`(()=>{const s=document.querySelector('.shelves'),o=document.querySelector('.puzzle-hand-guide'),r=s.getBoundingClientRect(),a=o.getBoundingClientRect();return Math.abs(a.left-r.left-s.clientLeft)<1&&Math.abs(a.top-r.top-s.clientTop)<1&&a.width===s.clientWidth&&a.height===s.clientHeight})()`),'overlay stays pinned to shelf viewport while content scrolls');checks.push('Scroll geometry stays pinned without growing shelf');
 await send('Emulation.setEmulatedMedia',{features:[]});await tap('[data-go="levels"]');assert.equal(await evaluate(`document.querySelectorAll('.puzzle-hand-guide,.puzzle-guide-instruction').length`),0);checks.push('Navigation disposes visual guide and accessible text');
 await open(true);await tap('[data-jar="0"]');await drag(0,2);await tap('[data-jar="0"]');assert.equal((await step()).text,'Try dragging these','normal tap works immediately after a guided drag');checks.push('Immediate tap-selection after a guided drag');
 assert.deepEqual(errors,[]);await fs.writeFile('work/visual-guide-check.json',JSON.stringify({passed:true,checks,errors,physicalIPhoneTested:false},null,2));console.log('PASS:',checks);
}catch(error){await shot('failure').catch(()=>{});await fs.writeFile('work/visual-guide-check.json',JSON.stringify({passed:false,checks,errors,error:String(error)},null,2));await fs.writeFile('work/visual-guide-event-trace.json',JSON.stringify(await evaluate('window.__guideTrace'),null,2));throw error}finally{await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:traceScript.identifier});ws.close()}
