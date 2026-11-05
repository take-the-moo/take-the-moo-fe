import { ImageIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

// Figma: WF/ImagePlaceholder — 실제 이미지가 없을 때의 자리. 크기는 className(높이 등)으로 정한다.
export function ImagePlaceholder({ label = "사진", className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-1.5 rounded-control bg-surface-placeholder text-caption font-medium leading-[1.4] text-fg-muted",
        className,
      )}
    >
      <ImageIcon className="text-[#8a8a8a]" />
      {label}
    </div>
  );
}
