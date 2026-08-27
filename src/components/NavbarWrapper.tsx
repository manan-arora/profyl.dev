"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hideNavbar =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/dashboard");

  if (hideNavbar) return null;

  return <Navbar />;
}