"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/api/client";
import { toApiLanguage, toApiNationality } from "@/api/codes";
import { reviewsApi } from "@/api/reviews";
import { scenesApi } from "@/api/scenes";
import { Button, Card, Chip, ChipGroup, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, TopBar } from "@/components/ui";
import { useAskWithPhoto } from "@/hooks/useAskWithPhoto";
import { usePlace } from "@/hooks/usePlaces";
import { useT, type MsgKey } from "@/i18n";
import { nationalityKey, shortDate } from "@/lib/format";
import { languageLabel, NATIONALITIES } from "@/mocks/sample";
import { useUserStore } from "@/store/user";

// 04 장면 · F3 — Figma 1:411 (썸네일 0.6배를 390 기준으로 환산)
// POST /scenes로 모국어 + 쉬운 한국어 이야기와 내 나라 한 줄 연결을 받는다.
// "다른 나라 시선"으로 국적을 바꾸면 그 국적으로 다시 요청한다(v3.1 노트). 결과는 서버가 캐싱한다.
// 대표 이미지는 장소 목록(GET /map/pins), 한걸음은 GET /places/{id}/reviews의 최신 1개다.
export default function ScenePage() {
  const params = useParams<{ placeId: string }>();
  const placeId = Number(params.placeId);
  const router = useRouter();
  const t = useT();
  const place = usePlace(placeId);
  const userId = useUserStore((s) => s.userId);
  const language = useUserStore((s) => s.language);
  const myNationality = useUserStore((s) => s.nationality);
  const [lens, setLens] = useState<string | null>(null); // 다른 나라 시선으로 볼 국적
  const [lensOpen, setLensOpen] = useState(false);
  const { ask, busy } = useAskWithPhoto();

  const body = {
    placeId,
    nationality: toApiNationality(lens ?? myNationality),
    language: toApiLanguage(language),
  };
  const scene = useQuery({
    queryKey: ["scene", body],
    queryFn: ({ signal }) => scenesApi.create(body, signal),
    enabled: Number.isInteger(placeId) && Boolean(language),
    staleTime: Infinity,
  });
  const footstep = useQuery({
    queryKey: ["reviews", placeId, userId, 1],
    queryFn: ({ signal }) => reviewsApi.getList(placeId, { userId: userId ?? undefined, limit: 1 }, signal),
    enabled: Number.isInteger(placeId),
    select: (list) => list.reviews[0] ?? null,
  });

  const notFound = !Number.isInteger(placeId) || (scene.error instanceof ApiError && scene.error.status === 404);
  if (notFound) return <NotFound />;

  const lensLabel = NATIONALITIES.find((n) => n.code === lens)?.label;
  const data = scene.data;
  const review = footstep.data;

  return (
    <Screen>
      <TopBar title={data?.placeName ?? place?.name ?? ""} />
      <ScreenBody className="gap-3!">
        <ImagePlaceholder label={t("대표 이미지")} src={place?.imageUrl} className="h-[150px]" />

        <ChipGroup>
          <Chip selected={!lens} onClick={() => setLens(null)}>
            {t("{language} + 쉬운 한국어", { language: t(languageLabel(language)) })}
          </Chip>
          <Chip
            selected={Boolean(lens)}
            aria-expanded={lensOpen}
            onClick={() => setLensOpen((v) => !v)}
          >
            {lensLabel ? t("{country} 시선", { country: t(lensLabel) }) : t("다른 나라 시선")} ▾
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
                {t(n.label)}
              </Chip>
            ))}
          </ChipGroup>
        )}

        <Card className="gap-2! leading-[1.45]">
          <p className="text-caption font-bold text-fg-caption">{t("30초 장면")}</p>
          {data ? (
            <>
              <p className="text-body font-medium text-ink">{data.storyNative}</p>
              <p className="text-label text-fg-caption">{data.storyEasyKorean}</p>
            </>
          ) : scene.isError ? (
            <>
              <p className="text-label text-fg-caption">{t("불러오지 못했어요. 잠시 후 다시 시도해 주세요.")}</p>
              <Button variant="secondary" onClick={() => scene.refetch()}>
                {t("다시 시도")}
              </Button>
            </>
          ) : (
            <p className="text-label text-fg-caption">{t("장면을 만들고 있어요…")}</p>
          )}
        </Card>

        {data && (
          <div className="flex flex-col gap-2 rounded-box bg-surface-sunken p-4 leading-[1.45]">
            <p className="text-caption font-bold text-fg-caption">{t("내 나라에서는")}</p>
            <p className="text-label font-medium text-fg">{data.connectionLine}</p>
          </div>
        )}

        {review && (
          <Card className="gap-2! leading-[1.45]">
            <p className="text-caption font-bold text-fg-caption">{t("먼저 다녀간 유학생의 한걸음")}</p>
            <p className="text-body font-medium text-ink">“{review.translatedContent ?? review.content}”</p>
            <p className="text-caption text-fg-muted">
              {t(nationalityKey(review.nationality) as MsgKey)} · {shortDate(review.writtenDate)}
              {review.translatedContent ? ` · ${t("번역됨")}` : ""}
            </p>
          </Card>
        )}
      </ScreenBody>
      <ScreenFooter className="flex-row!">
        {/* 트리거 8: 사진으로 묻기 → 05 / 트리거 9: 방문 완료 → 06 (도장만) */}
        <Button variant="secondary" className="flex-1" onClick={ask} disabled={busy}>
          {t("사진으로 묻기")}
        </Button>
        <Button className="flex-1" onClick={() => router.push(`/visit/${placeId}?mode=stamp`)}>
          {t("방문 완료")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}

function NotFound() {
  const t = useT();
  return (
    <Screen>
      <TopBar title={t("장소를 찾을 수 없어요")} />
      <ScreenBody>
        <p className="text-body text-fg-sub">{t("주소가 바뀌었거나 아직 준비되지 않은 장소예요.")}</p>
      </ScreenBody>
    </Screen>
  );
}
