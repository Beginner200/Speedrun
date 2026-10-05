import { afterEach, describe, expect, it } from 'vitest';
import { SaveService, SKINS } from './saveService';

afterEach(() => SaveService.reset());

describe('SaveService', () => {
  it('creates the default save with two free skins', () => {
    const data = SaveService.load();
    expect(data.version).toBe(1);
    expect(data.coins).toBe(0);
    expect(data.ownedSkins).toEqual(expect.arrayContaining(['mint', 'sky']));
  });

  it('persists coins and best score', () => {
    SaveService.addCoins(125);
    SaveService.setBestScore(900);
    expect(SaveService.load()).toMatchObject({ coins: 125, bestScore: 900 });
  });

  it('prevents purchases without enough coins', () => {
    const result = SaveService.buyOrSelectSkin(SKINS[2].id);
    expect(result.ok).toBe(false);
    expect(SaveService.load().ownedSkins).not.toContain(SKINS[2].id);
  });

  it('buys and equips a skin exactly once', () => {
    SaveService.addCoins(SKINS[2].price);
    const first = SaveService.buyOrSelectSkin(SKINS[2].id);
    const second = SaveService.buyOrSelectSkin(SKINS[2].id);
    expect(first.ok).toBe(true);
    expect(first.purchased).toBe(true);
    expect(second.purchased).toBe(false);
    expect(SaveService.load().coins).toBe(0);
    expect(SaveService.load().selectedSkin).toBe(SKINS[2].id);
  });
});
