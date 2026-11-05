import { cn } from "@/lib/cn";

type Props = { className?: string; children: React.ReactNode };

// Figma: 안내 — 회색 배경 안내문 (radius 16, padding 16, 12px / 1.5)
export function InfoBox({ className, children }: Props) {
  return (
    <div className={cn("w-full rounded-control bg-surface-sunken p-4 text-caption leading-[1.5] font-medium text-fg-sub", className)}>
      {children}
    </div>
  );
}

// Figma: card — 흰 바탕 테두리 카드 (radius 16, padding 16)
// cn은 클래스를 병합하지 않으므로, 기본값과 같은 속성(gap·padding·방향)을 바꿀 때는 `gap-2!`처럼 !를 붙인다.
export function Card({ className, children }: Props) {
  return (
    <div className={cn("flex w-full flex-col gap-2 rounded-control border border-line bg-surface p-4", className)}>
      {children}
    </div>
  );
}
