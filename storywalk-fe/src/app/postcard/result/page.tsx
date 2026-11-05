"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, CheckCircle, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, TopBar } from "@/components/ui";
import { POSTCARD } from "@/mocks/sample";
import { sharePostcard } from "@/platform/share";
import { usePostcardStore } from "@/store/postcard";

// 10 엽서 결과 · F7 — Figma 1:759 (썸네일 0.6배를 390 기준으로 환산)
// 생성 중(약 30초)에는 상단에 진행 표시, 완료되면 결과를 보여준다 — 별도 대기 화면(N4)은 v3.1에서 삭제.
// 생성 API가 없어 샘플은 SAMPLE_DURATION_MS 뒤 완료로 바꾼다. 연동 시 GET /postcards/{id} 조회로 대체한다.
const SAMPLE_DURATION_MS = 4000;

export default function PostcardResultPage() {
  const router = useRouter();
  const job = usePostcardStore((s) => s.job);
  const finish = usePostcardStore((s) => s.finish);
  const [now, setNow] = useState(() => Date.now());
  const [saveError, setSaveError] = useState<string | null>(null);

  const generating = job?.status === "generating";

  useEffect(() => {
    if (!job || job.status !== "generating") return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t - job.startedAt >= SAMPLE_DURATION_MS) finish();
    }, 250);
    return () => clearInterval(timer);
  }, [job, finish]);

  const progress = job && generating ? Math.min(1, (now - job.startedAt) / SAMPLE_DURATION_MS) : 1;
  const style = job?.style ?? "수채화";
  const note = job?.note ?? POSTCARD.note;
  const sampleNote = note === POSTCARD.note;

  const save = async () => {
    if (!POSTCARD.imageUrl) {
      setSaveError("아직 저장할 엽서 이미지가 없어요 (생성 API 연동 전)");
      return;
    }
    try {
      await sharePostcard(POSTCARD.imageUrl);
    } catch {
      setSaveError("이미지를 저장하지 못했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <Screen>
      <TopBar title="나의 서대문 엽서" />
      <ScreenBody>
        <div className="flex flex-col gap-2 rounded-control bg-surface-sunken px-3 py-2.5" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5">
            {generating ? (
              <span aria-hidden className="size-[18px] shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-ink" />
            ) : (
              <CheckCircle size={18} />
            )}
            <p className="text-caption leading-[1.45] font-medium text-fg-sub">
              {generating ? `엽서를 만들고 있어요 · 약 ${POSTCARD.expectedSeconds}초 · 다른 화면에 가 있어도 돼요` : "완성됐어요"}
            </p>
          </div>
          {generating && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-ink transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </div>

        <article className="flex flex-col gap-3 rounded-box border-2 border-primary bg-surface p-3">
          <ImagePlaceholder
            src={generating ? null : POSTCARD.imageUrl}
            label={generating ? "엽서를 그리는 중…" : `AI 생성 엽서 (사진 ${job?.photoCount ?? 4}장 + 소감 + ${style})`}
            className="h-[300px]"
          />
          <div className="flex flex-col gap-1 px-1 leading-[1.45]">
            <p className="text-caption font-bold text-fg-caption">{POSTCARD.caption}</p>
            <p className="text-[15px] font-medium text-ink">“{sampleNote ? POSTCARD.noteKorean : note}”</p>
            {sampleNote && <p className="text-caption text-fg-muted">{POSTCARD.note}</p>}
          </div>
        </article>
        {saveError && (
          <p role="alert" className="text-caption text-fg">
            {saveError}
          </p>
        )}
      </ScreenBody>
      <ScreenFooter className="flex-row!">
        {/* 트리거 17: 흔적 지도에 공유 → 07 / 트리거 18: 이미지 저장 */}
        <Button variant="secondary" className="flex-1" disabled={generating} onClick={() => router.push("/map")}>
          흔적 지도에 공유
        </Button>
        <Button className="flex-1" disabled={generating} onClick={save}>
          이미지 저장
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
