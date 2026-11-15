// src/lib/features.js
// JS port of scripts/extract_features.py (spec section 8). Keep both in sync.
export const W = 512;
export const H = 256;
export const N_STRIPS = 64;
export const HUE_BINS = 12;

// Single images have no sequence to take min/max from, so use fixed ranges
// (spec section 13, step 5).
export const SINGLE_FRAME_META = {
  n_strips: N_STRIPS,
  frames: 1,
  mean_range: [0, 1],
  change_range: [0, 1],
  profile_range: [0, 1],
};

const r3 = (x) => Math.round(x * 1000) / 1000;

// data: RGBA Uint8ClampedArray of a W x H image. prevGray: Float32Array or null.
export function computeFeatures(data, prevGray = null, index = 0, file = "upload") {
  const gray = new Float32Array(W * H);
  const stripW = W / N_STRIPS;
  const stripSum = new Float64Array(N_STRIPS);
  const stripHot = new Float64Array(N_STRIPS);
  const hist = new Array(HUE_BINS).fill(0);
  let histTotal = 0, total = 0, diff = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      const i = p * 4;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const gv = (r + g + b) / 3;
      gray[p] = gv;
      total += gv;
      if (prevGray) diff += Math.abs(gv - prevGray[p]);

      const s = Math.floor(x / stripW);
      stripSum[s] += gv;
      if (gv > 0.9) stripHot[s] += 1;

      // hue histogram over colourful pixels (saturation > 0.2 and value > 0.2)
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      const sat = max === 0 ? 0 : d / max;
      if (sat > 0.2 && max > 0.2) {
        let h = 0;
        if (d !== 0) {
          if (max === r) h = ((g - b) / d) % 6;
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          if (h < 0) h += 6;
          h /= 6;
        }
        hist[Math.min(HUE_BINS - 1, Math.floor(h * HUE_BINS))]++;
        histTotal++;
      }
    }
  }

  const stripPixels = stripW * H;
  const features = {
    i: index,
    file,
    mean: r3(total / (W * H)),
    change: prevGray ? r3(diff / (W * H)) : 0,
    profile: Array.from(stripSum, (v) => r3(v / stripPixels)),
    hot: Array.from(stripHot, (v) => r3(v / stripPixels)),
    hue_hist: hist.map((v) => r3(v / Math.max(histTotal, 1))),
  };
  return { features, gray };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = url;
  });
}

// Resize to 512x256 (stretches, like the Python resize) and compute features.
export async function extractFeaturesFromUrl(url) {
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);
  return computeFeatures(data).features;
}