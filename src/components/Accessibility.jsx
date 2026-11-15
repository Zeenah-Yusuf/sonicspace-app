// import React from 'react';

// export default function Accessibility({ text }) {
//   const speak = () => {
//     if (!text) return;
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     window.speechSynthesis.speak(utterance);
//   };

//   return (
//     <button 
//       onClick={speak}
//       className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors flex items-center gap-2 focus:ring-2 focus:ring-purple-500 outline-none"
//       aria-label="Play audio description of current map"
//     >
//       🔊 Audio Description
//     </button>
//   );
// }


"use client";
import React, { useEffect, useState } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";

function speak(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.lang = document.documentElement.lang || "en";
  window.speechSynthesis.speak(u);
}

// `text` = the latest announced caption from Jukebox (already throttled to every
// 5th frame during playback), so speech doesn't flood either.
export default function Accessibility({ text }) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!supported) return;
    if (!enabled) { window.speechSynthesis.cancel(); return; }
    if (text) speak(text);
  }, [text, enabled, supported]);

  if (!supported) return null; // optional feature: hide if the browser lacks it

  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-zinc-100">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className={`w-5 h-5 accent-purple-500 ${focusRing}`}
        />
        Read captions aloud
      </label>
      <button
        type="button"
        onClick={() => text && speak(text)}
        disabled={!text}
        className={`px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg border border-zinc-600 disabled:opacity-50 ${focusRing}`}
      >
        <span aria-hidden="true">🔊 </span>Read caption now
      </button>
    </div>
  );
}