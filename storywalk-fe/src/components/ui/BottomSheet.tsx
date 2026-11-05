import { cn } from "@/lib/cn";

// Figma: 00 'Sheet · 시작 선택 창' + 'Dim'. 닫기 동작이 없는 고정 시트다(첫 실행에서 반드시 선택).
// 앱 폭(max-w-md) 안에서 화면 하단에 붙고, 홈 인디케이터 영역만큼 아래 여백을 더한다.
export function BottomSheet({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-40 bg-dim" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md flex-col gap-3.5 rounded-t-sheet bg-surface px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]",
          className,
        )}
      >
        <div aria-hidden className="mx-auto h-1 w-10 rounded-[2px] bg-line" />
        <h2 className="text-title font-bold text-ink">{title}</h2>
        {children}
      </section>
    </>
  );
}
