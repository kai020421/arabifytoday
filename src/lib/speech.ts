/**
 * URL-based Arabic pronunciation using Google Translate's TTS endpoint.
 *
 * The browser Web Speech API is unreliable in sandboxed/virtualized
 * environments — voices often fail to load. Streaming an MP3 from
 * translate.google.com gives a clear, natural Arabic accent and works
 * instantly on every platform.
 */

let currentAudio: HTMLAudioElement | null = null;

export function speakArabic(text: string): void {
  if (typeof window === "undefined") return;

  console.log("Playing Audio for:", text);

  // Stop any currently-playing pronunciation before starting a new one.
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text,
  )}&tl=ar&client=tw-ob`;

  const audio = new Audio(url);
  audio.crossOrigin = "anonymous";
  currentAudio = audio;

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((err) => {
      console.error("Audio playback failed:", err);
    });
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}