import Link from "next/link";

export default function DemoDummyPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="border border-white/[0.08] bg-[#141414] p-10 max-w-md w-full text-center relative scan-line">
        <span className="absolute size-3 border-neon -top-px -left-px border-t border-l" />
        <span className="absolute size-3 border-neon -bottom-px -right-px border-b border-r" />

        <div className="font-mono text-neon text-[10px] uppercase tracking-[0.2em] mb-4">
          ◇ Demo Navigation
        </div>
        <h1 className="font-display font-semibold text-2xl mb-2 text-white">
          This is a dummy link
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          You are viewing a static sandbox demo profile. External links are disabled in demo mode.
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] font-semibold px-5 py-3 text-sm hover:opacity-90 transition w-full justify-center"
        >
          Return to Demo Profile
        </Link>
      </div>
    </div>
  );
}
