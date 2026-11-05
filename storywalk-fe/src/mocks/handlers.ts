// BE 준비 전 화면 개발용 목. 경로별로 응답 data를 추가해 나간다.
// 경로의 `:name` 자리는 아무 세그먼트와 맞는다 (예: /places/:placeId/reviews).
import { ApiError } from "@/api/client";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Handler = (init?: RequestInit) => unknown;

// 목에서 422를 재현하기 위한 금지어. 실제 필터는 서버(AI) 책임이다.
const MOCK_BLOCKED_WORDS = ["광고", "바보"];

const routes: Record<string, Handler> = {
  "GET /health": () => ({ status: "ok", mock: true }),
  "POST /users": () => ({ userId: "mock-user-1", nationality: "VN", language: "vi" }),
  // F6 한걸음 저장. 요청 필드는 백엔드와 미확정 — 화면은 FormData(text, photo?)로 보낸다.
  "POST /places/:placeId/reviews": (init) => {
    const text = init?.body instanceof FormData ? String(init.body.get("text") ?? "") : "";
    if (MOCK_BLOCKED_WORDS.some((w) => text.includes(w))) {
      throw new ApiError(422, "INAPPROPRIATE_CONTENT", "부적절한 표현이 있어 저장되지 않았어요");
    }
    return { reviewId: `mock-review-${Date.now()}` };
  },
};

const compiled = Object.entries(routes).map(([key, handler]) => {
  const [method, pattern] = key.split(" ");
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, "[^/]+")}$`);
  return { method, regex, handler };
});

export async function mockApi<T>(path: string, init?: RequestInit): Promise<T> {
  await delay(300);
  const method = (init?.method ?? "GET").toUpperCase();
  const pathname = path.split("?")[0];
  const route = compiled.find((r) => r.method === method && r.regex.test(pathname));
  if (!route) throw new Error(`[mock] 핸들러 없음: ${method} ${pathname}`);
  return route.handler(init) as T;
}
