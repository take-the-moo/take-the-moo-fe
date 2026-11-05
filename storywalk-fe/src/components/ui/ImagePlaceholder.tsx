"use client";

import { ImageIcon } from "@/components/icons";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";

// Figma: WF/ImagePlaceholder — 실제 이미지가 없을 때의 자리. 크기는 className(높이 등)으로 정한다.
// src가 있으면 같은 자리·모서리로 이미지를 채운다 (사용자가 찍은 사진 미리보기 등).
export function ImagePlaceholder({ label, src, className }: { label?: string; src?: string | null; className?: string }) {
  const t = useT();
  const text = label ?? t("사진");
  if (src) {
    // 사용자가 고른 로컬 사진(blob: URL)이라 next/image 최적화 대상이 아니다.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={text} className={cn("w-full rounded-control bg-surface-placeholder object-cover", className)} />;
  }
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-1.5 rounded-control bg-surface-placeholder text-caption font-medium leading-[1.4] text-fg-muted",
        className,
      )}
    >
      <ImageIcon className="text-[#8a8a8a]" />
      {text}
    </div>
  );
}
