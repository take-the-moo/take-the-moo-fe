import type { Language, Nationality } from "./types";

// 화면 코드값(국적 칩 VN·NP·ETC, UI 언어 vi·en…) ↔ API 코드값(VN·OTHER, VI·EN…) 변환.
// 화면 목록에는 API에 없는 국적(네팔·기타)이 있어 API로 보낼 때 OTHER로 바꾼다.
const API_NATIONALITIES: readonly string[] = ["VN", "CN", "JP", "MN", "UZ", "US", "OTHER"] satisfies Nationality[];
const API_LANGUAGES: readonly string[] = ["KO", "EN", "VI", "ZH", "JA", "MN", "UZ"] satisfies Language[];

export function toApiNationality(code: string | null | undefined): Nationality {
  const upper = (code ?? "").toUpperCase();
  return (API_NATIONALITIES.includes(upper) ? upper : "OTHER") as Nationality;
}

/** API 국적 → 화면 국적 칩 코드 (OTHER는 '기타' 칩) */
export function fromApiNationality(code: Nationality): string {
  return code === "OTHER" ? "ETC" : code;
}

export function toApiLanguage(lang: string | null | undefined): Language {
  const upper = (lang ?? "").toUpperCase();
  return (API_LANGUAGES.includes(upper) ? upper : "EN") as Language;
}

/** API 언어 → UI 언어 (vi·en…). 화면 사전이 없는 언어(UZ)는 영어로 보여준다. */
export function fromApiLanguage(code: Language): string {
  return code === "UZ" ? "en" : code.toLowerCase();
}
