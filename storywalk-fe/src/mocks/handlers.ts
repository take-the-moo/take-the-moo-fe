// BE 준비 전 화면 개발용 목. 경로별로 응답 data를 추가해 나간다.
// 경로의 `:name` 자리는 아무 세그먼트와 맞는다 (예: /places/:placeId/reviews).
import { ApiError } from "@/api/client";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Handler = (init?: RequestInit) => unknown;

// 목에서 422를 재현하기 위한 금지어. 실제 필터는 서버(AI) 책임이다.
const MOCK_BLOCKED_WORDS = ["광고", "바보"];

const MOCK_USER = { userId: "mock_user", name: "린", nationality: "VN", language: "VI" };
const MOCK_AUTH = { accessToken: "mock-token", expiresAt: "2099-01-01T00:00:00Z", user: MOCK_USER };
const jsonBody = (init?: RequestInit) => (typeof init?.body === "string" ? JSON.parse(init.body) : {});

// 화면 전체를 확인하려면 FE 목 대신 BE 목 모드(LLM_MOCK=true ./gradlew bootRun)에 붙인다.
// 여기는 로그인 흐름과 한걸음 422만 BE 없이 확인할 수 있게 둔다.
const routes: Record<string, Handler> = {
  "GET /health": () => ({ status: "ok", mock: true }),
  "GET /auth/check-id": () => ({ loginId: MOCK_USER.userId, available: true }),
  "POST /auth/signup": (init) => ({ ...MOCK_AUTH, user: { ...MOCK_USER, ...jsonBody(init), userId: jsonBody(init).loginId } }),
  "POST /auth/login": () => MOCK_AUTH,
  "GET /users/me": () => MOCK_USER,
  // F6 한걸음 저장 (JSON: userId, content, photoId?)
  "POST /places/:placeId/reviews": (init) => {
    const content = String(jsonBody(init).content ?? "");
    if (MOCK_BLOCKED_WORDS.some((w) => content.includes(w))) {
      throw new ApiError(422, "REVIEW_INAPPROPRIATE", "부적절한 표현이 있어 저장되지 않았어요");
    }
    return { reviewId: Date.now(), content };
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
