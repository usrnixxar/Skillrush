"""Generate a stabilized 24-frame run atlas using bidirectional optical flow.

Requires Pillow, numpy and opencv-python-headless. Runtime needs no OpenCV.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/realistic-v1'
source = Image.open(ASSETS / 'run-small.webp').convert('RGBA')
frames = []
def clean_alpha(rgba):
    count, labels, stats, _ = cv2.connectedComponentsWithStats(
        np.uint8(rgba[:, :, 3] > 32), connectivity=8)
    if count > 1:
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        keep = cv2.dilate(np.uint8(labels == largest), np.ones((3, 3), np.uint8))
        rgba[:, :, 3] *= keep
    return rgba

for i in range(8):
    cell = source.crop((i % 4 * 192, i // 4 * 256,
                        (i % 4 + 1) * 192, (i // 4 + 1) * 256))
    rgba = clean_alpha(np.array(cell))
    mask = rgba[:, :, 3] > 64
    # Anchor the upper torso, not swinging hands or feet.
    ys, xs = np.where(mask[45:115])
    anchor = float(np.median(xs))
    bottom = int(np.where(mask)[0].max())
    transform = np.float32([[1, 0, 101 - anchor], [0, 1, 250 - bottom]])
    rgba = cv2.warpAffine(rgba, transform, (192, 256))
    rgba = cv2.resize(rgba, (120, 164), interpolation=cv2.INTER_AREA)
    normalized = np.zeros((180, 140, 4), np.float32)
    normalized[4:168, 10:130] = rgba / 255.0
    normalized[:, :, :3] *= normalized[:, :, 3:4]
    frames.append(normalized)

def gray(frame):
    return cv2.cvtColor(np.uint8(np.clip(frame[:, :, :3] * 255, 0, 255)), cv2.COLOR_RGB2GRAY)

grid_x, grid_y = np.meshgrid(np.arange(140, dtype=np.float32), np.arange(180, dtype=np.float32))
def warp(frame, flow, amount):
    return cv2.remap(frame, grid_x - amount * flow[:, :, 0],
                     grid_y - amount * flow[:, :, 1], cv2.INTER_LINEAR,
                     borderMode=cv2.BORDER_CONSTANT)

output = []
for i, a in enumerate(frames):
    b = frames[(i + 1) % len(frames)]
    estimator = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    forward = estimator.calc(gray(a), gray(b), None)
    backward = estimator.calc(gray(b), gray(a), None)
    for t in (0, 1 / 3, 2 / 3):
        mixed = (1 - t) * warp(a, forward, t) + t * warp(b, backward, 1 - t)
        alpha = mixed[:, :, 3:4]
        rgb = np.divide(mixed[:, :, :3], alpha, out=np.zeros_like(mixed[:, :, :3]), where=alpha > 0.001)
        output.append(Image.fromarray(clean_alpha(np.uint8(np.clip(np.concatenate((rgb, alpha), axis=2) * 255, 0, 255)))))

atlas = Image.new('RGBA', (6 * 140, 4 * 180))
for i, frame in enumerate(output):
    assert np.count_nonzero(np.array(frame)[:, :, 3] > 32) > 128
    atlas.paste(frame, (i % 6 * 140, i // 6 * 180))
atlas.save(ASSETS / 'run-flow-v1.webp', quality=85, method=6)
assert len({frame.tobytes() for frame in output}) == 24
print('PASS: 24 distinct visible frames, including interpolated loop closure')
