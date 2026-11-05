// 네이버 지도 JS SDK 로더. .env.local의 NEXT_PUBLIC_NAVER_MAP_KEY_ID(Maps Application Client ID)를 쓴다.
// 지도·파노라마만 이 파일을 거친다. 좌표 순서 변환([lng,lat] ↔ LatLng)도 여기서만 한다.

declare global {
  interface Window {
    naver?: typeof naver;
    navermap_authFailure?: () => void;
    __naverMapsReady?: () => void;
    __naverMapsLoading?: Promise<void>;
  }
}

const KEY_ID = process.env.NEXT_PUBLIC_NAVER_MAP_KEY_ID;

// SDK는 스크립트가 다시 주입되면 naver.maps를 비우고 재로드한다.
// 개발 중 Fast Refresh로 이 모듈이 재평가돼도 중복 주입되지 않도록,
// 로딩 상태는 모듈 변수가 아니라 window에 둔다.
const isReady = () => typeof window !== "undefined" && Boolean(
  window.naver?.maps?.Map && window.naver?.maps?.LatLng && window.naver?.maps?.Panorama,
);

// 바탕 지도가 지원하는 언어. 베트남어·몽골어 등은 영어로 보여준다.
const MAP_LANGUAGES: readonly string[] = ["ko", "en", "zh", "ja"];

// 언어는 SDK를 처음 불러올 때만 정해진다. 이후 언어를 바꾸면 새로고침해야 바탕 지도에 반영된다.
export function loadNaverMaps(lang?: string | null): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("브라우저에서만 로드 가능"));
  if (!KEY_ID) return Promise.reject(new Error(".env.local의 NEXT_PUBLIC_NAVER_MAP_KEY_ID(Maps Client ID) 설정 후 dev 서버 재시작"));
  if (isReady()) return Promise.resolve();
  if (window.__naverMapsLoading) return window.__naverMapsLoading;

  window.__naverMapsLoading = new Promise<void>((resolve, reject) => {
    // 인증 실패(Web 서비스 URL 불일치 등)는 이 전역 콜백으로 알려준다
    window.navermap_authFailure = () => {
      window.__naverMapsLoading = undefined;
      const error = new Error("네이버 지도 이용 실패: Maps Client ID·등록 URL·서비스 활성화와 콘솔 오류 코드 확인");
      // 인증 응답은 SDK 로드 완료 뒤에도 도착할 수 있다.
      window.dispatchEvent(new CustomEvent("naver-maps-auth-failure", { detail: error }));
      reject(error);
    };
    // 서브모듈(panorama)은 메인 스크립트 onload 이후 비동기로 로드된다.
    // script.onload에서 resolve하면 naver.maps.Panorama가 아직 없으므로 callback 파라미터로 완료를 받는다.
    window.__naverMapsReady = () => {
      if (!isReady()) {
        window.__naverMapsLoading = undefined;
        reject(new Error("네이버 지도 SDK 초기화 실패"));
        return;
      }
      resolve();
    };
    const s = document.createElement("script");
    const language = !lang ? "ko" : MAP_LANGUAGES.includes(lang) ? lang : "en";
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${KEY_ID}&language=${language}&submodules=panorama&callback=__naverMapsReady`;
    s.async = true;
    s.onerror = () => {
      window.__naverMapsLoading = undefined;
      reject(new Error("SDK 스크립트 로드 실패 (네트워크/CSP)"));
    };
    document.head.appendChild(s);
  });
  return window.__naverMapsLoading;
}

// 경로 데이터는 [경도, 위도]. 네이버 LatLng는 (위도, 경도)라서 여기서만 뒤집는다.
export type LngLat = [lng: number, lat: number];
export const toLatLng = ([lng, lat]: LngLat) => {
  if (!isReady()) throw new Error("네이버 지도 SDK가 아직 준비되지 않음 (loadNaverMaps 완료 후 호출)");
  return new naver.maps.LatLng(lat, lng);
};
