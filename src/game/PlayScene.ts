import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { buildTemporallySafePattern, ObstaclePattern } from '../core/obstacle';
import { SaveService, getSelectedSkin } from '../core/saveService';
import { PALETTE } from '../config/palette';
import { getBiome } from '../core/visualSystem';
import { AudioService } from '../core/audioService';
import { HapticsService } from '../core/hapticsService';
import { ObjectPool } from '../core/objectPool';
import { addNearMiss, calculateScore, tickCombo } from '../core/scoring';

type Obstacle = Phaser.GameObjects.Rectangle & { lane: number; wide?: boolean; warned?: boolean };
type Pickup = Phaser.GameObjects.Arc & { kind: 'coin' | 'shield' | 'magnet'; lane: number; value: number };

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private targetLane = 1;
  private laneX: number[] = [];
  private laneLines: Phaser.GameObjects.Rectangle[] = [];
  private obstacles: Obstacle[] = [];
  private pickups: Pickup[] = [];
  private obstaclePool!: ObjectPool<Obstacle>;
  private pickupPool!: ObjectPool<Pickup>;
  private speed = GAME_CONFIG.worldSpeed;
  private distance = 0;
  private score = 0;
  private scoreBonus = 0;
  private bestScore = 0;
  private coins = 0;
  private nearMisses = 0;
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
  private pauseButton!: Phaser.GameObjects.Text;
  private pausePanel: Phaser.GameObjects.Container | null = null;
  private gameOverPanel!: Phaser.GameObjects.Container;
  private inputCooldown = 0;
  private spawnTimer = GAME_CONFIG.obstacleSpawnStartMs;
  private touchStartX: number | null = null;
  private isGameOver = false;
  private isPaused = false;
  private runSettled = false;
  private reviveUsed = false;
  private lastPattern: ObstaclePattern | null = null;
  private biomeDistance = -1;
  private biomeBanner?: Phaser.GameObjects.Container;

  constructor() { super('PlayScene'); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveService.load();
    const selectedSkin = getSelectedSkin();
    this.isGameOver = false;
    this.isPaused = false;
    this.runSettled = false;
    this.reviveUsed = false;
    this.speed = GAME_CONFIG.worldSpeed;
    this.distance = 0;
    this.score = 0;
    this.scoreBonus = 0;
    this.bestScore = save.bestScore;
    this.coins = 0;
    this.nearMisses = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.shieldTimer = 0;
    this.magnetTimer = 0;
    this.reviveInvulnerabilityTimer = 0;
    this.nearMissCooldown = 0;
    this.spawnTimer = GAME_CONFIG.obstacleSpawnStartMs;
    this.targetLane = 1;
    this.lastPattern = null;
    this.obstacles.length = 0;
    this.pickups.length = 0;
    this.laneX = this.getLanePositions(width);
    this.cameras.main.setBackgroundColor(PALETTE.biomes.sunnyCity.sky);

    this.obstaclePool = new ObjectPool(() => {
      const obstacle = this.add.rectangle(0, -100, GAME_CONFIG.obstacleWidth, GAME_CONFIG.obstacleHeight, GAME_CONFIG.obstacle).setDepth(2).setVisible(false).setActive(false) as Obstacle;
      obstacle.lane = 0;
      obstacle.wide = false;
      obstacle.warned = false;
      return obstacle;
    }, 8);
    this.pickupPool = new ObjectPool(() => {
      const pickup = this.add.circle(0, -100, 14, GAME_CONFIG.coin).setDepth(2).setVisible(false).setActive(false) as Pickup;
      pickup.kind = 'coin';
      pickup.lane = 0;
      pickup.value = GAME_CONFIG.coinValue;
      return pickup;
    }, 8);

    this.add.rectangle(width / 2, height / 2, GAME_CONFIG.roadWidth, height, PALETTE.biomes.sunnyCity.lane).setDepth(0);
    this.laneLines.length = 0;
    for (let i = 0; i < 2; i++) {
      const x = (this.laneX[i] + this.laneX[i + 1]) / 2;
      for (let y = -40; y < height + 40; y += 70) {
        this.laneLines.push(this.add.rectangle(x, y, 4, 38, PALETTE.biomes.sunnyCity.divider).setDepth(1));
      }
    }

    this.player = this.add.rectangle(this.laneX[this.targetLane], height * GAME_CONFIG.playerYRatio, 42, 58, selectedSkin.color).setDepth(3).setStrokeStyle(3, 0xffffff, 0.9);
    this.scene.launch('VisualOverlayScene');
    this.scene.launch('WorldVisualScene');
    this.distanceText = this.add.text(18, 18, 'DIST 0m', { fontFamily: 'Arial', fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setDepth(10);
    this.scoreText = this.add.text(width - 18, 18, 'SCORE 0', { fontFamily: 'Arial', fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setOrigin(1, 0).setDepth(10);
    this.speedText = this.add.text(18, 46, 'SPEED 1.0x', { fontFamily: 'Arial', fontSize: '15px', color: '#9fb4ca' }).setDepth(10);
    this.powerText = this.add.text(width - 18, 48, '', { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', align: 'right' }).setOrigin(1, 0).setDepth(10);
    this.comboText = this.add.text(width / 2, 92, '', { fontFamily: 'Arial', fontSize: '19px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);
    this.pauseButton = this.add.text(width / 2, 52, 'Ⅱ', { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });
    this.pauseButton.on('pointerup', () => this.togglePause());

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      AudioService.unlock();
      AudioService.startMusic();
      if (!this.isGameOver && !this.isPaused) this.touchStartX = p.x;
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.isGameOver || this.isPaused || this.touchStartX === null) return;
      const dx = p.x - this.touchStartX;
      this.touchStartX = null;
      if (Math.abs(dx) > 22) this.changeLane(dx > 0 ? 1 : -1);
      else this.changeLane(p.x < width / 2 ? -1 : 1);
    });
    this.input.keyboard?.on('keydown-LEFT', () => this.changeLane(-1));
    this.input.keyboard?.on('keydown-A', () => this.changeLane(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeLane(1));
    this.input.keyboard?.on('keydown-D', () => this.changeLane(1));
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-R', () => { if (this.isGameOver) this.restart(); });

    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.tweens.killAll();
      AudioService.stopMusic();
    });
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden && !this.isGameOver) this.setPaused(true);
  };

  update(_: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;
    const dt = Math.min(delta, 50) / 1000;
    this.inputCooldown = Math.max(0, this.inputCooldown - delta);
    const comboState = tickCombo({ combo: this.combo, timerMs: this.comboTimer, bonus: this.scoreBonus }, delta);
    this.combo = comboState.combo;
    this.comboTimer = comboState.timerMs;
    this.scoreBonus = comboState.bonus;
    this.nearMissCooldown = Math.max(0, this.nearMissCooldown - delta);
    this.shieldTimer = Math.max(0, this.shieldTimer - delta);
    this.magnetTimer = Math.max(0, this.magnetTimer - delta);
    this.reviveInvulnerabilityTimer = Math.max(0, this.reviveInvulnerabilityTimer - delta);

    this.speed = Math.min(GAME_CONFIG.maxWorldSpeed, this.speed + GAME_CONFIG.speedRampPerSecond * dt);
    this.distance += this.speed * dt / 10;
    this.score = calculateScore(this.distance, GAME_CONFIG.scorePerMeter, this.scoreBonus, this.coins, GAME_CONFIG.coinScoreValue);

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
    this.updateBiomeVisuals();
    this.updateHud();
  }

  private spawnObstaclePattern(): void {
    const pattern = buildTemporallySafePattern(GAME_CONFIG.lanes, this.lastPattern, Math.random, this.targetLane);
    this.lastPattern = pattern;
    const spawnY = -60;
    for (const lane of pattern.blockedLanes) {
      const obstacle = this.obstaclePool.acquire();
      obstacle.setPosition(this.laneX[lane], spawnY).setSize(GAME_CONFIG.obstacleWidth, GAME_CONFIG.obstacleHeight).setFillStyle(pattern.blockedLanes.length > 1 ? GAME_CONFIG.obstacleWide : GAME_CONFIG.obstacle).setStrokeStyle(2, 0xffffff, 0.45).setAlpha(1).setVisible(true).setActive(true);
      obstacle.lane = lane;
      obstacle.wide = pattern.blockedLanes.length > 1;
      obstacle.warned = false;
      this.obstacles.push(obstacle);
    }
    if (Math.random() < 0.72) this.spawnCoinOnSafeLane(pattern.blockedLanes, spawnY - 95);
    if (Math.random() < GAME_CONFIG.powerUpSpawnChance) this.spawnPowerUp(pattern.blockedLanes, spawnY - 155);
  }

  private spawnCoinOnSafeLane(blocked: number[], y: number): void {
    const safe = this.safeLane(blocked);
    const coin = this.pickupPool.acquire();
    coin.setPosition(this.laneX[safe], y).setFillStyle(GAME_CONFIG.coin).setStrokeStyle(2, 0xffffff, 0.75).setAlpha(1).setScale(0.8).setVisible(true).setActive(true);
    coin.kind = 'coin';
    coin.lane = safe;
    coin.value = GAME_CONFIG.coinValue;
    this.pickups.push(coin);
  }

  private spawnPowerUp(blocked: number[], y: number): void {
    const safe = this.safeLane(blocked);
    const kind = Math.random() < 0.5 ? 'shield' : 'magnet';
    const color = kind === 'shield' ? GAME_CONFIG.shield : GAME_CONFIG.magnet;
    const pickup = this.pickupPool.acquire();
    pickup.setPosition(this.laneX[safe], y).setFillStyle(color).setStrokeStyle(3, 0xffffff, 0.9).setAlpha(1).setScale(1).setVisible(true).setActive(true);
    pickup.kind = kind;
    pickup.lane = safe;
    pickup.value = 1;
    this.pickups.push(pickup);
  }

  private releaseObstacle(index: number): void {
    const obstacle = this.obstacles[index];
    this.tweens.killTweensOf(obstacle);
    obstacle.setVisible(false).setActive(false).setAlpha(1);
    this.obstacles.splice(index, 1);
    this.obstaclePool.release(obstacle);
  }

  private releasePickup(index: number): void {
    const pickup = this.pickups[index];
    this.pickups.splice(index, 1);
    this.tweens.killTweensOf(pickup);
    pickup.setVisible(false).setActive(false).setAlpha(1).setScale(1);
    this.pickupPool.release(pickup);
  }

  private moveObstacles(dt: number): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.y += this.speed * dt;
      const warningDistance = Math.max(150, this.speed * GAME_CONFIG.obstacleWarningMs / 1000);
      if (!obstacle.warned && obstacle.y > -warningDistance) {
        obstacle.warned = true;
        this.tweens.add({ targets: obstacle, alpha: 0.55, duration: 70, yoyo: true, repeat: 2 });
      }
      if (obstacle.y > this.scale.height + 80) { this.releaseObstacle(i); continue; }
      if (this.reviveInvulnerabilityTimer <= 0 && this.isColliding(this.player, obstacle)) {
        if (this.shieldTimer > 0) {
          this.shieldTimer = 0;
          this.flashPlayer();
          AudioService.powerUp();
          HapticsService.impact();
          this.releaseObstacle(i);
          continue;
        }
        this.endRun();
        return;
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
      if (this.magnetTimer > 0 && pickup.kind === 'coin') {
        const dx = this.player.x - pickup.x;
        if (Math.abs(dx) < GAME_CONFIG.magnetRange) pickup.x += Phaser.Math.Clamp(dx * dt * 6, -this.speed * dt, this.speed * dt);
      }
      const dx = this.player.x - pickup.x;
      const dy = this.player.y - pickup.y;
      if (Math.abs(dx) < 28 && Math.abs(dy) < 28) {
        if (pickup.kind === 'magnet') this.magnetTimer = GAME_CONFIG.magnetDurationMs;
        else if (pickup.kind === 'shield') this.shieldTimer = GAME_CONFIG.shieldDurationMs;
        else this.coins += pickup.value;
        this.collectFeedback(pickup);
        if (pickup.kind === 'coin') { AudioService.coin(); HapticsService.success(); }
        else { AudioService.powerUp(); HapticsService.success(); }
        this.releasePickup(i);
        continue;
      }
      if (pickup.y > this.scale.height + 60) this.releasePickup(i);
    }
  }

  private addNearMiss(): void {
    this.nearMissCooldown = 300;
    this.nearMisses += 1;
    const state = addNearMiss({ combo: this.combo, timerMs: this.comboTimer, bonus: this.scoreBonus }, GAME_CONFIG.nearMissScore);
    this.combo = state.combo;
    this.comboTimer = state.timerMs;
    this.scoreBonus = state.bonus;
    AudioService.nearMiss();
    HapticsService.warning();
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
    this.score = calculateScore(this.distance, GAME_CONFIG.scorePerMeter, this.scoreBonus, this.coins, GAME_CONFIG.coinScoreValue);
    this.settleRun();
    AudioService.hit();
    HapticsService.impact();
    this.cameras.main.shake(180, 0.008);
    this.showGameOverPanel();
  }

  private settleRun(): void {
    if (this.runSettled) return;
    this.runSettled = true;
    const data = SaveService.setBestScore(this.score);
    this.bestScore = data.bestScore;
    SaveService.addCoins(this.coins);
    SaveService.recordRun(this.coins, this.nearMisses, this.score);
  }

  private showGameOverPanel(): void {
    const { width, height } = this.scale;
    const canRevive = !this.reviveUsed && SaveService.load().coins >= GAME_CONFIG.reviveCost;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, GAME_CONFIG.overlay, 0.78).setDepth(20);
    const title = this.add.text(width / 2, height * 0.25, 'RUN OVER', { fontFamily: 'Arial', fontSize: '38px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    const result = this.add.text(width / 2, height * 0.34, `SCORE  ${this.score}\nRUN COINS  ${this.coins}\nBEST  ${this.bestScore}\nBANK  ${SaveService.load().coins}`, { fontFamily: 'Arial', fontSize: '19px', color: '#9fe8d1', align: 'center', lineSpacing: 6 }).setOrigin(0.5).setDepth(21);
    const buttonY = canRevive ? 0.59 : 0.55;
    const panelItems: Phaser.GameObjects.GameObject[] = [overlay, title, result];
    if (canRevive) {
      const reviveButton = this.add.rectangle(width / 2, height * 0.49, 230, 54, GAME_CONFIG.shield).setDepth(21).setInteractive({ useHandCursor: true });
      const reviveText = this.add.text(width / 2, height * 0.49, `REVIVE  •  ${GAME_CONFIG.reviveCost} COINS`, { fontFamily: 'Arial', fontSize: '15px', color: '#07111f', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22);
      reviveButton.on('pointerup', () => this.revive());
      panelItems.push(reviveButton, reviveText);
    }
    const playAgain = this.add.rectangle(width / 2, height * buttonY, 190, 56, GAME_CONFIG.accent).setDepth(21).setInteractive({ useHandCursor: true });
    const playAgainText = this.add.text(width / 2, height * buttonY, 'PLAY AGAIN', { fontFamily: 'Arial', fontSize: '18px', color: '#07111f', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22);
    playAgain.on('pointerup', () => this.restart());
    const home = this.add.text(width / 2, height * 0.70, 'HOME', { fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
    home.on('pointerup', () => this.scene.start('HomeScene'));
    const shop = this.add.text(width / 2, height * 0.76, 'SHOP', { fontFamily: 'Arial', fontSize: '16px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });
    shop.on('pointerup', () => this.scene.start('ShopScene'));
    panelItems.push(playAgain, playAgainText, home, shop);
    this.gameOverPanel = this.add.container(0, 0, panelItems).setDepth(20);
  }

  private revive(): void {
    if (this.reviveUsed || !this.isGameOver) return;
    if (!SaveService.spendCoins(GAME_CONFIG.reviveCost)) return;
    this.reviveUsed = true;
    this.isGameOver = false;
    this.isPaused = false;
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
    AudioService.powerUp();
    HapticsService.success();
  }

  private clearNearbyObstacles(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      if (Math.abs(obstacle.y - this.player.y) < 190) this.releaseObstacle(i);
    }
  }

  private togglePause(): void { this.setPaused(!this.isPaused); }

  private setPaused(paused: boolean): void {
    if (this.isGameOver) return;
    if (paused === this.isPaused) return;
    this.isPaused = paused;
    this.touchStartX = null;
    if (paused) {
      this.tweens.pauseAll();
      AudioService.stopMusic();
      this.showPausePanel();
    } else {
      this.tweens.resumeAll();
      this.hidePausePanel();
      AudioService.unlock();
      AudioService.startMusic();
    }
  }

  private showPausePanel(): void {
    if (this.pausePanel) return;
    const { width, height } = this.scale;
    const shade = this.add.rectangle(width / 2, height / 2, width, height, GAME_CONFIG.overlay, 0.72).setDepth(30);
    const title = this.add.text(width / 2, height * 0.39, 'PAUSED', { fontFamily: 'Arial', fontSize: '38px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(31);
    const resume = this.add.rectangle(width / 2, height * 0.51, 190, 54, GAME_CONFIG.accent).setDepth(31).setInteractive({ useHandCursor: true });
    const resumeText = this.add.text(width / 2, height * 0.51, 'RESUME', { fontFamily: 'Arial', fontSize: '18px', color: '#07111f', fontStyle: 'bold' }).setOrigin(0.5).setDepth(32);
    resume.on('pointerup', () => this.setPaused(false));
    const home = this.add.text(width / 2, height * 0.61, 'EXIT TO HOME', { fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });
    home.on('pointerup', () => this.scene.start('HomeScene'));
    this.pausePanel = this.add.container(0, 0, [shade, title, resume, resumeText, home]).setDepth(30);
  }

  private hidePausePanel(): void {
    this.pausePanel?.destroy();
    this.pausePanel = null;
  }

  private restart(): void { AudioService.stopMusic(); this.scene.restart(); }

  private changeLane(direction: number): void {
    if (this.isGameOver || this.isPaused || this.inputCooldown > 0) return;
    const next = Phaser.Math.Clamp(this.targetLane + direction, 0, GAME_CONFIG.lanes - 1);
    if (next === this.targetLane) return;
    AudioService.button();
    this.targetLane = next;
    this.inputCooldown = GAME_CONFIG.laneInputBufferMs;
    HapticsService.pulse(12);
    this.tweens.add({ targets: this.player, x: this.laneX[this.targetLane], duration: GAME_CONFIG.laneTweenMs, ease: 'Quad.easeOut' });
  }

  private getLanePositions(width: number): number[] {
    const left = (width - GAME_CONFIG.roadWidth) / 2;
    const laneWidth = GAME_CONFIG.roadWidth / GAME_CONFIG.lanes;
    return Array.from({ length: GAME_CONFIG.lanes }, (_, lane) => left + laneWidth * (lane + 0.5));
  }

  private safeLane(blocked: number[]): number {
    let firstSafe = -1;
    let count = 0;
    for (let lane = 0; lane < GAME_CONFIG.lanes; lane++) {
      if (blocked.indexOf(lane) !== -1) continue;
      if (firstSafe < 0) firstSafe = lane;
      count++;
    }
    if (count <= 1) return firstSafe >= 0 ? firstSafe : 0;
    let pick = Math.floor(Math.random() * count);
    for (let lane = 0; lane < GAME_CONFIG.lanes; lane++) {
      if (blocked.indexOf(lane) !== -1) continue;
      if (pick-- === 0) return lane;
    }
    return firstSafe >= 0 ? firstSafe : 0;
  }

  private updateBiomeVisuals(): void {
    const biome = getBiome(this.distance);
    if (biome.startDistance === this.biomeDistance) return;
    const previous = this.biomeDistance;
    this.biomeDistance = biome.startDistance;
    const palette = PALETTE.biomes[biome.id];
    this.cameras.main.setBackgroundColor(palette.sky);
    const road = this.children.list.find((child) =>
      child.type === 'Rectangle' &&
      (child as Phaser.GameObjects.Rectangle).depth === 0
    ) as Phaser.GameObjects.Rectangle | undefined;
    road?.setFillStyle(palette.lane);
    for (const line of this.laneLines) line.setFillStyle(palette.divider);
    for (const obstacle of this.obstacles) obstacle.setFillStyle(obstacle.wide ? palette.obstacle : palette.obstacle);
    for (const pickup of this.pickups) if (pickup.kind === 'coin') pickup.setFillStyle(palette.pickup);

    if (previous >= 0) {
      this.biomeBanner?.destroy();
      const { width } = this.scale;
      const box = this.add.rectangle(width / 2, 118, 245, 42, palette.mid, 0.9).setStrokeStyle(2, palette.divider, 0.8);
      const label = this.add.text(width / 2, 118, biome.title.toUpperCase(), {
        fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.biomeBanner = this.add.container(0, -60, [box, label]).setDepth(25);
      this.tweens.add({ targets: this.biomeBanner, y: 0, duration: 220, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.biomeBanner, y: -60, delay: 1450, duration: 330, ease: 'Quad.easeIn' });
    }
  }

  private updateHud(): void {
    this.distanceText.setText(`DIST ${Math.floor(this.distance)}m`);
    this.scoreText.setText(`SCORE ${this.score}`);
    this.speedText.setText(`SPEED ${(this.speed / GAME_CONFIG.worldSpeed).toFixed(1)}x`);
    let powerText = '';
    if (this.shieldTimer > 0) powerText = `SHIELD ${(this.shieldTimer / 1000).toFixed(1)}s`;
    if (this.magnetTimer > 0) powerText += powerText ? `  MAGNET ${(this.magnetTimer / 1000).toFixed(1)}s` : `MAGNET ${(this.magnetTimer / 1000).toFixed(1)}s`;
    this.powerText.setText(powerText);
    this.comboText.setText(this.combo > 1 ? `COMBO x${this.combo}` : '');
  }
}
