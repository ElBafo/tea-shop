import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Board, ItemId } from '../game/types';
import { canPour, cloneBoard, isCompleteTube, topRun } from '../game/engine';
import { ITEMS } from '../game/items';

export interface Puzzle3DView {
  ready: Promise<void>;
  sync(board: Board, selected: number | null): void;
  resize(): void;
  lift(from: number | null, point?: {x: number; y: number}): void;
  settle(from: number, to: number): Promise<void>;
  dispose(): void;
}
interface JarGeometry { x:number; y:number; width:number; height:number; slots:{x:number;y:number;width:number;height:number}[]; }
interface Piece {root:TransformNode; width:number;height:number; item:ItemId|null; jar:number;slot:number;}

/** Native jar buttons own input; engine.ts owns all rules and saved state. */
export function createPuzzle3D(canvas: HTMLCanvasElement, shelf: HTMLElement): Puzzle3DView {
  let engine:Engine;
  try { engine=new Engine(canvas,true,{alpha:true,stencil:true,preserveDrawingBuffer:true}); }
  catch (error) {queueMicrotask(()=>canvas.dispatchEvent(new CustomEvent('puzzle3d-unavailable')));throw error;}
  const scene=new Scene(engine);
  scene.metadata={puzzleComparison3D:true};
  scene.clearColor=new Color4(0,0,0,0);
  scene.ambientColor=new Color3(.28,.29,.25);
  scene.skipPointerMovePicking=true;
  scene.setRenderingAutoClearDepthStencil(1,false);
  scene.setRenderingAutoClearDepthStencil(2,false);
  const camera=new FreeCamera('puzzle-camera',new Vector3(0,0,-1000),scene);
  camera.setTarget(Vector3.Zero());camera.mode=Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ=.1;camera.maxZ=2000;
  const ambient=new HemisphericLight('puzzle-soft-fill',new Vector3(.2,1,-.5),scene);
  ambient.intensity=.85;ambient.diffuse=new Color3(1,.98,.92);ambient.groundColor=new Color3(.7,.73,.67);
  const daylight=new DirectionalLight('puzzle-window-light',new Vector3(.35,-.5,1),scene);
  daylight.intensity=.65;daylight.diffuse=new Color3(1,.96,.87);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const materials=new Map<string,StandardMaterial>();
  let disposed=false,frame=0,world:TransformNode|null=null,ghost:TransformNode|null=null;
  let board:Board|null=null,selection:number|null=null,geometry:JarGeometry[]=[],pieces:Piece[]=[];
  let signature='',lastArrival:{jar:number;first:number}|null=null;
  let ghostSource:number|null=null,ghostPieces:Piece[]=[];
  let width=1,height=1;
  let settleAnimation:{parts:{root:TransformNode;y:number}[];start:number;resolve:()=>void}|null=null;
  let markReady = () => {};
  const ready = new Promise<void>(resolve => { markReady = resolve; });

  const mat=(name:string,hex:string,alpha=1,spec=.12)=>{
    const existing=materials.get(name);if(existing)return existing;
    const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(hex);m.alpha=alpha;
    m.specularColor=new Color3(spec,spec,spec);m.specularPower=70;m.backFaceCulling=false;
    if(alpha<1)m.disableDepthWrite=true;
    materials.set(name,m);return m;
  };
  const glass=mat('puzzle-glass','#dcefe4',.085,.65);
  const edge=mat('puzzle-glass-edge','#94b39e',1,.2);
  const rim=mat('puzzle-glass-rim','#dcebdc',1,.28);
  const highlight=mat('puzzle-glass-highlight','#ffffff',1,.15);
  edge.backFaceCulling=true;rim.backFaceCulling=true;highlight.backFaceCulling=true;
  rim.emissiveColor=new Color3(.035,.045,.035);
  const shadow=mat('puzzle-contact','#718875',.13,0);
  const selectedMat=mat('puzzle-selected','#436f54',.9,.1);
  const legalMat=mat('puzzle-legal','#8aad71',.85,.1);
  const completeMat=mat('puzzle-complete','#6b9165',.8,.1);
  const stringMat=mat('puzzle-cotton-string','#fff8de',1,.04);
  const seamMat=mat('puzzle-paper-seam','#fff8df',1,.02);
  const clearAnimation=()=>{const a=settleAnimation;if(!a)return;settleAnimation=null;for(const part of a.parts)if(!part.root.isDisposed()){part.root.position.y=part.y;part.root.scaling.setAll(1);}a.resolve();};
  const draw=()=>{
    frame=0;if(disposed||document.hidden)return;
    if(settleAnimation){const a=settleAnimation,t=Math.min(1,(performance.now()-a.start)/190),ease=1-Math.pow(1-t,3);
      for(const part of a.parts)if(!part.root.isDisposed()){part.root.position.y=part.y+(1-ease)*9;part.root.scaling.set(1+.025*Math.sin(t*Math.PI),1-.025*Math.sin(t*Math.PI),1);}
      if(t>=1)clearAnimation();
    }
    try {
      engine.beginFrame();scene.render();engine.endFrame();
      if (scene.isReady()) markReady();
      if(settleAnimation)frame=requestAnimationFrame(draw);
    } catch {
      clearAnimation();
      canvas.dispatchEvent(new CustomEvent('puzzle3d-unavailable'));
    }
  };
  const requestDraw=()=>{if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};
  const attach=(mesh:Mesh,parent:TransformNode,material:StandardMaterial,x=0,y=0,z=0,group=1)=>{
    mesh.parent=parent;mesh.material=material;mesh.position.set(x,y,z);mesh.renderingGroupId=group;mesh.isPickable=false;return mesh;
  };
  const softBox=(name:string,parent:TransformNode,material:StandardMaterial,w:number,h:number,d:number,r:number)=>{
    const mesh=new Mesh(name,scene),positions:number[]=[],indices:number[]=[],uvs:number[]=[];
    const count=32,bevel=Math.min(2.2,d*.26),levels=[[-d/2,bevel],[0,0],[d/2,bevel]];
    for(const [z,inset] of levels)for(let corner=0;corner<4;corner++)for(let step=0;step<8;step++){
      const angle=corner*Math.PI/2+step*Math.PI/14;
      const x=(corner===0||corner===3?1:-1)*(w/2-r)+Math.cos(angle)*(r-inset);
      const y=(corner<2?1:-1)*(h/2-r)+Math.sin(angle)*(r-inset);
      positions.push(x,y,z);uvs.push(x/w+.5,y/h+.5);
    }
    for(let k=0;k<2;k++)for(let i=0;i<count;i++){const a=k*count+i,b=k*count+(i+1)%count;indices.push(a,b,a+count,b,b+count,a+count);}
    const front=positions.length/3;positions.push(0,0,-d*.64,0,0,d/2);uvs.push(.5,.5,.5,.5);
    for(let i=0;i<count;i++){const j=(i+1)%count;indices.push(front,j,i,front+1,2*count+i,2*count+j);}
    // Babylon computes left-handed normals; front-facing paper points toward -Z.
    for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
    const normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();Object.assign(data,{positions,indices,normals,uvs});data.applyToMesh(mesh);
    return attach(mesh,parent,material);
  };
  const paper=(item:ItemId|null)=>{
    const key='puzzle-paper-'+(item??'hidden'),existing=materials.get(key);if(existing)return existing;
    const look=item?ITEMS[item]:null,m=mat(key,'#ffffff',1,.035);m.backFaceCulling=true;
    const texture=new DynamicTexture(key+'-print',{width:256,height:160},scene,false);
    const ctx=texture.getContext() as unknown as CanvasRenderingContext2D;
    const fill=look?.fill??'#d9e1d8',ink=look?.ink??'#647668';
    const gradient=ctx.createLinearGradient(0,0,256,160);gradient.addColorStop(0,'#fff6dc');gradient.addColorStop(.23,fill);gradient.addColorStop(1,look?.deep??'#b9cabb');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,160);
    ctx.strokeStyle='rgba(255,250,224,.8)';ctx.lineWidth=3;ctx.setLineDash([3,5]);
    for(const y of [15,145]){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(236,y);ctx.stroke();}ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,251,230,.89)';ctx.beginPath();ctx.roundRect(42,32,172,96,22);ctx.fill();
    ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=4;
    if(item==='matcha'){
      ctx.beginPath();ctx.moveTo(68,111);ctx.quadraticCurveTo(101,80,115,51);ctx.stroke();
      for(const [x,y,a] of [[86,87,-.7],[108,70,.5]]){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,12,23,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    }else if(item==='rose'||item==='jasmine'){
      ctx.fillStyle=item==='rose'?'#bc6276':'#d6af41';for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.ellipse(94+Math.cos(a)*17,78+Math.sin(a)*17,14,20,a,0,Math.PI*2);ctx.fill();}ctx.fillStyle=item==='rose'?'#f8df91':'#fff7d0';ctx.beginPath();ctx.arc(94,78,10,0,Math.PI*2);ctx.fill();
    }else if(item==='chai'){
      ctx.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?10:29;const x=94+Math.sin(a)*r,y=80+Math.cos(a)*r;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();
    }else if(item){ctx.beginPath();ctx.ellipse(94,80,20,28,-.4,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=ink;ctx.font='bold 82px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item?look!.label[0]:'?',item?173:128,84);
    texture.update(true);m.diffuseTexture=texture;return m;
  };
  const sachet=(parent:TransformNode,item:ItemId|null,w:number,h:number,name:string)=>{
    const root=new TransformNode(name,scene);root.parent=parent;
    const d=Math.max(5,h*.22);softBox('sachet-paper',root,paper(item),w,h,d,Math.min(8,h*.24));
    const fold=attach(MeshBuilder.CreateBox('sachet-fold',{width:w*.62,height:Math.max(1,h*.075),depth:1},scene),root,seamMat,0,h*.39,-d*.49);
    fold.rotation.z=-.025;
    // A short cotton thread reads as a tea packet without crossing another slot.
    const thread=MeshBuilder.CreateTube('sachet-thread',{path:[new Vector3(w*.13,h*.42,-d*.61),new Vector3(w*.32,h*.28,-d*.8),new Vector3(w*.38,h*.01,-d*.85)],radius:Math.max(.45,w*.008),tessellation:5},scene);
    attach(thread,root,stringMat);
    return root;
  };
  const measure=()=>{
    const bounds=canvas.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
    return [...shelf.querySelectorAll<HTMLElement>('.jar[data-jar]')].map(jar=>{
      const box=jar.querySelector<HTMLElement>('.jar-glass')!.getBoundingClientRect();
      return{x:box.x-bounds.x+box.width/2-width/2,y:height/2-(box.y-bounds.y+box.height/2),width:box.width,height:box.height,
        slots:[...jar.querySelectorAll<HTMLElement>('.slot')].map(slot=>{const r=slot.getBoundingClientRect();return{x:r.x-bounds.x+r.width/2-width/2,y:height/2-(r.y-bounds.y+r.height/2),width:r.width,height:r.height};})};
    });
  };
  const clearGhost=()=>{ghost?.dispose();ghost=null;ghostSource=null;ghostPieces=[];for(const p of pieces)p.root.setEnabled(true);};
  const rebuild=()=>{
    clearAnimation();clearGhost();world?.dispose();world=new TransformNode('puzzle-board',scene);pieces=[];
    if(!board)return;
    geometry.forEach((g,index)=>{
      const tube=board!.tubes[index];if(!tube)return;
      const jar=new TransformNode('puzzle-vase-'+index,scene);jar.parent=world;jar.position.set(g.x,g.y,0);jar.metadata={jar:index};
      const w=g.width*.94,h=g.height*.96,r=w/2;
      const outline=[new Vector3(r*.70,-h/2,0),new Vector3(r*.90,-h/2+3,0),new Vector3(r,-h/2+12,0),new Vector3(r,h/2-14,0),new Vector3(r*.87,h/2-5,0),new Vector3(r*.84,h/2,0)];
      const body=MeshBuilder.CreateLathe('vase-glass',{shape:outline,tessellation:48,sideOrientation:Mesh.FRONTSIDE,cap:Mesh.NO_CAP},scene);attach(body,jar,glass,0,0,0,2);
      const foot=attach(MeshBuilder.CreateTorus('vase-foot',{diameter:w*.82,thickness:3.2,tessellation:36},scene),jar,edge,0,-h/2+2,0,2);foot.rotation.x=-.2;
      const lip=attach(MeshBuilder.CreateTorus('vase-mouth',{diameter:w*.85,thickness:3.4,tessellation:40},scene),jar,rim,0,h/2-1,0,2);lip.rotation.x=-.24;
      const innerLip=attach(MeshBuilder.CreateTorus('vase-inner-rim',{diameter:w*.78,thickness:1.1,tessellation:36},scene),jar,edge,0,h/2-1,-.8,2);innerLip.rotation.x=-.24;
      const stroke=(name:string,x:number,z:number,alphaMaterial:StandardMaterial)=>attach(MeshBuilder.CreateTube(name,{path:[new Vector3(x*.93,-h*.38,z),new Vector3(x,-h*.29,z),new Vector3(x,h*.34,z),new Vector3(x*.92,h*.4,z)],radius:1,tessellation:5},scene),jar,alphaMaterial,0,0,0,2);
      stroke('vase-left-edge',-w*.48,-r*.22,edge);stroke('vase-right-edge',w*.48,-r*.22,edge);stroke('vase-light-stripe',-w*.39,-r*.59,highlight);
      const baseShadow=attach(MeshBuilder.CreateSphere('vase-contact',{diameter:1,segments:10},scene),jar,shadow,2,-h/2-4,10,0);baseShadow.scaling.set(w*.95,8,1);
      const active=selection===index?selectedMat:selection!==null&&canPour(board!,selection,index)>0?legalMat:isCompleteTube(tube,board!.capacity)?completeMat:null;
      if(active){const halo=attach(MeshBuilder.CreateTorus('vase-state',{diameter:w*.95,thickness:3,tessellation:40},scene),jar,active,0,-h/2-1,-1,2);halo.rotation.x=-.35;}
      g.slots.forEach((slot,slotIndex)=>{
        if(!tube[slotIndex])return;
        const hidden=board!.sealed[index]&&slotIndex<tube.length-1;
        const item=hidden?null:tube[slotIndex],ph=Math.min(43,slot.height*.82),pw=Math.min(slot.width*.78,ph*1.65);
        const root=sachet(world!,item,pw,ph,`puzzle-sachet-${index}-${slotIndex}`);
        root.position.set(slot.x,slot.y,-r*.1);root.rotation.y=(slotIndex%2?1:-1)*.045;
        root.metadata={jar:index,slot:slotIndex,hidden};pieces.push({root,width:pw,height:ph,item,jar:index,slot:slotIndex});
      });
    });
    requestDraw();
    scene.executeWhenReady(requestDraw);
  };
  const resize=()=>{
    if(disposed)return;const next=measure();
    const dpr=Math.min(window.devicePixelRatio||1,1.75);
    engine.setSize(Math.max(1,Math.round(width*dpr)),Math.max(1,Math.round(height*dpr)),false);
    camera.orthoLeft=-width/2;camera.orthoRight=width/2;camera.orthoTop=height/2;camera.orthoBottom=-height/2;
    const nextSignature=JSON.stringify(next);
    if(signature!==nextSignature){signature=nextSignature;geometry=next;rebuild();}else requestDraw();
  };
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;clearAnimation();clearGhost();}else requestDraw();};
  const motion=()=>{if(reduced.matches)clearAnimation();requestDraw();};
  const lost=(event:Event)=>{event.preventDefault();if(disposed)return;cancelAnimationFrame(frame);frame=0;clearAnimation();clearGhost();canvas.dispatchEvent(new CustomEvent('puzzle3d-unavailable'));};
  const observer=new ResizeObserver(resize);observer.observe(shelf);observer.observe(canvas);
  shelf.addEventListener('scroll',resize,{passive:true});window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',motion);canvas.addEventListener('webglcontextlost',lost);
  resize();
  return {
    ready,
    sync(next,selected){
      if(disposed)return;
      const old=board;lastArrival=null;
      if(old)next.tubes.forEach((tube,i)=>{if(tube.length>(old.tubes[i]?.length??0))lastArrival={jar:i,first:old.tubes[i]?.length??0};});
      board=cloneBoard(next);selection=selected;geometry=measure();signature=JSON.stringify(geometry);rebuild();
    },
    resize,
    lift(from,point){
      if(disposed)return;if(from===null||!point||!board){clearGhost();requestDraw();return;}
      if(ghostSource!==from){clearGhost();const tube=board.tubes[from],run=topRun(tube);if(!run)return;
        const count=board.sealed[from]?1:run.count;
        ghostPieces=pieces.filter(p=>p.jar===from&&p.slot>=tube.length-count);ghost=new TransformNode('puzzle-lift',scene);ghost.metadata={source:from,visibleCount:ghostPieces.length};ghostSource=from;
        ghostPieces.forEach((piece,i)=>{piece.root.setEnabled(false);const copy=sachet(ghost!,piece.item,piece.width,piece.height,'lifted-sachet');copy.position.y=i*piece.height*.72;copy.rotation.z=(i%2?1:-1)*.035;copy.getChildMeshes().forEach(mesh=>mesh.renderingGroupId=2);});
      }
      if(ghost){const box=canvas.getBoundingClientRect();ghost.position.set(point.x-box.x-width/2,height/2-(point.y-box.y)+30,-120);requestDraw();}
    },
    settle(_from,to){clearAnimation();if(disposed||document.hidden||reduced.matches)return Promise.resolve();const arrival=lastArrival?.jar===to?lastArrival.first:Math.max(0,(board?.tubes[to]?.length??1)-1);
      const parts=pieces.filter(p=>p.jar===to&&p.slot>=arrival).map(p=>({root:p.root,y:p.root.position.y}));
      if(!parts.length)return Promise.resolve();return new Promise<void>(resolve=>{settleAnimation={parts,start:performance.now(),resolve};requestDraw();});
    },
    dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearAnimation();clearGhost();observer.disconnect();shelf.removeEventListener('scroll',resize);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motion);canvas.removeEventListener('webglcontextlost',lost);scene.dispose();engine.dispose();materials.clear();},
  };
}
