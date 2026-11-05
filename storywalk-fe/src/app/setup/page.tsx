"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import { toApiLanguage, toApiNationality } from "@/api/codes";
import { Button, Chip, ChipGroup, Divider, Screen, ScreenFooter } from "@/components/ui";
import { useT } from "@/i18n";
import { LANGUAGES, NATIONALITIES } from "@/mocks/sample";
import { getCurrentPosition } from "@/platform/location";
import { useSignupStore } from "@/store/signup";
import { useUserStore } from "@/store/user";

// 01 처음 설정 · F1 — Figma 1:298 (썸네일 0.6배를 390 기준으로 환산)
// 시작하기: N1에서 받은 아이디·비밀번호·이름 + 국적·언어로 POST /auth/signup → 토큰 저장
// → 위치 권한 요청(1회 조회) → 03 홈. 가입 입력이 없으면(새로고침 등) N1부터 다시 한다.
// 위치를 거부·실패해도 홈으로 보내고, 홈은 위치 없이(기본 역 기준) 동작한다.
type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string };

export default function SetupPage() {
  const router = useRouter();
  const setSession = useUserStore((s) => s.setSession);
  const draft = useSignupStore((s) => s.draft);
  const clearDraft = useSignupStore((s) => s.clear);
  const [nationality, setNationality] = useState<string>("VN");
  const [language, setLanguage] = useState<string>("vi");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const t = useT(language); // 고르는 즉시 화면에 반영한다

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
      <div className="flex flex-1 flex-col gap-5 px-5 pt-12 pb-3">
        <div className="flex flex-col gap-5 leading-[1.45]">
          <h1 className="text-[30px] font-bold text-ink">{t("서대문 발자취")}</h1>
          <p className="text-[15px] whitespace-pre-line text-fg-caption">
            {t("서대문을 다녀간 유학생들의 발자취를 따라\n오늘의 한 장면을 만나요.")}
          </p>
        </div>
        <Divider />

        <h2 className="text-body-lg leading-[1.45] font-bold text-fg">{t("어느 나라에서 왔어요?")}</h2>
        <ChipGroup>
          {NATIONALITIES.map((n) => (
            <Chip key={n.code} selected={nationality === n.code} onClick={() => pickNationality(n.code, n.defaultLang)}>
              {t(n.label)}
            </Chip>
          ))}
        </ChipGroup>

        <h2 className="text-body-lg leading-[1.45] font-bold text-fg">{t("어떤 언어로 볼까요?")}</h2>
        <ChipGroup>
          {LANGUAGES.map((l) => (
            <Chip key={l.code} selected={language === l.code} onClick={() => setLanguage(l.code)}>
              {t(l.label)}
            </Chip>
          ))}
        </ChipGroup>
        <p className="text-caption leading-[1.45] text-fg-muted">{t("* 장면은 선택한 언어 + 쉬운 한국어로 함께 보여줘요.")}</p>
      </div>

      <ScreenFooter>
        {status.kind === "error" ? (
          <p role="alert" className="text-center text-caption text-fg">
            {status.message}
          </p>
        ) : (
          <p className="text-center text-caption text-fg-muted">{t("가입을 마치면 바로 시작해요")}</p>
        )}
        {/* 트리거 5 */}
        <Button onClick={start} disabled={!draft || status.kind === "saving"}>
          {status.kind === "saving" ? t("준비하는 중…") : t("시작하기")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
