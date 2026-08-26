import Link from "next/link";
import Image from "next/image";

export function ProfylFooter() {
  return (
    <footer className="border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-2.5">
          <Image
            src="/profyl-logo.svg"
            alt="Profyl logo"
            width={24}
            height={24}
            className="size-6 object-contain"
          />
          <span className="font-display font-semibold text-white">profyl</span>
          <span className="font-mono text-[10px] text-white/40 ml-2">
            © 2026 — Built because a README wasn't enough.
          </span>
        </div>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-widest text-white/55">
          <Link href="/" className="hover:text-neon transition-colors">
            Home
          </Link>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon transition-colors"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
