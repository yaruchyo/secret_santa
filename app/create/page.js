import { cookies } from "next/headers";
import CreateSelection from "@/components/CreateSelection";

export default async function CreateEventPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const isLoggedIn = !!token;

    return <CreateSelection isLoggedIn={isLoggedIn} />;
}
