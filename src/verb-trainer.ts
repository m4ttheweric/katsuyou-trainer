import type Alpine from "alpinejs";
import type {
  ConjugationResult,
  GodanInfo,
  IrregularForm,
  Match,
  PracticeVerb,
  QuizQuestion,
  VerbType,
} from "./types.ts";
import { classifyHeuristic, conjugateVerb, getColumn } from "./conjugation.ts";
import { isRomaji, romajiToHiragana } from "./romaji.ts";
import { lookupVerb } from "./lookup.ts";
import { DICT } from "./data/dict.ts";
import { HIRAGANA_ROWS, ROW_COLORS, TE_RULES } from "./data/hiragana.ts";
import { type Mode, onPopState, parseRoute, pushRoute, replaceRoute } from "./router.ts";
import {
  type FormKey,
  formLabel,
  formLabelEn,
  formLabelJp,
  GODAN_ROW_LABELS,
  UI_LABELS,
  VERB_TYPE_LABELS,
} from "./labels.ts";

const KANA_STORAGE_KEY = "katsuyou:displayKana";

function readingFor(verb: string, fallbackReading?: string | null): string {
  const dictReading = DICT[verb]?.reading;
  return dictReading || fallbackReading || verb;
}

function conjugateFor(
  verb: string,
  type: VerbType | null | undefined,
  displayKana: boolean,
  reading?: string | null,
): ConjugationResult {
  const input = displayKana ? readingFor(verb, reading) : verb;
  return conjugateVerb(input, type ?? undefined);
}

