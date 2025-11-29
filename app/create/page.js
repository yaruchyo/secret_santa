import { cookies } from "next/headers";
import CreateEventWizard from "@/components/CreateEventWizard";

export default async function CreateEventPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const isLoggedIn = !!token;

    return <CreateEventWizard isLoggedIn={isLoggedIn} />;
}
