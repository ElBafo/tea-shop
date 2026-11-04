import type { ShopState } from '../game/types';
import { isStored, kindOf, placeOf, styleOf } from './upgrades';
import { buildGuestLayout, routeGuest, type GuestLayout, type GuestPoint, type GuestStop } from './guest-routes';

export const GUEST_LIMIT = 2;
export const FIRST_GUEST_DELAY = 4;
export const GUEST_WALK_SPEED = .72;
export type GuestPose = 'stand' | GuestStop['kind'];
type Phase = 'entering' | 'walking' | 'approaching-seat' | 'activity' | 'leaving-seat' | 'waiting' | 'leaving';
export interface GuestFrame {
  slot: number;
  visitId: number;
  x: number;
  y: number;
  z: number;
  facing: number;
  pose: GuestPose;
  moving: boolean;
  phase: Phase;
  stopKey: string | null;
}
interface Visit {
  slot: number;
  id: number;
  point: GuestPoint;
  facing: number;
  phase: Phase;
  pose: GuestPose;
  path: GuestPoint[];
  stop: GuestStop | null;
  remaining: GuestStop['kind'][];
  hold: number;
  forcedExit: boolean;
}
const copy = (point: GuestPoint): GuestPoint => ({...point});
const distance = (a: GuestPoint, b: GuestPoint) => Math.hypot(a.x-b.x,a.z-b.z);

/** Decorative variety drives ambience, never a score or a matching-set bonus. */
export function furnishingCount(shop: ShopState): number {
  return new Set(shop.owned.filter(id=>!isStored(shop,id)).map(kindOf)).size;
}
export function guestArrivalRange(count: number): readonly [number,number] {
  const amount = Math.min(1,Math.max(0,count)/8);
  return [70-61*amount,100-86*amount];
}
function layoutKey(shop: ShopState): string {
  return JSON.stringify(shop.owned.filter(id=>!isStored(shop,id)).sort().map(id=>[id,placeOf(shop,id),kindOf(id)==='bench'?styleOf(shop,id):null]));
}

/**
 * A transient, deterministic simulation driven by the room's existing frame.
 * At most one guest walks at once; the other can enjoy its reserved activity.
 * This avoids crossing in the tiny grid without another animation or timer loop.
 */
export class GuestTraffic {
  private layout: GuestLayout;
  private signature: string;
  private visits: (Visit|null)[] = [null,null];
  private nextArrival = FIRST_GUEST_DELAY;
  private editing = false;
  private reduced: boolean|null = null;
  private nextId = 1;
  private count: number;
  readonly stats = {arrivals:0,departures:0};

  constructor(shop: ShopState, private readonly random: ()=>number = Math.random) {
    this.layout = buildGuestLayout(shop);
    this.signature = layoutKey(shop);
    this.count = furnishingCount(shop);
  }
  get furnishing(): number { return this.count; }
  get arrivalIn(): number { return this.nextArrival; }

  update(shop: ShopState): void {
    const signature = layoutKey(shop);
    if (signature === this.signature) return;
    this.signature = signature;
    this.layout = buildGuestLayout(shop);
    const count=furnishingCount(shop),densityChanged=count!==this.count;
    this.count = count;
    this.clear();
    if(densityChanged)this.nextArrival = Math.max(2,Math.min(this.nextArrival,this.interval()));
  }
  setEditing(on: boolean): void {
    if (on === this.editing) return;
    this.editing = on;
    this.clear();
    // Editing neither accumulates missed arrivals nor repeats the intro burst.
    this.nextArrival = Math.max(2,Math.min(this.nextArrival,this.interval()));
  }
  clear(): void { this.visits.fill(null); }

