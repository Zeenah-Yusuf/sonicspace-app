// import React, { useState, useRef } from 'react';
// import { generateAudioFromImage } from '../utils/audioEngine';
// import { UploadCloud, Download, Loader2 } from 'lucide-react';

// export default function Studio() {
//   const [imageUrl, setImageUrl] = useState(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [audioUrl, setAudioUrl] = useState(null);
//   const fileInputRef = useRef(null);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageUrl(URL.createObjectURL(file));
//       setAudioUrl(null);
//     }
//   };

//   const handleGenerate = async () => {
//     if (!imageUrl) return;
//     setIsGenerating(true);
//     try {
//       const wavBlob = await generateAudioFromImage(imageUrl, 10);
//       const url = URL.createObjectURL(wavBlob);
//       setAudioUrl(url);
//     } catch (error) {
//       console.error("Audio generation failed:", error);
//       alert("Failed to generate audio. Please try a different image.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="min-h-screen p-8 flex flex-col items-center">
//       <header className="text-center mb-10 mt-4">
//         <h1 className="text-4xl font-extrabold mb-2 text-white">
//           Audio Studio
//         </h1>
//         <p className="text-zinc-400 text-lg">
//           Upload any NASA map or image to sonify it instantly.
//         </p>
//       </header>

//       <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
//         {!imageUrl ? (
//           <div 
//             onClick={() => fileInputRef.current?.click()}
//             className="border-2 border-dashed border-zinc-700 hover:border-purple-500 hover:bg-zinc-800/50 transition-all rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer"
//           >
//             <UploadCloud size={48} className="text-zinc-500 mb-4" />
//             <p className="text-zinc-300 font-medium">Click to upload an image</p>
//             <p className="text-zinc-500 text-sm mt-2">PNG, JPG up to 10MB</p>
//             <input 
//               type="file" 
//               accept="image/*" 
//               className="hidden" 
//               ref={fileInputRef} 
//               onChange={handleImageUpload} 
//             />
//           </div>
//         ) : (
//           <div className="flex flex-col items-center">
//             <img 
//               src={imageUrl} 
//               alt="Uploaded preview" 
//               className="w-full max-h-80 object-contain rounded-lg border border-zinc-700 mb-6" 
//             />
            
//             <div className="flex gap-4 w-full justify-center">
//               <button 
//                 onClick={() => { setImageUrl(null); setAudioUrl(null); }}
//                 className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
//                 disabled={isGenerating}
//               >
//                 Change Image
//               </button>
              
