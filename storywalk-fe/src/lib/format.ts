import { fromApiNationality } from "@/api/codes";
import type { Nationality } from "@/api/types";
import { nationalityLabel } from "@/lib/options";

// API 값 → 화면 표시. 날짜는 서울 날짜 문자열(YYYY-MM-DD)이라 시간대 변환 없이 그 날짜로 읽는다.
export const parseDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** 11/8 */
export const shortDate = (ymd: string) => {
  const d = parseDate(ymd);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

/** 11월 8일 (토) · Nov 8 (Sat) … 사용자 언어로 */
export const dayLabel = (ymd: string, lang: string | null) =>
  new Intl.DateTimeFormat(lang ?? "ko", { month: "long", day: "numeric", weekday: "short" }).format(parseDate(ymd));

/** 7월 12일 · Jul 12 … 사용자 언어로 */
export const monthDay = (ymd: string, lang: string | null) =>
  new Intl.DateTimeFormat(lang ?? "ko", { month: "long", day: "numeric" }).format(parseDate(ymd));

/** 120m · 1.2km */
export const distanceLabel = (meters: number) =>
  meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;

/** API 국적 → 사전 키(베트남·기타…) */
export const nationalityKey = (code: Nationality) => nationalityLabel(fromApiNationality(code));
