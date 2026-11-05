"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Divider,
  FieldLabel,
  InfoBox,
  Screen,
  ScreenBody,
  ScreenFooter,
  TextField,
  TopBar,
} from "@/components/ui";

// N1 가입 (선택) · F1 — Figma 1:80
// 가입을 P0에 넣을지 미정이고 인증 API 계약도 없어, 화면 입력·이동만 구현했다.
// 인증이 확정되면 Google 로그인과 이메일 가입 요청을 여기서 호출한다.
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const next = () => router.push("/preferences");

  return (
    <Screen>
      <TopBar title="가입하기" />
      <ScreenBody>
        <h2 className="text-heading leading-[30px] font-bold text-ink">
          가입하면 취향에 맞는 장소를
          <br />
          먼저 보여줘요
        </h2>
        <InfoBox>
          가입하면 선호하는 관광지 · 관심사 · 성향을 골라 추천에 바로 반영할 수 있어요.
          <br />
          가입하지 않아도 모든 기능을 쓸 수 있어요.
        </InfoBox>
        <Button variant="secondary" onClick={next}>
          Google로 계속하기
        </Button>
        <Divider label="또는" />

        <FieldLabel htmlFor="email">이메일</FieldLabel>
        <TextField
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldLabel htmlFor="password">비밀번호</FieldLabel>
        <TextField
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          placeholder="8자 이상"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              className="shrink-0 text-label text-fg-sub"
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          }
        />
        <p className="text-caption text-fg-muted">* 이름·연락처는 받지 않아요. 이메일은 로그인에만 써요.</p>
      </ScreenBody>
      <ScreenFooter>
        {/* 트리거 3 */}
        <Button onClick={next}>가입하고 취향 고르기</Button>
      </ScreenFooter>
    </Screen>
  );
}
