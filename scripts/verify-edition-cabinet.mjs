// Preview.7 browser coverage. Use HMR-free Vite 5185 and isolated CDP 9241.
// All saves belong to this disposable test browser; application debug hooks are not added.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const origin=process.env.GAME_ORIGIN??'http://127.0.0.1:5185';
const base='/tea-shop/preview/', key='tea-shop-preview-edition2-progress-v1';
const phase=process.env.CABINET_PHASE??'all';
assert.ok(['all','legacy','purchase','visuals','lifecycle'].includes(phase));
const tabs=await(await fetch('http://127.0.0.1:'+(process.env.CDP_PORT??9241)+'/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(),errors=[],evidence={};
ws.addEventListener('message',event=>{
 const m=JSON.parse(event.data);
 if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}
 if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);
});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const page=(fn,...args)=>evaluate('('+fn.toString()+')('+args.map(a=>JSON.stringify(a)).join(',')+')');
const pause=(ms=140)=>new Promise(r=>setTimeout(r,ms));
const until=async(fn,...args)=>{for(let i=0;i<600;i++){if(await page(fn,...args))return;await pause(125);}throw Error('Timed out: '+fn);};
const tap=async selector=>{
 const p=await page(selector=>{const e=document.querySelector(selector);if(!e||e.disabled||e.closest('[inert]')||!e.checkVisibility())throw Error('Unavailable '+selector);e.scrollIntoView({block:'nearest',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},selector);
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause();
};
const viewport=(width=390,height=844)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
const shot=async name=>fs.writeFile('work/edition-cabinet-'+name+'.png',Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const saved=()=>page(key=>JSON.parse(localStorage.getItem(key)),key);
const available=()=>page(()=>Number(document.querySelector('#shop-stars strong').textContent));
const outsideSaves=()=>page(()=>JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().filter(k=>!k.startsWith('tea-shop-preview-edition2')).map(k=>[k,localStorage.getItem(k)]))));
const emptyShop=()=>({owned:[],stored:[],style:{},place:{},finaleSeen:true});
const progress=(count,{length=20,stars=3,shop=emptyShop()}={})=>({muted:true,bestStars:Array.from({length},(_,i)=>i<count?stars:0),bestMoves:Array.from({length},(_,i)=>i<count?i+3:0),shop});
const ready=async()=>{
 await pause(400); // Let reload leave the old ready document before polling.
 for(let i=0;i<600;i++){
  try{if(await page(()=>document.readyState==='complete'&&document.querySelector('#launch-start')?.disabled===false))return;}
  catch(e){if(e?.code!==-32000||!/navigated|context.*destroyed|Cannot find context/i.test(e.message))throw e;}
  await pause(125);
 }throw Error('Start did not become ready');
};
const enter=async()=>{await ready();await tap('#launch-start');await until(()=>!!document.querySelector('#shop-canvas'));};
const seed=async(value,{goal=null,puzzle=null,night=false,recovery=false}={})=>{
 await page((value,goal,puzzle,night,recovery,key)=>{
  Object.keys(localStorage).filter(k=>k.startsWith('tea-shop-preview-edition2')).forEach(k=>localStorage.removeItem(k));
  localStorage.setItem(key,recovery?'broken-primary':JSON.stringify(value));
  if(recovery)localStorage.setItem(key+':recovery',JSON.stringify(value));
  localStorage.setItem(key+':guide-v1','done');
  localStorage.setItem('tea-shop-preview-edition2-appearance-v1',night?'night':'day');
  if(goal)localStorage.setItem(key+':goal-v1',JSON.stringify(goal));
  if(puzzle)localStorage.setItem(key+':puzzle-v1',JSON.stringify(puzzle));
 },value,goal,puzzle,night,recovery,key);
 await send('Page.reload');await enter();
};
const openEditor=async()=>{
 if(!await page(()=>document.querySelector('.shop-room').classList.contains('decorating')))await tap('#edit-toggle');
};
const choose=async(id,style=0)=>{
 await openEditor();await tap('[data-filter="all"]');await tap('[data-upgrade="'+id+'"]');await tap('[data-act="preview"][data-style="'+style+'"]');
};
const solveLevel=id=>page(async id=>{
 const {EDITION_LEVELS}=await import(window.qaBase+'src/game/edition-levels.ts');
 const {boardFromLevel}=await import(window.qaBase+'src/game/engine.ts');
 const {solve}=await import(window.qaBase+'src/game/solver.ts');
 const result=solve(boardFromLevel(EDITION_LEVELS[id-1]));if(!result.solvable)throw Error('Unsolvable '+id);return result.moves;
},id);
const levelName=id=>page(async id=>(await import(window.qaBase+'src/game/edition-levels.ts')).EDITION_LEVELS[id-1].name,id);
const finishLevel=async id=>{
 assert.equal(await page(()=>document.querySelector('.play h2').textContent),await levelName(id));
 for(const {from,to} of await solveLevel(id)){
  await tap('[data-jar="'+from+'"]');await tap('[data-jar="'+to+'"]');
  await until(()=>document.querySelector('.shelves')?.getAttribute('aria-busy')==='false');
 }
 await until(()=>!!document.querySelector('.result-overlay'));
};
const openBackup=async()=>{await tap('.settings-menu summary');await tap('#backup-progress');};
const importCandidate=async backup=>{
 await page(backup=>{const input=document.querySelector('[data-import]'),dt=new DataTransfer();dt.items.add(new File([JSON.stringify(backup)],'Decopu-backup.json',{type:'application/json'}));document.querySelector('[data-status]').textContent='';input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));},backup);
 await until(()=>!!document.querySelector('[data-status]').textContent);
};
const previewFits=()=>page(()=>{const e=document.querySelector('[data-act="buy"]');const r=e.getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&r.x>=0&&r.right<=innerWidth+1&&r.y>=0&&r.bottom<=innerHeight+1;});

