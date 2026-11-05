"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAssetUrl } from "@/api/client";
import { postcardsApi } from "@/api/postcards";
import { Button, CheckCircle, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, TopBar } from "@/components/ui";
import { useT } from "@/i18n";
import { POSTCARD_SECONDS } from "@/lib/options";
import { sharePostcard } from "@/platform/share";
import { usePostcardStore } from "@/store/postcard";

// 10 엽서 결과 · F7 — Figma 9:1189
// 프레임·소감·날짜까지 서버가 합성한 JPEG(1200×1800)라 화면은 이미지를 그대로 보여준다.
// 생성 중에는 상단에 진행 표시, 완료되면 결과를 보여준다 — 별도 대기 화면(N4)은 v3.1에서 삭제.
// GET /postcards/{id}를 1.5초마다 확인해 COMPLETED면 이미지, FAILED면 다시 만들기 안내를 보여준다.
// 진행 막대는 서버가 진행률을 주지 않아 예상 시간 기준으로 채우고, 끝나기 전에는 90%에서 멈춘다.
const POLL_MS = 1500;

export default function PostcardResultPage() {
  const router = useRouter();
  const t = useT();
  const job = usePostcardStore((s) => s.job);
  const [now, setNow] = useState(() => Date.now());
  const [saveError, setSaveError] = useState<string | null>(null);

  const postcard = useQuery({
    queryKey: ["postcard", job?.postcardId],
    queryFn: ({ signal }) => postcardsApi.get(job!.postcardId, signal),
    enabled: Boolean(job),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "COMPLETED" || status === "FAILED" ? false : POLL_MS;
    },
  });

  const status = postcard.data?.status;
  const failed = status === "FAILED" || postcard.isError;
  const generating = Boolean(job) && !failed && status !== "COMPLETED";
  const imageUrl = postcard.data?.imageUrl ? getAssetUrl(postcard.data.imageUrl) : null;
  const downloadUrl = postcard.data?.downloadUrl ? getAssetUrl(postcard.data.downloadUrl) : imageUrl;

  useEffect(() => {
    if (!generating) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [generating]);

  const expectedMs = POSTCARD_SECONDS * 1000;
  const progress = job && generating ? Math.min(0.9, (now - job.startedAt) / expectedMs) : 1;

  const save = async () => {
    if (!downloadUrl) {
      setSaveError(t("이미지를 저장하지 못했어요. 다시 시도해 주세요."));
      return;
    }
    try {
      await sharePostcard(downloadUrl);
    } catch {
      setSaveError(t("이미지를 저장하지 못했어요. 다시 시도해 주세요."));
    }
  };

  return (
    <Screen>
      <TopBar title={t("나의 서대문 엽서")} />
      <ScreenBody className="gap-3! items-center">
        <div className="flex w-full flex-col gap-2 rounded-control bg-surface-sunken p-3.5" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5">
            {generating ? (
              <span aria-hidden className="size-5 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-fg" />
            ) : (
              <CheckCircle done={!failed} />
            )}
            <p className="text-caption leading-[1.5] font-medium text-fg-sub">
              {failed
                ? t("엽서를 만들지 못했어요. 다시 만들어 주세요.")
                : generating
                  ? t("엽서를 만들고 있어요 · 약 {seconds}초 · 다른 화면에 가 있어도 돼요", { seconds: POSTCARD_SECONDS })
                  : t("완성됐어요")}
            </p>
          </div>
          {generating && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </div>

        <ImagePlaceholder
          src={imageUrl}
          label={generating ? t("엽서를 그리는 중…") : t("나의 서대문 엽서")}
          className="aspect-[2/3] rounded-[3px]! border border-[#1f1f1e]"
        />
        {saveError && (
          <p role="alert" className="text-caption text-fg">
            {saveError}
          </p>
        )}
      </ScreenBody>
      <ScreenFooter className="flex-row!">
        {/* 트리거 17: 흔적 지도에 공유 → 07 / 트리거 18: 이미지 저장 */}
        <Button variant="secondary" className="flex-1" disabled={generating} onClick={() => router.push("/map")}>
          {t("흔적 지도에 공유")}
        </Button>
        <Button className="flex-1" disabled={generating || !imageUrl} onClick={save}>
          {t("이미지 저장")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
