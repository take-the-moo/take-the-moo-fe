import { cn } from "@/lib/cn";

type Props = { className?: string; children: React.ReactNode };

// Figma: '안내' 프레임 — 회색 배경 안내문 (radius 14, padding 14, 13px)
export function InfoBox({ className, children }: Props) {
  return (
    <div className={cn("w-full rounded-box bg-surface-sunken p-3.5 text-label leading-5 text-fg-sub", className)}>
      {children}
    </div>
  );
}

// Figma: rec-card · card — 흰 바탕 테두리 카드 (radius 14, padding 16)
// cn은 클래스를 병합하지 않으므로, 기본값과 같은 속성(gap·padding·방향)을 바꿀 때는 `gap-2!`처럼 !를 붙인다.
export function Card({ className, children }: Props) {
  return (
    <div className={cn("flex w-full flex-col gap-2.5 rounded-box border border-line bg-surface p-4", className)}>
      {children}
    </div>
  );
}
