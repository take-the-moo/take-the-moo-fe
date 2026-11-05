import { create } from "zustand";
import { photosApi } from "@/api/photos";
import { toUploadFile } from "@/lib/image";

// 이번 실행에서 찍은 사진. 화면 간(05 → 06, 09 사진 고르기) 전달용 일시 상태라 저장하지 않는다.
// 업로드(POST /photos)는 한걸음·엽서처럼 photoId가 필요할 때 한 번만 하고 결과를 여기 둔다.
// placeId는 05에서 고른 장소다 (엽서 제목의 장소로 쓰인다).
export type CapturedPhoto = { url: string; blob: Blob; placeId?: number; photoId?: string };

type CaptureState = {
  photos: CapturedPhoto[];
  add: (blob: Blob) => CapturedPhoto;
  /** 사진을 찍은 장소를 기록한다 (아직 올리지 않은 사진만) */
  tagPlace: (url: string, placeId: number) => void;
  /** 올린 뒤 photoId를 기록해 다시 올리지 않는다 */
  markUploaded: (url: string, photoId: string) => void;
};

export const useCaptureStore = create<CaptureState>()((set) => ({
  photos: [],
  add: (blob) => {
    const photo = { url: URL.createObjectURL(blob), blob };
    set((s) => ({ photos: [...s.photos, photo] }));
    return photo;
  },
  tagPlace: (url, placeId) =>
    set((s) => ({ photos: s.photos.map((p) => (p.url === url && !p.photoId ? { ...p, placeId } : p)) })),
  markUploaded: (url, photoId) =>
    set((s) => ({ photos: s.photos.map((p) => (p.url === url ? { ...p, photoId } : p)) })),
}));

/** 가장 최근에 찍은 사진 (05 현장 해설·06 결과 상단 이미지) */
export const useLatestPhoto = () => useCaptureStore((s) => s.photos.at(-1) ?? null);

/** 찍은 사진을 올리고 photoId를 돌려준다. 이미 올린 사진은 저장된 photoId를 쓴다. */
export async function uploadCapturedPhoto(photo: CapturedPhoto, userId: string): Promise<string> {
  const current = useCaptureStore.getState().photos.find((p) => p.url === photo.url) ?? photo;
  if (current.photoId) return current.photoId;
  const uploaded = await photosApi.upload({ file: await toUploadFile(current.blob), userId, placeId: current.placeId });
  useCaptureStore.getState().markUploaded(current.url, uploaded.photoId);
  return uploaded.photoId;
}
