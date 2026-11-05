// Real-touch coverage for the second edition's six-puzzle continuation.
// Run against HMR-free Vite (default 5181) and isolated Chromium CDP (default 9237).
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const previewUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5181/tea-shop/preview/?edition=2';
const phase = process.env.SESSION_PHASE ?? 'all';
assert.ok(['all','legacy','gates','visuals','keeper'].includes(phase));
const tabs = await (await fetch(`http://127.0.0.1:${process.env.CDP_PORT ?? 9237}/json`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
let sequence = 0;
const requests = new Map(), errors = [], evidence = {};
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = requests.get(message.id); requests.delete(message.id);
    message.error ? request.reject(message.error) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  requests.set(++sequence, {resolve, reject}); ws.send(JSON.stringify({id: sequence, method, params}));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = (ms = 160) => new Promise(resolve => setTimeout(resolve, ms));
const until = async expression => {
  for (let i = 0; i < 480; i++) { if (await evaluate(expression)) return; await pause(125); }
  throw Error('Timed out: ' + expression);
};
const tap = async selector => {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element || element.disabled || element.closest('[inert]') || !element.checkVisibility()) throw Error('Unavailable: ' + ${JSON.stringify(selector)});
    element.scrollIntoView({block: 'nearest', behavior: 'instant'});
    const rect = element.getBoundingClientRect(); return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
  })()`);
  await send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{...point, id: 1}]});
  await send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await pause();
};
const key = 'tea-shop-preview-edition2-progress-v1';
const appearanceKey = 'tea-shop-preview-edition2-appearance-v1';
const base = new URL('./', previewUrl).pathname;
const modulePath = path => JSON.stringify(base + 'src/' + path);
const saved = () => evaluate(`JSON.parse(localStorage.getItem('${key}'))`);
const available = () => evaluate(`Number(document.querySelector('#shop-stars strong').textContent)`);
const emptyShop = () => ({owned: [], stored: [], style: {}, place: {}, finaleSeen: true});
const progress = (count, options = {}) => ({muted: true,
  bestStars: Array.from({length: options.length ?? 16}, (_, i) => i < count ? options.stars ?? 3 : 0),
  bestMoves: Array.from({length: options.length ?? 16}, (_, i) => i < count ? i + 3 : 0),
  shop: options.shop ?? emptyShop()});
const ready = async () => {
  await pause(400);
  for (let i = 0; i < 480; i++) {
    try { if (await evaluate(`document.readyState === 'complete' && document.querySelector('#launch-start')?.disabled === false`)) return; }
    catch (error) {
      // Reload can destroy a polling evaluation's context. Retry only that
      // transport race here; interactions and application exceptions still fail.
      if (error?.code !== -32000 || !/navigated|context.*destroyed|Cannot find context/i.test(error.message)) throw error;
    }
    await pause(125);
  }
  throw Error('Start did not become ready after navigation');
};
const enter = async () => { await ready(); await tap('#launch-start'); };
const seed = async (value, {goal = null, puzzle = null, night = false} = {}) => {
  await evaluate(`Object.keys(localStorage).filter(k => k.startsWith('tea-shop-preview-edition2')).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('${key}', ${JSON.stringify(JSON.stringify(value))});
    localStorage.setItem('${key}:guide-v1', 'done');
    localStorage.setItem('${appearanceKey}', '${night ? 'night' : 'day'}');
    ${goal ? `localStorage.setItem('${key}:goal-v1', ${JSON.stringify(JSON.stringify(goal))});` : ''}
    ${puzzle ? `localStorage.setItem('${key}:puzzle-v1', ${JSON.stringify(JSON.stringify(puzzle))});` : ''}`);
  await send('Page.reload'); await enter();
};
const otherSaves = () => evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().filter(k => !k.startsWith('tea-shop-preview-edition2')).map(k => [k,localStorage.getItem(k)])))`);
const shot = async name => fs.writeFile(`work/edition-session-${name}.png`, Buffer.from((await send('Page.captureScreenshot')).data, 'base64'));
const viewport = (width = 390, height = 844) => send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: width < 600});
const choose = async (id, style = 0) => {
  if (!await evaluate(`document.querySelector('.shop-room').classList.contains('decorating')`)) await tap('#edit-toggle');
  await tap(`[data-upgrade="${id}"]`); await tap(`[data-act="preview"][data-style="${style}"]`);
};
const solveLevel = async id => evaluate(`(async () => {
  const {EDITION_LEVELS} = await import(${modulePath('game/edition-levels.ts')});
  const {boardFromLevel} = await import(${modulePath('game/engine.ts')});
  const {solve} = await import(${modulePath('game/solver.ts')});
  const solution = solve(boardFromLevel(EDITION_LEVELS[${id - 1}]));
  if (!solution.solvable) throw Error('No solution for ${id}');
  return solution.moves;
})()`);
const finishLevel = async id => {
  for (const {from, to} of await solveLevel(id)) {
    await tap(`[data-jar="${from}"]`); await tap(`[data-jar="${to}"]`);
    await until(`document.querySelector('.shelves')?.getAttribute('aria-busy') === 'false'`);
  }
  await until(`!!document.querySelector('.result-overlay')`);
};
const openBackup = async () => { await tap('.settings-menu summary'); await tap('#backup-progress'); };
const importCandidate = async backup => {
  await evaluate(`(() => {
    const input = document.querySelector('[data-import]'), transfer = new DataTransfer();
    transfer.items.add(new File([${JSON.stringify(JSON.stringify(backup))}], 'Decopu-legacy.json', {type:'application/json'}));
    document.querySelector('[data-status]').textContent = '';
    input.files = transfer.files; input.dispatchEvent(new Event('change', {bubbles: true}));
  })()`); await until(`!!document.querySelector('[data-status]').textContent`);
};
const checkViewport = async () => {
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), 'no horizontal page overflow');
  assert.ok(await evaluate(`(() => {const e = document.querySelector('[data-act="buy"]'); if (!e) return true; const r = e.getBoundingClientRect(); return r.x >= 0 && r.right <= innerWidth + 1 && r.y >= 0 && r.bottom <= innerHeight + 1;})()`), 'purchase action remains visible');
};

