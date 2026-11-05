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
