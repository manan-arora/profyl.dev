import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfylPageData } from "@/lib/services/profyl-page.service";
import { ProfylPage } from "@/components/profyl/ProfylPage";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

interface PublicProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      profile: true,
    },
  });

  if (!user) {
    return {
      title: "Profile Not Found",
    };
  }

  const displayName = user.profile?.name || user.githubUsername || slug;
  return {
    title: displayName,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { slug } = await params;

  // 1. Resolve user by slug
  const user = await prisma.user.findUnique({
    where: { slug },
  });

  if (!user) {
    notFound();
  }

  // 2. Check if published visibility rule is met
  if (false && !user?.isPublished) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Simple top navbar branding */}
        <header className="border-b hairline bg-[#0D0D0D] h-16 flex items-center shrink-0 z-10 relative">
          <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/profyl-logo.svg"
                alt="Profyl logo"
                width={28}
                height={28}
                className="size-7 object-contain"
              />
              <span className="font-display font-semibold tracking-tight text-lg">profyl</span>
            </Link>
          </div>
        </header>

        {/* Outer visual grid layout */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        {/* Message body */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
          <div className="border hairline bg-[#141414] p-10 max-w-md w-full text-center relative scan-line">
            <span className="absolute size-3 border-neon -top-px -left-px border-t border-l" />
            <span className="absolute size-3 border-neon -bottom-px -right-px border-b border-r" />

            <div className="font-mono text-neon text-[10px] uppercase tracking-[0.2em] mb-4">
              ◇ Visibility Alert
            </div>
            <h1 className="font-display font-semibold text-2xl mb-2 text-white">
              Profile Not Published
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              This Profyl is not published yet. This developer has not made their profile public.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] font-semibold px-5 py-3 text-sm hover:opacity-90 transition w-full justify-center"
            >
              Learn More about Profyl
            </Link>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t hairline bg-[#0D0D0D] py-6 z-10 relative">
          <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 flex justify-between items-center text-xs text-white/40">
            <span>© 2026 profyl.dev</span>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Render profile page in public mode
  const data = await getProfylPageData({ slug });

  if (!data) {
    notFound();
  }

  return <ProfylPage data={data} mode="public" />;
}
