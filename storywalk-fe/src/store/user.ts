import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken } from "@/api/client";
import { fromApiLanguage, fromApiNationality } from "@/api/codes";
import type { AuthResponse, User } from "@/api/types";

// N2에서 고른 취향. 서버 계약이 없어 기기에만 둔다.
export type Preferences = { places: string[]; stories: string[]; styles: string[] };
// 11 나의 발자취용. 서버가 한걸음 작성자를 내보내지 않고 저장 API도 없어 이 기기에서 남긴 것만 안다.
export type Footstep = { name: string; date: string };
export type JourneyNote = { text: string; date: string };

type UserState = {
  accessToken: string | null;
  expiresAt: string | null; // UTC ISO. 지나면 다시 로그인한다
  userId: string | null; // = 로그인 아이디
  name: string | null;
  nationality: string | null; // 화면 국적 칩 코드. 예: "VN", "ETC"
  language: string | null; // UI 언어. 예: "vi"
  preferences: Preferences | null;
  footsteps: Footstep[];
  journeyNote: JourneyNote | null;
  /** 가입·로그인 응답을 저장하고 이후 요청에 토큰을 붙인다 */
  setSession: (auth: AuthResponse) => void;
  /** GET·PATCH /users/me 결과로 사용자 정보만 갱신한다 */
  setProfile: (user: User) => void;
  setPreferences: (p: Preferences | null) => void;
  addFootstep: (footstep: Footstep) => void;
  setJourneyNote: (note: JourneyNote) => void;
  /** 로그아웃 — 기기의 토큰·사용자 정보를 지운다 (서버 호출 없음) */
  reset: () => void;
};

const profile = (user: User) => ({
  userId: user.userId,
  name: user.name,
  nationality: fromApiNationality(user.nationality),
  language: fromApiLanguage(user.language),
});

const syncToken = (token: string | null) => {
  if (typeof window !== "undefined") setAccessToken(token);
};

// 로그인 세션. 기기(localStorage)에 유지하고 30일 뒤 만료되면 다시 로그인한다.
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAt: null,
      userId: null,
      name: null,
      nationality: null,
      language: null,
      preferences: null,
      footsteps: [],
      journeyNote: null,
      setSession: (auth) => {
        syncToken(auth.accessToken);
        set({ accessToken: auth.accessToken, expiresAt: auth.expiresAt, ...profile(auth.user) });
      },
      setProfile: (user) => set(profile(user)),
      setPreferences: (preferences) => set({ preferences }),
      addFootstep: (footstep) => set((s) => ({ footsteps: [...s.footsteps, footstep] })),
      setJourneyNote: (journeyNote) => set({ journeyNote }),
      reset: () => {
        syncToken(null);
        set({ accessToken: null, expiresAt: null, userId: null, name: null, nationality: null, language: null, footsteps: [], journeyNote: null });
      },
    }),
    {
      name: "storywalk-user",
      // 복원한 토큰을 공통 API 클라이언트에 넘긴다. 만료된 토큰은 버린다.
      onRehydrateStorage: () => (state) => {
        if (!state?.accessToken) return;
        if (state.expiresAt && Date.parse(state.expiresAt) <= Date.now()) state.reset();
        else syncToken(state.accessToken);
      },
    },
  ),
);

/** 로그인 상태 (토큰 있음) */
export const useLoggedIn = () => useUserStore((s) => Boolean(s.accessToken && s.userId));

// localStorage 복원 전에는 토큰이 항상 null이라, 로그인 판단은 복원이 끝난 뒤에 한다.
export function useUserHydrated() {
  return useSyncExternalStore(
    (onChange) => useUserStore.persist.onFinishHydration(onChange),
    () => useUserStore.persist.hasHydrated(),
    () => false, // 서버 렌더링 시에는 아직 복원 전
  );
}
