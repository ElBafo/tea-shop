import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ShopState, UpgradeId } from "../game/types";
import { C } from "./palette";
import {
  marbleTexture,
  plasterTexture,
  rugTexture,
  signTexture,
  woodTexture,
} from "./textures";
import { floorCenter, wallCenter } from "./grid";
import { UPGRADE_BY_ID, placeOf, styleOf } from "./upgrades";

export interface ShopVisuals {
  floor: Mesh;
  backWall: Mesh;
  leftWall: Mesh;
  glass: Mesh;
  curtains: TransformNode;
  stain: TransformNode;
  items: Partial<Record<UpgradeId, TransformNode>>;
}

function paint(scene: Scene, name: string, hex: string, extra?: { tex?: Texture; spec?: number; emit?: string; alpha?: number }): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(hex);
  const spec = extra?.spec ?? 0.12;
  material.specularColor = new Color3(spec, spec * 0.9, spec * 0.75);
  material.specularPower = extra?.spec && extra.spec > 0.25 ? 48 : 24;
  if (extra?.tex) material.diffuseTexture = extra.tex;
  if (extra?.emit) material.emissiveColor = Color3.FromHexString(extra.emit).scale(0.22);
  if (extra?.alpha !== undefined) {
    material.alpha = extra.alpha;
    material.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  }
  return material;
}

function box(
  scene: Scene,
  name: string,
  w: number,
  h: number,
  d: number,
  parent: TransformNode,
  material: StandardMaterial,
  x = 0,
  y = 0,
  z = 0,
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
  mesh.parent = parent;
  mesh.position.set(x, y, z);
  mesh.material = material;
  mesh.receiveShadows = true;
  return mesh;
}

function cyl(
  scene: Scene,
  name: string,
  h: number,
  r: number,
  parent: TransformNode,
  material: StandardMaterial,
  x = 0,
  y = 0,
  z = 0,
  tess = 10,
): Mesh {
  const mesh = MeshBuilder.CreateCylinder(name, { height: h, diameter: r * 2, tessellation: tess }, scene);
  mesh.parent = parent;
  mesh.position.set(x, y, z);
  mesh.material = material;
  mesh.receiveShadows = true;
  return mesh;
}

function sphere(
  scene: Scene,
  name: string,
  r: number,
  parent: TransformNode,
  material: StandardMaterial,
  x = 0,
  y = 0,
  z = 0,
): Mesh {
  const mesh = MeshBuilder.CreateSphere(name, { diameter: r * 2, segments: 8 }, scene);
  mesh.parent = parent;
  mesh.position.set(x, y, z);
  mesh.material = material;
  mesh.receiveShadows = true;
  return mesh;
}

function tag(root: TransformNode, id: UpgradeId): void {
  root.metadata = { upgradeId: id };
  root.getChildMeshes().forEach((mesh) => {
    mesh.metadata = { upgradeId: id };
  });
}

function teapot(scene: Scene, parent: TransformNode, mats: { body: StandardMaterial; lid: StandardMaterial }, x: number, y: number, z: number): void {
  const pot = new TransformNode("teapot", scene);
  pot.parent = parent;
  pot.position.set(x, y, z);
  sphere(scene, "pot-body", 0.13, pot, mats.body, 0, 0.12, 0);
  cyl(scene, "pot-lid", 0.04, 0.07, pot, mats.lid, 0, 0.24, 0);
  sphere(scene, "pot-knob", 0.025, pot, mats.lid, 0, 0.28, 0);
  const spout = cyl(scene, "pot-spout", 0.14, 0.025, pot, mats.body, 0.12, 0.14, 0);
  spout.rotation.z = Math.PI / 3;
  const handle = MeshBuilder.CreateTorus("pot-handle", { diameter: 0.12, thickness: 0.022, tessellation: 10 }, scene);
  handle.parent = pot;
  handle.position.set(-0.12, 0.13, 0);
  handle.rotation.z = Math.PI / 2;
  handle.material = mats.body;
}

