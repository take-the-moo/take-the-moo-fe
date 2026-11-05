import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// /api/* 요청을 Spring으로 프록시한다 (CORS 불필요).
// BE가 다른 기기에서 돌면 .env.local에 API_PROXY_TARGET=http://<IP>:8080
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

// localhost 외 주소(127.0.0.1·같은 와이파이의 폰)로 접속하면 dev 리소스가 차단돼 화면이 비어 보인다. IP는 네트워크마다 달라 기기에서 읽는다.
const LOCAL_IPS = Object.values(networkInterfaces()).flatMap((list) => list ?? []).filter((i) => i.family === "IPv4").map((i) => i.address);

const nextConfig: NextConfig = {
  devIndicators: false, // 시연 화면에 Next 개발 표시가 뜨지 않게
  allowedDevOrigins: LOCAL_IPS,
  // Tailwind v4를 Turbopack 로더로 처리한다 (@tailwindcss/turbopack). 이 규칙이 없으면 유틸리티 클래스가 생성되지 않는다.
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_PROXY_TARGET}/api/:path*` }];
  },
};

export default nextConfig;
