"""One-off / dev: split 2x2 Kelly headshot composite into kelly-accent-1..4.png.

Run from repo root:
  python scripts/split-kelly-headshot-composite.py

Source: public/images/kelly/headshots/ChatGPT Image May 11, 2026, 11_57_59 AM.png
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

COMPOSITE_NAME = "ChatGPT Image May 11, 2026, 11_57_59 AM.png"
PAD = 12
MAX_PX = 280  # ~2x accent display width for crisp rendering
ALPHA_CUTOFF = 25


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "public" / "images" / "kelly" / "headshots" / COMPOSITE_NAME
    if not src.is_file():
        raise SystemExit(f"Missing composite: {src}")

    im = Image.open(src).convert("RGBA")
    w, h = im.size
    half_w, half_h = w // 2, h // 2
    quads = [
        (0, 0, half_w, half_h),
        (half_w, 0, w, half_h),
        (0, half_h, half_w, h),
        (half_w, half_h, w, h),
    ]
    out_dir = src.parent

    for i, box in enumerate(quads, start=1):
        crop = im.crop(box)
        arr = np.array(crop)
        alpha = arr[:, :, 3]
        ys, xs = np.where(alpha > ALPHA_CUTOFF)
        if xs.size == 0:
            print(f"skip empty quad {i}")
            continue
        x0, x1 = int(xs.min()), int(xs.max()) + 1
        y0, y1 = int(ys.min()), int(ys.max()) + 1
        subject = crop.crop((x0, y0, x1, y1))
        tw, th = subject.size
        tight = Image.new("RGBA", (tw + 2 * PAD, th + 2 * PAD), (0, 0, 0, 0))
        tight.paste(subject, (PAD, PAD))

        tw, th = tight.size
        m = max(tw, th)
        if m > MAX_PX:
            scale = MAX_PX / m
            tight = tight.resize((int(tw * scale), int(th * scale)), Image.Resampling.LANCZOS)

        dest = out_dir / f"kelly-accent-{i}.png"
        tight.save(dest, format="PNG", optimize=True)
        print(f"wrote {dest.name} {tight.size} {dest.stat().st_size} bytes")


if __name__ == "__main__":
    main()
