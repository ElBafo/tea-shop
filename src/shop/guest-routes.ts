import type { Placement, ShopState, UpgradeId } from '../game/types';
import { counterCells, floorCells, floorCenter, inRoom, ROOM } from './grid';
import { isStored, kindOf, placeOf, styleOf, UPGRADE_BY_ID } from './upgrades';

export interface GuestPoint { x: number; z: number }
export interface GuestStop {
  key: string;
  kind: 'browse' | 'order' | 'sit' | 'look';
  /** A reachable floor-cell centre. Walking routes end here. */
  point: GuestPoint;
  facing: number;
  /** Only the final, checked chair approach may enter its own furniture footprint. */
  seat?: { point: GuestPoint; facing: number; via?: GuestPoint[]; elevation?: number };
}
export interface GuestLayout {
  entry: GuestPoint | null;
  doorway: GuestPoint | null;
  stops: GuestStop[];
  /** Cell centres in the entrance's connected component. */
  walkable: GuestPoint[];
  blocked: ReadonlySet<string>;
  reachable: ReadonlySet<string>;
}

type Cell = { x: number; z: number };
const directions: readonly Cell[] = [{x:0,z:-1},{x:-1,z:0},{x:1,z:0},{x:0,z:1}];
const key = (cell: Cell) => `${cell.x},${cell.z}`;
const cellOf = (point: GuestPoint): Cell => ({x:Math.floor(point.x),z:Math.floor(point.z)});
const centre = (cell: Cell): GuestPoint => ({x:cell.x+.5,z:cell.z+.5});
const distance = (a: GuestPoint, b: GuestPoint) => Math.hypot(a.x-b.x,a.z-b.z);
const facing = (from: GuestPoint, to: GuestPoint) => Math.atan2(to.x-from.x,to.z-from.z);
const isCentre = (p: GuestPoint) => Number.isFinite(p.x) && Number.isFinite(p.z)
  && Math.abs(p.x-Math.floor(p.x)-.5)<1e-6 && Math.abs(p.z-Math.floor(p.z)-.5)<1e-6;

function connected(start: Cell, blocked: ReadonlySet<string>): Cell[] {
  const found = new Set([key(start)]), cells = [start];
  for (let i=0;i<cells.length;i++) for (const d of directions) {
    const next = {x:cells[i].x+d.x,z:cells[i].z+d.z}, k=key(next);
    if (inRoom(next) && !blocked.has(k) && !found.has(k)) { found.add(k); cells.push(next); }
  }
  return cells;
}

/** Orthogonal cell-centre route including both endpoints. Doorways/seats are not grid cells. */
export function routeGuest(layout: GuestLayout, from: GuestPoint, to: GuestPoint, avoid: readonly GuestPoint[] = []): GuestPoint[] | null {
  if (!isCentre(from) || !isCentre(to)) return null;
  const start=key(cellOf(from)), end=key(cellOf(to));
  if (!layout.reachable.has(start) || !layout.reachable.has(end)) return null;
  const excluded=new Set(avoid.map(p=>key(cellOf(p))));
  excluded.delete(start);
  if (excluded.has(end)) return null;
  const previous=new Map<string,string|null>([[start,null]]), queue=[cellOf(from)];
  for (let i=0;i<queue.length;i++) {
    const current=queue[i], currentKey=key(current);
    if (currentKey===end) {
      const path:GuestPoint[]=[];
      for(let k:string|null=end;k!==null;k=previous.get(k)??null) {
        const [x,z]=k.split(',').map(Number); path.push(centre({x,z}));
      }
      return path.reverse();
    }
    for (const d of directions) {
      const next={x:current.x+d.x,z:current.z+d.z}, nextKey=key(next);
      if (layout.reachable.has(nextKey) && !excluded.has(nextKey) && !previous.has(nextKey)) {
        previous.set(nextKey,currentKey); queue.push(next);
      }
    }
  }
  return null;
}

function localPoint(center: GuestPoint, rot: number, x: number, z: number): GuestPoint {
  const a=rot*Math.PI/2;
  return {x:center.x+x*Math.cos(a)+z*Math.sin(a),z:center.z-x*Math.sin(a)+z*Math.cos(a)};
}

// A guest is narrower than a cell but still needs clearance at furniture corners.
// Ignore only the chair's owning piece, never another piece or the counter aisle.
function seatApproachClear(from: GuestPoint, to: GuestPoint, own: UpgradeId, occupied: Map<UpgradeId,Cell[]>): boolean {
  const radius=.18;
  for(let step=0;step<=24;step++) {
    const t=step/24, p={x:from.x+(to.x-from.x)*t,z:from.z+(to.z-from.z)*t};
    if(p.x<radius || p.z<radius || p.x>ROOM-radius || p.z>ROOM-radius) return false;
    for(const [id,cells] of occupied) if(id!==own) for(const c of cells) {
      const dx=Math.max(c.x-p.x,0,p.x-c.x-1), dz=Math.max(c.z-p.z,0,p.z-c.z-1);
      if(dx*dx+dz*dz<radius*radius) return false;
    }
  }
  return true;
}

