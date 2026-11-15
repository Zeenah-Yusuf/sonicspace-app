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


// "use client";
// import React, { useState, useMemo } from "react";
// import { Globe2, MapPin } from "lucide-react";
// import Jukebox from "../components/Jukebox";
// import InteractiveMap from "../components/InteractiveMap";
// import { tracks, getSequence } from "../data/tracks";

// const focusRing =
//   "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";
// const selectCls = `px-4 py-3 bg-zinc-900 text-white border border-zinc-600 rounded-lg cursor-pointer font-semibold ${focusRing}`;

// export default function Home() {
//   const [phenomenon, setPhenomenon] = useState("nightlights");
//   const [region, setRegion] = useState("global");
//   const [notice, setNotice] = useState("");

//   const track = tracks[phenomenon];
//   const regionList = Object.entries(track.regions).map(([key, r]) => ({
//     key,
//     label: r.name,
//     continent: r.geo?.continent ?? "",
//     country: r.geo?.country ?? r.name,
//   }));

//   // Memoized: Jukebox reloads its data whenever this object changes identity.
//   const trackData = useMemo(() => getSequence(phenomenon, region), [phenomenon, region]);
//   const activeRegion = track.regions[region];
//   // const selectedCountry = activeRegion.geo?.country ?? activeRegion.name;

//   // const handleMapSelect = (continentName, countryName) => {
//   //   const match = regionList.find((r) => r.country === countryName);
//   //   if (match) {
//   //     setRegion(match.key);
//   //     setNotice("");
//   //   } else {
//   //     // Don't silently play something else: say there is no data yet.
//   //     setNotice(
//   //       `There is no ${track.name} sequence for ${countryName || continentName} yet. Choose a region from the list.`
//   //     );
//   //   }
//   // };
//   const selectedContinent = activeRegion.geo?.continent ?? "";

//   const handleMapSelect = (continent, regionKey) => {
//     const match = regionKey
//       ? regionList.find((r) => r.key === regionKey)
//       : regionList.find((r) => r.continent && r.continent === continent);
//     if (match) {
//       setRegion(match.key);
//       setNotice(
//         regionKey || match.continent === continent
//           ? `Showing ${match.label}, the ${match.continent || "global"} sequence.`
//           : ""
//       );
//     } else {
//       setNotice(`There is no ${track.name} sequence for ${continent} yet. Choose a region from the list.`);
//     }
//   };

//   const handleAbujaShortcut = () => {
//     setPhenomenon("nightlights");
//     setRegion("global");
//     setNotice("There is no Africa-specific sequence yet, so this shows the global Night Lights map.");
//   };

//   const handlePhenomenonChange = (e) => {
//     const next = e.target.value;
//     setPhenomenon(next);
//     if (!tracks[next].regions[region]) setRegion(Object.keys(tracks[next].regions)[0]);
//     setNotice("");
//   };

//   const handleRegionChange = (e) => {
//     setRegion(e.target.value);
//     setNotice("");
//   };

//   return (
//     <div className="p-8 flex flex-col items-center">
//       <header className="text-center mb-8 mt-4">
//         <h1 className="text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
//           <Globe2 size={48} className="text-purple-500" aria-hidden="true" />
//           SonicSpace
//         </h1>
//         <p className="text-zinc-300 text-lg max-w-2xl mx-auto mb-6">
//           Experience NASA Earth observation visualizations through sound, with captions and a data
//           table as a text equivalent.
//         </p>

//         <button
//           type="button"
//           onClick={handleAbujaShortcut}
//           className={`px-6 py-2 bg-zinc-900 border border-purple-500/60 hover:bg-zinc-800 text-purple-300 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 mx-auto shadow-[0_0_15px_rgba(168,85,247,0.2)] ${focusRing}`}
//         >
//           <MapPin size={16} aria-hidden="true" /> Africa / Abuja (shows the global map for now)
//         </button>
//       </header>

//       {/* Selectors first, as in the spec layout */}
//       <div className="flex flex-wrap justify-center gap-6 mb-4">
//         <div className="flex flex-col">
//           <label htmlFor="phenomenon" className="text-sm text-zinc-300 mb-1">Phenomenon</label>
//           <select id="phenomenon" value={phenomenon} onChange={handlePhenomenonChange} className={selectCls}>
//             {Object.keys(tracks).map((key) => (
//               // <option key={key} value={key}>{tracks[key].name}</option>
//               <option key={key} value={key}>
//                 {tracks[key].name}{tracks[key].comingSoon ? " (coming soon)" : ""}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="region" className="text-sm text-zinc-300 mb-1">Region</label>
//           <select id="region" value={region} onChange={handleRegionChange} className={selectCls}>
//             {regionList.map((r) => (
//               <option key={r.key} value={r.key}>{r.label}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div role="status" className="text-center mb-6 text-sm text-zinc-300 min-h-[3rem]">
//         <p className="uppercase tracking-widest">
//           Active selection: <span className="font-bold text-purple-300">{activeRegion.name}</span>
//         </p>
//         {notice && <p className="mt-1 text-amber-300">{notice}</p>}
//       </div>

