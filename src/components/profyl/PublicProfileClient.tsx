"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProfylPage } from "./ProfylPage";
import { ProfylPageData } from "@/types/profyl-page";
import { toast } from "@/components/ui/sonner";

interface PublicProfileClientProps {
  initialData: ProfylPageData;
  slug: string;
}

export async function refreshPublicProfileData(
  slug: string,
  onData: (data: ProfylPageData) => void,
  onRetry: () => void,
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/public-profile/${encodeURIComponent(slug)}/refresh`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Profile refresh failed");
    }

    const freshData = (await response.json()) as ProfylPageData;
    onData(freshData);
    toast.success("Profyl updated just now", { position: "top-center" });
    return true;
  } catch {
    toast.error("Profile data couldn’t update. The data may be outdated.", {
      position: "top-center",
      action: {
        label: "Try again",
        onClick: onRetry,
      },
    });
    return false;
  }
}

export function PublicProfileClient({
  initialData,
  slug,
}: PublicProfileClientProps) {
  const [data, setData] = useState(initialData);
  const refreshRef = useRef<() => Promise<boolean>>(() =>
    Promise.resolve(false),
  );

  const refresh = useCallback(async () => {
    const refreshed = await refreshPublicProfileData(slug, setData, () => {
      void refreshRef.current();
    });
    return refreshed;
  }, [refreshRef, slug]);

  useEffect(() => {
    refreshRef.current = refresh;
    const refreshTimer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [refresh]);

  return (
    <>
      <ProfylPage data={data} mode="public" />
    </>
  );
}
