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

// A short paper rustle and soft ceramic contact. Cached noise avoids allocating
// a buffer on every pour; sources/filters are disconnected when their sound ends.
let paperNoise: AudioBuffer | null = null;
export async function playTeaDrop(muted: boolean): Promise<void> {
  if (muted || document.hidden) return;
  await unlockAudio();
  const ctx = getContext();
  if (!ctx || ctx.state !== "running" || document.hidden) return;
  if (!paperNoise || paperNoise.sampleRate !== ctx.sampleRate) {
    paperNoise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .065), ctx.sampleRate);
    const data = paperNoise.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
  }
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),amp=ctx.createGain();
  source.buffer=paperNoise;filter.type="bandpass";filter.frequency.value=1700;filter.Q.value=.6;
  const now=ctx.currentTime;
  amp.gain.setValueAtTime(.0001,now);amp.gain.linearRampToValueAtTime(.045,now+.008);amp.gain.exponentialRampToValueAtTime(.0001,now+.065);
  source.connect(filter);filter.connect(amp);amp.connect(ctx.destination);
  source.onended=()=>{source.disconnect();filter.disconnect();amp.disconnect();};
  source.start(now);source.stop(now+.07);
  tone(ctx,470,now+.02,.075,"sine",.025);
  tone(ctx,940,now+.02,.045,"sine",.008);
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
