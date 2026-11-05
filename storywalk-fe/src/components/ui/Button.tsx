import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Figma: Button Primary · button6(테두리) · Disabled, 하단 텍스트 링크
type Variant = "primary" | "secondary" | "text";

const variantClass: Record<Variant, string> = {
  primary: "h-[55px] w-full rounded-control bg-primary text-body-lg font-medium text-point disabled:bg-line disabled:text-fg-muted",
  secondary: "h-[55px] w-full rounded-control border border-primary bg-surface text-body-lg font-medium text-fg disabled:opacity-40",
  text: "w-full text-body font-medium text-fg-sub underline underline-offset-2 disabled:opacity-40",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", type = "button", className, ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center leading-[1.4] transition-opacity active:opacity-80",
        variantClass[variant],
        className,
      )}
      {...rest}
    />
  );
}
