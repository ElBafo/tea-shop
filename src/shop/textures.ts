import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import type { Scene } from "@babylonjs/core/scene";
import { C } from "./palette";

function canvasTex(
  scene: Scene,
  name: string,
  size: number,
  draw: (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, size: number) => void,
): DynamicTexture {
  const texture = new DynamicTexture(name, { width: size, height: size }, scene, false);
  texture.wrapU = 1;
  texture.wrapV = 1;
  const ctx = texture.getContext() as CanvasRenderingContext2D;
  draw(ctx, size);
  texture.update();
  return texture;
}

export function woodTexture(scene: Scene, light: string, dark: string, name: string): DynamicTexture {
  return canvasTex(scene, name, 128, (ctx, size) => {
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 16; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? dark : light;
      ctx.globalAlpha = 0.28;
      ctx.fillRect(0, (size / 16) * i, size, size / 16 - 1);
    }
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(size * 0.28, size * 0.42, 7, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size * 0.72, size * 0.7, 5, 2.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

export function plasterTexture(scene: Scene, base: string, name: string): DynamicTexture {
  return canvasTex(scene, name, 128, (ctx, size) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 40; i += 1) {
      const x = (i * 37) % size;
      const y = (i * 53) % size;
      ctx.fillStyle = i % 2 === 0 ? "#000000" : "#ffffff";
      ctx.globalAlpha = 0.035;
      ctx.fillRect(x, y, 8, 5);
    }
    ctx.globalAlpha = 1;
  });
}

export function marbleTexture(scene: Scene): DynamicTexture {
  return canvasTex(scene, "marble", 128, (ctx, size) => {
    ctx.fillStyle = C.marble;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = C.marbleVein;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.bezierCurveTo(40, 40, 70, 8, 128, 36);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 90);
    ctx.bezierCurveTo(50, 70, 90, 110, 128, 80);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

export function rugTexture(scene: Scene, variant: number): DynamicTexture {
  return canvasTex(scene, `rug-${variant}`, 128, (ctx, size) => {
    if (variant === 1) {
      ctx.fillStyle = "#f3c8cc";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#fff8f1";
      ctx.fillRect(10, 10, size - 20, size - 20);
      ctx.fillStyle = "#e89aaa";
      for (let i = 0; i < 12; i += 1) {
        ctx.beginPath();
        ctx.arc(24 + (i % 4) * 28, 28 + Math.floor(i / 4) * 32, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    if (variant === 2) {
      for (let i = 0; i < 8; i += 1) {
        ctx.fillStyle = i % 2 === 0 ? "#c5d1b8" : "#fff8f1";
        ctx.fillRect(0, (size / 8) * i, size, size / 8);
      }
      return;
    }
    ctx.fillStyle = "#e8c4a8";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#fff8f1";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, size - 20, size - 20);
    ctx.strokeRect(22, 22, size - 44, size - 44);
    ctx.fillStyle = "#c9a27a";
    ctx.fillRect(size / 2 - 10, size / 2 - 10, 20, 20);
  });
}

export function signTexture(scene: Scene, variant: number): DynamicTexture {
  const backs = [C.woodDeep, C.blush, "#9aaa84"];
  const inks = [C.foam, C.foam, C.foam];
  return canvasTex(scene, `sign-${variant}`, 256, (ctx, size) => {
    ctx.fillStyle = backs[variant] ?? C.woodDeep;
    ctx.fillRect(0, 0, size, size);
    if (variant === 2) {
      ctx.fillStyle = "#e89aaa";
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.arc(24 + (i % 4) * 60, 28 + Math.floor(i / 4) * 200, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = inks[variant] ?? C.foam;
    ctx.font = "bold 108px Georgia, Palatino, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "rgba(90, 64, 54, 0.35)";
    ctx.lineWidth = 8;
    ctx.strokeText("TEA", size / 2, size / 2 + 6);
    ctx.fillText("TEA", size / 2, size / 2 + 6);
  });
}

export function sparkTexture(scene: Scene): DynamicTexture {
  return canvasTex(scene, "spark", 64, (ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#fff4c8";
    ctx.beginPath();
    ctx.moveTo(32, 4);
    ctx.lineTo(38, 26);
    ctx.lineTo(60, 32);
    ctx.lineTo(38, 38);
    ctx.lineTo(32, 60);
    ctx.lineTo(26, 38);
    ctx.lineTo(4, 32);
    ctx.lineTo(26, 26);
    ctx.closePath();
    ctx.fill();
  });
}
