"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ApiError } from "@/api/client";
import { toApiLanguage } from "@/api/codes";
import { placesApi } from "@/api/places";
import { visitsApi } from "@/api/visits";
import { courseStops, CourseSteps } from "@/components/course/CourseProgress";
import { Button, Card, Chip, ChipGroup, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, Stamp, TopBar, TypingText, WalkingLoader } from "@/components/ui";
import { usePlace } from "@/hooks/usePlaces";
import { useLang, useT, type MsgKey } from "@/i18n";
import { parseDate } from "@/lib/format";
import { languageLabel } from "@/lib/options";
import { placeImage } from "@/lib/placeImage";
import { getCurrentPosition } from "@/platform/location";
import { useLatestPhoto } from "@/store/capture";
import { useUserStore } from "@/store/user";

// 06 해설 결과 · 방문 도장 · F4·F5 — Figma 9:1287
// mode=explain: 05에서 장소를 고르고 온 경우 — 사진·저장된 해설(POST /explanations)·도장·코스 진행
// mode=stamp:   04 "방문 완료"(트리거 9)로 온 경우 — 사진·해설 없이 도장 영역만 (v3.1 노트)
// 도장은 들어오면 바로 POST /visits(현재 위치로 근접 검증, 기본 200m)를 부른다. 같은 날 다시 찍으면 서버가 alreadyStamped로 준다.
// 실내 시연은 NEXT_PUBLIC_DEMO_STAMP_AT_PLACE=true로 기기 위치 대신 장소 좌표를 보낸다 (BE 문서의 시연 방법).
const STAMP_AT_PLACE = process.env.NEXT_PUBLIC_DEMO_STAMP_AT_PLACE === "true";

type Props = {
  params: Promise<{ placeId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

const dateLabel = (d: Date, lang: string | null) =>
  new Intl.DateTimeFormat(lang ?? "ko", { month: "numeric", day: "numeric", weekday: "short" }).format(d);

class NoLocationError extends Error {}

export default function VisitPage({ params, searchParams }: Props) {
  const placeId = Number(use(params).placeId);
  const { mode } = use(searchParams);
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const place = usePlace(placeId);
  const photo = useLatestPhoto();
  const userId = useUserStore((s) => s.userId);
  const language = useUserStore((s) => s.language);
  const explain = mode === "explain";

  const explanation = useQuery({
    queryKey: ["explanation", placeId, language],
    queryFn: ({ signal }) => placesApi.explain({ placeId, language: toApiLanguage(language) }, signal),
    enabled: explain && Number.isInteger(placeId),
    staleTime: Infinity,
  });

  const visit = useQuery({
    queryKey: ["visit", placeId, userId],
    queryFn: async ({ signal }) => {
      const at = STAMP_AT_PLACE && place ? { lat: place.latitude, lng: place.longitude } : await getCurrentPosition().catch(() => null);
      if (!at) throw new NoLocationError();
      return visitsApi.stamp({ userId: userId!, placeId, ...at }, signal);
    },
    enabled: Boolean(userId) && Number.isInteger(placeId) && (!STAMP_AT_PLACE || Boolean(place)),
    staleTime: Infinity,
    retry: false,
  });

  if (!Number.isInteger(placeId)) {
    return (
      <Screen>
        <TopBar title={t("장소를 찾을 수 없어요")} />
      </Screen>
    );
  }

  const stamp = visit.data;
  const course = stamp?.recommendedCourse ?? null;
  const next = course?.next ?? null;
  const placeName = stamp?.placeName ?? explanation.data?.name ?? place?.name ?? "";
  const stampText = stampStatus(visit.error, Boolean(stamp), stamp?.firstVisit ?? false);

  return (
    <Screen>
      <TopBar title={t(placeName as MsgKey)} />
      {explain && (
        <ImagePlaceholder label={t("내가 찍은 사진")} src={photo?.url ?? placeImage(placeName, place?.imageUrl)} className="h-[245px] shrink-0 rounded-none!" />
      )}
      <ScreenBody className="gap-4! pt-5!">
        {explain && (
          <>
            <ChipGroup className="mb-2 gap-2!">
              <Chip selected>{t("저장된 해설")}</Chip>
              <Chip>{t("{language}로 번역", { language: t(languageLabel(language)) })}</Chip>
            </ChipGroup>
            <Card className="text-body leading-[1.45] font-medium">
              {explanation.data ? (
                <>
                  <p className="whitespace-pre-line text-fg"><TypingText text={explanation.data.text} /></p>
                  {explanation.data.text !== explanation.data.original && (
                    <p className="whitespace-pre-line text-fg-muted"><TypingText text={explanation.data.original} /></p>
                  )}
                </>
              ) : (
                <p className="text-fg-muted">
                  {explanation.isError ? t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.") : <WalkingLoader label={t("불러오는 중…")} />}
                </p>
              )}
            </Card>
          </>
        )}

        <Card className="gap-6! px-4! pt-5! pb-[25px]!">
          <div className="flex items-center gap-5">
            <Stamp size={86} done={Boolean(stamp)} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-headline font-bold text-fg">{t(stampText.title)}</p>
              <p className="text-caption font-medium text-fg-muted">
                {stamp ? `${t(stamp.placeName as MsgKey)} · ${dateLabel(parseDate(stamp.visitedDate), lang)}` : stampText.sub && t(stampText.sub)}
              </p>
            </div>
          </div>
          {visit.isError && (
            <Button variant="text" onClick={() => visit.refetch()} disabled={visit.isFetching}>
              {t("다시 시도")}
            </Button>
          )}
          {course && (
            <div className="flex flex-col gap-3 rounded-control bg-surface-sunken p-4">
              <p className="text-body font-bold text-fg">
                {course.name} {course.visitedCount} / {course.totalCount}
              </p>
              <CourseSteps {...courseStops(course.stops)} />
            </div>
          )}
        </Card>
      </ScreenBody>
      <ScreenFooter className="flex-row! gap-2!">
        {/* 트리거 11: 한걸음 남기기 → N3 / 트리거 12: 다음 장소 → 04 복귀 */}
        <Button variant="secondary" className="flex-1" onClick={() => router.push(`/visit/${placeId}/review`)}>
          {t("한걸음 남기기")}
        </Button>
        {next ? (
          <Button className="flex-1" onClick={() => router.push(`/scene/${next.placeId}`)}>
            {t("다음: {place} {walk}", { place: t(next.name as MsgKey), walk: t("{minutes}분", { minutes: next.walkingMinutes }) })}
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => router.push("/log")}>
            {t("나의 기록 보기")}
          </Button>
        )}
      </ScreenFooter>
    </Screen>
  );
}

function stampStatus(error: Error | null, done: boolean, firstVisit: boolean): { title: MsgKey; sub?: MsgKey } {
  if (done) return { title: firstVisit ? "방문 도장 획득!" : "다시 왔어요" };
  if (!error) return { title: "도장을 찍는 중…" };
  if (error instanceof NoLocationError)
    return { title: "아직 도장을 받을 수 없어요", sub: "위치를 확인할 수 없어요. 위치 권한을 확인해 주세요." };
  if (error instanceof ApiError && error.code === "VISIT_TOO_FAR")
    return { title: "아직 도장을 받을 수 없어요", sub: "장소 가까이에서 다시 시도해 주세요" };
  return { title: "아직 도장을 받을 수 없어요", sub: "불러오지 못했어요. 잠시 후 다시 시도해 주세요." };
}
