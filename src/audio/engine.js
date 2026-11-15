// import * as Tone from "tone";

// const SCALES = { 
//   pentatonic: [0, 2, 4, 7, 9], 
//   major: [0, 2, 4, 5, 7, 9, 11],
//   minor: [0, 2, 3, 5, 7, 8, 10]
// };

// export function quantize(v, { scale = "pentatonic", rootMidi = 48, octaves = 3 }) {
//   const s = SCALES[scale] || SCALES.pentatonic;
//   const steps = s.length * octaves;
//   const i = Math.min(steps - 1, Math.max(0, Math.floor(v * steps)));
//   return rootMidi + Math.floor(i / s.length) * 12 + s[i % s.length];
// }

// export const norm = (x, [lo, hi]) => (hi === lo ? 0 : (x - lo) / (hi - lo));

// let synth;
// let drone;
// let delay;
// let panner;

// export function initAudio() {
//   if (!synth) {
//     delay = new Tone.PingPongDelay({
//       delayTime: "8n", 
//       feedback: 0.6,
//       wet: 0.4
//     }).toDestination();

//     panner = new Tone.Panner(0).connect(delay);
    
//     drone = new Tone.Synth({
//       oscillator: { type: "triangle" },
//       envelope: { attack: 4, decay: 0, sustain: 0.8, release: 6 }
//     }).connect(panner);
//     drone.volume.value = -20; 

//     synth = new Tone.PolySynth(Tone.Synth, {
//       oscillator: { type: "triangle" },
//       envelope: { attack: 0.8, decay: 0.5, sustain: 0.6, release: 4.0 } 
//     }).connect(panner);
//     synth.volume.value = -10;
//   }
// }

// export async function playFrame(frame, meta, mapping) {
//   await Tone.start();
//   initAudio();
  
//   const t0 = Tone.now();
//   const DURATION = 15.0; 
//   const vol = 0.15 + 0.3 * norm(frame.mean, meta.mean_range);

//   const droneMidi = quantize(0.1, mapping); 
//   const droneFreq = Tone.Frequency(droneMidi, "midi").toFrequency();
//   drone.triggerAttackRelease(droneFreq, DURATION, t0);

//   const n = frame.profile.length;
//   const notesToPlay = 10; 
//   const step = DURATION / notesToPlay; 
//   const profileStep = n / notesToPlay;

//   for (let i = 0; i < notesToPlay; i++) {
//     const profileIndex = Math.floor(i * profileStep);
//     const p = frame.profile[profileIndex];
    
//     const midi = quantize(norm(p, meta.profile_range), mapping);
//     const freq = Tone.Frequency(midi, "midi").toFrequency();
    
//     const noteTime = t0 + (i * step) + 1.0; 
    
//     synth.triggerAttackRelease(freq, step * 1.5, noteTime, vol);
//     panner.pan.setValueAtTime(-1 + (2 * i) / (notesToPlay - 1), noteTime);
//   }
// }

// // NEW: Control the master audio context
// export function pauseAudio() {
//   Tone.getContext().rawContext.suspend();
// }

// export function resumeAudio() {
//   Tone.getContext().rawContext.resume();
// }

// export function stopAudio() {
//   Tone.getContext().rawContext.suspend();
//   if (synth) synth.releaseAll();
//   if (drone) drone.triggerRelease();
// }


// src/audio/engine.js
// Tone.js is loaded lazily so Next.js never evaluates it on the server.
// Only import this file from client components ("use client").

/* ---------- pure helpers (no Tone, safe anywhere) ---------- */

export const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

export function quantize(v, { scale = "pentatonic", rootMidi = 48, octaves = 3 } = {}) {
  const s = SCALES[scale] || SCALES.pentatonic;
  const steps = s.length * octaves;
  const i = Math.min(steps - 1, Math.max(0, Math.floor(v * steps)));
  return rootMidi + Math.floor(i / s.length) * 12 + s[i % s.length];
}

// Normalize with the GLOBAL ranges from features.json "meta" (never per frame).
// Clamped to 0..1 (small improvement: live values can fall outside a stored range).
export const norm = (x, [lo, hi]) =>
  hi === lo ? 0.5 : Math.min(1, Math.max(0, (x - lo) / (hi - lo)));

