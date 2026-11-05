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
