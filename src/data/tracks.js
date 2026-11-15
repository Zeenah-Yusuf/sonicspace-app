// export const tracks = {
//   nightlights: {
//     name: "Night Lights (Urban Growth)",
//     regions: {
//       global: {
//         name: "Global Map",
//         sequence: {
//           features: '/features.json',
//           frameSeconds: 15.0, 
//           filter: 'global_', 
//           mapping: { scale: "pentatonic", rootMidi: 48, octaves: 3 },
//           captions: ["Frame 1: Global baseline.", "Frame 2: Urban expansion."],
//           desc: 'Hear the global urban growth.'
//         }
//       },
//       india: {
//         name: "India",
//         sequence: {
//           features: '/features.json',
//           frameSeconds: 15.0, 
//           filter: 'india_', 
//           mapping: { scale: "pentatonic", rootMidi: 52, octaves: 3 },
//           captions: ["Frame 1: India 2012 baseline.", "Frame 2: India 2023 rapid growth."],
//           desc: 'Hear the rapid urbanization of India.'
//         }
//       },
//       ukraine: {
//         name: "Ukraine",
//         sequence: {
//           features: '/features.json',
//           frameSeconds: 15.0, 
//           filter: 'ukraine_', 
//           mapping: { scale: "minor", rootMidi: 45, octaves: 3 }, // Minor scale for Ukraine context
//           captions: ["Frame 1: Ukraine 2012.", "Frame 2: Ukraine 2023 shifts."],
//           desc: 'Hear the demographic and infrastructural shifts in Ukraine.'
//         }
//       }
//     }
//   },
//   climate: {
//     name: "Ocean Currents & Climate",
//     regions: {
//       global: {
//         name: "Global Oceans",
//         sequence: {
//           features: '/features.json',
//           frameSeconds: 15.0,
//           filter: 'climate_', 
//           mapping: { scale: "major", rootMidi: 36, octaves: 2 },
//           captions: ["Frame 1: Global sea surface currents.", "Frame 2: Thermal gradients."],
//           desc: 'Experience the thermal gradients of the ocean.'
//         }
//       }
//     }
//   },
//   atmosphere: {
//     name: "Atmosphere & Aerosols",
//     regions: {
//       global: {
//         name: "Global Atmosphere",
//         sequence: {
//           features: '/features.json',
//           frameSeconds: 15.0,
//           filter: 'aerosol_',
//           mapping: { scale: "pentatonic", rootMidi: 60, octaves: 3 },
//           captions: ["Frame 1: NASA GEOS Aerosols.", "Frame 2: Saharan dust and smoke."],
//           desc: 'Hear the invisible atmospheric particles.'
//         }
//       }
//     }
//   }
// };


// src/data/tracks.js
// One entry per phenomenon, one sequence per region.
// Each sequence lives in its own folder so its features.json has its OWN
// min/max "meta" (spec section 8):
//   public/data/<phenomenon>/<region>/{frames/, features.json, captions.json}

const FRAME_SECONDS = 1.5; // spec: about 1.5 s per frame, 25-60 frames

