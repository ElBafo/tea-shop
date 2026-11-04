// Guest polish checks use a real UI plus a private, deterministically stepped room.
// They do not add debug controls, accelerated clocks or account state to the app.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {installReturningPlayerStart} from './browser-start.mjs';

const origin=process.env.GAME_ORIGIN??'http://127.0.0.1:5183';
const base='/tea-shop/preview/', key='tea-shop-preview-edition2-progress-v1';
const phase=process.env.POLISH_PHASE??'all';
assert.ok(['all','integration','ui','captures','onboarding'].includes(phase));
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT??9239}/json`)).json();
const ws=new WebSocket(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let seq=0;const pending=new Map(),errors=[],evidence={};
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const until=async(expression,attempts=600)=>{for(let i=0;i<attempts;i++){if(await evaluate(expression))return;await pause(125);}throw Error('Timed out: '+expression);};
const tap=async selector=>{const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||e.closest('[inert]')||!e.checkVisibility())throw Error('Unavailable '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(150);};
const shot=async name=>fs.writeFile(`work/guest-polish-${name}.png`,Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
const viewport=(width=390,height=844)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
const navReady=async()=>{for(let i=0;i<600;i++){try{if(await evaluate(`document.readyState==='complete'&&!document.querySelector('#launch-screen')&&!!document.querySelector('#shop-canvas')`))return;}catch(e){if(e?.code!==-32000||!/navigated|context.*destroyed|Cannot find context/i.test(e.message))throw e;}await pause(125);}throw Error('Shop did not become ready');};
await fs.mkdir('work',{recursive:true});
await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
const clearStart=await installReturningPlayerStart(send);
let startRemoved=false;
const navigate=async(search='?edition=2')=>{await send('Page.navigate',{url:origin+base+search});await navReady();await evaluate(`(async()=>{const {Engine}=await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');window.liveScene=()=>Engine.Instances.find(e=>e.getRenderingCanvas()?.id==='shop-canvas')?.scenes[0];window.liveRoots=()=>liveScene()?.transformNodes.filter(n=>/^traffic-guest-[01]$/.test(n.name))??[];window.liveVisitors=()=>liveRoots().filter(n=>n.isEnabled());})()`);};
const protectedSaves=()=>evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().filter(k=>!k.includes('appearance')).map(k=>[k,localStorage.getItem(k)])))`);
try{
 await viewport();await navigate();
 await evaluate(`(async()=>{const {UPGRADES}=await import('${base}src/shop/upgrades.ts');const core=UPGRADES.filter(d=>!d.optional);window.polishSeed={muted:true,bestStars:Array(16).fill(3),bestMoves:Array(16).fill(0),shop:{owned:core.map(d=>d.id),stored:[],style:{counter:2,paint:1,sign:1,plant:2,rug:2,lamp:1,table:1},place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}])),finaleSeen:true}};localStorage.setItem('${key}',JSON.stringify(polishSeed));localStorage.setItem('${key}:guide-v1','done');localStorage.setItem('${key}:goal-v1',JSON.stringify({id:'bench',style:2}));localStorage.setItem('tea-shop-preview-edition2-appearance-v1','day');localStorage.setItem('tea-shop-progress-v1','main-polish-sentinel');localStorage.setItem('tea-shop-preview-progress-v1','classic-polish-sentinel');})();`);
 await navigate();const savesBefore=await protectedSaves();
 if(phase==='all'||phase==='ui'){
  await until(`liveVisitors().length>0`);assert.equal(await evaluate('liveRoots().length'),2);await shot('day-phone');
  await tap('#theme-toggle');await pause(250);await shot('night-phone');await tap('#theme-toggle');
  assert.equal(await protectedSaves(),savesBefore,'visitors cannot change progress or goals');
  await tap('#edit-toggle');assert.equal(await evaluate('liveVisitors().length'),0);
  await tap('[data-filter="all"]');await tap('[data-upgrade="bench"]');await tap('[data-act="preview"][data-style="1"]');assert.equal(await evaluate('liveVisitors().length'),0,'drafts keep visitors hidden');await shot('edit-hidden-phone');
  await tap('#edit-toggle');assert.equal(await protectedSaves(),savesBefore);await until('liveVisitors().length>0');
  await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));`);
  const hidden=await evaluate(`liveRoots().map(r=>({position:r.position.asArray(),rotation:r.rotation.asArray(),profile:r.metadata.profileId,state:r.metadata.guestState,motion:r.metadata.guestMotion}))`);await pause(500);
  assert.deepEqual(await evaluate(`liveRoots().map(r=>({position:r.position.asArray(),rotation:r.rotation.asArray(),profile:r.metadata.profileId,state:r.metadata.guestState,motion:r.metadata.guestMotion}))`),hidden,'background freezes projection and presentation');
  await evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));`);await pause(100);assert.ok(await evaluate('liveVisitors().length<=2'));
  await viewport(1280,900);await pause(300);await shot('desktop');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await viewport();await navigate();await until('liveVisitors().length>0');
  const staticPose=await evaluate(`liveVisitors().map(r=>({position:r.position.asArray(),rotation:r.rotation.asArray(),children:r.getChildTransformNodes().map(n=>({name:n.name,p:n.position.asArray(),r:n.rotation.asArray(),s:n.scaling.asArray()}))}))`);await pause(400);
  assert.deepEqual(await evaluate(`liveVisitors().map(r=>({position:r.position.asArray(),rotation:r.rotation.asArray(),children:r.getChildTransformNodes().map(n=>({name:n.name,p:n.position.asArray(),r:n.rotation.asArray(),s:n.scaling.asArray()}))}))`),staticPose,'reduced motion is static, including limb and pose transforms');await shot('reduced-motion-phone');
  await send('Emulation.setEmulatedMedia',{features:[]});await navigate('');assert.equal(await evaluate('liveRoots().length'),0,'classic has no visitor rigs');
  await navigate();evidence.ui={edit:true,background:true,reducedMotion:true,classicIsolated:true};console.log('PASS: actual UI visits, save isolation, Edit/draft hiding, background freeze, reduced motion and classic isolation.');
 }
 if(phase==='all'||phase==='integration'||phase==='captures'){
  const integration=await evaluate(`(async()=>{
   const {Engine}=await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');
   const {Diorama}=await import('${base}src/shop/diorama.ts');const {GuestTraffic}=await import('${base}src/shop/guest-traffic.ts');const {GUEST_PROFILES}=await import('${base}src/shop/guest-profiles.ts');const {GuestRoster}=await import('${base}src/shop/guest-motion.ts');const {UPGRADES}=await import('${base}src/shop/upgrades.ts');
   for(const e of Engine.Instances)e.stopRenderLoop();
   const core=UPGRADES.filter(d=>!d.optional),full={owned:core.map(d=>d.id),stored:[],style:{counter:2,paint:1,table:1},place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}])),finaleSeen:true};
   const random=()=>{let n=12345;return()=>((n=(n*1664525+1013904223)>>>0)/4294967296);};
   const canvas=document.createElement('canvas');canvas.id='polish-fixture';canvas.style='position:fixed;left:-2000px;top:0;width:640px;height:640px';canvas.width=640;canvas.height=640;document.body.append(canvas);
   const d=new Diorama(canvas,structuredClone(full),{onSelect(){},onMove(){},onPlaced(){}},new GuestRoster(GUEST_PROFILES.map(p=>p.id)));d.engine.stopRenderLoop();d.traffic=new GuestTraffic(structuredClone(full),random());
   const counts=()=>({meshes:d.scene.meshes.length,materials:d.scene.materials.length,textures:d.scene.textures.length,transforms:d.scene.transformNodes.length,lights:d.scene.lights.length});const initial=counts();
   const issues=[],seen=new Set(),visits=new Map(),last=new Map(),groupSeen=new Set();let turns=0,smoothedTurns=0,maxYawStep=0,maxTurnFraction=0,peak=0,minSeparation=Infinity,repaintChecks=0,childSeated=0,adultSeated=0;
   const angle=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
   const children=()=>d.trafficGuests.filter(g=>g.root.metadata.profileGroup==='child'||String(g.root.metadata.profileId).includes('child'));
   const sample=()=>d.traffic.snapshot().map(f=>{const r=d.trafficGuests[f.slot].root;return{...f,profile:r.metadata.profileId,group:r.metadata.profileGroup,yaw:r.rotation.y,motion:{...r.metadata.guestMotion}};});
   const step=dt=>{d.elapsed+=dt;d.tickTraffic(dt);return sample();};
   for(let i=0;i<27000;i++){
    const frames=step(1/30);peak=Math.max(peak,frames.length);
    if(frames.length===2){minSeparation=Math.min(minSeparation,Math.hypot(frames[0].x-frames[1].x,frames[0].z-frames[1].z));if(frames[0].profile===frames[1].profile)issues.push('duplicate-current-profile');}
    for(const f of frames){
     const r=d.trafficGuests[f.slot].root;seen.add(f.profile);groupSeen.add(f.group);if(!GUEST_PROFILES.some(p=>p.id===f.profile))issues.push('unknown-profile');
     if(!r.isEnabled()||Math.abs(r.position.x-f.x)>1e-8||Math.abs(r.position.y-f.y)>1e-8||Math.abs(r.position.z-f.z)>1e-8)issues.push('route-projection');
     if(visits.has(f.visitId)&&visits.get(f.visitId)!==f.profile)issues.push('appearance-changed-mid-visit');visits.set(f.visitId,f.profile);
     const prev=last.get(f.visitId);if(prev&&!f.motion.reset){const stepYaw=Math.abs(angle(f.yaw,prev.yaw)),remaining=Math.abs(angle(f.facing,prev.yaw));maxYawStep=Math.max(maxYawStep,stepYaw);if(remaining>1e-6)maxTurnFraction=Math.max(maxTurnFraction,stepYaw/remaining);if(Math.abs(angle(f.facing,prev.facing))>1){turns++;if(stepYaw<Math.abs(angle(f.facing,prev.facing))-.05)smoothedTurns++;}}
     last.set(f.visitId,{...f,motion:{...f.motion}});
     if(f.pose==='sit'){if(String(f.profile).includes('child'))childSeated++;else adultSeated++;}
    }
    if(i%150===0&&frames.length){
     const paintState=()=>JSON.stringify(d.trafficGuests.map(g=>({profile:g.root.metadata.profileId,p:g.root.position.asArray(),r:g.root.rotation.asArray(),joints:g.root.getChildTransformNodes().map(n=>[...n.position.asArray(),...n.rotation.asArray(),...n.scaling.asArray()])})));const before=paintState();d.paintTraffic();if(paintState()!==before)issues.push('repaint-advances-motion');
     const style=structuredClone(full);style.style.counter=0;d.sync(style);const after=sample();
     if(after.length!==frames.length||after.some((f,j)=>f.visitId!==frames[j].visitId||f.profile!==frames[j].profile||f.yaw!==frames[j].yaw||f.motion.stridePhase!==frames[j].motion.stridePhase||f.motion.walkWeight!==frames[j].motion.walkWeight))issues.push('style-repaint-changes-presentation');
     d.sync(structuredClone(full));repaintChecks++;
    }
   }
   const trafficStats={...d.traffic.stats},final=counts();
   const guestMeshes=new Set(d.trafficGuests.flatMap(g=>g.root.getChildMeshes()));const casterOverlap=[d.shadows,...Object.values(d.lampShadows)].flatMap(s=>s.getShadowMap()?.renderList??[]).filter(m=>guestMeshes.has(m)).length;
   const profiles=GUEST_PROFILES.map(p=>({id:p.id,group:p.group,strideLength:p.strideLength}));
   const geometry=[];
   for(const profile of GUEST_PROFILES){const g=d.trafficGuests[0];g.setProfile(profile.id);g.root.position.set(0,0,0);g.root.rotation.setAll(0);g.root.setEnabled(true);g.setPose('stand');g.animate(0,false,true,{stridePhase:0,walkWeight:0,dt:0,reset:true});g.root.computeWorldMatrix(true);
    const meshes=g.root.getChildMeshes();for(const m of meshes)m.computeWorldMatrix(true);
    const bounds=g.root.getHierarchyBoundingVectors(true);const hips=meshes.find(m=>m.name==='guest-0-hips');const shoe=meshes.filter(m=>m.name.includes('shoe'));const floorMin=Math.min(...shoe.map(m=>m.getBoundingInfo().boundingBox.minimumWorld.y));const standingHeight=bounds.max.y-bounds.min.y;
    g.setPose('sit');g.animate(0,false,true,{stridePhase:0,walkWeight:0,dt:0,reset:true});for(const m of meshes)m.computeWorldMatrix(true);
    const hipY=hips.getAbsolutePosition().y;const seatFeet=Math.min(...shoe.map(m=>m.getBoundingInfo().boundingBox.minimumWorld.y));geometry.push({id:profile.id,group:profile.group,standingHeight,floorMin,hipY,seatFeet});
   }
   d.setEditMode(true);if(d.trafficGuests.some(g=>g.root.isEnabled()))issues.push('edit-visible');d.setEditMode(false);for(let i=0;i<100;i++)step(.1);
   // Retain only this private room for optional frame capture; application state is untouched.
   window.polishFixture={d,canvas,full,Diorama,GuestTraffic,GuestRoster,GUEST_PROFILES,step,counts,sample};
   window.polishCapture=async()=>{await d.scene.whenReadyAsync();d.scene.render();return canvas.toDataURL('image/png');};
   return{initial,final,issues:[...new Set(issues)],profiles,seen:[...seen],groups:[...groupSeen],visits:visits.size,trafficStats,peak,minSeparation,turns,smoothedTurns,maxYawStep,maxTurnFraction,repaintChecks,childSeated,adultSeated,casterOverlap,geometry,nonPickable:[...guestMeshes].every(m=>!m.isPickable),lights:d.scene.lights.length};
  })()`);
  await fs.writeFile('work/guest-polish-integration-raw.json',JSON.stringify(integration,null,2));
  assert.deepEqual(integration.issues,[]);assert.equal(integration.profiles.length,6);assert.equal(integration.seen.length,6,'visits use the full cast, not two permanent slot identities');assert.equal(integration.peak,2);assert.ok(integration.minSeparation>.5);assert.ok(integration.turns>20);assert.equal(integration.smoothedTurns,integration.turns,'every ordinary grid turn eases rather than snapping');assert.ok(integration.maxYawStep<Math.PI/2&&integration.maxTurnFraction<.5,'even a U-turn covers less than half its remaining angle per 30Hz frame');assert.ok(integration.repaintChecks>30);assert.ok(integration.childSeated>0&&integration.adultSeated>0);assert.equal(integration.casterOverlap,0);assert.equal(integration.lights,5);assert.ok(integration.nonPickable);assert.deepEqual(integration.final,integration.initial,'profile changes and many visits do not grow resources');
  for(const g of integration.geometry){assert.ok(g.floorMin>=-.025&&g.floorMin<.06,`${g.id} standing shoes meet the floor`);assert.ok(Math.abs(g.hipY-.49)<.012,`${g.id} pelvis meets the same chair seat`);}
  const kids=integration.geometry.filter(g=>g.id.includes('child')),adults=integration.geometry.filter(g=>!g.id.includes('child'));
  assert.equal(kids.length,2);assert.ok(Math.max(...kids.map(g=>g.standingHeight))<Math.min(...adults.map(g=>g.standingHeight))*.88,'children read shorter, not as recoloured adults');assert.ok(Math.min(...kids.map(g=>g.seatFeet))>Math.max(...adults.map(g=>g.seatFeet))+.06,'shorter seated legs dangle above adult feet');
  evidence.integration=integration;console.log('PASS: all six profiles, stable per-visit identity, smooth turns, exact routes, child geometry and pooled resources.');
  await evaluate('polishFixture.d.tick()');
  // Find natural visits suitable for room-scale art review without changing rules.
  const captureCondition=async(condition,name)=>{await evaluate(`(()=>{const f=polishFixture;for(let i=0;i<18000;i++){const frames=f.step(.05);if(${condition})return;}throw Error('No capture state: ${name}');})()`);const data=await evaluate('polishCapture()');await fs.writeFile(`work/guest-polish-${name}.png`,Buffer.from(data.split(',')[1],'base64'));};
  await captureCondition(`frames.some(v=>String(v.profile).includes('child')&&v.moving&&v.x>1&&v.x<3&&v.z>3)&&frames.some(v=>!String(v.profile).includes('child')&&v.pose==='sit')`,'adult-child-room');
  await evaluate('polishFixture.d.setNight(true);polishFixture.d.tick()');const night=await evaluate('polishCapture()');await fs.writeFile('work/guest-polish-adult-child-night.png',Buffer.from(night.split(',')[1],'base64'));await evaluate('polishFixture.d.setNight(false);polishFixture.d.tick()');
  await captureCondition(`frames.some(v=>String(v.profile).includes('child')&&v.pose==='sit')`,'child-seated-room');
  // Actual simulation seating, including the three different bench elevations.
  // Each private scene starts a fresh roster and visit sequence, as production does.
  evidence.seating=await evaluate(`(async()=>{const {Diorama,GuestTraffic,GuestRoster,GUEST_PROFILES}=polishFixture;const records=[];
   for(const kind of ['table','bench'])for(let style=0;style<3;style++){
    const canvas=document.createElement('canvas');canvas.style='width:320px;height:320px;position:fixed;left:-2000px';canvas.width=320;canvas.height=320;document.body.append(canvas);
    const shop={owned:[kind],stored:[],style:{[kind]:style},place:{[kind]:{x:2,z:2,rot:0}},finaleSeen:true};
    const d=new Diorama(canvas,shop,{onSelect(){},onMove(){},onPlaced(){}},new GuestRoster(GUEST_PROFILES.filter(p=>p.group==='child').map(p=>p.id)));d.engine.stopRenderLoop();let seed=37;d.traffic=new GuestTraffic(shop,()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296));const seen=new Set();
    for(let i=0;i<36000&&seen.size<2;i++){d.elapsed+=.1;d.tickTraffic(.1);for(const frame of d.traffic.snapshot())if(frame.pose==='sit'){
     const g=d.trafficGuests[frame.slot],id=g.root.metadata.profileId;if(seen.has(id))continue;seen.add(id);const meshes=g.root.getChildMeshes();for(const m of meshes)m.computeWorldMatrix(true);
     records.push({kind,style,id,rootY:g.root.position.y,frameY:frame.y,hipsY:meshes.find(m=>m.name==='guest-'+frame.slot+'-hips').getAbsolutePosition().y,feetY:Math.min(...meshes.filter(m=>m.name.includes('shoe')).map(m=>m.getBoundingInfo().boundingBox.minimumWorld.y))});
    }}d.dispose();canvas.remove();if(seen.size!==2)throw Error('Both children did not visit '+kind+' style '+style);
   }return records;})()`);
  assert.equal(evidence.seating.length,12);for(const seat of evidence.seating){const elevation=seat.kind==='bench'?[.125,.15,.175][seat.style]:0;assert.equal(seat.rootY,seat.frameY);assert.ok(Math.abs(seat.rootY-elevation)<1e-8);assert.ok(Math.abs(seat.hipsY-(elevation+.49))<.012,`${seat.id} meets ${seat.kind} ${seat.style}`);assert.ok(seat.feetY>.20,'seated child feet dangle clear of the floor');}
  console.log('PASS: both children naturally seat on all table and bench styles at their exact seat elevations.');
  // Fixed simulation steps encoded at their real duration show gait/turns without
  // confusing software-renderer wall-clock FPS with intended animation timing.
  await evaluate(`(()=>{const f=polishFixture;for(let i=0;i<24000;i++){const frames=f.step(.05);for(const v of frames){if(!String(v.profile).includes('child')||!v.moving)continue;const path=f.d.traffic.visits[v.slot]?.path;if(!path||path.length<2)continue;const a=Math.atan2(path[0].x-v.x,path[0].z-v.z),b=Math.atan2(path[1].x-path[0].x,path[1].z-path[0].z);if(Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))>.7)return;}}throw Error('No child walking corner for clip');})()`);
  await fs.mkdir('work/guest-polish-frames',{recursive:true});
  for(let i=0;i<120;i++){
    const data=await evaluate(`(async()=>{polishFixture.step(1/30);return polishCapture();})()`);
    await fs.writeFile(`work/guest-polish-frames/${String(i).padStart(3,'0')}.png`,Buffer.from(data.split(',')[1],'base64'));
  }
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i','work/guest-polish-frames/%03d.png','-vf','scale=480:480','-c:v','libx264','-preset','fast','-crf','29','-pix_fmt','yuv420p','-movflags','+faststart','work/guest-polish-walking.mp4']);
  evidence.clip={file:'guest-polish-walking.mp4',frames:120,framesPerSecond:30,simulationSeconds:4};
  // Show the fast first frame of a real U-turn at a useful inspection scale.
  const turning=await evaluate(`(()=>{const f=polishFixture;for(let i=0;i<54000;i++){const frames=f.step(1/30);for(const v of frames){const path=f.d.traffic.visits[v.slot]?.path;if(!path?.length||v.z<2)continue;const nextFacing=Math.atan2(path[0].x-v.x,path[0].z-v.z),angle=Math.atan2(Math.sin(nextFacing-v.facing),Math.cos(nextFacing-v.facing));if(Math.abs(angle)>2.9){f.d.camera.setTarget(new f.d.camera.target.constructor(v.x,.65,v.z));f.d.camera.orthoLeft=-1.5;f.d.camera.orthoRight=1.5;f.d.camera.orthoTop=1.5;f.d.camera.orthoBottom=-1.5;return{slot:v.slot,visitId:v.visitId,profile:v.profile,angle};}}}throw Error('No natural U-turn capture state');})()`);
  await fs.mkdir('work/guest-polish-turn-frames',{recursive:true});const turnFrames=[];
  for(let i=0;i<90;i++){const frame=await evaluate(`(async()=>{const samples=polishFixture.step(1/30);return{samples,image:await polishCapture()};})()`);turnFrames.push(frame.samples);await fs.writeFile(`work/guest-polish-turn-frames/${String(i).padStart(3,'0')}.png`,Buffer.from(frame.image.split(',')[1],'base64'));}
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i','work/guest-polish-turn-frames/%03d.png','-vf','scale=480:480','-c:v','libx264','-preset','fast','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart','work/guest-polish-turning.mp4']);
  evidence.turning={...turning,file:'guest-polish-turning.mp4',frames:turnFrames,framesPerSecond:30,simulationSeconds:3};
  const disposed=await evaluate(`(()=>{const {d,canvas,counts}=polishFixture;d.dispose();canvas.remove();return{sceneDisposed:d.scene.isDisposed,resources:counts()};})()`);assert.equal(disposed.sceneDisposed,true);assert.ok(Object.values(disposed.resources).every(count=>count===0),'disposing the room releases scene meshes, materials, textures, transforms and lights');evidence.disposed=disposed;
 }
 if(phase==='all'||phase==='onboarding'){
  await clearStart();startRemoved=true;
  await evaluate(`Object.keys(localStorage).filter(k=>k.startsWith('tea-shop-preview-edition2')).forEach(k=>localStorage.removeItem(k));`);
  const otherBefore=await evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])))`);
  await viewport();await send('Page.navigate',{url:origin+base+'?edition=2'});await pause(500);await until(`document.querySelector('#launch-start')?.disabled===false`);
  assert.ok(await evaluate(`document.querySelector('#app').inert&&document.title==='Decopu'`));
  assert.equal(await evaluate(`(async()=>{const{APP_VERSION}=await import('${base}src/game/version.ts');return APP_VERSION})()`),'0.2.0-preview.6');await shot('onboarding-start-phone');
  await tap('#launch-start');await until(`!!document.querySelector('[data-guide-start]')`);await tap('[data-guide-start]');await until(`!!document.querySelector('[data-jar="0"]')`);await shot('onboarding-puzzle-phone');
  for(const[from,to]of[[0,2],[1,0],[1,2]]){await tap('[data-jar="'+from+'"]');await tap('[data-jar="'+to+'"]');await until(`document.querySelector('.shelves')?.getAttribute('aria-busy')==='false'`);}
  await until(`!!document.querySelector('.result-overlay')`);assert.equal(await evaluate(`JSON.parse(localStorage.getItem('${key}')).bestStars[0]`),3);await tap('.result-overlay [data-go="shop"]');await until(`document.querySelector('[data-act="preview"][data-id="counter"][data-style="1"]')?.checkVisibility()`);
  await tap('[data-act="preview"][data-id="counter"][data-style="1"]');await tap('[data-act="buy"]');await until(`!!document.querySelector('[data-guide-done]')`);await shot('onboarding-first-counter-phone');
  assert.ok(await evaluate(`(async()=>{const{Engine}=await import('${base}node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');const scene=Engine.Instances.find(e=>e.getRenderingCanvas()?.id==='shop-canvas').scenes[0];return scene.transformNodes.filter(n=>n.name==='shopkeeper').length===1&&scene.getTransformNodeByName('shopkeeper').isEnabled()})()`),'first earned counter immediately reveals its keeper');
  const firstSave=await evaluate(`JSON.parse(localStorage.getItem('${key}'))`);assert.deepEqual(firstSave.shop.owned,['counter']);assert.equal(firstSave.shop.style.counter,1);assert.equal(firstSave.shop.finaleSeen,false);
  await tap('[data-guide-done]');assert.equal(await evaluate(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().filter(k=>!k.startsWith('tea-shop-preview-edition2')).map(k=>[k,localStorage.getItem(k)])))`),otherBefore);
  evidence.onboarding={version:'0.2.0-preview.6',guidedWinStars:3,counterStyle:1,keeperImmediatelyVisible:true,isolated:true};console.log('PASS: preview.6 fresh Start, guided puzzle win, first paid counter, immediate keeper and isolated saves.');
 }
 assert.deepEqual(errors,[]);evidence.errors=errors;evidence.phase=phase;await fs.writeFile(`work/guest-polish-${phase==='all'?'check':phase+'-check'}.json`,JSON.stringify(evidence,null,2));console.log('PASS: guest polish browser checks, phase '+phase+'.');
}finally{await evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));`).catch(()=>{});if(!startRemoved)await clearStart();ws.close();}
