import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import path from 'node:path';

// Run after npm run build -- --base=/tea-shop/preview/ --outDir=work/home-build
const buildDir=process.env.HOME_BUILD ?? 'work/home-build';
const baseline=process.env.HOME_BASELINE==='1';
const manifest=JSON.parse(await fs.readFile(buildDir+'/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'/tea-shop/preview/');
assert.equal(manifest.scope,'/tea-shop/preview/');
assert.equal(manifest.short_name,'Decopu Preview');
const base='/tea-shop/preview/',origin='http://127.0.0.1:5196',cdp=9262;
const key='tea-shop-preview-edition2-progress-v1',appearance='tea-shop-preview-edition2-appearance-v1';
const checks=[],errors=[],evidence={version:'0.3.0-preview.5',origin,disposableProfile:true,syntheticSave:true,checks,errors};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp('/tmp/decopu-home-redesign-');
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
const log=createWriteStream('work/home-redesign.chromium.log');
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
  
  const shot=async label=>fs.writeFile('work/home-redesign.'+label+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Page.navigate',{url:origin+manifest.start_url});await ready();
  const empty={muted:true,bestStars:Array(24).fill(0),bestMoves:Array(24).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:false}};
  const seed=async(progress,resume=null,night=false)=>{
    await page((key,appearance,progress,resume,night)=>{
      localStorage.setItem(key,JSON.stringify(progress));localStorage.setItem(key+':recovery',JSON.stringify(progress));
      localStorage.setItem(key+':guide-v1','done');localStorage.removeItem(key+':goal-v1');
      if(resume)localStorage.setItem(key+':puzzle-v1',JSON.stringify(resume));else localStorage.removeItem(key+':puzzle-v1');
      localStorage.setItem(appearance,night?'night':'day');localStorage.setItem('tea-shop-edition2-progress-v1','production-sentinel');
    },key,appearance,progress,resume,night);
    await send('Page.navigate',{url:origin+manifest.start_url});await enter();await pause(650);
  };
  const layout=()=>page(()=>{
    const selectors=['#shop-stars','#theme-toggle','#mute','.settings-menu summary','#play-tea','#edit-toggle','#home-puzzles'];
    const rects=selectors.map(s=>{const el=document.querySelector(s),r=el.getBoundingClientRect();return{s,x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right};});
    return{overflow:document.documentElement.scrollWidth>innerWidth,rects,canvas:document.querySelector('#shop-canvas').getBoundingClientRect().height,roomScroll:document.querySelector('.shop-room').scrollHeight,roomHeight:document.querySelector('.shop-room').clientHeight};
  });
  await seed(empty);const before=await snapshot();await shot(baseline?'before':'fresh-day');
  if(!baseline){
    assert.equal(await page(()=>document.querySelector('.launch-version')),null);
    assert.equal(await page(()=>document.querySelector('#play-tea strong').textContent),'Play');
    assert.equal(await page(()=>document.querySelector('#play-tea em').textContent),'Puzzle 1');
    assert.equal(await page(()=>document.querySelector('#home-puzzles strong').textContent),'0 / 24');
    assert.deepEqual(await snapshot(),before);
    for(let i=0;i<3;i++){
      await page(()=>document.querySelector('#edit-toggle').focus());
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await pause(250);
      assert.equal(await page(()=>document.activeElement===document.querySelector('#edit-toggle')),true);
      assert.equal(await page(()=>document.querySelector('.shop-room').classList.contains('decorating')),true);
      assert.equal(await page(()=>document.querySelector('#edit-toggle').closest('#toolbar-edit-slot')!==null),true);
      if(i===0)await shot('editor');
      await tap('#edit-toggle');assert.equal(await page(()=>document.querySelector('#edit-toggle').closest('.home-play-actions')!==null),true);
    }
    assert.deepEqual(await snapshot(),before);checks.push('Fresh home and repeated Decorate/Done retain one working button and leave progress untouched');
    await tap('.reward-card');await until(()=>!!document.querySelector('[data-act="preview"]'));
    assert.equal(await page(()=>document.querySelector('.shop-room').classList.contains('decorating')),true);
    await tap('[data-act="preview"][data-style="1"]');assert.equal(await page(()=>document.querySelector('[data-act="buy"]').disabled),true);
    await tap('#edit-toggle');assert.deepEqual(await snapshot(),before);checks.push('Home goal enters its item preview; unaffordable style preview and cancellation do not buy or change progress');
    const geometry=[];
    for(const [width,height,name] of [[390,844,'phone'],[320,568,'small'],[844,390,'landscape'],[1280,900,'desktop']]){
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000});
      for(const night of [false,true]){
        await seed(empty,null,night);const g=await layout();
        assert.equal(g.overflow,false,name+' no page overflow');
        for(const r of g.rects){assert.ok(r.w>0&&r.h>=36,name+' visible '+r.s);assert.ok(r.x>=0&&r.right<=width+.5&&r.y>=0&&r.bottom<=height+.5,name+' in viewport '+r.s);}
        assert.ok(g.canvas>=150,name+' room remains usable');
        assert.ok(g.roomScroll<=g.roomHeight+1,name+' no home vertical scrolling');
        geometry.push({width,height,night,...g});await shot(name+(night?'-night':'-day'));
      }
    }
    evidence.geometry=geometry;checks.push('Day/night at phone, small phone, landscape and desktop: room, balance and all navigation visible without scrolling');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    const progress={...empty,bestStars:[3,...Array(23).fill(0)],bestMoves:[3,...Array(23).fill(0)],shop:{owned:['counter'],stored:[],style:{counter:1},place:{counter:{x:1,z:1,rot:0}},finaleSeen:false}};
    await seed(progress,{version:1,levelId:2,actions:[[1,2]]});const saved=await snapshot();
    assert.equal(await page(()=>document.querySelector('#play-tea strong').textContent),'Continue');
    assert.equal(await page(()=>document.querySelector('#play-tea em').textContent),'Puzzle 2 · In progress');
    await shot('resume');await tap('#play-tea');await until(()=>!!document.querySelector('.play'));
    assert.equal(await page(()=>document.querySelector('.moves').textContent),'1 move');
    await tap('[data-go="levels"]');await tap('[data-go="shop"]');assert.deepEqual(await snapshot(),saved);
    await tap('#home-puzzles');await until(()=>!!document.querySelector('.levels'));await tap('[data-go="shop"]');
    assert.deepEqual(await snapshot(),saved);checks.push('Continue opens the saved puzzle; level browser and return preserve scores, furniture, appearance, unfinished actions and production keys');
    const complete={...empty,bestStars:Array(24).fill(3),bestMoves:Array(24).fill(1)};
    await seed(complete);assert.equal(await page(()=>document.querySelector('#play-tea strong').textContent),'Play again');
    assert.equal(await page(()=>document.querySelector('#play-tea em').textContent),'All stars collected');
    await shot('completed');checks.push('Completed journey offers replay without promising new stars');
    await seed(empty);await tap('#play-tea');await until(()=>!!document.querySelector('[data-jar]'));
    const move=async(a,b)=>{await tap(`[data-jar="${a}"]`);await tap(`[data-jar="${b}"]`);await pause(900);};
    await move(0,2);await move(1,0);await move(1,2);await until(()=>!!document.querySelector('.result-overlay'));
    await tap('.result-overlay [data-go="shop"]');await until(()=>!!document.querySelector('[data-upgrade]'));
    assert.equal(await page(()=>document.querySelector('.shop-room').classList.contains('decorating')),true);
    await tap('[data-upgrade="counter"]');await tap('[data-act="preview"][data-style="1"]');await tap('[data-act="buy"]');
    await tap('#edit-toggle');assert.equal(await page(()=>Number(document.querySelector('#shop-stars strong').textContent)),1);
    await shot('purchased');checks.push('Fresh Play → solve → direct Decorate → choose counter style → buy → return home shows the authoritative remaining balance');
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await seed(empty);await tap('#edit-toggle');await tap('#edit-toggle');assert.equal(await page(()=>document.querySelector('#play-tea strong').textContent),'Play');
    await tap('.settings-menu summary');await tap('#showcase-toggle');await until(()=>document.querySelector('.shop-room')?.classList.contains('showcasing'));
    assert.equal(await page(()=>getComputedStyle(document.querySelector('.home-intro')).display),'none');
    await tap('#showcase-back');assert.equal(await page(()=>document.querySelector('#edit-toggle').closest('.home-play-actions')!==null),true);
    checks.push('Reduced-motion navigation and Showcase return restore home actions');
    await send('Emulation.setDeviceMetricsOverride',{width:320,height:568,deviceScaleFactor:1,mobile:true});
    await seed(empty);
    await page(key=>localStorage.setItem(key+':guide-v1','puzzle'),key);
    await send('Page.navigate',{url:origin+manifest.start_url});await enter();
    assert.equal(await page(()=>document.querySelector('.shop-room').classList.contains('has-guide')),true);
    assert.ok(await page(()=>document.querySelector('#edit-toggle').getBoundingClientRect().bottom<=innerHeight));
    evidence.guidedLayout=await page(()=>{const room=document.querySelector('.shop-room'),bar=document.querySelector('.shop-toolbar').getBoundingClientRect();return{height:room.clientHeight,scroll:room.scrollHeight,top:room.scrollTop,barY:bar.y,windowY:scrollY};});
    assert.ok(evidence.guidedLayout.barY>=0,'Guided home keeps the header in view');
    assert.ok(evidence.guidedLayout.scroll<=evidence.guidedLayout.height+1,'Guided home fits without scrolling');
    await shot('guided-small');await tap('[data-guide-skip]');
    assert.equal(await page(()=>getComputedStyle(document.querySelector('.home-intro')).display),'flex');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await seed(empty);
    await page(()=>{document.documentElement.style.setProperty('--safe-top','47px');document.documentElement.style.setProperty('--safe-bottom','34px');});
    await pause(300);const safe=await layout();assert.ok(safe.rects[0].y>=47);
    assert.ok(safe.rects.find(r=>r.s==='#edit-toggle').bottom<=844-34);
    await shot('safe-area');
    checks.push('Small-phone guide and simulated iPhone safe areas retain reachable navigation; Skip restores ordinary home');
    const savedBeforeShowroom=await snapshot();
    await send('Page.navigate',{url:origin+base+'?showroom=1'});await enter();await pause(700);await shot('furnished');
    assert.deepEqual(await snapshot(),savedBeforeShowroom);checks.push('Furnished preview remains temporary and does not overwrite the player’s room');

  }
  assert.deepEqual(errors,[]);evidence.passed=true;
  console.log('PASS: '+(baseline?'baseline screenshot':'home redesign navigation, geometry, day/night, resume, purchase, replay, reduced motion and storage isolation'));
} catch(error) {
  evidence.passed=false;evidence.error=String(error);evidence.stack=error.stack;
  if(ev)evidence.screen=await ev('document.body.innerText').catch(()=>null);
  if(send)await fs.writeFile('work/home-redesign.failure.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64')).catch(()=>{});
  console.error(error);process.exitCode=1;
} finally {
  await fs.writeFile('work/home-redesign.json',JSON.stringify(evidence,null,2));
  ws?.close();browser?.kill('SIGTERM');server.close();
  await pause(300);browser?.kill('SIGKILL');log.end();
}
