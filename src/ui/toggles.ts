// Both icon states stay mounted so CSS can animate changes without moving controls.
const svg = (body: string) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const sunMoon = svg('<g class="sun-icon"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></g><path class="moon-icon" d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>');
const speaker = svg('<path class="speaker-icon" d="M4 9h4l5-4v14l-5-4H4z"/><g class="sound-waves"><path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/></g><path class="sound-slash" d="m17 10 4 4m0-4-4 4"/>');

export function audioToggle(muted: boolean): string {
  const label = muted ? 'Turn sound on' : 'Turn sound off';
  return `<button id="mute" class="icon-btn toolbar-toggle audio-toggle" type="button" data-state="${muted ? 'off' : 'on'}" aria-label="${label}" title="${label}" aria-pressed="${!muted}">${speaker}</button>`;
}
export function themeToggle(night: boolean): string {
  const label = `Switch to ${night ? 'day' : 'night'}`;
  return `<button id="theme-toggle" class="icon-btn toolbar-toggle theme-toggle" type="button" data-state="${night ? 'night' : 'day'}" aria-label="${label}" title="${label}" aria-pressed="${night}">${sunMoon}</button>`;
}
export function updateAudioToggle(button: Element | null, muted: boolean): void {
  if (!button) return;
  const label = muted ? 'Turn sound on' : 'Turn sound off';
  button.setAttribute('data-state', muted ? 'off' : 'on');
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
  button.setAttribute('aria-pressed', String(!muted));
}
export function updateThemeToggle(button: Element | null, night: boolean): void {
  if (!button) return;
  const label = `Switch to ${night ? 'day' : 'night'}`;
  button.setAttribute('data-state', night ? 'night' : 'day');
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
  button.setAttribute('aria-pressed', String(night));
}
