import type { Match } from "./types.ts";
import { DICT } from "./data/dict.ts";
import { isRomaji, romajiToHiragana } from "./romaji.ts";
import { lookupJisho } from "./jisho.ts";

export interface LookupResult {
  matches: Match[];
}

function dictMatch(word: string, romaji?: string): Match {
  const entry = DICT[word]!;
  return {
    source: "dict",
    word,
    reading: entry.reading,
    meanings: [entry.meaning],
    type: entry.type,
    jlpt: entry.jlpt,
    isCommon: true,
    ...(romaji ? { romaji } : {}),
  };
}

function matchesByReading(reading: string, romaji?: string): Match[] {
  return Object.entries(DICT)
    .filter(([, v]) => v.reading === reading)
    .map(([kf, d]) => ({
      source: "dict" as const,
      word: kf,
      reading: d.reading,
      meanings: [d.meaning],
      type: d.type,
      jlpt: d.jlpt,
      isCommon: true,
      ...(romaji ? { romaji } : {}),
    }));
}

export async function lookupVerb(word: string): Promise<LookupResult> {
  if (DICT[word]) {
    return { matches: [dictMatch(word)] };
  }

  const byReading = matchesByReading(word);
  if (byReading.length > 0) return { matches: byReading };

  if (isRomaji(word)) {
    const hira = romajiToHiragana(word);
    if (hira !== word) {
      const byRomaji = matchesByReading(hira, word);
      if (byRomaji.length > 0) return { matches: byRomaji };

      // zu/dzu ambiguity: try swapping ず↔づ
      const altHira = hira.includes("ず")
        ? hira.replace(/ず/g, "づ")
        : hira.includes("づ")
        ? hira.replace(/づ/g, "ず")
        : null;
      if (altHira) {
        const byAlt = matchesByReading(altHira, word);
        if (byAlt.length > 0) return { matches: byAlt };
      }

      const jishoH = await lookupJisho(hira);
      if (jishoH) return { matches: [{ ...jishoH, source: "jisho", romaji: word }] };
    }
  }

  const jisho = await lookupJisho(word);
  if (jisho) return { matches: [{ ...jisho, source: "jisho" }] };

  return { matches: [] };
}
