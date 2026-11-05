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

// Figma: body 프레임 (좌우 20, 상하 12, 간격 14)
export function ScreenBody({ className, children }: Props) {
  return <div className={cn("flex flex-1 flex-col gap-3.5 px-5 py-3", className)}>{children}</div>;
}

// Figma: footer 프레임 (좌우 20, 상하 16, 간격 10) — 주 버튼 영역
export function ScreenFooter({ className, children }: Props) {
  return (
    <div className={cn("sticky bottom-0 flex flex-col gap-2.5 bg-surface px-5 py-4", className)}>{children}</div>
  );
}

// Figma: 섹션 제목 (16px Bold)
export function SectionTitle({ className, children }: Props) {
  return <h2 className={cn("text-body-lg font-bold text-fg", className)}>{children}</h2>;
}
