import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { Word } from "@/lib/memory-engine";
import { getTier } from "@/lib/memory-engine";
import { TierBadge } from "./StatBadge";
import { speakArabic } from "@/lib/speech";

interface FlashcardProps {
  word: Word;
  showTranslation: boolean;
  feedback?: "correct" | "incorrect" | null;
}

export function Flashcard({ word, showTranslation, feedback }: FlashcardProps) {
  const tier = getTier(word.h);
  const ringClass =
    feedback === "correct"
      ? "ring-2 ring-[oklch(0.72_0.19_145)] shadow-[0_0_60px_-10px_oklch(0.72_0.19_145/0.5)]"
      : feedback === "incorrect"
        ? "ring-2 ring-[oklch(0.65_0.22_25)] shadow-[0_0_60px_-10px_oklch(0.65_0.22_25/0.5)]"
        : "shadow-[var(--shadow-elegant)]";

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border/60 bg-[image:var(--gradient-card)] p-8 sm:p-12 transition-all ${ringClass}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {word.level}
        </span>
        <TierBadge tier={tier} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center gap-6 py-10 sm:py-14"
        >
          <div
            dir="rtl"
            lang="ar"
            className="text-center text-6xl font-bold leading-tight text-primary sm:text-8xl"
            style={{
              textShadow: "0 0 40px oklch(0.75 0.16 230 / 0.35)",
              fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
            }}
          >
            {word.target}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speakArabic(word.target);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/60 hover:text-primary"
            aria-label={`Pronounce ${word.target}`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            Pronounce
          </button>

          <AnimatePresence>
            {showTranslation && (
              <motion.div
                key={`tr-${word.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="text-2xl font-medium text-muted-foreground sm:text-3xl"
              >
                {word.known}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Half-life: <span className="font-mono text-foreground/80">{word.h.toFixed(2)}d</span></span>
        <span>
          Last seen:{" "}
          <span className="font-mono text-foreground/80">
            {word.lastSeen === 0 ? "never" : `${Math.round((Date.now() / 1000 - word.lastSeen) / 60)}m ago`}
          </span>
        </span>
      </div>
    </div>
  );
}