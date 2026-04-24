import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { Word } from "@/lib/memory-engine";
import { normalizeAnswer } from "@/lib/memory-engine";
import {
  buildQuestion,
  type FillBlankQuestion,
  type MCQQuestion,
  type Question,
  type QuizKind,
  type TrueFalseQuestion,
} from "@/lib/quiz";

interface PracticePanelProps {
  word: Word;
  vocab: Word[];
  kind: QuizKind;
  /** Resets internal state when this changes (new word or kind). */
  resetKey: string;
  onAnswer: (correct: boolean) => void;
  feedback: "correct" | "incorrect" | null;
}

export function PracticePanel({ word, vocab, kind, resetKey, onAnswer, feedback }: PracticePanelProps) {
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const question = useMemo<Question | null>(() => {
    if (kind === "typing") return null;
    return buildQuestion(kind, word, vocab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    setTyped("");
    setPicked(null);
    if (kind === "typing" || kind === "fillblank") inputRef.current?.focus();
  }, [resetKey, kind]);

  function submitTyping() {
    if (typed.trim().length === 0 || feedback) return;
    onAnswer(normalizeAnswer(typed) === normalizeAnswer(word.known));
  }

  function submitFillBlank() {
    if (typed.trim().length === 0 || feedback) return;
    const q = question as FillBlankQuestion;
    onAnswer(normalizeAnswer(typed) === normalizeAnswer(q.answer));
  }

  function submitMCQ(idx: number) {
    if (feedback) return;
    setPicked(idx);
    const q = question as MCQQuestion;
    onAnswer(idx === q.correctIndex);
  }

  function submitTrueFalse(answer: boolean) {
    if (feedback) return;
    setPicked(answer ? 1 : 0);
    const q = question as TrueFalseQuestion;
    onAnswer(answer === q.isTrue);
  }

  if (kind === "typing") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitTyping()}
          placeholder="Type the English translation…"
          className="flex-1 rounded-xl border border-border bg-card/60 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={submitTyping}
          disabled={typed.trim().length === 0 || !!feedback}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          Verify
        </button>
      </div>
    );
  }

  if (!question) return null;

  if (question.kind === "mcq") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {question.choices.map((c, i) => {
          const isPicked = picked === i;
          const isCorrect = i === question.correctIndex;
          const showState = feedback && (isPicked || (feedback === "incorrect" && isCorrect));
          const stateClass = !showState
            ? "border-border bg-card/60 hover:border-primary/60 hover:bg-card"
            : isCorrect
              ? "border-[oklch(0.72_0.19_145)] bg-[oklch(0.72_0.19_145/0.15)] text-foreground"
              : "border-[oklch(0.65_0.22_25)] bg-[oklch(0.65_0.22_25/0.15)] text-foreground";
          return (
            <motion.button
              key={`${resetKey}-${i}`}
              whileTap={{ scale: 0.98 }}
              onClick={() => submitMCQ(i)}
              disabled={!!feedback}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all disabled:cursor-not-allowed ${stateClass}`}
            >
              <span>{c}</span>
              {showState && (isCorrect ? <Check className="h-4 w-4 text-[oklch(0.72_0.19_145)]" /> : <X className="h-4 w-4 text-[oklch(0.65_0.22_25)]" />)}
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (question.kind === "fillblank") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card/60 p-4 text-base text-foreground">
          {question.sentence.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="mx-1 inline-block min-w-24 border-b-2 border-dashed border-primary/60 px-2 text-center align-baseline font-mono text-primary">
                  {typed || "\u00a0"}
                </span>
              )}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitFillBlank()}
            placeholder="Fill in the blank…"
            className="flex-1 rounded-xl border border-border bg-card/60 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={submitFillBlank}
            disabled={typed.trim().length === 0 || !!feedback}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  // true / false
  const tf = question;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Proposed meaning</span>
        <div className="mt-1 text-xl font-semibold text-foreground">{tf.proposed}</div>
        {feedback === "incorrect" && (
          <div className="mt-2 text-xs text-muted-foreground">
            Correct: <span className="font-mono text-primary">{tf.correctAnswer}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "True", value: true, idx: 1 },
          { label: "False", value: false, idx: 0 },
        ].map(({ label, value, idx }) => {
          const isPicked = picked === idx;
          const isCorrect = value === tf.isTrue;
          const showState = feedback && (isPicked || (feedback === "incorrect" && isCorrect));
          const stateClass = !showState
            ? "border-border bg-card/60 hover:border-primary/60"
            : isCorrect
              ? "border-[oklch(0.72_0.19_145)] bg-[oklch(0.72_0.19_145/0.15)]"
              : "border-[oklch(0.65_0.22_25)] bg-[oklch(0.65_0.22_25/0.15)]";
          return (
            <motion.button
              key={label}
              whileTap={{ scale: 0.98 }}
              onClick={() => submitTrueFalse(value)}
              disabled={!!feedback}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed ${stateClass}`}
            >
              {label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}