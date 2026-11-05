"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Chip,
  ChipGroup,
  ImagePlaceholder,
  InfoBox,
  Screen,
  ScreenBody,
  ScreenFooter,
  SectionTitle,
  TabBar,
  TopBar,
} from "@/components/ui";

// 개발용 검증 페이지: 공용 컴포넌트를 Figma 프레임과 나란히 비교한다.
// ?view=prefs → N2 취향 선택(1:102), 기본 → 03 지금(홈, 1:376) 카드·탭바 구성. 확인 후 삭제한다.
const PLACES = ["역사·유적", "시장·먹거리", "전시·박물관", "자연·산책", "카페·휴식", "포토 스팟"];
const STORIES = ["독립운동", "근현대사", "한국 음식", "문화·예술", "동네 사람들"];

function useToggleSet(initial: string[]) {
  const [set, setSet] = useState(() => new Set(initial));
  const toggle = (v: string) =>
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  return [set, toggle] as const;
}

function PrefsView() {
  const [places, togglePlace] = useToggleSet(["역사·유적", "시장·먹거리"]);
  const [stories, toggleStory] = useToggleSet(["독립운동"]);

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
          {PLACES.map((p) => (
            <Chip key={p} selected={places.has(p)} onClick={() => togglePlace(p)}>
              {p}
            </Chip>
          ))}
        </ChipGroup>
        <SectionTitle>관심 있는 이야기</SectionTitle>
        <ChipGroup>
          {STORIES.map((s) => (
            <Chip key={s} selected={stories.has(s)} onClick={() => toggleStory(s)}>
              {s}
            </Chip>
          ))}
        </ChipGroup>
      </ScreenBody>
      <ScreenFooter>
        <Button>완료</Button>
        <Button variant="text">건너뛰기</Button>
      </ScreenFooter>
    </Screen>
  );
}

function HomeView() {
  return (
    <Screen>
      <ScreenBody>
        <div className="flex flex-col gap-1">
          <p className="text-[22px] font-bold leading-[1.45] text-fg">지금, 독립문역 근처</p>
          <p className="text-body text-fg-muted">토요일 오후 · 비 오는 날 추천이에요</p>
        </div>
        <ChipGroup>
          <Chip>토 15:20</Chip>
          <Chip>비 · 12°C</Chip>
          <Chip>3호선 2분 후 도착</Chip>
        </ChipGroup>
        <SectionTitle>지금 가기 좋은 곳</SectionTitle>
        <Card>
          <ImagePlaceholder label="장소 사진 (TourAPI)" className="h-[104px]" />
          <p className="text-[18px] font-bold leading-[1.45] text-fg">서대문형무소역사관</p>
          <p className="text-body text-fg-muted">비 오는 오후엔 실내 전시관부터 · 도보 4분</p>
          <ChipGroup>
            <Chip>베트남 유학생 12명 다녀감</Chip>
            <Chip>독립 코스 1/3</Chip>
          </ChipGroup>
          <Button>장면 보기</Button>
        </Card>
        <SectionTitle>지난주 유학생 인기</SectionTitle>
        <div className="flex gap-2.5">
          {[
            ["독립문", "유학생 31명"],
            ["영천시장", "유학생 24명"],
          ].map(([name, count]) => (
            <Card key={name} className="gap-1.5 p-2.5">
              <ImagePlaceholder className="h-[52px]" />
              <p className="text-body font-bold text-fg">{name}</p>
              <p className="text-caption text-fg-muted">{count}</p>
            </Card>
          ))}
        </div>
        <Button variant="secondary">지금 보이는 걸 찍어서 물어보기</Button>
      </ScreenBody>
      <TabBar />
    </Screen>
  );
}

export default function UiCheck() {
  const [view, setView] = useState<"home" | "prefs">("home");
  return (
    <>
      <div className="flex gap-2 px-5 pt-2">
        <Chip selected={view === "home"} onClick={() => setView("home")}>03 지금</Chip>
        <Chip selected={view === "prefs"} onClick={() => setView("prefs")}>N2 취향</Chip>
      </div>
      {view === "home" ? <HomeView /> : <PrefsView />}
    </>
  );
}
