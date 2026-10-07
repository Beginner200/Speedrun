import Phaser from 'phaser';
import { PALETTE } from '../config/palette';
import { BIOMES } from '../core/visualSystem';

export class WorldVisualScene extends Phaser.Scene {
  private far: Phaser.GameObjects.Container[] = [];
  private mid: Phaser.GameObjects.Container[] = [];
  private near: Phaser.GameObjects.Container[] = [];
  private roadDecor: Phaser.GameObjects.Rectangle[] = [];
  private transition?: Phaser.GameObjects.Container;
  private activeBiome = '';

  constructor() { super('WorldVisualScene'); }

  create(): void {
    this.buildLayers();
    this.applyBiome('sunnyCity', false);
    this.events.on(Phaser.Scenes.Events.UPDATE, this.updateWorld, this);
  }

  private buildLayers(): void {
    const { width, height } = this.scale;
    for (let i = 0; i < 5; i++) {
      this.far.push(this.add.container(0, i * (height / 5)).setDepth(-6));
      this.mid.push(this.add.container(0, i * (height / 5)).setDepth(-5));
      this.near.push(this.add.container(0, i * (height / 5)).setDepth(-4));
    }
    for (let i = 0; i < 8; i++) {
      this.roadDecor.push(this.add.rectangle(width / 2, -80 - i * 130, 8, 54, 0xffffff, 0.12).setDepth(-1));
    }
    this.redrawDecorations();
  }

  private addNeonSign(container: Phaser.GameObjects.Container, x: number, y: number, color: number): void {
    const glow = this.add.rectangle(x, y, 34, 12, color, 0.12).setStrokeStyle(2, color, 0.45);
    const sign = this.add.rectangle(x, y, 27, 8, color, 0.78).setStrokeStyle(1, 0xffffff, 0.2);
    container.add([glow, sign]);
  }

  private addRuinArch(container: Phaser.GameObjects.Container, x: number, y: number, color: number): void {
    const left = this.add.rectangle(x - 24, y, 13, 74, color, 0.95);
    const right = this.add.rectangle(x + 24, y, 13, 74, color, 0.95);
    const top = this.add.rectangle(x, y - 31, 61, 13, color, 0.95);
    container.add([left, right, top]);
  }

  private redrawDecorations(): void {
    const { width, height } = this.scale;
    for (const layer of [...this.far, ...this.mid, ...this.near]) layer.removeAll(true);

    for (let i = 0; i < this.far.length; i++) {
      const y = i * (height / 5);
      const f = this.far[i], m = this.mid[i], n = this.near[i];

      if (this.activeBiome === 'sunnyCity') {
        f.add([
          this.add.rectangle(width * 0.14, 55, 92, 150, PALETTE.biomes.sunnyCity.far),
          this.add.rectangle(width * 0.86, 80, 110, 190, PALETTE.biomes.sunnyCity.far),
          this.add.circle(width * 0.5, 48, 24, 0xfff1a8, 0.32)
        ]);
        m.add([
          this.add.rectangle(width * 0.08, 45, 72, 120, PALETTE.biomes.sunnyCity.mid),
          this.add.rectangle(width * 0.92, 70, 82, 145, PALETTE.biomes.sunnyCity.mid),
          this.add.rectangle(width * 0.08, 5, 36, 4, 0xffffff, 0.45),
          this.add.rectangle(width * 0.92, 30, 42, 4, 0xffffff, 0.4)
        ]);
        n.add([
          this.add.rectangle(width * 0.03, 60, 34, 100, PALETTE.biomes.sunnyCity.near),
          this.add.rectangle(width * 0.97, 75, 38, 120, PALETTE.biomes.sunnyCity.near),
          this.add.rectangle(width * 0.11, 48, 12, 70, PALETTE.biomes.sunnyCity.near)
        ]);
      } else if (this.activeBiome === 'neonNight') {
        f.add([
          this.add.circle(width * 0.14, 52, 28, PALETTE.biomes.neonNight.divider, 0.12),
          this.add.circle(width * 0.86, 78, 34, PALETTE.biomes.neonNight.pickup, 0.1),
          this.add.rectangle(width * 0.5, 70, 170, 4, PALETTE.biomes.neonNight.divider, 0.22)
        ]);
        m.add([
          this.add.rectangle(width * 0.12, 60, 76, 120, PALETTE.biomes.neonNight.mid),
          this.add.rectangle(width * 0.88, 55, 88, 140, PALETTE.biomes.neonNight.mid)
        ]);
        this.addNeonSign(m, width * 0.12, 42, PALETTE.biomes.neonNight.pickup);
        this.addNeonSign(m, width * 0.88, 75, PALETTE.biomes.neonNight.divider);
        n.add([
          this.add.rectangle(width * 0.05, 70, 26, 150, PALETTE.biomes.neonNight.near),
          this.add.rectangle(width * 0.95, 55, 30, 130, PALETTE.biomes.neonNight.near),
          this.add.rectangle(width * 0.16, 70, 5, 75, PALETTE.biomes.neonNight.divider, 0.75),
          this.add.rectangle(width * 0.84, 60, 5, 95, PALETTE.biomes.neonNight.pickup, 0.7),
          this.add.rectangle(width * 0.06, 18, 52, 3, PALETTE.biomes.neonNight.pickup, 0.75),
          this.add.rectangle(width * 0.94, 26, 58, 3, PALETTE.biomes.neonNight.divider, 0.75)
        ]);
      } else {
        f.add([
          this.add.ellipse(width * 0.12, 70, 150, 105, PALETTE.biomes.jungleRuins.far),
          this.add.ellipse(width * 0.88, 85, 170, 120, PALETTE.biomes.jungleRuins.far),
          this.add.ellipse(width * 0.5, 40, 180, 55, 0x83b95b, 0.12)
        ]);
        m.add([
          this.add.rectangle(width * 0.1, 62, 28, 145, PALETTE.biomes.jungleRuins.mid),
          this.add.rectangle(width * 0.9, 68, 32, 150, PALETTE.biomes.jungleRuins.mid),
          this.add.ellipse(width * 0.16, 30, 110, 38, 0x6fa44e, 0.65),
          this.add.ellipse(width * 0.84, 34, 120, 42, 0x6fa44e, 0.65)
        ]);
        this.addRuinArch(m, width * 0.13, 74, 0x8f9b78);
        this.addRuinArch(m, width * 0.87, 82, 0x8f9b78);
        n.add([
          this.add.ellipse(width * 0.06, 70, 85, 150, PALETTE.biomes.jungleRuins.near),
          this.add.ellipse(width * 0.94, 76, 90, 160, PALETTE.biomes.jungleRuins.near),
          this.add.rectangle(width * 0.18, 65, 18, 120, PALETTE.biomes.jungleRuins.mid),
          this.add.rectangle(width * 0.82, 72, 18, 130, PALETTE.biomes.jungleRuins.mid),
          this.add.ellipse(width * 0.22, 20, 78, 28, 0x87b85a, 0.7),
          this.add.ellipse(width * 0.78, 25, 84, 30, 0x87b85a, 0.7)
        ]);
      }
      f.y = y; m.y = y; n.y = y;
    }
  }

