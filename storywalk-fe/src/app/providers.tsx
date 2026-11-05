"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, setUnauthorizedHandler } from "@/api/client";
import { usersApi } from "@/api/users";
import { useLang } from "@/i18n";
import { onNotificationTap } from "@/platform/notify";
import { useLoggedIn, useUserHydrated, useUserStore } from "@/store/user";

// 로그인 전에 볼 수 있는 화면 (00 시작 · 로그인 · N1 가입 · N2 취향 · 01 처음 설정)
const PUBLIC_PATHS = ["/start", "/login", "/signup", "/preferences", "/setup"];
const isPublic = (path: string) => PUBLIC_PATHS.includes(path) || path.startsWith("/dev");

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            // 4xx는 다시 불러도 같은 결과라 재시도하지 않는다
            retry: (count, error) => count < 1 && !(error instanceof ApiError && error.status < 500),
          },
        },
      }),
  );
  const router = useRouter();
  const pathname = usePathname();
  const lang = useLang();
  const hydrated = useUserHydrated();
  const loggedIn = useLoggedIn();
  const setProfile = useUserStore((s) => s.setProfile);

  // 근처 알림을 누르면 해당 장소의 장면으로 이동
  useEffect(() => onNotificationTap((placeId) => router.push(`/scene/${placeId}`)), [router]);

  // 스크린리더·번역기가 실제 언어를 알도록 맞춘다
  useEffect(() => {
    if (lang) document.documentElement.lang = lang;
  }, [lang]);

  // 토큰이 만료·무효(401)면 기기의 로그인 정보를 지우고 시작 화면으로
  useEffect(() => {
    setUnauthorizedHandler(() => {
      useUserStore.getState().reset();
      queryClient.clear();
      router.replace("/start");
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, router]);

  // 로그인이 필요한 화면에 토큰 없이 들어오면 시작 화면으로
  useEffect(() => {
    if (hydrated && !loggedIn && !isPublic(pathname)) router.replace("/start");
  }, [hydrated, loggedIn, pathname, router]);

  // 자동 로그인: 앱을 켤 때 저장된 토큰으로 내 정보를 한 번 갱신한다 (401이면 위 핸들러가 처리)
  useEffect(() => {
    if (!hydrated || !loggedIn) return;
    const controller = new AbortController();
    usersApi
      .getMe(controller.signal)
      .then(setProfile)
      .catch(() => undefined);
    return () => controller.abort();
    // 앱 실행(복원) 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
