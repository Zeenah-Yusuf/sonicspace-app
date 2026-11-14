import React, { useState, useEffect } from 'react';
import Jukebox from '../components/Jukebox';
import InteractiveMap from '../components/InteractiveMap';
import { tracks } from '../data/tracks';
import { Globe2, MapPin } from 'lucide-react';

export default function Home() {
  const [phenomenon, setPhenomenon] = useState('nightlights');
  const [region, setRegion] = useState('global');
  const [selectedLocation, setSelectedLocation] = useState('Global Map');

  useEffect(() => {
    const availableRegions = Object.keys(tracks[phenomenon].regions);
    if (!availableRegions.includes(region)) {
      setRegion(availableRegions[0]);
    }
  }, [phenomenon, region]);

  const handleMapSelect = (continentName, countryName) => {
    const location = countryName || continentName || 'Global Map';
    setSelectedLocation(location);

    let targetRegion = 'global';
    if (continentName === 'Asia') targetRegion = 'india';
    else if (continentName === 'Europe') targetRegion = 'ukraine';
    
    if (tracks[phenomenon].regions[targetRegion]) {
      setRegion(targetRegion);
    } else {
      setRegion('global');
    }
  };

  const handleAbujaShortcut = () => {
    setPhenomenon('nightlights');
    setRegion('global');
    setSelectedLocation('Africa / Abuja');
  };

  const handlePhenomenonChange = (e) => {
    setPhenomenon(e.target.value);
    setSelectedLocation('Global Map');
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
    setSelectedLocation(tracks[phenomenon].regions[e.target.value].name);
  };

  // Grab the sequence data
  const activeTrack = tracks[phenomenon]?.regions?.[region]?.sequence;
  const availableRegions = Object.keys(tracks[phenomenon].regions);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <header className="text-center mb-8 mt-4">
        <h1 className="text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
          <Globe2 size={48} className="text-purple-500" />
          SonicSpace
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-6">
          Experience NASA Earth observation data through live, multi-sensory sonification.
        </p>
        
        <button 
          onClick={handleAbujaShortcut}
          className="px-6 py-2 bg-zinc-900 border border-purple-500/50 hover:bg-zinc-800 text-purple-400 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 mx-auto focus:ring-2 focus:ring-purple-500 outline-none shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <MapPin size={16} /> Focus on Africa / Abuja
        </button>
      </header>

      <InteractiveMap onRegionSelect={handleMapSelect} />

      <div className="text-center mb-6 text-sm text-zinc-500 uppercase tracking-widest">
        Active Selection: <span className="font-bold text-purple-400">{selectedLocation}</span>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <select 
          value={phenomenon} 
          onChange={handlePhenomenonChange}
          className="px-6 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-lg cursor-pointer outline-none focus:border-purple-500 font-semibold"
        >
          {Object.keys(tracks).map(key => (
            <option key={key} value={key}>{tracks[key].name}</option>
          ))}
        </select>

        <select 
          value={region} 
          onChange={handleRegionChange}
          className="px-6 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-lg cursor-pointer outline-none focus:border-purple-500"
        >
          {availableRegions.map(key => (
            <option key={key} value={key}>{tracks[phenomenon].regions[key].name}</option>
          ))}
        </select>
      </div>

      {activeTrack ? (
        <Jukebox trackData={activeTrack} />
      ) : (
        <div className="text-zinc-500 mt-10">Data not available for this selection.</div>
      )}
    </div>
  );
}