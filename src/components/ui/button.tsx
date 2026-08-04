import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
          // Variants
          variant === "primary" && "bg-neon text-[#0D0D0D] hover:opacity-90",
          variant === "outline" && "border border-white/10 hover:border-white/20 text-white/50 hover:text-white bg-transparent",
          // Sizes
          size === "default" && "px-5 py-2.5",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-11 px-8",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
