import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Figma: WF/Chip/Default · WF/Chip/Selected
// onClick이 있으면 토글 버튼(aria-pressed), 없으면 정보 표시용 라벨로 렌더링한다.
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

export function Chip({ selected = false, onClick, className, children, type = "button", ...rest }: Props) {
  const style = cn(
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-pill px-3 py-1.5 text-label leading-[1.4]",
    selected ? "bg-primary font-bold text-on-primary" : "bg-surface-sunken font-medium text-fg-sub",
    className,
  );

  if (!onClick) return <span className={style}>{children}</span>;

  return (
    <button type={type} aria-pressed={selected} onClick={onClick} className={style} {...rest}>
      {children}
    </button>
  );
}

// 칩 묶음: 줄바꿈되는 8px 간격 행 (Figma: chips 프레임)
export function ChipGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex w-full flex-wrap gap-2", className)}>{children}</div>;
}
