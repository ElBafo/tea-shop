import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import path from 'node:path';

// Run after npm run build -- --base=/tea-shop/preview/ --outDir=work/access-build
const buildDir=process.env.ACCESS_BUILD ?? 'work/access-build';
const manifest=JSON.parse(await fs.readFile(buildDir+'/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'/tea-shop/preview/');
assert.equal(manifest.scope,'/tea-shop/preview/');
assert.equal(manifest.short_name,'Decopu Preview');
const base='/tea-shop/preview/',origin='http://127.0.0.1:5196',cdp=9262;
const key='tea-shop-preview-edition2-progress-v1',appearance='tea-shop-preview-edition2-appearance-v1';
const checks=[],errors=[],evidence={version:'0.3.0-preview.10',origin,disposableProfile:true,syntheticSave:true,checks,errors};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp('/tmp/decopu-editor-access-');
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,origin).pathname;
    if(!pathname.startsWith(base)||pathname.includes('..'))throw Error('path');
    const file=pathname.slice(base.length)||'index.html';
    const data=await fs.readFile(path.join(buildDir,file));
    const type={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]??'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);
  } catch {res.writeHead(404);res.end();}
});
let browser,ws,send,ev;
const log=createWriteStream('work/editor-access.chromium.log');
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
  
  const shot=async label=>fs.writeFile('work/editor-access.'+label+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Page.navigate',{url:origin+manifest.start_url});await ready();
  const make=(count=0)=>({muted:true,bestStars:Array.from({length:24},(_,i)=>i<count?3:0),bestMoves:Array(24).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:true}});
  const seed=async(progress,night=false)=>{
    await page((key,appearance,progress,night)=>{localStorage.setItem(key,JSON.stringify(progress));localStorage.setItem(key+':recovery',JSON.stringify(progress));localStorage.setItem(key+':guide-v1','done');localStorage.removeItem(key+':goal-v1');localStorage.removeItem(key+':puzzle-v1');localStorage.setItem(appearance,night?'night':'day');localStorage.setItem('tea-shop-edition2-progress-v1','production-sentinel');},key,appearance,progress,night);
    await send('Page.navigate',{url:origin+manifest.start_url});await enter();await tap('#edit-toggle');await pause(350);
  };
  const saved=()=>page(key=>JSON.parse(localStorage.getItem(key)),key);
  const keypress=async(key,shift=false)=>{const code=key==='Enter'?13:key==='Tab'?9:27;for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code:key,windowsVirtualKeyCode:code,modifiers:shift?8:0,...(key==='Enter'&&type==='keyDown'?{text:'\r',unmodifiedText:'\r'}:{})});await pause(150);};
  const activate=async selector=>{await page(selector=>document.querySelector(selector).focus(),selector);await keypress('Enter');};
  const active=()=>page(()=>({id:document.activeElement.id,act:document.activeElement.dataset.act,upgrade:document.activeElement.dataset.upgrade,style:document.activeElement.dataset.style,visible:!!document.activeElement.getClientRects().length&&!document.activeElement.closest('[inert]')}));
  await seed(make(6));await activate('[data-upgrade="counter"]');
  assert.equal((await active()).act,'preview','Selecting a card focuses its visible style');
  await activate('[data-act="preview"][data-style="2"]');assert.equal((await active()).style,'2');
  await activate('[data-act="cancel-preview"]');assert.equal((await active()).upgrade,'counter');
  await activate('[data-upgrade="counter"]');await activate('[data-act="buy"]');assert.equal((await active()).act,'style');
  assert.deepEqual((await saved()).shop.owned,['counter']);
  await activate('[data-act="store"]');assert.equal((await active()).act,'place');
  await activate('[data-act="place"]');assert.equal((await active()).act,'store');
  await activate('#editor-back');assert.equal((await active()).upgrade,'counter');
  checks.push('Keyboard focus follows card→style, cancel→card, purchase→owned style, Store↔Place and Browse→card');
  for(const [width,height,label] of [[390,844,'phone'],[320,568,'small'],[844,390,'landscape'],[1280,900,'desktop']]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
    const p=make(24);p.shop.owned=['counter','sign','paint','shelves','plant','rug','lamp'];p.shop.finaleSeen=false;
    await seed(p,label==='small');await activate('[data-filter="all"]');await activate('[data-upgrade="table"]');await activate('[data-act="buy"]');
    assert.equal(await page(()=>document.activeElement.hasAttribute('data-finale-showcase')),true);
    assert.equal(await page(()=>document.querySelector('#shop-modal').getAttribute('aria-modal')),'true');
    assert.equal(await page(()=>[...document.querySelector('.shop-room').children].filter(e=>e.id!=='shop-modal').every(e=>e.inert)),true);
    await keypress('Tab',true);assert.equal(await page(()=>document.activeElement.hasAttribute('data-dismiss')),true);
    await keypress('Tab');assert.equal(await page(()=>document.activeElement.hasAttribute('data-finale-showcase')),true);
    await shot(label+'-dialog');
    assert.equal(await page(()=>document.documentElement.scrollWidth>innerWidth),false);
    await keypress('Escape');assert.equal(await page(()=>document.querySelector('#shop-modal').classList.contains('hidden')),true);
    assert.equal((await active()).act,'style');assert.equal((await active()).visible,true);
    assert.deepEqual(await page(()=>{const e=document.activeElement,c=getComputedStyle(e);return {visible:e.matches(':focus-visible'),width:c.outlineWidth,offset:c.outlineOffset};}),{visible:true,width:'3px',offset:'-3px'});
    assert.equal(await page(()=>[...document.querySelector('.shop-room').children].some(e=>e.inert)),false);
    await shot(label+'-returned');
    checks.push(label+': finale focus, Tab/Shift+Tab containment, Escape and editor focus return');
  }
  for(const action of ['data-dismiss','data-finale-showcase']) {
    const p=make(24);p.shop.owned=['counter','sign','paint','shelves','plant','rug','lamp'];p.shop.finaleSeen=false;
    await seed(p);await activate('[data-filter="all"]');await activate('[data-upgrade="table"]');await activate('[data-act="buy"]');
    await page(()=>document.querySelector('#edit-toggle').focus());assert.equal(await page(()=>document.activeElement.closest('#shop-modal')!==null),true);
    await activate('['+action+']');assert.equal(await page(()=>document.querySelector('#shop-modal').classList.contains('hidden')),true);
    if(action==='data-dismiss')assert.equal((await active()).act,'style');
    else {assert.equal((await active()).id,'showcase-back');await activate('#showcase-back');assert.equal(await page(()=>document.activeElement.matches('.settings-menu summary')),true);}
    assert.equal(await page(()=>[...document.querySelector('.shop-room').children].some(e=>e.inert)),false);
  }
  checks.push('Selected styles have a distinct keyboard ring in day/night; completion actions restore editor/showcase focus and background interaction');
  assert.equal(await page(()=>localStorage.getItem('tea-shop-edition2-progress-v1')),'production-sentinel');
  assert.deepEqual(errors,[]);evidence.passed=true;console.log('PASS: '+checks.join('; '));
} catch(error) {
  evidence.passed=false;evidence.error=String(error);evidence.stack=error.stack;
  if(ev)evidence.screen=await ev('document.body.innerText').catch(()=>null);
  if(send)await fs.writeFile('work/editor-access.failure.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64')).catch(()=>{});
  console.error(error);process.exitCode=1;
} finally {
  await fs.writeFile('work/editor-access.json',JSON.stringify(evidence,null,2));
  ws?.close();browser?.kill('SIGTERM');server.close();
  await pause(300);browser?.kill('SIGKILL');log.end();
}
