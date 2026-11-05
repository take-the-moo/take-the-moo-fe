import { cn } from "@/lib/cn";

// Figma: 05 '이 사진은 어디인가요?'의 row — 라디오 + 제목 + 보조 문구.
// 라디오 그룹 안에서 쓰며, 선택 시 테두리가 굵고 진해진다.
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
      className={cn(
        "flex w-full items-center gap-3 rounded-control bg-surface px-3.5 py-3 text-left",
        selected ? "border-2 border-fg" : "border border-line",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-5 shrink-0 rounded-full bg-surface",
          selected ? "border-[6px] border-ink" : "border-[1.5px] border-fg-disabled",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
        <span className={cn("truncate text-[15px] text-fg", selected ? "font-bold" : "font-medium")}>{title}</span>
        {sub && <span className="text-caption text-fg-muted">{sub}</span>}
      </span>
    </button>
  );
}
