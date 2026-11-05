"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ImagePlaceholder, OptionRow, Screen, ScreenBody, ScreenFooter, TextField, TopBar } from "@/components/ui";
import { NEARBY, PLACES, type Place } from "@/mocks/sample";
import { takePhoto } from "@/platform/camera";
import { useCaptureStore, useLatestPhoto } from "@/store/capture";

// 05 현장 해설 · 장소 확인 · F4 — Figma 1:436 (썸네일 0.6배를 390 기준으로 환산)
// 사진만으로 장소를 추측하지 않고 사용자가 근처 장소 중에서 고른다(요구서 F4).
// 근처 후보는 GET /places/nearby 연동 전까지 샘플이다. "여기 없어요"는 검색 후 이 화면에서 바로 고른다.
const SEARCH = "search";

export default function ExplainPage() {
  const router = useRouter();
  const photo = useLatestPhoto();
  const addPhoto = useCaptureStore((s) => s.add);
  const [selected, setSelected] = useState<string>(NEARBY[0].place.id);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Place | null>(null); // 검색으로 고른 장소

  const retake = async () => {
    try {
      addPhoto(await takePhoto());
    } catch {
      // 취소 — 기존 사진 유지
    }
  };

  const results = query.trim()
    ? Object.values(PLACES).filter((p: Place) => p.name.includes(query.trim()))
    : [];
  const targetId = selected === SEARCH ? picked?.id : selected;

  return (
    <Screen>
      <TopBar title="현장 해설" />
      <ScreenBody className="gap-2.5!">
        <button type="button" onClick={retake} aria-label={photo ? "사진 다시 찍기" : "사진 찍기"} className="w-full">
          <ImagePlaceholder label={photo ? "방금 찍은 사진" : "눌러서 사진 찍기"} src={photo?.url} className="h-[230px]" />
        </button>
        <h2 className="text-headline leading-[1.45] font-bold text-fg">이 사진은 어디인가요?</h2>
        <p className="text-caption leading-[1.45] text-fg-muted">근처 장소 중에서 골라주세요 · 위치는 저장하지 않아요</p>

        <div role="radiogroup" aria-label="사진 속 장소" className="flex flex-col gap-2.5">
          {NEARBY.map(({ place, spot, distance }) => (
            <OptionRow
              key={place.id}
              title={spot ? `${place.name} · ${spot}` : place.name}
              sub={distance}
              selected={selected === place.id}
              onSelect={() => setSelected(place.id)}
            />
          ))}
          <OptionRow
            title={picked ? picked.name : "여기 없어요"}
            sub={picked ? "직접 검색해서 골랐어요" : "직접 검색하기"}
            selected={selected === SEARCH}
            onSelect={() => setSelected(SEARCH)}
          />
        </div>

        {selected === SEARCH && (
          <div className="flex flex-col gap-2">
            <TextField
              type="search"
              placeholder="장소 이름으로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="장소 검색"
            />
            {results.map((p) => (
              <button
                key={p.id}
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
              <p className="px-1 text-caption text-fg-muted">검색 결과가 없어요</p>
            )}
          </div>
        )}
      </ScreenBody>
      <ScreenFooter>
        {/* 트리거 10: 해설 보기 → 06 */}
        <Button disabled={!targetId} onClick={() => router.push(`/visit/${targetId}?mode=explain`)}>
          해설 보기
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
