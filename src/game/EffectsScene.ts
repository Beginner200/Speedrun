import Phaser from 'phaser';
import { PALETTE } from '../config/palette';

type FxParticle = Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle;

export class EffectsScene extends Phaser.Scene {
  private pool: FxParticle[] = [];
  private active: FxParticle[] = [];
  private speedLines: Phaser.GameObjects.Rectangle[] = [];
  private shieldBubble?: Phaser.GameObjects.Arc;
  private player?: Phaser.GameObjects.Rectangle;
  private playerX = 0;
  private playerY = 0;
  private quality: 'low' | 'medium' | 'high' = 'medium';

  constructor() { super('EffectsScene'); }

  create(): void {
    this.quality = 'medium';
    for (let i = 0; i < 70; i++) {
      const p = this.add.circle(0, 0, 4, 0xffffff).setVisible(false).setActive(false).setDepth(8);
      this.pool.push(p);
    }
    for (let i = 0; i < 12; i++) {
      const line = this.add.rectangle(0, 0, 3, 38, 0xffffff, 0.18).setVisible(false).setActive(false).setDepth(1);
      this.speedLines.push(line);
    }
    this.events.on(Phaser.Scenes.Events.UPDATE, this.updateFx, this);
  }

  setPlayer(player: Phaser.GameObjects.Rectangle): void {
    this.player = player;
  }

  setQuality(quality: 'low' | 'medium' | 'high'): void {
    this.quality = quality;
    const count = quality === 'low' ? 4 : quality === 'medium' ? 8 : 12;
    this.speedLines.forEach((line, i) => line.setVisible(i < count));
  }

  laneChange(x: number, y: number): void {
    this.burst(x, y + 24, PALETTE.ui.accent, 5, 0.55);
    this.burst(x, y + 28, 0xffffff, 3, 0.4);
  }

  coinPickup(x: number, y: number): void {
    this.burst(x, y, PALETTE.ui.accent, this.quality === 'high' ? 10 : 7, 0.9);
  }

  powerPickup(x: number, y: number, color: number): void {
    this.burst(x, y, color, this.quality === 'high' ? 12 : 8, 1.0);
    this.ring(x, y, color);
  }

  magnetPull(x: number, y: number, tx: number, ty: number): void {
    if (this.quality === 'low') return;
    const streak = this.acquire();
    streak.setFillStyle(PALETTE.ui.success).setPosition(x, y).setScale(0.6, 0.25).setAlpha(0.8).setVisible(true).setActive(true);
    this.tweens.add({ targets: streak, x: tx, y: ty, alpha: 0, duration: 140, onComplete: () => this.release(streak) });
  }

  nearMiss(x: number, y: number): void {
    this.burst(x, y, PALETTE.ui.accent, this.quality === 'high' ? 9 : 5, 0.8);
    const streak = this.acquire();
    streak.setFillStyle(PALETTE.ui.accent).setPosition(x, y - 8).setScale(11.5, 1).setAlpha(0.9).setVisible(true).setActive(true);
    this.tweens.add({ targets: streak, x: x + 55, alpha: 0, duration: 180, onComplete: () => this.release(streak) });
  }

  crash(x: number, y: number): void {
    this.burst(x, y, PALETTE.ui.danger, this.quality === 'high' ? 20 : 12, 1.2);
    this.ring(x, y, PALETTE.ui.danger, true);
    this.flash();
  }

  shieldHit(x: number, y: number): void {
    this.burst(x, y, PALETTE.ui.success, this.quality === 'high' ? 18 : 10, 1.0);
    this.ring(x, y, PALETTE.ui.success);
  }

  private burst(x: number, y: number, color: number, count: number, scale: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      const a = (Math.PI * 2 * i) / count;
      p.setFillStyle(color).setPosition(x, y).setScale(scale).setAlpha(0.95).setVisible(true).setActive(true);
      this.tweens.add({ targets: p, x: x + Math.cos(a) * (18 + Math.random() * 28), y: y + Math.sin(a) * (18 + Math.random() * 28), alpha: 0, scale: 0.15, duration: 260 + Math.random() * 140, onComplete: () => this.release(p) });
    }
  }

  private ring(x: number, y: number, color: number, heavy = false): void {
    const ring = this.add.circle(x, y, 10, color, 0).setStrokeStyle(heavy ? 5 : 3, color, 0.9).setDepth(9);
    this.tweens.add({ targets: ring, radius: heavy ? 82 : 54, alpha: 0, duration: heavy ? 320 : 260, onComplete: () => ring.destroy() });
  }

  private flash(): void {
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.28).setDepth(19);
    this.tweens.add({ targets: flash, alpha: 0, duration: 130, onComplete: () => flash.destroy() });
  }

  private acquire(): FxParticle {
    const p = this.pool.pop();
    if (p) { this.active.push(p); return p; }
    if (this.pool.length + this.active.length < 70) {
      const created = this.add.circle(0, 0, 4, 0xffffff).setDepth(8);
      this.active.push(created);
      return created;
    }
    return this.active[0] ?? this.pool[0];
  }

  private release(p: FxParticle): void {
    this.tweens.killTweensOf(p);
    p.setVisible(false).setActive(false).setAlpha(1).setScale(1);
    const index = this.active.indexOf(p);
    if (index >= 0) this.active.splice(index, 1);
    this.pool.push(p);
  }

  private updateFx(_time: number, delta: number): void {
    const play = this.scene.get('PlayScene') as unknown as { speed?: number; magnetTimer?: number; shieldTimer?: number; player?: Phaser.GameObjects.Rectangle } | undefined;
    if (!play || !this.scene.isActive('PlayScene')) return;
    if (play.player) this.setPlayer(play.player);
    if (!this.player) return;
    this.playerX = this.player.x;
    this.playerY = this.player.y;
    const speed = Number(play.speed ?? 260);
    const enabled = this.quality !== 'low' && speed > 390;
    for (let i = 0; i < this.speedLines.length; i++) {
      const line = this.speedLines[i];
      if (!enabled || i >= (this.quality === 'high' ? 12 : 7)) { line.setVisible(false); continue; }
      if (!line.visible) {
        line.setVisible(true).setActive(true);
        line.x = this.playerX + (i % 3 - 1) * 70;
        line.y = -40 - (i * 83);
      }
      line.y += speed * delta / 1000 * 1.8;
      line.alpha = 0.08 + Math.min(0.2, (speed - 390) / 650);
      if (line.y > this.scale.height + 40) line.y = -40;
    }
    const shield = Number(play.shieldTimer ?? 0) > 0;
    if (shield) {
      if (!this.shieldBubble) this.shieldBubble = this.add.circle(this.playerX, this.playerY, 38, PALETTE.ui.success, 0.08).setStrokeStyle(3, PALETTE.ui.success, 0.75).setDepth(7);
      this.shieldBubble.setPosition(this.playerX, this.playerY).setAlpha(0.42 + Math.sin(Date.now() * 0.008) * 0.12);
    } else if (this.shieldBubble) {
      this.shieldBubble.destroy();
      this.shieldBubble = undefined;
    }
  }
}
