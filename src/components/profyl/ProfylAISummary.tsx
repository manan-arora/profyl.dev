import { ProfylPageData } from "@/types/profyl-page";

export function CornerMarkers() {
  const base = "absolute size-3 border-neon pointer-events-none";
  return (
    <>
      <span className={`${base} -top-px -left-px border-t border-l`} />
      <span className={`${base} -top-px -right-px border-t border-r`} />
      <span className={`${base} -bottom-px -left-px border-b border-l`} />
      <span className={`${base} -bottom-px -right-px border-b border-r`} />
    </>
  );
}

export function SectionHeader({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-end">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon mb-4">
          {tag}
        </div>
        <h2 className="font-display font-semibold tracking-tight text-4xl lg:text-5xl leading-[0.95] text-white">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-white/60 text-lg leading-relaxed max-w-md">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function renderHighlightedSummary(summary: string) {
  const parts = summary.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={index} className="text-neon">
          {part.slice(2, -2)}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export function ProfylAISummary({ data }: { data: ProfylPageData }) {
  if (!data.ai.summary && data.ai.evidence.length === 0 && data.ai.strengthChips.length === 0) {
    return null;
  }

  return (
    <section className="pt-12 pb-20 border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ PROFYL SYNTHESIS" title="What the signals reveal" />
        <div className="relative mt-10">
          <CornerMarkers />
          <div className="relative bg-[#141414] border hairline p-8 lg:p-12">
            <div className="flex items-center justify-between mb-6 pb-4 border-b hairline">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
                  ◇ Profyl AI
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  Synthesized from 4 sources
                </span>
              </div>
            </div>

            {/* AI Summary Paragraph */}
            {data.ai.summary && (
              <p className="font-display text-2xl lg:text-3xl font-medium tracking-tight leading-snug text-white/90 max-w-5xl">
                {renderHighlightedSummary(data.ai.summary)}
              </p>
            )}

            {/* AI Evidence List */}
            {data.ai.evidence.length > 0 && (
              <div className="mt-6 space-y-2 border-t border-white/5 pt-6 max-w-3xl">
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3">
                  Quantitative Supporting Evidence:
                </div>
                {data.ai.evidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-white/70 font-mono text-sm leading-relaxed"
                  >
                    <span className="text-neon mt-1">◇</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Strength Chips */}
            {data.ai.strengthChips.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                {data.ai.strengthChips.map((chip) => (
                  <span
                    key={chip}
                    className="font-mono text-[10px] px-2 py-1 border-neon border text-neon uppercase tracking-wide"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