export const tracks = {
  nightlights: {
    name: "Night Lights 2012-2023",
    svsId: 5313,
    credit: "NASA's Goddard Space Flight Center / SVS 5313",
    regions: {
      global: {
        name: "Global Map",
        geo: { continent: "" },
        sequence: {
          dataDir: "/data/nightlights/global",
          frameSeconds: FRAME_SECONDS,
          frameLabels: ["2012", "2023", "Change, 2012 to 2023"],
          mapping: {
            scale: "pentatonic", rootMidi: 48, octaves: 3,
            voice: "soft-synth",
            pitchFrom: "profile", volumeFrom: "mean", tempoFrom: "change",
            description: "Left to right sweep. Brighter areas play higher notes. Louder means more total light.",
            legendLow: "Dark areas with little or no light.",
            legendHigh: "Bright areas with a lot of light.",
          },
          desc: "Hear how night lights across the globe change.",
        },
      },
      india: {
        name: "India",
        geo: { continent: "Asia" },
        sequence: {
          dataDir: "/data/nightlights/india",
          frameSeconds: FRAME_SECONDS,
          frameLabels: ["2012", "2023", "Change, 2012 to 2023"],
          mapping: {
            scale: "pentatonic", rootMidi: 52, octaves: 3,
            voice: "soft-synth",
            pitchFrom: "profile", volumeFrom: "mean", tempoFrom: "change",
            description: "Left to right sweep. Brighter areas play higher notes. Louder means more total light.",
            legendLow: "Dark areas with little or no light.",
            legendHigh: "Bright areas with a lot of light.",
          },
          desc: "Hear how night lights over India change.",
        },
      },
      ukraine: {
        name: "Ukraine",
        geo: { continent: "Europe" },
        sequence: {
          dataDir: "/data/nightlights/ukraine",
          frameSeconds: FRAME_SECONDS,
          frameLabels: ["2012", "2023", "Change, 2012 to 2023"],
          mapping: {
            // Minor scale is an artistic choice: explain it in "How it works".
            scale: "minor", rootMidi: 45, octaves: 3,
            voice: "soft-synth",
            pitchFrom: "profile", volumeFrom: "mean", tempoFrom: "change",
            description: "Left to right sweep in a minor scale. Brighter areas play higher notes. Louder means more total light.",
            legendLow: "Dark areas with little or no light.",
            legendHigh: "Bright areas with a lot of light.",
          },
          desc: "Hear how night lights over Ukraine change.",
        },
      },
    },
  },

  climate: {
    name: "Ocean Currents & Climate",
    svsId: null, // TODO: not in the brief's resource list. Add the real SVS ID or remove this track.
    credit: "NASA's Goddard Space Flight Center / SVS (ID to be added)",
    regions: {
      global: {
        geo: { continent: ""},
        name: "Global Oceans",
        sequence: {
          dataDir: "/data/climate/global",
          frameSeconds: FRAME_SECONDS,
          frameLabels: ["Ocean currents"],
          mapping: {
            scale: "major", rootMidi: 36, octaves: 2,
            voice: "soft-synth",
            pitchFrom: "profile", volumeFrom: "mean", tempoFrom: "change",
            description: "Left to right sweep. Lighter parts of the image play higher notes.",
            legendLow: "Darker parts of the image.",
            legendHigh: "Lighter parts of the image.",
          },
          desc: "Hear the patterns in the ocean visualization.",
        },
      },
    },
  },

  atmosphere: {
    name: "Atmosphere & Aerosols",
    svsId: 5669,
    credit: "NASA's Goddard Space Flight Center / SVS 5669",
    regions: {
      global: {
        name: "Global Atmosphere",
        geo: { continent: "" },
        sequence: {
          dataDir: "/data/aerosols/global",
          frameSeconds: FRAME_SECONDS,
          frameLabels: ["Aerosols"],
          mapping: {
            scale: "pentatonic", rootMidi: 60, octaves: 3,
            voice: "soft-synth",
            pitchFrom: "profile", volumeFrom: "mean", tempoFrom: "change",
            // TODO: after reading the SVS 5669 colour legend, assign hue_hist bins
            // to aerosol types (one instrument per type), e.g.
            // hueLayers: [{ bins: [0, 1], label: "...", instrument: "..." }]
            hueLayers: null,
            description: "Left to right sweep. Brighter areas play higher notes.",
            legendLow: "Areas with little visible aerosol.",
            legendHigh: "Areas with strong visible aerosol.",
          },
          desc: "Hear the atmospheric particles in the visualization.",
        },
      },
    },
  },

  // NEW: from the spec (SVS 5011)
  lightning: {
    name: "Lightning from the ISS 2017-2023",
    comingSoon: true,
    svsId: 5011,
    credit: "NASA's Goddard Space Flight Center / SVS 5011",
    regions: {
      global: {
        name: "Global Map",
        geo: { continent: "" },
        sequence: {
          dataDir: "/data/lightning/global",
          frameSeconds: FRAME_SECONDS,
          mapping: {
            scale: "pentatonic", rootMidi: 36, octaves: 2,
            voice: "percussion",
            pitchFrom: "hot", volumeFrom: "mean", tempoFrom: "change",
            description: "Each flash plays a drum hit. Position left to right sets stereo pan and pitch. Stronger flashes hit harder. Silence means no flashes in that frame.",
            legendLow: "A flash on the left side of the map.",
            legendHigh: "A flash on the right side of the map.",
          },
          desc: "Hear lightning events detected from the ISS.",
        },
      },
    },
  },
};

/* ---------- helpers ---------- */

// Derives file paths from dataDir so the config stays short.
export function getSequence(trackKey, regionKey) {
  const track = tracks[trackKey];
  const region = track && track.regions[regionKey];
  if (!region) return null;
  const s = region.sequence;
  return {
    ...s,
    id: `${trackKey}-${regionKey}`,
    title: `${track.name} (${region.name})`,
    svsId: track.svsId,
    credit: track.credit,
    features: `${s.dataDir}/features.json`,
    captions: `${s.dataDir}/captions.json`,
    // framesDir: `${s.dataDir}/frames`,
    framesDir: s.framesDir ?? "/images",
  };
}

export function listSequences() {
  return Object.keys(tracks).flatMap((t) =>
    Object.keys(tracks[t].regions).map((r) => getSequence(t, r))
  );
}