//               <button 
//                 onClick={handleGenerate}
//                 disabled={isGenerating}
//                 className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
//               >
//                 {isGenerating ? (
//                   <><Loader2 size={20} className="animate-spin" /> Generating...</>
//                 ) : (
//                   '🎵 Generate Sound'
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {audioUrl && (
//           <div className="mt-8 pt-8 border-t border-zinc-800 animate-fade-in">
//             <h3 className="text-center text-green-400 font-semibold mb-4">✅ Sonification Complete</h3>
//             <audio controls src={audioUrl} className="w-full mb-4" />
//             <a 
//               href={audioUrl} 
//               download="sonicspace_generated.wav"
//               className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
//             >
//               <Download size={20} /> Download .WAV File
//             </a>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";
import { tracks } from "../data/tracks";
import { extractFeaturesFromUrl, SINGLE_FRAME_META } from "../lib/features";
import { renderSequenceToWav } from "../audio/audioExport";

const MAX_BYTES = 10 * 1024 * 1024;
const SOUND_SECONDS = 10;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";

// "Sound style" = the mapping of each phenomenon, so Studio and Jukebox sound the same.
const STYLES = Object.entries(tracks).map(([key, t]) => ({
  key,
  label: t.name,
  mapping: Object.values(t.regions)[0].sequence.mapping,
}));

export default function Studio() {
  const [imageUrl, setImageUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [styleKey, setStyleKey] = useState(STYLES[0].key);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const urlsRef = useRef({ image: null, audio: null });

  // Free object URLs when replaced and on unmount.
  const swapUrl = (kind, next) => {
    if (urlsRef.current[kind]) URL.revokeObjectURL(urlsRef.current[kind]);
    urlsRef.current[kind] = next;
  };
  useEffect(() => () => {
    Object.values(urlsRef.current).forEach((u) => u && URL.revokeObjectURL(u));
  }, []);

  const reset = () => {
    swapUrl("image", null);
    swapUrl("audio", null);
    setImageUrl(null);
    setAudioUrl(null);
    setAltText("");
    setError("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file (PNG or JPG).");
    if (file.size > MAX_BYTES) return setError("That image is larger than 10 MB. Please choose a smaller one.");
    const url = URL.createObjectURL(file);
    swapUrl("image", url);
    swapUrl("audio", null);
    setImageUrl(url);
    setAudioUrl(null);
    setError("");
  };

  const handleGenerate = async () => {
    if (!imageUrl) return;
    setIsGenerating(true);
    setError("");
    try {
      const features = await extractFeaturesFromUrl(imageUrl);
      // A single image has no previous frame; use a neutral "change" so the tone isn't muffled.
      const frame = { ...features, change: 0.5 };
      const mapping = STYLES.find((s) => s.key === styleKey).mapping;
      const wav = await renderSequenceToWav({
        frames: [frame],
        meta: SINGLE_FRAME_META,
        mapping,
        frameSeconds: SOUND_SECONDS,
      });
      const url = URL.createObjectURL(wav);
      swapUrl("audio", url);
      setAudioUrl(url);
    } catch (err) {
      console.error("Audio generation failed:", err);
      setError("Failed to generate audio. Please try a different image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <header className="text-center mb-10 mt-4">
        <h1 className="text-4xl font-extrabold mb-2 text-white">Audio Studio</h1>
        <p className="text-zinc-300 text-lg max-w-xl">
          Upload a map or image and hear it as a left-to-right sweep, using the same sound mappings
          as the Jukebox.
        </p>
      </header>

      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-2xl">
        {error && (
          <p role="alert" className="mb-4 p-3 rounded-lg border border-red-500 bg-red-900/20 text-red-200">
            {error}
          </p>
        )}

        {!imageUrl ? (
          <div className="border-2 border-dashed border-zinc-600 rounded-xl h-64 flex flex-col items-center justify-center gap-2">
            <UploadCloud size={48} className="text-zinc-300" aria-hidden="true" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg border border-zinc-600 ${focusRing}`}
            >
              Choose an image
            </button>
            <p className="text-zinc-300 text-sm">PNG or JPG, up to 10 MB</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
              aria-label="Image file"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={altText || "Uploaded image (no description provided)"}
              className="w-full max-h-80 object-contain rounded-lg border border-zinc-600"
            />

            <div className="flex flex-col">
              <label htmlFor="alt" className="text-sm text-zinc-300 mb-1">
                Describe this image (optional, used as its text description)
              </label>
              <input
                id="alt"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className={`px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg ${focusRing}`}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="style" className="text-sm text-zinc-300 mb-1">Sound style</label>
              <select
                id="style"
                value={styleKey}
                onChange={(e) => setStyleKey(e.target.value)}
                className={`px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg ${focusRing}`}
              >
                {STYLES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <p className="text-xs text-zinc-300 mt-1">
                Percussion styles (Lightning) only play for very bright spots, so many images will be
                silent in that style.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={reset}
                disabled={isGenerating}
                className={`px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg disabled:opacity-50 ${focusRing}`}
              >
                Change image
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`px-6 py-3 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 ${focusRing}`}
              >
                {isGenerating ? (
                  <><Loader2 size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Generating...</>
                ) : (
                  "Generate sound"
                )}
              </button>
            </div>
          </div>
        )}

        <div role="status" className="sr-only">
          {isGenerating ? "Generating sound" : audioUrl ? "Sound is ready" : ""}
        </div>

        {audioUrl && (
          <div className="mt-8 pt-8 border-t border-zinc-700">
            <h2 className="text-center text-green-300 font-semibold mb-4">Sound ready</h2>
            <audio controls src={audioUrl} className="w-full mb-4" />
            <a
              href={audioUrl}
              download="sonicspace_generated.wav"
              className={`w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg flex items-center justify-center gap-2 ${focusRing}`}
            >
              <Download size={20} aria-hidden="true" /> Download .WAV file
            </a>
            <p className="text-xs text-zinc-300 mt-4">
              Pitch follows brightness from left to right. Colors in rendered images are not exact
              measurements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}