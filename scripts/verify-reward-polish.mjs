// Isolated Chromium (default CDP 9251) and the development preview on 5174.
// Uses a fresh synthetic profile and real touch input; Node 22+.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9233}/json`)).json();
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
const shot=async name=>fs.writeFile('work/reward-polish-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));

const url='http://127.0.0.1:5174/tea-shop/preview/?edition=2';
const key='tea-shop-preview-edition2-progress-v1';
const ready=async()=>{await until(`document.querySelector('#launch-start')?.disabled===false`);await tap('#launch-start');};
const saved=()=>evaluate(`JSON.parse(localStorage.getItem('${key}'))`);
const idle=()=>until(`document.querySelector('.shelves')?.getAttribute('aria-busy')==='false'`);
const solve=level=>evaluate(`(async()=>{const {EDITION_LEVELS}=await import('/tea-shop/preview/src/game/edition-levels.ts');const {boardFromLevel}=await import('/tea-shop/preview/src/game/engine.ts');const {solve}=await import('/tea-shop/preview/src/game/solver.ts');return solve(boardFromLevel(EDITION_LEVELS[${level-1}])).moves.map(m=>[m.from,m.to]);})()`);
const seed=async(level,stars,goal={id:'counter',style:1})=>{
 const moves=await solve(level);const progress={muted:true,bestStars:Array.from({length:24},(_,i)=>stars[i]??0),bestMoves:Array(24).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:false}};
 await evaluate(`localStorage.clear();localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(progress))});localStorage.setItem('${key}:guide-v1','done');localStorage.setItem('${key}:goal-v1',${JSON.stringify(JSON.stringify(goal))});localStorage.setItem('${key}:puzzle-v1',${JSON.stringify(JSON.stringify({version:1,levelId:level,actions:moves.slice(0,-1)}))});`);
 await send('Page.reload');await ready();await tap('#play-tea');await until(`!!document.querySelector('.play')`);return moves.at(-1);
};
const finish=async pair=>{await tap(`[data-jar="${pair[0]}"]`);await tap(`[data-jar="${pair[1]}"]`);await until(`!!document.querySelector('.result-overlay')`);};
const check=name=>{checks.push(name);console.log('PASS:',name)};
try{
 await fs.mkdir('work',{recursive:true});await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Page.navigate',{url});await ready();await evaluate(`document.querySelector('[data-welcome-skip]')?.click()`);
 await finish(await seed(1,[]));assert.match(await evaluate(`document.querySelector('.result-reward').textContent`),/\+3/);
 assert.equal(await evaluate(`document.querySelector('.reward-track i').style.getPropertyValue('--reward-from')`),'0');
 assert.equal(await evaluate(`document.querySelector('.personal-goal progress').value`),2);
 assert.equal(await evaluate(`document.querySelector('.personal-goal').dataset.reward`),'counter');
 await shot('first-win');const won=await saved();await pause(900);assert.deepEqual(await saved(),won);check('Real first win shows three earned stars and a zero-to-full counter receipt without changing authoritative progress');
 await tap('[data-reward="counter"]');await until(`!!document.querySelector('[data-act="buy"]')`);assert.equal(await evaluate(`document.querySelector('[data-act="preview"][aria-pressed="true"]').dataset.style`),'1');check('Reward card opens the chosen style directly in Edit');
 await finish(await seed(1,[3]));assert.equal(await evaluate(`document.querySelector('.result-card').dataset.earned`),'false');assert.equal(await evaluate(`document.querySelector('.reward-track')`),null);assert.equal(await evaluate(`getComputedStyle(document.querySelector('.result-confetti')).display`),'none');assert.match(await evaluate(`document.querySelector('.result-reward').textContent`),/already collected/);await shot('repeat');check('Repeat win earns nothing and has no savings animation or confetti');
 await finish(await seed(1,[1]));assert.match(await evaluate(`document.querySelector('.result-reward').textContent`),/\+2/);assert.equal(await evaluate(`document.querySelector('.reward-track i').style.getPropertyValue('--reward-from')`),'0.5');check('Improved score shows only the two-star difference and starts the meter at existing savings');
 await finish(await seed(1,[],{id:'basket',style:2}));assert.equal(await evaluate(`document.querySelector('.reward-track')`),null);assert.match(await evaluate(`document.querySelector('.personal-goal').textContent`),/9 more puzzles/);check('Locked goal retains puzzle-unlock progress rather than treating stars as an unlock');
 await finish(await seed(3,[3,3]));assert.equal(await evaluate(`document.querySelector('.result-card').dataset.milestone`),'true');assert.equal(await evaluate(`document.querySelector('#result-title').textContent`),'A little milestone');assert.match(await evaluate(`document.querySelector('.result-reward').textContent`),/\+7/);await shot('milestone');const milestone=await saved();await evaluate(`document.querySelector('[data-jar="0"]').click()`);assert.deepEqual(await saved(),milestone);check('Milestone shows score plus existing bonus exactly once, even after a late jar click');
 for(const [width,height,name] of [[320,568,'small'],[390,844,'phone'],[844,390,'landscape'],[1280,900,'desktop']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});await pause(150);assert.ok(await evaluate(`(()=>{const r=document.querySelector('.result-card').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth})()`));await shot(name);
 }
 check('Milestone receipt fits small/standard phone, landscape and desktop, with scrollable content');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await finish(await seed(1,[]));assert.equal(await evaluate(`getComputedStyle(document.querySelector('.reward-track i')).animationName`),'none');await tap('.result-overlay [data-go="shop"]');await until(`document.querySelector('.shop-room')?.classList.contains('decorating')`);check('Reduced motion presents final savings immediately and Decorate opens Edit');
 const sound=await evaluate(`(async()=>{const ctx=window.AudioContext.prototype;let created=0,disconnected=0,started=0,buffers=0;const originals={};for(const name of ['createBufferSource','createOscillator','createGain','createBiquadFilter','createBuffer']){originals[name]=ctx[name];ctx[name]=function(...args){const n=originals[name].apply(this,args);if(name==='createBuffer'){buffers++;return n;}created++;const old=n.disconnect.bind(n);n.disconnect=(...a)=>{disconnected++;return old(...a)};if(n.start){const start=n.start.bind(n);n.start=(...a)=>{started++;return start(...a)}}return n;};}try{const {playTeaDrop}=await import('/tea-shop/preview/src/game/audio.ts');await playTeaDrop(true);const muted=created;await playTeaDrop(false);await new Promise(r=>setTimeout(r,300));await playTeaDrop(false);await new Promise(r=>setTimeout(r,300));return{muted,created,disconnected,started,buffers};}finally{for(const name in originals)ctx[name]=originals[name];}})()`);
 assert.equal(sound.muted,0);assert.equal(sound.started,6);assert.equal(sound.created,sound.disconnected);assert.ok(sound.buffers<=1);check('Muted sound allocates nothing; two paper/ceramic cues reuse noise and disconnect all created nodes');
 assert.deepEqual(errors,[]);await fs.writeFile('work/reward-polish-check.json',JSON.stringify({passed:true,checks,errors,sound,physicalPhone:false},null,2));
}catch(error){await shot('failure').catch(()=>{});await fs.writeFile('work/reward-polish-check.json',JSON.stringify({passed:false,checks,errors,error:String(error)},null,2));throw error;}finally{ws.close();}
