// import React, { useState, useEffect, useRef } from 'react';
// import * as Tone from 'tone';
// import { playFrame, initAudio, stopAudio, pauseAudio, resumeAudio } from '../audio/engine';
// import Sweeper from './Sweeper';

// const formatFrameName = (filename) => {
//   return filename.replace(/\.(jpg|png)/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
// };

// export default function Jukebox({ trackData }) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [filteredFrames, setFilteredFrames] = useState([]);
//   const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
//   const [meta, setMeta] = useState(null);
//   const [error, setError] = useState(null);
  
//   const playRef = useRef(false);
//   const timeoutRef = useRef(null); // To stop UI state after 15s

//   useEffect(() => {
//     setFilteredFrames([]);
//     setMeta(null);
//     setError(null);
//     setSelectedFrameIndex(0);
//     setIsPlaying(false);
//     playRef.current = false;
//     stopAudio();

//     fetch(trackData.features)
//       .then(res => res.json())
//       .then(data => {
//         const filtered = data.frames.filter(frame => 
//           frame.file.toLowerCase().includes(trackData.filter.toLowerCase())
//         );
//         if (filtered.length === 0) throw new Error(`No images found matching: ${trackData.filter}`);
//         setFilteredFrames(filtered);
//         setMeta(data.meta);
//       })
//       .catch(err => setError(err.message));
//   }, [trackData]);

//   const togglePlay = async () => {
//     if (filteredFrames.length === 0) return;
    
//     if (isPlaying) {
//       // Pause state
//       setIsPlaying(false);
//       playRef.current = false;
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//       pauseAudio();
//     } else {
//       // Play state
//       await Tone.start(); 
//       initAudio();
//       resumeAudio();
//       setIsPlaying(true);
//       playRef.current = true;
      
//       // Reset timer
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);

//       setTimeout(() => {
//         playFrame(filteredFrames[selectedFrameIndex], meta, trackData.mapping);
//       }, 150);

//       // Automatically set isPlaying to false after 15 seconds
//       timeoutRef.current = setTimeout(() => {
//         setIsPlaying(false);
//         playRef.current = false;
//         stopAudio();
//       }, 15000);
//     }
//   };

//   const handleFrameChange = (e) => {
//     const newIndex = parseInt(e.target.value);
//     setSelectedFrameIndex(newIndex);
    
//     if (isPlaying) {
//       setIsPlaying(false);
//       playRef.current = false;
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//       pauseAudio();
//     }
//   };

//   if (error) return <div className="text-red-500 mt-10 p-4 bg-red-900/20 border border-red-500 rounded-lg">{error}</div>;
//   if (filteredFrames.length === 0) return <div className="text-purple-400 mt-10 animate-pulse">Loading sequence data...</div>;

//   const currentFrame = filteredFrames[selectedFrameIndex];
//   const imageUrl = `/images/${currentFrame.file}`;

//   return (
//     <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-8">
//       <div className={`relative w-full rounded-xl overflow-hidden border transition-all duration-500 ${isPlaying ? 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)]' : 'border-zinc-800'}`}>
//         <img src={imageUrl} alt={formatFrameName(currentFrame.file)} className="w-full block" />
        
//         {/* Pass isPlaying to Sweeper */}
//         <Sweeper imageUrl={imageUrl} isPlaying={isPlaying} />
//       </div>

//       <div className="flex flex-col md:flex-row gap-4 mt-8 items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800 w-full justify-between">
//         <div className="flex flex-col w-full md:w-1/2">
//           <label className="text-sm text-zinc-400 mb-1">Select Frame</label>
//           <select 
//             value={selectedFrameIndex} 
//             onChange={handleFrameChange}
//             className="px-4 py-3 bg-zinc-800 text-white border border-zinc-700 rounded-lg cursor-pointer outline-none focus:border-purple-500 font-semibold"
//           >
//             {filteredFrames.map((frame, index) => (
//               <option key={frame.file} value={index}>
//                 {formatFrameName(frame.file)}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button 
//           onClick={togglePlay} 
//           className="px-8 py-3 mt-5 md:mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-all w-full md:w-auto"
//         >
//           {isPlaying ? 'Pause Audio' : 'Play Audio'}
//         </button>
//       </div>

