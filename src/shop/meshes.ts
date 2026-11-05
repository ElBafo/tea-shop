import { isSecondEdition } from "../game/mode";
import { buildEditionItem, buildEditionKeeper, decorateEditionRoom, editionFloorMaterial, editionReadingNook, editionArtIds } from "./edition-art";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ShopState, UpgradeId } from "../game/types";
import { C } from "./palette";
import {
  decorTexture,
  marbleTexture,
  plasterTexture,
  rugTexture,
  signTexture,
  woodTexture,
} from "./textures";
import { canPlace, floorCenter, wallCenter } from "./grid";
import { UPGRADE_BY_ID, placeOf, styleOf, kindOf } from "./upgrades";

export interface ShopVisuals {
  wallStyleKey?: string;
  wallFinish?: TransformNode;
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
  material.maxSimultaneousLights = 5;
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
    mesh.metadata = { ...mesh.metadata, upgradeId: id };
  });
}

function teapot(scene: Scene, parent: TransformNode, mats: { body: StandardMaterial; lid: StandardMaterial }, x: number, y: number, z: number): void {
  const pot = new TransformNode("teapot", scene);
  pot.parent = parent;
  pot.position.set(x, y, z);
  pot.scaling.setAll(1.35);
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
  const wood = woodTexture(scene, "#d7b48a", "#9a7048", "floor-wood");
  wood.uScale = 6;
  wood.vScale = 6;
  const shabbyPlaster = plasterTexture(scene, "#e4d4c0", "shabby-wall");
  shabbyPlaster.uScale = 2;
  shabbyPlaster.vScale = 1.2;

  const floorMat = paint(scene, "floor", "#d7b48a", { tex: wood });
  const wallMat = paint(scene, "wall-shabby", "#e4d4c0", { tex: shabbyPlaster });
  const trimMat = paint(scene, "trim", C.woodDeep);
  const glassMat = paint(scene, "glass", "#9eb6c4", { spec: 0.45, alpha: 0.32 });
  const stainMat = paint(scene, "stain", "#b79a80");
  const skyMat = paint(scene, "sky", "#f7e6c4", { emit: "#f3d7a0" });
  const frameMat = paint(scene, "frame", "#fff6ee");

  const room = new TransformNode("room", scene);
  const floor = box(scene, "floor", 6.2, 0.1, 6.2, room, floorMat, 3, -0.05, 3);
  floor.metadata = { ground: true };
  const backWall = box(scene, "back-wall", 6.2, 3.25, 0.12, room, wallMat, 3, 1.62, -0.06);
  const leftWall = box(scene, "left-wall", 0.12, 3.25, 6.2, room, wallMat, -0.06, 1.62, 3);
  box(scene, "base-back", 6.2, 0.2, 0.1, room, trimMat, 3, 0.1, 0.06);
  box(scene, "base-left", 0.1, 0.2, 6.2, room, trimMat, 0.06, 0.1, 3);
  box(scene, "cornice-back", 6.2, 0.12, 0.1, room, trimMat, 3, 3.2, 0.06);
  box(scene, "cornice-left", 0.1, 0.12, 6.2, room, trimMat, 0.06, 3.2, 3);

  box(scene, "sky", 1.72, 1.55, 0.04, room, skyMat, 4.85, 1.92, 0.015);
  box(scene, "win-sill", 1.9, 0.1, 0.36, room, frameMat, 4.85, 1.1, 0.16);
  box(scene, "win-top", 1.9, 0.1, 0.12, room, frameMat, 4.85, 2.72, 0.04);
  box(scene, "win-l", 0.12, 1.62, 0.12, room, frameMat, 3.96, 1.91, 0.04);
  box(scene, "win-r", 0.12, 1.62, 0.12, room, frameMat, 5.74, 1.91, 0.04);
  box(scene, "win-bar-h", 1.66, 0.06, 0.06, room, frameMat, 4.85, 1.91, 0.05);
  box(scene, "win-bar-v", 0.06, 1.5, 0.06, room, frameMat, 4.85, 1.91, 0.05);
  const glass = box(scene, "win-glass", 1.66, 1.5, 0.03, room, glassMat, 4.85, 1.91, 0.02);

  const stain = new TransformNode("stains", scene);
  stain.parent = room;
  box(scene, "stain-a", 0.95, 1.15, 0.03, stain, stainMat, 1.55, 2.05, 0.02);
  box(scene, "stain-b", 0.55, 0.7, 0.03, stain, stainMat, 0.02, 1.85, 2.55);
  box(scene, "ghost-sign", 1.6, 0.55, 0.03, stain, paint(scene, "ghost", "#c4aa90"), 2.35, 2.55, 0.02);
  box(scene, "crack", 0.04, 1.3, 0.03, stain, paint(scene, "crack", "#a88870"), 0.7, 1.7, 0.02);

  const curtains = new TransformNode("curtains", scene);
  curtains.parent = room;
  curtains.setEnabled(false);
  const curtainMat = paint(scene, "curtain", C.blush);
  box(scene, "curtain-l", 0.36, 1.7, 0.08, curtains, curtainMat, 3.98, 1.9, 0.14);
  box(scene, "curtain-r", 0.36, 1.7, 0.08, curtains, curtainMat, 5.72, 1.9, 0.14);
  box(scene, "curtain-rod", 2.05, 0.06, 0.06, curtains, paint(scene, "rod", C.woodDeep), 4.85, 2.8, 0.14);

  let wallFinish: TransformNode | undefined;
  if (isSecondEdition) { floorMat.dispose(false,true); floor.material=editionFloorMaterial(scene); wallFinish=decorateEditionRoom(scene,room); }
  return { floor, backWall, leftWall, glass, curtains, stain, wallFinish, items: {} };
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

// Each rebuilt visual owns every material it creates, including variant-only
// materials that may not end up attached to a mesh. Nothing is shared with other items.
function ownedVisual(scene: Scene, build: () => TransformNode): TransformNode {
  const existing = new Set(scene.materials);
  const root = build();
  const materials = scene.materials.filter(material => !existing.has(material));
  root.onDisposeObservable.add(() => {
    for (const material of materials) material.dispose(false, true);
  });
  return root;
}

export function buildItem(scene: Scene, id: UpgradeId, shop: ShopState): TransformNode {
  return ownedVisual(scene, () => buildItemMeshes(scene, id, shop));
}

function buildItemMeshes(scene: Scene, id: UpgradeId, shop: ShopState): TransformNode {
  const kind = kindOf(id);
  if (kind !== id) {
    const instanceShop: ShopState = {
      ...shop,
      style: {...shop.style, [kind]: styleOf(shop, id)},
      place: {...shop.place, [kind]: placeOf(shop, id)},
    };
    const root = buildItemMeshes(scene, kind, instanceShop);
    root.name = id;
    tag(root, id);
    return root;
  }
  const style = styleOf(shop, id);
  if (isSecondEdition && editionArtIds.includes(id) && id !== "paint") return buildEditionItem(scene,id,shop,style);
  if (id === "terrarium" || id === "botanical" || id === "cabinet") return buildConservatory(scene, shop, id, style);
  if (id === "armchair" || id === "fountain") return buildSignature(scene, shop, id, style);
  if (id === "counter") return buildCounter(scene, shop, style);
  if (id === "sign") return buildSign(scene, shop, style);
  if (id === "shelves") return buildShelves(scene, shop, style);
  if (id === "plant") return buildPlant(scene, shop, style);
  if (id === "rug") return buildRug(scene, shop, style);
  if (id === "lamp") return buildLamp(scene, shop, style);
  if (id === "table") return buildTable(scene, shop, style);
  if (id === "art" || id === "clock") return buildWallDecor(scene, shop, id, style);
  if (id === "bench") return buildBench(scene, shop, style);
  if (id === "trolley") return buildTrolley(scene, shop, style);
  if (id === "planter") return buildPlanter(scene, shop, style);
  if (id === "basket") return buildBasket(scene, shop, style);
  return new TransformNode("empty", scene);
}

function buildCounter(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("counter", scene);
  const owned = shop.owned.includes("counter");
  const bodyHex = owned ? [C.wood, C.ceramic, C.blush][style] ?? C.wood : "#9a8470";
  const topHex = owned ? [C.woodDeep, C.marble, C.foam][style] ?? C.woodDeep : "#7a6554";
  const body = paint(scene, "counter-body", bodyHex);
  const top = paint(
    scene,
    "counter-top",
    topHex,
    style === 1 && owned ? { tex: marbleTexture(scene), spec: 0.38 } : { spec: owned ? 0.2 : 0.06 },
  );
  box(scene, "counter-box", 3.05, 1.08, 1.05, root, body, 0, 0.54, 0.04);
  box(scene, "counter-top", 3.16, 0.1, 1.14, root, top, 0, 1.12, 0.04);
  box(scene, "counter-kick", 3.05, 0.12, 0.08, root, paint(scene, "kick", C.woodDeep), 0, 0.06, 0.54);
  if (!owned) {
    const stain = paint(scene, "counter-stain", "#5c4a3c");
    box(scene, "dust-a", 0.85, 0.04, 0.36, root, stain, -0.7, 1.18, 0.12);
    box(scene, "dust-b", 0.5, 0.04, 0.26, root, stain, 0.9, 1.18, -0.12);
    box(scene, "rag", 0.34, 0.05, 0.22, root, paint(scene, "rag", "#c4b49a"), 0.2, 1.18, 0.22);
  } else {
    teapot(
      scene,
      root,
      {
        body: paint(scene, "tea-body", C.blush),
        lid: paint(scene, "tea-lid", C.woodDeep),
      },
      -1.05,
      1.16,
      0.08,
    );
    addSteam(scene, root, -1.05, 1.63, 0.08);
    const panel = paint(scene, "counter-panel", C.foam);
    for (const x of [-0.95, 0, 0.95]) {
      box(scene, "panel", 0.78, 0.65, 0.025, root, panel, x, 0.58, 0.58);
      box(scene, "panel-inset", 0.66, 0.53, 0.03, root, body, x, 0.58, 0.60);
    }
    for (const [i, hex] of [C.leaf, C.gold, C.blush].entries()) {
      const tin = paint(scene, `counter-tin-${i}`, hex);
      cyl(scene, "tea-tin", 0.3, 0.12, root, tin, -0.35 + i * 0.3, 1.34, -0.2);
      cyl(scene, "tin-cap", 0.04, 0.13, root, panel, -0.35 + i * 0.3, 1.51, -0.2);
    }
    const cup = paint(scene, "counter-cup", C.foam);
    cyl(scene, "cup", 0.12, 0.08, root, cup, 0.95, 1.24, 0.16);
    box(scene, "saucer", 0.24, 0.03, 0.24, root, paint(scene, "saucer", C.ceramic), 0.95, 1.18, 0.16);
  }
  placeFloorItem(root, "counter", shop);
  tag(root, "counter");
  return root;
}

function buildSign(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("sign", scene);
  const board = paint(scene, "sign-board", C.woodDeep);
  const hardware = paint(scene, "sign-hw", C.woodDeep);
  box(scene, "sign-board", 1.95, 0.86, 0.1, root, board, 0, 0, 0);
  const face = MeshBuilder.CreatePlane("sign-lettering", { width: 1.85, height: 0.76 }, scene);
  face.parent = root;
  face.position.z = 0.056;
  face.rotation.y = Math.PI;
  face.material = paint(scene, "sign-lettering", "#ffffff", { tex: signTexture(scene, style) });
  cyl(scene, "sign-hook-l", 0.16, 0.03, root, hardware, -0.62, 0.44, 0);
  cyl(scene, "sign-hook-r", 0.16, 0.03, root, hardware, 0.62, 0.44, 0);
  placeWallItem(root, "sign", shop);
  tag(root, "sign");
  return root;
}

function buildShelves(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("shelves", scene);
  const woodHex = [C.wood, C.foam, C.woodDeep][style] ?? C.wood;
  const board = paint(scene, "shelf-board", woodHex);
  box(scene, "shelf-top", 2.85, 0.1, 0.42, root, board, 0, 0.34, 0.16);
  box(scene, "shelf-bot", 2.85, 0.1, 0.42, root, board, 0, -0.28, 0.16);
  box(scene, "shelf-l", 0.1, 0.86, 0.42, root, board, -1.38, 0.03, 0.16);
  box(scene, "shelf-r", 0.1, 0.86, 0.42, root, board, 1.38, 0.03, 0.16);
  const tins = [C.blush, C.gold, C.leaf, "#8ea0b5", "#e0a06e", "#c9b4dc"];
  tins.forEach((hex, i) => {
    const shelf = i < 3 ? 0.5 : -0.12;
    const x = -0.85 + (i % 3) * 0.85;
    cyl(scene, `tin-${i}`, 0.28, 0.16, root, paint(scene, `tin-${i}`, hex), x, shelf, 0.16, 8);
    cyl(scene, `tin-lid-${i}`, 0.05, 0.17, root, paint(scene, `tin-lid-${i}`, C.foam), x, shelf + 0.16, 0.16, 8);
  });
  placeWallItem(root, "shelves", shop);
  root.position.y = 1.85;
  tag(root, "shelves");
  return root;
}

function buildPlant(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("plant", scene);
  const potHex = [C.pot, C.potSage, C.potBlush][style] ?? C.pot;
  const pot = paint(scene, "pot", potHex);
  cyl(scene, "pot", 0.3, 0.22, root, pot, 0, 0.16, 0, 8);
  cyl(scene, "soil", 0.05, 0.18, root, paint(scene, "soil", C.soil), 0, 0.31, 0, 8);
  const leaf = paint(scene, "leaf", C.leaf);
  const deep = paint(scene, "leaf-deep", C.leafDeep);
  if (style === 1) {
    sphere(scene, "suc-c", 0.14, root, leaf, 0, 0.48, 0);
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      sphere(scene, `suc-${i}`, 0.1, root, deep, Math.cos(a) * 0.14, 0.42, Math.sin(a) * 0.14);
    }
  } else if (style === 2) {
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      const frond = box(scene, `leaf-${i}`, 0.12, 0.4, 0.05, root, i % 2 ? leaf : deep, Math.cos(a) * 0.08, 0.52, Math.sin(a) * 0.08);
      frond.rotation.z = Math.cos(a) * 0.4;
      frond.rotation.x = Math.sin(a) * 0.35;
    }
    const bloom = paint(scene, "bloom", C.bloom);
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      sphere(scene, `bloom-${i}`, 0.07, root, bloom, Math.cos(a) * 0.1, 0.7, Math.sin(a) * 0.1);
    }
  } else {
    for (let i = 0; i < 7; i += 1) {
      const a = (i / 7) * Math.PI * 2;
      const frond = box(scene, `fern-${i}`, 0.1, 0.5, 0.04, root, i % 2 ? leaf : deep, Math.cos(a) * 0.07, 0.56, Math.sin(a) * 0.07);
      frond.rotation.z = Math.cos(a) * 0.55;
      frond.rotation.x = Math.sin(a) * 0.45;
    }
  }
  root.scaling.setAll(1.25);
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
  box(scene, "rug", 2.9, 0.05, 1.9, root, mat, 0, 0.04, 0);
  const fringe = paint(scene, "rug-fringe", C.foam);
  for (let i = 0; i < 14; i++) {
    for (const z of [-0.99, 0.99]) {
      box(scene, "fringe", 0.045, 0.025, 0.13, root, fringe, -1.3 + i * 0.2, 0.04, z);
    }
  }
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
  cyl(scene, "lamp-base", 0.08, 0.2, root, metal, 0, 0.05, 0, 8);
  cyl(scene, "lamp-pole", 1.05, 0.04, root, metal, 0, 0.58, 0, 8);
  if (style === 0) {
    box(scene, "lantern", 0.42, 0.42, 0.42, root, shade, 0, 1.28, 0);
  } else if (style === 1) {
    const cone = MeshBuilder.CreateCylinder("shade", { height: 0.34, diameterTop: 0.16, diameterBottom: 0.52, tessellation: 10 }, scene);
    cone.parent = root;
    cone.position.set(0, 1.28, 0);
    cone.material = shade;
  } else {
    sphere(scene, "ceramic-base", 0.2, root, paint(scene, "cer-base", C.ceramic), 0, 0.2, 0);
    cyl(scene, "shade", 0.32, 0.26, root, shade, 0, 1.26, 0, 10);
  }
  const bulb = sphere(scene, "lamp-bulb", 0.07, root, glow, 0, 1.12, 0);
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
  const china = paint(scene, "table-china", C.foam);
  const tea = paint(scene, "table-tea", C.woodDeep);
  for (const x of [-0.32, 0.32]) {
    cyl(scene, "tea-saucer", 0.025, 0.16, root, china, x, 0.64, 0.08);
    cyl(scene, "tea-cup", 0.14, 0.1, root, china, x, 0.72, 0.08);
    cyl(scene, "tea-surface", 0.01, 0.078, root, tea, x, 0.795, 0.08);
  }
  const cake = paint(scene, "macaron", C.blush);
  cyl(scene, "cake-plate", 0.025, 0.18, root, china, 0, 0.64, -0.25);
  for (const x of [-0.075, 0.075]) {
    sphere(scene, "macaron", 0.075, root, cake, x, 0.71, -0.25).scaling.y = 0.65;
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
  return ownedVisual(scene, () => isSecondEdition ? buildEditionKeeper(scene) : buildCustomerMeshes(scene));
}

