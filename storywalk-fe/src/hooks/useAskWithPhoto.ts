"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { takePhoto } from "@/platform/camera";
import { useCaptureStore } from "@/store/capture";

// 03 "지금 보이는 걸 찍어서 물어보기"·04 "사진으로 묻기" → 사진을 찍고 05 현장 해설로 간다.
// 웹의 파일 선택 창은 사용자 탭 안에서만 열리므로, 05 진입 후가 아니라 버튼 핸들러에서 바로 찍는다.
// 사진 선택을 취소하면 화면을 옮기지 않는다.
export function useAskWithPhoto() {
  const router = useRouter();
  const add = useCaptureStore((s) => s.add);
  const [busy, setBusy] = useState(false);

  const ask = useCallback(async () => {
    setBusy(true);
    try {
      add(await takePhoto());
      router.push("/explain");
    } catch {
      // 취소 또는 권한 거부 — 현재 화면에 그대로 둔다.
    } finally {
      setBusy(false);
    }
  }, [add, router]);

  return { ask, busy };
}
