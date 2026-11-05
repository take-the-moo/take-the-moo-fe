import { ViewTransition } from "react";

export const POSTCARD_FLY = "postcard-fly";

// 엽서 결과의 이미지와 지도 위 날아가는 엽서(PostcardFlyIn)를 한 쌍으로 묶어 화면이 바뀌어도 이어져 보이게 한다.
// POSTCARD_FLY 타입으로 이동할 때만 동작하고, 다른 이동에서는 아무 일도 없다.
export function PostcardFly({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition name={POSTCARD_FLY} share={{ [POSTCARD_FLY]: POSTCARD_FLY, default: "none" }} default="none">
      {children}
    </ViewTransition>
  );
}
