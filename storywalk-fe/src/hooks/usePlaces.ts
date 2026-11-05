"use client";

import { useQuery } from "@tanstack/react-query";
import { placesApi } from "@/api/places";
import type { MapPin } from "@/api/types";

// 노출 중인 모든 장소(이름·좌표·대표 이미지·방문 집계). GET /map/pins 하나로 받아
// 지도(07)뿐 아니라 장소 이름·이미지 조회(04·06·N3), "여기 없어요" 검색(05)에도 쓴다.
export function usePlaces() {
  return useQuery({ queryKey: ["places"], queryFn: ({ signal }) => placesApi.getMapPins(signal), staleTime: 60_000 });
}

export function usePlace(placeId: number): MapPin | undefined {
  const { data } = usePlaces();
  return data?.find((p) => p.placeId === placeId);
}
