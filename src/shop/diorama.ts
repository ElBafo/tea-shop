import { Engine } from "@babylonjs/core/Engines/engine";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import "@babylonjs/core/Culling/ray";
import type { Ray } from "@babylonjs/core/Culling/ray";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Scene } from "@babylonjs/core/scene";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Placement, ShopState, UpgradeId } from "../game/types";
import { C } from "./palette";
import { sparkTexture } from "./textures";
import {
  applyRoomStyle,
  buildCustomer,
  buildItem,
  collectMeshes,
  createShopVisuals,
  itemKey,
  selectionRing,
  setItemTint,
  type ShopVisuals,
} from "./meshes";
import { canPlace, snapFloor, snapWall } from "./grid";
import { UPGRADE_BY_ID, placeOf } from "./upgrades";

export interface DioramaHooks {
  onSelect(id: UpgradeId | null): void;
  onMove(id: UpgradeId, place: Placement): void;
  onPlaced(id: UpgradeId): void;
}

interface Tween {
  node: TransformNode;
  from: number;
  to: number;
  t: number;
  dur: number;
  onDone?: () => void;
}

export class Diorama {
  readonly engine: Engine;
  readonly scene: Scene;
  private readonly camera: ArcRotateCamera;
  private readonly hemi: HemisphericLight;
  private readonly sun: DirectionalLight;
  private readonly lampLight: PointLight;
  private readonly shadows: ShadowGenerator;
  private readonly visuals: ShopVisuals;
  private readonly ring: ReturnType<typeof selectionRing>;
  private readonly sparkTex;
  private readonly hooks: DioramaHooks;
  private shop: ShopState;
  private keys: Partial<Record<UpgradeId, string>> = {};
  private edit = false;
  private selected: UpgradeId | null = null;
  private drag: {
    kind: "camera" | "item";
    pointerId: number;
    lastX: number;
    lastY: number;
    id?: UpgradeId;
    start?: Placement;
    moved?: boolean;
  } | null = null;
  private tweens: Tween[] = [];
  private customer: TransformNode | null = null;
  private walk: { from: Vector3; to: Vector3; t: number } | null = null;
  private warm = 0;
  private disposed = false;
  private readonly resizeObs: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, shop: ShopState, hooks: DioramaHooks) {
    this.hooks = hooks;
    this.shop = shop;
    this.engine = new Engine(canvas, true, { antialias: true, adaptToDeviceRatio: false, stencil: true }, true);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.engine.setHardwareScalingLevel(1 / dpr);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = Color4.FromColor3(Color3.FromHexString(C.cream), 1);
    this.scene.ambientColor = new Color3(0.55, 0.48, 0.42);

    this.camera = new ArcRotateCamera("iso", Math.PI / 4, 0.98, 24, new Vector3(3, 1.25, 3), this.scene);
    this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.camera.lowerAlphaLimit = Math.PI / 4 - 0.48;
    this.camera.upperAlphaLimit = Math.PI / 4 + 0.48;
    this.camera.lowerBetaLimit = 0.78;
    this.camera.upperBetaLimit = 1.12;
    this.camera.lowerRadiusLimit = 24;
    this.camera.upperRadiusLimit = 24;
    this.camera.inertia = 0.6;
    this.camera.panningSensibility = 0;
    this.fitOrtho();

    this.hemi = new HemisphericLight("hemi", new Vector3(0.25, 1, 0.35), this.scene);
    this.hemi.intensity = 0.95;
    this.hemi.diffuse = new Color3(1, 0.94, 0.88);
    this.hemi.groundColor = new Color3(0.62, 0.5, 0.42);

    this.sun = new DirectionalLight("sun", new Vector3(-0.28, -0.72, 0.5), this.scene);
    this.sun.position = new Vector3(8.2, 7.4, -1.2);
    this.sun.intensity = 0.92;
    this.sun.diffuse = new Color3(1, 0.93, 0.78);

    this.lampLight = new PointLight("lamp-light", new Vector3(0.4, 1.4, 5.2), this.scene);
    this.lampLight.intensity = 0;
    this.lampLight.diffuse = new Color3(1, 0.8, 0.55);
    this.lampLight.range = 7;

    this.shadows = new ShadowGenerator(512, this.sun);
    this.shadows.usePercentageCloserFiltering = true;
    this.shadows.filteringQuality = ShadowGenerator.QUALITY_LOW;
    this.shadows.setDarkness(0.38);
    this.shadows.transparencyShadow = false;

    this.visuals = createShopVisuals(this.scene);
    this.visuals.floor.receiveShadows = true;
    this.visuals.backWall.receiveShadows = true;
    this.visuals.leftWall.receiveShadows = true;
    this.ring = selectionRing(this.scene);
    this.sparkTex = sparkTexture(this.scene);

    this.sync(shop, { quiet: true });
    if (shop.finaleSeen) {
      this.warm = 1;
      this.spawnCustomer(true);
    }

    this.scene.onPointerObservable.add((info) => {
      const event = info.event as PointerEvent;
      this.onPointer(info.type, event);
    });
    this.engine.runRenderLoop(() => this.tick());
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    canvas.addEventListener("pointercancel", this.cancelDrag);
    canvas.addEventListener("lostpointercapture", this.cancelDrag);
    window.addEventListener("resize", this.onWinResize);
    requestAnimationFrame(() => this.resize());
  }

  private readonly onWinResize = () => this.resize();

  setEditMode(on: boolean): void {
    this.edit = on;
    if (!on) {
      this.drag = null;
      this.select(null);
    }
    this.fitOrtho();
  }

  select(id: UpgradeId | null): void {
    this.selected = id;
    this.updateRing();
    this.hooks.onSelect(id);
  }

  selectedId(): UpgradeId | null {
    return this.selected;
  }

  sync(shop: ShopState, opts: { animate?: UpgradeId; quiet?: boolean } = {}): void {
    this.shop = shop;
    applyRoomStyle(this.visuals, shop, this.scene);
    const unique: UpgradeId[] = ["counter"];
    for (const id of shop.owned) {
      if (id !== "paint" && id !== "counter") unique.push(id);
    }

    for (const id of Object.keys(this.visuals.items) as UpgradeId[]) {
      if (!unique.includes(id)) {
        this.visuals.items[id]?.dispose();
        delete this.visuals.items[id];
        delete this.keys[id];
      }
    }

    for (const id of unique) {
      const key = itemKey(id, shop);
      if (this.keys[id] === key && this.visuals.items[id]) continue;
      this.visuals.items[id]?.dispose();
      const root = buildItem(this.scene, id, shop);
      this.visuals.items[id] = root;
      this.keys[id] = key;
      this.castShadows(root);
      if (opts.animate === id) this.popIn(root, id);
    }

    this.updateLamp();
    this.updateRing();
    if (shop.owned.includes("lamp")) this.warm = Math.max(this.warm, 0.25);
    if (opts.animate === "paint") this.sparkleAt(new Vector3(2.8, 1.7, 1.1));
  }

  playFinale(): void {
    this.spawnCustomer(false);
  }

  resize(): void {
    if (this.disposed) return;
    this.engine.resize();
    this.fitOrtho();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObs.disconnect();
    const canvas = this.engine.getRenderingCanvas();
    canvas?.removeEventListener("pointercancel", this.cancelDrag);
    canvas?.removeEventListener("lostpointercapture", this.cancelDrag);
    window.removeEventListener("resize", this.onWinResize);
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
  }

  private fitOrtho(): void {
    const aspect = this.engine.getRenderWidth() / Math.max(1, this.engine.getRenderHeight());
    // Fit both axes: a wide, short canvas must not crop the roof or floor.
    const halfW = Math.max(4.65, 3.8 * aspect);
    this.camera.orthoLeft = -halfW;
    this.camera.orthoRight = halfW;
    this.camera.orthoTop = halfW / aspect;
    this.camera.orthoBottom = -halfW / aspect;
  }

  private castShadows(root: TransformNode): void {
    collectMeshes(root).forEach((mesh) => {
      this.shadows.addShadowCaster(mesh);
      mesh.receiveShadows = true;
    });
  }

  private popIn(root: TransformNode, id: UpgradeId): void {
    root.scaling.setAll(0.02);
    this.tweens.push({
      node: root,
      from: 0.02,
      to: 1,
      t: 0,
      dur: 0.42,
      onDone: () => this.sparkle(root),
    });
    this.hooks.onPlaced(id);
  }

  private sparkle(root: TransformNode): void {
    this.sparkleAt(root.position.add(new Vector3(0, 0.6, 0)));
  }

  private sparkleAt(position: Vector3): void {
    const ps = new ParticleSystem("sparkle", 28, this.scene);
    ps.particleTexture = this.sparkTex;
    ps.emitter = position.clone();
    ps.minSize = 0.05;
    ps.maxSize = 0.14;
    ps.minLifeTime = 0.25;
    ps.maxLifeTime = 0.5;
    ps.emitRate = 80;
    ps.minEmitPower = 0.4;
    ps.maxEmitPower = 1.1;
    ps.gravity = new Vector3(0, 0.6, 0);
    ps.color1 = Color4.FromColor3(Color3.FromHexString(C.gold), 1);
    ps.color2 = Color4.FromColor3(Color3.FromHexString(C.foam), 1);
    ps.colorDead = new Color4(1, 1, 1, 0);
    ps.targetStopDuration = 0.35;
    ps.disposeOnStop = true;
    ps.start();
  }

  private updateLamp(): void {
    const lamp = this.visuals.items.lamp;
    if (!lamp || !this.shop.owned.includes("lamp")) {
      this.lampLight.intensity = 0;
      return;
    }
    const bulb = lamp.getChildMeshes().find((mesh) => mesh.name === "lamp-bulb");
    const pos = bulb ? bulb.getAbsolutePosition() : lamp.position.clone();
    this.lampLight.position.copyFrom(pos);
    this.lampLight.intensity = 0.55 + this.warm * 0.25;
  }

  private updateRing(): void {
    const id = this.selected;
    const root = id ? this.visuals.items[id] : null;
    if (!id || !root || !this.edit) {
      this.ring.setEnabled(false);
      return;
    }
    this.ring.setEnabled(true);
    this.ring.position.copyFrom(root.position);
    this.ring.position.y = 0.04;
    const def = UPGRADE_BY_ID[id];
    this.ring.scaling.setAll(def.size.w > 1 || def.size.d > 1 ? 1.45 : 0.85);
  }

  private spawnCustomer(settled: boolean): void {
    if (this.customer) this.customer.dispose();
    this.customer = buildCustomer(this.scene);
    this.castShadows(this.customer);
    const start = new Vector3(5.4, 0, 5.6);
    const end = new Vector3(3.2, 0, 2.5);
    if (settled) {
      this.customer.position.copyFrom(end);
      this.customer.rotation.y = Math.PI;
      this.walk = null;
      return;
    }
    this.customer.position.copyFrom(start);
    this.walk = { from: start, to: end, t: 0 };
  }

  private tick(): void {
    const dt = this.engine.getDeltaTime() / 1000;
    this.tweens = this.tweens.filter((tween) => {
      tween.t += dt;
      const u = Math.min(1, tween.t / tween.dur);
      const ease = 1 - Math.pow(1 - u, 3);
      const over = u > 0.7 ? Math.sin((u - 0.7) * 10) * 0.04 * (1 - u) : 0;
      tween.node.scaling.setAll(tween.from + (tween.to - tween.from) * ease + over);
      if (u >= 1) {
        tween.node.scaling.setAll(tween.to);
        tween.onDone?.();
        return false;
      }
      return true;
    });

    if (this.walk && this.customer) {
      this.walk.t += dt / 2.4;
      const u = Math.min(1, this.walk.t);
      Vector3.LerpToRef(this.walk.from, this.walk.to, 1 - Math.pow(1 - u, 2), this.customer.position);
      this.customer.rotation.y = Math.PI + Math.sin(u * 12) * 0.08;
      this.customer.position.y = Math.abs(Math.sin(u * 14)) * 0.03;
      if (u >= 1) {
        this.customer.position.copyFrom(this.walk.to);
        this.customer.rotation.y = Math.PI;
        this.walk = null;
      }
    }

    const wantWarm = this.shop.finaleSeen || Boolean(this.walk) || this.shop.owned.length >= 8 ? 1 : this.shop.owned.includes("lamp") ? 0.35 : 0;
    this.warm += (wantWarm - this.warm) * Math.min(1, dt * 1.4);
    this.hemi.intensity = 0.72 + this.warm * 0.38;
    this.sun.intensity = 0.78 + this.warm * 0.38;
    this.hemi.diffuse = Color3.Lerp(new Color3(1, 0.9, 0.82), new Color3(1, 0.86, 0.7), this.warm);
    this.updateLamp();
    this.scene.render();
  }

  private onPointer(type: number, event: PointerEvent): void {
    if (type === PointerEventTypes.POINTERDOWN) this.pointerDown(event);
    if (type === PointerEventTypes.POINTERMOVE) this.pointerMove(event);
    if (type === PointerEventTypes.POINTERUP || type === PointerEventTypes.POINTERPICK) {
      if (type === PointerEventTypes.POINTERUP) this.pointerUp(event);
    }
  }

  private readonly cancelDrag = (): void => {
    const id = this.drag?.id;
    this.drag = null;
    if (id) {
      this.keys[id] = "";
      this.sync(this.shop);
    }
  };

  private pointerDown(event: PointerEvent): void {
    if (this.drag || event.button !== 0) return;
    this.engine.getRenderingCanvas()?.setPointerCapture(event.pointerId);
    const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => Boolean(mesh.isEnabled() && mesh.isVisible));
    const id = (pick?.hit && pick.pickedMesh?.metadata?.upgradeId) as UpgradeId | undefined;
    if (this.edit && id && UPGRADE_BY_ID[id]?.movable && this.shop.owned.includes(id)) {
      this.select(id);
      this.drag = {
        kind: "item",
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        id,
        start: { ...placeOf(this.shop, id) },
      };
      return;
    }
    if (this.edit && id && this.shop.owned.includes(id)) {
      this.select(id);
      return;
    }
    if (!this.edit) {
      this.drag = {
        kind: "camera",
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
      };
    }
  }

  private pointerMove(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    if (this.drag.kind === "camera") {
      const dx = event.clientX - this.drag.lastX;
      const dy = event.clientY - this.drag.lastY;
      this.camera.alpha = Math.max(this.camera.lowerAlphaLimit!, Math.min(this.camera.upperAlphaLimit!, this.camera.alpha - dx * 0.005));
      this.camera.beta = Math.max(this.camera.lowerBetaLimit!, Math.min(this.camera.upperBetaLimit!, this.camera.beta - dy * 0.004));
      this.drag.lastX = event.clientX;
      this.drag.lastY = event.clientY;
      return;
    }
    if (!this.drag.moved && Math.hypot(event.clientX - this.drag.lastX, event.clientY - this.drag.lastY) < 8) return;
    this.drag.moved = true;
    const id = this.drag.id;
    if (!id) return;
    const point = this.pickSurface(id);
    if (!point) return;
    const def = UPGRADE_BY_ID[id];
    const current = placeOf(this.shop, id);
    const next =
      def.surface === "wall"
        ? snapWall(point.x, point.z, def.size.w)
        : snapFloor(point.x, point.z, def.size, current.rot);
    if (def.surface === "wall") next.rot = next.wall === "left" ? 1 : 0;
    else next.rot = current.rot;
    const root = this.visuals.items[id];
    if (!root) return;
    this.previewPlace(id, root, next);
    setItemTint(root, canPlace(id, next, this.shop) ? "#9bb784" : "#d47d86");
    this.ring.position.x = root.position.x;
    this.ring.position.z = root.position.z;
  }

  private pointerUp(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const drag = this.drag;
    this.drag = null;
    if (drag.kind !== "item" || !drag.id || !drag.start || !drag.moved) return;
    const id = drag.id;
    const root = this.visuals.items[id];
    if (!root) return;
    setItemTint(root, null);
    const point = this.pickSurface(id);
    const def = UPGRADE_BY_ID[id];
    const current = placeOf(this.shop, id);
    const next = point
      ? def.surface === "wall"
        ? snapWall(point.x, point.z, def.size.w)
        : snapFloor(point.x, point.z, def.size, current.rot)
      : drag.start;
    if (def.surface !== "wall") next.rot = current.rot;
    if (canPlace(id, next, this.shop)) {
      const moved = next.x !== drag.start.x || next.z !== drag.start.z || next.wall !== drag.start.wall;
      this.hooks.onMove(id, next);
      if (moved && this.visuals.items[id]) this.sparkle(this.visuals.items[id]!);
    } else {
      this.keys[id] = "";
      this.sync(this.shop);
    }
  }

  private previewPlace(id: UpgradeId, root: TransformNode, place: Placement): void {
    const def = UPGRADE_BY_ID[id];
    if (def.surface === "wall") {
      const along = place.x + def.size.w / 2;
      if (place.wall === "left") {
        root.position.set(0.08, 2.48, along);
        root.rotation.y = Math.PI / 2;
      } else {
        root.position.set(along, 2.48, 0.08);
        root.rotation.y = 0;
      }
      return;
    }
    const { w, d } = def.size.w === def.size.d || place.rot % 2 === 0
      ? def.size
      : { w: def.size.d, d: def.size.w };
    root.position.set(place.x + w / 2, id === "plant" && place.z === 0 && place.x >= 4 ? 1.16 : 0, place.z + d / 2);
    root.rotation.y = place.rot * (Math.PI / 2);
  }

  private pickSurface(id: UpgradeId): Vector3 | null {
    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, null, this.camera) as Ray;
    const def = UPGRADE_BY_ID[id];
    if (def.surface === "wall") {
      const backDist = ray.intersectsPlane(Plane.FromPositionAndNormal(new Vector3(0, 0, 0), Vector3.Forward()));
      const leftDist = ray.intersectsPlane(Plane.FromPositionAndNormal(new Vector3(0, 0, 0), Vector3.Right()));
      const hits: Vector3[] = [];
      if (backDist !== null) hits.push(ray.origin.add(ray.direction.scale(backDist)));
      if (leftDist !== null) hits.push(ray.origin.add(ray.direction.scale(leftDist)));
      const valid = hits.filter((p) => p.x >= -0.2 && p.x <= 6.2 && p.z >= -0.2 && p.z <= 6.2 && p.y > 0.4 && p.y < 3.1);
      if (valid.length === 0) return null;
      valid.sort((a, b) => Vector3.DistanceSquared(a, ray.origin) - Vector3.DistanceSquared(b, ray.origin));
      return valid[0];
    }
    const dist = ray.intersectsPlane(Plane.FromPositionAndNormal(new Vector3(0, 0, 0), Vector3.Up()));
    if (dist === null) return null;
    return ray.origin.add(ray.direction.scale(dist));
  }
}
