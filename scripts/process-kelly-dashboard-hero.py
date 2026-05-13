"""
Feather Kelly dashboard hero cutout: knock back near-black background and soften alpha.

  python scripts/process-kelly-dashboard-hero.py path/to/source.png public/images/kelly/headshots/kelly-hero.png

Requires: pip install pillow numpy
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__.strip())
        sys.exit(1)
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    import numpy as np

    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3].astype(np.float32)
    lum = (0.299 * r + 0.587 * g + 0.114 * b).astype(np.float32)
    t0, t1 = 12.0, 58.0
    mask = np.clip((lum - t0) / (t1 - t0), 0, 1)
    new_a = (a * mask).astype(np.uint8)
    arr[:, :, 3] = new_a
    out = Image.fromarray(arr, "RGBA")
    r2, g2, b2, a2 = out.split()
    a2 = a2.filter(ImageFilter.GaussianBlur(radius=0.9))
    out = Image.merge("RGBA", (r2, g2, b2, a2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "PNG", optimize=True)
    print("wrote", dest.resolve(), out.size)


if __name__ == "__main__":
    main()
