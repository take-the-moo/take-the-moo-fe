"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import {
  Button,
  FieldLabel,
  Screen,
  ScreenBody,
  ScreenFooter,
  TextField,
  TopBar,
} from "@/components/ui";
import { useT, type MsgKey } from "@/i18n";
import { useUserStore } from "@/store/user";

// 로그인 · F1 — 00 시작의 "로그인"에서 온다. N1 가입 화면과 같은 구성요소로 만들었다.
// POST /auth/login → 토큰·사용자 저장 → 03 홈. 401은 아이디·비밀번호 오류로 안내한다.
export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const setSession = useUserStore((s) => s.setSession);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<MsgKey | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      setSession(await authApi.login({ loginId: loginId.trim(), password }));
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "아이디 또는 비밀번호가 맞지 않습니다."
          : "시작하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title={t("로그인")} />
      <form onSubmit={submit} className="flex flex-1 flex-col">
        <ScreenBody>
          <h2 className="text-heading leading-[30px] font-bold text-fg">
            {t("footnote")}
          </h2>
          <FieldLabel htmlFor="loginId">{t("아이디")}</FieldLabel>
          <TextField
            id="loginId"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value.toLowerCase());
              setError(null);
            }}
          />
          <FieldLabel htmlFor="password">{t("비밀번호")}</FieldLabel>
          <TextField
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
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
          {error && (
            <p role="alert" className="text-caption text-fg">
              {t(error)}
            </p>
          )}
        </ScreenBody>
        <ScreenFooter>
          <Button
            type="submit"
            disabled={saving || !loginId.trim() || !password}
          >
            {saving ? t("로그인하는 중…") : t("로그인")}
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={() => router.push("/signup")}
          >
            {t("계정이 없나요? 가입하기")}
          </Button>
        </ScreenFooter>
      </form>
    </Screen>
  );
}
