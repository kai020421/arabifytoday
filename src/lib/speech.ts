/**
 * Web Speech API helper for Arabic pronunciation.
 *
 * Picks the best available Arabic voice (prefers Google Arabic / Microsoft
 * Naayf) and is careful to keep speak() inside the user gesture so iOS,
 * Safari and Chrome all play audio reliably.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];
let cachedVoice: SpeechSynthesisVoice | null = null;

function loadVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;
  cachedVoices = voices;

  const arabic = voices.filter((v) => v.lang?.toLowerCase().startsWith("ar"));
  // Priority: Google Arabic → Microsoft Naayf → ar-SA → ar-EG → any Arabic → null
  cachedVoice =
    voices.find((v) => /google.*arabic/i.test(v.name)) ??
    voices.find((v) => /naayf/i.test(v.name)) ??
    voices.find((v) => /microsoft.*ar/i.test(v.name)) ??
    arabic.find((v) => v.lang.toLowerCase() === "ar-sa") ??
    arabic.find((v) => v.lang.toLowerCase() === "ar-eg") ??
    arabic[0] ??
    null;
}

export function speakArabic(text: string, rate = 0.85): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;

  // Refresh voice list if it wasn't ready on initial load.
  if (cachedVoices.length === 0) loadVoices();

  // CRITICAL: build the utterance synchronously inside the user gesture.
  // Always cancel() first to clear any queued/stuck utterances.
  try {
    synth.cancel();
  } catch {
    /* ignore */
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ar-SA";
  utter.rate = rate;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  if (cachedVoice) utter.voice = cachedVoice;

  // Speak immediately — staying inside the click handler keeps iOS/Safari happy.
  synth.speak(utter);

  // Chrome occasionally enters a paused state after cancel(); kick it.
  if (synth.paused) synth.resume();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Warm up voice list on module load (browsers populate asynchronously).
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
}