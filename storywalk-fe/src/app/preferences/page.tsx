"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Chip, ChipGroup, InfoBox, Screen, ScreenBody, ScreenFooter, SectionTitle, TopBar } from "@/components/ui";
import { PREFERENCE_OPTIONS } from "@/mocks/sample";
import { useUserStore } from "@/store/user";

// N2 취향 선택 · F1 — Figma 1:102
// 완료·건너뛰기 모두 01 처음 설정으로 간다. 고른 값은 기기에 두고 추천 API 연동 시 함께 보낸다.
const DEFAULT = {
  places: ["역사·유적", "시장·먹거리"],
  stories: ["독립운동"],
  styles: ["조용히 둘러보기", "발길 닿는 대로", "혼자"],
};

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function PreferencesPage() {
  const router = useRouter();
  const saved = useUserStore((s) => s.preferences);
  const setPreferences = useUserStore((s) => s.setPreferences);
  const [places, setPlaces] = useState<string[]>(saved?.places ?? DEFAULT.places);
  const [stories, setStories] = useState<string[]>(saved?.stories ?? DEFAULT.stories);
  const [styles, setStyles] = useState<string[]>(saved?.styles ?? DEFAULT.styles);

  // 성향은 축마다 하나만 고른다. 같은 칩을 다시 누르면 그 축은 선택 해제.
  const pickStyle = (axis: readonly string[], value: string) =>
    setStyles((prev) => {
      const rest = prev.filter((s) => !axis.includes(s));
      return prev.includes(value) ? rest : [...rest, value];
    });

  return (
    <Screen>
      <TopBar title="어떤 걸 좋아해요?" />
      <ScreenBody>
        <InfoBox>
          고른 취향은 추천에 먼저 반영돼요.
          <br />
          나중에 언제든 바꿀 수 있어요.
        </InfoBox>

        <SectionTitle>가고 싶은 곳 (여러 개 선택)</SectionTitle>
        <ChipGroup>
          {PREFERENCE_OPTIONS.places.map((p) => (
            <Chip key={p} selected={places.includes(p)} onClick={() => setPlaces((l) => toggle(l, p))}>
              {p}
            </Chip>
          ))}
        </ChipGroup>

        <SectionTitle>관심 있는 이야기</SectionTitle>
        <ChipGroup>
          {PREFERENCE_OPTIONS.stories.map((s) => (
            <Chip key={s} selected={stories.includes(s)} onClick={() => setStories((l) => toggle(l, s))}>
              {s}
            </Chip>
          ))}
        </ChipGroup>

        <SectionTitle>여행 성향</SectionTitle>
        {PREFERENCE_OPTIONS.styles.map((axis) => (
          <ChipGroup key={axis.join()}>
            {axis.map((s) => (
              <Chip key={s} selected={styles.includes(s)} onClick={() => pickStyle(axis, s)}>
                {s}
              </Chip>
            ))}
          </ChipGroup>
        ))}
      </ScreenBody>
      <ScreenFooter>
        {/* 트리거 4 */}
        <Button
          onClick={() => {
            setPreferences({ places, stories, styles });
            router.push("/setup");
          }}
        >
          완료
        </Button>
        <Button variant="text" onClick={() => router.push("/setup")}>
          건너뛰기
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
