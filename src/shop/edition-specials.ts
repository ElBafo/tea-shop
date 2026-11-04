import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { Scene } from '@babylonjs/core/scene';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { ShopState, UpgradeId } from '../game/types';
import type { EditionTools } from './edition-art';

export const editionSpecialIds: UpgradeId[] = ['terrarium', 'botanical'];

// These models share the miniature's palette and the caller's ownedVisual scope.
// Their relief and foliage are geometry, so thumbnails show the actual purchase.
export function buildEditionSpecial(scene:Scene,id:UpgradeId,shop:ShopState,style:number,t:EditionTools):TransformNode {
 const {E,mat,attach,soft,cylinder,orb,ring,place,tag}=t;
 const root=new TransformNode(id,scene);
 const cream=mat(scene,'special-ivory',E.cream,.22),oak=mat(scene,'special-oak',E.oak);
 const dark=mat(scene,'special-walnut',E.dark),brass=mat(scene,'special-brass',E.brass,.28);
 const sage=mat(scene,'special-sage',E.sage),leaf=mat(scene,'special-leaf',E.leaf),deep=mat(scene,'special-forest',E.leafDeep);
 const rose=mat(scene,'special-rose',E.rose),blue=mat(scene,'special-blue','#536d77');
 const link=(name:string,m:StandardMaterial,x1:number,y1:number,x2:number,y2:number,z:number,r=.014)=>{
  const a=cylinder(scene,name,root,m,Math.hypot(x2-x1,y2-y1),r,(x1+x2)/2,(y1+y2)/2,z);
  a.rotation.z=-Math.atan2(x2-x1,y2-y1);return a;
 };
 if(id==='terrarium'){
  const frame=style===0?brass:style===1?cream:rose;
  const base=style===0?deep:style===1?oak:rose;
  const soil=mat(scene,'garden-soil',style===1?'#d9bd8d':'#70543e');
  const glass=mat(scene,'garden-glass','#c6ddd2',.4);glass.alpha=.12;glass.backFaceCulling=false;
  for(const x of [-.32,.32])for(const z of [-.28,.28])cylinder(scene,'garden-foot',root,dark,.12,.045,x,.08,z);
  soft(scene,'garden-rounded-plinth',root,base,.92,.16,.86,.13,0,.2,0);
  soft(scene,'garden-brass-lip',root,frame,.9,.045,.84,.11,0,.3,0);
  soft(scene,'garden-earth',root,soil,.78,.035,.72,.1,0,.327,0);
  for(const x of [-.4,.4])for(const z of [-.36,.36]){
   cylinder(scene,'greenhouse-upright',root,frame,.68,.022,x,.665,z);
   link('greenhouse-roof-rib',frame,x,1.005,0,1.31,z,.024);
  }
  for(const y of [.35,1.005])for(const z of [-.36,.36])soft(scene,'greenhouse-cross-rail',root,frame,.84,.04,.045,.02,0,y,z);
  for(const x of [-.4,.4])soft(scene,'greenhouse-side-rail',root,frame,.045,.04,.72,.02,x,1.005,0);
  soft(scene,'greenhouse-roof-ridge',root,frame,.05,.05,.79,.024,0,1.31,0);
  for(const x of [-.394,.394]){
   const pane=soft(scene,'greenhouse-side-glass',root,glass,.012,.62,.66,.004,x,.674,0);
   pane.receiveShadows=false;pane.isPickable=false;
  }
  const handle=ring(scene,'greenhouse-roof-handle',root,frame,.14,.02,0,1.4,0);handle.rotation.x=Math.PI/2;
  if(style===0){
   // Two distinct fern crowns and a low moss bed fill the glasshouse silhouette.
   orb(scene,'moss-bed',root,deep,.29,0,.36,.07,1,.23,.84);
   for(const [x,z,h] of [[-.17,-.1,.54],[.16,.12,.43]] as const){
    cylinder(scene,'fern-heart',root,deep,h,.018,x,.35+h/2,z);
    for(let tier=0;tier<4;tier++)for(const side of [-1,1]){
     const spread=.14-tier*.022,y=.42+tier*.105;
     const frond=orb(scene,'fern-frond',root,tier%2?leaf:sage,.15,x+side*spread,y,z,.93-tier*.12,.27,.48);
     frond.rotation.z=side*(.2+tier*.12);
    }
    orb(scene,'fern-new-leaf',root,sage,.1,x,.35+h,z,.35,.92,.35);
   }
   for(const [x,z]of [[-.23,.23],[.24,-.21]] as const)orb(scene,'garden-stone',root,cream,.07,x,.375,z,1,.46,.78);
  }else if(style===1){
   const cactus=mat(scene,'cactus-blue-green','#789a8a'),rib=mat(scene,'cactus-rib','#a8b89a');
   orb(scene,'column-cactus',root,cactus,.13,-.15,.65,-.08,.9,2.1,.9);
   for(const [side,h]of [[-1,.63],[1,.72]]as const){
    link('cactus-arm',cactus,-.15,h-.12,-.15+side*.15,h-.12,-.08,.045);
    orb(scene,'cactus-finger',root,cactus,.065,-.15+side*.15,h-.045,-.08,1,1.65,1);
   }
   for(const x of [-.19,-.12])link('cactus-ridge',rib,x,.42,x,.86,.025,.009);
   orb(scene,'barrel-cactus',root,leaf,.18,.18,.51,.14,1,.95,1);
   for(let i=0;i<5;i++){
    const a=i*2.4,petal=orb(scene,'cactus-blossom',root,rose,.047,.18+Math.cos(a)*.042,.685,.14+Math.sin(a)*.042,1,.6,1);
    petal.rotation.y=a;
   }
   orb(scene,'cactus-flower-heart',root,cream,.025,.18,.713,.14);
   for(const [x,z,r]of [[.23,-.22,.075],[-.23,.22,.06],[.05,.26,.045]] as const)orb(scene,'desert-pebble',root,cream,r,x,.37,z,1,.5,.8);
  }else{
   const petal=mat(scene,'rose-petal','#dca298'),heart=mat(scene,'rose-heart','#b87876');
   for(const [x,z,h]of [[-.2,-.08,.46],[.14,-.13,.57],[.04,.18,.38]] as const){
    cylinder(scene,'rose-stem',root,deep,h,.016,x,.35+h/2,z);
    for(const side of [-1,1]){
     const l=orb(scene,'rose-leaf',root,leaf,.115,x+side*.08,.45+h*.25,z,.9,.31,.49);l.rotation.z=side*.42;
    }
    for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5;
     orb(scene,'rose-petal',root,petal,.075,x+Math.cos(a)*.064,.35+h+Math.sin(a)*.027,z+Math.sin(a)*.055,1,.62,.85);
    }
    orb(scene,'rose-heart',root,heart,.055,x,.39+h,z,.8,.6,.8);
   }
   orb(scene,'rose-moss',root,sage,.23,-.08,.37,.03,1,.25,1);
  }
 }else if(id==='botanical'){
  const background=style===0?deep:style===1?blue:cream;
  const frame=style===2?oak:brass;
  // Rotate the rounded solid so its corner radius is visible on the wall face.
  const panel=(name:string,m:StandardMaterial,w:number,h:number,d:number,r:number,x:number,y:number,z:number)=>{
   const a=soft(scene,name,root,m,w,d,h,r,x,y,z);a.rotation.x=Math.PI/2;return a;
  };
  const fan=(x:number,y:number,z:number,angle:number,scale:number)=>{
   const points:[[number,number],...number[][]]=[[0,-.15]];
   for(let j=0;j<=10;j++){const a=-1.1+j*.22;points.push([Math.sin(a)*.2,Math.cos(a)*.2-.02]);}
   const positions:number[]=[],indices:number[]=[];
   for(const depth of [-.012,.012])for(const [xx,yy]of points)positions.push(xx,yy,depth);
   const n=points.length;
   for(let j=1;j<n-1;j++){indices.push(0,j+1,j,n,n+j,n+j+1);}
   for(let j=0;j<n;j++){const next=(j+1)%n;indices.push(j,next,n+j,next,n+next,n+j);}
   const normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);
   const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;
   const mesh=new Mesh('ginkgo-fan',scene);data.applyToMesh(mesh);attach(mesh,root,brass,x,y,z);mesh.rotation.z=angle;mesh.scaling.setAll(scale);
  };
  for(const [i,x]of [-.64,0,.64].entries()){
   const h=i===1?1.22:1.04;
   panel('triptych-rounded-frame',frame,.59,h,.085,.09,x,0,0);
   panel('triptych-inset-border',style===2?rose:cream,.52,h-.07,.02,.07,x,0,.049);
   panel('triptych-coloured-field',background,.475,h-.12,.025,.065,x,0,.065);
   link('botanical-main-stem',style===0?brass:leaf,x,-.35,x+.015,.29,.092,.012);
   if(style===0){
    fan(x-.07,-.12,.115,-.45,.73);fan(x+.065,.12,.12,.48,.72);
    if(i===1)fan(x,.34,.12,0,.69);
    for(const [side,y]of [[-1,-.12],[1,.12]]as const)link('ginkgo-leaf-stem',brass,x,y-.14,x+side*.06,y-.035,.106,.008);
   }else if(style===1){
    const y=i===1?.11:.045;
    for(let j=0;j<6;j++){
     const a=j*Math.PI/3,l=orb(scene,'magnolia-petal',root,cream,.11,x+Math.sin(a)*.095,y+Math.cos(a)*.12,.115,.68,1.15,.24);l.rotation.z=-a;
    }
    orb(scene,'magnolia-centre',root,brass,.045,x,y,.157,1,1,.4);
    for(const side of [-1,1]){const l=orb(scene,'magnolia-leaf',root,sage,.11,x+side*.07,-.2+side*.025,.112,.55,1,.2);l.rotation.z=side*.65;}
   }else{
    for(const [side,y]of [[-1,-.06],[1,i===1?.27:.19]]as const){
     const xx=x+side*.075;link('wildflower-branch',leaf,x,-.26,xx,y,.103,.01);
     for(let j=0;j<5;j++){
      const a=j*Math.PI*2/5,l=orb(scene,'wildflower-petal',root,rose,.054,xx+Math.sin(a)*.059,y+Math.cos(a)*.059,.126,.8,1,.28);l.rotation.z=-a;
     }
     orb(scene,'wildflower-centre',root,brass,.032,xx,y,.153,1,1,.4);
    }
    const l=orb(scene,'wildflower-leaf',root,sage,.1,x-.055,-.25,.111,.5,1,.23);l.rotation.z=.6;
   }
  }
 }
 place(root,id,shop);tag(root,id);return root;
}
