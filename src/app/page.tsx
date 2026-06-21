import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to dashboard as it should be the usable first screen
  redirect("/dashboard");
}
