// export async function generateAudioFromImage(imageUrl, duration = 10, sampleRate = 44100) {
//   const img = await loadImage(imageUrl);
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');
  
//   canvas.width = 100;
//   canvas.height = 100;
//   ctx.drawImage(img, 0, 0, 100, 100);
  
//   const imageData = ctx.getImageData(0, 0, 100, 100).data;
  
//   const offlineCtx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
//   const samplesPerColumn = (sampleRate * duration) / 100;

//   for (let x = 0; x < 100; x++) {
//     for (let y = 0; y < 100; y++) {
//       const index = (y * 100 + x) * 4;
//       const r = imageData[index];
//       const g = imageData[index + 1];
//       const b = imageData[index + 2];
      
//       const brightness = (r + g + b) / 3;
      
//       // Density throttling for performance and musicality
//       if (brightness > 40 && Math.random() < 0.2) { 
//         const oscillator = offlineCtx.createOscillator();
//         const gainNode = offlineCtx.createGain();
        
//         oscillator.type = 'sine';
//         // Map Y to Pitch (Top=600Hz, Bottom=150Hz)
//         oscillator.frequency.value = 600 - (y * 4.5);
        
//         const startTime = (x * samplesPerColumn) / sampleRate;
//         const noteDuration = samplesPerColumn / sampleRate;
        
//         // Smooth envelope to prevent clicks
//         gainNode.gain.setValueAtTime(0, startTime);
//         gainNode.gain.linearRampToValueAtTime((brightness / 255) * 0.05, startTime + 0.05);
//         gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
        
//         oscillator.connect(gainNode);
//         gainNode.connect(offlineCtx.destination);
        
//         oscillator.start(startTime);
//         oscillator.stop(startTime + noteDuration);
//       }
//     }
//   }

//   const renderedBuffer = await offlineCtx.startRendering();
//   return audioBufferToWav(renderedBuffer);
// }

// function loadImage(url) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous";
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = url;
//   });
// }

// function audioBufferToWav(buffer) {
//   let numOfChan = buffer.numberOfChannels,
//       length = buffer.length * numOfChan * 2 + 44,
//       bufferArray = new ArrayBuffer(length),
//       view = new DataView(bufferArray),
//       channels = [], i, sample,
//       offset = 0,
//       pos = 0;

//   function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
//   function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

//   setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
//   setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
//   setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan);
//   setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);

//   for(i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

//   while(pos < length) {
//     for(i = 0; i < numOfChan; i++) {
//       sample = Math.max(-1, Math.min(1, channels[i][offset]));
//       sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
//       view.setInt16(pos, sample, true); pos += 2;
//     }
//     offset++;
//   }

//   return new Blob([bufferArray], { type: "audio/wav" });
// }


// src/audio/audioExport.js
// Optional "Download audio (WAV)" feature. It renders features.json through the
// SAME voices/scheduling as live playback, so downloads sound identical.
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