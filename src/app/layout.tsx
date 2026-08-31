import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { shadcn } from "@clerk/ui/themes";
import NavbarWrapper from "@/components/NavbarWrapper";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://profyl.dev"),
  title: {
    default: "Profyl — See the signal behind the code",
    template: "%s | Profyl",
  },
  description:
    "Build a developer profile backed by real GitHub and LeetCode signals. Show what you've built, solved, and contributed.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Profyl — See the signal behind the code",
    description:
      "Build a developer profile backed by real GitHub and LeetCode signals. Show what you've built, solved, and contributed.",
    url: "https://profyl.dev",
    siteName: "Profyl",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profyl — See the signal behind the code",
    description:
      "Build a developer profile backed by real GitHub and LeetCode signals. Show what you've built, solved, and contributed.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {" "}
        <ClerkProvider
          appearance={{
            theme: shadcn,
          }}
        >
          <NavbarWrapper />
          {children}
          <Toaster />
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
