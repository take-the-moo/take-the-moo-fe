import { cn } from "@/lib/cn";

// Figma: radio — 완료는 노란 원 + 체크, 아니면 회색 테두리의 빈 원 (20px)
export function CheckCircle({ done = true, className }: { done?: boolean; className?: string }) {
  if (!done) return <span aria-hidden className={cn("size-5 shrink-0 rounded-full border border-line-strong", className)} />;
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" className={cn("shrink-0", className)}>
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="#FCFF5B" stroke="#1D1D1D" />
      <path d="M6.5 10L9.125 12.625L13.5 7.375" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
