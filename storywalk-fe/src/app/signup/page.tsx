"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import { Button, FieldLabel, Screen, ScreenBody, ScreenFooter, TextField, TopBar } from "@/components/ui";
import { useT, type MsgKey } from "@/i18n";
import { useSignupStore } from "@/store/signup";

// N1 가입 · F1 — Figma 9:1504
// 아이디·비밀번호를 받고 아이디 중복을 확인한 뒤 N2 취향 → 01 처음 설정(국적·언어)으로 간다.
// 가입 요청(POST /auth/signup)은 국적·언어까지 고른 01 "완료"에서 한 번에 보낸다.
// Figma에 이름 입력이 없어 서버 필수값 name에는 아이디를 넣는다 (둘 다 20자 이내).
const LOGIN_ID = /^[a-z0-9_]{4,20}$/;

export default function SignupPage() {
  const router = useRouter();
  const t = useT();
  const saved = useSignupStore((s) => s.draft);
  const setDraft = useSignupStore((s) => s.setDraft);
  const [loginId, setLoginId] = useState(saved?.loginId ?? "");
  const [password, setPassword] = useState(saved?.password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const [availableId, setAvailableId] = useState<string | null>(null); // 중복확인을 통과한 아이디
  const [error, setError] = useState<MsgKey | null>(null);

  // 통과하면 true. 실패 사유는 error에 둔다
  const checkId = async () => {
    if (!LOGIN_ID.test(loginId)) {
      setError("아이디는 영문 소문자·숫자·_ 4~20자로 써 주세요");
      return false;
    }
    if (availableId === loginId) return true;
    setChecking(true);
    try {
      const { available } = await authApi.checkId(loginId);
      if (!available) setError("이미 쓰는 아이디예요");
      else setAvailableId(loginId);
      return available;
    } catch (e) {
      setError(e instanceof ApiError && e.status === 422 ? "아이디는 영문 소문자·숫자·_ 4~20자로 써 주세요" : "불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      return false;
    } finally {
      setChecking(false);
    }
  };

  const next = async () => {
    if (password.length < 8 || password.length > 64) return setError("비밀번호는 8자 이상으로 써 주세요");
    if (!(await checkId())) return;
    setDraft({ loginId, password, name: loginId });
    router.push("/preferences");
  };

  const edit = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError(null);
  };

  return (
    <Screen>
      <TopBar title={t("가입하기")} />
      <ScreenBody className="gap-12! pt-12!">
        <h2 className="text-page leading-[1.5] font-medium whitespace-pre-line text-fg">
          {t("가입하면\n취향에 맞는 장소를\n먼저 보여줘요")}
        </h2>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <FieldLabel htmlFor="loginId">{t("아이디")}</FieldLabel>
            <TextField
              id="loginId"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={20}
              placeholder={t("영문 소문자·숫자·_ 4~20자")}
              value={loginId}
              onChange={edit((v) => setLoginId(v.toLowerCase()))}
              right={
                <button
                  type="button"
                  onClick={checkId}
                  disabled={checking || !loginId}
                  className="h-[29px] shrink-0 rounded-[5px] bg-line px-2 text-body text-fg-sub"
                >
                  {t("중복확인")}
                </button>
              }
            />
          </div>
          <div className="flex flex-col gap-3">
            <FieldLabel htmlFor="password">{t("비밀번호")}</FieldLabel>
            <TextField
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={64}
              placeholder={t("8자 이상")}
              value={password}
              onChange={edit(setPassword)}
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  className="shrink-0 text-body text-fg-sub"
                >
                  {showPassword ? t("숨기기") : t("보기")}
                </button>
              }
            />
          </div>
          {error ? (
            <p role="alert" className="text-caption text-fg">
              {t(error)}
            </p>
          ) : (
            availableId === loginId && (
              <p role="status" className="text-caption text-fg-muted">
                {t("쓸 수 있는 아이디예요")}
              </p>
            )
          )}
        </div>
      </ScreenBody>
      <ScreenFooter>
        {/* 트리거 3 */}
        <Button onClick={next} disabled={checking || !loginId || !password}>
          {checking ? t("확인하는 중…") : t("가입하고 취향 고르기")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
