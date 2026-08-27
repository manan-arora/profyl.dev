"use client";

import {
  BasicInfoSection,
  ProfessionalSection,
  EducationSection,
  ConnectionsSection,
  ResumeSection,
} from "./ProfileSections";
import TechStackInput from "./TechStackInput";

export default function ProfileEditor() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-10 lg:py-8 space-y-8 select-none">
      {/* Page Introduction Title Info */}
      <div>
      
        <h2 className="mt-4 font-display font-semibold tracking-tight text-3xl text-white">
          Configure your developer identity.
        </h2>
        <p className="mt-2 text-white/55 text-sm max-w-2xl">
          Every field feeds your public Profyl report. Precision beats volume.
        </p>
      </div>

      {/* Editor Cards list */}
      <BasicInfoSection />
      <ProfessionalSection />
      <EducationSection />
      <TechStackInput />
      <ConnectionsSection />
      <ResumeSection />
    </div>
  );
}
