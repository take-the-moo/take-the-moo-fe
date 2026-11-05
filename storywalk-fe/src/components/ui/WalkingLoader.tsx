import { FootprintIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const STEPS = [0, 1, 2, 3];

// 왼발·오른발이 번갈아 찍히며 오른쪽으로 걸어간다. 옆에 안내 문구가 이미 있는 자리에서는 label을 뺀다.
// large: 화면을 처음 불러올 때 남은 공간 가운데에 크게 놓는다.
export function WalkingLoader({ label, large, className }: { label?: string; large?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        large ? "flex flex-1 flex-col items-center justify-center gap-5 text-body font-medium text-fg-muted" : "inline-flex items-center gap-2.5",
        className,
      )}
    >
      <span aria-hidden className="flex shrink-0">
        {STEPS.map((step) => (
          <FootprintIcon
            key={step}
            className={cn(
              "rotate-90 animate-walk-step text-fg motion-reduce:animate-none",
              large ? "size-10" : "size-4",
              step % 2 ? (large ? "translate-y-2" : "translate-y-[3px]") : cn("-scale-x-100", large ? "-translate-y-2" : "-translate-y-[3px]"),
            )}
            style={{ animationDelay: `${step * 0.3}s` }}
          />
        ))}
      </span>
      {label}
    </span>
  );
}
