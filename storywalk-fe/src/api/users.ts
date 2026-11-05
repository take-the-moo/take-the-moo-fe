import { api } from "./client";
import type { ProfileUpdateRequest, User } from "./types";

export const usersApi = {
  getMe: (signal?: AbortSignal) => api<User>("/users/me", { signal }),
  updateMe: (body: ProfileUpdateRequest, signal?: AbortSignal) =>
    api<User>("/users/me", { method: "PATCH", body: JSON.stringify(body), signal }),
  getUser: (userId: string, signal?: AbortSignal) => api<User>(`/users/${encodeURIComponent(userId)}`, { signal }),
};
