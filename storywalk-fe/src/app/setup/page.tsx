"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import { toApiLanguage, toApiNationality } from "@/api/codes";
import { Button, Chip, ChipGroup, Screen, ScreenBody, ScreenFooter, SectionTitle, StepBar } from "@/components/ui";
import { useT } from "@/i18n";
import { LANGUAGES, NATIONALITIES } from "@/lib/options";
import { getCurrentPosition } from "@/platform/location";
import { useSignupStore } from "@/store/signup";
import { useUserStore } from "@/store/user";

// 01 처음 설정 · F1 — Figma 9:1524
// 완료: N1에서 받은 아이디·비밀번호 + 국적·언어로 POST /auth/signup → 토큰 저장
// → 위치 권한 요청(1회 조회) → 03 홈. 가입 입력이 없으면(새로고침 등) N1부터 다시 한다.
// 위치를 거부·실패해도 홈으로 보내고, 홈은 위치 없이(기본 역 기준) 동작한다.
type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string };

export default function SetupPage() {
  const router = useRouter();
  const setSession = useUserStore((s) => s.setSession);
  const draft = useSignupStore((s) => s.draft);
  const clearDraft = useSignupStore((s) => s.clear);
  const [nationality, setNationality] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const t = useT(); // 고른 언어는 가입 후(완료)부터 적용한다. 고르는 중에는 화면 언어를 바꾸지 않는다

  useEffect(() => {
    if (!draft && status.kind === "idle") router.replace("/signup");
  }, [draft, status.kind, router]);

  const pickNationality = (code: string, defaultLang: string) => {
    setNationality(code);
    setLanguage(defaultLang); // 국적에 맞는 언어를 먼저 골라두고, 바꿀 수 있게 한다
  };

  const start = async () => {
    if (!draft) return;
    setStatus({ kind: "saving" });
    try {
      const auth = await authApi.signup({
        ...draft,
        nationality: toApiNationality(nationality),
        language: toApiLanguage(language),
      });
      setSession(auth);
      clearDraft(); // status가 saving인 채로 홈으로 가므로 아래 가입 입력 확인에 걸리지 않는다
    } catch (e) {
      const taken = e instanceof ApiError && e.code === "USER_LOGIN_ID_TAKEN";
      setStatus({
        kind: "error",
        message: taken ? t("이미 쓰는 아이디예요. 가입 화면에서 바꿔 주세요.") : t("시작하지 못했어요. 잠시 후 다시 시도해 주세요."),
      });
      return;
    }
    // 위치 권한 요청 — 허용하면 위치 1회 사용. 결과는 저장하지 않는다.
    await getCurrentPosition().catch(() => undefined);
    router.replace("/");
  };

  return (
    <Screen>
      <StepBar step={2} total={2} />
      <ScreenBody className="gap-[46px]! pt-[33px]!">
        <h1 className="text-page font-bold text-fg">{t("나라와 언어를 골라주세요")}</h1>
        <div className="flex flex-col gap-9">
          <section className="flex flex-col gap-5">
            <SectionTitle>{t("어느 나라에서 왔나요?")}</SectionTitle>
            <ChipGroup>
              {NATIONALITIES.map((n) => (
                <Chip key={n.code} lang={n.nativeLang} selected={nationality === n.code} onClick={() => pickNationality(n.code, n.defaultLang)}>
                  {n.native}
                </Chip>
              ))}
            </ChipGroup>
          </section>
          <section className="flex flex-col gap-5">
            <SectionTitle>{t("어떤 언어로 볼까요?")}</SectionTitle>
            <ChipGroup>
              {LANGUAGES.map((l) => (
                <Chip key={l.code} lang={l.code} selected={language === l.code} onClick={() => setLanguage(l.code)}>
                  {l.native}
                </Chip>
              ))}
            </ChipGroup>
          </section>
        </div>
      </ScreenBody>

      <ScreenFooter>
        {status.kind === "error" && (
          <p role="alert" className="text-center text-caption text-fg">
            {status.message}
          </p>
        )}
        {/* 트리거 5 */}
        <Button onClick={start} disabled={!draft || !nationality || !language || status.kind === "saving"}>
          {status.kind === "saving" ? t("준비하는 중…") : t("완료")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
