import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';
import { GUEST_PROFILES, guestProfile, type GuestProfile } from './guest-profiles';

export type GuestPose = 'stand' | 'browse' | 'order' | 'sit' | 'look';
export interface GuestVisualMotion {stridePhase:number;walkWeight:number;dt:number;reset?:boolean}
export interface TrafficGuestVisual {
  root: TransformNode;
  setProfile(id:string): void;
  setPose(pose: GuestPose): void;
  animate(timeSeconds:number,moving:boolean,reducedMotion:boolean,motion?:GuestVisualMotion):void;
  dispose():void;
}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const mix=(a:number,b:number,t:number)=>t===1?b:t===0?a:a+(b-a)*t;
const cycle=Math.PI*2;

/** Two reusable rigs support the whole cast; no meshes are built during a visit. */
export function buildTrafficGuest(scene:Scene,index=0):TrafficGuestVisual {
  const root=new TransformNode(`traffic-guest-${index}`,scene);
  root.metadata={roomGuest:true,visitor:index,pose:'stand'};root.setEnabled(false);
  const rig=new TransformNode(`guest-${index}-rig`,scene);rig.parent=root;
  const torso=new TransformNode(`guest-${index}-torso`,scene);torso.parent=rig;
  const materials:StandardMaterial[]=[];
  const material=(name:string,color:string)=>{
    const m=new StandardMaterial(`guest-${index}-${name}`,scene);m.diffuseColor=Color3.FromHexString(color);
    m.specularColor.setAll(.06);m.maxSimultaneousLights=5;materials.push(m);return m;
  };
  const skin=material('skin','#d5a17e'),hair=material('hair','#584534'),top=material('top','#bb8d80');
  const trousers=material('trousers','#596d68'),accent=material('accent','#eadcc2');
  const cream=material('ceramic','#f6eedf'),ink=material('eyes','#343c36'),cheek=material('cheek','#c98170'),brass=material('brass','#c3a46c');
  const attach=(mesh:Mesh,parent:TransformNode,m:StandardMaterial)=>{
    mesh.parent=parent;mesh.material=m;mesh.isPickable=false;mesh.receiveShadows=true;mesh.metadata={roomGuest:true};return mesh;
  };
  const orb=(name:string,parent:TransformNode,m:StandardMaterial,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{
    const mesh=attach(MeshBuilder.CreateSphere(`guest-${index}-${name}`,{diameter:1,segments:10},scene),parent,m);
    mesh.position.set(x,y,z);mesh.scaling.set(sx,sy,sz);return mesh;
  };
  const joint=(name:string,parent:TransformNode)=>{const node=new TransformNode(`guest-${index}-${name}`,scene);node.parent=parent;return node;};
  const hips=orb('hips',rig,trousers,0,.62,0,.29,.18,.24);
  const body=orb('body',torso,top,0,.22,-.015,.32,.43,.26);
  const collar=orb('collar',torso,accent,0,.415,.025,.17,.045,.15);
  const detail=orb('clothing-detail',torso,accent,.045,.29,.133,.07,.21,.035);
  const head=joint('head-joint',torso);
  orb('head',head,skin,0,0,.015,.35,.37,.33);
  orb('hair-cap',head,hair,0,.105,-.028,.36,.22,.33);
  const fringe=orb('hair-sweep',head,hair,-.075,.135,.065,.21,.11,.21);fringe.rotation.z=-.2;
  const bob=orb('hair-bob',head,hair,0,.005,-.09,.37,.35,.29);
  const bun=orb('hair-bun',head,hair,0,.20,-.10,.13,.12,.13);
  const pigtails=[orb('pigtail-left',head,hair,-.145,-.02,-.05,.105,.15,.13),orb('pigtail-right',head,hair,.145,-.02,-.05,.105,.15,.13)];
  const curls=[orb('curl-left',head,hair,-.095,.155,.01,.17,.13,.18),orb('curl-top',head,hair,.015,.18,-.025,.18,.14,.19),orb('curl-right',head,hair,.105,.145,.005,.15,.13,.17)];
  for(const x of [-.054,.054])orb('eye',head,ink,x,.01,.175,.02,.026,.012);
  for(const x of [-.101,.101])orb('cheek',head,cheek,x,-.034,.156,.048,.026,.012);
  orb('nose',head,skin,0,-.02,.19,.037,.037,.04);
  const beard=orb('beard',head,hair,0,-.088,.098,.20,.115,.15);
  const glasses=joint('glasses',head);
  for(const x of [-.06,.06]){
    const g=attach(MeshBuilder.CreateTorus(`guest-${index}-glasses`,{diameter:.092,thickness:.009,tessellation:12},scene),glasses,brass);
    g.rotation.x=Math.PI/2;g.position.set(x,.01,.185);
  }
  orb('glasses-bridge',glasses,brass,0,.015,.19,.035,.009,.01);
  const legs=[-1,1].map(side=>{
    const hip=joint(`hip-${side}`,rig),thigh=orb('thigh',hip,trousers,0,-.125,0,.12,.28,.14);
    const knee=joint(`knee-${side}`,hip),shin=orb('shin',knee,trousers,0,-.16,0,.105,.35,.12);
    const ankle=joint(`ankle-${side}`,knee),shoe=orb('shoe',ankle,hair,0,0,.035,.14,.10,.20);
    return{side,hip,knee,ankle,thigh,shin,shoe};
  });
  const arms=[-1,1].map(side=>{
    const shoulder=joint(`shoulder-${side}`,torso),sleeve=orb('upper-sleeve',shoulder,top,0,-.085,0,.125,.20,.145);
    const elbow=joint(`elbow-${side}`,shoulder),forearm=orb('lower-sleeve',elbow,top,0,-.08,0,.105,.19,.12);
    const hand=orb('hand',elbow,skin,0,-.18,.012,.078,.09,.08);
    return{side,shoulder,elbow,sleeve,forearm,hand};
  });
  const cupRoot=joint('cup-joint',rig);
  attach(MeshBuilder.CreateCylinder(`guest-${index}-cup`,{height:.105,diameterBottom:.10,diameterTop:.13,tessellation:16},scene),cupRoot,cream);
  const tea=attach(MeshBuilder.CreateCylinder(`guest-${index}-tea`,{height:.007,diameter:.10,tessellation:16},scene),cupRoot,hair);tea.position.y=.055;
  const handle=attach(MeshBuilder.CreateTorus(`guest-${index}-cup-handle`,{diameter:.075,thickness:.015,tessellation:12},scene),cupRoot,cream);
  handle.rotation.x=Math.PI/2;handle.position.set(.073,0,0);
  const contact=joint('contact-shadow',root);
  for(const [radius,alpha]of [[.225,.055],[.155,.065]]){
    const m=material('contact','#233b30');m.disableLighting=true;m.emissiveColor.copyFrom(m.diffuseColor);m.alpha=alpha;m.backFaceCulling=false;
    const disc=attach(MeshBuilder.CreateDisc(`guest-${index}-contact`,{radius,tessellation:28},scene),contact,m);
    disc.rotation.x=Math.PI/2;disc.position.y=radius>.2?.008:.01;disc.scaling.y=.72;disc.receiveShadows=false;disc.metadata={roomGuest:true,contactShadow:true};
  }

  let profile:GuestProfile=GUEST_PROFILES[0],pose:GuestPose='stand',upperSeat=0,lastTime:number|null=null,snap=true;
  const color=(m:StandardMaterial,hex:string)=>m.diffuseColor.copyFrom(Color3.FromHexString(hex));
  const setProfile=(id:string)=>{
    profile=guestProfile(id);root.metadata.profileId=profile.id;root.metadata.profileGroup=profile.group;
    color(skin,profile.skin);color(hair,profile.hair);color(top,profile.top);color(trousers,profile.trousers);color(accent,profile.accent);
    fringe.setEnabled(profile.hairStyle==='sweep'||profile.hairStyle==='bun');bob.setEnabled(profile.hairStyle==='bob');bun.setEnabled(profile.hairStyle==='bun');
    for(const m of pigtails)m.setEnabled(profile.hairStyle==='pigtails');for(const m of curls)m.setEnabled(profile.hairStyle==='curls');
    glasses.setEnabled(!!profile.glasses);beard.setEnabled(!!profile.beard);
    snap=true;lastTime=null;
  };
  const setPose=(next:GuestPose)=>{pose=next;root.metadata.pose=next;};
  // One planted foot travels backwards at the route speed; the other lifts and
  // returns smoothly. Both ankle goals remain at/above the floor throughout.
  const feet=[{z:0,lift:0},{z:0,lift:0}];
  const animate=(time:number,moving:boolean,reduced:boolean,motion?:GuestVisualMotion)=>{
    if(root.isDisposed())return;
    const dt=clamp(motion?.dt??(lastTime===null?0:time-lastTime),0,.1);lastTime=time;
    const immediate=snap||reduced||motion?.reset===true;snap=false;
    const blend=immediate?1:1-Math.exp(-18*dt);
    const child=profile.group==='child',seated=pose==='sit';
    upperSeat=mix(upperSeat,seated?1:0,blend);
    const standingHip=child?.39:.62,hipY=seated?.49:standingHip;
    const upperLeg=child?.15:.25,lowerLeg=child?.20:seated?.40:.32;
    const footHeight=child?.04:.05;
    const weight=!reduced&&!seated?clamp(motion?.walkWeight??(moving?1:0),0,1):0;
    const phase=Number.isFinite(motion?.stridePhase)?motion!.stridePhase:time*7.4;
    const amplitude=profile.strideLength/4;
    let liftRoot=0;
    for(let i=0;i<2;i++){
      const p=((phase+i*Math.PI)%cycle+cycle)%cycle,u=(p%Math.PI)/Math.PI;
      feet[i].z=weight*amplitude*(p<Math.PI?1-2*u:-1+2*u*u*(3-2*u));
      feet[i].lift=weight*(p<Math.PI?0:Math.sin(u*Math.PI)*(child?.045:.06));
      const reach=upperLeg+lowerLeg;
      if(!seated)liftRoot=Math.min(liftRoot,footHeight+feet[i].lift+Math.sqrt(Math.max(0,reach*reach-feet[i].z*feet[i].z))-standingHip);
    }
    rig.position.y=seated?0:liftRoot; // Only the rig bobs; the route root never moves.
    hips.position.y=hipY;hips.scaling.set(child?.25:.29,seated?.16:.18,seated?.28:.24);
    torso.position.y=hipY;torso.rotation.z=weight*Math.sin(phase)*.018;
    body.position.y=mix(child?.15:.22,child?.145:.18,upperSeat);body.scaling.set(child?.285:.32,mix(child?.31:.43,child?.29:.37,upperSeat),child?.24:.26);
    collar.position.y=mix(child?.292:.415,child?.273:.35,upperSeat);collar.scaling.x=child?.15:.17;
    detail.position.set(profile.scarf?.045:0,mix(child?.15:.28,child?.145:.23,upperSeat),child?.122:.135);
    detail.scaling.set(profile.scarf?.07:child?.11:.10,profile.scarf?.20:child?.06:.07,.026);
    head.position.set(0,mix(child?.40:.53,child?.40:.48,upperSeat),.015);
    head.scaling.setAll(child?1.015:1);
    const gaze=child?(pose==='order'?-.28:pose==='browse'?-.18:0):(pose==='browse'?-.10:0);
    head.rotation.x=mix(head.rotation.x,gaze,blend);
    head.rotation.y=reduced?0:!moving&&(pose==='browse'||pose==='look')?Math.sin(time*.65+index)*.08:0;
    head.rotation.z=-torso.rotation.z*.55;
    contact.setEnabled(!seated);contact.scaling.setAll(child?.76:1);
    for(let i=0;i<2;i++){
      const leg=legs[i],u=upperLeg,l=lowerLeg;
      leg.hip.position.set(leg.side*(child?.073:.085),hipY,0);
      // Seat anchors snap, avoiding a straight leg passing through the cushion.
      const ankleY=seated?Math.max(footHeight-root.position.y,hipY-l):footHeight+feet[i].lift-root.position.y-rig.position.y;
      const z=seated?u:feet[i].z,y=ankleY-hipY;
      const distance=clamp(Math.hypot(y,z),Math.abs(u-l)+.00001,u+l);
      const hipAngle=Math.atan2(-z,-y)-Math.acos(clamp((u*u+distance*distance-l*l)/(2*u*distance),-1,1));
      const kneeAngle=Math.PI-Math.acos(clamp((u*u+l*l-distance*distance)/(2*u*l),-1,1));
      leg.hip.rotation.x=hipAngle;leg.knee.rotation.x=kneeAngle;leg.knee.position.y=-u;
      leg.ankle.position.y=-l;leg.ankle.rotation.x=-hipAngle-kneeAngle;
      leg.thigh.position.y=-u/2;leg.thigh.scaling.set(child?.10:.12,u+.035,child?.12:.14);
      leg.shin.position.y=-l/2;leg.shin.scaling.set(child?.088:.105,l+.035,child?.105:.12);
      leg.shoe.scaling.set(child?.115:.14,footHeight*2,child?.16:.20);
    }
    for(let i=0;i<2;i++){
      const arm=arms[i],upper=child?.12:.17,lower=child?.12:.17;
      arm.shoulder.position.set(arm.side*mix(child?.158:.195,child?.125:.15,upperSeat),mix(child?.28:.36,child?.24:.29,upperSeat),mix(0,.02,upperSeat));
      const swing=Math.cos(phase+i*Math.PI)*.28*weight;
      let shoulder=.05+swing,elbow=.16+Math.max(0,-swing)*.6;
      if(pose==='order'&&arm.side>0){shoulder=child?-.25:-.55;elbow=child?-.35:-.65;}
      if(pose==='browse'&&arm.side>0){shoulder=child?-.18:-.30;elbow=-.36;}
      if(seated){shoulder=-.85;elbow=-.9;}
      arm.shoulder.rotation.x=mix(arm.shoulder.rotation.x,shoulder,blend);
      arm.elbow.rotation.x=mix(arm.elbow.rotation.x,elbow,blend);
      arm.shoulder.rotation.z=mix(arm.shoulder.rotation.z,seated?-arm.side*.18:arm.side*.08,blend);
      arm.elbow.rotation.z=mix(arm.elbow.rotation.z,seated?-arm.side*.15:0,blend);
      arm.sleeve.position.y=-upper/2;arm.sleeve.scaling.set(child?.105:.125,upper+.035,child?.12:.145);
      arm.elbow.position.y=-upper;arm.forearm.position.y=-lower/2;arm.forearm.scaling.set(child?.088:.105,lower+.035,child?.10:.12);
      arm.hand.position.y=-lower-.015;arm.hand.scaling.set(child?.065:.078,child?.075:.09,child?.065:.08);
    }
    cupRoot.position.set(0,child?.665:.715,child?.21:.26);cupRoot.scaling.setAll(child?.82:1);
    cupRoot.rotation.z=!reduced&&seated?Math.sin(time*.6+index)*.008:0;cupRoot.setEnabled(seated&&upperSeat>.7);
  };
  setProfile(GUEST_PROFILES[index%GUEST_PROFILES.length].id);setPose('stand');animate(0,false,true);
  root.onDisposeObservable.add(()=>materials.forEach(m=>m.dispose(false,true)));
  return{root,setProfile,setPose,animate,dispose(){if(!root.isDisposed())root.dispose(false,false);}};
}

// Compatibility for the original seated preview and isolated art checks.
export function buildEditionGuest(scene:Scene):TransformNode {
  const visual=buildTrafficGuest(scene,0);visual.root.name='edition-seated-guest';visual.setPose('sit');visual.animate(0,false,true);
  visual.root.position.x=-.77;visual.root.rotation.y=Math.PI/2;visual.root.setEnabled(true);return visual.root;
}
