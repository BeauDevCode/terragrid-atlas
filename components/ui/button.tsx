import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-300 text-slate-950 shadow-glow hover:bg-cyan-200 focus-visible:ring-cyan-300",
  secondary:
    "border border-cyan-200/20 bg-slate-900/80 text-slate-100 hover:border-cyan-200/45 hover:bg-slate-800/90 focus-visible:ring-cyan-300",
  ghost: "text-slate-200 hover:bg-white/8 focus-visible:ring-cyan-300",
  danger:
    "border border-orange-300/25 bg-orange-500/12 text-orange-100 hover:bg-orange-500/20 focus-visible:ring-orange-300"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
  icon: "h-9 w-9 p-0"
};

export function Button({ className, variant = "secondary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
