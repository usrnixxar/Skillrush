import Phaser from 'phaser';

export class AtmosphereSystem {
  private scene: Phaser.Scene;
  private mistLayers: Phaser.GameObjects.TileSprite[] = [];
  private ambientParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private sunlightOverlay: Phaser.GameObjects.Graphics | null = null;
  private vignetteOverlay: Phaser.GameObjects.Graphics | null = null;
  private timeElapsed = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public create() {
    this.createGodRays();
    this.createMistLayers();
    this.createAmbientDust();
    this.createCinematicVignette();
  }

  /**
   * Procedural volumetric God Rays / Sunlight beams
   */
  private createGodRays() {
    this.sunlightOverlay = this.scene.add.graphics();
    this.sunlightOverlay.setScrollFactor(0);
    this.sunlightOverlay.setDepth(25); // Behind foreground vines, over ruins
    this.sunlightOverlay.setBlendMode(Phaser.BlendModes.ADD);

    this.renderGodRays(0);
  }

  private renderGodRays(offset: number) {
    if (!this.sunlightOverlay) return;
    this.sunlightOverlay.clear();

    const height = 720;

    // Angled sunbeam polygons radiating from top-left sun position
    const beams = [
      { startX: 100, width: 90, alpha: 0.08 + Math.sin(offset * 0.8) * 0.02 },
      { startX: 320, width: 140, alpha: 0.12 + Math.sin(offset * 1.1 + 1) * 0.03 },
      { startX: 620, width: 110, alpha: 0.09 + Math.sin(offset * 0.7 + 2) * 0.025 },
      { startX: 890, width: 160, alpha: 0.11 + Math.sin(offset * 0.9 + 3) * 0.03 },
    ];

    beams.forEach(beam => {
      this.sunlightOverlay!.fillStyle(0xffe899, beam.alpha);
      this.sunlightOverlay!.beginPath();
      this.sunlightOverlay!.moveTo(beam.startX, 0);
      this.sunlightOverlay!.lineTo(beam.startX + beam.width, 0);
      this.sunlightOverlay!.lineTo(beam.startX + beam.width + 360, height);
      this.sunlightOverlay!.lineTo(beam.startX + 260, height);
      this.sunlightOverlay!.closePath();
      this.sunlightOverlay!.fillPath();
    });
  }

