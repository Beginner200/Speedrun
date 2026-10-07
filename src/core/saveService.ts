export type Skin = { id: string; name: string; price: number; color: number };
export type MissionProgress = { id: string; progress: number; claimed: boolean };
export type ScoreEntry = { score: number; date: string };
export type SaveData = {
  version: number;
  coins: number;
  bestScore: number;
  selectedSkin: string;
  ownedSkins: string[];
  tutorialSeen: boolean;
  settings: { sound: boolean; music: boolean; vibration: boolean; quality: 'low' | 'medium' | 'high'; debugFps: boolean };
  dailyReward: { day: number; lastClaimDate: string };
  missions: { date: string; items: MissionProgress[] };
  stats: { runs: number; coinsCollected: number; nearMisses: number };
  leaderboard: ScoreEntry[];
};
export type MissionDefinition = { id: string; title: string; target: number; reward: number; stat: 'runs' | 'coinsCollected' | 'nearMisses' };

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
  { id: 'neon', name: 'Neon', price: 1200, color: 0xf5ff4a },
  { id: 'daily7', name: 'Day 7', price: 0, color: 0xffffff }
];

export const MISSION_POOL: MissionDefinition[] = [
  { id: 'runs-3', title: 'Complete 3 runs', target: 3, reward: 40, stat: 'runs' },
  { id: 'coins-20', title: 'Collect 20 coins', target: 20, reward: 45, stat: 'coinsCollected' },
  { id: 'near-5', title: 'Score 5 near misses', target: 5, reward: 50, stat: 'nearMisses' },
  { id: 'runs-5', title: 'Complete 5 runs', target: 5, reward: 70, stat: 'runs' },
  { id: 'coins-35', title: 'Collect 35 coins', target: 35, reward: 75, stat: 'coinsCollected' },
  { id: 'near-10', title: 'Score 10 near misses', target: 10, reward: 90, stat: 'nearMisses' }
];

const DEFAULT_SAVE: SaveData = {
  version: VERSION,
  coins: 0,
  bestScore: 0,
  selectedSkin: 'mint',
  ownedSkins: ['mint', 'sky'],
  tutorialSeen: false,
  settings: { sound: true, music: true, vibration: true, quality: 'medium', debugFps: false },
  dailyReward: { day: 0, lastClaimDate: '' },
  missions: { date: '', items: [] },
  stats: { runs: 0, coinsCollected: 0, nearMisses: 0 },
  leaderboard: []
};

const cloneDefault = (): SaveData => ({
  ...DEFAULT_SAVE,
  ownedSkins: [...DEFAULT_SAVE.ownedSkins],
  settings: { ...DEFAULT_SAVE.settings },
  dailyReward: { ...DEFAULT_SAVE.dailyReward },
  missions: { date: '', items: [] },
  stats: { ...DEFAULT_SAVE.stats },
  leaderboard: []
});

