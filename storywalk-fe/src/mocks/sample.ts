// 화면 시연용 샘플 데이터. Figma ui_ref 와이어프레임의 문구를 그대로 옮겼다.
// 실제 값은 P0 API(/now, /scenes, /explanations, /map/pins, /users/{id}/visits, /postcards)가 준다.
// API가 연결되면 각 화면이 이 파일 대신 React Query 결과를 쓰도록 바꾸고, 쓰지 않는 항목은 지운다.
// 좌표는 지도 배치 확인용 근사값이며 실제 장소 데이터가 아니다.
import type { LngLat } from "@/platform/map";

export type Place = { id: string; name: string; shortName: string; at: LngLat };

export const PLACES = {
  prison: { id: "seodaemun-prison", name: "서대문형무소역사관", shortName: "형무소역사관", at: [126.9563, 37.5748] },
  gate: { id: "dongnimmun", name: "독립문", shortName: "독립문", at: [126.9578, 37.5742] },
  hall: { id: "dongnipgwan", name: "독립관", shortName: "독립관", at: [126.9571, 37.5733] },
  market: { id: "yeongcheon-market", name: "영천시장", shortName: "영천시장", at: [126.9606, 37.5719] },
  trail: { id: "ansan-trail", name: "안산자락길", shortName: "안산자락길", at: [126.9496, 37.5787] },
  stream: { id: "hongjecheon", name: "홍제천", shortName: "홍제천", at: [126.9358, 37.5785] },
  museum: { id: "natural-history-museum", name: "서대문자연사박물관", shortName: "자연사박물관", at: [126.9396, 37.5694] },
} satisfies Record<string, Place>;

const ALL_PLACES: Place[] = Object.values(PLACES);
export const findPlace = (id: string): Place | undefined => ALL_PLACES.find((p) => p.id === id);

/** 독립 코스 — 03·06·08의 진행 표시 */
export const INDEPENDENCE_COURSE = { name: "독립 코스", stops: [PLACES.prison, PLACES.gate, PLACES.market] };

// ── 01 처음 설정 ──────────────────────────────────────────
export const NATIONALITIES = [
  { code: "VN", label: "베트남", defaultLang: "vi" },
  { code: "CN", label: "중국", defaultLang: "zh" },
  { code: "MN", label: "몽골", defaultLang: "mn" },
  { code: "UZ", label: "우즈베키스탄", defaultLang: "en" },
  { code: "JP", label: "일본", defaultLang: "ja" },
  { code: "US", label: "미국", defaultLang: "en" },
  { code: "NP", label: "네팔", defaultLang: "en" },
  { code: "ETC", label: "기타", defaultLang: "en" },
] as const;

export const LANGUAGES = [
  { code: "vi", label: "베트남어" },
  { code: "zh", label: "중국어" },
  { code: "mn", label: "몽골어" },
  { code: "en", label: "영어" },
  { code: "ja", label: "일본어" },
] as const;

export const languageLabel = (code: string | null) => LANGUAGES.find((l) => l.code === code)?.label ?? "베트남어";
export const nationalityLabel = (code: string | null) => NATIONALITIES.find((n) => n.code === code)?.label ?? "베트남";

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

// ── 03 지금 (홈) ──────────────────────────────────────────
export const NOW = {
  area: "독립문역",
  summary: "토요일 오후 · 비 오는 날 추천이에요",
  context: ["토 15:20", "비 · 12°C", "3호선 2분 후 도착"],
  recommendation: {
    place: PLACES.prison,
    reason: "비 오는 오후엔 실내 전시관부터 · 도보 4분",
    tags: ["베트남 유학생 12명 다녀감", "독립 코스 1/3"],
  },
  popular: [
    { place: PLACES.gate, count: 31 },
    { place: PLACES.market, count: 24 },
  ],
};

// ── 04 장면 ──────────────────────────────────────────────
export const SCENE = {
  native: "Năm 1908, Nhật Bản xây nhà tù này. Những người đấu tranh cho độc lập của Hàn Quốc đã bị giam ở đây.",
  easyKorean: "1908년, 일본이 지은 감옥이에요. 독립을 위해 싸운 사람들이 여기 갇혔어요.",
  myCountry: "하노이의 호아로 수용소처럼, 나라를 되찾으려던 사람들이 갇혔던 곳이에요.",
  footstep: { text: "벽돌 담이 생각보다 높아서 한참 서 있었어요.", meta: "베트남 · 11/1 · 번역됨" },
};

// ── 05 현장 해설 · 장소 확인 ─────────────────────────────
export const NEARBY = [
  { place: PLACES.prison, spot: "옥사", distance: "120m" },
  { place: PLACES.gate, distance: "300m" },
  { place: PLACES.hall, distance: "350m" },
];

// ── 06 해설 결과 ─────────────────────────────────────────
export const EXPLANATION = {
  spot: "옥사 복도",
  translated: "Hành lang này dẫn tới các phòng giam nhỏ. Mỗi phòng từng giam nhiều người cùng lúc.",
  original: "이 복도 양쪽이 좁은 감방이에요. 한 방에 여러 사람이 함께 갇혔어요.",
  visitedOn: "11/8 (토)",
  next: { place: PLACES.gate, walk: "6분" },
};

// ── 07 흔적 지도 ─────────────────────────────────────────
export const MAP_FILTERS = ["전체", "베트남", "중국", "몽골"] as const;

export const MAP_PINS = [
  { place: PLACES.prison, count: 42 },
  { place: PLACES.gate, count: 31 },
  { place: PLACES.market, count: 24 },
  { place: PLACES.trail, count: 9 },
];

export const PLACE_STATS = {
  place: PLACES.prison,
  total: 128,
  byNationality: [
    { label: "베트남", pct: 42 },
    { label: "중국", pct: 31 },
    { label: "몽골", pct: 12 },
    { label: "기타", pct: 15 },
  ],
};

export const FOOTSTEPS = [
  { id: "f1", nationality: "베트남", date: "11/1", text: "벽돌 담이 생각보다 높아서 한참 서 있었어요." },
  { id: "f2", nationality: "몽골", date: "10/28", text: "시장 떡볶이 아주머니가 길을 알려줬어요." },
];

// ── 08 나의 기록 ─────────────────────────────────────────
export const MY_LOG = {
  summary: "도장 3개 · 코스 1개 완주",
  stamps: [
    { place: PLACES.prison, done: true },
    { place: PLACES.gate, done: true },
    { place: PLACES.market, done: true },
    { place: PLACES.trail, done: false },
    { place: PLACES.stream, done: false },
    { place: PLACES.museum, done: false },
  ],
  days: [
    { date: "11월 8일 (토)", text: "형무소역사관 · 독립문 · 영천시장에 다녀왔어요" },
    { date: "11월 1일 (토)", text: "신촌 연세로에 다녀왔어요" },
  ],
};

// ── 09·10 회고 엽서 ──────────────────────────────────────
export const POSTCARD_STYLES = ["수채화", "웹툰", "연필 스케치", "빈티지 엽서"] as const;

export const POSTCARD = {
  todayPhotoCount: 12,
  note: "Trời mưa nên mọi thứ yên lặng và nặng nề hơn.",
  noteKorean: "비가 와서 모든 게 더 조용하고 무거웠어요.",
  caption: "2026. 11. 8 · 서대문 독립 코스",
  /** 생성 결과 이미지. 생성 API가 없어 아직 비어 있다. */
  imageUrl: null as string | null,
  /** 요구서 기준 예상 소요 시간 */
  expectedSeconds: 30,
};
