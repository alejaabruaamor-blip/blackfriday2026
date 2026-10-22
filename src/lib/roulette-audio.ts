// Browser-only audio: create the context inside the user's spin gesture.
export function createRouletteAudio() {
  let context: AudioContext | null = null;
  let volume: GainNode | null = null;
  let track: GainNode | null = null;
  let muted = false;
  function ready() {
    if (!context) {
      const Constructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) return null;
      context = new Constructor();
      volume = context.createGain();
      volume.gain.value = muted ? 0 : 0.24;
      volume.connect(context.destination);
    }
    void context.resume().catch(() => {});
    return context;
  }
  function stop() { track?.disconnect(); track = null; }
  function tone(ctx: AudioContext, bus: GainNode, at: number, frequency: number, duration: number, click = false) {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = click ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, at);
    if (click) oscillator.frequency.exponentialRampToValueAtTime(180, at + duration);
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(click ? 0.75 : 0.45, at + 0.003);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + duration);
    oscillator.connect(envelope); envelope.connect(bus);
    oscillator.start(at); oscillator.stop(at + duration + 0.01);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  function bus(ctx: AudioContext) {
    stop();
    if (!volume) return null;
    track = ctx.createGain(); track.connect(volume); return track;
  }
  return {
    start(durationMs: number) {
      try {
        const ctx = ready(); if (!ctx) return;
        const channel = bus(ctx); if (!channel) return;
        const duration = durationMs / 1000;
        for (let elapsed = 0; elapsed < duration - 0.025;) {
          tone(ctx, channel, ctx.currentTime + elapsed, 1100, 0.022, true);
          elapsed += 0.045 + 0.31 * (elapsed / duration) ** 2;
        }
      } catch { /* Unsupported audio must never block the wheel. */ }
    },
    finish(win: boolean) {
      try {
        const ctx = context; if (!ctx) return;
        const channel = bus(ctx); if (!channel) return;
        const notes = win ? [523.25, 659.25, 783.99, 1046.5] : [440, 329.63];
        notes.forEach((note, i) => tone(ctx, channel, ctx.currentTime + i * 0.12, note, win ? 0.34 : 0.16));
      } catch { /* Optional sound. */ }
    },
    setMuted(value: boolean) {
      muted = value;
      if (context && volume) volume.gain.setTargetAtTime(value ? 0 : 0.24, context.currentTime, 0.015);
    },
    dispose() { stop(); if (context) void context.close().catch(() => {}); context = null; volume = null; },
  };
}
