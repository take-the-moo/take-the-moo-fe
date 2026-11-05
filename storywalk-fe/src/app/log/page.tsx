"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { visitsApi } from "@/api/visits";
import { courseStops, CourseSteps } from "@/components/course/CourseProgress";
import { Button, Card, CheckCircle, Screen, ScreenBody, ScreenHeading, SectionTitle, TabBar } from "@/components/ui";
import { useLang, useT } from "@/i18n";
import { dayLabel } from "@/lib/format";
import { useUserStore } from "@/store/user";
import { cn } from "@/lib/cn";

// 08 나의 기록 · F5 — Figma 1:656 (썸네일 0.6배를 390 기준으로 환산)
// GET /users/{userId}/visits 하나로 도장·안 간 코스 장소·코스 진행도·날짜별 기록을 받는다.
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
      <ScreenBody>
        <ScreenHeading
          title={t("나의 기록")}
          sub={
            data
              ? t("도장 {stamps}개 · 코스 {courses}개 완주", { stamps: data.stampCount, courses: data.completedCourseCount })
              : history.isError
                ? t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.")
                : t("불러오는 중…")
          }
        />

        {course && (
          <Card>
            <p className="text-[15px] leading-[1.45] font-bold text-fg">
              {course.name} {course.completed ? t("완주!") : t("진행 중")}
            </p>
            <CourseSteps {...courseStops(course.stops)} />
          </Card>
        )}

        {data && (
          <>
            <SectionTitle>{t("방문 도장")}</SectionTitle>
            <ul className="grid grid-cols-3 gap-2.5">
              {stamps.map(({ placeId, name, done }) => (
                <li
                  key={placeId}
                  className={cn(
                    "flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-control px-1 text-center text-micro leading-[1.45]",
                    done ? "bg-surface-sunken font-bold text-fg" : "border border-dashed border-line-strong bg-surface text-fg-muted",
                  )}
                >
                  <CheckCircle size={30} done={done} pending="question" />
                  {name}
                  <span className="sr-only">{done ? t("도장 받음") : t("아직 방문 전")}</span>
                </li>
              ))}
            </ul>

            <SectionTitle>{t("날짜별 기록")}</SectionTitle>
            <ul className="flex flex-col gap-2.5">
              {data.days.map((d) => (
                <li key={d.date} className="flex gap-2.5">
                  <span aria-hidden className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="text-caption font-bold text-fg-sub">{dayLabel(d.date, lang)}</p>
                    <p className="text-label text-fg">{t("{places}에 다녀왔어요", { places: d.places.map((p) => p.name).join(" · ") })}</p>
                  </div>
                </li>
              ))}
              {data.days.length === 0 && <li className="text-label text-fg-muted">{t("아직 방문 기록이 없어요")}</li>}
            </ul>
          </>
        )}
      </ScreenBody>

      <div className="px-5 py-2">
        {/* 트리거 15: 오늘 회고 엽서 만들기 → 09 */}
        <Button onClick={() => router.push("/postcard")}>{t("오늘 회고 엽서 만들기")}</Button>
      </div>
      <TabBar />
    </Screen>
  );
}
