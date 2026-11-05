import { cn } from "@/lib/cn";

// Figma: stamp — 방문 도장 이미지. 원본에 여백이 있어 Figma와 같은 비율로 잘라 보여준다.
// 아직 받지 못한 도장은 점선 원 + '?'로 그린다.
export function Stamp({ size, done = true, className }: { size: number; done?: boolean; className?: string }) {
  if (!done) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={cn("flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-line-strong text-body-lg font-bold text-fg-muted", className)}
      >
        ?
      </span>
    );
  }
  return (
    <span aria-hidden style={{ width: size, height: size }} className={cn("relative block shrink-0 overflow-hidden rounded-full", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/stamp.png" alt="" className="absolute top-[-21.69%] left-[-24.9%] h-[152.91%] w-[151.03%] max-w-none" />
    </span>
  );
}
