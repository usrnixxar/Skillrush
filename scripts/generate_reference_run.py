"""Build 48 looped runner frames from 12 reference-inspired key poses.

python scripts/generate_reference_run.py [--source path/to/generated-sheet.png]
The optional source is a 4-by-3 sheet. Components preserve limbs crossing cells.
Requires Pillow, numpy and opencv-python-headless; all processing is offline.
"""
import argparse
import hashlib
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/realistic-v1'
W, H, COUNT, STEPS = 140, 180, 12, 4
parser = argparse.ArgumentParser()
parser.add_argument('--source')
args = parser.parse_args()

if args.source:
    sheet = np.array(Image.open(args.source).convert('RGBA'))
    _, labels, stats, _ = cv2.connectedComponentsWithStats(np.uint8(sheet[:, :, 3] > 32))
    ids = [i for i in range(1, len(stats)) if stats[i, cv2.CC_STAT_AREA] > 2000]
    assert len(ids) == COUNT, f'Expected 12 isolated poses, got {len(ids)}'
    ids.sort(key=lambda i: (int(stats[i, 1] // (sheet.shape[0] / 3)), int(stats[i, 0])))
    normalized = []
    for i in ids:
        mask = np.uint8(labels == i)
        ys, xs = np.where(mask)
        top = int(ys.min())
        # Stable hat/head anchor avoids bounding-box shifts as limbs swing.
        head_x = float(np.median(np.where(mask[top:top + 65])[1]))
        keep = cv2.dilate(mask, np.ones((3, 3), np.uint8))
        rgba = sheet.copy()
        rgba[:, :, 3] *= keep
        # One uniform scale preserves anatomy and natural airborne clearance.
        scale = 0.375
        matrix = np.float32([[scale, 0, 92 - head_x * scale], [0, scale, 36 - top * scale]])
        normalized.append(Image.fromarray(cv2.warpAffine(rgba, matrix, (W, H), flags=cv2.INTER_AREA)))
    keyframes = Image.new('RGBA', (W * 4, H * 3))
    for i, pose in enumerate(normalized):
        keyframes.paste(pose, (i % 4 * W, i // 4 * H))
    keyframes.save(ASSETS / 'run-reference-keyframes.webp', lossless=True, method=6)

keyframes = Image.open(ASSETS / 'run-reference-keyframes.webp').convert('RGBA')
frames = []
for i in range(COUNT):
    frame = np.array(keyframes.crop((i % 4 * W, i // 4 * H, (i % 4 + 1) * W, (i // 4 + 1) * H)), dtype=np.float32) / 255
    frame[:, :, :3] *= frame[:, :, 3:4]
    frames.append(frame)

def gray(frame):
    return cv2.cvtColor(np.uint8(np.clip(frame[:, :, :3] * 255, 0, 255)), cv2.COLOR_RGB2GRAY)

grid_x, grid_y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
def warp(frame, flow, amount):
    return cv2.remap(frame, grid_x - amount * flow[:, :, 0], grid_y - amount * flow[:, :, 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)

output, checksums = [], set()
for i, a in enumerate(frames):
    b = frames[(i + 1) % COUNT]
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    forward = dis.calc(gray(a), gray(b), None)
    backward = dis.calc(gray(b), gray(a), None)
    for step in range(STEPS):
        t = step / STEPS
        mixed = (1 - t) * warp(a, forward, t) + t * warp(b, backward, 1 - t)
        alpha = mixed[:, :, 3:4]
        rgb = np.divide(mixed[:, :, :3], alpha, out=np.zeros_like(mixed[:, :, :3]), where=alpha > 0.001)
        rgba = np.uint8(np.clip(np.concatenate((rgb, alpha), axis=2) * 255, 0, 255))
        _, labels, stats, _ = cv2.connectedComponentsWithStats(np.uint8(rgba[:, :, 3] > 32))
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        rgba[:, :, 3] *= cv2.dilate(np.uint8(labels == largest), np.ones((3, 3), np.uint8))
        assert np.count_nonzero(rgba[:, :, 3] > 32) > 128
        checksums.add(hashlib.sha256(rgba.tobytes()).hexdigest())
        output.append(Image.fromarray(rgba))

assert len(checksums) == COUNT * STEPS
atlas = Image.new('RGBA', (W * 8, H * 6))
for i, frame in enumerate(output):
    atlas.paste(frame, (i % 8 * W, i // 8 * H))
atlas.save(ASSETS / 'run-reference-48-v1.webp', quality=88, method=6)
decoded = Image.open(ASSETS / 'run-reference-48-v1.webp')
decoded.load()
assert decoded.size == (1120, 1080)
print('PASS: 48 distinct visible frames; full last-to-first optical-flow transition; atlas decodes')
