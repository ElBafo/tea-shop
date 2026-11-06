import { isSecondEdition } from "./game/mode";
import { APP_VERSION } from "./game/version";
import { unlockAudio } from "./game/audio";
import { mountApp } from "./ui/app";
import "./style.css";
import "./ui/edition.css";
import "./ui/edition-puzzle.css";
document.body.classList.toggle("edition-two", isSecondEdition);
const versionLabel = document.createElement("small");
versionLabel.className = "launch-version";
versionLabel.textContent = `v${APP_VERSION}${isSecondEdition ? " · Second edition" : ""}`;
document.querySelector(".launch-card")?.append(versionLabel);
import * as offline from "./game/offline";

// Experiments are available only in a preview build at its preview path.
const puzzleComparison = isSecondEdition
  && import.meta.env.BASE_URL === '/tea-shop/preview/'
  && location.pathname.startsWith('/tea-shop/preview/')
  && new URLSearchParams(location.search).get('puzzle3d') === '1';
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
  const nextFocus = root.querySelector<HTMLElement>('[data-guide-start]') ?? root.querySelector<HTMLElement>('#play-tea') ?? root.querySelector<HTMLElement>('[data-comparison-renderer]');
  nextFocus?.focus({preventScroll:true});
}, {once:true});
void Promise.resolve().then(() => puzzleComparison
  ? import('./ui/puzzle-comparison').then(module => module.mountPuzzleComparison(root))
  : mountApp(root)).then(() => {
  requestAnimationFrame(() => window.dispatchEvent(new Event('decopu-ready')));
}).catch(() => window.dispatchEvent(new Event('decopu-error')));

offline.setupOfflinePreview();

if ("serviceWorker" in navigator) {
  offline.setupOffline();
}
