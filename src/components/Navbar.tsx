import Image from "next/image";
import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const NAV = [
  { label: "Product", href: "#" },
  { label: "Signals", href: "#" },
  { label: "Insights", href: "#" },
  { label: "Manifesto", href: "#" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b hairline bg-[#0D0D0D]/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/profyl-logo.svg"
            alt="Profyl logo"
            width={28}
            height={28}
            priority
            className="size-7 object-contain"
          />

          <span className="font-display font-semibold tracking-tight text-lg">
            profyl
          </span>

          <span className="font-mono text-[10px] text-neon ml-1 mt-0.5">
            v1.0
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors"
            >
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="bg-neon text-[#0D0D0D] text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
            >
              Get Profyl →
            </Link>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}