// Exercise the actual edition-gated routing modules in Vite's three app modes.
// The checks cover reachable seating, the reserved approach and traffic reset;
// rendered adult/child cushion contact is checked with the chair art/browser pass.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=['shop/guest-routes','shop/guest-traffic','shop/upgrades','shop/grid'];
const entry=files.map(file=>'export * from '+JSON.stringify(root+'src/'+file+'.ts')+';').join('\n');
async function mode(name,base,search='') {
  const id='virtual:edition-seating';
  const result=await build({configFile:false,root,logLevel:'silent',base,
    plugins:[{name:'seating-entry',resolveId:source=>source===id?'\0'+id:null,load:source=>source==='\0'+id?entry:null}],
    build:{write:false,ssr:true,rollupOptions:{input:id,output:{format:'es'}}}});
  Object.assign(globalThis,{location:{pathname:base,search}});
  const code=result.output.find(item=>item.type==='chunk').code+'\n// '+name;
  return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
}
const p=(x,z,rot=0)=>({x,z,rot});
const shop=(places,style={},stored=[])=>({owned:Object.keys(places),place:structuredClone(places),style:{...style},stored:[...stored],finaleSeen:false});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≈ ${b}`);
const key=point=>`${Math.floor(point.x)},${Math.floor(point.z)}`;
const normals=[{x:0,z:1},{x:1,z:0},{x:0,z:-1},{x:-1,z:0}];
const stopOf=layout=>layout.stops.find(stop=>stop.key==='armchair:rest');

for(const [name,base,search] of [['original','/tea-shop/','?edition=1'],['ordinary-preview','/tea-shop/preview/','']]) {
  const api=await mode(name,base,search);
  const original=shop({armchair:p(2,2)});
  assert.equal(stopOf(api.buildGuestLayout(original)),undefined,'Original and ordinary-preview chair behavior stays unchanged');
  const traffic=new api.GuestTraffic(original,()=>.5);
  for(let i=0;i<60;i++)traffic.tick(.1,true);
  const visits=traffic.snapshot();
  traffic.update({...original,style:{armchair:2}});
  assert.deepEqual(traffic.snapshot(),visits,'Classic free chair styles do not invalidate unrelated visitors');
}

const released=await mode('released-second-edition','/tea-shop/');
assert.ok(stopOf(released.buildGuestLayout(shop({armchair:{...released.UPGRADE_BY_ID.armchair.defaultPlace}}))), 'The new released edition uses the reachable Reading chair seat');

const api=await mode('second-edition','/tea-shop/preview/','?edition=2');
let checkedSeats=0;
for(let style=0;style<3;style++)for(let rot=0;rot<4;rot++) {
  const normal=normals[rot],state=shop({armchair:p(2,2,rot)},{armchair:style});
  const snapshot=JSON.stringify(state),layout=api.buildGuestLayout(state),stop=stopOf(layout);
  assert.ok(stop,`Style ${style}, rotation ${rot} can be reached from its open front`);
  assert.equal(layout.stops.filter(s=>s.key.startsWith('armchair:')).length,1,'One chair reserves one seat');
  assert.equal(stop.kind,'sit');
  close(stop.point.x,2.5+normal.x);close(stop.point.z,2.5+normal.z);
  close(stop.seat.point.x,2.5+normal.x*.08);close(stop.seat.point.z,2.5+normal.z*.08);
  close(stop.seat.facing,rot*Math.PI/2);assert.equal(stop.seat.elevation,0);
  assert.ok(layout.blocked.has(key(stop.seat.point)),'Only final seat approach enters chair footprint');
  const route=api.routeGuest(layout,layout.entry,stop.point);
  assert.ok(route?.length);
  for(let i=0;i<route.length;i++) {
    assert.equal(layout.blocked.has(key(route[i])),false,'Walking does not enter furniture');
    if(i)close(Math.abs(route[i].x-route[i-1].x)+Math.abs(route[i].z-route[i-1].z),1);
  }
  for(let sample=0;sample<=40;sample++) {
    const t=sample/40,x=stop.point.x+(stop.seat.point.x-stop.point.x)*t,z=stop.point.z+(stop.seat.point.z-stop.point.z)*t;
    const angle=rot*Math.PI/2,localX=(x-2.5)*Math.cos(angle)-(z-2.5)*Math.sin(angle),localZ=(x-2.5)*Math.sin(angle)+(z-2.5)*Math.cos(angle);
    close(localX,0);assert.ok(localZ>=.08-1e-8,'Approach stays in front of the backrest, between the arms');
  }
  const blocked=shop({armchair:p(2,2,rot),plant:p(2+normal.x,2+normal.z)},{armchair:style});
  assert.equal(stopOf(api.buildGuestLayout(blocked)),undefined,'Furniture in front blocks the seat instead of forcing entry from the side/back');
  blocked.stored=['plant'];
  assert.ok(stopOf(api.buildGuestLayout(blocked)),'Storing the obstruction opens the approach');
  state.stored=['armchair'];
  assert.equal(stopOf(api.buildGuestLayout(state)),undefined,'Stored chairs cannot attract a seated visit');
  state.stored=[];assert.equal(JSON.stringify(state),snapshot,'Building routes never mutates paid progress');
  checkedSeats++;
}
for(const place of [p(4,5,0),p(5,3,1),p(2,0,2),p(0,2,3)]) {
  assert.equal(stopOf(api.buildGuestLayout(shop({armchair:place}))),undefined,'An outward-facing edge chair has no invented off-grid approach');
  const inward={...place,rot:(place.rot+2)%4};
  assert.ok(stopOf(api.buildGuestLayout(shop({armchair:inward}))),'Turning an edge chair inward makes it usable');
}
assert.equal(stopOf(api.buildGuestLayout(shop({armchair:p(2,2),counter:p(2,4)}))),undefined,'Reserved counter staff aisle blocks the chair approach');

// A dense room makes reservations overlap in time. All physical route stages,
// including entering/exiting the seat, must preserve person/furniture clearance.
const core=api.UPGRADES.filter(d=>!d.optional);
const busy=shop({...Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}])),armchair:p(1,3)});
assert.ok(stopOf(api.buildGuestLayout(busy)));
const events=[];
for(let style=0;style<3;style++)for(const reduced of [false,true]) {
  const state=shop({armchair:p(2,2)},{armchair:style});
  const traffic=new api.GuestTraffic(state,()=>.5),layout=api.buildGuestLayout(state),positions=new Map();
  let seated=0;
  for(let i=0;i<3600;i++) {
    traffic.tick(.1,reduced);
    const frames=traffic.snapshot();
    assert.ok(frames.length<=2);assert.ok(frames.filter(f=>f.moving).length<=1);
    const reservations=frames.flatMap(f=>f.stopKey?[f.stopKey]:[]);
    assert.equal(new Set(reservations).size,reservations.length,'Two guests never reserve the same chair');
    if(frames.length===2)assert.ok(Math.hypot(frames[0].x-frames[1].x,frames[0].z-frames[1].z)>.5);
    for(const frame of frames) {
      if(frame.pose==='sit') {
        assert.equal(frame.stopKey,'armchair:rest');close(frame.x,2.5);close(frame.z,2.58);close(frame.y,0);close(frame.facing,0);seated++;
      }
      if(reduced) {
        assert.equal(frame.phase,'activity');assert.equal(frame.moving,false);
        const point={x:frame.x,y:frame.y,z:frame.z};
        if(positions.has(frame.visitId))assert.deepEqual(point,positions.get(frame.visitId),'Reduced-motion sitter remains stationary for its whole visit');
        positions.set(frame.visitId,point);
      } else if(['entering','walking','waiting','leaving'].includes(frame.phase)&&frame.x>=0&&frame.z>=0&&frame.x<6&&frame.z<6) {
        assert.equal(layout.blocked.has(key(frame)),false,'General walking remains outside the chair');
      }
    }
  }
  assert.ok(seated>0&&traffic.stats.arrivals>2&&traffic.stats.departures>1,'Reachable chairs support complete visits, including departure');
  events.push({style,reduced,...traffic.stats});
}
let seed=2408;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const traffic=new api.GuestTraffic(busy,random),layout=api.buildGuestLayout(busy);
let maximum=0,minSeparation=Infinity,chairVisits=0;
for(let i=0;i<9000;i++) {
  traffic.tick(.1);
  const frames=traffic.snapshot();maximum=Math.max(maximum,frames.length);
  assert.ok(frames.length<=2&&frames.filter(f=>f.moving).length<=1);
  const reserved=frames.flatMap(f=>f.stopKey?[f.stopKey]:[]);
  assert.equal(new Set(reserved).size,reserved.length);
  if(frames.length===2) {
    const separation=Math.hypot(frames[0].x-frames[1].x,frames[0].z-frames[1].z);
    minSeparation=Math.min(minSeparation,separation);assert.ok(separation>.5);
  }
  for(const frame of frames) {
    if(frame.stopKey==='armchair:rest'&&frame.pose==='sit')chairVisits++;
    if(['entering','walking','waiting','leaving'].includes(frame.phase)&&frame.x>=0&&frame.z>=0&&frame.x<6&&frame.z<6) {
      assert.equal(layout.blocked.has(key(frame)),false,'Busy-room routes avoid furniture and the counter staff aisle');
    }
  }
}
assert.equal(maximum,2);assert.ok(chairVisits>0);assert.ok(traffic.stats.departures>10,'The reserved chair approach does not deadlock busy arrivals');

const resetShop=shop({armchair:p(2,2)},{armchair:0}),reset=new api.GuestTraffic(resetShop,()=>.5);
for(let i=0;i<60;i++)reset.tick(.1,true);
assert.equal(reset.snapshot()[0].stopKey,'armchair:rest');
const before=reset.arrivalIn,count=reset.furnishing;
reset.update({...resetShop,style:{armchair:2}});
assert.deepEqual(reset.snapshot(),[],'Restyling clears a sitter before chair geometry is rebuilt');
assert.equal(reset.arrivalIn,before);assert.equal(reset.furnishing,count,'Free styles do not change arrival frequency');
for(let i=0;i<1200&&!reset.snapshot().length;i++)reset.tick(.1,true);
assert.equal(reset.snapshot()[0].stopKey,'armchair:rest');
reset.setEditing(true);assert.deepEqual(reset.snapshot(),[]);
const clock=reset.arrivalIn;for(let i=0;i<1200;i++)reset.tick(.1,true);assert.equal(reset.arrivalIn,clock);
reset.setEditing(false);reset.update({...resetShop,stored:['armchair']});
for(let i=0;i<1200;i++){reset.tick(.1,true);assert.ok(reset.snapshot().every(frame=>frame.pose!=='sit'),'Stored chair remains unavailable');}
reset.update(resetShop);assert.deepEqual(reset.snapshot(),[]);
for(let i=0;i<1200&&!reset.snapshot().length;i++)reset.tick(.1,true);
assert.equal(reset.snapshot()[0].stopKey,'armchair:rest');
reset.update({...resetShop,place:{armchair:p(4,5)}});assert.deepEqual(reset.snapshot(),[]);
for(let i=0;i<1200;i++){reset.tick(.1,true);assert.ok(reset.snapshot().every(frame=>frame.pose!=='sit'),'Moving chair to an inaccessible edge never teleports a seated guest');}

console.log('PASS: edition-only Reading chair, all 12 style/rotation approaches, blocked/stored/edge/staff-aisle safety, exact seat anchors, bounded reservations, complete arrivals/departures, reduced motion, Edit and style/placement resets.',{checkedSeats,events,busy:traffic.stats,maximum,minSeparation});
