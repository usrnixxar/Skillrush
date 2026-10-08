# Skillence Type Runner — 2D Ancient Temple Typing Adventure
**Developed for Skillence Academy**

> *"Type Fast. Break Walls. Run Further."*

Skillence Type Runner is a complete, polished, playable 2D side-scrolling typing adventure game built with **Phaser 3**, **React 19**, **TypeScript**, and **Tailwind CSS**. Inspired by epic temple-jungle adventure platformers, players sprint across mossy stone ruins, decipher ancient runic words to lower towering stone gates, and make automatic physics-driven leaps across bottomless chasms.

---

## 🌟 Key Features

### 1. Cinematic Temple Adventure Aesthetics
- **Multi-Layered Parallax Backgrounds**: 6 distinct depth layers (Distant Sky, Misty Mountain Silhouettes, Ancient Temple Ruins, Cascading Waterfalls, Dense Jungle Canopy, and Foreground Jungle Vines).
- **Dynamic Atmospheric Systems**:
  - Volumetric god rays / sunlight beams shining from the temple canopy.
  - Drifting canyon mist and valley fog layers at varying z-depths.
  - Floating golden jungle spores / ambient pollen particles.
- **Detailed Terrain**:
  - Modular stone floor tiles (`stone_floor`, `mossy_floor`, `broken_floor`, `stone_edge`).
  - Realistic subterranean cliff foundations with vertical rock face striations.
  - Swaying rope bridge segments spanning deep canyons.

### 2. Core Typing Mechanics & Automatic Jump
- **Live Typing Engine**:
  - Auto-focused input (no need to click anywhere before or between words).
  - Target words float above each stone gate in high-contrast ancient stone rune banners.
  - Real-time letter color feedback:
    - **Emerald Green**: Correctly typed letters.
    - **Crimson Red**: Typo / incorrect letter with camera tremor and error feedback.
    - **Warm Gold / Stone White**: Untyped letters.
  - Full **Backspace** correction support.
- **Temple Gate Lowering**:
  - Completing the target word triggers the stone gate lowering animation (`gate_00` to `gate_11`).
  - Emits stone crumbling debris and dust shockwaves as it sinks into subterranean slots.
  - Disables the collision barrier once lowered.
- **Physics-Driven Automatic Jump**:
  - The character continues running after the gate opens.
  - Near the edge of the platform (`X >= platform.edge - 40px`), the character automatically launches an upward physics jump (`vy = -620 px/s`, gravity `1150 px/s²`).
  - Executes a natural parabolic arc over the chasm and lands securely on the next platform.

### 3. Dynamic WPM Road Length System
- Starts at **25 WPM difficulty**.
- Dynamically scales platform road lengths using the exact formula:
  $$\text{estimatedTypingSeconds} = \left(\frac{\text{wordLength}}{5}\right) \times \left(\frac{60}{\text{smoothedWPM}}\right)$$
  $$\text{availableTime} = \text{estimatedTypingSeconds} \times \text{difficultyMultiplier} + \text{reactionBuffer}$$
  $$\text{roadLength} = \text{playerSpeed} \times \text{availableTime} + \text{requiredSafetyDistance}$$
- Moving average smoothing over the last 7 completed words prevents erratic difficulty spikes.
- Longer words automatically receive proportionally more road runway, keeping gameplay mathematically fair.

### 4. Audio Engine (Web Audio API)
- Procedural real-time synthesized audio engine with zero external dependencies:
  - **Jungle Adventure BGM**: Ethnic conga percussion, wooden shakers, and pentatonic D-minor ancient flute/kalimba melodies.
  - **Sound Effects**:
    - Typing click (resonant high harmonic)
    - Typo buzz (low friction scrape)
    - Gate opening (subterranean rumble & grinding stone)
    - Jump whoosh & Landing stone impact thud
    - Coin pickup (bright C6/E6 double shimmer chime)
    - Wall collision crunch & Game over somber bell sting
- Master, Music, and SFX volume sliders with instant mute toggle.

### 5. Website UI & Experience
- **Home Screen**: Hero preview, Skillence Academy branding, play CTA, and profile badge.
- **Player Entry**:
  - **Student Login**: Full name and Student PIN (saved locally).
  - **Guest Play**: Quick nickname selection.
- **In-Game HUD**: Live WPM gauge, accuracy %, distance (m), score, combo streak, coins count, pause, and mute.
- **Mobile Support**: Hidden auto-focus input for native keyboards + optional on-screen QWERTY touch keys.
- **Modals**: How to Play guide, Settings modal, Pause menu, and Leaderboards (Daily, Weekly, All-Time).

---

## 🛠️ Project Structure

```text
skillence-type-runner/
├── public/
│   └── assets/
│       ├── backgrounds/       # 6 parallax layered PNGs (1280x720)
│       ├── character/         # Run, jump, idle, fall, hit sprite sheets (140x180)
│       ├── terrain/           # Modular stone tiles, edge blocks & rope bridge
│       ├── obstacles/         # 12 gate lowering frames, stone pillars, spikes
│       ├── collectibles/      # 12 animated rotating gold coins (80x80)
│       ├── effects/           # Dust, sparkle & gate debris particle sequences
│       ├── ui/                # HUD panel & illustrated buttons
│       └── docs/              # asset_manifest.json
├── src/
│   ├── game/
│   │   ├── config/            # GameConfig.ts, WordBank.ts
│   │   ├── objects/           # Character.ts, TempleGate.ts, Coin.ts, Platform.ts
│   │   ├── scenes/            # PreloadScene.ts, MainGameScene.ts
│   │   └── systems/           # AudioManager.ts, WordManager.ts, JumpPhysics.ts,
│   │                          # LevelGenerator.ts, AtmosphereSystem.ts
│   ├── components/            # GameCanvas, HUD, MobileKeyboard, HomeScreen,
│   │                          # LoginModal, PauseModal, GameOverModal,
│   │                          # LeaderboardModal, HowToPlayModal, SettingsModal
│   ├── services/              # storageService.ts, leaderboardService.ts
│   ├── types/                 # game.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```

The game runs at `http://localhost:5173/` in any desktop or mobile browser.