export class SaveService {
  static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefault();
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const owned = Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins.filter((id): id is string => typeof id === 'string') : ['mint', 'sky'];
      const requestedQuality = parsed.settings?.quality;
      const settings: SaveData['settings'] = {
        sound: parsed.settings?.sound !== false,
        music: parsed.settings?.music !== false,
        vibration: parsed.settings?.vibration !== false,
        quality: requestedQuality === 'low' || requestedQuality === 'high' ? requestedQuality : 'medium',
        debugFps: parsed.settings?.debugFps === true
      };
      const daily: SaveData['dailyReward'] = {
        day: Math.min(7, Math.max(0, Number(parsed.dailyReward?.day) || 0)),
        lastClaimDate: typeof parsed.dailyReward?.lastClaimDate === 'string' ? parsed.dailyReward.lastClaimDate : ''
      };
      const missions: SaveData['missions'] = {
        date: typeof parsed.missions?.date === 'string' ? parsed.missions.date : '',
        items: Array.isArray(parsed.missions?.items)
          ? parsed.missions.items
              .filter((item): item is MissionProgress => Boolean(item && typeof item.id === 'string'))
              .map(item => ({ id: item.id, progress: Math.max(0, Number(item.progress) || 0), claimed: item.claimed === true }))
          : []
      };
      const stats: SaveData['stats'] = {
        runs: Math.max(0, Number(parsed.stats?.runs) || 0),
        coinsCollected: Math.max(0, Number(parsed.stats?.coinsCollected) || 0),
        nearMisses: Math.max(0, Number(parsed.stats?.nearMisses) || 0)
      };
      const leaderboard: SaveData['leaderboard'] = Array.isArray(parsed.leaderboard)
        ? parsed.leaderboard
            .filter((entry): entry is ScoreEntry => Boolean(entry && typeof entry === 'object'))
            .map(entry => ({ score: Math.max(0, Math.floor(Number(entry.score) || 0)), date: typeof entry.date === 'string' ? entry.date : '' }))
            .filter(entry => entry.date)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        : [];
      return {
        version: VERSION,
        coins: Math.max(0, Number(parsed.coins) || 0),
        bestScore: Math.max(0, Number(parsed.bestScore) || 0),
        selectedSkin: typeof parsed.selectedSkin === 'string' && SKINS.some(s => s.id === parsed.selectedSkin) ? parsed.selectedSkin : 'mint',
        ownedSkins: [...new Set(['mint', 'sky', ...owned])],
        tutorialSeen: parsed.tutorialSeen === true,
        settings,
        dailyReward: daily,
        missions,
        stats,
        leaderboard
      };
    } catch {
      return cloneDefault();
    }
  }

  static save(data: SaveData): void { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: VERSION })); }
  static addCoins(amount: number): SaveData { const data = this.load(); data.coins += Math.max(0, Math.floor(amount)); this.save(data); return data; }
  static spendCoins(amount: number): boolean { const data = this.load(); const cost = Math.max(0, Math.floor(amount)); if (data.coins < cost) return false; data.coins -= cost; this.save(data); return true; }
  static setBestScore(score: number): SaveData { const data = this.load(); data.bestScore = Math.max(data.bestScore, Math.floor(score)); this.save(data); return data; }

  static buyOrSelectSkin(id: string): { ok: boolean; purchased: boolean } {
    const data = this.load();
    const skin = SKINS.find(item => item.id === id);
    if (!skin) return { ok: false, purchased: false };
    if (data.ownedSkins.includes(id)) {
      data.selectedSkin = id;
      this.save(data);
      return { ok: true, purchased: false };
    }
    if (skin.price <= 0 || data.coins < skin.price) return { ok: false, purchased: false };
    data.coins -= skin.price;
    data.ownedSkins.push(id);
    data.selectedSkin = id;
    this.save(data);
    return { ok: true, purchased: true };
  }

  static recordRun(coinsCollected: number, nearMisses: number, score = 0): void {
    const data = this.load();
    const coins = Math.max(0, Math.floor(coinsCollected));
    const near = Math.max(0, Math.floor(nearMisses));
    const finalScore = Math.max(0, Math.floor(score));
    data.stats.runs += 1;
    data.stats.coinsCollected += coins;
    data.stats.nearMisses += near;
    data.bestScore = Math.max(data.bestScore, finalScore);
    data.leaderboard.push({ score: finalScore, date: new Date().toISOString().slice(0, 10) });
    data.leaderboard.sort((a, b) => b.score - a.score);
    data.leaderboard = data.leaderboard.slice(0, 10);
    for (const item of data.missions.items) {
      const mission = MISSION_POOL.find(m => m.id === item.id);
      if (!mission || item.claimed) continue;
      const amount = mission.stat === 'runs' ? 1 : mission.stat === 'coinsCollected' ? coins : near;
      item.progress = Math.min(mission.target, item.progress + amount);
    }
    this.save(data);
  }

  static markTutorialSeen(): void { const data = this.load(); data.tutorialSeen = true; this.save(data); }
  static setSetting<K extends keyof SaveData['settings']>(key: K, value: SaveData['settings'][K]): void { const data = this.load(); data.settings[key] = value; this.save(data); }
  static ensureMissions(today: string): MissionDefinition[] {
    const data = this.load();
    if (data.missions.date !== today || data.missions.items.length !== 3) {
      const offset = today.split('-').reduce((sum, part) => sum + Number(part), 0) % MISSION_POOL.length;
      data.missions = { date: today, items: [0, 1, 2].map(index => ({ id: MISSION_POOL[(offset + index) % MISSION_POOL.length].id, progress: 0, claimed: false })) };
      this.save(data);
    }
    return data.missions.items.map(item => MISSION_POOL.find(m => m.id === item.id)).filter((m): m is MissionDefinition => Boolean(m));
  }
  static claimMission(id: string): boolean { const data = this.load(); const item = data.missions.items.find(m => m.id === id); const mission = MISSION_POOL.find(m => m.id === id); if (!item || !mission || item.claimed || item.progress < mission.target) return false; item.claimed = true; data.coins += mission.reward; this.save(data); return true; }
  static rerollMission(id: string): boolean { const data = this.load(); const item = data.missions.items.find(m => m.id === id); if (!item || !item.claimed) return false; const used = new Set(data.missions.items.map(m => m.id)); const candidates = MISSION_POOL.filter(m => !used.has(m.id)); if (!candidates.length) return false; item.id = candidates[Math.floor(Math.random() * candidates.length)].id; item.progress = 0; item.claimed = false; this.save(data); return true; }
  static getMissionProgress(data: SaveData, mission: MissionDefinition): number { return Math.min(mission.target, data.missions.items.find(item => item.id === mission.id)?.progress ?? 0); }
  static claimDailyReward(today: string): { ok: boolean; day: number; reward: number; exclusiveSkin: boolean; reason?: string } {
    const data = this.load();
    if (data.dailyReward.lastClaimDate === today) return { ok: false, day: data.dailyReward.day, reward: 0, exclusiveSkin: false, reason: 'Already claimed today.' };
    if (data.dailyReward.lastClaimDate && today < data.dailyReward.lastClaimDate) return { ok: false, day: data.dailyReward.day, reward: 0, exclusiveSkin: false, reason: 'Device date moved backwards.' };
    const day = Math.min(7, data.dailyReward.day + 1);
    const reward = 20 + day * 10;
    data.coins += reward;
    let exclusiveSkin = false;
    if (day === 7 && !data.ownedSkins.includes('daily7')) { data.ownedSkins.push('daily7'); exclusiveSkin = true; }
    data.dailyReward = { day, lastClaimDate: today };
    this.save(data);
    return { ok: true, day, reward, exclusiveSkin };
  }
  static reset(): void { localStorage.removeItem(STORAGE_KEY); }
}

export const getSelectedSkin = (): Skin => {
  const data = SaveService.load();
  return SKINS.find(skin => skin.id === data.selectedSkin) ?? SKINS[0];
};