//       {/* <InteractiveMap
//         onRegionSelect={handleMapSelect}
//         regions={regionList}
//         selectedCountry={selectedCountry}
//       /> */}

//       {/* {trackData ? (
//         <Jukebox trackData={trackData} />
//       ) : (
//         <p className="text-zinc-300 mt-10">Data not available for this selection.</p>
//       )} */}
//       {track.comingSoon ? (
//         <p role="status" className="text-zinc-300 mt-10 max-w-xl text-center">
//           {track.name} isn&apos;t available yet: its NASA frames (SVS {track.svsId}) haven&apos;t been
//           added. Choose another phenomenon.
//         </p>
//       ) : trackData ? (
//         <Jukebox trackData={trackData} />
//       ) : (
//         <p className="text-zinc-300 mt-10">Data not available for this selection.</p>
//       )}
//     </div>
//   );
// }

import React, { useState, useMemo, useEffect } from "react";
import Jukebox from "../components/Jukebox";
import InteractiveMap from "../components/InteractiveMap";
import { tracks, getSequence } from "../data/tracks";

const ACCENT = { nightlights: "#ffd166", climate: "#ff9f68", atmosphere: "#c4a1ff", lightning: "#8fd3ff" };
const DISC = {
  nightlights: "conic-gradient(from 200deg,#0b0b14,#ffd166,#0b0b14 40%,#ff9f68 70%,#0b0b14)",
  climate: "conic-gradient(from 90deg,#1b6ca8,#2ec4a6,#ffd166,#ff6b4a,#1b6ca8)",
  atmosphere: "conic-gradient(from 0deg,#0f3d2a,#3ddc84,#c4a1ff,#ff7a4d,#0f3d2a)",
  lightning: "conic-gradient(from 30deg,#06101f,#8fd3ff,#06101f 50%,#ffffff,#06101f)",
};
const ring =
  "peer-focus-visible:ring-2 peer-focus-visible:ring-white peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#07080f]";
const eyebrow = "font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300";
const STEPS = ["Choose a record", "Pick a region", "Press play"];

// Shareable link: #nightlights/india
function fromHash() {
  const [p, r] = window.location.hash.slice(1).split("/");
  return tracks[p]?.regions[r] ? [p, r] : null;
}

