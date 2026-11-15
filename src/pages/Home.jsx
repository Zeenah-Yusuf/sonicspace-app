// import React, { useState, useEffect } from 'react';
// import Jukebox from '../components/Jukebox';
// import InteractiveMap from '../components/InteractiveMap';
// import { tracks } from '../data/tracks';
// import { Globe2, MapPin } from 'lucide-react';

// export default function Home() {
//   const [phenomenon, setPhenomenon] = useState('nightlights');
//   const [region, setRegion] = useState('global');
//   const [selectedLocation, setSelectedLocation] = useState('Global Map');

//   useEffect(() => {
//     const availableRegions = Object.keys(tracks[phenomenon].regions);
//     if (!availableRegions.includes(region)) {
//       setRegion(availableRegions[0]);
//     }
//   }, [phenomenon, region]);

//   const handleMapSelect = (continentName, countryName) => {
//     const location = countryName || continentName || 'Global Map';
//     setSelectedLocation(location);

//     let targetRegion = 'global';
//     if (continentName === 'Asia') targetRegion = 'india';
//     else if (continentName === 'Europe') targetRegion = 'ukraine';
    
//     if (tracks[phenomenon].regions[targetRegion]) {
//       setRegion(targetRegion);
//     } else {
//       setRegion('global');
//     }
//   };

//   const handleAbujaShortcut = () => {
//     setPhenomenon('nightlights');
//     setRegion('global');
//     setSelectedLocation('Africa / Abuja');
//   };

//   const handlePhenomenonChange = (e) => {
//     setPhenomenon(e.target.value);
//     setSelectedLocation('Global Map');
//   };

//   const handleRegionChange = (e) => {
//     setRegion(e.target.value);
//     setSelectedLocation(tracks[phenomenon].regions[e.target.value].name);
//   };

//   // Grab the sequence data
//   const activeTrack = tracks[phenomenon]?.regions?.[region]?.sequence;
//   const availableRegions = Object.keys(tracks[phenomenon].regions);

//   return (
//     <div className="min-h-screen p-8 flex flex-col items-center">
//       <header className="text-center mb-8 mt-4">
//         <h1 className="text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
//           <Globe2 size={48} className="text-purple-500" />
//           SonicSpace
//         </h1>
//         <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-6">
//           Experience NASA Earth observation data through live, multi-sensory sonification.
//         </p>
        
//         <button 
//           onClick={handleAbujaShortcut}
//           className="px-6 py-2 bg-zinc-900 border border-purple-500/50 hover:bg-zinc-800 text-purple-400 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 mx-auto focus:ring-2 focus:ring-purple-500 outline-none shadow-[0_0_15px_rgba(168,85,247,0.2)]"
//         >
//           <MapPin size={16} /> Focus on Africa / Abuja
//         </button>
//       </header>

//       <InteractiveMap onRegionSelect={handleMapSelect} />

//       <div className="text-center mb-6 text-sm text-zinc-500 uppercase tracking-widest">
//         Active Selection: <span className="font-bold text-purple-400">{selectedLocation}</span>
//       </div>

//       <div className="flex flex-wrap justify-center gap-4 mb-8">
//         <select 
//           value={phenomenon} 
//           onChange={handlePhenomenonChange}
//           className="px-6 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-lg cursor-pointer outline-none focus:border-purple-500 font-semibold"
//         >
//           {Object.keys(tracks).map(key => (
//             <option key={key} value={key}>{tracks[key].name}</option>
//           ))}
//         </select>

//         <select 
//           value={region} 
//           onChange={handleRegionChange}
//           className="px-6 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-lg cursor-pointer outline-none focus:border-purple-500"
//         >
//           {availableRegions.map(key => (
//             <option key={key} value={key}>{tracks[phenomenon].regions[key].name}</option>
//           ))}
//         </select>
//       </div>

//       {activeTrack ? (
//         <Jukebox trackData={activeTrack} />
//       ) : (
//         <div className="text-zinc-500 mt-10">Data not available for this selection.</div>
//       )}
//     </div>
//   );
// }


"use client";
import React, { useState, useMemo } from "react";
import { Globe2, MapPin } from "lucide-react";
import Jukebox from "../components/Jukebox";
import InteractiveMap from "../components/InteractiveMap";
import { tracks, getSequence } from "../data/tracks";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";
const selectCls = `px-4 py-3 bg-zinc-900 text-white border border-zinc-600 rounded-lg cursor-pointer font-semibold ${focusRing}`;

