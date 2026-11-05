"use client";

import { useState } from "react";
import { TraceMap, type TracePin } from "@/components/map/TraceMap";
import { Card, Chip, ChipGroup, Screen, ScreenBody, ScreenHeading, SectionTitle, TabBar } from "@/components/ui";
import { FOOTSTEPS, MAP_FILTERS, MAP_PINS, PLACE_STATS } from "@/mocks/sample";
import { cn } from "@/lib/cn";

// 07 흔적 지도 · F6 — Figma 1:531 (썸네일 0.6배를 390 기준으로 환산)
// 장소별 집계·국적 분포·한걸음은 GET /map/pins, /places/{id}/reviews 연동 전까지 샘플이다.
// 필터는 국적 하나 + '이번 주' 토글로 해석했다. 샘플이라 선택해도 숫자는 바뀌지 않는다.
// 국적 분포 막대: 가장 큰 값이 트랙의 80%를 차지한다 (Figma 막대 비율)
const BAR_MAX = 80;

const PINS: TracePin[] = MAP_PINS.map(({ place, count }) => ({ id: place.id, label: place.shortName, count, at: place.at }));

export default function MapPage() {
  const [nationality, setNationality] = useState<string>("베트남");
  const [thisWeek, setThisWeek] = useState(false);
  const [selectedId, setSelectedId] = useState(PLACE_STATS.place.id);

  const selectedPin = MAP_PINS.find((p) => p.place.id === selectedId);
  // 국적 분포 샘플은 형무소역사관 것뿐이라, 다른 장소를 고르면 총계만 보여준다.
  const stats = selectedId === PLACE_STATS.place.id ? PLACE_STATS : null;
  const maxPct = Math.max(...PLACE_STATS.byNationality.map((n) => n.pct));

  return (
    <Screen>
      <ScreenBody className="gap-3!">
        <ScreenHeading title="흔적 지도" />
        <ChipGroup>
          {MAP_FILTERS.map((f) => (
            <Chip key={f} selected={nationality === f} onClick={() => setNationality(f)}>
              {f}
            </Chip>
          ))}
          <Chip selected={thisWeek} onClick={() => setThisWeek((v) => !v)}>
            이번 주
          </Chip>
        </ChipGroup>

        <TraceMap pins={PINS} selectedId={selectedId} onSelect={setSelectedId} />

        <Card className="gap-1.5! p-3.5!">
          <p className="text-label leading-[1.45] font-bold text-fg">
            {selectedPin?.place.name} · 다녀간 유학생 {stats ? stats.total : selectedPin?.count}명
          </p>
          {stats?.byNationality.map((n, i) => (
            <div key={n.label} className="flex items-center gap-2 text-micro leading-[1.45]">
              <span className="w-11 shrink-0 font-medium text-fg-caption">{n.label}</span>
              <span className="flex h-2 flex-1 items-center">
                <span
                  className={cn("h-2 rounded-[4px]", i === 0 ? "bg-ink" : "bg-fg-disabled")}
                  style={{ width: `${(n.pct / maxPct) * BAR_MAX}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-fg-caption">{n.pct}%</span>
            </div>
          ))}
        </Card>

        <SectionTitle>한걸음</SectionTitle>
        <ul className="flex flex-col gap-3">
          {FOOTSTEPS.map((f) => (
            <li key={f.id} className="flex gap-2.5">
              <span aria-hidden className="size-8 shrink-0 rounded-full bg-line" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                <p className="text-micro font-medium text-fg-muted">
                  {f.nationality} · {f.date}
                </p>
                <p className="text-label text-fg">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </ScreenBody>
      <TabBar />
    </Screen>
  );
}
