// Vite preview at 5174 and an isolated Chromium CDP browser at 9234.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {installReturningPlayerStart} from './browser-start.mjs';

const origin = process.env.GAME_ORIGIN ?? 'http://127.0.0.1:5174';
const base = '/tea-shop/preview/';
const tabs = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9234}/json`)).json();
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
let sequence = 0;
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
  pending.set(++sequence, {resolve, reject}); ws.send(JSON.stringify({id: sequence, method, params}));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));
const until = async expression => {
  for (let attempt = 0; attempt < 180; attempt++) { if (await evaluate(expression)) return; await pause(125); }
  throw Error('Timed out: ' + expression);
};
const tap = async selector => {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element || element.disabled || element.closest('[inert]')) throw Error('Unavailable: ' + ${JSON.stringify(selector)});
    element.scrollIntoView({block: 'nearest'});
    const rect = element.getBoundingClientRect(); return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
  })()`);
  await send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{...point, id: 1}]});
  await send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await pause();
};
const key = 'tea-shop-preview-edition2-progress-v1';
const empty = () => ({owned: [], stored: [], style: {}, place: {}, finaleSeen: false});
const progress = (stars = 0, shop = empty()) => ({muted: true, bestStars: [stars, ...Array(9).fill(0)], bestMoves: Array(10).fill(0), shop});
const saved = () => evaluate(`JSON.parse(localStorage.getItem('${key}'))`);
const available = () => evaluate(`Number(document.querySelector('#shop-stars strong').textContent)`);
const shot = async name => fs.writeFile(`work/edition-walls-${name}.png`, Buffer.from((await send('Page.captureScreenshot')).data, 'base64'));
const navigate = async (search = '?edition=2') => {
  await send('Page.navigate', {url: origin + base + search}); await pause(400);
  await until(`!document.querySelector('#launch-screen') && !!document.querySelector('#shop-canvas')`);
  await evaluate(`(async () => {
    const {Engine} = await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');
    window.wallScene = () => Engine.Instances.find(engine => engine.getRenderingCanvas()?.id === 'shop-canvas')?.scenes[0];
  })()`);
};
const seed = async value => {
  await evaluate(`Object.keys(localStorage).filter(key => key.startsWith('tea-shop-preview-edition2')).forEach(key => localStorage.removeItem(key));
    localStorage.setItem('${key}', ${JSON.stringify(JSON.stringify(value))});
    localStorage.setItem('${key}:guide-v1', 'done');
    localStorage.setItem('tea-shop-preview-edition2-appearance-v1', 'day');`);
  await navigate();
};
const wallState = () => evaluate(`(() => {
  const scene = wallScene(), finish = scene.getTransformNodeByName('edition-wall-finish');
  return {
    finish: !!finish?.isEnabled(), panels: finish?.getChildMeshes().filter(mesh => mesh.isEnabled()).length ?? 0,
    curtains: scene.getTransformNodeByName('curtains')?.isEnabled(),
    foundation: scene.getMeshByName('diorama-foundation')?.isEnabled(),
    walls: ['back-wall', 'left-wall'].every(name => scene.getMeshByName(name)?.isEnabled()),
    material: scene.getMeshByName('back-wall').material.name,
  };
})()`);
const expectFinish = async (visible, note) => {
  const state = await wallState();
  assert.equal(state.finish, visible, note);
  assert.equal(state.panels, visible ? 14 : 0, note + ': twelve panels and two rails');
  assert.equal(state.curtains, visible, note + ': curtains follow paint ownership');
  assert.equal(state.foundation, true, 'foundation remains structural');
  assert.equal(state.walls, true, 'base walls remain structural');
};

