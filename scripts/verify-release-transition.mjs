// Production starts a separate second-edition journey. Every fixture below is
// generated test data; this script never reads or publishes a player's save.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';

const root=fileURLToPath(new URL('../',import.meta.url));
const modules=['game/mode','game/types','game/storage','game/guide','game/preview','game/resume','game/backup','game/appearance','game/goal','shop/upgrades'];
const source=modules.map(file=>'export * from '+JSON.stringify(root+'src/'+file+'.ts')+';').join('\n');
const bundles=new Map();
let serial=0;
const originalKey='tea-shop-progress-v1',previewKey='tea-shop-preview-progress-v1';
const editionPreviewKey='tea-shop-preview-edition2-progress-v1',releaseKey='tea-shop-edition2-progress-v1';
const emptyShop=()=>({owned:[],stored:[],style:{},place:{},finaleSeen:false});
const progress=(count,stars=3)=>({muted:true,bestStars:Array(count).fill(stars),bestMoves:Array.from({length:count},(_,i)=>i+3),shop:emptyShop()});
const snapshot=values=>JSON.stringify([...values.entries()].sort(([a],[b])=>a.localeCompare(b)));
async function mode({base='/tea-shop/',path=base,search='',values=new Map(),denied=false,noLocation=false}={}) {
  if(!bundles.has(base)) {
    const id='virtual:release-transition';
    const result=await build({configFile:false,root,logLevel:'silent',base,
      plugins:[{name:'release-entry',resolveId:x=>x===id?'\0'+id:null,load:x=>x==='\0'+id?source:null}],
      build:{write:false,ssr:true,rollupOptions:{input:id,output:{format:'es'}}}});
    bundles.set(base,result.output.find(item=>item.type==='chunk').code);
  }
  Object.assign(globalThis,{location:{pathname:path,search},window:new EventTarget(),localStorage:{
    getItem:key=>{if(denied)throw Error('Storage unavailable');return values.get(key)??null;},
    setItem:(key,value)=>{if(denied)throw Error('Storage unavailable');values.set(key,String(value));},
    removeItem:key=>{if(denied)throw Error('Storage unavailable');values.delete(key);},
  }});
  if(noLocation)delete globalThis.location;
  const code=bundles.get(base)+'\n// isolated runtime '+(++serial);
  const api=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  return {api,values};
}

// Seed every pre-release namespace, including unfinished play, goals and prefs.
// Their presence must not suppress the new release's first-time welcome or copy
// purchases/score stars into unrelated puzzles.
const values=new Map();
for(const [key,count] of [[originalKey,38],[previewKey,38],[editionPreviewKey,24]]) {
  const p=progress(count);p.shop={...emptyShop(),owned:['counter'],style:{counter:2},place:{counter:{x:1,z:1,rot:0}}};
  values.set(key,JSON.stringify(p));values.set(key+':recovery',JSON.stringify(p));
  values.set(key+':puzzle-v1',JSON.stringify({version:1,levelId:1,actions:[]}));
  values.set(key+':guide-v1','done');values.set(key+':goal-v1',JSON.stringify({id:'lamp',style:1}));
}
for(const key of ['tea-shop-appearance-v1','tea-shop-preview-appearance-v1','tea-shop-preview-edition2-appearance-v1'])values.set(key,'night');
values.set('tea-shop-edition-choice-v1','classic'); // Obsolete/unimplemented preferences cannot override a fresh release.
values.set('unrelated-player-setting','keep');
const before=snapshot(values),{api}=await mode({values});
assert.equal(api.isProduction,true);assert.equal(api.isSecondEdition,true);
assert.equal(api.LEVEL_COUNT,24);assert.equal(api.STORAGE_KEY,releaseKey);
assert.equal(api.APPEARANCE_KEY,'tea-shop-edition2-appearance-v1');
assert.equal(api.DECORATIONS.length,18);assert.equal(api.isPreview,false);
assert.equal(api.isShowroom,false);assert.equal(api.isGuidePreview,false);
const fresh=api.loadProgress();
assert.deepEqual(fresh,{muted:false,bestStars:Array(24).fill(0),bestMoves:Array(24).fill(0),shop:emptyShop()});
assert.equal(api.loadNight(api.APPEARANCE_KEY),false,'Original/preview night preferences do not leak');
assert.equal(api.readPuzzle(fresh),null);assert.equal(api.readGoal(fresh),null);
assert.equal(snapshot(values),before,'Reading the new release does not mutate any old save');
api.initGuide();assert.equal(api.guideStage(),'welcome');
assert.equal(values.get(releaseKey+':guide-v1'),'welcome');
assert.equal(values.has(releaseKey),false,'First-use guide does not invent purchased progress');
assert.throws(()=>api.resetPreviewProgress(),'No production reset entrypoint');

