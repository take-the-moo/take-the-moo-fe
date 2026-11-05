"use client";

import { useRouter } from "next/navigation";
import { BottomSheet, Button, InfoBox, Screen } from "@/components/ui";

// 00 시작 선택 · F1 — Figma 1:160
// 첫 실행에서만 보인다(홈이 익명 사용자 없음을 확인하고 보냄). 가입·비가입 모두 01 처음 설정으로 모인다.
export default function StartPage() {
  const router = useRouter();

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-5 py-3 text-center">
        <div className="flex size-24 items-center justify-center rounded-sheet border border-line bg-surface-sunken text-body text-fg-muted">
          로고
        </div>
        <h1 className="text-display font-bold text-ink">서대문 발자취</h1>
        <p className="text-body leading-[22px] text-fg-sub">
          서대문을 다녀간 유학생들의 발자취를 따라
          <br />
          오늘의 한 장면을 만나요.
        </p>
      </div>

      <BottomSheet title="Let's get started">
        <InfoBox className="flex gap-1">
          <span aria-hidden>✓</span>
          <span>
            가입하면 선호하는 관광지·관심사에 맞춰
            <br />
            장소를 먼저 추천받아요
          </span>
        </InfoBox>
        {/* 트리거 1·2 */}
        <Button onClick={() => router.push("/signup")}>가입하기</Button>
        <Button variant="secondary" onClick={() => router.push("/setup")}>
          가입 없이 시작하기
        </Button>
        <p className="text-center text-caption text-fg-muted">
          가입 없이도 모든 기능을 쓸 수 있어요 · 이름·연락처는 받지 않아요
        </p>
      </BottomSheet>
    </Screen>
  );
}
