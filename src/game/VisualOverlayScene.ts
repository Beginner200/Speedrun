import Phaser from 'phaser';
import { getSelectedSkin } from '../core/saveService';

const SKIN_COLORS: Record<string, { suit: number; accent: number; hair: number; skin: number }> = {
  mint: { suit: 0x38e8b0, accent: 0x0b8f73, hair: 0x24364b, skin: 0xf2bd91 },
  sky: { suit: 0x66b6ff, accent: 0x2563a8, hair: 0x513628, skin: 0xd99b72 },
  sunset: { suit: 0xff7a59, accent: 0xb83f2b, hair: 0x1d1a1b, skin: 0xf1bf9a },
  violet: { suit: 0xb77cff, accent: 0x6635a5, hair: 0x39264e, skin: 0xc98765 },
  gold: { suit: 0xffd166, accent: 0xb47716, hair: 0x7a4827, skin: 0xe3aa7e },
  crimson: { suit: 0xff5d73, accent: 0xa5223c, hair: 0x17171d, skin: 0x8e5b43 },
  ice: { suit: 0x9be7ff, accent: 0x3b92b8, hair: 0xb9d4dc, skin: 0xf0c7a6 },
  neon: { suit: 0xf5ff4a, accent: 0x8d9b13, hair: 0x263238, skin: 0xc47b5a },
  daily7: { suit: 0xf5ff4a, accent: 0x7a5cff, hair: 0x263238, skin: 0xf0c7a6 }
};

export class VisualOverlayScene extends Phaser.Scene {
  private visual: Phaser.GameObjects.Container | null = null;
  private shadow: Phaser.GameObjects.Ellipse | null = null;
  private playerRef: Phaser.GameObjects.Rectangle | null = null;
  private runClock = 0;
  private lastX = 0;
  private activeSkin = '';

  constructor() { super('VisualOverlayScene'); }

  create(): void {
    this.events.on(Phaser.Scenes.Events.UPDATE, this.syncVisual, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.visual?.destroy();
      this.shadow?.destroy();
    });
  }

  private syncVisual(_time: number, delta: number): void {
    const play = this.scene.get('PlayScene');
    if (!play || !this.scene.isActive('PlayScene')) {
      this.hideVisual();
      return;
    }

    const candidate = play.children.list.find((child) => {
      const gameObject = child as Phaser.GameObjects.Rectangle;
      return gameObject.type === 'Rectangle' && gameObject.width === 42 && gameObject.height === 58 && gameObject.depth === 3;
    }) as Phaser.GameObjects.Rectangle | undefined;

    if (!candidate) {
      this.hideVisual();
      return;
    }

    this.playerRef = candidate;
    const skin = getSelectedSkin();
    if (!this.visual || this.activeSkin !== skin.id) this.buildCharacter(skin.id);

    candidate.setAlpha(0);
    const x = candidate.x;
    const y = candidate.y;
    const dx = x - this.lastX;
    this.lastX = x;
    this.runClock += delta;

    this.visual!.setVisible(true).setPosition(x, y);
    this.shadow!.setVisible(true).setPosition(x, y + 31);

    const phase = this.runClock * 0.014;
    const stride = Math.sin(phase) * 3.5;
    const bob = Math.abs(Math.sin(phase)) * 1.5;
    this.visual!.setY(y - bob);

    const lean = Phaser.Math.Clamp(dx * 0.045, -0.18, 0.18);
    this.visual!.setRotation(lean);
    this.animateLimbs(phase, stride);
  }

  private buildCharacter(id: string): void {
    this.visual?.destroy();
    this.shadow?.destroy();
    const colors = SKIN_COLORS[id] ?? SKIN_COLORS.mint;
    const root = this.add.container(0, 0).setDepth(8).setVisible(false);

    const glow = this.add.circle(0, 2, 27, colors.suit, 0.08);
    const legs = this.add.container(0, 15);
    const leftLeg = this.add.rectangle(-8, 7, 7, 24, colors.accent).setOrigin(0.5, 0.1);
    const rightLeg = this.add.rectangle(8, 7, 7, 24, colors.accent).setOrigin(0.5, 0.1);
    const leftShoe = this.add.ellipse(-10, 29, 13, 6, 0x111827);
    const rightShoe = this.add.ellipse(10, 29, 13, 6, 0x111827);
    legs.add([leftLeg, rightLeg, leftShoe, rightShoe]);

    const torso = this.add.roundedRectangle?.(0, 0, 29, 34, 9, colors.suit) ?? this.add.rectangle(0, 0, 29, 34, colors.suit);
    torso.setOrigin(0.5, 0.35);
    const belt = this.add.rectangle(0, 9, 25, 4, colors.accent).setOrigin(0.5);

    const head = this.add.circle(0, -20, 10, colors.skin);
    const hair = this.add.arc(0, -22, 10, 195, 345, false, colors.hair).setStrokeStyle(4, colors.hair, 1);
    const visor = id === 'neon' || id === 'ice' ? this.add.rectangle(0, -19, 15, 4, colors.accent, 0.8) : null;

    const leftArm = this.add.rectangle(-17, -1, 6, 22, colors.suit).setOrigin(0.5, 0.1);
    const rightArm = this.add.rectangle(17, -1, 6, 22, colors.suit).setOrigin(0.5, 0.1);
    const badge = this.add.circle(0, -1, 3, colors.accent);
    root.add([glow, legs, torso, belt, head, hair, leftArm, rightArm, badge]);
    if (visor) root.add(visor);

    const shadow = this.add.ellipse(0, 0, 42, 10, 0x000000, 0.28).setDepth(7).setVisible(false);
    this.visual = root;
    this.shadow = shadow;
    this.activeSkin = id;
    this.runClock = 0;
    this.lastX = this.playerRef?.x ?? 0;
    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;
  }

  private leftArm!: Phaser.GameObjects.Rectangle;
  private rightArm!: Phaser.GameObjects.Rectangle;
  private leftLeg!: Phaser.GameObjects.Rectangle;
  private rightLeg!: Phaser.GameObjects.Rectangle;

  private animateLimbs(phase: number, stride: number): void {
    if (!this.leftArm || !this.rightArm) return;
    const swing = Math.sin(phase) * 0.45;
    this.leftArm.rotation = -swing;
    this.rightArm.rotation = swing;
    this.leftLeg.rotation = swing * 0.75;
    this.rightLeg.rotation = -swing * 0.75;
    this.leftLeg.x = -8 + stride * 0.18;
    this.rightLeg.x = 8 - stride * 0.18;
  }

  private hideVisual(): void {
    this.visual?.setVisible(false);
    this.shadow?.setVisible(false);
  }
}
