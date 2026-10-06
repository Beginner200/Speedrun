import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService } from '../core/saveService';

export class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);
    this.add.text(width / 2, 55, 'SETTINGS', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const save = SaveService.load();
    const rows: Array<{ key: 'sound' | 'music' | 'vibration'; label: string }> = [
      { key: 'sound', label: 'Sound Effects' },
      { key: 'music', label: 'Music' },
      { key: 'vibration', label: 'Vibration' }
    ];
    rows.forEach((row, index) => {
      const y = 150 + index * 82;
      const button = this.add.rectangle(width / 2, y, width - 42, 62, 0x142237).setInteractive({ useHandCursor: true });
      const text = this.add.text(32, y, row.label, { fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
      const state = this.add.text(width - 32, y, save.settings[row.key] ? 'ON' : 'OFF', { fontFamily: 'Arial', fontSize: '16px', color: save.settings[row.key] ? '#9fe8d1' : '#9fb4ca', fontStyle: 'bold' }).setOrigin(1, 0.5);
      button.on('pointerup', () => { const next = !SaveService.load().settings[row.key]; SaveService.setSetting(row.key, next); state.setText(next ? 'ON' : 'OFF'); state.setColor(next ? '#9fe8d1' : '#9fb4ca'); });
      void text;
    });
    this.add.text(width / 2, 430, 'Progress is stored only on this device.', { fontFamily: 'Arial', fontSize: '13px', color: '#71859a' }).setOrigin(0.5);
    this.add.text(width / 2, 468, 'No account or network connection is required.', { fontFamily: 'Arial', fontSize: '13px', color: '#71859a' }).setOrigin(0.5);
    const reset = this.add.rectangle(width / 2, 570, 220, 54, GAME_CONFIG.danger).setInteractive({ useHandCursor: true });
    this.add.text(width / 2, 570, 'RESET PROGRESS', { fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    reset.on('pointerup', () => { SaveService.reset(); this.scene.start('HomeScene'); });
    this.add.text(width / 2, height - 25, '‹ HOME', { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('HomeScene'));
  }
}
