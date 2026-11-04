import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';

export type GuestPose = 'stand' | 'browse' | 'order' | 'sit' | 'look';
export interface TrafficGuestVisual {
  root: TransformNode;
  setPose(pose: GuestPose): void;
  animate(timeSeconds: number, moving: boolean, reducedMotion: boolean): void;
  dispose(): void;
}

// Each visitor owns one small rig and one material palette for its whole visit.
// Route position/rotation belongs to the caller; only child joints are animated.
export function buildTrafficGuest(scene: Scene, index = 0): TrafficGuestVisual {
  const variant = index % 2;
  const root = new TransformNode(`traffic-guest-${index}`, scene);
  root.metadata = {roomGuest: true, visitor: index, pose: 'stand'};
  root.setEnabled(false);
  const rig = new TransformNode(`guest-${index}-rig`, scene);
  rig.parent = root;
  const materials: StandardMaterial[] = [];
  const material = (name: string, color: string) => {
    const mat = new StandardMaterial(`guest-${index}-${name}`, scene);
    mat.diffuseColor = Color3.FromHexString(color);
    mat.specularColor.setAll(.06);
    mat.maxSimultaneousLights = 5;
    materials.push(mat);
    return mat;
  };
  const skin = material('skin', variant ? '#b9825f' : '#d5a17e');
  const hair = material('hair', variant ? '#343c39' : '#584534');
  const sweater = material('sweater', variant ? '#839c91' : '#bb8d80');
  const trousers = material('trousers', variant ? '#657b89' : '#596d68');
  const cream = material('ceramic', '#f6eedf');
  const ink = material('eyes', '#343c36');
  const cheek = material('cheek', '#c98170');
  const brass = material('brass', '#c3a46c');
  const attach = (mesh: Mesh, parent: TransformNode, mat: StandardMaterial) => {
    mesh.parent = parent;
    mesh.material = mat;
    mesh.isPickable = false;
    mesh.receiveShadows = true;
    // Moving visitors deliberately stay out of cached room shadow maps.
    mesh.metadata = {roomGuest: true};
    return mesh;
  };
  const orb = (name: string, parent: TransformNode, mat: StandardMaterial, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    const mesh = attach(MeshBuilder.CreateSphere(`guest-${index}-${name}`, {diameter: 1, segments: 10}, scene), parent, mat);
    mesh.position.set(x, y, z);
    mesh.scaling.set(sx, sy, sz);
    return mesh;
  };
  const joint = (name: string, parent: TransformNode) => {
    const node = new TransformNode(`guest-${index}-${name}`, scene);
    node.parent = parent;
    return node;
  };

  const hips = orb('hips', rig, trousers, 0, .62, 0, .29, .18, .24);
  const body = orb('body', rig, sweater, 0, .85, -.015, .32, .43, .26);
  const collar = orb('collar', rig, cream, 0, 1.035, .025, .17, .045, .15);
  // The sage visitor has a small cream scarf; the rose visitor has a hair bun.
  const scarf = variant ? orb('scarf', rig, cream, .055, .91, .137, .07, .24, .035) : null;
  const head = joint('head-joint', rig);
  orb('head', head, skin, 0, 0, .015, .35, .37, .33);
  orb('hair-cap', head, hair, 0, .10, -.025, .36, .21, .33);
  if (variant) {
    const sweep = orb('hair-sweep', head, hair, -.08, .135, .065, .21, .11, .21);
    sweep.rotation.z = -.2;
  } else {
    orb('hair-knot', head, hair, 0, .19, -.10, .13, .12, .13);
  }
  for (const x of [-.054, .054]) orb('eye', head, ink, x, .01, .175, .02, .026, .012);
  for (const x of [-.101, .101]) orb('cheek', head, cheek, x, -.034, .156, .048, .026, .012);
  orb('nose', head, skin, 0, -.02, .19, .037, .037, .04);
  if (variant) {
    for (const x of [-.06, .06]) {
      const glasses = attach(MeshBuilder.CreateTorus(`guest-${index}-glasses`, {diameter: .092, thickness: .009, tessellation: 12}, scene), head, brass);
      glasses.rotation.x = Math.PI / 2;
      glasses.position.set(x, .01, .185);
    }
    orb('glasses-bridge', head, brass, 0, .015, .19, .035, .009, .01);
  }

  const legs = [-1, 1].map(side => {
    const hip = joint(`hip-${side}`, rig);
    hip.position.x = side * .085;
    orb('thigh', hip, trousers, 0, -.12, 0, .12, .27, .14);
    const knee = joint(`knee-${side}`, hip);
    knee.position.y = -.25;
    orb('shin', knee, trousers, 0, -.145, 0, .105, .30, .12);
    orb('shoe', knee, hair, 0, -.32, .055, .14, .10, .22);
    return {hip, knee};
  });
  const arms = [-1, 1].map(side => {
    const shoulder = joint(`shoulder-${side}`, rig);
    const sleeve = orb('sleeve', shoulder, sweater, 0, -.115, 0, .13, .29, .15);
    const hand = orb('hand', shoulder, skin, 0, -.285, .02, .078, .09, .08);
    return {side, shoulder, sleeve, hand};
  });

  const cupRoot = joint('cup-joint', rig);
  const cup = attach(MeshBuilder.CreateCylinder(`guest-${index}-cup`, {height: .105, diameterBottom: .10, diameterTop: .13, tessellation: 16}, scene), cupRoot, cream);
  const tea = attach(MeshBuilder.CreateCylinder(`guest-${index}-tea`, {height: .007, diameter: .10, tessellation: 16}, scene), cupRoot, hair);
  tea.position.y = .055;
  const handle = attach(MeshBuilder.CreateTorus(`guest-${index}-cup-handle`, {diameter: .075, thickness: .015, tessellation: 12}, scene), cupRoot, cream);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(.073, 0, 0);
  cup.position.y = 0;

  const contact = joint('contact-shadow', root);
  for (const [radius, alpha] of [[.225, .055], [.155, .065]]) {
    const mat = material('contact', '#233b30');
    mat.disableLighting = true;
    mat.emissiveColor = mat.diffuseColor.clone();
    mat.alpha = alpha;
    mat.backFaceCulling = false;
    const disc = attach(MeshBuilder.CreateDisc(`guest-${index}-contact`, {radius, tessellation: 28}, scene), contact, mat);
    disc.rotation.x = Math.PI / 2;
    disc.position.y = radius > .2 ? .008 : .01;
    disc.scaling.y = .72;
    disc.receiveShadows = false;
    disc.metadata = {roomGuest: true, contactShadow: true};
  }

  let pose: GuestPose = 'stand';
  const baseArmX = [0, 0];
  const setPose = (next: GuestPose) => {
    pose = next;
    root.metadata.pose = next;
    const seated = next === 'sit';
    rig.position.y = 0;
    hips.position.y = seated ? .49 : .62;
    hips.scaling.z = seated ? .28 : .24;
    body.position.y = seated ? .68 : .85;
    body.scaling.y = seated ? .37 : .43;
    collar.position.y = seated ? .84 : 1.035;
    if (scarf) { scarf.position.y = seated ? .75 : .91; scarf.scaling.y = seated ? .18 : .24; }
    head.position.set(0, seated ? .96 : 1.15, .015);
    head.rotation.set(next === 'browse' ? -.12 : 0, 0, 0);
    for (const leg of legs) {
      leg.hip.position.y = seated ? .49 : .62;
      leg.hip.rotation.x = seated ? -Math.PI / 2 : 0;
      leg.knee.rotation.x = seated ? Math.PI / 2 : 0;
      leg.knee.scaling.y = seated ? 1.25 : 1;
    }
    arms.forEach((arm, i) => {
      arm.shoulder.position.set(arm.side * (seated ? .145 : .195), seated ? .78 : .98, seated ? .02 : 0);
      baseArmX[i] = seated ? -1.2 : next === 'order' ? (arm.side > 0 ? -.9 : -.15) : next === 'browse' ? (arm.side > 0 ? -.65 : .1) : .06;
      arm.shoulder.rotation.set(baseArmX[i], 0, seated ? -arm.side * .18 : arm.side * .10);
      arm.sleeve.scaling.y = seated ? .23 : .29;
      arm.sleeve.position.y = seated ? -.09 : -.115;
      arm.hand.position.y = seated ? -.21 : -.285;
    });
    cupRoot.position.set(0, .715, .235);
    cupRoot.rotation.setAll(0);
    cupRoot.setEnabled(seated);
    contact.setEnabled(!seated);
  };
  const animate = (timeSeconds: number, moving: boolean, reducedMotion: boolean) => {
    if (root.isDisposed()) return;
    const active = !reducedMotion && moving && pose !== 'sit';
    const gait = active ? Math.sin(timeSeconds * 7.4 + index * .7) : 0;
    // Keep the feet close to the floor; route movement supplies all travel.
    rig.position.y = active ? Math.abs(Math.sin(timeSeconds * 7.4)) * .006 : 0;
    legs.forEach((leg, i) => { leg.hip.rotation.x = pose === 'sit' ? -Math.PI / 2 : gait * (i ? -.22 : .22); });
    arms.forEach((arm, i) => { arm.shoulder.rotation.x = baseArmX[i] + (active ? gait * (i ? .16 : -.16) : 0); });
    head.rotation.x = pose === 'browse' ? -.12 : 0;
    head.rotation.y = !reducedMotion && !moving && (pose === 'browse' || pose === 'look') ? Math.sin(timeSeconds * .65 + index) * .10 : 0;
    if (!reducedMotion && !moving && pose === 'order') arms[1].shoulder.rotation.x += Math.sin(timeSeconds * 1.2) * .035;
    cupRoot.rotation.z = !reducedMotion && pose === 'sit' ? Math.sin(timeSeconds * .6 + index) * .012 : 0;
  };
  setPose('stand');
  root.onDisposeObservable.add(() => materials.forEach(mat => mat.dispose(false, true)));
  return {root, setPose, animate, dispose() { if (!root.isDisposed()) root.dispose(false, false); }};
}

// Compatibility for the original seated-room preview and isolated art checks.
export function buildEditionGuest(scene: Scene): TransformNode {
  const visual = buildTrafficGuest(scene, 0);
  visual.root.name = 'edition-seated-guest';
  visual.setPose('sit');
  visual.root.position.x = -.77;
  visual.root.rotation.y = Math.PI / 2;
  visual.root.setEnabled(true);
  return visual.root;
}
