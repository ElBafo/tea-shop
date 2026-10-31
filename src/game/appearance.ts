// Appearance is independent of scores and furniture layouts.
export function loadNight(key: string): boolean {
  try { return localStorage.getItem(key) === "night"; }
  catch { return false; }
}

export function saveNight(key: string, night: boolean): void {
  try { localStorage.setItem(key, night ? "night" : "day"); }
  catch { /* The current session can still change theme if storage is unavailable. */ }
}
