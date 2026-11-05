"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// 지도 아래에 붙는 시트. 부모는 세로 flex이고, 형제(지도)가 flex-1로 남은 높이를 채운다.
// 시트 높이가 변하면 형제 높이가 반대로 변한다: 내리면 머리(PEEK)만 남고, 올리면 위에 keep만큼만 남긴다.
// 머리를 끌거나 탭해서 움직이고, 본문은 시트 안에서만 스크롤한다.
const PEEK = 64;
const FLICK = 300; // 이 속도(px/s)를 넘으면 위치와 상관없이 튕긴 방향으로 간다
const SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;

export function PeekSheet({ title, keep, children }: { title: string; keep: number; children: React.ReactNode }) {
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
      aria-label={title}
      style={{ height }}
      className="flex shrink-0 flex-col overflow-hidden rounded-t-sheet border-t border-line-subtle bg-surface"
    >
      <motion.button
        type="button"
        aria-expanded={open}
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
        className="flex h-16 shrink-0 cursor-grab touch-none flex-col select-none items-center gap-3 px-5 pt-2"
      >
        <span aria-hidden className="h-1 w-10 rounded-[2px] bg-line" />
        <span className="w-full truncate text-left text-label leading-[1.45] font-bold text-fg">{title}</span>
      </motion.button>
      <div inert={!open} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 pb-4">
        {children}
      </div>
    </motion.section>
  );
}
