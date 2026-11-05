"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Chip, ChipGroup, Screen, ScreenBody, ScreenFooter, SectionTitle, StepBar } from "@/components/ui";
import { useT } from "@/i18n";
import { PREFERENCE_OPTIONS } from "@/lib/options";
import { useUserStore } from "@/store/user";

// N2 취향 선택 · F1 — Figma 9:1564
// 하나 이상 고르면 완료가 켜지고 01 처음 설정으로 간다. 고른 값은 기기에 두고 추천 API 연동 시 함께 보낸다.
function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function PreferencesPage() {
  const router = useRouter();
  const t = useT();
  const saved = useUserStore((s) => s.preferences);
  const setPreferences = useUserStore((s) => s.setPreferences);
  const [places, setPlaces] = useState<string[]>(saved?.places ?? []);
  const [stories, setStories] = useState<string[]>(saved?.stories ?? []);
  const [styles, setStyles] = useState<string[]>(saved?.styles ?? []);

  // 성향은 축마다 하나만 고른다. 같은 칩을 다시 누르면 그 축은 선택 해제.
  const pickStyle = (axis: readonly string[], value: string) =>
    setStyles((prev) => {
      const rest = prev.filter((s) => !axis.includes(s));
      return prev.includes(value) ? rest : [...rest, value];
    });

  return (
    <Screen>
      <StepBar step={1} total={2} />
      <ScreenBody className="gap-10! pt-8!">
        <div className="flex flex-col gap-2">
          <h1 className="text-page font-bold text-fg">{t("취향을 알려주세요")}</h1>
          <p className="text-caption leading-[1.5] font-medium whitespace-pre-line text-fg-muted">
            {t("고른 취향은 추천에 먼저 반영돼요.\n나중에 언제든 바꿀 수 있어요.")}
          </p>
        </div>

        <div className="flex flex-col gap-9">
          <section className="flex flex-col gap-5">
            <SectionTitle>{t("가고 싶은 곳")}</SectionTitle>
            <ChipGroup>
              {PREFERENCE_OPTIONS.places.map((p) => (
                <Chip key={p} selected={places.includes(p)} onClick={() => setPlaces((l) => toggle(l, p))}>
                  {t(p)}
                </Chip>
              ))}
            </ChipGroup>
          </section>

          <section className="flex flex-col gap-5">
            <SectionTitle>{t("관심 있는 이야기")}</SectionTitle>
            <ChipGroup>
              {PREFERENCE_OPTIONS.stories.map((s) => (
                <Chip key={s} selected={stories.includes(s)} onClick={() => setStories((l) => toggle(l, s))}>
                  {t(s)}
                </Chip>
              ))}
            </ChipGroup>
          </section>

          <section className="flex flex-col gap-5">
            <SectionTitle>{t("여행 성향")}</SectionTitle>
            <div className="flex flex-col gap-3">
              {PREFERENCE_OPTIONS.styles.map((axis) => (
                <ChipGroup key={axis.join()}>
                  {axis.map((s) => (
                    <Chip key={s} selected={styles.includes(s)} onClick={() => pickStyle(axis, s)}>
                      {t(s)}
                    </Chip>
                  ))}
                </ChipGroup>
              ))}
            </div>
          </section>
        </div>
      </ScreenBody>
      <ScreenFooter>
        {/* 트리거 4 */}
        <Button
          disabled={places.length + stories.length + styles.length === 0}
          onClick={() => {
            setPreferences({ places, stories, styles });
            router.push("/setup");
          }}
        >
          {t("완료")}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
