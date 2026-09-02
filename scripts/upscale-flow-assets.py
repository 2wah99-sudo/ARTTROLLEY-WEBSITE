"""
Local upscale pass for Google Flow downloads.

Flow's own UI offers a native "2K Upscaled" AI upscale on download, but it's
gated behind a hover dropdown that Playwright automation couldn't reliably
trigger a captured file save from (clicking it navigated the page instead of
producing a downloadable file). Rather than silently ship 1376x768 stills,
this applies a real Lanczos upscale + a mild unsharp pass to ~2K width.

Be honest about what this is: interpolation + sharpening, not AI
super-resolution. It produces a clean, correctly-sized asset for the site's
large hero/gallery crops without visible upscale blur — but it is not the
same as Flow's native "2K Upscaled" button.
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter

TARGET_WIDTH = 2704  # ~2x a 1376-wide 16:9 Flow still, matches Flow's own "2K" tier width

def upscale(path: Path):
    im = Image.open(path).convert("RGB")
    if im.width >= TARGET_WIDTH:
        print(f"skip (already >= target): {path.name} {im.size}")
        return
    scale = TARGET_WIDTH / im.width
    new_size = (TARGET_WIDTH, round(im.height * scale))
    up = im.resize(new_size, Image.LANCZOS)
    # Mild unsharp mask — counteracts the softness Lanczos upscaling introduces
    up = up.filter(ImageFilter.UnsharpMask(radius=1.5, percent=60, threshold=2))
    out = path.with_name(path.stem + "-2k" + path.suffix)
    up.save(out, quality=92)
    print(f"upscaled: {path.name} {im.size} -> {out.name} {up.size}")

if __name__ == "__main__":
    target_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"D:\arttrolley-site\public\flow-assets")
    for f in sorted(target_dir.glob("*.png")):
        if f.stem.endswith("-2k"):
            continue
        upscale(f)