//       <div className="w-full mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
//         <p className="text-sm text-purple-400 mb-2 uppercase tracking-widest font-semibold">
//           {formatFrameName(currentFrame.file)}
//         </p>
//         <div aria-live="polite" className="text-white text-lg leading-relaxed">
//           {trackData.captions?.[selectedFrameIndex] || `Playing audio for ${formatFrameName(currentFrame.file)}.`}
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  loadSequence, startPlayback, pausePlayback, stepTo, setSpeed,
  setSoundEnabled, playLegend, isPlaying, disposeAudio,
} from "../audio/engine";
import Sweeper from "./Sweeper";
import Accessibility from "./Accessibility";

const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
const DEFAULT_SPEED_INDEX = 2;
const ANNOUNCE_EVERY = 5; // spec section 12: don't flood screen readers

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";
const btn =
  `px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg border border-zinc-600 ${focusRing}`;

const labelFor = (seq, i) =>
  seq.frameLabels?.[i] ?? `Frame ${i + 1} of ${seq.frames.length}`;
const captionFor = (seq, i) => seq.captions[i] || "";

async function fetchJson(url) {
  const res = await fetch(url);
  const type = res.headers.get("content-type") || "";
  // Vite and Vercel answer a missing file with index.html and status 200, so check the type too.
  if (!res.ok || !type.includes("json")) throw new Error("MISSING");
  return res.json();
}

