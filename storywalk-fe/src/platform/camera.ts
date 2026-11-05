import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

// 업로드용 Blob을 돌려준다. 시뮬레이터는 카메라가 없으므로 Prompt(카메라/앨범 선택)를 쓴다.
export async function takePhoto(): Promise<Blob> {
  if (Capacitor.isNativePlatform()) {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      quality: 70,
      width: 1600,
    });
    return (await fetch(photo.webPath!)).blob();
  }
  return pickFileFromInput();
}

function pickFileFromInput(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.onchange = () => (input.files?.[0] ? resolve(input.files[0]) : reject(new Error("사진 선택 취소")));
    input.click();
  });
}
