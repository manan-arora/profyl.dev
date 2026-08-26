import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Projects",
};

export default function DashboardProjectsPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0D0D0D]">
      <div className="border hairline bg-[#141414] p-10 max-w-md text-center rounded relative">
        <span className="absolute size-3 border-neon -top-px -left-px border-t border-l" />
        <span className="absolute size-3 border-neon -bottom-px -right-px border-b border-r" />
        <div className="font-mono text-neon text-[10px] uppercase tracking-[0.2em] mb-4">
          ◇ Projects Curation
        </div>
        <h2 className="font-display font-semibold text-2xl mb-2 text-white">
          Under Construction
        </h2>
        <p className="text-white/55 text-sm leading-relaxed">
          The projects selection and curation tab is currently under development. Please use the Preview tab to review your generated developer report card.
        </p>
      </div>
    </div>
  );
}
