// 화면 선택지(국적·언어·취향·지도 필터). API가 주는 값이 아니라 화면이 정하는 목록이다.

// ── 01 처음 설정 ──────────────────────────────────────────
// 영국·프랑스는 API 국적에 없어 OTHER로 보낸다 (api/codes.ts)
// native는 그 나라 말로 쓴 이름이다. 가입 칩(나라·언어)은 화면 언어와 상관없이 이걸 보여준다.
export const NATIONALITIES = [
  { code: "VN", label: "베트남", native: "Việt Nam", nativeLang: "vi", defaultLang: "vi" },
  { code: "CN", label: "중국", native: "中国", nativeLang: "zh", defaultLang: "zh" },
  { code: "MN", label: "몽골", native: "Монгол", nativeLang: "mn", defaultLang: "mn" },
  { code: "UZ", label: "우즈베키스탄", native: "Oʻzbekiston", nativeLang: "uz", defaultLang: "en" },
  { code: "JP", label: "일본", native: "日本", nativeLang: "ja", defaultLang: "ja" },
  { code: "US", label: "미국", native: "United States", nativeLang: "en", defaultLang: "en" },
  { code: "GB", label: "영국", native: "United Kingdom", nativeLang: "en", defaultLang: "en" },
  { code: "FR", label: "프랑스", native: "France", nativeLang: "fr", defaultLang: "en" },
] as const;

export const LANGUAGES = [
  { code: "vi", label: "베트남어", native: "Tiếng Việt" },
  { code: "zh", label: "중국어", native: "中文" },
  { code: "mn", label: "몽골어", native: "Монгол хэл" },
  { code: "en", label: "영어", native: "English" },
  { code: "ja", label: "일본어", native: "日本語" },
] as const;

export const languageLabel = (code: string | null) => LANGUAGES.find((l) => l.code === code)?.label ?? "베트남어";
// ETC는 API의 OTHER다. 칩에는 없지만 다른 사람의 국적으로 표시될 수 있다.
export const nationalityLabel = (code: string | null) =>
  code === "ETC" ? "기타" : (NATIONALITIES.find((n) => n.code === code)?.label ?? "베트남");

// ── N2 취향 선택 ──────────────────────────────────────────
export const PREFERENCE_OPTIONS = {
  places: ["역사·유적", "시장·먹거리", "전시·박물관", "자연·산책", "카페·휴식", "포토 스팟"],
  stories: ["독립운동", "근현대사", "한국 음식", "문화·예술", "동네 사람들"],
  // 성향은 두 개 중 하나를 고르는 축 3개
  styles: [
    ["조용히 둘러보기", "활기찬 분위기"],
    ["계획대로", "발길 닿는 대로"],
    ["혼자", "함께"],
  ],
} as const;

// ── 07 흔적 지도 ─────────────────────────────────────────
export const MAP_FILTERS = ["전체", "베트남", "중국", "몽골"] as const;

// ── 09·10 회고 엽서 ──────────────────────────────────────
/** 예상 소요 시간(초) — 서버 기준 보통 2~3초 (docs/api.md POST /postcards) */
export const POSTCARD_SECONDS = 5;