export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Frame start times + O(log n) lookup for scrubbing (spec section 11).
export function buildStartTimes(count, frameSeconds) {
  return Array.from({ length: count }, (_, i) => i * frameSeconds);
}
export function indexAtTime(starts, t) {
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/* ---------- voices + scheduling (shared by live playback and WAV export) ---------- */

export function createVoices(Tone, mapping, out) {
  const filter = new Tone.Filter(6000, "lowpass").connect(out);
  const v = { kind: mapping.voice, filter, droneOn: false };

  if (mapping.voice === "percussion") {
    v.pan = new Tone.Panner(0).connect(filter);
    v.perc = new Tone.PolySynth(Tone.MembraneSynth, {
      pitchDecay: 0.03,
      octaves: 3,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).connect(v.pan);
    v.perc.volume.value = -4;
  } else {
    v.pan = new Tone.Panner(0).connect(filter);
    // Short, clean notes so differences between frames stay audible.
    v.sweep = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.15 },
    }).connect(v.pan);
    v.sweep.volume.value = -8;
    // Drone has its own path (no panning) and follows mean brightness.
    v.drone = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 1, decay: 0, sustain: 0.8, release: 1 },
    }).connect(filter);
    v.drone.volume.value = -24;
  }
  return v;
}

export function disposeVoices(v) {
  if (!v) return;
  ["sweep", "perc", "drone", "pan", "filter"].forEach((k) => v[k] && v[k].dispose());
}

// Schedules ONE frame starting at `time`, lasting `seconds`.
export function scheduleFrame(Tone, v, frame, meta, mapping, seconds, time) {
  const n = frame.profile.length;
  const step = seconds / n;
  const vol = 0.2 + 0.8 * norm(frame.mean, meta.mean_range);

  // tempoFrom "change": more change between frames = brighter tone (intensity).
  const changeN = norm(frame.change, meta.change_range);
  v.filter.frequency.setValueAtTime(800 + 5200 * changeN, time);

  if (v.kind === "percussion") {
    // Quiet frames are silent on purpose (spec section 10).
    frame.hot.forEach((h, i) => {
      if (h <= 0) return;
      const t = time + i * step;
      const midi = quantize(i / (n - 1), mapping);
      v.pan.pan.setValueAtTime(-1 + (2 * i) / (n - 1), t);
      v.perc.triggerAttackRelease(midiToFreq(midi), 0.2, t, Math.min(1, h * 5));
    });
    return;
  }

  // Soft-synth: left-to-right sweep over all strips.
  frame.profile.forEach((p, i) => {
    const t = time + i * step;
    const midi = quantize(norm(p, meta.profile_range), mapping);
    v.pan.pan.setValueAtTime(-1 + (2 * i) / (n - 1), t);
    v.sweep.triggerAttackRelease(midiToFreq(midi), step * 0.9, t, vol);
  });

  // Drone: low note that tracks mean brightness (attack once, then glide).
  const droneFreq = midiToFreq(quantize(norm(frame.mean, meta.mean_range) * 0.3, mapping) - 12);
  if (!v.droneOn) {
    v.drone.triggerAttack(droneFreq, time);
    v.droneOn = true;
  } else {
    v.drone.frequency.linearRampToValueAtTime(droneFreq, time + 0.2);
  }
}

/* ---------- live engine ---------- */

let Tone = null;
let master = null;     // sound on/off lives here, never suspends the context
let voices = null;
let soundOn = true;

const state = {
  frames: null, meta: null, mapping: null,
  frameSeconds: 1.5, speed: 1,
  index: 0, shown: -1, playing: false,
  onFrame: null, onEnd: null,
};

export async function loadTone() {
  if (!Tone) Tone = await import("tone");
  return Tone;
}

// Must be called from a user gesture (first Play press). Never autoplay.
export async function startAudio() {
  const T = await loadTone();
  await T.start();
  if (!master) master = new T.Gain(soundOn ? 1 : 0).toDestination();
  return T;
}

function ensureVoices(mapping) {
  if (voices && voices.kind !== mapping.voice) cutVoices();
  if (!voices) voices = createVoices(Tone, mapping, master);
  return voices;
}

