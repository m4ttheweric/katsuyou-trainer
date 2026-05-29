import type { Match } from "./types.ts";
import { classifyFromJisho } from "./conjugation.ts";

interface JishoJapanese {
  word?: string;
  reading?: string;
}

interface JishoSense {
  parts_of_speech: string[];
  english_definitions: string[];
}

interface JishoEntry {
  japanese: JishoJapanese[];
  senses: JishoSense[];
  jlpt?: string[];
  is_common?: boolean;
}

interface JishoResponse {
  data?: JishoEntry[];
}

export type JishoMatch = Omit<Match, "source" | "romaji">;

export async function lookupJisho(word: string): Promise<JishoMatch | null> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 4000);
  try {
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`,
    )}`;
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = (await res.json()) as JishoResponse;
    if (!json.data?.length) return null;

    for (const entry of json.data) {
      const jWords = entry.japanese.map((j) => j.word || j.reading);
      const readings = entry.japanese.map((j) => j.reading);
      if (!jWords.includes(word) && !readings.includes(word)) continue;

      const verbSense = entry.senses.find((s) =>
        s.parts_of_speech.some((p) => /verb/i.test(p) && !/auxiliary/i.test(p)),
      );
      if (!verbSense) continue;

      const first = entry.japanese[0]!;
      return {
        word: first.word || first.reading || "",
        reading: first.reading || "",
        meanings: entry.senses
          .filter((s) => s.parts_of_speech.some((p) => /verb/i.test(p)))
          .flatMap((s) => s.english_definitions)
          .slice(0, 5),
        type: classifyFromJisho(verbSense.parts_of_speech),
        jlpt: entry.jlpt?.[0] || null,
        isCommon: entry.is_common || false,
      };
    }
    return null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
