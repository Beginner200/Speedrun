import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService } from '../core/saveService';

export class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);
    this.add.text(width / 2, 50, 'SETTINGS', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const save = SaveService.load();
    const rows: Array<{ key: 'sound' | 'music' | 'vibration'; label: string }> = [
      { key: 'sound', label: 'Sound Effects' },
      { key: 'music', label: 'Music' },
      { key: 'vibration', label: 'Vibration' }
    ];
    rows.forEach((row, index) => {
      const y = 130 + index * 68;
      const button = this.add.rectangle(width / 2, y, width - 42, 54, 0x142237).setInteractive({ useHandCursor: true });
      this.add.text(32, y, row.label, { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
      const state = this.add.text(width - 32, y, save.settings[row.key] ? 'ON' : 'OFF', { fontFamily: 'Arial', fontSize: '15px', color: save.settings[row.key] ? '#9fe8d1' : '#9fb4ca', fontStyle: 'bold' }).setOrigin(1, 0.5);
      button.on('pointerup', () => {
        const next = !SaveService.load().settings[row.key];
        SaveService.setSetting(row.key, next);
        state.setText(next ? 'ON' : 'OFF');
        state.setColor(next ? '#9fe8d1' : '#9fb4ca');
      });
    });
    this.add.text(width / 2, 350, 'Privacy', { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, 384, 'Dash Dodge works offline. Game progress and scores\nstay on this device. No account is required.', { fontFamily: 'Arial', fontSize: '13px', color: '#9fb4ca', align: 'center', lineSpacing: 5 }).setOrigin(0.5);
    const privacy = this.add.text(width / 2, 445, 'VIEW PRIVACY NOTICE', { fontFamily: 'Arial', fontSize: '14px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    privacy.on('pointerup', () => this.showPrivacyNotice());
    const reset = this.add.rectangle(width / 2, 540, 220, 54, GAME_CONFIG.danger).setInteractive({ useHandCursor: true });
    this.add.text(width / 2, 540, 'RESET PROGRESS', { fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    reset.on('pointerup', () => { SaveService.reset(); this.scene.start('HomeScene'); });
    this.add.text(width / 2, height - 25, '‹ HOME', { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('HomeScene'));
  }

  private showPrivacyNotice(): void {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, GAME_CONFIG.overlay, 0.94).setDepth(30);
    const panel = this.add.rectangle(width / 2, height / 2, width - 38, 470, 0x142237).setDepth(31).setStrokeStyle(2, GAME_CONFIG.accent, 0.8);
    const title = this.add.text(width / 2, height * 0.27, 'PRIVACY NOTICE', { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(32);
    const body = this.add.text(width / 2, height * 0.47, 'Dash Dodge is designed to work offline.\n\nYour coins, scores, settings, missions and\nother progress are saved locally on your device.\n\nThe game does not require an account and\ndoes not send gameplay data to a server.\n\nReset Progress removes the local game save.', { fontFamily: 'Arial', fontSize: '14px', color: '#dbe7f3', align: 'center', lineSpacing: 8, wordWrap: { width: width - 70 } }).setOrigin(0.5).setDepth(32);
    const close = this.add.text(width / 2, height * 0.70, 'CLOSE', { fontFamily: 'Arial', fontSize: '16px', color: '#07111f', fontStyle: 'bold', backgroundColor: '#ffd166', padding: { left: 28, right: 28, top: 12, bottom: 12 } }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });
    close.on('pointerup', () => [overlay, panel, title, body, close].forEach(item => item.destroy()));
  }
}
