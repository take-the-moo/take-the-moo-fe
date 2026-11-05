"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const MS_PER_CHAR = 30;
const MAX_MS = 3000; // 긴 해설도 이 안에 끝낸다

// 끝까지 친 글은 화면에 돌아와도 다시 치지 않는다.
const typed = new Set<string>();

// 서버가 만든 글을 타자 치듯 보여준다. 아직 안 나온 글자도 투명하게 깔아서 줄바꿈이 흔들리지 않고 스크린리더는 전체를 읽는다.
export function TypingText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const instant = reduced || typed.has(text);

  useEffect(() => {
    if (instant) return;
    const length = [...text].length;
    const controls = animate(0, length, {
      duration: Math.min(length * MS_PER_CHAR, MAX_MS) / 1000,
      ease: "linear",
      onUpdate: (value) => setCount(Math.floor(value)),
      onComplete: () => typed.add(text),
    });
    return () => controls.stop();
  }, [text, instant]);

  const chars = [...text]; // 코드 포인트 단위라 이모지가 반으로 잘리지 않는다
  if (instant || count >= chars.length) return text;

  return (
    <>
      {chars.slice(0, count).join("")}
      <span aria-hidden className="absolute h-[1.1em] w-0.5 animate-caret bg-current" />
      <span className="opacity-0">{chars.slice(count).join("")}</span>
    </>
  );
}