  tick(seconds: number, reducedMotion = false): void {
    if (this.editing || !Number.isFinite(seconds) || seconds<=0) return;
    const dt = Math.min(.1,seconds); // No catch-up after backgrounding or a slow frame.
    if (this.reduced !== null && this.reduced !== reducedMotion) {
      this.clear();
      this.nextArrival = Math.max(2,this.nextArrival);
    }
    this.reduced = reducedMotion;
    if (!this.layout.entry || !this.layout.doorway || !this.layout.stops.length) return;

    for (const visit of this.visits) {
      if (!visit) continue;
      if (visit.path.length) this.walk(visit,dt);
      else if (visit.phase==='activity') {
        visit.hold-=dt;
        if (visit.hold<=0 || visit.forcedExit) {
          if (reducedMotion) this.depart(visit);
          else if (!this.otherWalking(visit)) {
            if (visit.stop?.seat) {
              const path=[...(visit.stop.seat.via??[]).slice().reverse().map(copy),copy(visit.stop.point)];
              if (this.transitClear(visit,path)) {
                visit.pose='stand';visit.phase='leaving-seat';visit.path=path;
              } else for (const other of this.others(visit)) other.forcedExit=true;
            } else { visit.phase='waiting';visit.pose='stand'; }
          }
        }
      } else if (visit.phase==='waiting' && !this.otherWalking(visit)) this.nextActivity(visit);
    }

    this.nextArrival -= dt;
    if (this.nextArrival<=0 && this.visits.some(visit=>!visit)) {
      if (this.spawn(reducedMotion)) this.nextArrival=this.interval();
      else this.nextArrival=2; // Recheck a busy entrance without building a queue.
    }
  }

  snapshot(): GuestFrame[] {
    if (this.editing) return [];
    return this.visits.flatMap(visit=>visit?[{
      slot:visit.slot,visitId:visit.id,x:visit.point.x,y:visit.pose==='sit'?(visit.stop?.seat?.elevation??0):0,z:visit.point.z,
      facing:visit.facing,pose:visit.pose,moving:visit.path.length>0,
      phase:visit.phase,stopKey:visit.stop?.key??null,
    }]:[]);
  }

  private between(min: number,max: number): number { return min+(max-min)*Math.max(0,Math.min(1,this.random())); }
  private interval(): number { const [min,max]=guestArrivalRange(this.count);return this.between(min,max); }
  private otherWalking(visit?:Visit): boolean { return this.visits.some(other=>other && other!==visit && other.path.length>0); }
  private others(visit?:Visit): Visit[] { return this.visits.filter((other):other is Visit=>!!other && other!==visit); }
  private transitClear(visit:Visit,path:GuestPoint[]):boolean {
    const points=[visit.point,...path];
    return this.others(visit).every(other=>points.slice(1).every((to,i)=>{
      const from=points[i],dx=to.x-from.x,dz=to.z-from.z,length=dx*dx+dz*dz;
      const t=length?Math.max(0,Math.min(1,((other.point.x-from.x)*dx+(other.point.z-from.z)*dz)/length)):0;
      return distance(other.point,{x:from.x+dx*t,z:from.z+dz*t})>.5;
    }));
  }
  private shuffled<T>(values: readonly T[]): T[] {
    const list=[...values];
    for(let i=list.length-1;i>0;i--){const j=Math.min(i,Math.floor(this.between(0,i+1)));[list[i],list[j]]=[list[j],list[i]];}
    return list;
  }
  private available(stop: GuestStop,visit?:Visit): boolean {
    return this.others(visit).every(other=>other.stop?.key!==stop.key
      && (!other.stop || distance(other.stop.point,stop.point)>.7)
      && distance(other.point,stop.point)>.55
      && distance(other.point,stop.seat?.point??stop.point)>.55);
  }
  private dwell(kind:GuestStop['kind']):number {
    const ranges={browse:[6,10],order:[6,9],sit:[24,36],look:[5,8]} as const;
    const range=ranges[kind];return this.between(range[0],range[1]);
  }

