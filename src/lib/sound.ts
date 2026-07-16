/**
 * Efeitos sonoros sintéticos usando WebAudio — sem depender de assets externos.
 * Todos os sons respeitam a preferência do usuário.
 */

import { getPrefs } from "./storage";

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.08) {
  if (!getPrefs().sound) return;
  const ac = ensureCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ac.destination);
  const now = ac.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

export const sfx = {
  deal: () => beep(320, 0.08, "triangle"),
  pick: () => beep(520, 0.09, "sine"),
  pair: () => {
    beep(660, 0.09, "sine");
    setTimeout(() => beep(880, 0.12, "sine"), 90);
  },
  win: () => {
    beep(660, 0.12);
    setTimeout(() => beep(880, 0.14), 120);
    setTimeout(() => beep(1174, 0.2), 260);
  },
  lose: () => {
    beep(300, 0.18, "sawtooth");
    setTimeout(() => beep(200, 0.28, "sawtooth"), 180);
  },
};
