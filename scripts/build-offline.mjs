import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export async function buildOffline(outDir, base) {
  if (!base.startsWith('/') || !base.endsWith('/')) throw Error('Offline builds need an absolute base path');
  const rootManifest = JSON.parse(await readFile(join(outDir, 'manifest.webmanifest'), 'utf8'));
  rootManifest.start_url = rootManifest.scope = base;
  for (const icon of rootManifest.icons) icon.src = base + 'icons/' + icon.src.split('/').pop();
  rootManifest.name = base === '/tea-shop/preview/' ? 'Decopu Preview' : 'Decopu';
  rootManifest.short_name = rootManifest.name;
  await writeFile(join(outDir, 'manifest.webmanifest'), JSON.stringify(rootManifest));
  const html = await readFile(join(outDir, 'index.html'), 'utf8');
  if (base === '/tea-shop/preview/') {
    await mkdir(join(outDir, 'offline'), {recursive:true});
    const manifest = JSON.parse(await readFile(join(outDir, 'manifest.webmanifest'), 'utf8'));
    manifest.name = 'Decopu Offline Preview';
    manifest.short_name = 'Decopu Preview';
    manifest.start_url = manifest.scope = base + 'offline/';
    await writeFile(join(outDir, 'offline/manifest.webmanifest'), JSON.stringify(manifest));
    await writeFile(join(outDir, 'offline/index.html'), html.replace(/href="[^"]*manifest\.webmanifest"/, 'href="./manifest.webmanifest"'));
  }
  const walk = async (dir, prefix='') => (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async entry => entry.isDirectory() ? walk(join(dir,entry.name),prefix+entry.name+'/') : [prefix+entry.name]))).flat();
  const paths = (await walk(outDir)).filter(path=>path!=='sw.js').sort();
  const template = await readFile('public/sw.js','utf8');
  const hash = createHash('sha256').update(template);
  for (const path of paths) hash.update(path).update(await readFile(join(outDir,path)));
  const worker = template.replace('"__BUILD_VERSION__"', JSON.stringify(hash.digest('hex').slice(0,16))).replace('/* __PRECACHE__ */ []',JSON.stringify(paths));
  await writeFile(join(outDir,'sw.js'), worker);
}