  private applyBiome(id: string, animate: boolean): void {
    if (id === this.activeBiome) return;
    this.activeBiome = id;
    this.redrawDecorations();
    const palette = PALETTE.biomes[id as keyof typeof PALETTE.biomes];
    this.cameras.main.setBackgroundColor(palette.sky);
    if (animate) {
      for (const layer of [...this.far, ...this.mid, ...this.near]) {
        layer.setAlpha(0.15);
        this.tweens.add({ targets: layer, alpha: 1, duration: 900, ease: 'Quad.easeOut' });
      }
    }
  }

  private showTransition(title: string, palette: typeof PALETTE.biomes.sunnyCity): void {
    this.transition?.destroy();
    const { width } = this.scale;
    const shade = this.add.rectangle(width / 2, 112, width - 28, 54, palette.sky, 0.92).setStrokeStyle(2, palette.divider, 0.75);
    const label = this.add.text(width / 2, 112, title.toUpperCase(), {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold', letterSpacing: 1
    }).setOrigin(0.5);
    this.transition = this.add.container(0, -70, [shade, label]).setDepth(40);
    this.tweens.add({ targets: this.transition, y: 0, duration: 220, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.transition, y: -70, delay: 1500, duration: 500, ease: 'Quad.easeIn', onComplete: () => { this.transition?.destroy(); this.transition = undefined; } });
  }

  private updateWorld(_time: number, delta: number): void {
    const play = this.scene.get('PlayScene');
    if (!play || !this.scene.isActive('PlayScene')) {
      this.scene.setVisible(false);
      return;
    }
    this.scene.setVisible(true);
    const distance = Number((play as unknown as { distance?: number }).distance ?? 0);
    const biome = BIOMES.reduce((current, next) => distance >= next.startDistance ? next : current, BIOMES[0]);
    if (biome.id !== this.activeBiome) {
      this.applyBiome(biome.id, true);
      if (this.activeBiome === biome.id && distance > biome.startDistance + 1) this.showTransition(biome.title, PALETTE.biomes[biome.id as keyof typeof PALETTE.biomes]);
    }

    const speed = Number((play as unknown as { speed?: number }).speed ?? 1);
    const factor = Math.max(0.35, speed / 280);
    const h = this.scale.height;
    for (let i = 0; i < this.far.length; i++) {
      this.far[i].y += delta * factor * 0.08;
      this.mid[i].y += delta * factor * 0.18;
      this.near[i].y += delta * factor * 0.34;
      if (this.far[i].y > h + 120) this.far[i].y -= h + 600;
      if (this.mid[i].y > h + 120) this.mid[i].y -= h + 600;
      if (this.near[i].y > h + 120) this.near[i].y -= h + 600;
    }
    for (const mark of this.roadDecor) {
      mark.y += delta * factor * 0.55;
      if (mark.y > h + 80) mark.y -= h + 1100;
    }
  }
}
