#!/usr/bin/env python3
"""Write original Tea Shop PNG icons without third-party image libs."""

from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path


def png(path: Path, width: int, height: int, pixel) -> None:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixel(x, y, width, height))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(a[0] + (b[0] - a[0]) * t),
        int(a[1] + (b[1] - a[1]) * t),
        int(a[2] + (b[2] - a[2]) * t),
    )


def inside_ellipse(x: float, y: float, cx: float, cy: float, rx: float, ry: float) -> bool:
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1


def paint(x: int, y: int, w: int, h: int) -> bytes:
    nx, ny = x / (w - 1), y / (h - 1)
    cream = (251, 243, 232)
    blush = (243, 210, 197)
    pot = (232, 176, 158)
    pot_deep = (196, 132, 110)
    handle = (216, 156, 136)
    lid = (201, 140, 118)
    steam = (236, 220, 210)

    color = mix(cream, blush, ny * 0.35)
    alpha = 255

    # rounded square mask for maskable icons
    pad = 0.06
    if nx < pad or nx > 1 - pad or ny < pad or ny > 1 - pad:
        corner = min(nx, 1 - nx, ny, 1 - ny)
        if corner < 0.03:
            alpha = 0 if corner < 0.01 else 180

    cx, cy = 0.5, 0.56
    if inside_ellipse(nx, ny, cx, cy, 0.28, 0.22):
        t = (ny - 0.4) / 0.4
        color = mix(pot, pot_deep, max(0, min(1, t)))
    if 0.22 <= nx <= 0.32 and 0.48 <= ny <= 0.66:
        color = handle
    if 0.68 <= nx <= 0.8 and 0.5 <= ny <= 0.64:
        color = handle
    if inside_ellipse(nx, ny, 0.5, 0.34, 0.12, 0.06):
        color = lid
    if inside_ellipse(nx, ny, 0.42, 0.22, 0.03, 0.08) or inside_ellipse(
        nx, ny, 0.56, 0.18, 0.028, 0.07
    ):
        color = steam

    # soft highlight
    if math.hypot(nx - 0.4, ny - 0.48) < 0.08 and color != cream:
        color = mix(color, (255, 246, 238), 0.35)

    return bytes((*color, alpha))


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "public" / "icons"
    root.mkdir(parents=True, exist_ok=True)
    png(root / "icon-192.png", 192, 192, paint)
    png(root / "icon-512.png", 512, 512, paint)
    png(root / "apple-touch-icon.png", 180, 180, paint)
    print("wrote", root)


if __name__ == "__main__":
    main()
