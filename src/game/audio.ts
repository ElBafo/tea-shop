let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context || context.state === "closed") {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
    } catch {
      return null;
    }
  }
  return context;
}

export async function unlockAudio(): Promise<void> {
  try {
    const ctx = getContext();
    if (!ctx) return;
    // Mobile browsers can suspend or interrupt audio after backgrounding.
    // Retry on subsequent gestures rather than remembering a one-time unlock.
    if (ctx.state !== "running" && ctx.state !== "closed") await ctx.resume();
  } catch {
    // A blocked gesture must not prevent the next tap from trying again.
  }
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gain: number,
): void {
  const oscillator = ctx.createOscillator();
  const amp = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(amp);
  amp.connect(ctx.destination);
  oscillator.onended = () => {
    oscillator.disconnect();
    amp.disconnect();
  };
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export async function playClick(muted: boolean): Promise<void> {
  if (muted) return;
  await unlockAudio();
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  tone(ctx, 640, now, 0.06, "triangle", 0.04);
  tone(ctx, 880, now + 0.01, 0.05, "sine", 0.03);
}

export async function playDrop(muted: boolean): Promise<void> {
  if (muted) return;
  await unlockAudio();
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  tone(ctx, 420, now, 0.08, "sine", 0.045);
  tone(ctx, 560, now + 0.03, 0.07, "triangle", 0.03);
}

export async function playComplete(muted: boolean): Promise<void> {
  if (muted) return;
  await unlockAudio();
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  tone(ctx, 523, now, 0.12, "sine", 0.045);
  tone(ctx, 659, now + 0.07, 0.12, "sine", 0.04);
  tone(ctx, 784, now + 0.14, 0.16, "triangle", 0.035);
}

export async function playWin(muted: boolean): Promise<void> {
  if (muted) return;
  await unlockAudio();
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  [523, 659, 784, 988].forEach((freq, i) => {
    tone(ctx, freq, now + i * 0.09, 0.2, "sine", 0.04);
  });
}

export async function playChime(muted: boolean): Promise<void> {
  if (muted) return;
  await unlockAudio();
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  tone(ctx, 784, now, 0.14, "sine", 0.045);
  tone(ctx, 988, now + 0.07, 0.16, "triangle", 0.038);
  tone(ctx, 1175, now + 0.14, 0.22, "sine", 0.032);
}

export async function playFinale(muted: boolean): Promise<void> {
  if (muted) return;
  await unlockAudio();
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  [523, 659, 784, 988, 1175].forEach((freq, i) => {
    tone(ctx, freq, now + i * 0.11, 0.24, "sine", 0.038);
  });
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
