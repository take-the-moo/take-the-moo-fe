import { api, apiBlob, getApiUrl, withQuery } from "./client";
import type { Photo, PhotoUploadRequest } from "./types";

export const photosApi = {
  upload: ({ file, userId, placeId }: PhotoUploadRequest, signal?: AbortSignal) => {
    const body = new FormData();
    body.append("file", file);
    return api<Photo>(withQuery("/photos", { userId, placeId }), { method: "POST", body, signal });
  },
  getFile: (photoId: string, signal?: AbortSignal) => apiBlob(`/photos/${encodeURIComponent(photoId)}`, { signal }),
  getFileUrl: (photoId: string) => getApiUrl(`/photos/${encodeURIComponent(photoId)}`),
};
