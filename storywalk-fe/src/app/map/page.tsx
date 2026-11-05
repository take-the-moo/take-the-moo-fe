"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo, useState } from "react";
import { reviewsApi } from "@/api/reviews";
import type { MapPin, VisitHistory } from "@/api/types";
import { visitsApi } from "@/api/visits";
import { PostcardFlyIn } from "@/components/map/PostcardFlyIn";
import { TraceMap, type TracePin } from "@/components/map/TraceMap";
import { Card, Chip, PeekSheet, Screen, SectionTitle, TabBar, WalkingLoader } from "@/components/ui";
import { usePlaces } from "@/hooks/usePlaces";
import { useT, type MsgKey } from "@/i18n";
import { nationalityKey, shortDate } from "@/lib/format";
import { MAP_FILTERS, NATIONALITIES } from "@/lib/options";
import { usePostcardStore } from "@/store/postcard";
import { useUserStore } from "@/store/user";
import { cn } from "@/lib/cn";

// 07 흔적 지도 · F6 — Figma 9:1396(시트 올림), 9:1450(시트 내림)
// 장소별 방문 수·국적 분포는 GET /map/pins, 한걸음은 GET /places/{id}/reviews(보는 사람 언어로 번역)다.
// 국적 필터는 핀의 국적 분포로 화면에서 거른다. '이번 주'는 서버가 기간별 집계를 주지 않아 아직 숫자에 반영되지 않는다.
// 내 경로(찍은 도장·코스 정류장)는 GET /users/{id}/visits로 받아, 방문자가 없거나 필터에서 빠지는 곳도 핀으로 남긴다.
// ?placeId=로 들어오면(한걸음 저장 직후) 그 장소를 선택한다.
// 국적 분포 막대: 가장 큰 값이 트랙의 80%를 차지한다 (Figma 막대 비율)
const BAR_MAX = 80;
// 시트를 끝까지 올렸을 때 지도 높이 (Figma 지도 높이)
const MAP_MIN_HEIGHT = 257;
// 다녀간 사람이 아무도 없을 때 지도에 보여줄 장소 수
const EMPTY_PIN_COUNT = 8;

type Props = { searchParams: Promise<{ placeId?: string }> };

const filterCode = (label: string) => NATIONALITIES.find((n) => n.label === label)?.code ?? null;

// 도장을 찍은 곳과 내 코스의 정류장
const routePlaceIds = (history?: VisitHistory) =>
  new Set([...(history?.stamps ?? []), ...(history?.courses.flatMap((c) => c.stops) ?? [])].map((p) => String(p.placeId)));

function toPins(pins: MapPin[], code: string | null, route: Set<string>): TracePin[] {
  const counted = pins.map((p) => ({
    id: String(p.placeId),
    label: p.name,
    count: code ? (p.nationalities.find((n) => n.nationality === code)?.count ?? 0) : p.visitorCount,
    at: [p.longitude, p.latitude] as [number, number],
  }));
  const shown = counted.filter((p) => p.count > 0 || route.has(p.id));
  return shown.length > 0 ? shown : counted.slice(0, EMPTY_PIN_COUNT);
}

