// Exercise the actual game modules in each Vite mode, without a browser or a
// special production flag. Builds are in memory and never write app artifacts.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=['game/types','game/backup','game/storage','game/resume','game/goal','game/journey','shop/upgrades'];
const entry=files.map(file=>`export * from ${JSON.stringify(root+'src/'+file+'.ts')};`).join('\n');
const emptyShop=()=>({owned:[],stored:[],style:{},place:{},finaleSeen:false});
const persisted=value=>JSON.parse(JSON.stringify(value));
const progress=(count,completed=count,score=3)=>({muted:true,bestStars:Array.from({length:count},(_,i)=>i<completed?score:0),bestMoves:Array.from({length:count},(_,i)=>i<completed?i+3:0),shop:emptyShop()});
const file=(value,puzzle=null,edition)=>JSON.stringify({format:'decopu-save',version:1,exportedAt:'2026-11-04T00:00:00.000Z',...(edition===undefined?{}:{edition}),progress:value,puzzle});

async function mode(name,base,search){
  const id='virtual:edition-compat';
  const result=await build({configFile:false,root,logLevel:'silent',base,
    plugins:[{name:'compat-entry',resolveId:source=>source===id?'\0'+id:null,load:source=>source==='\0'+id?entry:null}],
    build:{write:false,ssr:true,rollupOptions:{input:id,output:{format:'es'}}}});
  const values=new Map();
  Object.assign(globalThis,{location:{pathname:base,search},window:new EventTarget(),localStorage:{
    getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),
  }});
  const code=result.output.find(item=>item.type==='chunk').code+'\n// '+name;
  const api=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  return {api,values};
}

for(const [name,base] of [['released','/tea-shop/'],['ordinary-preview','/tea-shop/preview/']]){
  const {api}=await mode(name,base,'');
  assert.equal(api.LEVEL_COUNT,38);
  assert.equal(api.STORAGE_KEY,name==='released'?'tea-shop-progress-v1':'tea-shop-preview-progress-v1');
  const original=progress(38);
  assert.deepEqual(api.parseBackup(file(original)).progress,original,'untagged classic backups remain accepted');
  const exported=api.exportBackup(original,null);
  assert.equal(JSON.parse(exported).edition,'classic');
  assert.deepEqual(api.parseBackup(exported).progress,original);
  for(const count of [10,16])for(const tag of [undefined,'second-edition','classic']){
    assert.throws(()=>api.parseBackup(file(progress(count),null,tag)),'classic rejects prototype progress, even with a forged classic tag');
  }
  for(const tag of ['second-edition','unknown',null,2])assert.throws(()=>api.parseBackup(file(original,null,tag)));
  assert.equal(api.collectionUnlocked('terrarium',Array(7).fill(1)),false);
  assert.equal(api.collectionUnlocked('terrarium',Array(8).fill(1)),true,'classic gate stays eight');
  assert.equal(api.totalStars(original),132,'classic bonuses and earning capacity stay unchanged');
}

const {api,values}=await mode('second-edition','/tea-shop/preview/','?edition=2');
assert.equal(api.LEVEL_COUNT,16);
assert.equal(api.STORAGE_KEY,'tea-shop-preview-edition2-progress-v1');
const key=api.STORAGE_KEY;
const legacy=progress(10);
const owned=api.DECORATIONS.filter(item=>!item.optional||['art','bench'].includes(item.id));
legacy.shop={owned:owned.map(item=>item.id),stored:['bench'],style:Object.fromEntries(owned.map((item,i)=>[item.id,i%3])),place:Object.fromEntries(owned.map(item=>[item.id,{...item.defaultPlace}])),finaleSeen:true};
legacy.shop.place.bench={x:0,z:4,rot:1};
const oldPuzzle={version:1,levelId:10,actions:[[0,4]]};
const expected={...structuredClone(legacy),bestStars:[...legacy.bestStars,...Array(6).fill(0)],bestMoves:[...legacy.bestMoves,...Array(6).fill(0)]};
for(const tag of [undefined,'second-edition']){
  const parsed=api.parseBackup(file(legacy,oldPuzzle,tag));
  assert.deepEqual(persisted(parsed.progress),expected,'old scores, style, stored furniture, placements and mute survive padding');
  assert.deepEqual(parsed.puzzle,oldPuzzle,'unfinished old puzzle retains its action history');
  assert.equal(api.validatePuzzle(parsed.puzzle,parsed.progress).history.length,1);
  assert.equal(api.totalStars(parsed.progress),46,'six new slots grant no unearned stars');
  assert.equal(api.spendableStars(parsed.progress),6,'old spending remains exact');
}
assert.deepEqual(legacy.bestStars,Array(10).fill(3),'parsing does not mutate the historical input');

