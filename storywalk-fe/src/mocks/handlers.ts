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
