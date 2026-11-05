import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Figma: Input — 높이 55, radius 16, 좌우 16, 14px. 값이 있거나 입력 중이면 테두리가 진해진다.
type InputProps = InputHTMLAttributes<HTMLInputElement> & { right?: React.ReactNode };

export function TextField({ right, className, placeholder = " ", ...rest }: InputProps) {
  return (
    <div
      className={cn(
        "flex h-[55px] w-full items-center gap-2 rounded-control border border-line bg-surface px-4 focus-within:border-fg has-[input:not(:placeholder-shown)]:border-fg",
        className,
      )}
    >
      {/* placeholder가 있어야 :placeholder-shown으로 빈 값을 구분한다 */}
      <input
        className="min-w-0 flex-1 bg-transparent text-body text-fg outline-none placeholder:text-fg-muted"
        placeholder={placeholder}
        {...rest}
      />
      {right}
    </div>
  );
}

// Figma: textarea — radius 16, padding 16, 14px Medium / 1.45
export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-control border border-fg-sub bg-surface p-4 text-body leading-[1.45] font-medium text-fg outline-none placeholder:text-fg-muted focus:border-fg",
        className,
      )}
      {...rest}
    />
  );
}

// 필드 위 라벨 (14px Medium)
export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-body font-medium text-fg">
      {children}
    </label>
  );
}
