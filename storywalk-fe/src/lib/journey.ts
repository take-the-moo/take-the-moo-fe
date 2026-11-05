import type { VisitHistory } from "@/api/types";

// 11 나의 발자취 계산. 전용 API가 없어 GET /users/{id}/visits와 이 기기의 기록으로 만든다.
export type Moment = { kind: "stamp" | "step" | "course" | "visit" | "note"; date: string; name: string; text?: string };

type Dated = { date: string; name: string };

const byDate = (a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date);
const parts = (ymd: string) => ymd.split("-").map(Number);

/** 첫 방문~마지막 방문. 달이 바뀌었으면 개월 수, 아니면 일 수로 쓴다. */
export function journeyPeriod(days: { date: string }[]) {
  if (days.length === 0) return null;
  const sorted = days.map((d) => d.date).sort();
  const [fy, fm, fd] = parts(sorted[0]);
  const [ly, lm, ld] = parts(sorted[sorted.length - 1]);
  const end = fy === ly ? `${lm}.${ld}` : `${ly}.${lm}.${ld}`;
  return {
    months: (ly - fy) * 12 + (lm - fm),
    days: Math.round((Date.UTC(ly, lm - 1, ld) - Date.UTC(fy, fm - 1, fd)) / 86_400_000) + 1,
    range: sorted[0] === sorted[sorted.length - 1] ? `${fy}.${fm}.${fd}` : `${fy}.${fm}.${fd} ~ ${end}`,
  };
}

/** 보드에 붙일 순간들: 첫 도장, 첫 한걸음, 코스 완주, 나머지 도장, 마지막 한 줄. */
export function journeyMoments(
  history: Pick<VisitHistory, "stamps" | "courses">,
  footsteps: Dated[],
  note: { text: string; date: string } | null,
): Moment[] {
  const stamps = history.stamps.map((s) => ({ placeId: s.placeId, name: s.name, date: s.firstVisitedDate })).sort(byDate);
  if (stamps.length === 0) return [];

  // 코스 완주일은 서버가 주지 않아 마지막으로 찍은 정류장의 날짜로 본다
  const courses = history.courses.flatMap((course): Moment[] => {
    const stops = course.stops.map((stop) => stamps.find((s) => s.placeId === stop.placeId));
    if (!course.completed || stops.some((s) => !s)) return [];
    const last = stops.map((s) => s!).sort(byDate).at(-1)!;
    return [{ kind: "course", date: last.date, name: last.name, text: course.name }];
  });
  const firstStep = [...footsteps].sort(byDate)[0];
  const picked: Moment[] = [
    { kind: "stamp", date: stamps[0].date, name: stamps[0].name },
    ...(firstStep ? [{ kind: "step" as const, ...firstStep }] : []),
    ...courses,
  ];
  const recent = stamps
    .slice(1)
    .reverse()
    .filter((s) => !picked.some((m) => m.name === s.name))
    .map((s): Moment => ({ kind: "visit", date: s.date, name: s.name }));

  const closing: Moment[] = note ? [{ kind: "note", date: note.date, name: stamps.at(-1)!.name, text: note.text }] : [];
  return [...[...picked, ...recent].sort(byDate), ...closing];
}
