/**
 * All user-facing labels for the app.
 *
 * Internal logic references *keys* (e.g. FormKey "masu") — never display strings.
 * To rename anything users see, edit the value in this file.
 *
 * - FORM_LABELS    — conjugation forms (Japanese name + English gloss)
 * - VERB_TYPE_LABELS — godan / ichidan / suru / kuru
 * - UI_LABELS      — tabs, section titles, buttons, messages
 * - GODAN_ROW_LABELS — the 5 vowel-row mappings shown in the breakdown card
 */

import type { VerbType } from "./types.ts";

/* ─── Conjugation form keys ─────────────────────────────────────────────────── */

export type FormKey =
  | "dictionary"
  | "masu"
  | "masen"
  | "mashita"
  | "masenDeshita"
  | "nai"
  | "nakatta"
  | "te"
  | "ta"
  | "conditional"
  | "volitional"
  | "potential"
  | "passive"
  | "causative"
  | "imperative";

export interface FormLabel {
  /** Japanese name, e.g. "ます形" */
  jp: string;
  /** English gloss, e.g. "Masu" — usually short. Edit here to rename. */
  en: string;
}

export const FORM_LABELS: Record<FormKey, FormLabel> = {
  dictionary: { jp: "辞書形", en: "Dictionary" },
  masu: { jp: "ます形", en: "Masu" },
  masen: { jp: "ません形", en: "Masen" },
  mashita: { jp: "ました形", en: "Mashita" },
  masenDeshita: { jp: "ませんでした", en: "Masen Deshita" },
  nai: { jp: "ない形", en: "Nai" },
  nakatta: { jp: "なかった形", en: "Nakatta" },
  te: { jp: "て形", en: "Te" },
  ta: { jp: "た形", en: "Ta" },
  conditional: { jp: "仮定形", en: "Conditional" },
  volitional: { jp: "意志形", en: "Volitional" },
  potential: { jp: "可能形", en: "Potential" },
  passive: { jp: "受身形", en: "Passive" },
  causative: { jp: "使役形", en: "Causative" },
  imperative: { jp: "命令形", en: "Imperative" },
};

/** Full label, e.g. "ます形 (Masu)". */
export function formLabel(key: FormKey): string {
  const l = FORM_LABELS[key];
  return `${l.jp} (${l.en})`;
}

/** Japanese-only label, e.g. "ます形". */
export function formLabelJp(key: FormKey): string {
  return FORM_LABELS[key].jp;
}

/** English-only label, e.g. "Masu". */
export function formLabelEn(key: FormKey): string {
  return FORM_LABELS[key].en;
}

/* ─── Verb type labels ──────────────────────────────────────────────────────── */

export const VERB_TYPE_LABELS: Record<VerbType, string> = {
  ichidan: "一段 Ichidan",
  godan: "五段 Godan",
  suru: "する Irregular",
  kuru: "くる Irregular",
};

/* ─── Godan breakdown row labels (vowel-row shifts) ─────────────────────────── */

export const GODAN_ROW_LABELS = {
  negative: "ない (Negative)",
  polite: "ます (Polite)",
  dictionary: "辞書 (Dictionary)",
  conditional: "ば (Conditional)",
  volitional: "う (Volitional)",
} as const;

/* ─── UI labels (tabs, headings, buttons, messages) ─────────────────────────── */

