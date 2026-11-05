import { create } from "zustand";

// 회고 엽서 생성 작업(F7)의 화면 상태. 09에서 POST /postcards로 시작하고 10이 GET /postcards/{id}로 상태를 확인한다.
// 생성 중에도 다른 탭으로 갈 수 있어야 해서(10 노트) 페이지가 아니라 스토어에 둔다. 새로고침하면 사라진다.
export type PostcardJob = { postcardId: string; startedAt: number };

type PostcardState = {
  job: PostcardJob | null;
  start: (postcardId: string) => void;
};

export const usePostcardStore = create<PostcardState>()((set) => ({
  job: null,
  start: (postcardId) => set({ job: { postcardId, startedAt: Date.now() } }),
}));
