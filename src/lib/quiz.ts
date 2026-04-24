import type { Word } from "./memory-engine";

export type QuizKind = "typing" | "mcq" | "fillblank" | "truefalse" | "random";

/** The actual question kinds that can be rendered (no "random", no "typing"). */
export type RenderableQuizKind = "mcq" | "fillblank" | "truefalse";

const RANDOM_POOL: RenderableQuizKind[] = ["mcq", "fillblank", "truefalse"];

export function pickRandomQuizKind(prev?: RenderableQuizKind): RenderableQuizKind {
  // Avoid repeating the same kind twice in a row when possible
  const pool = prev ? RANDOM_POOL.filter((k) => k !== prev) : RANDOM_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface MCQQuestion {
  kind: "mcq";
  prompt: string; // Arabic word
  choices: string[]; // English options
  correctIndex: number;
}

export interface FillBlankQuestion {
  kind: "fillblank";
  /** Sentence with `___` blank where the English meaning should go. */
  sentence: string;
  answer: string;
  arabic: string;
}

export interface TrueFalseQuestion {
  kind: "truefalse";
  arabic: string;
  proposed: string; // English shown to user
  isTrue: boolean;
  correctAnswer: string; // actual English meaning
}

export type Question = MCQQuestion | FillBlankQuestion | TrueFalseQuestion;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(vocab: Word[], correct: Word, count: number): Word[] {
  // Prefer same-level distractors for plausibility, fall back to all vocab.
  const pool = vocab.filter((w) => w.id !== correct.id);
  const sameLevel = pool.filter((w) => w.level === correct.level);
  const source = sameLevel.length >= count ? sameLevel : pool;
  return shuffle(source).slice(0, count);
}

export function buildMCQ(word: Word, vocab: Word[]): MCQQuestion {
  const distractors = pickDistractors(vocab, word, 3).map((w) => w.known);
  const choices = shuffle([word.known, ...distractors]);
  return {
    kind: "mcq",
    prompt: word.target,
    choices,
    correctIndex: choices.indexOf(word.known),
  };
}

export function buildFillBlank(word: Word): FillBlankQuestion {
  const sentence = `The Arabic word "${word.target}" means ___.`;
  return {
    kind: "fillblank",
    sentence,
    answer: word.known,
    arabic: word.target,
  };
}

export function buildTrueFalse(word: Word, vocab: Word[]): TrueFalseQuestion {
  const showTrue = Math.random() < 0.5;
  if (showTrue) {
    return {
      kind: "truefalse",
      arabic: word.target,
      proposed: word.known,
      isTrue: true,
      correctAnswer: word.known,
    };
  }
  const fake = pickDistractors(vocab, word, 1)[0];
  return {
    kind: "truefalse",
    arabic: word.target,
    proposed: fake?.known ?? word.known,
    isTrue: false,
    correctAnswer: word.known,
  };
}

export function buildQuestion(
  kind: Exclude<QuizKind, "typing">,
  word: Word,
  vocab: Word[],
): Question {
  if (kind === "mcq") return buildMCQ(word, vocab);
  if (kind === "fillblank") return buildFillBlank(word);
  return buildTrueFalse(word, vocab);
}