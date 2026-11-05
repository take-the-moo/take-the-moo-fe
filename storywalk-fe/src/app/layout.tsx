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
