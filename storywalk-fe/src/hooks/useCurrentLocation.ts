"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentPosition, type LatLng } from "@/platform/location";

// 화면 진입 시 위치를 한 번 받는다 (03 추천·05 근처 장소가 같이 쓴다). 지속 추적하지 않고 저장하지 않는다.
// 거부·실패면 null — 서버가 기본 역(독립문) 기준으로 동작한다.
export function useCurrentLocation() {
  return useQuery<LatLng | null>({
    queryKey: ["location"],
    queryFn: () => getCurrentPosition().catch(() => null),
    staleTime: 5 * 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });
}
