"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { nowApi } from "@/api/now";
import type { NowQuery, NowResponse, TimeSlot, Weather } from "@/api/types";
import {
  Button,
  Card,
  Chip,
  ChipGroup,
  ImagePlaceholder,
  Screen,
  ScreenBody,
  ScreenHeading,
  SectionTitle,
  TabBar,
} from "@/components/ui";
import { useAskWithPhoto } from "@/hooks/useAskWithPhoto";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { usePlaces } from "@/hooks/usePlaces";
import { useLang, useT, type MsgKey } from "@/i18n";
import { useLoggedIn, useUserHydrated, useUserStore } from "@/store/user";

// 03 지금 (홈) · F2 — Figma 1:376
// 진입 시 위치를 한 번 받아 GET /now로 추천 1곳·이유·지난주 인기를 받는다 (위치 거부면 기본 역 기준).
// 발표장(실내) 시연용으로 주소 쿼리를 그대로 넘긴다: /?weather=RAINY&time=15:00&stationId=12 (lat·lng도 가능)
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const SLOT: Record<TimeSlot, MsgKey> = { MORNING: "아침", AFTERNOON: "오후", EVENING: "저녁" };
const WEATHER_DAY: Record<Weather, MsgKey> = { CLEAR: "맑은 날", RAINY: "비 오는 날", SNOWY: "눈 오는 날" };
const WEATHER: Record<Weather, MsgKey> = { CLEAR: "맑음", RAINY: "비", SNOWY: "눈" };

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
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const hydrated = useUserHydrated();
  const loggedIn = useLoggedIn();
  const userId = useUserStore((s) => s.userId);
  const language = useUserStore((s) => s.language);
  const { ask, busy } = useAskWithPhoto();
  const location = useCurrentLocation();
  const places = usePlaces(); // 인기 카드 사진: weeklyPopular에는 imageUrl이 없어 장소 목록에서 찾는다

  // 시연 좌표·역이 있으면 기기 위치 대신 쓴다
  const position = "lat" in demo || "stationId" in demo ? {} : location.data ?? {};
  const query: NowQuery = { userId: userId ?? undefined, ...position, ...demo } as NowQuery;
  const now = useQuery({
    queryKey: ["now", query, language],
    queryFn: ({ signal }) => nowApi.get(query, signal),
    enabled: loggedIn && !location.isPending,
    staleTime: 5 * 60_000,
  });

  // 로그인 전이면 Providers가 00 시작으로 보낸다.
  if (!hydrated || !loggedIn) return <Screen>{null}</Screen>;

  const data = now.data;

  return (
    <Screen>
      <ScreenBody>
        {data ? (
          <NowHeading data={data} lang={lang} />
        ) : (
          <ScreenHeading title={t("지금, {area} 근처", { area: t("서대문") })} sub={now.isError ? undefined : t("불러오는 중…")} />
        )}

        {now.isError && (
          <Card>
            <p className="text-label leading-[1.45] text-fg-caption">{t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.")}</p>
            <Button variant="secondary" onClick={() => now.refetch()}>
              {t("다시 시도")}
            </Button>
          </Card>
        )}

        {data && (
          <>
            <SectionTitle>{t("지금 가기 좋은 곳")}</SectionTitle>
            <Card>
              <ImagePlaceholder label={t("장소 사진 (TourAPI)")} src={data.place.imageUrl} className="h-[104px]" />
              <p className="text-[18px] font-bold leading-[1.45] text-fg">{data.place.name}</p>
              <p className="text-label leading-[1.45] text-fg-caption">{data.reason}</p>
              <ChipGroup>
                <Chip>{t("도보 {minutes}분", { minutes: data.place.walkMinutes })}</Chip>
                {data.place.indoor && <Chip>{t("실내")}</Chip>}
              </ChipGroup>
              {/* 트리거 6: 장면 보기 → 04 */}
              <Button onClick={() => router.push(`/scene/${data.place.placeId}`)}>{t("장면 보기")}</Button>
            </Card>

            {data.weeklyPopular.length > 0 && (
              <>
                <SectionTitle>{t("지난주 유학생 인기")}</SectionTitle>
                <div className="flex gap-2.5">
                  {data.weeklyPopular.slice(0, 2).map((p) => (
                    // 인기 장소 카드도 04로 연결된다 (v3.1 피드백)
                    <Link key={p.placeId} href={`/scene/${p.placeId}`} className="flex min-w-0 flex-1">
                      <Card className="gap-1.5! p-2.5!">
                        <ImagePlaceholder
                          src={places.data?.find((pin) => pin.placeId === p.placeId)?.imageUrl}
                          label={p.name}
                          className="h-[52px]"
                        />
                        <p className="text-body font-bold leading-[1.45] text-fg">{p.name}</p>
                        <p className="text-caption leading-[1.45] text-fg-muted">{t("유학생 {count}명", { count: p.visitorCount })}</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </ScreenBody>

      <div className="px-5 py-2">
        {/* 바로가기: 카메라로 묻기 → 05 */}
        <Button variant="secondary" onClick={ask} disabled={busy}>
          {t("지금 보이는 걸 찍어서 물어보기")}
        </Button>
      </div>
      <TabBar />
    </Screen>
  );
}

// 제목·요약·상황 칩: "지금, 독립문역 근처" / "토 오후 · 비 오는 날 추천이에요" / "토 15:20", "비 · 12°C"
function NowHeading({ data, lang }: { data: NowResponse; lang: string | null }) {
  const t = useT();
  const { context } = data;
  const weekday = new Intl.DateTimeFormat(lang ?? "ko", { weekday: "short", timeZone: "Asia/Seoul" }).format(new Date());
  const slot = context.timeSlot ? t(SLOT[context.timeSlot]) : t("밤");
  const area = context.baseStation ? t("{station}역", { station: context.baseStation }) : t("서대문");
  const weather = t(WEATHER[context.weather]) + (context.temperature != null ? ` · ${Math.round(context.temperature)}°C` : "");

  return (
    <>
      <ScreenHeading
        title={t("지금, {area} 근처", { area })}
        sub={t("{when} · {weather} 추천이에요", { when: `${weekday} ${slot}`, weather: t(WEATHER_DAY[context.weather]) })}
      />
      <ChipGroup>
        <Chip>{`${weekday} ${context.time}`}</Chip>
        <Chip>{weather}</Chip>
      </ChipGroup>
    </>
  );
}
