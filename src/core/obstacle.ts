export type ObstaclePattern = {
  blockedLanes: number[];
};

export function isSafePattern(pattern: ObstaclePattern, laneCount: number): boolean {
  if (laneCount <= 0) return false;
  const unique = new Set(pattern.blockedLanes);
  return unique.size < laneCount && [...unique].every((lane) => lane >= 0 && lane < laneCount);
}

export function buildSafePattern(laneCount: number, random = Math.random): ObstaclePattern {
  if (laneCount < 2) return { blockedLanes: [] };
  const maxBlocked = laneCount - 1;
  const blockCount = random() < 0.28 ? Math.min(2, maxBlocked) : 1;
  const available = Array.from({ length: laneCount }, (_, lane) => lane);
  const blockedLanes: number[] = [];
  for (let i = 0; i < blockCount; i++) {
    const index = Math.floor(random() * available.length);
    blockedLanes.push(available[index]);
    available.splice(index, 1);
  }
  return { blockedLanes };
}

export function hasSafeLane(pattern: ObstaclePattern, laneCount: number): boolean {
  return isSafePattern(pattern, laneCount) && pattern.blockedLanes.length < laneCount;
}

export function isTemporallyReachable(previous: ObstaclePattern | null, next: ObstaclePattern, laneCount: number, previousPlayerLane?: number): boolean {
  if (!isSafePattern(next, laneCount)) return false;
  const previousSafe = Array.from({ length: laneCount }, (_, lane) => lane).filter(lane => !previous?.blockedLanes.includes(lane));
  const nextSafe = Array.from({ length: laneCount }, (_, lane) => lane).filter(lane => !next.blockedLanes.includes(lane));
  if (!nextSafe.length) return false;
  const starts = previousPlayerLane !== undefined ? [previousPlayerLane] : previousSafe;
  return starts.some(from => nextSafe.some(to => Math.abs(from - to) <= 1));
}

export function buildTemporallySafePattern(laneCount: number, previous: ObstaclePattern | null, random = Math.random, previousPlayerLane?: number): ObstaclePattern {
  for (let attempt = 0; attempt < 24; attempt++) {
    const candidate = buildSafePattern(laneCount, random);
    if (isTemporallyReachable(previous, candidate, laneCount, previousPlayerLane)) return candidate;
  }
  return { blockedLanes: laneCount === 3 ? [1] : [Math.max(0, laneCount - 1)] };
}
