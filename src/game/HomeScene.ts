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
    this.add.text(width / 2, height * 0.09, 'DASH DODGE', { fontFamily: 'Arial', fontSize: '40px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.145, '3-LANE ENDLESS RUN', { fontFamily: 'Arial', fontSize: '14px', color: '#9fb4ca', letterSpacing: 2 }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.245, 54, 70, skin.color).setStrokeStyle(3, 0xffffff, 0.9);
    this.add.text(width / 2, height * 0.335, `BEST  ${save.bestScore}`, { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.375, `COINS  ${save.coins}`, { fontFamily: 'Arial', fontSize: '17px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5);

    this.button(width / 2, height * 0.45, 220, 56, 'PLAY', GAME_CONFIG.accent, '#07111f', () => this.scene.start(save.tutorialSeen ? 'PlayScene' : 'TutorialScene'));
    this.button(width / 2, height * 0.525, 220, 44, 'DAILY REWARD', GAME_CONFIG.shield, '#07111f', () => this.scene.start('DailyScene'));
    this.button(width / 2, height * 0.595, 220, 44, 'MISSIONS', GAME_CONFIG.magnet, '#07111f', () => this.scene.start('MissionScene'));
    this.button(width / 2, height * 0.665, 220, 44, 'LEADERBOARD', 0x3c5876, '#ffffff', () => this.scene.start('LeaderboardScene'));
    this.button(width / 2, height * 0.735, 220, 44, 'SHOP', GAME_CONFIG.coin, '#07111f', () => this.scene.start('ShopScene'));
    this.button(width / 2, height * 0.805, 220, 44, 'SETTINGS', 0x2b4057, '#ffffff', () => this.scene.start('SettingsScene'));
    this.add.text(width / 2, height * 0.91, 'Swipe or tap left/right to change lanes', { fontFamily: 'Arial', fontSize: '13px', color: '#9fb4ca' }).setOrigin(0.5);
  }

  private button(x: number, y: number, w: number, h: number, label: string, fill: number, textColor: string, onClick: () => void): void {
    const button = this.add.rectangle(x, y, w, h, fill).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '15px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);
    button.on('pointerup', onClick);
    button.on('pointerdown', () => button.setAlpha(0.8));
    button.on('pointerout', () => button.setAlpha(1));
    button.on('pointerup', () => button.setAlpha(1));
  }
}
