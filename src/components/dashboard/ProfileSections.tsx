"use client";

import { useMemo } from "react";
import { useDashboard } from "./DashboardContext";

const inputCls =
  "w-full bg-transparent border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition rounded-none font-mono";

/* ---------- Basic Info Section ---------- */
export function BasicInfoSection() {
  const { localProfile, updateProfile, user } = useDashboard();

  const bioCharLimit = 180;
  const bioLength = localProfile.bio?.length || 0;
  const bioLeft = bioCharLimit - bioLength;

  const initials = useMemo(() => {
    const nameToUse = localProfile.name || user.githubUsername;
    return nameToUse
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PR";
  }, [localProfile.name, user.githubUsername]);

  return (
    <section className="relative border border-white/[0.08] bg-[#111] rounded-none p-6">
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
      <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            Basic Info
          </span>
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row gap-8">
        <div className="shrink-0 flex flex-col items-center">
          {/* Avatar visually matching public profile layout */}
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={localProfile.name || user.githubUsername}
              className="size-20 lg:size-24 shrink-0 border-neon border-2 object-cover bg-[#0D0D0D] select-none rounded-none"
            />
          ) : (
            <div className="size-20 lg:size-24 shrink-0 border-neon border-2 bg-[#0D0D0D] flex items-center justify-center font-display font-bold text-neon text-3xl neon-text-glow select-none rounded-none">
              {initials}
            </div>
          )}
          <p className="mt-3 font-mono text-[9px] text-white/30 text-center max-w-[120px]">
            Avatar managed via Clerk Profile
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
              Full Name
            </span>
            <input
              type="text"
              value={localProfile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
              Headline / Title
            </span>
            <input
              type="text"
              value={localProfile.headline}
              onChange={(e) => updateProfile({ headline: e.target.value })}
              className={inputCls}
              placeholder="e.g. Senior Platform Engineer"
            />
          </label>

          <label className="block md:col-span-2">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                Bio
              </span>
              <span
                className={`font-mono text-[10px] ${
                  bioLeft < 0 ? "text-red-500 font-bold" : bioLeft < 20 ? "text-neon" : "text-white/30"
                }`}
              >
                {bioLeft} chars left
              </span>
            </div>
            <textarea
              rows={3}
              value={localProfile.bio}
              maxLength={bioCharLimit + 20} // Allow typing slightly over to show red error
              onChange={(e) => updateProfile({ bio: e.target.value })}
              className={`w-full bg-transparent border px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:bg-white/[0.02] transition resize-none rounded-none font-mono ${
                bioLength > bioCharLimit
                  ? "border-red-500"
                  : "border-white/[0.08] focus:border-neon/60"
              }`}
              placeholder="Write a catchy, witty bio that tells people who you are beyond code."
            />
            {bioLength > bioCharLimit && (
              <p className="mt-1 text-red-500 font-mono text-[9px] uppercase tracking-wider">
                ⚠ Bio exceeds 180-character product limit!
              </p>
            )}
          </label>
        </div>
      </div>
    </section>
  );
}

/* ---------- Professional Section ---------- */
export function ProfessionalSection() {
  const { localProfile, updateProfile } = useDashboard();

  const handleYearsChange = (val: string) => {
    // Keep only numeric values
    const cleanValue = val.replace(/\D/g, "");
    updateProfile({ yearsExperience: cleanValue === "" ? 0 : parseInt(cleanValue) });
  };

  return (
    <section className="relative border border-white/[0.08] bg-[#111] rounded-none p-6">
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
      <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            Professional
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
            Current Role
          </span>
          <input
            type="text"
            value={localProfile.currentRole}
            onChange={(e) => updateProfile({ currentRole: e.target.value })}
            className={inputCls}
            placeholder="e.g. Backend Engineer"
          />
        </label>

        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
            Current Company
          </span>
          <input
            type="text"
            value={localProfile.currentCompany}
            onChange={(e) => updateProfile({ currentCompany: e.target.value })}
            className={inputCls}
            placeholder="e.g. Vercel (Independent if freelance)"
          />
        </label>

        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
            Years of Experience (YOE)
          </span>
          <input
            type="text"
            value={localProfile.yearsExperience === 0 ? "0" : (localProfile.yearsExperience || "")}
            onChange={(e) => handleYearsChange(e.target.value)}
            className={inputCls}
            placeholder="e.g. 5"
          />
        </label>
      </div>
    </section>
  );
}

