export const GAME_CONFIG = {
  width: 390,
  height: 844,
  lanes: 3,
  roadWidth: 270,
  playerYRatio: 0.78,
  laneTweenMs: 100,
  worldSpeed: 260,
  maxWorldSpeed: 520,
  speedRampPerSecond: 7,
  laneInputBufferMs: 140,
  obstacleSpawnStartMs: 1150,
  obstacleSpawnMinMs: 650,
  obstacleWidth: 62,
  obstacleHeight: 52,
  obstacleWarningMs: 220,
  scorePerMeter: 1,
  background: 0x07111f,
  road: 0x17263a,
  laneLine: 0x3b526d,
  player: 0x38e8b0,
  obstacle: 0xff5d73,
  obstacleWide: 0xff8c42,
  accent: 0xffd166,
  danger: 0xff5d73,
  overlay: 0x050a12
} as const;

export type GameConfig = typeof GAME_CONFIG;
