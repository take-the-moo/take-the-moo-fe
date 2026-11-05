import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// N2에서 고른 취향. 가입 기능의 P0 포함 여부가 미정이라 서버 계약 없이 기기에만 둔다.
export type Preferences = { places: string[]; stories: string[]; styles: string[] };

type UserState = {
  userId: string | null;
  nationality: string | null; // 예: "VN"
  language: string | null; // 예: "vi"
  preferences: Preferences | null;
  setUser: (u: { userId: string; nationality: string; language: string }) => void;
  setPreferences: (p: Preferences | null) => void;
  reset: () => void;
};

// 로그인 없는 익명 사용자. 기기(localStorage)에 유지한다.
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      nationality: null,
      language: null,
      preferences: null,
      setUser: (u) => set(u),
      setPreferences: (preferences) => set({ preferences }),
      reset: () => set({ userId: null, nationality: null, language: null, preferences: null }),
    }),
    { name: "storywalk-user" },
  ),
);

// localStorage 복원 전에는 userId가 항상 null이라, 첫 실행 판단은 복원이 끝난 뒤에 한다.
export function useUserHydrated() {
  return useSyncExternalStore(
    (onChange) => useUserStore.persist.onFinishHydration(onChange),
    () => useUserStore.persist.hasHydrated(),
    () => false, // 서버 렌더링 시에는 아직 복원 전
  );
}
