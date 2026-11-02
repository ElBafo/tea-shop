import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import "@babylonjs/core/Culling/ray";
import type { Ray } from "@babylonjs/core/Culling/ray";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
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
import { canPlace, floorCenter, snapFloor, snapWall } from "./grid";
import { UPGRADE_BY_ID, placeOf, shopComplete, isPlaced, kindOf } from "./upgrades";

export interface DioramaHooks {
  onSelect(id: UpgradeId | null): void;
  onMove(id: UpgradeId, place: Placement): void;
  onPlaced(id: UpgradeId): void;
  onZoom?(zoom: number): void;
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
  private readonly lampLights: Record<"lamp" | "lamp:2", SpotLight>;
  private readonly shadows: ShadowGenerator;
  private readonly lampShadows: Record<"lamp" | "lamp:2", ShadowGenerator>;
  private lampShadowsDirty = true;
  private readonly shadowPreviewKeys = new WeakMap<TransformNode, string>();
  private readonly visuals: ShopVisuals;
  private readonly ring: ReturnType<typeof selectionRing>;
  private readonly hooks: DioramaHooks;
  private shop: ShopState;
  private keys: Partial<Record<UpgradeId, string>> = {};
  private edit = false;
  private zoom = 1;
  private readonly touches = new Map<number, {x: number; y: number}>();
  private pinch: {distance: number; zoom: number} | null = null;
  private pinching = false;
  private steam: AbstractMesh[] = [];
  private elapsed = 0;
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private selected: UpgradeId | null = null;
  private pointer = { x: 0, y: 0 };
  private drag: {
    kind: "camera" | "item";
    pointerId: number;
    lastX: number;
    lastY: number;
    id?: UpgradeId;
    start?: Placement;
    moved?: boolean;
    offset?: Vector3;
  } | null = null;
  private tweens: Tween[] = [];
  private customer: TransformNode | null = null;
  private walk: { from: Vector3; to: Vector3; t: number } | null = null;
  private warm = 0;
  private night = false;
  private readonly windowLight: PointLight;
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

    this.sun = new DirectionalLight("sun", new Vector3(0.22, -1, 0.28), this.scene);
    this.sun.position = new Vector3(1.2, 8, 0.8);
    this.sun.intensity = 0.92;
    this.sun.diffuse = new Color3(1, 0.93, 0.78);

    this.lampLights = {
      lamp: new SpotLight("lamp-light", Vector3.Zero(), Vector3.Down(), Math.PI * 0.8, 1, this.scene),
      "lamp:2": new SpotLight("lamp:2-light", Vector3.Zero(), Vector3.Down(), Math.PI * 0.8, 1, this.scene),
    };
    for (const light of Object.values(this.lampLights)) {
      light.intensity = 0;
      light.diffuse = new Color3(1, 0.8, 0.55);
      light.range = 4;
      light.shadowMinZ = 0.08;
      light.shadowMaxZ = 4;
    }
    this.lampShadows = {
      lamp: new ShadowGenerator(512, this.lampLights.lamp),
      "lamp:2": new ShadowGenerator(512, this.lampLights["lamp:2"]),
    };
    for (const shadow of Object.values(this.lampShadows)) {
      shadow.usePercentageCloserFiltering = true;
      shadow.filteringQuality = ShadowGenerator.QUALITY_LOW;
      shadow.setDarkness(0.45);
      shadow.bias = 0.001;
      shadow.normalBias = 0.02;
      shadow.getShadowMap()!.refreshRate = 0; // Cache until a lamp or caster moves.
    }
    this.windowLight = new PointLight("window-light", new Vector3(4.85, 2, 0.65), this.scene);
    this.windowLight.diffuse = Color3.FromHexString("#ffce8c");
    this.windowLight.range = 5;
    this.windowLight.intensity = 0;

    this.shadows = new ShadowGenerator(512, this.sun);
    this.shadows.usePercentageCloserFiltering = true;
    this.shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadows.setDarkness(0.6);
    this.shadows.transparencyShadow = false;

