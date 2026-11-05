import assert from 'node:assert/strict';
import { FIRST_GUEST_DELAY, GuestTraffic, furnishingCount, guestArrivalRange } from '../src/shop/guest-traffic';
import { buildGuestLayout } from '../src/shop/guest-routes';
import { emptyShop, UPGRADES } from '../src/shop/upgrades';
import type { ShopState } from '../src/game/types';

const core=UPGRADES.filter(d=>!d.optional);
const furnished:ShopState={...emptyShop(),owned:core.map(d=>d.id),place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}]))};
const input=JSON.stringify(furnished);
function simulate(shop:ShopState, seconds:number, reduced=false){
 const traffic=new GuestTraffic(shop,()=>.5),layout=buildGuestLayout(shop);
 let maximum=0,total=0;const poses=new Set<string>(),visits=new Map<number,{x:number,z:number}>();
 for(let i=0;i<seconds*10;i++){
  traffic.tick(.1,reduced);const frames=traffic.snapshot();maximum=Math.max(maximum,frames.length);total+=frames.length;
  assert.ok(frames.length<=2,'at most two visible guests');
  assert.ok(frames.filter(f=>f.moving).length<=1,'single transit avoids crossing in tiny corridors');
  const stops=frames.flatMap(f=>f.stopKey?[f.stopKey]:[]);
  assert.equal(new Set(stops).size,stops.length,'activity and seat reservations are unique');
  for(const f of frames){
   poses.add(f.pose);assert.ok(Number.isFinite(f.x)&&Number.isFinite(f.z));
   if(reduced){
    assert.equal(f.moving,false);assert.equal(f.phase,'activity');
    if(visits.has(f.visitId))assert.deepEqual({x:f.x,z:f.z},visits.get(f.visitId),'reduced-motion guests never translate during a visit');
    visits.set(f.visitId,{x:f.x,z:f.z});
   }else if(['walking','waiting','entering','leaving'].includes(f.phase) && f.x>=0 && f.z>=0 && f.x<6 && f.z<6){
    assert.equal(layout.blocked.has(`${Math.floor(f.x)},${Math.floor(f.z)}`),false,'walking stays out of furniture and the counter working aisle');
   }
  }
  if(frames.length===2)assert.ok(Math.hypot(frames[0].x-frames[1].x,frames[0].z-frames[1].z)>.4,'guests never overlap');
 }
 return {traffic,maximum,mean:total/(seconds*10),poses};
}
const sparse=simulate(emptyShop(),600),busy=simulate(furnished,600),calm=simulate(furnished,300,true);
assert.equal(busy.maximum,2);assert.ok(busy.mean>1,'a furnished core shop generally has company');
assert.ok(busy.traffic.stats.arrivals>sparse.traffic.stats.arrivals*2,'displayed decor creates meaningfully more arrivals');
assert.ok(sparse.traffic.stats.departures>0 && busy.traffic.stats.departures>0,'visits end, freeing slots for new guests');
for(const pose of ['browse','order','sit'])assert.ok(busy.poses.has(pose),`${pose} activity occurs when furniture supports it`);
assert.ok(calm.traffic.stats.departures>0);assert.equal(JSON.stringify(furnished),input,'traffic never changes inventory or placements');
assert.equal(furnishingCount(furnished),8);
assert.equal(furnishingCount({...furnished,owned:[...furnished.owned,'plant:2']}),8,'second copies do not farm arrival density');
assert.equal(furnishingCount({...furnished,stored:['plant','counter']}),6,'stored pieces do not count');
assert.equal(furnishingCount({...emptyShop(),owned:['paint']}),1,'fixed wall finish counts once actually bought');
for(let n=1;n<=8;n++){assert.ok(guestArrivalRange(n)[0]<guestArrivalRange(n-1)[0]);assert.ok(guestArrivalRange(n)[1]<guestArrivalRange(n-1)[1]);}
assert.deepEqual(guestArrivalRange(14),guestArrivalRange(8),'core eight suffices for the busy target');

