const ROMAJI_MAP: Record<string, string> = {
  shi: "し", chi: "ち", tsu: "つ", dzu: "づ", fu: "ふ",
  sha: "しゃ", shu: "しゅ", sho: "しょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
  tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
  ja: "じゃ", ju: "じゅ", jo: "じょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  dya: "ぢゃ", dyu: "ぢゅ", dyo: "ぢょ",
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  sa: "さ", si: "し", su: "す", se: "せ", so: "そ",
  ta: "た", ti: "ち", tu: "つ", te: "て", to: "と",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", hu: "ふ", he: "へ", ho: "ほ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  ya: "や", yu: "ゆ", yo: "よ",
  wa: "わ", wi: "ゐ", we: "ゑ", wo: "を",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  za: "ざ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  n: "ん",
};

export function romajiToHiragana(input: string): string {
  let s = input.toLowerCase().trim();
  let out = "";
  while (s.length > 0) {
    // Double consonant → っ + keep one consonant
    if (s.length >= 2 && s[0] === s[1] && !"aiueon".includes(s[0]!) && /[a-z]/.test(s[0]!)) {
      out += "っ";
      s = s.slice(1);
      continue;
    }
    // n before consonant or end = ん (but not before vowel or y)
    if (s[0] === "n" && s.length >= 2 && !"aiueoy".includes(s[1]!)) {
      out += "ん";
      s = s.slice(1);
      continue;
    }
    if (s[0] === "n" && s.length === 1) {
      out += "ん";
      s = "";
      continue;
    }
    let matched = false;
    for (let len = 4; len >= 1; len--) {
      const chunk = s.slice(0, len);
      const mapped = ROMAJI_MAP[chunk];
      if (mapped) {
        out += mapped;
        s = s.slice(len);
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += s[0];
      s = s.slice(1);
    }
  }
  return out;
}

export function isRomaji(s: string): boolean {
  return /^[a-zA-Z]+$/.test(s.trim());
}
