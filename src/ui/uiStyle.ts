import Phaser from 'phaser';

export const UI = {
  bg: 0x07111f,
  panel: 0x101f33,
  panel2: 0x172b44,
  border: 0x36516f,
  text: '#ffffff',
  muted: '#9fb4ca',
  accent: 0x5ee7c4,
  gold: 0xffd166,
  danger: 0xff647c,
  shadow: 0x020812,
};

export function title(scene: Phaser.Scene, textValue: string, y = 42): Phaser.GameObjects.Text {
  return scene.add.text(scene.scale.width / 2, y, textValue, {
    fontFamily: 'Arial', fontSize: '30px', color: UI.text, fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 3, color: '#020812', blur: 5, stroke: true, fill: true },
  }).setOrigin(0.5);
}

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, fill = UI.panel): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(x + 3, y + 4, w, h, UI.shadow, 0.65)
    .setStrokeStyle(2, UI.border, 0.7)
    .setOrigin(0.5)
    .setAlpha(0.8)
    .setDepth(0)
    .setData('uiShadow', true)
    .setFillStyle(fill);
}

export function card(scene: Phaser.Scene, x: number, y: number, w: number, h: number, selected = false): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(x, y, w, h, selected ? 0x1b3a4b : UI.panel2, 0.98)
    .setStrokeStyle(2, selected ? UI.accent : UI.border, selected ? 1 : 0.7);
}

export function button(scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, fill = UI.accent, textColor = '#07111f', onClick?: () => void): Phaser.GameObjects.Container {
  const shadow = scene.add.rectangle(3, 5, w, h, UI.shadow, 0.7);
  const body = scene.add.rectangle(0, 0, w, h, fill, 1).setStrokeStyle(2, 0xffffff, 0.22).setInteractive({ useHandCursor: true });
  const shine = scene.add.rectangle(0, -h * 0.28, w - 8, h * 0.18, 0xffffff, 0.13);
  const text = scene.add.text(0, 0, label, { fontFamily: 'Arial', fontSize: Math.min(18, h * 0.34), color: textColor, fontStyle: 'bold' }).setOrigin(0.5);
  const c = scene.add.container(x, y, [shadow, body, shine, text]);
  body.on('pointerdown', () => scene.tweens.add({ targets: c, scaleX: 0.96, scaleY: 0.96, duration: 70 }));
  body.on('pointerup', () => {
    scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 90 });
    onClick?.();
  });
  body.on('pointerout', () => scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 70 }));
  return c;
}

export function homeButton(scene: Phaser.Scene, onClick: () => void): void {
  button(scene, scene.scale.width / 2, scene.scale.height - 28, 130, 40, '‹  HOME', UI.panel2, '#ffffff', onClick);
}
