import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshPublicProfile } from "@/lib/services/public-profile-refresh.service";

interface PublicProfileRefreshRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: Request,
  { params }: PublicProfileRefreshRouteContext,
) {
  const { slug } = await params;
  const user = await prisma.user.findUnique({
    where: { slug },
    select: { id: true, isPublished: true },
  });

  if (!user || !user.isPublished) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    const result = await refreshPublicProfile(user.id);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Public profile refresh failed:", error);
    return NextResponse.json(
      { error: "Profile refresh unavailable" },
      { status: 503 },
    );
  }
}
