import type { BiomeId } from '../config/palette';

export type VisualSkin = {
  id: string;
  assetKey: string;
  accent: number;
};

export type BiomeDefinition = {
  id: BiomeId;
  title: string;
  startDistance: number;
  transitionMs: number;
  obstacleStyle: string;
};

export const VISUAL_SKINS: VisualSkin[] = [
  { id: 'mint', assetKey: 'char-mint', accent: 0x38e8b0 },
  { id: 'sky', assetKey: 'char-sky', accent: 0x66b6ff },
  { id: 'sunset', assetKey: 'char-sunset', accent: 0xff7a59 },
  { id: 'violet', assetKey: 'char-violet', accent: 0xb77cff },
  { id: 'gold', assetKey: 'char-gold', accent: 0xffd166 },
  { id: 'crimson', assetKey: 'char-crimson', accent: 0xff5d73 },
  { id: 'ice', assetKey: 'char-ice', accent: 0x9be7ff },
  { id: 'neon', assetKey: 'char-neon', accent: 0xf5ff4a },
];

export const BIOMES: BiomeDefinition[] = [
  { id: 'sunnyCity', title: 'Sunny City', startDistance: 0, transitionMs: 2000, obstacleStyle: 'city' },
  { id: 'neonNight', title: 'Neon Night', startDistance: 900, transitionMs: 2000, obstacleStyle: 'neon' },
  { id: 'jungleRuins', title: 'Jungle Ruins', startDistance: 1800, transitionMs: 2000, obstacleStyle: 'ruins' },
];

export function getBiome(distance: number): BiomeDefinition {
  let active = BIOMES[0];
  for (const biome of BIOMES) {
    if (distance >= biome.startDistance) active = biome;
  }
  return active;
}

export function getVisualSkin(id: string): VisualSkin {
  return VISUAL_SKINS.find((skin) => skin.id === id) ?? VISUAL_SKINS[0];
}
