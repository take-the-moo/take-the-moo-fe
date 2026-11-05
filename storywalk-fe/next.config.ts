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
