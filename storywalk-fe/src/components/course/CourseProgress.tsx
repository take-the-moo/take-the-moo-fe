"use client";

import { Fragment } from "react";
import { CheckCircle } from "@/components/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";

// Figma: 06 'card/독립 코스' · 08 'card/코스 완주'의 steps — ✓원(20) + 이름 → 화살표 → …
// API 코스 정류장(placeId·name·visited)을 courseStops()로 바꿔 넘긴다. 08은 검은 카드 위라 dark로 그린다.
export type CourseStop = { id: string; shortName: string };

export const courseStops = (stops: { placeId: number; name: string; visited: boolean }[]) => ({
  stops: stops.map((s) => ({ id: String(s.placeId), shortName: s.name })),
  doneIds: stops.filter((s) => s.visited).map((s) => String(s.placeId)),
});

export function CourseSteps({ stops, doneIds, dark = false }: { stops: CourseStop[]; doneIds: string[]; dark?: boolean }) {
  const t = useT();
  return (
    <ol className="flex w-full flex-wrap items-center gap-2 text-caption">
      {stops.map((stop, i) => {
        const done = doneIds.includes(stop.id);
        return (
          <Fragment key={stop.id}>
            {i > 0 && (
              <li aria-hidden className="text-fg-muted">
                →
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <CheckCircle done={done} />
              <span className={cn(dark ? "font-medium text-white" : done ? "font-bold text-fg-sub" : "font-medium text-fg-muted")}>
                {stop.shortName}
                <span className="sr-only">{` ${done ? t("방문 완료") : t("아직 방문 전")}`}</span>
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
