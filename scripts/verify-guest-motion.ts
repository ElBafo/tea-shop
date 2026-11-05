import assert from 'node:assert/strict';
import { GuestMotion, GuestRoster, guestProfileForVisit, shortestGuestTurn } from '../src/shop/guest-motion';
import type { GuestFrame } from '../src/shop/guest-traffic';

const frame=(overrides:Partial<GuestFrame>={}):GuestFrame=>({slot:0,visitId:1,x:0,y:0,z:0,facing:0,pose:'stand',moving:true,phase:'walking',stopKey:null,...overrides});
const near=(actual:number,expected:number,message:string)=>assert.ok(Math.abs(actual-expected)<1e-9,`${message}: ${actual} != ${expected}`);

// A fixed turning target and equal travel have the same presentation at 10/60Hz.
function trace(parts:number){
 const motion=new GuestMotion();motion.update(frame(),0,false,.8);
 for(let i=1;i<=parts;i++)motion.update(frame({x:.72*i/parts,facing:Math.PI/2}),1/parts,false,.8);
 return {...motion.sample};
}
const coarse=trace(10),fine=trace(60);
near(coarse.facing,fine.facing,'turn easing is independent of frame partition');
near(coarse.stridePhase,fine.stridePhase,'stride follows distance, not elapsed frames');
near(coarse.walkWeight,fine.walkWeight,'gait blend is independent of frame partition');
near(coarse.stridePhase,.72/.8*Math.PI*2,'one stride cycle uses the configured world distance');

const wrap=new GuestMotion();wrap.update(frame({facing:Math.PI-.04}),0,false,.8);
const wrapped={...wrap.update(frame({x:.01,facing:-Math.PI+.04}),.016,false,.8)};
assert.ok(wrapped.facing>Math.PI-.04&&wrapped.facing<Math.PI+.04,'yaw takes the short path over the wrap boundary');
assert.ok(Math.abs(shortestGuestTurn(Math.PI-.04,wrapped.facing))<.08,'no full rotation at ±π');

// The approach faces into a chair, but sitting faces out. Once hips use the
// cushion anchor, the feet must not ease through its arms/base on a half-turn.
for(const dt of [0,1/60,.1])for(let rot=0;rot<4;rot++) {
 const seating=new GuestMotion(),outward=rot*Math.PI/2;
 seating.update(frame({x:2.5,z:2.58,facing:outward+Math.PI}),0,false,.56);
 const seated=frame({x:2.5,z:2.58,facing:outward,pose:'sit',moving:false,phase:'activity',stopKey:'armchair:rest'});
 const original=structuredClone(seated),sample=seating.update(seated,dt,false,.56);
 near(sample.facing,outward,'first seated frame aligns with the actual cushion even on a zero-dt repaint');
 assert.deepEqual(seated,original,'seating alignment cannot change the route position or pose');
 const next=seating.update(frame({x:2.5,z:2.65,facing:outward+Math.PI/2}),1/60,false,.56);
 assert.ok(next.facing>outward&&next.facing<outward+Math.PI/2,'walking turn easing resumes after the fixed seat pose');
}

const moving=new GuestMotion();moving.update(frame(),0,false,.8);
const source=frame({x:.05,facing:Math.PI/2}),original=structuredClone(source);
moving.update(source,.05,false,.8);assert.deepEqual(source,original,'presentation cannot mutate traffic data or x/y/z');
const before={...moving.sample};
for(let i=0;i<100;i++)moving.update(source,0,false,.8);
near(moving.sample.facing,before.facing,'style repaints do not turn');
near(moving.sample.stridePhase,before.stridePhase,'style repaints do not step');
near(moving.sample.walkWeight,before.walkWeight,'style repaints do not change gait');
for(let i=0;i<50;i++)moving.update(source,.02,false,.8);
near(moving.sample.stridePhase,before.stridePhase,'a blocked route does not march in place');
assert.ok(moving.sample.walkWeight<.00001,'stationary feet relax to neutral');

const fresh=moving.update(frame({visitId:2,x:4,z:5,facing:-Math.PI/2}),.1,false,.56);
assert.equal(fresh.reset,true);near(fresh.stridePhase,0,'new visitors do not inherit old steps');near(fresh.facing,-Math.PI/2,'new visitors snap to their own entrance direction');
moving.update(frame({visitId:2,x:4.056,z:5,facing:0}),.1,false,.56);
near(moving.sample.stridePhase,Math.PI*.2,'children use a shorter full stride');
const reduced=moving.update(frame({visitId:2,x:4.056,z:5,facing:Math.PI/2,pose:'sit',moving:false}),.1,true,.56);
assert.equal(reduced.reset,true);near(reduced.walkWeight,0,'reduced motion has no gait');near(reduced.facing,Math.PI/2,'reduced motion never interpolates yaw');
const calm={...reduced};moving.update(frame({visitId:2,x:4.056,z:5,facing:Math.PI/2,pose:'sit',moving:false}),100,true,.56);
near(moving.sample.stridePhase,calm.stridePhase,'reduced motion stays static');
moving.clear();assert.equal(moving.update(frame(),.1,false,.8).reset,true,'Edit clears the pooled presentation');
moving.update(frame({x:.02,facing:Math.PI/2}),.02,false,.8);
moving.update(frame({x:.02,facing:Math.PI/2}),0,false,.8,true);
near(moving.sample.walkWeight,0,'resume resets limb interpolation');near(moving.sample.stridePhase,0,'resume never catches up missed steps');

const roster=['woman-a','child-a','man-a','woman-b','child-b','man-b'];
assert.deepEqual(Array.from({length:6},(_,i)=>guestProfileForVisit(i+1,roster,[])),roster,'first six visits show the entire interleaved cast');
assert.equal(guestProfileForVisit(7,roster,['woman-a']),'child-a','concurrent visitors never use the same profile');
assert.equal(guestProfileForVisit(1,roster,[]),guestProfileForVisit(1,roster,[]),'assignment is stable and deterministic');
assert.throws(()=>guestProfileForVisit(1,[],[]));
const sessionRoster=new GuestRoster(roster);
assert.equal(sessionRoster.next(),'woman-a');
// Passing one cursor into another scene continues variety after a puzzle visit.
const nextSceneRoster=sessionRoster;
assert.equal(nextSceneRoster.next(),'child-a');
assert.equal(nextSceneRoster.next(),'man-a');
nextSceneRoster.reset();assert.equal(nextSceneRoster.next(['woman-a']),'child-a');
console.log('PASS: distance-driven stride, angular-wrap/frame-partition easing, fixed seat-facing alignment, repaint/blocked/reduced/reset behavior, immutable route frames and per-visit roster variety.');
