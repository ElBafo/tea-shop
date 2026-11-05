// Exercise the actual game modules in each Vite mode, without a browser or a
// special production flag. Builds are in memory and never write app artifacts.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=['game/types','game/backup','game/storage','game/resume','game/goal','game/journey','shop/upgrades'];
const entry=files.map(file=>'export * from '+JSON.stringify(root+'src/'+file+'.ts')+';').join('\n');
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
  const {api}=await mode(name,base,name==='released'?'?edition=1':'');
  assert.equal(api.LEVEL_COUNT,38);
  assert.equal(api.STORAGE_KEY,name==='released'?'tea-shop-progress-v1':'tea-shop-preview-progress-v1');
  const original=progress(38);
  assert.deepEqual(api.parseBackup(file(original)).progress,original,'untagged classic backups remain accepted');
  const exported=api.exportBackup(original,null);
  assert.equal(JSON.parse(exported).edition,'classic');
  assert.deepEqual(api.parseBackup(exported).progress,original);
  for(const count of [10,16,20,24])for(const tag of [undefined,'second-edition','classic']){
    assert.throws(()=>api.parseBackup(file(progress(count),null,tag)),'classic rejects prototype progress, even with a forged classic tag');
  }
  for(const tag of ['second-edition','unknown',null,2])assert.throws(()=>api.parseBackup(file(original,null,tag)));
  assert.equal(api.collectionUnlocked('terrarium',Array(7).fill(1)),false);
  assert.equal(api.collectionUnlocked('terrarium',Array(8).fill(1)),true,'classic gate stays eight');
  assert.equal(api.collectionUnlocked('cabinet',Array(23).fill(3)),false);
  assert.equal(api.collectionUnlocked('cabinet',Array(24).fill(1)),true,'classic cabinet gate stays twenty-four');
  assert.equal(api.collectionUnlocked('armchair',Array(31).fill(3)),false);
  assert.equal(api.collectionUnlocked('armchair',Array(32).fill(1)),true,'classic chair gate stays thirty-two');
  assert.deepEqual(api.UPGRADE_BY_ID.armchair.defaultPlace,{x:4,z:5,rot:0},'classic chair placement is untouched');
  assert.equal(api.totalStars(original),132,'classic bonuses and earning capacity stay unchanged');
}

const {api,values}=await mode('second-edition','/tea-shop/preview/','?edition=2');
assert.equal(api.LEVEL_COUNT,24);
assert.equal(api.STORAGE_KEY,'tea-shop-preview-edition2-progress-v1');
const key=api.STORAGE_KEY;
values.set('tea-shop-progress-v1','released sentinel');
values.set('tea-shop-preview-progress-v1','ordinary preview sentinel');
values.set('tea-shop-preview-edition2-appearance-v1','night');
values.set(key+':guide-v1','done');
const historical=new Map();
for(const count of [10,16,20]){
  const legacy=progress(count);
  const extras=count===10?['art','bench']:count===16?['art','bench','terrarium','botanical']:['bench','terrarium','botanical','cabinet'];
  const owned=api.DECORATIONS.filter(item=>!item.optional||extras.includes(item.id));
  legacy.shop={owned:owned.map(item=>item.id),stored:count===10?['bench']:count===16?['bench','botanical']:['bench','botanical','cabinet'],style:Object.fromEntries(owned.map((item,i)=>[item.id,i%3])),place:Object.fromEntries(owned.map(item=>[item.id,{...item.defaultPlace}])),finaleSeen:true};
  legacy.shop.place.bench={x:0,z:4,rot:1};
  if(count===20)legacy.shop.place.cabinet={x:0,z:3,rot:1};
  const snapshot=JSON.stringify(legacy), oldPuzzle={version:1,levelId:count,actions:[[0,4]]};
  const expected={...structuredClone(legacy),bestStars:[...legacy.bestStars,...Array(24-count).fill(0)],bestMoves:[...legacy.bestMoves,...Array(24-count).fill(0)]};
  historical.set(count,legacy);
  assert.throws(()=>api.parseBackup(file(legacy,oldPuzzle,'classic')),'historical lengths do not bypass an explicit cross-edition tag');
  for(const tag of [undefined,'second-edition']){
    const parsed=api.parseBackup(file(legacy,oldPuzzle,tag));
    assert.deepEqual(persisted(parsed.progress),expected,'historical scores, styles, stored furniture, placements and mute survive padding');
    assert.deepEqual(parsed.puzzle,oldPuzzle,'unfinished historical puzzle retains its action history');
    assert.equal(api.validatePuzzle(parsed.puzzle,parsed.progress).history.length,1);
    assert.equal(api.totalStars(parsed.progress),count===10?46:count===16?68:80,'new slots grant no unearned stars');
    assert.equal(api.spendableStars(parsed.progress),count===10?6:count===16?4:6,'historical spending remains exact');
    assert.equal(api.isLevelOpen(parsed.progress,count),true,'finishing the old last puzzle opens the next puzzle');
  }
  assert.equal(JSON.stringify(legacy),snapshot,'parsing does not mutate historical progress');

  // Primary and recovery paths share padding without changing keys or side saves.
  values.set(key,JSON.stringify(legacy));
  values.set(key+':puzzle-v1',JSON.stringify(oldPuzzle));
  values.set(key+':goal-v1',JSON.stringify({id:'clock',style:2}));
  assert.deepEqual(persisted(api.loadProgress()),expected);
  assert.deepEqual(api.readPuzzle(expected).save,oldPuzzle);
  assert.deepEqual(api.readGoal(expected),{id:'clock',style:2});
  assert.equal(api.saveProgress(expected),true);
  assert.deepEqual(JSON.parse(values.get(key)),expected);
  assert.deepEqual(JSON.parse(values.get(key+':recovery')),legacy,'prior progress remains a recovery slot');
  values.set(key,'{damaged');
  assert.deepEqual(persisted(api.loadProgress()),expected,'damaged primary recovers and pads the historical save');
  assert.equal(values.get('tea-shop-progress-v1'),'released sentinel');
  assert.equal(values.get('tea-shop-preview-progress-v1'),'ordinary preview sentinel');
  assert.equal(values.get('tea-shop-preview-edition2-appearance-v1'),'night');
  assert.equal(values.get(key+':guide-v1'),'done');
  assert.throws(()=>api.parseBackup(file(legacy,{version:1,levelId:count+1,actions:[]})),'historical files cannot contain a later puzzle');
  assert.throws(()=>api.parseBackup(file(legacy,{version:1,levelId:count,actions:[[0,0]]})),'invalid historical action history rejected');
  for(const id of count===10?['terrarium','botanical','cabinet','armchair']:count===16?['cabinet','armchair']:['armchair']){
    const invalid=structuredClone(legacy);invalid.shop.owned.push(id);
    assert.throws(()=>api.parseBackup(file(invalid)),'historical files cannot claim later decorations');
  }
}

