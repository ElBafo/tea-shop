// Render exact runtime models. APP_ORIGIN and CDP_PORT select isolated tooling.
import fs from 'node:fs/promises';
const tabs=await(await fetch(`http://127.0.0.1:${process.env.CDP_PORT??9231}/json`)).json();const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
await send('Page.enable');await send('Page.navigate',{url:(process.env.APP_ORIGIN??'http://127.0.0.1:5174')+'/tea-shop/preview/?edition=2'});await new Promise(r=>setTimeout(r,2000));
await evaluate(`(async()=>{
 const {Engine}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Engines_engine.js');
 const {Scene}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_scene.js');
 const {ArcRotateCamera}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Cameras_arcRotateCamera.js');
 const {HemisphericLight}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Lights_hemisphericLight.js');
 const {DirectionalLight}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Lights_directionalLight.js');
 const {Vector3}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Maths_math__vector.js');
 const {Color3,Color4}=await import('/tea-shop/preview/node_modules/.vite/deps/@babylonjs_core_Maths_math__color.js');
 const {buildEditionItem,buildEditionPaintSample}=await import('/tea-shop/preview/src/shop/edition-art.ts');
 const {UPGRADE_BY_ID}=await import('/tea-shop/preview/src/shop/upgrades.ts');
 const canvas=document.createElement('canvas');canvas.width=320;canvas.height=256;canvas.style='position:fixed;left:0;top:0;width:320px;height:256px;z-index:99999';document.body.append(canvas);
 const engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
 window.renderThumb=async(id,style)=>{
  const scene=new Scene(engine);scene.clearColor=new Color4(.969,.949,.902,1);scene.ambientColor=new Color3(.6,.6,.6);
  const camera=new ArcRotateCamera('thumbnail',-Math.PI/3,Math.PI/2.8,6,Vector3.Zero(),scene);camera.mode=1;
  const hemi=new HemisphericLight('sky',new Vector3(0,1,0),scene);hemi.intensity=.9;
  const wallArt=UPGRADE_BY_ID[id].surface==='wall'||id==='paint';
  // The tall cabinet's display faces the camera like wall art; light its contents.
  const sun=new DirectionalLight('sun',new Vector3(-.5,-1,wallArt||id==='cabinet'?-.7:.7),scene);sun.intensity=.6;
  const shop={owned:[id],stored:[],style:{[id]:style},place:{[id]:{...UPGRADE_BY_ID[id].defaultPlace}},finaleSeen:false};
  const item=id==='paint'?buildEditionPaintSample(scene,style):buildEditionItem(scene,id,shop,style);item.position.setAll(0);item.rotation.setAll(0);
  // Look from the decorated front of wall pieces; floor furniture uses a three-quarter angle.
  camera.alpha=wallArt?Math.PI/2-.25:Math.PI/3;
  item.computeWorldMatrix(true);const {min,max}=item.getHierarchyBoundingVectors(true);const center=min.add(max).scale(.5);camera.target=center;camera.alpha=wallArt?Math.PI/2-.25:Math.PI/3;camera.beta=wallArt?Math.PI/2.25:Math.PI/2.8;
  const extent=max.subtract(min),span=Math.max(extent.x/1.25,extent.y,extent.z)*1.3;
  camera.orthoTop=span/2;camera.orthoBottom=-span/2;camera.orthoLeft=-span*.625;camera.orthoRight=span*.625;
  await scene.whenReadyAsync();scene.render();const data=canvas.toDataURL('image/webp',.92);const count={meshes:scene.meshes.length,materials:scene.materials.length};scene.dispose();return{data,count};
 };
})();`);
await fs.mkdir('public/edition2/thumbnails',{recursive:true});
const ids=process.env.THUMB_IDS?.split(',')??['counter','sign','paint','shelves','plant','rug','lamp','table','art','clock','basket','bench','trolley','planter','terrarium','botanical','cabinet','armchair'];
for(const id of ids)for(let style=0;style<3;style++){
 const r=await evaluate(`window.renderThumb(${JSON.stringify(id)},${style})`);await fs.writeFile(`public/edition2/thumbnails/${id}-${style}.webp`,Buffer.from(r.data.split(',')[1],'base64'));console.log(id,style,r.count);
}
ws.close();