export default function Home() {
  const [phenomenon, setPhenomenon] = useState("nightlights");
  const [region, setRegion] = useState("global");
  const [notice, setNotice] = useState("");

  const track = tracks[phenomenon];
  const regionList = Object.entries(track.regions).map(([key, r]) => ({
    key,
    label: r.name,
    continent: r.geo?.continent ?? "",
    country: r.geo?.country ?? r.name,
  }));

  // Memoized: Jukebox reloads its data whenever this object changes identity.
  const trackData = useMemo(() => getSequence(phenomenon, region), [phenomenon, region]);
  const activeRegion = track.regions[region];
  // const selectedCountry = activeRegion.geo?.country ?? activeRegion.name;

  // const handleMapSelect = (continentName, countryName) => {
  //   const match = regionList.find((r) => r.country === countryName);
  //   if (match) {
  //     setRegion(match.key);
  //     setNotice("");
  //   } else {
  //     // Don't silently play something else: say there is no data yet.
  //     setNotice(
  //       `There is no ${track.name} sequence for ${countryName || continentName} yet. Choose a region from the list.`
  //     );
  //   }
  // };
  const selectedContinent = activeRegion.geo?.continent ?? "";

  const handleMapSelect = (continent, regionKey) => {
    const match = regionKey
      ? regionList.find((r) => r.key === regionKey)
      : regionList.find((r) => r.continent && r.continent === continent);
    if (match) {
      setRegion(match.key);
      setNotice(
        regionKey || match.continent === continent
          ? `Showing ${match.label}, the ${match.continent || "global"} sequence.`
          : ""
      );
    } else {
      setNotice(`There is no ${track.name} sequence for ${continent} yet. Choose a region from the list.`);
    }
  };

  const handleAbujaShortcut = () => {
    setPhenomenon("nightlights");
    setRegion("global");
    setNotice("There is no Africa-specific sequence yet, so this shows the global Night Lights map.");
  };

  const handlePhenomenonChange = (e) => {
    const next = e.target.value;
    setPhenomenon(next);
    if (!tracks[next].regions[region]) setRegion(Object.keys(tracks[next].regions)[0]);
    setNotice("");
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
    setNotice("");
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <header className="text-center mb-8 mt-4">
        <h1 className="text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
          <Globe2 size={48} className="text-purple-500" aria-hidden="true" />
          SonicSpace
        </h1>
        <p className="text-zinc-300 text-lg max-w-2xl mx-auto mb-6">
          Experience NASA Earth observation visualizations through sound, with captions and a data
          table as a text equivalent.
        </p>

        <button
          type="button"
          onClick={handleAbujaShortcut}
          className={`px-6 py-2 bg-zinc-900 border border-purple-500/60 hover:bg-zinc-800 text-purple-300 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 mx-auto shadow-[0_0_15px_rgba(168,85,247,0.2)] ${focusRing}`}
        >
          <MapPin size={16} aria-hidden="true" /> Africa / Abuja (shows the global map for now)
        </button>
      </header>

      {/* Selectors first, as in the spec layout */}
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        <div className="flex flex-col">
          <label htmlFor="phenomenon" className="text-sm text-zinc-300 mb-1">Phenomenon</label>
          <select id="phenomenon" value={phenomenon} onChange={handlePhenomenonChange} className={selectCls}>
            {Object.keys(tracks).map((key) => (
              // <option key={key} value={key}>{tracks[key].name}</option>
              <option key={key} value={key}>
                {tracks[key].name}{tracks[key].comingSoon ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="region" className="text-sm text-zinc-300 mb-1">Region</label>
          <select id="region" value={region} onChange={handleRegionChange} className={selectCls}>
            {regionList.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div role="status" className="text-center mb-6 text-sm text-zinc-300 min-h-[3rem]">
        <p className="uppercase tracking-widest">
          Active selection: <span className="font-bold text-purple-300">{activeRegion.name}</span>
        </p>
        {notice && <p className="mt-1 text-amber-300">{notice}</p>}
      </div>

      {/* <InteractiveMap
        onRegionSelect={handleMapSelect}
        regions={regionList}
        selectedCountry={selectedCountry}
      /> */}

      {/* {trackData ? (
        <Jukebox trackData={trackData} />
      ) : (
        <p className="text-zinc-300 mt-10">Data not available for this selection.</p>
      )} */}
      {track.comingSoon ? (
        <p role="status" className="text-zinc-300 mt-10 max-w-xl text-center">
          {track.name} isn&apos;t available yet: its NASA frames (SVS {track.svsId}) haven&apos;t been
          added. Choose another phenomenon.
        </p>
      ) : trackData ? (
        <Jukebox trackData={trackData} />
      ) : (
        <p className="text-zinc-300 mt-10">Data not available for this selection.</p>
      )}
    </div>
  );
}