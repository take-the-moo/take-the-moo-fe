import { api, apiBlob, getApiUrl, withQuery } from "./client";
import type { Postcard, PostcardCreateRequest } from "./types";

const imagePath = (postcardId: string, download: boolean) =>
  withQuery(`/postcards/${encodeURIComponent(postcardId)}/image`, { download: download || undefined });

export const postcardsApi = {
  create: (body: PostcardCreateRequest, signal?: AbortSignal) =>
    api<Postcard>("/postcards", { method: "POST", body: JSON.stringify(body), signal }),
  get: (postcardId: string, signal?: AbortSignal) => api<Postcard>(`/postcards/${encodeURIComponent(postcardId)}`, { signal }),
  getImage: (postcardId: string, download = false, signal?: AbortSignal) => apiBlob(imagePath(postcardId, download), { signal }),
  getImageUrl: (postcardId: string, download = false) => getApiUrl(imagePath(postcardId, download)),
};
