import { api, withQuery } from "./client";
import type { NowQuery, NowResponse } from "./types";

export const nowApi = {
  get: (query: NowQuery = {}, signal?: AbortSignal) => api<NowResponse>(withQuery("/now", query), { signal }),
};
