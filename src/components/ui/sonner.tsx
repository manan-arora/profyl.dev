"use client"

import { Toaster as Sonner, toast } from "sonner"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group font-sans"
      style={{
        fontFamily: "var(--font-sans)",
      }}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-mono rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[oklch(0.98_0_0)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 flex gap-3 items-center w-full min-w-[320px] transition-all duration-300",
          description: "group-[.toast]:text-[#8f8f8f] text-sm",
          actionButton:
            "group-[.toast]:bg-[var(--neon)] group-[.toast]:text-[oklch(0.14_0_0)] text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity",
          cancelButton:
            "group-[.toast]:bg-[var(--muted)] group-[.toast]:text-[#8f8f8f] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors",
          success: "group-[.toast]:border-[var(--neon)]/20",
          error: "group-[.toast]:border-[var(--destructive)]/20",
          loading: "group-[.toast]:border-[var(--border)]",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-[#c7ff41] shrink-0 animate-pulse-neon" />,
        error: <AlertCircle className="h-5 w-5 text-[oklch(0.6_0.22_25)] shrink-0" />,
        loading: <Loader2 className="h-5 w-5 text-[#8f8f8f] animate-spin shrink-0" />,
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
