import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Figma: Chip default · Selected
// onClick이 있으면 토글 버튼(aria-pressed), 없으면 정보 표시용 라벨로 렌더링한다.
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

export function Chip({ selected = false, onClick, className, children, type = "button", ...rest }: Props) {
  const style = cn(
    "inline-flex shrink-0 items-center justify-center rounded-pill border px-4 py-2.5 text-body leading-[1.2] font-medium whitespace-nowrap",
    selected ? "border-primary bg-primary text-point" : "border-line-strong bg-surface text-fg-sub",
    className,
  );

  if (!onClick) return <span className={style}>{children}</span>;

  return (
    <button type={type} aria-pressed={selected} onClick={onClick} className={style} {...rest}>
      {children}
    </button>
  );
}

// 칩 묶음: 줄바꿈되는 12px 간격 행
export function ChipGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex w-full flex-wrap gap-3", className)}>{children}</div>;
}
