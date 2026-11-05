import { api, withQuery } from "./client";
import type { CreatedReview, ReviewCreateRequest, ReviewList, ReviewQuery } from "./types";

export const reviewsApi = {
  getList: (placeId: number, query: ReviewQuery = {}, signal?: AbortSignal) =>
    api<ReviewList>(withQuery(`/places/${placeId}/reviews`, query), { signal }),
  create: (placeId: number, body: ReviewCreateRequest, signal?: AbortSignal) =>
    api<CreatedReview>(`/places/${placeId}/reviews`, { method: "POST", body: JSON.stringify(body), signal }),
};
