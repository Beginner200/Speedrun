import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { MissionDefinition, SaveService } from '../core/saveService';

export class MissionScene extends Phaser.Scene {
  constructor() { super('MissionScene'); }

  create(): void {
    const { width, height } = this.scale;
    const today = new Date().toISOString().slice(0, 10);
    const missions = SaveService.ensureMissions(today);
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);
    this.add.text(width / 2, 50, 'MISSIONS', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, 82, 'Complete objectives to earn bonus coins', { fontFamily: 'Arial', fontSize: '13px', color: '#9fb4ca' }).setOrigin(0.5);

    const save = SaveService.load();
    missions.forEach((mission: MissionDefinition, index) => {
      const y = 180 + index * 145;
      const progress = SaveService.getMissionProgress(save, mission);
      const item = save.missions.items.find((entry) => entry.id === mission.id);
      const claimed = item?.claimed === true;
      const complete = progress >= mission.target;
      this.add.rectangle(width / 2, y, width - 36, 112, 0x142237).setStrokeStyle(2, complete ? GAME_CONFIG.accent : 0x2b4057, 0.8);
      this.add.text(32, y - 35, mission.title, { fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', fontStyle: 'bold' });
      this.add.text(32, y - 7, `${progress} / ${mission.target}`, { fontFamily: 'Arial', fontSize: '15px', color: '#9fb4ca' });
      this.add.text(32, y + 23, `REWARD ${mission.reward} COINS`, { fontFamily: 'Arial', fontSize: '13px', color: '#ffd166', fontStyle: 'bold' });
      const button = this.add.rectangle(width - 78, y + 5, 95, 42, claimed ? 0x30445a : complete ? GAME_CONFIG.accent : 0x25374b).setInteractive({ useHandCursor: complete && !claimed });
      this.add.text(width - 78, y + 5, claimed ? 'CLAIMED' : complete ? 'CLAIM' : 'LOCKED', { fontFamily: 'Arial', fontSize: '11px', color: complete && !claimed ? '#07111f' : '#9fb4ca', fontStyle: 'bold' }).setOrigin(0.5);
      if (complete && !claimed) button.on('pointerup', () => { SaveService.claimMission(mission.id); this.scene.restart(); });
    });

    this.add.text(width / 2, height - 25, '‹ HOME', { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('HomeScene'));
  }
}
