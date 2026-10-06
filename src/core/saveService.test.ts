import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SaveService, SKINS } from './saveService';

const storage = new Map<string, string>();

beforeAll(() => {
  const mockStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
    clear: () => { storage.clear(); },
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() { return storage.size; }
  };
  Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, configurable: true });
});

afterEach(() => SaveService.reset());

describe('SaveService', () => {
  it('creates the default save with two free skins', () => {
    const data = SaveService.load();
    expect(data.version).toBe(1);
    expect(data.coins).toBe(0);
    expect(data.ownedSkins).toEqual(expect.arrayContaining(['mint', 'sky']));
    expect(data.leaderboard).toEqual([]);
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

  it('records run stats, mission progress, and top scores', () => {
    SaveService.ensureMissions('2026-10-06');
    SaveService.recordRun(12, 4, 500);
    const data = SaveService.load();
    expect(data.stats).toMatchObject({ runs: 1, coinsCollected: 12, nearMisses: 4 });
    expect(data.bestScore).toBe(500);
    expect(data.leaderboard[0]).toMatchObject({ score: 500, date: expect.any(String) });
  });

  it('blocks duplicate daily rewards and backwards dates', () => {
    expect(SaveService.claimDailyReward('2026-10-06').ok).toBe(true);
    expect(SaveService.claimDailyReward('2026-10-06').ok).toBe(false);
    expect(SaveService.claimDailyReward('2026-10-05').ok).toBe(false);
  });

  it('unlocks the day 7 skin', () => {
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'];
    dates.forEach(date => expect(SaveService.claimDailyReward(date).ok).toBe(true));
    expect(SaveService.load().ownedSkins).toContain('daily7');
    expect(SaveService.load().dailyReward.day).toBe(7);
  });
});
