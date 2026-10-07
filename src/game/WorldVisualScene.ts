import Phaser from 'phaser';
import { PALETTE } from '../config/palette';
import { BIOMES } from '../core/visualSystem';

export class WorldVisualScene extends Phaser.Scene {
  private far: Phaser.GameObjects.Container[] = [];
  private mid: Phaser.GameObjects.Container[] = [];
  private near: Phaser.GameObjects.Container[] = [];
  private roadDecor: Phaser.GameObjects.Rectangle[] = [];
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

  private redrawDecorations(): void {
    const { width, height } = this.scale;
    for (const layer of [...this.far, ...this.mid, ...this.near]) layer.removeAll(true);
    for (let i = 0; i < this.far.length; i++) {
      const y = i * (height / 5);
      const f = this.far[i], m = this.mid[i], n = this.near[i];
      if (this.activeBiome === 'sunnyCity') {
        f.add(this.add.rectangle(width * 0.14, 55, 92, 150, PALETTE.biomes.sunnyCity.far));
        f.add(this.add.rectangle(width * 0.86, 80, 110, 190, PALETTE.biomes.sunnyCity.far));
        m.add(this.add.rectangle(width * 0.08, 45, 72, 120, PALETTE.biomes.sunnyCity.mid));
        m.add(this.add.rectangle(width * 0.92, 70, 82, 145, PALETTE.biomes.sunnyCity.mid));
        n.add(this.add.rectangle(width * 0.03, 60, 34, 100, PALETTE.biomes.sunnyCity.near));
        n.add(this.add.rectangle(width * 0.97, 75, 38, 120, PALETTE.biomes.sunnyCity.near));
        n.add(this.add.rectangle(width * 0.11, 48, 12, 70, PALETTE.biomes.sunnyCity.near));
      } else if (this.activeBiome === 'neonNight') {
        f.add(this.add.circle(width * 0.14, 52, 28, PALETTE.biomes.neonNight.divider, 0.18));
        f.add(this.add.circle(width * 0.86, 78, 34, PALETTE.biomes.neonNight.pickup, 0.16));
        m.add(this.add.rectangle(width * 0.12, 60, 76, 120, PALETTE.biomes.neonNight.mid));
        m.add(this.add.rectangle(width * 0.88, 55, 88, 140, PALETTE.biomes.neonNight.mid));
        n.add(this.add.rectangle(width * 0.05, 70, 26, 150, PALETTE.biomes.neonNight.near));
        n.add(this.add.rectangle(width * 0.95, 55, 30, 130, PALETTE.biomes.neonNight.near));
        n.add(this.add.rectangle(width * 0.16, 70, 5, 75, PALETTE.biomes.neonNight.divider, 0.75));
        n.add(this.add.rectangle(width * 0.84, 60, 5, 95, PALETTE.biomes.neonNight.pickup, 0.7));
      } else {
        f.add(this.add.ellipse(width * 0.12, 70, 150, 105, PALETTE.biomes.jungleRuins.far));
        f.add(this.add.ellipse(width * 0.88, 85, 170, 120, PALETTE.biomes.jungleRuins.far));
        m.add(this.add.rectangle(width * 0.1, 62, 28, 145, PALETTE.biomes.jungleRuins.mid));
        m.add(this.add.rectangle(width * 0.9, 68, 32, 150, PALETTE.biomes.jungleRuins.mid));
        n.add(this.add.ellipse(width * 0.06, 70, 85, 150, PALETTE.biomes.jungleRuins.near));
        n.add(this.add.ellipse(width * 0.94, 76, 90, 160, PALETTE.biomes.jungleRuins.near));
        n.add(this.add.rectangle(width * 0.18, 65, 18, 120, PALETTE.biomes.jungleRuins.mid));
        n.add(this.add.rectangle(width * 0.82, 72, 18, 130, PALETTE.biomes.jungleRuins.mid));
      }
      f.y = y; m.y = y; n.y = y;
    }
  }

  private applyBiome(id: string, animate: boolean): void {
    if (id === this.activeBiome) return;
    this.activeBiome = id;
    this.redrawDecorations();
    const palette = PALETTE.biomes[id as keyof typeof PALETTE.biomes];
    if (animate) {
      for (const layer of [...this.far, ...this.mid, ...this.near]) {
        layer.setAlpha(0.25);
        this.tweens.add({ targets: layer, alpha: 1, duration: 700, ease: 'Quad.easeOut' });
      }
    }
    this.cameras.main.setBackgroundColor(palette.sky);
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
    if (biome.id !== this.activeBiome) this.applyBiome(biome.id, true);

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
