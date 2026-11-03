// Appearance is independent of scores and furniture layouts.
export function loadNight(key: string): boolean {
  try { return localStorage.getItem(key) === "night"; }
  catch { return false; }
}

export function saveNight(key: string, night: boolean): void {
  try { localStorage.setItem(key, night ? "night" : "day"); }
  catch { /* The current session can still change theme if storage is unavailable. */ }
}

// Browser chrome is screen appearance, not another saved preference.
export function setBrowserNight(night: boolean): void {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', night ? '#111a28' : '#fbf3e8');
  document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', night ? 'black-translucent' : 'default');
  document.documentElement.classList.toggle('shop-night', night);
}
