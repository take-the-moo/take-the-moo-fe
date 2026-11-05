"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { visitsApi } from "@/api/visits";
import { courseStops, CourseSteps } from "@/components/course/CourseProgress";
import { ChevronIcon } from "@/components/icons";
import { Button, Screen, ScreenBody, ScreenHeading, SectionTitle, Stamp, TabBar, WalkingLoader } from "@/components/ui";
import { useLang, useT } from "@/i18n";
import { dayLabel } from "@/lib/format";
import { useUserStore } from "@/store/user";
import { cn } from "@/lib/cn";

// 08 나의 기록 · F5 — Figma 9:1102
// GET /users/{userId}/visits 하나로 도장·안 간 코스 장소·코스 진행도·날짜별 기록을 받는다.
// 11 나의 발자취로 가는 길이 Figma에 없어 제목 옆에 링크를 뒀다.
// 코스 카드는 서버 순서(완주 → 많이 진행한 순)의 첫 코스, 도장 칸은 받은 도장 + 안 간 곳을 6칸 이상 채운다.
const STAMP_SLOTS = 6;

export default function LogPage() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const userId = useUserStore((s) => s.userId);
  const history = useQuery({
    queryKey: ["visits", userId],
    queryFn: ({ signal }) => visitsApi.getHistory(userId!, signal),
    enabled: Boolean(userId),
  });

  const data = history.data;
  const course = data?.courses[0];
  const stamps = data
    ? [
        ...data.stamps.map((s) => ({ placeId: s.placeId, name: s.name, done: true })),
        ...data.undiscovered
          .slice(0, Math.max(0, STAMP_SLOTS - data.stamps.length))
          .map((s) => ({ placeId: s.placeId, name: s.name, done: false })),
      ]
    : [];

  return (
    <Screen>
      <ScreenBody className="pt-6!">
        <div className="flex items-start justify-between gap-3">
          <ScreenHeading
            title={t("나의 기록")}
            sub={
              data
                ? t("도장 {stamps}개 · 코스 {courses}개 완주", { stamps: data.stampCount, courses: data.completedCourseCount })
                : history.isError
                  ? t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.")
                  : undefined
            }
          />
          <Link href="/journey" className="flex shrink-0 items-center gap-1.5 pt-2.5 text-body font-medium text-fg-sub">
            {t("나의 발자취")}
            <ChevronIcon className="h-3 w-[7px] text-fg-muted" />
          </Link>
        </div>

        {!data && !history.isError && <WalkingLoader large label={t("불러오는 중…")} />}

        {course && (
          <div className="flex flex-col gap-3 rounded-control bg-primary p-4">
            <p className="text-headline font-bold text-point">
              {course.name} {course.completed ? t("완주!") : t("진행 중")}
            </p>
            <CourseSteps {...courseStops(course.stops)} dark />
          </div>
        )}

        {data && (
          <>
            <section className="flex flex-col gap-5">
              <SectionTitle>{t("방문 도장")}</SectionTitle>
              <ul className="grid grid-cols-3 gap-3">
                {stamps.map(({ placeId, name, done }) => (
                  <li
                    key={placeId}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-control border bg-surface p-3 text-center text-caption font-medium",
                      done ? "border-fg-sub text-fg" : "border-line text-fg-muted",
                    )}
                  >
                    <Stamp size={48} done={done} />
                    {name}
                    <span className="sr-only">{done ? t("도장 받음") : t("아직 방문 전")}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-5">
              <SectionTitle>{t("날짜별 기록")}</SectionTitle>
              <ul className="flex flex-col">
                {data.days.map((d, i) => (
                  <li key={d.date} className="relative flex gap-2 pb-12 last:pb-0">
                    <span aria-hidden className="size-4 shrink-0 rounded-full border-[3px] border-track" />
                    {i < data.days.length - 1 && <span aria-hidden className="absolute top-6 bottom-2 left-[7.5px] w-px bg-track" />}
                    <div className="flex min-w-0 flex-1 flex-col gap-1 text-body">
                      <p className="font-bold text-fg">{dayLabel(d.date, lang)}</p>
                      <p className="font-medium text-fg-muted">{t("{places}에 다녀왔어요", { places: d.places.map((p) => p.name).join(" · ") })}</p>
                    </div>
                  </li>
                ))}
                {data.days.length === 0 && <li className="text-body text-fg-muted">{t("아직 방문 기록이 없어요")}</li>}
              </ul>
            </section>
          </>
        )}
      </ScreenBody>

      <div className="px-6 pb-4">
        {/* 트리거 15: 오늘 회고 엽서 만들기 → 09 */}
        <Button onClick={() => router.push("/postcard")}>{t("오늘 회고 엽서 만들기")}</Button>
      </div>
      <TabBar />
    </Screen>
  );
}
