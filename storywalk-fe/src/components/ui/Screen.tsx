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

// Figma: body 프레임 (좌우 20, 상하 12, 간격 14). 간격을 바꿀 땐 `gap-3!`처럼 !를 붙인다 (cn은 병합하지 않음).
export function ScreenBody({ className, children }: Props) {
  return <div className={cn("flex flex-1 flex-col gap-3.5 px-5 py-3", className)}>{children}</div>;
}

// Figma: footer 프레임 (좌우 20, 상하 16, 간격 10) — 주 버튼 영역. 버튼 두 개를 가로로 놓을 땐 `flex-row!`.
export function ScreenFooter({ className, children }: Props) {
  return (
    <div className={cn("sticky bottom-0 flex flex-col gap-2.5 bg-surface px-5 py-4", className)}>{children}</div>
  );
}

// Figma: 섹션 제목 (16px Bold)
export function SectionTitle({ className, children }: Props) {
  return <h2 className={cn("text-body-lg font-bold text-fg", className)}>{children}</h2>;
}

// Figma: 탭 화면(03·07·08)의 대제목 + 부제 (22px Bold / 13px, 간격 4)
export function ScreenHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 leading-[1.45]">
      <h1 className="text-heading font-bold text-ink">{title}</h1>
      {sub && <p className="text-label text-fg-caption">{sub}</p>}
    </div>
  );
}
