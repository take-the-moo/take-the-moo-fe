import { api } from "./client";
import type { Scene, SceneRequest } from "./types";

export const scenesApi = {
  create: (body: SceneRequest, signal?: AbortSignal) =>
    api<Scene>("/scenes", { method: "POST", body: JSON.stringify(body), signal }),
};