function buildCustomerMeshes(scene: Scene): TransformNode {
  const root = new TransformNode("shopkeeper", scene);
  const coat = paint(scene, "coat", C.coat);
  const skin = paint(scene, "skin", C.skin);
  const hair = paint(scene, "hair", C.hair);
  cyl(scene, "body", 0.62, 0.18, root, coat, 0, 0.62, 0, 8);
  sphere(scene, "head", 0.16, root, skin, 0, 1.08, 0.02);
  sphere(scene, "hair", 0.165, root, hair, 0, 1.16, -0.02);
  cyl(scene, "arm-l", 0.34, 0.05, root, coat, -0.22, 0.66, 0.04, 6);
  cyl(scene, "arm-r", 0.34, 0.05, root, coat, 0.22, 0.66, 0.04, 6);
  box(scene, "apron", 0.25, 0.4, 0.04, root, paint(scene, "apron", C.foam), 0, 0.65, 0.17);
  const eyes = paint(scene, "eyes", C.hair);
  sphere(scene, "eye-l", 0.018, root, eyes, -0.055, 1.09, 0.165);
  sphere(scene, "eye-r", 0.018, root, eyes, 0.055, 1.09, 0.165);
  const blush=paint(scene,"cheeks","#d99785");
  for(const x of [-.105,.105]) sphere(scene,"cheek",.028,root,blush,x,1.035,.16).scaling.z=.35;
  box(scene,"apron-pocket",.12,.1,.012,root,coat,0,.62,.195);
  for(const x of [-.22,.22]) sphere(scene,"hand",.065,root,skin,x,.49,.07);
  sphere(scene,"hair-bun",.09,root,hair,0,1.25,-.12);
  root.scaling.setAll(1.22);
  return root;
}

