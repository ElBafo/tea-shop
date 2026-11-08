import { buildEditionExtra, editionExtraIds } from './edition-extras';
import { buildEditionSpecial, editionSpecialIds } from './edition-specials';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import type { ShopState, UpgradeId } from '../game/types';
import { floorCenter, wallCenter } from './grid';
import { UPGRADE_BY_ID, placeOf, isPlaced } from './upgrades';
import { editionFabricTexture, editionSignTexture, editionOakTexture } from './textures';

const E={cream:'#f6eedf',oak:'#c79b70',dark:'#725340',sage:'#8da496',rose:'#c78d82',brass:'#b69862',leaf:'#69896b',leafDeep:'#46664e',ink:'#414f49'};
export const editionCoreIds: UpgradeId[]=['counter','sign','paint','shelves','plant','rug','lamp','table'];
export const editionArtIds: UpgradeId[]=[...editionCoreIds,...editionExtraIds,...editionSpecialIds];
export type EditionTools = { E:typeof E; mat:typeof mat; attach:typeof attach; orb:typeof orb; cylinder:typeof cylinder; ring:typeof ring; soft:typeof soft; cup:typeof cup; pot:typeof pot; place:typeof place; tag:typeof tag; };
function mat(scene:Scene,name:string,hex:string,spec=.12){const m=new StandardMaterial('edition-'+name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=new Color3(spec,spec,spec);m.maxSimultaneousLights=5;return m;}
function attach(mesh:Mesh,p:TransformNode,m:StandardMaterial,x=0,y=0,z=0){mesh.parent=p;mesh.material=m;mesh.position.set(x,y,z);mesh.receiveShadows=true;return mesh;}
function orb(s:Scene,n:string,p:TransformNode,m:StandardMaterial,r:number,x=0,y=0,z=0,sx=1,sy=1,sz=1){const a=attach(MeshBuilder.CreateSphere(n,{diameter:r*2,segments:12},s),p,m,x,y,z);a.scaling.set(sx,sy,sz);return a;}
function cylinder(s:Scene,n:string,p:TransformNode,m:StandardMaterial,h:number,r:number,x=0,y=0,z=0,rt=r){return attach(MeshBuilder.CreateCylinder(n,{height:h,diameterTop:rt*2,diameterBottom:r*2,tessellation:24},s),p,m,x,y,z);}
function ring(s:Scene,n:string,p:TransformNode,m:StandardMaterial,d:number,t:number,x=0,y=0,z=0){return attach(MeshBuilder.CreateTorus(n,{diameter:d,thickness:t,tessellation:24},s),p,m,x,y,z);}
// Rounded, bevelled solid rather than a collection of overlapping boxes.
function soft(s:Scene,n:string,p:TransformNode,m:StandardMaterial,w:number,h:number,d:number,r=.06,x=0,y=0,z=0){
 const mesh=new Mesh(n,s),positions:number[]=[],indices:number[]=[],uvs:number[]=[];r=Math.min(r,w/2-.001,d/2-.001);const bevel=Math.min(.025,h*.2,r*.4),points=36;
 const levels=[[-h/2,bevel],[-h/2+bevel,0],[h/2-bevel,0],[h/2,bevel]];
 for(const [yy,inset] of levels)for(let c=0;c<4;c++)for(let j=0;j<9;j++){
  const a=c*Math.PI/2+j*Math.PI/16,xx=(c===0||c===3?1:-1)*(w/2-r),zz=(c<2?1:-1)*(d/2-r);
  const px=xx+Math.cos(a)*(r-inset),pz=zz+Math.sin(a)*(r-inset);positions.push(px,yy,pz);uvs.push(px/w+.5,pz/d+.5);
 }
 for(let k=0;k<3;k++)for(let i=0;i<points;i++){const a=k*points+i,b=k*points+(i+1)%points;indices.push(a,b,a+points,b,b+points,a+points);}
 const bottom=positions.length/3;positions.push(0,-h/2,0,0,h/2,0);uvs.push(.5,.5,.5,.5);
 for(let i=0;i<points;i++){const j=(i+1)%points;indices.push(bottom,j,i,bottom+1,3*points+i,3*points+j);}
 const normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);const v=new VertexData();Object.assign(v,{positions,indices,normals,uvs});v.applyToMesh(mesh);return attach(mesh,p,m,x,y,z);
}
function cup(s:Scene,p:TransformNode,body:StandardMaterial,tea:StandardMaterial,x:number,y:number,z:number){
 cylinder(s,'saucer',p,body,.025,.135,x,y,z);cylinder(s,'ceramic-cup',p,body,.15,.075,x,y+.085,z,.095);cylinder(s,'tea',p,tea,.009,.073,x,y+.165,z);
 const h=ring(s,'cup-handle',p,body,.11,.025,x+.105,y+.1,z);h.rotation.x=Math.PI/2;
}
function pot(s:Scene,p:TransformNode,body:StandardMaterial,accent:StandardMaterial,x:number,y:number,z:number){
 orb(s,'teapot-belly',p,body,.16,x,y+.15,z,1.15,.95,1);cylinder(s,'teapot-lid',p,accent,.035,.115,x,y+.29,z);orb(s,'teapot-knob',p,accent,.035,x,y+.33,z);
 const sp=cylinder(s,'teapot-spout',p,body,.23,.035,x+.19,y+.2,z,.055);sp.rotation.z=-.8;
 const h=ring(s,'teapot-handle',p,accent,.24,.035,x-.18,y+.17,z);h.rotation.x=Math.PI/2;
}
function steam(s:Scene,p:TransformNode,x:number,y:number,z:number){const m=mat(s,'steam','#fff8e9');m.alpha=.26;m.emissiveColor=Color3.FromHexString('#fff1d6').scale(.18);for(let i=0;i<3;i++){const a=orb(s,'tea-steam',p,m,.045,x,y,z,1,1.4,1);a.isPickable=false;a.receiveShadows=false;a.metadata={steam:{x,y,phase:i/3}};}}
function tag(root:TransformNode,id:UpgradeId){root.metadata={upgradeId:id};for(const m of root.getChildMeshes())m.metadata={...m.metadata,upgradeId:id};}
function place(root:TransformNode,id:UpgradeId,shop:ShopState){const def=UPGRADE_BY_ID[id],p=placeOf(shop,id);if(def.surface==='wall'){const c=wallCenter(p,def.size.w);root.position.set(c.x,id==='shelves'?1.85:c.y,c.z);root.rotation.y=p.wall==='left'?Math.PI/2:0;}else{const c=floorCenter(def.size,p);root.position.set(c.x,0,c.z);root.rotation.y=p.rot*Math.PI/2;}}
export function editionReadingNook(shop:ShopState):boolean{
 if(!isPlaced(shop,'table')||!isPlaced(shop,'lamp'))return false;
 const t=floorCenter(UPGRADE_BY_ID.table.size,placeOf(shop,'table')),l=floorCenter(UPGRADE_BY_ID.lamp.size,placeOf(shop,'lamp'));
 return Math.hypot(t.x-l.x,t.z-l.z)<2.3;
}
export function buildEditionItem(scene:Scene,id:UpgradeId,shop:ShopState,style:number):TransformNode{
 if(editionSpecialIds.includes(id)) return buildEditionSpecial(scene,id,shop,style,{E,mat,attach,orb,cylinder,ring,soft,cup,pot,place,tag});
 if(editionExtraIds.includes(id)) return buildEditionExtra(scene,id,shop,style,{E,mat,attach,orb,cylinder,ring,soft,cup,pot,place,tag});
 const root=new TransformNode(id,scene);const wood=mat(scene,'oak',E.oak),cream=mat(scene,'porcelain',E.cream,.25),dark=mat(scene,'walnut',E.dark),brass=mat(scene,'brass',E.brass,.3),accent=mat(scene,'accent',[E.sage,E.cream,E.rose][style]);
 if(id==='counter'){
  const body=style===0?wood:accent;soft(scene,'counter-cabinet',root,body,2.88,1.02,.89,.13,0,.56,0);
  soft(scene,'counter-plinth',root,dark,2.74,.12,.78,.1,0,.09,0);soft(scene,'rounded-countertop',root,style===0?dark:cream,3,.13,1,.17,0,1.12,0);
  for(const x of [-.94,0,.94]){soft(scene,'cabinet-panel',root,cream,.8,.68,.035,.05,x,.57,.454);soft(scene,'panel-inset',root,body,.69,.56,.045,.05,x,.57,.475);orb(scene,'cabinet-handle',root,brass,.027,x+.22,.72,.507);}
  soft(scene,'serving-tray',root,dark,1.05,.035,.54,.15,-.7,1.2,.02);pot(scene,root,accent,cream,-.83,1.22,.02);cup(scene,root,cream,dark,-.36,1.22,.08);steam(scene,root,-.83,1.64,.02);
  for(let i=0;i<3;i++){const x=.28+i*.28;cylinder(scene,'tea-canister',root,i===1?accent:cream,.26,.105,x,1.33,-.15);cylinder(scene,'canister-lid',root,wood,.035,.115,x,1.48,-.15);soft(scene,'tin-label',root,dark,.1,.09,.01,.003,x,1.34,-.038);}
  soft(scene,'folded-cloth',root,accent,.38,.03,.35,.06,.92,1.205,.22);
 }else if(id==='sign'){
  soft(scene,'rounded-sign',root,style===1?brass:wood,1.9,.78,.12,.15);const face=MeshBuilder.CreatePlane('sign-lettering',{width:1.7,height:.61},scene);attach(face,root,mat(scene,'sign-face','#ffffff'),0,0,.066);face.rotation.y=Math.PI;(face.material as StandardMaterial).diffuseTexture=editionSignTexture(scene,style);
  for(const x of [-.64,.64])cylinder(scene,'sign-hook',root,brass,.14,.025,x,.45,0);
 }else if(id==='shelves'){
  soft(scene,'shelf-back',root,style===2?accent:cream,2.78,.93,.05,.09,0,.08,.04);
  for(const y of [-.3,.32])soft(scene,'shelf-board',root,style===1?cream:wood,2.9,.09,.4,.045,0,y,.22);
  for(const x of [-1.32,1.32])soft(scene,'shelf-side',root,wood,.12,1,.32,.04,x,.14,.2);
  const colors=[E.sage,E.rose,'#d8ba79'];for(let i=0;i<6;i++){const x=-.9+(i%3)*.9,y=i<3?.37:-.25;const jar=mat(scene,'shelf-glaze'+i,colors[(i+style)%3],.3);cylinder(scene,'tea-jar',root,jar,.31,.145,x,y+.16,.2,.13);cylinder(scene,'tea-jar-lid',root,cream,.045,.15,x,y+.34,.2);soft(scene,'jar-label',root,cream,.12,.13,.015,.005,x,y+.16,.335);}
 }else if(id==='plant'){
  cylinder(scene,'ceramic-planter',root,accent,.34,.22,0,.19,0,.28);ring(scene,'pot-rim',root,cream,.55,.035,0,.36,0);cylinder(scene,'soil',root,dark,.015,.24,0,.37,0);
  const leaf=mat(scene,'leaf',E.leaf),deep=mat(scene,'leaf-shadow',E.leafDeep);
  if(style===1){for(let i=0;i<9;i++){const a=i*2.4,r=.16*Math.sqrt(i/9);const l=orb(scene,'succulent-leaf',root,i%2?leaf:deep,.16,Math.cos(a)*r,.46+(8-i)*.012,Math.sin(a)*r,.65,.4,1.2);l.rotation.y=-a;l.rotation.z=.3;}}
  else for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const stalk=cylinder(scene,'plant-stem',root,deep,.42,.018,Math.cos(a)*.08,.58,Math.sin(a)*.08);stalk.rotation.z=Math.cos(a)*.28;const l=orb(scene,'broad-leaf',root,i%2?leaf:deep,.18,Math.cos(a)*.2,.72+(i%2)*.08,Math.sin(a)*.2,.56,1.15,.32);l.rotation.y=-a;l.rotation.z=Math.cos(a)*.45;}
  if(style===2){const bloom=mat(scene,'flower','#d3a08c');for(let j=0;j<3;j++)for(let i=0;i<5;i++){const a=i*Math.PI*2/5;orb(scene,'flower-petal',root,bloom,.065,Math.cos(a)*.075+(j-1)*.13,.96+Math.sin(a)*.065,Math.sin(j)*.1,.9,.65,.4);}}
 }else if(id==='rug'){
  const fabric=mat(scene,'rug','#ffffff',.02);fabric.diffuseTexture=editionFabricTexture(scene,style);soft(scene,'woven-rug',root,fabric,2.9,.035,1.88,.2,0,.035,0);
  for(let i=0;i<18;i++)for(const z of [-.97,.97])soft(scene,'tassel',root,cream,.035,.018,.1,.012,-1.3+i*.153,.035,z);
 }else if(id==='lamp'){
  cylinder(scene,'lamp-foot',root,style===2?accent:dark,.09,.25,0,.055,0);cylinder(scene,'lamp-stem',root,brass,1.01,.035,0,.59,0);
  const shade=mat(scene,'lamp-shade',style===1?'#e2b994':E.cream);shade.emissiveColor=Color3.FromHexString('#e6bf80').scale(.16);
  if(style===0){orb(scene,'paper-lantern',root,shade,.28,0,1.28,0,1,1.08,1);for(const y of [1.04,1.16,1.28,1.4,1.52]){const rr=Math.sqrt(Math.max(.01,.28*.28-(y-1.28)**2));ring(scene,'lantern-seam',root,cream,rr*2,.012,0,y,0);}}
  else if(style===1){cylinder(scene,'linen-shade',root,shade,.36,.3,0,1.28,0,.17);ring(scene,'shade-hem',root,cream,.6,.025,0,1.1,0);}
  else{orb(scene,'glazed-base',root,accent,.23,0,.28,0,.9,1.1,.9);cylinder(scene,'linen-drum',root,shade,.35,.28,0,1.28,0);ring(scene,'shade-binding',root,brass,.56,.018,0,1.46,0);}
  const bulb=orb(scene,'lamp-bulb',root,cream,.065,0,1.13,0);bulb.metadata={role:'bulb'};
 }else if(id==='table'){
  const body=style===2?accent:wood;
  if(style===0)cylinder(scene,'round-table',root,body,.1,.6,0,.66,0);else soft(scene,'rounded-table',root,body,1.13,.1,1.07,style===1?.16:.32,0,.66,0);
  cylinder(scene,'table-pedestal',root,dark,.58,.085,0,.34,0);soft(scene,'table-foot',root,dark,.7,.07,.7,.2,0,.055,0);
  for(const x of [-.77,.77]){const chairRoot=new TransformNode('dining-chair',scene);chairRoot.parent=root;chairRoot.position.set(x,0,0);soft(scene,'seat-frame',chairRoot,dark,.39,.07,.43,.11,0,.37,0);soft(scene,'seat-cushion',chairRoot,accent,.36,.08,.39,.12,0,.43,0);for(const z of [-.15,.15])for(const xx of [-.13,.13])cylinder(scene,'chair-leg',chairRoot,dark,.32,.025,xx,.19,z);if(style!==0){soft(scene,'chair-back',chairRoot,body,.08,.39,.43,.04,x<0?-.17:.17,.61,0);}}
  cup(scene,root,cream,dark,-.28,.72,.1);cup(scene,root,cream,dark,.28,.72,.1);
  if(editionReadingNook(shop)){
   soft(scene,'open-book-cover',root,accent,.37,.035,.27,.025,0,.73,-.2);soft(scene,'book-pages',root,cream,.33,.025,.23,.015,0,.76,-.2);
   pot(scene,root,accent,cream,.12,.72,-.18);steam(scene,root,.12,1.14,-.18);root.metadata={readingNook:true};
  }else{cylinder(scene,'cake-dish',root,cream,.025,.14,0,.73,-.2);orb(scene,'sweet',root,accent,.08,0,.8,-.2,1,.6,1);}
 }
 place(root,id,shop);tag(root,id);return root;
}

