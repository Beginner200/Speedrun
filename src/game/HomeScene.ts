import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService, getSelectedSkin } from '../core/saveService';

export class HomeScene extends Phaser.Scene {
  constructor() { super('HomeScene'); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveService.load();
    const skin = getSelectedSkin();
    const today = new Date().toISOString().slice(0, 10);
    SaveService.ensureMissions(today);
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);

    this.add.rectangle(width / 2, height / 2, GAME_CONFIG.roadWidth, height, GAME_CONFIG.road);
    this.add.text(width / 2, height * 0.11, 'DASH DODGE', { fontFamily: 'Arial', fontSize: '40px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.165, '3-LANE ENDLESS RUN', { fontFamily: 'Arial', fontSize: '14px', color: '#9fb4ca', letterSpacing: 2 }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.27, 54, 70, skin.color).setStrokeStyle(3, 0xffffff, 0.9);
    this.add.text(width / 2, height * 0.355, `BEST  ${save.bestScore}`, { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.395, `COINS  ${save.coins}`, { fontFamily: 'Arial', fontSize: '17px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5);

    this.button(width / 2, height * 0.49, 220, 58, 'PLAY', GAME_CONFIG.accent, '#07111f', () => {
      this.scene.start(save.tutorialSeen ? 'PlayScene' : 'TutorialScene');
    });
    this.button(width / 2, height * 0.575, 220, 48, 'DAILY REWARD', GAME_CONFIG.shield, '#07111f', () => this.scene.start('DailyScene'));
    this.button(width / 2, height * 0.65, 220, 48, 'MISSIONS', GAME_CONFIG.magnet, '#07111f', () => this.scene.start('MissionScene'));
    this.button(width / 2, height * 0.725, 220, 48, 'SHOP', GAME_CONFIG.coin, '#07111f', () => this.scene.start('ShopScene'));
    this.button(width / 2, height * 0.80, 220, 48, 'SETTINGS', 0x2b4057, '#ffffff', () => this.scene.start('SettingsScene'));
    this.add.text(width / 2, height * 0.905, 'Swipe or tap left/right to change lanes', { fontFamily: 'Arial', fontSize: '13px', color: '#9fb4ca' }).setOrigin(0.5);
  }

  private button(x: number, y: number, w: number, h: number, label: string, fill: number, textColor: string, onClick: () => void): void {
    const button = this.add.rectangle(x, y, w, h, fill).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '16px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);
    button.on('pointerup', onClick);
    button.on('pointerdown', () => button.setAlpha(0.8));
    button.on('pointerout', () => button.setAlpha(1));
    button.on('pointerup', () => button.setAlpha(1));
  }
}
