"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { use } from "react";
import { toApiNationality } from "@/api/codes";
import { nowApi } from "@/api/now";
import type { NowQuery, NowResponse, TimeSlot, Weather } from "@/api/types";
import { visitsApi } from "@/api/visits";
import { ArrowUpRightIcon, CameraIcon, ChevronIcon } from "@/components/icons";
import { Button, Card, ImagePlaceholder, Screen, ScreenBody, ScreenHeading, SectionTitle, TabBar, TypingText, WalkingLoader } from "@/components/ui";
import { useAskWithPhoto } from "@/hooks/useAskWithPhoto";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { usePlaces } from "@/hooks/usePlaces";
import { useLang, useT, type MsgKey } from "@/i18n";
import { nationalityKey } from "@/lib/format";
import { placeImage } from "@/lib/placeImage";
import { useLoggedIn, useUserHydrated, useUserStore } from "@/store/user";

// 03 지금 (홈) · F2 — Figma 9:1050
// 진입 시 위치를 한 번 받아 GET /now로 추천 1곳·이유·지난주 인기를 받는다 (위치 거부면 기본 역 기준).
// 카드 태그의 국적별 방문 수는 GET /map/pins, 코스 진행은 GET /users/{id}/visits에서 찾는다.
// 발표장(실내) 시연용으로 주소 쿼리를 그대로 넘긴다: /?weather=RAINY&time=15:00&stationId=12 (lat·lng도 가능)
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const SLOT: Record<TimeSlot, MsgKey> = { MORNING: "아침", AFTERNOON: "오후", EVENING: "저녁" };
const WEATHER_DAY: Record<Weather, MsgKey> = { CLEAR: "맑은 날", RAINY: "비 오는 날", SNOWY: "눈 오는 날" };

function demoQuery(params: Record<string, string | string[] | undefined>): Partial<NowQuery> {
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const lat = Number(one("lat"));
  const lng = Number(one("lng"));
  const stationId = Number(one("stationId"));
  return {
    weather: one("weather") as Weather | undefined,
    time: one("time"),
    ...(Number.isFinite(lat) && Number.isFinite(lng) && one("lat") && one("lng") ? { lat, lng } : {}),
    ...(one("stationId") && Number.isFinite(stationId) ? { stationId } : {}),
  };
}

