# SKILLENCE TYPE RUNNER — HD JUNGLE TEMPLE ASSETS

Original semi-realistic illustrated 2D game-ready starter assets inspired by jungle temple adventures (not copied from Temple Run).

## Contents
- backgrounds: Six transparent 1280×720 layered PNGs. Composite in numeric order; sky is opaque.
- character: separate transparent PNG animation frames, plus horizontal sprite sheets (140×180 px per frame).
- obstacles: 12 gate lowering frames, 192×256 each. Closed = gate_00, fully lowered = gate_11.
- terrain: modular 256×128 textures and rope bridge.
- collectibles: 12 animated coin frames (80×80).
- effects: 10-frame sprite sequences for dust, sparkle, and stone debris.
- ui: HUD panel and illustrated buttons.
- preview: example composited game scene and UI mockup.
- docs/asset_manifest.json: exact sizing, frame counts, suggested parallax speeds.

## Usage in Antigravity / Phaser
1. Copy all assets to public/assets/.
2. Preload the numbered PNGs or slice the provided character sprite sheets using frameWidth 140 and frameHeight 180.
3. Run character at 12 FPS and coins at 12 FPS; run gate sequence once after completed correct word.
4. Tile stone textures horizontally; treat gaps as platform discontinuities.
5. Keep the character within the left third of screen and pan the world toward the right.
6. Layer backgrounds at varying parallax scroll factors.

## Scope
This is an art asset pack, not a complete production game. There is no music, SFX, auth or integrated game code. Assets are transparent illustrative sprites rather than high-resolution 3D renders.