  private spawn(reduced:boolean):boolean {
    const {entry,doorway}=this.layout;
    if(!entry || !doorway || this.otherWalking() || this.others().some(v=>distance(v.point,entry)<.8
      || (v.stop && distance(v.stop.point,entry)<.8)))return false;
    const slot=this.visits.findIndex(visit=>!visit);
    if(slot<0)return false;
    const kinds=(['browse','order','sit'] as const).filter(kind=>this.layout.stops.some(stop=>stop.kind===kind));
    const visit:Visit={slot,id:this.nextId++,point:copy(doorway),facing:Math.atan2(entry.x-doorway.x,entry.z-doorway.z),phase:'entering',pose:'stand',path:[copy(entry)],stop:null,remaining:kinds.length?[...kinds]:['look'],hold:0,forcedExit:false};
    if(reduced){
      // Reduced motion shows a quiet, reachable activity for one visit, without
      // translating the figure across the room or between activities.
      const candidates=this.layout.stops.filter(stop=>this.available(stop));
      const preferred=candidates.filter(stop=>stop.kind==='sit');
      const stop=this.shuffled(preferred.length?preferred:candidates)[0];
      if(!stop)return false;
      visit.stop=stop;visit.point=copy(stop.seat?.point??stop.point);
      visit.facing=stop.seat?.facing??stop.facing;visit.pose=stop.kind;
      visit.phase='activity';visit.path=[];visit.remaining=[];visit.hold=this.dwell(stop.kind);
    }
    this.visits[slot]=visit;this.stats.arrivals++;
    return true;
  }
  private nextActivity(visit:Visit):void {
    const avoid=this.others(visit).map(other=>other.point);
    visit.stop=null;
    while(!visit.forcedExit && visit.remaining.length){
      const kind=visit.remaining.shift()!;
      const candidates=this.shuffled(this.layout.stops.filter(stop=>stop.kind===kind && this.available(stop,visit)));
      for(const stop of candidates){
        const path=routeGuest(this.layout,visit.point,stop.point,avoid);
        if(!path)continue;
        visit.stop=stop;visit.path=path.slice(1);visit.phase='walking';visit.pose='stand';
        if(!visit.path.length)this.arrive(visit);
        return;
      }
    }
    const path=routeGuest(this.layout,visit.point,this.layout.entry!,avoid);
    if(path){visit.path=[...path.slice(1),copy(this.layout.doorway!)];visit.phase='leaving';visit.pose='stand';}
    else {
      // Let the guest nearer the exit finish first if a narrow route is occupied.
      // This shortens a visit instead of clipping through a seated guest.
      for(const other of this.others(visit))other.forcedExit=true;
      visit.forcedExit=true;
    }
  }
  private walk(visit:Visit,dt:number):void {
    const target=visit.path[0],dx=target.x-visit.point.x,dz=target.z-visit.point.z;
    const length=Math.hypot(dx,dz), step=GUEST_WALK_SPEED*dt;
    if(length>1e-6)visit.facing=Math.atan2(dx,dz);
    if(length<=step){visit.point=copy(target);visit.path.shift();if(!visit.path.length)this.arrive(visit);}
    else {visit.point.x+=dx/length*step;visit.point.z+=dz/length*step;}
  }
  private arrive(visit:Visit):void {
    if(visit.phase==='leaving'){this.depart(visit);return;}
    if(visit.phase==='entering' || visit.phase==='leaving-seat'){visit.phase='waiting';return;}
    if(visit.phase==='walking' && visit.stop?.seat){
      const path=[...(visit.stop.seat.via??[]).map(copy),copy(visit.stop.seat.point)];
      if (this.transitClear(visit,path)) {visit.phase='approaching-seat';visit.path=path;return;}
      visit.stop=null;visit.phase='waiting';return;
    }
    if(visit.stop){visit.phase='activity';visit.pose=visit.stop.kind;visit.facing=visit.stop.seat?.facing??visit.stop.facing;visit.hold=this.dwell(visit.stop.kind);}
    else visit.phase='waiting';
  }
  private depart(visit:Visit):void {this.visits[visit.slot]=null;this.stats.departures++;}
}
