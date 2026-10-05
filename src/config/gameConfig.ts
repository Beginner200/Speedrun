export const GAME_CONFIG = {
  title: 'Dash Dodge',
  lanes: 3,
  laneChangeMs: 100,
  playerYRatio: 0.78,
  playerRadius: 18,
  worldSpeed: 280,
  fixedStepMs: 1000 / 60,
  graceMs: 1500,
  colors: { bg: 0x07111f, road: 0x10233b, lane: 0x28415f, player: 0x35e0ff, accent: 0xffd447 }
} as const;
