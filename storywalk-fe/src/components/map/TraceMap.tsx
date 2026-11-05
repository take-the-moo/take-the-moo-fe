"use client";

import { useEffect, useRef, useState } from "react";
import { t, useLang, useT } from "@/i18n";
import { loadNaverMaps, toLatLng, type LngLat } from "@/platform/map";
import { cn } from "@/lib/cn";

// Figma: 07 'map' — 장소별 방문 수 원형 핀 + 이름. 개인 위치가 아니라 장소 집계만 표시한다(F6).
// 네이버 지도 SDK가 준비되면 실제 지도 위에, 키 미설정·인증 실패 시엔 Figma 와이어프레임과 같은
// 개략도(좌표를 상자 안에 비례 배치)로 그린다. 시연 환경에서 지도 문제로 화면이 비지 않게 하기 위함이다.
export type TracePin = { id: string; label: string; count: number; at: LngLat };

type Props = { pins: TracePin[]; selectedId: string; onSelect: (id: string) => void; className?: string };

const pinSize = (selected: boolean) => (selected ? 40 : 30);

// 마커의 터치 영역은 content의 레이아웃 박스다. transform으로 옮기거나 이름표로 박스를 키우면
// 보이지 않는 영역이 옆 핀의 탭을 가로채므로, 박스는 원 크기로 두고 이름표는 absolute로 띄운다.
const pinHtml = (pin: TracePin, selected: boolean) => {
  const size = pinSize(selected);
  const bg = selected ? "#141414" : "#595959";
  const label = selected
    ? `<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:2px;pointer-events:none;font-size:10px;font-weight:700;color:#333;white-space:nowrap;text-shadow:0 0 2px #fff">${pin.label}</div>`
    : "";
  return `<div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${selected ? 13 : 11}px;cursor:pointer">${pin.count}${label}</div>`;
};

export function TraceMap({ pins, selectedId, onSelect, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const lang = useLang();
  const [mode, setMode] = useState<"loading" | "map" | "fallback">("loading");
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  // 지도 생성 (1회)
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const onAuthFailure = () => {
      observer?.disconnect();
      mapRef.current?.destroy();
      mapRef.current = null;
      setMode("fallback");
    };
    window.addEventListener("naver-maps-auth-failure", onAuthFailure);
    loadNaverMaps()
      .then(() => {
        if (cancelled || !el.current) return;
        const bounds = new naver.maps.LatLngBounds(toLatLng(pins[0].at), toLatLng(pins[0].at));
        pins.forEach((p) => bounds.extend(toLatLng(p.at)));
        const map = new naver.maps.Map(el.current, { bounds, mapDataControl: false, scaleControl: false, logoControl: true });
        // 핀 원·이름표가 잘리거나 하단 NAVER 로고에 가리지 않을 여백
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 56, left: 40 });
        mapRef.current = map;
        setMode("map");
        // 컨테이너 높이가 시트를 따라 변한다. 축척은 그대로 두고 보이는 영역만 바꾼다.
        observer = new ResizeObserver(() => map.autoResize());
        observer.observe(el.current);
      })
      .catch(() => !cancelled && setMode("fallback"));
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("naver-maps-auth-failure", onAuthFailure);
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // 핀 목록이 바뀌어도 지도는 다시 만들지 않는다 (아래 효과가 마커만 갱신)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 마커 (핀·선택 변경 시 다시 그림)
  useEffect(() => {
    const map = mapRef.current;
    if (mode !== "map" || !map) return;
    const markers = pins.map((pin) => {
      const half = pinSize(pin.id === selectedId) / 2;
      const marker = new naver.maps.Marker({
        map,
        position: toLatLng(pin.at),
        title: t(lang, "{place} · {count}명", { place: pin.label, count: pin.count }),
        icon: { content: pinHtml(pin, pin.id === selectedId), anchor: new naver.maps.Point(half, half) },
        zIndex: pin.id === selectedId ? 10 : 1,
      });
      naver.maps.Event.addListener(marker, "click", () => onSelectRef.current(pin.id));
      return marker;
    });
    return () =>
      markers.forEach((m) => {
        naver.maps.Event.clearInstanceListeners(m);
        m.setMap(null);
      });
  }, [mode, pins, selectedId, lang]);

  return (
    <div className={cn("relative h-[220px] w-full overflow-hidden rounded-box bg-surface-sunken", className)}>
      {/* SDK가 컨테이너에 position:relative를 넣어 inset 기반 높이는 0이 된다. 높이를 직접 준다 */}
      <div ref={el} className={cn("size-full", mode !== "map" && "invisible")} />
      {mode === "fallback" && <Schematic pins={pins} selectedId={selectedId} onSelect={onSelect} />}
    </div>
  );
}

// 지도 SDK 없이 그리는 개략도. 실제 거리 비례로 놓으면 가까운 장소(형무소역사관·독립문)가 겹쳐서,
// 경도·위도의 '순위'로 배치한다. 동서·남북 방향 관계만 유지하고 간격은 고르게 편다.
function Schematic({ pins, selectedId, onSelect }: Omit<Props, "className">) {
  const tr = useT();
  const rank = (values: number[], v: number) => {
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    return sorted.length > 1 ? sorted.indexOf(v) / (sorted.length - 1) : 0.5;
  };
  const lngs = pins.map((p) => p.at[0]);
  const lats = pins.map((p) => p.at[1]);
  const x = (lng: number) => 14 + rank(lngs, lng) * 72; // 좌우 14% 여백
  const y = (lat: number) => 20 + (1 - rank(lats, lat)) * 58; // 북쪽이 위. 아래는 이름표 자리만큼 더 비운다

  return (
    <div className="absolute inset-0" aria-label={tr("장소별 방문 수 개략도")}>
      {/* 길 표시 (장식) */}
      <div aria-hidden className="absolute top-[30%] -left-5 h-2.5 w-[115%] -rotate-12 bg-surface" />
      <div aria-hidden className="absolute -top-5 left-[54%] h-[120%] w-2.5 bg-surface" />
      {pins.map((pin) => {
        const selected = pin.id === selectedId;
        return (
          <button
            key={pin.id}
            type="button"
            onClick={() => onSelect(pin.id)}
            aria-pressed={selected}
            aria-label={tr("{place} 방문 {count}명", { place: pin.label, count: pin.count })}
            style={{ left: `${x(pin.at[0])}%`, top: `${y(pin.at[1])}%` }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full font-bold text-on-primary",
                selected ? "size-10 bg-ink text-label" : "size-[30px] bg-[#595959] text-micro",
              )}
            >
              {pin.count}
            </span>
            <span className="text-[10px] leading-[1.45] font-bold whitespace-nowrap text-primary">{pin.label}</span>
          </button>
        );
      })}
    </div>
  );
}
