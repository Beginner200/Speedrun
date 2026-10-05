import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { buildSafePattern } from '../core/obstacle';

type Obstacle = Phaser.GameObjects.Rectangle & { lane: number };

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private targetLane = 1;
  private laneX: number[] = [];
  private laneLines: Phaser.GameObjects.Rectangle[] = [];
  private obstacles: Obstacle[] = [];
  private speed = GAME_CONFIG.worldSpeed;
  private distance = 0;
  private score = 0;
  private bestScore = 0;
  private distanceText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private gameOverPanel!: Phaser.GameObjects.Container;
  private inputCooldown = 0;
  private spawnTimer = GAME_CONFIG.obstacleSpawnStartMs;
  private touchStartX: number | null = null;
  private isGameOver = false;

  constructor() { super('PlayScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.isGameOver = false;
    this.speed = GAME_CONFIG.worldSpeed;
    this.distance = 0;
    this.score = 0;
    this.spawnTimer = GAME_CONFIG.obstacleSpawnStartMs;
    this.targetLane = 1;
    this.laneX = this.getLanePositions(width);
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);

    this.add.rectangle(width / 2, height / 2, GAME_CONFIG.roadWidth, height, GAME_CONFIG.road).setDepth(0);
    this.laneLines.length = 0;
    for (let i = 0; i < 2; i++) {
      const x = (this.laneX[i] + this.laneX[i + 1]) / 2;
      for (let y = -40; y < height + 40; y += 70) {
        this.laneLines.push(this.add.rectangle(x, y, 4, 38, GAME_CONFIG.laneLine).setDepth(1));
      }
    }

    this.player = this.add.rectangle(
      this.laneX[this.targetLane], height * GAME_CONFIG.playerYRatio,
      42, 58, GAME_CONFIG.player
    ).setDepth(3).setStrokeStyle(3, 0xffffff, 0.9);

    this.distanceText = this.add.text(18, 18, 'DIST 0m', { fontFamily: 'Arial', fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setDepth(10);
    this.scoreText = this.add.text(width - 18, 18, 'SCORE 0', { fontFamily: 'Arial', fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setOrigin(1, 0).setDepth(10);
    this.speedText = this.add.text(18, 46, 'SPEED 1.0x', { fontFamily: 'Arial', fontSize: '15px', color: '#9fb4ca' }).setDepth(10);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (!this.isGameOver) this.touchStartX = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.isGameOver || this.touchStartX === null) return;
      const dx = p.x - this.touchStartX;
      this.touchStartX = null;
      if (Math.abs(dx) > 22) this.changeLane(dx > 0 ? 1 : -1);
      else this.changeLane(p.x < width / 2 ? -1 : 1);
    });

    this.input.keyboard?.on('keydown-LEFT', () => this.changeLane(-1));
    this.input.keyboard?.on('keydown-A', () => this.changeLane(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeLane(1));
    this.input.keyboard?.on('keydown-D', () => this.changeLane(1));
    this.input.keyboard?.on('keydown-R', () => { if (this.isGameOver) this.restart(); });
  }

  update(_: number, delta: number): void {
    if (this.isGameOver) return;
    const dt = Math.min(delta, 50) / 1000;
    this.inputCooldown = Math.max(0, this.inputCooldown - delta);
    this.speed = Math.min(GAME_CONFIG.maxWorldSpeed, this.speed + GAME_CONFIG.speedRampPerSecond * dt);
    this.distance += this.speed * dt / 10;
    this.score = Math.floor(this.distance * GAME_CONFIG.scorePerMeter);

    for (const line of this.laneLines) {
      line.y += this.speed * dt;
      if (line.y > this.scale.height + 25) line.y -= Math.ceil((this.scale.height + 50) / 70) * 70;
    }

    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnObstaclePattern();
      const progress = Math.min(1, this.speed / GAME_CONFIG.maxWorldSpeed);
      this.spawnTimer = Phaser.Math.Linear(GAME_CONFIG.obstacleSpawnStartMs, GAME_CONFIG.obstacleSpawnMinMs, progress);
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.y += this.speed * dt;
      if (obstacle.y > this.scale.height + 80) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
        continue;
      }
      if (this.isColliding(this.player, obstacle)) {
        this.endRun();
        break;
      }
    }

    this.distanceText.setText(`DIST ${Math.floor(this.distance)}m`);
    this.scoreText.setText(`SCORE ${this.score}`);
    this.speedText.setText(`SPEED ${(this.speed / GAME_CONFIG.worldSpeed).toFixed(1)}x`);
  }

  private spawnObstaclePattern(): void {
    const pattern = buildSafePattern(GAME_CONFIG.lanes);
    const spawnY = -60;
    for (const lane of pattern.blockedLanes) {
      const obstacle = this.add.rectangle(
        this.laneX[lane], spawnY, GAME_CONFIG.obstacleWidth, GAME_CONFIG.obstacleHeight, GAME_CONFIG.obstacle
      ).setDepth(2).setStrokeStyle(2, 0xffffff, 0.45) as Obstacle;
      obstacle.lane = lane;
      this.obstacles.push(obstacle);
    }
  }

  private isColliding(player: Phaser.GameObjects.Rectangle, obstacle: Obstacle): boolean {
    const px = player.x;
    const py = player.y;
    return Math.abs(px - obstacle.x) < (player.width + obstacle.width) * 0.44 &&
      Math.abs(py - obstacle.y) < (player.height + obstacle.height) * 0.44;
  }

  private endRun(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.bestScore = Math.max(this.bestScore, this.score);
    this.cameras.main.shake(180, 0.008);
    this.tweens.add({ targets: this, speed: this.speed, duration: 250, ease: 'Quad.easeOut' });

    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, GAME_CONFIG.overlay, 0.78).setDepth(20);
    const title = this.add.text(width / 2, height * 0.36, 'RUN OVER', { fontFamily: 'Arial', fontSize: '38px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    const result = this.add.text(width / 2, height * 0.44, `SCORE  ${this.score}\nBEST  ${this.bestScore}`, { fontFamily: 'Arial', fontSize: '22px', color: '#9fe8d1', align: 'center', lineSpacing: 8 }).setOrigin(0.5).setDepth(21);
    const button = this.add.rectangle(width / 2, height * 0.57, 190, 62, GAME_CONFIG.accent).setDepth(21).setInteractive({ useHandCursor: true });
    const label = this.add.text(width / 2, height * 0.57, 'PLAY AGAIN', { fontFamily: 'Arial', fontSize: '19px', color: '#07111f', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22);
    button.on('pointerup', () => this.restart());
    this.gameOverPanel = this.add.container(0, 0, [overlay, title, result, button, label]).setDepth(20);
  }

  private restart(): void {
    this.scene.restart();
  }

  private changeLane(direction: -1 | 1): void {
    if (this.isGameOver || this.inputCooldown > 0) return;
    const next = Phaser.Math.Clamp(this.targetLane + direction, 0, GAME_CONFIG.lanes - 1);
    if (next === this.targetLane) return;
    this.targetLane = next;
    this.inputCooldown = GAME_CONFIG.laneInputBufferMs;
    this.tweens.add({ targets: this.player, x: this.laneX[next], duration: GAME_CONFIG.laneTweenMs, ease: 'Sine.easeOut' });
  }

  private getLanePositions(width: number): number[] {
    const left = (width - GAME_CONFIG.roadWidth) / 2;
    const laneWidth = GAME_CONFIG.roadWidth / GAME_CONFIG.lanes;
    return Array.from({ length: GAME_CONFIG.lanes }, (_, i) => left + laneWidth * (i + 0.5));
  }
}