export function buildGuestLayout(shop: ShopState): GuestLayout {
  const blocked=new Set<string>(), occupied=new Map<UpgradeId,Cell[]>();
  const placed=shop.owned.filter(id=>!isStored(shop,id) && UPGRADE_BY_ID[id]);
  for(const id of placed) {
    const def=UPGRADE_BY_ID[id];
    if(def.surface!=='floor' || def.layer!=='furn') continue;
    const place=placeOf(shop,id);
    const cells=(kindOf(id)==='counter'?counterCells(place):floorCells(def.size,place)).filter(inRoom);
    occupied.set(id,cells); cells.forEach(cell=>blocked.add(key(cell)));
  }
  // Both cutaway edges are open. Prefer a central front entrance, then the
  // largest reachable area; never spawn through furniture at an edge.
  const edge:Cell[]=[];
  for(const x of [3,2,4,1,5,0]) edge.push({x,z:ROOM-1});
  for(const z of [3,2,4,1,0]) edge.push({x:ROOM-1,z});
  let entryCell:Cell|null=null, reachableCells:Cell[]=[];
  for(const candidate of edge) {
    if(blocked.has(key(candidate))) continue;
    const cells=connected(candidate,blocked);
    if(cells.length>reachableCells.length) { entryCell=candidate; reachableCells=cells; }
  }
  const entry=entryCell?centre(entryCell):null;
  const layout:GuestLayout={
    entry,
    doorway:entryCell && entry ? entryCell.z===ROOM-1 ? {x:entry.x,z:ROOM+.28} : {x:ROOM+.28,z:entry.z} : null,
    stops:[],walkable:reachableCells.map(centre),blocked,
    reachable:new Set(reachableCells.map(key)),
  };
  if(!entry) return layout;
  const available=(p:GuestPoint)=>isCentre(p) && layout.reachable.has(key(cellOf(p)));
  const choose=(points:GuestPoint[], target:GuestPoint)=>points.filter(available).map(p=>centre(cellOf(p)))
    .sort((a,b)=>distance(a,target)-distance(b,target)||distance(a,entry)-distance(b,entry))[0];

  for(const id of placed) {
    const def=UPGRADE_BY_ID[id], place=placeOf(shop,id), kind=kindOf(id);
    if(kind==='shelves') {
      const left=place.wall==='left';
      const candidates=Array.from({length:def.size.w},(_,i)=>left?{x:.5,z:place.x+i+.5}:{x:place.x+i+.5,z:.5});
      const target=left?{x:0,z:place.x+def.size.w/2}:{x:place.x+def.size.w/2,z:0};
      const point=choose(candidates,target);
      if(point) layout.stops.push({key:`${id}:browse`,kind:'browse',point,facing:left?-Math.PI/2:Math.PI});
    } else if(kind==='counter') {
      const center=floorCenter(def.size,place), cells=floorCells(def.size,place);
      const normal=directionsForRotation(place);
      const occupiedKeys=new Set(cells.map(key));
      const front=cells.map(c=>({x:c.x+normal.x,z:c.z+normal.z})).filter(c=>!occupiedKeys.has(key(c))).map(centre);
      const point=choose(front,center);
      if(point) layout.stops.push({key:`${id}:order`,kind:'order',point,facing:facing(point,center)});
    } else if(kind==='table') {
      const center=floorCenter(def.size,place);
      for(const side of [-1,1]) {
        const seat=localPoint(center,place.rot,side*.77,0);
        // Enter from beside the chair rather than walking through its back.
        const candidates=[-.5,.5].map(z=>({
          point:localPoint(center,place.rot,side*1.5,z),
          via:localPoint(center,place.rot,side*.77,z<0?-.45:.45),
        })).filter(candidate=>seatApproachClear(candidate.point,candidate.via,id,occupied)
          && seatApproachClear(candidate.via,seat,id,occupied));
        const point=choose(candidates.map(candidate=>candidate.point),seat);
        const approach=point?candidates.find(candidate=>distance(candidate.point,point)<1e-6):undefined;
        if(point) layout.stops.push({key:`${id}:seat:${side<0?'left':'right'}`,kind:'sit',point,
          facing:facing(point,seat),seat:{point:seat,facing:facing(seat,center),via:[approach!.via]}});
      }
    } else if(kind==='bench') {
      const center=floorCenter(def.size,place), seat=localPoint(center,place.rot,0,.08);
      const candidates=[-.5,.5].map(x=>localPoint(center,place.rot,x,1));
      const point=choose(candidates.filter(p=>seatApproachClear(p,seat,id,occupied)),seat);
      if(point) layout.stops.push({key:`${id}:read`,kind:'sit',point,facing:facing(point,seat),
        seat:{point:seat,facing:place.rot*Math.PI/2,elevation:[.125,.15,.175][styleOf(shop,id)]??.125}});
    }
  }
  // A bare room still supports a short visit. Keep look stops clear of the
  // entrance and furniture activities, so two reservations need not overlap.
  const look=layout.walkable.filter(p=>distance(p,entry)>=1.5)
    .sort((a,b)=>distance(a,{x:3,z:3})-distance(b,{x:3,z:3})||distance(a,entry)-distance(b,entry));
  for(const point of look) {
    if(layout.stops.some(stop=>distance(stop.point,point)<1.4)) continue;
    const number=layout.stops.filter(stop=>stop.kind==='look').length;
    layout.stops.push({key:`room:look:${number}`,kind:'look',point,facing:facing(point,{x:3,z:2})});
    if(number===1) break;
  }
  return layout;
}

function directionsForRotation(place:Placement):Cell {
  return [{x:0,z:1},{x:1,z:0},{x:0,z:-1},{x:-1,z:0}][place.rot%4];
}
