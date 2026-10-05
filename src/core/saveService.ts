export type Skin = {
  id: string;
  name: string;
  price: number;
  color: number;
};

export type SaveData = {
  version: number;
  coins: number;
  bestScore: number;
  selectedSkin: string;
  ownedSkins: string[];
};

const STORAGE_KEY = 'dash-dodge-save-v1';
const VERSION = 1;

export const SKINS: Skin[] = [
  { id: 'mint', name: 'Mint', price: 0, color: 0x38e8b0 },
  { id: 'sky', name: 'Sky', price: 0, color: 0x66b6ff },
  { id: 'sunset', name: 'Sunset', price: 150, color: 0xff7a59 },
  { id: 'violet', name: 'Violet', price: 250, color: 0xb77cff },
  { id: 'gold', name: 'Gold', price: 400, color: 0xffd166 },
  { id: 'crimson', name: 'Crimson', price: 600, color: 0xff5d73 },
  { id: 'ice', name: 'Ice', price: 850, color: 0x9be7ff },
  { id: 'neon', name: 'Neon', price: 1200, color: 0xf5ff4a }
];

const DEFAULT_SAVE: SaveData = {
  version: VERSION,
  coins: 0,
  bestScore: 0,
  selectedSkin: 'mint',
  ownedSkins: ['mint', 'sky']
};

export class SaveService {
  static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE, ownedSkins: [...DEFAULT_SAVE.ownedSkins] };
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const owned = Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins.filter((id): id is string => typeof id === 'string') : [...DEFAULT_SAVE.ownedSkins];
      return {
        version: VERSION,
        coins: Math.max(0, Number(parsed.coins) || 0),
        bestScore: Math.max(0, Number(parsed.bestScore) || 0),
        selectedSkin: typeof parsed.selectedSkin === 'string' && SKINS.some((skin) => skin.id === parsed.selectedSkin) ? parsed.selectedSkin : 'mint',
        ownedSkins: [...new Set(['mint', 'sky', ...owned])]
      };
    } catch {
      return { ...DEFAULT_SAVE, ownedSkins: [...DEFAULT_SAVE.ownedSkins] };
    }
  }

  static save(data: SaveData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: VERSION }));
  }

  static addCoins(amount: number): SaveData {
    const data = this.load();
    data.coins += Math.max(0, Math.floor(amount));
    this.save(data);
    return data;
  }

  static spendCoins(amount: number): boolean {
    const data = this.load();
    const cost = Math.max(0, Math.floor(amount));
    if (data.coins < cost) return false;
    data.coins -= cost;
    this.save(data);
    return true;
  }

  static setBestScore(score: number): SaveData {
    const data = this.load();
    data.bestScore = Math.max(data.bestScore, Math.floor(score));
    this.save(data);
    return data;
  }

  static buyOrSelectSkin(id: string): { ok: boolean; purchased: boolean; data: SaveData } {
    const data = this.load();
    const skin = SKINS.find((item) => item.id === id);
    if (!skin) return { ok: false, purchased: false, data };
    if (data.ownedSkins.includes(id)) {
      data.selectedSkin = id;
      this.save(data);
      return { ok: true, purchased: false, data };
    }
    if (data.coins < skin.price) return { ok: false, purchased: false, data };
    data.coins -= skin.price;
    data.ownedSkins.push(id);
    data.selectedSkin = id;
    this.save(data);
    return { ok: true, purchased: true, data };
  }

  static reset(): void { localStorage.removeItem(STORAGE_KEY); }
}

export const getSelectedSkin = (): Skin => {
  const data = SaveService.load();
  return SKINS.find((skin) => skin.id === data.selectedSkin) ?? SKINS[0];
};