export function createShopVisuals(scene: Scene): ShopVisuals {
  const wood = woodTexture(scene, C.wood, C.woodDeep, "floor-wood");
  wood.uScale = 6;
  wood.vScale = 6;
  const shabbyPlaster = plasterTexture(scene, C.plaster, "shabby-wall");
  shabbyPlaster.uScale = 2;
  shabbyPlaster.vScale = 1.2;

  const floorMat = paint(scene, "floor", C.wood, { tex: wood });
  const wallMat = paint(scene, "wall-shabby", C.plaster, { tex: shabbyPlaster });
  const trimMat = paint(scene, "trim", C.woodDeep);
  const glassMat = paint(scene, "glass", C.dirtyGlass, { spec: 0.4, alpha: 0.38 });
  const stainMat = paint(scene, "stain", C.stain);

  const room = new TransformNode("room", scene);
  const floor = box(scene, "floor", 6.2, 0.1, 6.2, room, floorMat, 3, -0.05, 3);
  floor.metadata = { ground: true };
  const backWall = box(scene, "back-wall", 6.2, 3.25, 0.12, room, wallMat, 3, 1.62, -0.06);
  const leftWall = box(scene, "left-wall", 0.12, 3.25, 6.2, room, wallMat, -0.06, 1.62, 3);
  box(scene, "base-back", 6.2, 0.16, 0.08, room, trimMat, 3, 0.08, 0.05);
  box(scene, "base-left", 0.08, 0.16, 6.2, room, trimMat, 0.05, 0.08, 3);
  box(scene, "cornice-back", 6.2, 0.1, 0.08, room, trimMat, 3, 3.18, 0.05);
  box(scene, "cornice-left", 0.08, 0.1, 6.2, room, trimMat, 0.05, 3.18, 3);

  const frameMat = paint(scene, "frame", C.woodDeep);
  box(scene, "win-sill", 1.7, 0.08, 0.28, room, frameMat, 5, 1.12, 0.12);
  box(scene, "win-top", 1.7, 0.08, 0.1, room, frameMat, 5, 2.58, 0.02);
  box(scene, "win-l", 0.08, 1.5, 0.1, room, frameMat, 4.2, 1.85, 0.02);
  box(scene, "win-r", 0.08, 1.5, 0.1, room, frameMat, 5.8, 1.85, 0.02);
  const glass = box(scene, "win-glass", 1.5, 1.36, 0.04, room, glassMat, 5, 1.85, 0.01);

  const stain = new TransformNode("stains", scene);
  stain.parent = room;
  box(scene, "stain-a", 0.7, 0.9, 0.02, stain, stainMat, 1.4, 2.1, 0.01);
  box(scene, "stain-b", 0.45, 0.55, 0.02, stain, stainMat, 0.01, 1.7, 2.4);
  box(scene, "ghost-sign", 1.4, 0.45, 0.02, stain, stainMat, 4.1, 2.5, 0.01);

  const curtains = new TransformNode("curtains", scene);
  curtains.parent = room;
  curtains.setEnabled(false);
  const curtainMat = paint(scene, "curtain", C.blush);
  box(scene, "curtain-l", 0.28, 1.55, 0.06, curtains, curtainMat, 4.22, 1.85, 0.1);
  box(scene, "curtain-r", 0.28, 1.55, 0.06, curtains, curtainMat, 5.78, 1.85, 0.1);
  box(scene, "curtain-rod", 1.8, 0.05, 0.05, curtains, paint(scene, "rod", C.woodDeep), 5, 2.66, 0.1);

  return { floor, backWall, leftWall, glass, curtains, stain, items: {} };
}

function placeFloorItem(root: TransformNode, id: UpgradeId, shop: ShopState, lift = 0): void {
  const def = UPGRADE_BY_ID[id];
  const place = placeOf(shop, id);
  const center = floorCenter(def.size, place);
  root.position.set(center.x, lift, center.z);
  root.rotation.y = place.rot * (Math.PI / 2);
}

function placeWallItem(root: TransformNode, id: UpgradeId, shop: ShopState): void {
  const def = UPGRADE_BY_ID[id];
  const place = placeOf(shop, id);
  const center = wallCenter(place, def.size.w);
  root.position.set(center.x, center.y, center.z);
  root.rotation.y = place.wall === "left" ? Math.PI / 2 : 0;
}

export function buildItem(scene: Scene, id: UpgradeId, shop: ShopState): TransformNode {
  const style = styleOf(shop, id);
  if (id === "counter") return buildCounter(scene, shop, style);
  if (id === "sign") return buildSign(scene, shop, style);
  if (id === "shelves") return buildShelves(scene, shop, style);
  if (id === "plant") return buildPlant(scene, shop, style);
  if (id === "rug") return buildRug(scene, shop, style);
  if (id === "lamp") return buildLamp(scene, shop, style);
  if (id === "table") return buildTable(scene, shop, style);
  return new TransformNode("empty", scene);
}

