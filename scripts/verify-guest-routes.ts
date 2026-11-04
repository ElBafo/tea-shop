import assert from 'node:assert/strict';
import type { Placement, ShopState, UpgradeId } from '../src/game/types';
import { emptyShop, UPGRADES, UPGRADE_BY_ID } from '../src/shop/upgrades';
import { counterCells, floorCells, floorCenter } from '../src/shop/grid';
import { buildGuestLayout, routeGuest, type GuestLayout, type GuestPoint, type GuestStop } from '../src/shop/guest-routes';

function shop(places:Partial<Record<UpgradeId,Placement>>, stored:UpgradeId[]=[]):ShopState {
  return {...emptyShop(),owned:Object.keys(places) as UpgradeId[],place:structuredClone(places),stored};
}
const p=(x:number,z:number,rot=0):Placement=>({x,z,rot});
const pointKey=(point:GuestPoint)=>`${Math.floor(point.x)},${Math.floor(point.z)}`;
function assertRoute(layout:GuestLayout, from:GuestPoint, to:GuestPoint, avoid:GuestPoint[]=[]) {
  const route=routeGuest(layout,from,to,avoid);
  assert.ok(route,`Expected route from ${JSON.stringify(from)} to ${JSON.stringify(to)}`);
  assert.deepEqual(route[0],from);
  assert.deepEqual(route.at(-1),to);
  for(let i=0;i<route.length;i++) {
    assert.equal(layout.blocked.has(pointKey(route[i])),false,'Route cannot enter a furniture/working-aisle cell');
    assert.equal(avoid.some(a=>pointKey(a)===pointKey(route[i]) && pointKey(a)!==pointKey(from)),false,'Temporary occupancy is avoided');
    if(i) assert.equal(Math.abs(route[i].x-route[i-1].x)+Math.abs(route[i].z-route[i-1].z),1,'No diagonal corner cuts or teleports');
  }
  return route;
}
function assertSeatApproach(state:ShopState, id:UpgradeId, stop:GuestStop) {
  assert.ok(stop.seat);
  const path=[stop.point,...(stop.seat.via??[]),stop.seat.point];
  const center=floorCenter(UPGRADE_BY_ID[id].size,state.place[id]!);
  const angle=state.place[id]!.rot*Math.PI/2;
  for(let segment=1;segment<path.length;segment++) for(let sample=0;sample<=36;sample++) {
    const a=path[segment-1],b=path[segment],x=a.x+(b.x-a.x)*sample/36,z=a.z+(b.z-a.z)*sample/36;
    assert.ok(x>=.18&&x<=5.82&&z>=.18&&z<=5.82,'Seat approach stays inside the room with body clearance');
    for(const other of state.owned) {
      if(other===id || state.stored?.includes(other)) continue;
      const def=UPGRADE_BY_ID[other];if(def.surface!=='floor'||def.layer!=='furn')continue;
      const cells=other==='counter'?counterCells(state.place[other]!):floorCells(def.size,state.place[other]!);
      for(const c of cells) {
        const dx=Math.max(c.x-x,0,x-c.x-1),dz=Math.max(c.z-z,0,z-c.z-1);
        assert.ok(Math.hypot(dx,dz)>=.18,'Every seat segment clears other furniture and the staff aisle');
      }
    }
    if(id==='table') {
      const localX=(x-center.x)*Math.cos(angle)-(z-center.z)*Math.sin(angle);
      const localZ=(x-center.x)*Math.sin(angle)+(z-center.z)*Math.cos(angle);
      assert.ok(Math.hypot(localX,localZ)>=.75,'Guest torso clears the round tabletop');
      assert.ok(Math.hypot(Math.max(Math.abs(localX)-.565,0),Math.max(Math.abs(localZ)-.535,0))>=.15,'Guest torso clears rectangular tabletops');
      for(const side of [-1,1]) assert.ok(Math.abs(localX-side*.94)>.04||Math.abs(localZ)>.215,'Seat path goes around, not through, the chair back');
    }
  }
}

const bare=buildGuestLayout(emptyShop());
assert.deepEqual(bare.entry,{x:3.5,z:5.5});
assert.deepEqual(bare.doorway,{x:3.5,z:6.28});
assert.equal(bare.walkable.length,36);
assert.equal(bare.stops.filter(s=>s.kind==='look').length,2,'An empty room supports two distinct look-around reservations');
assert.equal(assertRoute(bare,bare.entry!,{x:2.5,z:2.5}).length,5,'Shortest orthogonal route through an empty room');
assert.equal(routeGuest(bare,{x:3,z:5.5},{x:2.5,z:2.5}),null,'Route inputs must be cell centres, not seat/doorway points');
assert.equal(routeGuest(bare,bare.entry!,bare.doorway!),null,'Runtime owns the short doorway transition');
const avoided=[{x:3.5,z:4.5},{x:2.5,z:4.5}];
assertRoute(bare,bare.entry!,{x:2.5,z:2.5},avoided);
assert.equal(routeGuest(bare,bare.entry!,{x:2.5,z:2.5},[{x:2.5,z:2.5}]),null,'Occupied destinations cannot be reserved');
assert.deepEqual(routeGuest(bare,bare.entry!,bare.entry!,[bare.entry!]),[bare.entry!],'A visitor can leave its starting occupied cell');

