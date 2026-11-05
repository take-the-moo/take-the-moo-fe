import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Figma: N1 'input' 프레임 — 높이 48, 테두리 #d9d9d9, radius 10, 좌우 14, 14px
type InputProps = InputHTMLAttributes<HTMLInputElement> & { right?: React.ReactNode };

export function TextField({ right, className, ...rest }: InputProps) {
  return (
    <div
      className={cn(
        "flex h-12 w-full items-center gap-2 rounded-field border border-line bg-surface px-3.5 focus-within:border-fg",
        className,
      )}
    >
      <input
        className="min-w-0 flex-1 bg-transparent text-body text-fg outline-none placeholder:text-fg-muted"
        {...rest}
      />
      {right}
    </div>
  );
}

// Figma: N3 '입력' 프레임 — radius 12, padding 14, 14px / 22px. 입력 중엔 테두리가 #262626.
export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-control border border-line bg-surface p-3.5 text-body leading-[22px] text-fg outline-none placeholder:text-fg-muted focus:border-fg",
        className,
      )}
      {...rest}
    />
  );
}

// 필드 위 라벨 (14px Bold)
export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-body font-bold text-fg">
      {children}
    </label>
  );
}
