import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import path from 'node:path';

// Run after npm run build -- --base=/tea-shop/preview/ --outDir=work/puzzle-readability-build
const buildDir=process.env.PUZZLE_BUILD ?? 'work/puzzle-readability-build';
const baseline=process.env.PUZZLE_BASELINE==='1';
const manifest=JSON.parse(await fs.readFile(buildDir+'/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'/tea-shop/preview/');
assert.equal(manifest.scope,'/tea-shop/preview/');
assert.equal(manifest.short_name,'Decopu Preview');
const base='/tea-shop/preview/',origin='http://127.0.0.1:5196',cdp=9262;
const key='tea-shop-preview-edition2-progress-v1',appearance='tea-shop-preview-edition2-appearance-v1';
const checks=[],errors=[],evidence={version:'0.3.0-preview.7',origin,disposableProfile:true,syntheticSave:true,checks,errors};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp('/tmp/decopu-puzzle-readability-');
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
const log=createWriteStream('work/puzzle-readability.chromium.log');
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
  
  const shot=async label=>fs.writeFile('work/puzzle-readability.'+label+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url:origin+manifest.start_url});await ready();
  const seed=async id=>{
    await page((key,id)=>{
      const progress={muted:true,bestStars:Array.from({length:24},(_,i)=>i<id-1?3:0),bestMoves:Array(24).fill(0),shop:{owned:[],stored:[],style:{},place:{},finaleSeen:true}};
      localStorage.setItem(key,JSON.stringify(progress));localStorage.setItem(key+':guide-v1','done');
      localStorage.setItem(key+':puzzle-v1',JSON.stringify({version:1,levelId:id,actions:[]}));
      localStorage.setItem('tea-shop-edition2-progress-v1','production-sentinel');
    },key,id);
    await send('Page.reload');await enter();await tap('#play-tea');await until(()=>!!document.querySelector('[data-jar]'));await pause(350);
  };
  for(const [width,height,label] of [[390,844,'phone'],[320,568,'small'],[844,390,'landscape'],[1280,900,'desktop']]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
    for(const id of [1,5,18,24]) {
      await seed(id);await shot((baseline?'before-':'')+label+'-'+id);
      if(baseline)continue;
      const findings=await page(()=>{
        const issues=[];const jars=[...document.querySelectorAll('[data-jar]')];
        for(const jar of jars){
          const r=jar.getBoundingClientRect();if(r.left<-.5||r.right>innerWidth+.5||r.top<0||r.bottom>innerHeight+.5)issues.push('jar out of viewport');
          const description=document.getElementById(jar.getAttribute('aria-describedby'));if(!description)issues.push('description missing');
          const hidden=[...jar.querySelectorAll('.mystery')];
          if(hidden.length!==((description?.textContent.match(/hidden/g))??[]).length)issues.push('hidden description count');
          for(const piece of jar.querySelectorAll('.treat')){
            const p=piece.getBoundingClientRect(),slot=piece.closest('.slot').getBoundingClientRect();
            if(Math.abs(p.x+p.width/2-slot.x-slot.width/2)>1.5||Math.abs(p.y+p.height/2-slot.y-slot.height/2)>1.5)issues.push('piece off centre');
            if(p.height>slot.height+.5||p.width>slot.width+.5)issues.push('piece overflows');
          }
          for(const piece of hidden){
            if(piece.getAttribute('style')||piece.textContent.trim()||/rose|jasmine|matcha|chai|lavender|earl/.test(piece.className))issues.push('hidden flavour leak');
            const fog=piece.firstElementChild.getBoundingClientRect(),p=piece.getBoundingClientRect();
            if(Math.abs(fog.x+fog.width/2-p.x-p.width/2)>1.5||Math.abs(fog.y+fog.height/2-p.y-p.height/2)>1.5)issues.push('fog off centre');
          }
        }
        if(!document.querySelector('.sachet'))issues.push('no new artwork');
        return issues;
      });
      assert.deepEqual(findings,[],label+' level '+id);
      for(const index of await page(()=>[...document.querySelectorAll('[data-jar]')].filter(j=>j.querySelector('.mystery')).map(j=>j.dataset.jar))){
        await tap(`[data-jar="${index}"]`);assert.equal(await page(()=>document.querySelectorAll('.held .mystery').length),0);await tap(`[data-jar="${index}"]`);
      }
      assert.equal(await page(()=>localStorage.getItem('tea-shop-edition2-progress-v1')),'production-sentinel');
    }
    checks.push(label+': initial, hidden, tall and late boards fit; centered pieces, accessible hidden-safe contents and selection');
  }
  assert.deepEqual(errors,[]);evidence.passed=true;console.log('PASS: '+(baseline?'baseline captures':checks.join('; ')));
} catch(error) {
  evidence.passed=false;evidence.error=String(error);evidence.stack=error.stack;
  if(ev)evidence.screen=await ev('document.body.innerText').catch(()=>null);
  if(send)await fs.writeFile('work/puzzle-readability.failure.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64')).catch(()=>{});
  console.error(error);process.exitCode=1;
} finally {
  await fs.writeFile('work/puzzle-readability'+(baseline?'-baseline':'')+'.json',JSON.stringify(evidence,null,2));
  ws?.close();browser?.kill('SIGTERM');server.close();
  await pause(300);browser?.kill('SIGKILL');log.end();
}