// Local primary/recovery paths share the same padding without changing keys.
values.set('tea-shop-progress-v1','released sentinel');
values.set('tea-shop-preview-progress-v1','ordinary preview sentinel');
values.set('tea-shop-preview-edition2-appearance-v1','night');
values.set(key,JSON.stringify(legacy));
values.set(key+':puzzle-v1',JSON.stringify(oldPuzzle));
values.set(key+':goal-v1',JSON.stringify({id:'clock',style:2}));
assert.deepEqual(persisted(api.loadProgress()),expected);
assert.deepEqual(api.readPuzzle(expected).save,oldPuzzle);
assert.deepEqual(api.readGoal(expected),{id:'clock',style:2});
assert.equal(api.saveProgress(expected),true);
assert.deepEqual(JSON.parse(values.get(key)),expected);
assert.deepEqual(JSON.parse(values.get(key+':recovery')),legacy,'prior ten-board progress remains a recovery slot');
values.set(key,'{damaged');
assert.deepEqual(persisted(api.loadProgress()),expected,'damaged primary recovers and pads the old save');
assert.equal(values.get('tea-shop-progress-v1'),'released sentinel');
assert.equal(values.get('tea-shop-preview-progress-v1'),'ordinary preview sentinel');
assert.equal(values.get('tea-shop-preview-edition2-appearance-v1'),'night');

const current=progress(16);
const tagged=api.exportBackup(current,null);
assert.equal(JSON.parse(tagged).edition,'second-edition');
assert.deepEqual(api.parseBackup(tagged).progress,current);
assert.deepEqual(api.parseBackup(file(current)).progress,current,'untagged current files are still unambiguous by length');
for(const count of [0,9,11,12,15,17,38])assert.throws(()=>api.parseBackup(file(progress(count))),'unknown sequence lengths must not be padded');
for(const tag of ['classic','future-edition',null,2])assert.throws(()=>api.parseBackup(file(current,null,tag)));
assert.throws(()=>api.parseBackup(file({...legacy,bestMoves:Array(16).fill(0)})),'mixed score-array lengths rejected');
assert.throws(()=>api.parseBackup(file({...current,bestStars:[...Array(15).fill(3),3.5]})),'fractional stars rejected');
assert.throws(()=>api.parseBackup(file({...current,bestMoves:[...Array(15).fill(0),-1]})),'negative moves rejected');
for(const id of ['terrarium','botanical']){
  const invalid=structuredClone(legacy);invalid.shop.owned.push(id);
  assert.throws(()=>api.parseBackup(file(invalid)),'historical files cannot claim decorations absent from that edition');
  const locked=progress(16,10);locked.shop.owned=[id];
  assert.throws(()=>api.parseBackup(file(locked)),'current-size files cannot bypass later milestone gates with sufficient stars');
}
assert.throws(()=>api.parseBackup(file(legacy,{version:1,levelId:11,actions:[]})),'ten-board files cannot contain a later puzzle');
assert.throws(()=>api.parseBackup(file(legacy,{version:1,levelId:10,actions:[[0,0]]})),'invalid action history rejected');
const broke=progress(16,0);broke.shop.owned=['counter'];
assert.throws(()=>api.parseBackup(file(broke)),'negative star balance rejected');

for(const [id,gate,cost] of [['terrarium',13,10],['botanical',16,14]]){
  assert.equal(api.collectionUnlocked(id,Array(gate-1).fill(3)),false);
  assert.equal(api.collectionUnlocked(id,Array(gate).fill(1)),true,'completion unlocks purchase regardless of score quality');
  assert.equal(api.UPGRADE_BY_ID[id].cost,cost);
}
assert.match(api.milestoneAt(13),/Glass garden.*Available to buy for 10/);
assert.match(api.milestoneAt(16),/\+4 stars.*Botanical triptych.*Available to buy for 14/);
const before=progress(16,15,1),last=api.recordWin(before,15,1,30);
assert.equal(api.totalStars(before),31);
assert.equal(api.totalStars(last),36,'last first completion earns one puzzle star plus four milestone stars');
assert.deepEqual(last.shop.owned,[],'unlock never grants free furniture');
assert.equal(api.totalStars(api.recordWin(last,15,1,30)),36,'replays cannot farm milestone rewards');
assert.equal(api.totalStars(api.recordWin(last,15,3,10)),38,'better scores grant only the improvement');
assert.equal(api.totalStars(current),68);
const least=progress(16,16,1);least.shop={...structuredClone(expected.shop),owned:[...api.DECORATIONS.filter(item=>!item.optional).map(item=>item.id),'terrarium'],stored:[],style:{},place:{},finaleSeen:true};
assert.equal(api.spendableStars(least),0,'minimum earnings exactly fund the core and Glass garden');
assert.equal(api.parseBackup(file(least)).progress.bestStars.length,16);
console.log('PASS: real-mode ten→sixteen save/backup/recovery/resume compatibility, edition isolation, strict import guards, new gates and non-farmable 36–68-star progression.');