// Earn and spend in the release, then enter a new runtime to prove persistence.
let next=api.recordWin(fresh,0,3,3);
const owned={...emptyShop(),owned:['counter'],style:{counter:1},place:{counter:{x:1,z:1,rot:0}}};
next=api.saveShop(next,owned);next=api.setMuted(next,true);api.setGuide('done');
api.writePuzzle({version:1,levelId:2,actions:[]});api.saveGoal({id:'lamp',style:2});api.saveNight(api.APPEARANCE_KEY,true);
assert.equal(api.spendableStars(next),1);assert.equal(next.bestStars.length,24);
const reloaded=await mode({values});
assert.deepEqual(JSON.parse(JSON.stringify(reloaded.api.loadProgress())),next);
reloaded.api.initGuide();assert.equal(reloaded.api.guideStage(),'done');
assert.equal(reloaded.api.readPuzzle(next).save.levelId,2);
assert.deepEqual(reloaded.api.readGoal(next),{id:'lamp',style:2});
assert.equal(reloaded.api.loadNight(reloaded.api.APPEARANCE_KEY),true);
assert.equal(snapshot(new Map([...values].filter(([key])=>!key.startsWith('tea-shop-edition2-')))),before,'Only the new release namespace is written');

// Exact routes and flags cannot enable preview-only state on production.
for(const search of ['', '?edition=2', '?tour=1&showroom=1', '?edition=unknown']) {
  const {api}=await mode({search});
  assert.equal(api.isSecondEdition,true);assert.equal(api.STORAGE_KEY,releaseKey);
  assert.equal(api.isShowroom,false);assert.equal(api.isGuidePreview,false);assert.throws(()=>api.resetPreviewProgress());
}
const classic=await mode({search:'?edition=1',values});
assert.equal(classic.api.isSecondEdition,false);assert.equal(classic.api.LEVEL_COUNT,38);
assert.equal(classic.api.STORAGE_KEY,originalKey);assert.equal(classic.api.APPEARANCE_KEY,'tea-shop-appearance-v1');
assert.equal(classic.api.loadProgress().bestStars.length,38);assert.equal(classic.api.spendableStars(classic.api.loadProgress()),130);
for(const [search,key,count,nightKey] of [
  ['',editionPreviewKey,24,'tea-shop-preview-edition2-appearance-v1'],
  ['?edition=1',previewKey,38,'tea-shop-preview-appearance-v1'],
  ['?edition=2',editionPreviewKey,24,'tea-shop-preview-edition2-appearance-v1'],
]) {
  const {api}=await mode({base:'/tea-shop/preview/',search,values});
  assert.equal(api.isProduction,false);assert.equal(api.isPreview,true);
  assert.equal(api.LEVEL_COUNT,count);assert.equal(api.STORAGE_KEY,key);assert.equal(api.APPEARANCE_KEY,nightKey);
  assert.equal(api.loadProgress().bestStars.length,count);
}
const wrongPath=await mode({path:'/tea-shop/preview/',search:'?edition=2'});
assert.equal(wrongPath.api.isProduction,false);assert.equal(wrongPath.api.isSecondEdition,false,'Release bundle cannot claim the preview route');
const wrongPreviewPath=await mode({base:'/tea-shop/preview/',path:'/tea-shop/',search:'?edition=2'});
assert.equal(wrongPreviewPath.api.isSecondEdition,false);
assert.equal(wrongPreviewPath.api.STORAGE_KEY,previewKey);assert.equal(wrongPreviewPath.api.APPEARANCE_KEY,'tea-shop-preview-appearance-v1','A preview build never uses released appearance storage');
const node=await mode({noLocation:true});assert.equal(node.api.isSecondEdition,false);assert.equal(node.api.LEVEL_COUNT,38,'Non-browser verifiers retain the classic definitions');

// Corrupt old saves are left alone. Only the new namespace affects recovery.
const corrupt=new Map([[originalKey,'broken'],[editionPreviewKey,'broken'],[releaseKey+':recovery',JSON.stringify(next)]]);
const recovered=await mode({values:corrupt});assert.deepEqual(JSON.parse(JSON.stringify(recovered.api.loadProgress())),next);
assert.equal(corrupt.get(originalKey),'broken');assert.equal(corrupt.get(editionPreviewKey),'broken');
const {api:blocked}=await mode({denied:true});
assert.equal(blocked.isSecondEdition,true);assert.equal(blocked.loadProgress().bestStars.every(n=>n===0),true);
blocked.initGuide();assert.equal(blocked.guideStage(),'welcome');
let failed=0;window.addEventListener('decopu-save-failed',()=>failed++);
assert.equal(blocked.saveProgress(blocked.loadProgress()),false);assert.equal(failed,1,'Storage failure is surfaced without changing edition or deleting progress');
console.log('PASS: fresh production second edition, independent onboarding/save/recovery/resume/goals/appearance, old and preview saves untouched, production demo/reset rejection, explicit original-mode tooling and unavailable storage.');
