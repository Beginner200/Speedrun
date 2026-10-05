import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService, getSelectedSkin } from '../core/saveService';

export class HomeScene extends Phaser.Scene {
  constructor() { super('HomeScene'); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveService.load();
    const skin = getSelectedSkin();
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);

    this.add.rectangle(width / 2, height / 2, GAME_CONFIG.roadWidth, height, GAME_CONFIG.road);
    this.add.text(width / 2, height * 0.15, 'DASH DODGE', { fontFamily: 'Arial', fontSize: '42px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.205, '3-LANE ENDLESS RUN', { fontFamily: 'Arial', fontSize: '14px', color: '#9fb4ca', letterSpacing: 2 }).setOrigin(0.5);

    this.add.rectangle(width / 2, height * 0.34, 54, 70, skin.color).setStrokeStyle(3, 0xffffff, 0.9);
    this.add.text(width / 2, height * 0.43, `BEST  ${save.bestScore}`, { fontFamily: 'Arial', fontSize: '19px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.475, `COINS  ${save.coins}`, { fontFamily: 'Arial', fontSize: '18px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5);

    this.button(width / 2, height * 0.59, 220, 64, 'PLAY', GAME_CONFIG.accent, '#07111f', () => this.scene.start('PlayScene'));
    this.button(width / 2, height * 0.69, 220, 54, 'SHOP', GAME_CONFIG.shield, '#07111f', () => this.scene.start('ShopScene'));
    this.button(width / 2, height * 0.78, 220, 54, 'RESET PROGRESS', GAME_CONFIG.danger, '#ffffff', () => {
      SaveService.reset();
      this.scene.restart();
    });
    this.add.text(width / 2, height * 0.9, 'Swipe or tap left/right to change lanes', { fontFamily: 'Arial', fontSize: '14px', color: '#9fb4ca' }).setOrigin(0.5);
  }

  private button(x: number, y: number, w: number, h: number, label: string, fill: number, textColor: string, onClick: () => void): void {
    const button = this.add.rectangle(x, y, w, h, fill).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '18px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);
    button.on('pointerup', onClick);
    button.on('pointerdown', () => button.setAlpha(0.8));
    button.on('pointerout', () => button.setAlpha(1));
    button.on('pointerup', () => button.setAlpha(1));
  }
}
