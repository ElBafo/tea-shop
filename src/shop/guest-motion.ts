import type { GuestFrame } from './guest-traffic';

type MotionFrame = Pick<GuestFrame, 'visitId' | 'x' | 'z' | 'facing' | 'moving' | 'pose'>;
export interface GuestMotionSample {
  facing: number;
  /** Radians; one full cycle covers the profile's strideLength world units. */
  stridePhase: number;
  walkWeight: number;
  dt: number;
  reset: boolean;
}

export const GUEST_TURN_RATE = 16;
export const GUEST_GAIT_BLEND_RATE = 12;
export const shortestGuestTurn = (from: number, to: number): number => Math.atan2(Math.sin(to-from), Math.cos(to-from));

/** Choose once per visit, cycling the roster without duplicating a present guest. */
export function guestProfileForVisit(visitId: number, profiles: readonly string[], occupied: readonly string[]): string {
  if (!profiles.length) throw new Error('A guest roster must have at least one profile');
  const start = Math.max(0, Math.floor(visitId)-1) % profiles.length;
  for (let offset=0; offset<profiles.length; offset++) {
    const candidate=profiles[(start+offset)%profiles.length];
    if (!occupied.includes(candidate)) return candidate;
  }
  return profiles[start];
}

/** Session-only cursor; a room scene may be replaced without restarting the cast. */
export class GuestRoster {
  private cursor=0;
  constructor(private readonly profiles: readonly string[]) {
    if (!profiles.length) throw new Error('A guest roster must have at least one profile');
  }
  next(occupied: readonly string[]=[]): string {
    const profile=guestProfileForVisit(this.cursor+1,this.profiles,occupied);
    this.cursor=(this.profiles.indexOf(profile)+1)%this.profiles.length;
    return profile;
  }
  reset(): void { this.cursor=0; }
}

/**
 * Visual projection only: this controller never writes a route or a position.
 * A slot owns one reusable sample. Callers copying it should spread the result.
 */
export class GuestMotion {
  private visitId: number | null = null;
  private lastX = 0;
  private lastZ = 0;
  private reduced = false;
  readonly sample: GuestMotionSample = {facing:0,stridePhase:0,walkWeight:0,dt:0,reset:true};

  clear(): void { this.visitId=null; }

  update(frame: MotionFrame, seconds: number, reducedMotion: boolean, strideLength: number, forceReset=false): GuestMotionSample {
    const dt=Number.isFinite(seconds) ? Math.max(0,Math.min(.1,seconds)) : 0;
    const reset=forceReset || frame.visitId!==this.visitId || reducedMotion!==this.reduced;
    const sample=this.sample;
    if (reset) {
      this.visitId=frame.visitId;
      this.reduced=reducedMotion;
      sample.facing=frame.facing;
      sample.stridePhase=0;
      sample.walkWeight=0;
    } else if (reducedMotion) {
      sample.facing=frame.facing;
      sample.stridePhase=0;
      sample.walkWeight=0;
    } else if (dt>0) {
      const distance=Math.hypot(frame.x-this.lastX,frame.z-this.lastZ);
      const travelling=distance>1e-7 && frame.pose!=='sit';
      // The final route step may already have moving=false; it still travelled.
      if (travelling) sample.stridePhase=(sample.stridePhase+distance/Math.max(.1,strideLength)*Math.PI*2)%(Math.PI*2);
      const target=travelling ? 1 : 0;
      sample.walkWeight+=(target-sample.walkWeight)*(1-Math.exp(-GUEST_GAIT_BLEND_RATE*dt));
      sample.facing+=shortestGuestTurn(sample.facing,frame.facing)*(1-Math.exp(-GUEST_TURN_RATE*dt));
    }
    // Seating snaps the hips to a fixed cushion anchor. Align its facing in
    // that same frame: easing a seated half-turn sweeps feet through the base
    // and arms. Ordinary walking turns still use the smooth projection above.
    if (frame.pose==='sit') sample.facing=frame.facing;
    // Repaints can rebase a position, but must never invent a step on the next tick.
    this.lastX=frame.x;
    this.lastZ=frame.z;
    sample.dt=reset || reducedMotion ? 0 : dt;
    sample.reset=reset;
    return sample;
  }
}