try{
 await fs.mkdir('work',{recursive:true});await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
 await send('Network.setBypassServiceWorker',{bypass:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.qaBase='+JSON.stringify(base)+';'});
 await viewport();await send('Page.navigate',{url:origin+base+'?edition=2'});await ready();
 await page(()=>{localStorage.setItem('tea-shop-progress-v1','main-cabinet-sentinel');localStorage.setItem('tea-shop-progress-v1:recovery','main-recovery-sentinel');localStorage.setItem('tea-shop-preview-progress-v1','classic-cabinet-sentinel');localStorage.setItem('tea-shop-preview-appearance-v1','night');localStorage.setItem('cabinet-unrelated','keep');});
 const sentinels=await outsideSaves();

 if(phase==='all'||phase==='legacy'){
  const oldShop=await page(async()=>{const {UPGRADE_BY_ID}=await import(window.qaBase+'src/shop/upgrades.ts');return{owned:['counter','lamp','bench'],stored:['bench'],style:{counter:1,lamp:2,bench:1},place:Object.fromEntries(['counter','lamp','bench'].map(id=>[id,{...UPGRADE_BY_ID[id].defaultPlace}])),finaleSeen:true};});
  const old=progress(15,{length:16,shop:oldShop}),move=(await solveLevel(16))[0],unfinished={version:1,levelId:16,actions:[[move.from,move.to]]},goal={id:'botanical',style:2};
  await seed(old,{goal,puzzle:unfinished,night:true});
  assert.match(await page(()=>document.querySelector('.preview-bar').textContent),/0\.2\.0-preview\.7/);
  assert.equal(await page(()=>!!document.querySelector('[data-guide-start], [data-guide-skip]')),false);
  assert.deepEqual((await saved()).shop,oldShop);
  assert.deepEqual(await page(key=>JSON.parse(localStorage.getItem(key+':goal-v1')),key),goal);
  assert.equal(await page(()=>localStorage.getItem('tea-shop-preview-edition2-appearance-v1')),'night');
  assert.equal(await available(),49,'15 old three-star scores plus unchanged bonuses minus old purchases');
  await tap('#play-tea');assert.equal(await page(()=>document.querySelector('.play h2').textContent),await levelName(16));
  assert.match(await page(()=>document.querySelector('.moves').textContent),/^1 move$/);await tap('#undo');assert.match(await page(()=>document.querySelector('.moves').textContent),/^0 moves$/);
  await send('Page.reload');await enter();await tap('#play-tea');assert.match(await page(()=>document.querySelector('.moves').textContent),/^0 moves$/);
  await seed(progress(16,{length:16,shop:oldShop}),{goal,night:true});
  assert.equal(await available(),56);await tap('#play-tea');assert.equal(await page(()=>document.querySelector('.play h2').textContent),await levelName(17));
  await tap('[data-go="levels"]');assert.equal(await page(()=>document.querySelectorAll('.level-btn').length),20);await tap('[data-go="shop"]');
  await seed(old,{goal,puzzle:unfinished,night:true,recovery:true});assert.equal(await available(),49);await tap('#play-tea');assert.equal(await page(()=>document.querySelector('.play h2').textContent),await levelName(16));await tap('[data-go="levels"]');await tap('[data-go="shop"]');
  evidence.legacyLocal={sixteenToTwenty:true,nextLevel:17,resumeUndo:true,recovery:true,unchangedBalance:true};
  for(const length of [10,16]){
   const candidateProgress=progress(length-1,{length,shop:oldShop}),first=(await solveLevel(length))[0];
   const puzzle={version:1,levelId:length,actions:[[first.from,first.to]]};
   const backup={format:'decopu-save',version:1,exportedAt:'2026-11-04T00:00:00Z',progress:candidateProgress,puzzle,...(length===16?{edition:'second-edition'}:{})};
   await seed(progress(20));await openBackup();const before=await saved();await importCandidate(backup);
   assert.match(await page(()=>document.querySelector('[data-summary]').textContent),new RegExp((length-1)+' completed puzzles and 3 owned decorations plus an unfinished puzzle'));
   await tap('[data-cancel]');assert.deepEqual(await saved(),before);await importCandidate(backup);await tap('[data-restore]');await until(()=>!document.querySelector('.backup-dialog'));
   const restored=await saved();assert.deepEqual(restored.bestStars,[...candidateProgress.bestStars,...Array(20-length).fill(0)]);assert.deepEqual(restored.bestMoves,[...candidateProgress.bestMoves,...Array(20-length).fill(0)]);assert.deepEqual(restored.shop,oldShop);
   await tap('#play-tea');assert.match(await page(()=>document.querySelector('.moves').textContent),/^1 move$/);await tap('[data-go="levels"]');await tap('[data-go="shop"]');
   await openBackup();await importCandidate({...backup,edition:'classic'});assert.equal(await page(()=>document.querySelector('[data-confirm]').classList.contains('hidden')),true);assert.deepEqual(await saved(),restored);
   await importCandidate({...backup,edition:undefined,progress:progress(0,{length:38}),puzzle:null});assert.equal(await page(()=>document.querySelector('[data-confirm]').classList.contains('hidden')),true);assert.deepEqual(await saved(),restored);await tap('.backup-close');
  }
  evidence.backups=[10,16];console.log('PASS: 16→20 local progress/resume/recovery and next17; actual 10/16 backup cancel/restore and cross-edition rejection.');
 }

 if(phase==='all'||phase==='purchase'){
  await seed(progress(18),{goal:{id:'cabinet',style:2}});
  const before=await saved(),beforeBalance=await available();assert.equal(beforeBalance,74);
  assert.match(await page(()=>document.querySelector('.personal-goal').textContent),/2 more puzzles to unlock/);
  await choose('cabinet',2);
  await page(()=>document.querySelectorAll('[data-act="preview"] img').forEach(i=>i.loading='eager'));
  await until(()=>document.querySelectorAll('[data-act="preview"] img').length===3&&[...document.querySelectorAll('[data-act="preview"] img')].every(i=>i.complete&&i.naturalWidth>0));
  for(const style of [0,1,2]){await tap('[data-act="preview"][data-style="'+style+'"]');assert.deepEqual(await saved(),before);assert.equal(await available(),beforeBalance);}
  assert.equal(await page(()=>document.querySelector('[data-act="buy"]').disabled),true);assert.match(await page(()=>document.querySelector('[data-act="buy"]').textContent),/Unlock at 20/);
  await shot('locked-cabinet-phone');await tap('#editor-back');assert.deepEqual(await saved(),before);await tap('#edit-toggle');await tap('#play-tea');await finishLevel(19);
  assert.equal((await saved()).bestStars[18],3);assert.equal(await page(()=>!!document.querySelector('.milestone-reward')),false,'19 does not grant a new bonus or unlock');
  await tap('[data-next]');await finishLevel(20);assert.equal((await saved()).bestStars[19],3);
  assert.match(await page(()=>document.querySelector('.milestone-reward').textContent),/Collector.s cabinet/);
  assert.doesNotMatch(await page(()=>document.querySelector('.milestone-reward').textContent),/\+\d+ stars/,'20 only unlocks the paid design');
  await shot('cabinet-unlocked-phone');await tap('.result-overlay [data-reward="cabinet"]');
  assert.equal(await available(),80,'two three-star wins add six and no milestone bonus');
  assert.equal(await page(()=>document.querySelector('[data-act="preview"][aria-pressed="true"]').dataset.style),'2');
  await tap('[data-act="buy"]');assert.equal(await available(),62);assert.deepEqual((await saved()).shop.owned,['cabinet']);assert.equal((await saved()).shop.style.cabinet,2);
  const startPlace=(await saved()).shop.place.cabinet;await tap('[data-act="rotate"]');assert.notDeepEqual((await saved()).shop.place.cabinet,startPlace);await tap('#undo-move');assert.deepEqual((await saved()).shop.place.cabinet,startPlace);
  await page(async()=>{
   const {Engine}=await import(window.qaBase+'node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');
   const e=Engine.Instances.find(e=>e.getRenderingCanvas()?.id==='shop-canvas'),s=e.scenes[0],c=e.getRenderingCanvas().getBoundingClientRect(),v=s.activeCamera.position;
   const p=v.constructor.Project(new v.constructor(1,.02,3.5),s.getTransformMatrix().constructor.Identity(),s.getTransformMatrix(),s.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));
   window.cabinetTarget={x:c.x+p.x*c.width/e.getRenderWidth(),y:c.y+p.y*c.height/e.getRenderHeight()};
  });
  const target=await page(()=>window.cabinetTarget);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...target,id:1}]});await pause(80);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(250);
  const moved=(await saved()).shop.place.cabinet;assert.notDeepEqual(moved,startPlace,'selected cabinet accepts a real touch destination');
  await tap('[data-act="store"]');assert.ok((await saved()).shop.stored.includes('cabinet'));assert.equal(await available(),62);await tap('[data-act="place"]');assert.equal((await saved()).shop.stored.includes('cabinet'),false);
  for(const style of [0,1,2]){await tap('[data-act="style"][data-style="'+style+'"]');assert.equal(await available(),62);}
  await shot('owned-cabinet-phone');const owned=await saved();await tap('[data-act="return"]');await tap('[data-cancel-return]');assert.deepEqual(await saved(),owned);
  await tap('[data-act="return"]');await tap('[data-confirm-return]');assert.equal(await available(),80);assert.deepEqual((await saved()).shop.owned,[]);
  await choose('cabinet',1);await tap('[data-act="buy"]');assert.equal(await available(),62);await tap('#edit-toggle');await send('Page.reload');await enter();assert.equal((await saved()).shop.style.cabinet,1);
  await tap('.settings-menu summary');await tap('#browse-puzzles');const chapter='.puzzle-chapter:has(.level-btn[data-level="20"])';if(!await page(s=>document.querySelector(s).open,chapter))await tap(chapter+' > summary');await tap('.level-btn[data-level="20"]');await finishLevel(20);
  assert.match(await page(()=>document.querySelector('.result-reward').textContent),/Best stars already collected/);assert.equal(await page(()=>!!document.querySelector('.milestone-reward')),false);
  await tap('.result-overlay [data-go="shop"]');assert.equal(await available(),62);
  const core=await page(async()=>{const {EDITION_DECORATIONS}=await import(window.qaBase+'src/shop/upgrades.ts');const defs=EDITION_DECORATIONS.filter(d=>!d.optional);return{owned:defs.map(d=>d.id),stored:[],style:{},place:Object.fromEntries(defs.map(d=>[d.id,{...d.defaultPlace}])),finaleSeen:true};});
  await seed(progress(20,{stars:1,shop:core}),{goal:{id:'cabinet',style:0}});assert.equal(await available(),14);
  await choose('cabinet',0);assert.equal(await page(()=>document.querySelector('[data-act="buy"]').disabled),true);assert.match(await page(()=>document.querySelector('[data-act="buy"]').textContent),/4 more/);assert.equal((await saved()).shop.owned.includes('cabinet'),false);
  await shot('cabinet-save-for-phone');evidence.purchase={gate:20,price:18,extraBonus:0,threeStyles:true,touchMove:true,rotationUndo:true,storage:true,return:true,repurchase:true,replay:true,insufficientFunds:true};
  console.log('PASS: actual 19/20 wins, paid20 gate without bonus, all thumbnails/previews, exact purchase/return, placement/storage/reload, replay and insufficient funds.');
 }

 if(phase==='all'||phase==='visuals'){
  const viewports=[[390,844,'phone'],[320,568,'small-phone'],[844,390,'landscape'],[1280,900,'desktop']];
  const geometry=[];
  for(const [width,height,name] of viewports){
   await viewport(width,height);
   for(const id of [17,18,19,20]){
    await seed(progress(id-1));await tap('#play-tea');assert.equal(await page(()=>document.querySelector('.play h2').textContent),await levelName(id));
    const fit=await page(()=>{const shelf=document.querySelector('.shelves'),r=shelf.getBoundingClientRect();return{capacity:shelf.dataset.capacity,scrollHeight:shelf.scrollHeight,clientHeight:shelf.clientHeight,horizontal:document.documentElement.scrollWidth<=innerWidth+1,jars:[...document.querySelectorAll('.jar')].map(j=>{const b=j.getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom,inside:b.x>=r.x-1&&b.right<=r.right+1&&b.y>=r.y-1&&b.bottom<=r.bottom+1};}),masked:[...document.querySelectorAll('.masked')].length};});
    assert.ok(fit.horizontal);assert.ok(fit.jars.every(j=>j.inside),'all jars fit at '+name+' level'+id);if(width===320)assert.ok(fit.scrollHeight<=fit.clientHeight+1,'whole small-phone shelf fits without vertical scrolling');
    if(id===19){
     const concealed=await page(()=>({count:document.querySelectorAll('.mystery').length,private:[...document.querySelectorAll('.mystery')].every(e=>!e.getAttribute('style')&&!/rose|chai|matcha|jasmine/.test(e.className)),centered:[...document.querySelectorAll('.mystery .fog')].every(e=>{const f=e.getBoundingClientRect(),s=e.closest('.slot').getBoundingClientRect();return Math.abs(f.x+f.width/2-s.x-s.width/2)<1&&Math.abs(f.y+f.height/2-s.y-s.height/2)<1;}),dividerClear:[...document.querySelectorAll('.slot .lid')].every(e=>e.getBoundingClientRect().bottom<=e.parentElement.querySelector('.fog').getBoundingClientRect().top)}));
     assert.equal(concealed.count,3);assert.ok(concealed.private&&concealed.centered&&concealed.dividerClear,'new hidden pieces remain private, centered and unobscured');fit.concealed=concealed;
    }
    geometry.push({level:id,viewport:name,...fit});if(id===19||id===20)await shot('level'+id+'-'+name);
   }
   await seed(progress(20));await choose('cabinet',2);assert.ok(await previewFits());await shot('cabinet-preview-'+name);
  }
  // Follow the actual Next action while capacities change 4→5→4→5.
  await viewport(320,568);await seed(progress(16));await tap('#play-tea');const transitions=[];
  for(const id of [17,18,19,20]){
   const fit=await page(()=>{const s=document.querySelector('.shelves');return{capacity:Number(s.dataset.capacity),scrollHeight:s.scrollHeight,clientHeight:s.clientHeight,slots:[...s.querySelectorAll('.stack')].map(e=>e.children.length)};});
   assert.equal(fit.capacity,id%2?4:5);assert.ok(fit.slots.every(n=>n===fit.capacity));assert.ok(fit.scrollHeight<=fit.clientHeight+1);
   transitions.push({level:id,...fit});await finishLevel(id);if(id<20)await tap('[data-next]');
  }
  await shot('new-arc-finished-small-phone');
  await viewport();await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await seed(progress(16));await tap('#play-tea');await finishLevel(17);assert.equal((await saved()).bestStars[16],3);await shot('reduced-motion-win');await send('Emulation.setEmulatedMedia',{features:[]});
  evidence.viewports=geometry;evidence.capacityTransitions=transitions;evidence.reducedMotion=true;console.log('PASS: all four new boards and cabinet picker fit phone, small phone, landscape and desktop; actual Next4/5 transitions and reduced-motion win.');
 }

 if(phase==='all'||phase==='lifecycle'){
  const mixed=await page(async()=>{
   const {EDITION_DECORATIONS}=await import(window.qaBase+'src/shop/upgrades.ts');const {sanitizeShop}=await import(window.qaBase+'src/shop/grid.ts');
   const ids=['counter','sign','paint','shelves','plant','rug','lamp','table','cabinet'];
   return sanitizeShop({owned:ids,stored:[],style:{counter:2,paint:1,sign:1,shelves:0,plant:2,rug:1,lamp:1,table:2,cabinet:0},place:{...Object.fromEntries(EDITION_DECORATIONS.filter(d=>ids.includes(d.id)).map(d=>[d.id,{...d.defaultPlace}])),cabinet:{x:0,z:3,rot:1}},finaleSeen:true});
  });
  assert.equal(mixed.stored.includes('cabinet'),false);await viewport();await seed(progress(20,{shop:mixed}));await pause(600);await shot('room-day-phone');await tap('#theme-toggle');await pause(600);await shot('room-night-phone');await viewport(1280,900);await pause(400);await shot('room-night-desktop');await tap('#theme-toggle');await pause(400);await shot('room-day-desktop');
  await viewport();await openEditor();await tap('[data-filter="owned"]');await tap('[data-upgrade="cabinet"]');
  const count=()=>page(async()=>{const{Engine}=await import(window.qaBase+'node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');const s=Engine.Instances.find(e=>e.getRenderingCanvas()?.id==='shop-canvas').scenes[0];return{meshes:s.meshes.length,materials:s.materials.length,textures:s.textures.length,transforms:s.transformNodes.length,lights:s.lights.length};});
  const initial=await count();
  for(let i=0;i<12;i++){for(const style of [1,2,0])await tap('[data-act="style"][data-style="'+style+'"]');await tap('[data-act="store"]');await tap('[data-act="place"]');}
  assert.deepEqual(await count(),initial,'cabinet style/store/restore resources remain stable');await shot('cabinet-edit-phone');
  const traffic=await page(async mixed=>{
   const {Engine}=await import(window.qaBase+'node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');const{Diorama}=await import(window.qaBase+'src/shop/diorama.ts');const{GuestTraffic}=await import(window.qaBase+'src/shop/guest-traffic.ts');
   for(const e of Engine.Instances)e.stopRenderLoop();const canvas=document.createElement('canvas');canvas.width=640;canvas.height=640;canvas.style='position:fixed;left:-2000px;width:640px;height:640px';document.body.append(canvas);
   const d=new Diorama(canvas,structuredClone(mixed),{onSelect(){},onMove(){},onPlaced(){}});d.engine.stopRenderLoop();let state=817;d.traffic=new GuestTraffic(structuredClone(mixed),()=>((state=(state*1664525+1013904223)>>>0)/4294967296));
   const counts=()=>({meshes:d.scene.meshes.length,materials:d.scene.materials.length,textures:d.scene.textures.length,transforms:d.scene.transformNodes.length,lights:d.scene.lights.length});const baseline=counts(),issues=[];let peak=0,minDistance=Infinity;
   for(let i=0;i<18000;i++){d.elapsed+=1/30;d.tickTraffic(1/30);const f=d.traffic.snapshot();peak=Math.max(peak,f.length);if(f.length===2)minDistance=Math.min(minDistance,Math.hypot(f[0].x-f[1].x,f[0].z-f[1].z));for(const v of f){const r=d.trafficGuests[v.slot].root;if(r.position.x!==v.x||r.position.z!==v.z)issues.push('projection');if(v.x<1.18&&v.z>2.82&&v.z<5.18)issues.push('cabinet-collision');}}
   const stats={...d.traffic.stats},after=counts();d.setEditMode(true);const editHidden=d.trafficGuests.every(g=>!g.root.isEnabled());const stored=structuredClone(mixed);stored.stored.push('cabinet');d.sync(stored);const disabled=!d.visuals.items.cabinet;d.sync(structuredClone(mixed));const restored=counts();d.dispose();canvas.remove();return{baseline,after,restored,stats,peak,minDistance,issues:[...new Set(issues)],editHidden,storedCabinetAbsent:disabled,disposed:d.scene.isDisposed,final:counts()};
  },mixed);
  assert.deepEqual(traffic.issues,[]);assert.ok(traffic.stats.arrivals>4&&traffic.stats.departures>2);assert.equal(traffic.peak,2);assert.ok(traffic.minDistance>.5);assert.deepEqual(traffic.after,traffic.baseline);assert.deepEqual(traffic.restored,traffic.baseline);assert.ok(traffic.editHidden&&traffic.storedCabinetAbsent&&traffic.disposed);assert.ok(Object.values(traffic.final).every(n=>n===0));
  evidence.lifecycle={cycles:12,counts:initial,traffic};console.log('PASS: mixed day/night room, repeated cabinet lifecycle, safe guest visits with the cabinet, Edit hiding, disposal and resource stability.');
 }
 assert.equal(await outsideSaves(),sentinels,'main and ordinary-preview saves remain isolated');assert.deepEqual(errors,[]);
 evidence.errors=errors;evidence.phase=phase;await fs.writeFile('work/edition-cabinet-'+(phase==='all'?'check':phase+'-check')+'.json',JSON.stringify(evidence,null,2));console.log('PASS: preview.7 cabinet browser suite, '+phase+'.');
}catch(error){
 await shot('failure-'+phase).catch(()=>{});
 await fs.writeFile('work/edition-cabinet-failure-'+phase+'.json',JSON.stringify({message:String(error),stack:error.stack,screen:await page(()=>document.body.innerText.slice(0,8000)).catch(()=>null)},null,2));
 throw error;
}finally{await send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]}).catch(()=>{});ws.close();}
