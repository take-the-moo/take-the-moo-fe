"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Screen, Stamp } from "@/components/ui";
import { useT } from "@/i18n";

// 00 온보딩 → 00 시작 선택 · F1 — Figma 9:1043, 9:1031
// 로그인하지 않았으면 보인다(Providers가 보냄). 로고를 잠깐 보여준 뒤 시작 화면으로 넘어간다.
// 가입하기 → N1 → N2 → 01에서 가입 완료. 로그인은 Figma에 없지만 기존 사용자가 돌아올 길이라 남겼다.
const SPLASH_MS = 1500;
// 발자국 3개의 위치 (Figma 프레임 기준 %)
const FOOTPRINTS = [
  { left: "-8.46%", top: "45.62%" },
  { left: "28.44%", top: "28.06%" },
  { left: "65.8%", top: "10.49%" },
];

let splashShown = false; // 앱 실행당 한 번만. 가입 화면에서 뒤로 왔을 때는 다시 보이지 않게 한다

export default function StartPage() {
  const router = useRouter();
  const t = useT();
  const [splash, setSplash] = useState(!splashShown);

  useEffect(() => {
    if (!splash) return;
    const timer = setTimeout(() => {
      splashShown = true;
      setSplash(false);
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [splash]);

  if (splash) {
    return (
      <Screen className="items-center justify-center gap-4 px-6 text-center">
        <Stamp size={118} />
        <h1 className="text-heading font-bold text-fg">Foot Note</h1>
        <p className="text-body font-medium whitespace-pre-line text-fg-sub">
          {t("서대문을 다녀간 유학생들의 발자취를 따라\n오늘의 한 장면을 만나요.")}
        </p>
      </Screen>
    );
  }

  return (
    <Screen className="relative justify-end overflow-hidden">
      {FOOTPRINTS.map((style) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={style.left} src="/images/footprints.png" alt="" style={style} className="absolute w-[46.83%]" />
      ))}
      <div className="relative flex flex-col gap-4 px-6">
        <h1 className="text-display font-bold whitespace-pre-line text-fg">{"Start\nyour journey"}</h1>
        <p className="text-body leading-[1.45] font-medium whitespace-pre-line text-fg-muted">
          {t("가입하면 선호하는 관광지·관심사에 맞춰\n장소를 먼저 추천받을 수 있어요")}
        </p>
      </div>
      <div className="relative mt-16 flex flex-col gap-4 px-6 pb-4">
        {/* 트리거 1·2 */}
        <Button onClick={() => router.push("/signup")}>{t("가입하기")}</Button>
        <Button variant="text" onClick={() => router.push("/login")}>
          {t("로그인")}
        </Button>
      </div>
    </Screen>
  );
}
