import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// 장소 근처 알림 시연용. 웹에서는 아무 것도 하지 않는다.
export async function notifyNearby(placeId: string, title: string, body: string, delayMs = 3000) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.requestPermissions();
  await LocalNotifications.schedule({
    notifications: [{ id: Date.now() % 100000, title, body, schedule: { at: new Date(Date.now() + delayMs) }, extra: { placeId } }],
  });
}

// 알림 탭 → 화면 이동. 앱 최상단에서 1회 등록한다.
export function onNotificationTap(handler: (placeId: string) => void) {
  if (!Capacitor.isNativePlatform()) return () => {};
  const sub = LocalNotifications.addListener("localNotificationActionPerformed", (e) =>
    handler(e.notification.extra?.placeId),
  );
  return () => void sub.then((s) => s.remove());
}