const legacy=historical.get(10),current=progress(24);
const tagged=api.exportBackup(current,null);
assert.equal(JSON.parse(tagged).edition,'second-edition');
assert.deepEqual(api.parseBackup(tagged).progress,current);
assert.deepEqual(api.parseBackup(file(current)).progress,current,'untagged current files are still unambiguous by length');
assert.deepEqual(api.parseBackup(file(current,{version:1,levelId:24,actions:[]})).puzzle,{version:1,levelId:24,actions:[]});
for(const count of [0,9,11,12,15,17,18,19,21,22,23,25,38])assert.throws(()=>api.parseBackup(file(progress(count))),'unknown sequence lengths must not be padded');
for(const tag of ['classic','future-edition',null,2])assert.throws(()=>api.parseBackup(file(current,null,tag)));
assert.throws(()=>api.parseBackup(file({...legacy,bestMoves:Array(24).fill(0)})),'mixed score-array lengths rejected');
assert.throws(()=>api.parseBackup(file({...current,bestStars:[...Array(23).fill(3),3.5]})),'fractional stars rejected');
assert.throws(()=>api.parseBackup(file({...current,bestMoves:[...Array(23).fill(0),-1]})),'negative moves rejected');
for(const id of ['fountain','plant:2','not-real']){
  const invalid=progress(24);invalid.shop.owned=[id];
  assert.throws(()=>api.parseBackup(file(invalid)),'items outside the edition catalogue are rejected');
}
const duplicate=progress(24);duplicate.shop.owned=['armchair','armchair'];
assert.throws(()=>api.parseBackup(file(duplicate)),'duplicate ownership rejected');
const broke=progress(24,0);broke.shop.owned=['counter'];
assert.throws(()=>api.parseBackup(file(broke)),'negative star balance rejected');

for(const [id,gate,cost] of [['terrarium',13,10],['botanical',16,14],['cabinet',20,18],['armchair',24,16]]){
  assert.equal(api.collectionUnlocked(id,Array(gate-1).fill(3)),false);
  assert.equal(api.collectionUnlocked(id,Array(gate).fill(1)),true,'completion unlocks purchase regardless of score quality');
  assert.equal(api.UPGRADE_BY_ID[id].cost,cost);
  const locked=progress(24,gate-1);locked.shop.owned=[id];
  assert.throws(()=>api.parseBackup(file(locked)),'a current-size file cannot bypass a milestone gate with sufficient stars');
}
assert.match(api.milestoneAt(13),/Glass garden.*Available to buy for 10/);
assert.match(api.milestoneAt(16),/\+4 stars.*Botanical triptych.*Available to buy for 14/);
assert.match(api.milestoneAt(20),/Collector’s cabinet.*Available to buy for 18/);
assert.doesNotMatch(api.milestoneAt(20),/\+\d+ stars/,'cabinet unlock adds no bonus stars');
assert.equal(api.bonusAt(20),0);
assert.match(api.milestoneAt(24),/Reading chair.*Available to buy for 16/);
assert.doesNotMatch(api.milestoneAt(24),/\+\d+ stars/,'chair unlock adds no bonus stars');
assert.equal(api.bonusAt(24),0);
const beforeSixteen=progress(24,15,1),sixteen=api.recordWin(beforeSixteen,15,1,30);
assert.equal(api.totalStars(beforeSixteen),31);
assert.equal(api.totalStars(sixteen),36,'the previous sixteen-completion bonus stays unchanged');
assert.equal(api.totalStars(api.recordWin(sixteen,15,1,30)),36,'replays cannot farm previous bonuses');
const before=progress(24,19,1),last=api.recordWin(before,19,1,30);
assert.equal(api.totalStars(before),39);
assert.equal(api.totalStars(last),40,'twentieth completion earns only its puzzle score');
assert.deepEqual(last.shop.owned,[],'unlock never grants free furniture');
assert.equal(api.totalStars(api.recordWin(last,19,1,30)),40,'replays cannot farm new rewards');
assert.equal(api.totalStars(api.recordWin(last,19,3,10)),42,'better scores grant only the improvement');
assert.equal(api.totalStars(current),92);

