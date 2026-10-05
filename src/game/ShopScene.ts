import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { SaveService, SKINS } from '../core/saveService';

export class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);
    this.add.text(18, 20, 'SHOP', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' });
    this.add.text(width - 18, 28, `COINS ${SaveService.load().coins}`, { fontFamily: 'Arial', fontSize: '17px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(1, 0);

    this.add.text(width / 2, 68, 'COSMETIC SKINS', { fontFamily: 'Arial', fontSize: '14px', color: '#9fb4ca', letterSpacing: 1 }).setOrigin(0.5);
    const startY = 125;
    const rowH = 78;
    SKINS.forEach((skin, index) => {
      const y = startY + index * rowH;
      const data = SaveService.load();
      const owned = data.ownedSkins.includes(skin.id);
      const selected = data.selectedSkin === skin.id;
      const card = this.add.rectangle(width / 2, y, width - 36, 66, 0x142237).setStrokeStyle(2, selected ? GAME_CONFIG.accent : 0x2b4057, selected ? 1 : 0.7).setInteractive({ useHandCursor: true });
      this.add.rectangle(42, y, 34, 44, skin.color).setStrokeStyle(2, 0xffffff, 0.75);
      this.add.text(68, y - 15, skin.name, { fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', fontStyle: 'bold' });
      const action = selected ? 'EQUIPPED' : owned ? 'EQUIP' : `${skin.price} COINS`;
      this.add.text(width - 28, y, action, { fontFamily: 'Arial', fontSize: '13px', color: selected ? '#ffd166' : '#dbe7f3', fontStyle: 'bold' }).setOrigin(1, 0.5);
      card.on('pointerup', () => {
        const result = SaveService.buyOrSelectSkin(skin.id);
        if (result.ok) this.scene.restart();
      });
    });

    const back = this.add.text(width / 2, height - 28, '‹ HOME', { fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('HomeScene'));
  }
}
