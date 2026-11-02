const base = import.meta.env.BASE_URL;
const preview = base === '/tea-shop/preview/';
export const isOfflinePreview = preview && location.pathname.startsWith(base + 'offline/');
let started = false;

// The hosted preview intentionally omits ordinary SW registration. This separate
// static sub-scope allows optional installed/offline testing without controlling it.
export function setupOfflinePreview(): void {
  if (isOfflinePreview) setupOffline();
}

export function setupOffline(): void {
  if (started || import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  if (preview && !isOfflinePreview) return;
  started = true;
  const scope = isOfflinePreview ? base+'offline/' : base;
  let waiting: ServiceWorker | null = null;
  let dismissed = false;
  let activating = false;
  let banner: HTMLElement | null = null;
  const removeBanner = () => { banner?.remove(); banner = null; };
  const offer = () => {
    const playing = document.querySelector('.play') && !document.querySelector('.result-overlay');
    if (!waiting || dismissed || playing) { removeBanner(); return; }
    if (banner) return;
    banner = document.createElement('aside');
    banner.className = 'update-notice';
    banner.setAttribute('role','status');
    banner.innerHTML = '<span>A fresh version is ready.</span><button type="button" data-update>Update</button><button type="button" data-later>Later</button>';
    banner.querySelector('[data-update]')!.addEventListener('click',()=> {
      activating = true;
      waiting?.postMessage({type:'ACTIVATE_UPDATE'});
      removeBanner();
    });
    banner.querySelector('[data-later]')!.addEventListener('click',()=> { dismissed = true; removeBanner(); });
    document.body.append(banner);
  };
  navigator.serviceWorker.addEventListener('controllerchange',()=> { if (activating) location.reload(); });
  new MutationObserver(offer).observe(document.querySelector('#app')!,{childList:true,subtree:true});
  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register(base+'sw.js',{scope,updateViaCache:'none'});
      const inspect = () => { if (registration.waiting) { waiting = registration.waiting; offer(); } };
      inspect();
      registration.addEventListener('updatefound',()=> {
        registration.installing?.addEventListener('statechange',inspect);
      });
      const refresh = () => { if (!document.hidden && navigator.onLine) void registration.update().catch(()=>{}); };
      window.addEventListener('online',refresh);
      document.addEventListener('visibilitychange',refresh);
      refresh();
      const ready = await navigator.serviceWorker.ready;
      if (isOfflinePreview && ready.active) {
        const label = document.querySelector('.preview-bar span');
        if (label) label.textContent = 'Offline preview · Ready';
      }
    } catch {
      // The game and local progress remain usable if registration is unavailable.
    }
  };
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load',()=>void register(),{once:true});
}
