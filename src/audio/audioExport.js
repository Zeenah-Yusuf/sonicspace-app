// src/audio/audioExport.js
// Renders features through the SAME voices/scheduling as live playback,
// so downloads sound identical to the Jukebox.
import { createVoices, scheduleFrame, loadTone } from "./engine";

export async function renderSequenceToWav({ frames, meta, mapping, frameSeconds }) {
  const Tone = await loadTone();
  const total = frames.length * frameSeconds;

  const buffer = await Tone.Offline(() => {
    const v = createVoices(Tone, mapping, Tone.getDestination());
    frames.forEach((f, i) => {
      scheduleFrame(Tone, v, f, meta, mapping, frameSeconds, 0.05 + i * frameSeconds);
    });
    if (v.drone) v.drone.triggerRelease(0.05 + total);
  }, total + 1.5, 2); // +1.5 s for tails, 2 channels (stereo pan)

  return audioBufferToWav(buffer.get());
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 16-bit PCM WAV encoder (your original, tidied; logic unchanged).
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const view = new DataView(new ArrayBuffer(length));
  const channels = [];
  let pos = 0, offset = 0;

  const setUint16 = (d) => { view.setUint16(pos, d, true); pos += 2; };
  const setUint32 = (d) => { view.setUint32(pos, d, true); pos += 4; };

  setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
  setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
  setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let s = Math.max(-1, Math.min(1, channels[i][offset]));
      s = (s < 0 ? s * 0x8000 : s * 0x7fff) | 0;
      view.setInt16(pos, s, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([view.buffer], { type: "audio/wav" });
}