function loadKanaPref(): boolean {
  try {
    return localStorage.getItem(KANA_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveKanaPref(v: boolean): void {
  try {
    localStorage.setItem(KANA_STORAGE_KEY, v ? "1" : "0");
  } catch {
    /* ignore quota / disabled storage */
  }
}

// The shared verb set used across Reference, Study, and Quiz — one ichidan plus
// the five godan ending sounds (docx resource). `ending` is the sound-ending
// label; `note` is the memorization tip shown on the Reference page.
interface ReferenceVerb extends PracticeVerb {
  ending: string;
  note: string;
}

const REFERENCE_VERBS: ReferenceVerb[] = [
  {
    verb: "食べる",
    meaning: "to eat",
    type: "ichidan",
    ending: "る (ichidan)",
    note: "Ichidan verbs are the easy ones: drop る and add the ending. The stem 食べ is constant across every form.",
  },
  {
    verb: "買う",
    meaning: "to buy",
    type: "godan",
    ending: "う",
    note: "Negative stem inserts わ (買わない, not 買あない). Past/て use the って・った pattern shared by う・つ・る verbs.",
  },
  {
    verb: "行く",
    meaning: "to go",
    type: "godan",
    ending: "く",
    note: "IRREGULAR past: 行った / 行って, not the regular いた / いて you'd expect from a く-verb. This is the one exception to memorize.",
  },
  {
    verb: "話す",
    meaning: "to speak",
    type: "godan",
    ending: "す",
    note: "す-verbs are regular and predictable: past/て always use した・して. No sound shortening.",
  },
  {
    verb: "死ぬ",
    meaning: "to die",
    type: "godan",
    ending: "ぬ",
    note: "The only common ぬ-verb in Japanese. Past/て use the んだ・んで pattern shared by ぬ・ぶ・む verbs — same as 飲む.",
  },
  {
    verb: "飲む",
    meaning: "to drink",
    type: "godan",
    ending: "む",
    note: "Shares the んだ・んで past/て pattern with 死ぬ (ぬ・ぶ・む group). 飲んだ and 死んだ conjugate identically.",
  },
];

// Summary "て / た Sound Patterns" table — one example verb per ending group.
interface SoundPattern {
  group: string;
  verb: string;
  type: VerbType;
  note?: string;
}

const SOUND_PATTERNS: SoundPattern[] = [
  { group: "う・つ・る", verb: "買う", type: "godan" },
  { group: "ぬ・ぶ・む", verb: "死ぬ", type: "godan" },
  { group: "く", verb: "書く", type: "godan", note: "行く is irregular → 行って / 行った" },
  { group: "ぐ", verb: "泳ぐ", type: "godan" },
  { group: "す", verb: "話す", type: "godan" },
  { group: "ichidan", verb: "食べる", type: "ichidan" },
];

// Forms users can pick to drill in the quiz.
// Order = display order in the picker.
const QUIZ_FORMS: FormKey[] = [
  "masu",
  "masen",
  "mashita",
  "masenDeshita",
  "nai",
  "nakatta",
  "te",
  "ta",
  "conditional",
  "volitional",
];

// Supplementary forms shown below the 2x2 grid, て-form first.
// (The 8 core forms in the CORE matrix above are intentionally excluded here.)
const SUPPLEMENTARY_ORDER: FormKey[] = [
  "te",
  "conditional",
  "volitional",
  "potential",
  "passive",
  "causative",
  "imperative",
];

export interface CoreCell {
  /** Stable form key (e.g. "masu") — use formLabel*() helpers to render. */
  key: FormKey;
  value: string;
}

export interface CoreForms {
  nonPast: { plain: { aff: CoreCell; neg: CoreCell }; polite: { aff: CoreCell; neg: CoreCell } };
  past: { plain: { aff: CoreCell; neg: CoreCell }; polite: { aff: CoreCell; neg: CoreCell } };
}

// A conjugated form split into its unchanging stem and the highlighted ending
// that "moves" (the part learners drill). `null` ending = nothing to highlight.
export interface FormParts {
  stem: string;
  ending: string;
}

export interface ReferenceRow {
  label: string;
  plain: FormParts | null;
  polite: FormParts | null;
}

export interface EndingFormula {
  kind: "ichidan" | "godan";
  ending: string;
  te: string;
  ta: string;
  isIku: boolean;
}

export interface PatternRow {
  group: string;
  verb: FormParts;
  te: FormParts;
  ta: FormParts;
  pattern: string;
  note: string | null;
}

/**
 * Split a conjugated form into [stem, ending] where stem is the dictionary form
 * minus its final kana — the part that stays fixed across every conjugation.
 * The ending is everything that follows, i.e. the movement to highlight.
 */
function splitOnStem(form: string, dictionary: string): FormParts {
  const stem = [...dictionary].slice(0, -1).join("");
  if (stem && form.startsWith(stem)) {
    return { stem, ending: form.slice(stem.length) };
  }
  return { stem: "", ending: form };
}

export function verbTrainer() {
  return {
    mode: "lookup" as Mode,
    input: "",
    result: null as ConjugationResult | null,
    meta: null as Match | null,
    error: null as string | null,
    loading: false,
    disambig: null as Match[] | null,
    studyRevealed: new Set<string>(),

    quizStarted: false,
    quizDone: false,
    quizIndex: 0,
    quizQuestions: [] as QuizQuestion[],
    score: { correct: 0, total: 0 },
    quizCount: 10,
    selectedForms: new Set<FormKey>(["masu", "te", "nai"]),

    displayKana: false,

    quizForms: QUIZ_FORMS,
    referenceVerbs: REFERENCE_VERBS,
    soundPatterns: SOUND_PATTERNS,

    init(): void {
      const self = this as typeof this & {
        $watch: (prop: string, cb: (v: unknown) => void) => void;
      };
      self.displayKana = loadKanaPref();
      self.$watch("displayKana", (v: unknown) => {
        const on = Boolean(v);
        saveKanaPref(on);
        if (self.meta) {
          self.result = conjugateFor(self.meta.word, self.meta.type, on, self.meta.reading);
        }
      });

      const initial = parseRoute();
      self.mode = initial.mode;
      // Canonicalize root "/" → "/lookup" so the URL is always explicit.
      replaceRoute({ mode: initial.mode, verb: initial.verb });

      if (initial.mode === "lookup" && initial.verb) {
        self.input = initial.verb;
        void self.handleLookup({ skipUrlPush: true });
      }

      self.$watch("mode", (newMode: unknown) => {
        const m = newMode as Mode;
        const verb = m === "lookup" && self.result ? self.input : undefined;
        pushRoute({ mode: m, verb });
      });

      onPopState((state) => {
        if (state.mode !== self.mode) {
          self.mode = state.mode;
          self.quizStarted = false;
        }
        if (state.mode === "lookup") {
          if (state.verb && state.verb !== self.input) {
            self.input = state.verb;
            void self.handleLookup({ skipUrlPush: true });
          } else if (!state.verb) {
            self.input = "";
            self.result = null;
            self.meta = null;
            self.disambig = null;
            self.error = null;
          }
        }
      });
    },

    // Expose label helpers and constants to templates so all rendered text
    // can be sourced from src/labels.ts.
    ui: UI_LABELS,
    formLabel,
    formLabelJp,
    formLabelEn,

    typeLabel(t: VerbType | null): string {
      return (t && VERB_TYPE_LABELS[t]) || t || "";
    },

    conjEntries(r: ConjugationResult | null): [FormKey, string][] {
      return r ? (Object.entries(r.conjugations) as [FormKey, string][]) : [];
    },

    coreForms(r: ConjugationResult | null): CoreForms | null {
      if (!r) return null;
      const c = r.conjugations;
      const cell = (key: FormKey): CoreCell => ({ key, value: c[key] || "" });
      return {
        nonPast: {
          plain: { aff: cell("dictionary"), neg: cell("nai") },
          polite: { aff: cell("masu"), neg: cell("masen") },
        },
        past: {
          plain: { aff: cell("ta"), neg: cell("nakatta") },
          polite: { aff: cell("mashita"), neg: cell("masenDeshita") },
        },
      };
    },

    supplementaryEntries(r: ConjugationResult | null): [FormKey, string][] {
      if (!r) return [];
      const c = r.conjugations;
      return SUPPLEMENTARY_ORDER.filter((k) => c[k] !== undefined).map(
        (k) => [k, c[k]!] as [FormKey, string],
      );
    },

    stemOf(r: ConjugationResult | null): string {
      if (!r) return "";
      const v = r.conjugations.dictionary;
      return v ? v.slice(0, -1) : "";
    },

    // ─── Reference page (sound-ending model verbs) ───
    // All helpers below conjugate via the current displayKana setting, so the
    // kanji ↔ kana toggle drives this page exactly like Lookup/Study.

    referenceRows(verb: string, type: VerbType): ReferenceRow[] {
      const c = conjugateFor(verb, type, this.displayKana).conjugations;
      const dict = c.dictionary;
      const split = (form: string | undefined): FormParts | null =>
        form ? splitOnStem(form, dict) : null;
      // たい ("want to") attaches to the same renyōkei as ます — derive it from there.
      const tai = c.masu.replace(/ます$/, "たい");
      return [
        { label: this.ui.referenceRowDictionary, plain: split(dict), polite: split(c.masu) },
        { label: this.ui.referenceRowNegative, plain: split(c.nai), polite: split(c.masen) },
        { label: this.ui.referenceRowPast, plain: split(c.ta), polite: split(c.mashita) },
        { label: this.ui.referenceRowPastNeg, plain: split(c.nakatta), polite: split(c.masenDeshita) },
        { label: this.ui.referenceRowTe, plain: split(c.te), polite: null },
        { label: this.ui.referenceRowTai, plain: split(tai), polite: split(tai + "です") },
      ];
    },

    endingFormula(verb: string, type: VerbType): EndingFormula {
      const c = conjugateFor(verb, type, this.displayKana).conjugations;
      const dict = c.dictionary;
      const ending = [...dict].slice(-1)[0] || "";
      return {
        kind: type === "ichidan" ? "ichidan" : "godan",
        ending,
        te: splitOnStem(c.te, dict).ending,
        ta: splitOnStem(c.ta, dict).ending,
        isIku: dict === "行く" || dict === "いく",
      };
    },

    patternRow(p: { group: string; verb: string; type: VerbType; note?: string }): PatternRow {
      const c = conjugateFor(p.verb, p.type, this.displayKana).conjugations;
      const dict = c.dictionary;
      const te = splitOnStem(c.te, dict);
      const ta = splitOnStem(c.ta, dict);
      const pattern =
        p.type === "ichidan" ? this.ui.patternsIchidanPattern : `${te.ending} / ${ta.ending}`;
      return { group: p.group, verb: splitOnStem(dict, dict), te, ta, pattern, note: p.note ?? null };
    },

    irregularForms(r: ConjugationResult | null): IrregularForm[] {
      if (!r) return [];
      const v = r.conjugations.dictionary;
      if (!v) return [];
      if (r.type === "suru") {
        const p = v === "する" ? "" : v.slice(0, -2);
        return [
          { prefix: p, kana: "し", label: "(masu/te/ta)" },
          { prefix: p, kana: "しな", label: "(negative)" },
          { prefix: p, kana: "す", label: "(conditional)" },
          { prefix: p, kana: "しよ", label: "(volitional)" },
        ];
      }
      const p = v === "来る" ? "来" : "";
      return [
        { prefix: p, kana: "き", label: "(masu/te/ta)" },
        { prefix: p, kana: "こ", label: "(negative/volitional)" },
        { prefix: p, kana: "く", label: "(conditional)" },
      ];
    },

    godanInfo(r: ConjugationResult | null): GodanInfo | Record<string, never> {
      if (!r) return {};
      const v = r.conjugations.dictionary;
      if (!v) return {};
      const chars = [...v];
      const lk = chars[chars.length - 1]!;
      const stem = v.slice(0, -1);
      const col = getColumn(lk);
      const mappings = (
        [
          { form: GODAN_ROW_LABELS.negative, row: "あ", suffix: "ない" },
          { form: GODAN_ROW_LABELS.polite, row: "い", suffix: "ます" },
          { form: GODAN_ROW_LABELS.dictionary, row: "う", suffix: "" },
          { form: GODAN_ROW_LABELS.conditional, row: "え", suffix: "ば" },
          { form: GODAN_ROW_LABELS.volitional, row: "お", suffix: "う" },
        ] as const
      ).map((m) => ({
        ...m,
        to: m.row === "あ" && lk === "う" ? "わ" : HIRAGANA_ROWS[m.row][col] || "",
        color: ROW_COLORS[m.row],
      }));
      return {
        stem,
        lastKana: lk,
        mappings,
        teRule: TE_RULES[lk] || null,
        isIku: v === "行く",
      };
    },

    async handleLookup(opts: { skipUrlPush?: boolean } = {}): Promise<void> {
      const w = this.input.trim();
      if (!w) return;
      this.loading = true;
      this.error = null;
      this.result = null;
      this.meta = null;
      this.disambig = null;
      const { matches } = await lookupVerb(w);
      if (matches.length === 0) {
        const hint = isRomaji(w) ? ` (converted to: ${romajiToHiragana(w)})` : "";
        this.error = `「${w}」${hint} was not found as a verb. ${UI_LABELS.notFoundTryFormat}`;
      } else if (matches.length === 1) {
        this.selectVerb(matches[0]!);
      } else {
        this.disambig = matches;
      }
      this.loading = false;
      if (!opts.skipUrlPush && (this.result || this.disambig)) {
        pushRoute({ mode: "lookup", verb: w });
      }
    },

    selectVerb(d: Match): void {
      this.meta = d;
      this.result = conjugateFor(d.word, d.type, this.displayKana, d.reading);
      this.disambig = null;
      pushRoute({ mode: "lookup", verb: this.input.trim() || d.word });
    },

    displayVerb(verb: string, reading?: string | null): string {
      return this.displayKana ? readingFor(verb, reading) : verb;
    },

    conjugateForDisplay(verb: string, type: VerbType): ConjugationResult {
      return conjugateFor(verb, type, this.displayKana);
    },

    toggleForm(f: FormKey): void {
      const s = new Set(this.selectedForms);
      if (s.has(f)) s.delete(f);
      else s.add(f);
      this.selectedForms = s;
    },

    startQuiz(): void {
      const forms = [...this.selectedForms];
      if (!forms.length) return;
      const shuffled = [...this.referenceVerbs].sort(() => Math.random() - 0.5);
      const qs: QuizQuestion[] = [];
      let i = 0;
      while (qs.length < this.quizCount) {
        const v = shuffled[i % shuffled.length]!;
        qs.push({
          ...v,
          targetForm: forms[Math.floor(Math.random() * forms.length)]!,
        });
        i++;
      }
      this.quizQuestions = qs;
      this.quizIndex = 0;
      this.score = { correct: 0, total: 0 };
      this.quizDone = false;
      this.quizStarted = true;
      (window as Window & { Alpine: typeof Alpine }).Alpine.store("quizTick", Date.now());
    },

    currentQ(): QuizQuestion {
      return (
        this.quizQuestions[this.quizIndex] || {
          verb: "",
          meaning: "",
          targetForm: "masu",
          type: "godan",
        }
      );
    },

    currentAnswer(): string {
      const q = this.currentQ();
      return conjugateFor(q.verb, q.type, this.displayKana).conjugations[q.targetForm] || "";
    },

    advanceQuiz(correct: boolean): void {
      this.score = {
        correct: this.score.correct + (correct ? 1 : 0),
        total: this.score.total + 1,
      };
      if (this.quizIndex + 1 >= this.quizQuestions.length) {
        this.quizDone = true;
      } else {
        this.quizIndex++;
        (window as Window & { Alpine: typeof Alpine }).Alpine.store("quizTick", Date.now());
      }
    },

    quizHint(): string {
      const q = this.currentQ();
      const t = q.type || classifyHeuristic(q.verb);
      if (t === "ichidan") return UI_LABELS.hintIchidan;
      if (t === "godan") {
        return `${UI_LABELS.hintGodanPrefix} 「${[...q.verb].pop()}」 ${UI_LABELS.hintGodanSuffix}`;
      }
      return `${UI_LABELS.hintIrregular} (${t})`;
    },
  };
}