const edit=new GuestTraffic(furnished,()=>.5);
for(let i=0;i<(FIRST_GUEST_DELAY+2)*10;i++)edit.tick(.1);
assert.equal(edit.snapshot().length,1);const before=edit.arrivalIn;
edit.setEditing(true);assert.deepEqual(edit.snapshot(),[]);
const paused=edit.arrivalIn;for(let i=0;i<10000;i++)edit.tick(.1);
assert.equal(edit.arrivalIn,paused,'Edit pauses the arrival countdown');
edit.setEditing(false);assert.deepEqual(edit.snapshot(),[]);
assert.ok(edit.arrivalIn>=2 && edit.arrivalIn<=before,'Edit resumes without an immediate burst');
const time=edit.arrivalIn;edit.tick(3600);assert.ok(time-edit.arrivalIn<=.10001,'background/slow frames cannot catch up missed hours');
for(let i=0;i<200;i++)edit.tick(.1);
const active=edit.snapshot().map(f=>f.visitId);assert.ok(active.length);
edit.update({...furnished,style:{paint:2,lamp:1}});
assert.deepEqual(edit.snapshot().map(f=>f.visitId),active,'free style changes do not affect traffic density or restart a visit');
edit.update({...furnished,stored:['table','counter']});assert.deepEqual(edit.snapshot(),[],'layout changes invalidate active routes immediately');
for(let i=0;i<1200;i++){edit.tick(.1);assert.ok(edit.snapshot().every(f=>f.pose!=='sit'&&f.pose!=='order'));}
edit.clear();assert.deepEqual(edit.snapshot(),[]);

// An inaccessible room does not force a spawn through furniture.
const blocked:ShopState={...emptyShop(),owned:['counter','table','table:2','bench','cabinet','armchair','plant','lamp','basket','planter','terrarium','fountain'],place:{counter:{x:0,z:1,rot:0},table:{x:0,z:4,rot:0},'table:2':{x:2,z:4,rot:0},bench:{x:4,z:5,rot:0},cabinet:{x:4,z:4,rot:0},armchair:{x:5,z:3,rot:0},plant:{x:5,z:2,rot:0},lamp:{x:5,z:1,rot:0},basket:{x:5,z:0,rot:0},planter:{x:4,z:0,rot:0},terrarium:{x:4,z:1,rot:0},fountain:{x:4,z:2,rot:0}}};
const closed=new GuestTraffic(blocked,()=>.5);for(let i=0;i<3000;i++)closed.tick(.1);
assert.equal(closed.stats.arrivals,0);assert.deepEqual(closed.snapshot(),[]);
// Regression: the entrance can also be a chair's reserved approach. A new
// arrival must not stand there while an existing seated guest gets up.
const entranceSeat:ShopState={...emptyShop(),owned:['paint','shelves','plant','table','art','clock','basket','planter'],place:{
 paint:{x:4,z:4,rot:1},shelves:{x:0,z:1,rot:2,wall:'back'},plant:{x:5,z:1,rot:0},table:{x:2,z:3,rot:3},
 art:{x:0,z:1,rot:3,wall:'left'},clock:{x:4,z:1,rot:3,wall:'left'},basket:{x:3,z:0,rot:0},planter:{x:0,z:5,rot:0},
}};
const narrow=simulate(entranceSeat,1200);
assert.ok(narrow.traffic.stats.departures>10,'a reserved entrance neither collides nor traps guests indefinitely');
const benchShop:ShopState={...emptyShop(),owned:['bench'],style:{bench:0},place:{bench:{x:2,z:2,rot:0}}};
const benchTraffic=new GuestTraffic(benchShop,()=>.5);
for(let i=0;i<60;i++)benchTraffic.tick(.1,true);
assert.equal(benchTraffic.snapshot()[0].y,.125);
const benchCountdown=benchTraffic.arrivalIn;
benchTraffic.update({...benchShop,style:{bench:2}});
assert.equal(benchTraffic.arrivalIn,benchCountdown,'seat style refreshes geometry without changing the arrival clock');
for(let i=0;i<1000&&!benchTraffic.snapshot().length;i++)benchTraffic.tick(.1,true);
assert.equal(benchTraffic.snapshot()[0].y,.175,'seated guests use the actual bench cushion height');
console.log('PASS: bounded arrivals/departures, furnishing-driven frequency, unique activities/seats, clear routes, Edit/reset/background behavior, static reduced motion and unchanged progress.',{sparse:sparse.traffic.stats,busy:busy.traffic.stats,meanGuests:busy.mean});
