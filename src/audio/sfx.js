// Procedural Web Audio API sound effects (zero external audio dependencies)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureCtx() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, duration = 0.12, type = 'sine', gainVal = 0.12, delay = 0, slideTo = null) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.tone(620, 0.06, 'triangle', 0.09, 0, 780);
  }

  pieOpen() {
    this.tone(520, 0.07, 'sine', 0.08, 0, 740);
    this.tone(740, 0.08, 'sine', 0.07, 0.04, 880);
  }

  queueAdd() {
    this.tone(587, 0.08, 'triangle', 0.09, 0);
    this.tone(880, 0.11, 'triangle', 0.09, 0.06);
  }

  doorbell() {
    this.tone(659.25, 0.28, 'sine', 0.14, 0);
    this.tone(523.25, 0.42, 'sine', 0.14, 0.24);
  }

  laugh() {
    // Signature bouncy Naiwa chuckle sequence
    const notes = [360, 440, 390, 490, 420, 540];
    notes.forEach((n, i) => {
      this.tone(n, 0.09, 'sawtooth', 0.055, i * 0.095, n * 0.78);
    });
  }

  boing() {
    // Cartoon squash & bounce for Naishu teased by Naifen
    this.tone(180, 0.14, 'sine', 0.14, 0, 95);
    this.tone(130, 0.26, 'triangle', 0.15, 0.16, 560);
  }

  heart() {
    this.tone(523.25, 0.14, 'sine', 0.10, 0);
    this.tone(659.25, 0.14, 'sine', 0.10, 0.09);
    this.tone(783.99, 0.22, 'sine', 0.10, 0.18);
  }

  cash() {
    this.tone(987.77, 0.08, 'triangle', 0.11, 0);
    this.tone(1318.5, 0.22, 'triangle', 0.12, 0.07);
  }

  levelUp() {
    [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => {
      this.tone(n, 0.16, 'triangle', 0.11, i * 0.09);
    });
  }

  eventPop() {
    this.tone(440, 0.10, 'triangle', 0.10, 0);
    this.tone(554.37, 0.10, 'triangle', 0.10, 0.08);
    this.tone(659.25, 0.18, 'triangle', 0.11, 0.16);
  }
}

export const sfx = new SoundEngine();
