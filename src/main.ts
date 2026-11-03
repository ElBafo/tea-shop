import { unlockAudio } from "./game/audio";
import { mountApp } from "./ui/app";
import "./style.css";
import * as offline from "./game/offline";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Missing #app");
}

const start = document.querySelector<HTMLButtonElement>('#launch-start');
start?.addEventListener('click', () => {
  if (start.disabled) return;
  void unlockAudio();
  root.inert = false;
  root.removeAttribute('aria-hidden');
  document.querySelector('#launch-screen')?.remove();
  const nextFocus = root.querySelector<HTMLElement>('[data-guide-start]') ?? root.querySelector<HTMLElement>('#play-tea');
  nextFocus?.focus({preventScroll:true});
}, {once:true});
void Promise.resolve().then(() => mountApp(root)).then(() => {
  requestAnimationFrame(() => window.dispatchEvent(new Event('decopu-ready')));
}).catch(() => window.dispatchEvent(new Event('decopu-error')));

offline.setupOfflinePreview();

if ("serviceWorker" in navigator) {
  offline.setupOffline();
}
