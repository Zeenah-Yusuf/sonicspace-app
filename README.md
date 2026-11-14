# SonicSpace: The Earth Information Jukebox

![SonicSpace Banner](https://img.shields.io/badge/NASA-Space_Apps_2026-blueviolet)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)
![Tone.js](https://img.shields.io/badge/Tone.js-Audio-orange)

SonicSpace is an accessible, multi-sensory web platform built for the **2026 NASA Space Apps Challenge**. It translates complex NASA Earth observation data—ranging from urban growth to atmospheric aerosols—into dynamic, spatial soundscapes.

Our mission is to break down the visual barriers of space data, making planetary change accessible to the visually impaired, while offering sighted researchers a novel way to detect temporal data anomalies through sound.

## The Challenge
**Track:** The Earth Information Jukebox
**Theme:** The Next Frontier
**Local Event:** Abuja, Nigeria

## Core Features
- **Interactive Geospatial Map:** Users can click on global regions to instantly load localized NASA data.
- **Multi-Domain Datasets:** SonicSpace maps three distinct NASA data domains:
  1. **Human Activity (Black Marble):** Toggle between 2012 and 2023 to hear the rapid urbanization of India, Ukraine, and the Globe.
  2. **Ocean Climate (ECCO2):** Listen to the thermal gradients of global sea surface currents.
  3. **Atmosphere (GEOS Aerosols):** Hear the Saharan dust traveling across Africa and the Atlantic.
- **Live Audio Synthesis:** Uses Tone.js and the Web Audio API to dynamically generate a musical melody from the pixel brightness of the image in real-time.
- **The Wavelength Sweeper:** A custom HTML5 Canvas visualizer that scans the image left-to-right, mapping pixel brightness to a physical audio waveform, proving exactly how the data translates to sound.
- **Accessibility First:** 
  - Screen-reader compatible UI with `aria-live` captions updating every frame.
  - Strict 15-second audio sequences with clear Play/Pause/Stop states.
  - High-contrast, keyboard-navigable interface.

## System Architecture

SonicSpace utilizes a hybrid architecture:

### 1. Offline Pre-Processing (Python Engine)
To ensure high-fidelity data extraction, a custom Python script processes the NASA SVS images:
- Resizes images to 512x256 for performance.
- Extracts a 64-band melodic contour (left-to-right brightness), flash/percussion events (brightest pixels), and the average image brightness.
- Outputs a `features.json` file that serves as the "sheet music" for the frontend.

### 2. Real-Time Audio Synthesis (Tone.js)
The frontend does not play pre-recorded `.wav` files. It uses `Tone.js` to synthesize audio live based on the data:
- **Pentatonic & Minor Scales:** Maps visual brightness to a musical scale to ensure the output is harmonic and angelic, not chaotic noise.
- **Polyphonic Arpeggiator:** Plays a sweeping melody accompanied by a deep background drone, creating a cinematic ambient soundtrack.
- **Data Sync:** A 15-second frame duration ensures each image's melody can fully play out.

### 3. Frontend (React + Vite)
Built with React 18 and Vite, styled with Tailwind CSS. It uses `react-simple-maps` for the interactive TopoJSON world map.

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- Python 3.9+ (for regenerating feature data)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sonicspace-app.git
   cd sonicspace-app
Install frontend dependencies:

bash
npm install
Start the development server:

bash
npm run dev
The app will be available at http://localhost:5173.

Re-generating Feature Data (Optional)
If you add new NASA images:

Navigate to the sonification_engine directory.

Run the extraction script: python extract_features.py.

Move the generated features.json into the public/ folder.

Data Sources & Acknowledgments
NASA Scientific Visualization Studio (SVS)

NASA Earth Information Center (EIC)

NASA Black Marble (Night Lights)

GEOS Aerosols Model

The SonicSpace Team (Abuja)
Zeenatudeen Yusuf - Team Lead & Lead Software Engineer (Architecture, Frontend, Audio Engine)

Olawuyi Ifeoluwa - UI/UX & Accessibility Lead

Emmanuel Effiong - Data & Research Analyst

Caleb Ahmed Sadah - Presentation & Storytelling

License
This project is licensed under the MIT License.


### Step-by-Step Git & Vercel Deployment

#### Step 1: Initialize Git and Push to GitHub
Open your terminal in `C:\Users\zeena\Desktop\SonicSpace\SonicSpace_app` and run these exact commands:

```bash
# 1. Initialize the repository
git init

# 2. Add all files (the .gitignore prevents node_modules from being added)
git add .

# 3. Commit the code
git commit -m "Initial commit: SonicSpace NASA Space Apps 2026"

# 4. Rename branch to main
git branch -M main