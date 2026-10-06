import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService } from '../core/saveService';

export class TutorialScene extends Phaser.Scene {
  private startX: number | null = null;
  private finished = false;

  constructor() { super('TutorialScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);
    this.add.rectangle(width / 2, height / 2, GAME_CONFIG.roadWidth, height, GAME_CONFIG.road);
    this.add.text(width / 2, 105, 'HOW TO PLAY', { fontFamily: 'Arial', fontSize: '31px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, 160, 'SWIPE LEFT / RIGHT', { fontFamily: 'Arial', fontSize: '22px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, 198, 'or tap the side of the screen', { fontFamily: 'Arial', fontSize: '14px', color: '#9fb4ca' }).setOrigin(0.5);
    const player = this.add.rectangle(width / 2, height * 0.48, 42, 58, GAME_CONFIG.player).setStrokeStyle(3, 0xffffff, 0.9);
    this.add.text(width / 2, height * 0.58, 'DODGE obstacles • COLLECT coins', { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.63, 'The speed increases as you survive.', { fontFamily: 'Arial', fontSize: '13px', color: '#9fb4ca' }).setOrigin(0.5);
    this.add.text(width / 2, height - 115, 'TRY A SWIPE TO CONTINUE', { fontFamily: 'Arial', fontSize: '16px', color: '#9fe8d1', fontStyle: 'bold' }).setOrigin(0.5);
    const skip = this.add.text(width / 2, height - 60, 'SKIP TUTORIAL', { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    skip.on('pointerup', () => this.finish());
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.startX = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.startX === null || this.finished) return;
      const dx = p.x - this.startX; this.startX = null;
      if (Math.abs(dx) >= 18) {
        this.tweens.add({ targets: player, x: Phaser.Math.Clamp(player.x + (dx > 0 ? 70 : -70), 95, width - 95), duration: 120, yoyo: true });
        this.finish();
      }
    });
    this.time.delayedCall(10_000, () => this.finish());
  }

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    SaveService.markTutorialSeen();
    this.scene.start('PlayScene');
  }
}
