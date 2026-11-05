"use client";

import { ImageIcon, UploadIcon } from "@/components/icons";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";

// 이미지가 없을 때의 자리. 크기는 className(높이 등)으로 정한다.
// src가 있으면 같은 자리·모서리로 이미지를 채운다 (사용자가 찍은 사진, 장소 사진).
export function ImagePlaceholder({ label, src, className }: { label?: string; src?: string | null; className?: string }) {
  const t = useT();
  const text = label ?? t("사진");
  if (src) {
    // 사용자가 고른 로컬 사진(blob: URL)과 서버 이미지라 next/image 최적화 대상이 아니다.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={text} className={cn("w-full rounded-control bg-surface-placeholder object-cover", className)} />;
  }
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-1.5 rounded-control bg-surface-placeholder text-caption font-medium text-fg-muted",
        className,
      )}
    >
      <ImageIcon className="text-fg-muted" />
      {text}
    </div>
  );
}

// Figma: photo 업로드 전 — 05·09에서 사진을 고르기 전에 보이는 자리
export function UploadPlaceholder({ className }: { className?: string }) {
  const t = useT();
  return (
    <div className={cn("flex w-full flex-col items-center justify-center gap-5 rounded-control bg-surface-placeholder text-headline font-medium text-black", className)}>
      <UploadIcon />
      {t("이미지를 업로드하세요")}
    </div>
  );
}