  /**
   * Creates drifting canyon mist & fog layers at different z-depths
   */
  private createMistLayers() {
    // We create a procedural soft gradient texture for mist
    const mistTextureKey = 'procedural_mist_texture';
    if (!this.scene.textures.exists(mistTextureKey)) {
      const canvas = this.scene.textures.createCanvas(mistTextureKey, 512, 128);
      if (canvas) {
        const ctx = canvas.getContext();
        const grad = ctx.createLinearGradient(0, 0, 0, 128);
        grad.addColorStop(0, 'rgba(215, 238, 228, 0)');
        grad.addColorStop(0.5, 'rgba(215, 238, 228, 0.28)');
        grad.addColorStop(1, 'rgba(215, 238, 228, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 128);
        canvas.refresh();
      }
    }

    // Deep valley mist layer
    const valleyMist = this.scene.add.tileSprite(640, 500, 1400, 140, mistTextureKey);
    valleyMist.setScrollFactor(0.2);
    valleyMist.setDepth(8); // Between mountains & temple ruins
    valleyMist.setAlpha(0.55);
    valleyMist.setBlendMode(Phaser.BlendModes.SCREEN);
    this.mistLayers.push(valleyMist);

    // Near-ground waterfall mist
    const groundMist = this.scene.add.tileSprite(640, 610, 1400, 110, mistTextureKey);
    groundMist.setScrollFactor(0.6);
    groundMist.setDepth(18); // Above platforms
    groundMist.setAlpha(0.35);
    groundMist.setBlendMode(Phaser.BlendModes.SCREEN);
    this.mistLayers.push(groundMist);
  }

  /**
   * Ambient jungle floating pollen / golden dust spores
   */
  private createAmbientDust() {
    // Generate soft circular glow particle texture
    const sporeKey = 'ambient_spore_particle';
    if (!this.scene.textures.exists(sporeKey)) {
      const canvas = this.scene.textures.createCanvas(sporeKey, 16, 16);
      if (canvas) {
        const ctx = canvas.getContext();
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 245, 180, 0.9)');
        grad.addColorStop(0.5, 'rgba(240, 215, 120, 0.4)');
        grad.addColorStop(1, 'rgba(240, 215, 120, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(8, 8, 8, 0, Math.PI * 2);
        ctx.fill();
        canvas.refresh();
      }
    }

    this.ambientParticles = this.scene.add.particles(0, 0, sporeKey, {
      x: { min: -100, max: 1380 },
      y: { min: 50, max: 680 },
      speedX: { min: -15, max: 25 },
      speedY: { min: -12, max: 12 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 0.6, end: 0 },
      lifespan: { min: 4000, max: 7000 },
      frequency: 240,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.ambientParticles.setScrollFactor(0);
    this.ambientParticles.setDepth(35);
  }

  /**
   * Cinematic temple edge vignette for immersion
   */
  private createCinematicVignette() {
    this.vignetteOverlay = this.scene.add.graphics();
    this.vignetteOverlay.setScrollFactor(0);
    this.vignetteOverlay.setDepth(999);

    const w = 1280;
    const h = 720;
    // Dark corner gradients
    this.vignetteOverlay.fillStyle(0x040805, 0.45);
    // Top subtle bar
    this.vignetteOverlay.fillRect(0, 0, w, 28);
    // Bottom subtle bar
    this.vignetteOverlay.fillRect(0, h - 28, w, 28);
  }

  public update(time: number, delta: number) {
    this.timeElapsed += delta * 0.001;

    // Drift mist layers
    if (this.mistLayers.length >= 2) {
      this.mistLayers[0].tilePositionX += delta * 0.015;
      this.mistLayers[1].tilePositionX += delta * 0.035;
    }

    // Pulse god rays
    if (this.sunlightOverlay) {
      this.renderGodRays(this.timeElapsed);
    }
  }

  /**
   * Spawns dust puff when character runs or jumps
   */
  public spawnDustPuff(x: number, y: number, count = 4) {
    for (let i = 0; i < count; i++) {
      const dustIndex = Math.min(9, Math.floor(Math.random() * 5));
      const key = `dust_${dustIndex.toString().padStart(2, '0')}`;
      if (this.scene.textures.exists(key)) {
        const sprite = this.scene.add.sprite(x + (Math.random() * 20 - 10), y + (Math.random() * 6 - 3), key);
        sprite.setDepth(22);
        sprite.setScale(0.85 + Math.random() * 0.3);
        sprite.setAlpha(0.85);

        this.scene.tweens.add({
          targets: sprite,
          x: sprite.x - (20 + Math.random() * 30),
          y: sprite.y - (10 + Math.random() * 15),
          alpha: 0,
          scale: sprite.scale * 1.5,
          duration: 350 + Math.random() * 200,
          ease: 'Cubic.easeOut',
          onComplete: () => sprite.destroy(),
        });
      }
    }
  }

  /**
   * Spawns gate crumbling stone debris and dust shockwave
   */
  public spawnGateDebris(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const debrisIndex = Math.floor(Math.random() * 10);
      const key = `gate_debris_${debrisIndex.toString().padStart(2, '0')}`;
      if (this.scene.textures.exists(key)) {
        const sprite = this.scene.add.sprite(
          x + (Math.random() * 120 - 60),
          y + (Math.random() * 80 - 40),
          key
        );
        sprite.setDepth(24);
        sprite.setScale(0.9 + Math.random() * 0.5);

        const targetX = sprite.x + (Math.random() * 140 - 70);
        const targetY = sprite.y + 60 + Math.random() * 50;

        this.scene.tweens.add({
          targets: sprite,
          x: targetX,
          y: targetY,
          rotation: Math.random() * 4 - 2,
          alpha: 0,
          duration: 500 + Math.random() * 300,
          ease: 'Quad.easeIn',
          onComplete: () => sprite.destroy(),
        });
      }
    }

    // Heavy dust burst along the ground
    for (let i = 0; i < 8; i++) {
      this.spawnDustPuff(x + (Math.random() * 100 - 50), y + 60, 2);
    }
  }

  /**
   * Spawns golden sparkles and floating popup when coin is collected
   */
  public spawnCoinCollectionFX(x: number, y: number, value = '+100') {
    // 1. Sparkle sequence
    for (let i = 0; i < 6; i++) {
      const sparkleIdx = Math.floor(Math.random() * 10);
      const key = `sparkle_${sparkleIdx.toString().padStart(2, '0')}`;
      if (this.scene.textures.exists(key)) {
        const sparkle = this.scene.add.sprite(
          x + (Math.random() * 40 - 20),
          y + (Math.random() * 40 - 20),
          key
        );
        sparkle.setDepth(30);
        sparkle.setScale(1.2);
        sparkle.setBlendMode(Phaser.BlendModes.ADD);

        this.scene.tweens.add({
          targets: sparkle,
          y: sparkle.y - 35,
          alpha: 0,
          scale: 1.8,
          duration: 400,
          onComplete: () => sparkle.destroy(),
        });
      }
    }

    // 2. Floating gold text popup
    const popup = this.scene.add.text(x, y - 20, value, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#78350f',
      strokeThickness: 4,
    });
    popup.setOrigin(0.5);
    popup.setDepth(40);

    this.scene.tweens.add({
      targets: popup,
      y: y - 65,
      alpha: 0,
      scale: 1.25,
      duration: 650,
      ease: 'Back.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  /**
   * Camera shake with optional flash for impacts or typos
   */
  public triggerImpactShake(intensity = 0.008, duration = 180) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  public triggerTypoFlash() {
    this.scene.cameras.main.flash(120, 220, 38, 38, true);
  }

  public triggerWordSolvedFlash() {
    this.scene.cameras.main.flash(180, 52, 211, 153, false);
  }
}
