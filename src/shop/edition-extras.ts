import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';
import type { ShopState, UpgradeId } from '../game/types';
import type { EditionTools } from './edition-art';

export const editionExtraIds: UpgradeId[] = ['art','clock','basket','bench','trolley','planter'];

// All materials are created during buildItem's ownedVisual scope. No shared
// textures, extra lights, or animation loops are required by these pieces.
export function buildEditionExtra(scene:Scene,id:UpgradeId,shop:ShopState,style:number,t:EditionTools):TransformNode {
 const {E,mat,attach,soft,cylinder,orb,ring,cup,pot,place,tag}=t;
 const root=new TransformNode(id,scene);
 const oak=mat(scene,'extra-oak',E.oak),dark=mat(scene,'extra-walnut',E.dark),cream=mat(scene,'extra-porcelain',E.cream,.22),brass=mat(scene,'extra-brass',E.brass,.25);
 const sage=mat(scene,'extra-sage',E.sage),rose=mat(scene,'extra-rose',E.rose),ink=mat(scene,'extra-ink',E.ink);
 const blue=mat(scene,'extra-blue','#819fa7'),leaf=mat(scene,'extra-leaf',E.leaf),deep=mat(scene,'extra-leaf-shadow',E.leafDeep);
 if(id==='art'){
  soft(scene,'gallery-frame',root,style===1?dark:oak,.84,.94,.075,.035);
  soft(scene,'gallery-mat',root,cream,.73,.83,.018,.008,0,0,.049);
  const paper=mat(scene,'art-paper',style===2?'#e6c8ba':'#eee7d6');soft(scene,'gallery-paper',root,paper,.59,.69,.014,.006,0,0,.066);
  if(style===0){
   const stem=cylinder(scene,'botanical-stem',root,deep,.49,.01,0,-.04,.084);stem.rotation.z=-.12;
   for(let i=0;i<5;i++){const x=(i%2?1:-1)*.075,y=-.22+i*.095;const l=orb(scene,'botanical-leaf',root,i%2?leaf:sage,.085,x,y,.091,.55,1.1,.12);l.rotation.z=i%2?-.8:.8;}
  }else if(style===1){
   const sun=cylinder(scene,'print-sun',root,rose,.012,.08,.15,.17,.088);sun.rotation.x=Math.PI/2;
   for(const [x,y,r,m] of [[-.095,-.09,.21,blue],[.115,-.14,.18,sage]] as const){
    const peak=MeshBuilder.CreateDisc('mountain-print',{radius:r,tessellation:3,sideOrientation:Mesh.DOUBLESIDE},scene);
    peak.rotation.z=Math.PI/2;
    const depth=x<0?.095:.117;
    attach(peak,root,m,x,y,depth);
    const cap=MeshBuilder.CreateDisc('snow-cap',{radius:r*.275,tessellation:3,sideOrientation:Mesh.DOUBLESIDE},scene);
    cap.rotation.z=Math.PI/2;
    attach(cap,root,cream,x,y+r*.725,depth+.017);
   }
  }else{
   soft(scene,'tea-print-cup',root,sage,.27,.21,.025,.012,0,-.055,.088);soft(scene,'tea-print-saucer',root,cream,.37,.025,.025,.012,0,-.175,.093);
   const handle=ring(scene,'tea-print-handle',root,cream,.13,.022,.17,-.04,.096);handle.rotation.x=Math.PI/2;
   for(const x of [-.06,.045]){const stroke=soft(scene,'tea-print-steam',root,cream,.017,.13,.015,.007,x,.16,.091);stroke.rotation.z=x<0?-.16:.16;}
  }
 }else if(id==='clock'){
  const frame=style===0?oak:style===1?sage:rose;
  const rim=cylinder(scene,'clock-body',root,frame,.1,.4,0,0,0);rim.rotation.x=Math.PI/2;
  const dial=cylinder(scene,'clock-dial',root,cream,.012,.337,0,0,.059);dial.rotation.x=Math.PI/2;
  const bezel=ring(scene,'clock-bezel',root,style===1?brass:dark,.74,.022,0,0,.069);bezel.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=soft(scene,'clock-hour-mark',root,ink,.018,i%3===0?.057:.035,.012,.004,Math.sin(a)*.276,Math.cos(a)*.276,.075);tick.rotation.z=-a;}
  const minute=soft(scene,'clock-minute-hand',root,style===1?brass:ink,.021,.23,.015,.006,Math.sin(.65)*.1,Math.cos(.65)*.1,.087);minute.rotation.z=-.65;
  const hour=soft(scene,'clock-hour-hand',root,style===1?brass:ink,.028,.16,.018,.007,-.04,.055,.099);hour.rotation.z=.8;
  orb(scene,'clock-pin',root,brass,.028,0,0,.119,1,1,.5);
  if(style===0)for(const x of [-.1,.1]){const loop=ring(scene,'clock-hanging-loop',root,dark,.055,.012,x,.407,-.02);loop.rotation.x=Math.PI/2;}
  if(style===1)soft(scene,'clock-pediment',root,brass,.34,.035,.11,.014,0,-.405,.005);
  if(style===2)for(const x of [-.23,.23])orb(scene,'clock-flower-stud',root,cream,.034,x,.23,.07,1,1,.4);
 }else if(id==='basket'){
  cylinder(scene,'woven-basket',root,oak,.37,.28,0,.22,0,.34);
  for(let i=0;i<6;i++)ring(scene,'basket-weave',root,i%2?cream:dark,.57+i*.014,.014,0,.065+i*.06,0);
  ring(scene,'basket-rim',root,dark,.68,.035,0,.405,0);
  for(const x of [-.33,.33]){const handle=ring(scene,'basket-handle',root,oak,.16,.035,x,.39,0);handle.rotation.z=Math.PI/2;}
  if(style===0){
   soft(scene,'folded-blanket',root,sage,.47,.11,.38,.09,0,.42,0);soft(scene,'rose-blanket',root,rose,.42,.095,.34,.07,.025,.525,0);
   for(const z of [-.08,.025,.12])soft(scene,'blanket-stitch',root,cream,.36,.008,.01,.004,.025,.575,z);
   soft(scene,'draped-blanket',root,sage,.24,.22,.035,.016,-.08,.36,.305);
  }else if(style===1){
   for(const [x,y,z,r,m] of [[-.13,.45,.03,.16,sage],[.14,.46,-.04,.15,rose],[.03,.64,.02,.12,cream]] as const){orb(scene,'yarn-ball',root,m,r,x,y,z);for(let i=0;i<3;i++){const yarn=ring(scene,'yarn-wrap',root,m,r*1.8,.012,x,y,z);yarn.rotation.z=i*.4+.4;yarn.rotation.x=.3;}}
   const needle=cylinder(scene,'knitting-needle',root,dark,.46,.012,-.1,.69,-.05);needle.rotation.z=-.32;
   orb(scene,'needle-tip',root,cream,.025,-.1+Math.sin(.32)*.23,.69+Math.cos(.32)*.23,-.05);
  }else{
   for(let i=0;i<3;i++){const book=new TransformNode('basket-book',scene);book.parent=root;book.position.set(-.16+i*.16,.48,0);book.rotation.z=(i-1)*.12;const cover=i===0?sage:i===1?rose:blue;soft(scene,'book-cover',book,cover,.13,.44,.3,.025);soft(scene,'book-pages',book,cream,.095,.39,.28,.015,0,.01,.01);soft(scene,'book-spine',book,cover,.13,.44,.04,.016,0,0,-.14);}
  }
 }else if(id==='bench'){
  const frame=style===0?oak:style===1?sage:rose;
  for(const x of [-.72,.72])for(const z of [-.27,.27])cylinder(scene,'bench-leg',root,style===2?brass:dark,.32,.045,x,.18,z);
  soft(scene,'bench-frame',root,frame,1.82,.13,.75,.14,0,.39,0);
  if(style===0){
   soft(scene,'bench-cushion',root,sage,1.64,.15,.65,.2,0,.52,0);
   soft(scene,'bench-back',root,oak,1.75,.4,.095,.045,0,.73,-.31);
   const pillow=soft(scene,'reading-pillow',root,rose,.4,.31,.18,.08,-.5,.75,-.2);pillow.rotation.z=.12;
   soft(scene,'waiting-book',root,dark,.34,.035,.25,.02,.45,.62,.02);soft(scene,'waiting-pages',root,cream,.31,.02,.22,.015,.45,.645,.02);
  }else if(style===1){
   for(let i=0;i<7;i++)soft(scene,'garden-seat-slat',root,oak,.19,.05,.65,.025,-.66+i*.22,.48,0);
   for(const x of [-.78,.78])soft(scene,'garden-back-post',root,sage,.065,.55,.065,.025,x,.69,-.3);
   for(const y of [.66,.86])soft(scene,'garden-back-slat',root,sage,1.61,.07,.065,.025,0,y,-.3);
   soft(scene,'garden-cushion',root,rose,.61,.12,.57,.16,-.35,.56,0);
  }else{
   soft(scene,'velvet-seat',root,rose,1.72,.19,.7,.21,0,.55,0);soft(scene,'velvet-back',root,rose,1.74,.45,.18,.08,0,.8,-.27);
   for(const x of [-.77,.77])soft(scene,'velvet-arm',root,rose,.18,.27,.68,.08,x,.73,0);
   for(const x of [-.44,0,.44])orb(scene,'velvet-button',root,brass,.022,x,.82,-.17,1,1,.4);
  }
 }else if(id==='trolley'){
  const frame=style===0?brass:style===1?sage:dark;
  soft(scene,'cart-lower-tray',root,style===2?oak:frame,.72,.06,.62,.12,0,.21,0);soft(scene,'cart-upper-tray',root,style===2?oak:frame,.72,.06,.62,.12,0,.69,0);
  for(const x of [-.3,.3])for(const z of [-.25,.25]){cylinder(scene,'cart-upright',root,frame,.65,.022,x,.45,z);const wheel=cylinder(scene,'cart-wheel',root,dark,.045,.067,x,.075,z);wheel.rotation.z=Math.PI/2;}
  for(const z of [-.23,.23])cylinder(scene,'cart-handle-post',root,frame,.21,.022,.34,.83,z);
  const handle=cylinder(scene,'cart-handle',root,frame,.46,.025,.34,.93,0);handle.rotation.x=Math.PI/2;
  if(style===0){pot(scene,root,cream,brass,-.12,.73,-.035);cup(scene,root,sage,dark,.19,.73,.15);for(const x of [-.15,.15])cylinder(scene,'cart-tea-tin',root,x<0?sage:rose,.25,.095,x,.365,0);}
  else if(style===1){
   cylinder(scene,'cake-stand-stem',root,brass,.39,.025,0,.93,0);for(const [y,r] of [[.79,.26],[1.04,.18]] as const){cylinder(scene,'cake-tier',root,cream,.025,r,0,y,0);for(let i=0;i<3;i++){const a=i*2.1;orb(scene,'cart-macaron',root,i%2?rose:sage,.058,Math.cos(a)*r*.55,y+.045,Math.sin(a)*r*.55,1,.55,1);}}
   soft(scene,'napkin-stack',root,cream,.32,.07,.3,.04,0,.28,0);
  }else{
   for(let i=0;i<4;i++){const cover=[sage,rose,blue,oak][i];soft(scene,'cart-book',root,cover,.47,.065,.4,.025,0,.275+i*.075,0);soft(scene,'cart-book-pages',root,cream,.43,.035,.39,.015,.01,.275+i*.075,.012);}
   soft(scene,'open-book',root,cream,.4,.035,.33,.025,-.08,.74,-.02);cup(scene,root,rose,dark,.19,.74,.14);
  }
 }else if(id==='planter'){
  const potMat=mat(scene,'statement-planter',["#c28a6d",E.cream,'#879fa8'][style],.24);
  if(style===1)soft(scene,'square-planter',root,potMat,.55,.43,.55,.12,0,.24,0);
  else cylinder(scene,'glazed-planter',root,potMat,.43,.23,0,.24,0,.3);
  ring(scene,'planter-rim',root,style===0?dark:cream,.59,.025,0,.46,0);cylinder(scene,'planter-soil',root,dark,.012,.25,0,.455,0);
  if(style===1){
   for(let i=0;i<4;i++){const x=(i%2?1:-1)*.1,z=i<2?-.08:.08,h=.9+(i%3)*.13;const stem=cylinder(scene,'bamboo-stem',root,sage,h,.025,x,.46+h/2,z);stem.rotation.z=(i-1.5)*.06;for(let j=0;j<4;j++)ring(scene,'bamboo-joint',root,deep,.054,.008,x,.6+j*.22,z);for(let j=0;j<3;j++){const l=orb(scene,'bamboo-leaf',root,leaf,.14,x+(j%2?.12:-.12),.98+j*.16,z,.95,.23,.32);l.rotation.z=j%2?.4:-.4;}}
  }else{
   cylinder(scene,'tree-trunk',root,dark,.82,.04,0,.84,0);
   const foliage=style===0?mat(scene,'olive-foliage','#87957c'):leaf;
   for(const [x,y,z,r] of [[0,1.36,0,.22],[-.18,1.2,.02,.19],[.17,1.22,.06,.19],[.02,1.16,-.16,.18],[.03,1.48,.03,.17]] as const){orb(scene,'tree-crown',root,foliage,r,x,y,z,1,.9,1);}
   if(style===0)for(let i=0;i<7;i++){const a=i*2.4;orb(scene,'olive-leaf',root,sage,.11,Math.cos(a)*.22,1.23+(i%3)*.1,Math.sin(a)*.2,.35,.8,.3);}
   else{const fruit=mat(scene,'citrus','#d8ad56',.22);for(const [x,y,z] of [[-.2,1.2,.17],[.16,1.31,.2],[.08,1.48,.1],[-.14,1.38,-.1],[.25,1.17,-.04]] as const)orb(scene,'golden-citrus',root,fruit,.055,x,y,z);}
  }
 }
 place(root,id,shop);tag(root,id);return root;
}
