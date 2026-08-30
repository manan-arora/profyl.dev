import { demoProfylData } from "@/lib/fixtures/demo-profile-data";
import { ProfylPage } from "@/components/profyl/ProfylPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alex Morgan - Demo Profyl",
  description: "Check out a live interactive demo of a developer profile on Profyl.",
};

export default function DemoProfilePage() {
  return <ProfylPage data={demoProfylData} mode="public" />;
}
