"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { ProfylPageData } from "@/types/profyl-page";
import {
  saveChangesAction,
  retryDerivedDataPipelineAction,
  checkDashboardFreshnessAction,
} from "@/app/dashboard/actions";
import { toast } from "sonner";
import { SaveProcessingModal } from "./SaveProcessingModal";
import { sanitizeClientError } from "@/lib/errors/safe-error";

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
  branch: string | null;
  degree: string | null;
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
  degree: string;
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
export type RefreshState = "idle" | "refreshing" | "failed";

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
  refreshState: RefreshState;
  refreshError: string | null;
  retryRefresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardCtx | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within DashboardProvider");
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
  const [profileStatus, setProfileStatus] = useState<
    "INCOMPLETE" | "DRAFT" | "PUBLISHED"
  >(user.profileStatus);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const [processingState, setProcessingState] = useState<
    "preparing" | "failed"
  >("preparing");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [refreshState, setRefreshState] = useState<RefreshState>("idle");
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);

  // 2. Unsaved Edits State
  const [localProfile, setLocalProfile] = useState<LocalProfile>(() => ({
    name: rawProfile?.name ?? initialData.identity.name ?? "",
    headline: rawProfile?.headline ?? "",
    bio: rawProfile?.bio ?? initialData.identity.bio ?? "",
    currentRole:
      rawProfile?.currentRole ?? initialData.identity.currentRole ?? "",
    currentCompany:
      rawProfile?.currentCompany ?? initialData.identity.currentCompany ?? "",
    yearsExperience:
      rawProfile?.yearsExperience ?? initialData.identity.yearsExperience ?? 0,
    location: rawProfile?.location ?? initialData.identity.location ?? "",
    college: rawProfile?.college ?? initialData.identity.college ?? "",
    degree: rawProfile?.degree ?? initialData.identity.degree ?? "",
    graduationYear:
      rawProfile?.graduationYear ?? initialData.identity.graduationYear ?? 0,
    branch: rawProfile?.branch ?? initialData.identity.branch ?? "",
    techStack: Array.isArray(rawProfile?.techStack)
      ? (rawProfile.techStack as string[])
      : initialData.identity.techStack || [],
    linkedinUrl:
      rawProfile?.linkedinUrl ?? initialData.identity.linkedinUrl ?? "",
    portfolioUrl:
      rawProfile?.portfolioUrl ?? initialData.identity.portfolioUrl ?? "",
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
    })),
  );

  // State values representing database baseline
  const [initialProfile, setInitialProfile] = useState<LocalProfile>(() =>
    JSON.parse(JSON.stringify(localProfile)),
  );
  const [initialProjects, setInitialProjects] = useState<LocalRepository[]>(
    () => JSON.parse(JSON.stringify(localProjects)),
  );

  // Calculate isDirty directly against the baseline state values
  const isDirty = useMemo(() => {
    const profileChanged =
      JSON.stringify(localProfile) !== JSON.stringify(initialProfile);
    const projectsChanged =
      JSON.stringify(localProjects) !== JSON.stringify(initialProjects);
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
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
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

  const checkFreshness = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setRefreshState("refreshing");
    setRefreshError(null);

    try {
      const response = await checkDashboardFreshnessAction();

      if (!response.success) {
        throw new Error(
          response.error || "Failed to check dashboard freshness",
        );
      }

      if (response.refreshed && response.canonicalData) {
        setSavedData(response.canonicalData);

        const freshProfile = mapRawProfileToLocal(response.rawProfile);
        const freshProjects = mapRawRepositoriesToLocal(
          response.rawRepositories || [],
        );

        // Minimal state merge logic:
        // Update localProfile only on fields that are NOT dirty (equal to initialProfile)
        setLocalProfile((currentLocal) => {
          const merged = { ...currentLocal };
          (Object.keys(currentLocal) as Array<keyof LocalProfile>).forEach(
            (key) => {
              const isDirtyField =
                JSON.stringify(currentLocal[key]) !==
                JSON.stringify(initialProfile[key]);
              if (!isDirtyField) {
                (merged as any)[key] = freshProfile[key];
              }
            },
          );
          return merged;
        });

        // Update localProjects: merge each repository based on ID
        setLocalProjects((currentLocalList) => {
          return freshProjects.map((freshRepo) => {
            const localRepo = currentLocalList.find(
              (r) => r.id === freshRepo.id,
            );
            const initialRepo = initialProjects.find(
              (r) => r.id === freshRepo.id,
            );
            if (!localRepo || !initialRepo) return freshRepo;

            const mergedRepo = { ...freshRepo };
            const editableKeys: Array<keyof LocalRepository> = [
              "isFeatured",
              "displayOrder",
              "customTitle",
              "customDescription",
              "liveDemoUrl",
              "topics",
            ];
            editableKeys.forEach((key) => {
              const isDirtyField =
                JSON.stringify(localRepo[key]) !==
                JSON.stringify(initialRepo[key]);
              if (isDirtyField) {
                (mergedRepo as any)[key] = localRepo[key];
              }
            });
            return mergedRepo;
          });
        });

        // Always update baseline states with refreshed database values
        setInitialProfile(JSON.parse(JSON.stringify(freshProfile)));
        setInitialProjects(JSON.parse(JSON.stringify(freshProjects)));
      }

      setRefreshState("idle");
    } catch (error: any) {
      console.error("Dashboard freshness check failed:", error);
      setRefreshState("failed");
      if (error.message?.includes("GitHub access needs to be reconnected")) {
        setRefreshError(error.message);
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [initialProfile, initialProjects]);

  useEffect(() => {
    checkFreshness();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRawProfileToLocal = (raw: any): LocalProfile => ({
    name: raw?.name ?? "",
    headline: raw?.headline ?? "",
    bio: raw?.bio ?? "",
    currentRole: raw?.currentRole ?? "",
    currentCompany: raw?.currentCompany ?? "",
    yearsExperience: raw?.yearsExperience ?? 0,
    location: raw?.location ?? "",
    college: raw?.college ?? "",
    degree: raw?.degree ?? "",
    graduationYear: raw?.graduationYear ?? 0,
    branch: raw?.branch ?? "",
    techStack: Array.isArray(raw?.techStack) ? (raw.techStack as string[]) : [],
    linkedinUrl: raw?.linkedinUrl ?? "",
    portfolioUrl: raw?.portfolioUrl ?? "",
    resumeUrl: raw?.resumeUrl ?? "",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRawRepositoriesToLocal = (repos: any[]): LocalRepository[] =>
    repos.map((repo) => ({
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
    }));

  // Real saveChanges - calls Server Action and synchronizes client state
  const saveChanges = async () => {
    setSaveStatus("saving");
    setProcessingError(null);

    const projectsChanged =
      JSON.stringify(localProjects) !== JSON.stringify(initialProjects);

    if (projectsChanged) {
      setIsProcessingOpen(true);
      setProcessingState("preparing");
    }

    try {
      const response = await saveChangesAction({
        profile: localProfile,
        projects: localProjects,
        hasProjectChanges: projectsChanged,
      });

      if (!response.success || !response.canonicalData) {
        toast.error(response.error || "Failed to save changes.");
        setSaveStatus("idle");
        setIsProcessingOpen(false);
        return;
      }

      // 1. Set canonical ProfylPageData
      setSavedData(response.canonicalData);

      // 2. Local state synchronized
      if (response.profileStatus) {
        setProfileStatus(response.profileStatus);
      }

      const updatedProfile = mapRawProfileToLocal(response.rawProfile);
      const updatedProjects = mapRawRepositoriesToLocal(
        response.rawRepositories || [],
      );

      setLocalProfile(updatedProfile);
      setLocalProjects(updatedProjects);

      // 3. Sync baseline states to clear dirty status (isDirty = false)
      setInitialProfile(JSON.parse(JSON.stringify(updatedProfile)));
      setInitialProjects(JSON.parse(JSON.stringify(updatedProjects)));

      if (projectsChanged && response.derivedDataFailed) {
        setProcessingState("failed");
        setProcessingError(response.pipelineError || null);
        setSaveStatus("idle");
        toast.warning(
          "Changes saved, but analytics generation failed. Please try again.",
        );
      } else {
        setIsProcessingOpen(false);
        toast.success("Changes saved successfully!");
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2200);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Dashboard save request failed:", error);
      toast.error("Couldn't save your changes. Please try again.");
      setSaveStatus("idle");
      setIsProcessingOpen(false);
    }
  };

  const handleRetry = async () => {
    setProcessingState("preparing");
    setProcessingError(null);

    try {
      const response = await retryDerivedDataPipelineAction();

      if (!response.success || !response.canonicalData) {
        toast.error(
          response.error || "Failed to retry derived data generation.",
        );
        setProcessingState("failed");
        if (response.error?.includes("GitHub access needs to be reconnected")) {
          setProcessingError(response.error);
        }
        return;
      }

      setSavedData(response.canonicalData);

      const updatedProfile = mapRawProfileToLocal(response.rawProfile);
      const updatedProjects = mapRawRepositoriesToLocal(
        response.rawRepositories || [],
      );

      setLocalProfile(updatedProfile);
      setLocalProjects(updatedProjects);

      setInitialProfile(JSON.parse(JSON.stringify(updatedProfile)));
      setInitialProjects(JSON.parse(JSON.stringify(updatedProjects)));

      setIsProcessingOpen(false);
      toast.success("Analytics and AI insights synchronized successfully!");
      setSaveStatus("idle");
    } catch (error: any) {
      const safeMessage = sanitizeClientError(
        error,
        "An unexpected error occurred during retry. Please try again.",
      );
      toast.error(safeMessage);
      setProcessingState("failed");
      if (error?.message?.includes("GitHub access needs to be reconnected")) {
        setProcessingError(error.message);
      }
    }
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
        refreshState,
        refreshError,
        retryRefresh: checkFreshness,
      }}
    >
      {children}
      <SaveProcessingModal
        open={isProcessingOpen}
        state={processingState}
        errorMessage={processingError}
        onRetry={handleRetry}
      />
    </DashboardContext.Provider>
  );
}