export function applyRoomStyle(visuals: ShopVisuals, shop: ShopState, scene: Scene): void {
  const painted = shop.owned.includes("paint");
  const style = styleOf(shop, "paint");
  const hex = isSecondEdition ? (painted ? ["#eadfcd","#bccbb9","#dcbab0"][style] : "#ded3c0") : painted ? [C.creamWall, C.sageWall, C.roseWall][style] ?? C.creamWall : C.plaster;
  const key = `${painted}:${style}`;
  if (visuals.wallStyleKey !== key) {
    const wallTex = plasterTexture(scene, hex, `wall-${painted ? style : "bare"}`);
    wallTex.uScale = 2;
    wallTex.vScale = 1.2;
    const wallMat = paint(scene, `wall-live-${hex}`, isSecondEdition ? "#ffffff" : hex, { tex: wallTex });
    const previous = visuals.backWall.material;
    visuals.backWall.material = wallMat;
    visuals.leftWall.material = wallMat;
    previous?.dispose(false, true);
    visuals.wallStyleKey = key;
  }
  const glass = visuals.glass.material as StandardMaterial;
  glass.diffuseColor = Color3.FromHexString(painted ? C.glass : C.dirtyGlass);
  glass.alpha = painted ? 0.28 : 0.42;
  visuals.curtains.setEnabled(painted);
  visuals.wallFinish?.setEnabled(painted);
  visuals.stain.setEnabled(!painted && !isSecondEdition);
}

