import type { ConjugationResult, Conjugations, VerbType } from "./types.ts";
import { DICT } from "./data/dict.ts";
import { HIRAGANA_ROWS } from "./data/hiragana.ts";

export function getColumn(k: string): number {
  for (const row of Object.values(HIRAGANA_ROWS)) {
    const i = row.indexOf(k);
    if (i !== -1) return i;
  }
  return -1;
}

export function shiftToRow(k: string, targetRow: "あ" | "い" | "う" | "え" | "お"): string {
  const c = getColumn(k);
  return c === -1 ? k : HIRAGANA_ROWS[targetRow][c]!;
}

export function getTeForm(stem: string, lastKana: string): string {
  if (lastKana === "す") return stem + "して";
  if (lastKana === "く") return stem + "いて";
  if (lastKana === "ぐ") return stem + "いで";
  if (["つ", "る", "う"].includes(lastKana)) return stem + "って";
  if (["ぬ", "ぶ", "む"].includes(lastKana)) return stem + "んで";
  return stem + "て";
}

export function getTaForm(stem: string, lastKana: string): string {
  return getTeForm(stem, lastKana).replace(/て$/, "た").replace(/で$/, "だ");
}

export function classifyFromJisho(pos: string[] | undefined | null): VerbType | null {
  if (!pos) return null;
  const j = pos.join(" ").toLowerCase();
  if (j.includes("ichidan")) return "ichidan";
  if (j.includes("godan")) return "godan";
  if (j.includes("suru")) return "suru";
  if (j.includes("kuru")) return "kuru";
  return null;
}

export function classifyHeuristic(verb: string): VerbType {
  if (verb === "する" || verb.endsWith("する")) return "suru";
  if (verb === "来る" || verb === "くる") return "kuru";
  const entry = DICT[verb];
  if (entry) return entry.type;
  if (verb.endsWith("る")) {
    const c = [...verb];
    if (c.length >= 2) {
      const p = c[c.length - 2]!;
      if ("いきしちにひみりぎじぢびえけせてねへめれげぜでべ".includes(p)) return "ichidan";
    }
  }
  return "godan";
}

export function conjugateVerb(verb: string, overrideType?: VerbType | null): ConjugationResult {
  const type: VerbType = overrideType || classifyHeuristic(verb);
  let conjugations: Conjugations;

  if (type === "suru") {
    const p = verb === "する" ? "" : verb.slice(0, -2);
    conjugations = {
      dictionary: verb,
      masu: p + "します",
      masen: p + "しません",
      mashita: p + "しました",
      masenDeshita: p + "しませんでした",
      nai: p + "しない",
      nakatta: p + "しなかった",
      te: p + "して",
      ta: p + "した",
      conditional: p + "すれば",
      volitional: p + "しよう",
      potential: p + "できる",
      passive: p + "される",
      causative: p + "させる",
      imperative: p + "しろ",
    };
  } else if (type === "kuru") {
    const p = verb === "来る" ? "来" : "";
    conjugations = {
      dictionary: verb,
      masu: p + "きます",
      masen: p + "きません",
      mashita: p + "きました",
      masenDeshita: p + "きませんでした",
      nai: p + "こない",
      nakatta: p + "こなかった",
      te: p + "きて",
      ta: p + "きた",
      conditional: p + "くれば",
      volitional: p + "こよう",
      potential: p + "こられる",
      passive: p + "こられる",
      causative: p + "こさせる",
      imperative: p + "こい",
    };
  } else if (type === "ichidan") {
    const s = verb.slice(0, -1);
    conjugations = {
      dictionary: verb,
      masu: s + "ます",
      masen: s + "ません",
      mashita: s + "ました",
      masenDeshita: s + "ませんでした",
      nai: s + "ない",
      nakatta: s + "なかった",
      te: s + "て",
      ta: s + "た",
      conditional: s + "れば",
      volitional: s + "よう",
      potential: s + "られる",
      passive: s + "られる",
      causative: s + "させる",
      imperative: s + "ろ",
    };
  } else {
    const chars = [...verb];
    const lk = chars[chars.length - 1]!;
    const s = verb.slice(0, -1);
    const isIku = verb === "行く" || verb === "いく";
    const aF = lk === "う" ? "わ" : shiftToRow(lk, "あ");
    const iF = shiftToRow(lk, "い");
    conjugations = {
      dictionary: verb,
      masu: s + iF + "ます",
      masen: s + iF + "ません",
      mashita: s + iF + "ました",
      masenDeshita: s + iF + "ませんでした",
      nai: s + aF + "ない",
      nakatta: s + aF + "なかった",
      te: isIku ? s + "って" : getTeForm(s, lk),
      ta: isIku ? s + "った" : getTaForm(s, lk),
      conditional: s + shiftToRow(lk, "え") + "ば",
      volitional: s + shiftToRow(lk, "お") + "う",
      potential: s + shiftToRow(lk, "え") + "る",
      passive: s + aF + "れる",
      causative: s + aF + "せる",
      imperative: s + shiftToRow(lk, "え"),
    };
  }
  return { type, conjugations };
}
