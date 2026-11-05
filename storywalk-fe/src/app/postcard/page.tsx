"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, CheckCircle, Chip, ChipGroup, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, SectionTitle, TopBar } from "@/components/ui";
import { postcardsApi } from "@/api/postcards";
import { useT } from "@/i18n";
import { POSTCARD, POSTCARD_STYLES } from "@/mocks/sample";
import { takePhoto } from "@/platform/camera";
import { uploadCapturedPhoto, useCaptureStore } from "@/store/capture";
import { usePostcardStore } from "@/store/postcard";
import { useUserStore } from "@/store/user";
import { cn } from "@/lib/cn";

// 09 회고 엽서 만들기 · F7 — Figma 1:719 (썸네일 0.6배를 390 기준으로 환산)
// 사진 + 소감을 골라 POST /postcards로 생성을 시작하고 10으로 간다(트리거 16).
// 서버 엽서는 사진 1장 + 한 문장(100자) + 템플릿(BASIC)이라, 고른 사진 중 첫 장을 올려(POST /photos) 쓴다.
// 그림체는 서버 템플릿이 하나뿐이라 아직 요청에 반영되지 않는다. 칸은 이번 실행에서 찍은 사진으로 채운다.
const SLOTS = 4;
const NOTE_MAX = 100;

export default function PostcardPage() {
  const router = useRouter();
  const t = useT();
  const photos = useCaptureStore((s) => s.photos);
  const addPhoto = useCaptureStore((s) => s.add);
  const startJob = usePostcardStore((s) => s.start);
  const userId = useUserStore((s) => s.userId);
  const [deselected, setDeselected] = useState<number[]>([]); // 선택 해제한 칸
  const [note, setNote] = useState<string>("");
  const [style, setStyle] = useState<string>(POSTCARD_STYLES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const recent = photos.slice(-SLOTS);
  const slots = Array.from({ length: SLOTS }, (_, i) => recent[i] ?? null);
  const chosen = slots.filter((p, i) => p && !deselected.includes(i));
  const selectedCount = chosen.length;

  const create = async () => {
    const photo = chosen[0];
    if (!photo || !userId) return;
    setSaving(true);
    setError(false);
    try {
      const photoId = await uploadCapturedPhoto(photo, userId);
      const postcard = await postcardsApi.create({ userId, photoId, comment: note.trim() });
      startJob({ postcardId: postcard.postcardId, style, note: note.trim(), photoCount: selectedCount });
      router.push("/postcard/result");
    } catch {
      setError(true);
      setSaving(false);
    }
  };
  const toggle = (i: number) => setDeselected((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));

  const addMore = async () => {
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
        <div className="flex items-center justify-between leading-[1.45]">
          <SectionTitle>{t("사진 4장 고르기")}</SectionTitle>
          <span className="text-label font-medium text-fg-caption">
            {selectedCount} / {SLOTS}
          </span>
        </div>
        <ul className="flex gap-2">
          {slots.map((photo, i) => {
            const selected = !deselected.includes(i);
            return (
              <li key={photo?.url ?? `slot-${i}`}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${t("사진{n}", { n: i + 1 })} ${selected ? t("선택됨") : t("선택 안 됨")}`}
                  onClick={() => toggle(i)}
                  className={cn("relative block size-[81px]", !selected && "opacity-50")}
                >
                  <ImagePlaceholder label={t("사진{n}", { n: i + 1 })} src={photo?.url} className="size-[81px]" />
                  {selected && <CheckCircle size={20} className="absolute top-1 right-1" />}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={addMore} className="self-start text-caption font-medium text-fg-caption">
          {t("+ 오늘 찍은 사진 {count}장 중에서 선택", { count: photos.length })}
        </button>

        <SectionTitle>
          <label htmlFor="postcard-note">{t("오늘 어땠어요?")}</label>
        </SectionTitle>
        <div className="flex min-h-24 flex-col gap-1.5 rounded-control border border-line p-4 leading-[1.45] focus-within:border-fg">
          <textarea
            id="postcard-note"
            rows={2}
            maxLength={NOTE_MAX}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("오늘 느낀 걸 내 언어로 적어 보세요")}
            className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-fg-muted"
          />
        </div>

        <SectionTitle>{t("그림체")}</SectionTitle>
        <ChipGroup>
          {POSTCARD_STYLES.map((s) => (
            <Chip key={s} selected={style === s} onClick={() => setStyle(s)}>
              {t(s)}
            </Chip>
          ))}
        </ChipGroup>
      </ScreenBody>
      <ScreenFooter>
        <p role={error ? "alert" : undefined} className="text-center text-caption leading-[1.45] text-fg-muted">
          {error
            ? t("엽서를 만들지 못했어요. 다시 만들어 주세요.")
            : t("만드는 데 {seconds}초쯤 걸려요 · 다른 화면에 가 있어도 돼요", { seconds: POSTCARD.expectedSeconds })}
        </p>
        <Button disabled={selectedCount === 0 || !note.trim() || saving} onClick={create}>
          {saving ? t("준비하는 중…") : t("엽서 만들기")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
