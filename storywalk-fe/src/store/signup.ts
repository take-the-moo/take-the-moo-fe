import { create } from "zustand";

// N1 가입 → N2 취향 → 01 처음 설정으로 이어지는 가입 입력. 01 "시작하기"에서 POST /auth/signup으로 보낸다.
// 비밀번호가 들어 있어 기기에 저장하지 않는다 (새로고침하면 가입 화면부터 다시).
export type SignupDraft = { loginId: string; password: string; name: string };

type SignupState = {
  draft: SignupDraft | null;
  setDraft: (draft: SignupDraft) => void;
  clear: () => void;
};

export const useSignupStore = create<SignupState>()((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clear: () => set({ draft: null }),
}));
