"use client";

import { Mail } from "lucide-react";
import { toast } from "sonner";

interface ProfylContactButtonProps {
  email: string;
}

export function ProfylContactButton({ email }: ProfylContactButtonProps) {
  const handleContactClick = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email)
        .then(() => {
          toast.success("Email copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy email:", err);
          window.location.href = `mailto:${email}`;
        });
    } else {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      onClick={handleContactClick}
      className="inline-flex items-center gap-2 border border-white/15 text-white px-5 py-3 text-sm font-medium hover:border-neon hover:text-neon transition cursor-pointer bg-transparent"
    >
      <Mail className="size-4" /> Contact
    </button>
  );
}