function buildCounter(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("counter", scene);
  const owned = shop.owned.includes("counter");
  const bodyHex = owned ? [C.wood, C.ceramic, C.blush][style] ?? C.wood : C.dust;
  const topHex = owned ? [C.woodDeep, C.marble, C.foam][style] ?? C.woodDeep : C.dustTop;
  const body = paint(scene, "counter-body", bodyHex);
  const top = paint(
    scene,
    "counter-top",
    topHex,
    style === 1 && owned ? { tex: marbleTexture(scene), spec: 0.38 } : { spec: owned ? 0.2 : 0.06 },
  );
  box(scene, "counter-box", 3, 1.02, 0.92, root, body, 0, 0.51, 0);
  box(scene, "counter-top", 3.08, 0.08, 1, root, top, 0, 1.06, 0);
  if (!owned) {
    const stain = paint(scene, "counter-stain", "#5c4a3c");
    box(scene, "dust-a", 0.7, 0.03, 0.3, root, stain, -0.7, 1.11, 0.1);
    box(scene, "dust-b", 0.4, 0.03, 0.22, root, stain, 0.85, 1.11, -0.15);
  } else {
    teapot(
      scene,
      root,
      {
        body: paint(scene, "tea-body", C.blush),
        lid: paint(scene, "tea-lid", C.woodDeep),
      },
      -1.05,
      1.1,
      0.05,
    );
    const cup = paint(scene, "counter-cup", C.foam);
    cyl(scene, "cup", 0.1, 0.07, root, cup, 0.9, 1.16, 0.12);
    box(scene, "saucer", 0.2, 0.02, 0.2, root, paint(scene, "saucer", C.ceramic), 0.9, 1.11, 0.12);
  }
  placeFloorItem(root, "counter", shop);
  tag(root, "counter");
  return root;
}

function buildSign(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("sign", scene);
  const board = paint(scene, "sign-board", C.wood, { tex: signTexture(scene, style) });
  const hardware = paint(scene, "sign-hw", C.woodDeep);
  box(scene, "sign-board", 1.7, 0.55, 0.08, root, board, 0, 0, 0);
  cyl(scene, "sign-hook-l", 0.12, 0.025, root, hardware, -0.55, 0.34, 0);
  cyl(scene, "sign-hook-r", 0.12, 0.025, root, hardware, 0.55, 0.34, 0);
  placeWallItem(root, "sign", shop);
  tag(root, "sign");
  return root;
}

function buildShelves(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("shelves", scene);
  const woodHex = [C.wood, C.foam, C.woodDeep][style] ?? C.wood;
  const board = paint(scene, "shelf-board", woodHex);
  box(scene, "shelf-top", 2.7, 0.08, 0.34, root, board, 0, 0.28, 0.12);
  box(scene, "shelf-bot", 2.7, 0.08, 0.34, root, board, 0, -0.22, 0.12);
  box(scene, "shelf-l", 0.08, 0.7, 0.34, root, board, -1.31, 0.03, 0.12);
  box(scene, "shelf-r", 0.08, 0.7, 0.34, root, board, 1.31, 0.03, 0.12);
  const tins = [C.blush, C.gold, C.leaf, "#8ea0b5", "#e0a06e", "#c9b4dc"];
  tins.forEach((hex, i) => {
    const shelf = i < 3 ? 0.38 : -0.12;
    const x = -0.8 + (i % 3) * 0.8;
    cyl(scene, `tin-${i}`, 0.22, 0.12, root, paint(scene, `tin-${i}`, hex), x, shelf, 0.12, 8);
    cyl(scene, `tin-lid-${i}`, 0.04, 0.13, root, paint(scene, `tin-lid-${i}`, C.foam), x, shelf + 0.12, 0.12, 8);
  });
  const place = placeOf(shop, "shelves");
  root.position.set(1.45, 1.85, 0.16);
  if (place.wall === "left") {
    root.position.set(0.16, 1.85, 1.45);
    root.rotation.y = Math.PI / 2;
  }
  tag(root, "shelves");
  return root;
}

