"use client";

import { useRouter } from "next/navigation";
import { BottomSheet, Button, InfoBox, Screen } from "@/components/ui";
import { useT } from "@/i18n";

// 00 시작 선택 · F1 — Figma 1:160
// 첫 실행에서만 보인다(홈이 익명 사용자 없음을 확인하고 보냄). 가입·비가입 모두 01 처음 설정으로 모인다.
export default function StartPage() {
  const router = useRouter();
  const t = useT();

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-5 py-3 text-center">
        <div className="flex size-24 items-center justify-center rounded-sheet border border-line bg-surface-sunken text-body text-fg-muted">
          {t("로고")}
        </div>
        <h1 className="text-display font-bold text-ink">{t("서대문 발자취")}</h1>
        <p className="text-body leading-[22px] whitespace-pre-line text-fg-sub">
          {t("서대문을 다녀간 유학생들의 발자취를 따라\n오늘의 한 장면을 만나요.")}
        </p>
      </div>

      <BottomSheet title={t("Let's get started")}>
        <InfoBox className="flex gap-1">
          <span aria-hidden>✓</span>
          <span className="whitespace-pre-line">{t("가입하면 선호하는 관광지·관심사에 맞춰\n장소를 먼저 추천받아요")}</span>
        </InfoBox>
        {/* 트리거 1·2 */}
        <Button onClick={() => router.push("/signup")}>{t("가입하기")}</Button>
        <Button variant="secondary" onClick={() => router.push("/setup")}>
          {t("가입 없이 시작하기")}
        </Button>
        <p className="text-center text-caption text-fg-muted">
          {t("가입 없이도 모든 기능을 쓸 수 있어요 · 이름·연락처는 받지 않아요")}
        </p>
      </BottomSheet>
    </Screen>
  );
}
