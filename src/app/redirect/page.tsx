import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";

export default async function RedirectPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    switch (user.profileStatus) {
        case "INCOMPLETE":
            redirect("/onboarding/projects");

        case "DRAFT":
        case "READY_TO_PUBLISH":
        case "PUBLISHED":
            redirect("/dashboard");
    }
}