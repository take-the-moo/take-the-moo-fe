import { api, apiStream, withQuery } from "./client";
import type { Analysis, AnalyzeRequest, ChatRequest, ChatResponse, ChatStreamQuery, Health, ImageQuestionRequest } from "./types";

export const llmApi = {
  chat: (body: ChatRequest, signal?: AbortSignal) =>
    api<ChatResponse>("/chat", { method: "POST", body: JSON.stringify(body), signal }),
  streamChat: (query: ChatStreamQuery, signal?: AbortSignal) => apiStream(withQuery("/chat/stream", query), { signal }),
  analyze: (body: AnalyzeRequest, signal?: AbortSignal) =>
    api<Analysis>("/analyze", { method: "POST", body: JSON.stringify(body), signal }),
  askImage: ({ file, question, promptKey }: ImageQuestionRequest, signal?: AbortSignal) => {
    const body = new FormData();
    body.append("file", file);
    body.append("question", question);
    if (promptKey != null) body.append("promptKey", promptKey);
    return api<ChatResponse>("/image", { method: "POST", body, signal });
  },
  getHealth: (signal?: AbortSignal) => api<Health>("/health", { signal }),
};
