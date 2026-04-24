const CORRECT_PHRASES = [
  "Perfect Recall!",
  "On your way to Expert!",
  "Excellent — locked in!",
  "Beautifully done!",
  "Sharp memory!",
  "Mumtaz! 🌟",
  "You're mastering this.",
  "Crystal clear!",
];

const INCORRECT_PHRASES = [
  "Almost — let it sink in.",
  "No worries, repetition wins.",
  "Close! We'll revisit it soon.",
  "Good try — your half-life resets.",
  "Learning, not failing.",
];

export function pickFeedbackPhrase(correct: boolean): string {
  const pool = correct ? CORRECT_PHRASES : INCORRECT_PHRASES;
  return pool[Math.floor(Math.random() * pool.length)];
}