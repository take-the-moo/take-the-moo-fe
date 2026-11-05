// POST /photos는 10MB 이하 jpeg·png·webp만 받는다 (HEIC 불가).
// 그 밖의 형식이거나 너무 크면 긴 변 1600px JPEG로 다시 인코딩해 보낸다.
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 1600;

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function toUploadFile(blob: Blob): Promise<File> {
  if (ACCEPTED.includes(blob.type) && blob.size <= MAX_BYTES) {
    return new File([blob], `photo.${EXT[blob.type]}`, { type: blob.type });
  }
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const jpeg = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지 변환 실패"))), "image/jpeg", 0.85),
  );
  return new File([jpeg], "photo.jpg", { type: "image/jpeg" });
}
