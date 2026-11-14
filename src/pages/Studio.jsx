import React, { useState, useRef } from 'react';
import { generateAudioFromImage } from '../utils/audioEngine';
import { UploadCloud, Download, Loader2 } from 'lucide-react';

export default function Studio() {
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUrl(URL.createObjectURL(file));
      setAudioUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!imageUrl) return;
    setIsGenerating(true);
    try {
      const wavBlob = await generateAudioFromImage(imageUrl, 10);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Audio generation failed:", error);
      alert("Failed to generate audio. Please try a different image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <header className="text-center mb-10 mt-4">
        <h1 className="text-4xl font-extrabold mb-2 text-white">
          Audio Studio
        </h1>
        <p className="text-zinc-400 text-lg">
          Upload any NASA map or image to sonify it instantly.
        </p>
      </header>

      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        {!imageUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-purple-500 hover:bg-zinc-800/50 transition-all rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer"
          >
            <UploadCloud size={48} className="text-zinc-500 mb-4" />
            <p className="text-zinc-300 font-medium">Click to upload an image</p>
            <p className="text-zinc-500 text-sm mt-2">PNG, JPG up to 10MB</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img 
              src={imageUrl} 
              alt="Uploaded preview" 
              className="w-full max-h-80 object-contain rounded-lg border border-zinc-700 mb-6" 
            />
            
            <div className="flex gap-4 w-full justify-center">
              <button 
                onClick={() => { setImageUrl(null); setAudioUrl(null); }}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                disabled={isGenerating}
              >
                Change Image
              </button>
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <><Loader2 size={20} className="animate-spin" /> Generating...</>
                ) : (
                  '🎵 Generate Sound'
                )}
              </button>
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="mt-8 pt-8 border-t border-zinc-800 animate-fade-in">
            <h3 className="text-center text-green-400 font-semibold mb-4">✅ Sonification Complete</h3>
            <audio controls src={audioUrl} className="w-full mb-4" />
            <a 
              href={audioUrl} 
              download="sonicspace_generated.wav"
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} /> Download .WAV File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}