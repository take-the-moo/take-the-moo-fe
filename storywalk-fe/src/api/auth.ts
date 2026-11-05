import { api, withQuery } from "./client";
import type { AuthResponse, LoginIdCheckResponse, LoginRequest, SignupRequest } from "./types";

// 응답 토큰은 호출자가 저장하고 setAccessToken으로 공통 클라이언트에 전달한다.
export const authApi = {
  checkId: (loginId: string, signal?: AbortSignal) =>
    api<LoginIdCheckResponse>(withQuery("/auth/check-id", { loginId }), { auth: false, signal }),
  signup: (body: SignupRequest, signal?: AbortSignal) =>
    api<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(body), auth: false, signal }),
  login: (body: LoginRequest, signal?: AbortSignal) =>
    api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body), auth: false, signal }),
};
