"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIcon, MapIcon, NowIcon } from "@/components/icons";
import { t, type MsgKey } from "@/i18n";
import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/user";

// Figma: WF/TabBar (탭=지금 | 흔적 지도 | 나의 기록), 높이 72, 상단 10 · 좌우 40
// 경로는 아직 화면이 없어 가정한 값이다. 라우트가 정해지면 여기만 바꾼다.
const TABS: { href: string; label: MsgKey; Icon: typeof NowIcon }[] = [
  { href: "/", label: "now", Icon: NowIcon },
  { href: "/map", label: "map", Icon: MapIcon },
  { href: "/log", label: "myLog", Icon: LogIcon },
];

export function TabBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const language = useUserStore((s) => s.language);

  return (
    <nav
      className={cn(
        "sticky bottom-0 flex h-[72px] shrink-0 items-start justify-between border-t border-line-subtle bg-surface px-10 pt-2.5",
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
            className={cn(
              "flex flex-col items-center gap-1 text-micro leading-[1.4]",
              active ? "font-bold text-fg" : "font-medium text-fg-disabled",
            )}
          >
            <Icon />
            {t(language, label)}
          </Link>
        );
      })}
    </nav>
  );
}
