import Image from "next/image";

export function ProfylFooter() {
  return (
    <footer className="border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/profyl-logo.svg"
              alt="Profyl logo"
              width={24}
              height={24}
              className="size-6 object-contain"
            />
            <span className="font-display font-semibold text-white">profyl</span>
          </div>
          <span className="font-mono text-[10px] text-white/40 sm:ml-2">
            © 2026
          </span>
        </div>
        <div className="font-mono text-[10px] text-white/40">
          Built because a README wasn't enough.
        </div>
      </div>
    </footer>
  );
}
