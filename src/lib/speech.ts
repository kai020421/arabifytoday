/**
 * Web Speech API helper for Arabic pronunciation.
 * Picks the best available Arabic voice and falls back gracefully.
 */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickArabicVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    cachedVoice = null;
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  const arabic = voices.filter((v) => v.lang?.toLowerCase().startsWith("ar"));
  if (arabic.length === 0) {
    // voices may not be loaded yet — don't cache null in that case
    return null;
  }
  // Prefer Saudi, then Egyptian, then any Arabic
  cachedVoice =
    arabic.find((v) => v.lang.toLowerCase() === "ar-sa") ??
    arabic.find((v) => v.lang.toLowerCase() === "ar-eg") ??
    arabic[0];
  return cachedVoice;
}

export function speakArabic(text: string, rate = 0.85): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  // CRITICAL: build the utterance synchronously inside the user gesture so
  // browsers (esp. Safari/iOS) allow it. Avoid awaiting before .speak().
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ar-SA";
  utter.rate = rate;
  utter.pitch = 1;
  const voice = pickArabicVoice();
  if (voice) utter.voice = voice;

  // Some browsers get stuck in a "paused" state — make sure we resume.
  try {
    if (synth.speaking || synth.pending) synth.cancel();
  } catch {
    /* ignore */
  }
  // Defer slightly so cancel() finishes flushing the queue first.
  // Using a microtask-ish delay keeps us within the gesture window.
  synth.speak(utter);
  // Workaround: Chrome sometimes pauses synthesis after cancel(); resume.
  if (synth.paused) synth.resume();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Warm up voice list on load (some browsers populate asynchronously)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // Trigger initial load (some browsers need this kick)
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = undefined;
    pickArabicVoice();
  });
}