await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setBypassServiceWorker', {bypass: true});
const clear = await installReturningPlayerStart(send);
try {
  await fs.mkdir('work', {recursive: true});
  await send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1});
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await navigate(); await seed(progress());
  await expectFinish(false, 'fresh zero-progress room has bare walls');
  assert.deepEqual((await saved()).shop.owned, []);
  await shot('bare-phone');
  await tap('#theme-toggle'); await expectFinish(false, 'night keeps unowned finish hidden'); await shot('bare-night-phone');
  await tap('#theme-toggle');
  await send('Emulation.setDeviceMetricsOverride', {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  await pause(250); await shot('bare-desktop');
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  const counter = {...empty(), owned: ['counter'], style: {counter: 1}, place: {counter: {x: 1, z: 1, rot: 0}}};
  await seed(progress(3, counter)); await expectFinish(false, 'a counter purchase cannot grant the wall finish');

  await seed(progress(3)); const before = await saved();
  await tap('#edit-toggle'); await tap('[data-upgrade="paint"]');
  const colors = ['#eadfcd', '#bccbb9', '#dcbab0'];
  for (let style = 0; style < 3; style++) {
    await tap(`[data-act="preview"][data-style="${style}"]`);
    await expectFinish(true, `free wall preview style ${style}`);
    assert.equal((await wallState()).material, 'wall-live-' + colors[style]);
    assert.deepEqual(await saved(), before, 'preview cannot spend or grant ownership');
    assert.equal(await available(), 3);
  }
  await shot('free-preview-phone');
  await tap('#editor-back'); await expectFinish(false, 'Browse cancels unpaid wall finish');
  await tap('[data-upgrade="counter"]'); await expectFinish(false, 'another item preview keeps walls bare');
  await tap('#editor-back'); await tap('[data-upgrade="paint"]');
  await tap('#edit-toggle'); await expectFinish(false, 'Done cancels unpaid wall finish');
  assert.deepEqual(await saved(), before);

  await tap('#edit-toggle'); await tap('[data-upgrade="paint"]');
  await tap('[data-act="preview"][data-style="1"]'); await tap('[data-act="buy"]');
  assert.deepEqual((await saved()).shop.owned, ['paint']);
  assert.equal((await saved()).shop.style.paint, 1); assert.equal(await available(), 0, 'wall upgrade costs exactly three stars');
  await expectFinish(true, 'purchase keeps the wall finish');
  await tap('#edit-toggle'); await pause(400); await shot('bought-phone');
  await tap('#theme-toggle'); await expectFinish(true, 'night keeps owned finish'); await shot('bought-night-phone');
  await navigate(); await expectFinish(true, 'paid wall finish survives reload');
  assert.equal((await saved()).shop.style.paint, 1);
  const bought = await saved();
  await tap('#edit-toggle'); await tap('[data-filter="all"]'); await tap('[data-upgrade="counter"]');
  await expectFinish(true, 'unrelated preview preserves owned wall finish');
  await tap('#edit-toggle'); assert.deepEqual(await saved(), bought);
  await tap('#theme-toggle');
  await send('Emulation.setDeviceMetricsOverride', {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  await pause(250); await shot('bought-desktop');

  // Isolate room synchronization from purchase sparkle effects and the visible scene.
  const lifecycle = await evaluate(`(async () => {
    const {Engine} = await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');
    const {Scene} = await import('${base}node_modules/.vite/deps/@babylonjs_core_scene.js');
    const {createShopVisuals, applyRoomStyle} = await import('${base}src/shop/meshes.ts');
    const scene = new Scene(Engine.Instances[0]), visuals = createShopVisuals(scene);
    const bare = {owned: [], stored: [], style: {}, place: {}, finaleSeen: false};
    const counts = () => ({meshes: scene.meshes.length, materials: scene.materials.length, textures: scene.textures.length, transforms: scene.transformNodes.length});
    applyRoomStyle(visuals, bare, scene); const initial = counts(), problems = [];
    for (let i = 0; i < 36; i++) {
      const preview = structuredClone(bare); preview.owned.push('paint'); preview.style.paint = i % 3;
      applyRoomStyle(visuals, preview, scene);
      if (!visuals.wallFinish.isEnabled() || !visuals.curtains.isEnabled()) problems.push('preview');
      applyRoomStyle(visuals, bare, scene);
      if (visuals.wallFinish.isEnabled() || visuals.curtains.isEnabled()) problems.push('cancel');
    }
    const final = counts(); scene.dispose(); return {initial, final, problems, disposed: scene.isDisposed};
  })()`);
  assert.deepEqual(lifecycle.problems, []); assert.deepEqual(lifecycle.final, lifecycle.initial);
  assert.equal(lifecycle.disposed, true);

  await navigate('');
  assert.equal(await evaluate(`wallScene().getTransformNodeByName('edition-wall-finish')`), null, 'classic mode has no edition finish group');
  assert.deepEqual(errors, []);
  console.log('PASS: bare fresh/counter-only walls, three free styles, Browse/Done cancellation, exact paid purchase/reload, owned-finish preservation, phone/desktop day/night and classic isolation; 36 room preview cycles keep resources stable.', lifecycle);
} finally {await clear(); ws.close();}
