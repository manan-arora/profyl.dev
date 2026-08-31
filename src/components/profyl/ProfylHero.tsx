import { ProfylPageData } from "@/types/profyl-page";
import { ProfylIdentityCard } from "./ProfylIdentityCard";
import { ProfylEvaluationCard } from "./ProfylEvaluationCard";

export function ProfylHero({ data }: { data: ProfylPageData }) {
  return (
    <section id="hero" className="relative pt-20 pb-10 lg:pt-5 lg:pb-14 bg-[#0D0D0D]">
      {/* Grid background visual treatment */}
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)] pointer-events-none" />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-8 mt-6">
          {/* Left: Identity card */}
          <ProfylIdentityCard data={data} />

          {/* Right: Evaluation card */}
          <ProfylEvaluationCard data={data} />
        </div>
      </div>
    </section>
  );
}
