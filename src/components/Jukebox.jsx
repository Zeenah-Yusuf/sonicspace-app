import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { playFrame, initAudio, stopAudio, pauseAudio, resumeAudio } from '../audio/engine';
import Sweeper from './Sweeper';

const formatFrameName = (filename) => {
  return filename.replace(/\.(jpg|png)/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function Jukebox({ trackData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [filteredFrames, setFilteredFrames] = useState([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  
  const playRef = useRef(false);
  const timeoutRef = useRef(null); // To stop UI state after 15s

  useEffect(() => {
    setFilteredFrames([]);
    setMeta(null);
    setError(null);
    setSelectedFrameIndex(0);
    setIsPlaying(false);
    playRef.current = false;
    stopAudio();

    fetch(trackData.features)
      .then(res => res.json())
      .then(data => {
        const filtered = data.frames.filter(frame => 
          frame.file.toLowerCase().includes(trackData.filter.toLowerCase())
        );
        if (filtered.length === 0) throw new Error(`No images found matching: ${trackData.filter}`);
        setFilteredFrames(filtered);
        setMeta(data.meta);
      })
      .catch(err => setError(err.message));
  }, [trackData]);

  const togglePlay = async () => {
    if (filteredFrames.length === 0) return;
    
    if (isPlaying) {
      // Pause state
      setIsPlaying(false);
      playRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      pauseAudio();
    } else {
      // Play state
      await Tone.start(); 
      initAudio();
      resumeAudio();
      setIsPlaying(true);
      playRef.current = true;
      
      // Reset timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setTimeout(() => {
        playFrame(filteredFrames[selectedFrameIndex], meta, trackData.mapping);
      }, 150);

      // Automatically set isPlaying to false after 15 seconds
      timeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        playRef.current = false;
        stopAudio();
      }, 15000);
    }
  };

  const handleFrameChange = (e) => {
    const newIndex = parseInt(e.target.value);
    setSelectedFrameIndex(newIndex);
    
    if (isPlaying) {
      setIsPlaying(false);
      playRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      pauseAudio();
    }
  };

  if (error) return <div className="text-red-500 mt-10 p-4 bg-red-900/20 border border-red-500 rounded-lg">{error}</div>;
  if (filteredFrames.length === 0) return <div className="text-purple-400 mt-10 animate-pulse">Loading sequence data...</div>;

  const currentFrame = filteredFrames[selectedFrameIndex];
  const imageUrl = `/images/${currentFrame.file}`;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-8">
      <div className={`relative w-full rounded-xl overflow-hidden border transition-all duration-500 ${isPlaying ? 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)]' : 'border-zinc-800'}`}>
        <img src={imageUrl} alt={formatFrameName(currentFrame.file)} className="w-full block" />
        
        {/* Pass isPlaying to Sweeper */}
        <Sweeper imageUrl={imageUrl} isPlaying={isPlaying} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-8 items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800 w-full justify-between">
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm text-zinc-400 mb-1">Select Frame</label>
          <select 
            value={selectedFrameIndex} 
            onChange={handleFrameChange}
            className="px-4 py-3 bg-zinc-800 text-white border border-zinc-700 rounded-lg cursor-pointer outline-none focus:border-purple-500 font-semibold"
          >
            {filteredFrames.map((frame, index) => (
              <option key={frame.file} value={index}>
                {formatFrameName(frame.file)}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={togglePlay} 
          className="px-8 py-3 mt-5 md:mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-all w-full md:w-auto"
        >
          {isPlaying ? 'Pause Audio' : 'Play Audio'}
        </button>
      </div>

      <div className="w-full mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-sm text-purple-400 mb-2 uppercase tracking-widest font-semibold">
          {formatFrameName(currentFrame.file)}
        </p>
        <div aria-live="polite" className="text-white text-lg leading-relaxed">
          {trackData.captions?.[selectedFrameIndex] || `Playing audio for ${formatFrameName(currentFrame.file)}.`}
        </div>
      </div>
    </div>
  );
}