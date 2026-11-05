"use client";

import { Fragment } from "react";
import { CheckCircle } from "@/components/ui";
import { useT } from "@/i18n";
import type { Place } from "@/mocks/sample";
import { cn } from "@/lib/cn";

// Figma: 06 'course-progress' · 08 'course' 안의 단계 표시 — ✓원(16) + 이름 → 화살표 → …
export function CourseSteps({ stops, doneIds }: { stops: Place[]; doneIds: string[] }) {
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