function buildPlant(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("plant", scene);
  const potHex = [C.pot, C.potSage, C.potBlush][style] ?? C.pot;
  const pot = paint(scene, "pot", potHex);
  cyl(scene, "pot", 0.22, 0.16, root, pot, 0, 0.13, 0, 8);
  cyl(scene, "soil", 0.04, 0.13, root, paint(scene, "soil", C.soil), 0, 0.24, 0, 8);
  const leaf = paint(scene, "leaf", C.leaf);
  const deep = paint(scene, "leaf-deep", C.leafDeep);
  if (style === 1) {
    sphere(scene, "suc-c", 0.1, root, leaf, 0, 0.36, 0);
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      sphere(scene, `suc-${i}`, 0.07, root, deep, Math.cos(a) * 0.1, 0.32, Math.sin(a) * 0.1);
    }
  } else if (style === 2) {
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      const frond = box(scene, `leaf-${i}`, 0.08, 0.28, 0.03, root, i % 2 ? leaf : deep, Math.cos(a) * 0.06, 0.4, Math.sin(a) * 0.06);
      frond.rotation.z = Math.cos(a) * 0.4;
      frond.rotation.x = Math.sin(a) * 0.35;
    }
    const bloom = paint(scene, "bloom", C.bloom);
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2;
      sphere(scene, `bloom-${i}`, 0.045, root, bloom, Math.cos(a) * 0.07, 0.52, Math.sin(a) * 0.07);
    }
  } else {
    for (let i = 0; i < 7; i += 1) {
      const a = (i / 7) * Math.PI * 2;
      const frond = box(scene, `fern-${i}`, 0.07, 0.36, 0.02, root, i % 2 ? leaf : deep, Math.cos(a) * 0.05, 0.42, Math.sin(a) * 0.05);
      frond.rotation.z = Math.cos(a) * 0.55;
      frond.rotation.x = Math.sin(a) * 0.45;
    }
  }
  const place = placeOf(shop, "plant");
  const onSill = place.z === 0 && place.x >= 4;
  placeFloorItem(root, "plant", shop, onSill ? 1.16 : 0);
  tag(root, "plant");
  return root;
}

function buildRug(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("rug", scene);
  const tex = rugTexture(scene, style);
  const mat = paint(scene, "rug", C.blush, { tex, spec: 0.05 });
  box(scene, "rug", 2.85, 0.04, 1.85, root, mat, 0, 0.03, 0);
  placeFloorItem(root, "rug", shop);
  tag(root, "rug");
  return root;
}

function buildLamp(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("lamp", scene);
  const metal = paint(scene, "lamp-metal", style === 1 ? C.brass : C.woodDeep);
  const shadeHex = [C.paper, C.gold, C.foam][style] ?? C.paper;
  const shade = paint(scene, "lamp-shade", shadeHex, { emit: C.gold });
  const glow = paint(scene, "lamp-bulb", C.gold, { emit: C.gold });
  cyl(scene, "lamp-base", 0.06, 0.16, root, metal, 0, 0.04, 0, 8);
  cyl(scene, "lamp-pole", 0.85, 0.03, root, metal, 0, 0.48, 0, 8);
  if (style === 0) {
    box(scene, "lantern", 0.32, 0.32, 0.32, root, shade, 0, 1.08, 0);
  } else if (style === 1) {
    const cone = MeshBuilder.CreateCylinder("shade", { height: 0.28, diameterTop: 0.14, diameterBottom: 0.42, tessellation: 10 }, scene);
    cone.parent = root;
    cone.position.set(0, 1.08, 0);
    cone.material = shade;
  } else {
    sphere(scene, "ceramic-base", 0.16, root, paint(scene, "cer-base", C.ceramic), 0, 0.16, 0);
    cyl(scene, "shade", 0.26, 0.2, root, shade, 0, 1.06, 0, 10);
  }
  const bulb = sphere(scene, "lamp-bulb", 0.05, root, glow, 0, 0.96, 0);
  bulb.metadata = { role: "bulb" };
  placeFloorItem(root, "lamp", shop);
  tag(root, "lamp");
  return root;
}

function buildTable(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("table", scene);
  const wood = paint(scene, "table-wood", style === 2 ? C.mint : C.wood);
  const deep = paint(scene, "table-deep", style === 2 ? C.leafDeep : C.woodDeep);
  const seat = paint(scene, "seat", style === 2 ? C.blush : C.woodDeep);
  if (style === 0) {
    cyl(scene, "top", 0.07, 0.72, root, wood, 0, 0.58, 0, 12);
    cyl(scene, "ped", 0.5, 0.08, root, deep, 0, 0.3, 0, 8);
    cyl(scene, "foot", 0.06, 0.22, root, deep, 0, 0.04, 0, 8);
    stool(scene, root, seat, deep, -0.85, 0.55);
    stool(scene, root, seat, deep, 0.85, -0.45);
  } else {
    box(scene, "top", 1.15, 0.07, 1.15, root, wood, 0, 0.58, 0);
    [[-0.48, -0.48], [0.48, -0.48], [-0.48, 0.48], [0.48, 0.48]].forEach(([x, z], i) => {
      box(scene, `leg-${i}`, 0.07, 0.55, 0.07, root, deep, x, 0.28, z);
    });
    chair(scene, root, seat, deep, -0.95, 0, Math.PI / 2);
    chair(scene, root, seat, deep, 0.95, 0, -Math.PI / 2);
  }
  placeFloorItem(root, "table", shop);
  tag(root, "table");
  return root;
}

