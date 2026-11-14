import * as Tone from "tone";

const SCALES = { 
  pentatonic: [0, 2, 4, 7, 9], 
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10]
};

export function quantize(v, { scale = "pentatonic", rootMidi = 48, octaves = 3 }) {
  const s = SCALES[scale] || SCALES.pentatonic;
  const steps = s.length * octaves;
  const i = Math.min(steps - 1, Math.max(0, Math.floor(v * steps)));
  return rootMidi + Math.floor(i / s.length) * 12 + s[i % s.length];
}

export const norm = (x, [lo, hi]) => (hi === lo ? 0 : (x - lo) / (hi - lo));

let synth;
let drone;
let delay;
let panner;

export function initAudio() {
  if (!synth) {
    delay = new Tone.PingPongDelay({
      delayTime: "8n", 
      feedback: 0.6,
      wet: 0.4
    }).toDestination();

    panner = new Tone.Panner(0).connect(delay);
    
    drone = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 4, decay: 0, sustain: 0.8, release: 6 }
    }).connect(panner);
    drone.volume.value = -20; 

    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.6, release: 4.0 } 
    }).connect(panner);
    synth.volume.value = -10;
  }
}

export async function playFrame(frame, meta, mapping) {
  await Tone.start();
  initAudio();
  
  const t0 = Tone.now();
  const DURATION = 15.0; 
  const vol = 0.15 + 0.3 * norm(frame.mean, meta.mean_range);

  const droneMidi = quantize(0.1, mapping); 
  const droneFreq = Tone.Frequency(droneMidi, "midi").toFrequency();
  drone.triggerAttackRelease(droneFreq, DURATION, t0);

  const n = frame.profile.length;
  const notesToPlay = 10; 
  const step = DURATION / notesToPlay; 
  const profileStep = n / notesToPlay;

  for (let i = 0; i < notesToPlay; i++) {
    const profileIndex = Math.floor(i * profileStep);
    const p = frame.profile[profileIndex];
    
    const midi = quantize(norm(p, meta.profile_range), mapping);
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    
    const noteTime = t0 + (i * step) + 1.0; 
    
    synth.triggerAttackRelease(freq, step * 1.5, noteTime, vol);
    panner.pan.setValueAtTime(-1 + (2 * i) / (notesToPlay - 1), noteTime);
  }
}

// NEW: Control the master audio context
export function pauseAudio() {
  Tone.getContext().rawContext.suspend();
}

export function resumeAudio() {
  Tone.getContext().rawContext.resume();
}

export function stopAudio() {
  Tone.getContext().rawContext.suspend();
  if (synth) synth.releaseAll();
  if (drone) drone.triggerRelease();
}