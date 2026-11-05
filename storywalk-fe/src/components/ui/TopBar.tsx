"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/icons";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";

// Figma: WF/TopBar (높이 52, 좌우 16, 뒤로가기 24px + 제목 17px Bold)
type Props = {
  title: string;
  onBack?: () => void; // 생략하면 router.back()
  hideBack?: boolean;
  right?: React.ReactNode;
  className?: string;
};

export function TopBar({ title, onBack, hideBack = false, right, className }: Props) {
  const router = useRouter();
  const t = useT();

  return (
    <header className={cn("flex h-[52px] shrink-0 items-center gap-2 bg-surface px-4", className)}>
      {!hideBack && (
        <button type="button" aria-label={t("뒤로 가기")} onClick={onBack ?? (() => router.back())} className="-m-1 p-1 text-fg">
          <BackIcon />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate text-headline font-bold leading-[1.4] text-fg">{title}</h1>
      {right}
    </header>
  );
}
