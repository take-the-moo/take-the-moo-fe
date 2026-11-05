"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/icons";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";

// Figma: TopBar (상태 표시줄 아래 높이 64, 좌우 24, 뒤로가기 20px + 제목 18px Medium)
type Props = {
  title: string;
  onBack?: () => void; // 생략하면 router.back()
  hideBack?: boolean;
  right?: React.ReactNode;
  className?: string;
};

export function TopBar({ title, onBack, hideBack = false, right, className }: Props) {
  return (
    <header className={cn("flex h-16 shrink-0 items-center gap-3.5 bg-surface px-6", className)}>
      {!hideBack && <BackButton onBack={onBack} />}
      <h1 className="min-w-0 flex-1 truncate text-headline leading-[1.45] font-medium text-fg">{title}</h1>
      {right}
    </header>
  );
}

// Figma: TopBar step1·step2 — 뒤로가기 아래 노란 진행 막대. 가입 단계(N2·01)에서 쓴다.
export function StepBar({ step, total }: { step: number; total: number }) {
  const t = useT();
  return (
    <header className="flex shrink-0 flex-col items-start gap-7 bg-surface px-6 pt-5">
      <BackButton />
      <div role="progressbar" aria-label={t("가입 단계")} aria-valuenow={step} aria-valuemin={1} aria-valuemax={total} className="flex w-full gap-2.5">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-[5px] flex-1 rounded-[18px]", i < step ? "bg-point" : "bg-line")} />
        ))}
      </div>
    </header>
  );
}

function BackButton({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const t = useT();
  return (
    <button type="button" aria-label={t("뒤로 가기")} onClick={onBack ?? (() => router.back())} className="-m-1 p-1 text-fg">
      <BackIcon />
    </button>
  );
}
