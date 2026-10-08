import Phaser from 'phaser';

/** Small reusable particle pools and soft lighting keep the runner readable. */
export class AtmosphereSystem {
  private mist: Phaser.GameObjects.TileSprite[] = [];
  private light!: Phaser.GameObjects.Image;
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;
  private debris!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private solvedLight!: Phaser.GameObjects.Rectangle;
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private scene: Phaser.Scene) {}

  public create() {
    this.createTextures();
    const {scene} = this;
    this.light = scene.add.image(640,360,'soft_sunlight').setScrollFactor(0).setDepth(8).setAlpha(0.7);
    this.mist = [
      scene.add.tileSprite(640,495,1280,160,'soft_mist').setScrollFactor(0).setDepth(6).setAlpha(0.25),
      scene.add.tileSprite(640,664,1280,90,'soft_mist').setScrollFactor(0).setDepth(18).setAlpha(0.15),
    ];
    this.dust = scene.add.particles(0,0,'soft_dust',{
      emitting:false, maxParticles:100, lifespan:{min:380,max:650},
      speedX:{min:-42,max:12},speedY:{min:-30,max:-7},gravityY:12,
      scale:{start:0.14,end:0.55},alpha:{start:0.24,end:0},tint:0xb9ad89,
    }).setDepth(22);
    this.debris = scene.add.particles(0,0,'real_props',{
      frame:'pebble',emitting:false,maxParticles:70,lifespan:{min:500,max:850},
      speedX:{min:-125,max:125},speedY:{min:-190,max:-55},gravityY:520,
      scale:{start:0.22,end:0.12},rotate:{min:-180,max:180},alpha:{start:1,end:0},
    }).setDepth(23);
    this.sparks = scene.add.particles(0,0,'soft_glow',{
      emitting:false,maxParticles:60,lifespan:340,speed:{min:15,max:60},
      scale:{start:0.12,end:0},alpha:{start:0.8,end:0},tint:0xffd580,
      blendMode:Phaser.BlendModes.ADD,
    }).setDepth(24);
    if (!this.reduceMotion) {
      scene.add.particles(0,0,'soft_glow',{
        x:{min:0,max:1280},y:{min:180,max:650},frequency:420,
        maxParticles:24,lifespan:5000,speedX:{min:-6,max:10},speedY:{min:-7,max:-2},
        scale:{start:0.045,end:0.015},alpha:{start:0.45,end:0},tint:0xffde9c,
        blendMode:Phaser.BlendModes.ADD,
      }).setScrollFactor(0).setDepth(17);
      scene.add.particles(0,0,'jungle_leaf',{
        x:{min:0,max:1360},y:-15,frequency:1200,maxParticles:12,lifespan:11000,
        speedX:{min:-26,max:-8},speedY:{min:32,max:56},rotate:{min:0,max:360},
        scale:{start:0.45,end:0.22},alpha:{start:0.65,end:0},
      }).setScrollFactor(0).setDepth(21);
    }
    this.solvedLight = scene.add.rectangle(640,360,1280,720,0xf6d68c,0)
      .setScrollFactor(0).setDepth(26);
  }

  private createTextures() {
    const texture = (key:string,w:number,h:number,paint:(ctx:CanvasRenderingContext2D)=>void) => {
      if (this.scene.textures.exists(key)) return;
      const canvas=this.scene.textures.createCanvas(key,w,h)!;
      paint(canvas.getContext()); canvas.refresh();
    };
    texture('soft_dust',64,64,ctx=>{
      const g=ctx.createRadialGradient(32,32,0,32,32,32);
      g.addColorStop(0,'rgba(255,255,255,0.7)');g.addColorStop(0.45,'rgba(255,255,255,0.32)');g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
    });
    texture('soft_glow',32,32,ctx=>{
      const g=ctx.createRadialGradient(16,16,0,16,16,16);
      g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.2,'rgba(255,255,255,0.65)');g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,32,32);
    });
    texture('soft_mist',512,128,ctx=>{
      for(let i=0;i<22;i++) {
        const x=32+Math.random()*448,y=38+Math.random()*52,r=30+Math.random()*38;
        const g=ctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0,'rgba(194,223,208,0.13)');g.addColorStop(1,'rgba(194,223,208,0)');
        ctx.fillStyle=g;ctx.fillRect(0,0,512,128);
      }
    });
    texture('soft_sunlight',1280,720,ctx=>{
      for(let i=0;i<4;i++) {
        ctx.save();ctx.translate(940-i*150,-130);ctx.rotate(0.49);
        const g=ctx.createLinearGradient(-65,0,65,0);
        g.addColorStop(0,'rgba(255,235,181,0)');g.addColorStop(0.5,'rgba(255,235,181,0.055)');g.addColorStop(1,'rgba(255,235,181,0)');
        ctx.fillStyle=g;ctx.fillRect(-65,0,130,1100);ctx.restore();
      }
    });
    texture('jungle_leaf',24,12,ctx=>{
      const g=ctx.createLinearGradient(0,0,24,12);g.addColorStop(0,'#adc77a');g.addColorStop(1,'#30552f');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,6);ctx.quadraticCurveTo(13,-7,24,6);ctx.quadraticCurveTo(12,17,0,6);ctx.fill();
      ctx.strokeStyle='#5b6b38';ctx.beginPath();ctx.moveTo(2,6);ctx.lineTo(22,6);ctx.stroke();
    });
  }

  public update(time:number,delta:number) {
    if (this.reduceMotion) return;
    this.mist.forEach((layer,i)=>{layer.tilePositionX+=delta*(0.009+i*0.006);});
    this.light.setAlpha(0.65+Math.sin(time*0.0003)*0.08);
  }
  public spawnDustPuff(x:number,y:number,count=4) {
    this.dust.explode(this.reduceMotion?1:count,x,y);
  }
  public spawnGateDebris(x:number,y:number) {
    this.debris.explode(this.reduceMotion?6:22,x,y-45);
    this.dust.explode(16,x,y+15);
  }
  public spawnCoinCollectionFX(x:number,y:number,value='+100') {
    this.sparks.explode(this.reduceMotion?2:5,x,y);
    const text=this.scene.add.text(x,y-14,value,{
      fontFamily:'Outfit, sans-serif',fontSize:'17px',color:'#ffe6a3',stroke:'#1a2418',strokeThickness:3,
    }).setOrigin(0.5).setDepth(30);
    this.scene.tweens.add({targets:text,y:y-48,alpha:0,duration:540,onComplete:()=>text.destroy()});
  }
  public triggerImpactShake(intensity=0.008,duration=180) {
    if (!this.reduceMotion) this.scene.cameras.main.shake(duration,Math.min(intensity,0.012));
  }
  public triggerTypoFlash() {
    // The red letter tile already marks the typo without obscuring gameplay.
  }
  public triggerWordSolvedFlash() {
    this.solvedLight.setFillStyle(0xf6d68c,1).setAlpha(this.reduceMotion?0:0.07);
    this.scene.tweens.add({targets:this.solvedLight,alpha:0,duration:240});
  }
}
