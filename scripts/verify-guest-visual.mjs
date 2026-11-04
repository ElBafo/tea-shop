// Isolated visual/lifecycle check. Serve Vite with HMR disabled; use a dedicated CDP browser.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = process.env.GAME_ORIGIN ?? 'http://127.0.0.1:5178';
const cdp = process.env.CDP_PORT ?? 9231;
await fs.mkdir('work', {recursive:true});
await fs.writeFile('work/guest-visual.html', `<!doctype html><meta charset="utf-8"><title>Guest visual check</title><style>html,body{margin:0;height:100%;overflow:hidden;background:#f3eee2}canvas{width:100%;height:100%;display:block}</style><canvas id="sample"></canvas><script type="module">
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
const canvas=document.querySelector('canvas'),engine=new Engine(canvas,true),scene=new Scene(engine);
scene.clearColor=Color4.FromHexString('#f3eee2ff');
const camera=new ArcRotateCamera('portrait',Math.PI/3,Math.PI/2.65,7,new Vector3(0,.71,0),scene);camera.mode=1;
const light=new HemisphericLight('soft',new Vector3(0,1,0),scene);light.intensity=.83;
const sun=new DirectionalLight('day',new Vector3(-.3,-1,.4),scene);sun.intensity=.55;
const ground=MeshBuilder.CreateGround('floor',{width:30,height:30},scene);const floor=new StandardMaterial('floor',scene);floor.diffuseColor=Color3.FromHexString('#eee7d8');floor.specularColor.setAll(0);ground.material=floor;
const seatMat=new StandardMaterial('stool-oak',scene);seatMat.diffuseColor=Color3.FromHexString('#b98d60');seatMat.specularColor.setAll(.04);
const guests=[buildTrafficGuest(scene,0),buildTrafficGuest(scene,1)];
window.initiallyHidden=guests.every(g=>!g.root.isEnabled());
const stools=[];
guests.forEach((g,i)=>{g.root.position.x=i? .48:-.48;g.root.rotation.y=Math.PI/6;g.root.setEnabled(true);const stool=MeshBuilder.CreateCylinder('stool',{height:.43,diameter:.37,tessellation:16},scene);stool.position.set(g.root.position.x,.215,0);stool.material=seatMat;stool.setEnabled(false);stools.push(stool);});
const fit=()=>{engine.resize();const aspect=engine.getRenderWidth()/engine.getRenderHeight(),half=Math.max(.97,.91/aspect);camera.orthoTop=half;camera.orthoBottom=-half;camera.orthoLeft=-half*aspect;camera.orthoRight=half*aspect;};
window.showPose=async(pose,night=false)=>{fit();guests.forEach(g=>{g.setPose(pose);g.animate(.45,pose==='stand',false);});stools.forEach(s=>s.setEnabled(pose==='sit'));light.intensity=night?.52:.83;sun.intensity=night?.23:.55;sun.diffuse=Color3.FromHexString(night?'#b8c7d5':'#fff0dd');scene.clearColor=Color4.FromHexString(night?'#23353bff':'#f3eee2ff');floor.diffuseColor=Color3.FromHexString(night?'#64746c':'#eee7d8');await scene.whenReadyAsync();scene.render();};
window.checkVisuals=()=>{
 const test=new Scene(engine),counts=()=>({meshes:test.meshes.length,materials:test.materials.length,textures:test.textures.length,transforms:test.transformNodes.length}),initial=counts();let nonpickable=true,rootStable=true,reducedStable=true,peak=0;
 for(let cycle=0;cycle<12;cycle++)for(let variant=0;variant<2;variant++){
  const g=buildTrafficGuest(test,variant);g.root.position.set(2.5,0,3.5);g.root.rotation.y=.4;g.root.setEnabled(true);const pos=g.root.position.asArray().join(','),rot=g.root.rotation.asArray().join(',');
  peak=Math.max(peak,test.meshes.length);nonpickable&&=g.root.getChildMeshes().every(m=>!m.isPickable&&m.metadata?.roomGuest===true);
  for(const pose of ['stand','browse','order','sit','look']){g.setPose(pose);for(let i=0;i<24;i++)g.animate(i/12,pose==='stand',false);rootStable&&=g.root.position.asArray().join(',')===pos&&g.root.rotation.asArray().join(',')===rot;
   g.animate(0,true,true);const first=g.root.getChildTransformNodes().map(n=>[...n.position.asArray(),...n.rotation.asArray()]);g.animate(100,true,true);const last=g.root.getChildTransformNodes().map(n=>[...n.position.asArray(),...n.rotation.asArray()]);reducedStable&&=JSON.stringify(first)===JSON.stringify(last);
  }
  g.dispose();g.dispose();
 }
 const final=counts();test.dispose();return{initial,final,nonpickable,rootStable,reducedStable,peakMeshesPerVisitor:peak,poses:['stand','browse','order','sit','look'],variants:2,cycles:12};
};
window.artReady=true;
</script>`);
const tabs = await (await fetch(`http://127.0.0.1:${cdp}/json`)).json();
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++sequence,{resolve,reject});ws.send(JSON.stringify({id:sequence,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async name=>fs.writeFile(`work/traffic-visual-${name}.png`,Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1000,height:800,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:origin+'/tea-shop/preview/work/guest-visual.html'});
 for(let i=0;i<150;i++){if(await evaluate('!!window.artReady'))break;await pause(120);}
 assert.equal(await evaluate('!!window.artReady'),true,'sample scene loads');
 assert.equal(await evaluate('window.initiallyHidden'),true,'runtime controls first visibility');
 for(const pose of ['stand','browse','order','sit']){await evaluate(`showPose('${pose}')`);await shot(pose+'-desktop');}
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await evaluate(`showPose('stand')`);await shot('standing-phone');
 await evaluate(`showPose('sit',true)`);await shot('seated-night-phone');
 const results=await evaluate('checkVisuals()');assert.deepEqual(results.final,results.initial);assert.ok(results.nonpickable);assert.ok(results.rootStable);assert.ok(results.reducedStable);assert.deepEqual(errors,[]);
 await fs.writeFile('work/traffic-visual-check.json',JSON.stringify(results,null,2));
 console.log('PASS: two visitor palettes and five poses, non-pickable meshes, stable route transforms, static reduced motion and twelve full rebuild cycles release all resources.',results);
}finally{ws.close();}
