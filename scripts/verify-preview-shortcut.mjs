import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import path from 'node:path';

// Run after npm run build -- --base=/tea-shop/preview/ --outDir=work/shortcut-build
const manifest=JSON.parse(await fs.readFile('work/shortcut-build/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'/tea-shop/preview/');
assert.equal(manifest.scope,'/tea-shop/preview/');
assert.equal(manifest.short_name,'Decopu Preview');
const base='/tea-shop/preview/',origin='http://127.0.0.1:5196',cdp=9262;
const key='tea-shop-preview-edition2-progress-v1',appearance='tea-shop-preview-edition2-appearance-v1';
const checks=[],errors=[],evidence={version:'0.3.0-preview.4',origin,disposableProfile:true,syntheticSave:true,checks,errors};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp('/tmp/decopu-preview-shortcut-');
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,origin).pathname;
    if(!pathname.startsWith(base)||pathname.includes('..'))throw Error('path');
    const file=pathname.slice(base.length)||'index.html';
    const data=await fs.readFile(path.join('work/shortcut-build',file));
    const type={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]??'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);
  } catch {res.writeHead(404);res.end();}
});
let browser,ws,send,ev;
const log=createWriteStream('work/preview-shortcut.chromium.log');
try {
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(5196,'127.0.0.1',resolve);});
  browser=spawn('/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run','--no-default-browser-check',`--remote-debugging-port=${cdp}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
  browser.stdout.pipe(log);browser.stderr.pipe(log);
  let tab;
  for(let i=0;i<120;i++){
    try{tab=(await(await fetch(`http://127.0.0.1:${cdp}/json`)).json()).find(t=>t.type==='page');if(tab)break;}catch{}
    await pause(250);
  }
  assert.ok(tab,'disposable Chromium starts');
  ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let sequence=0;const pending=new Map();
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
  send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}));});
  ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const page=(fn,...args)=>ev(`(${fn.toString()})(${args.map(a=>JSON.stringify(a)).join(',')})`);
  const until=async(fn,...args)=>{for(let i=0;i<300;i++){try{if(await page(fn,...args))return;}catch(e){if(!/context|navigation/i.test(String(e)))throw e;}await pause(100);}throw Error('Timed out: '+fn);};
  const tap=async selector=>{const p=await page(selector=>{const e=document.querySelector(selector);if(!e||e.disabled||e.closest('[inert]'))throw Error('Unavailable '+selector);e.scrollIntoView({block:'nearest',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},selector);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await pause(35);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(170);};
  const ready=async()=>{await pause(400);await until(()=>document.querySelector('#launch-start')?.disabled===false);};
  const enter=async()=>{await ready();await tap('#launch-start');await until(()=>!!document.querySelector('#shop-canvas'));};
  const snapshot=()=>page(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
  const noDev=()=>page(()=>!document.querySelector('.puzzle-comparison'));
  const shot=async label=>fs.writeFile('work/preview-shortcut.'+label+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Page.navigate',{url:origin+manifest.start_url});await ready();
  evidence.launchVersion=await page(()=>document.querySelector('.launch-version').textContent);
  assert.equal(evidence.launchVersion,'v0.3.0-preview.4 · Second edition');checks.push('Preview launch displays v0.3.0-preview.4 and selects second edition');
  const progress={muted:true,bestStars:[3,...Array(23).fill(0)],bestMoves:[3,...Array(23).fill(0)],shop:{owned:['counter'],stored:[],style:{counter:1},place:{counter:{x:1,z:1,rot:0}},finaleSeen:false}};
  const resume={version:1,levelId:2,actions:[[1,2]]};
  await page((key,appearance,progress,resume)=>{
    localStorage.setItem(key,JSON.stringify(progress));localStorage.setItem(key+':recovery',JSON.stringify(progress));
    localStorage.setItem(key+':guide-v1','done');localStorage.setItem(key+':goal-v1',JSON.stringify({id:'lamp',style:2}));
    localStorage.setItem(key+':puzzle-v1',JSON.stringify(resume));localStorage.setItem(appearance,'night');
    localStorage.setItem('tea-shop-progress-v1','classic-sentinel');localStorage.setItem('tea-shop-edition2-progress-v1','production-sentinel');localStorage.setItem('release-smoke-unrelated','keep');
  },key,appearance,progress,resume);
  const before=await snapshot();
  await send('Page.navigate',{url:origin+manifest.start_url});await enter();
  assert.equal(await page(()=>document.body.classList.contains('edition-two')),true);
  assert.equal(await noDev(),true);assert.deepEqual(await snapshot(),before);
  assert.equal(await page(()=>document.querySelector('.build-version').textContent),'Decopu · v0.3.0-preview.4');
  assert.equal(await page(()=>Number(document.querySelector('#shop-stars strong').textContent)),1);
  assert.equal(await page(()=>document.documentElement.classList.contains('shop-night')),true);
  await tap('.settings-menu summary');assert.equal(await page(()=>!!document.querySelector('#reset-preview')),true);await tap('.settings-menu summary');
  checks.push('Existing score, purchase/layout/style, goal, recovery, appearance and unrelated/production storage survive loading; 3D comparison remains absent');
  await shot('shop');await tap('#play-tea');
  assert.equal(await page(()=>document.querySelector('.play h2').textContent),'A Little Space');
  assert.equal(await page(()=>document.querySelector('.moves').textContent),'1 move');
  assert.equal(await page(()=>document.querySelector('#undo').disabled),false);
  assert.deepEqual(await snapshot(),before);await shot('resume');
  await send('Page.reload');await enter();await tap('#play-tea');
  assert.equal(await page(()=>document.querySelector('.moves').textContent),'1 move');assert.deepEqual(await snapshot(),before);
  await tap('#undo');assert.equal(await page(()=>document.querySelector('.moves').textContent),'0 moves');
  assert.deepEqual(await page(key=>JSON.parse(localStorage.getItem(key)),key+':puzzle-v1'),{version:1,levelId:2,actions:[]});
  const expectedAfterUndo={...before,[key+':puzzle-v1']:JSON.stringify({version:1,levelId:2,actions:[]})};
  assert.deepEqual(await snapshot(),expectedAfterUndo);
  await send('Page.reload');await enter();await tap('#play-tea');assert.equal(await page(()=>document.querySelector('.moves').textContent),'0 moves');
  assert.deepEqual(await snapshot(),expectedAfterUndo);checks.push('Saved unfinished level resumes after reload; restored Undo updates only its move log and persists across another reload');
  await tap('[data-go="levels"]');await tap('[data-go="shop"]');assert.equal(await noDev(),true);assert.equal(await page(()=>Number(document.querySelector('#shop-stars strong').textContent)),1);
  await send('Page.navigate',{url:origin+base+'?edition=2'});await enter();
  assert.deepEqual(await snapshot(),expectedAfterUndo);
  assert.equal(await page(()=>Number(document.querySelector('#shop-stars strong').textContent)),1);
  assert.equal(await page(async()=>!navigator.serviceWorker.controller&&(await navigator.serviceWorker.getRegistrations()).length===0),true);
  checks.push('Actual manifest start_url opens current edition; edition=2 alias shares the same saved progress; normal preview has no service worker');
  await send('Page.navigate',{url:origin+base+'?edition=1'});await ready();
  assert.equal(await page(()=>document.body.classList.contains('edition-two')),false);
  const classicSnapshot=await snapshot();
  for(const [k,v] of Object.entries(expectedAfterUndo))assert.equal(classicSnapshot[k],v,'Classic tooling preserves '+k);
  checks.push('Explicit edition=1 retains classic tooling without overwriting existing preview or production progress');
  assert.deepEqual(errors,[]);evidence.passed=true;evidence.viewport={width:390,height:844};evidence.balance=1;evidence.restoredLevel=2;evidence.storagePreserved=true;
  console.log('PASS: built ordinary preview 0.3.0-preview.4; existing preview progress/preferences/goals retained; saved puzzle reload and Undo; comparison absent on normal preview route; zero runtime exceptions.');
} catch(error) {
  evidence.passed=false;evidence.error=String(error);evidence.stack=error.stack;
  if(ev)evidence.screen=await ev('document.body.innerText').catch(()=>null);
  if(send)await fs.writeFile('work/preview-shortcut.failure.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64')).catch(()=>{});
  console.error(error);process.exitCode=1;
} finally {
  await fs.writeFile('work/preview-shortcut.json',JSON.stringify(evidence,null,2));
  ws?.close();browser?.kill('SIGTERM');server.close();
  await pause(300);browser?.kill('SIGKILL');log.end();
}
