import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService } from '../core/saveService';

export class DailyScene extends Phaser.Scene {
  constructor() { super('DailyScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);
    const today = new Date().toISOString().slice(0, 10);
    const save = SaveService.load();
    const nextDay = Math.min(7, save.dailyReward.day + 1);

    this.add.text(width / 2, 48, 'DAILY REWARD', { fontFamily: 'Arial', fontSize: '31px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, 82, 'Claim once per day • Day 7 unlocks an exclusive skin', { fontFamily: 'Arial', fontSize: '13px', color: '#9fb4ca' }).setOrigin(0.5);

    for (let day = 1; day <= 7; day++) {
      const y = 135 + (day - 1) * 72;
      const claimed = day <= save.dailyReward.day;
      const current = day === nextDay && save.dailyReward.lastClaimDate !== today;
      const reward = 20 + day * 10;
      const card = this.add.rectangle(width / 2, y, width - 36, 58, current ? GAME_CONFIG.accent : 0x142237).setStrokeStyle(2, current ? GAME_CONFIG.accent : 0x2b4057, 0.9).setInteractive({ useHandCursor: true });
      this.add.text(35, y, `DAY ${day}`, { fontFamily: 'Arial', fontSize: '16px', color: current ? '#07111f' : '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
      this.add.text(width / 2, y, day === 7 ? `+${reward} COINS  +  EXCLUSIVE SKIN` : `+${reward} COINS`, { fontFamily: 'Arial', fontSize: '14px', color: current ? '#07111f' : '#dbe7f3', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(width - 34, y, claimed ? 'CLAIMED' : current ? 'READY' : 'LOCKED', { fontFamily: 'Arial', fontSize: '12px', color: claimed ? '#9fe8d1' : current ? '#07111f' : '#71859a', fontStyle: 'bold' }).setOrigin(1, 0.5);
      if (current) card.on('pointerup', () => { SaveService.claimDailyReward(today); this.scene.restart(); });
    }

    this.add.text(width / 2, height - 54, `COINS ${SaveService.load().coins}`, { fontFamily: 'Arial', fontSize: '17px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5);
    const back = this.add.text(width / 2, height - 22, '‹ HOME', { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('HomeScene'));
  }
}
