import Phaser from 'phaser';
import { HomeScene } from './game/HomeScene';
import { PlayScene } from './game/PlayScene';
import { ShopScene } from './game/ShopScene';
import { DailyScene } from './game/DailyScene';
import { MissionScene } from './game/MissionScene';
import { LeaderboardScene } from './game/LeaderboardScene';
import { SettingsScene } from './game/SettingsScene';
import { TutorialScene } from './game/TutorialScene';
import { VisualOverlayScene } from './game/VisualOverlayScene';
import { WorldVisualScene } from './game/WorldVisualScene';
import { EffectsScene } from './game/EffectsScene';
import './styles.css';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 390,
  height: 844,
  backgroundColor: '#07111f',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 390, height: 844 },
  input: { activePointers: 2 },
  scene: [HomeScene, PlayScene, ShopScene, DailyScene, MissionScene, LeaderboardScene, SettingsScene, TutorialScene, VisualOverlayScene, WorldVisualScene, EffectsScene],
  render: { antialias: true, roundPixels: true }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
