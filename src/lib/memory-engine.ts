import { RAW_VOCABULARY, type Level, type RawWord } from "@/data/vocabulary";

const SECONDS_PER_DAY = 86400;
const INITIAL_HALF_LIFE = 0.15;
const MIN_HALF_LIFE = 0.1;
const CORRECT_MULTIPLIER = 2.1;
const INCORRECT_MULTIPLIER = 0.4;

export interface Word {
  id: number;
  target: string;
  known: string;
  level: Level;
  h: number; // half-life in days
  lastSeen: number; // unix seconds
  learned: boolean;
}

export type TierKey =
  | "EXPERT"
  | "VERY STRONG"
  | "STRONG"
  | "WEAK"
  | "VERY WEAK"
  | "FOCUS";

export interface Tier {
  key: TierKey;
  label: string;
  colorVar: string; // Tailwind class fragment, e.g. "tier-expert"
}

export const TIERS: Tier[] = [
  { key: "EXPERT", label: "Expert", colorVar: "tier-expert" },
  { key: "VERY STRONG", label: "Very Strong", colorVar: "tier-very-strong" },
  { key: "STRONG", label: "Strong", colorVar: "tier-strong" },
  { key: "WEAK", label: "Weak", colorVar: "tier-weak" },
  { key: "VERY WEAK", label: "Very Weak", colorVar: "tier-very-weak" },
  { key: "FOCUS", label: "Focus", colorVar: "tier-focus" },
];

export function createWord(raw: RawWord, id: number): Word {
  return {
    id,
    target: raw.target,
    known: raw.known,
    level: raw.level,
    h: INITIAL_HALF_LIFE,
    lastSeen: 0,
    learned: false,
  };
}

export function buildInitialVocab(): Word[] {
  return RAW_VOCABULARY.map((r, i) => createWord(r, i));
}

/**
 * Half-Life Regression recall probability.
 * p(t) = 2^(-Δt / h)
 */
export function getRecallProbability(word: Word, now: number = Date.now() / 1000): number {
  if (word.lastSeen === 0) return 0;
  const deltaT = (now - word.lastSeen) / SECONDS_PER_DAY;
  return Math.pow(2, -deltaT / word.h);
}

export function getTier(h: number): Tier {
  if (h >= 30.0) return TIERS[0];
  if (h >= 7.0) return TIERS[1];
  if (h >= 1.0) return TIERS[2];
  if (h >= 0.5) return TIERS[3];
  if (h >= 0.2) return TIERS[4];
  return TIERS[5];
}

export function markLearned(word: Word, now: number = Date.now() / 1000): Word {
  return { ...word, learned: true, lastSeen: now };
}

export function applyPracticeResult(word: Word, correct: boolean, now: number = Date.now() / 1000): Word {
  let h = correct ? word.h * CORRECT_MULTIPLIER : word.h * INCORRECT_MULTIPLIER;
  if (h < MIN_HALF_LIFE) h = MIN_HALF_LIFE;
  return { ...word, h, lastSeen: now };
}

/** Pick the learned word with the lowest recall probability (with jitter). */
export function pickPracticeIndex(vocab: Word[], currentIdx: number): number {
  const learnedIdx = vocab.map((w, i) => (w.learned ? i : -1)).filter((i) => i >= 0);
  if (learnedIdx.length === 0) return -1;
  let best = -1;
  let minP = 2.0;
  const now = Date.now() / 1000;
  for (const i of learnedIdx) {
    if (i === currentIdx) continue;
    const p = getRecallProbability(vocab[i], now) + Math.random() / 1e5;
    if (p < minP) {
      minP = p;
      best = i;
    }
  }
  return best === -1 ? learnedIdx[0] : best;
}

export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase();
}

/** Forecast aggregate retention curve over the next N days for the dashboard graph. */
export function buildRetentionForecast(vocab: Word[], days = 30, points = 30) {
  const learned = vocab.filter((w) => w.learned);
  const data: { day: number; retention: number; expected: number }[] = [];
  if (learned.length === 0) {
    for (let i = 0; i <= points; i++) {
      data.push({ day: (i / points) * days, retention: 0, expected: 0 });
    }
    return data;
  }
  const now = Date.now() / 1000;
  for (let i = 0; i <= points; i++) {
    const dayOffset = (i / points) * days;
    const futureNow = now + dayOffset * SECONDS_PER_DAY;
    let sum = 0;
    for (const w of learned) sum += getRecallProbability(w, futureNow);
    const avg = sum / learned.length;
    data.push({
      day: Number(dayOffset.toFixed(2)),
      retention: Math.round(avg * 100),
      expected: Math.round(avg * learned.length),
    });
  }
  return data;
}