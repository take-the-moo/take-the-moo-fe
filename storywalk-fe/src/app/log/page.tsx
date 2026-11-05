"use client";

import { useRouter } from "next/navigation";
import { CourseSteps } from "@/components/course/CourseProgress";
import { Button, Card, CheckCircle, Screen, ScreenBody, ScreenHeading, SectionTitle, TabBar } from "@/components/ui";
import { useT } from "@/i18n";
import { INDEPENDENCE_COURSE, MY_LOG } from "@/mocks/sample";
import { cn } from "@/lib/cn";

// 08 나의 기록 · F5 — Figma 1:656 (썸네일 0.6배를 390 기준으로 환산)
// 도장·코스·날짜별 기록은 GET /users/{userId}/visits 연동 전까지 샘플이다.
export default function LogPage() {
  const router = useRouter();
  const t = useT();
  const doneIds = MY_LOG.stamps.filter((s) => s.done).map((s) => s.place.id);
  const courseDone = INDEPENDENCE_COURSE.stops.every((s) => doneIds.includes(s.id));

  return (
    <Screen>
      <ScreenBody>
        <ScreenHeading title={t("나의 기록")} sub={MY_LOG.summary} />

        <Card>
          <p className="text-[15px] leading-[1.45] font-bold text-fg">
            {INDEPENDENCE_COURSE.name} {courseDone ? t("완주!") : t("진행 중")}
          </p>
          <CourseSteps stops={INDEPENDENCE_COURSE.stops} doneIds={doneIds} />
        </Card>

        <SectionTitle>{t("방문 도장")}</SectionTitle>
        <ul className="grid grid-cols-3 gap-2.5">
          {MY_LOG.stamps.map(({ place, done }) => (
            <li
              key={place.id}
              className={cn(
                "flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-control text-micro leading-[1.45]",
                done ? "bg-surface-sunken font-bold text-fg" : "border border-dashed border-line-strong bg-surface text-fg-muted",
              )}
            >
              <CheckCircle size={30} done={done} pending="question" />
              {place.shortName}
              <span className="sr-only">{done ? t("도장 받음") : t("아직 방문 전")}</span>
            </li>
          ))}
        </ul>

        <SectionTitle>{t("날짜별 기록")}</SectionTitle>
        <ul className="flex flex-col gap-2.5">
          {MY_LOG.days.map((d) => (
            <li key={d.date} className="flex gap-2.5">
              <span aria-hidden className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                <p className="text-caption font-bold text-fg-sub">{d.date}</p>
                <p className="text-label text-fg">{d.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </ScreenBody>

      <div className="px-5 py-2">
        {/* 트리거 15: 오늘 회고 엽서 만들기 → 09 */}
        <Button onClick={() => router.push("/postcard")}>{t("오늘 회고 엽서 만들기")}</Button>
      </div>
      <TabBar />
    </Screen>
  );
}
