import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import path from 'node:path';

// Run after npm run build -- --base=/tea-shop/preview/ --outDir=work/editor-build
const buildDir=process.env.EDITOR_BUILD ?? 'work/editor-build';
const baseline=process.env.EDITOR_BASELINE==='1';
const manifest=JSON.parse(await fs.readFile(buildDir+'/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'/tea-shop/preview/');
assert.equal(manifest.scope,'/tea-shop/preview/');
assert.equal(manifest.short_name,'Decopu Preview');
const base='/tea-shop/preview/',origin='http://127.0.0.1:5196',cdp=9262;
const key='tea-shop-preview-edition2-progress-v1',appearance='tea-shop-preview-edition2-appearance-v1';
const checks=[],errors=[],evidence={version:'0.3.0-preview.6',origin,disposableProfile:true,syntheticSave:true,checks,errors};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp('/tmp/decopu-editor-redesign-');
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
const log=createWriteStream('work/editor-redesign.chromium.log');
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
  
  const shot=async label=>fs.writeFile('work/editor-redesign.'+label+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
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
  const balance=()=>page(()=>Number(document.querySelector('#shop-stars strong').textContent));
  const choose=async(id,style=0)=>{await tap(`[data-upgrade="${id}"]`);await tap(`[data-act="preview"][data-style="${style}"]`);};
  const visible=async(selector)=>page(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth+.5&&r.top>=0&&r.bottom<=innerHeight+.5;},selector);
  await seed(make(6));await shot(baseline?'before-browse':'browse');await choose('counter',1);await shot(baseline?'before-preview':'preview');
  if(!baseline){
    const untouched=await saved();const initialBalance=await balance();
    assert.equal(await page(()=>document.querySelector('[data-act="preview"][aria-pressed="true"]').dataset.style),'1');
    assert.ok(await visible('[data-act="buy"]'));assert.ok(await visible('#editor-back'));assert.ok(await visible('[data-act="cancel-preview"]'));
    await tap('[data-act="cancel-preview"]');assert.deepEqual(await saved(),untouched);
    assert.equal(await page(()=>document.querySelectorAll('[data-upgrade]').length),18);
    await choose('counter',2);await tap('[data-act="buy"]');
    assert.equal(await balance(),initialBalance-2);assert.deepEqual((await saved()).shop.owned,['counter']);assert.equal((await saved()).shop.style.counter,2);
    assert.equal(await page(()=>document.querySelectorAll('[data-act="buy"]').length),0);
    await tap('[data-act="style"][data-style="1"]');assert.equal((await saved()).shop.style.counter,1);assert.equal(await balance(),initialBalance-2);
    await tap('[data-act="rotate"]');await tap('#undo-move');await tap('[data-act="store"]');assert.deepEqual((await saved()).shop.stored,['counter']);
    await tap('[data-act="place"]');assert.deepEqual((await saved()).shop.stored,[]);await shot('owned');
    await tap('#editor-back');assert.equal(await page(()=>document.querySelectorAll('[data-upgrade]').length),1);
    await tap('[data-filter="all"]');assert.equal(await page(()=>!!document.querySelector('[data-upgrade="counter"]')),false);
    checks.push('Named style preview/cancel preserves progress; one exact purchase; owned free styles, rotate/Undo and store/place work without leaving Edit; owned pieces stay out of the shop catalogue');
    await seed(make(0));const empty=await snapshot();await choose('counter',2);
    assert.equal(await page(()=>document.querySelector('[data-act="buy"]').disabled),true);assert.match(await page(()=>document.querySelector('.purchase-summary').textContent),/2 more stars/);
    await tap('[data-act="cancel-preview"]');assert.deepEqual(await snapshot(),empty);await shot('unaffordable-browse');
    await seed(make(2));const locked=await saved();await choose('bench',2);assert.equal(await page(()=>document.querySelector('[data-act="buy"]').disabled),true);
    assert.match(await page(()=>document.querySelector('.purchase-summary').textContent),/Complete 3 puzzles/);await shot('locked');
    await tap('[data-act="pin-goal"]');await tap('#edit-toggle');await tap('.reward-card');assert.equal(await page(()=>document.querySelector('[data-act="preview"][aria-pressed="true"]').dataset.style),'2');assert.deepEqual(await saved(),locked);
    checks.push('Unaffordable and locked styles remain free previews; goal retains its selected style and cannot bypass unlocks');
    await seed(make(3));const refundBalance=await balance();await choose('bench',2);await tap('[data-act="buy"]');await tap('[data-act="return"]');await tap('[data-cancel-return]');assert.ok((await saved()).shop.owned.includes('bench'));
    await tap('[data-act="return"]');await tap('[data-confirm-return]');assert.equal(await balance(),refundBalance);assert.equal((await saved()).shop.owned.includes('bench'),false);
    checks.push('Optional item return still requires confirmation and restores its exact star price');
    const geometry=[];
    for(const [width,height,name] of [[390,844,'phone'],[320,568,'small'],[844,390,'landscape'],[1280,900,'desktop']]){
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});
      for(const night of [false,true]){
        await seed(make(6),night);await shot(name+(night?'-night-browse':'-browse'));await choose('counter',1);
        for(const selector of ['#editor-back','#tray-toggle','[data-act="buy"]','[data-act="cancel-preview"]'])assert.ok(await visible(selector),`${name} ${night} visible ${selector}`);
        const g=await page(()=>({overflow:document.documentElement.scrollWidth>innerWidth,canvas:document.querySelector('#shop-canvas').getBoundingClientRect().height,bar:document.querySelector('.purchase-row').getBoundingClientRect().bottom,roomHeight:document.querySelector('.shop-room').clientHeight,roomScroll:document.querySelector('.shop-room').scrollHeight}));
        if(night)assert.ok(await page(()=>[...document.querySelectorAll('.style-row .style-chip')].every(button=>{const css=getComputedStyle(button);const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};const a=luminance(css.color),b=luminance(css.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5;})),'Night style labels have readable contrast');
        assert.equal(g.overflow,false);assert.ok(g.canvas>=100);assert.ok(g.roomScroll<=g.roomHeight+1);geometry.push({width,height,night,...g});await shot(name+(night?'-night-preview':'-preview'));
        await tap('#tray-toggle');assert.equal(await page(()=>document.querySelector('#editor-body').inert),true);await tap('#tray-toggle');assert.ok(await visible('[data-act="buy"]'));
      }
    }
    evidence.geometry=geometry;checks.push('Phone, small phone, landscape and desktop day/night keep Browse, Hide, Cancel and Buy visible; hide/show retains the draft');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await seed(make(6));
    await choose('counter');await page(()=>document.querySelector('[data-act="preview"][data-style="2"]').focus());
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await pause(250);
    assert.equal(await page(()=>document.activeElement.dataset.style),'2');assert.equal(await page(()=>document.activeElement.getAttribute('aria-pressed')),'true');
    await tap('[data-act="buy"]');const bought=await saved();await tap('#edit-toggle');await send('Page.reload');await enter();await tap('#edit-toggle');await tap('[data-upgrade="counter"]');assert.deepEqual(await saved(),bought);assert.equal(await page(()=>document.querySelector('[data-act="style"][aria-pressed="true"]').dataset.style),'2');
    assert.equal(await page(()=>localStorage.getItem('tea-shop-edition2-progress-v1')),'production-sentinel');checks.push('Keyboard style selection retains focus; purchases and chosen style survive reload; production save stays untouched');
    await seed(make(1));await tap('#edit-toggle');
    await page(key=>localStorage.setItem(key+':guide-v1','decorate'),key);await send('Page.reload');await enter();await tap('#edit-toggle');await choose('counter',1);
    assert.ok(await visible('[data-act="buy"]'));await tap('[data-act="buy"]');assert.equal((await saved()).shop.style.counter,1);assert.equal(await page(key=>localStorage.getItem(key+':guide-v1'),key),'arrange');
    await shot('guided-purchase');checks.push('First-decoration guide keeps Buy reachable and advances to arrangement after a real purchase');
  }
  assert.deepEqual(errors,[]);evidence.passed=true;console.log('PASS: '+(baseline?'editor baseline captures':'editor redesign flows, pricing, storage, keyboard and responsive states'));
} catch(error) {
  evidence.passed=false;evidence.error=String(error);evidence.stack=error.stack;
  if(ev)evidence.screen=await ev('document.body.innerText').catch(()=>null);
  if(send)await fs.writeFile('work/editor-redesign.failure.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64')).catch(()=>{});
  console.error(error);process.exitCode=1;
} finally {
  await fs.writeFile('work/editor-redesign.json',JSON.stringify(evidence,null,2));
  ws?.close();browser?.kill('SIGTERM');server.close();
  await pause(300);browser?.kill('SIGKILL');log.end();
}
