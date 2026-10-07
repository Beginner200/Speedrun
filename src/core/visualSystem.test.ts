import { describe, expect, it } from 'vitest';
import { BIOMES, VISUAL_SKINS, getBiome, getVisualSkin } from './visualSystem';

describe('visual system', () => {
  it('defines three ordered biomes with two-second transitions', () => {
    expect(BIOMES.map((b) => b.id)).toEqual(['sunnyCity', 'neonNight', 'jungleRuins']);
    expect(BIOMES.map((b) => b.startDistance)).toEqual([0, 900, 1800]);
    expect(BIOMES.every((b) => b.transitionMs === 2000)).toBe(true);
  });

  it('selects the correct biome at boundaries', () => {
    expect(getBiome(0).id).toBe('sunnyCity');
    expect(getBiome(899.9).id).toBe('sunnyCity');
    expect(getBiome(900).id).toBe('neonNight');
    expect(getBiome(1799.9).id).toBe('neonNight');
    expect(getBiome(1800).id).toBe('jungleRuins');
  });

  it('provides all eight standardized character skins', () => {
    expect(VISUAL_SKINS).toHaveLength(8);
    expect(new Set(VISUAL_SKINS.map((skin) => skin.assetKey)).size).toBe(8);
    expect(VISUAL_SKINS.every((skin) => skin.assetKey.startsWith('char-'))).toBe(true);
  });

  it('falls back safely for an unknown skin', () => {
    expect(getVisualSkin('does-not-exist')).toBe(VISUAL_SKINS[0]);
  });
});
