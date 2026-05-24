export interface Phrase {
  target: string;
  known: string;
  category: "Phrase" | "Sentence";
}

export const PHRASES: Phrase[] = [
  // Common Phrases
  { target: "السلام عليكم", known: "Peace be upon you", category: "Phrase" },
  { target: "وعليكم السلام", known: "And peace be upon you (reply)", category: "Phrase" },
  { target: "صباح الخير", known: "Good morning", category: "Phrase" },
  { target: "مساء الخير", known: "Good evening", category: "Phrase" },
  { target: "تصبح على خير", known: "Good night", category: "Phrase" },
  { target: "كيف حالك؟", known: "How are you?", category: "Phrase" },
  { target: "أنا بخير، شكراً", known: "I'm fine, thank you", category: "Phrase" },
  { target: "ما اسمك؟", known: "What is your name?", category: "Phrase" },
  { target: "اسمي...", known: "My name is...", category: "Phrase" },
  { target: "تشرفت بلقائك", known: "Nice to meet you", category: "Phrase" },
  { target: "من فضلك", known: "Please", category: "Phrase" },
  { target: "شكراً جزيلاً", known: "Thank you very much", category: "Phrase" },
  { target: "عفواً", known: "You're welcome / Excuse me", category: "Phrase" },
  { target: "آسف", known: "Sorry", category: "Phrase" },
  { target: "لا بأس", known: "No problem", category: "Phrase" },
  { target: "إن شاء الله", known: "God willing", category: "Phrase" },
  { target: "ما شاء الله", known: "As God has willed", category: "Phrase" },
  { target: "الحمد لله", known: "Praise be to God", category: "Phrase" },
  { target: "مع السلامة", known: "Goodbye (with peace)", category: "Phrase" },
  { target: "إلى اللقاء", known: "See you later", category: "Phrase" },
  // Popular Sentences
  { target: "أنا أتعلم اللغة العربية", known: "I am learning the Arabic language", category: "Sentence" },
  { target: "هل تتحدث الإنجليزية؟", known: "Do you speak English?", category: "Sentence" },
  { target: "أنا لا أفهم", known: "I do not understand", category: "Sentence" },
  { target: "من أين أنت؟", known: "Where are you from?", category: "Sentence" },
  { target: "أنا من أمريكا", known: "I am from America", category: "Sentence" },
  { target: "كم الساعة الآن؟", known: "What time is it now?", category: "Sentence" },
  { target: "أين الحمام؟", known: "Where is the bathroom?", category: "Sentence" },
  { target: "كم هذا السعر؟", known: "How much is this price?", category: "Sentence" },
  { target: "أريد كوب من القهوة", known: "I want a cup of coffee", category: "Sentence" },
  { target: "الطعام لذيذ جداً", known: "The food is very delicious", category: "Sentence" },
  { target: "أحب اللغة العربية", known: "I love the Arabic language", category: "Sentence" },
  { target: "اليوم الطقس جميل", known: "Today the weather is beautiful", category: "Sentence" },
  { target: "سأذهب إلى المدرسة غداً", known: "I will go to school tomorrow", category: "Sentence" },
  { target: "هذا الكتاب مفيد جداً", known: "This book is very useful", category: "Sentence" },
  { target: "أين تسكن؟", known: "Where do you live?", category: "Sentence" },
];
