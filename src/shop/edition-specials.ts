import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { ShopState, UpgradeId } from '../game/types';
import type { EditionTools } from './edition-art';

export const editionSpecialIds: UpgradeId[] = ['terrarium', 'botanical', 'cabinet', 'armchair'];

// These models share the miniature's palette and the caller's ownedVisual scope.
// Their relief and foliage are geometry, so thumbnails show the actual purchase.
export function buildEditionSpecial(scene:Scene,id:UpgradeId,shop:ShopState,style:number,t:EditionTools):TransformNode {
 const {E,mat,attach,soft,cylinder,orb,ring,cup,pot,place,tag}=t;
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
 }else if(id==='cabinet'){
  const finish=mat(scene,'cabinet-finish',[E.leafDeep,'#405d70',E.rose][style]);
  const porcelain=mat(scene,'cabinet-glaze',style===1?'#b5d3d7':E.cream,.3);
  const inset=mat(scene,'cabinet-inset',style===0?'#d7d7bb':style===1?'#7f9ba8':'#ebcfba');
  const panel=(name:string,m:StandardMaterial,w:number,h:number,d:number,r:number,x:number,y:number,z:number)=>{
   const a=soft(scene,name,root,m,w,d,h,r,x,y,z);a.rotation.x=Math.PI/2;return a;
  };
  // Extruded round-top joinery keeps the silhouette solid from every rotation.
  const arch=(name:string,m:StandardMaterial,w:number,bottom:number,spring:number,rise:number,depth:number,x:number,z:number)=>{
   const points=[[x-w/2,bottom],[x+w/2,bottom]];
   for(let i=0;i<=24;i++){const a=i*Math.PI/24;points.push([x+Math.cos(a)*w/2,spring+Math.sin(a)*rise]);}
   const positions:number[]=[],indices:number[]=[];
   for(const zz of [z-depth/2,z+depth/2])for(const [xx,yy]of points)positions.push(xx,yy,zz);
   const n=points.length;
   for(let i=1;i<n-1;i++)indices.push(0,i,i+1,n,n+i+1,n+i);
   for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(i,n+j,j,i,n+i,n+j);}
   const normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);
   const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;
   const a=new Mesh(name,scene);data.applyToMesh(a);a.convertToFlatShadedMesh();attach(a,root,m);return a;
  };
  const crown=(name:string,m:StandardMaterial,x:number,w:number,y:number,rise:number,z:number,r=.045)=>{
   const path=Array.from({length:25},(_,i)=>{const a=i*Math.PI/24;return new Vector3(x+Math.cos(a)*w/2,y+Math.sin(a)*rise,z);});
   return attach(MeshBuilder.CreateTube(name,{path,radius:r,tessellation:10},scene),root,m);
  };
  const vase=(x:number,y:number,z:number,height:number,m=porcelain)=>{
   cylinder(scene,'porcelain-foot',root,brass,.025,.08,x,y+.012,z);
   orb(scene,'porcelain-belly',root,m,.105,x,y+height*.39,z,1,height*2.8,1);
   cylinder(scene,'porcelain-neck',root,m,height*.28,.048,x,y+height*.81,z,.057);
   ring(scene,'porcelain-lip',root,brass,.116,.013,x,y+height*.95,z);
  };
  const plate=(x:number,y:number,z:number,r:number)=>{
   const p=cylinder(scene,'display-plate',root,porcelain,.027,r,x,y,z);p.rotation.x=Math.PI/2;
   orb(scene,'glazed-plate-face',root,porcelain,r*.91,x,y,z+.019,1,1,.12);
   const edge=ring(scene,'plate-rim',root,brass,r*1.84,.014,x,y,z+.018);edge.rotation.x=Math.PI/2;
   if(style===1){
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const petal=orb(scene,'porcelain-blue-petal',root,blue,.029,x+Math.sin(a)*.04,y+Math.cos(a)*.04,z+.048,.65,1,.18);petal.rotation.z=-a;}
   }else{
    const leafMark=orb(scene,'porcelain-leaf-mark',root,style===0?deep:rose,.05,x-.018,y,z+.047,.5,1,.10);leafMark.rotation.z=-.4;
    const second=orb(scene,'porcelain-leaf-mark',root,style===0?sage:rose,.038,x+.022,y+.018,z+.047,.5,1,.10);second.rotation.z=.6;
   }
  };
  const teaSet=(x:number,y:number,z:number,scale:number)=>{
   const set=new TransformNode('cabinet-tea-set',scene);set.parent=root;set.position.set(x,y,z);set.scaling.setAll(scale);
   pot(scene,set,porcelain,brass,0,0,0);cup(scene,set,porcelain,dark,.43,0,.03);
  };
  for(const x of [-.72,.72])for(const z of [-.27,.27]){
   const leg=cylinder(scene,'cabinet-foot',root,style===1?dark:brass,.17,.048,x,.09,z,.037);
   if(style===2)leg.rotation.z=-Math.sign(x)*.12;
  }
  soft(scene,'cabinet-plinth',root,style===1?oak:finish,1.85,.13,.84,.13,0,.21,0);
  soft(scene,'cabinet-lower-body',root,finish,1.74,.43,.76,.10,0,.45,-.015);
  soft(scene,'cabinet-counter-lip',root,style===1?oak:brass,1.87,.055,.87,.11,0,.69,0);
  if(style===0){
   // One generous arch, a broad porcelain collection and a single long drawer.
   arch('atelier-arched-back',finish,1.73,.65,1.52,.51,.13,0,-.30);
   arch('atelier-cream-inset',inset,1.48,.71,1.52,.39,.024,0,-.222);
   for(const x of [-.81,.81])soft(scene,'atelier-side',root,finish,.12,.93,.67,.045,x,1.125,0);
   crown('atelier-arched-front',finish,0,1.62,1.55,.47,.30,.068);
   crown('atelier-gold-line',brass,0,1.61,1.55,.47,.357,.017);
   soft(scene,'atelier-upper-shelf',root,cream,1.56,.065,.61,.045,0,1.28,.01);
   soft(scene,'atelier-shelf-edge',root,brass,1.56,.025,.025,.008,0,1.28,.328);
   vase(-.47,1.32,.015,.39);vase(.46,1.32,.015,.28);plate(0,1.57,-.165,.20);
   teaSet(-.2,.72,.04,.88);
   panel('atelier-drawer',inset,1.5,.25,.035,.055,0,.46,.38);
   panel('atelier-drawer-field',finish,1.39,.17,.025,.04,0,.46,.406);
   for(const x of [-.11,.11])orb(scene,'drawer-handle-mount',root,brass,.025,x,.47,.43);
   panel('drawer-pull',brass,.25,.027,.026,.01,0,.47,.45);
  }else if(style===1){
   // Twin round-top bays, oak shelves and blue floral plates make a different hutch.
   for(const x of [-.42,.42]){
    arch('porcelain-twin-back',finish,.86,.68,1.56,.37,.14,x,-.30);
    arch('porcelain-twin-inset',inset,.69,.73,1.56,.28,.025,x,-.218);
    crown('porcelain-twin-front',finish,x,.76,1.56,.33,.29,.059);
    crown('porcelain-ivory-line',cream,x,.75,1.56,.33,.34,.018);
    soft(scene,'porcelain-bay-shelf',root,oak,.72,.06,.63,.04,x,1.22,.01);
    plate(x,1.52,-.13,.21);vase(x-.13,.73,.035,.29);vase(x+.14,.73,.035,.21,cream);
    panel('porcelain-door',inset,.72,.29,.04,.05,x,.46,.38);
    panel('porcelain-door-inset',finish,.62,.20,.025,.035,x,.46,.407);
    orb(scene,'porcelain-door-knob',root,brass,.028,x+(x<0?.23:-.23),.48,.435);
   }
   for(const x of [-.82,0,.82])soft(scene,'porcelain-upright',root,finish,.09,.91,.63,.035,x,1.15,0);
  }else{
   // A lower salon cabinet with a wide bowed crown and a tiered tea display.
   arch('salon-bowed-back',finish,1.77,.67,1.51,.27,.15,0,-.30);
   arch('salon-ivory-inset',cream,1.51,.72,1.49,.19,.025,0,-.209);
   crown('salon-bowed-front',finish,0,1.64,1.51,.25,.30,.075);
   crown('salon-cream-trim',cream,0,1.63,1.51,.25,.36,.025);
   for(const x of [-.81,.81])soft(scene,'salon-side',root,finish,.13,.83,.68,.045,x,1.1,0);
   for(const x of [-.52,.52]){
    soft(scene,'salon-raised-shelf',root,finish,.52,.055,.56,.06,x,1.12,.015);
    vase(x,1.16,0,.25);
   }
   teaSet(-.16,.73,.11,.95);
   plate(0,1.37,-.14,.16);
   for(const x of [-.4,.4]){
    panel('salon-bowed-drawer',inset,.74,.27,.045,.075,x,.46,.38);
    panel('salon-drawer-field',finish,.63,.18,.025,.055,x,.46,.413);
    const pull=ring(scene,'salon-ring-pull',root,brass,.09,.018,x,.47,.45);pull.rotation.x=Math.PI/2;
   }
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5;orb(scene,'salon-crown-petal',root,cream,.032,Math.sin(a)*.04,1.7+Math.cos(a)*.04,.385,1,1,.3);}
   orb(scene,'salon-crown-heart',root,brass,.024,0,1.7,.405,1,1,.4);
  }
 }else if(id==='armchair'){
  const fabric=mat(scene,'reading-upholstery',style===0?'#91a99b':style===1?'#607b91':E.cream,.045);
  const cushion=mat(scene,'reading-cushion',style===0?'#d5a296':style===1?'#a4b7ba':E.cream,.035);
  const cane=mat(scene,'reading-cane','#c9a578',.08);
  const panel=(name:string,m:StandardMaterial,w:number,h:number,d:number,r:number,x:number,y:number,z:number)=>{
   const a=soft(scene,name,root,m,w,d,h,r,x,y,z);a.rotation.x=Math.PI/2;return a;
  };
  const rail=(name:string,m:StandardMaterial,points:number[][],radius=.018)=>attach(
   MeshBuilder.CreateTube(name,{path:points.map(p=>new Vector3(p[0],p[1],p[2])),radius,tessellation:10},scene),root,m);
  // All three seats share the guest contract: top .47, facing +Z, root at
  // local (0, 0, .08). The front edge .17 leaves a child's shorter legs clear.
  // Decoration stays outside this space: no book or cushion prop blocks a guest.
  for(const x of [-.28,.28])for(const z of [-.27,.07]){
   const leg=cylinder(scene,'reading-chair-leg',root,style===2?cane:oak,style===0?.23:.31,.037,x,style===0?.12:.155,z,.028);
   leg.rotation.z=-Math.sign(x)*.07;
  }
  if(style===0){
   // Rounded tub chair: a soft sage shell and generous rose seat.
   soft(scene,'cloud-seat-shell',root,fabric,.83,.19,.55,.20,0,.31,-.135);
   panel('cloud-rounded-back',fabric,.73,.62,.19,.22,0,.73,-.29);
   panel('cloud-back-cushion',fabric,.60,.43,.12,.17,0,.76,-.175);
   for(const x of [-.36,.36])orb(scene,'cloud-padded-arm',root,fabric,.10,x,.56,-.055,.9,1.50,2.8);
   soft(scene,'reading-seat-cushion',root,cushion,.58,.11,.46,.16,0,.415,-.06);
   soft(scene,'cloud-front-piping',root,cream,.22,.012,.012,.005,0,.428,.172);
   for(const x of [-.13,.13])orb(scene,'cloud-soft-tuft',root,cream,.017,x,.79,-.106,1,1,.35);
  }else if(style===1){
   // A taller wingback, with visible oak joinery and a lighter blue cushion.
   soft(scene,'library-oak-seat-frame',root,oak,.83,.11,.55,.10,0,.33,-.135);
   panel('library-high-back',fabric,.66,.88,.16,.14,0,.81,-.31);
   panel('library-back-inset',fabric,.48,.66,.07,.12,0,.84,-.213);
   for(const side of [-1,1]){
    const wing=panel('library-wing',fabric,.18,.52,.25,.07,side*.31,.96,-.235);wing.rotation.z=-side*.08;
    soft(scene,'library-arm-support',root,oak,.075,.24,.51,.028,side*.36,.47,-.08);
    soft(scene,'library-padded-arm',root,fabric,.14,.12,.56,.065,side*.36,.63,-.055);
   }
   soft(scene,'reading-seat-cushion',root,cushion,.58,.11,.46,.14,0,.415,-.06);
   soft(scene,'library-front-welt',root,cream,.28,.013,.012,.005,0,.429,.172);
   for(const x of [-.14,0,.14])orb(scene,'library-back-button',root,brass,.016,x,.90,-.17,1,1,.4);
  }else{
   // An airy cane nest. Open rails and a blanket on the outer arm keep the seat usable.
   soft(scene,'woven-seat-frame',root,cane,.81,.12,.55,.18,0,.33,-.135);
   const arch=Array.from({length:25},(_,i)=>{const a=i*Math.PI/24;return[Math.cos(a)*.36,.56+Math.sin(a)*.47,-.31];});
   rail('woven-rounded-back',cane,arch,.028);
   for(const x of [-.24,-.12,0,.12,.24]){
    const top=.56+Math.sqrt(1-(x/.36)**2)*.47;
    rail('woven-back-upright',cane,[[x,.40,-.31],[x,top,-.31]],.012);
   }
   for(const y of [.54,.66,.78,.90]){
    const half=y<=.56?.36:.36*Math.sqrt(1-((y-.56)/.47)**2);
    rail('woven-back-crossing',cane,[[-half,y,-.297],[half,y,-.297]],.010);
   }
   for(const side of [-1,1]){
    rail('woven-arm',cane,[[side*.34,.43,.14],[side*.36,.59,.16],[side*.37,.65,.07],[side*.36,.66,-.28]],.029);
    rail('woven-arm-lower',cane,[[side*.34,.40,.13],[side*.36,.43,-.27]],.017);
   }
   soft(scene,'reading-seat-cushion',root,cushion,.58,.11,.46,.17,0,.415,-.06);
   soft(scene,'woven-blanket-drape',root,rose,.10,.32,.29,.04,-.404,.48,.035);
   soft(scene,'woven-blanket-fold',root,rose,.17,.045,.29,.025,-.375,.655,.035);
   for(const z of [-.06,.035,.13])soft(scene,'woven-blanket-fringe',root,cream,.013,.07,.014,.005,-.455,.30,z);
  }
 }
 place(root,id,shop);tag(root,id);return root;
}