// trackData comes from getSequence(trackKey, regionKey) in src/data/tracks.js
export default function Jukebox({ trackData }) {
  const [seq, setSeq] = useState(null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(DEFAULT_SPEED_INDEX);
  const [soundOn, setSoundOn] = useState(true);
  const [frameStart, setFrameStart] = useState(null);
  const [announce, setAnnounce] = useState("");

  const seqRef = useRef(null);
  const indexRef = useRef(0);
  const speedRef = useRef(DEFAULT_SPEED_INDEX);
  const soundRef = useRef(true);
  const manualRef = useRef(false); // true when the user (not the clock) changed frame

  /* ---------- load features + captions ---------- */
  useEffect(() => {
    let cancelled = false;
    setSeq(null); setError(null); setIndex(0); indexRef.current = 0;
    setPlaying(false); setFrameStart(null); setAnnounce("");
    seqRef.current = null;

    // Promise.all([
    //   fetch(trackData.features).then((r) => {
    //     if (!r.ok) throw new Error(`Could not load ${trackData.features} (${r.status})`);
    //     return r.json();
    //   }),
    //   fetch(trackData.captions).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    // ])
    Promise.all([
      fetchJson(trackData.features),
      fetchJson(trackData.captions).catch(() => []),
    ])
    .then(([features, captions]) => {
        if (cancelled) return;
        if (!features.frames?.length) throw new Error("features.json has no frames.");

        const loaded = {
          ...trackData,
          meta: features.meta,
          frames: features.frames,
          captions: features.frames.map((_, i) => captions.find((c) => c.i === i)?.text ?? ""),
        };
        seqRef.current = loaded;

        loadSequence({
          frames: loaded.frames,
          meta: loaded.meta,
          mapping: loaded.mapping,
          frameSeconds: loaded.frameSeconds,
          speed: SPEEDS[speedRef.current],
          onFrame: (i) => {
            indexRef.current = i;
            setIndex(i);
            setFrameStart(performance.now());
            const manual = manualRef.current;
            manualRef.current = false;
            // Announce on user steps, otherwise every 5th frame.
            if (manual || i % ANNOUNCE_EVERY === 0) {
              setAnnounce(`${labelFor(loaded, i)}. ${captionFor(loaded, i)}`);
            }
          },
          onEnd: () => { setPlaying(false); setFrameStart(null); },
        });
        setSoundEnabled(soundRef.current);
        setSeq(loaded);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e.message === "MISSING"
            ? `No data has been added for "${trackData.title}" yet (expected ${trackData.features}).`
            : e.message
        );
      });
      // .catch((e) => { if (!cancelled) setError(e.message); });

    return () => { cancelled = true; disposeAudio(); };
  }, [trackData]);

  /* ---------- actions ---------- */
  const togglePlay = useCallback(async () => {
    if (!seqRef.current) return;
    if (isPlaying()) {
      pausePlayback();
      setPlaying(false);
      setFrameStart(null);
      return;
    }
    setPlaying(true);
    setFrameStart(null);
    await startPlayback({ startIndex: indexRef.current, speed: SPEEDS[speedRef.current] });
  }, []);

  const goTo = useCallback((i) => {
    if (!seqRef.current) return;
    const clamped = Math.max(0, Math.min(seqRef.current.frames.length - 1, i));
    manualRef.current = true;
    stepTo(clamped);
  }, []);

  const applySpeed = useCallback((i) => {
    const n = Math.max(0, Math.min(SPEEDS.length - 1, i));
    speedRef.current = n;
    setSpeedIdx(n);
    setSpeed(SPEEDS[n]);
  }, []);

  const onLegend = useCallback(async () => {
    if (!seqRef.current) return;
    setPlaying(false);
    setFrameStart(null);
    await playLegend(seqRef.current.mapping);
  }, []);

  const onSoundChange = (e) => {
    soundRef.current = e.target.checked;
    setSoundOn(e.target.checked);
    setSoundEnabled(e.target.checked);
  };

  /* ---------- keyboard: Space, ←/→, [ ], L (spec section 12) ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target;
      const tag = el.tagName;
      const typing = tag === "TEXTAREA" || (tag === "INPUT" && !["range", "checkbox"].includes(el.type));
      if (typing) return;
      const native = ["BUTTON", "SELECT", "INPUT", "A", "SUMMARY"].includes(tag);

      if (e.key === " ") {
        if (native) return; // let the focused control handle Space itself
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (tag === "SELECT" || tag === "INPUT") return; // native range/select behavior
        e.preventDefault();
        goTo(indexRef.current + (e.key === "ArrowRight" ? 1 : -1));
      } else if (e.key === "[") {
        applySpeed(speedRef.current - 1);
      } else if (e.key === "]") {
        applySpeed(speedRef.current + 1);
      } else if (e.key.toLowerCase() === "l") {
        onLegend();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, goTo, applySpeed, onLegend]);

  /* ---------- render ---------- */
  if (error) {
    return (
      <div role="alert" className="text-red-300 mt-10 p-4 bg-red-900/20 border border-red-500 rounded-lg">
        {error}
      </div>
    );
  }
  if (!seq) {
    return (
      <div role="status" className="text-purple-300 mt-10 animate-pulse motion-reduce:animate-none">
        Loading sequence data...
      </div>
    );
  }

  const n = seq.frames.length;
  const frame = seq.frames[index];
  const caption = captionFor(seq, index);
  const label = labelFor(seq, index);
  const imageUrl = `${seq.framesDir}/${frame.file}`;
  const sweepMs = (seq.frameSeconds / SPEEDS[speedIdx]) * 1000;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-8 gap-6">
      <h2 className="text-xl font-semibold text-white self-start">{seq.title}</h2>

      {/* Frame + sweeper */}
      <figure className="w-full m-0">
        <div
          className={`relative w-full rounded-xl overflow-hidden border motion-reduce:transition-none transition-all duration-500 ${
            playing ? "border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)]" : "border-zinc-700"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={caption || label} className="w-full block" />
          <Sweeper imageUrl={imageUrl} isPlaying={playing} frameStart={frameStart} durationMs={sweepMs} />
        </div>
        <figcaption className="text-sm text-zinc-300 mt-2 flex justify-between gap-4">
          <span className="font-semibold text-purple-300">{label}</span>
          <span>{seq.credit}</span>
        </figcaption>
      </figure>

      {/* Transport */}
      <section aria-label="Playback controls" className="w-full bg-zinc-900 p-4 rounded-xl border border-zinc-700 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btn} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous frame">
            ◀ Prev
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className={`px-8 py-3 bg-gradient-to-r from-blue-700 to-purple-700 text-white font-bold rounded-lg ${focusRing}`}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className={btn} onClick={() => goTo(index + 1)} disabled={index === n - 1} aria-label="Next frame">
            Next ▶
          </button>
          <button type="button" className={btn} onClick={onLegend}>
            Audio legend (L)
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex flex-col flex-1">
            <label htmlFor="scrub" className="text-sm text-zinc-300 mb-1">
              Frame: {label}
            </label>
            <input
              id="scrub"
              type="range"
              min={0}
              max={n - 1}
              value={index}
              onChange={(e) => goTo(Number(e.target.value))}
              aria-valuetext={label}
              className={`w-full accent-purple-500 ${focusRing}`}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="speed" className="text-sm text-zinc-300 mb-1">Speed</label>
            <select
              id="speed"
              value={speedIdx}
              onChange={(e) => applySpeed(Number(e.target.value))}
              className={`px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg ${focusRing}`}
            >
              {SPEEDS.map((s, i) => (
                <option key={s} value={i}>{s}x</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-zinc-100 pb-2">
            <input type="checkbox" checked={soundOn} onChange={onSoundChange} className={`w-5 h-5 accent-purple-500 ${focusRing}`} />
            Sound
          </label>
        </div>

        <p className="text-xs text-zinc-300">
          Keyboard: Space play/pause · ← → previous/next frame · [ ] slower/faster · L audio legend
        </p>
      </section>

      {/* Caption: visible for everyone, announced politely and sparingly */}
      <section aria-label="Caption" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-6">
        <p className="text-sm text-purple-300 mb-2 uppercase tracking-widest font-semibold">{label}</p>
        <p className="text-white text-lg leading-relaxed">
          {caption || "No caption has been written for this frame yet."}
        </p>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>
        <div className="mt-4">
          <Accessibility text={announce} />
        </div>
      </section>

      {/* Audio legend text */}
      <section aria-label="Audio legend" className="w-full text-zinc-200 text-sm bg-zinc-900 border border-zinc-700 rounded-lg p-4">
        <p><strong>Low notes:</strong> {seq.mapping.legendLow}</p>
        <p><strong>High notes:</strong> {seq.mapping.legendHigh}</p>
      </section>

      {/* How it works */}
      <details className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-zinc-200">
        <summary className={`cursor-pointer font-semibold ${focusRing}`}>How it works</summary>
        <p className="mt-3">{seq.mapping.description}</p>
        <p className="mt-2 text-sm text-zinc-300">
          Colors in NASA visualizations are an artistic choice, not raw data values, so the sound
          shows what the image looks like, not exact measurements.
        </p>
      </details>

      {/* Data table */}
      <details className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-zinc-200">
        <summary className={`cursor-pointer font-semibold ${focusRing}`}>Data table</summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Mean brightness and change from the previous frame, per frame</caption>
            <thead>
              <tr className="border-b border-zinc-600">
                <th scope="col" className="py-1 pr-4">Frame</th>
                <th scope="col" className="py-1 pr-4">Mean brightness (0-1)</th>
                <th scope="col" className="py-1">Change</th>
              </tr>
            </thead>
            <tbody>
              {seq.frames.map((f, i) => (
                <tr
                  key={f.file}
                  aria-current={i === index ? "true" : undefined}
                  className={i === index ? "bg-purple-900/40" : ""}
                >
                  <th scope="row" className="py-1 pr-4 font-normal">{labelFor(seq, i)}</th>
                  <td className="py-1 pr-4">{f.mean.toFixed(3)}</td>
                  <td className="py-1">{f.change.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}