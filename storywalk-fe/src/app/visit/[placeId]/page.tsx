"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { CourseSteps } from "@/components/course/CourseProgress";
import { Button, Card, Chip, ChipGroup, ImagePlaceholder, Screen, ScreenBody, ScreenFooter, TopBar } from "@/components/ui";
import { EXPLANATION, findPlace, INDEPENDENCE_COURSE, languageLabel } from "@/mocks/sample";
import { useLatestPhoto } from "@/store/capture";
import { useUserStore } from "@/store/user";

// 06 해설 결과 · 방문 도장 · F4·F5 — Figma 1:466 (썸네일 0.6배를 390 기준으로 환산)
// mode=explain: 05에서 장소를 고르고 온 경우 — 사진·저장된 해설·도장·코스 진행
// mode=stamp:   04 "방문 완료"(트리거 9)로 온 경우 — 사진·해설 없이 도장 영역만 (v3.1 노트)
// 해설은 POST /explanations, 도장은 POST /visits(좌표 근접 검증) 연동 전까지 샘플이다.
type Props = {
  params: Promise<{ placeId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

const dateLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()} (${"일월화수목금토"[d.getDay()]})`;

export default function VisitPage({ params, searchParams }: Props) {
  const { placeId } = use(params);
  const { mode } = use(searchParams);
  const router = useRouter();
  const place = findPlace(placeId);
  const photo = useLatestPhoto();
  const language = useUserStore((s) => s.language);

  if (!place) {
    return (
      <Screen>
        <TopBar title="장소를 찾을 수 없어요" />
      </Screen>
    );
  }

  const explain = mode === "explain";
  const stops = INDEPENDENCE_COURSE.stops;
  const index = stops.findIndex((s) => s.id === place.id);
  const inCourse = index >= 0;
  const doneIds = inCourse ? stops.slice(0, index + 1).map((s) => s.id) : [];
  const next = inCourse ? stops[index + 1] : undefined;

  return (
    <Screen>
      <TopBar title={explain ? EXPLANATION.spot : place.name} />
      <ScreenBody className="gap-3!">
        {explain && (
          <>
            <ImagePlaceholder label="내가 찍은 사진" src={photo?.url} className="h-[130px]" />
            <ChipGroup>
              <Chip selected>저장된 해설</Chip>
              <Chip>{languageLabel(language)}로 번역</Chip>
            </ChipGroup>
            <Card className="gap-2! leading-[1.45]">
              <p className="text-body font-medium text-ink">{EXPLANATION.translated}</p>
              <p className="text-label text-fg-caption">{EXPLANATION.original}</p>
            </Card>
          </>
        )}

        <Card className="h-[100px] flex-row! items-center gap-3!">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-[3px] border-dashed border-ink text-label font-bold text-ink">
            도장
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
            <p className="text-body-lg font-bold text-fg">방문 도장 획득!</p>
            <p className="truncate text-caption text-fg-muted">
              {place.name} · {dateLabel(new Date())}
            </p>
          </div>
        </Card>

        {inCourse && (
          <div className="flex flex-col gap-2 rounded-box bg-surface-sunken p-4">
            <p className="text-label leading-[1.45] font-bold text-fg">
              {INDEPENDENCE_COURSE.name} {doneIds.length} / {stops.length}
            </p>
            <CourseSteps stops={stops} doneIds={doneIds} />
          </div>
        )}
      </ScreenBody>
      <ScreenFooter className="flex-row!">
        {/* 트리거 11: 한걸음 남기기 → N3 / 트리거 12: 다음 장소 → 04 복귀 */}
        <Button variant="secondary" className="flex-1" onClick={() => router.push(`/visit/${place.id}/review`)}>
          한걸음 남기기
        </Button>
        {next ? (
          <Button className="flex-1" onClick={() => router.push(`/scene/${next.id}`)}>
            다음: {next.shortName} {next.id === EXPLANATION.next.place.id ? EXPLANATION.next.walk : ""}
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => router.push("/log")}>
            나의 기록 보기
          </Button>
        )}
      </ScreenFooter>
    </Screen>
  );
}
