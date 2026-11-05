import { cn } from "@/lib/cn";

type Props = { className?: string; children: React.ReactNode };

// 화면 골격. 레이아웃의 safe-area 여백을 뺀 높이를 채워서 footer·탭바가 항상 아래에 붙게 한다.
export function Screen({ className, children }: Props) {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Figma: body 프레임 (좌우 24). 간격을 바꿀 땐 `gap-3!`처럼 !를 붙인다 (cn은 병합하지 않음).
export function ScreenBody({ className, children }: Props) {
  return <div className={cn("flex flex-1 flex-col gap-6 px-6 py-3", className)}>{children}</div>;
}

// Figma: footer 프레임 (좌우 24) — 주 버튼 영역. 버튼 두 개를 가로로 놓을 땐 `flex-row!`.
export function ScreenFooter({ className, children }: Props) {
  return (
    <div className={cn("sticky bottom-0 flex flex-col gap-3 bg-surface px-6 pt-3 pb-4", className)}>{children}</div>
  );
}

// Figma: 섹션 제목 (16px Bold, Gray 700)
export function SectionTitle({ className, children }: Props) {
  return <h2 className={cn("text-body-lg font-bold text-fg-sub", className)}>{children}</h2>;
}

// Figma: 탭 화면(03·08)의 대제목 + 부제 (26px Bold / 14px)
export function ScreenHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h1 className="text-heading font-bold text-fg">{title}</h1>
      {sub && <p className="text-body font-medium text-fg-muted">{sub}</p>}
    </div>
  );
}
