#!/usr/bin/env bash
# Seoul Storywalk FE 초기 세팅: Next.js(App Router) + Capacitor(iOS 시뮬레이터)
# 사용법: bash setup.sh            (현재 폴더 아래에 storywalk-fe 생성)
#        APP_DIR=my-app bash setup.sh
#        SKIP_IOS=1 bash setup.sh  (iOS 플랫폼 추가 생략)
set -euo pipefail

APP_DIR="${APP_DIR:-storywalk-fe}"
APP_NAME="Seoul Storywalk"
APP_ID="com.storywalk.app"
PNPM_VERSION="12.16.1" # storywalk-fe/package.json의 packageManager와 맞춘다

# 패키지 매니저는 pnpm만 사용한다.
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm이 필요합니다: npm i -g pnpm@$PNPM_VERSION (또는 https://pnpm.io/installation)" >&2
  exit 1
fi

echo "==> 1/7 Next.js 프로젝트 생성"
pnpm dlx create-next-app@latest "$APP_DIR" \
  --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes
cd "$APP_DIR"
pnpm pkg set packageManager="pnpm@$PNPM_VERSION"

echo "==> 2/7 패키지 설치"
pnpm add @tanstack/react-query zustand motion \
  @capacitor/core @capacitor/ios \
  @capacitor/geolocation @capacitor/camera @capacitor/local-notifications \
  @capacitor/filesystem @capacitor/share
pnpm add -D @capacitor/cli

echo "==> 3/7 설정 파일 작성"
cat > next.config.ts <<'EOF'
import type { NextConfig } from "next";

// /api/* 요청을 Spring으로 프록시한다 (CORS 불필요).
// BE가 다른 기기에서 돌면 .env.local에 API_PROXY_TARGET=http://<IP>:8080
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  devIndicators: false, // 시연 화면에 Next 개발 표시가 뜨지 않게
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_PROXY_TARGET}/api/:path*` }];
  },
};

export default nextConfig;
EOF

cat > capacitor.config.ts <<'EOF'
import type { CapacitorConfig } from "@capacitor/cli";

// CAP_ENV=dev  → next dev / next start (localhost:3000)를 앱에서 띄움
// CAP_ENV=bundle → 앱 안의 정적 파일(out/) 사용 (출시용, 지금은 사용 안 함)
const env = process.env.CAP_ENV ?? "dev";

const config: CapacitorConfig = {
  appId: "com.storywalk.app",
  appName: "Seoul Storywalk",
  webDir: "out",
  server: env === "dev" ? { url: "http://localhost:3000", cleartext: true } : undefined,
};

export default config;
EOF

cat > .env.local <<'EOF'
# true면 BE 없이 src/mocks 데이터로 화면 개발
NEXT_PUBLIC_USE_MOCK=true
API_PROXY_TARGET=http://localhost:8080
EOF

echo "==> 4/7 기본 소스 구조 작성"
mkdir -p src/api src/mocks src/platform src/store src/components src/i18n

cat > src/api/client.ts <<'EOF'
// 공통 응답 { resultType, httpStatusCode, code, message, data }에서 data만 꺼낸다.
export type ApiResponse<T> = {
  resultType: "SUCCESS" | "FAILURE" | string;
  httpStatusCode: number;
  code: string;
  message: string;
  data: T;
};

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (USE_MOCK) {
    const { mockApi } = await import("@/mocks/handlers");
    return mockApi<T>(path, init);
  }
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: isForm ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !body || body.resultType === "FAILURE") {
    throw new ApiError(res.status, body?.code ?? "UNKNOWN", body?.message ?? res.statusText);
  }
  return body.data;
}
EOF

cat > src/mocks/handlers.ts <<'EOF'
// BE 준비 전 화면 개발용 목. 경로별로 응답 data를 추가해 나간다.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const routes: Record<string, (init?: RequestInit) => unknown> = {
  "GET /health": () => ({ status: "ok", mock: true }),
  "POST /users": () => ({ userId: "mock-user-1", nationality: "VN", language: "vi" }),
};

export async function mockApi<T>(path: string, init?: RequestInit): Promise<T> {
  await delay(300);
  const key = `${(init?.method ?? "GET").toUpperCase()} ${path.split("?")[0]}`;
  const handler = routes[key];
  if (!handler) throw new Error(`[mock] 핸들러 없음: ${key}`);
  return handler(init) as T;
}
EOF

cat > src/platform/location.ts <<'EOF'
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export type LatLng = { lat: number; lng: number };

// 앱: 네이티브 위치 / 웹: 브라우저 geolocation. 1회만 조회한다.
export async function getCurrentPosition(): Promise<LatLng> {
  if (Capacitor.isNativePlatform()) {
    const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    return { lat: p.coords.latitude, lng: p.coords.longitude };
  }
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 },
    ),
  );
}
EOF

cat > src/platform/camera.ts <<'EOF'
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

// 업로드용 Blob을 돌려준다. 시뮬레이터는 카메라가 없으므로 Prompt(카메라/앨범 선택)를 쓴다.
export async function takePhoto(): Promise<Blob> {
  if (Capacitor.isNativePlatform()) {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      quality: 70,
      width: 1600,
    });
    return (await fetch(photo.webPath!)).blob();
  }
  return pickFileFromInput();
}

function pickFileFromInput(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.onchange = () => (input.files?.[0] ? resolve(input.files[0]) : reject(new Error("사진 선택 취소")));
    input.click();
  });
}
EOF

cat > src/platform/share.ts <<'EOF'
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

// 앱: 네이티브 공유 시트(사진 저장·메신저 전송) / 웹: 파일 다운로드
export async function sharePostcard(imageUrl: string) {
  const blob = await (await fetch(imageUrl)).blob();

  if (!Capacitor.isNativePlatform()) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "postcard.png" });
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { uri } = await Filesystem.writeFile({
    path: `postcard-${Date.now()}.png`,
    data: await blobToBase64(blob),
    directory: Directory.Cache,
  });
  await Share.share({ title: "오늘의 서대문 엽서", files: [uri] });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
EOF

cat > src/platform/notify.ts <<'EOF'
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// 장소 근처 알림 시연용. 웹에서는 아무 것도 하지 않는다.
export async function notifyNearby(placeId: string, title: string, body: string, delayMs = 3000) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.requestPermissions();
  await LocalNotifications.schedule({
    notifications: [{ id: Date.now() % 100000, title, body, schedule: { at: new Date(Date.now() + delayMs) }, extra: { placeId } }],
  });
}

// 알림 탭 → 화면 이동. 앱 최상단에서 1회 등록한다.
export function onNotificationTap(handler: (placeId: string) => void) {
  if (!Capacitor.isNativePlatform()) return () => {};
  const sub = LocalNotifications.addListener("localNotificationActionPerformed", (e) =>
    handler(e.notification.extra?.placeId),
  );
  return () => void sub.then((s) => s.remove());
}
EOF

cat > src/store/user.ts <<'EOF'
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  userId: string | null;
  nationality: string | null; // 예: "VN"
  language: string | null; // 예: "vi"
  setUser: (u: { userId: string; nationality: string; language: string }) => void;
  reset: () => void;
};

// 로그인 없는 익명 사용자. 기기(localStorage)에 유지한다.
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      nationality: null,
      language: null,
      setUser: (u) => set(u),
      reset: () => set({ userId: null, nationality: null, language: null }),
    }),
    { name: "storywalk-user" },
  ),
);
EOF

cat > src/i18n/index.ts <<'EOF'
// UI 문구만 관리한다. 장소 이야기·해설은 API가 번역해서 준다.
const dict = {
  ko: { now: "지금", map: "흔적 지도", myLog: "나의 기록", visited: "방문 완료" },
  vi: { now: "Bây giờ", map: "Bản đồ dấu chân", myLog: "Nhật ký của tôi", visited: "Đã ghé thăm" },
} as const;

export type Lang = keyof typeof dict;
export type MsgKey = keyof (typeof dict)["ko"];

export const t = (lang: string | null, key: MsgKey) => (dict[(lang as Lang) ?? "ko"] ?? dict.ko)[key];
EOF

cat > src/app/providers.tsx <<'EOF'
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
EOF

cat > src/app/globals.css <<'EOF'
@import "tailwindcss";

/* iOS 시스템 폰트는 한국어·베트남어 성조 부호를 모두 지원한다 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans", sans-serif;
  -webkit-tap-highlight-color: transparent;
}
EOF

cat > src/app/layout.tsx <<'EOF'
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Seoul Storywalk",
  description: "서대문 유학생을 위한 발자취 서비스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // 노치·홈 인디케이터 영역 대응
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <Providers>
          <main className="mx-auto min-h-dvh max-w-md pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
EOF

cat > src/app/page.tsx <<'EOF'
"use client";

import { useState } from "react";
import { api } from "@/api/client";
import { getCurrentPosition } from "@/platform/location";
import { notifyNearby } from "@/platform/notify";

// 세팅 확인용 화면. 동작 확인 후 '지금' 화면으로 교체한다.
export default function Home() {
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog((l) => [s, ...l]);

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">세팅 확인</h1>
      <button className="rounded-lg bg-black p-3 text-white" onClick={async () => {
        try { push(JSON.stringify(await api("/health"))); } catch (e) { push(`API 실패: ${e}`); }
      }}>API 호출</button>
      <button className="rounded-lg bg-black p-3 text-white" onClick={async () => {
        try { const p = await getCurrentPosition(); push(`위치: ${p.lat}, ${p.lng}`); } catch (e) { push(`위치 실패: ${e}`); }
      }}>현재 위치</button>
      <button className="rounded-lg bg-black p-3 text-white" onClick={async () => {
        await notifyNearby("dongnimmun", "독립문 근처에 있어요", "100년 전 이곳 이야기를 들어볼래요?");
        push("3초 뒤 알림 (앱을 홈으로 내려서 확인)");
      }}>근처 알림 테스트</button>
      <pre className="whitespace-pre-wrap rounded-lg bg-neutral-100 p-3 text-xs">{log.join("\n")}</pre>
    </div>
  );
}
EOF

echo "==> 5/7 Capacitor 초기화"
# server.url 모드라도 webDir이 있어야 sync가 된다 (out/은 .gitignore에 포함됨)
mkdir -p out && echo '<!doctype html><title>Seoul Storywalk</title>' > out/index.html
pnpm pkg set scripts.ios="CAP_ENV=dev cap sync ios && cap open ios"
pnpm pkg set 'scripts["cap:sync"]=CAP_ENV=dev cap sync ios' # pnpm은 키의 ":"를 괄호 표기로 받는다

if [[ "${SKIP_IOS:-0}" == "1" ]]; then
  echo "==> 6/7 iOS 생략 (SKIP_IOS=1)"
else
  echo "==> 6/7 iOS 플랫폼 추가"
  pnpm exec cap add ios

  PLIST="ios/App/App/Info.plist"
  PB=/usr/libexec/PlistBuddy
  set_str() { $PB -c "Add :$1 string $2" "$PLIST" 2>/dev/null || $PB -c "Set :$1 $2" "$PLIST"; }
  set_str NSLocationWhenInUseUsageDescription "지금 있는 곳 근처의 서대문 장소를 추천하기 위해 사용합니다."
  set_str NSCameraUsageDescription "현장 사진으로 장소 해설과 엽서를 만들기 위해 사용합니다."
  set_str NSPhotoLibraryUsageDescription "엽서에 넣을 사진을 고르기 위해 사용합니다."
  set_str NSPhotoLibraryAddUsageDescription "만든 엽서를 사진첩에 저장하기 위해 사용합니다."
  # 개발용: http://localhost 로딩 허용
  $PB -c "Add :NSAppTransportSecurity dict" "$PLIST" 2>/dev/null || true
  $PB -c "Add :NSAppTransportSecurity:NSAllowsLocalNetworking bool true" "$PLIST" 2>/dev/null \
    || $PB -c "Set :NSAppTransportSecurity:NSAllowsLocalNetworking true" "$PLIST"

  CAP_ENV=dev pnpm exec cap sync ios
fi

echo "==> 7/7 타입 검사"
pnpm exec tsc --noEmit

cat <<EOF

완료. 실행 순서:
  cd $APP_DIR
  pnpm dev           # 터미널 1: localhost:3000
  pnpm ios           # 터미널 2: Xcode 열림 → 시뮬레이터 선택 → ▶ Run

BE 연결 시 .env.local의 NEXT_PUBLIC_USE_MOCK=false 로 변경 후 dev 서버 재시작.
시연 리허설부터는 'pnpm build && pnpm start' 로 실행.
EOF
