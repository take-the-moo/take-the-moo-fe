"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Button,
  Card,
  Chip,
  ChipGroup,
  ImagePlaceholder,
  Screen,
  ScreenBody,
  ScreenHeading,
  SectionTitle,
  TabBar,
} from "@/components/ui";
import { useAskWithPhoto } from "@/hooks/useAskWithPhoto";
import { NOW } from "@/mocks/sample";
import { useUserHydrated, useUserStore } from "@/store/user";

// 03 지금 (홈) · F2 — Figma 1:376
// 추천 내용은 GET /now 연동 전까지 샘플 데이터다. 진입 시 위치 1회 조회도 /now 연동과 함께 붙인다.
export default function NowPage() {
  const router = useRouter();
  const hydrated = useUserHydrated();
  const userId = useUserStore((s) => s.userId);
  const { ask, busy } = useAskWithPhoto();

  // 첫 실행(익명 사용자 없음)이면 00 시작 선택으로 보낸다.
  useEffect(() => {
    if (hydrated && !userId) router.replace("/start");
  }, [hydrated, userId, router]);

  if (!hydrated || !userId) return <Screen>{null}</Screen>;

  const { recommendation: rec } = NOW;

  return (
    <Screen>
      <ScreenBody>
        <ScreenHeading title={`지금, ${NOW.area} 근처`} sub={NOW.summary} />
        <ChipGroup>
          {NOW.context.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </ChipGroup>

        <SectionTitle>지금 가기 좋은 곳</SectionTitle>
        <Card>
          <ImagePlaceholder label="장소 사진 (TourAPI)" className="h-[104px]" />
          <p className="text-[18px] font-bold leading-[1.45] text-fg">{rec.place.name}</p>
          <p className="text-label leading-[1.45] text-fg-caption">{rec.reason}</p>
          <ChipGroup>
            {rec.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </ChipGroup>
          {/* 트리거 6: 장면 보기 → 04 */}
          <Button onClick={() => router.push(`/scene/${rec.place.id}`)}>장면 보기</Button>
        </Card>

        <SectionTitle>지난주 유학생 인기</SectionTitle>
        <div className="flex gap-2.5">
          {NOW.popular.map(({ place, count }) => (
            // 인기 장소 카드도 04로 연결된다 (v3.1 피드백)
            <Link key={place.id} href={`/scene/${place.id}`} className="flex min-w-0 flex-1">
              <Card className="gap-1.5! p-2.5!">
                <ImagePlaceholder className="h-[52px]" />
                <p className="text-body font-bold leading-[1.45] text-fg">{place.name}</p>
                <p className="text-caption leading-[1.45] text-fg-muted">유학생 {count}명</p>
              </Card>
            </Link>
          ))}
        </div>
      </ScreenBody>

      <div className="px-5 py-2">
        {/* 바로가기: 카메라로 묻기 → 05 */}
        <Button variant="secondary" onClick={ask} disabled={busy}>
          지금 보이는 걸 찍어서 물어보기
        </Button>
      </div>
      <TabBar />
    </Screen>
  );
}