/* ---------- Education Section ---------- */
export function EducationSection() {
  const { localProfile, updateProfile } = useDashboard();

  const handleYearChange = (val: string) => {
    const cleanValue = val.replace(/\D/g, "");
    updateProfile({ graduationYear: cleanValue === "" ? 0 : parseInt(cleanValue) });
  };

  return (
    <section className="relative border border-white/[0.08] bg-[#111] rounded-none p-6">
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
      <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            Education
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
            College / University
          </span>
          <input
            type="text"
            value={localProfile.college}
            onChange={(e) => updateProfile({ college: e.target.value })}
            className={inputCls}
            placeholder="e.g. Stanford University"
          />
        </label>

        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
            Branch / Major
          </span>
          <input
            type="text"
            value={localProfile.branch}
            onChange={(e) => updateProfile({ branch: e.target.value })}
            className={inputCls}
            placeholder="e.g. Computer Science"
          />
        </label>

        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
            Graduation Year
          </span>
          <input
            type="text"
            value={localProfile.graduationYear || ""}
            onChange={(e) => handleYearChange(e.target.value)}
            className={inputCls}
            placeholder="e.g. 2026"
          />
        </label>
      </div>
    </section>
  );
}

/* ---------- External Connections Section ---------- */
export function ConnectionsSection() {
  const { localProfile, updateProfile } = useDashboard();

  return (
    <section className="relative border border-white/[0.08] bg-[#111] rounded-none p-6">
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
      <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            Accounts & Socials
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
            Auto-Connected Accounts
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between border border-white/[0.08] px-4 py-3 bg-white/[0.02] rounded-none">
              <div className="flex items-center gap-3">
                <div className="size-8 border border-white/[0.08] flex items-center justify-center font-mono text-[10px] text-neon bg-black rounded-none">
                  GH
                </div>
                <div>
                  <div className="text-sm font-semibold">GitHub</div>
                  <div className="font-mono text-[10px] text-white/40">Connected</div>
                </div>
              </div>
              <span className="border border-neon/30 px-2 py-0.5 font-mono text-[8px] tracking-[0.18em] text-neon bg-neon/5 rounded-none">
                VERIFIED
              </span>
            </div>

            <div className="flex items-center justify-between border border-white/[0.08] px-4 py-3 bg-white/[0.02] rounded-none">
              <div className="flex items-center gap-3">
                <div className="size-8 border border-white/[0.08] flex items-center justify-center font-mono text-[10px] text-neon bg-black rounded-none">
                  LC
                </div>
                <div>
                  <div className="text-sm font-semibold">LeetCode</div>
                  <div className="font-mono text-[10px] text-white/40">Connected</div>
                </div>
              </div>
              <span className="border border-neon/30 px-2 py-0.5 font-mono text-[8px] tracking-[0.18em] text-neon bg-neon/5 rounded-none">
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
            Manual Custom Links
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
                LinkedIn URL
              </span>
              <input
                type="url"
                value={localProfile.linkedinUrl}
                onChange={(e) => updateProfile({ linkedinUrl: e.target.value })}
                className={inputCls}
                placeholder="https://linkedin.com/in/username"
              />
            </label>

            <label className="block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
                Portfolio / Personal Website
              </span>
              <input
                type="url"
                value={localProfile.portfolioUrl}
                onChange={(e) => updateProfile({ portfolioUrl: e.target.value })}
                className={inputCls}
                placeholder="https://yourname.dev"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Resume Section ---------- */
export function ResumeSection() {
  const { localProfile } = useDashboard();

  return (
    <section className="relative border border-white/[0.08] bg-[#111] rounded-none p-6">
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
      <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            Resume
          </span>
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center gap-5 justify-between border border-white/[0.08] p-4 bg-white/[0.01] rounded-none">
        <div className="flex items-center gap-4">
          <div className="size-11 border border-white/[0.08] flex items-center justify-center font-mono text-[10px] text-neon bg-black rounded-none">
            PDF
          </div>
          <div>
            <div className="text-sm font-semibold">
              {localProfile.resumeUrl ? "developer-resume.pdf" : "No resume uploaded yet."}
            </div>
            <div className="font-mono text-[9px] text-white/40 mt-0.5">
              {localProfile.resumeUrl
                ? "240 KB · Cloudinary persistent storage"
                : "PDF only · Max size 5MB"}
            </div>
          </div>
          {localProfile.resumeUrl && (
            <span className="border border-neon/30 px-2 py-0.5 font-mono text-[8px] tracking-[0.18em] text-neon bg-neon/5 rounded-none">
              VERIFIED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="border border-white/[0.08] px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition rounded-none cursor-pointer font-mono"
          >
            Upload PDF
          </button>
          {localProfile.resumeUrl && (
            <button
              type="button"
              className="border border-transparent px-3 py-2 text-xs text-white/45 hover:text-white transition rounded-none cursor-pointer font-mono"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <p className="mt-4 font-mono text-[9px] text-white/30">
        * Persistent Cloudinary storage and resume parsing will be fully integrated in the next phase.
      </p>
    </section>
  );
}
