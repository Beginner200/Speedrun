import { SaveService } from './saveService';

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicStep = 0;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioContext) {
      const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioContext = new Ctx();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.12;
      masterGain.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

function tone(frequency: number, duration: number, type: OscillatorType, volume: number): void {
  const data = SaveService.load();
  if (!data.settings.sound) return;
  const ctx = getContext();
  if (!ctx || !masterGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export const AudioService = {
  unlock(): void { getContext(); },
  coin(): void { tone(880, 0.08, 'square', 0.035); },
  powerUp(): void { tone(660, 0.10, 'sine', 0.045); window.setTimeout(() => tone(990, 0.12, 'sine', 0.035), 55); },
  nearMiss(): void { tone(420, 0.07, 'triangle', 0.03); },
  hit(): void { tone(120, 0.18, 'sawtooth', 0.05); },
  button(): void { tone(520, 0.05, 'square', 0.025); },
  startMusic(): void {
    if (musicTimer !== null || !SaveService.load().settings.music) return;
    musicStep = 0;
    musicTimer = window.setInterval(() => {
      if (!SaveService.load().settings.music) return;
      const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
      tone(notes[musicStep % notes.length], 0.16, 'triangle', 0.012);
      musicStep += 1;
    }, 360);
  },
  stopMusic(): void {
    if (musicTimer !== null) window.clearInterval(musicTimer);
    musicTimer = null;
  }
};
