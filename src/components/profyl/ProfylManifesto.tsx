"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function ProfylManifesto() {
  const { isSignedIn } = useAuth();
  const ctaUrl = isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <section className="pt-12 pb-20 border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon mb-8">
          ◇ Manifesto
        </div>
        
        <div className="mt-12 pt-4">
          <p className="font-display font-semibold tracking-[-0.02em] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
            We don't believe in <span className="text-white/30">10x developers.</span> <br />
            We believe in <span className="text-neon italic">visible</span> builders.
          </p>
        </div>
        <div className="mt-16">
          <Link
            href={ctaUrl}
            className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] font-semibold px-6 py-3.5 text-sm hover:opacity-90 transition"
          >
            Create Your Profyl <span className="font-mono">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
