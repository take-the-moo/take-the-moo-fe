"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIcon, MapIcon, NowIcon } from "@/components/icons";
import { useT, type MsgKey } from "@/i18n";
import { cn } from "@/lib/cn";

// Figma: TabBar (지금 | 흔적 지도 | 나의 기록), 높이 78, 좌우 24. 활성 탭은 노란 알약(56×32)이 아이콘을 감싼다.
const TABS: { href: string; label: MsgKey; Icon: typeof NowIcon }[] = [
  { href: "/", label: "지금", Icon: NowIcon },
  { href: "/map", label: "흔적 지도", Icon: MapIcon },
  { href: "/log", label: "나의 기록", Icon: LogIcon },
];

export function TabBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      className={cn(
        "sticky bottom-0 z-20 flex h-[78px] shrink-0 items-start justify-between border-t border-line-subtle bg-surface px-6 pt-2.5",
        className,
      )}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex min-w-[84px] flex-col items-center gap-1 text-caption font-medium", active ? "text-fg" : "text-fg-muted")}
          >
            <span className={cn("flex h-8 w-14 items-center justify-center rounded-2xl", active && "bg-point")}>
              <Icon />
            </span>
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}
