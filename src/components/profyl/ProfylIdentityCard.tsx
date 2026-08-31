"use client";

import { ProfylPageData } from "@/types/profyl-page";
import { CornerMarkers } from "./ProfylAISummary";
import { Globe, Mail, FileText } from "lucide-react";
import { ProfylContactButton } from "./ProfylContactButton";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const LeetcodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    id="leetcode"
    {...props}
  >
    <path
      d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"
      fill="currentColor"
    />
  </svg>
);

export function ProfylIdentityCard({ data }: { data: ProfylPageData }) {
  const { identity, ai } = data;

  // Extract initials from name for avatar fallback
  const initials = identity.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PR";

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    if (el.scrollWidth > el.clientWidth) {
      el.title = el.textContent || "";
    } else {
      el.removeAttribute("title");
    }
  };

  const row1Items = [];
  if (identity.currentRole) {
    row1Items.push(
      <span
        key="role"
        className="inline-block max-w-[220px] truncate align-bottom"
        onMouseEnter={handleMouseEnter}
      >
        {identity.currentRole}
      </span>
    );
  }
  if (identity.currentCompany) {
    row1Items.push(
      <span
        key="company"
        className="inline-block max-w-[160px] truncate align-bottom"
        onMouseEnter={handleMouseEnter}
      >
        {identity.currentCompany}
      </span>
    );
  }

  if (identity.yearsExperience !== null) {
    const yoeText = `${identity.yearsExperience} YOE`;
    row1Items.push(
      <span
        key="yoe"
        className="inline-block max-w-[50px] truncate align-bottom shrink-0"
        onMouseEnter={handleMouseEnter}
      >
        {yoeText}
      </span>
    );
  }

  const row2Items = [];
  const degreeBranchParts = [];
  if (identity.degree) degreeBranchParts.push(identity.degree);
  if (identity.branch) degreeBranchParts.push(identity.branch);
  const degreeBranchStr = degreeBranchParts.join(" ");

  if (degreeBranchStr) {
    row2Items.push(
      <span
        key="degreeBranch"
        className="inline-block max-w-[120px] truncate align-bottom"
        onMouseEnter={handleMouseEnter}
      >
        {degreeBranchStr}
      </span>
    );
  }
  if (identity.college) {
    row2Items.push(
      <span
        key="college"
        className="inline-block max-w-[150px] truncate align-bottom"
        onMouseEnter={handleMouseEnter}
      >
        {identity.college}
      </span>
    );
  }
  if (identity.graduationYear) {
    row2Items.push(
      <span key="year" className="shrink-0">
        {identity.graduationYear}
      </span>
    );
  }

  return (
    <div className="relative lg:h-full lg:flex lg:flex-col">
      <CornerMarkers />
      <div className="relative bg-[#141414] border hairline scan-line p-8 lg:p-10 flex-1 flex flex-col justify-between gap-6">
        
        {/* Group top elements to avoid sparse spacing when stretched */}
        <div className="flex-1 flex flex-col justify-start">
          {/* Identity */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar / Fallback initials */}
            {identity.avatarUrl ? (
              <img
                src={identity.avatarUrl}
                alt={identity.name}
                className="size-20 min-[360px]:size-24 shrink-0 border-neon border-2 object-cover bg-[#0D0D0D] select-none"
              />
            ) : (
              <div className="size-20 min-[360px]:size-24 shrink-0 border-neon border-2 bg-[#0D0D0D] flex items-center justify-center font-display font-bold text-neon text-3xl neon-text-glow select-none">
                {initials}
              </div>
            )}

            {/* Identity information */}
            <div className="flex-1 min-w-0 w-full">
              <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight text-white break-words">
                {identity.name}
              </h1>

              {row1Items.length === 0 && row2Items.length === 0 ? (
                <div className="font-mono text-xs text-white/40 mt-1 italic">
                  Role, location, and education info not added yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 mt-2">
                  {row1Items.length > 0 && (
                    <div className="font-mono text-xs text-white/55 flex flex-wrap items-center gap-y-1 leading-normal">
                      {row1Items.map((item, index) => (
                        <span key={item.key || index} className="inline-flex items-center min-w-0 shrink-0">
                          {index > 0 && <span className="mx-1.5 text-white/30 select-none shrink-0">·</span>}
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                  {row2Items.length > 0 && (
                    <div className="font-mono text-xs text-white/55 flex flex-wrap items-center gap-y-1 leading-normal">
                      {row2Items.map((item, index) => (
                        <span key={item.key || index} className="inline-flex items-center">
                          {index > 0 && <span className="mx-1.5 text-white/30 select-none">·</span>}
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio block (placed entirely below) */}
          <div className="mt-5">
            {identity.bio ? (
              <div className="font-display italic text-lg text-white/80 leading-snug">
                {identity.bio}
              </div>
            ) : (
              <div className="font-display italic text-lg text-white/40 leading-snug">
                No bio added yet.
              </div>
            )}
          </div>

          {/* AI Signal / Key Insight — full card width */}
          {ai.signal && (
            <div className="relative bg-[#1a1a1a] border hairline p-4 mt-6 select-none shrink-0">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neon mb-1.5">
                ◇ AI Signal
              </div>

              <p className="font-mono text-[11px] leading-relaxed text-white/70">
                {ai.signal}
              </p>
            </div>
          )}

          {/* Tech Stack Chips */}
          {identity.techStack.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5 border-t border-white/5 pt-6 shrink-0">
              {identity.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10px] px-2 py-1 border hairline text-white/75 bg-[#0D0D0D]"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions Block */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-6 shrink-0">
          {/* Row 1: Primary CTAs */}
          {(identity.resumeUrl || identity.email) && (
            <div className="flex flex-wrap items-center gap-3">
              {identity.resumeUrl && (
                <a
                  href={identity.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] font-semibold px-5 py-3 text-sm hover:opacity-90 transition cursor-pointer"
                >
                  <FileText className="size-4" /> View Resume
                </a>
              )}
              {identity.email && (
                <ProfylContactButton email={identity.email} />
              )}
            </div>
          )}

          {/* Row 2: Social Links (Always remains anchored at bottom) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-[11px] text-white/60">
            <div className="flex flex-wrap items-center gap-4">
              {identity.githubUrl && (
                <a
                  href={identity.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--neon)] flex items-center gap-1 transition-colors"
                >
                  <GithubIcon className="size-3" /> github ↗
                </a>
              )}
              {identity.leetcodeUrl && (
                <a
                  href={identity.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--neon)] flex items-center gap-1 transition-colors"
                >
                  <LeetcodeIcon className="size-3" /> leetcode ↗
                </a>
              )}
              {identity.linkedinUrl && (
                <a
                  href={identity.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--neon)] flex items-center gap-1 transition-colors"
                >
                  <LinkedinIcon className="size-3" /> linkedin ↗
                </a>
              )}
              {identity.portfolioUrl && (
                <a
                  href={identity.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--neon)] flex items-center gap-1 transition-colors"
                >
                  <Globe className="size-3" /> site ↗
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
