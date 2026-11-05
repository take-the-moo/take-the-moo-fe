import { api, apiBlob, getApiUrl } from "./client";
import type { Photo, PhotoUploadRequest } from "./types";

export const photosApi = {
  upload: ({ file, userId, placeId }: PhotoUploadRequest, signal?: AbortSignal) => {
    const body = new FormData();
    body.append("file", file);
    body.append("userId", userId);
    if (placeId != null) body.append("placeId", String(placeId));
    return api<Photo>("/photos", { method: "POST", body, signal });
  },
  getFile: (photoId: string, signal?: AbortSignal) => apiBlob(`/photos/${encodeURIComponent(photoId)}`, { signal }),
  getFileUrl: (photoId: string) => getApiUrl(`/photos/${encodeURIComponent(photoId)}`),
};
