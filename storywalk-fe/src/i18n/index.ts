// UI 문구만 관리한다. 장소 이야기·해설은 API가 번역해서 준다.
const dict = {
  ko: { now: "지금", map: "흔적 지도", myLog: "나의 기록", visited: "방문 완료" },
  vi: { now: "Bây giờ", map: "Bản đồ dấu chân", myLog: "Nhật ký của tôi", visited: "Đã ghé thăm" },
  zh: { now: "现在", map: "足迹地图", myLog: "我的记录", visited: "已到访" },
  mn: { now: "Одоо", map: "Мөрийн зураг", myLog: "Миний тэмдэглэл", visited: "Зочилсон" },
  en: { now: "Now", map: "Footprint Map", myLog: "My Journal", visited: "Visited" },
  ja: { now: "今", map: "足跡マップ", myLog: "自分の記録", visited: "訪問済み" },
} as const;

export type Lang = keyof typeof dict;
export type MsgKey = keyof (typeof dict)["ko"];

export const t = (lang: string | null, key: MsgKey) => (dict[(lang as Lang) ?? "ko"] ?? dict.ko)[key];