export function buildEditionPaintSample(scene:Scene,style:number):TransformNode{
 const root=new TransformNode('paint-sample',scene),m=mat(scene,'wall-sample',['#eadfcd','#bccbb9','#dcbab0'][style]),trim=mat(scene,'wall-trim',E.cream);
 soft(scene,'paint-wall',root,m,1.5,1.5,.12,.08,0,.75,0);soft(scene,'paint-dado',root,trim,1.5,.08,.16,.02,0,.55,.02);for(const x of [-.55,0,.55])soft(scene,'wall-batten',root,trim,.025,.5,.025,.008,x,.25,.08);return root;
}
export function buildEditionKeeper(scene:Scene):TransformNode {
 const root=new TransformNode('shopkeeper',scene);
 const skin=mat(scene,'skin','#edc4a1'),hair=mat(scene,'hair','#634838'),coat=mat(scene,'coat',E.sage),cream=mat(scene,'apron',E.cream);
 const eyes=mat(scene,'eyes','#34312d',0),cheek=mat(scene,'cheek','#d9917c');
 // Lift the shoulders and hands above the counter, without moving the keeper's footprint.
 const body=orb(scene,'body',root,coat,.24,0,.76,0,.96,1.4,.79);
 soft(scene,'apron',root,cream,.31,.46,.06,.04,0,.76,.19);
 soft(scene,'apron-pocket',root,coat,.15,.11,.018,.015,0,.7,.228);
 for(const x of [-.14,.14]) {
  orb(scene,'keeper-shoe',root,hair,.10,x,.07,.025,.75,.65,1.3);
  cylinder(scene,'keeper-trouser',root,coat,.38,.065,x,.29,0);
 }
 for(const x of [-.23,.23]) {
  const sleeve=orb(scene,'sleeve',root,coat,.095,x,.95,.08,.9,1.5,.95);
  sleeve.rotation.x=-.6;sleeve.rotation.z=x<0?-.35:.35;
  const forearm=orb(scene,'keeper-forearm',root,coat,.075,x*.8,1.045,.22,1,1,1.65);
  forearm.rotation.y=x<0?.35:-.35;
  orb(scene,'hand',root,skin,.064,x*.64,1.10,.32,1,.75,1);
 }
 // A held porcelain cup gives the silhouette a clear serving action.
 cup(scene,root,cream,hair,-.035,1.105,.33);
 const headRig=new TransformNode('keeper-head-idle',scene);headRig.parent=root;headRig.position.y=1.04;
 const face=new TransformNode('keeper-face',scene);face.parent=headRig;face.rotation.x=-.16;
 orb(scene,'head',face,skin,.233,0,.16,.025,1,1.03,.9);
 orb(scene,'hair-cap',face,hair,.24,0,.295,-.035,1,.59,.86);
 orb(scene,'hair-bun',face,hair,.105,0,.395,-.145);
 const fringe=orb(scene,'keeper-fringe',face,hair,.105,-.105,.31,.12,1.15,.42,.65);fringe.rotation.z=-.25;
 for(const x of [-.225,.225])orb(scene,'keeper-ear',face,skin,.047,x,.16,.012,.65,1,.7);
 const eyeMeshes=[-.078,.078].map(x=>orb(scene,'eye',face,eyes,.021,x,.19,.229,.85,1,.48));
 for(const x of [-.135,.135])orb(scene,'cheek',face,cheek,.034,x,.125,.198,1,.58,.28);
 orb(scene,'nose',face,skin,.032,0,.145,.242,1,.85,.8);
 const smile=MeshBuilder.CreateTube('keeper-smile',{path:[new Vector3(-.048,.098,.229),new Vector3(-.024,.087,.239),new Vector3(0,.084,.242),new Vector3(.024,.087,.239),new Vector3(.048,.098,.229)],radius:.008,tessellation:6},scene);
 attach(smile,face,hair);
 root.metadata={keeperIdle:{head:headRig,eyes:eyeMeshes,body,bodyY:body.scaling.y,eyeY:eyeMeshes.map(eye=>eye.scaling.y)}};
 root.scaling.setAll(1.12);return root;
}
export function decorateEditionRoom(scene:Scene,room:TransformNode):TransformNode{
 const trim=mat(scene,'room-joinery',E.cream),wood=mat(scene,'room-foundation',E.dark);
 soft(scene,'diorama-foundation',room,wood,6.3,.2,6.3,.16,3,-.17,3);
 const finish=new TransformNode('edition-wall-finish',scene);finish.parent=room;finish.setEnabled(false);
 for(const x of [.5,1.5,2.5,3.5,4.5,5.5]){soft(scene,'wall-panel',finish,trim,.83,.7,.035,.06,x,.55,.04);const panel=soft(scene,'wall-panel-left',finish,trim,.83,.7,.035,.06,.04,.55,x);panel.rotation.y=Math.PI/2;}
 soft(scene,'dado-back',finish,trim,6.2,.07,.08,.03,3,.98,.04);const rail=soft(scene,'dado-left',finish,trim,6.2,.07,.08,.03,.04,.98,3);rail.rotation.y=Math.PI/2;
 return finish;
}
export function editionFloorMaterial(scene:Scene):StandardMaterial{const m=mat(scene,'pale-oak','#ffffff',.04);m.diffuseTexture=editionOakTexture(scene);return m;}

/** Small local gestures leave the keeper's placement, feet and serving direction fixed. */
export function animateEditionKeeper(root:TransformNode,time:number,active:boolean):void {
 const rig=root.metadata?.keeperIdle;if(!rig)return;
 rig.head.rotation.y=active?Math.sin(time*.55)*.065:0;
 rig.head.rotation.x=active?Math.sin(time*.85)*.018:0;
 rig.body.scaling.y=rig.bodyY*(active?1+Math.sin(time*1.6)*.008:1);
 const phase=time%6.5;
 const blink=active&&phase<.18?1-.9*Math.sin(phase/.18*Math.PI):1;
 rig.eyes.forEach((eye:{scaling:{y:number}},i:number)=>{eye.scaling.y=rig.eyeY[i]*blink;});
}
