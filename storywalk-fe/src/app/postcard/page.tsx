"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, CheckCircle, Chip, ChipGroup, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, SectionTitle, TopBar } from "@/components/ui";
import { POSTCARD, POSTCARD_STYLES } from "@/mocks/sample";
import { takePhoto } from "@/platform/camera";
import { useCaptureStore } from "@/store/capture";
import { usePostcardStore } from "@/store/postcard";
import { cn } from "@/lib/cn";

// 09 회고 엽서 만들기 · F7 — Figma 1:719 (썸네일 0.6배를 390 기준으로 환산)
// 사진 4장 + 소감 + 그림체를 골라 생성을 시작하고 10으로 간다(트리거 16).
// 칸은 이번 실행에서 찍은 사진으로 채우고, 모자라면 샘플 칸으로 채운다(오늘 사진 목록 API 연동 전).
const SLOTS = 4;

export default function PostcardPage() {
  const router = useRouter();
  const photos = useCaptureStore((s) => s.photos);
  const addPhoto = useCaptureStore((s) => s.add);
  const startJob = usePostcardStore((s) => s.start);
  const [deselected, setDeselected] = useState<number[]>([]); // 선택 해제한 칸
  const [note, setNote] = useState<string>(POSTCARD.note);
  const [style, setStyle] = useState<string>(POSTCARD_STYLES[0]);

  const recent = photos.slice(-SLOTS);
  const slots = Array.from({ length: SLOTS }, (_, i) => recent[i] ?? null);
  const selectedCount = SLOTS - deselected.length;
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
      <TopBar title="회고 엽서 만들기" />
      <ScreenBody>
        <div className="flex items-center justify-between leading-[1.45]">
          <SectionTitle>사진 4장 고르기</SectionTitle>
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
                  aria-label={`사진${i + 1} ${selected ? "선택됨" : "선택 안 됨"}`}
                  onClick={() => toggle(i)}
                  className={cn("relative block size-[81px]", !selected && "opacity-50")}
                >
                  <ImagePlaceholder label={`사진${i + 1}`} src={photo?.url} className="size-[81px]" />
                  {selected && <CheckCircle size={20} className="absolute top-1 right-1" />}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={addMore} className="self-start text-caption font-medium text-fg-caption">
          + 오늘 찍은 사진 {Math.max(POSTCARD.todayPhotoCount, photos.length)}장 중에서 선택
        </button>

        <SectionTitle>
          <label htmlFor="postcard-note">오늘 어땠어요?</label>
        </SectionTitle>
        <div className="flex min-h-24 flex-col gap-1.5 rounded-control border border-line p-4 leading-[1.45] focus-within:border-fg">
          <textarea
            id="postcard-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="오늘 느낀 걸 내 언어로 적어 보세요"
            className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-fg-muted"
          />
          {/* 번역은 생성 API가 해준다. 샘플 문장일 때만 샘플 번역을 보여준다. */}
          {note === POSTCARD.note && <p className="text-caption text-fg-muted">→ {POSTCARD.noteKorean}</p>}
        </div>

        <SectionTitle>그림체</SectionTitle>
        <ChipGroup>
          {POSTCARD_STYLES.map((s) => (
            <Chip key={s} selected={style === s} onClick={() => setStyle(s)}>
              {s}
            </Chip>
          ))}
        </ChipGroup>
      </ScreenBody>
      <ScreenFooter>
        <p className="text-center text-caption leading-[1.45] text-fg-muted">
          만드는 데 {POSTCARD.expectedSeconds}초쯤 걸려요 · 다른 화면에 가 있어도 돼요
        </p>
        <Button
          disabled={selectedCount !== SLOTS || !note.trim()}
          onClick={() => {
            startJob({ style, note: note.trim(), photoCount: SLOTS });
            router.push("/postcard/result");
          }}
        >
          엽서 만들기
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
