"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import { Button, FieldLabel, InfoBox, Screen, ScreenBody, ScreenFooter, TextField, TopBar } from "@/components/ui";
import { useT, type MsgKey } from "@/i18n";
import { useSignupStore } from "@/store/signup";

// N1 가입 · F1 — Figma 1:80
// 아이디·비밀번호·이름을 받고 아이디 중복을 확인한 뒤 N2 취향 → 01 처음 설정(국적·언어)으로 간다.
// 가입 요청(POST /auth/signup)은 국적·언어까지 고른 01 "시작하기"에서 한 번에 보낸다.
// Google 로그인은 서버 인증 방식(아이디·비밀번호)에 없어 뺐다.
const LOGIN_ID = /^[a-z0-9_]{4,20}$/;

export default function SignupPage() {
  const router = useRouter();
  const t = useT();
  const saved = useSignupStore((s) => s.draft);
  const setDraft = useSignupStore((s) => s.setDraft);
  const [loginId, setLoginId] = useState(saved?.loginId ?? "");
  const [password, setPassword] = useState(saved?.password ?? "");
  const [name, setName] = useState(saved?.name ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<MsgKey | null>(null);

  const invalid = (): MsgKey | null => {
    if (!LOGIN_ID.test(loginId)) return "아이디는 영문 소문자·숫자·_ 4~20자로 써 주세요";
    if (password.length < 8 || password.length > 64) return "비밀번호는 8자 이상으로 써 주세요";
    if (!name.trim() || name.trim().length > 20) return "이름을 써 주세요";
    return null;
  };

  const next = async () => {
    const problem = invalid();
    if (problem) return setError(problem);
    setChecking(true);
    try {
      const { available } = await authApi.checkId(loginId);
      if (!available) return setError("이미 쓰는 아이디예요");
      setDraft({ loginId, password, name: name.trim() });
      router.push("/preferences");
    } catch (e) {
      setError(e instanceof ApiError && e.status === 422 ? "아이디는 영문 소문자·숫자·_ 4~20자로 써 주세요" : "불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setChecking(false);
    }
  };

  const edit = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError(null);
  };

  return (
    <Screen>
      <TopBar title={t("가입하기")} />
      <ScreenBody>
        <h2 className="text-heading leading-[30px] font-bold whitespace-pre-line text-ink">
          {t("가입하면 취향에 맞는 장소를\n먼저 보여줘요")}
        </h2>
        <InfoBox className="whitespace-pre-line">
          {t("가입하면 선호하는 관광지 · 관심사 · 성향을 골라 추천에 바로 반영할 수 있어요.")}
        </InfoBox>

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
        />
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
              className="shrink-0 text-label text-fg-sub"
            >
              {showPassword ? t("숨기기") : t("보기")}
            </button>
          }
        />
        <FieldLabel htmlFor="name">{t("이름")}</FieldLabel>
        <TextField
          id="name"
          autoComplete="nickname"
          maxLength={20}
          placeholder={t("화면에 보일 이름 (20자 이내)")}
          value={name}
          onChange={edit(setName)}
        />
        {error ? (
          <p role="alert" className="text-caption text-fg">
            {t(error)}
          </p>
        ) : (
          <p className="text-caption text-fg-muted">{t("* 아이디는 가입 뒤 바꿀 수 없어요. 연락처는 받지 않아요.")}</p>
        )}
      </ScreenBody>
      <ScreenFooter>
        {/* 트리거 3 */}
        <Button onClick={next} disabled={checking}>
          {checking ? t("확인하는 중…") : t("가입하고 취향 고르기")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
