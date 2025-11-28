import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const isLoggedIn = !!token;

  // Redirect logged-in users to dashboard
  if (isLoggedIn) {
    redirect("/dashboard");
  }

  return <HomeClient isLoggedIn={isLoggedIn} />;
}
