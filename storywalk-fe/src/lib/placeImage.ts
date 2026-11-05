import { getAssetUrl } from "@/api/client";

// 대표 장소는 Figma 시안의 사진을 쓰고, 나머지는 서버(TourAPI) 이미지를 쓴다.
// 실제 장소명 '독립문영천시장'에 두 키가 다 들어 있어 영천시장을 먼저 찾는다.
const LOCAL: [string, string][] = [
  ["영천시장", "/images/place-market.png"],
  ["형무소", "/images/place-prison.png"],
  ["독립문", "/images/place-dongnimmun.png"],
];

export const placeImage = (name?: string, imageUrl?: string | null): string | null =>
  LOCAL.find(([key]) => name?.includes(key))?.[1] ?? (imageUrl ? getAssetUrl(imageUrl) : null);
