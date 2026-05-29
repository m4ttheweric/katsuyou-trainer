import type { FormKey } from "./labels.ts";

export type VerbType = "ichidan" | "godan" | "suru" | "kuru";

export interface DictEntry {
  type: VerbType;
  meaning: string;
  reading: string;
  jlpt: string;
}

export type Dict = Record<string, DictEntry>;

export interface Match {
  source: "dict" | "jisho";
  word: string;
  reading: string;
  meanings: string[];
  type: VerbType | null;
  jlpt: string | null;
  isCommon: boolean;
  romaji?: string;
}

export type Conjugations = Record<FormKey, string>;

export interface ConjugationResult {
  type: VerbType;
  conjugations: Conjugations;
}

export interface PracticeVerb {
  verb: string;
  meaning: string;
  type: VerbType;
}

export interface QuizQuestion extends PracticeVerb {
  targetForm: FormKey;
}

export interface GodanMapping {
  form: string;
  row: "あ" | "い" | "う" | "え" | "お";
  suffix: string;
  to: string;
  color: string;
}

export interface TeRule {
  change: string;
  rule: string;
}

export interface GodanInfo {
  stem: string;
  lastKana: string;
  mappings: GodanMapping[];
  teRule: TeRule | null;
  isIku: boolean;
}

export interface IrregularForm {
  prefix: string;
  kana: string;
  label: string;
}
