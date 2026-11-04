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

export function decorTexture(scene: Scene, kind: "art" | "clock", style: number): DynamicTexture {
  return canvasTex(scene, `${kind}-${style}`, 256, (ctx, size) => {
    if (kind === "clock") {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = style === 1 ? "#e9e8cd" : "#fff8f1";
      ctx.beginPath(); ctx.arc(128,128,126,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#5a4036"; ctx.lineWidth = 5;
      for (let i=0;i<12;i++) {
        const a=i*Math.PI/6;
        ctx.beginPath();ctx.moveTo(128+Math.sin(a)*100,128-Math.cos(a)*100);ctx.lineTo(128+Math.sin(a)*111,128-Math.cos(a)*111);ctx.stroke();
      }
      ctx.lineWidth=8;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(89,105);ctx.lineTo(128,128);ctx.lineTo(177,80);ctx.stroke();
      return;
    }
    ctx.fillStyle=style===2?"#e8b5b5":"#fff3dd";ctx.fillRect(0,0,size,size);
    if (style===0) {
      ctx.strokeStyle="#52765a";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(128,225);ctx.lineTo(128,40);ctx.stroke();
      ctx.fillStyle="#799768";
      for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(i%2?152:104,65+i*25,30,12,i%2?-0.5:0.5,0,Math.PI*2);ctx.fill();}
    } else if(style===1) {
      ctx.fillStyle="#e9a17b";ctx.beginPath();ctx.arc(177,66,28,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#a1b8bd";ctx.beginPath();ctx.moveTo(0,226);ctx.lineTo(90,70);ctx.lineTo(210,226);ctx.fill();
      ctx.fillStyle="#536f84";ctx.beginPath();ctx.moveTo(90,226);ctx.lineTo(182,118);ctx.lineTo(256,226);ctx.fill();
    } else {
      ctx.strokeStyle="#fff8f1";ctx.lineWidth=12;ctx.beginPath();ctx.arc(177,132,25,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#fff8f1";ctx.fillRect(65,99,112,66);ctx.beginPath();ctx.ellipse(121,165,56,23,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#98684b";ctx.beginPath();ctx.ellipse(121,100,49,10,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#fff8f1";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(105,78);ctx.quadraticCurveTo(85,60,108,40);ctx.stroke();
    }
  });
}

// Calm, phone-readable materials for the isolated second-edition miniature.
export function editionOakTexture(scene:Scene):DynamicTexture {
 return canvasTex(scene,'edition-oak',512,(ctx,s)=>{
  ctx.fillStyle='#d9ba91';ctx.fillRect(0,0,s,s);
  for(let row=0;row<8;row++){
   ctx.fillStyle=['#dfc29d','#d7b78d','#e4caa7','#dcc09a'][row%4];ctx.fillRect(0,row*64,s,63);
   ctx.strokeStyle='#b7956e';ctx.globalAlpha=.3;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,row*64+.5);ctx.lineTo(s,row*64+.5);ctx.stroke();
   for(let col=0;col<3;col++){const x=(col*192+(row%2)*96)%s;ctx.fillRect(x,row*64,1,64);}
   ctx.globalAlpha=.07;ctx.strokeStyle='#765b42';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(0,row*64+12+i*12);ctx.bezierCurveTo(120,row*64+8+i*12,330,row*64+18+i*12,s,row*64+10+i*12);ctx.stroke();}ctx.globalAlpha=1;
  }
 });
}
export function editionFabricTexture(scene:Scene,style:number):DynamicTexture {
 return canvasTex(scene,'edition-fabric-'+style,256,(ctx,s)=>{
  const base=['#d6b58e','#cbb2a5','#b8c4b0'][style];ctx.fillStyle=base;ctx.fillRect(0,0,s,s);
  ctx.strokeStyle='#f6eedf';ctx.lineWidth=7;ctx.strokeRect(13,13,s-26,s-26);ctx.lineWidth=2;ctx.strokeRect(25,25,s-50,s-50);
  if(style===0){ctx.beginPath();ctx.moveTo(128,49);ctx.lineTo(201,128);ctx.lineTo(128,207);ctx.lineTo(55,128);ctx.closePath();ctx.stroke();}
  if(style===1)for(let y=48;y<220;y+=40)for(let x=48;x<220;x+=40){ctx.beginPath();ctx.ellipse(x,y,8,4,-.5,0,Math.PI*2);ctx.fillStyle='#f1e3d5';ctx.fill();}
  if(style===2){ctx.globalAlpha=.3;ctx.fillStyle='#f6eedf';for(let x=40;x<230;x+=30)ctx.fillRect(x,30,9,196);ctx.globalAlpha=1;}
  ctx.globalAlpha=.08;ctx.fillStyle='#5d5142';for(let i=0;i<s;i+=3){ctx.fillRect(i,0,1,s);ctx.fillRect(0,i,s,1);}ctx.globalAlpha=1;
 });
}
export function editionSignTexture(scene:Scene,style:number):DynamicTexture {
 return canvasTex(scene,'edition-sign-'+style,256,(ctx,s)=>{
  ctx.fillStyle=['#52675d','#eee3cb','#bd8d80'][style];ctx.fillRect(0,0,s,s);ctx.strokeStyle=style===1?'#927249':'#eee3cb';ctx.lineWidth=3;ctx.strokeRect(12,21,s-24,s-42);
  ctx.fillStyle=style===1?'#52675d':'#fff6e5';ctx.font='bold 84px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TEA',128,115);ctx.font='25px Georgia,serif';ctx.fillText('a little pause',128,179);
 });
}