export const UI_LABELS = {
  // App header
  appKicker: "動詞活用練習",
  appTitlePrimary: "活用",
  appTitleAccent: "Trainer",
  appSubtitle:
    "Japanese Verb Conjugation — 419 built-in verbs + Jisho.org lookup",

  // Tabs
  tabLookup: "検索 Lookup",
  tabStudy: "学習 Study",
  tabQuiz: "テスト Quiz",
  tabReference: "一覧 Reference",

  // Script toggle
  scriptKanji: "漢字 Kanji",
  scriptKana: "かな Kana",

  // Lookup
  lookupPlaceholder: "動詞を入力 (e.g. 食べる, きく, taberu)",
  lookupButton: "活用",
  lookupLoading: "検索中...",
  lookupEmptyTitle: "Type a Japanese verb — kanji, hiragana, or romaji",
  lookupEmptyHint:
    "419 verbs built-in · accepts romaji (e.g. nomu, taberu, kiku)",
  disambigPrompt: "Multiple verbs match",
  disambigSuffix: "— which one?",
  notFoundTryFormat:
    "Try the dictionary form (e.g. 食べる, たべる, or taberu).",
  badgeCommon: "COMMON",
  badgeJisho: "via Jisho",

  // Core forms grid
  coreFormsTitle: "Core forms",
  coreFormsSubtitle: "Plain ↔ Polite, Present ↔ Past",
  registerPlain: "Plain",
  registerPolite: "Polite",
  tenseNonPast: "Present",
  tensePast: "Past",
  moreFormsTitle: "More forms",

  // Breakdown card
  breakdownIchidan: "How it conjugates",
  breakdownGodan: "How it conjugates — vowel row shifts",
  breakdownIrregular: "How it conjugates (irregular)",
  ichidanExplain:
    "Ichidan verbs are simple — drop the final る and attach the suffix directly.",
  plusSuffix: "+ suffix",
  irregularExplain:
    "This is an irregular verb — the stem changes form depending on the conjugation. These must be memorized.",
  godanExplainStart: "Godan verbs shift their final kana",
  godanExplainMid: "across the five vowel rows of its column. The stem",
  godanExplainEnd: "stays the same.",
  teRuleTitle: "て / た FORM — SOUND CHANGE (音便)",
  teRuleIkuNote: "is a special case:",
  teRulePrefix: "The ending",
  teRuleMiddle:
    "doesn't shift to a vowel row — it undergoes a sound change instead:",
  teRuleSameSuffix: "same pattern for all verbs ending in",
  teRuleLabel: "Rule:",

  // Breakdown table headers
  breakdownColRow: "Row",
  breakdownColFrom: "From",
  breakdownColTo: "To",
  breakdownColUsedFor: "Used for",

  // Study
  studyHelp: "Tap each form to reveal — test yourself first!",
  studyReveal: "タップして表示",

  // Reference (sound-ending model verbs)
  referenceTitle: "音便一覧 — Sound-Ending Reference",
  referenceIntro:
    "One model verb per ending sound (う・く・す・ぬ・む) plus ichidan. The stem stays fixed — the highlighted ending is the part that moves. Drill these six and the patterns transfer to every verb.",
  referenceColForm: "Form",
  referenceColPlain: "Plain / Casual",
  referenceColPolite: "Polite / Formal",
  referenceRowDictionary: "Present (dictionary)",
  referenceRowNegative: "Present negative",
  referenceRowPast: "Past",
  referenceRowPastNeg: "Past negative",
  referenceRowTe: "て form",
  referenceRowTai: "Want to 〜たい",
  referenceFormulaLabel: "ENDING MOVEMENT",
  referenceFormulaIchidan: "drop る, attach the suffix directly",
  referenceFormulaIku: "irregular — not いて / いた",
  referenceNoteLabel: "Note:",
  patternsTitle: "て / た Sound Patterns",
  patternsIntro:
    "Plain past (た) and the て form share one sound change — swap the final vowel (て↔た, で↔だ). This is the part worth drilling hardest.",
  patternsColEnding: "Ending",
  patternsColPattern: "て / た",
  patternsColExample: "Example",
  patternsIchidanPattern: "drop る + て / た",

  // Quiz settings
  quizSettingsTitle: "Quiz Settings",
  quizFormsLabel: "FORMS TO PRACTICE",
  quizQuestionsLabel: "QUESTIONS",
  quizStartButton: "始める Start Quiz",

  // Quiz play
  quizInputPlaceholder: "答えを入力...",
  quizCheck: "確認 Check",
  quizHint: "ヒント Hint",
  quizHintHide: "Hide",
  quizReveal: "答え Reveal",
  quizNext: "次へ Next →",
  quizCorrect: "正解！ ✓",
  quizWrong: "惜しい！もう一度 — Try again!",
  quizAnswerLabel: "Answer:",

  // Quiz hints
  hintIchidan: "Ichidan verb — drop る, add the suffix",
  hintGodanPrefix: "Godan verb ending in",
  hintGodanSuffix: "— which vowel row?",
  hintIrregular: "Irregular verb",

  // Quiz done
  quizDoneExcellent: "素晴らしい！ Excellent!",
  quizDoneGood: "いい調子！ Good progress!",
  quizDoneKeepGoing: "頑張って！ Keep practicing!",
  quizDoneTryAgain: "もう一回 Try Again",
} as const;
