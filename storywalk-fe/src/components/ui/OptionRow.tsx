import { cn } from "@/lib/cn";
import { CheckCircle } from "./CheckCircle";

// Figma: option selected · default — 라디오 + 제목 + 보조 문구. 라디오 그룹 안에서 쓴다.
type Props = {
  title: string;
  sub?: string;
  selected: boolean;
  onSelect: () => void;
};

export function OptionRow({ title, sub, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn("flex w-full items-center gap-3 rounded-control border bg-surface p-4 text-left", selected ? "border-primary" : "border-line")}
    >
      <CheckCircle done={selected} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-body font-bold text-fg">{title}</span>
        {sub && <span className="text-caption font-medium text-fg-muted">{sub}</span>}
      </span>
    </button>
  );
}
