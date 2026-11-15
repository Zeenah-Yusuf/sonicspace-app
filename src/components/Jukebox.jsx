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



import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  loadSequence, startPlayback, pausePlayback, stepTo, setSpeed,
  setSoundEnabled, playLegend, isPlaying, disposeAudio,
} from "../audio/engine";
import Sweeper from "./Sweeper";
import Accessibility from "./Accessibility";

const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
const DEFAULT_SPEED_INDEX = 2;
const ANNOUNCE_EVERY = 5;

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080f]";
const chip = `rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-100 transition hover:bg-white/10 disabled:opacity-40 ${ring}`;
const panel = "rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-zinc-200";
const eyebrow = "font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300";

const labelFor = (seq, i) => seq.frameLabels?.[i] ?? `Frame ${i + 1} of ${seq.frames.length}`;
const captionFor = (seq, i) => seq.captions[i] || "";

// A missing file comes back as index.html with status 200, so check the type too.
async function fetchJson(url) {
  const res = await fetch(url);
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.includes("json")) throw new Error("MISSING");
  return res.json();
}

// The 64 strips the sound is built from, drawn as bars. Height = pitch.
function Bars({ frame, meta, className = "", style }) {
  const [lo, hi] = meta.profile_range;
  return (
    <div aria-hidden="true" className={`flex items-end gap-px ${className}`} style={style}>
      {frame.profile.map((p, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-sm bg-current"
          style={{ height: `${8 + 92 * Math.min(1, Math.max(0, (p - lo) / (hi - lo || 1)))}%` }}
        />
      ))}
    </div>
  );
}

