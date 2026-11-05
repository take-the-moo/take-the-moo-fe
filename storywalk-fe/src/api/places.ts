import { api, withQuery } from "./client";
import type { Explanation, ExplanationRequest, MapPin, NearbyPlace, NearbyPlacesQuery, Station } from "./types";

export const placesApi = {
  getStations: (signal?: AbortSignal) => api<Station[]>("/stations", { signal }),
  getNearby: (query: NearbyPlacesQuery = {}, signal?: AbortSignal) =>
    api<NearbyPlace[]>(withQuery("/places/nearby", query), { signal }),
  explain: (body: ExplanationRequest, signal?: AbortSignal) =>
    api<Explanation>("/explanations", { method: "POST", body: JSON.stringify(body), signal }),
  getMapPins: (signal?: AbortSignal) => api<MapPin[]>("/map/pins", { signal }),
};
