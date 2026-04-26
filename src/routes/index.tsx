import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, GraduationCap, Sparkles, Target, ArrowRight, RotateCcw, Keyboard, ListChecks, SquarePen, ToggleLeft, Shuffle } from "lucide-react";
import {
  applyPracticeResult,
  buildInitialVocab,
  getRecallProbability,
  getTier,
  markLearned,
  pickPracticeIndex,
  type Word,
} from "@/lib/memory-engine";
import { Flashcard } from "@/components/learning/Flashcard";
import { RetentionGraph } from "@/components/learning/RetentionGraph";
import { HalfLifeChart } from "@/components/learning/HalfLifeChart";
import { StatsTable } from "@/components/learning/StatsTable";
import { StatCard } from "@/components/learning/StatBadge";
import { PracticePanel } from "@/components/learning/PracticePanel";
import type { QuizKind } from "@/lib/quiz";
import { pickFeedbackPhrase } from "@/lib/feedback";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Memory Engine — Arabic Learning Dashboard" },
      {
        name: "description",
        content:
          "Learn 200 Arabic words with a Half-Life Regression spaced repetition engine. Track stability tiers, retention forecasts, and practice with smart flashcards.",
      },
    ],
  }),
});

type Mode = "learning" | "practice";

function Index() {
  const [vocab, setVocab] = useState<Word[]>(() => buildInitialVocab());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("learning");
  const [quizKind, setQuizKind] = useState<QuizKind>("random");
  const [questionSeed, setQuestionSeed] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [feedbackPhrase, setFeedbackPhrase] = useState<string>("");
  const [, forceTick] = useState(0);

  // Re-render every 30s so recall % decays visually.
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const learned = vocab.filter((w) => w.learned);
    const tiers = { mastered: 0, needsPractice: 0 };
    let avgP = 0;
    const now = Date.now() / 1000;
    for (const w of learned) {
      const t = getTier(w.h);
      if (t.key === "EXPERT" || t.key === "VERY STRONG" || t.key === "STRONG") {
        tiers.mastered++;
      }
      if (t.key === "FOCUS" || t.key === "VERY WEAK" || t.key === "WEAK") {
        tiers.needsPractice++;
      }
      avgP += getRecallProbability(w, now);
    }
    const avgRecallPct = learned.length === 0 ? 0 : (avgP / learned.length) * 100;
    return {
      learnedCount: learned.length,
      total: vocab.length,
      avgRecall: Math.round(avgRecallPct),
      likelyForget: Math.round(100 - avgRecallPct),
      ...tiers,
    };
  }, [vocab, currentIdx]);

  const word = vocab[currentIdx];

  function nextLearningWord() {
    setCurrentIdx((i) => (i + 1) % vocab.length);
  }

  function nextPracticeWord(updated: Word[]) {
    const idx = pickPracticeIndex(updated, currentIdx);
    if (idx === -1) {
      setMode("learning");
      return;
    }
    setCurrentIdx(idx);
    setQuestionSeed((s) => s + 1);
  }

  function handleLearned() {
    const updated = [...vocab];
    updated[currentIdx] = markLearned(updated[currentIdx]);
    setVocab(updated);
    nextLearningWord();
  }

  function handlePracticeAnswer(correct: boolean) {
    setFeedback(correct ? "correct" : "incorrect");
    setFeedbackPhrase(pickFeedbackPhrase(correct));
    const updated = [...vocab];
    updated[currentIdx] = applyPracticeResult(updated[currentIdx], correct);
    setVocab(updated);
    window.setTimeout(() => {
      setFeedback(null);
      setFeedbackPhrase("");
      nextPracticeWord(updated);
    }, 900);
  }

  function toggleMode() {
    const next: Mode = mode === "learning" ? "practice" : "learning";
    setMode(next);
    setFeedback(null);
    if (next === "practice") {
      const idx = pickPracticeIndex(vocab, -1);
      if (idx === -1) {
        setMode("learning");
        return;
      }
      setCurrentIdx(idx);
      setQuestionSeed((s) => s + 1);
    } else {
      setCurrentIdx(0);
    }
  }

  function resetProgress() {
    if (!window.confirm("Reset all learning progress?")) return;
    setVocab(buildInitialVocab());
    setCurrentIdx(0);
    setMode("learning");
  }

  const progressPct = Math.round((stats.learnedCount / stats.total) * 100);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 text-slate-100 bg-zinc-950">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Half-Life Regression Engine v4.0
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-primary">ArabifyToday</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Learn 200 essential Arabic words with adaptive spaced repetition. Each word's
              half-life evolves with your performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Words Unlocked"
            value={`${stats.learnedCount}/${stats.total}`}
            hint={`${progressPct}% of vocabulary`}
          />
          <StatCard label="Avg Recall" value={`${stats.avgRecall}%`} accent="strong" hint="Across learned words" />
          <StatCard
            label="Mastered"
            value={stats.mastered}
            accent="expert"
            hint="Strong, Very Strong & Expert"
          />
          <StatCard
            label="Needs Practice"
            value={stats.needsPractice}
            accent="focus"
            hint="Focus, Very Weak & Weak"
          />
        </section>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Progress</span>
            <span className="font-mono">{progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-[image:var(--gradient-primary)]"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        {/* Practice + chart */}
        <section className="mb-10 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {/* Mode toggle */}
            <div className="mb-4 inline-flex rounded-xl border border-border bg-card/60 p-1 backdrop-blur-sm">
              {(["learning", "practice"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => mode !== m && toggleMode()}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                    mode === m
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "learning" ? <GraduationCap className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                  {m === "learning" ? "Learn" : "Practice"}
                </button>
              ))}
            </div>

            <Flashcard word={word} showTranslation={mode === "learning"} feedback={feedback} />

            {mode === "practice" && stats.learnedCount > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[oklch(0.72_0.19_145/0.35)] bg-[oklch(0.72_0.19_145/0.08)] p-3 backdrop-blur-sm">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Likely to Remember
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-[oklch(0.82_0.18_145)]">
                    {stats.avgRecall}%
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-[oklch(0.72_0.19_145)] transition-[width] duration-700"
                      style={{ width: `${stats.avgRecall}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-[oklch(0.65_0.22_25/0.35)] bg-[oklch(0.65_0.22_25/0.08)] p-3 backdrop-blur-sm">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Likely to Forget
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-[oklch(0.78_0.18_30)]">
                    {stats.likelyForget}%
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-[oklch(0.65_0.22_25)] transition-[width] duration-700"
                      style={{ width: `${stats.likelyForget}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action area */}
            <div className="mt-4 space-y-3">
              {mode === "practice" && (
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { k: "random", label: "Random Mix", Icon: Shuffle },
                      { k: "typing", label: "Typing", Icon: Keyboard },
                      { k: "mcq", label: "MCQ", Icon: ListChecks },
                      { k: "fillblank", label: "Fill Blank", Icon: SquarePen },
                      { k: "truefalse", label: "True / False", Icon: ToggleLeft },
                    ] as const
                  ).map(({ k, label, Icon }) => (
                    <button
                      key={k}
                      onClick={() => {
                        if (quizKind === k) return;
                        setQuizKind(k);
                        setFeedback(null);
                        setQuestionSeed((s) => s + 1);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        quizKind === k
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {mode === "learning" ? (
                <button
                  onClick={handleLearned}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  Mark as Learned
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <PracticePanel
                  word={word}
                  vocab={vocab}
                  kind={quizKind}
                  resetKey={`${currentIdx}-${quizKind}-${questionSeed}`}
                  onAnswer={handlePracticeAnswer}
                  feedback={feedback}
                />
              )}

              <AnimatePresence>
                {mode === "practice" && feedback && feedbackPhrase && (
                  <motion.div
                    key={feedbackPhrase}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={`mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-sm ${
                      feedback === "correct"
                        ? "border-[oklch(0.72_0.19_145/0.4)] bg-[oklch(0.72_0.19_145/0.12)] text-[oklch(0.82_0.18_145)]"
                        : "border-[oklch(0.65_0.22_25/0.4)] bg-[oklch(0.65_0.22_25/0.12)] text-[oklch(0.78_0.18_30)]"
                    }`}
                  >
                    {feedback === "correct" ? "✨" : "🌱"} {feedbackPhrase}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="h-3.5 w-3.5" />
              {mode === "learning"
                ? "Browse new vocabulary. Mark words as learned to add them to your practice queue."
                : "The engine picks the word with the lowest predicted recall."}
            </div>
          </div>

          <div className="lg:col-span-2">
            <RetentionGraph vocab={vocab} />
          </div>
        </section>

        {/* Half-life distribution */}
        <section className="mb-10">
          <HalfLifeChart vocab={vocab} />
        </section>

        {/* Stats table */}
        <section className="mb-12">
          <StatsTable vocab={vocab} />
        </section>

        <footer className="border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          Memory Engine v4.0 — Powered by Half-Life Regression
        </footer>
      </div>
    </main>
  );
}
