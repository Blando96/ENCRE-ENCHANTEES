// Web Audio API Synthesizer for Cinematic Background Ambience & FX
class CinematicSoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentMusicNodes: any[] = [];
  private currentSfxNodes: any[] = [];

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.25; // Smooth ambient volume
        this.musicGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.35;
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGain) this.musicGain.gain.value = muted ? 0 : 0.25;
    if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : 0.35;
  }

  public stopAll() {
    this.currentMusicNodes.forEach(node => {
      try { node.stop?.(); node.disconnect?.(); } catch (e) {}
    });
    this.currentMusicNodes = [];

    this.currentSfxNodes.forEach(node => {
      try { node.stop?.(); node.disconnect?.(); } catch (e) {}
    });
    this.currentSfxNodes = [];
  }

  public playAtmosphere(mood: string) {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    this.stopAll();

    const now = this.ctx.currentTime;

    if (mood === 'suspense' || mood === 'mysterious' || mood === 'dark_noir') {
      // Dark low drone + minor key chords
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, now); // A1 low drone

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, now); // A2

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      osc1.connect(filter);
      osc2.connect(filter);
      if (this.musicGain) filter.connect(this.musicGain);

      osc1.start();
      osc2.start();
      this.currentMusicNodes.push(osc1, osc2);

    } else if (mood === 'dramatic' || mood === 'epic') {
      // Warm orchestral pad drone
      const freqs = [65.41, 98.00, 130.81, 164.81]; // C2, G2, C3, E3
      freqs.forEach(f => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);

        osc.connect(filter);
        if (this.musicGain) filter.connect(this.musicGain);

        osc.start();
        this.currentMusicNodes.push(osc);
      });

    } else if (mood === 'action' || mood === 'cyberpunk') {
      // Pulsing synth bass
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65.41, now); // C2

      lfo.frequency.setValueAtTime(4, now); // 4Hz pulse
      lfoGain.gain.setValueAtTime(200, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      lfo.connect(filter.frequency);
      osc.connect(filter);
      if (this.musicGain) filter.connect(this.musicGain);

      osc.start();
      lfo.start();
      this.currentMusicNodes.push(osc, lfo);

    } else {
      // Soft ambient piano pad (romantic / melancholic)
      const freqs = [110, 130.81, 164.81];
      freqs.forEach(f => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        if (this.musicGain) osc.connect(this.musicGain);
        osc.start();
        this.currentMusicNodes.push(osc);
      });
    }
  }

  // Play procedural sound effects (e.g. rain, thunder, footsteps, clock)
  public playSfx(sfxType: string) {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const lower = sfxType.toLowerCase();
    const now = this.ctx.currentTime;

    if (lower.includes('pluie') || lower.includes('rain') || lower.includes('orage')) {
      // Pink noise rain simulation
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      noise.connect(filter);
      if (this.sfxGain) filter.connect(this.sfxGain);

      noise.start();
      this.currentSfxNodes.push(noise);
    }
  }
}

export const soundEngine = new CinematicSoundEngine();
