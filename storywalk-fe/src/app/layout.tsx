import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

// 시연 환경의 네트워크와 무관하게 같은 글꼴이 나오도록 로컬 파일을 쓴다.
// 가변 폰트(wght 100–900) 한 파일로 모든 굵기를 처리한다. 한글·베트남어 글리프 포함.
const notoSansKR = localFont({
  src: "./fonts/NotoSansKR-VariableFont_wght.ttf",
  weight: "100 900",
  display: "swap",
});

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
      <body className={`${notoSansKR.className} min-h-dvh bg-white text-neutral-900 antialiased`}>
        <Providers>
          <main className="mx-auto min-h-dvh max-w-md pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
