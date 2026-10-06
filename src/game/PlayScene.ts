import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { buildSafePattern } from '../core/obstacle';
import { SaveService, getSelectedSkin } from '../core/saveService';

type Obstacle = Phaser.GameObjects.Rectangle & { lane: number; wide?: boolean };
type Pickup = Phaser.GameObjects.Arc & { kind: 'coin' | 'shield' | 'magnet'; lane: number; value: number };

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private targetLane = 1;
  private laneX: number[] = [];
  private laneLines: Phaser.GameObjects.Rectangle[] = [];
  private obstacles: Obstacle[] = [];
  private pickups: Pickup[] = [];
  private speed: number = GAME_CONFIG.worldSpeed;
  private distance = 0;
  private score = 0;
  private scoreBonus = 0;
  private bestScore = 0;
  private coins = 0;
  private combo = 0;
  private comboTimer = 0;
  private shieldTimer = 0;
  private magnetTimer = 0;
  private reviveInvulnerabilityTimer = 0;
  private nearMissCooldown = 0;
  private distanceText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private gameOverPanel!: Phaser.GameObjects.Container;
  private inputCooldown = 0;
  private spawnTimer: number = GAME_CONFIG.obstacleSpawnStartMs;
  private touchStartX: number | null = null;
  private isGameOver = false;
  private runSettled = false;
  private reviveUsed = false;

  constructor() { super('PlayScene'); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveService.load();
    const selectedSkin = getSelectedSkin();
    this.isGameOver = false;
    this.runSettled = false;
    this.reviveUsed = false;
    this.speed = GAME_CONFIG.worldSpeed;
    this.distance = 0;
    this.score = 0;
    this.scoreBonus = 0;
    this.bestScore = save.bestScore;
    this.coins = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.shieldTimer = 0;
    this.magnetTimer = 0;
    this.reviveInvulnerabilityTimer = 0;
    this.nearMissCooldown = 0;
    this.spawnTimer = GAME_CONFIG.obstacleSpawnStartMs;
    this.targetLane = 1;
    this.obstacles.length = 0;
    this.pickups.length = 0;
    this.laneX = this.getLanePositions(width);
    this.cameras.main.setBackgroundColor(GAME_CONFIG.background);

    this.add.rectangle(width / 2, height / 2, GAME_CONFIG.roadWidth, height, GAME_CONFIG.road).setDepth(0);
    this.laneLines.length = 0;
    for (let i = 0; i < 2; i++) {
      const x = (this.laneX[i] + this.laneX[i + 1]) / 2;
      for (let y = -40; y < height + 40; y += 70) this.laneLines.push(this.add.rectangle(x, y, 4, 38, GAME_CONFIG.laneLine).setDepth(1));
    }

    this.player = this.add.rectangle(this.laneX[this.targetLane], height * GAME_CONFIG.playerYRatio, 42, 58, selectedSkin.color).setDepth(3).setStrokeStyle(3, 0xffffff, 0.9);
    this.distanceText = this.add.text(18, 18, 'DIST 0m', { fontFamily: 'Arial', fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setDepth(10);
    this.scoreText = this.add.text(width - 18, 18, 'SCORE 0', { fontFamily: 'Arial', fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setOrigin(1, 0).setDepth(10);
    this.speedText = this.add.text(18, 46, 'SPEED 1.0x', { fontFamily: 'Arial', fontSize: '15px', color: '#9fb4ca' }).setDepth(10);
    this.powerText = this.add.text(width - 18, 48, '', { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', align: 'right' }).setOrigin(1, 0).setDepth(10);
    this.comboText = this.add.text(width / 2, 92, '', { fontFamily: 'Arial', fontSize: '19px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (!this.isGameOver) this.touchStartX = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.isGameOver || this.touchStartX === null) return;
      const dx = p.x - this.touchStartX; this.touchStartX = null;
      if (Math.abs(dx) > 22) this.changeLane(dx > 0 ? 1 : -1); else this.changeLane(p.x < width / 2 ? -1 : 1);
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
    this.comboTimer = Math.max(0, this.comboTimer - delta);
    this.nearMissCooldown = Math.max(0, this.nearMissCooldown - delta);
    this.shieldTimer = Math.max(0, this.shieldTimer - delta);
    this.magnetTimer = Math.max(0, this.magnetTimer - delta);
    this.reviveInvulnerabilityTimer = Math.max(0, this.reviveInvulnerabilityTimer - delta);
    if (this.comboTimer === 0) this.combo = 0;

    this.speed = Math.min(GAME_CONFIG.maxWorldSpeed, this.speed + GAME_CONFIG.speedRampPerSecond * dt);
    this.distance += this.speed * dt / 10;
    this.score = Math.floor(this.distance * GAME_CONFIG.scorePerMeter) + this.scoreBonus + this.coins * GAME_CONFIG.coinScoreValue;

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

    this.moveObstacles(dt);
    this.movePickups(dt);
    this.updateHud();
  }

  private spawnObstaclePattern(): void {
    const pattern = buildSafePattern(GAME_CONFIG.lanes);
    const spawnY = -60;
    for (const lane of pattern.blockedLanes) {
      const obstacle = this.add.rectangle(this.laneX[lane], spawnY, GAME_CONFIG.obstacleWidth, GAME_CONFIG.obstacleHeight, pattern.blockedLanes.length > 1 ? GAME_CONFIG.obstacleWide : GAME_CONFIG.obstacle).setDepth(2).setStrokeStyle(2, 0xffffff, 0.45) as Obstacle;
      obstacle.lane = lane;
      obstacle.wide = pattern.blockedLanes.length > 1;
      this.obstacles.push(obstacle);
    }
    if (Math.random() < 0.72) this.spawnCoinOnSafeLane(pattern.blockedLanes, spawnY - 95);
    if (Math.random() < GAME_CONFIG.powerUpSpawnChance) this.spawnPowerUp(pattern.blockedLanes, spawnY - 155);
  }

  private spawnCoinOnSafeLane(blocked: number[], y: number): void {
    const safe = this.safeLane(blocked);
    const coin = this.add.circle(this.laneX[safe], y, 11, GAME_CONFIG.coin).setDepth(2).setStrokeStyle(2, 0xffffff, 0.75) as Pickup;
    coin.kind = 'coin'; coin.lane = safe; coin.value = GAME_CONFIG.coinValue; this.pickups.push(coin);
  }

  private spawnPowerUp(blocked: number[], y: number): void {
    const safe = this.safeLane(blocked);
    const kind = Math.random() < 0.5 ? 'shield' : 'magnet';
    const color = kind === 'shield' ? GAME_CONFIG.shield : GAME_CONFIG.magnet;
    const pickup = this.add.circle(this.laneX[safe], y, 14, color).setDepth(2).setStrokeStyle(3, 0xffffff, 0.9) as Pickup;
    pickup.kind = kind; pickup.lane = safe; pickup.value = 1; this.pickups.push(pickup);
  }

  private moveObstacles(dt: number): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.y += this.speed * dt;
      if (obstacle.y > this.scale.height + 80) { obstacle.destroy(); this.obstacles.splice(i, 1); continue; }
      if (this.reviveInvulnerabilityTimer <= 0 && this.isColliding(this.player, obstacle)) {
        if (this.shieldTimer > 0) { this.shieldTimer = 0; this.flashPlayer(); obstacle.destroy(); this.obstacles.splice(i, 1); continue; }
        this.endRun(); return;
      }
      const near = Math.abs(this.player.x - obstacle.x) < 62 && Math.abs(this.player.y - obstacle.y) < 68;
      const passed = obstacle.y > this.player.y + 30;
      if (near && passed && this.nearMissCooldown === 0) this.addNearMiss();
    }
  }

  private movePickups(dt: number): void {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      pickup.y += this.speed * dt;
      const dx = this.player.x - pickup.x;
      const dy = this.player.y - pickup.y;
      const range = this.magnetTimer > 0 && pickup.kind === 'coin' ? GAME_CONFIG.magnetRange : 28;
      if (Math.abs(dx) < range && Math.abs(dy) < range) {
        if (pickup.kind === 'magnet') this.magnetTimer = GAME_CONFIG.magnetDurationMs;
        else if (pickup.kind === 'shield') this.shieldTimer = GAME_CONFIG.shieldDurationMs;
        else this.coins += pickup.value;
        this.collectFeedback(pickup);
        pickup.destroy(); this.pickups.splice(i, 1); continue;
      }
      if (pickup.y > this.scale.height + 60) { pickup.destroy(); this.pickups.splice(i, 1); }
    }
  }

  private addNearMiss(): void {
    this.nearMissCooldown = 300;
    this.combo = Math.min(9, this.combo + 1);
    this.comboTimer = 1800;
    this.scoreBonus += GAME_CONFIG.nearMissScore * this.combo;
    const popup = this.add.text(this.player.x, this.player.y - 48, this.combo > 1 ? `NEAR MISS x${this.combo}` : 'NEAR MISS!', { fontFamily: 'Arial', fontSize: '16px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: popup, y: popup.y - 32, alpha: 0, duration: 500, onComplete: () => popup.destroy() });
  }

  private collectFeedback(pickup: Pickup): void {
    const label = pickup.kind === 'coin' ? '+1 COIN' : pickup.kind === 'shield' ? 'SHIELD!' : 'MAGNET 8s';
    const text = this.add.text(pickup.x, pickup.y, label, { fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: text, y: text.y - 30, alpha: 0, duration: 450, onComplete: () => text.destroy() });
  }

  private flashPlayer(): void {
    this.tweens.add({ targets: this.player, alpha: 0.2, duration: 70, yoyo: true, repeat: 3 });
    this.cameras.main.shake(120, 0.004);
  }

  private isColliding(player: Phaser.GameObjects.Rectangle, obstacle: Obstacle): boolean {
    return Math.abs(player.x - obstacle.x) < (player.width + obstacle.width) * 0.44 && Math.abs(player.y - obstacle.y) < (player.height + obstacle.height) * 0.44;
  }

  private endRun(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.score = Math.floor(this.distance * GAME_CONFIG.scorePerMeter) + this.scoreBonus + this.coins * GAME_CONFIG.coinScoreValue;
    this.settleRun();
    this.cameras.main.shake(180, 0.008);
    this.showGameOverPanel();
  }

  private settleRun(): void {
    if (this.runSettled) return;
    this.runSettled = true;
    const data = SaveService.setBestScore(this.score);
    this.bestScore = data.bestScore;
    SaveService.addCoins(this.coins);
  }

  private showGameOverPanel(): void {
    const { width, height } = this.scale;
    const canRevive = !this.reviveUsed && SaveService.load().coins >= GAME_CONFIG.reviveCost;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, GAME_CONFIG.overlay, 0.78).setDepth(20);
    const title = this.add.text(width / 2, height * 0.25, 'RUN OVER', { fontFamily: 'Arial', fontSize: '38px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    const result = this.add.text(width / 2, height * 0.34, `SCORE  ${this.score}\nRUN COINS  ${this.coins}\nBEST  ${this.bestScore}\nBANK  ${SaveService.load().coins}`, { fontFamily: 'Arial', fontSize: '19px', color: '#9fe8d1', align: 'center', lineSpacing: 6 }).setOrigin(0.5).setDepth(21);

    const buttonY = canRevive ? 0.59 : 0.55;
    if (canRevive) {
      const reviveButton = this.add.rectangle(width / 2, height * 0.49, 230, 54, GAME_CONFIG.shield).setDepth(21).setInteractive({ useHandCursor: true });
      this.add.text(width / 2, height * 0.49, `REVIVE  •  ${GAME_CONFIG.reviveCost} COINS`, { fontFamily: 'Arial', fontSize: '15px', color: '#07111f', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22);
      reviveButton.on('pointerup', () => this.revive());
    }

    const playAgain = this.add.rectangle(width / 2, height * buttonY, 190, 56, GAME_CONFIG.accent).setDepth(21).setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * buttonY, 'PLAY AGAIN', { fontFamily: 'Arial', fontSize: '18px', color: '#07111f', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22);
    playAgain.on('pointerup', () => this.restart());

    const home = this.add.text(width / 2, height * 0.70, 'HOME', { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
    home.on('pointerup', () => this.scene.start('HomeScene'));
    const shop = this.add.text(width / 2, height * 0.76, 'SHOP', { fontFamily: 'Arial', fontSize: '16px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
    shop.on('pointerup', () => this.scene.start('ShopScene'));

    this.gameOverPanel = this.add.container(0, 0, [overlay, title, result, playAgain, home, shop]).setDepth(20);
  }

  private revive(): void {
    if (this.reviveUsed || !this.isGameOver) return;
    if (!SaveService.spendCoins(GAME_CONFIG.reviveCost)) return;
    this.reviveUsed = true;
    this.isGameOver = false;
    this.reviveInvulnerabilityTimer = GAME_CONFIG.reviveInvulnerabilityMs;
    this.shieldTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.scoreBonus += 25;
    this.spawnTimer = 900;
    this.clearNearbyObstacles();
    this.gameOverPanel.destroy();
    this.player.setAlpha(1);
    this.flashPlayer();
  }

  private clearNearbyObstacles(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      if (Math.abs(obstacle.y - this.player.y) < 190) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  private restart(): void { this.scene.restart(); }

  private changeLane(direction: number): void {
    if (this.isGameOver) return;
    if (this.inputCooldown > 0) return;
    const next = Phaser.Math.Clamp(this.targetLane + direction, 0, GAME_CONFIG.lanes - 1);
    if (next === this.targetLane) return;
    this.targetLane = next;
    this.inputCooldown = GAME_CONFIG.laneInputBufferMs;
    this.tweens.add({ targets: this.player, x: this.laneX[this.targetLane], duration: GAME_CONFIG.laneTweenMs, ease: 'Quad.easeOut' });
  }

  private getLanePositions(width: number): number[] {
    const left = (width - GAME_CONFIG.roadWidth) / 2;
    const laneWidth = GAME_CONFIG.roadWidth / GAME_CONFIG.lanes;
    return Array.from({ length: GAME_CONFIG.lanes }, (_, lane) => left + laneWidth * (lane + 0.5));
  }

  private safeLane(blocked: number[]): number {
    const safe = Array.from({ length: GAME_CONFIG.lanes }, (_, lane) => lane).filter((lane) => !blocked.includes(lane));
    return safe[Math.floor(Math.random() * safe.length)] ?? 0;
  }

  private updateHud(): void {
    this.distanceText.setText(`DIST ${Math.floor(this.distance)}m`);
    this.scoreText.setText(`SCORE ${this.score}`);
    this.speedText.setText(`SPEED ${(this.speed / GAME_CONFIG.worldSpeed).toFixed(1)}x`);
    const powers: string[] = [];
    if (this.shieldTimer > 0) powers.push(`SHIELD ${(this.shieldTimer / 1000).toFixed(1)}s`);
    if (this.magnetTimer > 0) powers.push(`MAGNET ${(this.magnetTimer / 1000).toFixed(1)}s`);
    this.powerText.setText(powers.join('  '));
    this.comboText.setText(this.combo > 1 ? `COMBO x${this.combo}` : '');
  }
}