export default function Home() {
  const [phenomenon, setPhenomenon] = useState(() => fromHash()?.[0] ?? "nightlights");
  const [region, setRegion] = useState(() => fromHash()?.[1] ?? "global");
  const [notice, setNotice] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, "", `#${phenomenon}/${region}`);
  }, [phenomenon, region]);

  const track = tracks[phenomenon];
  const accent = ACCENT[phenomenon] ?? "#c4a1ff";
  const regionList = Object.entries(track.regions).map(([key, r]) => ({
    key,
    label: r.name,
    continent: r.geo?.continent ?? "",
  }));
  const trackData = useMemo(() => getSequence(phenomenon, region), [phenomenon, region]);
  const selectedContinent = track.regions[region].geo?.continent ?? "";

  const handleMapSelect = (continent, regionKey) => {
    const match = regionKey
      ? regionList.find((r) => r.key === regionKey)
      : regionList.find((r) => r.continent && r.continent === continent);
    if (match) {
      setRegion(match.key);
      setNotice(regionKey ? "" : `Showing ${match.label}, the ${match.continent || "global"} sequence.`);
    } else {
      setNotice(`No ${track.name} sequence for ${continent} yet.`);
    }
  };

  const pickPhenomenon = (next) => {
    setPhenomenon(next);
    if (!tracks[next].regions[region]) setRegion(Object.keys(tracks[next].regions)[0]);
    setNotice("");
    setPlaying(false);
  };

  const abuja = () => {
    setPhenomenon("nightlights");
    setRegion("global");
    setNotice("No Africa sequence yet, so this shows the global Night Lights map.");
  };

  const hint = notice || (regionList.length === 1 ? "Only a global view is available for this record." : "");

  return (
    <div style={{ "--accent": accent }} className="relative isolate text-zinc-100 lg:min-h-[calc(100dvh-5rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700"
        style={{
          background: `radial-gradient(60% 50% at 75% 0%, ${accent}26, transparent 70%), radial-gradient(45% 45% at 0% 100%, #4b3bff22, transparent 70%), #07080f`,
        }}
      />

      <div className="mx-auto grid max-w-[1600px] gap-x-5 gap-y-4 p-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Masthead */}
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 lg:col-span-2">
          <div className="flex items-center gap-3">
            <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
              {[4, 10, 16, 22, 28].map((x, i) => (
                <rect
                  key={x}
                  x={x - 2}
                  y="4"
                  width="4"
                  height="26"
                  rx="2"
                  fill="var(--accent)"
                  className={playing ? "motion-safe:animate-[eq_0.9s_ease-in-out_infinite]" : ""}
                  style={{
                    transformOrigin: "50% 100%",
                    transformBox: "fill-box",
                    animationDelay: `${i * 0.12}s`,
                    transform: playing ? undefined : `scaleY(${[0.4, 0.8, 1, 0.65, 0.3][i]})`,
                  }}
                />
              ))}
            </svg>
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-none tracking-tight text-white">SonicSpace</h1>
              <p className="mt-1 hidden text-sm text-zinc-300 sm:block">Hear NASA&apos;s view of Earth, frame by frame.</p>
            </div>
          </div>

          <ol className="m-0 hidden list-none items-center gap-4 p-0 xl:flex">
            {STEPS.map((t, i) => (
              <li key={t} className={`flex items-center gap-2 ${eyebrow}`}>
                <span className="grid h-5 w-5 place-items-center rounded-full border border-[var(--accent)] text-[var(--accent)]">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>

          <p className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-200">
            <span aria-hidden="true">🎧 </span>Headphones recommended: the sound pans left to right
          </p>
        </header>

        {/* Tuner */}
        <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-6 lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_1.5rem),transparent)]">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={`mb-2 ${eyebrow}`}>1 · Choose a record</legend>
            <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
              {Object.keys(tracks).map((key) => {
                const active = key === phenomenon;
                return (
                  <label key={key} className="min-w-[7.5rem] shrink-0 cursor-pointer snap-start lg:min-w-0">
                    <input type="radio" name="phenomenon" value={key} checked={active} onChange={() => pickPhenomenon(key)} className="peer sr-only" />
                    <span className={`flex h-full flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs leading-tight text-zinc-100 transition hover:bg-white/[0.07] peer-checked:border-[var(--accent)] peer-checked:bg-white/10 ${ring}`}>
                      <span
                        aria-hidden="true"
                        className={`relative block h-14 w-14 rounded-full shadow-[0_0_24px_-4px_var(--accent)] ${active && playing ? "motion-safe:animate-[spin_5s_linear_infinite]" : ""}`}
                        style={{ background: DISC[key] }}
                      >
                        <span className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-[#07080f]" />
                      </span>
                      {tracks[key].name}
                      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300">
                        {tracks[key].comingSoon ? "coming soon" : tracks[key].svsId ? `SVS ${tracks[key].svsId}` : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={`mb-2 ${eyebrow}`}>2 · Pick a region</legend>
            <div className="flex flex-wrap gap-2">
              {regionList.map((r) => (
                <label key={r.key} className="cursor-pointer">
                  <input
                    type="radio"
                    name="region"
                    value={r.key}
                    checked={r.key === region}
                    onChange={() => { setRegion(r.key); setNotice(""); }}
                    className="peer sr-only"
                  />
                  <span className={`block rounded-full border border-white/15 px-4 py-1.5 text-sm text-zinc-100 transition hover:bg-white/10 peer-checked:border-transparent peer-checked:bg-[var(--accent)] peer-checked:font-semibold peer-checked:text-[#07080f] ${ring}`}>
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
            <p role="status" className="mt-2 min-h-[1.25rem] text-xs text-amber-200">{hint}</p>
          </fieldset>

          <details open className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 [&_h2]:mb-1 [&_h2]:text-[10px] [&_section]:mb-0 [&_section]:border-0 [&_section]:bg-transparent [&_section]:p-0 [&_section]:shadow-none">
            <summary className={`cursor-pointer px-2 py-1 ${eyebrow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}>Or pick on the map</summary>
            <InteractiveMap onRegionSelect={handleMapSelect} regions={[]} selectedRegion={region} selectedContinent={selectedContinent} />
          </details>

          <button
            type="button"
            onClick={abuja}
            className="self-start rounded-full border border-white/15 px-4 py-1.5 text-sm text-zinc-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Africa / Abuja
          </button>
        </aside>

        {/* Stage */}
        <div className="min-w-0">
          <h2 className={`mb-3 ${eyebrow}`}>3 · Press play</h2>
          {track.comingSoon ? (
            <div role="status" className="grid min-h-[16rem] place-items-center rounded-3xl border border-dashed border-white/20 p-8 text-center text-zinc-200">
              <p className="max-w-md">
                <span className="font-display text-2xl text-white">{track.name}</span>
                <br />
                Its NASA frames (SVS {track.svsId}) haven&apos;t been added yet. Choose another record.
              </p>
            </div>
          ) : trackData ? (
            <Jukebox trackData={trackData} onPlayingChange={setPlaying} />
          ) : (
            <p className="text-zinc-300">Data not available for this selection.</p>
          )}
        </div>
      </div>
    </div>
  );
}