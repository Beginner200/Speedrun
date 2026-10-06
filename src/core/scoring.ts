export type ComboState = {
  combo: number;
  timerMs: number;
  bonus: number;
};

export function addNearMiss(state: ComboState, nearMissScore: number, maxCombo = 9, comboWindowMs = 1800): ComboState {
  const combo = Math.min(maxCombo, state.combo + 1);
  return {
    combo,
    timerMs: comboWindowMs,
    bonus: state.bonus + nearMissScore * combo
  };
}

export function tickCombo(state: ComboState, deltaMs: number): ComboState {
  const timerMs = Math.max(0, state.timerMs - Math.max(0, deltaMs));
  return timerMs === 0 ? { ...state, timerMs: 0, combo: 0 } : { ...state, timerMs };
}

export function calculateScore(distance: number, scorePerMeter: number, bonus: number, coins: number, coinScoreValue: number): number {
  return Math.max(0, Math.floor(distance * scorePerMeter) + Math.floor(bonus) + Math.floor(coins) * coinScoreValue);
}
