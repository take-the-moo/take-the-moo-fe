// /api를 제외한 서버 주소. 미지정 시 기존 Next.js /api 프록시를 사용한다.
// NEXT_PUBLIC_* 변경 후에는 개발 서버 재시작/재빌드가 필요하다.
const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export type ApiResponse<T> =
  | { resultType: "SUCCESS"; httpStatusCode: number; message: string; data: T }
  | { resultType: "FAIL"; httpStatusCode: number; code: string; message: string };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiRequestInit = RequestInit & { auth?: boolean };

// 영속 저장·복원과 로그인 화면 이동은 호출하는 화면/스토어의 책임이다.
// 서버 렌더링에서 사용자 간 토큰이 공유되지 않도록 브라우저에서만 설정한다.
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") throw new Error("setAccessToken은 브라우저에서 호출해야 합니다.");
  accessToken = token;
}

// 토큰을 붙인 요청이 401이면 부른다 (토큰 만료·잘못됨 → 로그인 화면으로). 로그인 요청(auth: false)은 제외.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function getApiUrl(path: string): string {
  return `${BASE_URL}/api${path}`;
}

// 사진·엽서 응답의 /api/... 경로를 img src 등에 쓸 때 사용한다.
export function getAssetUrl(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? `${BASE_URL}${path}` : path;
}

export function withQuery(path: string, params: Record<string, string | number | boolean | null | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null) query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

async function responseError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  return new ApiError(res.status, body?.code ?? "UNKNOWN", body?.message ?? (res.statusText || "요청에 실패했습니다."));
}

async function request(path: string, { auth = true, ...init }: ApiRequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body instanceof FormData) {
    headers.delete("Content-Type"); // multipart boundary는 브라우저가 설정한다.
  } else if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!auth) headers.delete("Authorization");
  else if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(getApiUrl(path), { ...init, headers });
  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized?.();
    throw await responseError(res);
  }
  return res;
}

export async function api<T>(path: string, init?: ApiRequestInit): Promise<T> {
  if (USE_MOCK) {
    const { mockApi } = await import("@/mocks/handlers");
    return mockApi<T>(path, init);
  }
  const res = await request(path, init);
  const body = await res.json().catch(() => null);
  if (body?.resultType !== "SUCCESS" || !("data" in body)) {
    throw new ApiError(res.status, body?.code ?? "INVALID_RESPONSE", body?.message ?? "서버 응답 형식이 올바르지 않습니다.");
  }
  return body.data as T;
}

export async function apiBlob(path: string, init?: ApiRequestInit): Promise<Blob> {
  if (USE_MOCK) throw new ApiError(501, "MOCK_NOT_SUPPORTED", "파일 조회는 실서버 모드에서 지원합니다.");
  const res = await request(path, init);
  if (res.headers.get("Content-Type")?.includes("application/json")) throw await responseError(res);
  return res.blob();
}

// SSE 파싱·token/done/error 이벤트 처리는 호출자가 맡는다. AbortSignal로 중단할 수 있다.
export async function apiStream(path: string, init?: ApiRequestInit): Promise<ReadableStream<Uint8Array>> {
  if (USE_MOCK) throw new ApiError(501, "MOCK_NOT_SUPPORTED", "스트리밍은 실서버 모드에서 지원합니다.");
  const res = await request(path, init);
  if (!res.headers.get("Content-Type")?.includes("text/event-stream")) throw await responseError(res);
  if (!res.body) throw new ApiError(res.status, "INVALID_RESPONSE", "스트림 응답이 비어 있습니다.");
  return res.body;
}
