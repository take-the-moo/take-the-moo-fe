"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { PostcardFly } from "@/components/ui";

const WAIT_MS = 4000; // 지도가 이 안에 뜨지 않으면 포기하고 치운다
const LANDED_SCALE = 0.12;

// 공유한 엽서가 화면 가운데에 머물다가 지도의 해당 핀으로 빨려 들어간다.
// 핀은 지도 SDK가 나중에 그려서 화면 전환으로는 잇지 못한다. 결과 화면 → 가운데는 PostcardFly가, 가운데 → 핀은 여기서 맡는다.
export function PostcardFlyIn({ src, pinId, onDone }: { src: string; pinId?: string; onDone: () => void }) {
  const image = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;
    let stop: (() => void) | undefined;

    const seek = () => {
      const pin = pinId ? document.querySelector(`[data-pin-id="${pinId}"]`) : null;
      if (!pin && performance.now() - startedAt < WAIT_MS) {
        frame = requestAnimationFrame(seek);
        return;
      }
      if (!pin || !image.current || reduced) {
        onDone();
        return;
      }
      const from = image.current.getBoundingClientRect();
      const to = pin.getBoundingClientRect();
      const controls = animate(
        image.current,
        {
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          y: to.top + to.height / 2 - (from.top + from.height / 2),
          scale: LANDED_SCALE,
        },
        { delay: 0.4, duration: 0.6, ease: [0.55, 0, 0.85, 0.35], onComplete: onDone },
      );
      stop = () => controls.stop();
    };
    seek();

    return () => {
      cancelAnimationFrame(frame);
      stop?.();
    };
  }, [pinId, reduced, onDone]);

  return (
    <PostcardFly>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={image}
        src={src}
        alt=""
        className="pointer-events-none fixed top-[18%] left-[calc(50%-90px)] z-50 aspect-[2/3] w-[180px] rounded-[3px] border border-[#1f1f1e] object-cover"
      />
    </PostcardFly>
  );
}
