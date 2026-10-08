import Phaser from 'phaser';

/** Keep original generated art intact; assemble fixed-size animation cells at load time.
 * Normalized 140x180 cells retain the existing, tested 52x124 collision body. */
export function createRealisticTextures(scene: Phaser.Scene) {
  type Clip = [number, number][];
  const frame = (sourceKey: string, key: string, crop: number[], destination: number[], clip?: Clip) => {
    if (scene.textures.exists(key)) return;
    const texture = scene.textures.createCanvas(key, 140, 180)!;
    const ctx = texture.getContext();
    const source = scene.textures.exists(sourceKey)
      ? scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement
      : null;
    const [sx, sy, sw, sh] = crop;
    const [dx, dy, dw, dh] = destination;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.save();
    if (clip) {
      ctx.beginPath();
      clip.forEach(([x,y], i) => {
        const px = dx + x / sw * dw, py = dy + y / sh * dh;
        if (i === 0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      });
      ctx.closePath(); ctx.clip();
    }
    if (source && source.width > 0 && source.height > 0) {
      ctx.drawImage(source,sx,sy,sw,sh,dx,dy,dw,dh);
    }
    ctx.restore();

    // A canvas texture can exist even when its crop contains no character.
    // Repair the frame itself so running/jumping animations retain the repair.
    const hasVisiblePixels = () => {
      const pixels = ctx.getImageData(0, 0, 140, 180).data;
      let count = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 32 && ++count >= 128) return true;
      }
      return false;
    };
    if (!hasVisiblePixels()) {
      console.warn('Empty character frame; restoring explorer pose:', key, sourceKey);
      ctx.clearRect(0, 0, 140, 180);
      if (scene.textures.exists('real_explorer')) {
        const backup = scene.textures.get('real_explorer').getSourceImage() as HTMLImageElement;
        if (backup.width > 0 && backup.height > 0) {
          ctx.drawImage(backup, 0, 0, backup.width, backup.height, 10, 4, 120, 164);
        }
      }
      if (!hasVisiblePixels()) {
        // Last-resort visible runner if both downloaded character images fail.
        ctx.fillStyle = '#e4b488';
        ctx.beginPath();
        ctx.arc(70, 30, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b28c49';
        ctx.fillRect(53, 46, 34, 58);
        ctx.strokeStyle = '#e4b488';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(55, 52); ctx.lineTo(35, 81); ctx.lineTo(24, 65);
        ctx.moveTo(85, 52); ctx.lineTo(103, 76); ctx.lineTo(117, 62);
        ctx.stroke();
        ctx.strokeStyle = '#354f40';
        ctx.lineWidth = 13;
        ctx.beginPath();
        ctx.moveTo(61, 101); ctx.lineTo(44, 131); ctx.lineTo(30, 159);
        ctx.moveTo(79, 101); ctx.lineTo(97, 127); ctx.lineTo(108, 159);
        ctx.stroke();
      }
    }
    texture.refresh();
  };
  // Reference-inspired run: 12 key poses + 36 optical-flow frames, eight columns.
  for (let i=0;i<48;i++) frame('real_run',`explorer_run_${i}`,
    [(i%8)*140,Math.floor(i/8)*180,140,180],[0,0,140,180]);
  // Keep a guaranteed visible pose available for low-memory/slow decoders.
  frame('real_explorer', 'explorer_fallback', [0,0,420,540], [10,4,120,164]);
  // Jump poses have different silhouettes; preserve anatomical scale rather than stretching.
  frame('real_jump','explorer_jump_0',[0,0,328,300],[-14,-3,168,169],
    [[0,0],[328,0],[328,265],[175,265],[150,300],[0,300]]);
  frame('real_jump','explorer_jump_1',[328,0,328,300],[1,1,134,147]);
  frame('real_jump','explorer_jump_2',[0,300,328,300],[-20,6,177,156],
    [[140,0],[328,0],[328,300],[0,300],[0,40],[140,40]]);
  frame('real_jump','explorer_jump_3',[328,300,328,300],[3,29,128,133]);

  const props = scene.textures.get('real_props');
  props.add('fern',0,0,0,256,256);
  props.add('palm',0,256,0,256,256);
  props.add('gate',0,0,256,256,256);
  props.add('stone',0,256,256,256,256);
  props.add('pebble',0,256,256,45,36);
  const stone = scene.textures.createCanvas('real_stone_tile',256,256)!;
  stone.getContext().drawImage(props.getSourceImage() as HTMLImageElement,256,256,256,256,0,0,256,256);
  stone.refresh();
}
