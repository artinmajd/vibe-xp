type Level = {
  level: number;
  name: string;
  threshold: number;
};

const LEVELS: Level[] = [
  { level: 1, name: "Builder", threshold: 0 },
  { level: 2, name: "Creator", threshold: 50 },
  { level: 3, name: "Inventor", threshold: 100 },
  { level: 4, name: "Engineer", threshold: 150 },
  { level: 5, name: "Architect", threshold: 220 },
  { level: 6, name: "Founder", threshold: 300 },
  { level: 7, name: "AI Master Builder", threshold: 400 },
];

export type LevelInfo = {
  level: number;
  name: string;
  currentThreshold: number;
  nextThreshold: number | null;
  xpToNext: number | null;
};

export function xpToLevel(xp: number): LevelInfo {
  let current = LEVELS[0];

  for (const l of LEVELS) {
    if (xp >= l.threshold) {
      current = l;
    } else {
      break;
    }
  }

  const nextLevel = LEVELS.find((l) => l.threshold > current.threshold) ?? null;

  return {
    level: current.level,
    name: current.name,
    currentThreshold: current.threshold,
    nextThreshold: nextLevel?.threshold ?? null,
    xpToNext: nextLevel ? nextLevel.threshold - xp : null,
  };
}
