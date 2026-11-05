// Isolated visual/lifecycle check. Serve Vite with HMR disabled; use a dedicated CDP browser.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.GAME_ORIGIN??'http://127.0.0.1:5182',cdp=process.env.CDP_PORT??9238;
await fs.mkdir('work',{recursive:true});
await fs.writeFile('work/guest-visual.html', `<!doctype html><meta charset="utf-8"><title>Guest visual check</title><style>html,body{margin:0;height:100%;overflow:hidden;background:#f3eee2}canvas{width:100%;height:100%;display:block}#label{position:absolute;bottom:24px;width:100%;text-align:center;font:18px Georgia;color:#493e32}</style><canvas></canvas><div id="label"></div><script type="module">
import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {buildTrafficGuest} from '/tea-shop/preview/src/shop/edition-guest.ts';
import {GUEST_PROFILES} from '/tea-shop/preview/src/shop/guest-profiles.ts';
const engine=new Engine(document.querySelector('canvas'),true),scene=new Scene(engine);
scene.clearColor=Color4.FromHexString('#f3eee2ff');
const camera=new ArcRotateCamera('portrait',Math.PI/3,Math.PI/2.65,7,new Vector3(0,.71,0),scene);camera.mode=1;
const light=new HemisphericLight('soft',new Vector3(0,1,0),scene);light.intensity=.83;
const sun=new DirectionalLight('day',new Vector3(-.3,-1,.4),scene);sun.intensity=.55;
const ground=MeshBuilder.CreateGround('floor',{width:30,height:30},scene),floor=new StandardMaterial('floor',scene);floor.diffuseColor=Color3.FromHexString('#eee7d8');floor.specularColor.setAll(0);ground.material=floor;
const seatMat=new StandardMaterial('stool-oak',scene);seatMat.diffuseColor=Color3.FromHexString('#b98d60');seatMat.specularColor.setAll(.04);
const guests=[buildTrafficGuest(scene,0),buildTrafficGuest(scene,1)];window.initiallyHidden=guests.every(g=>!g.root.isEnabled());
const stools=guests.map(()=>{const s=MeshBuilder.CreateCylinder('stool',{height:.43,diameter:.37,tessellation:16},scene);s.position.y=.215;s.material=seatMat;s.setEnabled(false);return s;});
const fit=()=>{engine.resize();const aspect=engine.getRenderWidth()/engine.getRenderHeight(),half=.93;camera.orthoTop=half;camera.orthoBottom=-half;camera.orthoLeft=-half*aspect;camera.orthoRight=half*aspect;};
window.show=async(id,pose='stand',phase=0,night=false,pair=false)=>{fit();guests.forEach((g,i)=>{g.root.setEnabled(i===0||pair);g.root.position.set(pair?(i?.48:-.48):0,0,0);g.root.rotation.y=Math.PI/6;g.setProfile(i?'mint-child':id);g.setPose(pose);g.animate(.45,pose==='walk',false,{stridePhase:phase,walkWeight:pose==='walk'?1:0,dt:0,reset:true});stools[i].position.x=g.root.position.x;stools[i].setEnabled(pose==='sit'&&(i===0||pair));});light.intensity=night?.52:.83;sun.intensity=night?.23:.55;sun.diffuse=Color3.FromHexString(night?'#b8c7d5':'#fff0dd');scene.clearColor=Color4.FromHexString(night?'#23353bff':'#f3eee2ff');floor.diffuseColor=Color3.FromHexString(night?'#64746c':'#eee7d8');document.querySelector('#label').textContent=pair?'Adult and child · '+pose:id+' · '+pose;document.querySelector('#label').style.color=night?'#eee7d8':'#493e32';await scene.whenReadyAsync();scene.render();};
window.checkVisuals=()=>{
 const test=new Scene(engine),counts=()=>({meshes:test.meshes.length,materials:test.materials.length,textures:test.textures.length,transforms:test.transformNodes.length,lights:test.lights.length}),initial=counts();
 let nonpickable=true,rootStable=true,reducedStable=true,profileResourcesStable=true,peak=0,minSole=Infinity,maxSwing=0,kneeMin=Infinity,kneeMax=-Infinity,metadataStable=true,seatAnchorStable=true,transitionFloorSafe=true;
 const sizes={},seatedFeet={},phases=48;
 const update=g=>{g.root.computeWorldMatrix(true);g.root.getDescendants(false).forEach(n=>n.computeWorldMatrix(true));};
 const shoes=g=>g.root.getChildMeshes().filter(m=>m.name.endsWith('-shoe'));
 const floorY=g=>Math.min(...shoes(g).map(m=>m.getBoundingInfo().boundingBox.minimumWorld.y));
 const snapshot=g=>JSON.stringify(g.root.getDescendants(false).map(n=>[...n.position.asArray(),...n.rotation.asArray(),...n.scaling.asArray()]));
 for(let cycle=0;cycle<12;cycle++){
  const g=buildTrafficGuest(test,cycle%2);g.root.setEnabled(true);g.root.position.set(2.5,0,3.5);g.root.rotation.y=.4;g.root.metadata.guestState='checking';const built=JSON.stringify(counts());peak=Math.max(peak,test.meshes.length);
  for(const profile of GUEST_PROFILES){
   g.setProfile(profile.id);profileResourcesStable&&=JSON.stringify(counts())===built;metadataStable&&=g.root.metadata.guestState==='checking'&&g.root.metadata.profileId===profile.id&&g.root.metadata.profileGroup===profile.group;
   nonpickable&&=g.root.getChildMeshes().every(m=>!m.isPickable&&m.metadata?.roomGuest===true);
   for(const pose of ['stand','browse','order','sit','look']){
    g.root.position.y=0;g.setPose(pose);g.animate(0,false,true);update(g);
    if(pose==='stand')sizes[profile.id]=Math.max(...g.root.getChildMeshes().filter(m=>m.isEnabled()).map(m=>m.getBoundingInfo().boundingBox.maximumWorld.y));
    if(pose==='sit')seatedFeet[profile.id]=floorY(g);
    const first=snapshot(g);g.animate(100,true,true,{stridePhase:4,walkWeight:1,dt:.05});reducedStable&&=first===snapshot(g);
    for(const elevation of pose==='sit'?[0,.125,.15,.175]:[0]){
     g.root.position.y=elevation;g.animate(0,false,true);update(g);minSole=Math.min(minSole,floorY(g));
     if(pose==='sit'){const h=g.root.getChildMeshes().find(m=>m.name.endsWith('-hips'));seatAnchorStable&&=Math.abs(h.getAbsolutePosition().y-(elevation+.49))<.00001;}
    }
   }
   g.root.position.y=0;g.setPose('stand');
   for(let i=0;i<phases;i++){
    g.animate(i/48,true,false,{stridePhase:i/phases*Math.PI*2,walkWeight:1,dt:1/48,reset:i===0});update(g);
    minSole=Math.min(minSole,floorY(g));maxSwing=Math.max(maxSwing,...shoes(g).map(m=>m.getBoundingInfo().boundingBox.minimumWorld.y));
    for(const k of g.root.getChildTransformNodes().filter(n=>n.name.includes('-knee-'))){kneeMin=Math.min(kneeMin,k.rotation.x);kneeMax=Math.max(kneeMax,k.rotation.x);}
    rootStable&&=g.root.position.x===2.5&&g.root.position.y===0&&g.root.position.z===3.5&&g.root.rotation.y===.4;
   }
   for(const elevation of [0,.125,.15,.175])for(const pose of ['sit','stand']){
    g.root.position.y=pose==='sit'?elevation:0;g.setPose(pose);
    for(let i=0;i<16;i++){g.setPose(pose);g.animate(i/60,false,false,{stridePhase:0,walkWeight:0,dt:1/60});update(g);transitionFloorSafe&&=floorY(g)>=-.002;}
   }
  }
  g.dispose();g.dispose();
 }
 const final=counts();test.dispose();return{initial,final,nonpickable,rootStable,reducedStable,profileResourcesStable,metadataStable,seatAnchorStable,transitionFloorSafe,minSole,maxSwing,kneeRange:kneeMax-kneeMin,sizes,seatedFeet,peakMeshesPerVisitor:peak,profiles:GUEST_PROFILES.map(p=>({id:p.id,group:p.group})),phases,cycles:12};
};window.artReady=true;
</script>`);
const tabs=await(await fetch(`http://127.0.0.1:${cdp}/json`)).json(),ws=new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));let sequence=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms)),shot=async name=>fs.writeFile(`work/traffic-visual-${name}.png`,Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:400,height:500,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:origin+'/tea-shop/preview/work/guest-visual.html'});
 for(let i=0;i<150;i++){if(await evaluate('!!window.artReady'))break;await pause(120);}
 assert.equal(await evaluate('!!window.artReady'),true);assert.equal(await evaluate('window.initiallyHidden'),true);
 for(const id of ['rose-bun','mint-child','navy-scarf','sage-bob','berry-child','ochre-knit']){await evaluate(`show('${id}')`);await shot(id);}
 for(let phase=0;phase<8;phase++){await evaluate(`show('rose-bun','walk',${phase*Math.PI/4})`);await shot('gait-'+phase);}
 await send('Emulation.setDeviceMetricsOverride',{width:800,height:650,deviceScaleFactor:1,mobile:false});await evaluate(`show('rose-bun','sit',0,false,true)`);await shot('seated-comparison');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate(`show('mint-child','sit',0,true)`);await shot('seated-night-phone');
 const results=await evaluate('checkVisuals()');await fs.writeFile('work/traffic-visual-check.json',JSON.stringify(results,null,2));
 assert.deepEqual(results.final,results.initial);for(const k of ['nonpickable','rootStable','reducedStable','profileResourcesStable','metadataStable','seatAnchorStable','transitionFloorSafe'])assert.ok(results[k],k);
 assert.ok(results.minSole>=-.002,'all gait and seated shoes stay above floor');assert.ok(results.maxSwing>.025,'swing foot lifts');assert.ok(results.kneeRange>.3,'knees bend through step');assert.ok(results.sizes['mint-child']<results.sizes['rose-bun']*.85,'child proportion reads smaller');assert.ok(results.seatedFeet['mint-child']>results.seatedFeet['rose-bun']+.15,'child seated feet dangle');assert.deepEqual(errors,[]);
 console.log('PASS: six reusable profiles, articulated gait across 48 phases, child seat contact, static reduced motion, caller-owned transforms, profile/resource reuse and twelve full rebuild cycles.',results);
}finally{ws.close();}
