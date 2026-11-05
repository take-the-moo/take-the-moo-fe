import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

// 앱: 네이티브 공유 시트(사진 저장·메신저 전송) / 웹: 파일 다운로드
export async function sharePostcard(imageUrl: string) {
  const blob = await (await fetch(imageUrl)).blob();

  if (!Capacitor.isNativePlatform()) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "postcard.png" });
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { uri } = await Filesystem.writeFile({
    path: `postcard-${Date.now()}.png`,
    data: await blobToBase64(blob),
    directory: Directory.Cache,
  });
  await Share.share({ title: "오늘의 서대문 엽서", files: [uri] });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
