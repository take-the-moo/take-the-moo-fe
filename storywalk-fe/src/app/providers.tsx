"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onNotificationTap } from "@/platform/notify";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );
  const router = useRouter();

  // 근처 알림을 누르면 해당 장소의 장면으로 이동
  useEffect(() => onNotificationTap((placeId) => router.push(`/scene/${placeId}`)), [router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
