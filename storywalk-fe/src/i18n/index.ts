// UI 문구만 관리한다. 장소 이야기·해설은 API가 번역해서 준다.
const dict = {
  ko: { now: "지금", map: "흔적 지도", myLog: "나의 기록", visited: "방문 완료" },
  vi: { now: "Bây giờ", map: "Bản đồ dấu chân", myLog: "Nhật ký của tôi", visited: "Đã ghé thăm" },
} as const;

export type Lang = keyof typeof dict;
export type MsgKey = keyof (typeof dict)["ko"];

export const t = (lang: string | null, key: MsgKey) => (dict[(lang as Lang) ?? "ko"] ?? dict.ko)[key];
