import { create } from "zustand";

// 회고 엽서 생성 작업(F7)의 화면 상태. 09에서 POST /postcards로 시작하고 10이 GET /postcards/{id}로 상태를 확인한다.
// 생성 중에도 다른 탭으로 갈 수 있어야 해서(10 노트) 페이지가 아니라 스토어에 둔다. 새로고침하면 사라진다.
export type PostcardJob = { postcardId: string; startedAt: number; placeId?: number };

type PostcardState = {
  job: PostcardJob | null;
  start: (postcardId: string, placeId?: number) => void;
  /** 지도로 공유하며 날려 보내는 엽서 이미지. 핀에 닿으면 land로 비운다 */
  flying: string | null;
  fly: (imageUrl: string) => void;
  land: () => void;
};

export const usePostcardStore = create<PostcardState>()((set) => ({
  job: null,
  start: (postcardId, placeId) => set({ job: { postcardId, placeId, startedAt: Date.now() } }),
  flying: null,
  fly: (imageUrl) => set({ flying: imageUrl }),
  land: () => set({ flying: null }),
}));