export default function Jukebox({ trackData, onPlayingChange }) {
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
  const manualRef = useRef(false);

  useEffect(() => { onPlayingChange?.(playing); }, [playing, onPlayingChange]);

  useEffect(() => {
    let cancelled = false;
    setSeq(null); setError(null); setIndex(0); indexRef.current = 0;
    setPlaying(false); setFrameStart(null); setAnnounce("");
    seqRef.current = null;

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

    return () => { cancelled = true; disposeAudio(); };
  }, [trackData]);

  const togglePlay = useCallback(async () => {
    if (!seqRef.current) return;
    if (isPlaying()) {
      pausePlayback(); setPlaying(false); setFrameStart(null);
      return;
    }
    setPlaying(true); setFrameStart(null);
    await startPlayback({ startIndex: indexRef.current, speed: SPEEDS[speedRef.current] });
  }, []);

  const goTo = useCallback((i) => {
    if (!seqRef.current) return;
    manualRef.current = true;
    stepTo(Math.max(0, Math.min(seqRef.current.frames.length - 1, i)));
  }, []);

  const applySpeed = useCallback((i) => {
    const n = Math.max(0, Math.min(SPEEDS.length - 1, i));
    speedRef.current = n; setSpeedIdx(n); setSpeed(SPEEDS[n]);
  }, []);

  const onLegend = useCallback(async () => {
    if (!seqRef.current) return;
    setPlaying(false); setFrameStart(null);
    await playLegend(seqRef.current.mapping);
  }, []);

  const onSoundChange = (e) => {
    soundRef.current = e.target.checked; setSoundOn(e.target.checked); setSoundEnabled(e.target.checked);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target, tag = el.tagName;
      if (tag === "TEXTAREA" || (tag === "INPUT" && !["range", "checkbox", "radio"].includes(el.type))) return;
      const native = ["BUTTON", "SELECT", "INPUT", "A", "SUMMARY"].includes(tag);
      if (e.key === " ") {
        if (native) return;
        e.preventDefault(); togglePlay();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (tag === "SELECT" || tag === "INPUT") return;
        e.preventDefault(); goTo(indexRef.current + (e.key === "ArrowRight" ? 1 : -1));
      } else if (e.key === "[") applySpeed(speedRef.current - 1);
      else if (e.key === "]") applySpeed(speedRef.current + 1);
      else if (e.key.toLowerCase() === "l") onLegend();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, goTo, applySpeed, onLegend]);

  if (error) {
    return (
      <div role="alert" className="grid min-h-[16rem] place-items-center rounded-3xl border border-red-400/40 bg-red-950/30 p-8 text-center text-red-100">
        {error}
      </div>
    );
  }
  if (!seq) {
    return (
      <div role="status" className="grid min-h-[16rem] place-items-center text-zinc-200">
        <span className="animate-pulse motion-reduce:animate-none">Tuning in…</span>
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
    <div className="grid min-h-0 gap-4 lg:h-full lg:grid-cols-[minmax(0,1fr)_19rem]">
      {/* STAGE */}
      <section aria-label={seq.title} className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pb-6 lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_1.5rem),transparent)]">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-white">{seq.title}</h2>
          <span className="font-mono text-xs text-zinc-300">{label} · {index + 1}/{n}</span>
        </div>

        {/* Deck */}
        <div role="group" aria-label="Playback controls" className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur">
          <button type="button" className={chip} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous frame">◀</button>
          <button
            type="button"
            onClick={togglePlay}
            className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/60 bg-[var(--accent,#c4a1ff)] text-xl text-[#07080f] shadow-[0_0_30px_-4px_var(--accent)] transition hover:scale-105 ${ring}`}
          >
            {playing && <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-[var(--accent)] motion-safe:animate-ping" />}
            <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
            <span className="sr-only">{playing ? "Pause" : "Play"}</span>
          </button>
          <button type="button" className={chip} onClick={() => goTo(index + 1)} disabled={index === n - 1} aria-label="Next frame">▶</button>

          {n <= 8 ? (
            <div role="group" aria-label="Frames" className="flex flex-1 flex-wrap gap-2">
              {seq.frames.map((f, i) => (
                <button
                  key={f.file}
                  type="button"
                  aria-pressed={i === index}
                  onClick={() => goTo(i)}
                  className={`${chip} ${i === index ? "!border-[var(--accent)] !bg-white/15 font-semibold text-white" : ""}`}
                >
                  {labelFor(seq, i)}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-w-[10rem] flex-1 flex-col">
              <label htmlFor="scrub" className="text-xs text-zinc-300">Frame: {label}</label>
              <input id="scrub" type="range" min={0} max={n - 1} value={index} onChange={(e) => goTo(Number(e.target.value))} aria-valuetext={label} className={`w-full accent-[var(--accent)] ${ring}`} />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-zinc-100">
            Speed
            <select value={speedIdx} onChange={(e) => applySpeed(Number(e.target.value))} className={`rounded-lg border border-white/15 bg-[#10111c] px-2 py-1.5 text-zinc-100 ${ring}`}>
              {SPEEDS.map((s, i) => <option key={s} value={i}>{s}x</option>)}
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={soundOn} onChange={onSoundChange} className="peer sr-only" />
            <span aria-hidden="true" className="relative h-6 w-11 rounded-full bg-white/20 transition peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-white after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5 peer-checked:after:bg-[#07080f]" />
            Sound
          </label>
        </div>
        <p className="font-mono text-[11px] text-zinc-300">Space play/pause · ← → frames · [ ] speed · L audio legend</p>

        <figure className="m-0 flex min-h-0 flex-1 items-center justify-center">
          <div
            className={`relative overflow-hidden rounded-3xl border bg-black transition-shadow duration-500 ${
              playing ? "border-[var(--accent)] shadow-[0_0_70px_-12px_var(--accent)]" : "border-white/10"
            }`}
          >
            {/* eslint-disable-next-line */}
            <img src={imageUrl} alt={caption || label} className="block h-auto w-auto max-w-full lg:max-h-[max(12rem,calc(100dvh_-_31rem))]" />
            <Sweeper imageUrl={imageUrl} isPlaying={playing} frameStart={frameStart} durationMs={sweepMs} />

            {/* The sound, drawn: bar height = pitch, lit left to right as it plays. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/80 to-transparent">
              <Bars frame={frame} meta={seq.meta} className="absolute inset-x-1 bottom-1 top-2 text-white/30" />
              {playing && (
                <Bars
                  key={frameStart}
                  frame={frame}
                  meta={seq.meta}
                  className="absolute inset-x-1 bottom-1 top-2 text-[var(--accent)]"
                  style={{ animation: `reveal ${sweepMs}ms linear forwards` }}
                />
              )}
            </div>
            <figcaption className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 font-mono text-[11px] text-zinc-200 backdrop-blur">
              {seq.credit}
            </figcaption>
          </div>
        </figure>

        {/* Subtitle-style caption */}
        <div role="region" aria-label="Caption" tabIndex={0} className={`max-h-28 overflow-y-auto rounded-xl px-1 text-sm leading-relaxed text-zinc-100 lg:text-base ${ring}`}>
          {caption || "No caption has been written for this frame yet."}
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>

      </section>

      {/* SIDE PANELS */}
      <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pb-6 lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_1.5rem),transparent)]">
        <section aria-label="Audio legend" className={panel}>
          <h3 className={eyebrow}>What you hear</h3>
          <div className="mt-3 flex gap-3">
            <span aria-hidden="true" className="w-2 shrink-0 rounded-full" style={{ background: "linear-gradient(to top,#2a2a40,var(--accent))" }} />
            <div className="space-y-3 text-sm">
              <p><b className="text-white">High notes</b><br />{seq.mapping.legendHigh}</p>
              <p><b className="text-white">Low notes</b><br />{seq.mapping.legendLow}</p>
            </div>
          </div>
          <button type="button" className={`${chip} mt-3`} onClick={onLegend}>Play the legend (L)</button>
        </section>

        <details className={panel} open>
          <summary className={`cursor-pointer ${eyebrow} ${ring}`}>How it works</summary>
          <p className="mt-3 text-sm">{seq.mapping.description}</p>
          <p className="mt-2 text-xs text-zinc-300">
            Colours in NASA visualizations are an artistic choice, not raw data, so the sound follows how the
            image looks, not exact measurements. Sound is scaled within each sequence, which makes small differences easier to hear.
          </p>
        </details>

        <details className={panel}>
          <summary className={`cursor-pointer ${eyebrow} ${ring}`}>Data table</summary>
          <div className="mt-3 max-h-48 overflow-auto">
            <table className="w-full text-left font-mono text-xs">
              <caption className="sr-only">Mean brightness and change from the previous frame, per frame</caption>
              <thead>
                <tr className="border-b border-white/15">
                  <th scope="col" className="py-1 pr-2">Frame</th>
                  <th scope="col" className="py-1 pr-2">Mean</th>
                  <th scope="col" className="py-1">Change</th>
                </tr>
              </thead>
              <tbody>
                {seq.frames.map((f, i) => (
                  <tr key={f.file} aria-current={i === index ? "true" : undefined} className={i === index ? "bg-white/10" : ""}>
                    <th scope="row" className="py-1 pr-2 font-normal">{labelFor(seq, i)}</th>
                    <td className="py-1 pr-2">{f.mean.toFixed(3)}</td>
                    <td className="py-1">{f.change.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className={panel}>
          <Accessibility text={announce} />
        </div>
      </aside>
    </div>
  );
}