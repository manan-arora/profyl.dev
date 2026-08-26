import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SignOutButton } from "@clerk/nextjs";
import { LayoutDashboard, User as UserIcon, FolderGit, Eye, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fallback initials
  const initials = user.name
    ? user.name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.githubUsername.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r hairline bg-[#111] flex flex-col justify-between shrink-0">
        <div className="flex flex-col">
          {/* Brand header */}
          <div className="h-16 flex items-center px-6 border-b hairline gap-2">
            <span className="font-display font-bold text-neon text-xl neon-text-glow">
              profyl
            </span>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-1">
              dashboard
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded text-sm text-white/70 hover:text-neon hover:bg-white/5 transition"
            >
              <UserIcon className="size-4" />
              <span>Profile</span>
            </Link>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-3 px-4 py-2.5 rounded text-sm text-white/70 hover:text-neon hover:bg-white/5 transition"
            >
              <FolderGit className="size-4" />
              <span>Projects</span>
            </Link>
            <Link
              href="/dashboard/preview"
              className="flex items-center gap-3 px-4 py-2.5 rounded text-sm text-white/70 hover:text-neon hover:bg-white/5 transition"
            >
              <Eye className="size-4" />
              <span>Preview Profile</span>
            </Link>
          </nav>
        </div>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t hairline bg-[#141414] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.githubUsername}
                className="size-10 rounded border border-neon object-cover bg-black select-none"
              />
            ) : (
              <div className="size-10 rounded border border-neon bg-black flex items-center justify-center font-display font-semibold text-neon select-none">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs font-semibold truncate text-white">
                {user.name || user.githubUsername}
              </div>
              <div className="font-mono text-[9px] text-white/40 truncate">
                @{user.githubUsername}
              </div>
            </div>
          </div>

          <SignOutButton>
            <button className="flex items-center justify-center gap-2 w-full py-2 border border-white/10 rounded text-xs text-white/70 hover:text-neon hover:border-neon transition cursor-pointer">
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
