import Phaser from 'phaser';

/** Keep original generated art intact; assemble fixed-size animation cells at load time.
 * Normalized 140x180 cells retain the existing, tested 52x124 collision body. */
export function createRealisticTextures(scene: Phaser.Scene) {
  type Clip = [number, number][];
  const frame = (sourceKey: string, key: string, crop: number[], destination: number[], clip?: Clip) => {
    if (scene.textures.exists(key)) return;
    const texture = scene.textures.createCanvas(key, 140, 180)!;
    const ctx = texture.getContext();
    const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
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
    ctx.drawImage(source,sx,sy,sw,sh,dx,dy,dw,dh);
    ctx.restore(); texture.refresh();
  };
  // Run sheet: 384x512 cells, baseline 499. Fixed source scale avoids gait-size flicker.
  for (let i=0;i<8;i++) frame('real_run',`explorer_run_${i}`,
    [(i%4)*192,Math.floor(i/4)*256,192,256],[10,4,120,164]);
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