    this.visuals = createShopVisuals(this.scene);
    this.visuals.floor.receiveShadows = true;
    this.visuals.backWall.receiveShadows = true;
    this.visuals.leftWall.receiveShadows = true;
    this.ring = selectionRing(this.scene);

    this.sync(shop, { quiet: true });
    if (shop.finaleSeen) {
      this.warm = 1;
      this.spawnCustomer(true);
    }

    canvas.addEventListener("pointerdown", this.onDragStart);
    canvas.addEventListener("wheel", this.onWheel, {passive: false});
    window.addEventListener("pointermove", this.onDragMove, { capture: true, passive: false });
    window.addEventListener("pointerup", this.onDragEnd, true);
    window.addEventListener("pointercancel", this.onDragCancel, true);
    window.addEventListener("blur", this.cancelDrag);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    if (!document.hidden) this.engine.runRenderLoop(this.renderFrame);
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    window.addEventListener("resize", this.onWinResize);
    requestAnimationFrame(() => this.resize());
  }

  private readonly renderFrame = () => this.tick();
  private readonly onWinResize = () => this.resize();

  setNight(night: boolean): void {
    this.night = night;
    this.lampShadowsDirty = true;
    this.scene.clearColor = Color4.FromColor3(Color3.FromHexString(night ? "#192333" : C.cream), 1);
    this.scene.ambientColor = night ? new Color3(0.28, 0.33, 0.45) : new Color3(0.55, 0.48, 0.42);
    const sky = this.scene.getMeshByName("sky")?.material;
    if (sky instanceof StandardMaterial) {
      sky.emissiveColor = Color3.FromHexString("#ffd397").scale(night ? 0.8 : 0.22);
    }
    for (const mesh of ["lamp", "lamp:2"].flatMap(id => this.visuals.items[id as UpgradeId]?.getChildMeshes() ?? [])) {
      const material = mesh.material;
      if (material instanceof StandardMaterial && material.name === "lamp-shade") {
        material.emissiveColor = Color3.FromHexString(C.gold).scale(night ? 0.65 : 0.22);
      }
    }
    this.windowLight.intensity = night ? 0.85 : 0;
    this.sun.diffuse = Color3.FromHexString(night ? "#9aafe0" : "#ffedc7");
    this.updateLamp();
  }

  setEditMode(on: boolean): void {
    if (this.edit !== on) this.cancelDrag();
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

  captureImage(): string {
    const canvas = this.engine.getRenderingCanvas();
    if (!canvas || this.disposed) throw new Error("The room is not ready");
    const width = this.engine.getRenderWidth();
    const height = this.engine.getRenderHeight();
    try {
      this.engine.setSize(1200, Math.round(1200 * height / Math.max(1, width)));
      this.fitOrtho();
      this.scene.render();
      // Read synchronously before WebGL clears its drawing buffer.
      return canvas.toDataURL("image/png");
    } finally {
      this.engine.setSize(width, height);
      this.fitOrtho();
      this.scene.render();
    }
  }

  zoomBy(factor: number): void {
    this.cancelDrag();
    this.setZoom(this.zoom * factor);
  }

  resetView(): void {
    this.cancelDrag();
    this.camera.alpha = Math.PI / 4;
    this.camera.beta = 0.98;
    this.setZoom(1);
  }

  private setZoom(value: number): void {
    this.zoom = Math.max(0.85, Math.min(1.9, value));
    this.fitOrtho();
    this.hooks.onZoom?.(this.zoom);
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    if (this.drag || this.pinching) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 300 : 1);
    this.setZoom(this.zoom * Math.exp(-Math.max(-150, Math.min(150, delta)) * 0.002));
  };

  selectedId(): UpgradeId | null {
    return this.selected;
  }

  sync(shop: ShopState, opts: { animate?: UpgradeId; quiet?: boolean } = {}): void {
    this.shop = shop;
    this.lampShadowsDirty = true;
    applyRoomStyle(this.visuals, shop, this.scene);
    const unique: UpgradeId[] = [];
    for (const id of shop.owned) {
      if (id !== "paint" && isPlaced(shop, id)) unique.push(id);
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

    this.steam = Object.values(this.visuals.items).flatMap(root => root?.getChildMeshes().filter(mesh => mesh.metadata?.steam) ?? []);
    this.positionShopkeeper();
    this.setNight(this.night);
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
    canvas?.removeEventListener("pointerdown", this.onDragStart);
    canvas?.removeEventListener("wheel", this.onWheel);
    this.touches.clear();
    window.removeEventListener("pointermove", this.onDragMove, true);
    window.removeEventListener("pointerup", this.onDragEnd, true);
    window.removeEventListener("pointercancel", this.onDragCancel, true);
    window.removeEventListener("blur", this.cancelDrag);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    window.removeEventListener("resize", this.onWinResize);
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
  }

  private fitOrtho(): void {
    const aspect = this.engine.getRenderWidth() / Math.max(1, this.engine.getRenderHeight());
    // Fit both axes: a wide, short canvas must not crop the roof or floor.
    const halfW = Math.max(4.65, 4.3 * aspect) / this.zoom;
    this.camera.orthoLeft = -halfW;
    this.camera.orthoRight = halfW;
    this.camera.orthoTop = halfW / aspect;
    this.camera.orthoBottom = -halfW / aspect;
  }

  private castShadows(root: TransformNode): void {
    const id = root.metadata?.upgradeId as UpgradeId | undefined;
    // Miniature-room shadows should ground furniture, not project wall ornaments
    // or elevated window plants across unrelated surfaces.
    const casts = !id || (UPGRADE_BY_ID[id].surface === "floor" && root.position.y < 0.1);
    collectMeshes(root).forEach((mesh) => {
      if (mesh.metadata?.steam) return;
      if (casts) {
        this.shadows.addShadowCaster(mesh);
        // The light sits inside the shade: lamp meshes must not block their own light.
        if (!id || kindOf(id) !== "lamp") {
          for (const shadow of Object.values(this.lampShadows)) shadow.addShadowCaster(mesh);
        }
      }
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
    ps.particleTexture = sparkTexture(this.scene);
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
    for (const id of ["lamp", "lamp:2"] as const) {
      const light = this.lampLights[id];
      const lamp = this.visuals.items[id];
      if (!lamp || !isPlaced(this.shop, id)) {
        light.intensity = 0;
        light.shadowEnabled = false;
        continue;
      }
      const bulb = lamp.getChildMeshes().find(mesh => mesh.name === "lamp-bulb");
      lamp.computeWorldMatrix(true);
      bulb?.computeWorldMatrix(true);
      const position = bulb ? bulb.getAbsolutePosition() : lamp.position;
      const moved = !light.position.equalsWithEpsilon(position, 0.0001);
      light.position.copyFrom(position);
      light.shadowEnabled = this.night;
      if (this.night && (moved || this.lampShadowsDirty)) this.lampShadows[id].getShadowMap()!.resetRefreshCounter();
      light.intensity = (this.night ? 1.0 : 0.28) + this.warm * 0.18;
    }
    this.lampShadowsDirty = false;
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

  private spawnCustomer(_settled: boolean): void {
    if (this.customer) this.customer.dispose();
    this.customer = buildCustomer(this.scene);
    this.castShadows(this.customer);
    this.walk = null;
    this.positionShopkeeper();
  }

  private positionShopkeeper(place = placeOf(this.shop, "counter")): void {
    if (!this.customer) return;
    this.customer.setEnabled(isPlaced(this.shop, "counter"));
    const center = floorCenter(UPGRADE_BY_ID.counter.size, place);
    const angle = place.rot * Math.PI / 2;
    this.customer.position.set(center.x - Math.sin(angle), 0, center.z - Math.cos(angle));
    this.customer.rotation.y = angle;
  }

  private tick(): void {
    const dt = Math.min(0.1, this.engine.getDeltaTime() / 1000);
    if (this.tweens.length || this.walk) this.lampShadowsDirty = true;
    this.elapsed += dt;
    for (const mesh of this.steam) {
      mesh.setEnabled(!this.reducedMotion.matches);
      if (this.reducedMotion.matches) continue;
      const {x, y, phase} = mesh.metadata.steam;
      const t = (this.elapsed * 0.35 + phase) % 1;
      mesh.position.y = y + t * 0.42;
      mesh.position.x = x + Math.sin(t * Math.PI * 2 + phase) * 0.035;
      mesh.visibility = Math.sin(t * Math.PI) * 0.45;
      mesh.scaling.set(0.7 + t * 0.65, 1.2 + t * 0.8, 0.7 + t * 0.65);
    }
    this.tweens = this.tweens.filter((tween) => {
      if (tween.node.isDisposed()) return false;
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

    const wantWarm = this.shop.finaleSeen || Boolean(this.walk) || shopComplete(this.shop) ? 1 : this.shop.owned.includes("lamp") ? 0.35 : 0;
    this.warm += (wantWarm - this.warm) * Math.min(1, dt * 1.4);
    this.hemi.intensity = this.night ? 0.52 : 0.72 + this.warm * 0.16;
    this.sun.intensity = this.night ? 0.22 : 0.70 + this.warm * 0.12;
    this.hemi.diffuse = this.night ? new Color3(0.72, 0.79, 1) : Color3.Lerp(new Color3(1, 0.9, 0.82), new Color3(1, 0.86, 0.7), this.warm);
    this.updateLamp();
    this.scene.render();
  }

  private updatePointer(event: PointerEvent): void {
    const rect = this.engine.getRenderingCanvas()!.getBoundingClientRect();
    this.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private readonly onDragStart = (event: PointerEvent): void => {
    if (event.pointerType === "touch") {
      this.touches.set(event.pointerId, {x: event.clientX, y: event.clientY});
      if (this.touches.size >= 2) {
        event.preventDefault();
        this.restoreDrag();
        try { this.engine.getRenderingCanvas()?.setPointerCapture(event.pointerId); } catch { /* Window listeners remain active. */ }
        if (!this.pinch) {
          const [a, b] = [...this.touches.values()];
          this.pinch = {distance: Math.max(12, Math.hypot(b.x-a.x, b.y-a.y)), zoom: this.zoom};
        }
        this.pinching = true;
        return;
      }
      if (this.pinching) return;
    }
    this.updatePointer(event);
    this.pointerDown(event);
    if (this.drag) event.preventDefault();
  };

  private readonly onDragMove = (event: PointerEvent): void => {
    if (this.touches.has(event.pointerId)) this.touches.set(event.pointerId, {x:event.clientX, y:event.clientY});
    if (this.pinching) {
      if (this.touches.has(event.pointerId)) event.preventDefault();
      if (this.pinch && this.touches.size >= 2) {
        const [a,b] = [...this.touches.values()];
        this.setZoom(this.pinch.zoom * Math.hypot(b.x-a.x,b.y-a.y) / this.pinch.distance);
      }
      return;
    }
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    this.updatePointer(event);
    this.pointerMove(event);
  };

  private readonly onDragEnd = (event: PointerEvent): void => {
    this.touches.delete(event.pointerId);
    if (this.pinching) {
      if (this.touches.size < 2) this.pinch = null;
      if (this.touches.size === 0) this.pinching = false;
      return;
    }
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    this.updatePointer(event);
    this.pointerUp(event);
  };

  private readonly onDragCancel = (event: PointerEvent): void => {
    if (this.touches.has(event.pointerId) || this.drag?.pointerId === event.pointerId) this.cancelDrag();
  };

  private readonly onVisibilityChange = (): void => {
    if (this.disposed) return;
    if (document.hidden) {
      this.cancelDrag();
      this.engine.stopRenderLoop(this.renderFrame);
    } else {
      this.engine.runRenderLoop(this.renderFrame);
    }
  };

  private readonly cancelDrag = (): void => {
    this.restoreDrag();
    this.touches.clear();
    this.pinch = null;
    this.pinching = false;
  };

  private restoreDrag(): void {
    const id = this.drag?.id;
    this.drag = null;
    if (id) {
      this.keys[id] = "";
      this.sync(this.shop);
    }
  };

  // A 44 CSS-pixel-wide capsule follows the lamp from base to shade.
  // Lighting and device pixel ratio must not change its touch target.
  private nearLamp(event: PointerEvent): UpgradeId | undefined {
    const canvas = this.engine.getRenderingCanvas();
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = this.engine.getRenderWidth(), height = this.engine.getRenderHeight();
    const viewport = this.camera.viewport.toGlobal(width, height);
    let nearest: UpgradeId | undefined;
    let distance = 22;
    for (const id of ["lamp", "lamp:2"] as const) {
      const lamp = this.visuals.items[id];
      if (!lamp || !isPlaced(this.shop, id)) continue;
      const project = (y: number) => {
        const point = Vector3.Project(lamp.position.add(new Vector3(0, y, 0)), Matrix.Identity(), this.scene.getTransformMatrix(), viewport);
        return {x: rect.left + point.x * rect.width / width, y: rect.top + point.y * rect.height / height};
      };
      const a = project(0.05), b = project(1.45);
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((event.clientX-a.x)*dx + (event.clientY-a.y)*dy) / Math.max(1, dx*dx+dy*dy)));
      const d = Math.hypot(event.clientX-a.x-t*dx, event.clientY-a.y-t*dy);
      if (d <= distance) { nearest = id; distance = d; }
    }
    return nearest;
  }

  private pointerDown(event: PointerEvent): void {
    if (this.drag || event.button !== 0) return;
    try { this.engine.getRenderingCanvas()?.setPointerCapture(event.pointerId); } catch { /* Window listeners keep the active drag alive. */ }
    const pick = this.scene.pick(this.pointer.x, this.pointer.y, (mesh) => Boolean(mesh.isPickable && mesh.isEnabled() && mesh.isVisible));
    let id = (pick?.hit && pick.pickedMesh?.metadata?.upgradeId) as UpgradeId | undefined;
    // Preserve direct hits on other furniture; the rug is a surface under it.
    if (this.edit && (!id || id === "rug" || !UPGRADE_BY_ID[id]?.movable)) id = this.nearLamp(event) ?? id;
    if (this.edit && id && UPGRADE_BY_ID[id]?.movable && this.shop.owned.includes(id)) {
      this.select(id);
      const point = UPGRADE_BY_ID[id].surface === "floor" ? this.pickSurface(id) : null;
      const item = this.visuals.items[id];
      this.drag = {
        kind: "item",
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        id,
        start: { ...placeOf(this.shop, id) },
        offset: point && item ? item.position.subtract(point) : undefined,
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
    if (this.drag.offset) point.addInPlace(this.drag.offset);
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
    if (point && drag.offset) point.addInPlace(drag.offset);
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
    const previewKey = `${place.x}:${place.z}:${place.rot}:${place.wall ?? ""}`;
    if (this.shadowPreviewKeys.get(root) !== previewKey) {
      this.lampShadowsDirty = true;
      this.shadowPreviewKeys.set(root, previewKey);
    }
    const def = UPGRADE_BY_ID[id];
    if (def.surface === "wall") {
      const along = place.x + def.size.w / 2;
      if (place.wall === "left") {
        root.position.set(0.08, id === "shelves" ? 1.85 : 2.48, along);
        root.rotation.y = Math.PI / 2;
      } else {
        root.position.set(along, id === "shelves" ? 1.85 : 2.48, 0.08);
        root.rotation.y = 0;
      }
      return;
    }
    const { w, d } = def.size.w === def.size.d || place.rot % 2 === 0
      ? def.size
      : { w: def.size.d, d: def.size.w };
    root.position.set(place.x + w / 2, kindOf(id) === "plant" && place.z === 0 && place.x >= 4 ? 1.16 : 0, place.z + d / 2);
    root.rotation.y = place.rot * (Math.PI / 2);
    if (id === "counter") this.positionShopkeeper(place);
  }

  private pickSurface(id: UpgradeId): Vector3 | null {
    const ray = this.scene.createPickingRay(this.pointer.x, this.pointer.y, null, this.camera) as Ray;
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
