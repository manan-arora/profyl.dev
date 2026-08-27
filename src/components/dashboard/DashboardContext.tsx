"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { ProfylPageData, ProfylProject } from "@/types/profyl-page";
import { DetectedTechnology } from "@/lib/analytics/repository-analysis/technologies/technology-types";

export interface DashboardUser {
  id: string;
  githubUsername: string;
  slug: string;
  avatarUrl: string | null;
  name: string | null;
  profileStatus: "INCOMPLETE" | "DRAFT" | "PUBLISHED";
  isLeetcodeVerified: boolean;
}

export interface DashboardProfile {
  name: string | null;
  headline: string | null;
  bio: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;
  location: string | null;
  college: string | null;
  graduationYear: number | null;
  techStack: unknown;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;
}

export interface DashboardRepository {
  id: string;
  name: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  githubUpdatedAt: string | Date;
  isFeatured: boolean;
  displayOrder: number | null;
  customTitle: string | null;
  customDescription: string | null;
  liveDemoUrl: string | null;
  topics: unknown;
  detectedTechnologies?: unknown;
  projectSummary?: string | null;
  githubUrl: string;
  forks?: number | null;
}

export interface LocalProfile {
  name: string;
  headline: string;
  bio: string;
  currentRole: string;
  currentCompany: string;
  yearsExperience: number;
  location: string;
  college: string;
  graduationYear: number;
  branch: string; // local phase 1 state
  techStack: string[];
  linkedinUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
}

export interface LocalRepository {
  id: string;
  name: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  githubUpdatedAt: string | Date;
  isFeatured: boolean;
  displayOrder: number | null;
  customTitle: string | null;
  customDescription: string | null;
  liveDemoUrl: string | null;
  topics: string[];
  detectedTechnologies?: unknown[];
  projectSummary?: string | null;
  githubUrl: string;
  forks: number;
}

export type SaveState = "idle" | "unsaved" | "saving" | "saved";

interface DashboardCtx {
  user: DashboardUser;
  savedData: ProfylPageData;
  localProfile: LocalProfile;
  localProjects: LocalRepository[];
  saveState: SaveState;
  isDirty: boolean;
  activeTab: "profile" | "projects" | "preview";
  profileStatus: "INCOMPLETE" | "DRAFT" | "PUBLISHED";
  updateProfile: (updates: Partial<LocalProfile>) => void;
  updateProject: (id: string, updates: Partial<LocalRepository>) => void;
  toggleFeature: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  saveChanges: () => Promise<void>;
  discardEdits: () => void;
  getLastActiveTab: () => string;
}

const DashboardContext = createContext<DashboardCtx | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

interface DashboardProviderProps {
  children: ReactNode;
  user: DashboardUser;
  initialData: ProfylPageData;
  rawProfile: DashboardProfile | null;
  rawRepositories: DashboardRepository[];
}

