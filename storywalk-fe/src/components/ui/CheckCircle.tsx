import { cn } from "@/lib/cn";

// Figma 곳곳의 '✓ 원' — 진행 단계(16), 엽서 상태(18), 사진 선택(20), 도장 칸(30).
// done=false면 회색 테두리의 빈 원(진행 단계) 또는 '?' 원(아직 못 받은 도장)이 된다.
type Props = { size: number; done?: boolean; pending?: "empty" | "question"; className?: string };

export function CheckCircle({ size, done = true, pending = "empty", className }: Props) {
  const fontSize = Math.round(size * 0.4);
  if (done) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size, fontSize }}
        className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-bold text-on-primary", className)}
      >
        ✓
      </span>
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-fg-disabled bg-surface font-bold text-fg-disabled",
        pending === "question" && "border-line-strong",
        className,
      )}
    >
      {pending === "question" ? "?" : null}
    </span>
  );
}
