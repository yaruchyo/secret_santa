import { cookies } from "next/headers";
import JoinClient from "@/components/JoinClient";

export default async function JoinEventPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const isLoggedIn = !!token;

    return <JoinClient isLoggedIn={isLoggedIn} />;
}
