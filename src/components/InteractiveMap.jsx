import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const geoUrl = "/world-continents.json";

export default function InteractiveMap({ onRegionSelect }) {
  return (
    <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-8 shadow-lg">
      <h3 className="text-center text-zinc-400 mb-4 text-sm uppercase tracking-widest font-semibold">
        Click a Region to Sonify
      </h3>
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ scale: 120 }}
        className="w-full h-auto"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const continent = geo.properties.CONTINENT || "Unknown";
              const country = geo.properties.NAME || "Unknown";
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => onRegionSelect(continent, country)}
                  style={{
                    default: { fill: "#27272a", outline: "none", stroke: "#52525b", strokeWidth: 0.5 },
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
  );
}