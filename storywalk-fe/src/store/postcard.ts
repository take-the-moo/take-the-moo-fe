import { create } from "zustand";

// 회고 엽서 생성 작업(F7)의 화면 상태. 09에서 시작하고 10이 진행·결과를 보여준다.
// 생성 중에도 다른 탭으로 갈 수 있어야 해서(10 노트) 페이지가 아니라 스토어에 둔다. 새로고침하면 사라진다.
// POST /postcards · GET /postcards/{id} 연동 시 jobId를 담고 상태는 서버 조회 결과로 바꾼다.
export type PostcardJob = {
  status: "generating" | "done";
  startedAt: number;
  style: string;
  note: string;
  photoCount: number;
};

type PostcardState = {
  job: PostcardJob | null;
  start: (input: Omit<PostcardJob, "status" | "startedAt">) => void;
  finish: () => void;
};

export const usePostcardStore = create<PostcardState>()((set) => ({
  job: null,
  start: (input) => set({ job: { ...input, status: "generating", startedAt: Date.now() } }),
  finish: () => set((s) => (s.job ? { job: { ...s.job, status: "done" } } : s)),
}));
