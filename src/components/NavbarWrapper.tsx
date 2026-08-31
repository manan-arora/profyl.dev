"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Show the marketing navbar only on the landing page (home route)
  const showMarketingNavbar = pathname === "/";

  if (!showMarketingNavbar) return null;

  return <Navbar />;
}