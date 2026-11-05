"use client";

import { Fragment } from "react";
import { CheckCircle } from "@/components/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";

// Figma: 06 'course-progress' · 08 'course' 안의 단계 표시 — ✓원(16) + 이름 → 화살표 → …
// API 코스 정류장(placeId·name·visited)을 courseStops()로 바꿔 넘긴다.
export type CourseStop = { id: string; shortName: string };

export const courseStops = (stops: { placeId: number; name: string; visited: boolean }[]) => ({
  stops: stops.map((s) => ({ id: String(s.placeId), shortName: s.name })),
  doneIds: stops.filter((s) => s.visited).map((s) => String(s.placeId)),
});

export function CourseSteps({ stops, doneIds }: { stops: CourseStop[]; doneIds: string[] }) {
  const t = useT();
  return (
    <ol className="flex w-full flex-wrap items-center gap-1.5 text-caption leading-[1.45]">
      {stops.map((stop, i) => {
        const done = doneIds.includes(stop.id);
        return (
          <Fragment key={stop.id}>
            {i > 0 && (
              <li aria-hidden className="text-fg-disabled">
                →
              </li>
            )}
            <li className="flex items-center gap-1">
              <CheckCircle size={16} done={done} />
              <span className={cn(done ? "font-bold text-ink" : "text-fg-muted")}>
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
