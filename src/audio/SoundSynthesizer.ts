/**
 * Procedural Web Audio Sound Synthesizer
 * Provides subtle ambient soundscapes and harmonic interactive acoustic feedback
 * without requiring external sound asset loading.
 */

import { RealmType } from '../types';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Ambient synth nodes
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private isAmbientPlaying: boolean = false;
  private lastTickSoundTime: number = 0;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.3, now + 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      const clamped = Math.max(0, Math.min(1, val));
      this.masterGain.gain.setTargetAtTime(clamped * 0.3, this.ctx.currentTime, 0.05);
    }
  }

  public startAmbient(realm: RealmType = 'biofoundry') {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;

    if (this.isAmbientPlaying) {
      this.updateAmbientRealm(realm);
      return;
    }

    try {
      const now = this.ctx.currentTime;

      // Gentle lowpass filter with low Q to avoid harsh whistle/resonance
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(240, now);
      this.ambientFilter.Q.setValueAtTime(0.7, now);
      this.ambientFilter.connect(this.ambientGain);

      // Warm pure sine base chords
      const baseFreq = realm === 'biofoundry' ? 98.0 : realm === 'ashenrealm' ? 73.42 : 110.0; // G2 / D2 / A2
      const secondFreq = realm === 'biofoundry' ? 146.83 : realm === 'ashenrealm' ? 110.0 : 164.81; // D3 / A2 / E3

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(baseFreq, now);
      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc1.start();

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'sine';
      this.ambientOsc2.frequency.setValueAtTime(secondFreq, now);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientOsc2.start();

      this.isAmbientPlaying = true;
    } catch {
      // Audio context might be restricted before user touch
    }
  }

  public updateAmbientRealm(realm: RealmType) {
    if (!this.ctx || !this.isAmbientPlaying) {
      this.startAmbient(realm);
      return;
    }
    const now = this.ctx.currentTime;

    const baseFreq = realm === 'biofoundry' ? 98.0 : realm === 'ashenrealm' ? 73.42 : 110.0;
    const secondFreq = realm === 'biofoundry' ? 146.83 : realm === 'ashenrealm' ? 110.0 : 164.81;

    if (this.ambientOsc1) {
      this.ambientOsc1.frequency.setTargetAtTime(baseFreq, now, 1.5);
    }
    if (this.ambientOsc2) {
      this.ambientOsc2.frequency.setTargetAtTime(secondFreq, now, 1.5);
    }
    if (this.ambientFilter) {
      const filterCutoff = realm === 'ashenrealm' ? 180 : realm === 'proteinrealms' ? 280 : 240;
      this.ambientFilter.frequency.setTargetAtTime(filterCutoff, now, 1.5);
    }
  }

  public playTickStep() {
    if (this.isMuted) return;
    const nowMs = performance.now();
    // Throttle to at most 1 tick sound every 120ms to prevent rapid-fire crackle
    if (nowMs - this.lastTickSoundTime < 120) return;
    this.lastTickSoundTime = nowMs;

    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.02);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // ignore
    }
  }

  public playInventionChime(score: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 261.63 * (1 + score * 0.5); // C4 harmonic

      [1, 1.25, 1.5].forEach((interval, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * interval, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.07 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.65);
      });
    } catch {
      // ignore
    }
  }

  public playDisturbanceAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.015);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // ignore
    }
  }

  public playSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [392.0, 523.25, 659.25]; // G4, C5, E5
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.06, now + i * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundSynthesizer();