const expectedFront=[{x:3.5,z:3.5},{x:3.5,z:3.5},{x:3.5,z:1.5},{x:1.5,z:3.5}];
for(let rot=0;rot<4;rot++) {
  const state=shop({counter:p(2,2,rot)}), layout=buildGuestLayout(state);
  const order=layout.stops.find(s=>s.kind==='order')!;
  assert.ok(order,`Counter rotation ${rot} has customer-side access`);
  assert.deepEqual(order.point,expectedFront[rot],`Counter rotation ${rot} uses its front, never staff aisle`);
  const center=floorCenter(UPGRADE_BY_ID.counter.size,state.place.counter!);
  assert.ok(Math.abs(Math.sin(order.facing)-(center.x-order.point.x)/Math.hypot(center.x-order.point.x,center.z-order.point.z))<1e-8);
  for(const c of counterCells(state.place.counter!)) {
    assert.ok(layout.blocked.has(`${c.x},${c.z}`),'Counter and its entire rear aisle are excluded');
    assert.equal(routeGuest(layout,layout.entry!,{x:c.x+.5,z:c.z+.5}),null);
  }
  assertRoute(layout,layout.entry!,order.point);
}
const hiddenCounter=buildGuestLayout(shop({counter:p(2,2)},['counter']));
assert.equal(hiddenCounter.blocked.size,0);
assert.equal(hiddenCounter.stops.some(s=>s.kind==='order'),false,'Stored counters cannot receive orders');

const backShelves=buildGuestLayout(shop({shelves:{x:0,z:0,rot:0,wall:'back'},counter:p(1,1)}));
const backBrowse=backShelves.stops.find(s=>s.kind==='browse')!;
assert.deepEqual(backBrowse.point,{x:.5,z:.5},'Shelves can use the only accessible slot beyond the staff aisle');
assert.equal(backBrowse.facing,Math.PI);
assertRoute(backShelves,backShelves.entry!,backBrowse.point);
const leftShelves=buildGuestLayout(shop({shelves:{x:2,z:0,rot:1,wall:'left'}}));
assert.deepEqual(leftShelves.stops.find(s=>s.kind==='browse')!.point,{x:.5,z:3.5});
assert.equal(leftShelves.stops.find(s=>s.kind==='browse')!.facing,-Math.PI/2);
const noBrowse=buildGuestLayout(shop({shelves:{x:0,z:0,rot:0,wall:'back'},counter:p(0,1)}));
assert.equal(noBrowse.stops.some(s=>s.kind==='browse'),false,'An inaccessible shelf cannot lure visitors into the staff aisle');

for(let rot=0;rot<4;rot++) {
  const state=shop({table:p(2,2,rot)}), layout=buildGuestLayout(state);
  const seats=layout.stops.filter(s=>s.kind==='sit');
  assert.equal(seats.length,2,`Both table seats can be reached at rotation ${rot}`);
  assert.notEqual(seats[0].key,seats[1].key);
  for(const stop of seats) {
    assert.ok(stop.seat);
    assert.equal(stop.seat.via?.length,1,'A table chair is entered from its side, around the backrest');
    assertSeatApproach(state,'table',stop);
    assertRoute(layout,layout.entry!,stop.point);
    const offset=Math.hypot(stop.seat.point.x-3,stop.seat.point.z-3);
    assert.ok(Math.abs(offset-.77)<1e-8,'Seat lies on its actual chair, not a guessed cell centre');
    assert.ok(layout.blocked.has(pointKey(stop.seat.point)),'Only the final seating transition enters its own footprint');
    const facingX=Math.sin(stop.seat.facing), facingZ=Math.cos(stop.seat.facing);
    assert.ok((3-stop.seat.point.x)*facingX+(3-stop.seat.point.z)*facingZ>0,'Seated visitor faces the table');
  }
}
const wallTable=buildGuestLayout(shop({table:p(0,2)}));
assert.deepEqual(wallTable.stops.filter(s=>s.kind==='sit').map(s=>s.key),['table:seat:right'],'A chair against a wall is unavailable');
const blockedSide=buildGuestLayout(shop({table:p(2,2),plant:p(4,2),lamp:p(4,3)}));
assert.deepEqual(blockedSide.stops.filter(s=>s.kind==='sit').map(s=>s.key),['table:seat:left']);
const blockedCorner=buildGuestLayout(shop({table:p(2,2),plant:p(1,3)}));
const cornerSeat=blockedCorner.stops.find(s=>s.key==='table:seat:left')!;
assert.deepEqual(cornerSeat.point,{x:1.5,z:2.5});
assert.deepEqual(cornerSeat.seat!.via,[{x:2.23,z:2.55}],'The side waypoint goes around both the backrest and neighbouring furniture');
const cornerPath=[cornerSeat.point,...cornerSeat.seat!.via!,cornerSeat.seat!.point];
for(let segment=1;segment<cornerPath.length;segment++) for(let i=0;i<=40;i++) {
  const a=cornerPath[segment-1],b=cornerPath[segment],x=a.x+(b.x-a.x)*i/40,z=a.z+(b.z-a.z)*i/40;
  const dx=Math.max(1-x,0,x-2),dz=Math.max(3-z,0,z-4);
  assert.ok(Math.hypot(dx,dz)>=.18,'The full chair transition clears the adjacent plant footprint');
}
assertSeatApproach(shop({table:p(2,2),plant:p(1,3)}),'table',cornerSeat);

