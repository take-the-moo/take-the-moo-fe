"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/api/client";
import { Button, Chip, ChipGroup, Divider, Screen, ScreenFooter } from "@/components/ui";
import { LANGUAGES, NATIONALITIES } from "@/mocks/sample";
import { getCurrentPosition } from "@/platform/location";
import { useUserStore } from "@/store/user";

// 01 처음 설정 · F1 — Figma 1:298 (썸네일 0.6배를 390 기준으로 환산)
// 시작하기: POST /users로 익명 사용자 생성 → 위치 권한 요청(1회 조회) → 03 홈.
// v3.1에서 위치 거부 분기(02 역 선택)를 흐름에서 뺐다. 요구서의 대체 경로 유지 여부는 미정이라
// 여기서는 거부·실패해도 홈으로 보내고, 홈이 위치 없이 동작하도록 둔다.
type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string };

export default function SetupPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [nationality, setNationality] = useState<string>("VN");
  const [language, setLanguage] = useState<string>("vi");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const pickNationality = (code: string, defaultLang: string) => {
    setNationality(code);
    setLanguage(defaultLang); // 국적에 맞는 언어를 먼저 골라두고, 바꿀 수 있게 한다
  };

  const start = async () => {
    setStatus({ kind: "saving" });
    try {
      const user = await api<{ userId: string }>("/users", {
        method: "POST",
        body: JSON.stringify({ nationality, language }),
      });
      setUser({ userId: user.userId, nationality, language });
    } catch {
      setStatus({ kind: "error", message: "시작하지 못했어요. 잠시 후 다시 시도해 주세요." });
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
          <h1 className="text-[30px] font-bold text-ink">서대문 발자취</h1>
          <p className="text-[15px] text-fg-caption">
            서대문을 다녀간 유학생들의 발자취를 따라
            <br />
            오늘의 한 장면을 만나요.
          </p>
        </div>
        <Divider />

        <h2 className="text-body-lg leading-[1.45] font-bold text-fg">어느 나라에서 왔어요?</h2>
        <ChipGroup>
          {NATIONALITIES.map((n) => (
            <Chip key={n.code} selected={nationality === n.code} onClick={() => pickNationality(n.code, n.defaultLang)}>
              {n.label}
            </Chip>
          ))}
        </ChipGroup>

        <h2 className="text-body-lg leading-[1.45] font-bold text-fg">어떤 언어로 볼까요?</h2>
        <ChipGroup>
          {LANGUAGES.map((l) => (
            <Chip key={l.code} selected={language === l.code} onClick={() => setLanguage(l.code)}>
              {l.label}
            </Chip>
          ))}
        </ChipGroup>
        <p className="text-caption leading-[1.45] text-fg-muted">* 장면은 선택한 언어 + 쉬운 한국어로 함께 보여줘요.</p>
      </div>

      <ScreenFooter>
        {status.kind === "error" ? (
          <p role="alert" className="text-center text-caption text-fg">
            {status.message}
          </p>
        ) : (
          <p className="text-center text-caption text-fg-muted">로그인 없이 시작 · 이름·연락처는 받지 않아요</p>
        )}
        {/* 트리거 5 */}
        <Button onClick={start} disabled={status.kind === "saving"}>
          {status.kind === "saving" ? "준비하는 중…" : "시작하기"}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