const beforeFinal=progress(24,23,1),final=api.recordWin(beforeFinal,23,1,30);
assert.equal(api.totalStars(beforeFinal),43);
assert.equal(api.totalStars(final),44,'twenty-fourth completion earns only its puzzle score');
assert.deepEqual(final.shop.owned,[],'chair unlock never grants free furniture');
assert.equal(api.totalStars(api.recordWin(final,23,1,30)),44,'replays cannot farm the chair milestone');
assert.equal(api.totalStars(api.recordWin(final,23,3,10)),46,'later score improvements grant only their difference');

const core=api.DECORATIONS.filter(item=>!item.optional);
const cabinet=progress(24,24,1);
cabinet.shop={owned:[...core.map(item=>item.id),'cabinet'],stored:[],style:Object.fromEntries([...core.map(item=>[item.id,2]),['cabinet',2]]),place:{...Object.fromEntries(core.map(item=>[item.id,{...item.defaultPlace}])),cabinet:{x:0,z:3,rot:1}},finaleSeen:true};
assert.equal(api.spendableStars(cabinet),0,'minimum twenty-four-board earnings exactly fund the core and cabinet');
for(const stored of [[],['cabinet']]){
  cabinet.shop.stored=stored;
  assert.deepEqual(persisted(api.parseBackup(api.exportBackup(cabinet,null)).progress),cabinet,'paid cabinet style, position and storage round-trip');
}
// Padding a twenty-board file cannot manufacture the four extra completion stars.
const oldPoor=progress(20,20,1);oldPoor.shop=structuredClone(cabinet.shop);
assert.throws(()=>api.parseBackup(file(oldPoor)),'historical minimum scores still cannot fund core plus cabinet');
oldPoor.bestStars[0]=3;oldPoor.bestStars[1]=3;
assert.equal(api.spendableStars(api.parseBackup(file(oldPoor)).progress),0,'historical earned improvements remain sufficient after padding');

const chair=progress(24,24,1);
assert.deepEqual(api.UPGRADE_BY_ID.armchair.defaultPlace,{x:1,z:3,rot:0});
chair.shop={owned:[...core.map(item=>item.id),'armchair'],stored:[],style:Object.fromEntries([...core.map(item=>[item.id,2]),['armchair',2]]),place:{...Object.fromEntries(core.map(item=>[item.id,{...item.defaultPlace}])),armchair:{...api.UPGRADE_BY_ID.armchair.defaultPlace}},finaleSeen:true};
assert.equal(api.spendableStars(chair),2,'minimum earnings fund core plus Reading chair with two stars left');
for(const style of [0,1,2])for(const stored of [[],['armchair']]){
  chair.shop.style.armchair=style;chair.shop.stored=stored;
  assert.deepEqual(persisted(api.parseBackup(api.exportBackup(chair,null)).progress),chair,'every included chair style, position and storage round-trips without a surcharge');
}
const customChair=structuredClone(chair);customChair.shop.place.armchair={x:4,z:5,rot:0};customChair.shop.stored=[];
assert.deepEqual(persisted(api.parseBackup(api.exportBackup(customChair,null)).progress),customChair,'an explicit saved chair layout is never replaced by the new purchase default');
chair.shop.stored=[];chair.shop.owned.push('cabinet');chair.shop.style.cabinet=2;chair.shop.place.cabinet={x:0,z:3,rot:1};
assert.throws(()=>api.parseBackup(file(chair)),'minimum scores do not fund core and both optional statement pieces');
chair.bestStars.fill(3,0,8);
assert.equal(api.totalStars(chair),60);
assert.equal(api.spendableStars(chair),0,'sixteen score improvements fund the core, cabinet and chair');
assert.deepEqual(persisted(api.parseBackup(api.exportBackup(chair,null)).progress),chair);
console.log('PASS: real-mode ten/sixteen/twenty→twenty-four save/backup/recovery/resume compatibility, edition isolation, strict import guards, chair gate and non-farmable 44–92-star progression.');