try {
  await fs.mkdir('work', {recursive: true});
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', {bypass: true});
  await send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 1}); await viewport();
  await send('Page.navigate', {url: previewUrl}); await ready();
  await evaluate(`localStorage.setItem('tea-shop-progress-v1','main-save-sentinel');localStorage.setItem('tea-shop-preview-progress-v1','classic-save-sentinel');localStorage.setItem('tea-shop-preview-appearance-v1','night');`);
  const sentinels = await otherSaves();

  if (phase === 'all' || phase === 'legacy') {
  const oldShop = await evaluate(`(async () => {
    const {UPGRADE_BY_ID} = await import(${modulePath('shop/upgrades.ts')});
    return {owned:['counter','lamp','bench'], stored:['bench'], style:{counter:1,lamp:2,bench:1},
      place:Object.fromEntries(['counter','lamp','bench'].map(id => [id,{...UPGRADE_BY_ID[id].defaultPlace}])),finaleSeen:true};
  })()`);
  const old = progress(9, {length: 10, shop: oldShop});
  const firstMove = (await solveLevel(10))[0];
  const unfinished = {version: 1, levelId: 10, actions: [[firstMove.from, firstMove.to]]};
  const oldGoal = {id: 'basket', style: 2};
  await seed(old, {goal: oldGoal, puzzle: unfinished, night: true});
  assert.match(await evaluate(`document.querySelector('.preview-bar').textContent`), /0\.2\.0-preview\.5/);
  assert.equal(await evaluate(`!!document.querySelector('[data-guide-start], [data-guide-skip]')`), false, 'existing player does not repeat onboarding');
  assert.deepEqual((await saved()).shop, oldShop);
  assert.equal(await evaluate(`localStorage.getItem('${appearanceKey}')`), 'night');
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('${key}:goal-v1'))`), oldGoal);
  await tap('#play-tea');
  assert.match(await evaluate(`document.querySelector('.play h2').textContent`), /Your Opening Day/);
  assert.match(await evaluate(`document.querySelector('.moves').textContent`), /^1 move$/);
  assert.equal(await evaluate(`document.querySelector('#undo').disabled`), false);
  await tap('#undo'); assert.match(await evaluate(`document.querySelector('.moves').textContent`), /^0 moves$/);
  await send('Page.reload'); await enter(); await tap('#play-tea');
  assert.match(await evaluate(`document.querySelector('.moves').textContent`), /^0 moves$/);
  const completedOld = progress(10, {length: 10, shop: oldShop});
  await seed(completedOld, {goal: oldGoal, night: true});
  await tap('#play-tea');
  assert.equal(await evaluate(`document.querySelector('.play h2').textContent`), await evaluate(`(async()=>{const {EDITION_LEVELS}=await import(${modulePath('game/edition-levels.ts')});return EDITION_LEVELS[10].name;})()`), 'old complete saves continue at puzzle eleven');
  await tap('[data-go="levels"]'); assert.equal(await evaluate(`document.querySelectorAll('.level-btn').length`), 16);
  await tap('[data-go="shop"]');
  evidence.legacyLocal = true;
  console.log('PASS: old local scores, ownership, styles, storage, goal, appearance and unfinished Undo; next puzzle11.');

  // Import through the actual file picker and confirmation, not just the parser.
  const legacyBackup = {format:'decopu-save',version:1,exportedAt:'2026-11-04T00:00:00Z',progress:old,puzzle:unfinished};
  await openBackup(); const beforeRestore = await saved(); await importCandidate(legacyBackup);
  assert.match(await evaluate(`document.querySelector('[data-summary]').textContent`), /9 completed puzzles and 3 owned decorations plus an unfinished puzzle/);
  await tap('[data-cancel]'); assert.deepEqual(await saved(), beforeRestore);
  await importCandidate(legacyBackup); await tap('[data-restore]');
  await until(`!document.querySelector('.backup-dialog')`);
  const restored = await saved();
  assert.deepEqual(restored.bestStars, [...old.bestStars, ...Array(6).fill(0)]);
  assert.deepEqual(restored.bestMoves, [...old.bestMoves, ...Array(6).fill(0)]);
  assert.deepEqual(restored.shop, oldShop); assert.equal(restored.muted, old.muted);
  await tap('#play-tea'); assert.match(await evaluate(`document.querySelector('.moves').textContent`), /^1 move$/);
  await tap('[data-go="levels"]'); await tap('[data-go="shop"]');
  await openBackup(); await importCandidate({...legacyBackup, progress: progress(0,{length:38}), puzzle:null});
  assert.match(await evaluate(`document.querySelector('[data-status]').textContent`), /invalid|different|edition|progress/i);
  assert.equal(await evaluate(`document.querySelector('[data-confirm]').classList.contains('hidden')`), true);
  assert.deepEqual(await saved(), restored); await tap('.backup-close');
  const backupModes = await evaluate(`(async () => {
    const {parseBackup, exportBackup} = await import(${modulePath('game/backup.ts')});
    const exported = JSON.parse(exportBackup(${JSON.stringify(restored)},${JSON.stringify(unfinished)}));
    let mismatchRejected = false; try {parseBackup(JSON.stringify({...exported,edition:'classic'}));} catch {mismatchRejected = true;}
    return {tag:exported.edition, mismatchRejected, count:parseBackup(JSON.stringify(exported)).progress.bestStars.length};
  })()`);
  assert.deepEqual(backupModes,{tag:'second-edition',mismatchRejected:true,count:16});
  evidence.backups = backupModes;
  console.log('PASS: legacy10 backup UI cancel/restore, zero-padding, unfinished resume, classic rejection and tagged16 roundtrip.');
  }

  if (phase === 'all' || phase === 'gates') {
  for (const [id, gate, price, title] of [['terrarium',13,10,'Glass garden'],['botanical',16,14,'Botanical triptych']]) {
    await seed(progress(gate - 1), {goal:{id,style:2}});
    const before = await saved(), earnedBefore = await available();
    assert.match(await evaluate(`document.querySelector('.personal-goal').textContent`), /1 more puzzle to unlock/);
    assert.doesNotMatch(await evaluate(`document.querySelector('.personal-goal').textContent`), /Ready to make/);
    await choose(id, 2);
    await evaluate(`document.querySelectorAll('.style-card img, .style-options img, .variant-grid img, .model-thumbnail img').forEach(img=>img.loading='eager')`);
    await until(`document.querySelectorAll('[data-act="preview"] img').length === 3 && [...document.querySelectorAll('[data-act="preview"] img')].every(img => img.complete && img.naturalWidth > 0)`);
    assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').disabled`), true);
    assert.match(await evaluate(`document.querySelector('[data-act="buy"]').textContent`), new RegExp(`Unlock at ${gate}`));
    assert.deepEqual(await saved(), before); await tap('#editor-back'); assert.deepEqual(await saved(), before);
    await tap('#edit-toggle'); await tap('#play-tea'); await finishLevel(gate);
    assert.equal((await saved()).bestStars[gate - 1],3);
    assert.match(await evaluate(`document.querySelector('.milestone-reward').textContent`), new RegExp(title));
    if (gate === 16) assert.match(await evaluate(`document.querySelector('.milestone-reward').textContent`), /\+4 stars/);
    await shot(id+'-unlocked'); await tap(`.result-overlay [data-reward="${id}"]`);
    assert.equal(await evaluate(`document.querySelector('[data-act="preview"][aria-pressed="true"]').dataset.style`),'2');
    const unlocked = await available(); assert.equal(unlocked,earnedBefore+3+(gate===16?4:0));
    assert.equal(await evaluate(`document.querySelector('[data-act="buy"]').disabled`),false);
    await tap('[data-act="buy"]'); assert.equal(await available(),unlocked-price);
    assert.equal((await saved()).shop.style[id],2); assert.deepEqual((await saved()).shop.owned,[id]);
    await tap('[data-act="style"][data-style="0"]'); assert.equal(await available(),unlocked-price);
    assert.equal((await saved()).shop.style[id],0,'included styles are free after purchase');
    const purchased = await saved(); await tap('[data-act="return"]'); await tap('[data-cancel-return]');
    assert.deepEqual(await saved(),purchased); await tap('[data-act="return"]'); await tap('[data-confirm-return]');
    assert.equal(await available(),unlocked); assert.deepEqual((await saved()).shop.owned,[]);
    await tap(`[data-upgrade="${id}"]`); await tap('[data-act="preview"][data-style="1"]'); await tap('[data-act="buy"]');
    assert.equal(await available(),unlocked-price); await tap('#edit-toggle');
    await send('Page.reload'); await enter(); assert.equal((await saved()).shop.style[id],1);
    const beforeReplay = await available(); await tap('.settings-menu summary'); await tap('#browse-puzzles');
    const chapter = `.puzzle-chapter:has(.level-btn[data-level="${gate}"])`;
    if (!await evaluate(`document.querySelector(${JSON.stringify(chapter)}).open`)) await tap(chapter+' > summary');
    await tap(`.level-btn[data-level="${gate}"]`);
    assert.equal(await evaluate(`document.querySelector('.play h2').textContent`), await evaluate(`(async()=>{const {EDITION_LEVELS}=await import(${modulePath('game/edition-levels.ts')});return EDITION_LEVELS[${gate-1}].name;})()`));
    await finishLevel(gate); assert.match(await evaluate(`document.querySelector('.result-reward').textContent`), /Best stars already collected/);
    assert.equal(await evaluate(`!!document.querySelector('.milestone-reward')`),false,'replay cannot farm milestone bonus');
    await tap('.result-overlay [data-go="shop"]'); assert.equal(await available(),beforeReplay);
    evidence[id] = {gate,price,earned:unlocked,extraBonus:gate===16?4:0};
    console.log(`PASS: ${title} gate${gate}, actual touch win, free preview/cancel, purchase/styles, return/cancel/repurchase and replay.`);
  }
  }

  if (phase === 'all' || phase === 'keeper') {
    const keeperState = async () => evaluate(`(async () => {
      const {Engine}=await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');
      const scene=Engine.Instances.find(engine=>engine.getRenderingCanvas()?.id==='shop-canvas')?.scenes[0];
      const roots=scene.transformNodes.filter(node=>node.name==='shopkeeper');
      const keeper=roots[0];
      return {count:roots.length,enabled:keeper?.isEnabled()??false,
        visibleMeshes:keeper?.getChildMeshes().filter(mesh=>mesh.isEnabled()&&mesh.isVisible&&mesh.visibility>0&&mesh.getTotalVertices()>0).length??0,
        position:keeper?{x:keeper.position.x,z:keeper.position.z}:null,rotation:keeper?.rotation.y??null};
    })()`);
    const expectKeeper = async (expected, label) => {
      const state=await keeperState();assert.equal(state.enabled,expected,label);
      assert.ok(state.count<=1,'keeper is pooled, not duplicated');
      if(expected) assert.ok(state.visibleMeshes>=8,'enabled keeper has visible geometry');
      return state;
    };
    const expectBehindCounter = async () => {
      const state=await expectKeeper(true,'purchased counter displays its keeper');
      const placement=(await saved()).shop.place.counter;
      const center=await evaluate(`(async()=>{const {floorCenter}=await import(${modulePath('shop/grid.ts')});const {UPGRADE_BY_ID}=await import(${modulePath('shop/upgrades.ts')});return floorCenter(UPGRADE_BY_ID.counter.size,${JSON.stringify(placement)});})()`);
      const angle=placement.rot*Math.PI/2,dx=state.position.x-center.x,dz=state.position.z-center.z;
      assert.ok(dx*Math.sin(angle)+dz*Math.cos(angle)<-.8,'keeper stands in rear working aisle');
      assert.ok(Math.abs(Math.hypot(dx,dz)-1)<.01,'keeper stays beside the counter');
      assert.ok(Math.abs(state.rotation-angle)<.01,'keeper faces the customer side');
    };
    await viewport();await seed(progress(1,{shop:{...emptyShop(),finaleSeen:false}}));
    await expectKeeper(false,'fresh room has no keeper before a counter');
    const before=await saved();await choose('counter',2);await expectKeeper(true,'free counter preview shows keeper');
    await tap('#editor-back');await expectKeeper(false,'cancelling unowned counter hides keeper');assert.deepEqual(await saved(),before);
    await choose('counter',1);await tap('[data-act="buy"]');
    assert.equal((await saved()).shop.finaleSeen,false,'test must not rely on completing the shop');
    await expectBehindCounter();await tap('#edit-toggle');await pause(400);await shot('keeper-first-counter-phone');
    await tap('#edit-toggle');await tap('[data-filter="owned"]');await tap('[data-upgrade="counter"]');
    await tap('[data-act="store"]');await expectKeeper(false,'stored counter hides keeper');
    await tap('[data-act="place"]');await expectBehindCounter();
    for(let turn=0;turn<2;turn++){await tap('[data-act="rotate"]');await expectBehindCounter();}
    const rotated=(await saved()).shop.place.counter;await tap('#edit-toggle');await send('Page.reload');await enter();
    assert.deepEqual((await saved()).shop.place.counter,rotated);await expectBehindCounter();
    await tap('#theme-toggle');await pause(400);await shot('keeper-counter-night-phone');
    evidence.keeper={firstPurchaseBeforeFinale:true,previewCancel:true,storeRestore:true,rotation:true,reload:true};
    console.log('PASS: first-counter keeper preview/cancel, purchase before finale, storage/restore, rotation, reload and day/night.');
  }

  if (phase === 'all' || phase === 'visuals') {
  const decorated = await evaluate(`(async () => {
    const {editionShowroomShop} = await import(${modulePath('game/preview.ts')});
    const {sanitizeShop} = await import(${modulePath('shop/grid.ts')});
    const keep=['counter','sign','paint','shelves','plant','rug','lamp','table','terrarium','botanical'];
    const shop=editionShowroomShop(); shop.owned=shop.owned.filter(id=>keep.includes(id));
    shop.stored=shop.stored.filter(id=>keep.includes(id));
    shop.style=Object.fromEntries(Object.entries(shop.style).filter(([id])=>keep.includes(id)));
    shop.place=Object.fromEntries(Object.entries(shop.place).filter(([id])=>keep.includes(id)));return sanitizeShop(shop);
  })()`);
  assert.equal(decorated.stored.includes('terrarium'),false); assert.equal(decorated.stored.includes('botanical'),false);
  await seed(progress(16,{shop:decorated})); await pause(900); await shot('room-day-phone');
  await tap('#theme-toggle'); await pause(900); await shot('room-night-phone');
  await viewport(1280,900); await pause(600); await shot('room-night-desktop'); await tap('#theme-toggle'); await pause(500); await shot('room-day-desktop');
  for (const [width,height,name] of [[320,568,'small-phone'],[390,844,'phone'],[844,390,'landscape']]) {
    await viewport(width,height); await seed(progress(15)); await tap('#play-tea');
    assert.equal(await evaluate(`document.querySelector('.shelves').dataset.capacity`),'5');
    assert.ok(await evaluate(`[...document.querySelectorAll('.stack')].every(stack=>stack.children.length===5)`));
    assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`));
    await shot('tall-puzzle-'+name); console.log('Captured tall-puzzle-'+name);
    const jarBounds = await evaluate(`(()=>{const shelves=document.querySelector('.shelves').getBoundingClientRect();return [...document.querySelectorAll('.jar')].map(e=>{const r=e.getBoundingClientRect();return {inside:r.x>=shelves.x-1&&r.right<=shelves.right+1&&r.y>=shelves.y-1&&r.bottom<=shelves.bottom+1,height:r.height,rect:r.toJSON(),shelf:shelves.toJSON()};});})()`);
    await fs.writeFile('work/edition-session-tall-'+name+'-bounds.json',JSON.stringify(jarBounds,null,2));
    assert.ok(jarBounds.every(b=>b.inside&&b.height>50),'tall jars stay inside the shelf');
    if(width===320&&height===568) {
      const scroll=await evaluate(`(()=>{const shelf=document.querySelector('.shelves'),row=shelf.querySelector('.shelf-row'),plank=shelf.querySelector('.plank'),style=getComputedStyle(shelf);return {scrollHeight:shelf.scrollHeight,clientHeight:shelf.clientHeight,padding:style.padding,overflowY:style.overflowY,shelf:shelf.getBoundingClientRect().toJSON(),row:row.getBoundingClientRect().toJSON(),rowMargin:getComputedStyle(row).margin,plank:plank.getBoundingClientRect().toJSON(),plankMargin:getComputedStyle(plank).margin};})()`);
      await fs.writeFile('work/edition-session-tall-small-scroll.json',JSON.stringify(scroll,null,2));
      assert.ok(scroll.scrollHeight<=scroll.clientHeight+1,'small-phone tall shelf including plank fits without vertical scrolling: '+JSON.stringify(scroll));
    }
    await seed(progress(16)); await choose('botanical',2); await checkViewport(); await shot('botanical-preview-'+name);
  }
  await viewport(); await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await seed(progress(13)); await tap('#play-tea'); assert.equal(await evaluate(`document.querySelector('.shelves').dataset.capacity`),'5');
  await finishLevel(14); assert.equal((await saved()).bestStars[13],3); await shot('reduced-motion-win');
  await send('Emulation.setEmulatedMedia',{features:[]});
  evidence.viewports=['390×844','320×568','844×390','1280×900']; evidence.reducedMotion=true;
  console.log('PASS: final room day/night, responsive tall jars and reward previews, reduced motion.');
  }
  assert.equal(await otherSaves(),sentinels,'all edition operations preserve main/classic storage');
  assert.deepEqual(errors,[]);
  evidence.errors=errors; evidence.phase=phase;
  await fs.writeFile(`work/edition-session-${phase === 'all' ? 'check' : phase+'-check'}.json`,JSON.stringify(evidence,null,2));
  console.log('PASS: main/classic isolation; session suite phase '+phase+'.');
} finally {
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}).catch(()=>{});
  ws.close();
}
