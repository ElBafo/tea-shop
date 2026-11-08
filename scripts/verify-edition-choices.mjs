// Vite at 5174, preview base; isolated Chromium CDP defaults to 9233.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const tabs = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9233}/json`)).json();
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
let seq = 0;
const pending = new Map(), errors = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id); pending.delete(message.id);
    message.error ? request.reject(message.error) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++seq, {resolve, reject}); ws.send(JSON.stringify({id: seq, method, params}));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));
const until = async expression => {
  for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await pause(125); }
  throw Error('Timed out: ' + expression);
};
const tap = async selector => {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element || element.disabled || element.closest('[inert]')) throw Error('Unavailable: ' + ${JSON.stringify(selector)});
    element.scrollIntoView({block: 'nearest', behavior: 'instant'});
    const rect = element.getBoundingClientRect(); return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
  })()`);
  await send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{...point, id: 1}]});
  await send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await pause();
};
const key = 'tea-shop-preview-edition2-progress-v1';
const previewUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5174/tea-shop/preview/?edition=2';
const saved = () => evaluate(`JSON.parse(localStorage.getItem('${key}'))`);
const available = () => evaluate(`Number(document.querySelector('#shop-stars strong').textContent)`);
const empty = () => ({owned: [], stored: [], style: {}, place: {}, finaleSeen: true});
const progress = (count, stars = 3, shop = empty()) => ({muted: true, bestStars: Array.from({length: 24}, (_, i) => i < count ? stars : 0), bestMoves: Array(16).fill(0), shop});
const ready = async () => { await pause(500); await until(`document.querySelector('#launch-start')?.disabled === false`); };
const seed = async (value, goal = null) => {
  await evaluate(`Object.keys(localStorage).filter(k => k.startsWith('tea-shop-preview-edition2')).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('${key}', ${JSON.stringify(JSON.stringify(value))});
    localStorage.setItem('${key}:guide-v1', 'done');
    ${goal ? `localStorage.setItem('${key}:goal-v1', ${JSON.stringify(JSON.stringify(goal))});` : ''}`);
  await send('Page.reload'); await ready(); await tap('#launch-start');
};
const shot = async name => fs.writeFile(`work/edition2-choices-${name}.png`, Buffer.from((await send('Page.captureScreenshot')).data, 'base64'));
const choose = async (id, style = 0) => {
  await tap('#edit-toggle'); await tap(`[data-upgrade="${id}"]`); await tap(`[data-act="preview"][data-style="${style}"]`);
};
const checkViewport = async () => {
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), 'no horizontal page overflow');
  assert.ok(await evaluate(`(() => {const e = document.querySelector('[data-act="buy"]'); if (!e) return true; const r = e.getBoundingClientRect(); return r.x >= 0 && r.right <= innerWidth + 1 && r.y >= 0 && r.bottom <= innerHeight + 1;})()`), 'purchase action remains visible');
};

try {
  await fs.mkdir('work', {recursive: true});
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', {bypass: true});
  await send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1});
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await send('Page.navigate', {url: previewUrl}); await ready();

  if (process.env.CHOICES_PHASE !== 'goals') {
  await seed(progress(0)); await tap('#edit-toggle');
  assert.equal(await evaluate(`document.querySelectorAll('#upgrade-rail [data-upgrade]').length`), 18);
  await evaluate(`document.querySelectorAll('#upgrade-rail img').forEach(img => img.loading = 'eager')`);
  await until(`document.querySelectorAll('#upgrade-rail img').length === 18 && [...document.querySelectorAll('#upgrade-rail img')].every(img => img.complete && img.naturalWidth > 0)`);
  await shot('catalogue-phone');

  // Six distinct locked/free-preview paths and their exact unlock boundaries.
  for (const [id, gate] of [['bench', 3], ['art', 3], ['clock', 6], ['trolley', 6], ['basket', 10], ['planter', 10]]) {
    await seed(progress(gate - 1)); const before = await saved();
    await choose(id, 2);
    assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').disabled`), true, `${id} locked before ${gate}`);
    assert.match(await evaluate(`document.querySelector('[data-act="buy"]').textContent`), new RegExp(`Unlock at ${gate}`));
    assert.deepEqual(await saved(), before, `${id} free preview never spends or grants ownership`);
    await seed(progress(gate)); await choose(id, 2);
    assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').disabled`), false, `${id} purchasable at ${gate}`);
  }
  console.log('Checked all six optional unlock boundaries and free previews.');

  // A funded but still locked wish must show puzzle progress, not “Ready”.
  await seed(progress(5)); await choose('clock', 2); await tap('[data-act="pin-goal"]'); await tap('#edit-toggle');
  assert.match(await evaluate(`document.querySelector('.personal-goal').textContent`), /1 more puzzle to unlock/);
  assert.doesNotMatch(await evaluate(`document.querySelector('.personal-goal').textContent`), /Ready to make/);
  assert.equal(await evaluate(`document.querySelector('.personal-goal progress').max`), 6);
  assert.equal(await evaluate(`document.querySelector('.personal-goal progress').value`), 5);
  await shot('locked-goal');

  // A real first win carries the desired optional style into the free preview.
  await seed(progress(0)); await choose('basket', 2); await tap('[data-act="pin-goal"]'); await tap('#edit-toggle'); await tap('#play-tea');
  for (const [from, to] of [[0, 2], [1, 0], [1, 2]]) {
    await tap(`[data-jar="${from}"]`); await tap(`[data-jar="${to}"]`);
    await until(`document.querySelector('.shelves')?.getAttribute('aria-busy') === 'false'`);
  }
  await until(`!!document.querySelector('.result-overlay')`);
  assert.match(await evaluate(`document.querySelector('.result-overlay .personal-goal').textContent`), /9 more puzzles to unlock/);
  await tap('.result-overlay [data-reward="basket"]');
  assert.equal(await evaluate(`document.querySelector('[data-act="preview"][aria-pressed="true"]').dataset.style`), '2');
  assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').disabled`), true);
  assert.deepEqual((await saved()).shop.owned, []);
  console.log('Checked locked-goal progress and first-win style handoff.');

  // Paid optional choices retain exact refunds, cancel safety and repurchase.
  await seed(progress(3)); const earned = await available(); await choose('bench', 2); await tap('[data-act="buy"]');
  assert.equal(await available(), earned - 6); assert.equal((await saved()).shop.style.bench, 2);
  await tap('[data-act="rotate"]');
  assert.equal(await evaluate(`document.querySelector('#undo-move').disabled`), false, 'rotation can be undone before returning');
  const bought = await saved(); await tap('[data-act="return"]'); await tap('[data-cancel-return]');
  assert.deepEqual(await saved(), bought, 'cancel leaves the paid piece and stars intact');
  await tap('[data-act="return"]'); await tap('[data-confirm-return]');
  assert.equal(await available(), earned); assert.deepEqual((await saved()).shop.owned, []);
  assert.equal(await evaluate(`document.querySelector('#undo-move').disabled`), true, 'return clears the previous owned move');
  await tap('[data-upgrade="bench"]'); await tap('[data-act="preview"][data-style="1"]'); await tap('[data-act="buy"]');
  assert.equal(await available(), earned - 6); assert.equal((await saved()).shop.style.bench, 1);
  console.log('Checked optional purchase, return cancellation, exact refund, Undo cleanup and repurchase.');

  // A real preview.1-format backup and stored core save keep their old state.
  const legacy = progress(1, 3, {owned: ['counter'], stored: [], style: {counter: 1}, place: {counter: {x: 1, z: 1, rot: 0}}, finaleSeen: false});
  legacy.bestStars.length = legacy.bestMoves.length = 10;
  const roundtrip = await evaluate(`(async () => {const {parseBackup} = await import('/tea-shop/preview/src/game/backup.ts'); return parseBackup(JSON.stringify({format:'decopu-save',version:1,exportedAt:'2026-11-04T00:00:00Z',progress:${JSON.stringify(legacy)},puzzle:null})).progress;})()`);
  assert.deepEqual(roundtrip, {...legacy,bestStars:[...legacy.bestStars,...Array(14).fill(0)],bestMoves:[...legacy.bestMoves,...Array(14).fill(0)]}, 'old ten-board core backup pads without changing existing progress');
  await seed(legacy); assert.deepEqual(await saved(), legacy, 'old score, ownership, style and placement survive reload');
  assert.equal(await available(), 1);

  await seed(progress(24, 1));
  assert.match(await evaluate(`document.querySelector('#play-tea strong').textContent`), /Improve your scores/);
  await tap('#play-tea'); assert.ok(await evaluate(`!!document.querySelector('.play')`));
  await seed(progress(24));
  assert.match(await evaluate(`document.querySelector('#play-tea strong').textContent`), /Revisit puzzles/);
  await tap('#play-tea'); assert.equal(await evaluate(`document.querySelectorAll('.level-btn').length`), 24);
  assert.equal(await evaluate(`document.querySelector('.play')`), null, 'perfect completion opens choice rather than forcing puzzle one');

  const completedShop = await evaluate(`(async () => {const {EDITION_DECORATIONS} = await import('/tea-shop/preview/src/shop/upgrades.ts');const items = EDITION_DECORATIONS.filter(item => !item.optional || ['art','bench','clock','trolley','cabinet','armchair'].includes(item.id));return {owned:items.map(item=>item.id),stored:[],style:{},place:Object.fromEntries(items.map(item=>[item.id,{...item.defaultPlace}])),finaleSeen:true};})()`);
  await seed(progress(24, 3, completedShop), {id: 'basket', style: 2});
  assert.match(await evaluate(`document.querySelector('.personal-goal').textContent`), /Return an optional piece to free up stars/);

  for (const [width, height, name] of [[320,568,'small'], [390,844,'phone'], [1280,900,'desktop']]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor:1, mobile:width<600});
    await seed(progress(6)); await choose('trolley', 1); await checkViewport(); await shot('preview-'+name);
  }
  }

  // Temporary demo goals must never read or overwrite a player's chosen goal.
  await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
  await seed(progress(6), {id:'clock',style:1});
  const realProgress = await saved(), realGoal = await evaluate(`localStorage.getItem('${key}:goal-v1')`);
  const showroomUrl = new URL(previewUrl); showroomUrl.searchParams.set('showroom','1');
  await send('Page.navigate', {url:showroomUrl.href}); await ready(); await tap('#launch-start');
  assert.equal(await evaluate(`(async()=>{const {readGoal}=await import('/tea-shop/preview/src/game/goal.ts');return readGoal(${JSON.stringify(progress(6))});})()`), null, 'showroom does not read the real goal');
  await tap('#edit-toggle'); await tap('[data-filter="owned"]'); await tap('[data-upgrade="basket"]');
  await tap('[data-act="return"]'); await tap('[data-confirm-return]');
  await tap('[data-upgrade="basket"]'); await tap('[data-act="preview"][data-style="2"]'); await tap('[data-act="pin-goal"]');
  assert.match(await evaluate(`document.querySelector('[data-act="pin-goal"]').textContent`), /Your goal/);
  assert.equal(await evaluate(`localStorage.getItem('${key}:goal-v1')`), realGoal, 'pinning a showroom goal preserves the real goal');
  await tap('[data-act="pin-goal"]');
  assert.equal(await evaluate(`localStorage.getItem('${key}:goal-v1')`), realGoal, 'clearing a showroom goal preserves the real goal');
  assert.deepEqual(await saved(), realProgress, 'showroom return and preview preserve the real shop');
  const tourUrl = new URL(previewUrl); tourUrl.searchParams.set('tour','1');
  await send('Page.navigate', {url:tourUrl.href}); await ready();
  const temporaryGoal = await evaluate(`(async()=>{const {readGoal,saveGoal}=await import('/tea-shop/preview/src/game/goal.ts'); const p=${JSON.stringify(progress(0))}; const before=readGoal(p);saveGoal({id:'art',style:2});const after=readGoal(p);saveGoal(null);return{before,after,cleared:readGoal(p)};})()`);
  assert.deepEqual(temporaryGoal, {before:null,after:{id:'art',style:2},cleared:null});
  assert.equal(await evaluate(`localStorage.getItem('${key}:goal-v1')`), realGoal, 'tour goal changes preserve the real goal');
  assert.deepEqual(await saved(), realProgress, 'tour keeps the real shop intact');
  assert.deepEqual(errors, []);
  console.log(process.env.CHOICES_PHASE === 'goals' ? 'PASS: showroom and tour goals remain temporary; pin/clear/return preserve the real goal and shop.' : 'PASS: sixteen model thumbnails, all six unlock boundaries, funded locked goals, real-win optional style handoff, purchase/return/cancel/repurchase, preview.1 backup/save compatibility, completion replay choices, responsive paid previews and temporary showroom/tour goals.');
} finally {
  await send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]}).catch(()=>{});
  ws.close();
}
