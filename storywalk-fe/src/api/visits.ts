import { api } from "./client";
import type { Visit, VisitHistory, VisitRequest } from "./types";

export const visitsApi = {
  stamp: (body: VisitRequest, signal?: AbortSignal) =>
    api<Visit>("/visits", { method: "POST", body: JSON.stringify(body), signal }),
  getHistory: (userId: string, signal?: AbortSignal) =>
    api<VisitHistory>(`/users/${encodeURIComponent(userId)}/visits`, { signal }),
};
