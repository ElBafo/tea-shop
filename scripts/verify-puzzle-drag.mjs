// Run against an isolated Chromium CDP profile (default 9250) and the preview
// Vite server (default 5174). All saves below are generated synthetic fixtures.
// node scripts/verify-puzzle-drag.mjs (Node 22+)
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { installReturningPlayerStart } from './browser-start.mjs';

const url = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5174/tea-shop/preview/?edition=2';
const key = 'tea-shop-preview-edition2-progress-v1';
const appearanceKey = 'tea-shop-preview-edition2-appearance-v1';
const tabs = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9250}/json`)).json();
const tab = tabs.find(tab => tab.type === 'page');
assert.ok(tab, 'isolated browser has a page');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map(), errors = [], checks = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id); pending.delete(message.id);
    message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++sequence, { resolve, reject }); ws.send(JSON.stringify({ id: sequence, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = (ms = 40) => new Promise(resolve => setTimeout(resolve, ms));
const until = async (expression, message = expression) => {
  for (let i = 0; i < 140; i++) { if (await evaluate(expression)) return; await pause(100); }
  throw Error('Timed out: ' + message);
};
const point = async selector => evaluate(`(() => {
  const e = document.querySelector(${JSON.stringify(selector)});
  if (!e || e.disabled || e.closest('[inert]')) throw Error('Unavailable: ' + ${JSON.stringify(selector)});
  e.scrollIntoView({block:'nearest',behavior:'instant'});
  const r = e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
})()`);
const jarPoint = index => point(`[data-jar="${index}"] .jar-glass`);
const topPoint = async index => evaluate(`(() => {
  const pieces = document.querySelectorAll('[data-jar="${index}"] .slot:not(.empty) .treat');
  const e = pieces[pieces.length-1] ?? document.querySelector('[data-jar="${index}"] .jar-glass');
  const r = e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
})()`);
const touch = (type, points = []) => send('Input.dispatchTouchEvent', { type, touchPoints: points.map((p, i) => ({ ...p, id:p.id ?? i+1 })) });
const tap = async selector => { const p = await point(selector); await touch('touchStart', [p]); await pause(35); await touch('touchEnd'); await pause(130); };
const activateWithKeyboard = async selector => {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r',unmodifiedText:'\r'}:{})});
  await pause(130);
};
const idle = () => until(`document.querySelector('.shelves')?.getAttribute('aria-busy') === 'false'`, 'puzzle becomes idle');
const actions = () => evaluate(`JSON.parse(localStorage.getItem('${key}:puzzle-v1') ?? 'null')?.actions ?? null`);
const moves = () => evaluate(`Number.parseInt(document.querySelector('.moves').textContent,10)`);
const saved = () => evaluate(`JSON.parse(localStorage.getItem('${key}'))`);
const labels = () => evaluate(`[...document.querySelectorAll('[data-jar]')].map(e => e.getAttribute('aria-label'))`);
const jarPositions = () => evaluate(`[...document.querySelectorAll('[data-jar]')].map(e => {const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})`);
const ghostCount = () => evaluate(`document.querySelectorAll('.puzzle-drag-ghost').length`);
const clean = async () => {
  await until(`!document.querySelector('.puzzle-drag-ghost,.puzzle-dragging,.drag-source,.drag-valid,.drag-over')`, 'drag visuals clean up');
};
const shot = async name => {
  await fs.writeFile(`work/puzzle-drag-${name}.png`, Buffer.from((await send('Page.captureScreenshot')).data, 'base64'));
};
const check = name => { checks.push(name); console.log('PASS:', name); };
const viewport = async (width, height, mobile = true) => {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor:1, mobile }); await pause(160);
};
const launch = async () => {
  // Page.reload returns before its replacement document has committed.
  await pause(500);
  await until(`!!document.querySelector('#play-tea') && !document.querySelector('#play-tea').closest('[inert]') && !document.querySelector('#launch-screen')`, 'returning player enters the shop');
};
const seed = async (level = 1, history = [], { night = false, guide = 'done', manualStart = false } = {}) => {
  const progress = { muted:true, bestStars:Array.from({ length:24 }, (_, i) => i < level-1 ? 1 : 0), bestMoves:Array(24).fill(0), shop:{ owned:[],stored:[],place:{},style:{},finaleSeen:false } };
  await evaluate(`Object.keys(localStorage).filter(k=>k.startsWith('${key}')).forEach(k=>localStorage.removeItem(k));
    localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(progress))});
    localStorage.setItem('${key}:guide-v1',${JSON.stringify(guide)});
    localStorage.setItem('${key}:puzzle-v1',${JSON.stringify(JSON.stringify({ version:1, levelId:level, actions:history }))});
    localStorage.setItem('${appearanceKey}',${JSON.stringify(night ? 'night' : 'day')});`);
  await send('Page.reload');
  if(manualStart) { await pause(500); await until(`document.querySelector('#launch-start')?.disabled===false`); await tap('#launch-start'); }
  await launch(); await tap('#play-tea'); await idle();
  assert.equal(await moves(), history.length, `level ${level} resumes legal synthetic history`);
};
const begin = async (from, to, fraction = .45) => {
  const start = await topPoint(from), end = typeof to === 'number' ? await jarPoint(to) : to;
  await touch('touchStart', [start]);
  await pause(30);
  for (let step=1; step<=4; step++) {
    const t = fraction*step/4;
    await touch('touchMove', [{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t}]);
    await pause(22);
  }
  return { start, end };
};
const finish = async ({ start, end }, { cancel = false } = {}) => {
  if (!cancel) for (let step=5; step<=10; step++) {
    const t = .45+(.55*(step-4)/6);
    await touch('touchMove', [{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t}]); await pause(20);
  }
  await touch(cancel ? 'touchCancel' : 'touchEnd'); await idle(); await clean();
};
const drag = async (from, to) => { const gesture = await begin(from, to); await finish(gesture); };
const mouseDrag = async (from, to) => {
  const start = await topPoint(from), end = await jarPoint(to);
  await send('Input.dispatchMouseEvent', { type:'mousePressed',...start,button:'left',buttons:1,clickCount:1 });
  for (let i=1;i<=9;i++) { const t=i/9; await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t,button:'left',buttons:1}); await pause(20); }
  await send('Input.dispatchMouseEvent', { type:'mouseReleased',...end,button:'left',buttons:0,clickCount:1 });
  await idle(); await clean();
};
const assertFits = async () => {
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), 'no horizontal page overflow');
  assert.ok(await evaluate(`(() => {const s=document.querySelector('.shelves');return s.scrollWidth<=s.clientWidth+1&&s.scrollHeight<=s.clientHeight+1})()`), 'entire puzzle fits without inner scrolling');
  assert.ok(await evaluate(`[...document.querySelectorAll('[data-jar],.play-bar button')].every(e=>{const r=e.getBoundingClientRect();return r.x>=-1&&r.right<=innerWidth+1&&r.y>=-1&&r.bottom<=innerHeight+1})`), 'all jars and actions stay in view');
};
const assertHidden = async () => {
  assert.ok(await evaluate(`[...document.querySelectorAll('.mystery')].every(e=>!e.getAttribute('style')&&!/rose|chai|matcha|jasmine/.test(e.className)&&e.textContent.trim()==='')`), 'concealed DOM exposes no flavour');
  assert.ok(await evaluate(`[...document.querySelectorAll('.mystery .fog')].every(e=>{const f=e.getBoundingClientRect(),s=e.closest('.slot').getBoundingClientRect();return Math.abs(f.x+f.width/2-s.x-s.width/2)<1.5&&Math.abs(f.y+f.height/2-s.y-s.height/2)<1.5})`), 'hidden artwork remains centered in each slot');
};
let clearStart = async () => {};
let traceScript;
try {
  await fs.mkdir('work', { recursive:true });
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', { bypass:true }); await send('Network.setCacheDisabled', { cacheDisabled:true });
  await send('Emulation.setTouchEmulationEnabled', { enabled:true,maxTouchPoints:2 });
  clearStart = await installReturningPlayerStart(send);
  traceScript = (await send('Page.addScriptToEvaluateOnNewDocument', { source:`
    window.__qaEvents=[];
    for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture','click'])document.addEventListener(type,e=>{
      if(type==='pointerdown')window.__qaPointerId=e.pointerId;
      const entry={type,id:e.pointerId,target:e.target.id||e.target.closest('button')?.outerHTML.slice(0,160)||e.target.tagName,detail:e.detail};
      window.__qaEvents.push(entry);if(window.__qaEvents.length>30)window.__qaEvents.shift();queueMicrotask(()=>entry.prevented=e.defaultPrevented);
    },{capture:true});` })).identifier;
  await viewport(390,844); await send('Page.navigate', { url }); await launch();

  if(process.env.DRAG_PHASE !== 'navigation') {
  await seed(); const positions = await jarPositions();
  const gesture = await begin(0,2);
  assert.equal(await ghostCount(),1,'one drag ghost follows the active touch');
  assert.equal(await evaluate(`document.querySelectorAll('.puzzle-drag-ghost .drag-piece').length`),2,'the whole matching pair lifts');
  assert.equal(await moves(),0,'drag preview has not committed a move');
  assert.deepEqual(await jarPositions(),positions,'jars stay fixed during drag');
  assert.ok(await evaluate(`document.querySelector('[data-jar="2"]').classList.contains('drag-valid')`),'legal destination is highlighted');
  assert.ok(await evaluate(`!document.querySelector('[data-jar="1"]').classList.contains('drag-valid')`),'full destination is not highlighted');
  const firstGhost = await point('.puzzle-drag-ghost');
  await touch('touchMove',[{x:gesture.end.x,y:gesture.end.y}]); await pause(40);
  const lastGhost = await point('.puzzle-drag-ghost');
  assert.ok(Math.hypot(lastGhost.x-firstGhost.x,lastGhost.y-firstGhost.y)>15,'ghost continues following beyond its initial position');
  assert.ok(await evaluate(`document.querySelector('[data-jar="2"]').classList.contains('drag-over')`),'hovered legal destination is distinct');
  await shot('phone-dragging'); await touch('touchEnd'); await idle(); await clean();
  assert.deepEqual(await actions(),[[0,2]],'one physical drag commits exactly one action');
  assert.deepEqual(await labels(),['Jar 1, 2 of 4','Jar 2, 4 of 4','Jar 3, 2 of 4'],'whole pair moves');
  assert.deepEqual(await jarPositions(),positions,'jars stay fixed after transfer');
  await tap('#undo'); assert.deepEqual(await actions(),[],'Undo reverses a dragged transfer');
  await drag(0,2); assert.deepEqual(await actions(),[[0,2]]);
  await send('Page.reload'); await launch(); await tap('#play-tea'); await idle();
  assert.deepEqual(await actions(),[[0,2]],'unfinished dragged move survives reload');
  await tap('#undo'); assert.deepEqual(await actions(),[],'Undo history survives reload');
  await seed(4); await drag(0,3); await drag(3,0);
  assert.deepEqual(await actions(),[[0,3],[3,0]],'reverse drag into an empty source works');
  check('real touch drag, continuous following, stationary jars, whole pair, reverse, Undo and reload');

  await seed();
  await tap('[data-jar="0"]'); await tap('[data-jar="2"]'); await idle();
  assert.deepEqual(await actions(),[[0,2]],'tap-to-tap still transfers');
  await evaluate(`document.querySelector('[data-jar="1"]').focus()`);
  for (const type of ['keyDown','keyUp']) await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r',unmodifiedText:'\r'}:{})});
  await evaluate(`document.querySelector('[data-jar="0"]').focus()`);
  for (const type of ['keyDown','keyUp']) await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r',unmodifiedText:'\r'}:{})});
  await idle(); assert.deepEqual(await actions(),[[0,2],[1,0]],'keyboard activation still transfers');
  await tap('#restart'); assert.deepEqual(await actions(),[],'Restart clears dragged/tapped history');
  check('tap controls, keyboard controls and Restart');

  await seed(4,[[2,1]]); await tap('[data-jar="0"]');
  assert.ok(await evaluate(`document.querySelector('[data-jar="2"]').classList.contains('valid-target')`),'tap selection has a matching destination');
  const selectedDrag = await begin(1,3);
  assert.ok(await evaluate(`[...document.querySelectorAll('.jar.selected .slot.held')].every(e=>getComputedStyle(e).transform==='none'&&getComputedStyle(e).filter==='none')`),'old tap selection stops floating during a different drag');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-jar="2"] .jar-glass')).outlineStyle`),'none','stale tap target loses its outline');
  assert.ok(await evaluate(`!document.querySelector('[data-jar="2"]').classList.contains('drag-valid')`),'old matching destination is not a legal new drag destination');
  await finish(selectedDrag); assert.deepEqual(await actions(),[[2,1],[1,3]],'drag chooses its grabbed source, not the old tap selection');
  await clearStart(); await seed(1,[],{guide:'puzzle',manualStart:true});
  assert.ok(await evaluate(`!!document.querySelector('[data-jar="0"].guide-target')`),'first-puzzle guide is active');
  const guideDrag = await begin(1,2);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-jar="0"] .jar-glass')).outlineStyle`),'none','guide cannot highlight an illegal target during a different drag');
  await finish(guideDrag); assert.deepEqual(await actions(),[[1,2]]);
  clearStart = await installReturningPlayerStart(send);
  check('drag overrides stale tap selection and onboarding target presentation');

  await seed();
  for (const [label,from,to] of [['full',0,1],['outside',0,{x:5,y:70}],['source-return',0,0],['empty-source',2,0]]) {
    const before = await labels(); await drag(from,to);
    assert.deepEqual(await actions(),[],`${label} drop does not count a move`); assert.deepEqual(await labels(),before,`${label} drop leaves contents intact`);
  }
  await seed(2,[[0,2]]); const wrongBefore = await labels(); await drag(1,2);
  assert.deepEqual(await actions(),[[0,2]],'mismatched target rejects the drop'); assert.deepEqual(await labels(),wrongBefore);
  await seed(12,[[1,3],[0,1],[2,0]]); const partialBefore = await labels(); await drag(1,2);
  assert.deepEqual(await actions(),[[1,3],[0,1],[2,0]],'matching pair does not split into one remaining space'); assert.deepEqual(await labels(),partialBefore);
  check('full, mismatched, outside, same-source, empty-source and partial-fit rejection');

  await seed();
  for (const cancellation of ['touchCancel','lostCapture','blur','multitouch']) {
    const active = await begin(0,2); assert.equal(await ghostCount(),1,`${cancellation} starts an actual drag`);
    if (cancellation === 'touchCancel') await touch('touchCancel');
    if (cancellation === 'lostCapture') {
      assert.ok(await evaluate(`(() => {const e=[...document.querySelectorAll('*')].find(e=>e.hasPointerCapture?.(window.__qaPointerId));if(!e)return false;e.releasePointerCapture(window.__qaPointerId);return true})()`),'pointer capture is held during drag');
      await pause(30); await touch('touchMove',[active.end]); await touch('touchEnd');
    }
    if (cancellation === 'blur') { await evaluate(`window.dispatchEvent(new Event('blur'))`); await touch('touchMove',[active.end]); await touch('touchEnd'); }
    if (cancellation === 'multitouch') {
      await touch('touchStart',[{...active.start,id:1},{x:active.start.x+14,y:active.start.y+12,id:2}]);
      await touch('touchMove',[{...active.end,id:1},{x:active.start.x+18,y:active.start.y+15,id:2}]);
      await touch('touchEnd',[{...active.end,id:1}]);
      await touch('touchMove',[active.end]); await touch('touchEnd');
    }
    await pause(100); await clean(); assert.deepEqual(await actions(),[],`${cancellation} cancels without a move`);
    await drag(0,2); assert.deepEqual(await actions(),[[0,2]],`input recovers after ${cancellation}`); await tap('#undo');
  }
  check('real touch cancellation, lost capture, blur and additional fingers clean up and recover');
  }

  await seed();
  await begin(0,2); await evaluate(`document.querySelector('[data-go="levels"]').click()`); await touch('touchEnd'); await clean();
  assert.ok(await evaluate(`!!document.querySelector('.levels')`),'navigation during drag succeeds');
  assert.deepEqual(await actions(),[],'navigation does not commit an unfinished drag');
  // Navigation above is deliberately programmatic during a live finger gesture.
  // Chromium suppresses native compatibility clicks briefly after that synthetic
  // cancellation; use independent keyboard input here, rather than hiding a
  // touch failure behind a delay. Ordinary completed drag→tap is checked below.
  await activateWithKeyboard('[data-resume]');
  await idle(); await drag(0,2); await tap('#undo');
  await begin(0,2);
  // A real tab change delivers visibilitychange; no application internals are mocked.
  const other = await send('Target.createTarget', {url:'about:blank',background:false});
  try {
    await send('Target.activateTarget', {targetId:other.targetId}); await pause(120);
    assert.equal(await evaluate('document.visibilityState'),'hidden','test tab actually enters the background');
    await clean();
  } finally { await send('Target.closeTarget',{targetId:other.targetId}); await send('Page.bringToFront'); }
  await touch('touchEnd'); await pause(80); assert.deepEqual(await actions(),[],'backgrounding does not commit');
  await drag(0,2); await tap('#undo');
  check('navigation and real background/foreground interruption');

  await seed(6); const crossPositions = await jarPositions();
  const cross = await begin(0,4); assert.equal(await ghostCount(),1); await shot('cross-row'); await finish(cross);
  assert.deepEqual(await actions(),[[0,4]],'drag crosses the space between jar rows'); assert.deepEqual(await jarPositions(),crossPositions);
  await tap('[data-jar="2"]');
  assert.equal(await evaluate(`document.querySelector('.jar.selected')?.dataset.jar`),'2','a tap immediately after a completed drag selects its source');
  await tap('[data-jar="0"]'); await idle();
  await drag(4,2); assert.deepEqual(await actions(),[[0,4],[2,0],[4,2]],'reverse cross-row drag into a matching jar works');
  check('long cross-row drags in both directions');

  await seed(5); await assertHidden();
  const hidden = await begin(2,3); assert.equal(await evaluate(`document.querySelectorAll('.puzzle-drag-ghost .drag-piece').length`),1,'wrapped jar lifts only its known top piece');
  assert.equal(await evaluate(`document.querySelectorAll('.puzzle-drag-ghost .mystery').length`),0,'drag ghost has no concealed-content copies');
  assert.equal(await evaluate(`document.querySelectorAll('[data-jar="2"] .mystery').length`),3,'concealed contents remain wrapped during drag');
  await assertHidden(); await shot('hidden-dragging'); await finish(hidden);
  assert.deepEqual(await actions(),[[2,3]]); assert.equal(await evaluate(`document.querySelectorAll('[data-jar="2"] .mystery').length`),0,'valid move reveals wrapped contents');
  await tap('#undo'); assert.equal(await evaluate(`document.querySelectorAll('[data-jar="2"] .mystery').length`),3,'Undo restores concealment');
  check('wrapped-piece privacy, reveal and Undo');

  await seed(1);
  for (const [from,to] of [[0,2],[1,0],[1,2]]) await drag(from,to);
  await until(`!!document.querySelector('.result-overlay')`); await pause(120);
  assert.equal(await moves(),3); assert.equal((await saved()).bestStars[0],3); assert.equal((await saved()).bestMoves[0],3);
  assert.equal(await actions(),null,'completed puzzle clears unfinished save');
  assert.equal(await evaluate(`document.querySelectorAll('.result-overlay').length`),1);
  const wonProgress = await saved(); await evaluate(`document.querySelector('[data-jar="2"]').click()`);
  assert.deepEqual(await saved(),wonProgress,'late click cannot duplicate the winning reward');
  await shot('win-phone'); await send('Page.reload'); await launch(); assert.deepEqual(await saved(),wonProgress,'winning drag reward persists');
  check('three real drags finish a level once, reward exactly once and persist');

  await seed(14); await assertFits(); assert.equal(await evaluate(`document.querySelector('.shelves').dataset.capacity`),'5');
  for (const [from,to] of [[0,2],[1,0],[1,2]]) await drag(from,to);
  await until(`!!document.querySelector('.result-overlay')`); assert.equal((await saved()).bestStars[13],3);
  check('five-slot completion with whole matching groups');

  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await seed(2); const reducedPositions = await jarPositions(); const reduced = await begin(0,2);
  assert.equal(await ghostCount(),1,'reduced motion retains direct gesture feedback');
  await finish(reduced); assert.deepEqual(await actions(),[[0,2]]); assert.deepEqual(await jarPositions(),reducedPositions);
  assert.equal(await evaluate(`document.querySelectorAll('.flying-treat,.puzzle-drag-ghost').length`),0,'reduced motion has no trailing flight animation');
  await send('Emulation.setEmulatedMedia',{features:[]}); check('reduced motion follows the finger and settles without flight effects');

  for (const [width,height,name,mobile] of [[320,568,'small',true],[390,844,'phone-night',true],[844,390,'landscape',true],[1280,900,'desktop',false]]) {
    await viewport(width,height,mobile); await seed(23,[],{night:name==='phone-night'}); await assertFits(); await assertHidden();
    await shot(name+'-tall-hidden');
    if (mobile) await drag(0,3); else await mouseDrag(0,3);
    assert.deepEqual(await actions(),[[0,3]],`${name} drag works`); await tap('#undo'); assert.deepEqual(await actions(),[]);
    check(`${name}: five-slot wrapped art fits; ${mobile?'touch':'mouse'} drag and Undo`);
  }
  await seed(1); const escapeStart = await topPoint(0), escapeEnd = await jarPoint(2);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...escapeStart,button:'left',buttons:1,clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:(escapeStart.x+escapeEnd.x)/2,y:escapeStart.y,button:'left',buttons:1}); await pause(60);
  assert.equal(await ghostCount(),1);
  for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...escapeStart,button:'left',buttons:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...escapeStart,button:'left',buttons:0,clickCount:1});
  await clean(); assert.deepEqual(await actions(),[]);
  assert.equal(await evaluate(`document.querySelectorAll('.jar.selected').length`),0,'Escape then release over source must not synthesize a selection');
  await mouseDrag(0,2); assert.deepEqual(await actions(),[[0,2]],'mouse input recovers after Escape');
  check('Escape cancels desktop drag and suppresses its trailing click');
  assert.deepEqual(errors,[],'no runtime exceptions');
  await fs.writeFile('work/puzzle-drag-check.json',JSON.stringify({passed:true,url,checks,errors,physicalIPhoneTested:false},null,2));
  console.log(`PASS: ${checks.length} puzzle drag groups; real CDP touch, desktop mouse, keyboard and layout checks. Physical Safari review still required.`);
} catch (error) {
  console.log('Failure event trace:',await evaluate('window.__qaEvents').catch(()=>null));
  await shot('failure').catch(()=>{});
  await fs.writeFile('work/puzzle-drag-check.json',JSON.stringify({passed:false,url,checks,errors,failure:String(error)},null,2));
  throw error;
} finally {
  // A failed mid-drag assertion must not leave Chromium holding a synthetic
  // finger for the next run, even when the page is reloaded between fixtures.
  await touch('touchCancel').catch(()=>{});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:0,y:0,button:'left',buttons:0}).catch(()=>{});
  await clearStart().catch(()=>{});
  if(traceScript)await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:traceScript}).catch(()=>{});
  ws.close();
}