export function collectMeshes(root: TransformNode): AbstractMesh[] {
  return root.getChildMeshes();
}

export function itemKey(id: UpgradeId, shop: ShopState): string {
  const place = placeOf(shop, id);
  return `${id}:${shop.owned.includes(id)}:${styleOf(shop, id)}:${place.x}:${place.z}:${place.rot}:${place.wall ?? ""}${isSecondEdition && id === "table" ? `:nook-${editionReadingNook(shop)}` : ""}`;
}

const originalEmission = new WeakMap<StandardMaterial, Color3>();

export function setItemTint(root: TransformNode, hex: string | null): void {
  root.getChildMeshes().forEach((mesh) => {
    const material = mesh.material;
    if (!(material instanceof StandardMaterial)) return;
    if (!originalEmission.has(material)) originalEmission.set(material, material.emissiveColor.clone());
    material.emissiveColor = hex ? Color3.FromHexString(hex).scale(0.28) : originalEmission.get(material)!.clone();
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

function buildWallDecor(scene: Scene, shop: ShopState, id: "art" | "clock", style: number): TransformNode {
  const root = new TransformNode(id, scene);
  const frame = paint(scene, `${id}-frame`, id === "art" ? C.woodDeep : [C.wood, C.leaf, C.blush][style]);
  if (id === "art") box(scene, "print-frame", 0.8, 0.9, 0.1, root, frame);
  else {
    const rim = cyl(scene, "clock-rim", 0.1, 0.4, root, frame);
    rim.rotation.x = Math.PI / 2;
  }
  const face = MeshBuilder.CreatePlane(`${id}-face`, {width: id === "art" ? 0.7 : 0.72, height: id === "art" ? 0.8 : 0.72}, scene);
  face.parent = root;
  face.position.z = 0.056;
  face.rotation.y = Math.PI;
  const tex = decorTexture(scene, id, style);
  tex.hasAlpha = id === "clock";
  face.material = paint(scene, `${id}-face`, "#ffffff", {tex});
  placeWallItem(root, id, shop);
  tag(root, id);
  return root;
}

function buildBasket(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("basket", scene);
  const wicker = paint(scene, "basket-wicker", C.wood);
  cyl(scene, "basket-body", 0.32, 0.34, root, wicker, 0, 0.18, 0, 16);
  const edge = paint(scene, "basket-weave", C.woodDeep);
  for (let i = 0; i < 5; i++) {
    const ring = MeshBuilder.CreateTorus("basket-weave", {diameter: 0.67, thickness: 0.025, tessellation: 16}, scene);
    ring.parent = root; ring.position.y = 0.06 + i * 0.07; ring.material = edge;
  }
  const sage = paint(scene, "basket-sage", C.mint);
  const rose = paint(scene, "basket-rose", C.blush);
  if (style === 0) {
    box(scene, "blanket", 0.48, 0.12, 0.4, root, sage, 0, 0.38, 0);
    box(scene, "blanket-fold", 0.4, 0.1, 0.35, root, rose, 0.04, 0.49, 0);
  } else if (style === 1) {
    sphere(scene, "yarn", 0.16, root, sage, -0.12, 0.38, 0.02);
    sphere(scene, "yarn", 0.15, root, rose, 0.13, 0.4, -0.03);
    sphere(scene, "yarn", 0.12, root, paint(scene, "yarn-cream", C.foam), 0, 0.53, 0.02);
  } else {
    for (let i = 0; i < 3; i++) {
      const book = box(scene, "book", 0.12, 0.48, 0.35, root, i % 2 ? rose : sage, -0.16 + i * 0.16, 0.4, 0);
      book.rotation.z = (i - 1) * 0.12;
    }
  }
  placeFloorItem(root, "basket", shop);
  tag(root, "basket");
  return root;
}

function buildBench(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("bench", scene);
  const frame = paint(scene, "bench-frame", [C.wood, C.leaf, C.brass][style]);
  const fabric = paint(scene, "bench-fabric", [C.mint, C.blush, C.roseWall][style]);
  const cream = paint(scene, "bench-pillow", C.foam);
  for (const x of [-0.72, 0.72]) for (const z of [-0.28, 0.28]) {
    box(scene, "bench-leg", 0.1, 0.38, 0.1, root, frame, x, 0.19, z);
  }
  box(scene, "bench-seat", 1.8, 0.13, 0.8, root, frame, 0, 0.43);
  if (style === 1) {
    for (const y of [0.7, 0.9]) box(scene, "bench-slat", 1.8, 0.12, 0.08, root, frame, 0, y, -0.34);
    for (const x of [-0.8, 0.8]) box(scene, "bench-post", 0.08, 0.6, 0.1, root, frame, x, 0.72, -0.34);
    box(scene, "bench-cushion", 0.58, 0.13, 0.58, root, fabric, 0.4, 0.56);
  } else {
    box(scene, "bench-cushion", 1.72, 0.2, 0.72, root, fabric, 0, 0.55);
    box(scene, "bench-back", 1.74, 0.45, 0.18, root, style === 2 ? fabric : frame, 0, 0.8, -0.31);
    for (const x of [-0.81, 0.81]) {
      const arm = sphere(scene, "bench-rounded-arm", 0.19, root, fabric, x, 0.7);
      arm.scaling.z = 1.8;
    }
    const pillow = box(scene, "bench-pillow", 0.4, 0.35, 0.15, root, cream, -0.44, 0.76, -0.15);
    pillow.rotation.z = -0.14;
    if (style === 0) {
      box(scene, "bench-book", 0.34, 0.055, 0.27, root, paint(scene,"bench-book",C.blush), 0.42, 0.68, 0.12);
      box(scene, "bench-pages", 0.31, 0.025, 0.25, root, cream, 0.42, 0.685, 0.12);
    } else {
      for (const x of [-0.4, 0, 0.4]) sphere(scene, "bench-button", 0.035, root, frame, x, 0.84, -0.205);
    }
  }
  placeFloorItem(root, "bench", shop); tag(root, "bench"); return root;
}

function buildTrolley(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("trolley", scene);
  const frame = paint(scene, "trolley-frame", [C.brass, C.mint, C.woodDeep][style]);
  const china = paint(scene, "trolley-china", C.foam);
  const accent = paint(scene, "trolley-accent", C.blush);
  const rubber = paint(scene, "trolley-wheels", C.hair);
  for (const x of [-0.32, 0.32]) for (const z of [-0.3, 0.3]) {
    const wheel = cyl(scene, "trolley-wheel", 0.07, 0.1, root, rubber, x, 0.11, z);
    wheel.rotation.z = Math.PI / 2;
    box(scene, "trolley-upright", 0.055, 0.7, 0.055, root, frame, x, 0.48, z);
  }
  for (const y of [0.28, 0.76]) box(scene, "trolley-tray", 0.8, 0.06, 0.75, root, frame, 0, y);
  box(scene, "trolley-handle", 0.06, 0.06, 0.67, root, frame, 0.4, 0.95);
  for (const z of [-0.29, 0.29]) box(scene,"trolley-handle-post",0.05,0.18,0.05,root,frame,0.36,0.87,z);
  if (style === 0) {
    addSteam(scene, root, -0.12, 1.16, 0);
    sphere(scene, "trolley-teapot", 0.17, root, china, -0.12, 0.96);
    cyl(scene, "trolley-lid", 0.03, 0.12, root, accent, -0.12, 1.11);
    const spout = cyl(scene,"trolley-spout",0.19,0.045,root,china,-0.31,1.0);
    spout.rotation.z = 0.8;
    const handle = MeshBuilder.CreateTorus("trolley-pot-handle",{diameter:0.23,thickness:0.04,tessellation:12},scene);
    handle.parent=root;handle.position.set(0.06,0.98,0);handle.rotation.x=Math.PI/2;handle.material=china;
    for (const z of [-0.2, 0.2]) cyl(scene,"trolley-cup",0.12,0.07,root,china,0.19,0.86,z);
    for (let i=0;i<3;i++) cyl(scene,"trolley-tea-tin",0.22,0.09,root,i%2?accent:china,-0.24+i*0.24,0.42);
  } else if (style === 1) {
    cyl(scene,"cake-stand",0.5,0.025,root,frame,0,1.02);
    for (const [y,r] of [[0.85,0.28],[1.12,0.2]]) {
      cyl(scene,"cake-tier",0.035,r,root,china,0,y);
      for(let i=0;i<3;i++) {
        const angle=i*Math.PI*2/3;
        const x=Math.cos(angle)*r*0.6,z=Math.sin(angle)*r*0.6;
        cyl(scene,"tiny-cake",0.09,0.065,root,accent,x,y+0.06,z);
        sphere(scene,"cake-icing",0.067,root,china,x,y+0.105,z).scaling.y=0.5;
      }
    }
    box(scene,"trolley-napkins",0.38,0.09,0.34,root,china,0,0.36);
  } else {
    for (const y of [0.36,0.84]) for(let i=0;i<3;i++) {
      box(scene,"cart-book",0.45,0.065,0.37,root,i%2?accent:frame,0,y+i*0.075);
      box(scene,"cart-pages",0.42,0.035,0.36,root,china,0,y+i*0.075);
    }
  }
  placeFloorItem(root, "trolley", shop); tag(root, "trolley"); return root;
}

function buildPlanter(scene: Scene, shop: ShopState, style: number): TransformNode {
  const root = new TransformNode("planter", scene);
  const pot = paint(scene,"planter-pot",["#bc7755",C.foam,"#7a9da9"][style]);
  const soil = paint(scene,"planter-soil",C.woodDeep);
  const trunk = paint(scene,"planter-trunk",style===1?C.leaf:C.wood);
  const leaf = paint(scene,"planter-leaves",style===0?"#91a77b":C.leaf);
  if(style===1) box(scene,"planter-box",0.65,0.45,0.65,root,pot,0,0.25);
  else cyl(scene,"planter-pot",0.48,0.34,root,pot,0,0.26,0,16);
  cyl(scene,"planter-soil",0.02,0.29,root,soil,0,0.5);
  if(style===1) {
    for(const [x,z,h] of [[-0.16,0.08,1.2],[0.15,0,1.5],[0,-0.16,1.35]]) {
      cyl(scene,"bamboo-stem",h,0.035,root,trunk,x,0.5+h/2,z);
      for(let j=0;j<3;j++) {
        const sprig=sphere(scene,"bamboo-leaf",0.13,root,leaf,x+(j%2?-.13:.13),0.95+j*0.27,z);
        sprig.scaling.set(1.7,0.35,0.55);sprig.rotation.z=j%2?0.45:-0.45;
      }
    }
  } else {
    cyl(scene,"tree-trunk",1.15,0.055,root,trunk,0,1.0);
    for(const [x,y,z,r] of [[0,1.75,0,.3],[-.21,1.52,0,.24],[.2,1.58,.06,.25],[0,1.52,-.18,.24]]) {
      const crown=sphere(scene,"tree-crown",r,root,leaf,x,y,z);
      crown.scaling.y=style===0?0.75:1;
    }
    if(style===2) {
      const fruit=paint(scene,"citrus-fruit",C.gold);
      for(const [x,y,z] of [[-.23,1.6,.18],[.21,1.7,.2],[.03,1.9,.16],[.25,1.45,.12],[-.03,1.4,.17]]) sphere(scene,"citrus",0.065,root,fruit,x,y,z);
    }
  }
  placeFloorItem(root, "planter", shop); tag(root, "planter"); return root;
}


function addSteam(scene: Scene, root: TransformNode, x: number, y: number, z: number): void {
  const material = paint(scene, "tea-steam", "#fff3dc", {alpha:0.35, emit:"#f7e7cc"});
  material.disableLighting = true;
  for (let i=0;i<3;i++) {
    const wisp = sphere(scene, "tea-steam", 0.055, root, material, x, y, z);
    wisp.isPickable = false;
    wisp.receiveShadows = false;
    wisp.metadata = {steam:{x,y,phase:i/3}};
  }
}

function buildConservatory(scene: Scene, shop: ShopState, id: "terrarium" | "botanical" | "cabinet", style: number): TransformNode {
  const root = new TransformNode(id, scene);
  const brass = paint(scene, "conservatory-brass", "#c6a464", {spec:.35});
  const frame = paint(scene, "conservatory-frame", ["#365e4e", "#334f6b", "#b77984"][style]);
  const china = paint(scene, "conservatory-china", ["#eee5c9", "#aacbd5", "#f4d4ca"][style]);
  if (id === "terrarium") {
    const gardenFrame = style === 0 ? brass : style === 1 ? china : frame;
    const foliage = paint(scene,"garden-foliage",style===1?"#71998a":"#63814b");
    const flower = paint(scene,"garden-flower","#e7a6b4");
    box(scene,"garden-plinth",.92,.18,.88,root,frame,0,.12,0);
    box(scene,"garden-earth",.82,.08,.76,root,paint(scene,"earth",style===1?"#dfc9a1":"#735443"),0,.25,0);
    for(const x of [-.43,.43]) for(const z of [-.39,.39]) {
      box(scene,"glasshouse-post",.045,.88,.045,root,gardenFrame,x,.69,z);
      const roof=box(scene,"roof-rib",.045,.64,.045,root,gardenFrame,x/2,1.27,z); roof.rotation.z=x>0?.74:-.74;
    }
    for(const y of [.27,1.12]) for(const z of [-.39,.39]) box(scene,"glasshouse-rail",.9,.045,.045,root,gardenFrame,0,y,z);
    box(scene,"glasshouse-ridge",.045,.045,.82,root,gardenFrame,0,1.5,0);
    const glass=paint(scene,"garden-glass","#c3d9ce",{alpha:.1,spec:.4});
    for(const x of [-.43,.43]) box(scene,"glass-pane",.012,.8,.76,root,glass,x,.7,0);
    if(style===1) {
      // A column cactus and a low round cactus read differently from leafy styles.
      const stem=sphere(scene,"column-cactus",.15,root,foliage,-.14,.69,0);stem.scaling.y=2.5;
      for(const side of [-1,1]) {
        const arm=sphere(scene,"cactus-arm",.09,root,foliage,-.14+side*.19,.64+side*.09,0);arm.scaling.y=1.7;
        box(scene,"cactus-join",.16,.1,.1,root,foliage,-.14+side*.1,.54+side*.09,0);
      }
      sphere(scene,"round-cactus",.19,root,foliage,.19,.46,.17);
      sphere(scene,"cactus-flower",.07,root,flower,.19,.66,.17);
      for(const x of [-.28,.25]) sphere(scene,"garden-pebble",.09,root,china,x,.33,-.23).scaling.y=.45;
    } else if(style===0) {
      for(const [i,x] of [-.2,.18].entries()) {
        cyl(scene,"fern-stem",.55,.03,root,foliage,x,.57,i*.18-.1);
        for(const side of [-1,1]) for(let tier=0;tier<3;tier++) {
          const leaf=sphere(scene,"fern-frond",.19,root,foliage,x+side*.1,.52+tier*.15,i*.18-.1);
          leaf.scaling.set(1,.3,.65);leaf.rotation.z=side*(.25+tier*.16);
        }
      }
      sphere(scene,"moss-mound",.2,root,foliage,0,.32,.18).scaling.y=.25;
    } else {
      for(const [i,x] of [-.23,.02,.23].entries()) {
        cyl(scene,"rose-stem",.43+i*.08,.035,root,foliage,x,.5,0);
        for(const side of [-1,1]) {
          const leaf=sphere(scene,"rose-leaf",.13,root,foliage,x+side*.07,.47,side*.13);leaf.scaling.set(1,.3,.7);
        }
        const bloom=sphere(scene,"rose-bloom",.17,root,flower,x,.74+i*.06,0);bloom.scaling.y=.8;
        sphere(scene,"rose-centre",.09,root,china,x,.83+i*.06,.03);
      }
    }
  } else if (id === "botanical") {
    const petal=paint(scene,"triptych-petal",style===2?"#c57e91":"#f4e7c8");
    for(const [i,x] of [-.62,0,.62].entries()) {
      const h=i===1?1.17:.95;
      box(scene,"triptych-frame",.58,h,.08,root,brass,x,0,0);
      box(scene,"triptych-panel",.5,h-.08,.025,root,style===2?china:frame,x,0,.055);
      box(scene,"botanical-stem",.035,.66,.035,root,brass,x,-.06,.095);
      if(style===0) {
        // Broad fan relief, instead of tiny repeated leaves.
        for(const [tier,side] of [[-.16,-1],[.08,1],[.3,0]]) {
          const leaf=sphere(scene,"ginkgo-fan",.2,root,brass,x+side*.065,tier,.13);
          leaf.scaling.set(1,.68,.24);leaf.rotation.z=side*.4;
        }
      } else if(style===1) {
        for(let n=0;n<5;n++) {
          const angle=n*Math.PI*2/5;
          const leaf=sphere(scene,"magnolia-petal",.15,root,petal,x+Math.sin(angle)*.1,.12+Math.cos(angle)*.12,.13);
          leaf.scaling.set(.65,1.25,.25);leaf.rotation.z=-angle;
        }
        sphere(scene,"magnolia-centre",.075,root,brass,x,.12,.17).scaling.z=.3;
      } else {
        for(const [dx,dy] of [[-.12,.04],[.1,.27],[.06,-.19]]) {
          const bloom=sphere(scene,"wildflower-head",.13,root,petal,x+dx,dy,.13);bloom.scaling.z=.3;
          sphere(scene,"wildflower-centre",.045,root,brass,x+dx,dy,.17).scaling.z=.3;
        }
      }
    }
  } else {
    box(scene,"cabinet-back",1.65,1.55,.13,root,frame,0,.95,-.32);
    for(const x of [-.78,.78]) box(scene,"cabinet-pillar",.1,1.65,.7,root,frame,x,.9,0);
    // Smooth open arches keep the crown readable without striped box segments.
    for(const z of [-.32,.32]) {
      const path=Array.from({length:25},(_,i)=>{const a=i*Math.PI/24;return new Vector3(Math.cos(a)*.76,1.7+Math.sin(a)*.35,z);});
      const arch=MeshBuilder.CreateTube('cabinet-arch',{path,radius:.055,tessellation:8},scene);arch.parent=root;arch.material=brass;
    }
    for(const y of [.2,.75,1.3]) {
      box(scene,"cabinet-shelf",1.65,.09,.72,root,china,0,y,0);
      box(scene,"shelf-gold",1.65,.035,.025,root,brass,0,y,.37);
    }
    for(const y of [.36,.91,1.46]) for(const x of [-.45,0,.45]) {
      cyl(scene,"porcelain-foot",.035,.12,root,brass,x,y-.07,.02);
      const vase=sphere(scene,"porcelain-vase",.15,root,china,x,y+.04,.02);vase.scaling.y=1.35;
      cyl(scene,"porcelain-neck",.09,.065,root,china,x,y+.24,.02);
    }
    for(const x of [-.66,.66]) cyl(scene,"cabinet-foot",.18,.06,root,brass,x,.09,0);
  }
  if(id === "botanical") placeWallItem(root,id,shop); else placeFloorItem(root,id,shop);
  tag(root,id);return root;
}

function buildSignature(scene: Scene, shop: ShopState, id: "armchair" | "fountain", style: number): TransformNode {
  const root = new TransformNode(id, scene);
  const brass = paint(scene,"signature-brass","#c6a464",{spec:.3});
  const oak = paint(scene,"signature-oak","#b88b60");
  const cream = paint(scene,"signature-cream","#eee3cb");
  if(id === "armchair") {
    const cloth=paint(scene,"chair-cloth",["#9caf92","#617d91","#d2b07e"][style]);
    const cushion=paint(scene,"chair-cushion",style===0?"#d6a5aa":"#eee3cb");
    for(const x of [-.31,.31]) for(const z of [-.28,.28]) cyl(scene,"chair-foot",.24,.045,root,oak,x,.12,z);
    box(scene,"chair-seat",.72,.2,.7,root,cloth,0,.38,0);
    if(style===0) {
      const back=sphere(scene,"cloud-back",.42,root,cloth,0,.8,-.26);back.scaling.set(1,1.1,.36);
      for(const x of [-.34,.34]) {const arm=sphere(scene,"cloud-arm",.18,root,cloth,x,.59,.02);arm.scaling.set(.6,.7,1.9);}
    } else if(style===1) {
      box(scene,"wingback",.66,.83,.16,root,cloth,0,.84,-.29);
      for(const x of [-.31,.31]) {
        const wing=box(scene,"chair-wing",.14,.61,.24,root,cloth,x,.94,-.17);wing.rotation.z=x>0?.12:-.12;
        box(scene,"chair-arm",.14,.13,.61,root,oak,x,.64,.04);
      }
    } else {
      for(const x of [-.33,.33]) {
        box(scene,"cane-upright",.07,.73,.07,root,oak,x,.64,-.3);
        box(scene,"cane-arm",.08,.08,.67,root,oak,x,.64,0);
      }
      for(const y of [.56,.73,.9]) box(scene,"cane-slat",.7,.09,.055,root,cloth,0,y,-.3);
      for(const x of [-.23,0,.23]) box(scene,"cane-weave",.055,.5,.055,root,cloth,x,.72,-.27);
      box(scene,"folded-throw",.26,.07,.52,root,paint(scene,"throw","#b57f8d"),.18,.53,.07);
    }
    const pillow=sphere(scene,"chair-pillow",.25,root,cushion,-.07,.65,-.12);pillow.scaling.set(1,.8,.34);pillow.rotation.z=.12;
  } else {
    const stone=paint(scene,"fountain-stone",["#e7dcc5","#9faeaa","#d3aaa7"][style]);
    const water=paint(scene,"fountain-water","#8bbdc2",{spec:.5});
    const bowl=(y:number,r:number)=>{
      cyl(scene,"basin-body",.15,r,root,stone,0,y,0,20);
      cyl(scene,"still-water",.025,r-.05,root,water,0,y+.087,0,20);
      const lip=MeshBuilder.CreateTorus("basin-rim",{diameter:r*2-.04,thickness:.07,tessellation:24},scene);lip.parent=root;lip.position.y=y+.09;lip.material=stone;
    };
    cyl(scene,"fountain-foot",.13,.3,root,stone,0,.075,0,16);
    if(style===0) {
      cyl(scene,"fountain-pedestal",.65,.1,root,stone,0,.43,0,12);
      bowl(.41,.43);bowl(.94,.27);
      cyl(scene,"fountain-neck",.43,.07,root,brass,0,.7,0);
      sphere(scene,"fountain-finial",.09,root,brass,0,1.15,0);
    } else if(style===1) {
      bowl(.19,.44);
      for(const [n,x] of [-.06,.08,-.03].entries()) {
        const rock=sphere(scene,"river-stone",.25-n*.035,root,stone,x,.44+n*.24,0);rock.scaling.set(1.1,.6,.9);rock.rotation.y=n*.7;
      }
      // A small glazed water ribbon, without extra lights or an animation loop.
      box(scene,"water-ribbon",.055,.56,.025,root,water,.12,.65,.17);
    } else {
      cyl(scene,"lotus-pedestal",.43,.12,root,brass,0,.32,0);
      bowl(.54,.45);
      const leaf=paint(scene,"lily-leaf","#789b7c");
      for(const x of [-.19,.18]) cyl(scene,"lily-pad",.025,.14,root,leaf,x,.66,.04,12);
      for(let n=0;n<6;n++) {
        const a=n*Math.PI/3;
        const petal=sphere(scene,"lotus-petal",.14,root,cream,Math.sin(a)*.09,.73,Math.cos(a)*.09-.11);petal.scaling.set(.65,.4,1.15);petal.rotation.y=a;
      }
      sphere(scene,"lotus-heart",.06,root,brass,0,.78,-.11);
    }
  }
  placeFloorItem(root,id,shop);tag(root,id);return root;
}

export function placementMarkers(scene: Scene, id: UpgradeId, shop: ShopState): TransformNode {
  return ownedVisual(scene,()=>{
    const root=new TransformNode("placement-markers",scene);
    const mat=paint(scene,"placement-marker","#9cc985",{emit:"#9cc985"});
    const def=UPGRADE_BY_ID[id], rot=placeOf(shop,id).rot;
    const add=(x:number,y:number,z:number,wall=false)=>{
      const dot=box(scene,"legal-position",.12,wall?.12:.015,wall?.025:.12,root,mat,x,y,z);
      dot.isPickable=false;dot.receiveShadows=false;return dot;
    };
    if(def.surface==='wall') for(const wall of ['back','left'] as const) for(let x=0;x<6;x++) {
      const p={x,z:0,rot:wall==='left'?1:0,wall};
      if(canPlace(id,p,shop)) {const c=wallCenter(p,def.size.w);const dot=add(c.x,id==='shelves'?1.85:c.y,c.z,true);if(wall==='left')dot.rotation.y=Math.PI/2;}
    }
    if(def.surface==='floor') for(let x=0;x<6;x++) for(let z=0;z<6;z++) {
      const p={x,z,rot};if(canPlace(id,p,shop)){const c=floorCenter(def.size,p);add(c.x,.025,c.z);}
    }
    return root;
  });
}
