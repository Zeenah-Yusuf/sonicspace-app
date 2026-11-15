"""
Feature extraction for SonicSpace (spec section 8/9), one sequence at a time.

Usage (run from the project root):
  python scripts/extract_features.py <frames_dir> <out_json> [--prefix PREFIX]

Examples:
  python scripts/extract_features.py public/images public/data/nightlights/global/features.json --prefix global_
  python scripts/extract_features.py public/images public/data/nightlights/india/features.json  --prefix india_

Differences from the spec's script (all small):
  * --prefix selects one sequence out of a shared image folder, so every sequence
    gets its OWN min/max "meta" (spec: global ranges per sequence, never per frame).
  * png, jpg and jpeg are accepted (the NASA frames are jpg).
  * os.path.basename instead of split("/"), which breaks on Windows paths.
  * "change" is measured against the previous frame IN THE SAME SEQUENCE, so the first
    frame of a sequence is always 0 (not a diff against an unrelated image).

Requires: pip install numpy pillow
"""
import argparse
import glob
import json
import os

import numpy as np
from PIL import Image

N = 64  # vertical strips (spec section 8)
W, H = 512, 256  # analysis size (spec section 8)
EXTS = ("png", "jpg", "jpeg")


def list_frames(frames_dir, prefix):
    files = []
    for ext in EXTS:
        files += glob.glob(os.path.join(frames_dir, f"{prefix}*.{ext}"))
    return sorted(set(files))


def frame_features(path, prev_gray, index):
    img = Image.open(path).convert("RGB").resize((W, H))
    rgb = np.asarray(img, dtype=np.float32) / 255.0
    gray = rgb.mean(axis=2)
    hsv = np.asarray(img.convert("HSV"), dtype=np.float32) / 255.0
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]

    strips = np.array_split(gray, N, axis=1)
    profile = [float(x.mean()) for x in strips]
    hot = [float((x > 0.9).mean()) for x in strips]

    mask = (s > 0.2) & (v > 0.2)
    hist, _ = np.histogram(h[mask], bins=12, range=(0, 1))
    hist = (hist / max(hist.sum(), 1)).tolist()

    change = 0.0 if prev_gray is None else float(np.abs(gray - prev_gray).mean())

    return gray, {
        "i": index,
        "file": os.path.basename(path),
        "mean": float(gray.mean()),
        "change": change,
        "profile": [round(x, 3) for x in profile],
        "hot": [round(x, 3) for x in hot],
        "hue_hist": [round(x, 3) for x in hist],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("frames_dir")
    ap.add_argument("out_path")
    ap.add_argument("--prefix", default="", help="only frames whose file name starts with this")
    args = ap.parse_args()

    files = list_frames(args.frames_dir, args.prefix)
    if not files:
        raise SystemExit(f"No frames found in {args.frames_dir} with prefix '{args.prefix}'")

    prev, frames = None, []
    for i, f in enumerate(files):
        prev, feat = frame_features(f, prev, i)
        frames.append(feat)
        print(f"  {i}: {feat['file']}  mean={feat['mean']:.4f}  change={feat['change']:.4f}")

    def rng(key):
        vals = [x[key] for x in frames]
        return [min(vals), max(vals)]

    meta = {
        "n_strips": N,
        "frames": len(frames),
        "mean_range": rng("mean"),
        "change_range": rng("change"),
        "profile_range": [
            min(min(x["profile"]) for x in frames),
            max(max(x["profile"]) for x in frames),
        ],
    }

    os.makedirs(os.path.dirname(args.out_path) or ".", exist_ok=True)
    with open(args.out_path, "w") as fh:
        json.dump({"meta": meta, "frames": frames}, fh)
    print(f"Wrote {args.out_path} ({len(frames)} frames)")


if __name__ == "__main__":
    main()