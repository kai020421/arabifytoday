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
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ar-SA";
  utter.rate = rate;
  utter.pitch = 1;
  const voice = pickArabicVoice();
  if (voice) utter.voice = voice;
  synth.speak(utter);
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Warm up voice list on load (some browsers populate asynchronously)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
    pickArabicVoice();
  };
}