// Dispose voices: also drops any notes already scheduled in the future.
function cutVoices() {
  disposeVoices(voices);
  voices = null;
}

export function setSoundEnabled(on) {
  soundOn = on;
  if (master) master.gain.rampTo(on ? 1 : 0, 0.05);
}

function interval() {
  return state.frameSeconds / state.speed;
}

function tick(time) {
  const i = state.index;
  if (i >= state.frames.length) {
    Tone.Draw.schedule(() => {
      pausePlayback();
      state.index = 0;
      state.shown = -1;
      if (state.onEnd) state.onEnd();
    }, time);
    return;
  }
  ensureVoices(state.mapping);
  scheduleFrame(Tone, voices, state.frames[i], state.meta, state.mapping, interval(), time);
  state.shown = i;
  state.index = i + 1;
  Tone.Draw.schedule(() => state.onFrame && state.onFrame(i), time);
}

function startLoop() {
  const tr = Tone.getTransport();
  tr.stop();
  tr.cancel();
  tr.position = 0;
  tr.scheduleRepeat(tick, interval(), 0);
  tr.start("+0.05");
  state.playing = true;
}

// cfg: { frames, meta, mapping, frameSeconds, speed, startIndex, onFrame(i), onEnd() }
export async function startPlayback({ startIndex = 0, speed } = {}) {
  if (!state.frames) return;
  await startAudio();
  if (speed) state.speed = speed;
  state.index = startIndex;
  state.shown = -1;
  startLoop();
}

export function loadSequence(cfg) {
  Object.assign(state, {
    frames: cfg.frames, meta: cfg.meta, mapping: cfg.mapping,
    frameSeconds: cfg.frameSeconds, speed: cfg.speed ?? 1,
    index: 0, shown: -1,
    onFrame: cfg.onFrame || null, onEnd: cfg.onEnd || null,
  });
}

export function pausePlayback() {
  if (!Tone) return;
  const tr = Tone.getTransport();
  tr.stop();
  tr.cancel();
  if (state.playing && state.shown >= 0) state.index = state.shown; // resume replays this frame
  state.playing = false;
  cutVoices();
}

// Jump to a frame. If playing, continue from there; otherwise play that frame once.
export async function stepTo(index) {
  if (!state.frames) return 0;
  await startAudio();
  const i = Math.max(0, Math.min(state.frames.length - 1, index));
  const wasPlaying = state.playing;
  pausePlayback();
  state.index = i;
  if (wasPlaying) {
    startLoop();
  } else {
    ensureVoices(state.mapping);
    const t = Tone.now() + 0.05;
    scheduleFrame(Tone, voices, state.frames[i], state.meta, state.mapping, interval(), t);
    if (voices.drone) {
      voices.drone.triggerRelease(t + interval());
      voices.droneOn = false;
    }
    state.shown = i;
    if (state.onFrame) state.onFrame(i);
  }
  return i;
}

export function setSpeed(speed) {
  state.speed = speed;
  if (state.playing) {
    const i = Math.max(0, state.shown);
    pausePlayback();
    state.index = i;
    startLoop();
  }
}

export const isPlaying = () => state.playing;

// Audio legend (key L): lowest note, highest note, then a sweep between them.
export async function playLegend(mapping) {
  await startAudio();
  pausePlayback();
  const v = ensureVoices(mapping);
  const t = Tone.now() + 0.05;
  const play = (midi, time, dur) => {
    v.pan.pan.setValueAtTime(0, time);
    if (v.perc) v.perc.triggerAttackRelease(midiToFreq(midi), 0.25, time, 0.7);
    else v.sweep.triggerAttackRelease(midiToFreq(midi), dur, time, 0.6);
  };
  v.filter.frequency.setValueAtTime(6000, t);
  play(quantize(0, mapping), t, 0.6);
  play(quantize(1, mapping), t + 0.9, 0.6);
  const steps = 16;
  for (let i = 0; i < steps; i++) play(quantize(i / (steps - 1), mapping), t + 1.9 + i * 0.12, 0.11);
  return 1.9 + steps * 0.12;
}

// Call on phenomenon change / unmount to avoid leaks.
export function disposeAudio() {
  pausePlayback();
  state.frames = null;
  state.index = 0;
  state.shown = -1;
}