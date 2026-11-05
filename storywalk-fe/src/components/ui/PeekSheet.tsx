"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// 지도 아래에 붙는 시트. 부모는 세로 flex이고, 형제(지도)가 flex-1로 남은 높이를 채운다.
// 시트 높이가 변하면 형제 높이가 반대로 변한다: 내리면 머리(PEEK)만 남고, 올리면 위에 keep만큼만 남긴다.
// 손잡이를 끌거나 탭해서 움직인다. head(필터 칩)는 내린 상태에서도 보이고, 본문은 시트 안에서만 스크롤한다.
const PEEK = 105;
const FLICK = 300; // 이 속도(px/s)를 넘으면 위치와 상관없이 튕긴 방향으로 간다
const SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;

type Props = { label: string; head: React.ReactNode; keep: number; children: React.ReactNode };

export function PeekSheet({ label, head, keep, children }: Props) {
  const sheet = useRef<HTMLElement>(null);
  const openRef = useRef(false);
  const panning = useRef(false);
  const panStart = useRef(PEEK);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const height = useMotionValue(PEEK);
  const openHeight = () => (sheet.current?.parentElement?.offsetHeight ?? 0) - keep;

  // 화면 회전 등으로 부모 높이가 바뀌면 올린 상태의 높이를 다시 맞춘다
  useEffect(() => {
    const parent = sheet.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() => {
      if (openRef.current) height.set(parent.offsetHeight - keep);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [height, keep]);

  const snap = (next: boolean) => {
    openRef.current = next;
    setOpen(next);
    animate(height, next ? openHeight() : PEEK, reduceMotion ? { duration: 0 } : SPRING);
  };

  return (
    <motion.section
      ref={sheet}
      aria-label={label}
      style={{ height }}
      className="relative z-10 -mt-[15px] flex shrink-0 flex-col overflow-hidden rounded-t-sheet bg-surface"
    >
      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={label}
        onPanStart={() => {
          panning.current = true;
          height.stop();
          panStart.current = height.get();
        }}
        onPan={(_, { offset }) => height.set(Math.min(openHeight(), Math.max(PEEK, panStart.current - offset.y)))}
        onPanEnd={(_, { velocity }) => {
          if (Math.abs(velocity.y) > FLICK) snap(velocity.y < 0);
          else snap(height.get() > (PEEK + openHeight()) / 2);
        }}
        onClick={() => {
          // 끌기가 끝날 때 따라오는 click은 토글로 치지 않는다
          if (!panning.current) snap(!open);
          panning.current = false;
        }}
        className="flex h-7 shrink-0 cursor-grab touch-none justify-center pt-[7px] select-none"
      >
        <span aria-hidden className="h-[5px] w-9 rounded-[4px] bg-track" />
      </motion.button>
      <div className="shrink-0 px-6 pb-5">{head}</div>
      <div inert={!open} className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain px-6 pb-4">
        {children}
      </div>
    </motion.section>
  );
}
