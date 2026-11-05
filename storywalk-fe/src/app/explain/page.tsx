"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { placesApi } from "@/api/places";
import type { MapPin } from "@/api/types";
import { Button, ImagePlaceholder, OptionRow, Screen, ScreenBody, ScreenFooter, TextField, TopBar } from "@/components/ui";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { usePlaces } from "@/hooks/usePlaces";
import { useT } from "@/i18n";
import { distanceLabel } from "@/lib/format";
import { takePhoto } from "@/platform/camera";
import { useCaptureStore, useLatestPhoto } from "@/store/capture";

// 05 현장 해설 · 장소 확인 · F4 — Figma 1:436 (썸네일 0.6배를 390 기준으로 환산)
// 사진만으로 장소를 추측하지 않고 사용자가 근처 장소 중에서 고른다(요구서 F4).
// 근처 후보는 GET /places/nearby(위치 1회, 거부면 기본 역 기준). "여기 없어요"는 전체 장소 목록에서 이름으로 찾는다.
// 고른 장소는 사진에 기록해 두었다가 사진을 올릴 때 placeId로 보낸다(엽서 제목의 장소).
const SEARCH = "search";
const NEARBY_LIMIT = 3;

export default function ExplainPage() {
  const router = useRouter();
  const t = useT();
  const photo = useLatestPhoto();
  const addPhoto = useCaptureStore((s) => s.add);
  const tagPlace = useCaptureStore((s) => s.tagPlace);
  const location = useCurrentLocation();
  const nearby = useQuery({
    queryKey: ["nearby", location.data],
    queryFn: ({ signal }) =>
      placesApi.getNearby(location.data ? { ...location.data, limit: NEARBY_LIMIT } : { limit: NEARBY_LIMIT }, signal),
    enabled: !location.isPending,
  });
  const places = usePlaces();
  const [choice, setChoice] = useState<string | null>(null); // 사용자가 고른 행 (없으면 가장 가까운 곳)
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<MapPin | null>(null); // 검색으로 고른 장소

  const retake = async () => {
    try {
      addPhoto(await takePhoto());
    } catch {
      // 취소 — 기존 사진 유지
    }
  };

  const results = query.trim() ? (places.data ?? []).filter((p) => p.name.includes(query.trim())).slice(0, 8) : [];
  const selected = choice ?? (nearby.data?.[0] ? String(nearby.data[0].placeId) : null);
  const targetId = selected === SEARCH ? picked?.placeId : selected ? Number(selected) : undefined;

  const showExplanation = () => {
    if (targetId == null) return;
    if (photo) tagPlace(photo.url, targetId);
    router.push(`/visit/${targetId}?mode=explain`);
  };

  return (
    <Screen>
      <TopBar title={t("현장 해설")} />
      <ScreenBody className="gap-2.5!">
        <button type="button" onClick={retake} aria-label={photo ? t("사진 다시 찍기") : t("사진 찍기")} className="w-full">
          <ImagePlaceholder label={photo ? t("방금 찍은 사진") : t("눌러서 사진 찍기")} src={photo?.url} className="h-[230px]" />
        </button>
        <h2 className="text-headline leading-[1.45] font-bold text-fg">{t("이 사진은 어디인가요?")}</h2>
        <p className="text-caption leading-[1.45] text-fg-muted">{t("근처 장소 중에서 골라주세요 · 위치는 저장하지 않아요")}</p>

        <div role="radiogroup" aria-label={t("사진 속 장소")} className="flex flex-col gap-2.5">
          {nearby.isPending && <p className="px-1 text-caption text-fg-muted">{t("불러오는 중…")}</p>}
          {nearby.isError && <p className="px-1 text-caption text-fg-muted">{t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.")}</p>}
          {nearby.data?.map((place) => (
            <OptionRow
              key={place.placeId}
              title={place.name}
              sub={distanceLabel(place.distanceMeters)}
              selected={selected === String(place.placeId)}
              onSelect={() => setChoice(String(place.placeId))}
            />
          ))}
          <OptionRow
            title={picked ? picked.name : t("여기 없어요")}
            sub={picked ? t("직접 검색해서 골랐어요") : t("직접 검색하기")}
            selected={selected === SEARCH}
            onSelect={() => setChoice(SEARCH)}
          />
        </div>

        {selected === SEARCH && (
          <div className="flex flex-col gap-2">
            <TextField
              type="search"
              placeholder={t("장소 이름으로 검색")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("장소 검색")}
            />
            {results.map((p) => (
              <button
                key={p.placeId}
                type="button"
                onClick={() => {
                  setPicked(p);
                  setQuery("");
                }}
                className="rounded-control px-3.5 py-2 text-left text-body text-fg active:bg-surface-sunken"
              >
                {p.name}
              </button>
            ))}
            {query.trim() && results.length === 0 && (
              <p className="px-1 text-caption text-fg-muted">{t("검색 결과가 없어요")}</p>
            )}
          </div>
        )}
      </ScreenBody>
      <ScreenFooter>
        {/* 트리거 10: 해설 보기 → 06 */}
        <Button disabled={targetId == null} onClick={showExplanation}>
          {t("해설 보기")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
