import Phaser from 'phaser';
import { GAME_CONFIG as C } from './config/gameConfig';
import './style.css';

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private lane = 1;
  private targetLane = 1;
  private road!: Phaser.GameObjects.Rectangle;
  private swipeStartX = 0;
  private running = false;
  private distance = 0;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() { super('Game'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(C.colors.bg);
    this.road = this.add.rectangle(width / 2, height / 2, Math.min(width * .94, 520), height, C.colors.road).setDepth(0);
    const roadLeft = this.road.x - this.road.width / 2;
    for (let i = 1; i < C.lanes; i++) {
      this.add.rectangle(roadLeft + (this.road.width / C.lanes) * i, height / 2, 2, height, C.colors.lane).setDepth(1);
    }
    this.player = this.add.circle(this.laneX(this.lane), height * C.playerYRatio, C.playerRadius, C.colors.player).setDepth(5);
    this.scoreText = this.add.text(16, 18, '0', { fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setDepth(10);
    this.add.text(width / 2, 52, 'SWIPE OR TAP LEFT / RIGHT', { fontFamily: 'Arial', fontSize: '13px', color: '#9db4d0' }).setOrigin(.5).setDepth(10);
    this.running = true;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.swipeStartX = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const dx = p.x - this.swipeStartX;
      if (Math.abs(dx) > 18) this.changeLane(dx > 0 ? 1 : -1);
      else this.changeLane(p.x < width / 2 ? -1 : 1);
    });
  }

  private laneX(lane: number) {
    const left = this.road.x - this.road.width / 2;
    return left + (this.road.width / C.lanes) * (lane + .5);
  }

  private changeLane(delta: number) {
    this.targetLane = Phaser.Math.Clamp(this.targetLane + delta, 0, C.lanes - 1);
    if (this.targetLane === this.lane) return;
    this.lane = this.targetLane;
    this.tweens.killTweensOf(this.player);
    this.tweens.add({ targets: this.player, x: this.laneX(this.lane), duration: C.laneChangeMs, ease: 'Quad.Out' });
  }

  update(_time: number, delta: number) {
    if (!this.running) return;
    this.distance += C.worldSpeed * delta / 1000;
    this.scoreText.setText(String(Math.floor(this.distance)));
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 390,
  height: 844,
  backgroundColor: '#07111f',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, roundPixels: true },
  scene: [GameScene],
});