for(let rot=0;rot<4;rot++) {
  const state=shop({bench:p(2,2,rot)}),layout=buildGuestLayout(state), seat=layout.stops.find(s=>s.key==='bench:read');
  assert.ok(seat,`Bench rotation ${rot} has a reachable reading seat`);
  assertRoute(layout,layout.entry!,seat.point);
  assert.equal(seat.seat!.facing,rot*Math.PI/2);
  assertSeatApproach(state,'bench',seat);
}
assert.equal(buildGuestLayout(shop({bench:p(1,5)})).stops.some(s=>s.key==='bench:read'),false,'A bench facing beyond the room has no walkable front approach');
for(let style=0;style<3;style++) {
  const state=shop({bench:p(2,2)});state.style.bench=style;
  const seat=buildGuestLayout(state).stops.find(s=>s.key==='bench:read')!;
  assert.deepEqual(seat.point,{x:3.5,z:3.5},'Bench styles share their same reachable approach');
  assert.equal(seat.seat!.elevation,[.125,.15,.175][style],'Guest height follows the actual cushion, without changing access');
}

const rugOnly=buildGuestLayout(shop({rug:p(1,2)}));
assert.equal(rugOnly.walkable.length,36,'Rugs are traversable');
const closedEdges=buildGuestLayout(shop({
  lamp:p(0,5),bench:p(1,5),table:p(3,4),plant:p(5,5),basket:p(5,4),
  trolley:p(5,3),planter:p(5,2),terrarium:p(5,1),armchair:p(5,0),
}));
assert.equal(closedEdges.entry,null,'A blocked cutaway perimeter cannot spawn guests through furniture');
assert.equal(closedEdges.doorway,null);
assert.equal(closedEdges.stops.length,0);

const divided=buildGuestLayout(shop({counter:p(0,3),cabinet:p(3,3),planter:p(5,3)}));
assert.equal(divided.entry!.x,5.5,'The open side entrance can reach a larger component than the front');
assert.equal(divided.walkable.length,15);
assert.equal(routeGuest(divided,divided.entry!,{x:2.5,z:5.5}),null,'Disconnected floor areas are not teleported into');

const core=UPGRADES.filter(d=>!d.optional);
const furnished:ShopState={...emptyShop(),owned:core.map(d=>d.id),place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}]))};
const snapshot=JSON.stringify(furnished), layout=buildGuestLayout(furnished);
assert.ok(layout.entry);
for(const kind of ['browse','order','sit']) assert.ok(layout.stops.some(s=>s.kind===kind),`Default core room supports ${kind}`);
for(const stop of layout.stops) {
  assertRoute(layout,layout.entry!,stop.point);
  if(stop.seat) assertSeatApproach(furnished,'table',stop);
}
assert.equal(JSON.stringify(furnished),snapshot,'Layout building never mutates progress');
const restyled=structuredClone(furnished);restyled.style=Object.fromEntries(restyled.owned.map(id=>[id,2]));
assert.deepEqual(buildGuestLayout(restyled),layout,'Any combination of included styles has the same access rules');
assert.deepEqual(buildGuestLayout(furnished),layout,'Routing and stop selection are deterministic');
for(const id of furnished.owned.filter(id=>UPGRADE_BY_ID[id].surface==='floor'&&UPGRADE_BY_ID[id].layer==='furn')) {
  for(const c of floorCells(UPGRADE_BY_ID[id].size,furnished.place[id]!)) assert.ok(layout.blocked.has(`${c.x},${c.z}`));
}
console.log('PASS: guest entrances, orthogonal routes/occupancy avoidance, all counter/table/bench rotations, staff-aisle protection, reachable shelves/seats, corner clearance, rugs/storage, blocked/disconnected layouts, default core activity and style/save invariance.');
