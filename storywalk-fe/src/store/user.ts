import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  userId: string | null;
  nationality: string | null; // 예: "VN"
  language: string | null; // 예: "vi"
  setUser: (u: { userId: string; nationality: string; language: string }) => void;
  reset: () => void;
};

// 로그인 없는 익명 사용자. 기기(localStorage)에 유지한다.
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      nationality: null,
      language: null,
      setUser: (u) => set(u),
      reset: () => set({ userId: null, nationality: null, language: null }),
    }),
    { name: "storywalk-user" },
  ),
);
