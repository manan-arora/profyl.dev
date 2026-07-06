import Image from "next/image";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen pt-16">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-100 mask-[radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />

      <div className="flex justify-center items-center flex-col max-w-[400px] mx-auto mt-12 px-6">
        {/* Clerk Card */}
        <div className="relative mt-4">
          <div className="absolute -inset-px hairline pointer-events-none" />

          <SignUp
            signInUrl="/sign-in"
            appearance={{
              variables: {
                colorBackground: "#141414",
                colorForeground: "#f4f4f5",
                colorInputForeground: "#f4f4f5",
                colorBorder: "var(--neon)",
                colorPrimary: "#C7FF3D",
                borderRadius: "0.25rem",
                colorInput: "var(--neon)",
                
              },
              options: {
                logoImageUrl: "/profyl-logo.svg",
                logoPlacement: "inside",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