function stool(scene: Scene, parent: TransformNode, seat: StandardMaterial, leg: StandardMaterial, x: number, z: number): void {
  const node = new TransformNode("stool", scene);
  node.parent = parent;
  node.position.set(x, 0, z);
  cyl(scene, "stool-top", 0.06, 0.2, node, seat, 0, 0.34, 0, 8);
  cyl(scene, "stool-leg", 0.3, 0.04, node, leg, 0, 0.16, 0, 8);
}

function chair(scene: Scene, parent: TransformNode, seat: StandardMaterial, frame: StandardMaterial, x: number, z: number, rot: number): void {
  const node = new TransformNode("chair", scene);
  node.parent = parent;
  node.position.set(x, 0, z);
  node.rotation.y = rot;
  box(scene, "chair-seat", 0.38, 0.05, 0.36, node, seat, 0, 0.32, 0);
  box(scene, "chair-back", 0.38, 0.36, 0.05, node, frame, 0, 0.52, -0.16);
  box(scene, "chair-leg-l", 0.05, 0.3, 0.05, node, frame, -0.14, 0.15, 0.12);
  box(scene, "chair-leg-r", 0.05, 0.3, 0.05, node, frame, 0.14, 0.15, 0.12);
}

export function buildCustomer(scene: Scene): TransformNode {
  const root = new TransformNode("customer", scene);
  const coat = paint(scene, "coat", C.coat);
  const skin = paint(scene, "skin", C.skin);
  const hair = paint(scene, "hair", C.hair);
  cyl(scene, "body", 0.62, 0.18, root, coat, 0, 0.62, 0, 8);
  sphere(scene, "head", 0.16, root, skin, 0, 1.08, 0.02);
  sphere(scene, "hair", 0.165, root, hair, 0, 1.16, -0.02);
  cyl(scene, "arm-l", 0.34, 0.05, root, coat, -0.22, 0.66, 0.04, 6);
  cyl(scene, "arm-r", 0.34, 0.05, root, coat, 0.22, 0.66, 0.04, 6);
  return root;
}

export function applyRoomStyle(visuals: ShopVisuals, shop: ShopState, scene: Scene): void {
  const painted = shop.owned.includes("paint");
  const style = styleOf(shop, "paint");
  const hex = painted ? [C.creamWall, C.sageWall, C.roseWall][style] ?? C.creamWall : C.plaster;
  const wallTex = plasterTexture(scene, hex, `wall-${painted ? style : "bare"}`);
  wallTex.uScale = 2;
  wallTex.vScale = 1.2;
  const wallMat = paint(scene, `wall-live-${hex}`, hex, { tex: wallTex });
  visuals.backWall.material = wallMat;
  visuals.leftWall.material = wallMat;
  const glass = visuals.glass.material as StandardMaterial;
  glass.diffuseColor = Color3.FromHexString(painted ? C.glass : C.dirtyGlass);
  glass.alpha = painted ? 0.28 : 0.42;
  visuals.curtains.setEnabled(painted);
  visuals.stain.setEnabled(!painted);
}

export function collectMeshes(root: TransformNode): AbstractMesh[] {
  return root.getChildMeshes();
}

export function itemKey(id: UpgradeId, shop: ShopState): string {
  const place = placeOf(shop, id);
  return `${id}:${styleOf(shop, id)}:${place.x}:${place.z}:${place.rot}:${place.wall ?? ""}`;
}

export function setItemTint(root: TransformNode, hex: string | null): void {
  root.getChildMeshes().forEach((mesh) => {
    const material = mesh.material;
    if (!(material instanceof StandardMaterial)) return;
    material.emissiveColor = hex ? Color3.FromHexString(hex).scale(0.28) : Color3.Black();
  });
}

export function selectionRing(scene: Scene): Mesh {
  const ring = MeshBuilder.CreateTorus(
    "select-ring",
    { diameter: 1.15, thickness: 0.05, tessellation: 20 },
    scene,
  );
  ring.material = paint(scene, "ring", C.gold, { emit: C.gold });
  ring.isPickable = false;
  ring.setEnabled(false);
  return ring;
}
