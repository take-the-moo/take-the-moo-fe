import { create } from "zustand";

// 이번 실행에서 찍은 사진. 화면 간(05 → 06, 09 사진 고르기) 전달용 일시 상태라 저장하지 않는다.
// 업로드는 POST /photos 연동 시 각 화면에서 Blob을 보낸다. URL은 화면 미리보기에만 쓴다.
type Photo = { url: string; blob: Blob };

type CaptureState = {
  photos: Photo[];
  add: (blob: Blob) => Photo;
};

export const useCaptureStore = create<CaptureState>()((set) => ({
  photos: [],
  add: (blob) => {
    const photo = { url: URL.createObjectURL(blob), blob };
    set((s) => ({ photos: [...s.photos, photo] }));
    return photo;
  },
}));

/** 가장 최근에 찍은 사진 (05 현장 해설·06 결과 상단 이미지) */
export const useLatestPhoto = () => useCaptureStore((s) => s.photos.at(-1) ?? null);