export default function MapPage({ searchParams }: Props) {
  const { placeId: initialId } = use(searchParams);
  const t = useT();
  const userId = useUserStore((s) => s.userId);
  const flyingPostcard = usePostcardStore((s) => s.flying);
  const landPostcard = usePostcardStore((s) => s.land);
  const places = usePlaces();
  const [nationality, setNationality] = useState<string>("전체");
  const [thisWeek, setThisWeek] = useState(false);
  const [selected, setSelected] = useState<string | null>(initialId ?? null);

  const history = useQuery({
    queryKey: ["visits", userId],
    queryFn: ({ signal }) => visitsApi.getHistory(userId!, signal),
    enabled: Boolean(userId),
  });

  const pins = useMemo(
    () => toPins(places.data ?? [], filterCode(nationality), routePlaceIds(history.data)),
    [places.data, nationality, history.data],
  );
  const selectedId = selected ?? pins[0]?.id ?? null;
  const selectedPlace = places.data?.find((p) => String(p.placeId) === selectedId);

  const reviews = useQuery({
    queryKey: ["reviews", selectedPlace?.placeId, userId],
    queryFn: ({ signal }) => reviewsApi.getList(selectedPlace!.placeId, { userId: userId ?? undefined }, signal),
    enabled: Boolean(selectedPlace),
  });

  const distribution = selectedPlace?.nationalities ?? [];
  const total = distribution.reduce((sum, n) => sum + n.count, 0);
  const stats = distribution.map((n) => ({ label: nationalityKey(n.nationality), pct: Math.round((n.count / total) * 100) }));
  const maxPct = Math.max(0, ...stats.map((n) => n.pct));

  return (
    // 지도가 남은 높이를 채우도록 화면을 뷰포트에 고정한다. 긴 내용은 시트 안에서만 스크롤한다.
    <Screen className="h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
      <header className="flex h-16 shrink-0 items-center bg-surface px-6">
        <h1 className="text-heading font-bold text-black">{t("흔적 지도")}</h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col bg-surface-sunken">
        {/* isolate: 지도 SDK 내부 z-index가 밖으로 새지 않게 가둔다. 지도는 핀으로 처음 영역을 정해서 내 경로까지 받은 뒤 그린다 */}
        {pins.length > 0 && selectedId && !history.isLoading ? (
          <TraceMap pins={pins} selectedId={selectedId} onSelect={setSelected} className="isolate h-auto! min-h-0 flex-1 rounded-none!" />
        ) : (
          <p className="flex flex-1 items-center justify-center text-caption text-fg-muted">
            {places.isError ? t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.") : <WalkingLoader large label={t("불러오는 중…")} />}
          </p>
        )}
        <PeekSheet
          keep={MAP_MIN_HEIGHT}
          label={selectedPlace?.name ?? t("흔적 지도")}
          head={
            <div className="flex justify-between gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {MAP_FILTERS.map((f) => (
                <Chip key={f} selected={nationality === f} onClick={() => setNationality(f)}>
                  {t(f)}
                </Chip>
              ))}
              <Chip selected={thisWeek} onClick={() => setThisWeek((v) => !v)}>
                {t("이번 주")}
              </Chip>
            </div>
          }
        >
          <Card className="gap-3!">
            <p className="text-body font-bold text-fg">
              {t("{place} · 다녀간 유학생 {count}명", { place: selectedPlace?.name ?? "", count: selectedPlace?.visitorCount ?? 0 })}
            </p>
            {stats.length > 0 && (
              <div className="flex flex-col gap-2">
                {stats.map((n, i) => (
                  <div key={n.label} className="flex items-center gap-3 text-caption font-medium">
                    <span className="w-11 shrink-0 text-fg-sub">{t(n.label as MsgKey)}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-[4px] bg-line">
                      <span
                        className={cn("block h-2", i === 0 ? "bg-primary" : "bg-fg-muted")}
                        style={{ width: `${(n.pct / maxPct) * BAR_MAX}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-fg-muted">{n.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <section className="flex flex-col gap-4">
            <SectionTitle>{t("한걸음")}</SectionTitle>
            <ul className="flex flex-col gap-4">
              {reviews.data?.reviews.map((r) => (
                <li key={r.reviewId} className="flex gap-3">
                  <span aria-hidden className="size-9 shrink-0 rounded-full bg-line" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-medium">
                    <p className="text-caption text-fg-muted">
                      {t(nationalityKey(r.nationality) as MsgKey)} · {shortDate(r.writtenDate)}
                    </p>
                    <p className="text-body text-fg">{r.translatedContent ?? r.content}</p>
                  </div>
                </li>
              ))}
              {reviews.data?.reviews.length === 0 && <li className="text-body text-fg-muted">{t("한걸음이 아직 없어요")}</li>}
              {reviews.isPending && selectedPlace && <li className="text-body text-fg-muted"><WalkingLoader label={t("불러오는 중…")} /></li>}
            </ul>
          </section>
        </PeekSheet>
      </div>
      <TabBar />
      {flyingPostcard && (
        // 방문자가 없는 장소는 핀이 없어서 첫 핀으로 들어간다
        <PostcardFlyIn src={flyingPostcard} pinId={pins.some((p) => p.id === selectedId) ? (selectedId ?? undefined) : pins[0]?.id} onDone={landPostcard} />
      )}
    </Screen>
  );
}
