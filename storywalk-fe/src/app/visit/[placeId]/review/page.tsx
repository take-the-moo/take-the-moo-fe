"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/api/client";
import { photosApi } from "@/api/photos";
import { reviewsApi } from "@/api/reviews";
import { PlusIcon } from "@/components/icons";
import { Button, ImagePlaceholder, InfoBox, Screen, ScreenBody, ScreenFooter, SectionTitle, TextArea, TopBar } from "@/components/ui";
import { usePlace } from "@/hooks/usePlaces";
import { useT } from "@/i18n";
import { toUploadFile } from "@/lib/image";
import { takePhoto } from "@/platform/camera";
import { useUserStore } from "@/store/user";
import { cn } from "@/lib/cn";

// N3 한걸음 작성 · F6 — Figma 9:1365
// 사진이 있으면 POST /photos로 먼저 올리고, POST /places/{placeId}/reviews(JSON)로 저장한 뒤 07 흔적 지도로 간다(트리거 13).
// 부적절한 표현(422 REVIEW_INAPPROPRIATE)이면 입력을 유지하고 오류만 안내한다(v3.1 노트).
// 작성 언어(language)는 보내지 않는다 — 설정 언어와 실제로 쓴 언어가 다를 수 있어 서버가 판정한다.
const MAX = 60;

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string; blocked: boolean };

export default function ReviewPage() {
  const placeId = Number(useParams<{ placeId: string }>().placeId);
  const router = useRouter();
  const t = useT();
  const queryClient = useQueryClient();
  const place = usePlace(placeId);
  const userId = useUserStore((s) => s.userId);
  const addFootstep = useUserStore((s) => s.addFootstep);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<{ url: string; blob: Blob } | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const pickPhoto = async () => {
    try {
      const blob = await takePhoto();
      setPhoto((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(blob), blob };
      });
    } catch {
      // 취소
    }
  };

  const submit = async () => {
    if (!userId) return;
    setStatus({ kind: "saving" });
    try {
      const photoId = photo
        ? (await photosApi.upload({ file: await toUploadFile(photo.blob), userId, placeId })).photoId
        : undefined;
      const review = await reviewsApi.create(placeId, { userId, content: text.trim(), photoId });
      addFootstep({ name: place?.name ?? "", date: review.writtenDate });
      await queryClient.invalidateQueries({ queryKey: ["reviews", placeId] });
      await queryClient.invalidateQueries({ queryKey: ["places"] });
      router.push(`/map?placeId=${placeId}`); // 방금 남긴 장소를 지도에서 바로 보여준다
    } catch (e) {
      const blocked = e instanceof ApiError && e.code === "REVIEW_INAPPROPRIATE";
      setStatus({
        kind: "error",
        blocked,
        message: blocked ? t("부적절한 표현이 있어 저장되지 않았어요. 문장을 고쳐 주세요.") : t("저장하지 못했어요. 잠시 후 다시 시도해 주세요."),
      });
    }
  };

  const error = status.kind === "error" ? status : null;

  return (
    <Screen>
      <TopBar title={t("한걸음 남기기")} />
      <ScreenBody className="gap-8! pt-2!">
        <div className="flex items-center gap-2 self-start rounded-[20px] bg-surface-sunken px-3 py-2">
          <span className="text-body font-bold text-fg">{place?.name ?? t("알 수 없는 장소")}</span>
          <span className="text-caption font-medium text-fg-muted">{t("방문 완료")}</span>
        </div>

        <section className="flex flex-col gap-3">
          <SectionTitle>{t("사진 (선택)")}</SectionTitle>
          <button
            type="button"
            onClick={pickPhoto}
            aria-label={photo ? t("사진 바꾸기") : t("사진 추가")}
            className="flex size-24 flex-col items-center justify-center gap-2 overflow-hidden rounded-control bg-surface-sunken text-caption font-medium text-fg-muted"
          >
            {photo ? (
              <ImagePlaceholder src={photo.url} label={t("첨부한 사진")} className="size-24" />
            ) : (
              <>
                <PlusIcon />
                {t("사진 추가")}
              </>
            )}
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>
            <label htmlFor="footstep">{t("한 줄로 남겨보세요")}</label>
          </SectionTitle>
          <TextArea
            id="footstep"
            className="h-28"
            maxLength={MAX}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setStatus({ kind: "idle" });
            }}
            placeholder={t("오늘 이곳에서 본 것, 느낀 것을 한 줄로")}
            aria-describedby="footstep-guide"
            aria-invalid={error?.blocked || undefined}
          />
          <div className="flex w-full items-start justify-between gap-3 text-caption font-medium">
            <p id="footstep-guide" role={error ? "alert" : undefined} className={cn("flex items-center gap-1.5", error ? "text-fg" : "text-fg-muted")}>
              <span aria-hidden className="flex size-4 shrink-0 items-center justify-center rounded-full border border-current">
                !
              </span>
              {error ? error.message : t("부적절한 표현이 있으면 저장되지 않아요")}
            </p>
            <span className="shrink-0 text-fg-muted">
              {text.length} / {MAX}
            </span>
          </div>
          <InfoBox className="flex flex-col gap-1.5">
            <p>{t("보는 사람의 언어로 자동 번역돼요 · 원문 언어가 함께 표시돼요")}</p>
            <p>{t("내 위치와 방문 시각은 공개되지 않아요")}</p>
          </InfoBox>
        </section>
      </ScreenBody>
      <ScreenFooter>
        <Button onClick={submit} disabled={!text.trim() || status.kind === "saving"}>
          {status.kind === "saving" ? t("남기는 중…") : t("남기기")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
