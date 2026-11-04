import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';

// A quiet seated visitor. Local +z faces the table; no simulation, picking or
// animation is attached to this visual. The table owns its transform/lifetime.
export function buildEditionGuest(scene: Scene): TransformNode {
  const root = new TransformNode('edition-seated-guest', scene);
  const materials: StandardMaterial[] = [];
  const material = (name: string, color: string) => {
    const mat = new StandardMaterial(`guest-${name}`, scene);
    mat.diffuseColor = Color3.FromHexString(color);
    mat.specularColor.setAll(.08);
    mat.maxSimultaneousLights = 5;
    materials.push(mat);
    return mat;
  };
  const skin = material('skin', '#d5a17e');
  const hair = material('hair', '#584534');
  const sweater = material('sweater', '#bb8d80');
  const trousers = material('trousers', '#596d68');
  const cream = material('ceramic', '#f6eedf');
  const ink = material('eyes', '#41433a');
  const cheek = material('cheek', '#c98170');
  const orb = (name: string, mat: StandardMaterial, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    const mesh = MeshBuilder.CreateSphere(`guest-${name}`, {diameter: 1, segments: 12}, scene);
    mesh.parent = root;
    mesh.material = mat;
    mesh.position.set(x, y, z);
    mesh.scaling.set(sx, sy, sz);
    mesh.isPickable = false;
    mesh.receiveShadows = true;
    mesh.metadata = {roomGuest: true};
    return mesh;
  };

  orb('lap', trousers, 0, .49, .04, .29, .15, .26);
  orb('body', sweater, 0, .665, -.025, .30, .37, .24);
  for (const x of [-.085, .085]) {
    orb('knee', trousers, x, .45, .16, .12, .13, .18);
    orb('shin', trousers, x, .275, .18, .10, .30, .11);
    orb('shoe', hair, x, .10, .22, .13, .10, .20);
    const sleeve = orb('sleeve', sweater, x * 1.8, .68, .06, .11, .22, .13);
    sleeve.rotation.x = -.5;
    orb('hand', skin, x, .70, .19, .075, .08, .08);
  }
  orb('head', skin, 0, .96, .015, .34, .36, .32);
  orb('hair-cap', hair, 0, 1.055, -.025, .35, .21, .32);
  orb('hair-knot', hair, 0, 1.13, -.10, .13, .12, .13);
  for (const x of [-.052, .052]) orb('eye', ink, x, .97, .166, .02, .027, .012);
  for (const x of [-.097, .097]) orb('cheek', cheek, x, .926, .147, .048, .026, .012);
  orb('nose', skin, 0, .94, .181, .036, .037, .04);

  const cup = MeshBuilder.CreateCylinder('guest-cup', {height: .105, diameterBottom: .10, diameterTop: .13, tessellation: 16}, scene);
  cup.parent = root;
  cup.position.set(0, .72, .21);
  cup.material = cream;
  cup.isPickable = false;
  cup.receiveShadows = true;
  cup.metadata = {roomGuest: true};
  const tea = MeshBuilder.CreateCylinder('guest-tea', {height: .007, diameter: .10, tessellation: 16}, scene);
  tea.parent = root;
  tea.position.set(0, .775, .21);
  tea.material = hair;
  tea.isPickable = false;
  tea.metadata = {roomGuest: true};

  root.position.x = -.77;
  root.rotation.y = Math.PI / 2;
  root.onDisposeObservable.add(() => materials.forEach(mat => mat.dispose(false, true)));
  return root;
}
