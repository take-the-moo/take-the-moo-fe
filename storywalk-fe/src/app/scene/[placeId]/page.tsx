"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Chip, ChipGroup, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, TopBar } from "@/components/ui";
import { useAskWithPhoto } from "@/hooks/useAskWithPhoto";
import { findPlace, languageLabel, NATIONALITIES, SCENE } from "@/mocks/sample";
import { useUserStore } from "@/store/user";

// 04 장면 · F3 — Figma 1:411 (썸네일 0.6배를 390 기준으로 환산)
// 장면 문구는 POST /scenes 연동 전까지 샘플이다. "다른 나라 시선"으로 국적을 바꾸면
// 같은 화면에서 다시 생성한다(v3.1 노트) — 지금은 선택 UI만 있고 재생성 요청은 연동 시 붙인다.
export default function ScenePage() {
  const { placeId } = useParams<{ placeId: string }>();
  const router = useRouter();
  const place = findPlace(placeId);
  const language = useUserStore((s) => s.language);
  const myNationality = useUserStore((s) => s.nationality);
  const [lens, setLens] = useState<string | null>(null); // 다른 나라 시선으로 볼 국적
  const [lensOpen, setLensOpen] = useState(false);
  const { ask, busy } = useAskWithPhoto();

  if (!place) return <NotFound />;

  return (
    <Screen>
      <TopBar title={place.name} />
      <ScreenBody className="gap-3!">
        <ImagePlaceholder label="대표 이미지" className="h-[150px]" />

        <ChipGroup>
          <Chip selected={!lens} onClick={() => setLens(null)}>
            {languageLabel(language)} + 쉬운 한국어
          </Chip>
          <Chip
            selected={Boolean(lens)}
            aria-expanded={lensOpen}
            onClick={() => setLensOpen((v) => !v)}
          >
            {lens ? `${NATIONALITIES.find((n) => n.code === lens)?.label} 시선` : "다른 나라 시선"} ▾
          </Chip>
        </ChipGroup>
        {lensOpen && (
          <ChipGroup>
            {NATIONALITIES.filter((n) => n.code !== myNationality && n.code !== "ETC").map((n) => (
              <Chip
                key={n.code}
                selected={lens === n.code}
                onClick={() => {
                  setLens(n.code);
                  setLensOpen(false);
                }}
              >
                {n.label}
              </Chip>
            ))}
          </ChipGroup>
        )}

        <Card className="gap-2! leading-[1.45]">
          <p className="text-caption font-bold text-fg-caption">30초 장면</p>
          <p className="text-body font-medium text-ink">{SCENE.native}</p>
          <p className="text-label text-fg-caption">{SCENE.easyKorean}</p>
        </Card>

        <div className="flex flex-col gap-2 rounded-box bg-surface-sunken p-4 leading-[1.45]">
          <p className="text-caption font-bold text-fg-caption">내 나라에서는</p>
          <p className="text-label font-medium text-fg">{SCENE.myCountry}</p>
        </div>

        <Card className="gap-2! leading-[1.45]">
          <p className="text-caption font-bold text-fg-caption">먼저 다녀간 유학생의 한걸음</p>
          <p className="text-body font-medium text-ink">“{SCENE.footstep.text}”</p>
          <p className="text-caption text-fg-muted">{SCENE.footstep.meta}</p>
        </Card>
      </ScreenBody>
      <ScreenFooter className="flex-row!">
        {/* 트리거 8: 사진으로 묻기 → 05 / 트리거 9: 방문 완료 → 06 (도장만) */}
        <Button variant="secondary" className="flex-1" onClick={ask} disabled={busy}>
          사진으로 묻기
        </Button>
        <Button className="flex-1" onClick={() => router.push(`/visit/${place.id}?mode=stamp`)}>
          방문 완료
        </Button>
      </ScreenFooter>
    </Screen>
  );
}

function NotFound() {
  return (
    <Screen>
      <TopBar title="장소를 찾을 수 없어요" />
      <ScreenBody>
        <p className="text-body text-fg-sub">주소가 바뀌었거나 아직 준비되지 않은 장소예요.</p>
      </ScreenBody>
    </Screen>
  );
}