export default function NowPage({ searchParams }: Props) {
  const demo = demoQuery(use(searchParams));
  const t = useT();
  const lang = useLang();
  const hydrated = useUserHydrated();
  const loggedIn = useLoggedIn();
  const userId = useUserStore((s) => s.userId);
  const language = useUserStore((s) => s.language);
  const nationality = toApiNationality(useUserStore((s) => s.nationality));
  const { ask, busy } = useAskWithPhoto();
  const location = useCurrentLocation();

  // 시연 좌표·역이 있으면 기기 위치 대신 쓴다
  const position = "lat" in demo || "stationId" in demo ? {} : location.data ?? {};
  const query: NowQuery = { userId: userId ?? undefined, ...position, ...demo } as NowQuery;
  const now = useQuery({
    queryKey: ["now", query, language],
    queryFn: ({ signal }) => nowApi.get(query, signal),
    enabled: loggedIn && !location.isPending,
    staleTime: 5 * 60_000,
  });
  const places = usePlaces();
  const history = useQuery({
    queryKey: ["visits", userId],
    queryFn: ({ signal }) => visitsApi.getHistory(userId!, signal),
    enabled: Boolean(userId),
  });

  // 로그인 전이면 Providers가 00 시작으로 보낸다.
  if (!hydrated || !loggedIn) return <Screen>{null}</Screen>;

  const data = now.data;
  const pin = (placeId: number) => places.data?.find((p) => p.placeId === placeId);
  const myCount = data && pin(data.place.placeId)?.nationalities.find((n) => n.nationality === nationality)?.count;
  const course = data && history.data?.courses.find((c) => c.stops.some((s) => s.placeId === data.place.placeId));

  return (
    <Screen>
      <ScreenBody className="gap-8! pt-6!">
        {data ? (
          <NowHeading data={data} lang={lang} />
        ) : (
          <ScreenHeading title={t("지금, {area} 근처", { area: t("서대문") })} />
        )}

        {/* 바로가기: 카메라로 묻기 → 05 */}
        <button
          type="button"
          onClick={ask}
          disabled={busy}
          className="flex h-[55px] w-full items-center gap-6 rounded-[30px] border border-line bg-surface px-2.5 text-body-lg font-medium text-fg"
        >
          <CameraIcon className="shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">{t("지금 보이는 걸 찍어서 물어보기")}</span>
          <ChevronIcon className="mr-2.5 shrink-0 text-fg-muted" />
        </button>

        {!data && !now.isError && <WalkingLoader large label={t("불러오는 중…")} />}

        {now.isError && (
          <Card>
            <p className="text-body leading-[1.45] text-fg-muted">{t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.")}</p>
            <Button variant="secondary" onClick={() => now.refetch()}>
              {t("다시 시도")}
            </Button>
          </Card>
        )}

        {data && (
          <section className="flex flex-col gap-5">
            <SectionTitle>{t("지금 가기 좋은 곳")}</SectionTitle>
            {/* 트리거 6: 장면 보기 → 04 */}
            <Link
              href={`/scene/${data.place.placeId}`}
              className="relative flex h-[300px] flex-col justify-end gap-3 overflow-hidden rounded-control bg-surface-placeholder px-4 pt-4 pb-5 shadow-[0_0_13.6px_rgba(0,0,0,0.08)]"
            >
              <ImagePlaceholder label={t(data.place.name as MsgKey)} src={placeImage(data.place.name, data.place.imageUrl)} className="absolute inset-0 h-full rounded-none!" />
              <span aria-hidden className="absolute inset-0 bg-linear-to-b from-black/5 from-40% to-black" />
              <span className="relative flex flex-wrap gap-2">
                {Boolean(myCount) && (
                  <Tag>{t("{country} 유학생 {count}명 다녀감", { country: t(nationalityKey(nationality) as MsgKey), count: myCount! })}</Tag>
                )}
                {course && <Tag>{`${course.name} ${course.visitedCount}/${course.totalCount}`}</Tag>}
              </span>
              <span className="relative flex items-end justify-between gap-3">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-title font-bold text-point">{t(data.place.name as MsgKey)}</span>
                  <span className="text-caption leading-[1.5] font-medium text-surface-sunken">
                    <TypingText text={`${data.reason} · ${t("도보 {minutes}분", { minutes: data.place.walkMinutes })}`} />
                  </span>
                </span>
                <ArrowUpRightIcon className="shrink-0 text-white" />
              </span>
            </Link>
          </section>
        )}

        {data && data.weeklyPopular.length > 0 && (
          <section className="flex flex-col gap-5">
            <SectionTitle>{t("지난주 유학생 인기")}</SectionTitle>
            <div className="flex gap-3.5">
              {data.weeklyPopular.slice(0, 2).map((p) => (
                // 인기 장소 카드도 04로 연결된다 (v3.1 피드백)
                <Link key={p.placeId} href={`/scene/${p.placeId}`} className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-hidden rounded-control border border-line pb-2.5">
                  <ImagePlaceholder label={t(p.name as MsgKey)} src={placeImage(p.name, pin(p.placeId)?.imageUrl)} className="aspect-[170/103] rounded-none! object-top" />
                  <span className="flex flex-col gap-2 px-2 font-medium">
                    <span className="truncate text-body-lg text-fg">{t(p.name as MsgKey)}</span>
                    <span className="text-caption text-fg-muted">{t("유학생 {count}명", { count: p.visitorCount })}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </ScreenBody>
      <TabBar />
    </Screen>
  );
}

function Tag({ children }: { children: string }) {
  return <span className="rounded-[20px] bg-white/20 px-2.5 py-1.5 text-micro font-medium text-white backdrop-blur-[2px]">{children}</span>;
}

// 제목·요약: "지금, 독립문역 근처" / "토요일 오후 · 비 오는 날 추천해요"
function NowHeading({ data, lang }: { data: NowResponse; lang: string | null }) {
  const t = useT();
  const { context } = data;
  const weekday = new Intl.DateTimeFormat(lang ?? "ko", { weekday: "long", timeZone: "Asia/Seoul" }).format(new Date());
  const slot = context.timeSlot ? t(SLOT[context.timeSlot]) : t("밤");
  const area = context.baseStation ? t("{station}역", { station: context.baseStation }) : t("서대문");

  return (
    <ScreenHeading
      title={t("지금, {area} 근처", { area })}
      sub={t("{when} · {weather} 추천해요", { when: `${weekday} ${slot}`, weather: t(WEATHER_DAY[context.weather]) })}
    />
  );
}
