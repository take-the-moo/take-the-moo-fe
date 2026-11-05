"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { onNotificationTap } from "@/platform/notify";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );
  const router = useRouter();
  const lang = useLang();

  // 근처 알림을 누르면 해당 장소의 장면으로 이동
  useEffect(() => onNotificationTap((placeId) => router.push(`/scene/${placeId}`)), [router]);

  // 스크린리더·번역기가 실제 언어를 알도록 맞춘다
  useEffect(() => {
    if (lang) document.documentElement.lang = lang;
  }, [lang]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
