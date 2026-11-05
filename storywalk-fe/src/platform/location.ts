import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export type LatLng = { lat: number; lng: number };

// 앱: 네이티브 위치 / 웹: 브라우저 geolocation. 1회만 조회한다.
export async function getCurrentPosition(): Promise<LatLng> {
  if (Capacitor.isNativePlatform()) {
    const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    return { lat: p.coords.latitude, lng: p.coords.longitude };
  }
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 },
    ),
  );
}
