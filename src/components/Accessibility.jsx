import React from 'react';

export default function Accessibility({ text }) {
  const speak = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button 
      onClick={speak}
      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors flex items-center gap-2 focus:ring-2 focus:ring-purple-500 outline-none"
      aria-label="Play audio description of current map"
    >
      🔊 Audio Description
    </button>
  );
}