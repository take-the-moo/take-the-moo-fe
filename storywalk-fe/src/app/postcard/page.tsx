"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postcardsApi } from "@/api/postcards";
import { Button, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, SectionTitle, TextArea, TopBar, UploadPlaceholder } from "@/components/ui";
import { useT } from "@/i18n";
import { POSTCARD_SECONDS } from "@/lib/options";
import { takePhoto } from "@/platform/camera";
import { uploadCapturedPhoto, useCaptureStore, useLatestPhoto } from "@/store/capture";
import { usePostcardStore } from "@/store/postcard";
import { useUserStore } from "@/store/user";

// 09 회고 엽서 만들기 · F7 — Figma 9:1169
// 사진 1장 + 소감을 골라 POST /photos → POST /postcards로 생성을 시작하고 10으로 간다(트리거 16).
// 이번 실행에서 찍은 사진이 있으면 그 사진으로 시작하고, 눌러서 바꿀 수 있다.
const NOTE_MAX = 100;

export default function PostcardPage() {
  const router = useRouter();
  const t = useT();
  const photo = useLatestPhoto();
  const addPhoto = useCaptureStore((s) => s.add);
  const startJob = usePostcardStore((s) => s.start);
  const userId = useUserStore((s) => s.userId);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const create = async () => {
    if (!photo || !userId) return;
    setSaving(true);
    setError(false);
    try {
      const photoId = await uploadCapturedPhoto(photo, userId);
      const postcard = await postcardsApi.create({ userId, photoId, comment: note.trim() });
      startJob(postcard.postcardId);
      router.push("/postcard/result");
    } catch {
      setError(true);
      setSaving(false);
    }
  };

  const pickPhoto = async () => {
    try {
      addPhoto(await takePhoto());
    } catch {
      // 취소
    }
  };

  return (
    <Screen>
      <TopBar title={t("회고 엽서 만들기")} />
      <ScreenBody>
        <section className="flex flex-col gap-3">
          <SectionTitle>{t("사진 1장 고르기")}</SectionTitle>
          <button type="button" onClick={pickPhoto} aria-label={photo ? t("사진 바꾸기") : t("사진 추가")} className="block w-full">
            {photo ? <ImagePlaceholder src={photo.url} label={t("첨부한 사진")} className="h-[245px]" /> : <UploadPlaceholder className="h-[245px]" />}
          </button>
        </section>

        <section className="flex flex-col gap-5">
          <SectionTitle>
            <label htmlFor="postcard-note">{t("오늘 어땠어요?")}</label>
          </SectionTitle>
          <TextArea
            id="postcard-note"
            rows={2}
            maxLength={NOTE_MAX}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("오늘 느낀 걸 내 언어로 적어 보세요")}
          />
        </section>
      </ScreenBody>
      <ScreenFooter>
        <p role={error ? "alert" : undefined} className="text-center text-caption font-medium text-fg-muted">
          {error ? t("엽서를 만들지 못했어요. 다시 만들어 주세요.") : t("만드는 데 {seconds}초 정도 걸려요", { seconds: POSTCARD_SECONDS })}
        </p>
        <Button disabled={!photo || !note.trim() || saving} onClick={create}>
          {saving ? t("준비하는 중…") : t("엽서 만들기")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
