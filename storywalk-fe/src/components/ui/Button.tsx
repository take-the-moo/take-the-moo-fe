import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Figma: WF/Button/Primary · WF/Button/Secondary, 하단 텍스트 링크("건너뛰기")
type Variant = "primary" | "secondary" | "text";

const variantClass: Record<Variant, string> = {
  primary: "h-[52px] w-full rounded-control bg-primary text-body-lg font-bold text-on-primary",
  secondary: "h-[52px] w-full rounded-control border border-line-strong bg-surface text-body-lg font-bold text-fg",
  text: "w-full text-body font-medium text-fg-sub underline underline-offset-2",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", type = "button", className, ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center leading-[1.4] transition-opacity active:opacity-80 disabled:opacity-40",
        variantClass[variant],
        className,
      )}
      {...rest}
    />
  );
}
