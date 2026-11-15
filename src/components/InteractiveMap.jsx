// import React from 'react';
// import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// const geoUrl = "/world-continents.json";

// export default function InteractiveMap({ onRegionSelect }) {
//   return (
//     <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-8 shadow-lg">
//       <h3 className="text-center text-zinc-400 mb-4 text-sm uppercase tracking-widest font-semibold">
//         Click a Region to Sonify
//       </h3>
//       <ComposableMap 
//         projection="geoMercator" 
//         projectionConfig={{ scale: 120 }}
//         className="w-full h-auto"
//       >
//         <Geographies geography={geoUrl}>
//           {({ geographies }) =>
//             geographies.map((geo) => {
//               const continent = geo.properties.CONTINENT || "Unknown";
//               const country = geo.properties.NAME || "Unknown";
              
//               return (
//                 <Geography
//                   key={geo.rsmKey}
//                   geography={geo}
//                   onClick={() => onRegionSelect(continent, country)}
//                   style={{
//                     default: { fill: "#27272a", outline: "none", stroke: "#52525b", strokeWidth: 0.5 },
//                     hover: { fill: "#a855f7", outline: "none", cursor: "pointer" },
//                     pressed: { fill: "#7e22ce", outline: "none" },
//                   }}
//                 />
//               );
//             })
//           }
//         </Geographies>
//       </ComposableMap>
//     </div>
//   );
// }

import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "/world-continents.json";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";

// regions: [{ key, label, continent }]
export default function InteractiveMap({ onRegionSelect, regions = [], selectedRegion, selectedContinent }) {
  return (
    <section
      aria-labelledby="map-heading"
      className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-8 shadow-lg"
    >
      <h2 id="map-heading" className="text-center text-zinc-300 mb-4 text-sm uppercase tracking-widest font-semibold">
        Choose a region to sonify
      </h2>

      <ul className="flex flex-wrap justify-center gap-3 mb-4 list-none p-0">
        {regions.map((r) => (
          <li key={r.key}>
            <button
              type="button"
              onClick={() => onRegionSelect(r.continent, r.key)}
              aria-pressed={selectedRegion === r.key}
              className={`px-4 py-2 rounded-lg border text-zinc-100 ${focusRing} ${
                selectedRegion === r.key
                  ? "bg-purple-800 border-purple-400"
                  : "bg-zinc-800 hover:bg-zinc-700 border-zinc-600"
              }`}
            >
              {r.label}
            </button>
          </li>
        ))}
      </ul>

      <div aria-hidden="true">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }} className="w-full h-auto">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const continent = geo.properties.continent || "Unknown";
                const isSelected = !!selectedContinent && selectedContinent === continent;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={-1}
                    onClick={() => onRegionSelect(continent)}
                    style={{
                      default: { fill: isSelected ? "#7e22ce" : "#27272a", outline: "none", stroke: "#52525b", strokeWidth: 0.5 },
                      hover: { fill: "#a855f7", outline: "none", cursor: "pointer" },
                      pressed: { fill: "#7e22ce", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </section>
  );
}