export function DashboardProvider({
  children,
  user,
  initialData,
  rawProfile,
  rawRepositories,
}: DashboardProviderProps) {
  const pathname = usePathname();

  // Determine active tab based on route
  const activeTab = useMemo(() => {
    if (pathname.includes("/dashboard/projects")) return "projects";
    if (pathname.includes("/dashboard/preview")) return "preview";
    return "profile";
  }, [pathname]);

  // Keep track of last active edit tab (so guard can redirect back)
  const lastActiveTabRef = useRef<string>("/dashboard/profile");
  useEffect(() => {
    if (activeTab === "profile" || activeTab === "projects") {
      lastActiveTabRef.current = pathname;
    }
  }, [pathname, activeTab]);

  const getLastActiveTab = () => lastActiveTabRef.current;

  // 1. Saved Data & Profile Status States
  const [savedData, setSavedData] = useState<ProfylPageData>(initialData);
  const [profileStatus, setProfileStatus] = useState<"INCOMPLETE" | "DRAFT" | "PUBLISHED">(
    user.profileStatus
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // 2. Unsaved Edits State
  const [localProfile, setLocalProfile] = useState<LocalProfile>(() => ({
    name: rawProfile?.name ?? initialData.identity.name ?? "",
    headline: rawProfile?.headline ?? "",
    bio: rawProfile?.bio ?? initialData.identity.bio ?? "",
    currentRole: rawProfile?.currentRole ?? initialData.identity.currentRole ?? "",
    currentCompany: rawProfile?.currentCompany ?? "",
    yearsExperience: rawProfile?.yearsExperience ?? initialData.identity.yearsExperience ?? 0,
    location: rawProfile?.location ?? initialData.identity.location ?? "",
    college: rawProfile?.college ?? "",
    graduationYear: rawProfile?.graduationYear ?? 0,
    branch: "", // local phase 1 state
    techStack: Array.isArray(rawProfile?.techStack)
      ? (rawProfile.techStack as string[])
      : initialData.identity.techStack || [],
    linkedinUrl: rawProfile?.linkedinUrl ?? initialData.identity.linkedinUrl ?? "",
    portfolioUrl: rawProfile?.portfolioUrl ?? initialData.identity.portfolioUrl ?? "",
    resumeUrl: rawProfile?.resumeUrl ?? initialData.identity.resumeUrl ?? "",
  }));

  const [localProjects, setLocalProjects] = useState<LocalRepository[]>(() =>
    rawRepositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      stars: repo.stars,
      primaryLanguage: repo.primaryLanguage,
      githubUpdatedAt: repo.githubUpdatedAt,
      isFeatured: repo.isFeatured,
      displayOrder: repo.displayOrder,
      customTitle: repo.customTitle,
      customDescription: repo.customDescription,
      liveDemoUrl: repo.liveDemoUrl,
      topics: Array.isArray(repo.topics) ? (repo.topics as string[]) : [],
      detectedTechnologies: Array.isArray(repo.detectedTechnologies)
        ? (repo.detectedTechnologies as unknown[])
        : [],
      projectSummary: repo.projectSummary,
      githubUrl: repo.githubUrl,
      forks: repo.forks ?? 0,
    }))
  );

  // State values representing database baseline
  const [initialProfile, setInitialProfile] = useState<LocalProfile>(() =>
    JSON.parse(JSON.stringify(localProfile))
  );
  const [initialProjects, setInitialProjects] = useState<LocalRepository[]>(() =>
    JSON.parse(JSON.stringify(localProjects))
  );

  // Calculate isDirty directly against the baseline state values
  const isDirty = useMemo(() => {
    const profileChanged = JSON.stringify(localProfile) !== JSON.stringify(initialProfile);
    const projectsChanged = JSON.stringify(localProjects) !== JSON.stringify(initialProjects);
    return profileChanged || projectsChanged;
  }, [localProfile, localProjects, initialProfile, initialProjects]);

  // Derived SaveState
  const saveState = useMemo<SaveState>(() => {
    if (saveStatus === "saving") return "saving";
    if (saveStatus === "saved") return "saved";
    return isDirty ? "unsaved" : "idle";
  }, [saveStatus, isDirty]);

  // State mutators
  const updateProfile = (updates: Partial<LocalProfile>) => {
    setLocalProfile((p) => ({ ...p, ...updates }));
  };

  const updateProject = (id: string, updates: Partial<LocalRepository>) => {
    setLocalProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const toggleFeature = (id: string) => {
    setLocalProjects((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;

      const isFeatured = !target.isFeatured;
      const featuredList = prev.filter((p) => p.isFeatured && p.id !== id);

      if (isFeatured && featuredList.length >= 4) {
        return prev; // Enforce max 4 featured projects limit
      }

      return prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            isFeatured,
            displayOrder: isFeatured ? featuredList.length + 1 : null,
          };
        }
        return p;
      });
    });
  };

  const reorderProjects = (fromIndex: number, toIndex: number) => {
    setLocalProjects((prev) => {
      const featured = prev
        .filter((p) => p.isFeatured)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      const reorderedFeatured = [...featured];
      const [item] = reorderedFeatured.splice(fromIndex, 1);
      reorderedFeatured.splice(toIndex, 0, item);

      // Reassign displayOrder sequentially
      const updatedFeatured = reorderedFeatured.map((p, idx) => ({
        ...p,
        displayOrder: idx + 1,
      }));

      return prev.map((p) => {
        const found = updatedFeatured.find((uf) => uf.id === p.id);
        if (found) return found;
        return p;
      });
    });
  };

  const discardEdits = () => {
    setLocalProfile(JSON.parse(JSON.stringify(initialProfile)));
    setLocalProjects(JSON.parse(JSON.stringify(initialProjects)));
  };

  // Mock saveChanges - Phase 1 only (mutates savedData state locally)
  const saveChanges = async () => {
    setSaveStatus("saving");
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate fake network delay

    // Map local state to canonical ProfylPageData
    const updatedFeaturedProjects: ProfylProject[] = localProjects
      .filter((p) => p.isFeatured)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((p) => ({
        id: p.id,
        name: p.customTitle || p.name,
        description: p.customDescription || p.description,
        stars: p.stars,
        primaryLanguage: p.primaryLanguage,
        detectedTechnologies: Array.isArray(p.detectedTechnologies)
          ? (p.detectedTechnologies as DetectedTechnology[])
          : [],
        topics: p.topics,
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl,
        projectSummary: p.projectSummary || "Technical analysis placeholder summary.",
      }));

    const nextSavedData: ProfylPageData = {
      ...savedData,
      identity: {
        ...savedData.identity,
        ...localProfile,
      },
      projects: updatedFeaturedProjects,
    };

    setSavedData(nextSavedData);

    // Conceptually transition DRAFT status to PUBLISHED on save
    if (profileStatus === "DRAFT") {
      setProfileStatus("PUBLISHED");
    }

    // Sync baseline states to clear dirty status
    setInitialProfile(JSON.parse(JSON.stringify(localProfile)));
    setInitialProjects(JSON.parse(JSON.stringify(localProjects)));

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2200);
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        savedData,
        localProfile,
        localProjects,
        saveState,
        isDirty,
        activeTab,
        profileStatus,
        updateProfile,
        updateProject,
        toggleFeature,
        reorderProjects,
        saveChanges,
        discardEdits,
        getLastActiveTab,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
