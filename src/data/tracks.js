export const tracks = {
  nightlights: {
    name: "Night Lights (Urban Growth)",
    regions: {
      global: {
        name: "Global Map",
        sequence: {
          features: '/features.json',
          frameSeconds: 15.0, 
          filter: 'global_', 
          mapping: { scale: "pentatonic", rootMidi: 48, octaves: 3 },
          captions: ["Frame 1: Global baseline.", "Frame 2: Urban expansion."],
          desc: 'Hear the global urban growth.'
        }
      },
      india: {
        name: "India",
        sequence: {
          features: '/features.json',
          frameSeconds: 15.0, 
          filter: 'india_', 
          mapping: { scale: "pentatonic", rootMidi: 52, octaves: 3 },
          captions: ["Frame 1: India 2012 baseline.", "Frame 2: India 2023 rapid growth."],
          desc: 'Hear the rapid urbanization of India.'
        }
      },
      ukraine: {
        name: "Ukraine",
        sequence: {
          features: '/features.json',
          frameSeconds: 15.0, 
          filter: 'ukraine_', 
          mapping: { scale: "minor", rootMidi: 45, octaves: 3 }, // Minor scale for Ukraine context
          captions: ["Frame 1: Ukraine 2012.", "Frame 2: Ukraine 2023 shifts."],
          desc: 'Hear the demographic and infrastructural shifts in Ukraine.'
        }
      }
    }
  },
  climate: {
    name: "Ocean Currents & Climate",
    regions: {
      global: {
        name: "Global Oceans",
        sequence: {
          features: '/features.json',
          frameSeconds: 15.0,
          filter: 'climate_', 
          mapping: { scale: "major", rootMidi: 36, octaves: 2 },
          captions: ["Frame 1: Global sea surface currents.", "Frame 2: Thermal gradients."],
          desc: 'Experience the thermal gradients of the ocean.'
        }
      }
    }
  },
  atmosphere: {
    name: "Atmosphere & Aerosols",
    regions: {
      global: {
        name: "Global Atmosphere",
        sequence: {
          features: '/features.json',
          frameSeconds: 15.0,
          filter: 'aerosol_',
          mapping: { scale: "pentatonic", rootMidi: 60, octaves: 3 },
          captions: ["Frame 1: NASA GEOS Aerosols.", "Frame 2: Saharan dust and smoke."],
          desc: 'Hear the invisible atmospheric particles.'
        }
      }
    }
  }
};