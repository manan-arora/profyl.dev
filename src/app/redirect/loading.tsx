import Image from "next/image";

export default function Loading() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0D0D0D] text-white px-6 overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(199,255,65,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="relative flex flex-col items-center max-w-sm text-center">
        {/* Logo Container with rotating neon border */}
        <div className="relative mb-8 flex items-center justify-center w-24 h-24">
          {/* Pulsing glow background */}
          <div className="absolute inset-0 rounded-full bg-[#c7ff41]/10 blur-xl animate-pulse-neon" />
          
          {/* Circular spinning track */}
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
            <circle
              cx="48"
              cy="48"
              r="44"
              className="stroke-white/[0.03]"
              strokeWidth="2"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              className="stroke-[#c7ff41]"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray="276"
              strokeDashoffset="180"
              strokeLinecap="round"
              style={{
                transformOrigin: "center",
                animation: "spin-slow 2s linear infinite",
              }}
            />
          </svg>
          
          {/* Centered Logo */}
          <div className="relative z-10 flex items-center justify-center bg-[#141414] rounded-full w-20 h-20 border border-white/[0.05]">
            <Image
              src="/profyl-logo.svg"
              alt="Profyl"
              width={36}
              height={36}
              priority
              className="animate-pulse"
            />
          </div>
        </div>

        {/* Text Details */}
        <h1 className="font-display font-medium text-2xl tracking-tight text-white mb-2 animate-rise-in">
          Initializing Session
        </h1>
        <p className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-6 animate-rise-in" style={{ animationDelay: "0.1s" }}>
          Routing to your developer workspace
        </p>

        {/* Status indicator / progress detail */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.04] bg-white/[0.02] font-mono text-[10px] text-[#c7ff41] animate-rise-in" style={{ animationDelay: "0.2s" }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c7ff41] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c7ff41]" />
          </span>
          <span>ESTABLISHING SECURE PROFILE LINK</span>
        </div>
      </div>
    </main>
  );
}
