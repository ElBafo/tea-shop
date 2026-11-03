let clearReturningStart = async () => {};
import { installReturningPlayerStart } from './browser-start.mjs';
// Browser regression check. Requires Vite at 127.0.0.1:5174 with base /tea-shop/preview/
// and Chromium remote debugging on 127.0.0.1:9224. Run with Node 22 or newer.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
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





const pause=(ms=500)=>new Promise(r=>setTimeout(r,ms));
const tap=async selector=>{
 if(selector.startsWith('[data-filter') && await evaluate(`Boolean(document.querySelector('.has-selection'))`)) await tap('[data-act="browse"]');
 const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await touch({type:'mousePressed',...p});await touch({type:'mouseReleased',...p});await pause(160);
};
const shot=async name=>fs.writeFile('work/depth-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const seed={muted:true,bestStars:Array(38).fill(3),bestMoves:Array(38).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:true}};
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/'});await pause(1800);
const reload=async value=>{
 await evaluate(`localStorage.setItem('tea-shop-progress-v1',${JSON.stringify(JSON.stringify(value))});localStorage.setItem('tea-shop-progress-v1:guide-v1','done');localStorage.removeItem('tea-shop-progress-v1:puzzle-v1')`);
 await send('Page.reload');await pause(1800);
};
await reload(seed);await tap('#edit-toggle');
for(const id of ['terrarium','botanical','cabinet']){
 await tap(`[data-upgrade="${id}"]`);
 for(let style=0;style<3;style++){
  await tap(`[data-act="preview"][data-style="${style}"]`);await pause(200);await shot(`${id}-${style}`);
 }
 await tap('[data-act="buy"]');
 assert.equal(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop.style.${id}`),2);
 await tap('[data-act="browse"]');await tap('[data-filter="all"]');
}
assert.equal(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop.owned.length`),3);
await tap('[data-filter="owned"]');await tap('[data-upgrade="cabinet"]');
for(const [width,height,name] of [[320,740,'small'],[390,844,'phone'],[844,390,'landscape'],[1200,900,'desktop']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await pause(400);await shot('editor-'+name);
 assert.equal(await evaluate(`(()=>{const b=document.querySelector('[data-act="rotate"]').getBoundingClientRect();return b.height>=40&&b.bottom<=innerHeight&&b.top>=0;})()`),true,'rotate stays visible');
 assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,'no page horizontal overflow');
}
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
seed.bestStars.fill(0);await reload(seed);await tap('#edit-toggle');await tap('[data-upgrade="cabinet"]');
assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').disabled`),true);await shot('locked-preview');
await tap('#edit-toggle');await tap('#play-tea');await shot('chapters');await tap('.continue-card');await tap('[data-jar="0"]');await tap('[data-jar="2"]');await pause(500);
assert.equal(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1:puzzle-v1')).actions.length`),1);
await send('Page.reload');await pause(1800);await tap('[data-resume-shop]');
assert.equal(await evaluate(`document.querySelector('.moves').textContent`),'1 move');
await tap('#undo');assert.equal(await evaluate(`document.querySelector('.moves').textContent`),'0 moves');
await tap('[data-go="levels"]');await shot('resume');await tap('[data-go="shop"]');
await tap('.settings-menu summary');await tap('#backup-progress');await shot('backups');
const before=await evaluate(`localStorage.getItem('tea-shop-progress-v1')`);
const file=async text=>evaluate(`(()=>{const input=document.querySelector('[data-import]'),dt=new DataTransfer();dt.items.add(new File([${JSON.stringify(text)}],'backup.json',{type:'application/json'}));input.files=dt.files;input.dispatchEvent(new Event('change'));})()`);
await file('{broken');await pause();assert.equal(await evaluate(`localStorage.getItem('tea-shop-progress-v1')`),before);
seed.bestStars.fill(3);seed.shop.owned=['terrarium'];seed.shop.style={terrarium:1};
await file(JSON.stringify({format:'decopu-save',version:1,exportedAt:new Date().toISOString(),progress:seed,puzzle:null}));await pause();
assert.equal(await evaluate(`localStorage.getItem('tea-shop-progress-v1')`),before,'choosing a file never replaces progress');await shot('restore-confirm');
await tap('[data-restore]');await pause(1800);
assert.equal(await evaluate(`JSON.parse(localStorage.getItem('tea-shop-progress-v1')).shop.style.terrarium`),1);
assert.equal(await evaluate(`localStorage.getItem('tea-shop-progress-v1:puzzle-v1')`),null);

// Complete a chapter from a validated resume log and check the milestone reward.
seed.bestStars=Array.from({length:38},(_,i)=>i<7?1:0);seed.shop={owned:[],stored:[],style:{},place:{},finaleSeen:false};
await reload(seed);
await evaluate(`(async()=>{const {solve}=await import('/tea-shop/preview/src/game/solver.ts');const {LEVELS}=await import('/tea-shop/preview/src/game/levels.ts');const {boardFromLevel}=await import('/tea-shop/preview/src/game/engine.ts');const moves=solve(boardFromLevel(LEVELS[7])).moves;window.__lastMove=moves.at(-1);localStorage.setItem('tea-shop-progress-v1:puzzle-v1',JSON.stringify({version:1,levelId:8,actions:moves.slice(0,-1).map(m=>[m.from,m.to])}));})()`);
const last=await evaluate('window.__lastMove');await send('Page.reload');await pause(1800);await tap('[data-resume-shop]');await tap(`[data-jar="${last.from}"]`);await tap(`[data-jar="${last.to}"]`);await pause(1000);
assert.ok(await evaluate(`document.querySelector('.milestone-reward').textContent.includes('Glass garden')`));
assert.ok(await evaluate(`document.querySelector('.result-reward').textContent.includes('+7')`),'first chapter includes its four bonus stars');
assert.equal(await evaluate(`localStorage.getItem('tea-shop-progress-v1:puzzle-v1')`),null);await shot('milestone');
seed.bestStars.fill(3);seed.shop.owned=['counter','sign','paint','shelves','plant','rug','lamp'];
await reload(seed);await tap('#edit-toggle');await tap('[data-filter="all"]');await tap('[data-upgrade="table"]');await tap('[data-act="buy"]');await shot('shop-complete');await tap('[data-finale-showcase]');
assert.equal(await evaluate(`document.querySelector('.shop-room').classList.contains('showcasing')`),true);
assert.equal(await evaluate(`document.querySelector('.shop-room').classList.contains('decorating')`),false);
await send('Page.navigate',{url:'http://127.0.0.1:5174/tea-shop/preview/?showroom=1'});await pause(2000);if(await evaluate(`document.querySelector('.shop-room').classList.contains('is-night')`))await tap('#theme-toggle');await shot('collection-day');await tap('#theme-toggle');await shot('collection-night');
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:900,deviceScaleFactor:1,mobile:false});await pause(500);await shot('collection-desktop');
assert.deepEqual(errors,[]);
console.log('New collection previews/purchases, milestone lock, responsive editor, resume/undo, validated import confirmation and restore passed.');
await clearReturningStart();ws.close();
