"use client";

import { useEffect, useRef, useState } from "react";
import { loadNaverMaps, toLatLng, type LngLat } from "@/platform/map";

// 개발용 검증 페이지. 확인 후 삭제한다.
// 좌표는 검증용 근사값이다. 거리뷰가 'ERROR'인 지점이 실제 코스 후보에서 빠져야 할 곳이다.
const POINTS: { name: string; at: LngLat }[] = [
  { name: "독립문", at: [126.9578, 37.5742] },
  { name: "서대문형무소역사관", at: [126.9563, 37.5748] },
  { name: "독립문역 부근", at: [126.9577, 37.5748] },
];

export default function MapCheck() {
  const mapEl = useRef<HTMLDivElement>(null);
  const panoEl = useRef<HTMLDivElement>(null);
  const panoRef = useRef<naver.maps.Panorama | null>(null);
  const [ready, setReady] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog((l) => [...l, s]);

  useEffect(() => {
    let cancelled = false;
    let map: naver.maps.Map | undefined;
    let pano: naver.maps.Panorama | undefined;
    const panoContainer = panoEl.current;
    let authFailed = false;
    const onAuthFailure = (event: Event) => {
      authFailed = true;
      panoRef.current = null;
      setReady(false);
      push(`❌ ${(event as CustomEvent<Error>).detail.message}`);
    };
    window.addEventListener("naver-maps-auth-failure", onAuthFailure);
    setReady(false);
    (async () => {
      try {
        await loadNaverMaps();
        if (cancelled) return;
        push("✅ SDK 로드 완료");

        map = new naver.maps.Map(mapEl.current!, { center: toLatLng(POINTS[0].at), zoom: 16 });
        POINTS.forEach((p) => new naver.maps.Marker({ map, position: toLatLng(p.at), title: p.name }));
        new naver.maps.Polyline({ map, path: POINTS.map((p) => toLatLng(p.at)), strokeColor: "#e11d48", strokeWeight: 5 });
        push("✅ 지도·마커·폴리라인 렌더");

        pano = new naver.maps.Panorama(panoContainer!, { position: toLatLng(POINTS[0].at), pov: { pan: 0, tilt: 0, fov: 100 } });
        panoRef.current = pano;
        naver.maps.Event.addListener(pano, "pano_status", (status: string) => push(`파노라마 상태(${current.current}): ${status}`));
        naver.maps.Event.addListener(pano, "init", () => push("✅ 파노라마 init"));
        setReady(true);
      } catch (e) {
        if (!cancelled && !authFailed) push(`❌ ${e instanceof Error ? e.message : e}`);
      }
    })();
    return () => {
      cancelled = true;
      window.removeEventListener("naver-maps-auth-failure", onAuthFailure);
      panoRef.current = null;
      if (window.naver?.maps) {
        if (pano) naver.maps.Event.clearInstanceListeners(pano);
        map?.destroy();
      }
      panoContainer?.replaceChildren();
    };
  }, []);

  const current = useRef(POINTS[0].name);
  const go = (p: (typeof POINTS)[number]) => {
    if (!ready || !panoRef.current) return;
    current.current = p.name;
    try {
      panoRef.current?.setPosition(toLatLng(p.at));
    } catch (e) {
      push(`❌ ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <h1 className="text-lg font-bold">지도·거리뷰 검증</h1>
      <div ref={mapEl} className="h-60 w-full rounded-lg bg-neutral-200" />
      <div className="flex flex-wrap gap-2">
        {POINTS.map((p) => (
          <button key={p.name} disabled={!ready} className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-40" onClick={() => go(p)}>
            {p.name} 거리뷰
          </button>
        ))}
      </div>
      <div ref={panoEl} className="h-60 w-full rounded-lg bg-neutral-200" />
      <pre className="whitespace-pre-wrap rounded-lg bg-neutral-100 p-3 text-xs">{log.join("\n")}</pre>
    </div>
  );
}
