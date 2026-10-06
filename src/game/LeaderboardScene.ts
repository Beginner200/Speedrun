import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService } from '../core/saveService';

export class LeaderboardScene extends Phaser.Scene {
  constructor() { super('LeaderboardScene'); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveService.load();
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);

    this.add.text(width / 2, 44, 'LEADERBOARD', { fontFamily: 'Arial', fontSize: '30px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, 76, 'PERSONAL TOP 10 • STORED ON THIS DEVICE', { fontFamily: 'Arial', fontSize: '11px', color: '#9fb4ca', letterSpacing: 1 }).setOrigin(0.5);

    if (!save.leaderboard.length) {
      this.add.text(width / 2, height * 0.45, 'NO SCORES YET', { fontFamily: 'Arial', fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(width / 2, height * 0.51, 'Play a run to record your first score.', { fontFamily: 'Arial', fontSize: '14px', color: '#9fb4ca' }).setOrigin(0.5);
    } else {
      save.leaderboard.forEach((entry, index) => {
        const y = 120 + index * 55;
        const fill = index === 0 ? 0x26364a : 0x142237;
        this.add.rectangle(width / 2, y, width - 36, 45, fill).setStrokeStyle(1, index === 0 ? GAME_CONFIG.accent : 0x2b4057, 0.8);
        this.add.text(34, y, `${index + 1}`, { fontFamily: 'Arial', fontSize: '17px', color: index < 3 ? '#ffd166' : '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.add.text(76, y, entry.date, { fontFamily: 'Arial', fontSize: '13px', color: '#9fb4ca' }).setOrigin(0, 0.5);
        this.add.text(width - 30, y, `${entry.score}`, { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(1, 0.5);
      });
    }

    const back = this.add.text(width / 2, height - 30, '‹ HOME', { fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('HomeScene'));
  }
}
